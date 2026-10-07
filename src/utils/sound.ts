'use client';

class SoundSystem {
  private enabled: boolean = true;
  private ctx: AudioContext | null = null;
  private initialized: boolean = false;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private lastSliderTickTime: number = 0;

  constructor() {
    // Only in browser
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('food-journey-sound');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  private initContext() {
    if (this.initialized || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          const resume = () => {
            this.ctx?.resume();
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('keydown', resume);
          };
          window.addEventListener('pointerdown', resume);
          window.addEventListener('keydown', resume);
        }
        this.loadAudioFiles();
        this.initialized = true;
      }
    } catch {
      // AudioContext unavailable
    }
  }

  private async loadAudioFiles() {
    if (!this.ctx) return;
    const soundList = ['button-hover', 'button-click', 'slider-tick'];
    for (const name of soundList) {
      try {
        const res = await fetch(`/sounds/${name}.mp3`);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          this.audioBuffers.set(name, audioBuffer);
        }
      } catch {
        // Fallback to synthetic sounds if fetch fails
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('food-journey-sound', String(val));
    }
    if (val && !this.initialized) {
      this.initContext();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playClick();
    }
    return this.enabled;
  }

  // Very subtle mechanical tick on hover
  public playHover() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const buffer = this.audioBuffers.get('button-hover');
    if (buffer) {
      this.playBuffer(buffer, 0.12);
      return;
    }

    // High frequency micro-tick
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3400, t);
      filter.Q.setValueAtTime(4, t);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3200, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.012);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  // Short tactile click on button press
  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const buffer = this.audioBuffers.get('button-click');
    if (buffer) {
      this.playBuffer(buffer, 0.28);
      return;
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.Q.setValueAtTime(3, t);

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.02);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch {
      // Ignore
    }
  }

  // Very subtle mechanical movement ratchet tick for timeline slider
  public playSliderTick() {
    if (!this.enabled) return;
    const now = Date.now();
    // Throttle to avoid audio clutter when dragging quickly (max once per 45ms)
    if (now - this.lastSliderTickTime < 45) return;
    this.lastSliderTickTime = now;

    this.initContext();
    if (!this.ctx) return;

    const buffer = this.audioBuffers.get('slider-tick');
    if (buffer) {
      this.playBuffer(buffer, 0.1);
      return;
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(4200, t);
      gain.gain.setValueAtTime(0.025, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.008);
    } catch {
      // Ignore
    }
  }

  private playBuffer(buffer: AudioBuffer, volume: number) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start();
    } catch {
      // Ignore playback errors
    }
  }
}

export const sound = new SoundSystem();
