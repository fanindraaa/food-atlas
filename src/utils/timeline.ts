/**
 * Timeline utilities for formatting and slider interpolation
 */

export const MIN_YEAR = -3000;
export const MAX_YEAR = 2026;

// Key milestones requested in the build brief
export const TIMELINE_MILESTONES = [
  { year: -3000, label: '3000 BCE' },
  { year: -2000, label: '2000 BCE' },
  { year: -1000, label: '1000 BCE' },
  { year: 0, label: '0' },
  { year: 500, label: '500 CE' },
  { year: 1000, label: '1000' },
  { year: 1200, label: '1200' },
  { year: 1400, label: '1400' },
  { year: 1500, label: '1500' },
  { year: 1600, label: '1600' },
  { year: 1700, label: '1700' },
  { year: 1800, label: '1800' },
  { year: 1900, label: '1900' },
  { year: 2000, label: '2000' },
  { year: 2026, label: '2026' },
];

/**
 * Format year into historical display string (e.g. 1000 BCE, 500 CE, 1800)
 */
export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  }
  if (year === 0) {
    return '0';
  }
  if (year <= 999) {
    return `${year} CE`;
  }
  return `${year}`;
}

/**
 * Return historical era context description for the year
 */
export function getEraContext(year: number): { era: string; description: string } {
  if (year < -1900) {
    return {
      era: 'Early Bronze Age / Mature Harappan',
      description: 'Indigenous staples, millets, sesame, early rice and barley in the Indus and Saraswati basins.',
    };
  }
  if (year < -1000) {
    return {
      era: 'Late Harappan & Early Vedic Age',
      description: 'Black pepper, indigenous legumes, and early seasonal crop rotations across the Indo-Gangetic plain.',
    };
  }
  if (year < 0) {
    return {
      era: 'Later Vedic & Mahajanapada Era',
      description: 'Sugar cane crystallization, extensive spice trade with Alexandria and Rome via the Malabar coast.',
    };
  }
  if (year < 1200) {
    return {
      era: 'Classical & Early Medieval India',
      description: 'Prosperous maritime trade with Southeast Asia and Persian Gulf; indigenous spices flourish.',
    };
  }
  if (year < 1500) {
    return {
      era: 'Delhi Sultanate & Regional Kingdoms',
      description: 'Central Asian culinary influences, regional tandoor techniques, pre-Columbian ingredient palette.',
    };
  }
  if (year < 1700) {
    return {
      era: 'Early Mughal & Portuguese Arrivals',
      description: 'The Columbian Exchange begins: chillies, cashew, papaya, and tobacco reach Goa and the coastal ports.',
    };
  }
  if (year < 1850) {
    return {
      era: 'Late Mughal & Company Rule',
      description: 'Potatoes, tomatoes, and groundnuts take root; British colonial tea plantations established.',
    };
  }
  if (year < 1947) {
    return {
      era: 'Colonial Period & Global Trade',
      description: 'Cauliflower, modern winter vegetables, and commercial crops become ubiquitous everyday staples.',
    };
  }
  return {
    era: 'Contemporary India',
    description: 'A globalized pantry where ancient native spices blend seamlessly with Columbian Exchange staples.',
  };
}

/**
 * Convert slider position (0-100) to historical year.
 * We use a piecewise function to grant generous scrubber precision
 * to the critical Columbian Exchange and modern transformation period (1400-2026),
 * while maintaining continuous coverage back to 3000 BCE.
 */
export function sliderProgressToYear(progress: number): number {
  const p = Math.max(0, Math.min(100, progress)) / 100;
  
  // 0% -> -3000 BCE
  // 35% -> 0
  // 55% -> 1400 CE
  // 100% -> 2026 CE
  if (p <= 0.35) {
    // -3000 to 0
    const subP = p / 0.35;
    return Math.round(-3000 + subP * 3000);
  } else if (p <= 0.55) {
    // 0 to 1400
    const subP = (p - 0.35) / 0.20;
    return Math.round(subP * 1400);
  } else {
    // 1400 to 2026
    const subP = (p - 0.55) / 0.45;
    return Math.round(1400 + subP * 626);
  }
}

/**
 * Convert historical year (-3000 to 2026) to slider position (0-100)
 */
export function yearToSliderProgress(year: number): number {
  const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
  if (clamped <= 0) {
    const subP = (clamped - (-3000)) / 3000;
    return subP * 35;
  } else if (clamped <= 1400) {
    const subP = clamped / 1400;
    return 35 + subP * 20;
  } else {
    const subP = (clamped - 1400) / 626;
    return 55 + subP * 45;
  }
}
