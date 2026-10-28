// Web Audio API Gamified Sound Synthesizer
// Provides subtle, satisfying, zero-latency audio feedback without external audio file dependencies.

class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sound_effects_enabled');
      this.isMuted = saved === 'false';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended (common browser autoplay policy behavior)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound_effects_enabled', muted ? 'false' : 'true');
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * 1. CARD FLIP:
   * Crisp, soft tactile card flip swoosh / paper pop
   */
  public playCardFlip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Bandpass filter to make it sound like paper/cardboard turning
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(1.8, now);

      osc.type = 'sine';
      // Quick pitch slide down
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

      // Volume envelope: very fast attack, smooth decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Audio autoplay policy or device sound disabled
    }
  }

  /**
   * 2. EARN XP:
   * Playful, sparkling dual chime (D5 -> A5 -> D6) resembling Duolingo / game jewel collection
   */
  public playXpGain(customGain: number = 0.15) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Note frequencies: D5 (587.33Hz), A5 (880Hz), D6 (1174.66Hz)
      const notes = [587.33, 880, 1174.66];

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Warm subtle vibrato
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(customGain, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch (e) {}
  }

  /**
   * 3. LESSON COMPLETE:
   * Inspiring, triumphant major triad arpeggio with celebratory harmonic chord
   * (C5 -> E5 -> G5 -> C6 with sustained warm sparkle)
   */
  public playLessonComplete() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50), E6 (1318.51)
      const arpeggio = [
        { freq: 523.25, time: 0.0, dur: 0.35, vol: 0.14 },
        { freq: 659.25, time: 0.1, dur: 0.35, vol: 0.14 },
        { freq: 783.99, time: 0.2, dur: 0.45, vol: 0.16 },
        { freq: 1046.5, time: 0.32, dur: 0.65, vol: 0.20 },
        { freq: 1318.51, time: 0.44, dur: 0.75, vol: 0.18 }
      ];

      arpeggio.forEach(({ freq, time, dur, vol }) => {
        const noteStart = now + time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // warmer than pure sine
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(vol, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + dur + 0.05);
      });

      // Harmonized sub-bass root for rich satisfying resonance
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(261.63, now + 0.32); // C4
      subGain.gain.setValueAtTime(0.001, now + 0.32);
      subGain.gain.linearRampToValueAtTime(0.12, now + 0.36);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now + 0.32);
      subOsc.stop(now + 1.15);
    } catch (e) {}
  }

  /**
   * 4. CORRECT ANSWER / SUCCESS:
   * Crisp affirmative double ding (G5 -> C6)
   */
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [783.99, 1046.5].forEach((freq, idx) => {
        const noteStart = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.14, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.25);
      });
    } catch (e) {}
  }

  /**
   * 5. STREAK FLAME / COMBO CELEBRATION:
   * Warm fiery sparkle (whoosh + bright rising chime)
   */
  public playStreakChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A Major

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.38);
      });
    } catch (e) {}
  }
}

export const soundFX = new SoundFX();
