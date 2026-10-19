export class AudioSystem {
  private static instance: AudioSystem;
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private isBgmEnabled: boolean = true;
  private isSfxEnabled: boolean = true;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private bgmMasterGain: GainNode | null = null;

  private constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('yokai_audio_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
      const bgmSaved = localStorage.getItem('yokai_bgm_enabled');
      if (bgmSaved !== null) {
        this.isBgmEnabled = bgmSaved === 'true';
      }
      const sfxSaved = localStorage.getItem('yokai_sfx_enabled');
      if (sfxSaved !== null) {
        this.isSfxEnabled = sfxSaved === 'true';
      }
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const resumeAudio = () => {
        if (this.ctx && (this.ctx.state === 'suspended' || (this.ctx as any).state === 'interrupted')) {
          this.ctx.resume().catch(() => {});
        }
      };

      const pauseAudio = () => {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          pauseAudio();
        } else {
          resumeAudio();
        }
      });
      window.addEventListener('pageshow', resumeAudio);
      window.addEventListener('pagehide', pauseAudio);
      window.addEventListener('focus', resumeAudio);

      const unlockAudio = () => {
        this.initContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  private initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && (this.ctx.state === 'suspended' || (this.ctx as any).state === 'interrupted')) {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yokai_audio_enabled', String(enabled));
    }
    if (!enabled) {
      this.stopBGM();
    } else if (this.isBgmEnabled) {
      this.startBGM();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setBGMEnabled(enabled: boolean): void {
    this.isBgmEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yokai_bgm_enabled', String(enabled));
    }
    if (!enabled) {
      this.stopBGM();
    } else if (this.isEnabled) {
      this.startBGM();
    }
  }

  public getBGMEnabled(): boolean {
    return this.isBgmEnabled;
  }

  public setSFXEnabled(enabled: boolean): void {
    this.isSfxEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yokai_sfx_enabled', String(enabled));
    }
  }

  public getSFXEnabled(): boolean {
    return this.isSfxEnabled;
  }

  /**
   * Start Ambient Traditional Japanese Koto Background Music (Zen BGM)
   */
  public startBGM(): void {
    if (!this.isEnabled || !this.isBgmEnabled || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;

    // Hirajoshi Pentatonic Scale frequencies (A minor: A, Bb, D, E, F)
    const hirajoshiScale = [
      220.00, // A3
      233.08, // Bb3
      293.66, // D4
      329.63, // E4
      349.23, // F4
      440.00, // A4
      466.16, // Bb4
      587.33, // D5
      659.25, // E5
      698.46  // F5
    ];

    // Traditional melodic motives
    const melodyPatterns = [
      [0, 2, 3, 4, 3, 2],
      [5, 4, 3, 2, 0],
      [2, 3, 5, 7, 6, 5],
      [7, 8, 7, 5, 4, 3, 2],
      [3, 2, 0, 1, 0]
    ];

    let patternIdx = 0;
    let noteInPattern = 0;

    const playNextKotoNote = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.isEnabled || !this.isBgmEnabled) return;
      if (this.isNightParadeMusicPlaying) {
        this.bgmIntervalId = window.setTimeout(playNextKotoNote, 600);
        return;
      }

      const currentPattern = melodyPatterns[patternIdx];
      const scaleIdx = currentPattern[noteInPattern];
      const freq = hirajoshiScale[scaleIdx % hirajoshiScale.length];

      this.playKotoNote(freq);

      noteInPattern++;
      if (noteInPattern >= currentPattern.length) {
        noteInPattern = 0;
        patternIdx = (patternIdx + 1) % melodyPatterns.length;
        // Pause between phrases (tranquil breathing space)
        this.bgmIntervalId = window.setTimeout(playNextKotoNote, 1400);
      } else {
        // Subtle rhythmic variation (organic timing)
        const delay = 480 + (noteInPattern % 2 === 0 ? 120 : 0);
        this.bgmIntervalId = window.setTimeout(playNextKotoNote, delay);
      }
    };

    // Kick off first phrase
    this.bgmIntervalId = window.setTimeout(playNextKotoNote, 600);
  }

  /**
   * Stop Ambient BGM
   */
  public stopBGM(): void {
    this.isBgmPlaying = false;
    this.stopNightParadeMusic();
    if (this.bgmIntervalId !== null) {
      clearTimeout(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  /**
   * Synthesize a warm, resonant Japanese Koto string pluck with lowpass body filter
   */
  private playKotoNote(freq: number): void {
    if (!this.ctx || !this.isEnabled || !this.isBgmEnabled) return;
    const now = this.ctx.currentTime;

    // 1. Dual Oscillators for wooden string resonance
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2.01, now); // slight detune harmonic

    // 2. Body Resonant Filter (simulating Koto hollow Paulownia wood)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 1.2);
    filter.Q.setValueAtTime(2.2, now);

    // 3. String pluck envelope (sharp attack, exponential release)
    const gain = this.ctx.createGain();
    const baseVolume = 0.055; // gentle ambient background level
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(baseVolume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(baseVolume * 0.35, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.8);
    osc2.stop(now + 1.8);
  }

  /**
   * Crisp bamboo / wooden tap when selecting a tile
   */
  public playSelect(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Sparkling pop chime with ascending pitch according to combo count
   */
  public playMatch(combo: number = 1): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Japanese pentatonic scale base frequencies
    const pentatonicScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const noteIdx = Math.min(combo - 1, pentatonicScale.length - 1);
    const baseFreq = pentatonicScale[Math.max(0, noteIdx)];

    const now = this.ctx.currentTime;

    // Primary bell tone
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Harmonic sparkle
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.2);

    gain2.gain.setValueAtTime(0.12, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.25);
  }

  /**
   * Error shake sound (dull wooden clack)
   */
  public playError(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Energetic FEVER mode fanfare arpeggio
   */
  public playFever(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 783.99, 880.0, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  /**
   * Deep Taiko Drum resonant impact for Boss attack/hit
   */
  public playBossHit(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub-bass Taiko thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Metallic slash accent
    const slash = this.ctx.createOscillator();
    const slashGain = this.ctx.createGain();
    slash.type = 'sawtooth';
    slash.frequency.setValueAtTime(800, now);
    slash.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    slashGain.gain.setValueAtTime(0.18, now);
    slashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    slash.connect(slashGain);
    slashGain.connect(this.ctx.destination);
    slash.start(now);
    slash.stop(now + 0.15);
  }

  /**
   * Booster / Shuffle swoosh
   */
  public playShuffle(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Hint booster chime (Sparkling celestial harp arpeggio)
   */
  public playHint(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, startTime + 0.35);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  /**
   * Victory grand Shinto chime
   */
  public playVictory(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 830.61, 987.77],
      [1046.50, 1318.51, 1567.98]
    ];

    chords.forEach((chord, step) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + step * 0.22;
      chord.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    });
  }

  /**
   * Retro 8-bit electric zap / laser sound for authentic Pikachu matching
   */
  public playLaserZap(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * ⛩️ Mystical Torii Portal wormhole warp sound
   */
  public playPortalWarp(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Clock ticking alert when time is low (< 20s)
   */
  public playTick(): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  private taikoIntervalId: number | null = null;
  private isNightParadeMusicPlaying: boolean = false;

  /**
   * Deep Japanese Taiko drum strike (Don / Ka)
   */
  public playTaikoHit(isRim: boolean = false, accent: boolean = false): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (isRim) {
      // Wood rim strike (Kawa / Ka)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(860, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

      gain.gain.setValueAtTime(accent ? 0.22 : 0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    // Deep resonant drum body (Don / Do)
    const baseFreq = accent ? 105 : 82;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.24);

    const volume = accent ? 0.38 : 0.24;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(volume * 0.45, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    // Membrane punchiness filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(75, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * ⚡ Dynamic Mythic Soundscapes for 30 Relics (Web Audio API synthesizers)
   * - 'boss' / 'combat': Thunderous strike with metallic impact & sub-bass drop
   * - 'support' / 'time': Celestial crystal chimes & harmonic shimmer
   * - 'board' / 'utility': Resonant pulse wave & astral sweep
   */
  public playRelicBurst(archetype: string = 'boss'): void {
    if (!this.isEnabled || !this.isSfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (archetype === 'boss' || archetype === 'combat') {
      // 1. Sub-bass ground tremor
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(30, now + 0.45);
      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 0.45);

      // 2. Crackling lightning slash (sawtooth sweep)
      const bolt = this.ctx.createOscillator();
      const boltGain = this.ctx.createGain();
      bolt.type = 'sawtooth';
      bolt.frequency.setValueAtTime(1400, now);
      bolt.frequency.exponentialRampToValueAtTime(180, now + 0.25);
      boltGain.gain.setValueAtTime(0.2, now);
      boltGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      bolt.connect(boltGain);
      boltGain.connect(this.ctx.destination);
      bolt.start(now);
      bolt.stop(now + 0.25);

      // 3. Mythic metallic ringing resonance
      const metal = this.ctx.createOscillator();
      const metalGain = this.ctx.createGain();
      metal.type = 'triangle';
      metal.frequency.setValueAtTime(1760, now + 0.05);
      metal.frequency.exponentialRampToValueAtTime(880, now + 0.55);
      metalGain.gain.setValueAtTime(0.18, now + 0.05);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      metal.connect(metalGain);
      metalGain.connect(this.ctx.destination);
      metal.start(now + 0.05);
      metal.stop(now + 0.55);

    } else if (archetype === 'support' || archetype === 'time') {
      // Celestial crystal chimes: Pentatonic arpeggio [C6, E6, G6, B6, C7]
      const notes = [1046.50, 1318.51, 1567.98, 1975.53, 2093.00];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteStart = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(0.12, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.6);
      });

      // Warm harmonic swell underneath
      const swell = this.ctx.createOscillator();
      const swellGain = this.ctx.createGain();
      swell.type = 'triangle';
      swell.frequency.setValueAtTime(440, now);
      swell.frequency.linearRampToValueAtTime(523.25, now + 0.4);
      swellGain.gain.setValueAtTime(0.001, now);
      swellGain.gain.linearRampToValueAtTime(0.15, now + 0.15);
      swellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      swell.connect(swellGain);
      swellGain.connect(this.ctx.destination);
      swell.start(now);
      swell.stop(now + 0.65);

    } else {
      // 'board' / 'utility' / auto-match: Astral pulse wave & energy sweep
      const sweep = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();
      sweep.type = 'triangle';
      sweep.frequency.setValueAtTime(320, now);
      sweep.frequency.exponentialRampToValueAtTime(960, now + 0.35);
      sweepGain.gain.setValueAtTime(0.2, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      sweep.connect(sweepGain);
      sweepGain.connect(this.ctx.destination);
      sweep.start(now);
      sweep.stop(now + 0.4);

      // Sparkle ping
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1480, now + 0.12);
      pingGain.gain.setValueAtTime(0.15, now + 0.12);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      ping.start(now + 0.12);
      ping.stop(now + 0.5);
    }
  }

  /**
   * 🌙 Start fast-paced Taiko festival drums during Night Parade Rush (150 BPM)
   */
  public startNightParadeMusic(): void {
    if (!this.isEnabled || !this.isBgmEnabled) return;
    this.stopNightParadeMusic();
    this.initContext();

    this.isNightParadeMusicPlaying = true;

    // Traditional Taiko rhythm: DON (accent) - DON - DOKO - DON - KA - DON!
    const pattern = [
      { rim: false, accent: true },
      { rim: false, accent: false },
      { rim: false, accent: false },
      { rim: true,  accent: false },
      { rim: false, accent: true },
      { rim: false, accent: false },
      { rim: true,  accent: true },
      { rim: false, accent: true }
    ];

    let step = 0;
    this.playTaikoHit(false, true);

    this.taikoIntervalId = window.setInterval(() => {
      if (!this.isNightParadeMusicPlaying) return;
      const hit = pattern[step % pattern.length];
      this.playTaikoHit(hit.rim, hit.accent);
      step++;
    }, 190);
  }

  /**
   * Stop Taiko festival drums and restore normal ambient BGM
   */
  public stopNightParadeMusic(): void {
    this.isNightParadeMusicPlaying = false;
    if (this.taikoIntervalId !== null) {
      clearInterval(this.taikoIntervalId);
      this.taikoIntervalId = null;
    }
  }
}
