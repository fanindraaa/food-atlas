'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TimelineMilestone } from '@/types/simulation';

interface HistoricalStatusProps {
  currentYear: number;
  headline: string;
  subheadline: string;
  milestoneCallout: TimelineMilestone | null;
  activeCount: number;
  totalCount: number;
}

export default function HistoricalStatus({
  currentYear,
  headline,
  subheadline,
  milestoneCallout,
  activeCount,
  totalCount,
}: HistoricalStatusProps) {
  // Track displayed text to smoothly animate transitions
  const [displayText, setDisplayText] = useState({
    title: milestoneCallout?.headline || headline,
    detail: milestoneCallout?.detail || subheadline,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevTextRef = useRef('');

  const nextTitle = milestoneCallout?.headline || headline;
  const nextDetail = milestoneCallout?.detail || subheadline;
  const textKey = `${nextTitle}-${nextDetail}`;

  useEffect(() => {
    if (textKey !== prevTextRef.current) {
      prevTextRef.current = textKey;
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayText({
          title: nextTitle,
          detail: nextDetail,
        });
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [textKey, nextTitle, nextDetail]);

  return (
    <div
      className="fixed bottom-40 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none select-none"
      aria-live="polite"
    >
      <div className="status-pill pointer-events-auto max-w-2xl px-5 py-2.5 flex items-center justify-between gap-4 transition-all duration-300">
        <div
          className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 transition-all duration-200 ${
            isTransitioning ? 'opacity-0 -translate-y-1 blur-[1px]' : 'opacity-100 translate-y-0 blur-0'
          }`}
        >
          <span className="font-serif text-sm font-semibold text-neutral-900 leading-tight">
            {displayText.title}
          </span>
          <span className="hidden sm:inline-block text-neutral-400 font-serif text-xs">/</span>
          <span className="font-serif text-xs text-neutral-600 leading-tight">
            {displayText.detail}
          </span>
        </div>

        {/* Active presence count indicator (hairline rule separator, no circular dots) */}
        <div className="shrink-0 flex items-center gap-2 pl-3 border-l border-neutral-300">
          <span className="font-serif text-xs text-neutral-500 whitespace-nowrap">
            {activeCount} of {totalCount} present
          </span>
        </div>
      </div>
    </div>
  );
}
