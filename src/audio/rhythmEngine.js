/**
 * src/audio/rhythmEngine.js
 * Sequenciador rítmico melódico de 5 vozes com ordenação alfabética e troca de fase no próximo acorde.
 */

import { sampleEngine } from './sampleEngine.js';

class RhythmEngine {
  constructor() {
    this.audio = sampleEngine;
    this.rawRhythms = {};
    this.currentInstrument = 'orgao';
    this.currentRhythmName = 'Sem ritmo';
    this.activeRhythmData = null;

    this.bpm = 90;
    this.phase = 1;
    this.currentChord = null;

    this.isPlaying = false;
    this.currentStep = 0;
    this.nextStepTime = 0;
    this.nextBlinkTime = 0;
    this.timerId = null;

    this.currentVoicesFiles = {};

    this.onStepChange = null;
    this.onMetronomeTick = null;
  }

  async init() {
    try {
      const url = `${import.meta.env.BASE_URL}styles-melody.json`;
      const res = await fetch(url);
      if (res.ok) {
        this.rawRhythms = await res.json();
      }
    } catch (err) {
      console.warn('[RhythmEngine] Erro ao carregar styles-melody.json', err);
      this.rawRhythms = {};
    }

    await this.audio.preloadStudio(this.currentInstrument);
  }

  getRhythmsList() {
    const instRhythms = this.rawRhythms[this.currentInstrument] || {};
    const sortedKeys = Object.keys(instRhythms).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
    return ['Sem ritmo', ...sortedKeys];
  }

  setBpm(newBpm) {
    this.bpm = Math.max(30, Math.min(300, Number(newBpm) || 90));
  }

  // Apenas armazena a nova fase. O som NÃO muda no meio do compasso, só no próximo triggerChord!
  setPhase(newPhase) {
    this.phase = newPhase;
  }

  async setInstrument(inst) {
    if (this.currentInstrument === inst) return;
    this.currentInstrument = inst;
    await this.audio.preloadStudio(inst);

    this.setRhythm(this.currentRhythmName);
  }

  setRhythm(name) {
    this.currentRhythmName = name;
    if (!name || name === 'Sem ritmo') {
      this.stop();
      this.activeRhythmData = null;
      return;
    }

    const instRhythms = this.rawRhythms[this.currentInstrument] || {};
    const data = instRhythms[name];

    if (data) {
      this.activeRhythmData = {
        numSteps: data.numSteps || data.steps || 8,
        v5: [...(data.vozes ? data.vozes[0] : (data.v5 || []))],
        v4: [...(data.vozes ? data.vozes[1] : (data.v4 || []))],
        v3: [...(data.vozes ? data.vozes[2] : (data.v3 || []))],
        v2: [...(data.vozes ? data.vozes[3] : (data.v2 || []))],
        v1: [...(data.vozes ? data.vozes[4] : (data.v1 || []))]
      };
    }
  }

  calculateVoiceFiles(chordStr, phase = 1) {
    const parsed = this.audio.parseChord(chordStr);
    if (!parsed) return {};

    const rootIdx = this.audio.getNoteIndex(parsed.root);
    const intervals = this.audio.getIntervals(parsed.suffix);
    const bass = this.audio.normalizeNoteForFile(parsed.bass);
    const prefix = this.currentInstrument === 'piano' ? 'piano' : 'orgao';

    const getNote = (intervalIdx, baseOct) => {
      const abs = rootIdx + intervals[intervalIdx];
      const noteClass = this.audio.chromatic[abs % 12];
      const octShift = Math.floor(abs / 12);
      const finalOct = baseOct + octShift;
      const fileNote = this.audio.normalizeNoteForFile(noteClass);
      return `${prefix}_${fileNote}${finalOct}.ogg`;
    };

    const files = {};
    files[1] = `${prefix}_${bass}2.ogg`;
    files[2] = `${prefix}_${bass}3.ogg`;

    if (this.currentInstrument === 'piano') {
      if (phase === 3) {
        files[3] = getNote(0, 4);
        files[4] = getNote(1, 4);
        files[5] = [getNote(0, 4), getNote(1, 4), getNote(2, 4)];
      } else {
        files[3] = getNote(1, 3);
        files[4] = getNote(2, 3);
        files[5] = [getNote(1, 3), getNote(2, 3), getNote(0, 4)];
      }
    } else {
      if (phase === 3) {
        files[3] = getNote(0, 4);
        files[4] = getNote(1, 4);
        files[5] = getNote(2, 4);
      } else {
        files[3] = getNote(1, 3);
        files[4] = getNote(2, 3);
        files[5] = getNote(0, 4);
      }
    }

    return files;
  }

  triggerChord(chordStr, phase = null, bpm = null) {
    if (phase !== null) this.phase = phase;
    if (bpm !== null) this.bpm = bpm;

    if (this.currentRhythmName === 'Sem ritmo' || !this.activeRhythmData) {
      this.currentChord = chordStr;
      return;
    }

    this.audio.init();
    this.currentChord = chordStr;
    // Aqui sim aplica a fase ativa ao disparar o novo acorde
    this.currentVoicesFiles = this.calculateVoiceFiles(chordStr, this.phase);

    this.audio.stopRhythmNotes();

    this.currentStep = 0;
    this.nextStepTime = this.audio.ctx.currentTime + 0.02;
    this.nextBlinkTime = this.audio.ctx.currentTime;
    this.isPlaying = true;

    if (!this.timerId) {
      this.startScheduler();
    }
  }

  startScheduler() {
    const lookahead = 0.08;

    const scheduler = () => {
      if (!this.isPlaying) return;

      const now = this.audio.ctx.currentTime;
      const beatDuration = 60.0 / this.bpm;
      const stepDuration = beatDuration / 2;

      if (now >= this.nextBlinkTime) {
        this.nextBlinkTime += beatDuration;
        if (this.onMetronomeTick) this.onMetronomeTick();
      }

      while (this.nextStepTime < now + lookahead) {
        this.scheduleStep(this.currentStep, this.nextStepTime);

        if (this.onStepChange) {
          const stepToNotify = this.currentStep;
          const delay = Math.max(0, (this.nextStepTime - now) * 1000);
          setTimeout(() => {
            if (this.isPlaying && this.onStepChange) this.onStepChange(stepToNotify);
          }, delay);
        }

        this.nextStepTime += stepDuration;
        this.currentStep++;

        if (this.currentStep >= this.activeRhythmData.numSteps) {
          this.currentStep = 0;
        }
      }

      this.timerId = requestAnimationFrame(scheduler);
    };

    scheduler();
  }

  scheduleStep(stepIdx, time) {
    for (let v = 1; v <= 5; v++) {
      const track = this.activeRhythmData[`v${v}`];
      if (!track || track.length <= stepIdx) continue;

      const state = track[stepIdx];
      if (state > 0) {
        const fileOrArray = this.currentVoicesFiles[v];
        if (!fileOrArray) continue;

        const volume = state === 1 ? 1.0 : 0.5;
        this.audio.playStudioNote(this.currentInstrument, fileOrArray, volume, time);
      }
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
    this.audio.stopRhythmNotes();
    this.currentStep = 0;
    if (this.onStepChange) this.onStepChange(-1);
  }
}

export const rhythmEngine = new RhythmEngine();