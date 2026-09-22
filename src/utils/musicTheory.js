/**
 * src/utils/musicTheory.js
 * Utilitários de teoria musical: notas, transposição de cifras e conteúdo HTML.
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

  /**
   * Transpõe uma string de acorde (inclusive baixo invertido como D/F#)
   */
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

  /**
   * Transpõe todas as tags <b> dentro de um bloco HTML
   */
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
}