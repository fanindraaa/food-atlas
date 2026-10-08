'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState, getSimulationAnchorYears } from '@/utils/simulationEngine';
import { sound } from '@/utils/sound';
import { formatYear, MIN_YEAR, MAX_YEAR } from '@/utils/timeline';
import { X, Search, ChevronRight, ChevronLeft } from 'lucide-react';

interface IngredientCatalogueProps {
  ingredients: FoodIngredient[];
  currentYear: number;
  onSelectIngredient: (ingredient: FoodIngredient, targetYear?: number) => void;
  selectedIngredientId?: string;
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
}

export default function IngredientCatalogue({
  ingredients,
  currentYear,
  onSelectIngredient,
  selectedIngredientId,
  isExpanded: controlledExpanded,
  onToggleExpanded,
}: IngredientCatalogueProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const setIsExpanded = (val: boolean) => {
    if (onToggleExpanded) {
      onToggleExpanded(val);
    } else {
      setInternalExpanded(val);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside in expanded state
  useEffect(() => {
    if (!isExpanded) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const categories = useMemo(() => {
    const set = new Set(ingredients.map(i => i.category));
    return ['All', ...Array.from(set).sort()];
  }, [ingredients]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ingredients.filter(ing => {
      const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;

      const nameMatch = ing.name.toLowerCase().includes(q);
      const idMatch = ing.id.toLowerCase().replace(/-/g, ' ').includes(q);
      const originMatch = ing.origin.toLowerCase().includes(q);
      const catMatch = ing.category.toLowerCase().includes(q);
      const periodMatch = ing.widespreadAdoption.period.toLowerCase().includes(q);
      const detailsMatch = ing.widespreadAdoption.details.toLowerCase().includes(q);
      const noteMatch = ing.widespreadAdoption.simulationYearNote?.toLowerCase().includes(q) ?? false;

      return nameMatch || idMatch || originMatch || catMatch || periodMatch || detailsMatch || noteMatch;
    });
  }, [ingredients, selectedCategory, searchQuery]);

  const handleItemClick = (ing: FoodIngredient) => {
    sound.playClick();
    const anchors = getSimulationAnchorYears(ing);
    const introYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, anchors.arrivalYear));
    onSelectIngredient(ing, introYear);
  };

  // -------------------------------------------------------------
  // COLLAPSED STATE: Quiet persistent navigation instrument (Req 6)
  // -------------------------------------------------------------
  if (!isExpanded) {
    return (
      <div
        ref={containerRef}
        className="fixed top-[214px] left-4 sm:left-6 z-20 w-[236px] rounded-2xl bg-white/85 backdrop-blur-2xl border border-black/[0.06] shadow-soft p-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none pointer-events-auto"
        role="region"
        aria-label="Ingredients index"
      >
        {/* Header row: title and expand control */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-[13px] font-semibold text-neutral-900 tracking-tight">
              Ingredients
            </span>
            <span className="font-sans text-[11px] font-medium text-neutral-600">
              150
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsExpanded(true);
            }}
            onMouseEnter={() => sound.playHover()}
            className="p-1 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.05] active:scale-[0.95] transition-all"
            title="Expand ingredients index"
            aria-label="Expand ingredients index"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Compact search field */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-600" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length > 0) {
                setIsExpanded(true);
              }
            }}
            className="w-full rounded-lg border border-black/[0.08] bg-black/[0.02] pl-8 pr-2.5 py-1.5 font-sans text-[12px] text-neutral-900 placeholder:text-neutral-600 focus:border-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EXPANDED STATE: Full detailed historical index drawer
  // -------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className="fixed top-24 left-4 sm:left-6 z-30 w-[calc(100vw-32px)] sm:w-[410px] h-[calc(100vh-170px)] max-h-[720px] rounded-[24px] bg-white/92 backdrop-blur-2xl border border-black/[0.06] shadow-elevated flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none pointer-events-auto"
      role="dialog"
      aria-modal="false"
      aria-labelledby="catalogue-title"
    >
      {/* Header */}
      <div className="p-5 pb-3 border-b border-black/[0.05]">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-sans text-[11px] font-medium text-neutral-600">
              Index of 150 historical records
            </span>
            <h2
              id="catalogue-title"
              className="font-sans text-[20px] font-semibold text-neutral-900 leading-tight tracking-tight mt-0.5"
            >
              Ingredients
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setIsExpanded(false);
            }}
            onMouseEnter={() => sound.playHover()}
            className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.05] active:scale-[0.95] transition-all"
            aria-label="Collapse ingredients index"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Functional Search Box */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search by ingredient, origin, or era..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-black/[0.08] bg-black/[0.02] pl-8.5 pr-7 py-1.5 font-sans text-[12.5px] text-neutral-900 placeholder:text-neutral-600 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-neutral-600 hover:text-neutral-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`px-2 py-0.5 font-sans text-[11px] rounded-lg transition-all ${
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
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center font-sans text-[12.5px] text-neutral-600">
            No historical records matching &ldquo;{searchQuery}&rdquo;.
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
                className={`group relative flex items-start justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border border-accent/40 bg-accent/[0.07] shadow-subtle'
                    : 'border border-black/[0.04] bg-white/70 hover:bg-white hover:border-black/[0.08] hover:shadow-subtle'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {ing.illustration ? (
                    <div className="mt-0.5 h-9 w-9 shrink-0 aspect-square overflow-hidden rounded-lg flex items-center justify-center p-0.5 bg-neutral-50/80 border border-black/[0.04]">
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
                      <span className={`font-sans text-[13px] font-semibold ${isSelected ? 'text-accent' : 'text-neutral-900 group-hover:text-black'}`}>
                        {ing.name}
                      </span>
                    </div>

                    <div className="font-sans text-[11.5px] text-neutral-500 mt-0.5">
                      {ing.category} · {state.isNative ? 'Indigenous foundation' : ing.origin.split(';')[0].trim()}
                    </div>

                    <div className="font-sans text-[10.5px] text-neutral-600 mt-0.5">
                      {ing.widespreadAdoption.period}
                    </div>
                  </div>
                </div>

                {/* Status Indicator at current year */}
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded font-sans text-[10.5px] font-medium ${
                      state.phase === 'widespread'
                        ? 'bg-neutral-100 text-neutral-700'
                        : state.phase === 'spreading'
                        ? 'bg-accent/10 text-accent'
                        : state.phase === 'arrived'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : state.phase === 'traveling'
                        ? 'bg-neutral-100 text-neutral-600'
                        : 'bg-black/[0.03] text-neutral-600'
                    }`}
                  >
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
  );
}
