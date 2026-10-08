'use client';

import React from 'react';

interface IngredientIllustrationProps {
  src?: string | null;
  name: string;
  category: string;
  className?: string;
}

export default function IngredientIllustration({
  src,
  name,
  category,
  className = '',
}: IngredientIllustrationProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden border border-neutral-300 bg-neutral-50 ${className}`}
      aria-label={`Botanical illustration slot for ${name}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Botanical illustration of ${name}`}
          className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200"
        />
      ) : (
        /* Empty archival botanical plate placeholder with precision registration ticks */
        <div className="relative flex h-full w-full flex-col items-center justify-center p-3 text-center select-none">
          {/* Hairline corner registration marks */}
          <div className="pointer-events-none absolute top-1.5 left-1.5 h-1.5 w-1.5 border-t border-l border-neutral-400" />
          <div className="pointer-events-none absolute top-1.5 right-1.5 h-1.5 w-1.5 border-t border-r border-neutral-400" />
          <div className="pointer-events-none absolute bottom-1.5 left-1.5 h-1.5 w-1.5 border-b border-l border-neutral-400" />
          <div className="pointer-events-none absolute bottom-1.5 right-1.5 h-1.5 w-1.5 border-b border-r border-neutral-400" />

          {/* Minimal plate label */}
          <div className="flex flex-col items-center space-y-1">
            <span className="font-serif text-[11px] text-neutral-500">
              Tabula Botanica
            </span>
            <div className="h-[1px] w-6 bg-neutral-300" />
            <span className="font-serif text-xs text-neutral-600 font-medium">
              Plate reserved for botanical specimen
            </span>
            <span className="font-serif text-[10px] text-neutral-400">
              {name} · {category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
