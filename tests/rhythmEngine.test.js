// tests/melody-and-rhythm.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rhythmEngine } from '../src/audio/rhythmEngine.js';
import { sampleEngine } from '../src/audio/sampleEngine.js';

describe('Melody (Sequenciador One-Shot de 5 Vozes)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sampleEngine.init();

    // Ritmo de teste de 8 passos (4/4) para o Órgão
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

  it('O ritmo não pode ser loop (deve parar ao fim de 1 compasso)', () => {
    rhythmEngine.triggerChord('C', 1, 120);

    expect(rhythmEngine.isPlayingRhythm).toBe(true);
    expect(rhythmEngine.currentStep).toBe(0);

    // Simula a passagem de tempo do compasso
    for (let i = 0; i < 9; i++) {
      sampleEngine.ctx.currentTime += 0.26;
      vi.advanceTimersByTime(260);
      rhythmEngine.engineLoop();
    }

    // O ritmo DEVE ter finalizado o compasso (One-Shot)
    expect(rhythmEngine.isPlayingRhythm).toBe(false);
  });

  it('deve calcular corretamente a subida de oitava ao cruzar a nota Dó (octaveShift)', () => {
    const files = rhythmEngine.calculateVoiceFiles('A', 1);

    expect(files[1]).toContain('orgao_a2.ogg');
    expect(files[3]).toBe('orgao_c_4.ogg');
  });
});

describe('Seleção de Ritmos', () => {
  it('a lista de ritmos DEVE ter "Sem ritmo" como primeiro item e os demais ordenados naturalmente', () => {
    const list = rhythmEngine.getRhythmsList();

    expect(list[0]).toBe('Sem ritmo');
    expect(list).toContain('4/4');
  });
});