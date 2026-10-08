'use client';

import React, { useRef, useEffect } from 'react';
import { sound } from '@/utils/sound';
import {
  X,
  Info,
  Type,
  Code2,
  Compass,
  ExternalLink,
} from 'lucide-react';

interface CreditsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function CreditsSidebar({
  isOpen,
  onClose,
  onToggle,
}: CreditsSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* 1. Bottom-Right Ingress Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-30 select-none pointer-events-auto">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            sound.playClick();
            onToggle();
          }}
          onMouseEnter={() => sound.playHover()}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close credits sidebar' : 'Open credits sidebar'}
          title="Credits & Attributions"
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl font-sans text-[12.5px] font-medium transition-all active:scale-[0.96] shadow-soft ${
            isOpen
              ? 'bg-neutral-900 text-white border border-neutral-900 shadow-elevated'
              : 'bg-white/85 hover:bg-white text-neutral-700 hover:text-neutral-900 backdrop-blur-2xl border border-black/[0.06] hover:border-black/15 hover:shadow-subtle'
          }`}
        >
          <Info className={`h-3.5 w-3.5 ${isOpen ? 'text-white' : 'text-neutral-500'}`} />
          <span>Credits</span>
        </button>
      </div>

      {/* 2. Credits Sidebar (Identical size and aesthetic as expanded ingredients bar) */}
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed top-24 right-4 sm:right-6 z-40 w-[calc(100vw-32px)] sm:w-[410px] h-[calc(100vh-170px)] max-h-[720px] rounded-[24px] bg-white/92 backdrop-blur-2xl border border-black/[0.06] shadow-elevated flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200"
          role="dialog"
          aria-modal="false"
          aria-labelledby="credits-title"
        >
          {/* Header */}
          <div className="p-5 pb-3 border-b border-black/[0.05]">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-sans text-[11px] font-medium text-neutral-600">
                  Colophon &amp; Acknowledgements
                </span>
                <h2
                  id="credits-title"
                  className="font-sans text-[20px] font-semibold text-neutral-900 leading-tight tracking-tight mt-0.5"
                >
                  Credits
                </h2>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                onMouseEnter={() => sound.playHover()}
                className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.05] active:scale-[0.95] transition-all"
                aria-label="Close credits sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 select-text">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-neutral-600 text-[11px] font-semibold ">
                <Type className="h-3.5 w-3.5" />
                <span>
                  <p>Typeface</p>
                </span>
              </div>
              <div className="rounded-2xl bg-black/[0.02] border border-black/[0.05] p-4">
                <p className="font-sans text-[13px] text-neutral-800 leading-relaxed">
                  Typeface set in the beautiful &quot;Timeless Sans&quot; by the amazing{' '}
                  <a
                    href="https://timeless.co/type"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent hover:underline"
                  >
                    timeless.co
                  </a>
                </p>

                <div className="mt-3">
                  <a
                    href="https://timeless.co/type"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => sound.playHover()}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-black/[0.06] hover:border-accent/40 hover:shadow-subtle transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-[12px] font-bold">
                        Aa
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans text-[12.5px] font-semibold text-neutral-900 group-hover:text-accent transition-colors">
                          timeless.co/type
                        </span>
                        <span className="font-sans text-[11px] text-neutral-600">
                          Timeless Sans &amp; Serif typography
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-600 group-hover:text-accent transition-colors" />
                  </a>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-white/70 border border-black/[0.04]">
                  <div className="font-sans text-[10px] font-semibold text-neutral-600  mb-1">
                    Font Specimen
                  </div>
                  <div className="font-sans text-[14px] font-normal text-neutral-900 leading-snug tracking-tight">
                    The Food Atlas: How the Indian Pantry Came Together
                  </div>
                  <div className="font-sans text-[11px] text-neutral-600 mt-1">
                    ABCDEFGHIJKLM · NOPQRSTUVWXYZ · 0123456789
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Tech Stack */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-neutral-600 text-[11px] font-semibold ">
                <Code2 className="h-3.5 w-3.5" />
                <span>Tech Stack</span>
              </div>
              <div className="rounded-2xl bg-black/[0.02] border border-black/[0.05] p-3.5 divide-y divide-black/[0.04]">
                <div className="pb-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[12.5px] font-semibold text-neutral-900">Next.js 16</span>
                    <span className="font-sans text-[11px] text-neutral-600">React 19 · TypeScript</span>
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-500 mt-0.5">
                    Core application framework, client-side simulation state &amp; hydration.
                  </p>
                </div>
                <div className="py-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[12.5px] font-semibold text-neutral-900">MapLibre GL JS</span>
                    <span className="font-sans text-[11px] text-neutral-600">WebGL Cartography</span>
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-500 mt-0.5">
                    Hardware-accelerated vector and raster rendering with custom parchment styling.
                  </p>
                </div>
                <div className="py-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[12.5px] font-semibold text-neutral-900">Tailwind CSS</span>
                    <span className="font-sans text-[11px] text-neutral-600">Editorial Styling</span>
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-500 mt-0.5">
                    Parchment, terracotta, and ink color palette with frosted glass tactile surfaces.
                  </p>
                </div>
                <div className="py-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[12.5px] font-semibold text-neutral-900">OpenFreeMap</span>
                    <span className="font-sans text-[11px] text-neutral-600">Basemap Vector Tiles</span>
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-500 mt-0.5">
                    Positron global tiles stripped of modern motorways, POIs, and clutter.
                  </p>
                </div>
                <div className="py-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[12.5px] font-semibold text-neutral-900">Web Audio API</span>
                    <span className="font-sans text-[11px] text-neutral-600">Synthetic Acoustics</span>
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-500 mt-0.5">
                    Synthesized mechanical clicks and ratchets for tactile user feedback.
                  </p>
                </div>
                <div className="pt-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-[12.5px] font-semibold text-neutral-900">Lucide Icons</span>
                    <span className="font-sans text-[11px] text-neutral-600">Iconography</span>
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-500 mt-0.5">
                    Clean, minimalist iconography tuned for editorial interfaces.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Attributions */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-neutral-600 text-[11px] font-semibold ">
                <Compass className="h-3.5 w-3.5" />
                <span>Attributions &amp; Data</span>
              </div>
              <div className="rounded-2xl bg-black/[0.02] border border-black/[0.05] p-3.5 space-y-3">
                <div>
                  <div className="font-sans text-[12.5px] font-semibold text-neutral-900">
                    Survey of India Standard Boundaries
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-600 mt-0.5 leading-relaxed">
                    National outline and external boundaries strictly adhere to Survey of India cartographic standards via DataMeet datasets (CC BY 4.0).
                  </p>
                </div>
                <div className="border-t border-black/[0.04] pt-2.5">
                  <div className="font-sans text-[12.5px] font-semibold text-neutral-900">
                    OpenStreetMap &amp; OpenFreeMap
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-600 mt-0.5 leading-relaxed">
                    Base map data ©{' '}
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-800 underline hover:text-accent font-medium"
                    >
                      OpenStreetMap
                    </a>{' '}
                    contributors, served via{' '}
                    <a
                      href="https://openfreemap.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-800 underline hover:text-accent font-medium"
                    >
                      OpenFreeMap
                    </a>.
                  </p>
                </div>
                <div className="border-t border-black/[0.04] pt-2.5">
                  <div className="font-sans text-[12.5px] font-semibold text-neutral-900">
                    Culinary History &amp; Botanical Migrations
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-600 mt-0.5 leading-relaxed">
                    Historical movement, introduction eras, and cultural records synthesized from archaeobotanical findings, ancient trade records (Indus Valley, Silk Road, Indian Ocean maritime routes, Columbian Exchange), and subcontinental culinary history.
                  </p>
                </div>
                <div className="border-t border-black/[0.04] pt-2.5">
                  <div className="font-sans text-[12.5px] font-semibold text-neutral-900">
                    Specimen Illustrations
                  </div>
                  <p className="font-sans text-[11.5px] text-neutral-600 mt-0.5 leading-relaxed">
                    Botanical specimen renders depicting 150 historical food ingredients across subcontinental culinary history.
                  </p>
                </div>
              </div>
              

             <div className="space-y-2 pt-4">
              <div className="rounded-2xl bg-black/[0.02] border border-black/[0.05] p-4">
                <p className="font-sans text-[13px] text-neutral-800 leading-relaxed">
                  by Fanindra Maharana
                </p>

                <div className="mt-3">
                  <a
                    href="https://fanindra.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => sound.playHover()}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-black/[0.06] hover:border-accent/40 hover:shadow-subtle transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex flex-col">
                        <span className="font-sans text-[12.5px] font-semibold text-neutral-900 group-hover:text-accent transition-colors">
                          Check out my work at <span className='text-accent'>fanindra.me</span>
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-600 group-hover:text-accent transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            </div>

            {/* Footer Note */}
            <div className="pt-2 border-t border-black/[0.05] text-center">
              <p className="font-sans text-[11px] text-neutral-600">
                The Food Atlas · An editorial cartographic instrument
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
