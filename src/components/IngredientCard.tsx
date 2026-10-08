'use client';

import React from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState, isNativeIngredient } from '@/utils/simulationEngine';
import IngredientIllustration from './IngredientIllustration';
import { formatYear } from '@/utils/timeline';
import { sound } from '@/utils/sound';
import { X, Navigation } from 'lucide-react';

interface IngredientCardProps {
  ingredient: FoodIngredient | null;
  currentYear: number;
  onClose: () => void;
  onFocusLocation?: (coords: [number, number]) => void;
}

export default function IngredientCard({
  ingredient,
  currentYear,
  onClose,
  onFocusLocation,
}: IngredientCardProps) {
  if (!ingredient) return null;

  const state = getIngredientState(ingredient, currentYear);
  const isNative = isNativeIngredient(ingredient);

  return (
    <aside
      className="fixed z-30 select-none
        bottom-0 left-0 right-0 max-h-[78vh] rounded-t-[28px] sm:rounded-[24px]
        sm:bottom-auto sm:left-auto sm:top-20 sm:right-6 sm:w-[380px] sm:max-h-[calc(100vh-170px)]
        overflow-y-auto p-5 sm:p-6
        bg-white/85 backdrop-blur-2xl border border-black/[0.06] shadow-elevated
        transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4"
      role="dialog"
      aria-labelledby="ingredient-name"
    >
      {/* Editorial Header Block */}
      <div className="flex items-start justify-between gap-4 pb-2">
        <div>
          <span className="font-sans text-[12px] font-medium text-neutral-500">
            {ingredient.category} · {isNative ? 'Indigenous foundation' : 'Introduced from afar'}
          </span>
          <h2
            id="ingredient-name"
            className="font-sans text-[24px] sm:text-[28px] font-semibold text-neutral-900 leading-tight tracking-tight mt-0.5"
          >
            {ingredient.name}
          </h2>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          onMouseEnter={() => sound.playHover()}
          className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.05] active:scale-[0.95] transition-all"
          aria-label="Close ingredient details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Large Square Container for Transparent Food Illustration */}
      <div className="w-full aspect-square max-w-[220px] sm:max-w-[240px] mx-auto my-3 flex items-center justify-center">
        <IngredientIllustration
          src={ingredient.illustration}
          name={ingredient.name}
          category={ingredient.category}
          className="w-full h-full"
        />
      </div>

      {/* Simplified Editorial Chronology & Facts (No nested cards, pure typography & whitespace) */}
      <div className="space-y-4 pt-1">
        {/* Where it came from (Origin) */}
        <div className="pb-3 border-b border-black/[0.05]">
          <span className="font-sans text-[12px] font-medium text-neutral-500">
            Where it came from
          </span>
          <p className="font-sans text-[15px] font-semibold text-neutral-900 mt-0.5 leading-snug">
            {ingredient.origin}
          </p>
        </div>

        {/* When it came (Entry into India) */}
        <div className="pb-3 border-b border-black/[0.05]">
          <span className="font-sans text-[12px] font-medium text-neutral-500">
            When it came
          </span>
          <p className="font-sans text-[15px] font-semibold text-neutral-900 mt-0.5 leading-snug">
            {isNative
              ? 'Indigenous to subcontinent (ancient antiquity)'
              : `${formatYear(state.arrivalYear)}${state.entryPort ? ` · ${state.entryPort}` : ''}`}
          </p>
        </div>

        {/* When widespread adoption happened */}
        <div className="pb-3 border-b border-black/[0.05]">
          <span className="font-sans text-[12px] font-medium text-neutral-500">
            When widespread adoption happened
          </span>
          <p className="font-sans text-[15px] font-semibold text-neutral-900 mt-0.5 leading-snug">
            {ingredient.widespreadAdoption.period}
          </p>
          {ingredient.widespreadAdoption.simulationYearNote && (
            <p className="font-sans text-[12px] text-neutral-500 mt-0.5 leading-normal">
              {ingredient.widespreadAdoption.simulationYearNote}
            </p>
          )}
        </div>

        {/* Historical Facts */}
        <div>
          <span className="font-sans text-[12px] font-medium text-neutral-500">
            Historical facts
          </span>
          <p className="font-sans text-[13px] text-neutral-700 mt-1 leading-relaxed">
            {ingredient.widespreadAdoption.details}
          </p>
        </div>
      </div>

      {/* Center on Entry Point or Focus Location */}
      {onFocusLocation && !isNative && (
        <div className="mt-5 pt-3 border-t border-black/[0.05] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onFocusLocation(state.entryCoords);
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-[12px] font-medium text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.04] active:scale-[0.98] transition-all"
          >
            <Navigation className="h-3.5 w-3.5 text-accent" />
            <span>Center on entry point</span>
          </button>
        </div>
      )}
    </aside>
  );
}
