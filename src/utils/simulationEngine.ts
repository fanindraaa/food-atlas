import {
  FoodIngredient,
  IngredientSimulationState,
  ResolvedGeographics,
  TimelineMilestone,
  RegionalAdoption,
} from '@/types/simulation';

/**
 * Standard Historical Agro-Ecological Regional Centers of the Subcontinent
 */
export const SUB_REGIONS = {
  PUNJAB: { name: 'Punjab & Indus Valley', coordinates: [74.5, 31.5] as [number, number] },
  GANGETIC: { name: 'Gangetic Basin (UP / Bihar)', coordinates: [82.5, 26.0] as [number, number] },
  BENGAL: { name: 'Bengal Delta & East', coordinates: [88.3, 23.0] as [number, number] },
  GUJARAT: { name: 'Gujarat Coast & Cambay', coordinates: [71.8, 22.2] as [number, number] },
  DECCAN: { name: 'Deccan Plateau (Maharashtra)', coordinates: [75.5, 19.5] as [number, number] },
  GOA: { name: 'Goa & Konkan Coast', coordinates: [73.8, 15.5] as [number, number] },
  MALABAR: { name: 'Malabar Coast (Kerala)', coordinates: [75.8, 11.2] as [number, number] },
  COROMANDEL: { name: 'Coromandel (Tamil Nadu)', coordinates: [79.8, 12.0] as [number, number] },
  KARNATAKA: { name: 'Karnataka Highlands', coordinates: [75.8, 14.5] as [number, number] },
  ASSAM: { name: 'Brahmaputra Valley (Assam)', coordinates: [92.8, 26.2] as [number, number] },
  KASHMIR: { name: 'Kashmir Valley & Hills', coordinates: [74.8, 34.1] as [number, number] },
  CENTRAL: { name: 'Central India (Malwa)', coordinates: [77.5, 23.5] as [number, number] },
  RAJASTHAN: { name: 'Arid Marwar (Rajasthan)', coordinates: [72.5, 26.5] as [number, number] },
  ODISHA: { name: 'Kalinga Coast (Odisha)', coordinates: [85.8, 20.3] as [number, number] },
};

/**
 * Color mapping by botanical/culinary category (pure neutral grayscale system, 0% saturation)
 */
export function getArchivalCategoryColor(_category: string): string {
  return '#222222';
}

/**
 * Deterministically checks if an ingredient is indigenous to the Indian subcontinent
 */
export function isNativeIngredient(ingredient: FoodIngredient): boolean {
  const o = ingredient.origin.toLowerCase();
  const name = ingredient.name.toLowerCase();

  // Known indigenous domesticates with deep subcontinental antiquity
  if (
    /little millet|kodo millet|green gram|black gram|pigeon pea|moth bean|horse gram|cluster bean|cucumber|brinjal|turmeric|drumstick|snake gourd|mango|jackfruit|jamun|amla|bael|wood apple|ber|karonda|kokum|black pepper|cardamom|mustard seed|ajwain|indian bay leaf|sesame|curry leaves|makhana|jaggery/i.test(
      name
    )
  ) {
    return true;
  }

  if (
    /western ghats|kerala|assam|eastern himalaya|southwest india|indian subcontinent|western and southwestern india|india–myanmar|india /i.test(
      o
    )
  ) {
    return true;
  }

  if (
    /south asia/i.test(o) &&
    !/southeast asia|southwest asia|east asia|central asia/i.test(o)
  ) {
    return true;
  }

  if (
    /south & southeast asia; india/i.test(o) ||
    /south asia, probably india/i.test(o) ||
    /south asia \/ india/i.test(o)
  ) {
    return true;
  }

  return false;
}

/**
 * Calculates lengths along a waypoint polyline for smooth interpolation
 */
function getPolylineLengths(waypoints: [number, number][]): {
  segmentLengths: number[];
  totalLength: number;
} {
  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(dist);
    totalLength += dist;
  }

  return { segmentLengths, totalLength };
}

/**
 * Interpolates waypoints up to a progress fraction (0.0 to 1.0)
 */
export function interpolateWaypoints(
  waypoints: [number, number][],
  progress: number
): {
  activePoints: [number, number][];
  currentPoint: [number, number];
} {
  if (waypoints.length === 0) {
    return { activePoints: [], currentPoint: [78, 22] };
  }
  if (waypoints.length === 1 || progress <= 0) {
    return { activePoints: [waypoints[0]], currentPoint: waypoints[0] };
  }
  if (progress >= 1) {
    return { activePoints: waypoints, currentPoint: waypoints[waypoints.length - 1] };
  }

  const { segmentLengths, totalLength } = getPolylineLengths(waypoints);
  if (totalLength === 0) {
    return { activePoints: [waypoints[0]], currentPoint: waypoints[0] };
  }

  const targetDist = progress * totalLength;
  let accumDist = 0;
  const activePoints: [number, number][] = [waypoints[0]];

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumDist + segLen >= targetDist) {
      const segFraction = segLen > 0 ? (targetDist - accumDist) / segLen : 0;
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      const curLon = p1[0] + (p2[0] - p1[0]) * segFraction;
      const curLat = p1[1] + (p2[1] - p1[1]) * segFraction;
      const currentPoint: [number, number] = [curLon, curLat];

      activePoints.push(currentPoint);
      return { activePoints, currentPoint };
    }

    accumDist += segLen;
    activePoints.push(waypoints[i + 1]);
  }

  const last = waypoints[waypoints.length - 1];
  return { activePoints: waypoints, currentPoint: last };
}

// Memoized geographic metadata cache for all ingredients
const geoCache = new Map<string, ResolvedGeographics>();

/**
 * Resolves trade route waypoints, origin coordinates, entry ports, and regional spread centers
 */
export function resolveGeographics(ingredient: FoodIngredient): ResolvedGeographics {
  const cached = geoCache.get(ingredient.id);
  if (cached) return cached;

  const isNative = isNativeIngredient(ingredient);
  const color = getArchivalCategoryColor(ingredient.category);
  const o = ingredient.origin.toLowerCase();
  const name = ingredient.name.toLowerCase();
  const cat = ingredient.category.toLowerCase();

  let originCoords: [number, number] = [78, 22];
  let originRegionName = ingredient.origin;
  let entryPort = 'Indian Subcontinent';
  let entryCoords: [number, number] = [78, 22];
  let waypoints: [number, number][] = [];
  let spreadRegions: RegionalAdoption[] = [];

  if (isNative) {
    // ----------------------------------------------------
    // NATIVE INDIAN SUBCONTINENT INGREDIENTS
    // ----------------------------------------------------
    if (/pepper|cardamom|kokum|cinnamon|jackfruit/.test(name) || /western ghats|kerala/.test(o)) {
      originCoords = SUB_REGIONS.MALABAR.coordinates;
      entryPort = 'Western Ghats Primary Center';
      entryCoords = SUB_REGIONS.MALABAR.coordinates;
      spreadRegions = [
        { ...SUB_REGIONS.MALABAR, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.KARNATAKA, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.GOA, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.COROMANDEL, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.DECCAN, adoptionLevel: 0.9 },
        { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.8 },
      ];
    } else if (/rice|makhana|mustard|bael|amla/.test(name) || /gangetic|east/.test(o)) {
      originCoords = SUB_REGIONS.GANGETIC.coordinates;
      entryPort = 'Gangetic / Eastern Wild Diversity Center';
      entryCoords = SUB_REGIONS.GANGETIC.coordinates;
      spreadRegions = [
        { ...SUB_REGIONS.GANGETIC, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.BENGAL, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.ODISHA, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.ASSAM, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.MALABAR, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.PUNJAB, adoptionLevel: 1.0 },
      ];
    } else if (/tea|large cardamom/.test(name) || /assam|himalaya/.test(o)) {
      originCoords = SUB_REGIONS.ASSAM.coordinates;
      entryPort = 'Eastern Himalayan / Brahmaputra Center';
      entryCoords = SUB_REGIONS.ASSAM.coordinates;
      spreadRegions = [
        { ...SUB_REGIONS.ASSAM, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.BENGAL, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.9 },
        { ...SUB_REGIONS.KASHMIR, adoptionLevel: 0.8 },
      ];
    } else if (/ber|guar|cluster bean/.test(name) || /arid/.test(o)) {
      originCoords = SUB_REGIONS.RAJASTHAN.coordinates;
      entryPort = 'Arid Thar & Western Center';
      entryCoords = SUB_REGIONS.RAJASTHAN.coordinates;
      spreadRegions = [
        { ...SUB_REGIONS.RAJASTHAN, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.GUJARAT, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.PUNJAB, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.DECCAN, adoptionLevel: 0.9 },
      ];
    } else {
      // Peninsular / Deccan staples (millets, moong, urad, toor, sesame, drumstick, etc.)
      originCoords = SUB_REGIONS.DECCAN.coordinates;
      entryPort = 'Peninsular Subcontinent Center';
      entryCoords = SUB_REGIONS.DECCAN.coordinates;
      spreadRegions = [
        { ...SUB_REGIONS.DECCAN, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.KARNATAKA, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.COROMANDEL, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.GUJARAT, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.CENTRAL, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.9 },
      ];
    }
    waypoints = [originCoords];
  } else if (/america|mexico|andes|brazil|caribbean|peru/i.test(o)) {
    // ----------------------------------------------------
    // 1. AMERICAS (COLUMBIAN EXCHANGE)
    // ----------------------------------------------------
    originRegionName = ingredient.origin;
    originCoords = [-65, -12]; // South America / Andes / Mesoamerica
    entryPort = 'Goa & Konkan Ports (Portuguese Caravel Route)';
    entryCoords = SUB_REGIONS.GOA.coordinates;
    waypoints = [
      [-65, -12], // Atlantic Americas
      [-25, -2],  // Equatorial Mid-Atlantic
      [15, -30],  // South Atlantic / Cape of Good Hope Approach
      [38, -15],  // Mozambique Channel / Swahili Coast
      [58, 6],    // Arabian Sea Crossing
      [73.8, 15.5], // Goa / Konkan Foothold
    ];
    spreadRegions = [
      { ...SUB_REGIONS.GOA, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.MALABAR, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.DECCAN, adoptionLevel: 0.8 },
      { ...SUB_REGIONS.GUJARAT, adoptionLevel: 0.8 },
      { ...SUB_REGIONS.COROMANDEL, adoptionLevel: 0.7 },
      { ...SUB_REGIONS.BENGAL, adoptionLevel: 0.7 },
      { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.6 },
    ];
  } else if (/africa|madagascar|ethiopia/i.test(o)) {
    // ----------------------------------------------------
    // 2. AFRICA (ANCIENT & MEDIEVAL MARITIME / ARABIAN SEA)
    // ----------------------------------------------------
    originCoords = [38, 7]; // East / Northeast Africa / Swahili Coast
    if (/ragi|finger millet|coffee/.test(name)) {
      entryPort = 'Malabar & Karnataka Coast (Arabian Sea)';
      entryCoords = SUB_REGIONS.KARNATAKA.coordinates;
      waypoints = [
        [38, 7],
        [48, 10],
        [58, 12],
        [68, 13],
        SUB_REGIONS.KARNATAKA.coordinates,
      ];
      spreadRegions = [
        { ...SUB_REGIONS.KARNATAKA, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.MALABAR, adoptionLevel: 0.9 },
        { ...SUB_REGIONS.COROMANDEL, adoptionLevel: 0.9 },
        { ...SUB_REGIONS.DECCAN, adoptionLevel: 0.8 },
      ];
    } else {
      entryPort = 'Gujarat / Saurashtra Ports (Dhow Trade)';
      entryCoords = SUB_REGIONS.GUJARAT.coordinates;
      waypoints = [
        [38, 7],
        [46, 12],
        [56, 16],
        [66, 19],
        SUB_REGIONS.GUJARAT.coordinates,
      ];
      spreadRegions = [
        { ...SUB_REGIONS.GUJARAT, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.RAJASTHAN, adoptionLevel: 1.0 },
        { ...SUB_REGIONS.DECCAN, adoptionLevel: 0.9 },
        { ...SUB_REGIONS.CENTRAL, adoptionLevel: 0.8 },
        { ...SUB_REGIONS.COROMANDEL, adoptionLevel: 0.7 },
      ];
    }
  } else if (/fertile crescent|southwest asia|west asia|persia|arabia|near east|yemen/i.test(o)) {
    // ----------------------------------------------------
    // 3. FERTILE CRESCENT / SOUTHWEST ASIA / PERSIA
    // ----------------------------------------------------
    originCoords = [44, 33]; // Mesopotamia / Levant / Persia
    entryPort = 'Bolan & Khyber Passes (Indus Gateway)';
    entryCoords = SUB_REGIONS.PUNJAB.coordinates;
    waypoints = [
      [44, 33],
      [54, 33],
      [63, 32],
      [69, 31],
      SUB_REGIONS.PUNJAB.coordinates,
    ];
    spreadRegions = [
      { ...SUB_REGIONS.PUNJAB, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.GANGETIC, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.GUJARAT, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.CENTRAL, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.KASHMIR, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.BENGAL, adoptionLevel: 0.7 },
    ];
  } else if (/central asia|afghanistan|khorasan|tian shan|himalaya \/ central asia|iran.*central asia/i.test(o)) {
    // ----------------------------------------------------
    // 4. CENTRAL ASIA / SILK ROAD / HIMALAYA
    // ----------------------------------------------------
    originCoords = [66, 39]; // Fergana / Pamir / Khorasan
    entryPort = 'Kashmir & Northern Mountain Passes (Silk Road)';
    entryCoords = SUB_REGIONS.KASHMIR.coordinates;
    waypoints = [
      [66, 39],
      [70, 36.5],
      [72.5, 35],
      SUB_REGIONS.KASHMIR.coordinates,
    ];
    spreadRegions = [
      { ...SUB_REGIONS.KASHMIR, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.PUNJAB, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.CENTRAL, adoptionLevel: 0.8 },
      { ...SUB_REGIONS.DECCAN, adoptionLevel: 0.7 },
    ];
  } else if (/china|japan|east asia/i.test(o)) {
    // ----------------------------------------------------
    // 5. EAST ASIA / CHINA / SICHUAN / YUNNAN
    // ----------------------------------------------------
    originCoords = [103, 25]; // Southern China / Yunnan
    entryPort = 'Patkai Passes & Assam Gateway (Burma Road)';
    entryCoords = SUB_REGIONS.ASSAM.coordinates;
    waypoints = [
      [103, 25],
      [98, 25.5],
      [95, 26],
      SUB_REGIONS.ASSAM.coordinates,
    ];
    spreadRegions = [
      { ...SUB_REGIONS.ASSAM, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.BENGAL, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.8 },
      { ...SUB_REGIONS.ODISHA, adoptionLevel: 0.7 },
    ];
  } else if (/maluku|banda|indonesia|southeast asia|indo-malayan|malesia|indo-pacific|new guinea/i.test(o)) {
    // ----------------------------------------------------
    // 6. SOUTHEAST ASIA / SPICE ISLANDS (MALUKU, BANDA, MALESIA)
    // ----------------------------------------------------
    originCoords = [118, -2]; // Maluku / Banda / Indonesian Archipelago
    entryPort = 'Coromandel & Bay of Bengal Maritime Route';
    entryCoords = SUB_REGIONS.COROMANDEL.coordinates;
    waypoints = [
      [118, -2],
      [104, 1.5],
      [95, 8],
      [86, 11],
      SUB_REGIONS.COROMANDEL.coordinates,
    ];
    spreadRegions = [
      { ...SUB_REGIONS.COROMANDEL, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.MALABAR, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.BENGAL, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.ODISHA, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.DECCAN, adoptionLevel: 0.7 },
      { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.6 },
    ];
  } else {
    // ----------------------------------------------------
    // 7. EUROPE / MEDITERRANEAN (COLONIAL & EURASIAN HORTICULTURE)
    // ----------------------------------------------------
    originCoords = [18, 42]; // Mediterranean / Western Europe
    entryPort = 'Bombay & Calcutta Harbours (Colonial Shipping)';
    entryCoords = SUB_REGIONS.DECCAN.coordinates; // Western ports
    waypoints = [
      [18, 42],
      [10, 30],
      [15, -25],
      [42, -5],
      [64, 12],
      SUB_REGIONS.DECCAN.coordinates,
    ];
    spreadRegions = [
      { ...SUB_REGIONS.DECCAN, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.BENGAL, adoptionLevel: 1.0 },
      { ...SUB_REGIONS.PUNJAB, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.GANGETIC, adoptionLevel: 0.9 },
      { ...SUB_REGIONS.COROMANDEL, adoptionLevel: 0.8 },
    ];
  }

  const result: ResolvedGeographics = {
    isNative,
    color,
    originRegionName,
    originCoords,
    entryPort,
    entryCoords,
    waypoints,
    spreadRegions,
  };

  geoCache.set(ingredient.id, result);
  return result;
}

/**
 * Calculates historical chronological anchor points for an ingredient
 */
export function getSimulationAnchorYears(ingredient: FoodIngredient): {
  widespreadYear: number;
  arrivalYear: number;
  journeyStartYear: number;
} {
  const isNative = isNativeIngredient(ingredient);
  const widespreadYear = ingredient.widespreadAdoption.simulationYear ?? 1800;
  const o = ingredient.origin.toLowerCase();

  if (isNative) {
    return {
      widespreadYear,
      arrivalYear: -4000,
      journeyStartYear: -4000,
    };
  }

  // Columbian Exchange (New World)
  if (/america|mexico|andes|brazil|caribbean|peru/i.test(o)) {
    if (widespreadYear >= 1900) {
      // 20th century introductions (e.g. broccoli, avocado, vanilla, cocoa, kiwi)
      const arrivalYear = widespreadYear - 40;
      const journeyStartYear = arrivalYear - 25;
      return { widespreadYear, arrivalYear, journeyStartYear };
    }
    const arrivalYear = Math.max(1500, Math.min(1560, widespreadYear - 60));
    const journeyStartYear = Math.max(1492, arrivalYear - 25);
    return { widespreadYear, arrivalYear, journeyStartYear };
  }

  // African Introductions
  if (/africa|madagascar|ethiopia/i.test(o)) {
    const arrivalYear = widespreadYear - 120;
    const journeyStartYear = arrivalYear - 80;
    return { widespreadYear, arrivalYear, journeyStartYear };
  }

  // Fertile Crescent / Southwest Asia (Ancient Agriculture)
  if (/fertile crescent|southwest asia|west asia|persia|arabia|near east/i.test(o)) {
    const arrivalYear = Math.max(-3500, widespreadYear - 180);
    const journeyStartYear = arrivalYear - 120;
    return { widespreadYear, arrivalYear, journeyStartYear };
  }

  // Central Asia / Silk Road
  if (/central asia|afghanistan|khorasan|tian shan/i.test(o)) {
    const arrivalYear = widespreadYear - 80;
    const journeyStartYear = arrivalYear - 50;
    return { widespreadYear, arrivalYear, journeyStartYear };
  }

  // Southeast Asia / East Asia
  if (/maluku|banda|indonesia|southeast asia|china/i.test(o)) {
    const arrivalYear = widespreadYear - 80;
    const journeyStartYear = arrivalYear - 50;
    return { widespreadYear, arrivalYear, journeyStartYear };
  }

  // European / Colonial Introductions
  const arrivalYear = widespreadYear - 50;
  const journeyStartYear = arrivalYear - 25;
  return { widespreadYear, arrivalYear, journeyStartYear };
}

/**
 * Deterministically computes the full simulation state for an ingredient at a given year
 */
export function getIngredientState(
  ingredient: FoodIngredient,
  year: number
): IngredientSimulationState {
  const geo = resolveGeographics(ingredient);
  const anchors = getSimulationAnchorYears(ingredient);
  const { widespreadYear, arrivalYear, journeyStartYear } = anchors;

  // ==========================================
  // CASE 1: Indigenous Ancient Indian Crops
  // ==========================================
  if (geo.isNative) {
    const isWidespread = year >= widespreadYear;
    return {
      ingredient,
      phase: 'widespread',
      isNative: true,
      color: geo.color,
      confidence: ingredient.confidence,
      routeProgress: 1.0,
      activeWaypoints: [],
      particlePosition: null,
      arrivalReached: true,
      activeRegions: isWidespread
        ? geo.spreadRegions
        : geo.spreadRegions.slice(0, 2).map(r => ({ ...r, adoptionLevel: 0.65 })),
      presenceDensity: isWidespread ? 1.0 : 0.5,
      statusTitle: isWidespread ? 'Indigenous & Ancient Foundation' : 'Ancestral Subcontinental Hearth',
      statusDescription: ingredient.widespreadAdoption.details,
      originName: ingredient.origin,
      originCoords: geo.originCoords,
      entryPort: geo.entryPort,
      entryCoords: geo.entryCoords,
      arrivalYear: -4000,
      widespreadYear,
      journeyStartYear: -4000,
    };
  }

  // ==========================================
  // CASE 2: Migrant / Introduced Crops
  // ==========================================

  // Phase A: Pre-journey (Still solely in region of origin)
  if (year < journeyStartYear) {
    return {
      ingredient,
      phase: 'origin',
      isNative: false,
      color: geo.color,
      confidence: ingredient.confidence,
      routeProgress: 0.0,
      activeWaypoints: [geo.waypoints[0]],
      particlePosition: geo.originCoords,
      arrivalReached: false,
      activeRegions: [],
      presenceDensity: 0.0,
      statusTitle: 'In Region of Origin',
      statusDescription: `Thriving in ${ingredient.origin}. Has not yet embarked on historical trade routes toward India.`,
      originName: ingredient.origin,
      originCoords: geo.originCoords,
      entryPort: geo.entryPort,
      entryCoords: geo.entryCoords,
      arrivalYear,
      widespreadYear,
      journeyStartYear,
    };
  }

  // Phase B: Active Transit Along Trade Route
  if (year < arrivalYear) {
    const journeyDuration = Math.max(1, arrivalYear - journeyStartYear);
    const routeProgress = Math.max(0, Math.min(1, (year - journeyStartYear) / journeyDuration));
    const { activePoints, currentPoint } = interpolateWaypoints(geo.waypoints, routeProgress);

    return {
      ingredient,
      phase: 'traveling',
      isNative: false,
      color: geo.color,
      confidence: ingredient.confidence,
      routeProgress,
      activeWaypoints: activePoints,
      particlePosition: currentPoint,
      arrivalReached: false,
      activeRegions: [],
      presenceDensity: 0.0,
      statusTitle: 'Traversing Historical Trade Routes',
      statusDescription: `Voyaging from ${ingredient.origin} toward ${geo.entryPort} (${Math.round(routeProgress * 100)}% of transit completed).`,
      originName: ingredient.origin,
      originCoords: geo.originCoords,
      entryPort: geo.entryPort,
      entryCoords: geo.entryCoords,
      arrivalYear,
      widespreadYear,
      journeyStartYear,
    };
  }

  // Phase C: Regional Spread & Adoption in India
  if (year < widespreadYear) {
    const spreadDuration = Math.max(1, widespreadYear - arrivalYear);
    const overallSpreadProgress = (year - arrivalYear) / spreadDuration;
    const isInitialArrivalWindow = year - arrivalYear <= 25;

    // Dynamically calculate which regional centers have adopted the crop
    const regionCountToActivate = Math.max(
      1,
      Math.min(geo.spreadRegions.length, Math.ceil(overallSpreadProgress * geo.spreadRegions.length))
    );

    const activeRegions: RegionalAdoption[] = geo.spreadRegions
      .slice(0, regionCountToActivate)
      .map((r, idx) => {
        const regionalAdoption = Math.min(
          1.0,
          Math.max(0.3, overallSpreadProgress * (1.2 - idx * 0.15))
        );
        return {
          name: r.name,
          coordinates: r.coordinates,
          adoptionLevel: regionalAdoption,
        };
      });

    return {
      ingredient,
      phase: isInitialArrivalWindow ? 'arrived' : 'spreading',
      isNative: false,
      color: geo.color,
      confidence: ingredient.confidence,
      routeProgress: 1.0,
      activeWaypoints: geo.waypoints,
      particlePosition: geo.entryCoords,
      arrivalReached: true,
      activeRegions,
      presenceDensity: Math.max(0.25, overallSpreadProgress * 0.85),
      statusTitle: isInitialArrivalWindow
        ? `Arrived at ${geo.entryPort}`
        : 'Diffusing Across Indian Bazaars',
      statusDescription: ingredient.widespreadAdoption.details,
      originName: ingredient.origin,
      originCoords: geo.originCoords,
      entryPort: geo.entryPort,
      entryCoords: geo.entryCoords,
      arrivalYear,
      widespreadYear,
      journeyStartYear,
    };
  }

  // Phase D: Widespread Ubiquitous Staple in India
  return {
    ingredient,
    phase: 'widespread',
    isNative: false,
    color: geo.color,
    confidence: ingredient.confidence,
    routeProgress: 1.0,
    activeWaypoints: geo.waypoints,
    particlePosition: null, // Fully assimilated into everyday pantry
    arrivalReached: true,
    activeRegions: geo.spreadRegions.map(r => ({ ...r, adoptionLevel: 1.0 })),
    presenceDensity: 1.0,
    statusTitle: 'Widespread Culinary Staple',
    statusDescription: ingredient.widespreadAdoption.details,
    originName: ingredient.origin,
    originCoords: geo.originCoords,
    entryPort: geo.entryPort,
    entryCoords: geo.entryCoords,
    arrivalYear,
    widespreadYear,
    journeyStartYear,
  };
}

/**
 * Returns contextual storytelling narrative and milestones across all ingredients for the given year
 */
export function getHistoricalNarrative(
  ingredients: FoodIngredient[],
  year: number
): {
  headline: string;
  subheadline: string;
  milestoneCallout: TimelineMilestone | null;
} {
  let milestoneCallout: TimelineMilestone | null = null;

  for (const ing of ingredients) {
    const anchors = getSimulationAnchorYears(ing);
    if (!isNativeIngredient(ing) && Math.abs(year - anchors.arrivalYear) <= 12) {
      milestoneCallout = {
        year: anchors.arrivalYear,
        ingredientId: ing.id,
        ingredientName: ing.name,
        headline: `${ing.name} arrives in India`,
        detail: `Enters via ${ing.origin} through maritime and overland trade networks.`,
      };
      break;
    }
    if (Math.abs(year - anchors.widespreadYear) <= 12) {
      milestoneCallout = {
        year: anchors.widespreadYear,
        ingredientId: ing.id,
        ingredientName: ing.name,
        headline: `${ing.name} attains widespread adoption`,
        detail: ing.widespreadAdoption.period,
      };
      break;
    }
  }

  if (year >= 2000) {
    return {
      headline: 'The Modern Globalized Pantry',
      subheadline: 'New World staples and ancient Vedic aromatics thrive side by side in everyday Indian kitchens.',
      milestoneCallout,
    };
  }
  if (year >= 1850) {
    return {
      headline: 'Colonial Expansion & Ubiquitous Staples',
      subheadline: 'Potatoes and tomatoes become universal; British commercial tea, cauliflower, and cabbage plantations flourish.',
      milestoneCallout,
    };
  }
  if (year >= 1750) {
    return {
      headline: 'The Great Agrarian Diffusion',
      subheadline: 'Peanuts spread across the Deccan; potatoes take root in Bengal alluvial soil; guavas and sweet potatoes become ubiquitous.',
      milestoneCallout,
    };
  }
  if (year >= 1650) {
    return {
      headline: 'Mughal Courts & Coastal Trade',
      subheadline: 'Maize, chillies, and papayas enter royal and commoner cuisines; sweet potatoes become sacred fasting food.',
      milestoneCallout,
    };
  }
  if (year >= 1500) {
    return {
      headline: 'The Columbian Exchange Dawns',
      subheadline: 'Portuguese caravels introduce chillies, cashew, papaya, and pineapples to Goa and the Malabar coast.',
      milestoneCallout,
    };
  }
  if (year >= 1200) {
    return {
      headline: 'Medieval Maritime Trade & Regional Kingdoms',
      subheadline: 'Cloves and nutmeg arrive from the Spice Islands; Central Asian culinary techniques blend with indigenous south Asian spices.',
      milestoneCallout,
    };
  }
  if (year >= 0) {
    return {
      headline: 'Classical & Early Historic India',
      subheadline: 'Black pepper exported to Imperial Rome; crystalline sugar (sharkara) invented during Gupta prosperity.',
      milestoneCallout,
    };
  }
  return {
    headline: 'Ancient Foundations & Harappan Agriculture',
    subheadline: 'Turmeric, ginger, black pepper, sesame, and indica rice form the foundational culinary bedrock.',
    milestoneCallout,
  };
}
