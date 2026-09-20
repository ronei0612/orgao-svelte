<script>
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import MainDisplay from './components/MainDisplay.svelte';
  import RhythmBar from './components/RhythmBar.svelte';
  import PlaybackControls from './components/PlaybackControls.svelte';
  import ChordPanel from './components/ChordPanel.svelte';
  import PianoKeyboard from './components/PianoKeyboard.svelte';
  import Drawer from './components/Drawer.svelte';

  import { sampleEngine } from './audio/sampleEngine.js';

  // Estados reativos
  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);
  let currentKey = $state('C');
  let currentBpm = $state(90);
  let activeChord = $state(null);
  let isPlaying = $state(false);
  let musicPhase = $state(1);

  // =========================================================================
  // DISPARO DO PRÉ-CARREGAMENTO AO ABRIR O SITE
  // =========================================================================
  onMount(() => {
    // Carrega todas as amostras para a memória RAM logo na inicialização
    sampleEngine.preloadAll();

    // Desbloqueia o contexto de áudio no primeiro toque na tela (exigência de celulares)
    const unlockAudio = () => {
      sampleEngine.init();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
  });

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

  function handleChordClick(chordName) {
    activeChord = chordName;
    isPlaying = true;
    sampleEngine.playChord(chordName);

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
  <Header 
    onOpenMenu={() => (isMenuOpen = true)}
    selectedKey={currentKey}
    bpm={currentBpm}
    onKeyChange={handleKeyChange}
    onBpmChange={handleBpmChange}
  />

  <MainDisplay />

  <RhythmBar onInstrumentClick={() => alert('Troca de instrumento')} />

  <PlaybackControls 
    isPlaying={isPlaying} 
    phase={musicPhase}
    onTogglePlay={handleTogglePlay} 
    onPhaseChange={(p) => { musicPhase = p; }}
  />

  <ChordPanel 
    selectedKey={currentKey}
    activeChord={activeChord} 
    onChordClick={handleChordClick} 
  />

  <PianoKeyboard 
    onNoteDown={(note) => sampleEngine.startPianoKey(note)}
    onNoteUp={(note) => sampleEngine.stopPianoKey(note)}
  />

  <Drawer 
    isOpen={isMenuOpen} 
    onClose={() => (isMenuOpen = false)} 
    isDarkMode={isDarkMode} 
    onToggleTheme={toggleTheme} 
  />
</div>