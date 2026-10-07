import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

function createWavBuffer(sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = Math.floor(s < 0 ? s * 0x8000 : s * 0x7fff);
    buffer.writeInt16LE(intVal, 44 + i * 2);
  }

  return buffer;
}

const sampleRate = 44100;

// 1. button-hover: very subtle mechanical tick (approx 12ms)
function generateHover() {
  const duration = 0.015;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 600);
    // Bandpassed tick pulse around 3200Hz + subtle noise
    const osc = Math.sin(2 * Math.PI * 3200 * t) * 0.6 + (Math.random() * 2 - 1) * 0.4;
    samples[i] = osc * env * 0.22;
  }
  return samples;
}

// 2. button-click: tactile mechanical click (approx 25ms, dual impulse)
function generateClick() {
  const duration = 0.028;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Primary sharp contact click
    const env1 = Math.exp(-t * 350);
    const osc1 = Math.sin(2 * Math.PI * 1800 * t) * 0.5 + (Math.random() * 2 - 1) * 0.5;

    // Secondary release bottoming contact around 4ms later
    let osc2 = 0;
    if (t > 0.004) {
      const t2 = t - 0.004;
      const env2 = Math.exp(-t2 * 450);
      osc2 = (Math.sin(2 * Math.PI * 900 * t2) * 0.4 + (Math.random() * 2 - 1) * 0.3) * env2;
    }

    // Low end mechanical body bump
    const lowThud = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 200) * 0.3;

    samples[i] = (osc1 * env1 * 0.5 + osc2 * 0.4 + lowThud) * 0.45;
  }
  return samples;
}

// 3. slider-tick: very subtle mechanical movement detent (approx 8ms)
function generateSliderTick() {
  const duration = 0.01;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 800);
    const osc = Math.sin(2 * Math.PI * 4400 * t) * 0.7 + (Math.random() * 2 - 1) * 0.3;
    samples[i] = osc * env * 0.18;
  }
  return samples;
}

const sounds = [
  { name: 'button-hover', samples: generateHover() },
  { name: 'button-click', samples: generateClick() },
  { name: 'slider-tick', samples: generateSliderTick() },
];

for (const { name, samples } of sounds) {
  const wavBuf = createWavBuffer(sampleRate, samples);
  const wavPath = path.join(process.cwd(), `public/sounds/${name}.wav`);
  const mp3Path = path.join(process.cwd(), `public/sounds/${name}.mp3`);

  fs.writeFileSync(wavPath, wavBuf);
  execSync(`ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}" 2>/dev/null`);
  console.log(`Generated public/sounds/${name}.mp3`);
}
