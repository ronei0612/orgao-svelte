<script>
  /**
   * src/components/PlaybackControls.svelte
   * Controles flutuantes arrastáveis idênticos ao layout original (.floating-controls)
   */

  let { 
    isPlaying = false, 
    isBlinking = false,
    phase = 1, 
    showNav = false,
    onTogglePlay, 
    onPhaseChange,
    onPrevChord,
    onNextChord
  } = $props();

  function nextPhase(e) {
    e?.stopPropagation();
    if (hasMoved) return;
    const next = (phase % 3) + 1;
    if (onPhaseChange) onPhaseChange(next);
  }

  // --- MOTOR DRAG AND DROP ---
  let panelEl = $state(null);
  let isPointerDown = false;
  let hasMoved = $state(false);

  let posX = $state(null);
  let posY = $state(null);

  let startClientX = 0;
  let startClientY = 0;
  let panelInitialX = 0;
  let panelInitialY = 0;

  $effect(() => {
    if (showNav && posX === null && typeof window !== 'undefined') {
      const panelWidth = 260;
      posX = Math.max(16, (window.innerWidth - panelWidth) / 2);
      posY = Math.max(80, window.innerHeight - 175);
    }
    if (!showNav) {
      posX = null;
      posY = null;
    }
  });

  function handleContainerPointerDown(e) {
    if (!showNav) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isPointerDown = true;
    hasMoved = false;
    startClientX = e.clientX;
    startClientY = e.clientY;

    if (panelEl) {
      const rect = panelEl.getBoundingClientRect();
      panelInitialX = rect.left;
      panelInitialY = rect.top;
    }

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
  }

  function handleWindowPointerMove(e) {
    if (!isPointerDown) return;

    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;

    // Ativa o arrasto se mover mais de 6 pixels
    if (!hasMoved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      hasMoved = true;
    }

    if (hasMoved && panelEl) {
      const panelWidth = panelEl.offsetWidth || 260;
      const panelHeight = panelEl.offsetHeight || 66;

      const minX = 8;
      const maxX = window.innerWidth - panelWidth - 8;
      const minY = 8; // Permite arrastar até o topo como no print original (top: 14px)
      const maxY = window.innerHeight - panelHeight - 8;

      posX = Math.max(minX, Math.min(maxX, panelInitialX + dx));
      posY = Math.max(minY, Math.min(maxY, panelInitialY + dy));
    }
  }

  function handleWindowPointerUp() {
    isPointerDown = false;
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('pointerup', handleWindowPointerUp);
    window.removeEventListener('pointercancel', handleWindowPointerUp);

    if (hasMoved) {
      setTimeout(() => {
        hasMoved = false;
      }, 80);
    }
  }

  function handlePlayClick(e) {
    e.stopPropagation();
    if (!hasMoved) {
      onTogglePlay?.();
    }
  }

  function handlePrevClick(e) {
    e.stopPropagation();
    if (!hasMoved) {
      onPrevChord?.();
    }
  }

  function handleNextClick(e) {
    e.stopPropagation();
    if (!hasMoved) {
      onNextChord?.();
    }
  }
</script>

<div 
  bind:this={panelEl}
  class="playback-panel" 
  class:floating-controls={showNav}
  class:is-dragging={hasMoved}
  style={showNav && posX !== null ? `left: ${posX}px; top: ${posY}px; margin: 0px;` : ''}
  onpointerdown={handleContainerPointerDown}
  role="region"
  aria-label="Controles de Reprodução"
>
  <!-- Botão Acorde Anterior (|◀) -->
  {#if showNav}
    <button 
      type="button" 
      class="nav-btn" 
      onclick={handlePrevClick}
      title="Acorde Anterior (Seta Esquerda)" 
      aria-label="Acorde Anterior"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>
    </button>
  {/if}

  <!-- Botão Play / Stop Central com Glow Azul -->
  <button 
    type="button"
    class="btn-circle btn-play" 
    class:playing={isPlaying} 
    class:bpm-blink={isBlinking}
    onclick={handlePlayClick} 
    aria-label={isPlaying ? "Parar" : "Reproduzir"}
    title="Reproduzir / Parar (Espaço)"
  >
    {#if isPlaying}
      <span class="icon-stop"></span>
    {:else}
      <span class="icon-play"></span>
    {/if}
  </button>

  <!-- Botão Próximo Acorde (▶|) -->
  {#if showNav}
    <button 
      type="button" 
      class="nav-btn" 
      onclick={handleNextClick}
      title="Próximo Acorde (Seta Direita)" 
      aria-label="Próximo Acorde"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
    </button>
  {/if}

  <!-- Botão Fase Harmônica (Círculo Teal com Ícone) -->
  <button 
    type="button"
    class="btn-circle btn-music" 
    class:phase-3={phase === 3}
    onclick={nextPhase} 
    title="Fase Harmônica (1: Órgão, 2: +Cordas, 3: Cheio)"
    aria-label="Fase Harmônica"
  >
    {#if phase === 1}
      <svg class="music-svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2z"/>
        <path fill-rule="evenodd" d="M9 3v10H8V3h1z"/>
        <path d="M8 2.82a1 1 0 0 1 .804-.98l3-1.2A1 1 0 0 1 13 1.6V4a1 1 0 0 1-.804.98l-3 1.2A1 1 0 0 1 8 5.2V2.82z"/>
      </svg>
    {:else if phase === 2}
      <svg class="music-svg" viewBox="0 0 16 16" width="22" height="22" fill="currentColor">
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
  /* Painel padrão quando em modo livre (sem música selecionada) */
  .playback-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 2px 0;
  }

  /* ESTILOS EXATOS DO PRINT (styles.css:526) */
  .playback-panel.floating-controls {
    position: fixed;
    z-index: 45;
    background-color: var(--app-bg-floating);
    backdrop-filter: blur(1px);
    -webkit-backdrop-filter: blur(1px);
    box-shadow: 0 10px 30px var(--app-shadow-floating);
    border-radius: 50px;
    padding: 10px 20px;
    cursor: move;
    user-select: none;
    touch-action: none;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem; /* gap-4 = 24px */
  }

  .playback-panel.floating-controls.is-dragging {
    opacity: 0.95;
    box-shadow: 0 14px 34px var(--app-shadow-floating);
  }

  /* Botões direcionais de cifras (|◀ e ▶|) */
  .nav-btn {
    background: none;
    border: none;
    color: #495057;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    opacity: 0.85;
    pointer-events: auto;
    touch-action: manipulation;
    transition: transform 0.12s ease, opacity 0.12s ease, color 0.12s ease;
  }

  .nav-btn:hover {
    opacity: 1;
    color: var(--app-teal);
    transform: scale(1.1);
  }

  .nav-btn:active {
    transform: scale(0.92);
  }

  [data-theme="dark"] .nav-btn {
    color: #ced4da;
  }

  /* Botão Play circular com aura luminosa azul idêntica ao print */
  .btn-circle {
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    pointer-events: auto;
    touch-action: manipulation;
    transition: transform 0.15s ease, box-shadow 0.25s ease, background-color 0.25s ease;
    user-select: none;
    padding: 0;
  }

  .btn-circle:active {
    transform: scale(0.92);
  }

  .btn-play {
    width: 48px;
    height: 48px;
    background-color: #2680eb;
    box-shadow: 0 0 22px 6px rgba(38, 128, 235, 0.55);
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
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 14px solid #ffffff;
    margin-left: 3px;
    border-radius: 2px;
  }

  .icon-stop {
    width: 14px;
    height: 14px;
    background-color: #ffffff;
    border-radius: 3px;
  }

  /* Botão Teal de Fase Harmônica */
  .btn-music {
    width: 44px;
    height: 44px;
    background-color: var(--app-teal);
    box-shadow: 0 0 12px 2px rgba(11, 142, 142, 0.35);
  }

  .btn-music.phase-3 {
    box-shadow: 0 0 18px 4px rgba(11, 142, 142, 0.7);
  }

  .music-svg { fill: #ffffff; }
  .music-emoji { font-size: 18px; line-height: 1; }
</style>