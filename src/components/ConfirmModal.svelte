<script>
  import { AlertTriangle, HelpCircle, X } from 'lucide-svelte';

  let { 
    isOpen = false, 
    title = 'Confirmação', 
    message = '', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar',
    type = 'primary', // 'primary' | 'danger'
    onConfirm, 
    onCancel 
  } = $props();

  function handleKeydown(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') onCancel?.();
    if (e.key === 'Enter') onConfirm?.();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class="modal-backdrop" onclick={onCancel} role="presentation"></div>

  <div class="modal-dialog" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="title-wrap">
        {#if type === 'danger'}
          <AlertTriangle size={20} class="text-danger" />
        {:else}
          <HelpCircle size={20} class="text-primary" />
        {/if}
        <h4>{title}</h4>
      </div>
      <button type="button" class="btn-close" onclick={onCancel} aria-label="Fechar">
        <X size={18} />
      </button>
    </div>

    <div class="modal-body">
      <p>{message}</p>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn-secondary" onclick={onCancel}>
        {cancelText}
      </button>
      <button 
        type="button" 
        class="btn-action"
        class:btn-danger={type === 'danger'}
        class:btn-teal={type === 'primary'}
        onclick={onConfirm}
      >
        {confirmText}
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
    z-index: 250;
  }

  .modal-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 420px;
    background: var(--app-surface);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    z-index: 251;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--app-border);
  }

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-wrap h4 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }

  .text-danger { color: #dc3545; }
  .text-primary { color: var(--app-teal); }

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
    padding: 18px 16px;
    font-size: 14px;
    line-height: 1.5;
  }

  .modal-body p { margin: 0; }

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
    font-size: 13px;
  }

  .btn-action {
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
  }

  .btn-teal { background: var(--app-teal); }
  .btn-danger { background: #dc3545; }
</style>