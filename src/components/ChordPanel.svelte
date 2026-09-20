<script>
  let { selectedKey = 'C', activeChord = null, onChordClick } = $props();

  const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Função pura que calcula o campo harmônico exato do tom selecionado
  function calculateChords(rootKey) {
    if (rootKey === 'L') rootKey = 'C';
    let baseIdx = NOTES.indexOf(rootKey);
    if (baseIdx === -1) baseIdx = 0;

    const getNote = (interval) => NOTES[(baseIdx + interval) % 12];

    // Mesmos graus e cores da versão original do app:
    const aux = [
      { name: getNote(10), bg: '#788290' },        // bVII
      { name: getNote(9), bg: '#b095e6' },         // VI
      { name: `${getNote(11)}°`, bg: '#788290' },  // VII° (Diminuto)
      { name: getNote(4), bg: '#9c67d6' },         // III Relativo
      { name: getNote(2), bg: '#788290' }          // II Maior
    ];

    const main = [
      { name: getNote(0), label: '1º Tônica', bg: '#4c8ade' },
      { name: `${getNote(9)}m`, label: '6º Grau', bg: '#8056d6' },
      { name: getNote(5), label: '4º Subdom', bg: '#d16baf' },
      { name: `${getNote(2)}m`, label: '2º Grau', bg: '#e06c6c' },
      { name: getNote(7), label: '5º Domin', bg: '#e88d4f' },
      { name: `${getNote(4)}m`, label: '3º Grau', bg: '#d9aa45' }
    ];

    return { aux, main };
  }

  // Svelte 5 Rune $derived: recalcula automaticamente sempre que selectedKey mudar!
  let currentGrid = $derived(calculateChords(selectedKey));
</script>

<div class="chord-panel">
  <!-- Linha Superior: Auxiliares e Relativos -->
  <div class="chord-row">
    {#each currentGrid.aux as chord}
      <button 
        type="button"
        class="chord-btn" 
        class:active={activeChord === chord.name}
        style="--btn-color: {chord.bg};"
        onclick={() => onChordClick(chord.name)}
      >
        {chord.name}
      </button>
    {/each}
  </div>

  <!-- Linha Inferior: Diatônicos Principais (I, VIm, IV, IIm, V, IIIm) -->
  <div class="chord-row">
    {#each currentGrid.main as chord}
      <button 
        type="button"
        class="chord-btn" 
        class:active={activeChord === chord.name}
        style="--btn-color: {chord.bg};"
        onclick={() => onChordClick(chord.name)}
      >
        {chord.name}
      </button>
    {/each}
  </div>
</div>

<style>
  .chord-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .chord-row {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .chord-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background-color: var(--btn-color);
    color: white;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.18);
    transition: transform 0.1s, filter 0.2s, box-shadow 0.2s;
    user-select: none;
  }

  .chord-btn:active {
    transform: scale(0.93);
  }

  .chord-btn.active {
    filter: brightness(0.75);
    box-shadow: 0 0 16px 4px var(--btn-color);
    transform: scale(0.95);
  }
</style>