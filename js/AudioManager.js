// public/js/AudioManager.js
class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterGain = null;
    this._chargeOsc = null;
    this._chargeGain = null;
    this._menuOscillators = [];
    this._menuTimeout = null;
    this._menuPlaying = false;
    this._menuNoteIndex = 0;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
    const muteStored = localStorage.getItem(C.STORAGE_MUTE);
    if (muteStored === 'true') {
      this.muted = true;
      this.masterGain.gain.value = 0;
    }
  }

  _ensureCtx() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  playTone(frequency, type, duration, gainPeak, startTime) {
    if (this.muted || !this.ctx) return null;
    const t = startTime !== undefined ? startTime : this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(frequency, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainPeak, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.01);
    return osc;
  }

  playJumpSound(chargeRatio) {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freqStart = 200;
    const freqEnd = 600 + 400 * chargeRatio;
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.linearRampToValueAtTime(freqEnd, t + 0.15);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playLandSound() {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playChargeSound(chargeRatio) {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    if (!this._chargeOsc) {
      this._chargeOsc = this.ctx.createOscillator();
      this._chargeGain = this.ctx.createGain();
      this._chargeOsc.type = 'sine';
      this._chargeOsc.connect(this._chargeGain);
      this._chargeGain.connect(this.masterGain);
      this._chargeGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this._chargeOsc.start();
    }
    const freq = 150 + chargeRatio * 400;
    this._chargeOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
  }

  stopChargeSound() {
    if (this._chargeOsc) {
      try {
        this._chargeOsc.stop();
        this._chargeOsc.disconnect();
      } catch(e) {}
      this._chargeOsc = null;
      this._chargeGain = null;
    }
  }

  playObstacleClear() {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    const notes = [261, 329, 392];
    const t = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.12, 0.25, t + i * 0.08);
    });
  }

  playCollision() {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.3);
    vibrato.frequency.value = 8;
    vibratoGain.gain.value = 15;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    vibrato.start(t);
    osc.start(t);
    osc.stop(t + 0.42);
    vibrato.stop(t + 0.42);

    // Rumore basso finale
    setTimeout(() => {
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      this.playTone(80, 'sawtooth', 0.1, 0.3, t2);
    }, 320);
  }

  playCombo() {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    const notes = [392, 494, 587, 784];
    const t = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      this.playTone(freq, 'square', 0.1, 0.2, t + i * 0.1);
    });
  }

  playNewRecord() {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    const melody = [261, 329, 392, 523];
    const t = this.ctx.currentTime;
    melody.forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.2, 0.3, t + i * 0.2);
    });
    // Accordo finale
    [523, 659, 784].forEach(freq => {
      this.playTone(freq, 'sine', 0.6, 0.2, t + 0.9);
    });
  }

  playMenuMusic() {
    this._ensureCtx();
    if (this.muted || !this.ctx || this._menuPlaying) return;
    this._menuPlaying = true;
    this._menuNoteIndex = 0;
    const scale = [261, 294, 329, 349, 392, 440, 494, 523];
    const pattern = [0, 2, 4, 2, 0, 4, 2, 0, 5, 4, 2, 0, 2, 4, 7, 4];
    const bpm = 90;
    const beatMs = (60 / bpm) * 1000 * 0.5;

    const scheduleNote = () => {
      if (!this._menuPlaying) return;
      const idx = pattern[this._menuNoteIndex % pattern.length];
      const freq = scale[idx];
      this._ensureCtx();
      if (!this.muted && this.ctx) {
        this.playTone(freq, 'sine', 0.3, 0.15);
      }
      this._menuNoteIndex++;
      this._menuTimeout = setTimeout(scheduleNote, beatMs);
    };
    scheduleNote();
  }

  stopMenuMusic() {
    this._menuPlaying = false;
    if (this._menuTimeout) {
      clearTimeout(this._menuTimeout);
      this._menuTimeout = null;
    }
  }

  setMute(muted) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.5;
    }
    if (muted) {
      this.stopChargeSound();
      this.stopMenuMusic();
    }
    try { localStorage.setItem(C.STORAGE_MUTE, muted); } catch(e) {}
  }
}
