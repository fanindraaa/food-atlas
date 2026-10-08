'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  formatYear,
  sliderProgressToYear,
  yearToSliderProgress,
  MIN_YEAR,
  MAX_YEAR,
} from '@/utils/timeline';
import { getSimulationAnchorYears } from '@/utils/simulationEngine';
import { FoodIngredient } from '@/types/simulation';
import { sound } from '@/utils/sound';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimelineSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  ingredients: FoodIngredient[];
  visibleCount: number;
  totalCount: number;
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
}: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playDirection, setPlayDirection] = useState<'forward' | 'backward'>('forward');
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const currentYearRef = useRef(currentYear);
  currentYearRef.current = currentYear;

  const lastMilestoneYearRef = useRef<number | null>(null);
  const progressPercent = yearToSliderProgress(currentYear);

  // Simulation Playback Loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(120 / speed);

      playTimerRef.current = setInterval(() => {
        const prev = currentYearRef.current;

        if (playDirection === 'forward') {
          let step = 1;
          if (prev < 0) step = 40;
          else if (prev < 1500) step = 20;
          else if (prev < 1800) step = 5;
          else step = 5;

          const nextYear = prev + step;

          // Check for milestone pause
          if (speed <= 1 && lastMilestoneYearRef.current !== nextYear) {
            const milestone = ingredients.find(ing => {
              const anchors = getSimulationAnchorYears(ing);
              return (
                (Math.abs(nextYear - anchors.arrivalYear) <= 2 &&
                  Math.abs(prev - anchors.arrivalYear) > 2) ||
                (Math.abs(nextYear - anchors.widespreadYear) <= 2 &&
                  Math.abs(prev - anchors.widespreadYear) > 2)
              );
            });

            if (milestone) {
              lastMilestoneYearRef.current = nextYear;
              sound.playSliderTick();

              if (playTimerRef.current) clearInterval(playTimerRef.current);
              pauseTimeoutRef.current = setTimeout(() => {
                onYearChange(nextYear + 1);
              }, 1200);

              return;
            }
          }

          if (nextYear >= MAX_YEAR) {
            setIsPlaying(false);
            onYearChange(MAX_YEAR);
          } else {
            onYearChange(nextYear);
            sound.playSliderTick();
          }
        } else {
          // Backward rewind
          let step = 1;
          if (prev > 1800) step = 5;
          else if (prev > 1500) step = 5;
          else if (prev > 0) step = 20;
          else step = 40;

          const nextYear = prev - step;
          if (nextYear <= MIN_YEAR) {
            setIsPlaying(false);
            onYearChange(MIN_YEAR);
          } else {
            onYearChange(nextYear);
            sound.playSliderTick();
          }
        }
      }, intervalMs);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [isPlaying, playDirection, speed, ingredients, onYearChange]);

  const togglePlay = () => {
    sound.playClick();
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentYear >= MAX_YEAR && playDirection === 'forward') {
        onYearChange(1450);
      }
      setIsPlaying(true);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newYear = sliderProgressToYear(val);
    sound.playSliderTick();
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
        onYearChange(MIN_YEAR);
        e.preventDefault();
        return;
      } else if (e.key === 'End') {
        sound.playClick();
        onYearChange(MAX_YEAR);
        e.preventDefault();
        return;
      }

      if (delta !== 0) {
        e.preventDefault();
        sound.playSliderTick();
        onYearChange(Math.max(MIN_YEAR, Math.min(MAX_YEAR, currentYear + delta)));
      }
    },
    [currentYear, onYearChange]
  );

  return (
    <footer
      className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-20 pointer-events-none select-none flex justify-center px-3 sm:px-6"
      role="region"
      aria-label="Historical timeline navigation instrument"
    >
      <div className="w-full max-w-4xl p-4 sm:p-5 rounded-[22px] bg-white/85 backdrop-blur-2xl border border-black/[0.06] shadow-elevated pointer-events-auto">
        {/* Upper Row: Strong Current Year Typography & Consolidated Controls Group */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          {/* Current Year display (Measuring instrument text removed as requested) */}
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-sans text-[13px] font-semibold text-white bg-accent hover:bg-accent-hover active:scale-[0.98] shadow-accent transition-all"
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
          {/* Track Bar with Subtle Accent Fill and Slender Pill Indicator */}
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

            {/* Active Position Indicator: Sleek Non-Circular Pill Marker with Year Tooltip */}
            <div
              className="pointer-events-none absolute -ml-2.5 z-10 flex flex-col items-center transition-all duration-75"
              style={{ left: `${progressPercent}%` }}
            >
              {/* Slender rectangular pill indicator (Not a circular thumb!) */}
              <div className="w-5 h-5 rounded-[6px] bg-accent border-2 border-white shadow-[0_2px_10px_rgba(0,102,255,0.4)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-[1px] bg-white" />
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
