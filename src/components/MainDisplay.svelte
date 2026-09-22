<script>
  /**
   * src/components/MainDisplay.svelte
   * Display com contenteditable blindado via Svelte Action:
   * - O innerHTML só é populado no momento da montagem (sem feedback loop).
   * - O cursor não pula para o início ao digitar.
   * - Colagem com higienização (apenas texto puro).
   * - Modo Letra e clique nos acordes <b> em modo leitura.
   */

  let { 
    content = '', 
    isEditing = false, 
    isLyricsOnly = false,
    onContentChange,
    onChordClick
  } = $props();

  let editorEl = $state(null);

  /**
   * Posiciona o cursor (caret) no final do texto ao abrir o editor
   */
  function placeCaretAtEnd(el) {
    if (!el) return;
    el.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false); // false = colapsa para o final
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (err) {
      // Fallback silencioso caso a seleção falhe
    }
  }

  /**
   * SVELTE ACTION: Executada APENAS UMA VEZ quando a div de edição entra no DOM.
   * Nunca reescreve o innerHTML enquanto o usuário está digitando!
   */
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

  // Intercepta colagem: extrai apenas texto puro para não herdar formatação suja da web
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

  // Apenas notifica o componente pai sobre a digitação, sem alterar o DOM local
  function handleInput() {
    if (onContentChange && editorEl) {
      onContentChange(editorEl.innerHTML);
    }
  }

  // Clique em acordes durante a leitura
  function handleViewClick(e) {
    if (isEditing) return;
    const chordNode = e.target.closest('b, strong');
    if (chordNode && onChordClick) {
      onChordClick(chordNode.innerText.trim(), chordNode);
    }
  }
</script>

{#if isEditing}
  <!-- Modo Edição: usa use:setupEditor para inicialização única e estável -->
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
  <!-- Modo Leitura / Visualização -->
  <div 
    class="display-container" 
    class:lyrics-only={isLyricsOnly}
    onclick={handleViewClick}
    role="region"
    aria-label="Visor da Música"
  >
    {@html content}
  </div>
{:else}
  <!-- Estado Vazio -->
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
    padding: 12px 14px;
    overflow-y: auto;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.45;
    white-space: pre-wrap;
    min-height: 100px;
    position: relative;
    box-sizing: border-box;
    scrollbar-width: thin;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  /* Modo Edição */
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

  /* Acordes em negrito gerados automaticamente */
  :global(.display-container b),
  :global(.display-container strong) {
    color: var(--app-teal);
    font-weight: bold;
    cursor: pointer;
    border-radius: 3px;
    padding: 0 2px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  :global(.display-container b:hover) {
    background-color: rgba(11, 142, 142, 0.15);
  }

  :global([data-theme="dark"] .display-container b),
  :global([data-theme="dark"] .display-container strong) {
    color: #20c997;
  }

  /* Destaque do acorde tocando */
  :global(.display-container .chord-highlight) {
    background-color: #ffeb3b !important;
    color: #000000 !important;
    border-radius: 4px;
    padding: 1px 4px;
    box-shadow: 0 0 8px rgba(255, 235, 59, 0.9);
  }

  :global([data-theme="dark"] .display-container .chord-highlight) {
    background-color: #f39c12 !important;
    color: #ffffff !important;
    box-shadow: 0 0 8px rgba(243, 156, 18, 0.9);
  }

  /* Modo Letra (Tom = 'L') */
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