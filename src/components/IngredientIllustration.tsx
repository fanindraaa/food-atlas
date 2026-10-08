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
      className={`relative flex items-center justify-center overflow-visible ${className}`}
      aria-label={`Botanical illustration for ${name}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Botanical illustration of ${name}`}
          className="h-full w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:scale-[1.03]"
        />
      ) : (
        /* Understated editorial botanical placeholder (no heavy boxes) */
        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center select-none text-neutral-600">
          <span className="font-sans text-[11px] font-medium tracking-wide text-neutral-600">
            Botanical Specimen
          </span>
          <span className="font-sans text-[13px] font-semibold text-neutral-700 mt-1">
            {name}
          </span>
          <span className="font-sans text-[11px] text-neutral-600 mt-0.5">
            {category}
          </span>
        </div>
      )}
    </div>
  );
}
