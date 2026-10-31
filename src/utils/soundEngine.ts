// Web Audio API Synthesizer for card and interaction sounds
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playCardClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // AudioContext policy
    }
  }

  playPassCard() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // AudioContext policy
    }
  }

  playQuartetSuccess() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.28);
      });
    } catch {
      // AudioContext policy
    }
  }

  playVictoryFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const chords = [
        { freqs: [440, 554.37, 659.25], time: 0, dur: 0.2 },
        { freqs: [440, 554.37, 659.25], time: 0.25, dur: 0.2 },
        { freqs: [587.33, 739.99, 880], time: 0.5, dur: 0.45 },
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + chord.time);

          gain.gain.setValueAtTime(0.08, this.ctx.currentTime + chord.time);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + chord.time + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime + chord.time);
          osc.stop(this.ctx.currentTime + chord.time + chord.dur + 0.05);
        });
      });
    } catch {
      // AudioContext policy
    }
  }

  playAlert(positive = true) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      if (positive) {
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.2);
      }

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.19);
    } catch {
      // AudioContext policy
    }
  }

  playDefeat() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [
        { freq: 311.13, time: 0, dur: 0.25 },     // Eb4
        { freq: 293.66, time: 0.22, dur: 0.25 },   // D4
        { freq: 277.18, time: 0.44, dur: 0.25 },   // Db4
        { freq: 261.63, time: 0.66, dur: 0.55 },   // C4
      ];

      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, this.ctx.currentTime + n.time);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime + n.time);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + n.time + n.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + n.time);
        osc.stop(this.ctx.currentTime + n.time + n.dur + 0.05);
      });
    } catch {
      // AudioContext policy
    }
  }

  playCardFly() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch {
      // AudioContext policy
    }
  }

  playStackFan() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // AudioContext policy
    }
  }
}

export const sound = new SoundEngine();
