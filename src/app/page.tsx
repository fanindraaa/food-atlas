'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TimelineSlider from '@/components/TimelineSlider';
import HistoricalStatus from '@/components/HistoricalStatus';
import IngredientCard from '@/components/IngredientCard';
import IngredientCatalogue from '@/components/IngredientCatalogue';
import ModernPantryModal from '@/components/ModernPantryModal';
import rawIngredients from '@/data/india-food-journey-150.json';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState, getHistoricalNarrative } from '@/utils/simulationEngine';

// Canonical 150-Item Dataset
const ALL_INGREDIENTS: FoodIngredient[] = rawIngredients as FoodIngredient[];

// Dynamically import Map component to ensure client-side rendering
const FoodMap = dynamic(() => import('@/map/FoodMap'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral-100">
      <div className="flex flex-col items-center space-y-3 font-serif">
        <span className="font-serif text-sm text-neutral-600">
          Unfolding cartographic instrument...
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedIngredient, setSelectedIngredient] = useState<FoodIngredient | null>(null);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isNativeModalOpen, setIsNativeModalOpen] = useState(false);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  // Compute ingredients that have reached or spread within India at currentYear
  const visibleIngredients = useMemo(() => {
    return ALL_INGREDIENTS.filter(ing => {
      const state = getIngredientState(ing, currentYear);
      return state.arrivalReached;
    });
  }, [currentYear]);

  // Compute historical narrative and active milestone
  const { headline, subheadline, milestoneCallout } = useMemo(() => {
    return getHistoricalNarrative(ALL_INGREDIENTS, currentYear);
  }, [currentYear]);

  // Handler for selecting an ingredient
  const handleSelectIngredient = useCallback((ingredient: FoodIngredient) => {
    setSelectedIngredient(ingredient);
    const state = getIngredientState(ingredient, currentYear);
    setFlyToCoords(state.entryCoords);
  }, [currentYear]);

  // Quick jump toggle between 2026 and 1500 (Columbian Exchange moment)
  const handleJumpColumbian = useCallback(() => {
    if (currentYear <= 1550) {
      setCurrentYear(2026);
    } else {
      setCurrentYear(1500);
    }
  }, [currentYear]);

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-neutral-100 select-none">
      <FoodMap
        ingredients={ALL_INGREDIENTS}
        currentYear={currentYear}
        selectedIngredient={selectedIngredient}
        onSelectIngredient={handleSelectIngredient}
        flyToCoords={flyToCoords}
      />

      {/* 2. Floating Header: Sits seamlessly over the map with smooth blur & gradient */}
      <Header
        onOpenCatalogue={() => setIsCatalogueOpen(true)}
        onOpenNativeModal={() => setIsNativeModalOpen(true)}
        onJumpColumbian={handleJumpColumbian}
        currentYear={currentYear}
      />

      {/* 3. Historical Status Instrument: Floats above the timeline */}
      <HistoricalStatus
        currentYear={currentYear}
        headline={headline}
        subheadline={subheadline}
        milestoneCallout={milestoneCallout}
        activeCount={visibleIngredients.length}
        totalCount={ALL_INGREDIENTS.length}
      />

      {/* 4. Timeline Dock: Fixed measuring instrument layer at the bottom */}
      <TimelineSlider
        currentYear={currentYear}
        onYearChange={setCurrentYear}
        ingredients={ALL_INGREDIENTS}
        visibleCount={visibleIngredients.length}
        totalCount={ALL_INGREDIENTS.length}
      />

      {/* 5. Selected Ingredient Field-Note Overlay (Clean editorial panel) */}
      <IngredientCard
        ingredient={selectedIngredient}
        currentYear={currentYear}
        onClose={() => setSelectedIngredient(null)}
        onFocusLocation={coords => setFlyToCoords(coords)}
      />

      {/* 6. Ingredient Catalogue Drawer */}
      <IngredientCatalogue
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        ingredients={ALL_INGREDIENTS}
        currentYear={currentYear}
        onSelectIngredient={ing => {
          handleSelectIngredient(ing);
          setIsCatalogueOpen(false);
        }}
        selectedIngredientId={selectedIngredient?.id}
      />

      {/* 7. "What Feels Native?" Comparison Dialog */}
      <ModernPantryModal
        isOpen={isNativeModalOpen}
        onClose={() => setIsNativeModalOpen(false)}
        ingredients={ALL_INGREDIENTS}
        onSelectIngredient={ing => {
          handleSelectIngredient(ing);
          setIsNativeModalOpen(false);
        }}
      />
    </main>
  );
}
