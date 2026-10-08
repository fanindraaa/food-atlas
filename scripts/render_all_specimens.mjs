import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const promptCatalog = JSON.parse(fs.readFileSync('data/ingredient-prompts.json', 'utf8'));
const ingredients150 = JSON.parse(fs.readFileSync('src/data/india-food-journey-150.json', 'utf8'));
const ingredients35 = JSON.parse(fs.readFileSync('data/ingredients.json', 'utf8'));

fs.mkdirSync('public/ingredients', { recursive: true });
fs.mkdirSync('scratch/svgs', { recursive: true });

// Check existing preserved AI illustrations
const preservedIds = new Set(['chilli', 'chilli-pepper', 'garlic']);

// Botanical SVG generator tailored per ingredient type
function generateBotanicalSvg(item) {
  const p = item.primaryColor || '#8C6845';
  const s = item.secondaryColor || '#5A3E28';
  const name = item.name;
  const id = item.id;
  const cat = item.category;

  // Contact shadow
  const shadow = `<ellipse cx="512" cy="760" rx="230" ry="24" fill="#2B2620" opacity="0.12"/>`;

  let artwork = '';

  if (cat === 'Grain') {
    // Grain spike / panicle with delicate seeds
    artwork = `
      <g transform="translate(512, 490) rotate(-10)">
        <!-- Stem -->
        <path d="M 0,260 Q -15,50 -2,-250" stroke="${s}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Grains left & right -->
        ${[-210, -170, -130, -90, -50, -10, 30, 70, 110, 150].map((y, idx) => {
          const rotL = -35 - idx * 2;
          const rotR = 35 + idx * 2;
          return `
            <g transform="translate(-10, ${y}) rotate(${rotL})">
              <path d="M 0,0 C 25,-18 55,-10 65,15 C 55,40 25,32 0,0 Z" fill="${p}" stroke="${s}" stroke-width="2"/>
              <path d="M 65,15 L 115,-30" stroke="${s}" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M 12,2 Q 40,5 55,18" stroke="#FFF7D6" stroke-width="2" fill="none" opacity="0.6"/>
            </g>
            <g transform="translate(10, ${y + 18}) rotate(${rotR})">
              <path d="M 0,0 C -25,-18 -55,-10 -65,15 C -55,40 -25,32 0,0 Z" fill="${p}" stroke="${s}" stroke-width="2"/>
              <path d="M -65,15 L -115,-30" stroke="${s}" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M -12,2 Q -40,5 -55,18" stroke="#FFF7D6" stroke-width="2" fill="none" opacity="0.6"/>
            </g>
          `;
        }).join('')}
        <!-- Loose grains at bottom -->
        <g transform="translate(-70, 240)">
          <ellipse cx="0" cy="0" rx="14" ry="7" fill="${p}" stroke="${s}" stroke-width="1.5" transform="rotate(-20)"/>
          <ellipse cx="25" cy="8" rx="13" ry="6" fill="${p}" stroke="${s}" stroke-width="1.5" transform="rotate(15)"/>
          <ellipse cx="45" cy="-2" rx="12" ry="6.5" fill="${p}" stroke="${s}" stroke-width="1.5" transform="rotate(-5)"/>
        </g>
      </g>
    `;
  } else if (cat === 'Pulse') {
    // Pod + individual beans
    artwork = `
      <g transform="translate(480, 480)">
        <!-- Pod body -->
        <g transform="rotate(-22)">
          <path d="M -180,-120 C -60,-170 120,-160 210,-90 C 235,-70 230,-40 200,-30 C 110,0 -80,20 -195,-25 C -225,-35 -220,-80 -180,-120 Z"
                fill="${s}" stroke="#3D2918" stroke-width="3"/>
          <path d="M -170,-115 C -55,-155 110,-145 195,-85 C 180,-65 110,-35 0,-40 C -90,-45 -150,-80 -170,-115 Z"
                fill="${p}" stroke="${s}" stroke-width="2"/>
          <!-- Exposed succulent peas/beans nestled inside -->
          <circle cx="-100" cy="-85" r="24" fill="${p}" stroke="#2B1A10" stroke-width="2.5"/>
          <circle cx="-35" cy="-75" r="25" fill="${p}" stroke="#2B1A10" stroke-width="2.5"/>
          <circle cx="35" cy="-70" r="25" fill="${p}" stroke="#2B1A10" stroke-width="2.5"/>
          <circle cx="105" cy="-65" r="23" fill="${p}" stroke="#2B1A10" stroke-width="2.5"/>
          <circle cx="165" cy="-68" r="20" fill="${p}" stroke="#2B1A10" stroke-width="2.5"/>
          <!-- Gouache highlights -->
          <circle cx="-105" cy="-90" r="8" fill="#FFF8E0" opacity="0.6"/>
          <circle cx="-40" cy="-80" r="8" fill="#FFF8E0" opacity="0.6"/>
          <circle cx="30" cy="-75" r="8" fill="#FFF8E0" opacity="0.6"/>
          <circle cx="100" cy="-70" r="7" fill="#FFF8E0" opacity="0.6"/>
          <!-- Stem -->
          <path d="M -210,-55 C -245,-60 -265,-80 -275,-110" stroke="#4F6627" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        </g>
        <!-- Individual scattered beans in foreground -->
        <g transform="translate(60, 180)">
          <path d="M -60,0 C -60,-22 -30,-28 0,-15 C 25,-2 28,25 5,30 C -25,32 -60,20 -60,0 Z" fill="${p}" stroke="#2B1A10" stroke-width="2.5"/>
          <ellipse cx="-15" cy="5" rx="5" ry="9" fill="#FFF" opacity="0.9" transform="rotate(-15, -15, 5)"/>
          <path d="M 40,15 C 40,-5 65,-12 85,0 C 105,12 100,32 85,38 C 65,42 40,32 40,15 Z" fill="${p}" stroke="#2B1A10" stroke-width="2.5"/>
          <ellipse cx="68" cy="18" rx="4" ry="7" fill="#FFF" opacity="0.9" transform="rotate(10, 68, 18)"/>
        </g>
      </g>
    `;
  } else if (cat.includes('Vegetable') || cat.includes('Tuber') || cat.includes('Root')) {
    // Hero vegetable / tuber with cut section
    artwork = `
      <g transform="translate(512, 480)">
        <!-- Main body -->
        <g transform="translate(40, -20) rotate(-8)">
          <path d="M -160,-170 C -40,-220 120,-190 180,-80 C 230,20 200,160 110,210 C 20,250 -120,220 -180,130 C -230,40 -220,-80 -160,-170 Z"
                fill="${p}" stroke="${s}" stroke-width="3.5" stroke-linejoin="round"/>
          <!-- Tonal gouache shadow & wash -->
          <path d="M -140,-130 C -40,-180 80,-160 140,-70 C 180,10 160,120 90,170 C 50,110 -20,40 -80,-40 C -120,-90 -140,-130 -140,-130 Z"
                fill="#FFF" opacity="0.18"/>
          <!-- Stem or calyx -->
          <path d="M -10,-205 C 5,-240 -15,-270 -8,-285 C 2,-285 20,-260 12,-205 Z" fill="#4D6B28" stroke="#2D4214" stroke-width="2.5"/>
          <!-- Botanical skin marks/dots -->
          <circle cx="-70" cy="50" r="3.5" fill="${s}" opacity="0.7"/>
          <circle cx="80" cy="-20" r="4" fill="${s}" opacity="0.7"/>
          <circle cx="40" cy="110" r="3.5" fill="${s}" opacity="0.7"/>
        </g>
        <!-- Cut halved section -->
        <g transform="translate(-130, 90) rotate(12)">
          <ellipse cx="0" cy="0" rx="140" ry="115" fill="${s}" stroke="#2B1A0E" stroke-width="3"/>
          <ellipse cx="-5" cy="-2" rx="122" ry="98" fill="${s === p ? '#FFF2D6' : s}" stroke="${p}" stroke-width="2.5"/>
          <!-- Core / internal rings -->
          <ellipse cx="-5" cy="-2" rx="80" ry="60" fill="none" stroke="${p}" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>
          <ellipse cx="-5" cy="-2" rx="40" ry="28" fill="${p}" opacity="0.3"/>
          <!-- Gouache sheen -->
          <path d="M -50,-50 Q -10,-70 40,-45" stroke="#FFF" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.5"/>
        </g>
      </g>
    `;
  } else if (cat.includes('Fruit')) {
    // Hero fruit with succulent cut slice & leaf
    artwork = `
      <g transform="translate(512, 470)">
        <!-- Hero fruit -->
        <g transform="translate(35, -25) rotate(-6)">
          <path d="M -160,-180 C -30,-230 140,-180 185,-60 C 220,50 180,180 80,225 C -20,260 -150,210 -195,110 C -230,10 -210,-110 -160,-180 Z"
                fill="${p}" stroke="${s}" stroke-width="3.5"/>
          <!-- Blush wash -->
          <path d="M -110,-140 C 0,-180 120,-140 150,-40 C 170,40 130,120 50,150 C -40,110 -90,20 -110,-140 Z"
                fill="${s}" opacity="0.45"/>
          <!-- Highlight -->
          <path d="M -90,-110 C -40,-140 30,-140 70,-100 C 40,-80 -20,-75 -60,-65 Z" fill="#FFF7CC" opacity="0.55"/>
          <!-- Pedicel & Leaf -->
          <path d="M -15,-205 C -10,-240 -25,-265 -18,-280 C -10,-280 5,-260 2,-205 Z" fill="#543E26" stroke="#332414" stroke-width="2"/>
          <path d="M 0,-245 C 70,-285 170,-275 220,-225 C 175,-200 95,-205 10,-230 Z" fill="#4B7026" stroke="#253D0E" stroke-width="2.5"/>
          <path d="M 5,-240 Q 110,-245 210,-225" stroke="#7AA346" stroke-width="2" fill="none"/>
        </g>
        <!-- Cut section beside -->
        <g transform="translate(-140, 110) rotate(16)">
          <ellipse cx="0" cy="0" rx="130" ry="105" fill="${s}" stroke="#3D2110" stroke-width="3"/>
          <ellipse cx="-3" cy="-2" rx="115" ry="90" fill="${p}" stroke="${s}" stroke-width="2.5"/>
          <!-- Central seeds / star pattern -->
          <circle cx="-3" cy="-2" r="16" fill="${s}"/>
          <circle cx="-3" cy="-2" r="7" fill="#24140A"/>
          <path d="M -60,-15 Q -10,-35 45,-15" stroke="#FFF7CC" stroke-width="3.5" fill="none" opacity="0.6"/>
        </g>
      </g>
    `;
  } else if (cat.includes('Spice') || cat.includes('Flavouring')) {
    // Botanical spice specimen (seed pods / quills / aromatics)
    artwork = `
      <g transform="translate(512, 480)">
        <!-- Main spice hero piece -->
        <g transform="rotate(-15)">
          <path d="M -80,-210 C 60,-180 110,-50 90,80 C 70,190 -10,240 -60,250 C -110,230 -140,140 -130,20 C -120,-90 -100,-180 -80,-210 Z"
                fill="${p}" stroke="${s}" stroke-width="3"/>
          <!-- Ribs / striations -->
          <path d="M -70,-200 Q 20,20 -50,240" stroke="${s}" stroke-width="3" fill="none" opacity="0.7"/>
          <path d="M -70,-200 Q 60,20 -20,240" stroke="${s}" stroke-width="2.5" fill="none" opacity="0.6"/>
          <path d="M -70,-200 Q -30,20 -80,240" stroke="#FFF" stroke-width="2" fill="none" opacity="0.4"/>
          <!-- Stem attachment -->
          <path d="M -85,248 Q -95,280 -80,295 Q -70,275 -75,248 Z" fill="#523B22" stroke="#332212" stroke-width="2"/>
        </g>
        <!-- Secondary opened piece or scattered spice grains -->
        <g transform="translate(-100, 70) rotate(35)">
          <path d="M -40,-90 C 20,-70 50,-10 40,50 C 30,100 0,130 -30,140 C -10,90 0,30 -15,-30 Z" fill="${p}" stroke="${s}" stroke-width="2.5"/>
          <path d="M -35,-80 C 5,-50 15,-10 5,45 C -5,75 -15,95 -25,105 C -15,70 -10,25 -20,-30 Z" fill="#E8DEC5" opacity="0.9"/>
          <!-- Aromatic dark spice seeds -->
          <circle cx="-10" cy="-5" r="14" fill="${s}" stroke="#1F130B" stroke-width="1.8"/>
          <circle cx="5" cy="12" r="13" fill="${s}" stroke="#1F130B" stroke-width="1.8"/>
          <circle cx="-12" cy="28" r="14" fill="${s}" stroke="#1F130B" stroke-width="1.8"/>
          <circle cx="2" cy="45" r="13" fill="${s}" stroke="#1F130B" stroke-width="1.8"/>
          <circle cx="-8" cy="62" r="12" fill="${s}" stroke="#1F130B" stroke-width="1.8"/>
        </g>
        <!-- Foreground individual seeds -->
        <g transform="translate(40, 160)">
          <ellipse cx="0" cy="0" rx="14" ry="10" fill="${s}" stroke="#1A0F08" stroke-width="2" transform="rotate(-15)"/>
          <ellipse cx="30" cy="12" rx="13" ry="9" fill="${s}" stroke="#1A0F08" stroke-width="2" transform="rotate(25)"/>
          <ellipse cx="55" cy="-5" rx="11" ry="8" fill="${s}" stroke="#1A0F08" stroke-width="2" transform="rotate(-30)"/>
        </g>
      </g>
    `;
  } else if (cat.includes('Nut') || cat.includes('Seed')) {
    // Nut with shell and exposed kernel
    artwork = `
      <g transform="translate(512, 480)">
        <!-- Whole nut / shell -->
        <g transform="translate(40, -20) rotate(-14)">
          <path d="M -120,-160 C 20,-200 140,-150 170,-40 C 190,70 140,180 40,210 C -60,230 -160,170 -180,60 C -190,-40 -160,-130 -120,-160 Z"
                fill="${s}" stroke="#2B1A0E" stroke-width="3"/>
          <path d="M -100,-140 C 20,-175 120,-130 145,-35 C 160,55 120,150 35,175 C -10,130 -40,30 -70,-60 Z"
                fill="${p}" stroke="${s}" stroke-width="2"/>
          <!-- Shell furrow texture -->
          <path d="M -10,-170 Q -40,20 10,195" stroke="#2B1A0E" stroke-width="3" fill="none" opacity="0.6"/>
          <path d="M 40,-150 Q 10,20 60,180" stroke="#2B1A0E" stroke-width="2.5" fill="none" opacity="0.5"/>
        </g>
        <!-- Extracted edible kernel -->
        <g transform="translate(-120, 80) rotate(18)">
          <ellipse cx="0" cy="0" rx="110" ry="85" fill="${p}" stroke="#2B1A0E" stroke-width="3"/>
          <ellipse cx="-4" cy="-3" rx="92" ry="70" fill="#FFF2D6" stroke="${p}" stroke-width="2.5"/>
          <path d="M -50,-10 Q 0,-30 50,-10" stroke="${s}" stroke-width="3" fill="none" opacity="0.6"/>
          <path d="M -35,20 Q 5,5 40,25" stroke="${s}" stroke-width="2.5" fill="none" opacity="0.5"/>
        </g>
      </g>
    `;
  } else if (cat.includes('Herb') || cat.includes('Leaf')) {
    // Botanical branch with paired leaves and aromatic venation
    artwork = `
      <g transform="translate(512, 480)">
        <!-- Central stem -->
        <path d="M 0,260 Q -20,40 -5,-250" stroke="#3D5920" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- Terminal top leaves -->
        <g transform="translate(-5, -250)">
          <path d="M 0,0 C -35,-40 -20,-100 0,-120 C 20,-100 35,-40 0,0 Z" fill="${p}" stroke="#1E330D" stroke-width="2.5"/>
          <path d="M 0,0 L 0,-115" stroke="#7FA84A" stroke-width="2"/>
        </g>
        <!-- Paired lateral leaves -->
        ${[-160, -70, 20, 110].map((y, idx) => {
          const size = 1 + idx * 0.15;
          return `
            <g transform="translate(-10, ${y})">
              <!-- Left leaf -->
              <g transform="rotate(-55) scale(${size})">
                <path d="M 0,0 C -50,-35 -110,-20 -140,25 C -110,65 -50,45 0,0 Z" fill="${p}" stroke="#1E330D" stroke-width="2.5"/>
                <path d="M 0,0 Q -65,15 -135,23" stroke="#7FA84A" stroke-width="2" fill="none"/>
                <!-- Secondary veins -->
                <path d="M -40,7 Q -55,-10 -75,-12" stroke="#7FA84A" stroke-width="1.5" fill="none"/>
                <path d="M -75,13 Q -95,-2 -115,-3" stroke="#7FA84A" stroke-width="1.5" fill="none"/>
              </g>
              <!-- Right leaf -->
              <g transform="translate(20, 15) rotate(55) scale(${size})">
                <path d="M 0,0 C 50,-35 110,-20 140,25 C 110,65 50,45 0,0 Z" fill="${p}" stroke="#1E330D" stroke-width="2.5"/>
                <path d="M 0,0 Q 65,15 135,23" stroke="#7FA84A" stroke-width="2" fill="none"/>
                <path d="M 40,7 Q 55,-10 75,-12" stroke="#7FA84A" stroke-width="1.5" fill="none"/>
                <path d="M 75,13 Q 95,-2 115,-3" stroke="#7FA84A" stroke-width="1.5" fill="none"/>
              </g>
            </g>
          `;
        }).join('')}
      </g>
    `;
  } else {
    // Default botanical specimen
    artwork = `
      <g transform="translate(512, 480)">
        <g transform="rotate(-12)">
          <path d="M -120,-160 C 20,-220 140,-160 170,-40 C 200,80 140,190 30,220 C -70,240 -160,170 -180,60 C -200,-50 -160,-120 -120,-160 Z"
                fill="${p}" stroke="${s}" stroke-width="3.5"/>
          <path d="M -100,-130 C 10,-180 110,-130 135,-30 C 150,60 110,140 25,170 C -30,120 -80,40 -100,-130 Z"
                fill="#FFF" opacity="0.2"/>
        </g>
        <g transform="translate(-100, 90) rotate(18)">
          <ellipse cx="0" cy="0" rx="100" ry="75" fill="${s}" stroke="#2B1A0E" stroke-width="3"/>
          <ellipse cx="-3" cy="-2" rx="85" ry="60" fill="${p}" stroke="${s}" stroke-width="2.5"/>
        </g>
      </g>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  ${shadow}
  ${artwork}
</svg>
`;
}

console.log("Rendering all 150 ingredient specimen plates...");

let renderedCount = 0;
let preservedCount = 0;

for (const ing of ingredients150) {
  const targetPng = path.join('public/ingredients', `${ing.id}.png`);

  if (preservedIds.has(ing.id) && fs.existsSync(targetPng)) {
    console.log(`[PRESERVED AI] ${ing.id} -> ${targetPng}`);
    preservedCount++;
    continue;
  }

  // Render SVG and rasterize via sips to 1024x1024 RGBA PNG
  const svgContent = generateBotanicalSvg(promptCatalog[ing.id] || { id: ing.id, name: ing.name, category: ing.category });
  const tempSvg = path.join('scratch/svgs', `${ing.id}.svg`);
  fs.writeFileSync(tempSvg, svgContent);

  execSync(`sips -z 1024 1024 -s format png "${tempSvg}" -o "${targetPng}"`);
  renderedCount++;
}

console.log(`Completed: ${renderedCount} generated, ${preservedCount} preserved.`);

// Now map 35 dataset IDs
for (const item35 of ingredients35) {
  const target35 = path.join('public/ingredients', `${item35.id}.png`);
  if (!fs.existsSync(target35)) {
    // Check if there is an exact or related file in 150
    const candidates = [
      `${item35.id}.png`,
      `${item35.id}-aloo.png`,
      `${item35.id}-chana.png`,
      `${item35.id}-masoor.png`,
      `${item35.id}-bhindi.png`,
      `${item35.id}-corn.png`,
      `${item35.id}-groundnut.png`,
      `${item35.id}-pepper.png`,
      `${item35.id}-til.png`,
      `green-${item35.id}.png`
    ];
    let matched = false;
    for (const c of candidates) {
      const src = path.join('public/ingredients', c);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, target35);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Generate directly
      const svgContent = generateBotanicalSvg({
        id: item35.id,
        name: item35.name,
        category: item35.category,
        primaryColor: '#C49B5A',
        secondaryColor: '#6B4A28'
      });
      const tempSvg = path.join('scratch/svgs', `${item35.id}.svg`);
      fs.writeFileSync(tempSvg, svgContent);
      execSync(`sips -z 1024 1024 -s format png "${tempSvg}" -o "${target35}"`);
    }
  }
}

// Update JSON files
for (const ing of ingredients150) {
  ing.illustration = `/ingredients/${ing.id}.png`;
}
fs.writeFileSync('src/data/india-food-journey-150.json', JSON.stringify(ingredients150, null, 2), 'utf8');

for (const ing of ingredients35) {
  ing.illustration = `/ingredients/${ing.id}.png`;
}
fs.writeFileSync('data/ingredients.json', JSON.stringify(ingredients35, null, 2), 'utf8');

console.log("Updated src/data/india-food-journey-150.json and data/ingredients.json illustration links!");
