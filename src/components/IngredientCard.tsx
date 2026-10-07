'use client';

import React from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState } from '@/utils/simulationEngine';
import IngredientIllustration from './IngredientIllustration';
import { formatCoordinates } from '@/utils/geo';
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
  const originCoordsStr = formatCoordinates(state.originCoords[1], state.originCoords[0]);

  return (
    <aside
      className="editorial-overlay fixed top-20 right-4 sm:right-6 z-30 w-[92vw] sm:w-[380px] max-h-[calc(100vh-170px)] overflow-y-auto p-6 select-none"
      role="dialog"
      aria-labelledby="ingredient-title"
    >
      {/* Editorial Header Block */}
      <div className="flex items-start justify-between pb-4 border-b border-neutral-300">
        <div>
          <span className="font-serif text-xs text-neutral-500">
            {ingredient.category} — {state.isNative ? 'Native to subcontinent' : 'Introduced from afar'}
          </span>
          <h2
            id="ingredient-title"
            className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-neutral-900 leading-tight"
          >
            {ingredient.name}
          </h2>
          <span className="mt-1 block font-serif text-xs text-neutral-600">
            Confidence: {ingredient.confidence} record
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          onMouseEnter={() => sound.playHover()}
          className="btn-mechanical btn-mechanical-icon"
          aria-label="Close ingredient panel"
        >
          <X className="h-4 w-4 text-neutral-900" />
        </button>
      </div>

      {/* Reserved Botanical Specimen Plate */}
      <div className="mt-4 h-28 w-full border border-neutral-300 bg-neutral-50 p-2">
        <IngredientIllustration
          src={ingredient.illustration}
          name={ingredient.name}
          category={ingredient.category}
          className="h-full w-full"
        />
      </div>

      {/* Historical Chronology & Geographical Provenance (Whitespace and Hairline Rules) */}
      <div className="mt-5 space-y-4">
        {/* Origin */}
        <div className="pb-3 border-b border-neutral-200">
          <div className="font-serif text-xs text-neutral-500">Origin</div>
          <div className="mt-0.5 font-serif text-base text-neutral-900 font-semibold">
            {ingredient.origin}
          </div>
          <div className="font-serif text-[11px] text-neutral-500 mt-0.5">
            Coordinates: {originCoordsStr}
          </div>
        </div>

        {/* Arrival in India */}
        {!state.isNative && (
          <div className="pb-3 border-b border-neutral-200">
            <div className="font-serif text-xs text-neutral-500">Entry into India</div>
            <div className="mt-0.5 font-serif text-sm text-neutral-900 font-medium">
              {state.entryPort}
            </div>
            <div className="font-serif text-[11px] text-neutral-600 mt-0.5">
              Approximate arrival: {formatYear(state.arrivalYear)}
            </div>
          </div>
        )}

        {/* Widespread Adoption */}
        <div className="pb-3 border-b border-neutral-200">
          <div className="font-serif text-xs text-neutral-500">Widespread adoption</div>
          <div className="mt-0.5 font-serif text-sm text-neutral-900 font-semibold">
            {ingredient.widespreadAdoption.period}
          </div>
          {ingredient.widespreadAdoption.simulationYearNote && (
            <div className="font-serif text-[11px] text-neutral-600 mt-0.5">
              {ingredient.widespreadAdoption.simulationYearNote}
            </div>
          )}
        </div>

        {/* Current Simulation Year Status */}
        <div className="pb-3 border-b border-neutral-200">
          <div className="font-serif text-xs text-neutral-500">
            Status at {formatYear(currentYear)}
          </div>
          <div className="mt-0.5 font-serif text-sm text-neutral-900 font-medium">
            {state.statusTitle}
          </div>
          <p className="mt-1 font-serif text-xs text-neutral-700 leading-relaxed">
            {state.statusDescription}
          </p>
        </div>

        {/* Active Regional Footprints in India */}
        {state.activeRegions.length > 0 && (
          <div className="pb-3 border-b border-neutral-200">
            <div className="font-serif text-xs text-neutral-500 mb-1.5">
              Active regions ({state.activeRegions.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {state.activeRegions.map(reg => (
                <span
                  key={reg.name}
                  className="px-2 py-0.5 border border-neutral-300 bg-white font-serif text-xs text-neutral-800"
                >
                  {reg.name.split('(')[0].trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Historical Narrative */}
        <div className="pt-1">
          <div className="font-serif text-xs text-neutral-500 mb-1">Historical context</div>
          <p className="font-serif text-xs text-neutral-800 leading-relaxed">
            {ingredient.widespreadAdoption.details}
          </p>
        </div>
      </div>

      {/* Focus on Foothold / Region Trigger */}
      {onFocusLocation && (
        <div className="mt-6 pt-3 border-t border-neutral-300 flex justify-between items-center">
          <span className="font-serif text-xs text-neutral-500">Map focus</span>
          <button
            onClick={() => {
              sound.playClick();
              onFocusLocation(state.entryCoords);
            }}
            onMouseEnter={() => sound.playHover()}
            className="btn-mechanical btn-mechanical-sm"
          >
            <Navigation className="h-3 w-3 mr-1 text-neutral-900" />
            <span>Center on entry point</span>
          </button>
        </div>
      )}
    </aside>
  );
}
