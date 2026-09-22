// tests/playback-controls.test.js
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import PlaybackControls from '../src/components/PlaybackControls.svelte';
import { sampleEngine } from '../src/audio/sampleEngine.js';
import { rhythmEngine } from '../src/audio/rhythmEngine.js';

describe('Funcionalidade 5: Botão Play, Stop e Fase Harmônica', () => {
  it('deve alternar entre estado Parado (azul) e Tocando (coral/vermelho)', async () => {
    const handleToggle = vi.fn();

    const { container, rerender } = render(PlaybackControls, {
      props: { isPlaying: false, onTogglePlay: handleToggle }
    });

    const btnPlay = container.querySelector('.btn-play');
    expect(btnPlay.classList.contains('playing')).toBe(false);

    // Clica para dar Play
    await fireEvent.click(btnPlay);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    // Quando o componente recebe isPlaying = true, adiciona a classe .playing
    rerender({ isPlaying: true });
    expect(btnPlay.classList.contains('playing')).toBe(true);
  });

  it('ao parar a reprodução (Stop), DEVE silenciar o sampleEngine e parar o rhythmEngine', () => {
    const spyStopAll = vi.spyOn(sampleEngine, 'stopAll');
    const spyRhythmStop = vi.spyOn(rhythmEngine, 'stop');

    // Simula a ação de desligar o Play executada no App.svelte
    function stopPlayback() {
      sampleEngine.stopAll();
      rhythmEngine.stop();
    }

    stopPlayback();

    expect(spyStopAll).toHaveBeenCalledTimes(1);
    expect(spyRhythmStop).toHaveBeenCalledTimes(1);
  });

  it('deve alternar a Fase Harmônica em ciclo (1 -> 2 -> 3 -> 1)', async () => {
    const handlePhase = vi.fn();

    const { getByLabelText, rerender } = render(PlaybackControls, {
      props: { phase: 1, onPhaseChange: handlePhase }
    });

    const btnMusic = getByLabelText('Fase Harmônica');

    // 1 -> 2
    await fireEvent.click(btnMusic);
    expect(handlePhase).toHaveBeenLastCalledWith(2);

    // 2 -> 3
    rerender({ phase: 2 });
    await fireEvent.click(btnMusic);
    expect(handlePhase).toHaveBeenLastCalledWith(3);

    // 3 -> 1
    rerender({ phase: 3 });
    await fireEvent.click(btnMusic);
    expect(handlePhase).toHaveBeenLastCalledWith(1);
  });
});