<script>
  let { 
    isPlaying = false, 
    isBlinking = false,
    phase = 1, 
    showNav = false,
    onTogglePlay, 
    onPhaseChange 
  } = $props();

  function nextPhase() {
    const next = (phase % 3) + 1;
    if (onPhaseChange) onPhaseChange(next);
  }
</script>

<div class="playback-panel">
  {#if showNav}
    <button type="button" class="nav-btn" title="Acorde Anterior" aria-label="Acorde Anterior">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>
    </button>
  {/if}

  <button 
    type="button"
    class="btn-circle btn-play" 
    class:playing={isPlaying} 
    class:bpm-blink={isBlinking}
    onclick={onTogglePlay} 
    aria-label={isPlaying ? "Parar" : "Reproduzir"}
  >
    {#if isPlaying}
      <span class="icon-stop"></span>
    {:else}
      <span class="icon-play"></span>
    {/if}
  </button>

  {#if showNav}
    <button type="button" class="nav-btn" title="Próximo Acorde" aria-label="Próximo Acorde">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
    </button>
  {/if}

  <button 
    type="button"
    class="btn-circle btn-music" 
    class:phase-3={phase === 3}
    onclick={nextPhase} 
    title="Fase Harmônica (1: Órgão, 2: +Cordas, 3: Cheio)"
    aria-label="Fase Harmônica"
  >
    {#if phase === 1}
      <svg class="music-svg" viewBox="0 0 16 16" width="22" height="22" fill="currentColor">
        <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2z"/>
        <path fill-rule="evenodd" d="M9 3v10H8V3h1z"/>
        <path d="M8 2.82a1 1 0 0 1 .804-.98l3-1.2A1 1 0 0 1 13 1.6V4a1 1 0 0 1-.804.98l-3 1.2A1 1 0 0 1 8 5.2V2.82z"/>
      </svg>
    {:else if phase === 2}
      <svg class="music-svg" viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
        <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.895 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
        <path fill-rule="evenodd" d="M14 11V2h1v9h-1zM6 13V4h1v9H6z"/>
        <path d="M6 3.5 15 1.5v2L6 5.5v-2z"/>
      </svg>
    {:else}
      <span class="music-emoji">🎶</span>
    {/if}
  </button>
</div>

<style>
  .playback-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    padding: 2px 0; /* Altura compacta */
  }

  .nav-btn {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
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
    transition: transform 0.15s ease, box-shadow 0.25s ease, background-color 0.25s ease;
    user-select: none;
    padding: 0;
  }

  .btn-circle:active {
    transform: scale(0.93);
  }

  .btn-play {
    background-color: #2680eb;
    box-shadow: 0 0 18px 5px rgba(38, 128, 235, 0.45);
  }

  .btn-play.playing {
    background-color: #ff5733;
    box-shadow: 0 0 22px 6px rgba(255, 87, 51, 0.55);
  }

  .btn-play.bpm-blink {
    filter: brightness(1.35);
    transform: scale(1.06);
    box-shadow: 0 0 26px 8px rgba(255, 255, 255, 0.9);
  }

  .icon-play {
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 17px solid #ffffff;
    margin-left: 3px;
    border-radius: 2px;
  }

  .icon-stop {
    width: 17px;
    height: 17px;
    background-color: #ffffff;
    border-radius: 3px;
  }

  .btn-music {
    background-color: #0b8e8e;
    box-shadow: 0 0 10px 1px rgba(11, 142, 142, 0.3);
  }

  .btn-music.phase-3 {
    box-shadow: 0 0 18px 4px rgba(11, 142, 142, 0.7);
  }

  .music-svg { fill: #ffffff; }
  .music-emoji { font-size: 20px; line-height: 1; }
</style>