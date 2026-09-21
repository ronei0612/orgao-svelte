<script>
  let { selectedKey = 'C', activeChord = null, onChordClick } = $props();

  const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Calcula os graus e aplica as cores originais exatas da Imagem 1
  function calculateChords(rootKey) {
    if (rootKey === 'L') rootKey = 'C';
    let baseIdx = NOTES.indexOf(rootKey);
    if (baseIdx === -1) baseIdx = 0;

    const getNote = (interval) => NOTES[(baseIdx + interval) % 12];

    // Linha Superior: Auxiliares e Relativos (5 botões)
    const aux = [
      { name: getNote(10), bg: '#788290' },        // bVII (Bb - Cinza)
      { name: getNote(9), bg: '#b095e6' },         // VI (A - Roxo Claro)
      { name: `${getNote(11)}°`, bg: '#788290' },  // VII° (B° - Cinza com °)
      { name: getNote(4), bg: '#9c67d6' },         // III (E - Roxo Médio)
      { name: getNote(2), bg: '#788290' }          // II (D - Cinza)
    ];

    // Linha Inferior: Diatônicos Principais (6 botões)
    const main = [
      { name: getNote(0), bg: '#4c8ade' },         // 1º Grau Tônica (C - Azul)
      { name: `${getNote(9)}m`, bg: '#8056d6' },   // 6º Grau Menor (Am - Violeta)
      { name: getNote(5), bg: '#d16baf' },         // 4º Grau Subdominante (F - Magenta)
      { name: `${getNote(2)}m`, bg: '#e06c6c' },   // 2º Grau Menor (Dm - Coral)
      { name: getNote(7), bg: '#e88d4f' },         // 5º Grau Dominante (G - Laranja)
      { name: `${getNote(4)}m`, bg: '#d9aa45' }    // 3º Grau Menor (Em - Dourado)
    ];

    return { aux, main };
  }

  let currentGrid = $derived(calculateChords(selectedKey));
</script>

<div class="chord-panel">
  <!-- Linha Superior: 5 Botões -->
  <div class="chord-row aux-row">
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

  <!-- Linha Inferior: 6 Botões -->
  <div class="chord-row main-row">
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
    gap: 12px;
    padding: 6px 0 12px 0;
  }

  .chord-row {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  /* BOTÃO EM REPOUSO (Sem tocar - Idêntico à Imagem 1) */
  .chord-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background-color: var(--btn-color);
    color: #ffffff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
    transition: transform 0.12s ease, box-shadow 0.2s ease, filter 0.2s ease;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .chord-btn:active {
    transform: scale(0.92);
  }

  /* BOTÃO TOCANDO / ATIVO (Idêntico às Imagens 2, 3, 4 e 5):
     - Afunda ligeiramente (scale 0.95)
     - Escurece a cor interna da tecla (brightness 0.68)
     - Projeta a aura colorida difusa ao redor */
  .chord-btn.active {
    filter: brightness(0.68);
    box-shadow: 0 0 24px 8px var(--btn-color);
    transform: scale(0.95);
  }
</style>