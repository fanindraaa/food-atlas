'use client';

import React, { useState, useMemo } from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState, getSimulationAnchorYears } from '@/utils/simulationEngine';
import { sound } from '@/utils/sound';
import { formatYear, MIN_YEAR, MAX_YEAR } from '@/utils/timeline';
import { X, Search } from 'lucide-react';

interface IngredientCatalogueProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: FoodIngredient[];
  currentYear: number;
  onSelectIngredient: (ingredient: FoodIngredient, targetYear?: number) => void;
  selectedIngredientId?: string;
}

export default function IngredientCatalogue({
  isOpen,
  onClose,
  ingredients,
  currentYear,
  onSelectIngredient,
  selectedIngredientId,
}: IngredientCatalogueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set(ingredients.map(i => i.category));
    return ['All', ...Array.from(set).sort()];
  }, [ingredients]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ingredients.filter(ing => {
      const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
      const matchesSearch =
        !q ||
        ing.name.toLowerCase().includes(q) ||
        ing.origin.toLowerCase().includes(q) ||
        ing.category.toLowerCase().includes(q) ||
        ing.widespreadAdoption.period.toLowerCase().includes(q) ||
        ing.widespreadAdoption.details.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [ingredients, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleItemClick = (ing: FoodIngredient) => {
    sound.playClick();
    // Compute the first time it got introduced to India
    const anchors = getSimulationAnchorYears(ing);
    const introYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, anchors.arrivalYear));
    onSelectIngredient(ing, introYear);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-start bg-black/20 backdrop-blur-sm transition-opacity select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalogue-title"
    >
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border-r border-black/[0.06] shadow-elevated flex flex-col h-full animate-in slide-in-from-left duration-250">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-black/[0.05]">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-sans text-[12px] font-medium text-neutral-400">
                Index of 150 historical records
              </span>
              <h2
                id="catalogue-title"
                className="font-sans text-[22px] font-semibold text-neutral-900 leading-tight tracking-tight mt-0.5"
              >
                Ingredients
              </h2>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              onMouseEnter={() => sound.playHover()}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.05] active:scale-[0.95] transition-all"
              aria-label="Close index"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by ingredient, origin, or era..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-black/[0.02] pl-9 pr-3.5 py-2 font-sans text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                onMouseEnter={() => sound.playHover()}
                className={`px-2.5 py-1 font-sans text-[12px] rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent text-white font-semibold shadow-sm'
                    : 'bg-black/[0.03] text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Ingredient List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center font-sans text-[13px] text-neutral-400">
              No historical records matching search criteria.
            </div>
          ) : (
            filtered.map(ing => {
              const state = getIngredientState(ing, currentYear);
              const isSelected = selectedIngredientId === ing.id;

              return (
                <div
                  key={ing.id}
                  onClick={() => handleItemClick(ing)}
                  onMouseEnter={() => sound.playHover()}
                  className={`group relative flex items-start justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border border-accent/40 bg-accent/[0.06] shadow-subtle'
                      : 'border border-black/[0.04] bg-white/70 hover:bg-white hover:border-black/[0.08] hover:shadow-subtle'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {ing.illustration ? (
                      <div className="mt-0.5 h-10 w-10 shrink-0 aspect-square overflow-hidden rounded-lg flex items-center justify-center p-0.5">
                        <img
                          src={ing.illustration}
                          alt={ing.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neutral-300" />
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans text-[14px] font-semibold text-neutral-900 group-hover:text-black">
                          {ing.name}
                        </span>
                      </div>

                      <div className="font-sans text-[12px] text-neutral-500 mt-0.5">
                        {ing.category} · {state.isNative ? 'Native' : ing.origin.split(';')[0].trim()}
                      </div>

                      <div className="font-sans text-[11px] text-neutral-400 mt-0.5">
                        {ing.widespreadAdoption.period}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator at current year */}
                  <div className="shrink-0 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-sans text-[11px] font-medium ${
                      state.phase === 'widespread'
                        ? 'bg-neutral-100 text-neutral-700'
                        : state.phase === 'spreading'
                        ? 'bg-accent/10 text-accent'
                        : state.phase === 'arrived'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : state.phase === 'traveling'
                        ? 'bg-neutral-100 text-neutral-600'
                        : 'bg-black/[0.03] text-neutral-400'
                    }`}>
                      {state.phase === 'widespread'
                        ? 'Widespread'
                        : state.phase === 'spreading'
                        ? 'Spreading'
                        : state.phase === 'arrived'
                        ? 'Arrived'
                        : state.phase === 'traveling'
                        ? `${Math.round(state.routeProgress * 100)}% en route`
                        : 'In origin'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
