<script>
  import { MusicTheory } from '../utils/musicTheory.js';

  let { 
    selectedKey = 'C', 
    activeSlot = null, 
    onChordClick 
  } = $props();

  const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  function calculateChords(rootKey) {
    if (!rootKey || rootKey === 'L') rootKey = 'C';

    const isMinor = rootKey.endsWith('m');
    const rootName = isMinor ? rootKey.slice(0, -1) : rootKey;

    let baseIdx = MusicTheory.getNoteIndex(rootName);
    if (baseIdx === -1) baseIdx = 0;

    // Se o tom for menor (ex: Am), projeta os 11 botões com a relativa maior (+3 semitonos: C)
    const effectiveBase = isMinor ? (baseIdx + 3) % 12 : baseIdx;
    const getNote = (interval) => NOTES[(effectiveBase + interval) % 12];

    const aux = [
      { id: 'aux-0', name: getNote(10), bg: '#788290' },        // bVII
      { id: 'aux-1', name: getNote(9), bg: '#b095e6' },         // VI
      { id: 'aux-2', name: `${getNote(11)}°`, bg: '#788290' },  // VII°
      { id: 'aux-3', name: getNote(4), bg: '#9c67d6' },         // III
      { id: 'aux-4', name: getNote(2), bg: '#788290' }          // II
    ];

    const main = [
      { id: 'main-0', name: getNote(0), bg: '#4c8ade' },        // 1º Tônica
      { id: 'main-1', name: `${getNote(9)}m`, bg: '#8056d6' },  // 6º Grau
      { id: 'main-2', name: getNote(5), bg: '#d16baf' },        // 4º Subdominante
      { id: 'main-3', name: `${getNote(2)}m`, bg: '#e06c6c' },  // 2º Grau
      { id: 'main-4', name: getNote(7), bg: '#e88d4f' },        // 5º Dominante
      { id: 'main-5', name: `${getNote(4)}m`, bg: '#d9aa45' }   // 3º Grau
    ];

    return { aux, main };
  }

  let currentGrid = $derived(calculateChords(selectedKey));
</script>

<div class="chord-panel">
  <!-- Linha Superior (5 Botões) -->
  <div class="chord-row aux-row">
    {#each currentGrid.aux as chord}
      <button 
        type="button"
        class="chord-btn" 
        class:active={activeSlot === chord.id}
        style="--btn-color: {chord.bg};"
        onclick={() => onChordClick(chord.name, chord.id)}
      >
        {chord.name}
      </button>
    {/each}
  </div>

  <!-- Linha Inferior (6 Botões) -->
  <div class="chord-row main-row">
    {#each currentGrid.main as chord}
      <button 
        type="button"
        class="chord-btn" 
        class:active={activeSlot === chord.id}
        style="--btn-color: {chord.bg};"
        onclick={() => onChordClick(chord.name, chord.id)}
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
    padding: 2px 0 6px 0;
  }

  .chord-row {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

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

  .chord-btn.active {
    filter: brightness(0.68);
    box-shadow: 0 0 24px 8px var(--btn-color);
    transform: scale(0.95);
  }
</style>