'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/utils/sound';
import { Volume2, VolumeX, BookOpen, Compass, RotateCcw } from 'lucide-react';

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

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 select-none pointer-events-none pt-4 pb-12 px-4 sm:px-8"
      style={{
        background:
          'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 55%, rgba(255, 255, 255, 0) 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
        {/* Editorial Title Block */}
        <div className="text-center sm:text-left">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-neutral-900 leading-none">
            The Food Atlas
          </h1>
          <p className="mt-1 font-serif text-xs sm:text-sm text-neutral-600">
            How the Indian pantry came together
          </p>
        </div>

        {/* Tactile Mechanical Instrument Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCatalogue();
            }}
            onMouseEnter={() => sound.playHover()}
            className="btn-mechanical"
            title="Browse botanical and historical ingredient records"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5 text-neutral-900" />
            <span>Ingredients</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenNativeModal();
            }}
            onMouseEnter={() => sound.playHover()}
            className="btn-mechanical"
            title="Compare introduced staples with indigenous subcontinental foods"
          >
            <Compass className="h-3.5 w-3.5 mr-1.5 text-neutral-900" />
            <span>What feels native?</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onJumpColumbian();
            }}
            onMouseEnter={() => sound.playHover()}
            className="btn-mechanical"
            title="Jump between ~1500 CE Columbian Exchange and present day"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-neutral-900" />
            <span>{currentYear <= 1550 ? 'Return to 2026' : 'Witness ~1500 CE'}</span>
          </button>

          {/* Precision Mechanical Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            onMouseEnter={() => sound.playHover()}
            className={`btn-mechanical ${soundEnabled ? '' : 'btn-mechanical-active'}`}
            title={soundEnabled ? 'Mute mechanical UI sounds' : 'Enable mechanical UI sounds'}
            aria-label={soundEnabled ? 'Sound is on' : 'Sound is off'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 mr-1.5 text-neutral-900" />
                <span>Sound: on</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 mr-1.5 text-neutral-100" />
                <span>Sound: off</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
