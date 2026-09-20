class SampleEngine {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();
    this.activeChordNodes = [];
    this.activePianoNodes = new Map();
    this.masterGain = null;

    this.baseUrl = `${import.meta.env.BASE_URL}assets/audio/`;

    // As 12 notas conforme o padrão dos seus arquivos (sustenido é '_')
    this.fileNotes = ['c', 'c_', 'd', 'd_', 'e', 'f', 'f_', 'g', 'g_', 'a', 'a_', 'b'];
    this.octaves = [2, 3, 4];

    this.chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this.enarmonics = { 'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#' };

    this.attackTime = 0.15; // Ataque imediato (20ms)
    this.releaseTime = 0.25; // Corte suave

    this.isPreloaded = false;
    this.isLoading = false;
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

  // Converte "C#" para "c_" e "C" para "c"
  normalizeNoteForFile(noteStr) {
    let note = noteStr.toUpperCase();
    if (this.enarmonics[note]) note = this.enarmonics[note];
    return note.toLowerCase().replace('#', '_');
  }

  // Gera o nome exato: orgao_c2.ogg ou orgao_c_2.ogg
  getFileName(noteStr, octave = 3) {
    const fileNote = this.normalizeNoteForFile(noteStr);
    return `orgao_${fileNote}${octave}.ogg`;
  }

  getNoteIndex(noteStr) {
    let note = noteStr.toUpperCase();
    if (this.enarmonics[note]) note = this.enarmonics[note];
    return this.chromatic.indexOf(note);
  }

  async loadBuffer(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Arquivo não encontrado no public (servidor retornou HTML)');
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

  // =========================================================================
  // PRÉ-CARREGAMENTO DOS 36 ARQUIVOS EXATOS (12 notas x oitavas 2, 3 e 4)
  // =========================================================================
  async preloadAll() {
    if (this.isPreloaded || this.isLoading) return;
    this.isLoading = true;
    this.init();

    const urls = [];

    for (const note of this.fileNotes) {
      for (const oct of this.octaves) {
        urls.push(`${this.baseUrl}Orgao/orgao_${note}${oct}.ogg`);
      }
    }

    const promises = urls.map((url) => this.loadBuffer(url));
    await Promise.allSettled(promises);

    this.isPreloaded = true;
    this.isLoading = false;
    console.log(`[Áudio] ✅ Pronto! Todas as 36 amostras do Órgão (oitavas 2, 3 e 4) estão na RAM!`);
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

  getIntervals(suffix) {
    if (suffix.includes('m7b5')) return [0, 3, 6, 10];
    if (suffix.includes('dim') || suffix.includes('°')) return [0, 3, 6, 9];
    if (suffix.includes('m7')) return [0, 3, 7, 10];
    if (suffix.includes('maj7') || suffix.includes('7M')) return [0, 4, 7, 11];
    if (suffix.includes('m')) return [0, 3, 7];
    if (suffix.includes('7')) return [0, 4, 7, 10];
    return [0, 4, 7]; // Tríade Maior
  }

  // Monta as 3 camadas do acorde:
  // - Baixo pedal: Oitava 2 (ex: orgao_c2.ogg)
  // - Harmonia: Oitava 3 (ex: orgao_c3.ogg, orgao_e3.ogg, orgao_g3.ogg)
  // - Se Fase 3: adiciona Oitava 4
  buildChordFiles(chordStr, phase = 1) {
    const parsed = this.parseChord(chordStr);
    if (!parsed) return [];

    const rootIdx = this.getNoteIndex(parsed.root);
    const intervals = this.getIntervals(parsed.suffix);
    const playlist = [];

    // 1. Baixo grave na Oitava 2
    playlist.push({
      url: `${this.baseUrl}Orgao/${this.getFileName(parsed.bass, 2)}`,
      volume: 1.0
    });

    // 2. Tríade na Oitava 3
    intervals.forEach((interval) => {
      const noteClass = this.chromatic[(rootIdx + interval) % 12];
      playlist.push({
        url: `${this.baseUrl}Orgao/${this.getFileName(noteClass, 3)}`,
        volume: 0.85
      });

      // Se estiver na Fase 3 (Cheio), dobra com a Oitava 4
      if (phase === 3) {
        playlist.push({
          url: `${this.baseUrl}Orgao/${this.getFileName(noteClass, 4)}`,
          volume: 0.65
        });
      }
    });

    return playlist;
  }

  // --- REPRODUÇÃO DO ACORDE (INSTANTÂNEO EM LOOP) ---
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
      source.loop = true; // Mantém o som sustentado

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

  // --- TECLADO DO PIANO ---
  async startPianoKey(noteWithOctave) {
    this.init();
    if (this.activePianoNodes.has(noteWithOctave)) return;

    const match = noteWithOctave.match(/^([CDEFGAB][#b]?)(\d)$/i);
    if (!match) return;

    const note = match[1];
    let oct = parseInt(match[2], 10);
    // Como a pasta tem oitavas 2, 3 e 4: mapeia oitava 5/6 para 4
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