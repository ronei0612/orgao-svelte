<script>
  let { activeChord = null, onChordClick } = $props();

  // Linha superior (acordes de passagem/relativos)
  const auxChords = [
    { name: 'Bb', bg: '#788290' },
    { name: 'A', bg: '#b095e6' },
    { name: 'B°', bg: '#788290' },
    { name: 'E', bg: '#9c67d6' },
    { name: 'D', bg: '#788290' }
  ];

  // Linha inferior (graus diatônicos do campo harmônico)
  const mainChords = [
    { name: 'C', label: '1º Tônica', bg: '#4c8ade' },
    { name: 'Am', label: '6º Grau', bg: '#8056d6' },
    { name: 'F', label: '4º Subdom', bg: '#d16baf' },
    { name: 'Dm', label: '2º Grau', bg: '#e06c6c' },
    { name: 'G', label: '5º Domin', bg: '#e88d4f' },
    { name: 'Em', label: '3º Grau', bg: '#d9aa45' }
  ];
</script>

<div class="chord-panel">
  <!-- Linha Superior -->
  <div class="chord-row">
    {#each auxChords as chord}
      <button 
        class="chord-btn" 
        class:active={activeChord === chord.name}
        style="--btn-color: {chord.bg};"
        onclick={() => onChordClick(chord.name)}
      >
        {chord.name}
      </button>
    {/each}
  </div>

  <!-- Linha Inferior -->
  <div class="chord-row">
    {#each mainChords as chord}
      <button 
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
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    transition: transform 0.1s, filter 0.2s, box-shadow 0.2s;
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