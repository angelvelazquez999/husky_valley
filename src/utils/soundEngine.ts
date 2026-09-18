// Sound Engine using Web Audio API for Stardew Valley-like retro audio & lofi night music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  
  private isMusicPlaying: boolean = false;
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private ambientInterval: any = null;

  public musicVolume: number = 0.35;
  public sfxVolume: number = 0.5;
  public ambientVolume: number = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Master & Channel Gains
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume;
        this.musicGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
        this.sfxGain.connect(this.ctx.destination);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = this.isMuted ? 0 : this.ambientVolume;
        this.ambientGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.musicGain) this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
    if (this.ambientGain) this.ambientGain.gain.value = this.isMuted ? 0 : this.ambientVolume;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Retro Sound Effects ---

  public playBark(pitch: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;

    const baseFreq = 220 * pitch;
    osc.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Second short chirp for realistic yip
    setTimeout(() => {
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      const t = this.ctx.currentTime;
      osc2.frequency.setValueAtTime(baseFreq * 1.8, t);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.0, t + 0.08);
      gain2.gain.setValueAtTime(0.2, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(t);
      osc2.stop(t + 0.1);
    }, 40);
  }

  public playHowl() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(580, now + 0.4);
    osc.frequency.linearRampToValueAtTime(520, now + 0.9);
    osc.frequency.exponentialRampToValueAtTime(260, now + 1.4);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.55);
  }

  public playHeartChime() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  public playItemPickup() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [440, 659.25, 880, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.05;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playDig() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Noise buffer for dirt crunch
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playCrunchEat() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    for (let c = 0; c < 3; c++) {
      setTimeout(() => {
        this.playDig();
      }, c * 90);
    }
  }

  public playWhistle() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(1600, now + 0.1);
    osc.frequency.linearRampToValueAtTime(1400, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playThrow() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // Cheerful 6-note fanfare (C5, G5, A5, B5, C6)
    const notes = [523.25, 783.99, 880.0, 987.77, 1046.5, 1318.51];
    const times = [0, 0.12, 0.24, 0.36, 0.48, 0.7];

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + times[i];

      osc.type = i === notes.length - 1 ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i === notes.length - 1 ? 0.8 : 0.2));

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + (i === notes.length - 1 ? 0.85 : 0.25));
    });
  }

  // --- Background Lofi / Night Music Synthesizer ---

  public startBackgroundMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Ambient Night Crickets & gentle breeze
    this.startNightAmbience();

    // Lofi chord progression: Am7 -> Dm7 -> G7 -> Cmaj7 -> Fmaj7 -> Em7
    const chords = [
      [220.0, 261.63, 329.63, 392.0],  // Am7 (A3, C4, E4, G4)
      [293.66, 349.23, 440.0, 523.25], // Dm7 (D4, F4, A4, C5)
      [196.0, 246.94, 293.66, 349.23], // G7 (G3, B3, D4, F4)
      [261.63, 329.63, 392.0, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [174.61, 220.0, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [164.81, 196.0, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
    ];

    let chordIdx = 0;
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted || !this.isMusicPlaying) return;

      const chord = chords[chordIdx];
      const now = this.ctx.currentTime;

      // Bass note
      if (step === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(chord[0] * 0.5, now);
        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + 1.9);
      }

      // Arpeggio note
      const noteFreq = chord[step % chord.length];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(noteFreq * (step % 2 === 0 ? 1 : 2), now);

      leadGain.gain.setValueAtTime(0.12, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);
      leadOsc.start(now);
      leadOsc.stop(now + 0.5);

      step++;
      if (step >= 4) {
        step = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, 550);
  }

  private startNightAmbience() {
    if (this.ambientInterval) return;

    this.ambientInterval = setInterval(() => {
      if (!this.ctx || !this.ambientGain || this.isMuted) return;

      // Random cricket chirp
      if (Math.random() < 0.65) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(4500 + Math.random() * 800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ambientGain);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    }, 400);
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
