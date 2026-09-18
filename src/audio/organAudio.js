// Tabela de frequências base (A4 = 440Hz)
const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const ENARMONICS = {
  'DB': 'C#', 'D#': 'Eb', 'GB': 'F#', 'G#': 'Ab', 'A#': 'Bb'
};

function normalizeNoteName(note) {
  const upper = note.toUpperCase();
  return ENARMONICS[upper] || upper;
}

export function noteToFreq(noteWithOctave) {
  const match = noteWithOctave.match(/^([A-Ga-g][#b]?)(\d)$/);
  if (!match) return 440;

  const note = normalizeNoteName(match[1]);
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTES.indexOf(note);
  if (noteIndex === -1) return 440;

  // C4 é MIDI 60 (261.63Hz)
  const midi = (octave + 1) * 12 + noteIndex;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class OrganAudioEngine {
  constructor() {
    this.ctx = null;
    this.activeChordNodes = [];
    this.activeKeyNotes = new Map();
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Compressor para evitar distorção quando muitas notas tocarem juntas
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      compressor.knee.setValueAtTime(20, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(8, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Cria o timbre encorpado de tubos de órgão para uma única frequência
  createPipeVoice(freq, volume = 0.2, startTime = null) {
    if (!this.ctx) this.init();
    const t = startTime ?? this.ctx.currentTime;

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0, t);
    voiceGain.gain.linearRampToValueAtTime(volume, t + 0.03); // Ataque característico de órgão

    // Tubo Fundamental (8')
    const osc8 = this.ctx.createOscillator();
    osc8.type = 'sawtooth';
    osc8.frequency.setValueAtTime(freq, t);

    // Tubo Oitava Acima (4' - dá o brilho sacro)
    const osc4 = this.ctx.createOscillator();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(freq * 2, t);

    // Tubo Subgrave (16' - peso litúrgico)
    const osc16 = this.ctx.createOscillator();
    osc16.type = 'triangle';
    osc16.frequency.setValueAtTime(freq * 0.5, t);

    // Filtro Passa-Baixa para deixar o som macio e acolhedor
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.4, t);

    osc8.connect(voiceGain);
    osc4.connect(voiceGain);
    osc16.connect(subGain);
    subGain.connect(voiceGain);

    voiceGain.connect(filter);
    filter.connect(this.masterGain);

    osc8.start(t);
    osc4.start(t);
    osc16.start(t);

    return {
      stop: (stopTime) => {
        const sT = stopTime ?? this.ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(sT);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, sT);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, sT + 0.2); // Release suave
        setTimeout(() => {
          try {
            osc8.stop(sT + 0.25);
            osc4.stop(sT + 0.25);
            osc16.stop(sT + 0.25);
            voiceGain.disconnect();
          } catch (e) {}
        }, 300);
      }
    };
  }

  // --- ACORDES COMPLETOS (Baixo + Tríade) ---
  playChord(chordName, phase = 1) {
    this.init();
    this.stopChord(); // Corta o acorde anterior

    const match = chordName.match(/^([A-G][#b]?)(m|°|dim|\+)?/i);
    if (!match) return;

    const root = normalizeNoteName(match[1]);
    const type = match[2] || '';
    const rootIndex = NOTES.indexOf(root);
    if (rootIndex === -1) return;

    // Intervalos da tríade
    let thirdInterval = 4; // Maior por padrão
    let fifthInterval = 7; // Justa por padrão

    if (type === 'm') {
      thirdInterval = 3;
    } else if (type === '°' || type === 'dim') {
      thirdInterval = 3;
      fifthInterval = 6;
    }

    // 1. Baixo pedal do órgão (Oitava 2 bem grave)
    const bassNote = `${root}2`;
    const bassVoice = this.createPipeVoice(noteToFreq(bassNote), 0.28);
    this.activeChordNodes.push(bassVoice);

    // 2. Acorde na mão direita (Oitavas 3 e 4)
    const triadIntervals = [0, thirdInterval, fifthInterval];
    triadIntervals.forEach((interval) => {
      const noteIdx = (rootIndex + interval) % 12;
      const noteName = NOTES[noteIdx];
      const oct = (rootIndex + interval) >= 12 ? 4 : 3;

      const voice = this.createPipeVoice(noteToFreq(`${noteName}${oct}`), 0.16);
      this.activeChordNodes.push(voice);

      // Se a fase for cheia (Fase 3), dobra na oitava 4/5 para encher a igreja
      if (phase === 3) {
        const voiceHigh = this.createPipeVoice(noteToFreq(`${noteName}${oct + 1}`), 0.08);
        this.activeChordNodes.push(voiceHigh);
      }
    });
  }

  stopChord() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.activeChordNodes.forEach((node) => node.stop(now));
    this.activeChordNodes = [];
  }

  // --- TECLADO DO PIANO (Notas individuais) ---
  startKeyNote(noteWithOctave) {
    this.init();
    if (this.activeKeyNotes.has(noteWithOctave)) return;

    const freq = noteToFreq(noteWithOctave);
    const voice = this.createPipeVoice(freq, 0.25);
    this.activeKeyNotes.set(noteWithOctave, voice);
  }

  stopKeyNote(noteWithOctave) {
    const voice = this.activeKeyNotes.get(noteWithOctave);
    if (voice) {
      voice.stop();
      this.activeKeyNotes.delete(noteWithOctave);
    }
  }

  stopAll() {
    this.stopChord();
    this.activeKeyNotes.forEach((voice) => voice.stop());
    this.activeKeyNotes.clear();
  }
}

export const organAudio = new OrganAudioEngine();