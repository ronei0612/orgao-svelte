<script>
  let { 
    rhythms = ['Sem ritmo'], 
    selectedRhythm = 'Sem ritmo', 
    currentInstrument = 'orgao', 
    onRhythmSelect, 
    onInstrumentClick 
  } = $props();
</script>

<div class="rhythm-group">
  <select 
    class="rhythm-select" 
    value={selectedRhythm} 
    onchange={(e) => onRhythmSelect(e.target.value)}
    aria-label="Seleção de Ritmo"
  >
    {#each rhythms as r}
      <option value={r}>{r}</option>
    {/each}
  </select>

  <!-- Botão Órgão / Piano colado no select sem vão (Imagem 3) -->
  <button 
    type="button"
    class="instrument-btn" 
    onclick={onInstrumentClick} 
    title="Alternar Instrumento"
  >
    {currentInstrument === 'piano' ? 'PIANO' : 'ÓRGÃO'}
  </button>
</div>

<style>
  /* GRUPO UNIFICADO IDÊNTICO À IMAGEM 3 */
  .rhythm-group {
    display: flex;
    width: 100%;
    height: 38px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
  }

  .rhythm-select {
    flex: 1;
    background: var(--app-surface);
    color: var(--app-text);
    border: none;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
  }

  .instrument-btn {
    background: #6c757d;
    color: #ffffff;
    font-weight: bold;
    font-size: 13px;
    letter-spacing: 0.5px;
    border: none;
    padding: 0 24px;
    cursor: pointer;
    transition: background 0.15s ease;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .instrument-btn:hover {
    background: #5c636a;
  }
</style>