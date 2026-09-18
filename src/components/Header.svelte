<script>
  import { Menu, Minus, Plus, Search, FilePlus, Edit, Trash2, Save, X } from 'lucide-svelte';

  let { 
    onOpenMenu, 
    selectedKey = 'C', 
    bpm = 90, 
    isEditing = false,
    onKeyChange, 
    onBpmChange 
  } = $props();

  const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'L'];
  let showActions = $state(false);
</script>

<header class="header-row">
  <!-- Grupo Esquerdo: Menu, Tom e BPM -->
  <div class="left-controls">
    <button class="icon-btn" onclick={onOpenMenu} title="Menu Principal" aria-label="Menu">
      <Menu size={22} />
    </button>

    <!-- Seletor de Tom -->
    <div class="btn-group">
      <button class="teal-btn px-2" onclick={() => onKeyChange(-1)} aria-label="Tom anterior">
        <Minus size={14} />
      </button>
      <select 
        class="key-select" 
        value={selectedKey} 
        onchange={(e) => onKeyChange(e.target.value)}
        aria-label="Selecionar tom"
      >
        {#each keys as key}
          <option value={key}>{key === 'L' ? 'Letra' : key}</option>
        {/each}
      </select>
      <button class="teal-btn px-2" onclick={() => onKeyChange(1)} aria-label="Próximo tom">
        <Plus size={14} />
      </button>
    </div>

    <!-- Seletor de BPM -->
    <div class="btn-group bpm-group">
      <button class="teal-btn px-1 text-xs" onclick={() => onBpmChange(-5)}>-5</button>
      <button class="teal-btn px-1" onclick={() => onBpmChange(-1)}><Minus size={12} /></button>
      <input 
        type="number" 
        class="bpm-input" 
        value={bpm} 
        onchange={(e) => onBpmChange(Number(e.target.value))}
        min="1" 
        max="999" 
      />
      <button class="teal-btn px-1 text-xs" onclick={() => onBpmChange(5)}>+5</button>
    </div>
  </div>

  <!-- Grupo Direito: Seleção da Música e Ações -->
  <div class="right-controls">
    {#if isEditing}
      <input type="text" class="song-input" placeholder="Título da música..." />
      <button class="action-btn btn-save" title="Salvar"><Save size={18} /></button>
      <button class="action-btn btn-cancel" title="Cancelar"><X size={18} /></button>
    {:else}
      <div class="song-select-wrapper">
        <Search size={16} class="search-icon" />
        <input type="search" class="song-search" placeholder="Escolha a Música..." />
      </div>

      <button class="teal-btn action-toggle" onclick={() => (showActions = !showActions)}>
        <Plus size={18} />
      </button>

      {#if showActions}
        <div class="actions-popup">
          <button class="action-btn btn-add" title="Adicionar"><FilePlus size={18} /></button>
          <button class="action-btn btn-edit" title="Editar"><Edit size={18} /></button>
          <button class="action-btn btn-delete" title="Excluir"><Trash2 size={18} /></button>
        </div>
      {/if}
    {/if}
  </div>
</header>

<style>
  .header-row {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .left-controls, .right-controls {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .right-controls {
    flex: 1;
    min-width: 250px;
    position: relative;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--app-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 6px;
    border-radius: 6px;
  }

  .btn-group {
    display: flex;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--app-border);
  }

  .teal-btn {
    background-color: var(--app-teal);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .teal-btn:hover {
    background-color: var(--app-teal-hover);
  }

  .px-1 { padding: 6px 8px; }
  .px-2 { padding: 6px 12px; }
  .text-xs { font-size: 11px; font-weight: bold; }

  .key-select {
    background: var(--app-surface);
    color: var(--app-text);
    border: none;
    font-weight: bold;
    text-align: center;
    padding: 6px 8px;
    cursor: pointer;
  }

  .bpm-input {
    width: 48px;
    background: var(--app-surface);
    color: var(--app-text);
    border: none;
    text-align: center;
    font-weight: bold;
    padding: 4px;
  }

  .song-select-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .song-search, .song-input {
    width: 100%;
    padding: 8px 12px 8px 32px;
    background: var(--app-surface);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    border-radius: 6px;
    font-size: 14px;
  }

  .song-input {
    padding-left: 12px;
  }

  :global(.search-icon) {
    position: absolute;
    left: 10px;
    color: #888;
    pointer-events: none;
  }

  .action-toggle {
    padding: 8px 12px;
    border-radius: 6px;
  }

  .actions-popup {
    display: flex;
    gap: 4px;
    position: absolute;
    right: 44px;
    background: var(--app-surface);
    padding: 4px;
    border-radius: 6px;
    box-shadow: 0 4px 12px var(--app-shadow);
    border: 1px solid var(--app-border);
    z-index: 10;
  }

  .action-btn {
    border: none;
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .btn-add { background: #198754; }
  .btn-edit { background: #0dcaf0; }
  .btn-delete { background: #dc3545; }
  .btn-save { background: #0d6efd; }
  .btn-cancel { background: #6c757d; }
</style>