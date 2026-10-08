'use client';

import React from 'react';

export default function SimulationLegend({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none rounded-xl border border-black/[0.06] bg-white/80 px-3.5 py-2.5 text-xs font-sans text-neutral-800 backdrop-blur-md shadow-subtle ${className}`}
      aria-label="Cartographic legend"
    >
      <div className="font-sans text-[12px] font-semibold text-neutral-900 border-b border-black/[0.05] pb-1.5 mb-2">
        <span>Cartographic index</span>
      </div>

      <div className="space-y-1.5 text-neutral-500 text-[11px] font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 border-b-2 border-solid border-neutral-900" />
          <span>High confidence route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 border-b-2 border-dashed border-neutral-500" />
          <span>Medium confidence route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 border-b-2 border-dotted border-neutral-300" />
          <span>Low confidence route</span>
        </div>
      </div>
    </div>
  );
}
