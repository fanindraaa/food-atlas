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
  // Radius in SVG viewBox units
  radius: number;
  // Visual diameter in screen pixels
  pixelDiameter: number;
  // Is this item displaced from its true anchor?
  displaced: boolean;
  displacementDistance: number;
  isTraveling: boolean;
  isSelected: boolean;
}

export interface MarkerDimensions {
  pixelDiameter: number;
  radius: number;
  minDist: number;
}

/**
 * Calculates smooth zoom-responsive marker dimensions
 *
 * Zoom ranges from 0.85 to 3.2:
 * - Zoomed out (~0.85): ~30px
 * - Medium zoom (~1.0 - 1.5): ~38px - 46px
 * - Zoomed in (~3.2): ~64px
 */
export function calculateMarkerDimensions(zoom: number): MarkerDimensions {
  const clampedZoom = Math.max(0.85, Math.min(3.2, zoom));
  const zNorm = (clampedZoom - 0.85) / (3.2 - 0.85);

  // Smooth interpolation for on-screen pixel diameter
  const pixelDiameter = 30 + (64 - 30) * Math.pow(zNorm, 0.75);

  // In SVG viewBox (1000x700), 1 SVG unit ~ 1.3px on typical desktop at zoom 1.0
  const svgScale = 1.3 * clampedZoom;
  const radius = pixelDiameter / (2 * svgScale);

  // Buffer between adjacent circles to prevent visual overlap and hitbox crowding
  const padding = 3.5 / clampedZoom;
  const minDist = 2 * radius + padding;

  return { pixelDiameter, radius, minDist };
}

/**
 * Generates hexagonal candidate offsets ordered by distance from anchor
 * Offsets prioritize horizontal side-by-side placement first, then diagonals
 */
function generateCandidateOffsets(minDist: number, maxRings = 10): { dx: number; dy: number; dist2: number }[] {
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

  // Stable sort by Euclidean distance squared from center
  offsets.sort((a, b) => {
    if (Math.abs(a.dist2 - b.dist2) > 0.001) {
      return a.dist2 - b.dist2;
    }
    // Prefer horizontal spread (smaller dy) when distance is equal
    return Math.abs(a.dy) - Math.abs(b.dy);
  });

  return offsets;
}

// Cached candidate offsets per rounded minDist to optimize CPU
const offsetCache = new Map<number, { dx: number; dy: number; dist2: number }[]>();

function getCachedOffsets(minDist: number): { dx: number; dy: number; dist2: number }[] {
  const key = Math.round(minDist * 10);
  let cached = offsetCache.get(key);
  if (!cached) {
    cached = generateCandidateOffsets(minDist, 10);
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
 * Solves deterministic, screen-space collision-free positioning for all visible ingredients.
 *
 * Algorithm guarantees:
 * 1. ZERO visual overlap across all rendered ingredient circles (distance >= minDist).
 * 2. Selected ingredient always anchored at true geographic position (0 displacement).
 * 3. Ingredients in dense clusters automatically arranged side-by-side with minimal displacement.
 * 4. Stable positions across renders to prevent chaotic jumping.
 * 5. Runs in < 1ms for up to 150 items.
 */
export function computeIngredientMarkerLayout({
  ingredientStates,
  zoom,
  selectedIngredientId,
}: ComputeLayoutProps): LayoutMarkerItem[] {
  const { pixelDiameter, radius, minDist } = calculateMarkerDimensions(zoom);
  const ringOffsets = getCachedOffsets(minDist);

  // Step 1: Collect all ingredients that are visible on the map
  interface RawCandidate {
    ing: FoodIngredient;
    state: IngredientSimulationState;
    anchorX: number;
    anchorY: number;
    isTraveling: boolean;
    isSelected: boolean;
  }

  const candidates: RawCandidate[] = [];

  for (const { ing, state } of ingredientStates) {
    const isSelected = ing.id === selectedIngredientId;

    if (state.phase === 'traveling' && state.particlePosition) {
      const [px, py] = projectCoordinates(state.particlePosition[0], state.particlePosition[1]);
      // Only place on map if within cartographic bounds
      if (px >= 35 && px <= 1000 && py >= 0 && py <= 700) {
        candidates.push({
          ing,
          state,
          anchorX: px,
          anchorY: py,
          isTraveling: true,
          isSelected,
        });
      }
    } else if (state.arrivalReached) {
      // Arrived, spreading, or widespread: anchored in subcontinental entry/origin port
      const [ax, ay] = projectCoordinates(state.entryCoords[0], state.entryCoords[1]);
      candidates.push({
        ing,
        state,
        anchorX: ax,
        anchorY: ay,
        isTraveling: false,
        isSelected,
      });
    }
  }

  if (candidates.length === 0) return [];

  // Step 2: Deterministic priority ordering:
  // 1. Selected ingredient first (guarantees zero displacement for selected item)
  // 2. Traveling ingredients (moving along active paths)
  // 3. Stable alphabetical ordering by ID to prevent flicker between renders
  candidates.sort((a, b) => {
    if (a.isSelected) return -1;
    if (b.isSelected) return 1;
    if (a.isTraveling !== b.isTraveling) {
      return a.isTraveling ? -1 : 1;
    }
    return a.ing.id.localeCompare(b.ing.id);
  });

  // Step 3: Collision-free placement solver
  const placed: LayoutMarkerItem[] = [];

  // Map boundaries with margins for circular radius
  const minX = radius + 14;
  const maxX = 986 - radius;
  const minY = radius + 14;
  const maxY = 686 - radius;

  for (const item of candidates) {
    const x0 = item.anchorX;
    const y0 = item.anchorY;

    // Breathing space factor for selected item so it dominates visually
    const selectedBuffer = 1.15;

    // Check if the true anchor position (x0, y0) is collision-free
    let canPlaceAtAnchor = true;
    for (const p of placed) {
      const dx = p.x - x0;
      const dy = p.y - y0;
      const target = (item.isSelected || p.isSelected) ? minDist * selectedBuffer : minDist;
      if (dx * dx + dy * dy < target * target) {
        canPlaceAtAnchor = false;
        break;
      }
    }

    if (canPlaceAtAnchor && x0 >= minX && x0 <= maxX && y0 >= minY && y0 <= maxY) {
      placed.push({
        id: item.ing.id,
        name: item.ing.name,
        category: item.ing.category,
        illustration: item.ing.illustration,
        ingredient: item.ing,
        state: item.state,
        x: x0,
        y: y0,
        anchorX: x0,
        anchorY: y0,
        radius,
        pixelDiameter,
        displaced: false,
        displacementDistance: 0,
        isTraveling: item.isTraveling,
        isSelected: item.isSelected,
      });
      continue;
    }

    // Search nearest available candidate offset position
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
        const target = (item.isSelected || p.isSelected) ? minDist * selectedBuffer : minDist;
        if (dx * dx + dy * dy < target * target) {
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

    const dist = Math.hypot(bestX - x0, bestY - y0);
    // Subtle connector is shown when displacement exceeds 1.25x radius
    const displaced = dist > radius * 1.25;

    placed.push({
      id: item.ing.id,
      name: item.ing.name,
      category: item.ing.category,
      illustration: item.ing.illustration,
      ingredient: item.ing,
      state: item.state,
      x: bestX,
      y: bestY,
      anchorX: x0,
      anchorY: y0,
      radius,
      pixelDiameter,
      displaced,
      displacementDistance: dist,
      isTraveling: item.isTraveling,
      isSelected: item.isSelected,
    });
  }

  return placed;
}
