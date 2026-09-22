<script>
  import { X, Moon, Sun, BookOpen, Church, Heart, Download, Upload, Terminal, Info, Trash2 } from 'lucide-svelte';

  let { 
    isOpen = false, 
    onClose, 
    isDarkMode = false, 
    onToggleTheme,
    onOpenExport,
    onOpenImport,
    onRestoreApp
  } = $props();
</script>

{#if isOpen}
  <!-- Backdrop escuro de fundo -->
  <div class="backdrop" onclick={onClose} role="presentation"></div>

  <!-- Gaveta Lateral -->
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
      <a href="#liturgia" class="link primary" onclick={onClose}><BookOpen size={18} /> Liturgia Diária</a>
      <a href="#missa" class="link primary" onclick={onClose}><Church size={18} /> Ordinário Santa Missa</a>
      <a href="#oracoes" class="link primary" onclick={onClose}><Heart size={18} /> Orações</a>

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

      <button type="button" class="link-btn text-muted"><Terminal size={18} /> Logs do Sistema</button>
      <button type="button" class="link-btn text-muted"><Info size={18} /> Sobre este site</button>

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
    padding: 4px 0;
    cursor: pointer;
    text-align: left;
    width: 100%;
  }

  .link.primary { color: var(--app-teal); font-weight: bold; }
  .text-muted { color: #888; }
  .text-danger { color: #dc3545; }
</style>