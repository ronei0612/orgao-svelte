<script>
  import { X, Moon, Sun, BookOpen, Church, Download, Upload, Info, Trash2 } from 'lucide-svelte';

  let { 
    isOpen = false, 
    onClose, 
    isDarkMode = false, 
    onToggleTheme,
    onOpenExport,
    onOpenImport,
    onRestoreApp,
    onSelectView,
    onOpenAbout
  } = $props();
</script>

{#if isOpen}
  <div class="backdrop" onclick={onClose} role="presentation"></div>

  <aside class="drawer">
    <div class="drawer-header">
      <h3>Menu</h3>
      <button class="close-btn" onclick={onClose} aria-label="Fechar menu"><X size={20} /></button>
    </div>

    <div class="theme-toggle-row">
      <button class="circle-btn" onclick={onToggleTheme} title="Alternar Tema" aria-label="Alternar Tema">
        {#if isDarkMode}
          <Sun size={20} color="#ffc107" />
        {:else}
          <Moon size={20} />
        {/if}
      </button>
    </div>

    <hr class="divider" />

    <nav class="drawer-links">
      <button type="button" class="link primary" onclick={() => { onClose(); onSelectView?.('liturgia'); }}>
        <BookOpen size={18} /> Liturgia Diária
      </button>

      <button type="button" class="link primary" onclick={() => { onClose(); onSelectView?.('missa'); }}>
        <Church size={18} /> Ordinário Santa Missa
      </button>

      <!-- Ícone Mãos Postas (Orações Católicas) -->
      <button type="button" class="link primary" onclick={() => { onClose(); onSelectView?.('oracoes'); }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v11" />
          <path d="M6 21c1-4 3-7 5.5-17a1 1 0 0 1 1 0c2.5 10 4.5 13 5.5 17" />
          <path d="M7.5 15c1.2 1.5 2.5 2 4.5 2s3.3-.5 4.5-2" />
          <path d="M5 21h4" />
          <path d="M15 21h4" />
        </svg>
        Orações Católicas
      </button>

      <hr class="divider" />

      <button 
        type="button" 
        class="link-btn" 
        onclick={() => { onClose(); onOpenExport?.(); }}
      >
        <Download size={18} /> Exportar Repertório
      </button>

      <button 
        type="button" 
        class="link-btn" 
        onclick={() => { onClose(); onOpenImport?.(); }}
      >
        <Upload size={18} /> Importar Repertório
      </button>

      <button 
        type="button" 
        class="link-btn text-muted" 
        onclick={() => { onClose(); onOpenAbout?.(); }}
      >
        <Info size={18} /> Sobre este site
      </button>

      <hr class="divider" />

      <button 
        type="button" 
        class="link-btn text-danger" 
        onclick={() => { onClose(); onRestoreApp?.(); }}
      >
        <Trash2 size={18} /> Restaurar Aplicativo
      </button>
    </nav>
  </aside>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: var(--app-surface);
    color: var(--app-text);
    z-index: 101;
    display: flex;
    flex-direction: column;
    padding: 16px;
    box-shadow: 2px 0 16px var(--app-shadow);
    animation: slideIn 0.25s ease-out;
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .drawer-header h3 { margin: 0; font-size: 18px; }

  .close-btn {
    background: none;
    border: none;
    color: var(--app-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle-row {
    display: flex;
    justify-content: center;
    margin: 15px 0 5px;
  }

  .circle-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--app-border);
    background: var(--app-bg-body);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--app-border);
    margin: 12px 0;
  }

  .drawer-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .link, .link-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--app-text);
    font-size: 15px;
    font-weight: 500;
    background: none;
    border: none;
    padding: 6px 0;
    cursor: pointer;
    text-align: left;
    width: 100%;
  }

  .link.primary { color: var(--app-teal); font-weight: bold; }
  .text-muted { color: #888; }
  .text-danger { color: #dc3545; }
</style>