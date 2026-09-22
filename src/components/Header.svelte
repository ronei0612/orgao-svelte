<script>
  import { Menu, Minus, Plus, FilePlus, Edit, Trash2, Save, X, ChevronDown } from 'lucide-svelte';

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

  const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'L'];
  let showActions = $state(false);

  $effect(() => {
    if (!showActions) return;

    function handleWindowClick() {
      showActions = false;
    }

    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  });
</script>

<header class="header-toolbar">
  <div class="left-cluster">
    <button type="button" class="btn-menu" onclick={onOpenMenu} title="Menu Principal" aria-label="Menu">
      <Menu size={22} />
    </button>

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
          {#each keys as k}
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

    <div class="input-group group-bpm">
      <button 
        type="button" 
        class="btn-teal btn-bpm-step" 
        onclick={() => onBpmChange(-5)} 
        aria-label="-5 BPM"
      >
        -5
      </button>
      <button 
        type="button" 
        class="btn-teal btn-bpm-single border-left" 
        onclick={() => onBpmChange(-1)} 
        aria-label="-1 BPM"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <input 
        type="number" 
        class="bpm-input" 
        value={bpm} 
        oninput={(e) => { if (onBpmSet) onBpmSet(Number(e.target.value)); }}
        min="30" 
        max="300" 
        aria-label="BPM"
      />
      <button 
        type="button" 
        class="btn-teal btn-bpm-step border-left" 
        onclick={() => onBpmChange(5)} 
        aria-label="+5 BPM"
      >
        +5
      </button>
    </div>
  </div>

  <div 
    class="right-cluster" 
    onclick={(e) => e.stopPropagation()} 
    role="presentation"
  >
    {#if isEditing}
      <div class="input-group song-group">
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
      <div class="input-group song-group">
        <div class="select-wrapper flex-grow">
          <select 
            class="song-select" 
            value={selectedSongId}
            onchange={(e) => { if (onSongChange) onSongChange(e.target.value); }}
            aria-label="Escolha a Música"
          >
            <option value="">Escolha a Música...</option>
            {#each songs as song}
              <option value={song.id}>{song.title}</option>
            {/each}
          </select>
          <ChevronDown size={15} class="select-arrow" />
        </div>

        {#if !showActions}
          <button 
            type="button" 
            class="btn-teal btn-action-toggle" 
            onclick={(e) => {
              e.stopPropagation();
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
            onclick={(e) => { 
              e.stopPropagation(); 
              showActions = false; 
              if (onAddSong) onAddSong(); 
            }} 
            title="Adicionar Música"
          >
            <FilePlus size={17} />
          </button>
          <button 
            type="button" 
            class="btn-action btn-edit" 
            onclick={(e) => { 
              e.stopPropagation(); 
              showActions = false; 
              if (onEditSong) onEditSong(); 
            }} 
            title="Editar Música"
          >
            <Edit size={17} />
          </button>
          <button 
            type="button" 
            class="btn-action btn-delete" 
            onclick={(e) => { 
              e.stopPropagation(); 
              showActions = false; 
              if (onDeleteSong) onDeleteSong(); 
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
  }

  @media (max-width: 680px) {
    .left-cluster {
      width: 100%;
      justify-content: flex-start;
    }
    .right-cluster {
      width: 100%;
      flex: 1 1 100%;
      margin-top: 4px;
    }
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
    overflow: hidden;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
  }

  .song-group {
    width: 100%;
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

  .btn-teal:hover {
    background-color: var(--app-teal-hover);
  }

  .btn-step, .btn-action-toggle {
    width: 46px;
  }

  .btn-bpm-step {
    width: 38px;
    font-size: 13px;
    font-weight: bold;
  }

  .btn-bpm-single {
    width: 34px;
  }

  .border-left {
    border-left: 1px solid rgba(255, 255, 255, 0.3);
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--app-surface);
  }

  .flex-grow {
    flex: 1;
    min-width: 0;
  }

  :global(.select-arrow) {
    position: absolute;
    right: 8px;
    color: #495057;
    pointer-events: none;
  }

  .group-select {
    width: 62px;
    height: 100%;
    background: transparent;
    color: var(--app-text);
    border: none;
    font-weight: bold;
    font-size: 15px;
    padding-left: 12px;
    padding-right: 20px;
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

  .song-select, .song-input {
    width: 100%;
    height: 100%;
    background: transparent;
    color: var(--app-text);
    border: none;
    font-size: 14px;
    padding: 0 28px 0 12px;
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }

  .song-input {
    cursor: text;
    padding: 0 12px;
  }

  .btn-action {
    border: none;
    color: #ffffff;
    width: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: filter 0.15s ease;
  }

  .btn-action:hover { filter: brightness(0.9); }
  .btn-add { background-color: #198754; }
  .btn-edit { background-color: #0dcaf0; }
  .btn-delete { background-color: #dc3545; }
  .btn-save { background-color: #0d6efd; width: 44px; }
  .btn-cancel { background-color: #6c757d; width: 44px; }
</style>