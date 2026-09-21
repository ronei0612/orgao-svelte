<script>
  import { Play, Square, Music, StepBack, StepForward } from 'lucide-svelte';

  let { 
    isPlaying = false, 
    isBlinking = false,
    phase = 1, 
    onTogglePlay, 
    onPhaseChange 
  } = $props();

  function nextPhase() {
    const next = (phase % 3) + 1;
    if (onPhaseChange) onPhaseChange(next);
  }
</script>

<div class="playback-panel">
  <button class="nav-btn" title="Acorde Anterior" aria-label="Acorde Anterior">
    <StepBack size={24} />
  </button>

  <button 
    type="button"
    class="btn-circle btn-play" 
    class:playing={isPlaying} 
    class:bpm-blink={isBlinking}
    onclick={onTogglePlay} 
    aria-label="Tocar ou Pausar"
  >
    {#if isPlaying}
      <Square size={24} />
    {:else}
      <Play size={26} style="margin-left: 3px;" />
    {/if}
  </button>

  <button class="nav-btn" title="Próximo Acorde" aria-label="Próximo Acorde">
    <StepForward size={24} />
  </button>

  <button 
    type="button"
    class="btn-circle btn-music" 
    class:phase-3={phase === 3} 
    onclick={nextPhase} 
    title="Fase Harmônica (1: Órgão, 2: +Cordas, 3: Cheio)"
    aria-label="Fase Harmônica"
  >
    {#if phase === 1}
      <Music size={22} />
    {:else if phase === 2}
      <span class="music-icon-2">♫</span>
    {:else}
      <span class="music-icon-3">🎶</span>
    {/if}
  </button>
</div>

<style>
  .playback-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 6px 0;
  }

  .nav-btn {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }

  .nav-btn:hover {
    color: var(--app-teal);
  }

  .btn-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.2s;
  }

  .btn-play {
    background-color: #2b7af1;
    box-shadow: 0 0 16px 3px rgba(33, 190, 232, 0.6);
  }

  .btn-play.playing {
    background-color: #ff6347;
    box-shadow: 0 0 16px 3px rgba(230, 57, 70, 0.6);
  }

  /* PISCAR DO METRÔNOMO NO COMPASSO */
  .btn-play.bpm-blink {
    filter: brightness(1.5);
    transform: scale(1.08);
    box-shadow: 0 0 24px 6px rgba(255, 255, 255, 0.9);
  }

  .btn-music {
    background-color: var(--app-teal);
  }

  .btn-music.phase-3 {
    box-shadow: 0 0 16px 3px rgba(11, 142, 142, 0.7);
  }

  .music-icon-2 { font-size: 20px; }
  .music-icon-3 { font-size: 18px; }
</style>