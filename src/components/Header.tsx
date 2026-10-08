'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/utils/sound';
import { Volume2, VolumeX, BookOpen, Compass, History } from 'lucide-react';

interface HeaderProps {
  onOpenCatalogue: () => void;
  onOpenNativeModal: () => void;
  onJumpColumbian: () => void;
  currentYear: number;
}

export default function Header({
  onOpenCatalogue,
  onOpenNativeModal,
  onJumpColumbian,
  currentYear,
}: HeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(sound.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const isColumbianEra = currentYear <= 1550;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 select-none pointer-events-none px-4 sm:px-8 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-auto">
        {/* Floating Editorial Masthead */}
        <div className="flex flex-col">
          <h1 className="font-serif text-[24px] sm:text-[30px] font-semibold text-neutral-900 leading-none tracking-tight">
            The Food Atlas
          </h1>
          <p className="font-sans text-[13px] font-medium text-neutral-500 mt-1">
            How the Indian pantry came together
          </p>
        </div>

        {/* Refined Floating Navigation Surface */}
        <nav
          aria-label="Atlas controls"
          className="flex items-center gap-1 p-1 rounded-2xl bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-soft"
        >
          {/* Ingredients Catalogue */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCatalogue();
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-[13px] font-medium text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.04] active:scale-[0.98] transition-all"
            title="Browse botanical and historical ingredient records"
          >
            <BookOpen className="h-3.5 w-3.5 text-neutral-500" />
            <span>Ingredients</span>
          </button>

          {/* What feels native? */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNativeModal();
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-[13px] font-medium text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.04] active:scale-[0.98] transition-all"
            title="Compare introduced staples with indigenous subcontinental foods"
          >
            <Compass className="h-3.5 w-3.5 text-neutral-500" />
            <span>What feels native?</span>
          </button>

          {/* Witness ~1500 CE Jump */}
          <button
            onClick={() => {
              sound.playClick();
              onJumpColumbian();
            }}
            onMouseEnter={() => sound.playHover()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-[13px] font-medium transition-all active:scale-[0.98] ${
              isColumbianEra
                ? 'bg-accent/10 text-accent font-semibold'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.04]'
            }`}
            title="Jump between ~1500 CE Columbian Exchange and present day"
          >
            <History className={`h-3.5 w-3.5 ${isColumbianEra ? 'text-accent' : 'text-neutral-500'}`} />
            <span>{isColumbianEra ? 'Witnessing ~1500 CE' : 'Witness ~1500 CE'}</span>
          </button>

          <div className="h-4 w-[1px] bg-black/[0.06] mx-0.5" />

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            onMouseEnter={() => sound.playHover()}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-sans text-[13px] font-medium transition-all active:scale-[0.98] ${
              soundEnabled
                ? 'text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.04]'
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04]'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label={soundEnabled ? 'Sound is on' : 'Sound is off'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-neutral-600" />
                <span className="hidden sm:inline">Sound</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
