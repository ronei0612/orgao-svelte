<script>
  /**
   * src/components/MainDisplay.svelte
   * Display com gerenciamento de passos das cifras, auto-scroll e destaque .chord-highlight
   */

  let { 
    content = '', 
    isEditing = false, 
    isLyricsOnly = false,
    activeStepIndex = -1,
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

  // Atualiza contagem de passos de acordes quando o conteúdo muda
  $effect(() => {
    if (!isEditing && viewContainerEl) {
      const nodes = Array.from(viewContainerEl.querySelectorAll('b, strong'));
      onStepsCount?.(nodes.length);
    }
  });

  // Atualiza o destaque luminoso e o auto-scroll quando o índice do passo muda
  $effect(() => {
    if (!isEditing && viewContainerEl) {
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

  // Clique em uma cifra no texto
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

{#if isEditing}
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

<style>
  .display-container {
    flex: 1;
    background-color: var(--app-bg-display);
    border: 1px solid var(--app-border-display);
    border-radius: 6px;
    padding: 14px 16px;
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

  .display-container.editing {
    background-color: var(--app-surface);
    border-color: #0d6efd;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.2);
    cursor: text;
    outline: none;
  }

  .display-container.editing:empty::before {
    content: attr(data-placeholder);
    color: #888;
    font-style: italic;
    pointer-events: none;
  }

  :global(.display-container b),
  :global(.display-container strong) {
    color: var(--app-teal);
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    padding: 1px 3px;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
    display: inline-block;
  }

  :global(.display-container b:hover) {
    background-color: rgba(11, 142, 142, 0.18);
    transform: scale(1.05);
  }

  :global([data-theme="dark"] .display-container b),
  :global([data-theme="dark"] .display-container strong) {
    color: #20c997;
  }

  /* Destaque do Acorde Ativo tocando */
  :global(.display-container .chord-highlight) {
    background-color: #ffeb3b !important;
    color: #000000 !important;
    box-shadow: 0 0 10px 2px rgba(255, 235, 59, 0.95);
    transform: scale(1.08);
  }

  :global([data-theme="dark"] .display-container .chord-highlight) {
    background-color: #f39c12 !important;
    color: #ffffff !important;
    box-shadow: 0 0 10px 2px rgba(243, 156, 18, 0.95);
  }

  .display-container.lyrics-only {
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    padding-bottom: 220px;
  }

  .display-container.lyrics-only :global(b),
  .display-container.lyrics-only :global(strong) {
    display: none !important;
  }

  .empty-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-state {
    color: #888;
    text-align: center;
    user-select: none;
  }

  .empty-state p {
    margin: 0;
    font-weight: bold;
    font-size: 15px;
  }

  .empty-state small {
    display: block;
    margin-top: 4px;
    font-size: 12px;
  }
</style>