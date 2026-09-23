// tests/textFormatter.test.js
import { describe, it, expect } from 'vitest';
import { TextFormatter } from '../src/utils/textFormatter.js';

/**
 * ============================================================================
 * SUÍTE: TextFormatter (Reconhecimento, Higienização e Envelopamento de Cifras)
 * ============================================================================
 * Valida o motor de processamento textual:
 * - Expressão regular tolerante a acordes simples, extensões e baixos invertidos.
 * - Filtro anti-falso-positivo (evita marcar palavras da letra como cifras).
 * - Envelopamento seguro em tags <b> sem duplicações em edições sucessivas.
 * - Padronização de quebras de linha para HTML.
 */
describe('TextFormatter - Reconhecimento e Higienização de Cifras', () => {
  /**
   * 🎯 Objetivo: Garantir que linhas compostas por cifras sejam detectadas com precisão.
   * 📜 Regra: A linha é considerada de cifra se todos os seus blocos forem acordes válidos,
   *   marcações estruturais aceitas ('Intro:', 'Refrão:') ou repetições ('(2x)').
   * 🔍 Validação: Testa acordes simples, extensões brasileiras (7M, m7b5), baixos invertidos e marcações.
   */
  it('deve identificar linhas compostas prioritariamente por acordes', () => {
    // 1. Acordes fundamentais e menores
    expect(TextFormatter.isChordLine('C   G   Am   F')).toBe(true);

    // 2. Acordes complexos e extensões com sétima maior
    expect(TextFormatter.isChordLine('C7M   F#m7(b5)   B7   Em9')).toBe(true);

    // 3. Baixos invertidos (Slash Chords)
    expect(TextFormatter.isChordLine('D/F#   G/B   A/C#   E/G#')).toBe(true);

    // 4. Linhas com marcações de introdução ou repetição
    expect(TextFormatter.isChordLine('Intro: G  D  C (2x)')).toBe(true);
    expect(TextFormatter.isChordLine('Refrão: Am  Dm  G  C')).toBe(true);
  });

  /**
   * 🎯 Objetivo: Prevenir que palavras normais da letra sejam confundidas com cifras.
   * 📜 Regra Crítica: Em português, muitas palavras começam com letras de notas:
   *   "Deus" (D), "Amor" (A), "Faz" (F), "Como" (C), "Ele" (E).
   *   O formatador JAMAIS pode classificar essas frases como linhas de cifra.
   */
  it('NÃO DEVE confundir palavras de letra com acordes (Prevenção de Falsos Positivos)', () => {
    expect(TextFormatter.isChordLine('Deus é bom o tempo todo')).toBe(false);
    expect(TextFormatter.isChordLine('Amor que não se mede')).toBe(false);
    expect(TextFormatter.isChordLine('Faz um milagre em mim')).toBe(false);
    expect(TextFormatter.isChordLine('Como zaqueu eu quero subir')).toBe(false);
    expect(TextFormatter.isChordLine('Ele é o caminho a verdade e a vida')).toBe(false);
  });

  /**
   * 🎯 Objetivo: Envelopar automaticamente apenas os acordes dentro de tags <b>...</b>.
   * 📜 Regra: As cifras recebem <b> para estilização e interatividade de áudio;
   *   as linhas de letra permanecem texto puro sem tags.
   */
  it('deve envolver os acordes em <b> e manter as palavras de letra intactas', () => {
    const rawSong = `G              D
Segura na mão de Deus
C              G
Segura na mão de Deus`;

    const formatted = TextFormatter.prepareContent(rawSong);

    // Acordes devem virar tags <b>
    expect(formatted).toContain('<b>G</b>');
    expect(formatted).toContain('<b>D</b>');
    expect(formatted).toContain('<b>C</b>');

    // Palavras da letra devem continuar puras
    expect(formatted).toContain('Segura na mão de Deus');
    expect(formatted).not.toContain('<b>Segura</b>');
  });

  /**
   * 🎯 Objetivo: Evitar o bug de duplicação de tags em edições repetidas.
   * 📜 Regra: Ao abrir e salvar uma música já formatada, o sistema deve limpar
   *   tags <b> antigas antes de reprocessar, evitando gerar <b><b>G</b></b>.
   */
  it('não deve duplicar tags <b> em edições sucessivas', () => {
    const jaFormatado = '<b>G</b>   <b>D</b><br>Segura na mão de Deus';
    const reformatado = TextFormatter.prepareContent(jaFormatado);

    expect(reformatado).not.toContain('<b><b>');
    expect(reformatado).toContain('<b>G</b>');
  });

  /**
   * 🎯 Objetivo: Padronizar quebras de linha para exibição no DOM.
   * 📜 Regra: Quebras de linha de texto puro (\n ou \r\n) devem virar tags <br>.
   */
  it('deve converter quebras de linha normais (\\n) para <br>', () => {
    const textoComQuebra = 'Linha 1\nLinha 2';
    const resultado = TextFormatter.prepareContent(textoComQuebra);
    expect(resultado).toBe('Linha 1<br>Linha 2');
  });
});