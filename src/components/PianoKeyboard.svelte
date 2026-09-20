<script>
  let { onNoteDown, onNoteUp } = $props();

  const pattern = [
    { note: 'C', type: 'white' },
    { note: 'C#', type: 'black' },
    { note: 'D', type: 'white' },
    { note: 'D#', type: 'black' },
    { note: 'E', type: 'white' },
    { note: 'F', type: 'white' },
    { note: 'F#', type: 'black' },
    { note: 'G', type: 'white' },
    { note: 'G#', type: 'black' },
    { note: 'A', type: 'white' },
    { note: 'A#', type: 'black' },
    { note: 'B', type: 'white' }
  ];

  const octaves = [4, 5];
  let pressedKeys = $state(new Set());

  function handleStart(noteName) {
    pressedKeys.add(noteName);
    pressedKeys = new Set(pressedKeys); // Força atualização reativa
    if (onNoteDown) onNoteDown(noteName);
  }

  function handleEnd(noteName) {
    if (pressedKeys.has(noteName)) {
      pressedKeys.delete(noteName);
      pressedKeys = new Set(pressedKeys);
      if (onNoteUp) onNoteUp(noteName);
    }
  }
</script>

<div class="piano-wrapper">
  <div class="piano-container">
    <div class="piano">
      {#each octaves as oct}
        {#each pattern as item}
          {@const keyLabel = `${item.note}${oct}`}
          <button 
            type="button"
            class="key {item.type}" 
            class:pressed={pressedKeys.has(keyLabel)}
            onpointerdown={() => handleStart(keyLabel)}
            onpointerup={() => handleEnd(keyLabel)}
            onpointerleave={() => handleEnd(keyLabel)}
            onpointercancel={() => handleEnd(keyLabel)}
          >
            <span>{keyLabel}</span>
          </button>
        {/each}
      {/each}
      <!-- Tecla C6 final -->
      <button 
        type="button"
        class="key white" 
        class:pressed={pressedKeys.has('C6')}
        onpointerdown={() => handleStart('C6')}
        onpointerup={() => handleEnd('C6')}
        onpointerleave={() => handleEnd('C6')}
      >
        <span>C6</span>
      </button>
    </div>
  </div>
</div>

<style>
  .piano-wrapper {
    position: relative;
    width: 100%;
    margin-top: auto;
  }

  .piano-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 0;
    scrollbar-width: thin;
    touch-action: pan-x;
  }

  .piano {
    display: flex;
    height: 90px;
    width: max-content;
    margin: 0 auto;
    padding: 0 4px;
  }

  .key {
    border-radius: 0 0 4px 4px;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    font-weight: bold;
    user-select: none;
    border: none;
    transition: background 0.1s, transform 0.1s;
    touch-action: none;
  }

  .key.white {
    width: 44px;
    background: #ffffff;
    border: 1px solid #ccc;
    z-index: 1;
    color: #495057;
    font-size: 11px;
    padding-bottom: 5px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.1);
  }

  .key.black {
    width: 28px;
    height: 52px;
    background: #222222;
    z-index: 2;
    margin-left: -14px;
    margin-right: -14px;
    color: #f8f9fa;
    font-size: 9px;
    padding-bottom: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .key.white.pressed {
    background: #e9ecef;
    transform: translateY(2px);
  }

  .key.black.pressed {
    background: #000000;
    transform: translateY(2px);
  }

  :global([data-theme="dark"]) .key.white {
    background: #d8dde2;
    color: #212529;
  }
</style>