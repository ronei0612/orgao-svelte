<script>
  /**
   * src/components/ExportModal.svelte
   * Modal para seleção e download do repertório em arquivo .json
   */
  import { X, Download, CheckSquare, Square } from 'lucide-svelte';

  let { isOpen = false, songs = [], onClose } = $props();

  let selectedIds = $state(new Set());

  // Seleciona todas as músicas ao abrir o modal
  $effect(() => {
    if (isOpen) {
      selectedIds = new Set(songs.map((s) => s.id));
    }
  });

  const isAllSelected = $derived(songs.length > 0 && selectedIds.size === songs.length);

  function toggleSelectAll() {
    if (isAllSelected) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(songs.map((s) => s.id));
    }
  }

  function toggleSong(id) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
    selectedIds = new Set(selectedIds);
  }

  function handleDownload() {
    const songsToExport = songs.filter((s) => selectedIds.has(s.id));
    if (songsToExport.length === 0) {
      alert('Selecione pelo menos uma música para exportar.');
      return;
    }

    const dataStr = JSON.stringify(songsToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const a = document.createElement('a');
    a.href = url;
    a.download = `repertorio_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onClose?.();
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" onclick={onClose} role="presentation"></div>

  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
    <div class="modal-header">
      <div class="title-wrap">
        <Download size={20} class="var(--app-teal)" />
        <h4 id="export-title">Exportar Repertório</h4>
      </div>
      <button class="btn-close" onclick={onClose} aria-label="Fechar"><X size={20} /></button>
    </div>

    <div class="modal-body">
      {#if songs.length === 0}
        <p class="empty-text">Nenhuma música disponível para exportação.</p>
      {:else}
        <div class="select-all-row" onclick={toggleSelectAll} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleSelectAll()}>
          {#if isAllSelected}
            <CheckSquare size={18} class="var(--app-teal)" />
          {:else}
            <Square size={18} class="var(--app-text)" />
          {/if}
          <span>Selecionar Todas ({selectedIds.size}/{songs.length})</span>
        </div>

        <div class="songs-list">
          {#each songs as song}
            <label class="song-item">
              <input 
                type="checkbox" 
                checked={selectedIds.has(song.id)}
                onchange={() => toggleSong(song.id)}
              />
              <span class="song-title">{song.title}</span>
              <span class="badge-tag">{song.key || 'C'}</span>
            </label>
          {/each}
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button type="button" class="btn-secondary" onclick={onClose}>Cancelar</button>
      <button 
        type="button" 
        class="btn-teal" 
        disabled={selectedIds.size === 0}
        onclick={handleDownload}
      >
        <Download size={16} /> Baixar ({selectedIds.size})
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);
    z-index: 200;
    animation: fadeIn 0.15s ease-out;
  }

  .modal-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 480px;
    background: var(--app-surface);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    z-index: 201;
    display: flex;
    flex-direction: column;
    max-height: 85vh;
    animation: scaleIn 0.2s ease-out;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { transform: translate(-50%, -46%) scale(0.96); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--app-border);
  }

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-wrap h4 {
    margin: 0;
    font-size: 17px;
    font-weight: bold;
  }

  .btn-close {
    background: none;
    border: none;
    color: var(--app-text);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .btn-close:hover { background: rgba(0, 0, 0, 0.08); }

  .modal-body {
    padding: 14px 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .select-all-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--app-bg-body);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    user-select: none;
  }

  .songs-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 320px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .song-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid var(--app-border);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.12s;
  }

  .song-item:hover { background: var(--app-bg-body); }

  .song-title {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge-tag {
    font-size: 12px;
    font-weight: bold;
    color: var(--app-teal);
    background: rgba(11, 142, 142, 0.12);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .empty-text {
    text-align: center;
    color: #888;
    margin: 20px 0;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--app-border);
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
  }

  .btn-teal {
    background: var(--app-teal);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    transition: opacity 0.15s;
  }

  .btn-teal:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>