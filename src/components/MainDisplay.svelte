<script>
  /**
   * src/components/MainDisplay.svelte
   * Display com alternância entre:
   * - Modo Música (Cifras e Letra)
   * - Liturgia Diária (Iframe com dark-mode inteligente)
   * - Santa Missa & Orações (Texto formatado offline)
   */
  import { ArrowLeft } from 'lucide-svelte';

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
  <!-- Barra de Retorno Rápido como <button> acessível -->
  {#if activeTab !== 'song' && quickReturnSongTitle}
    <button type="button" class="quick-return-bar" onclick={onReturnToSong}>
      <ArrowLeft size={16} />
      <span>Voltar para: <strong>{quickReturnSongTitle}</strong></span>
    </button>
  {/if}

  {#if activeTab === 'liturgia'}
    <!-- Visualizador Oficial da CNBB com Inversão no Tema Escuro -->
    <iframe 
      src="https://liturgiadiaria.edicoescnbb.com.br/" 
      class="content-iframe" 
      title="Liturgia Diária CNBB"
    ></iframe>

  {:else if activeTab === 'missa'}
    <div class="text-document-view">
      <h3>ORDINÁRIO DA SANTA MISSA</h3>
      <p class="section-title">RITOS INICIAIS</p>
      <p><strong>P:</strong> Em nome do Pai e do Filho e do Espírito Santo.<br>
      <span class="resp"><strong>T:</strong> Amém.</span></p>
      <p><strong>P:</strong> A graça de nosso Senhor Jesus Cristo, o amor do Pai e a comunhão do Espírito Santo estejam convosco.<br>
      <span class="resp"><strong>T:</strong> Bendito seja Deus que nos reuniu no amor de Cristo.</span></p>
      <hr />
      <p class="section-title">ATO PENITENCIAL</p>
      <p><strong>P:</strong> O Senhor tenha compaixão de nós.<br>
      <span class="resp"><strong>T:</strong> Perdoai os nossos pecados e nos conduza à vida eterna. Amém.</span></p>
      <p><strong>P:</strong> Senhor, tende piedade de nós.<br>
      <span class="resp"><strong>T:</strong> Senhor, tende piedade de nós.</span><br>
      <strong>P:</strong> Cristo, tende piedade de nós.<br>
      <span class="resp"><strong>T:</strong> Cristo, tende piedade de nós.</span><br>
      <strong>P:</strong> Senhor, tende piedade de nós.<br>
      <span class="resp"><strong>T:</strong> Senhor, tende piedade de nós.</span></p>
      <hr />
      <p class="section-title">LITURGIA EUCARÍSTICA</p>
      <p><strong>P:</strong> Orai, irmãos e irmãs, para que o meu e vosso sacrifício seja aceito por Deus Pai todo-poderoso.<br>
      <span class="resp"><strong>T:</strong> Receba o Senhor por tuas mãos este sacrifício, para glória do seu nome, para nosso bem e de toda a santa Igreja.</span></p>
      <p><strong>P:</strong> O Senhor esteja convosco.<br>
      <span class="resp"><strong>T:</strong> Ele está no meio de nós.</span><br>
      <strong>P:</strong> Corações ao alto.<br>
      <span class="resp"><strong>T:</strong> O nosso coração está em Deus.</span><br>
      <strong>P:</strong> Demos graças ao Senhor, nosso Deus.<br>
      <span class="resp"><strong>T:</strong> É nosso dever e nossa salvação.</span></p>
    </div>

  {:else if activeTab === 'oracoes'}
    <div class="text-document-view">
      <h3>ORAÇÕES COMUNS</h3>
      <p class="section-title">PAI NOSSO</p>
      <p>Pai nosso, que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino, seja feita a vossa vontade assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.</p>
      <hr />
      <p class="section-title">AVE MARIA</p>
      <p>Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora de nossa morte. Amém.</p>
      <hr />
      <p class="section-title">GLÓRIA AO PAI</p>
      <p>Glória ao Pai, e ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.</p>
      <hr />
      <p class="section-title">SALVE RAINHA</p>
      <p>Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei, e depois deste desterro mostrai-nos Jesus, bendito fruto do vosso ventre, ó clemente, ó piedosa, ó doce sempre Virgem Maria. Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.</p>
    </div>

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
    height: 100%;
  }

  /* Barra de Retorno Rápido (Quick Return) */
  .quick-return-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--app-teal);
    color: white;
    padding: 8px 14px;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    border: none;
    width: 100%;
    user-select: none;
    transition: filter 0.15s ease;
    flex-shrink: 0;
    text-align: left;
  }

  .quick-return-bar:hover {
    filter: brightness(1.1);
  }

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

  .content-iframe {
    flex: 1;
    width: 100%;
    height: 100%;
    border: 1px solid var(--app-border-display);
    border-radius: 6px;
    background-color: #ffffff;
    transition: filter 0.3s ease;
  }

  /* Modo Escuro para a Liturgia da CNBB */
  :global([data-theme="dark"]) .content-iframe {
    filter: invert(0.9) hue-rotate(180deg);
  }

  .text-document-view {
    flex: 1;
    background-color: var(--app-bg-display);
    border: 1px solid var(--app-border-display);
    border-radius: 6px;
    padding: 16px 20px;
    overflow-y: auto;
    font-family: 'Segoe UI', sans-serif;
    font-size: 15px;
    line-height: 1.6;
  }

  .text-document-view h3 {
    text-align: center;
    color: var(--app-teal);
    font-weight: bold;
    margin: 0 0 14px 0;
    font-size: 18px;
  }

  .section-title {
    font-weight: bold;
    font-size: 14px;
    color: #888;
    margin: 14px 0 6px 0;
  }

  .resp {
    color: var(--app-teal);
  }

  :global([data-theme="dark"]) .resp {
    color: #20c997;
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

  .empty-state p { margin: 0; font-weight: bold; font-size: 15px; }
  .empty-state small { display: block; margin-top: 4px; font-size: 12px; }
</style>