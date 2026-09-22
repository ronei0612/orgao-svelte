<script>
  /**
   * src/components/AboutModal.svelte
   * Modal com informações do aplicativo e créditos
   */
  import { X, Info } from 'lucide-svelte';

  let { isOpen = false, onClose } = $props();
</script>

{#if isOpen}
  <div class="modal-backdrop" onclick={onClose} role="presentation"></div>

  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title">
    <div class="modal-header">
      <div class="title-wrap">
        <Info size={20} class="text-teal" />
        <h4 id="about-title">Sobre o Projeto</h4>
      </div>
      <button class="btn-close" onclick={onClose} aria-label="Fechar"><X size={20} /></button>
    </div>

    <div class="modal-body text-center">
      <div class="app-icon-badge">🎹</div>
      <h3 class="app-name">Órgão Virtual Svelte</h3>
      <p class="app-version">Versão 2.0 • Svelte 5 Pure Runes</p>

      <div class="info-card">
        <p>Desenvolvido para músicos de igreja, organistas e tecladistas.</p>
        <small class="credits">Projeto Original criado por: <strong>Ronei Costa Soares</strong></small>
      </div>

      <a 
        href="https://github.com/ronei0612/orgao.web" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="github-btn"
      >
        <!-- SVG oficial do GitHub (dispensa bibliotecas externas) -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        Ver Código Fonte no GitHub
      </a>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn-teal" onclick={onClose}>Fechar</button>
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
  }

  .modal-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 440px;
    background: var(--app-surface);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    z-index: 201;
    display: flex;
    flex-direction: column;
  }

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

  .title-wrap h4 { margin: 0; font-size: 17px; font-weight: bold; }
  .text-teal { color: var(--app-teal); }

  .btn-close {
    background: none;
    border: none;
    color: var(--app-text);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-body {
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  .app-icon-badge {
    font-size: 40px;
    line-height: 1;
    margin-bottom: 4px;
  }

  .app-name {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
  }

  .app-version {
    color: #888;
    font-size: 13px;
    margin-bottom: 10px;
  }

  .info-card {
    background: var(--app-bg-body);
    border-radius: 8px;
    padding: 12px;
    width: 100%;
    font-size: 14px;
  }

  .info-card p { margin: 0 0 6px 0; }
  .credits { color: #888; display: block; }

  .github-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: #212529;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    margin-top: 6px;
    transition: filter 0.15s ease;
  }

  .github-btn:hover { filter: brightness(1.2); }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 12px 16px;
    border-top: 1px solid var(--app-border);
  }

  .btn-teal {
    background: var(--app-teal);
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }
</style>