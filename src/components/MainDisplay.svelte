<script>
  let { content = '', isLyricsOnly = false } = $props();
</script>

<div class="display-container" class:lyrics-only={isLyricsOnly}>
  {#if content}
    <div class="content-view">{@html content}</div>
  {:else}
    <div class="empty-state">
      <p>Nenhuma música selecionada</p>
      <small>Selecione no campo acima ou toque em + para adicionar.</small>
    </div>
  {/if}
</div>

<style>
  .display-container {
    flex: 1;
    background-color: var(--app-bg-display);
    border: 1px solid var(--app-border-display);
    border-radius: 6px;
    padding: 15px;
    overflow-y: auto;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 15px;
    white-space: pre-wrap;
    min-height: 120px;
    position: relative;
  }

  .display-container.lyrics-only {
    font-family: 'Roboto', sans-serif;
    font-size: 17px;
  }

  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #888;
    text-align: center;
  }

  .empty-state p {
    margin: 0;
    font-weight: bold;
    font-size: 16px;
  }
</style>