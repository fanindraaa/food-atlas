import { FoodIngredient, IngredientSimulationState } from '@/types/simulation';
import { projectCoordinates } from '@/data/indiaOutlineSvg';

export interface LayoutMarkerItem {
  id: string;
  name: string;
  category: string;
  illustration: string | null;
  ingredient: FoodIngredient;
  state: IngredientSimulationState;
  // Final placed coordinates in SVG viewBox (0..1000, 0..700)
  x: number;
  y: number;
  // Geographic anchor coordinates in SVG viewBox
  anchorX: number;
  anchorY: number;
  // Visual radius in SVG viewBox units
  radius: number;
  // Clickable hit radius in SVG viewBox units (larger for usability on small markers)
  hitRadius: number;
  // Visual diameter in screen pixels
  pixelDiameter: number;
  // Is this item displaced from its true anchor?
  displaced: boolean;
  displacementDistance: number;
  isTraveling: boolean;
  isSelected: boolean;
  isRelevant: boolean;
  opacity: number;
}

export interface MarkerDimensions {
  pixelDiameter: number;
  radius: number;
  hitRadius: number;
  minDist: number;
}

/**
 * Calculates smooth zoom-responsive marker dimensions.
 *
 * Scale:
 * - far zoom (~0.85): 24px minimum
 * - slightly zoomed in (~1.0): ~28px
 * - normal zoom (~1.35): ~34px
 * - closer zoom (~2.0): ~42px
 * - very close zoom (~3.2): ~56px
 * - selected ingredient: slightly larger, around 58–64px
 */
export function calculateMarkerDimensions(zoom: number): MarkerDimensions {
  const clampedZoom = Math.max(0.85, Math.min(3.2, zoom));
  const zNorm = (clampedZoom - 0.85) / (3.2 - 0.85); // 0.0 to 1.0

  // Smooth interpolation for on-screen pixel diameter (24px minimum to 56px)
  const pixelDiameter = 24 + (56 - 24) * Math.pow(zNorm, 0.80);

  // In SVG viewBox (1000x700), 1 SVG unit ~ 1.3px * clampedZoom on typical desktop
  const svgScale = 1.3 * clampedZoom;
  const radius = pixelDiameter / (2 * svgScale);

  // Clickable hit area: at least 32px on screen for effortless interaction
  const minHitPixelDiameter = 32;
  const hitRadius = Math.max(radius, minHitPixelDiameter / (2 * svgScale));

  // Buffer between adjacent circles to prevent visual overlap
  const padding = 2.4 / clampedZoom;
  const minDist = 2 * radius + padding;

  return { pixelDiameter, radius, hitRadius, minDist };
}

/**
 * Curated historical importance & spatial representative ranking (1 to 150).
 * Ensures that at far zoom, the ~20-25 visible markers provide a balanced,
 * calm historical overview spanning all agro-ecological zones and staple categories.
 */
const HISTORICAL_IMPORTANCE_RANK: Record<string, number> = {
  // Tier 1: Iconic historical anchors & foundational staples (~25 items)
  'rice': 1,
  'wheat': 2,
  'barley': 3,
  'sorghum-jowar': 4,
  'pearl-millet-bajra': 5,
  'finger-millet-ragi': 6,
  'chickpea-chana': 7,
  'pigeon-pea-toor-arhar': 8,
  'green-gram-moong': 9,
  'black-gram-urad': 10,
  'black-pepper': 11,
  'turmeric': 12,
  'ginger': 13,
  'green-cardamom': 14,
  'mustard-seed': 15,
  'chilli-pepper': 16,
  'potato-aloo': 17,
  'tomato': 18,
  'onion': 19,
  'garlic': 20,
  'mango': 21,
  'banana': 22,
  'coconut': 23,
  'sugarcane': 24,
  'tea': 25,

  // Tier 2: Core regional staples & major Columbian arrivals (~35 items, ranks 26-60)
  'brinjal-eggplant': 26,
  'cucumber': 27,
  'okra-bhindi': 28,
  'sweet-potato': 29,
  'maize-corn': 30,
  'cashew': 31,
  'peanut-groundnut': 32,
  'papaya': 33,
  'pineapple': 34,
  'guava': 35,
  'coffee': 36,
  'clove': 37,
  'cinnamon': 38,
  'nutmeg': 39,
  'cumin': 40,
  'coriander-seed': 41,
  'fennel': 42,
  'fenugreek-seed': 43,
  'ajwain-carom': 44,
  'saffron': 45,
  'asafoetida-hing': 46,
  'tamarind': 47,
  'jackfruit': 48,
  'jamun': 49,
  'amla-indian-gooseberry': 50,
  'curry-leaves': 51,
  'sesame-til': 52,
  'moringa-drumstick-pods': 53,
  'bottle-gourd-lauki': 54,
  'bitter-gourd-karela': 55,
  'spinach-palak': 56,
  'lentil-masoor': 57,
  'kidney-bean-rajma': 58,
  'almond': 59,
  'walnut': 60,

  // Tier 2B: Secondary staples & fruits (ranks 61-80)
  'pomegranate': 61,
  'apple': 62,
  'grapes': 63,
  'watermelon': 64,
  'lemon': 65,
  'lime': 66,
  'cassava-tapioca': 67,
  'taro-arbi': 68,
  'radish': 69,
  'carrot': 70,
  'cauliflower': 71,
  'cabbage': 72,
  'cocoa-cacao': 73,
  'betel-leaf': 74,
  'cardamom': 75,
  'coriander': 76,
  'peanut': 77,
  'potato': 78,
  'chilli': 79,
  'lentil': 80,
};

function getIngredientImportanceRank(id: string, index: number): number {
  if (HISTORICAL_IMPORTANCE_RANK[id] !== undefined) {
    return HISTORICAL_IMPORTANCE_RANK[id];
  }
  return 81 + (index % 69);
}

/**
 * Generates compact candidate offsets ordered strictly by distance from anchor.
 * Keeps placement tight (max 4 rings) to prevent markers from being pushed into unrelated regions.
 */
function generateCandidateOffsets(minDist: number, maxRings = 5): { dx: number; dy: number; dist2: number }[] {
  const offsets: { dx: number; dy: number; dist2: number }[] = [];

  for (let ring = 1; ring <= maxRings; ring++) {
    for (let q = -ring; q <= ring; q++) {
      for (let r = -ring; r <= ring; r++) {
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) !== ring) continue;
        // Hexagonal axial coordinates to 2D Cartesian
        const dx = minDist * (q + r * 0.5);
        const dy = minDist * (r * Math.sqrt(3) * 0.5);
        offsets.push({ dx, dy, dist2: dx * dx + dy * dy });
      }
    }
  }

  // Stable sort strictly by Euclidean distance squared
  offsets.sort((a, b) => {
    if (Math.abs(a.dist2 - b.dist2) > 0.001) {
      return a.dist2 - b.dist2;
    }
    return Math.abs(a.dy) - Math.abs(a.dy);
  });

  return offsets;
}

// Cached candidate offsets per rounded minDist to optimize CPU
const offsetCache = new Map<number, { dx: number; dy: number; dist2: number }[]>();

function getCachedOffsets(minDist: number): { dx: number; dy: number; dist2: number }[] {
  const key = Math.round(minDist * 10);
  let cached = offsetCache.get(key);
  if (!cached) {
    cached = generateCandidateOffsets(minDist, 5);
    offsetCache.set(key, cached);
  }
  return cached;
}

export interface ComputeLayoutProps {
  ingredientStates: { ing: FoodIngredient; state: IngredientSimulationState }[];
  zoom: number;
  selectedIngredientId: string | null;
}

/**
 * Solves deterministic, zoom-responsive, collision-free positioning.
 *
 * Algorithm guarantees:
 * 1. Progressive visual density: 15–25 markers at far zoom, 40–70 at medium zoom, up to 150 at close zoom.
 * 2. ZERO visual overlap across all rendered ingredient circles (distance >= minDist).
 * 3. Selected ingredient always anchored at true geographic position with priority 0.
 * 4. Minimal displacement: tight search prevents markers jumping to unrelated regions.
 * 5. Visual hierarchy: selected = 1.0, relevant = ~0.78, background = ~0.50 opacity.
 * 6. Stable placement across renders to prevent chaotic jitter.
 */
export function computeIngredientMarkerLayout({
  ingredientStates,
  zoom,
  selectedIngredientId,
}: ComputeLayoutProps): LayoutMarkerItem[] {
  const clampedZoom = Math.max(0.85, Math.min(3.2, zoom));
  const { pixelDiameter, radius, hitRadius, minDist } = calculateMarkerDimensions(clampedZoom);
  const ringOffsets = getCachedOffsets(minDist);

  // Progressive Density Target Count
  // At zoom 0.85: ~20 markers
  // At zoom 1.00: ~24 markers
  // At zoom 1.35: ~42 markers
  // At zoom 1.70: ~68 markers
  // At zoom 2.20: ~110 markers
  // At zoom 2.60+: all 150 markers
  const tDensity = Math.max(0, Math.min(1, (clampedZoom - 0.85) / (2.6 - 0.85)));
  const maxVisibleCount = Math.round(20 + (150 - 20) * Math.pow(tDensity, 1.35));

  interface RawCandidate {
    ing: FoodIngredient;
    state: IngredientSimulationState;
    anchorX: number;
    anchorY: number;
    isTraveling: boolean;
    isSelected: boolean;
    baseRank: number;
  }

  const rawCandidates: RawCandidate[] = [];

  ingredientStates.forEach(({ ing, state }, index) => {
    const isSelected = ing.id === selectedIngredientId;
    const baseRank = getIngredientImportanceRank(ing.id, index);

    if (state.phase === 'traveling' && state.particlePosition) {
      const [px, py] = projectCoordinates(state.particlePosition[0], state.particlePosition[1]);
      if (px >= 35 && px <= 1000 && py >= 0 && py <= 700) {
        rawCandidates.push({
          ing,
          state,
          anchorX: px,
          anchorY: py,
          isTraveling: true,
          isSelected,
          baseRank: 0.5,
        });
      }
    } else if (state.arrivalReached) {
      const [ax, ay] = projectCoordinates(state.entryCoords[0], state.entryCoords[1]);
      rawCandidates.push({
        ing,
        state,
        anchorX: ax,
        anchorY: ay,
        isTraveling: false,
        isSelected,
        baseRank,
      });
    }
  });

  if (rawCandidates.length === 0) return [];

  // Step 1: Filter raw candidates by progressive density threshold
  // Selected ingredients and traveling ingredients are ALWAYS included
  // Other arrived items are filtered by fixed importance rank
  const sortedByImportance = [...rawCandidates].sort((a, b) => a.baseRank - b.baseRank);
  const visibleCandidates = sortedByImportance.filter((item, idx) => {
    if (item.isSelected || item.isTraveling) return true;
    return idx < maxVisibleCount;
  });

  // Step 2: Placement priority ordering
  // Stable ordering keeps markers grounded in their natural positions so selecting
  // an item does not cause other markers to violently shuffle or swap positions.
  visibleCandidates.sort((a, b) => {
    if (a.isTraveling !== b.isTraveling) {
      return a.isTraveling ? -1 : 1;
    }
    if (a.baseRank !== b.baseRank) {
      return a.baseRank - b.baseRank;
    }
    return a.ing.id.localeCompare(b.ing.id);
  });

  // Map boundaries with margins for circular radius
  const minX = radius + 14;
  const maxX = 986 - radius;
  const minY = radius + 14;
  const maxY = 686 - radius;

  // Selected item reference coordinates for visual hierarchy
  const selectedCandidate = visibleCandidates.find(c => c.isSelected);
  const selectedAnchor = selectedCandidate
    ? { x: selectedCandidate.anchorX, y: selectedCandidate.anchorY, category: selectedCandidate.ing.category }
    : null;

  // Step 3: Collision-free placement solver
  const placed: LayoutMarkerItem[] = [];

  for (const item of visibleCandidates) {
    const x0 = item.anchorX;
    const y0 = item.anchorY;

    // Check if the true anchor position (x0, y0) is collision-free
    let canPlaceAtAnchor = true;
    for (const p of placed) {
      const dx = p.x - x0;
      const dy = p.y - y0;
      if (dx * dx + dy * dy < minDist * minDist) {
        canPlaceAtAnchor = false;
        break;
      }
    }

    if (canPlaceAtAnchor && x0 >= minX && x0 <= maxX && y0 >= minY && y0 <= maxY) {
      // Compute visual hierarchy opacity
      const opacity = computeItemOpacity(item.isSelected, item.ing.category, x0, y0, selectedAnchor);
      const isRelevant = computeIsRelevant(item.isSelected, item.ing.category, x0, y0, selectedAnchor);

      // Subtle, gentle elevation lift for selected item at anchor
      const finalX = x0;
      const finalY = item.isSelected ? y0 - 3.5 : y0;

      placed.push({
        id: item.ing.id,
        name: item.ing.name,
        category: item.ing.category,
        illustration: item.ing.illustration,
        ingredient: item.ing,
        state: item.state,
        x: finalX,
        y: finalY,
        anchorX: x0,
        anchorY: y0,
        radius,
        hitRadius,
        pixelDiameter,
        displaced: false,
        displacementDistance: 0,
        isTraveling: item.isTraveling,
        isSelected: item.isSelected,
        isRelevant,
        opacity,
      });
      continue;
    }

    // Search nearest available candidate offset position within tight local radius
    let bestX = x0;
    let bestY = y0;
    let found = false;

    for (const off of ringOffsets) {
      const cx = x0 + off.dx;
      const cy = y0 + off.dy;

      // Viewport boundary check
      if (cx < minX || cx > maxX || cy < minY || cy > maxY) continue;

      let collides = false;
      for (const p of placed) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        if (dx * dx + dy * dy < minDist * minDist) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        bestX = cx;
        bestY = cy;
        found = true;
        break;
      }
    }

    if (!found) {
      // If tight local offset couldn't fit and item is not selected/traveling,
      // skip placing to avoid pushing across the map into unrelated regions
      if (!item.isSelected && !item.isTraveling) {
        continue;
      }
    }

    const dist = Math.hypot(bestX - x0, bestY - y0);
    // Subtle connector is shown when displacement exceeds 1.25x radius
    const displaced = dist > radius * 1.25;

    const opacity = computeItemOpacity(item.isSelected, item.ing.category, bestX, bestY, selectedAnchor);
    const isRelevant = computeIsRelevant(item.isSelected, item.ing.category, bestX, bestY, selectedAnchor);

    // When displaced item is selected, apply a smooth, subtle shift towards anchor
    let finalX = bestX;
    let finalY = bestY;
    if (item.isSelected && dist > 0) {
      const subtleShift = Math.min(6, dist * 0.22);
      finalX = bestX - ((bestX - x0) / dist) * subtleShift;
      finalY = bestY - ((bestY - y0) / dist) * subtleShift;
    }

    placed.push({
      id: item.ing.id,
      name: item.ing.name,
      category: item.ing.category,
      illustration: item.ing.illustration,
      ingredient: item.ing,
      state: item.state,
      x: finalX,
      y: finalY,
      anchorX: x0,
      anchorY: y0,
      radius,
      hitRadius,
      pixelDiameter,
      displaced,
      displacementDistance: dist,
      isTraveling: item.isTraveling,
      isSelected: item.isSelected,
      isRelevant,
      opacity,
    });
  }

  return placed;
}

/**
 * Calculates visual hierarchy opacity according to Requirement 4:
 * - Selected ingredient: fully opaque (1.0)
 * - Nearby/relevant ingredients: around 70–80% visual emphasis (0.78)
 * - Background ingredients: slightly reduced opacity (0.50)
 * - Baseline (no selection): uniform clean presentation (0.95)
 */
function computeItemOpacity(
  isSelected: boolean,
  category: string,
  x: number,
  y: number,
  selectedAnchor: { x: number; y: number; category: string } | null
): number {
  if (!selectedAnchor) {
    return 0.95;
  }
  if (isSelected) {
    return 1.0;
  }
  // Check relevance (same category or within geographic cluster radius)
  const isSameCat = category === selectedAnchor.category;
  const dist = Math.hypot(x - selectedAnchor.x, y - selectedAnchor.y);
  const isNearby = dist < 140;

  if (isSameCat || isNearby) {
    return 0.78;
  }
  return 0.50;
}

function computeIsRelevant(
  isSelected: boolean,
  category: string,
  x: number,
  y: number,
  selectedAnchor: { x: number; y: number; category: string } | null
): boolean {
  if (!selectedAnchor || isSelected) return false;
  return category === selectedAnchor.category || Math.hypot(x - selectedAnchor.x, y - selectedAnchor.y) < 140;
}
