export type IngredientCategory =
  | 'Vegetable'
  | 'Grain'
  | 'Pulse'
  | 'Fruit'
  | 'Spice'
  | 'Nut & Seed'
  | 'Beverage'
  | 'Oil & Sweetener'
  | 'Other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  origin: {
    region: string;
    latitude: number;
    longitude: number;
  };
  destinationInIndia?: {
    region: string;
    latitude: number;
    longitude: number;
  };
  widespread: {
    startYear: number;
    endYear?: number;
    label: string;
  };
  description: string;
  historicalNote?: string;
  culinaryUsage?: string;
  route?: {
    coordinates: [number, number][]; // [longitude, latitude] GeoJSON order
  };
  confidence?: 'high' | 'medium' | 'low';
  illustration?: string | null;
  nativeToSubcontinent?: boolean;
  botanicalName?: string;
}
