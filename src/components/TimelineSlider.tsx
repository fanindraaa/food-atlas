'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  formatYear,
  sliderProgressToYear,
  yearToSliderProgress,
  TIMELINE_MILESTONES,
  MIN_YEAR,
  MAX_YEAR,
} from '@/utils/timeline';
import { getHistoricalNarrative, getSimulationAnchorYears } from '@/utils/simulationEngine';
import { FoodIngredient, TimelineMilestone } from '@/types/simulation';
import { sound } from '@/utils/sound';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimelineSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  ingredients: FoodIngredient[];
  visibleCount: number;
  totalCount: number;
}

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

          // Check for milestone brief pause
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
      className="fixed bottom-0 left-0 right-0 z-20 select-none pointer-events-none pt-12 pb-5 px-4 sm:px-8"
      style={{
        background:
          'linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 45%, rgba(255, 255, 255, 0) 100%)',
      }}
      role="region"
      aria-label="Timeline measuring instrument"
    >
      <div className="mx-auto max-w-5xl pointer-events-auto">
        {/* Upper Row: Strong Current Year Typography & Mechanical Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          {/* Section 34: Current Year as Strong Typographic Element */}
          <div className="flex items-baseline gap-3">
            <span
              className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900 leading-none"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatYear(currentYear)}
            </span>
            <span className="font-serif text-xs text-neutral-500">
              Measuring instrument
            </span>
          </div>

          {/* Mechanical Instrumental Controls */}
          <div className="flex items-center gap-2">
            {/* Direction Selection */}
            <div className="flex items-center rounded border border-neutral-300 bg-white p-0.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setPlayDirection('backward');
                }}
                onMouseEnter={() => sound.playHover()}
                className={`px-2 py-0.5 font-serif text-xs rounded transition-colors ${
                  playDirection === 'backward'
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
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
                className={`px-2 py-0.5 font-serif text-xs rounded transition-colors ${
                  playDirection === 'forward'
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Advance simulation forward"
              >
                Forward
              </button>
            </div>

            {/* Play / Pause Mechanical Button */}
            <button
              onClick={togglePlay}
              onMouseEnter={() => sound.playHover()}
              className="btn-mechanical"
              aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  <span>Simulate</span>
                </>
              )}
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center rounded border border-neutral-300 bg-white p-0.5">
              {([0.5, 1, 2] as const).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    sound.playClick();
                    setSpeed(s);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`px-1.5 py-0.5 font-serif text-xs rounded transition-colors ${
                    speed === s
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
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
              className="btn-mechanical btn-mechanical-icon"
              title="Reset to Present (2026)"
              aria-label="Reset to 2026"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-900" />
            </button>
          </div>
        </div>

        {/* Lower Row: Physical Instrument Ruler & Custom Rectangular Handle */}
        <div className="relative pt-2 pb-1">
          {/* Thin Horizontal Rule (Measuring Bar) */}
          <div className="relative h-6 w-full flex items-center">
            {/* Base hairline rule */}
            <div className="absolute h-[1px] w-full bg-neutral-400" />

            {/* Elapsed progress rule */}
            <div
              className="absolute h-[2px] bg-neutral-900"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Hidden native slider for accessible dragging and touch */}
            <input
              ref={sliderRef}
              type="range"
              min="0"
              max="100"
              step="0.05"
              value={progressPercent}
              onChange={handleSliderChange}
              onKeyDown={handleKeyDown}
              className="mechanical-slider-input absolute w-full h-8 opacity-0 cursor-ew-resize z-20"
              aria-label={`Historical timeline controller. Current year ${formatYear(currentYear)}`}
              aria-valuemin={MIN_YEAR}
              aria-valuemax={MAX_YEAR}
              aria-valuenow={currentYear}
              aria-valuetext={formatYear(currentYear)}
            />

            {/* Section 16: Custom Rectangular Mechanical Handle */}
            <div
              className="pointer-events-none absolute -ml-4 z-10 flex flex-col items-center transition-transform"
              style={{ left: `${progressPercent}%` }}
            >
              {/* Mechanical rectangular slider handle tab with year display */}
              <div className="h-7 px-1.5 bg-white border border-neutral-900 rounded-[3px] shadow-[0_2px_0_#111111] flex items-center justify-center">
                <span className="font-serif text-[11px] font-semibold text-neutral-900 whitespace-nowrap leading-none">
                  {formatYear(currentYear)}
                </span>
              </div>
              {/* Center vertical pointer notch */}
              <div className="h-1.5 w-[1px] bg-neutral-900" />
            </div>
          </div>

          {/* Engraved Tick Marks and Milestone Labels */}
          <div className="relative mt-2 hidden sm:flex justify-between items-center font-serif text-[11px] text-neutral-500">
            {TIMELINE_MILESTONES.map(item => {
              const pos = yearToSliderProgress(item.year);
              const isSelected = Math.abs(currentYear - item.year) < 30;

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
                    isSelected ? 'text-neutral-900 font-semibold' : ''
                  }`}
                  style={{ left: `${pos}%` }}
                >
                  {/* Engraved tick mark */}
                  <span className={`w-[1px] mb-1 ${isSelected ? 'h-2 bg-neutral-900' : 'h-1.5 bg-neutral-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Milestones (Natural sentence case, Timeless font) */}
          <div className="mt-1.5 flex sm:hidden justify-between font-serif text-[10px] text-neutral-600 px-1">
            <span onClick={() => onYearChange(-3000)}>3000 BCE</span>
            <span onClick={() => onYearChange(0)}>0</span>
            <span onClick={() => onYearChange(1500)}>1500</span>
            <span onClick={() => onYearChange(1800)}>1800</span>
            <span onClick={() => onYearChange(2026)}>2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
