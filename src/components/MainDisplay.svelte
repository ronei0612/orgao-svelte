<script>
  /**
   * src/components/MainDisplay.svelte
   * Display principal com suporte a Leitura, Edição (contenteditable),
   * colagem limpa (apenas texto puro) e Modo Letra.
   */

  let { 
    content = '', 
    isEditing = false, 
    isLyricsOnly = false,
    onContentChange,
    onChordClick
  } = $props();

  let editorEl = $state(null);

  // Carrega o conteúdo inicial para edição quando entrar em modo de edição
  $effect(() => {
    if (isEditing && editorEl) {
      editorEl.innerHTML = content || '';
      editorEl.focus();
    }
  });

  // Intercepta a colagem para garantir apenas texto puro (sem formatação externa suja)
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
      selection.getRangeAt(0).insertNode(document.createTextNode(text));
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

  // Delegação de clique nas cifras durante o modo de visualização
  function handleViewClick(e) {
    if (isEditing) return;
    const chordNode = e.target.closest('b, strong');
    if (chordNode && onChordClick) {
      onChordClick(chordNode.innerText.trim(), chordNode);
    }
  }
</script>

{#if isEditing}
  <!-- Modo Edição: contenteditable ativo e limpo -->
  <div 
    bind:this={editorEl}
    class="display-container editing"
    contenteditable="true"
    spellcheck="false"
    onpaste={handlePaste}
    oninput={handleInput}
    data-placeholder="Cole ou digite aqui a letra com as cifras..."
    role="textbox"
    tabindex="0"
    aria-label="Editor de Cifras"
  ></div>
{:else if content}
  <!-- Modo Visualização: HTML interativo -->
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

  /* Modo de Edição */
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

  /* Estilização das Cifras (tags <b> geradas automaticamente) */
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

  /* Destaque do Acorde Ativo durante execução */
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
    padding-bottom: 220px; /* Espaço para leitura confortável até o final */
  }

  .display-container.lyrics-only :global(b),
  .display-container.lyrics-only :global(strong) {
    display: none !important; /* Oculta completamente as cifras */
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