'use client';

import React from 'react';
import { FoodIngredient } from '@/types/simulation';
import { isNativeIngredient, getSimulationAnchorYears } from '@/utils/simulationEngine';
import { sound } from '@/utils/sound';
import { MIN_YEAR, MAX_YEAR } from '@/utils/timeline';
import { X, ArrowRight } from 'lucide-react';

interface ModernPantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: FoodIngredient[];
  onSelectIngredient: (ingredient: FoodIngredient, targetYear?: number) => void;
}

export default function ModernPantryModal({
  isOpen,
  onClose,
  ingredients,
  onSelectIngredient,
}: ModernPantryModalProps) {
  if (!isOpen) return null;

  // Foreign introductions that feel ubiquitous today
  const foreignStaples = ingredients.filter(i => !isNativeIngredient(i));
  // Ancient indigenous subcontinental foundations
  const nativeFoundations = ingredients.filter(i => isNativeIngredient(i));

  const handleItemSelect = (item: FoodIngredient) => {
    sound.playClick();
    const anchors = getSimulationAnchorYears(item);
    const introYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, anchors.arrivalYear));
    onSelectIngredient(item, introYear);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="native-modal-title"
    >
      <div className="relative max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[24px] bg-white/90 backdrop-blur-2xl border border-black/[0.06] p-6 sm:p-8 shadow-elevated animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-black/[0.06] pb-5">
          <div>
            <span className="font-sans text-[12px] font-medium text-black/50">
              Historical culinary comparison
            </span>
            <h2
              id="native-modal-title"
              className="font-sans text-[24px] sm:text-[28px] font-semibold text-neutral-900 leading-tight tracking-tight mt-0.5"
            >
              What feels native?
            </h2>
            <p className="font-sans text-[13px] text-neutral-600 max-w-2xl mt-1.5 leading-relaxed">
              Many ingredients considered indispensable in Indian cooking today  such as chillies, potatoes, and tomatoes crossed oceans only a few centuries ago. Compare these overseas introductions with ancient indigenous foundations.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            onMouseEnter={() => sound.playHover()}
            className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.05] active:scale-[0.95] transition-all"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section 1: Introduced Staples */}
        <div className="mt-6">
          <div className="pb-1">
            <h3 className="font-sans text-[16px] font-semibold text-neutral-900">
              Ubiquitous today, yet arrived from afar ({foreignStaples.length} foods)
            </h3>
            <p className="font-sans text-[12px] text-neutral-500 mt-0.5">
              Arrived via the Columbian Exchange, ancient African trade, or Silk Road conduits.
            </p>
          </div>

          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {foreignStaples.slice(0, 18).map(item => (
              <div
                key={item.id}
                onClick={() => handleItemSelect(item)}
                onMouseEnter={() => sound.playHover()}
                className="group flex flex-col justify-between p-3.5 rounded-lg border border-black/[0.04] bg-white/70 hover:bg-white hover:border-accent/30 hover:shadow-subtle cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[14px] font-semibold text-neutral-900 group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="mt-1 font-sans text-[12px] text-neutral-500">
                    Origin: {item.origin.split(';')[0].trim()}
                  </div>
                  <div className="mt-0.5 font-sans text-[12px] text-neutral-700 font-medium">
                    {item.widespreadAdoption.period}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end font-sans text-[11px] text-neutral-600 group-hover:text-accent transition-colors">
                  <span>Track arrival</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Indigenous Foundations */}
        <div className="mt-8 border-t border-black/[0.06] pt-6">
          <div className="pb-1">
            <h3 className="font-sans text-[16px] font-semibold text-neutral-900">
              Ancient subcontinental foundations ({nativeFoundations.length} foods)
            </h3>
            <p className="font-sans text-[12px] text-neutral-500 mt-0.5">
              Indigenous to the Indian subcontinent since deep antiquity; cultivated and harvested across millennia.
            </p>
          </div>

          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {nativeFoundations.slice(0, 18).map(item => (
              <div
                key={item.id}
                onClick={() => handleItemSelect(item)}
                onMouseEnter={() => sound.playHover()}
                className="group flex flex-col justify-between p-3.5 rounded-lg border border-black/[0.04] bg-white/70 hover:bg-white hover:border-accent/30 hover:shadow-subtle cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[14px] font-semibold text-neutral-900 group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="mt-1 font-sans text-[12px] text-neutral-500">
                    Primary hearth: {item.origin.split(';')[0].trim()}
                  </div>
                  <div className="mt-0.5 font-sans text-[12px] text-neutral-700 font-medium">
                    {item.widespreadAdoption.period}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end font-sans text-[11px] text-neutral-600 group-hover:text-accent transition-colors">
                  <span>View record</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
