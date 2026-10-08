'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState } from '@/utils/simulationEngine';
import { INDIA_OUTLINE_SVG_PATH, projectCoordinates } from '@/data/indiaOutlineSvg';
import { sound } from '@/utils/sound';
import CompassRose from '@/components/CompassRose';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface FoodMapProps {
  ingredients: FoodIngredient[];
  currentYear: number;
  selectedIngredient: FoodIngredient | null;
  onSelectIngredient: (ingredient: FoodIngredient) => void;
  flyToCoords?: [number, number] | null;
}

// Subdued neighbouring countries with clean sentence-case labels
const NEIGHBOURS = [
  { name: 'Pakistan', lon: 69.34, lat: 30.37 },
  { name: 'China / Tibet', lon: 88.5, lat: 33.5 },
  { name: 'Nepal', lon: 84.12, lat: 28.39 },
  { name: 'Bhutan', lon: 90.43, lat: 27.51 },
  { name: 'Bangladesh', lon: 90.35, lat: 23.68 },
  { name: 'Myanmar', lon: 95.95, lat: 21.91 },
  { name: 'Sri Lanka', lon: 80.77, lat: 7.87 },
];

export default function FoodMap({
  ingredients,
  currentYear,
  selectedIngredient,
  onSelectIngredient,
  flyToCoords,
}: FoodMapProps) {
  // Pan and Zoom viewport state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Pan to requested coordinates when flyToCoords changes
  useEffect(() => {
    if (flyToCoords) {
      const [targetX, targetY] = projectCoordinates(flyToCoords[0], flyToCoords[1]);
      setPan({
        x: (500 - targetX) * 0.7,
        y: (350 - targetY) * 0.7,
      });
      setZoom(1.35);
    }
  }, [flyToCoords]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(z => Math.max(0.85, Math.min(3.2, z * zoomFactor)));
    sound.playSliderTick();
  };

  const handleZoom = (delta: number) => {
    sound.playClick();
    setZoom(z => Math.max(0.85, Math.min(3.2, z + delta)));
  };

  const handleResetView = () => {
    sound.playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Convert waypoints array into an SVG path string
  const waypointsToPath = useCallback((waypoints: [number, number][]) => {
    if (waypoints.length < 2) return '';
    return waypoints
      .map((wp, i) => {
        const [x, y] = projectCoordinates(wp[0], wp[1]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, []);

  // Pre-calculate simulation state for all ingredients at current year
  const ingredientStates = React.useMemo(() => {
    return ingredients.map(ing => ({
      ing,
      state: getIngredientState(ing, currentYear),
    }));
  }, [ingredients, currentYear]);

  // Calculate direction angle (in degrees) for a moving particle along its waypoints
  const getParticleHeading = useCallback((waypoints: [number, number][], particlePos: [number, number]): number => {
    if (waypoints.length < 2) return 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const [x1, y1] = projectCoordinates(p1[0], p1[1]);
      const [x2, y2] = projectCoordinates(p2[0], p2[1]);
      const [px, py] = projectCoordinates(particlePos[0], particlePos[1]);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const segLenSq = dx * dx + dy * dy;
      if (segLenSq > 0) {
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / segLenSq));
        if (t < 0.99 || i === waypoints.length - 2) {
          return (Math.atan2(dy, dx) * 180) / Math.PI;
        }
      }
    }
    const last1 = waypoints[waypoints.length - 2];
    const last2 = waypoints[waypoints.length - 1];
    const [x1, y1] = projectCoordinates(last1[0], last1[1]);
    const [x2, y2] = projectCoordinates(last2[0], last2[1]);
    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  }, []);

  // Traveling offscreen ingredients
  const offscreenTraveling = React.useMemo(() => {
    return ingredientStates.filter(({ state }) => {
      if (state.phase !== 'traveling' || !state.particlePosition) return false;
      const [cx] = projectCoordinates(state.particlePosition[0], state.particlePosition[1]);
      return cx < 40;
    });
  }, [ingredientStates]);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden select-none bg-[#f6f7f9]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      role="application"
      aria-label="Historical cartographic canvas"
    >
      {/* Consolidated Floating Map Controls Group (Top Left) */}
      <div className="fixed top-24 left-4 sm:left-6 z-20 flex flex-col items-center rounded-2xl bg-white/85 backdrop-blur-xl border border-black/[0.06] shadow-soft p-1">
        <button
          onClick={() => handleZoom(0.25)}
          onMouseEnter={() => sound.playHover()}
          className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.04] active:scale-[0.95] transition-all"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-[1px] w-4 bg-black/[0.06] my-0.5" />
        <button
          onClick={() => handleZoom(-0.25)}
          onMouseEnter={() => sound.playHover()}
          className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.04] active:scale-[0.95] transition-all"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="h-[1px] w-4 bg-black/[0.06] my-0.5" />
        <button
          onClick={handleResetView}
          onMouseEnter={() => sound.playHover()}
          className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.04] active:scale-[0.95] transition-all"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cartographic Compass Rose (Top Right, Understated) */}
      <div className="pointer-events-none fixed top-24 right-6 z-10 hidden sm:block opacity-60">
        <CompassRose />
      </div>

      {/* Primary Cartographic Canvas (SVG) */}
      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
          transition: isDragging ? 'none' : 'transform 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <defs>
          <rect id="viewportBackground" x="-300" y="-200" width="1600" height="1100" fill="#f6f7f9" />
          <filter id="indiaShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.04" />
          </filter>
        </defs>

        {/* 1. Base Sea / Land Surface */}
        <use href="#viewportBackground" />

        {/* 2. Precision Graticule Lines (Delicate neutral hairline grid) */}
        <g stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3,4" opacity="0.6">
          <line x1="100" y1="-200" x2="100" y2="900" />
          <line x1="300" y1="-200" x2="300" y2="900" />
          <line x1="500" y1="-200" x2="500" y2="900" />
          <line x1="700" y1="-200" x2="700" y2="900" />
          <line x1="900" y1="-200" x2="900" y2="900" />
          <line x1="-300" y1="150" x2="1300" y2="150" />
          <line x1="-300" y1="350" x2="1300" y2="350" />
          <line x1="-300" y1="550" x2="1300" y2="550" />
        </g>

        {/* 3. Maritime Corridors */}
        <g fill="#9ca3af" fontFamily="var(--font-sans)" fontSize="10" opacity="0.8">
          <text x="35" y="660">Atlantic and Cape route corridor</text>
          <text x="35" y="320">Red Sea and Arabian maritime conduit</text>
          <text x="770" y="670">Straits of Malacca corridor</text>
        </g>

        {/* 4. Historical Sea Labels */}
        <g fill="#6b7280" fontFamily="var(--font-sans)" textAnchor="middle">
          <text x="320" y="475" fontSize="13" fontWeight="600">Arabian Sea</text>
          <text x="780" y="495" fontSize="13" fontWeight="600">Bay of Bengal</text>
          <text x="540" y="670" fontSize="14" fontWeight="600">Indian Ocean</text>
        </g>

        {/* 5. Authoritative Subcontinental Outline Layer */}
        <g id="survey-of-india-authoritative-layer" filter="url(#indiaShadow)">
          <path
            d={INDIA_OUTLINE_SVG_PATH}
            fill="#ffffff"
            stroke="#1f2937"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {/* 6. Neighbouring Countries Subdued Typography */}
        <g fill="#9ca3af" fontFamily="var(--font-sans)" fontSize="11" fontWeight="500" opacity="0.8">
          {NEIGHBOURS.map(nbr => {
            const [nx, ny] = projectCoordinates(nbr.lon, nbr.lat);
            return (
              <text key={nbr.name} x={nx} y={ny} textAnchor="middle">
                {nbr.name}
              </text>
            );
          })}
        </g>

        {/* Sri Lanka Vector Island */}
        <ellipse
          cx="645"
          cy="615"
          rx="18"
          ry="26"
          fill="#ffffff"
          stroke="#4b5563"
          strokeWidth="1"
        />

        {/* ================================================================= */}
        {/* SIMULATION LAYER A: Trade Routes                                  */}
        {/* ================================================================= */}
        <g id="simulation-trade-routes">
          {ingredientStates.map(({ ing, state }) => {
            if (state.activeWaypoints.length < 2 || state.routeProgress <= 0) return null;

            const isSelected = selectedIngredient?.id === ing.id;
            const isTraveling = state.phase === 'traveling';
            const isWidespread = state.phase === 'widespread';
            const pathData = waypointsToPath(state.activeWaypoints);

            // Confidence dictates dash pattern
            const strokeDash =
              ing.confidence === 'high'
                ? 'none'
                : ing.confidence === 'medium'
                ? '5,4'
                : '2,3';

            // Electric blue accent on selection, otherwise restrained neutral tones
            const strokeColor = isSelected ? '#0066ff' : isTraveling ? '#374151' : '#9ca3af';
            const strokeWidth = isSelected ? 2.2 : isTraveling ? 1.2 : 0.75;
            const strokeOpacity = isSelected ? 1 : isTraveling ? 0.6 : isWidespread ? 0.22 : 0.35;

            return (
              <g
                key={`route-${ing.id}`}
                onClick={e => {
                  e.stopPropagation();
                  sound.playClick();
                  onSelectIngredient(ing);
                }}
                className="cursor-pointer"
              >
                {/* Glowing halo for selected active route */}
                {isSelected && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#0066ff"
                    strokeWidth="5"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Primary path stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  strokeDasharray={isSelected ? 'none' : strokeDash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </g>

        {/* ================================================================= */}
        {/* SIMULATION LAYER B: Regional Spread (Soft Rounded Washes)         */}
        {/* ================================================================= */}
        <g id="simulation-regional-spread">
          {ingredientStates.map(({ ing, state }) => {
            if (state.activeRegions.length === 0) return null;

            const isSelected = selectedIngredient?.id === ing.id;

            return (
              <g key={`regions-${ing.id}`}>
                {state.activeRegions.map(reg => {
                  const [cx, cy] = projectCoordinates(reg.coordinates[0], reg.coordinates[1]);
                  const span = 12 + reg.adoptionLevel * 14;

                  return (
                    <g
                      key={`region-${ing.id}-${reg.name}`}
                      onClick={e => {
                        e.stopPropagation();
                        sound.playClick();
                        onSelectIngredient(ing);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Soft rounded zone wash (no harsh square edges) */}
                      <rect
                        x={cx - span / 2}
                        y={cy - span / 2}
                        width={span}
                        height={span}
                        rx="8"
                        fill={isSelected ? '#0066ff' : '#111827'}
                        fillOpacity={isSelected ? 0.1 : 0.02 * reg.adoptionLevel}
                        stroke={isSelected ? '#0066ff' : '#4b5563'}
                        strokeWidth={isSelected ? 1.2 : 0.6}
                        strokeOpacity={isSelected ? 0.7 : 0.2 * reg.adoptionLevel}
                      />

                      {/* Delicate cross endpoint */}
                      <path
                        d={`M ${cx - 2.5} ${cy} L ${cx + 2.5} ${cy} M ${cx} ${cy - 2.5} L ${cx} ${cy + 2.5}`}
                        stroke={isSelected ? '#0066ff' : '#111827'}
                        strokeWidth="1"
                        strokeOpacity={isSelected ? 0.9 : 0.4 * reg.adoptionLevel}
                      />

                      {/* Region label on selection */}
                      {isSelected && (
                        <text
                          x={cx + 8}
                          y={cy + 3}
                          fontFamily="var(--font-sans)"
                          fontSize="10"
                          fill="#0066ff"
                          fontWeight="600"
                          className="pointer-events-none"
                        >
                          {reg.name.split('(')[0].trim()}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>

        {/* ================================================================= */}
        {/* SIMULATION LAYER C: Arrival Endpoints (Directional Movement Marks) */}
        {/* ================================================================= */}
        <g id="simulation-arrivals">
          {ingredientStates.map(({ ing, state }) => {
            if (state.phase !== 'arrived') return null;

            const [cx, cy] = projectCoordinates(state.entryCoords[0], state.entryCoords[1]);
            const isSelected = selectedIngredient?.id === ing.id;

            return (
              <g
                key={`arrival-${ing.id}`}
                onClick={e => {
                  e.stopPropagation();
                  sound.playClick();
                  onSelectIngredient(ing);
                }}
                className="cursor-pointer"
              >
                {/* Directional arrival cross indicator */}
                <path
                  d={`M ${cx - 5} ${cy} L ${cx + 5} ${cy} M ${cx} ${cy - 5} L ${cx} ${cy + 5}`}
                  stroke={isSelected ? '#0066ff' : '#111827'}
                  strokeWidth={isSelected ? 2 : 1.5}
                  strokeLinecap="round"
                />

                {/* Refined floating label in sentence case */}
                <g className="pointer-events-none">
                  <rect
                    x={cx + 8}
                    y={cy - 10}
                    width={ing.name.length * 6.5 + 46}
                    height="19"
                    rx="6"
                    fill="rgba(255, 255, 255, 0.92)"
                    stroke={isSelected ? '#0066ff' : 'rgba(0, 0, 0, 0.08)'}
                    strokeWidth={isSelected ? 1.2 : 0.8}
                  />
                  <text
                    x={cx + 13}
                    y={cy + 3.5}
                    fontFamily="var(--font-sans)"
                    fontSize="10.5"
                    fontWeight="600"
                    fill={isSelected ? '#0066ff' : '#111827'}
                  >
                    {ing.name} arrives
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* ================================================================= */}
        {/* SIMULATION LAYER D: Directional Food Movement Marks               */}
        {/* (Directional Dart / Arrowhead Rotated to Transit Vector)          */}
        {/* ================================================================= */}
        <g id="simulation-directional-particles">
          {ingredientStates.map(({ ing, state }) => {
            if (!state.particlePosition || state.phase !== 'traveling') return null;

            const [cx, cy] = projectCoordinates(
              state.particlePosition[0],
              state.particlePosition[1]
            );
            const isSelected = selectedIngredient?.id === ing.id;

            if (cx >= 40 && cx <= 1000 && cy >= 0 && cy <= 700) {
              const heading = getParticleHeading(state.activeWaypoints, state.particlePosition);

              return (
                <g
                  key={`particle-${ing.id}`}
                  onClick={e => {
                    e.stopPropagation();
                    sound.playClick();
                    onSelectIngredient(ing);
                  }}
                  className="cursor-pointer"
                >
                  {/* Directional Dart Particle */}
                  <g transform={`translate(${cx}, ${cy}) rotate(${heading})`}>
                    {/* Trailing wake dash mark */}
                    <line x1="-14" y1="0" x2="-8" y2="0" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2,2" strokeLinecap="round" />
                    {/* Center directional stroke */}
                    <line x1="-7" y1="0" x2="4" y2="0" stroke={isSelected ? '#0066ff' : '#111827'} strokeWidth={isSelected ? 2 : 1.5} strokeLinecap="round" />
                    {/* Directional arrowhead */}
                    <path
                      d="M 0,-3.5 L 4.5,0 L 0,3.5"
                      fill="none"
                      stroke={isSelected ? '#0066ff' : '#111827'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Refined floating pill label */}
                  <g className="pointer-events-none">
                    <rect
                      x={cx + 8}
                      y={cy - 10}
                      width={ing.name.length * 6.5 + 44}
                      height="19"
                      rx="6"
                      fill="rgba(255, 255, 255, 0.92)"
                      stroke={isSelected ? '#0066ff' : 'rgba(0, 0, 0, 0.08)'}
                      strokeWidth={isSelected ? 1.2 : 0.8}
                    />
                    <text
                      x={cx + 13}
                      y={cy + 3.5}
                      fontFamily="var(--font-sans)"
                      fontSize="10.5"
                      fontWeight="600"
                      fill={isSelected ? '#0066ff' : '#111827'}
                    >
                      {ing.name} ({Math.round(state.routeProgress * 100)}%)
                    </text>
                  </g>
                </g>
              );
            }

            return null;
          })}
        </g>

        {/* ================================================================= */}
        {/* SIMULATION LAYER E: Atlantic & Cape En-Route Manifest             */}
        {/* ================================================================= */}
        {offscreenTraveling.length > 0 && (
          <g id="offscreen-maritime-manifest" className="pointer-events-auto">
            {offscreenTraveling.slice(0, 4).map(({ ing, state }, idx) => {
              const isSelected = selectedIngredient?.id === ing.id;
              return (
                <g
                  key={`offscreen-${ing.id}`}
                  onClick={e => {
                    e.stopPropagation();
                    sound.playClick();
                    onSelectIngredient(ing);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x="15"
                    y={180 + idx * 26}
                    width="175"
                    height="21"
                    rx="8"
                    fill="rgba(255, 255, 255, 0.9)"
                    stroke={isSelected ? '#0066ff' : 'rgba(0, 0, 0, 0.06)'}
                    strokeWidth={isSelected ? 1.2 : 0.8}
                  />
                  <text
                    x="24"
                    y={194 + idx * 26}
                    fontFamily="var(--font-sans)"
                    fontSize="10.5"
                    fontWeight="600"
                    fill={isSelected ? '#0066ff' : '#111827'}
                  >
                    ← {ing.name} ({Math.round(state.routeProgress * 100)}%)
                  </text>
                </g>
              );
            })}

            {offscreenTraveling.length > 4 && (
              <g>
                <rect
                  x="15"
                  y={180 + 4 * 26}
                  width="175"
                  height="21"
                  rx="8"
                  fill="rgba(245, 246, 248, 0.9)"
                  stroke="rgba(0, 0, 0, 0.06)"
                  strokeWidth="0.8"
                />
                <text
                  x="24"
                  y={194 + 4 * 26}
                  fontFamily="var(--font-sans)"
                  fontSize="10"
                  fontWeight="500"
                  fill="#6b7280"
                >
                  + {offscreenTraveling.length - 4} more crossing Atlantic
                </text>
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Understated Reference Notice (Bottom Left) */}
      <div className="fixed bottom-24 left-4 sm:left-6 z-10 hidden sm:block text-[11px] font-sans font-medium text-neutral-400 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-black/[0.04]">
        Survey of India cartographic outline · 150 historical records
      </div>
    </div>
  );
}
