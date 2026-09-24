<script>
  import { Menu, Minus, Plus, FilePlus, Edit, Trash2, Save, X, ChevronDown } from 'lucide-svelte';
  import ConfirmModal from './ConfirmModal.svelte';

  let { 
    onOpenMenu, 
    selectedKey = 'C', 
    bpm = 90, 
    isEditing = false,
    songs = [],
    selectedSongId = '',
    songTitle = '',
    onKeyChange, 
    onBpmChange,
    onBpmSet,
    onSongChange,
    onTitleChange,
    onAddSong,
    onEditSong,
    onDeleteSong,
    onSaveSong,
    onCancelEdit
  } = $props();

  // --- SELETOR DE TOM ---
  const majorKeys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const isMinor = $derived(selectedKey && selectedKey.endsWith('m') && selectedKey !== 'L');
  const baseKeys = $derived(isMinor ? majorKeys.map(k => `${k}m`) : majorKeys);

  // "Letra" só aparece no topo SE houver música selecionada
  const availableKeys = $derived(
    selectedSongId ? ['L', ...baseKeys] : baseKeys
  );

  // --- BUSCA E SELEÇÃO DE MÚSICAS ---
  let isDropdownOpen = $state(false);
  let isTyping = $state(false); // Flag que indica se o usuário está digitando ativamente
  let searchQuery = $state('');
  let searchInputEl = $state(null);
  let showActions = $state(false);

  // Modais de confirmação
  let isConfirmEditOpen = $state(false);
  let isConfirmDeleteOpen = $state(false);

  // Músicas em ordem alfabética estrita case-insensitive
  const sortedSongs = $derived(
    [...songs].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }))
  );

  // Filtro de busca em tempo real
  const filteredSongs = $derived.by(() => {
    if (!searchQuery.trim()) return sortedSongs;
    const q = searchQuery.toLowerCase().trim();
    return sortedSongs.filter(s => s.title.toLowerCase().includes(q));
  });

  const selectedSong = $derived(songs.find(s => s.id === selectedSongId));
  
  // Exibe o que está sendo digitado OU o título da música selecionada
  const displayValue = $derived(
    isTyping ? searchQuery : (selectedSong ? selectedSong.title : '')
  );

  function handleWindowClick(e) {
    if (!e.target.closest('.song-search-wrapper')) {
      isDropdownOpen = false;
      isTyping = false;
      searchQuery = '';
    }
    if (!e.target.closest('.right-cluster')) {
      showActions = false;
    }
  }

  function handleInputFocus() {
    showActions = false; // Oculta botões de ação ao focar
    isDropdownOpen = true;
  }

  function handleInput(e) {
    searchQuery = e.target.value;
    isTyping = true;
    isDropdownOpen = true;
    showActions = false;
  }

  function handleClearSearch(e) {
    e.stopPropagation();
    searchQuery = '';
    isTyping = false;
    onSongChange(''); // Volta para o modo padrão "Acordes"
    if (searchInputEl) {
      searchInputEl.focus();
    }
    isDropdownOpen = true;
  }

  function handleSelectSong(id) {
    onSongChange(id);
    isDropdownOpen = false;
    isTyping = false; // Desativa digitação: volta a mostrar a seta v
    searchQuery = '';
  }

  function handleSelectAcordes() {
    onSongChange('');
    isDropdownOpen = false;
    isTyping = false;
    searchQuery = '';
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    showActions = false;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function formatHighlight(title, query) {
    if (!query.trim()) return title;
    const regex = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
    return title.replace(regex, '<mark class="highlight-match">$1</mark>');
  }
</script>

<svelte:window onclick={handleWindowClick} />

<header class="header-toolbar">
  <div class="left-cluster">
    <button type="button" class="btn-menu" onclick={onOpenMenu} title="Menu Principal" aria-label="Menu">
      <Menu size={22} />
    </button>

    <!-- Tom -->
    <div class="input-group group-key">
      <button 
        type="button" 
        class="btn-teal btn-step" 
        onclick={() => onKeyChange(-1)} 
        aria-label="Diminuir tom"
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>

      <div class="select-wrapper">
        <select 
          class="group-select text-center" 
          value={selectedKey} 
          onchange={(e) => onKeyChange(e.target.value)}
          aria-label="Tom"
        >
          {#if !availableKeys.includes(selectedKey) && selectedKey}
            <option value={selectedKey}>{selectedKey}</option>
          {/if}

          {#each availableKeys as k}
            <option value={k}>{k === 'L' ? 'Letra' : k}</option>
          {/each}
        </select>
        <ChevronDown size={14} class="select-arrow" />
      </div>

      <button 
        type="button" 
        class="btn-teal btn-step" 
        onclick={() => onKeyChange(1)} 
        aria-label="Aumentar tom"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>

    <!-- BPM -->
    <div class="input-group group-bpm">
      <button type="button" class="btn-teal btn-bpm-step" onclick={() => onBpmChange(-5)} aria-label="-5 BPM">-5</button>
      <button type="button" class="btn-teal btn-bpm-single border-left" onclick={() => onBpmChange(-1)} aria-label="-1 BPM">
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <input 
        type="number" 
        class="bpm-input" 
        value={bpm} 
        oninput={(e) => onBpmSet?.(Number(e.target.value))}
        min="30" 
        max="300" 
        aria-label="BPM"
      />
      <button type="button" class="btn-teal btn-bpm-step border-left" onclick={() => onBpmChange(5)} aria-label="+5 BPM">+5</button>
    </div>
  </div>

  <div class="right-cluster" onclick={(e) => e.stopPropagation()} role="presentation">
    {#if isEditing}
      <!-- Modo Edição de Título -->
      <div class="input-group song-group is-editing-group">
        <input 
          type="text" 
          class="song-input" 
          placeholder="Título da música..." 
          value={songTitle}
          oninput={(e) => onTitleChange?.(e.target.value)}
          onkeydown={(e) => {
            if (e.key === 'Enter') onSaveSong?.();
            if (e.key === 'Escape') onCancelEdit?.();
          }}
          aria-label="Título da Música"
        />
        <button type="button" class="btn-action btn-save" onclick={onSaveSong} title="Salvar"><Save size={18} /></button>
        <button type="button" class="btn-action btn-cancel" onclick={onCancelEdit} title="Cancelar"><X size={18} /></button>
      </div>
    {:else}
      <!-- Seletor com Busca -->
      <div class="input-group song-group">
        <div class="song-search-wrapper">
          <input 
            bind:this={searchInputEl}
            type="text"
            class="song-search-input"
            placeholder="Escolha a Música..."
            value={displayValue}
            onfocus={handleInputFocus}
            oninput={handleInput}
            aria-label="Pesquisar Música"
          />

          <!-- O 'X' SÓ APARECE SE ESTIVER DIGITANDO ATIVAMENTE COM TEXTO -->
          {#if isTyping && searchQuery !== ''}
            <button 
              type="button" 
              class="btn-icon-clear" 
              onclick={handleClearSearch}
              title="Limpar pesquisa"
              aria-label="Limpar pesquisa"
            >
              <X size={16} />
            </button>
          {:else}
            <!-- CASO CONTRÁRIO, EXIBE SEMPRE A SETA PARA BAIXO (IGUAL AO PRINT) -->
            <div class="search-arrow-wrap" onclick={toggleDropdown} role="button" tabindex="0">
              <ChevronDown size={15} />
            </div>
          {/if}

          <!-- Dropdown Arredondado com Realce Amarelo -->
          {#if isDropdownOpen}
            <div class="search-dropdown-menu">
              <div 
                class="dropdown-item option-acordes" 
                class:selected={selectedSongId === ''}
                onclick={handleSelectAcordes}
                role="button"
                tabindex="0"
                onkeydown={(e) => e.key === 'Enter' && handleSelectAcordes()}
              >
                <em>Acordes</em>
              </div>

              {#if filteredSongs.length === 0}
                <div class="dropdown-item empty-result">
                  Nenhuma música encontrada
                </div>
              {:else}
                {#each filteredSongs as s}
                  <div 
                    class="dropdown-item song-option" 
                    class:selected={selectedSongId === s.id}
                    onclick={() => handleSelectSong(s.id)}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => e.key === 'Enter' && handleSelectSong(s.id)}
                  >
                    {@html formatHighlight(s.title, searchQuery)}
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>

        <!-- Botões de Ação na extremidade direita -->
        {#if !showActions}
          <button 
            type="button" 
            class="btn-teal btn-action-toggle" 
            onclick={(e) => {
              e.stopPropagation();
              isDropdownOpen = false;
              showActions = true;
            }}
            title="Ações"
            aria-label="Expandir ações"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        {:else}
          <button 
            type="button" 
            class="btn-action btn-add" 
            onclick={() => { showActions = false; onAddSong?.(); }} 
            title="Adicionar Música"
          >
            <FilePlus size={17} />
          </button>
          <button 
            type="button" 
            class="btn-action btn-edit" 
            onclick={() => { 
              showActions = false; 
              if (selectedSongId) isConfirmEditOpen = true;
              else alert('Selecione uma música para editar.');
            }} 
            title="Editar Música"
          >
            <Edit size={17} />
          </button>
          <button 
            type="button" 
            class="btn-action btn-delete" 
            onclick={() => { 
              showActions = false; 
              if (selectedSongId) isConfirmDeleteOpen = true;
              else alert('Selecione uma música para excluir.');
            }} 
            title="Excluir Música"
          >
            <Trash2 size={17} />
          </button>
        {/if}
      </div>
    {/if}
  </div>
</header>

<ConfirmModal 
  isOpen={isConfirmEditOpen}
  title="Editar Música"
  message={`Deseja entrar no modo de edição para a música "${selectedSong?.title}"?`}
  confirmText="Editar"
  type="primary"
  onConfirm={() => { isConfirmEditOpen = false; onEditSong?.(); }}
  onCancel={() => (isConfirmEditOpen = false)}
/>

<ConfirmModal 
  isOpen={isConfirmDeleteOpen}
  title="Excluir Música"
  message={`Tem certeza que deseja excluir "${selectedSong?.title}"? Esta ação não pode ser desfeita.`}
  confirmText="Excluir"
  type="danger"
  onConfirm={() => { isConfirmDeleteOpen = false; onDeleteSong?.(); }}
  onCancel={() => (isConfirmDeleteOpen = false)}
/>

<style>
  .header-toolbar {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    width: 100%;
  }

  .left-cluster {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }

  .right-cluster {
    flex: 1 1 270px;
    min-width: 250px;
    display: flex;
    position: relative;
  }

  @media (max-width: 680px) {
    .left-cluster { width: 100%; }
    .right-cluster { width: 100%; flex: 1 1 100%; margin-top: 4px; }
  }

  .btn-menu {
    background: transparent;
    border: none;
    color: var(--app-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    height: 38px;
  }

  .input-group {
    display: flex;
    height: 38px;
    border-radius: 6px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .group-key,
  .group-bpm {
    overflow: hidden;
  }

  .song-group {
    width: 100%;
    position: relative;
    border-radius: 6px;
  }

  .song-group:focus-within {
    border-color: #86b7fe;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  }

  .is-editing-group {
    overflow: hidden;
  }

  .song-search-wrapper,
  .song-search-input,
  .song-input {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  .btn-action-toggle,
  .btn-delete,
  .btn-cancel {
    border-top-right-radius: 5px !important;
    border-bottom-right-radius: 5px !important;
  }

  .btn-teal {
    background-color: var(--app-teal);
    color: #ffffff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease;
    user-select: none;
  }

  .btn-teal:hover { background-color: var(--app-teal-hover); }
  .btn-step, .btn-action-toggle { width: 46px; }
  .btn-bpm-step { width: 38px; font-size: 13px; font-weight: bold; }
  .btn-bpm-single { width: 34px; }
  .border-left { border-left: 1px solid rgba(255, 255, 255, 0.3); }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--app-surface);
  }

  :global(.select-arrow) {
    position: absolute;
    right: 8px;
    color: #495057;
    pointer-events: none;
  }

  .group-select {
    width: 72px;
    height: 100%;
    background: transparent;
    color: var(--app-text);
    border: none;
    font-weight: bold;
    font-size: 14px;
    padding-left: 10px;
    padding-right: 22px;
    cursor: pointer;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
  }

  .bpm-input {
    width: 48px;
    height: 100%;
    background: var(--app-surface);
    color: var(--app-text);
    border: none;
    text-align: center;
    font-weight: bold;
    font-size: 15px;
    outline: none;
    padding: 0;
    -moz-appearance: textfield;
  }

  .bpm-input::-webkit-outer-spin-button,
  .bpm-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* --- CAMPO DE BUSCA DE MÚSICA --- */
  .song-search-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    background: var(--app-surface);
  }

  .song-search-input {
    width: 100%;
    height: 100%;
    background: transparent;
    color: var(--app-text);
    border: none;
    font-size: 14px;
    padding: 0 32px 0 12px;
    outline: none;
  }

  .search-arrow-wrap {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #6c757d;
  }

  .btn-icon-clear {
    position: absolute;
    right: 6px;
    background: none;
    border: none;
    color: #0d6efd;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
  }

  .btn-icon-clear:hover { background: rgba(13, 110, 253, 0.1); }

  /* --- MENU SUSPENSO --- */
  .search-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--app-surface, #ffffff);
    border: 1px solid var(--app-border, #ced4da);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
    max-height: 240px;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
  }

  [data-theme="dark"] .search-dropdown-menu {
    background: #242424;
    border-color: #444;
  }

  .dropdown-item {
    padding: 9px 14px;
    font-size: 14px;
    cursor: pointer;
    color: var(--app-text);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    user-select: none;
    transition: background-color 0.12s;
  }

  .dropdown-item:first-child {
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
  }

  .dropdown-item:last-child {
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
    border-bottom: none;
  }

  .dropdown-item:hover {
    background: rgba(11, 142, 142, 0.12);
  }

  .dropdown-item.selected {
    background: #e9ecef;
    font-weight: bold;
  }

  [data-theme="dark"] .dropdown-item.selected {
    background: #383838;
  }

  .option-acordes {
    color: #6c757d;
    border-bottom: 2px solid var(--app-border);
  }

  .empty-result {
    color: #888;
    font-style: italic;
    cursor: default;
  }

  :global(.highlight-match) {
    background-color: #ffeb3b !important;
    color: #000000 !important;
    padding: 0 1px;
    border-radius: 2px;
    font-weight: bold;
  }

  [data-theme="dark"] :global(.highlight-match) {
    background-color: #d4a017 !important;
    color: #ffffff !important;
  }

  .song-input {
    width: 100%;
    height: 100%;
    background: transparent;
    color: var(--app-text);
    border: none;
    font-size: 14px;
    padding: 0 12px;
    outline: none;
  }

  .btn-action {
    border: none;
    color: #ffffff;
    width: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-action:hover { filter: brightness(0.9); }
  .btn-add { background-color: #198754; }
  .btn-edit { background-color: #0dcaf0; }
  .btn-delete { background-color: #dc3545; }
  .btn-save { background-color: #0d6efd; width: 44px; }
  .btn-cancel { background-color: #6c757d; width: 44px; }
</style>