'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState } from '@/utils/simulationEngine';
import { INDIA_OUTLINE_SVG_PATH, projectCoordinates } from '@/data/indiaOutlineSvg';
import { sound } from '@/utils/sound';
import CompassRose from '@/components/CompassRose';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface FoodMapProps {
  ingredients: FoodIngredient[];
  currentYear: number;
  selectedIngredient: FoodIngredient | null;
  onSelectIngredient: (ingredient: FoodIngredient) => void;
  flyToCoords?: [number, number] | null;
}

// Subdued neighbouring countries with sentence-case labels
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
    // Only drag with left mouse button and not on interactive SVG children
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
    // Find the closest active segment
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const [x1, y1] = projectCoordinates(p1[0], p1[1]);
      const [x2, y2] = projectCoordinates(p2[0], p2[1]);
      const [px, py] = projectCoordinates(particlePos[0], particlePos[1]);

      // Check if particle is approximately on or near this segment
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
      className="fixed inset-0 w-full h-full overflow-hidden select-none bg-[#f5f5f5]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      role="application"
      aria-label="Historical cartographic canvas"
    >
      {/* Precision Mechanical Map Viewport Controls (Top Right) */}
      <div className="fixed top-20 left-4 z-20 flex flex-col space-y-1.5">
        <button
          onClick={() => handleZoom(0.25)}
          onMouseEnter={() => sound.playHover()}
          className="btn-mechanical btn-mechanical-icon"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4 text-neutral-900" />
        </button>
        <button
          onClick={() => handleZoom(-0.25)}
          onMouseEnter={() => sound.playHover()}
          className="btn-mechanical btn-mechanical-icon"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4 text-neutral-900" />
        </button>
        <button
          onClick={handleResetView}
          onMouseEnter={() => sound.playHover()}
          className="btn-mechanical btn-mechanical-icon"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="h-4 w-4 text-neutral-900" />
        </button>
      </div>

      {/* Cartographic Compass Rose Instrument (Top Right, Understated) */}
      <div className="pointer-events-none fixed top-20 right-6 z-10 hidden sm:block">
        <CompassRose />
      </div>

      {/* Primary Editorial Cartographic Canvas (SVG) */}
      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
          transition: isDragging ? 'none' : 'transform 0.12s ease-out',
        }}
      >
        <defs>
          {/* Subtle neutral background surface */}
          <rect id="viewportBackground" x="-300" y="-200" width="1600" height="1100" fill="#f5f5f5" />
        </defs>

        {/* 1. Base Sea / Land Surface (0% Saturation Neutral #f5f5f5) */}
        <use href="#viewportBackground" />

        {/* 2. Precision Graticule Lines (Clean neutral hairline grid) */}
        <g stroke="#dddddd" strokeWidth="0.6" strokeDasharray="3,3" opacity="0.8">
          <line x1="100" y1="-200" x2="100" y2="900" />
          <line x1="300" y1="-200" x2="300" y2="900" />
          <line x1="500" y1="-200" x2="500" y2="900" />
          <line x1="700" y1="-200" x2="700" y2="900" />
          <line x1="900" y1="-200" x2="900" y2="900" />
          <line x1="-300" y1="150" x2="1300" y2="150" />
          <line x1="-300" y1="350" x2="1300" y2="350" />
          <line x1="-300" y1="550" x2="1300" y2="550" />
        </g>

        {/* 3. Maritime Corridors (Understated natural sentence case) */}
        <g fill="#777777" fontFamily="'Timeless Sans', sans-serif" fontSize="10" opacity="0.85">
          <text x="35" y="660">Atlantic and Cape route corridor</text>
          <text x="35" y="320">Red Sea and Arabian maritime conduit</text>
          <text x="770" y="670">Straits of Malacca corridor</text>
        </g>

        {/* 4. Historical Sea Labels (Natural sentence case, Timeless font, neutral) */}
        <g fill="#555555" fontFamily="'Timeless Sans', sans-serif" textAnchor="middle">
          <text x="320" y="475" fontSize="13" fontWeight="600">Arabian Sea</text>
          <text x="780" y="495" fontSize="13" fontWeight="600">Bay of Bengal</text>
          <text x="540" y="670" fontSize="14" fontWeight="600">Indian Ocean</text>
        </g>

        {/* 5. Authoritative Survey of India Outline Vector Layer (Preserved Exact Geometry) */}
        <g id="survey-of-india-authoritative-layer">
          {/* Subtle clean boundary casing */}
          <path
            d={INDIA_OUTLINE_SVG_PATH}
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {/* 6. Neighbouring Countries Subdued Engraved Typography (Sentence case, restrained) */}
        <g fill="#777777" fontFamily="'Timeless Sans', sans-serif" fontSize="11" fontWeight="500" opacity="0.8">
          {NEIGHBOURS.map(nbr => {
            const [nx, ny] = projectCoordinates(nbr.lon, nbr.lat);
            return (
              <text key={nbr.name} x={nx} y={ny} textAnchor="middle">
                {nbr.name}
              </text>
            );
          })}
        </g>

        {/* Sri Lanka Vector Island (Neutral outline) */}
        <ellipse
          cx="645"
          cy="615"
          rx="18"
          ry="26"
          fill="#ffffff"
          stroke="#333333"
          strokeWidth="1.2"
        />

        {/* ================================================================= */}
        {/* SIMULATION LAYER A: Trade Routes (Thin Neutral Grayscale)         */}
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

            // Neutral grayscale stroke values
            const strokeColor = isSelected ? '#111111' : isTraveling ? '#333333' : '#777777';
            const strokeWidth = isSelected ? 1.8 : isTraveling ? 1.2 : 0.8;
            const strokeOpacity = isSelected ? 0.95 : isTraveling ? 0.65 : isWidespread ? 0.25 : 0.4;

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
                {/* Clean path stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </g>

        {/* ================================================================= */}
        {/* SIMULATION LAYER B: Regional Spread (Subtle Mechanical Hatching)  */}
        {/* ================================================================= */}
        <g id="simulation-regional-spread">
          {ingredientStates.map(({ ing, state }) => {
            if (state.activeRegions.length === 0) return null;

            const isSelected = selectedIngredient?.id === ing.id;

            const borderDash =
              ing.confidence === 'high'
                ? 'none'
                : ing.confidence === 'medium'
                ? '3,3'
                : '1.5,2.5';

            return (
              <g key={`regions-${ing.id}`}>
                {state.activeRegions.map(reg => {
                  const [cx, cy] = projectCoordinates(reg.coordinates[0], reg.coordinates[1]);
                  const span = 10 + reg.adoptionLevel * 14;

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
                      {/* Subtle neutral zone wash */}
                      <rect
                        x={cx - span / 2}
                        y={cy - span / 2}
                        width={span}
                        height={span}
                        rx="2"
                        fill="#111111"
                        fillOpacity={isSelected ? 0.12 : 0.03 * reg.adoptionLevel}
                        stroke="#222222"
                        strokeWidth={isSelected ? 1.2 : 0.6}
                        strokeDasharray={borderDash}
                        strokeOpacity={isSelected ? 0.8 : 0.25 * reg.adoptionLevel}
                      />

                      {/* Tiny regional cross mark (NO circular dot!) */}
                      <path
                        d={`M ${cx - 2.5} ${cy} L ${cx + 2.5} ${cy} M ${cx} ${cy - 2.5} L ${cx} ${cy + 2.5}`}
                        stroke="#111111"
                        strokeWidth="1"
                        strokeOpacity={isSelected ? 0.9 : 0.45 * reg.adoptionLevel}
                      />

                      {/* Region label on selection */}
                      {isSelected && (
                        <text
                          x={cx + 8}
                          y={cy + 3}
                          fontFamily="'Timeless Sans', sans-serif"
                          fontSize="10"
                          fill="#111111"
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
        {/* SIMULATION LAYER C: Arrival Footholds (Tiny Square Herald)        */}
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
                {/* Outer square herald framing */}
                <rect
                  x={cx - 6}
                  y={cy - 6}
                  width="12"
                  height="12"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.2"
                  strokeOpacity={isSelected ? 1 : 0.75}
                />
                {/* Center square core mark */}
                <rect
                  x={cx - 2.5}
                  y={cy - 2.5}
                  width="5"
                  height="5"
                  fill="#111111"
                />

                {/* Arrival label in clean sentence case */}
                <g className="pointer-events-none">
                  <rect
                    x={cx + 9}
                    y={cy - 9}
                    width={ing.name.length * 6 + 50}
                    height="17"
                    rx="2"
                    fill="#ffffff"
                    stroke="#111111"
                    strokeWidth="0.8"
                  />
                  <text
                    x={cx + 14}
                    y={cy + 3}
                    fontFamily="'Timeless Sans', sans-serif"
                    fontSize="10"
                    fontWeight="600"
                    fill="#111111"
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

            // Only render if within canvas boundaries
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
                  {/* Directional Dart Particle (No circular beads!) */}
                  <g transform={`translate(${cx}, ${cy}) rotate(${heading})`}>
                    {/* Trailing wake dash mark */}
                    <line x1="-14" y1="0" x2="-8" y2="0" stroke="#777777" strokeWidth="1" strokeDasharray="2,2" />
                    {/* Center directional stroke */}
                    <line x1="-7" y1="0" x2="4" y2="0" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Directional arrowhead */}
                    <path
                      d="M 1,-3 L 4.5,0 L 1,3"
                      fill="none"
                      stroke="#111111"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Clean editorial label in sentence case */}
                  <g className="pointer-events-none">
                    <rect
                      x={cx + 8}
                      y={cy - 10}
                      width={ing.name.length * 6 + 48}
                      height="17"
                      rx="2"
                      fill="#ffffff"
                      stroke="#111111"
                      strokeWidth="0.8"
                    />
                    <text
                      x={cx + 12}
                      y={cy + 2}
                      fontFamily="'Timeless Sans', sans-serif"
                      fontSize="10"
                      fontWeight="600"
                      fill="#111111"
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
            {offscreenTraveling.slice(0, 4).map(({ ing, state }, idx) => (
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
                  y={180 + idx * 24}
                  width="170"
                  height="19"
                  rx="2"
                  fill="#ffffff"
                  stroke="#222222"
                  strokeWidth="0.8"
                />
                <text
                  x="22"
                  y={193 + idx * 24}
                  fontFamily="'Timeless Sans', sans-serif"
                  fontSize="10"
                  fontWeight="600"
                  fill="#111111"
                >
                  ← {ing.name} en route ({Math.round(state.routeProgress * 100)}%)
                </text>
              </g>
            ))}

            {offscreenTraveling.length > 4 && (
              <g>
                <rect
                  x="15"
                  y={180 + 4 * 24}
                  width="170"
                  height="19"
                  rx="2"
                  fill="#eeeeee"
                  stroke="#555555"
                  strokeWidth="0.8"
                />
                <text
                  x="22"
                  y={193 + 4 * 24}
                  fontFamily="'Timeless Sans', sans-serif"
                  fontSize="9.5"
                  fontWeight="500"
                  fill="#333333"
                >
                  + {offscreenTraveling.length - 4} more crossing Atlantic
                </text>
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Understated Survey of India Reference Notice (Bottom Left) */}
      <div className="fixed bottom-24 left-4 z-10 hidden sm:block text-[11px] font-medium text-neutral-600 bg-white/80 px-2 py-0.5 rounded border border-neutral-300">
        Survey of India official boundary reference · 150 historical records
      </div>
    </div>
  );
}
