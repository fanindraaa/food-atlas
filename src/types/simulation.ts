export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Canonical 150-Item Dataset Schema
 * Matches india-food-journey-150.json exactly
 */
export interface FoodIngredient {
  id: string;
  name: string;
  category: string;
  origin: string;

  widespreadAdoption: {
    period: string;
    details: string;
    simulationYear: number | null;
    simulationYearNote: string | null;
  };

  confidence: ConfidenceLevel;
  illustration: string | null;
}

export type SimulationPhase =
  | 'origin'
  | 'traveling'
  | 'arrived'
  | 'spreading'
  | 'widespread';

export interface RegionalAdoption {
  name: string;
  coordinates: [number, number]; // [lon, lat]
  adoptionLevel: number; // 0.0 to 1.0
}

export interface ResolvedGeographics {
  isNative: boolean;
  color: string;
  originRegionName: string;
  originCoords: [number, number];
  entryPort: string;
  entryCoords: [number, number];
  waypoints: [number, number][];
  spreadRegions: RegionalAdoption[];
}

export interface IngredientSimulationState {
  ingredient: FoodIngredient;
  phase: SimulationPhase;
  isNative: boolean;
  color: string;
  confidence: ConfidenceLevel;
  routeProgress: number; // 0.0 to 1.0
  activeWaypoints: [number, number][]; // Waypoints up to current particle
  particlePosition: [number, number] | null; // Current [lon, lat] of traveling entity
  arrivalReached: boolean;
  activeRegions: RegionalAdoption[];
  presenceDensity: number; // 0.0 to 1.0
  statusTitle: string;
  statusDescription: string;
  originName: string;
  originCoords: [number, number];
  entryPort: string;
  entryCoords: [number, number];
  arrivalYear: number;
  widespreadYear: number;
  journeyStartYear: number;
}

export interface TimelineMilestone {
  year: number;
  ingredientId: string;
  ingredientName: string;
  headline: string;
  detail: string;
}
