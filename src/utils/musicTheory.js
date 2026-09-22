/**
 * src/utils/musicTheory.js
 * Teoria musical: notas, transposição e detecção inteligente de tom por análise de campo harmônico.
 */

export class MusicTheory {
  static sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static flatNotes  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  static enarmonics = { 'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#' };

  static getNoteIndex(noteStr) {
    if (!noteStr) return -1;
    let n = noteStr.toUpperCase();
    if (this.enarmonics[n]) n = this.enarmonics[n];
    return this.sharpNotes.indexOf(n);
  }

  static getNoteByIndex(index, useFlats = false) {
    const normalized = ((index % 12) + 12) % 12;
    return useFlats ? this.flatNotes[normalized] : this.sharpNotes[normalized];
  }

  static transposeChordString(chordStr, delta) {
    if (!chordStr || delta === 0) return chordStr;
    const regex = /([CDEFGAB][#b]?)/gi;
    return chordStr.replace(regex, (match) => {
      const idx = this.getNoteIndex(match);
      if (idx === -1) return match;
      const newIdx = ((idx + (delta % 12)) + 12) % 12;
      return this.sharpNotes[newIdx];
    });
  }

  static transposeHtmlContent(htmlContent, delta) {
    if (!htmlContent || delta === 0) return htmlContent;

    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    const chords = temp.querySelectorAll('b, strong');
    chords.forEach((chordEl) => {
      chordEl.innerText = this.transposeChordString(chordEl.innerText, delta);
    });

    return temp.innerHTML;
  }

  /**
   * Detecta automaticamente o tom de uma música a partir dos acordes
   */
  static detectKeyFromChords(rawContentOrNodes) {
    let chordTexts = [];

    if (typeof rawContentOrNodes === 'string') {
      const temp = document.createElement('div');
      temp.innerHTML = rawContentOrNodes;
      const nodes = temp.querySelectorAll('b, strong');
      chordTexts = Array.from(nodes).map((n) => n.innerText.trim());
    } else if (Array.isArray(rawContentOrNodes)) {
      chordTexts = rawContentOrNodes.map((item) => (typeof item === 'string' ? item : item.innerText || ''));
    }

    if (!chordTexts || chordTexts.length === 0) return 'L';

    // 1. Verifica se o primeiro acorde é menor
    const firstChord = chordTexts[0];
    const firstMatch = firstChord.match(/^([A-G][#b]?)(m)?(?!aj)/i);
    const isFirstChordMinor = !!(firstMatch && firstMatch[2]);

    // 2. Extrai as tônicas ordenadas e únicas
    const songRootsOrdered = [];
    const uniqueRoots = new Set();

    chordTexts.forEach((text) => {
      const match = text.match(/^([A-G][#b]?)/i);
      if (match) {
        const idx = this.getNoteIndex(match[1]);
        if (idx !== -1) {
          songRootsOrdered.push(idx);
          uniqueRoots.add(idx);
        }
      }
    });

    if (uniqueRoots.size === 0) return 'L';

    // 3. Testa sobre os 12 Campos Harmônicos Maiores (0, 2, 4, 5, 7, 9, 11)
    const diatonicIntervals = [0, 2, 4, 5, 7, 9, 11];
    const scores = [];

    for (let key = 0; key < 12; key++) {
      const keyNotes = diatonicIntervals.map((interval) => (key + interval) % 12);
      let count = 0;
      uniqueRoots.forEach((root) => {
        if (keyNotes.includes(root)) count++;
      });
      scores.push({ key, count });
    }

    const maxCount = Math.max(...scores.map((s) => s.count));
    const topCandidates = scores.filter((s) => s.count === maxCount).map((s) => s.key);

    let winningKeyIndex = topCandidates[0];

    // Desempate por ordem de aparição na música
    for (let rootNote of songRootsOrdered) {
      if (topCandidates.includes(rootNote)) {
        winningKeyIndex = rootNote;
        break;
      }
    }

    const noteName = this.sharpNotes[winningKeyIndex];
    return isFirstChordMinor ? `${noteName}m` : noteName;
  }
}