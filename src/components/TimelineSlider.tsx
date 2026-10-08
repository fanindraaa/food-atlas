'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  formatYear,
  sliderProgressToYear,
  yearToSliderProgress,
  MIN_YEAR,
  MAX_YEAR,
} from '@/utils/timeline';
import { FoodIngredient } from '@/types/simulation';
import { sound } from '@/utils/sound';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimelineSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  ingredients: FoodIngredient[];
  visibleCount: number;
  totalCount: number;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}

// Sparse milestone markers for an uncluttered, elegant timeline
const SPARSE_MILESTONES = [
  { year: -3000, label: '3000 BCE' },
  { year: -1000, label: '1000 BCE' },
  { year: 0, label: '0' },
  { year: 1000, label: '1000 CE' },
  { year: 1500, label: '1500' },
  { year: 1800, label: '1800' },
  { year: 2026, label: '2026' },
];

export default function TimelineSlider({
  currentYear,
  onYearChange,
  ingredients,
  visibleCount,
  totalCount,
  isPlaying: controlledIsPlaying,
  onPlayingChange,
}: TimelineSliderProps) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const isPlaying = controlledIsPlaying !== undefined ? controlledIsPlaying : internalIsPlaying;

  const setPlaying = useCallback(
    (next: boolean) => {
      if (onPlayingChange) {
        onPlayingChange(next);
      } else {
        setInternalIsPlaying(next);
      }
    },
    [onPlayingChange]
  );

  const [playDirection, setPlayDirection] = useState<'forward' | 'backward'>('forward');
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

  const sliderRef = useRef<HTMLInputElement>(null);

  // High-reliability simulation refs to prevent stale closures or premature cancellations
  const currentYearRef = useRef(currentYear);
  currentYearRef.current = currentYear;

  const accumulatedYearRef = useRef<number>(currentYear);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const directionRef = useRef(playDirection);
  directionRef.current = playDirection;

  const onYearChangeRef = useRef(onYearChange);
  onYearChangeRef.current = onYearChange;

  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const progressPercent = yearToSliderProgress(currentYear);

  // Reliable simulation animation loop using requestAnimationFrame (Req 12 & 13)
  const simulationLoop = useCallback((timestamp: number) => {
    if (!isPlayingRef.current) {
      rafIdRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
      rafIdRef.current = requestAnimationFrame(simulationLoop);
      return;
    }

    const dt = Math.min(100, Math.max(0, timestamp - lastTimeRef.current));
    lastTimeRef.current = timestamp;

    if (dt > 0) {
      const current = accumulatedYearRef.current;
      const dir = directionRef.current === 'forward' ? 1 : -1;
      const spd = speedRef.current;

      // Adaptive rate curve (years per second at 1x)
      // Dense modern eras advance slower so arrival events can be experienced
      let baseRate = 16;
      if (current < 0) baseRate = 80;
      else if (current < 1500) baseRate = 35;
      else if (current < 1850) baseRate = 18;
      else baseRate = 14;

      const deltaYear = (baseRate * (dt / 1000)) * spd * dir;
      const nextAcc = current + deltaYear;

      if (directionRef.current === 'forward' && nextAcc >= MAX_YEAR) {
        accumulatedYearRef.current = MAX_YEAR;
        onYearChangeRef.current(MAX_YEAR);
        setPlaying(false);
        rafIdRef.current = null;
        return;
      } else if (directionRef.current === 'backward' && nextAcc <= MIN_YEAR) {
        accumulatedYearRef.current = MIN_YEAR;
        onYearChangeRef.current(MIN_YEAR);
        setPlaying(false);
        rafIdRef.current = null;
        return;
      } else {
        accumulatedYearRef.current = nextAcc;
        const rounded = Math.round(nextAcc);
        if (rounded !== currentYearRef.current) {
          onYearChangeRef.current(rounded);
        }
      }
    }

    rafIdRef.current = requestAnimationFrame(simulationLoop);
  }, [setPlaying]);

  // Lifecycle management: start / stop loop cleanly without resetting on unrelated re-renders
  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (isPlaying) {
      accumulatedYearRef.current = currentYearRef.current;
      lastTimeRef.current = null;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(simulationLoop);
      }
    } else {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, simulationLoop]);

  const togglePlay = () => {
    sound.playClick();
    if (isPlaying) {
      setPlaying(false);
    } else {
      if (currentYear >= MAX_YEAR && playDirection === 'forward') {
        onYearChange(1450);
        accumulatedYearRef.current = 1450;
      }
      setPlaying(true);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newYear = sliderProgressToYear(val);
    sound.playSliderTick();
    setPlaying(false);
    accumulatedYearRef.current = newYear;
    onYearChange(newYear);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let delta = 0;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        delta = e.shiftKey ? -50 : -5;
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        delta = e.shiftKey ? 50 : 5;
      } else if (e.key === 'Home') {
        sound.playClick();
        setPlaying(false);
        accumulatedYearRef.current = MIN_YEAR;
        onYearChange(MIN_YEAR);
        e.preventDefault();
        return;
      } else if (e.key === 'End') {
        sound.playClick();
        setPlaying(false);
        accumulatedYearRef.current = MAX_YEAR;
        onYearChange(MAX_YEAR);
        e.preventDefault();
        return;
      }

      if (delta !== 0) {
        e.preventDefault();
        sound.playSliderTick();
        setPlaying(false);
        const target = Math.max(MIN_YEAR, Math.min(MAX_YEAR, currentYear + delta));
        accumulatedYearRef.current = target;
        onYearChange(target);
      }
    },
    [currentYear, onYearChange, setPlaying]
  );

  return (
    <footer
      className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-20 pointer-events-none select-none flex justify-center px-3 sm:px-6"
      role="region"
      aria-label="Historical timeline navigation instrument"
    >
      <div className="w-full max-w-4xl p-4 sm:p-5 rounded-[22px] bg-white/85 backdrop-blur-2xl border border-black/[0.06] shadow-elevated pointer-events-auto">
        {/* Upper Row: Current Year Typography & Consolidated Controls Group */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          {/* Current Year display */}
          <div className="flex items-baseline gap-2">
            <span
              className="font-sans text-[26px] sm:text-[32px] font-semibold text-neutral-900 leading-none tracking-tight"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatYear(currentYear)}
            </span>
          </div>

          {/* Consolidated Floating Control Group */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Direction Segmented Control */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04] border border-black/[0.04]">
              <button
                onClick={() => {
                  sound.playClick();
                  setPlayDirection('backward');
                  directionRef.current = 'backward';
                }}
                onMouseEnter={() => sound.playHover()}
                className={`px-2.5 py-1 font-sans text-[12px] rounded-lg transition-all ${
                  playDirection === 'backward'
                    ? 'bg-white text-neutral-900 font-semibold shadow-subtle'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Rewind backwards through history"
              >
                Rewind
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setPlayDirection('forward');
                  directionRef.current = 'forward';
                }}
                onMouseEnter={() => sound.playHover()}
                className={`px-2.5 py-1 font-sans text-[12px] rounded-lg transition-all ${
                  playDirection === 'forward'
                    ? 'bg-white text-neutral-900 font-semibold shadow-subtle'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Advance simulation forward"
              >
                Forward
              </button>
            </div>

            {/* Simulate / Pause Primary Action (Electric Blue Accent) */}
            <button
              onClick={togglePlay}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-sans text-[13px] font-semibold text-white bg-accent hover:bg-accent-hover active:scale-[0.98] transition-all"
              aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Simulate</span>
                </>
              )}
            </button>

            {/* Speed Multipliers Segmented Control */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04] border border-black/[0.04]">
              {([0.5, 1, 2] as const).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    sound.playClick();
                    setSpeed(s);
                    speedRef.current = s;
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`px-2 py-1 font-sans text-[12px] rounded-lg transition-all ${
                    speed === s
                      ? 'bg-white text-neutral-900 font-semibold shadow-subtle'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title={`${s}× playback speed`}
                >
                  {s}×
                </button>
              ))}
            </div>

            {/* Reset to 2026 */}
            <button
              onClick={() => {
                sound.playClick();
                setPlaying(false);
                accumulatedYearRef.current = 2026;
                onYearChange(2026);
              }}
              onMouseEnter={() => sound.playHover()}
              className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04] active:scale-[0.98] transition-all"
              title="Reset to Present (2026)"
              aria-label="Reset to 2026"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lower Row: Floating Horizontal Navigation Track */}
        <div className="relative pt-1 pb-1">
          {/* Track Bar with Accent Fill and Slider Indicator */}
          <div className="relative h-6 w-full flex items-center">
            {/* Background hairline track */}
            <div className="absolute h-[3px] w-full bg-black/[0.08] rounded-full overflow-hidden">
              {/* Elapsed progress fill in electric blue */}
              <div
                className="h-full bg-accent rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Hidden native slider for touch and keyboard accessibility */}
            <input
              ref={sliderRef}
              type="range"
              min="0"
              max="100"
              step="0.05"
              value={progressPercent}
              onChange={handleSliderChange}
              onKeyDown={handleKeyDown}
              className="absolute w-full h-8 opacity-0 cursor-pointer z-20"
              aria-label={`Historical timeline controller. Current year ${formatYear(currentYear)}`}
              aria-valuemin={MIN_YEAR}
              aria-valuemax={MAX_YEAR}
              aria-valuenow={currentYear}
              aria-valuetext={formatYear(currentYear)}
            />

            {/* Active Position Indicator */}
            <div
              className="pointer-events-none absolute -ml-2.5 z-10 flex flex-col items-center transition-all duration-75"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="w-5 h-5 rounded-[4px] bg-accent border border-white shadow-[0_6px_24px_rgba(0,0,0,0.4)] flex items-center justify-center">
              </div>
            </div>
          </div>

          {/* Sparse Year Milestones and Subtle Tick Marks */}
          <div className="relative mt-2 flex justify-between items-center font-sans text-[11px] text-neutral-400">
            {SPARSE_MILESTONES.map(item => {
              const pos = yearToSliderProgress(item.year);
              const isSelected = Math.abs(currentYear - item.year) < 40;

              return (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setPlaying(false);
                    accumulatedYearRef.current = item.year;
                    onYearChange(item.year);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`absolute transform -translate-x-1/2 flex flex-col items-center hover:text-neutral-900 transition-colors cursor-pointer ${
                    isSelected ? 'text-accent font-semibold' : ''
                  }`}
                  style={{ left: `${pos}%` }}
                >
                  <span
                    className={`w-[1px] mb-1 transition-all ${
                      isSelected ? 'h-2 bg-accent' : 'h-1.5 bg-black/[0.15]'
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
