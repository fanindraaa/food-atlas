'use client';

import React, { useState, useMemo } from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState } from '@/utils/simulationEngine';
import { sound } from '@/utils/sound';
import { formatYear } from '@/utils/timeline';
import { X, Search } from 'lucide-react';

interface IngredientCatalogueProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: FoodIngredient[];
  currentYear: number;
  onSelectIngredient: (ingredient: FoodIngredient) => void;
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

  return (
    <div
      className="fixed inset-0 z-40 flex justify-start bg-neutral-900/40 backdrop-blur-sm transition-opacity select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalogue-title"
    >
      <div className="relative w-full max-w-md bg-white border-r border-neutral-300 shadow-xl flex flex-col h-full animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-6 border-b border-neutral-300">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-serif text-xs text-neutral-500">
                Index of 150 historical records
              </span>
              <h2 id="catalogue-title" className="font-serif text-2xl font-semibold text-neutral-900 leading-tight">
                Ingredients
              </h2>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              onMouseEnter={() => sound.playHover()}
              className="btn-mechanical btn-mechanical-icon"
              aria-label="Close index"
            >
              <X className="h-4 w-4 text-neutral-900" />
            </button>
          </div>

          <p className="mt-1 font-serif text-xs text-neutral-600">
            Historical statuses evaluated at {formatYear(currentYear)}.
          </p>

          {/* Search Box */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by ingredient, origin, or era..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-neutral-300 bg-neutral-50 pl-9 pr-3 py-1.5 font-serif text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none rounded-[3px]"
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
                className={`px-2 py-0.5 font-serif text-xs border rounded-[3px] transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'
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
            <div className="p-8 text-center font-serif text-xs text-neutral-500">
              No botanical records matching search criteria.
            </div>
          ) : (
            filtered.map(ing => {
              const state = getIngredientState(ing, currentYear);
              const isSelected = selectedIngredientId === ing.id;

              return (
                <div
                  key={ing.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectIngredient(ing);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`group relative flex items-start justify-between p-3 border rounded-[3px] cursor-pointer transition select-none ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-100 shadow-[0_2px_0_#111111]'
                      : 'border-neutral-300 bg-white hover:border-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {ing.illustration ? (
                      <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-[2px] border border-neutral-300 bg-neutral-50 p-0.5">
                        <img
                          src={ing.illustration}
                          alt={ing.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="mt-1 h-2 w-2 shrink-0 bg-neutral-900" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-semibold text-neutral-900 group-hover:text-neutral-950">
                          {ing.name}
                        </span>
                        <span className="font-serif text-[10px] text-neutral-500 border border-neutral-300 px-1 py-0.2">
                          {ing.confidence}
                        </span>
                      </div>

                      <div className="font-serif text-xs text-neutral-500">
                        {ing.category} — {state.isNative ? 'Native' : ing.origin.split(';')[0].trim()}
                      </div>

                      <div className="mt-0.5 font-serif text-xs text-neutral-700">
                        {ing.widespreadAdoption.period}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator at current year */}
                  <div className="shrink-0 text-right">
                    <span className="inline-block px-1.5 py-0.5 border border-neutral-300 bg-neutral-50 font-serif text-[11px] text-neutral-700">
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
