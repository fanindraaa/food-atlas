'use client';

import React from 'react';
import { FoodIngredient } from '@/types/simulation';
import { isNativeIngredient } from '@/utils/simulationEngine';
import { sound } from '@/utils/sound';
import { X, ArrowRight } from 'lucide-react';

interface ModernPantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: FoodIngredient[];
  onSelectIngredient: (ingredient: FoodIngredient) => void;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="native-modal-title"
    >
      <div className="relative max-h-[88vh] w-full max-w-4xl overflow-y-auto bg-white border border-neutral-300 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-300 pb-4">
          <div>
            <span className="font-serif text-xs text-neutral-500">
              Historical culinary comparison
            </span>
            <h2 id="native-modal-title" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-neutral-900 leading-tight">
              What feels native?
            </h2>
            <p className="mt-1.5 font-serif text-xs sm:text-sm text-neutral-700 max-w-2xl leading-relaxed">
              Many ingredients considered indispensable in Indian cooking today—such as chillies, potatoes, and tomatoes—crossed oceans only a few centuries ago. Compare these overseas introductions with ancient indigenous foundations.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            onMouseEnter={() => sound.playHover()}
            className="btn-mechanical btn-mechanical-icon"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-neutral-900" />
          </button>
        </div>

        {/* Section 1: Introduced Staples */}
        <div className="mt-6">
          <div className="border-b border-neutral-300 pb-1.5">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-neutral-900">
              Ubiquitous today, yet arrived from afar ({foreignStaples.length} foods)
            </h3>
          </div>
          <p className="mt-1 font-serif text-xs text-neutral-600 leading-relaxed">
            Arrived via the Columbian Exchange, ancient African trade, or Silk Road conduits.
          </p>

          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {foreignStaples.slice(0, 18).map(item => (
              <div
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectIngredient(item);
                  onClose();
                }}
                onMouseEnter={() => sound.playHover()}
                className="group flex flex-col justify-between border border-neutral-300 bg-white p-3 hover:border-neutral-900 hover:bg-neutral-50 cursor-pointer transition rounded-[3px]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold text-neutral-900 group-hover:text-neutral-950">
                      {item.name}
                    </span>
                    <span className="font-serif text-[10px] text-neutral-500 border border-neutral-300 px-1">
                      {item.confidence}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-serif text-neutral-500">
                    Origin: {item.origin.split(';')[0].trim()}
                  </div>
                  <div className="mt-0.5 text-xs font-serif text-neutral-800 font-medium">
                    {item.widespreadAdoption.period}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end text-[11px] font-serif text-neutral-500 group-hover:text-neutral-900">
                  <span>Track route</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Indigenous Foundations */}
        <div className="mt-8 border-t border-neutral-300 pt-6">
          <div className="border-b border-neutral-300 pb-1.5">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-neutral-900">
              Ancient subcontinental foundations ({nativeFoundations.length} foods)
            </h3>
          </div>
          <p className="mt-1 font-serif text-xs text-neutral-600 leading-relaxed">
            Indigenous to the Indian subcontinent since deep antiquity; cultivated and harvested across millennia.
          </p>

          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {nativeFoundations.slice(0, 18).map(item => (
              <div
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectIngredient(item);
                  onClose();
                }}
                onMouseEnter={() => sound.playHover()}
                className="group flex flex-col justify-between border border-neutral-300 bg-white p-3 hover:border-neutral-900 hover:bg-neutral-50 cursor-pointer transition rounded-[3px]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold text-neutral-900 group-hover:text-neutral-950">
                      {item.name}
                    </span>
                    <span className="font-serif text-[10px] text-neutral-500 border border-neutral-300 px-1">
                      {item.confidence}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-serif text-neutral-500">
                    Primary hearth: {item.origin.split(';')[0].trim()}
                  </div>
                  <div className="mt-0.5 text-xs font-serif text-neutral-800 font-medium">
                    {item.widespreadAdoption.period}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end text-[11px] font-serif text-neutral-500 group-hover:text-neutral-900">
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
