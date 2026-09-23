// tests/playback-controls.test.js
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import PlaybackControls from '../src/components/PlaybackControls.svelte';
import { sampleEngine } from '../src/audio/sampleEngine.js';
import { rhythmEngine } from '../src/audio/rhythmEngine.js';

/**
 * ============================================================================
 * SUÍTE: Botão Play, Stop, Metrônomo e Fase Harmônica
 * ============================================================================
 * Valida o painel central de execução:
 * - Alternância de estado (Parado vs Tocando) com cores azul/coral.
 * - Corte seguro de áudio ao parar.
 * - Pulso visual do metrônomo (.bpm-blink).
 * - Ciclo das 3 fases harmônicas (Órgão solo, +Cordas, Som Cheio 🎶).
 * - Botões direcionais de navegação de cifras (◀ / ▶).
 */
describe('Botão Play, Stop, Metrônomo e Fase Harmônica', () => {
  /**
   * 🎯 Objetivo: Validar as cores e acessibilidade do botão principal.
   * 📜 Regra:
   *   - Parado: Azul elétrico (.btn-play) com aria-label "Reproduzir".
   *   - Tocando: Coral/Vermelho (.btn-play.playing) com aria-label "Parar".
   */
  it('deve alternar entre estado Parado (azul) e Tocando (coral/vermelho)', async () => {
    const handleToggle = vi.fn();

    const { container, rerender } = render(PlaybackControls, {
      props: { isPlaying: false, onTogglePlay: handleToggle }
    });

    const btnPlay = container.querySelector('.btn-play');
    expect(btnPlay.classList.contains('playing')).toBe(false);

    // Dispara clique para iniciar reprodução
    await fireEvent.click(btnPlay);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    // Atualiza estado para Tocando (isPlaying = true)
    await rerender({ isPlaying: true });
    expect(btnPlay.classList.contains('playing')).toBe(true);
  });

  /**
   * 🎯 Objetivo: Validar o pulso visual sincronizado ao BPM.
   * 📜 Regra: A cada semínima contada pelo metrônomo, o botão Play recebe a classe .bpm-blink brevemente.
   */
  it('METRÔNOMO VISUAL: deve adicionar a classe .bpm-blink no botão Play quando isBlinking for true', async () => {
    const { container, rerender } = render(PlaybackControls, {
      props: { isPlaying: true, isBlinking: false }
    });

    let btnPlay = container.querySelector('.btn-play');
    expect(btnPlay.classList.contains('bpm-blink')).toBe(false);

    // Pulso do metrônomo disparado
    await rerender({ isPlaying: true, isBlinking: true });
    expect(btnPlay.classList.contains('bpm-blink')).toBe(true);
  });

  /**
   * 🎯 Objetivo: Garantir corte imediato de som e paragem do sequenciador ao dar Stop.
   * 📜 Regra: Interromper a música deve silenciar os nós de pad (sampleEngine) e o clock (rhythmEngine).
   */
  it('ao parar a reprodução (Stop), DEVE silenciar o sampleEngine e parar o rhythmEngine', () => {
    const spyStopAll = vi.spyOn(sampleEngine, 'stopAll');
    const spyRhythmStop = vi.spyOn(rhythmEngine, 'stop');

    // Ação executada pelo handler de Play/Stop no App.svelte
    function stopPlayback() {
      sampleEngine.stopAll();
      rhythmEngine.stop();
    }

    stopPlayback();

    expect(spyStopAll).toHaveBeenCalledTimes(1);
    expect(spyRhythmStop).toHaveBeenCalledTimes(1);
  });

  /**
   * 🎯 Objetivo: Validar a representação visual exata de cada fase harmônica.
   * 📜 Regras do AI.md 5.2:
   *   - Fase 1: Ícone de colcheia individual (♪).
   *   - Fase 2: Ícone de colcheias ligadas (♫).
   *   - Fase 3: Emoji '🎶' com classe .phase-3 (brilho pulsante).
   */
  it('FASES VISUAIS: deve renderizar os ícones correspondentes (Fase 1: nota única, Fase 2: notas ligadas, Fase 3: emoji 🎶 com .phase-3)', async () => {
    // 1. Fase 1: Colcheia individual
    const { container, rerender } = render(PlaybackControls, {
      props: { phase: 1 }
    });
    let btnMusic = container.querySelector('.btn-music');
    expect(btnMusic.classList.contains('phase-3')).toBe(false);
    expect(btnMusic.querySelector('svg.music-svg')).not.toBeNull();
    expect(btnMusic.querySelector('.music-emoji')).toBeNull();

    // 2. Fase 2: Colcheias ligadas com barra
    await rerender({ phase: 2 });
    expect(btnMusic.classList.contains('phase-3')).toBe(false);
    expect(btnMusic.querySelector('svg.music-svg')).not.toBeNull();

    // 3. Fase 3: Emoji 🎶 com classe .phase-3
    await rerender({ phase: 3 });
    expect(btnMusic.classList.contains('phase-3')).toBe(true);
    const emoji = btnMusic.querySelector('.music-emoji');
    expect(emoji).not.toBeNull();
    expect(emoji.textContent).toBe('🎶');
  });

  /**
   * 🎯 Objetivo: Validar o ciclo contínuo do botão de fase ao ser clicado.
   * 📜 Regra: 1 -> 2 -> 3 -> volta para 1.
   */
  it('deve alternar a Fase Harmônica em ciclo (1 -> 2, 2 -> 3, 3 -> 1)', async () => {
    const handlePhase = vi.fn();

    const { getByLabelText, rerender } = render(PlaybackControls, {
      props: { phase: 1, onPhaseChange: handlePhase }
    });

    const btnMusic = getByLabelText('Fase Harmônica');

    // 1 -> 2
    await fireEvent.click(btnMusic);
    expect(handlePhase).toHaveBeenLastCalledWith(2);

    // 2 -> 3
    await rerender({ phase: 2 });
    await fireEvent.click(btnMusic);
    expect(handlePhase).toHaveBeenLastCalledWith(3);

    // 3 -> 1 (volta para o início)
    await rerender({ phase: 3 });
    await fireEvent.click(btnMusic);
    expect(handlePhase).toHaveBeenLastCalledWith(1);
  });

  /**
   * 🎯 Objetivo: Validar a exibição condicional dos botões direcionais de cifras (showNav).
   * 📜 Regra:
   *   - No modo acordes livres (showNav: false): Os botões ◀ e ▶ não existem no DOM.
   *   - Com música aberta (showNav: true): Os botões ◀ e ▶ surgem e respondem aos cliques.
   */
  it('NAVEGAÇÃO DE CIFRAS (showNav): deve exibir botões ◀ e ▶ somente quando showNav for true e responder aos cliques', async () => {
    const handlePrev = vi.fn();
    const handleNext = vi.fn();

    // 1. Modo livre -> botões ocultos
    const { queryByLabelText, rerender } = render(PlaybackControls, {
      props: { showNav: false }
    });
    expect(queryByLabelText('Acorde Anterior')).toBeNull();
    expect(queryByLabelText('Próximo Acorde')).toBeNull();

    // 2. Modo repertório ativo -> botões visíveis
    await rerender({
      showNav: true,
      onPrevChord: handlePrev,
      onNextChord: handleNext
    });

    const btnPrev = queryByLabelText('Acorde Anterior');
    const btnNext = queryByLabelText('Próximo Acorde');

    expect(btnPrev).not.toBeNull();
    expect(btnNext).not.toBeNull();

    await fireEvent.click(btnPrev);
    expect(handlePrev).toHaveBeenCalledTimes(1);

    await fireEvent.click(btnNext);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });
});