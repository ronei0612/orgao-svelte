<script>
  let { 
    rhythms = ['Sem ritmo'], 
    selectedRhythm = 'Sem ritmo', 
    currentInstrument = 'orgao', 
    onRhythmSelect, 
    onInstrumentClick 
  } = $props();
</script>

<div class="rhythm-bar">
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

  <button class="instrument-btn" onclick={onInstrumentClick} title="Alternar Instrumento">
    {currentInstrument === 'piano' ? '🎹 PIANO' : '🎶 ÓRGÃO'}
  </button>
</div>

<style>
  .rhythm-bar {
    display: flex;
    gap: 6px;
  }

  .rhythm-select {
    flex: 1;
    background: var(--app-surface);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .instrument-btn {
    background: #6c757d;
    color: white;
    font-weight: bold;
    border: none;
    padding: 8px 18px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .instrument-btn:hover {
    background: #5c636a;
  }
</style>