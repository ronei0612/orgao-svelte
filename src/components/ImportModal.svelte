<script>
  /**
   * src/components/ImportModal.svelte
   * Modal para carregar arquivo .json com análise prévia de músicas novas vs substituições
   */
  import { X, Upload, CheckSquare, Square, FileUp } from 'lucide-svelte';
  import { DatabaseManager } from '../utils/databaseManager.js';

  let { isOpen = false, currentSongs = [], onImportComplete, onClose } = $props();

  let fileInput = $state(null);
  let analyzedSongs = $state([]);
  let selectedIndices = $state(new Set());
  let fileName = $state('');
  let errorMessage = $state('');

  // Limpa o estado quando o modal fecha
  $effect(() => {
    if (!isOpen) {
      analyzedSongs = [];
      selectedIndices = new Set();
      fileName = '';
      errorMessage = '';
      if (fileInput) fileInput.value = '';
    }
  });

  const isAllSelected = $derived(analyzedSongs.length > 0 && selectedIndices.size === analyzedSongs.length);

  function toggleSelectAll() {
    if (isAllSelected) {
      selectedIndices = new Set();
    } else {
      selectedIndices = new Set(analyzedSongs.map((_, i) => i));
    }
  }

  function toggleItem(index) {
    if (selectedIndices.has(index)) {
      selectedIndices.delete(index);
    } else {
      selectedIndices.add(index);
    }
    selectedIndices = new Set(selectedIndices);
  }

  function handleFileChange(e) {
    errorMessage = '';
    const file = e.target.files?.[0];
    if (!file) return;

    fileName = file.name;
    const reader = new FileReader();

    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error('O arquivo não contém uma lista válida de músicas.');
        }

        analyzedSongs = DatabaseManager.analyzeImport(parsed, currentSongs);
        selectedIndices = new Set(analyzedSongs.map((_, i) => i));

        if (analyzedSongs.length === 0) {
          errorMessage = 'Nenhuma música encontrada no arquivo.';
        }
      } catch (err) {
        errorMessage = 'Arquivo JSON inválido ou corrompido: ' + err.message;
        analyzedSongs = [];
        selectedIndices = new Set();
      }
    };

    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (selectedIndices.size === 0) return;

    const count = selectedIndices.size;
    const updatedSongs = DatabaseManager.applyImport(analyzedSongs, Array.from(selectedIndices), currentSongs);

    alert(`${count} música(s) importada(s) com sucesso!`);
    onImportComplete?.(updatedSongs);
    onClose?.();
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" onclick={onClose} role="presentation"></div>

  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title">
    <div class="modal-header">
      <div class="title-wrap">
        <Upload size={20} class="var(--app-teal)" />
        <h4 id="import-title">Importar Repertório</h4>
      </div>
      <button class="btn-close" onclick={onClose} aria-label="Fechar"><X size={20} /></button>
    </div>

    <div class="modal-body">
      <!-- Input de Arquivo Customizado -->
      <label class="file-upload-box">
        <input 
          bind:this={fileInput}
          type="file" 
          accept=".json" 
          onchange={handleFileChange} 
          class="visually-hidden" 
        />
        <FileUp size={28} class="var(--app-teal)" />
        <div class="upload-labels">
          <strong>{fileName ? fileName : 'Clique para escolher o arquivo JSON'}</strong>
          <small>Formato .json exportado pelo Órgão Web</small>
        </div>
      </label>

      {#if errorMessage}
        <div class="alert-error">{errorMessage}</div>
      {/if}

      <!-- Lista de Músicas Detectadas -->
      {#if analyzedSongs.length > 0}
        <div class="select-all-row" onclick={toggleSelectAll} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleSelectAll()}>
          {#if isAllSelected}
            <CheckSquare size={18} class="var(--app-teal)" />
          {:else}
            <Square size={18} class="var(--app-text)" />
          {/if}
          <span>Selecionar Todas ({selectedIndices.size}/{analyzedSongs.length})</span>
        </div>

        <div class="songs-list">
          {#each analyzedSongs as song, idx}
            <label class="song-item">
              <input 
                type="checkbox" 
                checked={selectedIndices.has(idx)}
                onchange={() => toggleItem(idx)}
              />
              <span class="song-title">{song.title}</span>
              
              {#if song.isUpdate}
                <span class="badge-update" title="Substituirá a versão atual">Substituir</span>
              {:else}
                <span class="badge-new" title="Nova música no repertório">Nova</span>
              {/if}
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
        disabled={selectedIndices.size === 0}
        onclick={handleConfirmImport}
      >
        <Upload size={16} /> Importar ({selectedIndices.size})
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
    max-width: 500px;
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
    gap: 12px;
  }

  .file-upload-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border: 2px dashed var(--app-border);
    border-radius: 8px;
    background: var(--app-bg-body);
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .file-upload-box:hover {
    border-color: var(--app-teal);
    background: rgba(11, 142, 142, 0.06);
  }

  .upload-labels {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .upload-labels strong {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .upload-labels small { font-size: 12px; color: #888; }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .alert-error {
    padding: 8px 12px;
    background: #f8d7da;
    color: #842029;
    border-radius: 6px;
    font-size: 13px;
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
    max-height: 260px;
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

  .badge-update {
    font-size: 11px;
    font-weight: bold;
    color: #856404;
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .badge-new {
    font-size: 11px;
    font-weight: bold;
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 2px 8px;
    border-radius: 4px;
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