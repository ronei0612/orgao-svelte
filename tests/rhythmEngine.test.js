// tests/melody-and-rhythm.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rhythmEngine } from '../src/audio/rhythmEngine.js';
import { sampleEngine } from '../src/audio/sampleEngine.js';

/**
 * ============================================================================
 * SUÍTE: Melody (Sequenciador One-Shot de 5 Vozes)
 * ============================================================================
 * Valida o motor rítmico melódico:
 * - Execução One-Shot (toca 1 compasso por acorde e encerra, sem loop).
 * - Cálculo de baixos invertidos (Slash Chords nas vozes 1 e 2).
 * - Matriz de intervalos para acordes menores e diminutos.
 * - Matemática de cruzamento da oitava no Dó (octaveShift).
 * - Parada de emergência e limites de BPM.
 */
describe('Melody (Sequenciador One-Shot de 5 Vozes)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sampleEngine.init();

    // Injeta matriz rítmica simulada de 8 passos (4/4) para o Órgão
    rhythmEngine.rawRhythms = {
      orgao: {
        '4/4': {
          numSteps: 8,
          vozes: [
            [1, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 0, 0]
          ]
        }
      }
    };
    rhythmEngine.setRhythm('4/4');
  });

  /**
   * 🎯 Objetivo: Testar a REGRA DE OURO número 1 do sequenciador.
   * 📜 Regra do AI.md 4.2:
   *   O ritmo (Melody) toca exatamente 1 compasso (numSteps) e finaliza suavemente.
   *   O som em loop contínuo pertence exclusivamente ao pad harmônico do sampleEngine.
   * 🔍 Validação:
   *   Dispara o acorde a 120 BPM, avança o relógio de áudio (currentTime) e os timers.
   *   Após o 8º passo, isPlayingRhythm DEVE ser false.
   */
  it('O ritmo NÃO PODE ser loop (deve parar ao fim de 1 compasso)', () => {
    rhythmEngine.triggerChord('C', 1, 120);

    expect(rhythmEngine.isPlayingRhythm).toBe(true);
    expect(rhythmEngine.currentStep).toBe(0);

    // Simula 9 iterações do loop avançando 260ms por iteração (compasso completo de 8 passos)
    for (let i = 0; i < 9; i++) {
      sampleEngine.ctx.currentTime += 0.26;
      vi.advanceTimersByTime(260);
      rhythmEngine.engineLoop();
    }

    // O ritmo DEVE ter encerrado a execução do compasso (One-Shot concluído)
    expect(rhythmEngine.isPlayingRhythm).toBe(false);
  });

  /**
   * 🎯 Objetivo: Garantir que baixos invertidos (Slash Chords) toquem a nota do baixo, não a tônica.
   * 📜 Regra:
   *   No acorde G/B, o baixo é Si (B). Portanto, V1 e V2 devem ser b2.ogg e b3.ogg.
   *   No acorde D/F#, o baixo é Fá# (F#). Portanto, V1 e V2 devem ser f_2.ogg e f_3.ogg.
   */
  it('BAIXOS INVERTIDOS (Slash Chords): No acorde G/B, as vozes 1 e 2 DEVEM tocar Si (B2 e B3) e NÃO Sol (G)', () => {
    // 1. Acorde G/B
    const filesGB = rhythmEngine.calculateVoiceFiles('G/B', 1);
    expect(filesGB[1]).toBe('orgao_b2.ogg'); // Voz 1: Baixo fundamental na 8ª 2
    expect(filesGB[2]).toBe('orgao_b3.ogg'); // Voz 2: Baixo sustentação na 8ª 3

    // 2. Acorde D/F#
    const filesDFSharp = rhythmEngine.calculateVoiceFiles('D/F#', 1);
    expect(filesDFSharp[1]).toBe('orgao_f_2.ogg');
    expect(filesDFSharp[2]).toBe('orgao_f_3.ogg');
  });

  /**
   * 🎯 Objetivo: Validar a matemática dos intervalos de terças e quintas em acordes menores e diminutos.
   * 📜 Regra:
   *   - Am: Tônica Lá, Terça menor Dó (c3), Quinta Mi (e3).
   *   - C°: Tônica Dó, Terça menor Mib (d_3), Quinta diminuta Solb (f_3).
   */
  it('ACORDES MENORES E DIMINUTOS: deve calcular terças menores e quintas diminutas', () => {
    // 1. Lá Menor (Am)
    const filesAm = rhythmEngine.calculateVoiceFiles('Am', 1);
    expect(filesAm[1]).toBe('orgao_a2.ogg'); // Baixo Grave Lá
    expect(filesAm[2]).toBe('orgao_a3.ogg'); // Baixo Grave Lá
    expect(filesAm[3]).toBe('orgao_c4.ogg'); // Terça menor Dó
    expect(filesAm[4]).toBe('orgao_e4.ogg'); // Quinta Mi
    expect(filesAm[5]).toBe('orgao_a4.ogg'); // Tônica Lá na 8ª 4

    // 2. Dó Diminuto (C°)
    const filesCDim = rhythmEngine.calculateVoiceFiles('C°', 1);
    expect(filesCDim[3]).toBe('orgao_d_3.ogg'); // Mib (d_)
    expect(filesCDim[4]).toBe('orgao_f_3.ogg'); // Solb (f_)
  });

  /**
   * 🎯 Objetivo: Validar o ajuste de oitava (octaveShift) ao cruzar a nota Dó.
   * 📜 Regra do AI.md 4.2:
   *   No acorde de Lá (A), a terça é C# (Dó#). Como Dó# cruza para o ciclo seguinte,
   *   a matemática Math.floor(abs / 12) deve elevar a nota para a oitava 4,
   *   impedindo que notas graves apareçam no meio do arpejo superior.
   */
  it('deve calcular corretamente a subida de oitava ao cruzar a nota Dó (octaveShift)', () => {
    const files = rhythmEngine.calculateVoiceFiles('A', 1);

    expect(files[1]).toContain('orgao_a2.ogg');
    expect(files[3]).toBe('orgao_c_4.ogg'); // Subiu para a oitava 4
  });

  /**
   * 🎯 Objetivo: Validar o método stop() do motor rítmico.
   * 📜 Regra: Interrompe flags de execução, zera o ponteiro de passos e aciona o corte de áudio das notas ativas.
   */
  it('rhythmEngine.stop() deve resetar o passo para 0, parar a execução e acionar stopRhythmNotes', () => {
    const spyStopAudio = vi.spyOn(sampleEngine, 'stopRhythmNotes');

    rhythmEngine.triggerChord('C', 1, 120);
    expect(rhythmEngine.isPlaying).toBe(true);

    rhythmEngine.stop();

    expect(rhythmEngine.isPlaying).toBe(false);
    expect(rhythmEngine.isPlayingRhythm).toBe(false);
    expect(rhythmEngine.currentStep).toBe(0);
    expect(spyStopAudio).toHaveBeenCalledTimes(1);
  });

  /**
   * 🎯 Objetivo: Garantir proteção de limites de BPM no nível do motor de áudio.
   */
  it('rhythmEngine.setBpm() deve travar valores fora dos limites entre 30 e 300', () => {
    rhythmEngine.setBpm(10);
    expect(rhythmEngine.bpm).toBe(30); // Cravou no mínimo

    rhythmEngine.setBpm(850);
    expect(rhythmEngine.bpm).toBe(300); // Cravou no máximo

    rhythmEngine.setBpm(115);
    expect(rhythmEngine.bpm).toBe(115); // Valor válido preservado
  });
});

/**
 * ============================================================================
 * SUÍTE: Seleção e Ordenação de Ritmos
 * ============================================================================
 */
describe('Seleção de Ritmos', () => {
  /**
   * 🎯 Objetivo: Garantir ordenação natural dos ritmos no seletor.
   * 📜 Regra: "Sem ritmo" sempre em primeiro, seguido pela ordenação numérica/alfabética natural (2/4, 3/4, 4/4).
   */
  it('a lista de ritmos DEVE ter "Sem ritmo" como primeiro item e os demais ordenados naturalmente', () => {
    const list = rhythmEngine.getRhythmsList();

    expect(list[0]).toBe('Sem ritmo');
    expect(list).toContain('4/4');
  });

  /**
   * 🎯 Objetivo: Validar a limpeza de estado ao escolher "Sem ritmo".
   * 📜 Regra: Desativa o sequenciador e anula activeRhythmData para não consumir recursos.
   */
  it('ao definir o ritmo como "Sem ritmo", deve interromper a execução e anular activeRhythmData', () => {
    rhythmEngine.setRhythm('4/4');
    expect(rhythmEngine.activeRhythmData).not.toBeNull();

    rhythmEngine.setRhythm('Sem ritmo');
    expect(rhythmEngine.activeRhythmData).toBeNull();
    expect(rhythmEngine.isPlayingRhythm).toBe(false);
  });
});