'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TimelineSlider from '@/components/TimelineSlider';
import HistoricalStatus from '@/components/HistoricalStatus';
import IngredientCard from '@/components/IngredientCard';
import IngredientCatalogue from '@/components/IngredientCatalogue';
import ModernPantryModal from '@/components/ModernPantryModal';
import CreditsSidebar from '@/components/CreditsSidebar';
import rawIngredients from '@/data/india-food-journey-150.json';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState, getHistoricalNarrative, getSimulationAnchorYears } from '@/utils/simulationEngine';
import { MIN_YEAR, MAX_YEAR } from '@/utils/timeline';

// Canonical 150-Item Dataset
const ALL_INGREDIENTS: FoodIngredient[] = rawIngredients as FoodIngredient[];

// Dynamically import Map component to ensure client-side rendering
const FoodMap = dynamic(() => import('@/map/FoodMap'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f6f7f9]">
      <div className="flex flex-col items-center space-y-3 font-sans">
        <span className="font-sans text-sm text-neutral-500">
          Unfolding cartographic instrument...
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const currentYearRef = useRef(currentYear);
  currentYearRef.current = currentYear;

  const [selectedIngredient, setSelectedIngredient] = useState<FoodIngredient | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isNativeModalOpen, setIsNativeModalOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  const timelineAnimRef = useRef<number | null>(null);

  // Smooth ease-out animation for timeline year transitions (Req 9 & 14)
  const animateTimelineToYear = useCallback((targetYear: number) => {
    if (timelineAnimRef.current !== null) {
      cancelAnimationFrame(timelineAnimRef.current);
      timelineAnimRef.current = null;
    }

    const startYear = currentYearRef.current;
    if (startYear === targetYear) return;

    const duration = 800; // 800ms smooth, subtle transition
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const nextYear = Math.round(startYear + (targetYear - startYear) * eased);

      setCurrentYear(nextYear);

      if (progress < 1) {
        timelineAnimRef.current = requestAnimationFrame(step);
      } else {
        setCurrentYear(targetYear);
        timelineAnimRef.current = null;
      }
    };

    timelineAnimRef.current = requestAnimationFrame(step);
  }, []);

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

  // Unified Handler for selecting / deselecting ingredients (Req 8, 9, 10, 11, 13)
  const handleSelectIngredient = useCallback(
    (ingredient: FoodIngredient, targetYear?: number) => {
      // Requirement 10: Clicking the selected ingredient again cleanly deselects it
      if (selectedIngredient?.id === ingredient.id) {
        setSelectedIngredient(null);
        return;
      }

      // 1. Select the new ingredient
      setSelectedIngredient(ingredient);

      // 2. Requirement 13: Stop / pause simulation when manually selecting an ingredient
      setIsPlaying(false);

      // Close credits sidebar if open
      setIsCreditsOpen(false);

      // 3. Requirement 9: Shift timeline smoothly to ingredient's historical arrival year
      const anchors = getSimulationAnchorYears(ingredient);
      const arrivalYear =
        typeof targetYear === 'number'
          ? targetYear
          : Math.max(MIN_YEAR, Math.min(MAX_YEAR, anchors.arrivalYear));

      animateTimelineToYear(arrivalYear);

      // Requirement 8: DO NOT automatically reposition the map camera on ingredient selection.
      // The selected ingredient remains exactly where it is.
    },
    [selectedIngredient, animateTimelineToYear]
  );

  // Manual timeline changes from slider or keyboard
  const handleYearChange = useCallback((newYear: number) => {
    if (timelineAnimRef.current !== null) {
      cancelAnimationFrame(timelineAnimRef.current);
      timelineAnimRef.current = null;
    }
    setCurrentYear(newYear);
  }, []);

  // Quick jump toggle between 2026 and 1500 (Columbian Exchange moment)
  const handleJumpColumbian = useCallback(() => {
    setIsPlaying(false);
    if (currentYear <= 1550) {
      animateTimelineToYear(2026);
    } else {
      animateTimelineToYear(1500);
    }
  }, [currentYear, animateTimelineToYear]);

  // Clean up any in-flight timeline animation on unmount
  useEffect(() => {
    return () => {
      if (timelineAnimRef.current !== null) {
        cancelAnimationFrame(timelineAnimRef.current);
      }
    };
  }, []);

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-[#f6f7f9] select-none">
      {/* 1. Primary Editorial Map Canvas */}
      <FoodMap
        ingredients={ALL_INGREDIENTS}
        currentYear={currentYear}
        selectedIngredient={selectedIngredient}
        onSelectIngredient={handleSelectIngredient}
        flyToCoords={flyToCoords}
      />

      {/* 2. Floating Header: Editorial masthead floating over map (Req 6) */}
      <Header
        onOpenNativeModal={() => setIsNativeModalOpen(true)}
        onJumpColumbian={handleJumpColumbian}
        currentYear={currentYear}
      />

      {/* 3. Persistent Collapsed Ingredients Index Navigation Instrument (Req 6 & 7) */}
      <IngredientCatalogue
        ingredients={ALL_INGREDIENTS}
        currentYear={currentYear}
        onSelectIngredient={handleSelectIngredient}
        selectedIngredientId={selectedIngredient?.id}
      />

      {/* 4. Historical Status Instrument: Floats above the timeline */}
      <HistoricalStatus
        currentYear={currentYear}
        headline={headline}
        subheadline={subheadline}
        milestoneCallout={milestoneCallout}
        activeCount={visibleIngredients.length}
        totalCount={ALL_INGREDIENTS.length}
      />

      {/* 5. Timeline Dock: Floating navigation instrument at the bottom (Req 12 & 13) */}
      <TimelineSlider
        currentYear={currentYear}
        onYearChange={handleYearChange}
        ingredients={ALL_INGREDIENTS}
        visibleCount={visibleIngredients.length}
        totalCount={ALL_INGREDIENTS.length}
        isPlaying={isPlaying}
        onPlayingChange={setIsPlaying}
      />

      {/* 6. Selected Ingredient Field-Note Overlay (Clean editorial floating card) (Req 10 & 11) */}
      <IngredientCard
        ingredient={selectedIngredient}
        currentYear={currentYear}
        onClose={() => setSelectedIngredient(null)}
        onFocusLocation={coords => setFlyToCoords(coords)}
      />

      {/* 7. "What Feels Native?" Comparison Dialog */}
      <ModernPantryModal
        isOpen={isNativeModalOpen}
        onClose={() => setIsNativeModalOpen(false)}
        ingredients={ALL_INGREDIENTS}
        onSelectIngredient={(ing, targetYear) => {
          handleSelectIngredient(ing, targetYear);
          setIsNativeModalOpen(false);
        }}
      />

      {/* 8. Credits Sidebar & Bottom-Right Ingress */}
      <CreditsSidebar
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        onToggle={() => {
          if (!isCreditsOpen) {
            setSelectedIngredient(null);
          }
          setIsCreditsOpen(prev => !prev);
        }}
      />
    </main>
  );
}
