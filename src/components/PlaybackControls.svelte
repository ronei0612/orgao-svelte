<script>
  /**
   * src/components/PlaybackControls.svelte
   * Controles flutuantes arrastáveis com botões 100% clicáveis
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

  // --- MOTOR DRAG AND DROP CORRIGIDO ---
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
      const panelWidth = 240;
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

    // Escuta na janela para permitir arrastar suavemente mesmo se o ponteiro sair do painel
    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
  }

  function handleWindowPointerMove(e) {
    if (!isPointerDown) return;

    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;

    // Só ativa arrasto se mover mais de 8 pixels (preserva 100% o clique)
    if (!hasMoved && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      hasMoved = true;
    }

    if (hasMoved && panelEl) {
      const panelWidth = panelEl.offsetWidth || 240;
      const panelHeight = panelEl.offsetHeight || 64;

      const minX = 8;
      const maxX = window.innerWidth - panelWidth - 8;
      const minY = 50;
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
  class:floating-pill={showNav}
  class:is-dragging={hasMoved}
  style={showNav && posX !== null ? `left: ${posX}px; top: ${posY}px;` : ''}
  onpointerdown={handleContainerPointerDown}
  role="region"
  aria-label="Controles de Reprodução"
>
  <!-- Botão Acorde Anterior -->
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

  <!-- Botão Play / Stop Central -->
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

  <!-- Botão Próximo Acorde -->
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

  <!-- Botão Fase Harmônica -->
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
  .playback-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 2px 0;
  }

  .playback-panel.floating-pill {
    position: fixed;
    z-index: 200;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 6px 16px;
    background: rgba(252, 249, 238, 0.88);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 50px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
    touch-action: none;
    user-select: none;
    cursor: grab;
    transition: box-shadow 0.2s, background-color 0.2s;
  }

  .playback-panel.floating-pill.is-dragging {
    cursor: grabbing;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
    opacity: 0.95;
  }

  [data-theme="dark"] .playback-panel.floating-pill {
    background: rgba(30, 30, 30, 0.88);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
  }

  .nav-btn {
    background: none;
    border: none;
    color: #495057;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
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
    color: #adb5bd;
  }

  .btn-circle {
    width: 50px;
    height: 50px;
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
    box-shadow: 0 0 24px 8px rgba(255, 255, 255, 0.9);
  }

  .icon-play {
    width: 0;
    height: 0;
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-left: 15px solid #ffffff;
    margin-left: 3px;
    border-radius: 2px;
  }

  .icon-stop {
    width: 15px;
    height: 15px;
    background-color: #ffffff;
    border-radius: 3px;
  }

  .btn-music {
    width: 44px;
    height: 44px;
    background-color: #0b8e8e;
    box-shadow: 0 0 10px 1px rgba(11, 142, 142, 0.3);
  }

  .btn-music.phase-3 {
    box-shadow: 0 0 18px 4px rgba(11, 142, 142, 0.7);
  }

  .music-svg { fill: #ffffff; }
  .music-emoji { font-size: 18px; line-height: 1; }
</style>