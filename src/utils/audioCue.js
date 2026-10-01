/**
 * Zero-Bloat Audio Cue and Haptic Feedback Utility
 * 
 * Generates instant acoustic earcons mathematically using Web Audio API oscillators.
 * Requires ZERO audio files, keeping repository strictly under 10MB.
 */

class AudioCueEngine {
  constructor() {
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Pleasant ascending two-tone chime when microphone starts listening.
   */
  playMicStart() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);

      this.triggerHaptic(60);
    } catch (e) {
      console.debug('WebAudio not allowed before user interaction:', e);
    }
  }

  /**
   * Gentle descending tone when listening finishes and reasoning begins.
   */
  playMicStop() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      this.triggerHaptic(40);
    } catch (e) {
      console.debug('WebAudio playMicStop error:', e);
    }
  }

  /**
   * Friendly notification chime when Sol produces a reply.
   */
  playSuccess() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      this.triggerHaptic([40, 60, 40]);
    } catch (e) {
      console.debug('WebAudio playSuccess error:', e);
    }
  }

  /**
   * Gentle low error vibration and tone if speech recognition fails.
   */
  playError() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      this.triggerHaptic([100, 50, 100]);
    } catch (e) {
      console.debug('WebAudio playError error:', e);
    }
  }

  /**
   * Haptic vibration feedback for tactile accessibility.
   * @param {number|number[]} pattern - Vibration duration in ms or pattern array
   */
  triggerHaptic(pattern = 50) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignored if browser prevents vibration without gesture
      }
    }
  }
}

export const audioCue = new AudioCueEngine();
