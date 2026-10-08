import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Master AI Illustration Generator & Transparency Pipeline
 * 
 * Uses food_illustration_style.json and data/ingredient-prompts.json to generate
 * authentic hand-painted gouache illustrations with 100% transparent RGBA alpha channels.
 * 
 * Usage:
 *   node scripts/generate_ai_illustrations.mjs --list
 *   node scripts/generate_ai_illustrations.mjs --single chilli
 *   node scripts/generate_ai_illustrations.mjs --all
 */

const STYLE_FILE = 'food_illustration_style.json';
const PROMPT_FILE = 'data/ingredient-prompts.json';
const OUTPUT_DIR = 'public/ingredients';

if (!fs.existsSync(STYLE_FILE) || !fs.existsSync(PROMPT_FILE)) {
  console.error("Missing style or prompt catalog files.");
  process.exit(1);
}

const style = JSON.parse(fs.readFileSync(STYLE_FILE, 'utf8'));
const prompts = JSON.parse(fs.readFileSync(PROMPT_FILE, 'utf8'));
const apiKey = process.env.GEMINI_API_KEY;

const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log(`\nAvailable Ingredients (${Object.keys(prompts).length} total):`);
  for (const [id, data] of Object.entries(prompts)) {
    const exists = fs.existsSync(path.join(OUTPUT_DIR, `${id}.png`));
    console.log(` - [${exists ? '✓' : ' '}] ${id} (${data.name}) - ${data.category}`);
  }
  process.exit(0);
}

console.log("=== Food Atlas Illustration Pipeline ===");
console.log(`Master Style: ${style.styleName} v${style.version}`);
console.log(`Transparency Required: ${style.technicalOutput.transparencyRequired}`);
console.log(`Canvas Resolution: ${style.technicalOutput.recommendedCanvas}`);

if (!apiKey) {
  console.log("\n[INFO] GEMINI_API_KEY environment variable is not set.");
  console.log("You can run with a Gemini API key:");
  console.log("  GEMINI_API_KEY=your_key node scripts/generate_ai_illustrations.mjs --single <id>\n");
  console.log("To render procedural gouache specimen plates, run:");
  console.log("  node scripts/render_all_specimens.mjs\n");
}
