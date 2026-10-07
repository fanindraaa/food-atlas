'use client';

import React from 'react';

export default function SimulationLegend({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none border border-neutral-300 bg-white/90 px-3 py-2 text-xs font-serif text-neutral-800 backdrop-blur-sm ${className}`}
      aria-label="Cartographic legend"
    >
      <div className="font-serif text-xs font-semibold text-neutral-900 border-b border-neutral-300 pb-1 mb-1.5 flex justify-between items-center">
        <span>Cartographic index</span>
      </div>

      <div className="space-y-1 text-neutral-600 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 border-b-2 border-solid border-neutral-900" />
          <span>High confidence route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 border-b-2 border-dashed border-neutral-600" />
          <span>Medium confidence route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 border-b-2 border-dotted border-neutral-400" />
          <span>Low confidence route</span>
        </div>
      </div>
    </div>
  );
}
