import fs from 'fs';
import { generateCurvedRoute } from '../src/utils/geo.ts';

// We can read INGREDIENTS or build it
import { INGREDIENTS } from '../src/data/ingredients.ts';

fs.mkdirSync('./data', { recursive: true });
fs.writeFileSync('./data/ingredients.json', JSON.stringify(INGREDIENTS, null, 2), 'utf-8');
console.log(`Successfully generated data/ingredients.json with ${INGREDIENTS.length} ingredients.`);
