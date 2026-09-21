/**
 * src/audio/sampleEngine.js
 * Gerenciador da Web Audio API, carregamento de buffers (Órgão, Strings e Studio) e reprodução.
 */

class SampleEngine {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();
    this.activeChordNodes = [];
    this.activePianoNodes = new Map();
    this.activeRhythmNodes = [];
    this.masterGain = null;

    this.baseUrl = `${import.meta.env.BASE_URL}assets/audio/`;

    this.fileNotes = ['c', 'c_', 'd', 'd_', 'e', 'f', 'f_', 'g', 'g_', 'a', 'a_', 'b'];
    this.chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this.enarmonics = { 'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#' };

    this.attackTime = 0.15;
    this.releaseTime = 0.20;

    this.isPreloaded = false;
    this.preloadedStudio = { orgao: false, piano: false };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      const compressor = this.ctx.createDynamicsCompressor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  normalizeNoteForFile(noteStr) {
    let note = noteStr.toUpperCase();
    if (this.enarmonics[note]) note = this.enarmonics[note];
    return note.toLowerCase().replace('#', '_');
  }

  getFileName(noteStr, octave = 3, prefix = 'orgao') {
    const fileNote = this.normalizeNoteForFile(noteStr);
    return `${prefix}_${fileNote}${octave}.ogg`;
  }

  getNoteIndex(noteStr) {
    let note = noteStr.toUpperCase();
    if (this.enarmonics[note]) note = this.enarmonics[note];
    return this.chromatic.indexOf(note);
  }

  getIntervals(suffix) {
    if (suffix.includes('m7b5')) return [0, 3, 6, 10];
    if (suffix.includes('dim') || suffix.includes('°')) return [0, 3, 6, 9];
    if (suffix.includes('m7')) return [0, 3, 7, 10];
    if (suffix.includes('maj7') || suffix.includes('7M')) return [0, 4, 7, 11];
    if (suffix.includes('m')) return [0, 3, 7];
    if (suffix.includes('7')) return [0, 4, 7, 10];
    return [0, 4, 7];
  }

  parseChord(chordStr) {
    const clean = chordStr.trim();
    const match = clean.match(/^([CDEFGAB][#b]?)(.*?)(?:\/([CDEFGAB][#b]?))?$/i);
    if (!match) return null;
    return {
      root: match[1],
      suffix: match[2] || '',
      bass: match[3] || match[1]
    };
  }

  async loadBuffer(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Arquivo de áudio não encontrado (o servidor retornou página HTML)');
      }

      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (err) {
      console.warn(`[Áudio] Falha ao carregar: ${url} ->`, err.message);
      return null;
    }
  }

  // Pré-carrega as amostras contínuas de Órgão E Strings (oitavas 2 a 4)
  async preloadAll() {
    if (this.isPreloaded) return;
    this.init();

    const urls = [];
    for (const note of this.fileNotes) {
      for (const oct of [2, 3, 4]) {
        urls.push(`${this.baseUrl}Orgao/orgao_${note}${oct}.ogg`);
        urls.push(`${this.baseUrl}Strings/strings_${note}${oct}.ogg`);
      }
    }
    await Promise.allSettled(urls.map((u) => this.loadBuffer(u)));
    this.isPreloaded = true;
    console.log('[Áudio] ✅ Órgão e Strings (fundo contínuo) carregados!');
  }

  // Pré-carrega as amostras de estúdio para a melodia rítmica (oitavas 2 a 5)
  async preloadStudio(instrument = 'orgao') {
    if (this.preloadedStudio[instrument]) return;
    this.init();

    const folder = instrument === 'piano' ? 'Piano' : 'Orgao';
    const prefix = instrument === 'piano' ? 'piano' : 'orgao';
    const octaves = [2, 3, 4, 5];

    const urls = [];
    for (const note of this.fileNotes) {
      for (const oct of octaves) {
        urls.push(`${this.baseUrl}studio/${folder}/${prefix}_${note}${oct}.ogg`);
      }
    }

    await Promise.allSettled(urls.map((u) => this.loadBuffer(u)));
    this.preloadedStudio[instrument] = true;
    console.log(`[Studio] ✅ Amostras de estúdio de ${instrument.toUpperCase()} carregadas!`);
  }

  // Toca uma nota ou conjunto de notas (Pianada) no ritmo
  async playStudioNote(instrument, fileOrArray, volume = 1.0, time = 0) {
    this.init();
    if (!fileOrArray) return;
    if (!time) time = this.ctx.currentTime;

    const files = Array.isArray(fileOrArray) ? fileOrArray : [fileOrArray];
    const folder = instrument === 'piano' ? 'Piano' : 'Orgao';
    const adjustedVol = Array.isArray(fileOrArray) ? volume * 0.75 : volume;

    for (const fileName of files) {
      const url = `${this.baseUrl}studio/${folder}/${fileName}`;
      const buffer = this.buffers.get(url) || await this.loadBuffer(url);
      if (!buffer || !this.ctx) continue;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = false;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(adjustedVol, time);

      source.connect(gain);
      gain.connect(this.masterGain);

      source.start(time);
      this.activeRhythmNodes.push({ source, gain });
    }

    if (this.activeRhythmNodes.length > 30) {
      this.activeRhythmNodes.splice(0, 10);
    }
  }

  // Corta as notas de ritmo ativas ao mudar de acorde
  stopRhythmNotes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.activeRhythmNodes.forEach(({ source, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.001, now + this.releaseTime);
        source.stop(now + this.releaseTime + 0.02);
      } catch (e) {}
    });

    this.activeRhythmNodes = [];
  }

  // --- ACORDE CONTÍNUO (PAD) COM SUPORTE ÀS FASES 1, 2 E 3 ---
  buildChordFiles(chordStr, phase = 1) {
    const parsed = this.parseChord(chordStr);
    if (!parsed) return [];

    const rootIdx = this.getNoteIndex(parsed.root);
    const intervals = this.getIntervals(parsed.suffix);
    const playlist = [];

    const bassFile = this.normalizeNoteForFile(parsed.bass);

    // 1. Baixo Fundamental (Oitava 2)
    playlist.push({
      url: `${this.baseUrl}Orgao/orgao_${bassFile}2.ogg`,
      volume: 1.0
    });

    if (phase >= 2) {
      playlist.push({
        url: `${this.baseUrl}Strings/strings_${bassFile}2.ogg`,
        volume: 0.65
      });
    }

    // 2. Tríade (Oitava 3)
    intervals.forEach((interval) => {
      const noteClass = this.chromatic[(rootIdx + interval) % 12];
      const noteFile = this.normalizeNoteForFile(noteClass);

      playlist.push({
        url: `${this.baseUrl}Orgao/orgao_${noteFile}3.ogg`,
        volume: 0.85
      });

      if (phase >= 2) {
        playlist.push({
          url: `${this.baseUrl}Strings/strings_${noteFile}3.ogg`,
          volume: 0.60
        });
      }

      // 3. Fase 3 (Som Cheio): adiciona Oitava 4 no Órgão e nas Cordas
      if (phase === 3) {
        playlist.push({
          url: `${this.baseUrl}Orgao/orgao_${noteFile}4.ogg`,
          volume: 0.65
        });
        playlist.push({
          url: `${this.baseUrl}Strings/strings_${noteFile}4.ogg`,
          volume: 0.50
        });
      }
    });

    return playlist;
  }

  async playChord(chordStr, phase = 1) {
    this.init();
    this.stopChord();

    const items = this.buildChordFiles(chordStr, phase);
    if (!items.length) return;

    const startTime = this.ctx.currentTime + 0.005;

    for (const item of items) {
      const buffer = this.buffers.get(item.url) || await this.loadBuffer(item.url);
      if (!buffer || !this.ctx) continue;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(item.volume, startTime + this.attackTime);

      source.connect(gain);
      gain.connect(this.masterGain);

      source.start(startTime);
      this.activeChordNodes.push({ source, gain });
    }
  }

  stopChord() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.activeChordNodes.forEach(({ source, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.001, now + this.releaseTime);
        source.stop(now + this.releaseTime + 0.05);
      } catch (e) {}
    });

    this.activeChordNodes = [];
  }

  // --- TECLADO MANUAL ---
  async startPianoKey(noteWithOctave) {
    this.init();
    if (this.activePianoNodes.has(noteWithOctave)) return;

    const match = noteWithOctave.match(/^([CDEFGAB][#b]?)(\d)$/i);
    if (!match) return;

    const note = match[1];
    let oct = parseInt(match[2], 10);
    if (oct > 4) oct = 4;
    if (oct < 2) oct = 2;

    const url = `${this.baseUrl}Orgao/${this.getFileName(note, oct)}`;
    const buffer = this.buffers.get(url) || await this.loadBuffer(url);
    if (!buffer || !this.ctx) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.9, now + this.attackTime);

    source.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    this.activePianoNodes.set(noteWithOctave, { source, gain });
  }

  stopPianoKey(noteWithOctave) {
    const node = this.activePianoNodes.get(noteWithOctave);
    if (!node || !this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      node.gain.gain.cancelScheduledValues(now);
      node.gain.gain.setValueAtTime(node.gain.gain.value, now);
      node.gain.linearRampToValueAtTime(0.001, now + this.releaseTime);
      node.source.stop(now + this.releaseTime + 0.05);
    } catch (e) {}

    this.activePianoNodes.delete(noteWithOctave);
  }

  stopAll() {
    this.stopChord();
    this.stopRhythmNotes();
    for (const key of this.activePianoNodes.keys()) {
      this.stopPianoKey(key);
    }
  }
}

export const sampleEngine = new SampleEngine();