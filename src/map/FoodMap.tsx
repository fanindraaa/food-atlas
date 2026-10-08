'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { FoodIngredient } from '@/types/simulation';
import { getIngredientState } from '@/utils/simulationEngine';
import { INDIA_OUTLINE_SVG_PATH, projectCoordinates } from '@/data/indiaOutlineSvg';
import { sound } from '@/utils/sound';
import CompassRose from '@/components/CompassRose';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { computeIngredientMarkerLayout, LayoutMarkerItem } from './layoutEngine';

interface FoodMapProps {
  ingredients: FoodIngredient[];
  currentYear: number;
  selectedIngredient: FoodIngredient | null;
  onSelectIngredient: (ingredient: FoodIngredient) => void;
  flyToCoords?: [number, number] | null;
}

// Subdued neighbouring countries with clean typography
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
  const hasDraggedRef = useRef(false);

  // Hover state for interactive ingredient markers
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    hasDraggedRef.current = true;
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
  const ingredientStates = useMemo(() => {
    return ingredients.map(ing => ({
      ing,
      state: getIngredientState(ing, currentYear),
    }));
  }, [ingredients, currentYear]);

  // Compute collision-free, screen-space non-overlapping layout for all visible ingredient markers
  const markerLayout = useMemo(() => {
    return computeIngredientMarkerLayout({
      ingredientStates,
      zoom,
      selectedIngredientId: selectedIngredient?.id ?? null,
    });
  }, [ingredientStates, zoom, selectedIngredient?.id]);

  // Map of placed marker items by id for quick lookup
  const markerMap = useMemo(() => {
    const map = new Map<string, LayoutMarkerItem>();
    for (const item of markerLayout) {
      map.set(item.id, item);
    }
    return map;
  }, [markerLayout]);

  // Traveling offscreen ingredients crossing Atlantic / Cape corridor
  const offscreenTraveling = useMemo(() => {
    return ingredientStates.filter(({ state }) => {
      if (state.phase !== 'traveling' || !state.particlePosition) return false;
      const [cx] = projectCoordinates(state.particlePosition[0], state.particlePosition[1]);
      return cx < 35;
    });
  }, [ingredientStates]);

  // Separate markers for layered rendering so selected & hovered always sit on top
  const { normalMarkers, elevatedMarkers } = useMemo(() => {
    const normal: LayoutMarkerItem[] = [];
    const elevated: LayoutMarkerItem[] = [];

    for (const item of markerLayout) {
      if (item.isSelected || item.id === hoveredId) {
        elevated.push(item);
      } else {
        normal.push(item);
      }
    }

    return { normalMarkers: normal, elevatedMarkers: elevated };
  }, [markerLayout, hoveredId]);

  // Active item for floating label (hovered takes precedence, or selected)
  const activeLabelItem = useMemo(() => {
    if (hoveredId && markerMap.has(hoveredId)) {
      return markerMap.get(hoveredId)!;
    }
    if (selectedIngredient && markerMap.has(selectedIngredient.id)) {
      return markerMap.get(selectedIngredient.id)!;
    }
    return null;
  }, [hoveredId, selectedIngredient, markerMap]);

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
          transition: isDragging ? 'none' : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <defs>
          <rect id="viewportBackground" x="-300" y="-200" width="1600" height="1100" fill="#f6f7f9" />
          
          <filter id="indiaShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.04" />
          </filter>

          {/* Diffuse soft shadow for circular ingredient specimen markers */}
          <filter id="markerShadow" x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.05" />
          </filter>

          {/* Elevated shadow on hover */}
          <filter id="markerHoverShadow" x="-45%" y="-45%" width="190%" height="190%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="4" floodColor="#000000" floodOpacity="0.12" />
            <feDropShadow dx="0" dy="7" stdDeviation="10" floodColor="#000000" floodOpacity="0.08" />
          </filter>

          {/* Selected marker elevated shadow with crisp bright blue accent glow */}
          <filter id="markerSelectedShadow" x="-45%" y="-45%" width="190%" height="190%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.10" />
            <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#0066ff" floodOpacity="0.25" />
          </filter>

          {/* Pill floating label soft shadow */}
          <filter id="labelShadow" x="-25%" y="-35%" width="150%" height="170%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* ----------------------------------------------------------------- */}
        {/* LEVEL 1: GEOGRAPHY (Base Sea / Land Surface & Graticule)          */}
        {/* ----------------------------------------------------------------- */}
        <use href="#viewportBackground" />

        {/* Precision Graticule Lines (Delicate neutral hairline grid) */}
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

        {/* Maritime Corridors */}
        <g fill="#9ca3af" fontFamily="var(--font-sans)" fontSize="10" opacity="0.8">
          <text x="35" y="660">Atlantic and Cape route corridor</text>
          <text x="35" y="320">Red Sea and Arabian maritime conduit</text>
          <text x="770" y="670">Straits of Malacca corridor</text>
        </g>

        {/* Historical Sea Labels */}
        <g fill="#6b7280" fontFamily="var(--font-sans)" textAnchor="middle">
          <text x="320" y="475" fontSize="13" fontWeight="600">Arabian Sea</text>
          <text x="780" y="495" fontSize="13" fontWeight="600">Bay of Bengal</text>
          <text x="540" y="670" fontSize="14" fontWeight="600">Indian Ocean</text>
        </g>

        {/* Authoritative Subcontinental Outline Layer */}
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

        {/* Neighbouring Countries Subdued Typography */}
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

        {/* ----------------------------------------------------------------- */}
        {/* LEVEL 2: HISTORICAL TRADE ROUTES (Leading to Ingredient Images)   */}
        {/* ----------------------------------------------------------------- */}
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

            // Restrained neutral tones for general routes, bright blue accent ONLY for selected
            const strokeColor = isSelected ? '#0066ff' : isTraveling ? '#374151' : '#9ca3af';
            const strokeWidth = isSelected ? 2.2 : isTraveling ? 1.2 : 0.75;
            const strokeOpacity = isSelected ? 1 : isTraveling ? 0.6 : isWidespread ? 0.2 : 0.32;

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
                    strokeOpacity="0.22"
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

        {/* ----------------------------------------------------------------- */}
        {/* LEVEL 2B: REGIONAL DIFFUSION FOR SELECTED INGREDIENT              */}
        {/* Soft subtle circular halos (no harsh square boxes or "+" marks)   */}
        {/* ----------------------------------------------------------------- */}
        {selectedIngredient && (
          <g id="simulation-selected-regional-diffusion">
            {(() => {
              const selectedState = ingredientStates.find(s => s.ing.id === selectedIngredient.id)?.state;
              if (!selectedState || selectedState.activeRegions.length === 0) return null;

              return selectedState.activeRegions.map(reg => {
                const [cx, cy] = projectCoordinates(reg.coordinates[0], reg.coordinates[1]);
                const radius = 10 + reg.adoptionLevel * 12;

                return (
                  <g key={`diff-${selectedIngredient.id}-${reg.name}`} className="pointer-events-none">
                    {/* Soft ambient diffusion wash */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="#0066ff"
                      fillOpacity={0.06 * reg.adoptionLevel}
                      stroke="#0066ff"
                      strokeWidth="0.9"
                      strokeOpacity={0.35 * reg.adoptionLevel}
                      strokeDasharray="2,3"
                    />
                    {/* Regional name label */}
                    <text
                      x={cx}
                      y={cy + radius + 11}
                      textAnchor="middle"
                      fontFamily="var(--font-sans)"
                      fontSize="9.5"
                      fontWeight="600"
                      fill="#0066ff"
                      opacity={0.85}
                    >
                      {reg.name.split('(')[0].trim()}
                    </text>
                  </g>
                );
              });
            })()}
          </g>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* LEVEL 2C: SUBTLE CONNECTORS & ANCHORS FOR DISPLACED MARKERS       */}
        {/* Thin neutral line, low opacity, no arrowheads, no heavy weight    */}
        {/* ----------------------------------------------------------------- */}
        <g id="simulation-connectors" className="pointer-events-none">
          {markerLayout.map(item => {
            if (!item.displaced) return null;
            const isHovered = item.id === hoveredId;

            return (
              <g key={`conn-${item.id}`}>
                {/* Thin neutral connector line linking geographic anchor to visual marker */}
                <line
                  x1={item.anchorX}
                  y1={item.anchorY}
                  x2={item.x}
                  y2={item.y}
                  stroke={item.isSelected ? '#0066ff' : '#9ca3af'}
                  strokeWidth={item.isSelected ? 1.2 : isHovered ? 0.9 : 0.65}
                  strokeDasharray={item.isSelected ? 'none' : '2,2'}
                  strokeOpacity={item.isSelected ? 0.75 : isHovered ? 0.55 : 0.25}
                  style={{
                    transition: 'all 650ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />

                {/* Delicate tiny anchor origin mark */}
                <circle
                  cx={item.anchorX}
                  cy={item.anchorY}
                  r={item.isSelected ? 2.2 : 1.4}
                  fill={item.isSelected ? '#0066ff' : '#9ca3af'}
                  fillOpacity={item.isSelected ? 0.85 : 0.45}
                />
              </g>
            );
          })}
        </g>

        {/* ----------------------------------------------------------------- */}
        {/* LEVEL 3: INGREDIENT SPECIMEN MARKERS (The defining visual heroes) */}
        {/* ----------------------------------------------------------------- */}
        <g id="simulation-ingredient-markers">
          {/* Render normal unselected markers first */}
          {normalMarkers.map(item => renderMarker(item, false, false))}

          {/* Render hovered or selected markers on top so they remain visually dominant */}
          {elevatedMarkers.map(item => {
            const isSelected = item.isSelected;
            const isHovered = item.id === hoveredId;
            return renderMarker(item, isSelected, isHovered);
          })}
        </g>

        {/* ----------------------------------------------------------------- */}
        {/* FLOATING CONNECTED LABELS (Hover & Selected States)               */}
        {/* Rendered on the topmost layer for pristine clarity                */}
        {/* ----------------------------------------------------------------- */}
        {activeLabelItem && (
          <g id="simulation-active-label" className="pointer-events-none select-none">
            {renderFloatingLabel(activeLabelItem)}
          </g>
        )}


      </svg>

      {/* Understated Reference Notice (Bottom Left) */}
      <div className="fixed bottom-24 left-4 sm:left-6 z-10 hidden sm:block text-[11px] font-sans font-medium text-neutral-400 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-black/[0.04]">
        Survey of India cartographic outline · 150 historical records
      </div>
    </div>
  );

  /**
   * Helper to render an individual circular ingredient marker
   */
  function renderMarker(item: LayoutMarkerItem, isSelected: boolean, isHovered: boolean) {
    const r = isSelected
      ? item.radius * 1.18
      : isHovered
      ? item.radius * 1.08
      : item.radius;

    const imagePadding = Math.max(1.5, r * 0.12);
    const imageSize = (r - imagePadding) * 2;
    const hitR = Math.max(r, item.hitRadius);

    return (
      <g
        key={`marker-${item.id}`}
        transform={`translate(${item.x}, ${item.y})`}
        onClick={e => {
          e.stopPropagation();
          if (hasDraggedRef.current) return;
          sound.playClick();
          onSelectIngredient(item.ingredient);
        }}
        onMouseEnter={() => {
          setHoveredId(item.id);
          sound.playHover();
        }}
        onMouseLeave={() => setHoveredId(null)}
        className="cursor-pointer"
        style={{
          opacity: isHovered || isSelected ? 1.0 : item.opacity,
          transition: isDragging
            ? 'none'
            : 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease-out',
        }}
        aria-label={`${item.name} (${item.category})`}
        role="button"
      >
        {/* Generous invisible hit target circle for effortless interaction on small markers */}
        <circle r={hitR} fill="transparent" pointerEvents="all" />

        <circle
          r={r}
          fill="#ffffff"
          stroke={
            isSelected
              ? '#0066ff'
              : isHovered
              ? '#374151'
              : 'rgba(0, 0, 0, 0.08)'
          }
          strokeWidth={isSelected ? 2 : isHovered ? 1.1 : 0.75}
          filter={
            isSelected
              ? 'url(#markerSelectedShadow)'
              : isHovered
              ? 'url(#markerHoverShadow)'
              : 'url(#markerShadow)'
          }
          style={{
            transition: 'r 650ms cubic-bezier(0.22, 1, 0.36, 1), stroke 300ms ease, stroke-width 300ms ease',
          }}
        />

        {/* Circular crop boundary for the transparent illustration */}
        <clipPath id={`clip-${item.id}`}>
          <circle
            r={r - imagePadding}
            cx="0"
            cy="0"
            style={{
              transition: 'r 650ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </clipPath>

        {/* Actual transparent botanical ingredient illustration */}
        {item.illustration ? (
          <image
            href={item.illustration}
            x={-(r - imagePadding)}
            y={-(r - imagePadding)}
            width={imageSize}
            height={imageSize}
            clipPath={`url(#clip-${item.id})`}
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none"
            style={{
              transition: 'all 650ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        ) : (
          /* Editorial fallback if illustration missing */
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="9"
            fontWeight="600"
            fill="#4b5563"
            className="pointer-events-none"
          >
            {item.name.slice(0, 2).toUpperCase()}
          </text>
        )}
      </g>
    );
  }

  /**
   * Helper to render floating card wrapping all text inside the container
   */
  function renderFloatingLabel(item: LayoutMarkerItem) {
    const isSelected = item.isSelected;
    const isHovered = item.id === hoveredId;
    const r = isSelected
      ? item.radius * 1.18
      : isHovered
      ? item.radius * 1.08
      : item.radius;

    // Helper to wrap long text strings into clean multiple lines
    function wrapText(text: string, maxCharsPerLine: number = 28): string[] {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        if (!currentLine) {
          currentLine = word;
        } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    }

    // Compute contextual subtitle text
    let subtitle = '';
    if (item.isTraveling) {
      subtitle = `${Math.round(item.state.routeProgress * 100)}% transit`;
    } else if (isSelected) {
      subtitle = `${item.category} · ${item.state.statusTitle.split('·')[0].trim()}`;
    }

    // Split title and subtitle into wrapped lines
    const titleLines = wrapText(item.name, 24);
    const subtitleLines = subtitle ? wrapText(subtitle, 28) : [];

    // Measure character widths to dynamically size the container
    const maxTitleWidth = Math.max(...titleLines.map(l => l.length * 6.3), 0);
    const maxSubtitleWidth = subtitleLines.length > 0
      ? Math.max(...subtitleLines.map(l => l.length * 4.9), 0)
      : 0;

    const contentWidth = Math.max(maxTitleWidth, maxSubtitleWidth, 64);
    const cardWidth = Math.round(contentWidth + 28); // 14px horizontal padding on each side

    const titleLineHeight = 14;
    const subtitleLineHeight = 11.5;
    const gap = subtitleLines.length > 0 ? 3.5 : 0;
    const padY = 7.5;

    const totalContentHeight =
      titleLines.length * titleLineHeight +
      gap +
      subtitleLines.length * subtitleLineHeight;

    const cardHeight = Math.round(totalContentHeight + padY * 2);
    const rx = subtitleLines.length > 0 ? 10 : Math.min(12, Math.round(cardHeight / 2));

    // Position above circle if space allows, otherwise below
    const placeAbove = item.y > cardHeight + r + 15;
    const labelY = placeAbove
      ? item.y - (r + cardHeight / 2 + 8)
      : item.y + (r + cardHeight / 2 + 8);

    const startY = -cardHeight / 2 + padY;
    const subStartY = startY + titleLines.length * titleLineHeight + gap;

    return (
      <g
        transform={`translate(${item.x}, ${labelY})`}
        style={{
          transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease-out',
        }}
      >
        {/* Soft rounded card surface that fully contains all wrapped text */}
        <rect
          x={-cardWidth / 2}
          y={-cardHeight / 2}
          width={cardWidth}
          height={cardHeight}
          rx={rx}
          fill="rgba(255, 255, 255, 0.96)"
          stroke={isSelected ? '#0066ff' : 'rgba(0, 0, 0, 0.08)'}
          strokeWidth={isSelected ? 1.2 : 0.75}
          filter="url(#labelShadow)"
        />

        {/* Primary ingredient name lines */}
        {titleLines.map((line, idx) => (
          <text
            key={`title-${idx}`}
            x="0"
            y={startY + (idx + 0.78) * titleLineHeight}
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="10.5"
            fontWeight="600"
            fill={isSelected ? '#0066ff' : '#111827'}
          >
            {line}
          </text>
        ))}

        {/* Contextual subtitle lines wrapped completely inside container */}
        {subtitleLines.map((line, idx) => (
          <text
            key={`sub-${idx}`}
            x="0"
            y={subStartY + (idx + 0.78) * subtitleLineHeight}
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="8.5"
            fontWeight="500"
            fill="#4b5563"
          >
            {line}
          </text>
        ))}
      </g>
    );
  }
}
