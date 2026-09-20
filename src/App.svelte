<script>
  import Header from './components/Header.svelte';
  import MainDisplay from './components/MainDisplay.svelte';
  import RhythmBar from './components/RhythmBar.svelte';
  import PlaybackControls from './components/PlaybackControls.svelte';
  import ChordPanel from './components/ChordPanel.svelte';
  import PianoKeyboard from './components/PianoKeyboard.svelte';
  import Drawer from './components/Drawer.svelte';

  // Importamos o novo Motor de Amostras (.OGG)
  import { sampleEngine } from './audio/sampleEngine.js';

  // Estados reativos (Svelte 5 Runes)
  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);
  let currentKey = $state('C');
  let currentBpm = $state(90);
  let activeChord = $state(null);
  let isPlaying = $state(false);
  let musicPhase = $state(1); // 1 = Órgão, 2 = +Cordas, 3 = Cheio

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

  // Toca o acorde usando os arquivos .ogg reais
  function handleChordClick(chordName) {
    activeChord = chordName;
    isPlaying = true;
    sampleEngine.playChord(chordName, musicPhase);

    // Mantém a luz acesa durante a troca
    setTimeout(() => {
      if (activeChord === chordName) activeChord = null;
    }, 350);
  }

  function handleTogglePlay() {
    isPlaying = !isPlaying;
    if (!isPlaying) {
      sampleEngine.stopAll();
      activeChord = null;
    }
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

  <!-- Visor -->
  <MainDisplay />

  <!-- Barra de Ritmos -->
  <RhythmBar onInstrumentClick={() => alert('Troca de instrumento')} />

  <!-- Controles de Play e Fase Musical -->
  <PlaybackControls 
    isPlaying={isPlaying} 
    phase={musicPhase}
    onTogglePlay={handleTogglePlay} 
    onPhaseChange={(p) => {
      musicPhase = p;
      if (activeChord) sampleEngine.playChord(activeChord, musicPhase);
    }}
  />

  <!-- Painel de Acordes -->
  <ChordPanel 
    selectedKey={currentKey}
    activeChord={activeChord} 
    onChordClick={handleChordClick} 
  />

  <!-- Teclado do Piano (Flauta real) -->
  <PianoKeyboard 
    onNoteDown={(note) => sampleEngine.startPianoKey(note)}
    onNoteUp={(note) => sampleEngine.stopPianoKey(note)}
  />

  <!-- Menu Gaveta -->
  <Drawer 
    isOpen={isMenuOpen} 
    onClose={() => (isMenuOpen = false)} 
    isDarkMode={isDarkMode} 
    onToggleTheme={toggleTheme} 
  />
</div>