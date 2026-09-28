<script>
  import { ArrowLeft } from 'lucide-svelte';
  import MissaView from './MissaView.svelte';
  import OracoesView from './OracoesView.svelte';

  let { 
    content = '', 
    isEditing = false, 
    isLyricsOnly = false,
    activeStepIndex = -1,
    activeTab = 'song', // 'song' | 'liturgia' | 'missa' | 'oracoes'
    quickReturnSongTitle = '',
    onReturnToSong,
    onContentChange,
    onChordClick,
    onStepsCount,
    onActiveChordChange
  } = $props();

  let editorEl = $state(null);
  let viewContainerEl = $state(null);

  function placeCaretAtEnd(el) {
    if (!el) return;
    el.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (err) {}
  }

  function setupEditor(node) {
    editorEl = node;
    node.innerHTML = content || '';
    placeCaretAtEnd(node);

    return {
      destroy() {
        editorEl = null;
      }
    };
  }

  function handlePaste(e) {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const text = clipboardData.getData('text/plain');

    if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      selection.deleteFromDocument();
      const textNode = document.createTextNode(text);
      selection.getRangeAt(0).insertNode(textNode);
      selection.collapseToEnd();
    }

    if (onContentChange && editorEl) {
      onContentChange(editorEl.innerHTML);
    }
  }

  function handleInput() {
    if (onContentChange && editorEl) {
      onContentChange(editorEl.innerHTML);
    }
  }

  $effect(() => {
    if (!isEditing && activeTab === 'song' && viewContainerEl) {
      const nodes = Array.from(viewContainerEl.querySelectorAll('b, strong'));
      onStepsCount?.(nodes.length);
    }
  });

  $effect(() => {
    if (!isEditing && activeTab === 'song' && viewContainerEl) {
      const nodes = Array.from(viewContainerEl.querySelectorAll('b, strong'));
      nodes.forEach((el) => el.classList.remove('chord-highlight'));

      if (activeStepIndex >= 0 && activeStepIndex < nodes.length) {
        const activeNode = nodes[activeStepIndex];
        activeNode.classList.add('chord-highlight');
        activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onActiveChordChange?.(activeNode.innerText.trim());
      }
    }
  });

  function handleViewClick(e) {
    if (isEditing || !viewContainerEl) return;
    const chordNode = e.target.closest('b, strong');
    if (chordNode) {
      const nodes = Array.from(viewContainerEl.querySelectorAll('b, strong'));
      const index = nodes.indexOf(chordNode);
      if (index !== -1 && onChordClick) {
        onChordClick(chordNode.innerText.trim(), index);
      }
    }
  }
</script>

<div class="display-wrapper">
  <!-- Barra de Retorno Rápido persistente -->
  {#if activeTab !== 'song' && quickReturnSongTitle}
    <button type="button" class="quick-return-bar" onclick={onReturnToSong}>
      <ArrowLeft size={16} />
      <span>Voltar para: <strong>{quickReturnSongTitle}</strong></span>
    </button>
  {/if}

  {#if activeTab === 'liturgia'}
    <!-- Visualizador Oficial da CNBB -->
    <iframe 
      src="https://liturgiadiaria.edicoescnbb.com.br/" 
      class="content-iframe" 
      title="Liturgia Diária CNBB"
    ></iframe>

  {:else if activeTab === 'missa'}
    <MissaView />

  {:else if activeTab === 'oracoes'}
    <OracoesView />

  {:else if isEditing}
    <div 
      class="display-container editing"
      contenteditable="true"
      spellcheck="false"
      use:setupEditor
      onpaste={handlePaste}
      oninput={handleInput}
      data-placeholder="Cole ou digite aqui a letra com as cifras..."
      role="textbox"
      tabindex="0"
      aria-label="Editor de Cifras"
    ></div>

  {:else if content}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
    <div 
      bind:this={viewContainerEl}
      class="display-container" 
      class:lyrics-only={isLyricsOnly}
      onclick={handleViewClick}
      role="region"
      aria-label="Visor da Música"
    >
      {@html content}
    </div>

  {:else}
    <div class="display-container empty-container">
      <div class="empty-state">
        <p>Nenhuma música selecionada</p>
        <small>Selecione no campo acima ou toque em + para adicionar.</small>
      </div>
    </div>
  {/if}
</div>

<style>
  .display-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  .quick-return-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--app-teal);
    color: #ffffff;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    margin-bottom: 6px;
    width: 100%;
    transition: filter 0.15s ease;
    user-select: none;
  }

  .quick-return-bar:hover {
    filter: brightness(1.1);
  }

  .content-iframe {
    flex: 1;
    width: 100%;
    height: 100%;
    border: 1px solid var(--app-border-display);
    border-radius: 6px;
    background: #ffffff;
  }

  :global([data-theme="dark"]) .content-iframe {
    filter: invert(0.9) hue-rotate(180deg);
  }

  .display-container {
    flex: 1;
    background-color: var(--app-bg-display);
    border: 1px solid var(--app-border-display);
    border-radius: 6px;
    padding: 14px 16px;
    padding-bottom: 140px;
    overflow-y: auto;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.45;
    white-space: pre-wrap;
    min-height: 120px;
    position: relative;
    box-sizing: border-box;
    scrollbar-width: thin;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .display-container.lyrics-only {
    font-family: 'Roboto', system-ui, sans-serif;
    font-size: 16px;
  }

  .display-container.lyrics-only :global(b),
  .display-container.lyrics-only :global(strong) {
    display: none !important;
  }

  :global(.chord-highlight) {
    background-color: #ffeb3b !important;
    color: #000000 !important;
    padding: 1px 3px;
    border-radius: 3px;
    font-weight: bold;
  }

  :global([data-theme="dark"] .chord-highlight) {
    background-color: #d4a017 !important;
    color: #ffffff !important;
  }

  .empty-container {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .empty-state p {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  .empty-state small {
    color: #888;
  }
</style>