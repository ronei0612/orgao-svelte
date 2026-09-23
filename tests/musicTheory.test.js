// tests/musicTheory.test.js
import { describe, it, expect } from 'vitest';
import { MusicTheory } from '../src/utils/musicTheory.js';

/**
 * ============================================================================
 * SUÍTE: MusicTheory (Transposição Harmônica e Detecção de Tom)
 * ============================================================================
 * Valida a matemática musical:
 * - Ciclo cromático dos 12 semitonos (inclusive cruzamento B -> C e C -> B).
 * - Transposição simultânea de baixos invertidos (D/F# + 2 -> E/G#).
 * - Preservação estrita de sufixos de acordes (7M, m7b5, dim).
 * - Transposição de nós <b> em strings HTML completos.
 * - Algoritmo de detecção de tom com base na pontuação diatônica e primeiro acorde menor.
 */
describe('MusicTheory - Transposição e Detecção de Tom', () => {
  /**
   * 🎯 Objetivo: Validar a transposição de acordes simples por semitonos.
   * 📜 Regra: O cálculo cromático deve dar a volta completa no ciclo (após o Si vem o Dó).
   */
  it('deve transpor acordes simples respeitando semitonos', () => {
    // C + 2 semitonos = D
    expect(MusicTheory.transposeChordString('C', 2)).toBe('D');
    // G + 1 semitono = G#
    expect(MusicTheory.transposeChordString('G', 1)).toBe('G#');
    // B + 1 semitono = C (volta do ciclo)
    expect(MusicTheory.transposeChordString('B', 1)).toBe('C');
    // C - 1 semitono = B (volta inversa do ciclo)
    expect(MusicTheory.transposeChordString('C', -1)).toBe('B');
  });

  /**
   * 🎯 Objetivo: Transpor acordes com baixo invertido (Slash Chords) em ambas as partes.
   * 📜 Regra Crítica: Ao transpor 'D/F#' em +2 semitonos, a tônica 'D' deve virar 'E'
   *   E o baixo 'F#' deve virar 'G#', resultando em 'E/G#'.
   */
  it('deve transpor baixos invertidos (Slash Chords) transpondo ambos os lados da barra', () => {
    // D/F# subindo 1 tom (+2) -> E/G#
    expect(MusicTheory.transposeChordString('D/F#', 2)).toBe('E/G#');

    // C/E descendo 1 semitono (-1) -> B/D#
    expect(MusicTheory.transposeChordString('C/E', -1)).toBe('B/D#');

    // A/C# subindo 1 semitono (+1) -> A#/D
    expect(MusicTheory.transposeChordString('A/C#', 1)).toBe('A#/D');
  });

  /**
   * 🎯 Objetivo: Garantir que acidentes e extensões modais não sejam corrompidos ao transpor.
   */
  it('deve preservar sufixos e extensões ao transpor', () => {
    expect(MusicTheory.transposeChordString('Am7', 2)).toBe('Bm7');
    expect(MusicTheory.transposeChordString('C7M', 2)).toBe('D7M');
    expect(MusicTheory.transposeChordString('F#m7', 1)).toBe('Gm7');
    expect(MusicTheory.transposeChordString('C°', 3)).toBe('D#°');
  });

  /**
   * 🎯 Objetivo: Transpor todas as cifras de uma música diretamente no HTML renderizado.
   * 📜 Regra: Modifica apenas o texto interno das tags <b>...</b>, deixando o restante da letra intacto.
   */
  it('deve transpor todas as tags <b> dentro de um bloco HTML sem tocar no texto', () => {
    const htmlEntrada = '<b>C</b> faz o verso e depois vai para <b>G</b>';
    // +2 semitonos: C vira D, G vira A
    const htmlSaida = MusicTheory.transposeHtmlContent(htmlEntrada, 2);

    expect(htmlSaida).toBe('<b>D</b> faz o verso e depois vai para <b>A</b>');
  });

  /**
   * 🎯 Objetivo: Detectar o tom harmônico mais provável a partir de uma sequência de acordes.
   * 📜 Regra:
   *   - Aplica pontuação cruzando as fundamentais da música com os 12 campos harmônicos maiores.
   *   - Se o primeiro acorde for menor (ex: Am), define a tonalidade com sufixo menor ('Am').
   *   - Se não houver cifras no texto, retorna 'L' (Modo Letra).
   */
  it('deve detectar automaticamente o tom da música por pontuação diatônica', () => {
    // 1. Campo harmônico de Sol Maior
    const cifrasSol = ['G', 'C', 'D', 'Em'];
    expect(MusicTheory.detectKeyFromChords(cifrasSol)).toBe('G');

    // 2. Campo harmônico menor com primeiro acorde menor (Lá Menor)
    const cifrasLaMenor = ['Am', 'Dm', 'E7', 'F'];
    expect(MusicTheory.detectKeyFromChords(cifrasLaMenor)).toBe('Am');

    // 3. Ausência de cifras -> Modo Letra ('L')
    expect(MusicTheory.detectKeyFromChords([])).toBe('L');
    expect(MusicTheory.detectKeyFromChords('Texto comum sem cifras')).toBe('L');
  });
});