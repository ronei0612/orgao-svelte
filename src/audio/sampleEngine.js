class SampleEngine {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();
    this.activeChordNodes = [];
    this.activePianoNodes = new Map();
    this.masterGain = null;

    // Resolução dinâmica do caminho base (funciona local e no GitHub Pages)
    this.baseUrl = `${import.meta.env.BASE_URL}assets/audio/`;

    this.chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this.enarmonics = { 'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#' };

    this.attackTime = 0.15;
    this.releaseTime = 0.25;
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

  // Converte "C#" para "c_" e "Eb" para "d_" conforme os nomes dos arquivos
  normalizeForFile(noteStr) {
    let note = noteStr.toUpperCase();
    if (this.enarmonics[note]) note = this.enarmonics[note];
    return note.toLowerCase().replace('#', '_');
  }

  getNoteIndex(noteStr) {
    let note = noteStr.toUpperCase();
    if (this.enarmonics[note]) note = this.enarmonics[note];
    return this.chromatic.indexOf(note);
  }

  // Carrega e decodifica o arquivo .ogg na memória RAM
  async loadBuffer(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Arquivo não encontrado: ${url}`);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (err) {
      console.warn(`[Áudio] Aviso: Falha ao carregar amostra: ${url}`, err);
      return null;
    }
  }

  // Interpreta a cifra (ex: "Am", "G", "F#m", "B°")
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

  getIntervals(suffix) {
    if (suffix.includes('m7b5')) return [0, 3, 6, 10];
    if (suffix.includes('dim') || suffix.includes('°')) return [0, 3, 6, 9];
    if (suffix.includes('m7')) return [0, 3, 7, 10];
    if (suffix.includes('maj7') || suffix.includes('7M')) return [0, 4, 7, 11];
    if (suffix.includes('m')) return [0, 3, 7];
    if (suffix.includes('7')) return [0, 4, 7, 10];
    return [0, 4, 7]; // Tríade Maior padrão
  }

  // Constrói a lista de arquivos .ogg necessários para a cifra
  buildChordFiles(chordStr, phase = 1) {
    const parsed = this.parseChord(chordStr);
    if (!parsed) return [];

    const rootIdx = this.getNoteIndex(parsed.root);
    const intervals = this.getIntervals(parsed.suffix);
    const bassFileNote = this.normalizeForFile(parsed.bass);

    const playlist = [];

    // Baixo grave na Oitava 2
    playlist.push({ folder: 'Orgao', file: `orgao_${bassFileNote}2.ogg`, volume: 1.0 });
    if (phase >= 2) {
      playlist.push({ folder: 'Strings', file: `strings_${bassFileNote}2.ogg`, volume: 0.75 });
    }

    // Tríade na Oitava 3
    intervals.forEach((interval) => {
      const noteClass = this.chromatic[(rootIdx + interval) % 12];
      const fileNote = this.normalizeForFile(noteClass);

      playlist.push({ folder: 'Orgao', file: `orgao_${fileNote}3.ogg`, volume: 0.85 });
      if (phase >= 2) {
        playlist.push({ folder: 'Strings', file: `strings_${fileNote}3.ogg`, volume: 0.65 });
      }

      // Se for Fase 3 (Cheia), dobra na Oitava 4
      if (phase === 3) {
        playlist.push({ folder: 'Orgao', file: `orgao_${fileNote}4.ogg`, volume: 0.55 });
        playlist.push({ folder: 'Strings', file: `strings_${fileNote}4.ogg`, volume: 0.5 });
      }
    });

    return playlist;
  }

  // --- REPRODUÇÃO DE ACORDES CONTÍNUOS (LOOP) ---
  async playChord(chordStr, phase = 1) {
    this.init();
    this.stopChord();

    const items = this.buildChordFiles(chordStr, phase);
    if (!items.length) return;

    const startTime = this.ctx.currentTime + 0.02;

    for (const item of items) {
      const url = `${this.baseUrl}${item.folder}/${item.file}`;
      this.loadBuffer(url).then((buffer) => {
        if (!buffer || !this.ctx) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true; // Mantém o órgão soando

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(item.volume, startTime + this.attackTime);

        source.connect(gain);
        gain.connect(this.masterGain);

        source.start(startTime);
        this.activeChordNodes.push({ source, gain });
      });
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

  // --- TECLADO DO PIANO (FLAUTA) ---
  async startPianoKey(noteWithOctave) {
    this.init();
    if (this.activePianoNodes.has(noteWithOctave)) return;

    const match = noteWithOctave.match(/^([CDEFGAB][#b]?)(\d)$/i);
    if (!match) return;

    const fileNote = this.normalizeForFile(match[1]);
    const oct = match[2];
    const url = `${this.baseUrl}studio/Flauta/flauta_${fileNote}${oct}.ogg`;

    const buffer = await this.loadBuffer(url);
    if (!buffer || !this.ctx) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = false;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1.0, now + 0.05);

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
      node.gain.gain.linearRampToValueAtTime(0.001, now + this.releaseTime);
      node.source.stop(now + this.releaseTime + 0.05);
    } catch (e) {}

    this.activePianoNodes.delete(noteWithOctave);
  }

  stopAll() {
    this.stopChord();
    for (const key of this.activePianoNodes.keys()) {
      this.stopPianoKey(key);
    }
  }
}

export const sampleEngine = new SampleEngine();