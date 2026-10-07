'use client';

import React from 'react';

export default function CompassRose({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex flex-col items-center select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 100 100"
        className="text-neutral-900"
        fill="none"
        stroke="currentColor"
      >
        {/* Diamond frame outer & inner */}
        <polygon points="50,6 94,50 50,94 6,50" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
        <polygon points="50,14 86,50 50,86 14,50" strokeWidth="0.8" opacity="0.6" />

        {/* Cardinal Needle (North) */}
        <polygon points="50,14 54,46 50,44" fill="currentColor" opacity="0.9" />
        <polygon points="50,14 46,46 50,44" fill="none" strokeWidth="1" opacity="0.6" />

        {/* South Needle */}
        <polygon points="50,86 54,54 50,56" fill="none" strokeWidth="1" opacity="0.6" />
        <polygon points="50,86 46,54 50,56" fill="currentColor" opacity="0.3" />

        {/* East Needle */}
        <polygon points="86,50 54,54 56,50" fill="currentColor" opacity="0.3" />
        <polygon points="86,50 54,46 56,50" fill="none" strokeWidth="1" opacity="0.6" />

        {/* West Needle */}
        <polygon points="14,50 46,54 44,50" fill="none" strokeWidth="1" opacity="0.6" />
        <polygon points="14,50 46,46 44,50" fill="currentColor" opacity="0.3" />

        {/* Center mechanical square pivot (no circular dot) */}
        <rect x="47.5" y="47.5" width="5" height="5" fill="currentColor" />

        {/* North 'N' letter in classic engraved style */}
        <text
          x="50"
          y="10"
          textAnchor="middle"
          fontSize="9"
          fontFamily="'Timeless Sans', sans-serif"
          fontWeight="600"
          fill="currentColor"
          stroke="none"
        >
          N
        </text>
      </svg>
    </div>
  );
}
