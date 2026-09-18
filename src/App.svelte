<script>
  import Header from './components/Header.svelte';
  import MainDisplay from './components/MainDisplay.svelte';
  import RhythmBar from './components/RhythmBar.svelte';
  import PlaybackControls from './components/PlaybackControls.svelte';
  import ChordPanel from './components/ChordPanel.svelte';
  import PianoKeyboard from './components/PianoKeyboard.svelte';
  import Drawer from './components/Drawer.svelte';

  // Estados reativos (Svelte 5 Runes)
  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);
  let currentKey = $state('C');
  let currentBpm = $state(90);
  let activeChord = $state(null);
  let isPlaying = $state(false);

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }

  function handleKeyChange(newVal) {
    if (typeof newVal === 'number') {
      const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
      let idx = keys.indexOf(currentKey);
      if (idx !== -1) {
        let nextIdx = (idx + newVal + 12) % 12;
        currentKey = keys[nextIdx];
      }
    } else {
      currentKey = newVal;
    }
  }

  function handleBpmChange(val) {
    currentBpm = Math.max(30, Math.min(300, currentBpm + val));
  }
</script>

<div class="app-container">
  <!-- Top Bar -->
  <Header 
    onOpenMenu={() => (isMenuOpen = true)}
    selectedKey={currentKey}
    bpm={currentBpm}
    onKeyChange={handleKeyChange}
    onBpmChange={handleBpmChange}
  />

  <!-- Visor de Cifras e Partituras -->
  <MainDisplay />

  <!-- Barra de Ritmos e Seleção de Instrumento -->
  <RhythmBar onInstrumentClick={() => alert('Modal de Instrumento')} />

  <!-- Controles de Play, Avançar e Fase -->
  <PlaybackControls 
    isPlaying={isPlaying} 
    onTogglePlay={() => (isPlaying = !isPlaying)} 
  />

  <!-- Grade de Acordes Coloridos -->
  <ChordPanel 
    activeChord={activeChord} 
    onChordClick={(name) => {
      activeChord = name;
      setTimeout(() => { if (activeChord === name) activeChord = null; }, 250);
    }} 
  />

  <!-- Teclado do Piano Interativo -->
  <PianoKeyboard onNotePlay={(n) => console.log('Tocar nota:', n)} />

  <!-- Menu Lateral Offcanvas -->
  <Drawer 
    isOpen={isMenuOpen} 
    onClose={() => (isMenuOpen = false)} 
    isDarkMode={isDarkMode} 
    onToggleTheme={toggleTheme} 
  />
</div>