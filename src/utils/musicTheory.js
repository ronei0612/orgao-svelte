/**
 * src/utils/musicTheory.js
 * Teoria musical: notas, transposição e detecção inteligente de tom por análise harmônica diatônica e modal.
 */

export class MusicTheory {
  static sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static flatNotes  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  static keyNamesMajor = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  static keyNamesMinor = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm'];

  static pitchMap = {
    'C': 0, 'B#': 0,
    'C#': 1, 'DB': 1,
    'D': 2,
    'D#': 3, 'EB': 3,
    'E': 4, 'FB': 4,
    'F': 5, 'E#': 5,
    'F#': 6, 'GB': 6,
    'G': 7,
    'G#': 8, 'AB': 8,
    'A': 9,
    'A#': 10, 'BB': 10,
    'B': 11, 'CB': 11
  };

  static getNoteIndex(noteStr) {
    if (!noteStr) return -1;
    const clean = noteStr.toUpperCase().trim();
    return this.pitchMap[clean] !== undefined ? this.pitchMap[clean] : -1;
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
      return this.keyNamesMajor[newIdx];
    });
  }

  static transposeHtmlContent(htmlContent, delta) {
    if (!htmlContent || delta === 0) return htmlContent;

    if (typeof document !== 'undefined') {
      const temp = document.createElement('div');
      temp.innerHTML = htmlContent;

      const chords = temp.querySelectorAll('b, strong');
      chords.forEach((chordEl) => {
        chordEl.textContent = this.transposeChordString(chordEl.textContent, delta);
      });

      return temp.innerHTML;
    }

    return htmlContent.replace(/<(b|strong)[^>]*>(.*?)<\/\1>/gi, (_, tag, chord) => {
      return `<${tag}>${this.transposeChordString(chord, delta)}</${tag}>`;
    });
  }

  static parseChord(rawChord) {
    if (!rawChord) return null;
    const clean = rawChord.trim().split('/')[0];
    const match = clean.match(/^([A-G][#b]?)(.*)$/i);
    if (!match) return null;

    const root = this.getNoteIndex(match[1]);
    if (root === -1) return null;

    const ext = match[2] || '';
    const isDim = /[°º]|dim|m7b5/i.test(ext);
    const isMin = !isDim && /m(?!aj)/i.test(ext);
    const isDom = /7(?!M|maj)/i.test(ext);

    return { root, isMin, isDim, isMaj: !isMin && !isDim, isDom };
  }

  static extractChords(input) {
    if (!input) return [];

    if (Array.isArray(input)) {
      return input
        .map(i => (typeof i === 'string' ? i : i.innerText || i.textContent || ''))
        .filter(c => c && c.trim() !== '');
    }

    if (typeof input !== 'string') return [];

    if (input.includes('<b') || input.includes('<strong')) {
      if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = input;
        return Array.from(div.querySelectorAll('b, strong')).map(n => n.textContent.trim()).filter(Boolean);
      }
      const matches = Array.from(input.matchAll(/<(?:b|strong)[^>]*>([^<]+)<\/(?:b|strong)>/gi));
      return matches.map(m => m[1].trim()).filter(Boolean);
    }

    const chordRegex = /^[CDEFGAB][#b]?(?:m|M|maj|dim|aug|sus|add)?\d*(?:M|\+|°|º|-)?(?:\(?[#b+-]?(?:\d+|b5|9|11|13)\)?)?(?:\/[CDEFGAB][#b]?)?$/;
    return input.split(/\s+/)
      .map(t => t.replace(/[()[\]:,|]/g, ''))
      .filter(t => t && chordRegex.test(t));
  }

  /**
   * DETECÇÃO INTELIGENTE DE TOM
   */
  static detectKeyFromChords(rawContentOrNodes) {
    const chordStrings = this.extractChords(rawContentOrNodes);
    if (!chordStrings || chordStrings.length === 0) return 'L';

    const parsedList = chordStrings.map(c => this.parseChord(c)).filter(Boolean);
    if (parsedList.length === 0) return 'L';

    const firstChord = parsedList[0];
    const lastChord = parsedList[parsedList.length - 1];

    // Conta a frequência de cada nota fundamental na música
    const rootFrequencies = {};
    parsedList.forEach(c => {
      rootFrequencies[c.root] = (rootFrequencies[c.root] || 0) + 1;
    });

    const candidates = [];
    for (let i = 0; i < 12; i++) {
      candidates.push({ root: i, isMinor: false, name: this.keyNamesMajor[i], score: 0 });
      candidates.push({ root: i, isMinor: true,  name: this.keyNamesMinor[i], score: 0 });
    }

    candidates.forEach(cand => {
      const T = cand.root;
      let hasI = false;
      let hasIV = false;
      let hasV = false;

      // 1. LEVE bônus de posição (apenas desempate sutil, nunca decisivo)
      if (firstChord.root === T && firstChord.isMin === cand.isMinor) {
        cand.score += 1.0; // Reduzido de 5.0 para 1.0!
      }
      if (lastChord.root === T && lastChord.isMin === cand.isMinor) {
        cand.score += 1.5; // Resolução final costuma ser mais indicativa que a introdução
      }

      // 2. Pontuação e Penalidades Diatônicas
      parsedList.forEach(chord => {
        const interval = ((chord.root - T) % 12 + 12) % 12;

        if (!cand.isMinor) {
          // ================= CAMPO MAIOR =================
          if (interval === 0 && chord.isMaj) {
            cand.score += 3.0; // I (Tônica Maior)
            hasI = true;
          } else if (interval === 7 && chord.isMaj) {
            cand.score += 2.5; // V (Dominante)
            hasV = true;
          } else if (interval === 5 && chord.isMaj) {
            cand.score += 2.0; // IV (Subdominante)
            hasIV = true;
          } else if (interval === 9 && chord.isMin) {
            cand.score += 1.5; // vi (Relativo menor)
          } else if (interval === 2 && chord.isMin) {
            cand.score += 1.5; // ii
          } else if (interval === 4 && chord.isMin) {
            cand.score += 1.5; // iii
          } else if (interval === 11 && chord.isDim) {
            cand.score += 1.0; // vii°
          } else if (interval === 10 && chord.isMaj) {
            cand.score += 0.8; // bVII (Empréstimo modal comum)
          } else {
            // PENALIDADE SEVERA: Acorde estranho ao campo maior
            cand.score -= 2.5;
          }
        } else {
          // ================= CAMPO MENOR =================
          if (interval === 0 && chord.isMin) {
            cand.score += 3.5; // i (Tônica Menor)
            hasI = true;
          } else if (interval === 7 && (chord.isMaj || chord.isDom)) {
            cand.score += 3.0; // V7 Maior (Dominante Harmônica: E7 em Am)
            hasV = true;
          } else if (interval === 7 && chord.isMin) {
            cand.score += 1.5; // v menor natural
            hasV = true;
          } else if (interval === 5 && chord.isMin) {
            cand.score += 2.0; // iv (Subdominante menor)
            hasIV = true;
          } else if (interval === 3 && chord.isMaj) {
            cand.score += 2.0; // bIII (Relativa Maior)
          } else if (interval === 8 && chord.isMaj) {
            cand.score += 1.5; // bVI (ex: F em Am)
          } else if (interval === 10 && chord.isMaj) {
            cand.score += 1.5; // bVII
          } else if (interval === 2 && (chord.isDim || chord.isMin)) {
            cand.score += 1.0; // ii°
          } else {
            // PENALIDADE SEVERA: Acorde estranho ao campo menor
            cand.score -= 2.5;
          }
        }
      });

      // 3. BÔNUS DE PILAR HARMÔNICO (Se tiver I, IV e V juntos, a certeza do tom é quase absoluta)
      if (hasI && hasIV && hasV) {
        cand.score += 3.0;
      }
    });

    // Ordena pela maior pontuação
    candidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // CRITÉRIO 1 DE DESEMPATE: Frequência da tônica (quem toca mais vezes na música)
      const freqA = rootFrequencies[a.root] || 0;
      const freqB = rootFrequencies[b.root] || 0;
      if (freqB !== freqA) {
        return freqB - freqA;
      }
      // CRITÉRIO 2 DE DESEMPATE: Tônica que apareceu primeiro
      const firstIdxA = parsedList.findIndex(c => c.root === a.root);
      const firstIdxB = parsedList.findIndex(c => c.root === b.root);
      return (firstIdxA === -1 ? 999 : firstIdxA) - (firstIdxB === -1 ? 999 : firstIdxB);
    });

    return candidates[0].name;
  }
}