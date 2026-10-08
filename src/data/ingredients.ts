import type { Ingredient } from '../types/ingredient.ts';
import { generateCurvedRoute } from '../utils/geo.ts';

// Helper to assemble an ingredient with an animated curved route from origin to destination
function createIngredient(
  item: Omit<Ingredient, 'route'> & {
    destCoord: [number, number]; // [lon, lat] in India
    arcFactor?: number;
  }
): Ingredient {
  const originCoord: [number, number] = [item.origin.longitude, item.origin.latitude];
  const route = {
    coordinates: generateCurvedRoute(originCoord, item.destCoord, 28, item.arcFactor ?? 0.18),
  };
  const { destCoord, arcFactor, ...rest } = item;
  return {
    ...rest,
    route,
  };
}

export const INGREDIENTS: Ingredient[] = [
  // ==========================================
  // COLUMBIAN EXCHANGE / NEW WORLD HEROES
  // ==========================================
  createIngredient({
    id: 'chilli',
    name: 'Chilli',
    botanicalName: 'Capsicum annuum / frutescens',
    category: 'Spice',
    origin: {
      region: 'Mesoamerica & Tropical Americas',
      latitude: 19.4,
      longitude: -99.1,
    },
    destinationInIndia: {
      region: 'Goa & Malabar Coast',
      latitude: 15.3,
      longitude: 73.8,
    },
    destCoord: [73.8, 15.3],
    arcFactor: 0.22,
    widespread: {
      startYear: 1580,
      label: 'Late 16th century (Portuguese Goa)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Before chillies arrived from the Americas via Portuguese merchants, Indian heat came exclusively from black pepper and pippali (long pepper). Chillies thrived immediately in Indian soil and revolutionized regional cuisines within two generations.',
    historicalNote:
      'First mentioned in Indian records by Purandara Dasa (c. 1540), chillies were hailed as a savior of the poor because they were vastly cheaper and easier to cultivate than native black pepper.',
    culinaryUsage: 'Essential base for curries, tadkas, chutneys, and pickles across every region.',
  }),

  createIngredient({
    id: 'potato',
    name: 'Potato',
    botanicalName: 'Solanum tuberosum',
    category: 'Vegetable',
    origin: {
      region: 'Andes / Lake Titicaca (Peru-Bolivia)',
      latitude: -15.8,
      longitude: -69.3,
    },
    destinationInIndia: {
      region: 'Bengal & Western India',
      latitude: 22.5,
      longitude: 88.3,
    },
    destCoord: [88.3, 22.5],
    arcFactor: 0.25,
    widespread: {
      startYear: 1780,
      label: 'Late 18th century (British & Portuguese)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Though introduced to western ports by the Portuguese in the early 1600s as "batata", potatoes only became a widespread staple when the British East India Company promoted commercial cultivation in Bengal and the Himalayan foothills in the late 1700s.',
    historicalNote:
      'Exiled Nawab Wajid Ali Shah famously popularized potato in Kolkata biryani in the 1850s, turning what was once a foreign novelty into an iconic cultural touchstone.',
    culinaryUsage: 'Aloo gobi, samosas, dosas, dum aloo, and regional curries throughout India.',
  }),

  createIngredient({
    id: 'tomato',
    name: 'Tomato',
    botanicalName: 'Solanum lycopersicum',
    category: 'Vegetable',
    origin: {
      region: 'Western South America & Mexico',
      latitude: -12.0,
      longitude: -77.0,
    },
    destinationInIndia: {
      region: 'Bengal & Gangetic Valley',
      latitude: 23.5,
      longitude: 87.8,
    },
    destCoord: [87.8, 23.5],
    arcFactor: 0.24,
    widespread: {
      startYear: 1850,
      label: 'Mid-to-late 19th century',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'Tomatoes entered global maritime networks after the Columbian Exchange but were long viewed with suspicion in India. Native souring agents tamarind, amchur, kokum, and curd dominated for centuries before tomatoes became the ubiquitous gravy base.',
    historicalNote:
      'Cultivated initially as ornamental plants and for British colonial tables in Calcutta and Simla, commercial Indian adoption surged only toward the late 1800s.',
    culinaryUsage: 'Foundation of modern North Indian gravies, rasam, chutneys, and everyday sabzis.',
  }),

  createIngredient({
    id: 'maize',
    name: 'Maize (Corn)',
    botanicalName: 'Zea mays',
    category: 'Grain',
    origin: {
      region: 'Balsas River Valley, Mesoamerica',
      latitude: 18.2,
      longitude: -100.3,
    },
    destinationInIndia: {
      region: 'Deccan & Punjab Plains',
      latitude: 31.1,
      longitude: 75.3,
    },
    destCoord: [75.3, 31.1],
    arcFactor: 0.2,
    widespread: {
      startYear: 1650,
      label: 'Mid-17th century (Deccan & Mughal realms)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Domesticated in Mexico over 9,000 years ago, maize reached the Indian subcontinent via Portuguese maritime traders and Mediterranean merchants. It quickly established itself as a resilient winter cereal in northern hills and the Deccan.',
    historicalNote:
      'Recorded in Mughal revenue accounts by the reign of Shah Jahan; later became the inseparable companion of sarson ka saag (makki ki roti) in Punjab.',
    culinaryUsage: 'Makki ki roti, roasted bhutta on monsoonal streets, and livestock fodder.',
  }),

  createIngredient({
    id: 'peanut',
    name: 'Peanut (Groundnut)',
    botanicalName: 'Arachis hypogaea',
    category: 'Nut & Seed',
    origin: {
      region: 'Gran Chaco / Bolivia & Northern Argentina',
      latitude: -19.5,
      longitude: -64.5,
    },
    destinationInIndia: {
      region: 'Coromandel Coast & Gujarat',
      latitude: 21.7,
      longitude: 72.1,
    },
    destCoord: [72.1, 21.7],
    arcFactor: 0.26,
    widespread: {
      startYear: 1750,
      label: 'Mid-18th century',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'Native to South America, groundnuts arrived via Atlantic and Pacific sailing routes into South India and the Coromandel coast. India is now one of the world’s foremost producers of peanuts.',
    historicalNote:
      'Extensively cultivated in Tamil Nadu and Maharashtra during the 19th century as an oilseed crop and dependable famine buffer.',
    culinaryUsage: 'Cooking oil, Maharashtrian Shengdana chutney, poha garnish, and fasting snacks.',
  }),

  createIngredient({
    id: 'cashew',
    name: 'Cashew',
    botanicalName: 'Anacardium occidentale',
    category: 'Nut & Seed',
    origin: {
      region: 'Northeastern Brazil',
      latitude: -5.8,
      longitude: -36.5,
    },
    destinationInIndia: {
      region: 'Goa & Konkan Coast',
      latitude: 15.5,
      longitude: 73.8,
    },
    destCoord: [73.8, 15.5],
    arcFactor: 0.23,
    widespread: {
      startYear: 1600,
      label: 'Early 17th century (Portuguese Goa)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Portuguese navigators brought the cashew tree from Brazil to Goa around 1570 primarily to stabilize coastal hillsides and prevent topsoil erosion. Locals soon discovered the dual value of its delicate nut and the juicy cashew apple.',
    historicalNote:
      'Goan distillers uniquely pioneered "feni" the potent distilled liquor made from fermented cashew apple juice, celebrated with a GI tag today.',
    culinaryUsage: 'Kaju katli, rich kormas, roasted street snacks, and Goan cashew feni.',
  }),

  createIngredient({
    id: 'guava',
    name: 'Guava',
    botanicalName: 'Psidium guajava',
    category: 'Fruit',
    origin: {
      region: 'Tropical Americas / Caribbean',
      latitude: 15.0,
      longitude: -90.0,
    },
    destinationInIndia: {
      region: 'Allahabad & Gangetic Plains',
      latitude: 25.4,
      longitude: 81.8,
    },
    destCoord: [81.8, 25.4],
    arcFactor: 0.21,
    widespread: {
      startYear: 1650,
      label: 'Mid-17th century (Portuguese introduction)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Carried across oceans from the Caribbean basin, guava found ideal alluvial conditions across northern and central India, giving rise to renowned cultivars like the Allahabad Safeda.',
    historicalNote:
      'Referred to as "amrood" (from Persian amrud for pear) in Mughal records during Aurangzeb’s reign.',
    culinaryUsage: 'Eaten ripe with chaat masala and black salt, or stewed in jellies.',
  }),

  createIngredient({
    id: 'papaya',
    name: 'Papaya',
    botanicalName: 'Carica papaya',
    category: 'Fruit',
    origin: {
      region: 'Southern Mexico & Central America',
      latitude: 17.5,
      longitude: -96.0,
    },
    destinationInIndia: {
      region: 'Malabar & Coromandel',
      latitude: 11.2,
      longitude: 75.8,
    },
    destCoord: [75.8, 11.2],
    arcFactor: 0.22,
    widespread: {
      startYear: 1620,
      label: 'Early 17th century (Dutch & Portuguese routes)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Introduced through maritime spice routes via the Philippines and Malacca, papaya trees spread with remarkable speed across Indian domestic kitchen gardens.',
    historicalNote:
      'Jan Huyghen van Linschoten noted in 1596 that papayas were being brought to India from Malacca and planted widely for their medicinal qualities.',
    culinaryUsage: 'Raw green papaya in Gujarati sambharo and salads; ripe fruit served with lime.',
  }),

  createIngredient({
    id: 'pineapple',
    name: 'Pineapple',
    botanicalName: 'Ananas comosus',
    category: 'Fruit',
    origin: {
      region: 'Paraná-Paraguay River Basin (Brazil-Paraguay)',
      latitude: -23.5,
      longitude: -57.4,
    },
    destinationInIndia: {
      region: 'Goa & Mughal Royal Gardens',
      latitude: 15.3,
      longitude: 73.8,
    },
    destCoord: [73.8, 15.3],
    arcFactor: 0.25,
    widespread: {
      startYear: 1610,
      label: 'Early 17th century (Emperor Jahangir notes)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Brought from South America to Portuguese Goa, the exotic fruit was sent to the Mughal court where Emperor Jahangir wrote enthusiastically about it in his Tuzuk-i-Jahangiri.',
    historicalNote:
      'Jahangir wrote in 1615: "The pineapple is a fruit of the port of Goa... many thousands are now gathered in the gardens of Agra."',
    culinaryUsage: 'Pineapple kesari, Goan curries, street fruit plates, and preserves.',
  }),

  createIngredient({
    id: 'sweet-potato',
    name: 'Sweet Potato (Shakarkand)',
    botanicalName: 'Ipomoea batatas',
    category: 'Vegetable',
    origin: {
      region: 'Central and South America',
      latitude: -10.0,
      longitude: -75.0,
    },
    destinationInIndia: {
      region: 'Western & Eastern Ghats',
      latitude: 18.5,
      longitude: 73.8,
    },
    destCoord: [73.8, 18.5],
    arcFactor: 0.24,
    widespread: {
      startYear: 1650,
      label: '17th century',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'Sweet potato reached India along with other New World tubers. It was warmly adopted into Hindu fasting (vrat) traditions because it was classified as a root crop exempt from grain restrictions.',
    historicalNote:
      'Distinct from the native Dioscorea yams, sweet potatoes became an indispensable staple during religious fasts.',
    culinaryUsage: 'Shakarkandi ki chaat, roasted street snacks, and vrat sabzis.',
  }),

  createIngredient({
    id: 'common-bean',
    name: 'Common Bean (Rajma)',
    botanicalName: 'Phaseolus vulgaris',
    category: 'Pulse',
    origin: {
      region: 'Andean & Mesoamerican Highlands',
      latitude: 19.0,
      longitude: -98.0,
    },
    destinationInIndia: {
      region: 'Jammu, Himachal & Uttarakhand',
      latitude: 32.7,
      longitude: 74.8,
    },
    destCoord: [74.8, 32.7],
    arcFactor: 0.2,
    widespread: {
      startYear: 1800,
      label: 'Late 18th to early 19th century',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'While India is the ancient heartland of lentils and grams, kidney beans (rajma) originated in the Americas. They thrived particularly in the cool Himalayan valleys of Kashmir and Himachal Pradesh.',
    historicalNote:
      'Rajma-chawal is today considered the quintessential comfort dish of North India, despite having entered Indian kitchens only two centuries ago.',
    culinaryUsage: 'Slow-simmered Punjabi and Kashmiri Rajma served over steaming basmati rice.',
  }),

  // ==========================================
  // OLD WORLD MIGRANTS (LEVANT, AFRICA, EUROPE)
  // ==========================================
  createIngredient({
    id: 'coffee',
    name: 'Coffee',
    botanicalName: 'Coffea arabica',
    category: 'Beverage',
    origin: {
      region: 'Kaffa Highlands, Ethiopia & Yemen',
      latitude: 7.5,
      longitude: 36.8,
    },
    destinationInIndia: {
      region: 'Chikmagalur & Baba Budan Giri, Karnataka',
      latitude: 13.3,
      longitude: 75.7,
    },
    destCoord: [75.7, 13.3],
    arcFactor: 0.16,
    widespread: {
      startYear: 1670,
      label: 'Late 17th century (Baba Budan pilgrimage)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Legend holds that the 17th-century Sufi saint Baba Budan smuggled seven raw coffee beans strapped to his chest out of the Yemeni port of Mocha, planting them in the verdant Chandragiri hills of Karnataka.',
    historicalNote:
      'Commercial coffee estates were formally expanded under British administration in the 1830s, giving birth to South Indian filter coffee culture.',
    culinaryUsage: 'South Indian Degree filter coffee brewed in brass dabarah-tumblers.',
  }),

  createIngredient({
    id: 'cauliflower',
    name: 'Cauliflower',
    botanicalName: 'Brassica oleracea var. botrytis',
    category: 'Vegetable',
    origin: {
      region: 'Eastern Mediterranean & Western Europe',
      latitude: 35.0,
      longitude: 33.0,
    },
    destinationInIndia: {
      region: 'Saharanpur Botanical Gardens, Uttar Pradesh',
      latitude: 29.9,
      longitude: 77.5,
    },
    destCoord: [77.5, 29.9],
    arcFactor: 0.14,
    widespread: {
      startYear: 1822,
      label: '1822 CE (Introduced by Dr. Jemson at Saharanpur)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Introduced from England in 1822 by Dr. Jemson of the Royal Botanic Gardens at Saharanpur, cauliflower adapted surprisingly well to the northern Indian winter plains, spawning heat-tolerant Indian tropical varieties.',
    historicalNote:
      'Within decades of colonial introduction, Indian growers bred seeds that could head in warm temperatures, transforming it into an everyday winter vegetable across India.',
    culinaryUsage: 'Aloo gobi, gobi parathas, and tandoori gobi.',
  }),

  createIngredient({
    id: 'avocado',
    name: 'Avocado',
    botanicalName: 'Persea americana',
    category: 'Fruit',
    origin: {
      region: 'Puebla / Central Mexico',
      latitude: 19.0,
      longitude: -98.2,
    },
    destinationInIndia: {
      region: 'Coorg, Nilgiris & Tamil Nadu',
      latitude: 11.4,
      longitude: 76.7,
    },
    destCoord: [76.7, 11.4],
    arcFactor: 0.22,
    widespread: {
      startYear: 1940,
      label: 'Mid-20th century (Plantation hill stations)',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'Introduced via Ceylon (Sri Lanka) to the coffee estates of the Western Ghats (Kodagu and Nilgiris) in the early-to-mid 20th century. Known locally as "butter fruit", it has recently experienced a major urban revival.',
    historicalNote:
      'Traditionally served in the south with a spoonful of sugar and milk as a cooling fruit puree rather than savory guacamole.',
    culinaryUsage: 'Butter fruit milkshakes in Bengaluru/Coorg; modern artisanal salads.',
  }),

  createIngredient({
    id: 'dragon-fruit',
    name: 'Dragon Fruit (Kamalam)',
    botanicalName: 'Selenicereus undatus',
    category: 'Fruit',
    origin: {
      region: 'Southern Mexico & Central America',
      latitude: 16.5,
      longitude: -93.0,
    },
    destinationInIndia: {
      region: 'Kutch, Gujarat & Maharashtra',
      latitude: 23.2,
      longitude: 69.6,
    },
    destCoord: [69.6, 23.2],
    arcFactor: 0.23,
    widespread: {
      startYear: 2012,
      label: 'Early 21st century',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'A recent arrival from the Americas via Southeast Asian markets, this drought-resilient climbing cactus has seen exponential cultivation across arid districts of Gujarat, Karnataka, and Maharashtra.',
    historicalNote:
      'Renamed "Kamalam" by Gujarat authorities due to its lotus-like exterior, demonstrating how foreign domestications continue to be integrated into Indian culture today.',
    culinaryUsage: 'Fresh breakfast bowls, fruit platters, and juice kiosks.',
  }),

  createIngredient({
    id: 'tea',
    name: 'Tea (Chai)',
    botanicalName: 'Camellia sinensis var. assamica',
    category: 'Beverage',
    origin: {
      region: 'Assam / Yunnan Borderlands',
      latitude: 25.5,
      longitude: 94.0,
    },
    destinationInIndia: {
      region: 'Upper Assam & Darjeeling',
      latitude: 26.8,
      longitude: 94.5,
    },
    destCoord: [94.5, 26.8],
    arcFactor: 0.1,
    widespread: {
      startYear: 1840,
      label: 'Mid-19th century (British commercialization)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'While indigenous tribes like the Singpho and Khamti in Upper Assam brewed wild tea leaves for centuries, tea was commercially turned into India’s national drink by the British in the 1840s to break China’s monopoly.',
    historicalNote:
      'Robert Bruce was shown wild tea trees by Singpho Chief Bisa Gam in 1823, sparking the industrial plantation era in Assam and the later invention of spiced masala chai.',
    culinaryUsage: 'Masala chai brewed with milk, cardamom, ginger, and sugar on every Indian corner.',
  }),

  createIngredient({
    id: 'wheat',
    name: 'Wheat',
    botanicalName: 'Triticum aestivum / durum',
    category: 'Grain',
    origin: {
      region: 'Fertile Crescent (Levant & Anatolia)',
      latitude: 36.5,
      longitude: 37.5,
    },
    destinationInIndia: {
      region: 'Indus Valley & Mehrgarh, Punjab',
      latitude: 29.4,
      longitude: 67.6,
    },
    destCoord: [75.0, 30.5],
    arcFactor: 0.12,
    widespread: {
      startYear: -2500,
      label: 'Early Bronze Age (~2500 BCE, Harappan)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Domesticated in Southwest Asia around 9000 BCE, wheat reached the northwestern subcontinent by the 6th millennium BCE (Mehrgarh) and formed the carbohydrate backbone of the Mature Harappan Civilisation.',
    historicalNote:
      'Rigvedic hymns mention godhuma (wheat), which evolved into the cornerstone of North Indian tandoori and griddled breads.',
    culinaryUsage: 'Roti, chapati, paratha, puri, naan, and semolina halwa.',
  }),

  createIngredient({
    id: 'chickpea',
    name: 'Chickpea (Chana)',
    botanicalName: 'Cicer arietinum',
    category: 'Pulse',
    origin: {
      region: 'Southeastern Anatolia & Levant',
      latitude: 37.5,
      longitude: 38.5,
    },
    destinationInIndia: {
      region: 'Northwest India & Gangetic Plain',
      latitude: 28.6,
      longitude: 77.2,
    },
    destCoord: [77.2, 28.6],
    arcFactor: 0.13,
    widespread: {
      startYear: -2000,
      label: 'Late Harappan (~2000 BCE)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'From its Neolithic origins in Turkey and the Levant, chickpeas entered the Indus Valley by 2000 BCE. India subsequently developed the smaller, darker "Desi" type (Kala Chana) and became the globe’s leading consumer.',
    historicalNote:
      'Ancient Sanskrit texts identify it as chanaka; the larger cream-colored variety became known as "Kabuli" denoting its route through Kabul, Afghanistan.',
    culinaryUsage: 'Chole bhature, besan (gram flour), dhokla, kadhi, and roasted chana.',
  }),

  createIngredient({
    id: 'lentil',
    name: 'Lentil (Masoor)',
    botanicalName: 'Lens culinaris',
    category: 'Pulse',
    origin: {
      region: 'Near East / Fertile Crescent',
      latitude: 34.5,
      longitude: 36.0,
    },
    destinationInIndia: {
      region: 'Harappan sites & Ganga Basin',
      latitude: 26.8,
      longitude: 80.9,
    },
    destCoord: [80.9, 26.8],
    arcFactor: 0.14,
    widespread: {
      startYear: -2000,
      label: 'Bronze Age (~2000 BCE)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Lentils migrated into the northwestern subcontinent along early agricultural trade corridors. They rapidly became a key protein staple across the agrarian plains of the Ganga and Yamuna.',
    historicalNote:
      'Archaeological finds in Navdatoli and Harappan sites confirm lentils were integral to the Indian diet for over four millennia.',
    culinaryUsage: 'Masoor dal, khichdi, and comforting daily dal tadkas.',
  }),

  createIngredient({
    id: 'onion',
    name: 'Onion (Pyaz)',
    botanicalName: 'Allium cepa',
    category: 'Vegetable',
    origin: {
      region: 'Central Asia & Iranian Plateau',
      latitude: 35.0,
      longitude: 65.0,
    },
    destinationInIndia: {
      region: 'Northwest India & Maharashtra',
      latitude: 20.0,
      longitude: 74.0,
    },
    destCoord: [74.0, 20.0],
    arcFactor: 0.11,
    widespread: {
      startYear: -800,
      label: '1st millennium BCE (~800 BCE)',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'Native to Central Asia and Western Asia, onions entered India during the first millennium BCE. Early Ayurvedic medical compendiums like Charaka Samhita praised their medicinal efficacy while noting religious ascetic taboos.',
    historicalNote:
      'Known as palandu in Sanskrit, onions were shunned by orthodox Brahmin and Jain ascetics for their rajasic (stimulating) qualities, yet embraced in royal and commoner cooking.',
    culinaryUsage: 'Foundation of Indian gravies, biryanis, raw kachumber, and pakoras.',
  }),

  createIngredient({
    id: 'garlic',
    name: 'Garlic (Lahsun)',
    botanicalName: 'Allium sativum',
    category: 'Spice',
    origin: {
      region: 'Central Asia / Tien Shan',
      latitude: 42.0,
      longitude: 75.0,
    },
    destinationInIndia: {
      region: 'Northwestern Subcontinent',
      latitude: 30.0,
      longitude: 74.5,
    },
    destCoord: [74.5, 30.0],
    arcFactor: 0.12,
    widespread: {
      startYear: -1000,
      label: 'Ancient (~1000 BCE)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Garlic migrated into India from the wild mountains of Central Asia. The 4th-century CE Bower Manuscript found on the Silk Road contains an entire treatise on garlic’s divine healing powers.',
    historicalNote:
      'Ayurveda names it rasona (lacking one taste) because it possesses five of the six Ayurvedic rasas (all except sour).',
    culinaryUsage: 'Ginger-garlic paste, dal tadkas, spicy chutneys, and pickles.',
  }),

  createIngredient({
    id: 'cumin',
    name: 'Cumin (Jeera)',
    botanicalName: 'Cuminum cyminum',
    category: 'Spice',
    origin: {
      region: 'Eastern Mediterranean & Levant',
      latitude: 34.0,
      longitude: 36.0,
    },
    destinationInIndia: {
      region: 'Gujarat & Rajasthan',
      latitude: 24.5,
      longitude: 72.8,
    },
    destCoord: [72.8, 24.5],
    arcFactor: 0.13,
    widespread: {
      startYear: -1000,
      label: 'Ancient (~1000 BCE)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Cumin was cultivated in the Mediterranean and Mesopotamia before spreading across Persia into western India. Today, Gujarat and Rajasthan grow and export the lion’s share of global cumin.',
    historicalNote:
      'The Sanskrit term jiraka stems from the root "jri", meaning that which aids digestion.',
    culinaryUsage: 'Essential tempering (tadka/chaunk) spice for almost every Indian dish; jeera rice.',
  }),

  createIngredient({
    id: 'coriander',
    name: 'Coriander (Dhania)',
    botanicalName: 'Coriandrum sativum',
    category: 'Spice',
    origin: {
      region: 'Southern Europe & Mediterranean',
      latitude: 38.0,
      longitude: 23.5,
    },
    destinationInIndia: {
      region: 'Indo-Gangetic Plain',
      latitude: 26.0,
      longitude: 78.0,
    },
    destCoord: [78.0, 26.0],
    arcFactor: 0.14,
    widespread: {
      startYear: -1000,
      label: 'Ancient (~1000 BCE)',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'One of the oldest cultivated herbs, coriander traveled via ancient Silk and spice routes into India where both its citrusy seeds and tender leaves became foundational to the spice box.',
    historicalNote:
      'Mentioned in Sanskrit treatises as dhanyaka, celebrated for balancing the heat of pungent spices.',
    culinaryUsage: 'Ground coriander seed powder in gravies; chopped fresh leaves as universal garnish.',
  }),

  createIngredient({
    id: 'okra',
    name: 'Okra (Bhindi)',
    botanicalName: 'Abelmoschus esculentus',
    category: 'Vegetable',
    origin: {
      region: 'Horn of Africa / Ethiopia',
      latitude: 9.0,
      longitude: 39.0,
    },
    destinationInIndia: {
      region: 'Western Indian Coast & Deccan',
      latitude: 19.0,
      longitude: 73.0,
    },
    destCoord: [73.0, 19.0],
    arcFactor: 0.15,
    widespread: {
      startYear: 1200,
      label: 'Medieval Era (~1200 CE)',
    },
    nativeToSubcontinent: false,
    confidence: 'medium',
    illustration: null,
    description:
      'Native to Ethiopia and West Africa, okra traveled across the Red Sea and Arabian Sea through vibrant medieval maritime trade between East Africa and the Indian subcontinent.',
    historicalNote:
      'Referred to in vernacular Indian cookery as "lady finger" during the colonial era; prized for its crisp texture when cooked dry with amchur.',
    culinaryUsage: 'Bhindi masala, kurkuri bhindi, and South Indian vendakkai sambar.',
  }),

  // ==========================================
  // NATIVE INDIAN / SUBCONTINENTAL FOUNDATIONS
  // ==========================================
  createIngredient({
    id: 'black-pepper',
    name: 'Black Pepper',
    botanicalName: 'Piper nigrum',
    category: 'Spice',
    origin: {
      region: 'Western Ghats, Kerala (Malabar)',
      latitude: 10.2,
      longitude: 76.3,
    },
    destinationInIndia: {
      region: 'Malabar Coast & Pan-India',
      latitude: 10.2,
      longitude: 76.3,
    },
    destCoord: [76.3, 10.2],
    arcFactor: 0.05,
    widespread: {
      startYear: -2000,
      label: 'Ancient (~2000 BCE, Western Ghats)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'The "King of Spices" and the indigenous black gold that launched a thousand maritime voyages. Indigenous to the evergreen rainforests of the Western Ghats, black pepper was the original source of heat in Indian cooking long before chillies.',
    historicalNote:
      'Pliny the Elder famously complained that Rome sent 50 million sesterces annually to India for black pepper. Peppercorns were even found stuffed into the nostrils of Egyptian Pharaoh Ramesses II (d. 1213 BCE).',
    culinaryUsage: 'Milagu rasam, South Indian ven pongal, garam masala, and ancient Ayurvedic medicines.',
  }),

  createIngredient({
    id: 'turmeric',
    name: 'Turmeric (Haldi)',
    botanicalName: 'Curcuma longa',
    category: 'Spice',
    origin: {
      region: 'Indian Subcontinent / Southern India',
      latitude: 15.0,
      longitude: 77.0,
    },
    destinationInIndia: {
      region: 'Pan-Indian Cultivation',
      latitude: 17.0,
      longitude: 78.5,
    },
    destCoord: [78.5, 17.0],
    arcFactor: 0.05,
    widespread: {
      startYear: -2500,
      label: 'Harappan Civilisation (~2500 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'The golden soul of Indian culinary and spiritual life. Residue analysis of Harappan cooking pots at Farmana (Haryana) confirmed turmeric and ginger used in curry dishes over 4,500 years ago.',
    historicalNote:
      'Called haridra (beloved of Hari) in Sanskrit; sacred in Vedic rituals for its purifying, antimicrobial, and auspicious qualities.',
    culinaryUsage: 'Everyday curries, golden haldi doodh, auspicious ceremonies, and Ayurvedic healing.',
  }),

  createIngredient({
    id: 'ginger',
    name: 'Ginger (Adrak)',
    botanicalName: 'Zingiber officinale',
    category: 'Spice',
    origin: {
      region: 'Tropical South Asia & Rainforests',
      latitude: 13.5,
      longitude: 76.0,
    },
    destinationInIndia: {
      region: 'Pan-Indian Subcontinent',
      latitude: 21.0,
      longitude: 78.0,
    },
    destCoord: [78.0, 21.0],
    arcFactor: 0.05,
    widespread: {
      startYear: -2500,
      label: 'Harappan Civilisation (~2500 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'Indigenous to South Asia, ginger is one of humanity’s oldest medicinal spices. Archaeological starch grain analysis confirms its continuous culinary presence in India since the Bronze Age.',
    historicalNote:
      'The Sanskrit word shringavera (horn-shaped body) gave rise to the Greek zingiberis and English ginger.',
    culinaryUsage: 'Adrak wali chai, ginger-garlic aromatics, subzis, and Ayurvedic digestion tonics.',
  }),

  createIngredient({
    id: 'cardamom',
    name: 'Green Cardamom (Elaichi)',
    botanicalName: 'Elettaria cardamomum',
    category: 'Spice',
    origin: {
      region: 'Cardamom Hills, Western Ghats',
      latitude: 9.8,
      longitude: 77.1,
    },
    destinationInIndia: {
      region: 'Cardamom Hills & Pan-India',
      latitude: 9.8,
      longitude: 77.1,
    },
    destCoord: [77.1, 9.8],
    arcFactor: 0.05,
    widespread: {
      startYear: -1000,
      label: 'Ancient (~1000 BCE, Western Ghats)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'Known as the "Queen of Spices", green cardamom is indigenous to the mist-shrouded montane rainforests of the southern Western Ghats (Kerala and Tamil Nadu).',
    historicalNote:
      'Mentioned in the Sanskrit Charaka Samhita and exported through ancient Indian Ocean trade routes to Greece and Rome as a luxury aromatic.',
    culinaryUsage: 'Biryanis, kheer, payasam, chai, sweet mithai, and mouth fresheners.',
  }),

  createIngredient({
    id: 'mango',
    name: 'Mango (Aam)',
    botanicalName: 'Mangifera indica',
    category: 'Fruit',
    origin: {
      region: 'Northeastern India & Myanmar Borderlands',
      latitude: 24.0,
      longitude: 93.0,
    },
    destinationInIndia: {
      region: 'Pan-Indian Subcontinent',
      latitude: 20.0,
      longitude: 78.0,
    },
    destCoord: [78.0, 20.0],
    arcFactor: 0.06,
    widespread: {
      startYear: -2000,
      label: 'Ancient (~2000 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'Revered as the "King of Fruits" and the national fruit of India, mango has been cultivated across the subcontinent for over 4,000 years, producing thousands of distinct regional cultivars (Alphonso, Dasheri, Langra, Banganapalli).',
    historicalNote:
      'Praised in the Brihadaranyaka Upanishad; the Buddha was gifted a mango grove in Rajgir by the physician Jivaka as a sanctuary.',
    culinaryUsage: 'Aamras, mango lassi, kacha aam panna, pickles, and ripe summer feasts.',
  }),

  createIngredient({
    id: 'jackfruit',
    name: 'Jackfruit (Kathal)',
    botanicalName: 'Artocarpus heterophyllus',
    category: 'Fruit',
    origin: {
      region: 'Western Ghats Rainforests',
      latitude: 11.0,
      longitude: 76.0,
    },
    destinationInIndia: {
      region: 'Western Ghats & Eastern India',
      latitude: 15.0,
      longitude: 74.0,
    },
    destCoord: [74.0, 15.0],
    arcFactor: 0.05,
    widespread: {
      startYear: -2000,
      label: 'Ancient (~2000 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'The largest tree-borne fruit in the world is indigenous to the rainforests of the Western Ghats. In ancient Tamil Sangam poetry, it was crowned as one of the three royal fruits ("mukkani": mango, banana, jackfruit).',
    historicalNote:
      'Green tender jackfruit has functioned as an ancient vegetarian meat substitute in Indian cooking for millennia.',
    culinaryUsage: 'Raw kathal ki sabzi, Kerala chakka varatti, and deep-fried jackfruit chips.',
  }),

  createIngredient({
    id: 'rice',
    name: 'Rice (Chawal)',
    botanicalName: 'Oryza sativa indica',
    category: 'Grain',
    origin: {
      region: 'Gangetic Plain / Lahuradewa & Yangtze',
      latitude: 26.5,
      longitude: 83.0,
    },
    destinationInIndia: {
      region: 'Pan-Indian River Basins',
      latitude: 22.0,
      longitude: 82.0,
    },
    destCoord: [82.0, 22.0],
    arcFactor: 0.05,
    widespread: {
      startYear: -3000,
      label: 'Neolithic (~3000 BCE / Lahuradewa ~6500 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'Indica rice was independently domesticated along the middle Gangetic plain (evidenced at Lahuradewa, UP). It is the sacred, foundational carbohydrate of South Asian civilization.',
    historicalNote:
      'Vedic scriptures celebrate akshata (unbroken rice grains) as symbols of fertility, life, and abundance in every Hindu rite of passage.',
    culinaryUsage: 'Steamed rice, biryani, idli, dosa, kheer, and fermented regional batters.',
  }),

  createIngredient({
    id: 'banana',
    name: 'Banana & Plantain',
    botanicalName: 'Musa acuminata / balbisiana',
    category: 'Fruit',
    origin: {
      region: 'Southeast Asia / Indo-Malayan Archipelago',
      latitude: 3.5,
      longitude: 101.5,
    },
    destinationInIndia: {
      region: 'Coromandel, Kerala & Assam',
      latitude: 10.8,
      longitude: 78.6,
    },
    destCoord: [78.6, 10.8],
    arcFactor: 0.12,
    widespread: {
      startYear: -1500,
      label: 'Ancient (~1500 BCE)',
    },
    nativeToSubcontinent: false,
    confidence: 'high',
    illustration: null,
    description:
      'Bananas arrived in southern India through early maritime contacts across the Bay of Bengal during the Bronze Age. In South India, every single part of the plant fruit, flower, stem, and leaf is consumed or used as sacred tableware.',
    historicalNote:
      'Known as kadali in Sanskrit; served traditionally on fresh green banana leaves (ilayil oonu) across Kerala and Tamil Nadu.',
    culinaryUsage: 'Banana chips, vazhaipoo (banana blossom) vadai, raw plantain thoran, and ripe fruit offerings.',
  }),

  createIngredient({
    id: 'sugarcane',
    name: 'Sugarcane & Jaggery (Gur)',
    botanicalName: 'Saccharum officinarum / barberi',
    category: 'Oil & Sweetener',
    origin: {
      region: 'New Guinea & Tropical India',
      latitude: 18.0,
      longitude: 84.0,
    },
    destinationInIndia: {
      region: 'Northern River Basins & Maharashtra',
      latitude: 25.0,
      longitude: 82.0,
    },
    destCoord: [82.0, 25.0],
    arcFactor: 0.05,
    widespread: {
      startYear: -2000,
      label: 'Ancient (~2000 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'India was the birthplace of granulated crystal sugar. While wild canes grew in the tropics, Indian artisans during the Gupta period (~350 CE) pioneered the chemical process of crystallizing sugarcane juice into granulated "sharkara" (the etymological root of "sugar").',
    historicalNote:
      'The Atharvaveda mentions "ikshu" (sugarcane), and Buddhist texts recount traveling Indian merchants who introduced crystalline sugar to China.',
    culinaryUsage: 'Traditional unrefined gur (jaggery), mithai, payasam, and sugarcane juice.',
  }),

  createIngredient({
    id: 'sesame',
    name: 'Sesame (Til)',
    botanicalName: 'Sesamum indicum',
    category: 'Nut & Seed',
    origin: {
      region: 'Indus Valley / Subcontinent',
      latitude: 27.5,
      longitude: 69.5,
    },
    destinationInIndia: {
      region: 'Indus Valley & Pan-India',
      latitude: 24.0,
      longitude: 76.0,
    },
    destCoord: [76.0, 24.0],
    arcFactor: 0.05,
    widespread: {
      startYear: -2500,
      label: 'Harappan Civilisation (~2500 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'One of humanity’s oldest cultivated oilseeds. The Sanskrit word for oil, "taila", is directly derived from "tila" (sesame), testifying that sesame was the primordial cooking oil of ancient India.',
    historicalNote:
      'Charred sesame seeds have been recovered from Harappa and Mohenjo-daro excavations; til remains sacred in Hindu shraddha ancestral rituals.',
    culinaryUsage: 'Gingelly (sesame) oil, til ladoos, Makar Sankranti sweets, and spice powders (milagai podi).',
  }),

  createIngredient({
    id: 'mustard-seed',
    name: 'Mustard Seed (Sarson)',
    botanicalName: 'Brassica juncea / nigra',
    category: 'Spice',
    origin: {
      region: 'Himalayan Foothills & Subcontinent',
      latitude: 30.5,
      longitude: 77.0,
    },
    destinationInIndia: {
      region: 'Bengal, Punjab & Eastern India',
      latitude: 24.0,
      longitude: 86.0,
    },
    destCoord: [86.0, 24.0],
    arcFactor: 0.05,
    widespread: {
      startYear: -2500,
      label: 'Harappan Civilisation (~2500 BCE)',
    },
    nativeToSubcontinent: true,
    confidence: 'high',
    illustration: null,
    description:
      'Found in abundance at Chanhu-daro and Harappan sites, mustard seeds and pungent mustard oil have seasoned eastern and northern Indian fare for millennia.',
    historicalNote:
      'Sarson is immortalized in the famous Buddhist parable of Kisa Gotami, where the Buddha asks her to fetch a handful of mustard seeds from a house that had never witnessed death.',
    culinaryUsage: 'Sarson ka saag, Bengali shorshe maach (mustard fish), and crackling tadka seeds.',
  }),
];

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find((ing) => ing.id === id);
}

export function getVisibleIngredients(year: number): Ingredient[] {
  return INGREDIENTS.filter((ing) => year >= ing.widespread.startYear);
}

export function getIngredientCategories(): string[] {
  return Array.from(new Set(INGREDIENTS.map((ing) => ing.category)));
}
