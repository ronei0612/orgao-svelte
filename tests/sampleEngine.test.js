// tests/sampleEngine.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { sampleEngine } from '../src/audio/sampleEngine.js';

/**
 * ============================================================================
 * SUÍTE: SampleEngine (Síntese Contínua do Pad e Fases Harmônicas)
 * ============================================================================
 * Valida a montagem das camadas de som contínuo (Pad harmônico):
 * - Normalização de notas bemóis para arquivos com sustenido/underline (_).
 * - Decomposição de cifras complexas (tônica, sufixo e baixo invertido).
 * - Cumprimento rigoroso das 3 Fases Harmônicas definidas no AI.md:
 *     Fase 1: Órgão solo (8ª 2 e 8ª 3).
 *     Fase 2: Órgão + Cordas orquestrais no fundo.
 *     Fase 3: Som Cheio (adiciona a oitava 4 superior para Órgão e Cordas).
 */
describe('SampleEngine - Regras de Textura e Fases Harmônicas', () => {
  beforeEach(() => {
    sampleEngine.init();
  });

  /**
   * 🎯 Objetivo: Garantir o mapeamento enarmônico para o sistema de arquivos de áudio.
   * 📜 Regra do AI.md: Não existem arquivos com 'b' nas pastas de áudio;
   *   todos os bemóis usam seu equivalente sustenido com underline (ex: Eb -> d_, Bb -> a_).
   */
  it('deve normalizar notas bemóis (Eb, Bb, Db) para arquivos com sustenido/underline', () => {
    expect(sampleEngine.normalizeNoteForFile('Eb')).toBe('d_');
    expect(sampleEngine.normalizeNoteForFile('Bb')).toBe('a_');
    expect(sampleEngine.normalizeNoteForFile('Db')).toBe('c_');
    expect(sampleEngine.normalizeNoteForFile('F#')).toBe('f_');
  });

  /**
   * 🎯 Objetivo: Decompor corretamente a estrutura harmônica das cifras.
   * 🔍 Validação: Verifica se separa corretamente a tônica, o sufixo modal e o baixo invertido.
   */
  it('deve fazer o parse correto de acordes complexos e baixos invertidos', () => {
    // Baixo invertido: Tônica D, sem sufixo, Baixo F#
    const parsedSlash = sampleEngine.parseChord('D/F#');
    expect(parsedSlash.root).toBe('D');
    expect(parsedSlash.suffix).toBe('');
    expect(parsedSlash.bass).toBe('F#');

    // Acorde menor com sétima: Tônica A, Sufixo m7, Baixo fundamental A
    const parsedMinor = sampleEngine.parseChord('Am7');
    expect(parsedMinor.root).toBe('A');
    expect(parsedMinor.suffix).toBe('m7');
    expect(parsedMinor.bass).toBe('A');
  });

  /**
   * 🎯 Objetivo: Validar a textura acústica da Fase 1.
   * 📜 Regra do AI.md 4.1: Fase 1 contém APENAS Órgão limpo (Baixo na 8ª 2 + Tríade na 8ª 3).
   *   Não pode conter Cordas e não pode conter oitava 4.
   */
  it('Fase 1: deve carregar APENAS amostras de Órgão nas oitavas 2 e 3 (sem Strings e sem 8ª 4)', () => {
    const files = sampleEngine.buildChordFiles('C', 1);

    // 1. Todas as amostras devem vir da pasta Orgao/
    const hasOnlyOrgan = files.every((item) => item.url.includes('Orgao/'));
    expect(hasOnlyOrgan).toBe(true);

    // 2. Não pode haver amostras de Cordas (Strings/)
    const hasStrings = files.some((item) => item.url.includes('Strings/'));
    expect(hasStrings).toBe(false);

    // 3. Não pode conter amostras da oitava 4 superior
    const hasOctave4 = files.some((item) => item.url.includes('4.ogg'));
    expect(hasOctave4).toBe(false);
  });

  /**
   * 🎯 Objetivo: Validar a textura acústica da Fase 2.
   * 📜 Regra do AI.md 4.1: Fase 2 adiciona camada orquestral de Strings suave no fundo.
   */
  it('Fase 2: deve adicionar a camada de Cordas (Strings) suavemente no fundo', () => {
    const files = sampleEngine.buildChordFiles('C', 2);

    const hasOrgan = files.some((item) => item.url.includes('Orgao/'));
    const hasStrings = files.some((item) => item.url.includes('Strings/'));

    expect(hasOrgan).toBe(true);
    expect(hasStrings).toBe(true);

    // Fase 2 ainda não inclui a oitava 4 superior
    const hasOctave4 = files.some((item) => item.url.includes('4.ogg'));
    expect(hasOctave4).toBe(false);
  });

  /**
   * 🎯 Objetivo: Validar a textura acústica da Fase 3 (Som Cheio).
   * 📜 Regra do AI.md 4.1: Fase 3 DEVE adicionar a oitava 4 superior tanto no Órgão quanto nas Cordas.
   */
  it('Fase 3 (Som Cheio): DEVE conter a oitava 4 superior para Órgão e Cordas', () => {
    const files = sampleEngine.buildChordFiles('C', 3);

    const hasOrganOctave4 = files.some((item) => item.url.includes('Orgao/') && item.url.includes('4.ogg'));
    const hasStringsOctave4 = files.some((item) => item.url.includes('Strings/') && item.url.includes('4.ogg'));

    expect(hasOrganOctave4).toBe(true);
    expect(hasStringsOctave4).toBe(true);
  });
});