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
  import { rhythmEngine } from './audio/rhythmEngine.js';

  // Estados reativos (Svelte 5 Runes)
  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);
  let currentKey = $state('C');
  let currentBpm = $state(90);
  let activeChord = $state(null);
  let isPlaying = $state(false);
  let isBlinking = $state(false);
  let musicPhase = $state(1);
  let currentInstrument = $state('orgao');

  let rhythmsList = $state(['Sem ritmo']);
  let selectedRhythm = $state('Sem ritmo');

  onMount(async () => {
    // 1. Pré-carrega o pad contínuo do órgão
    sampleEngine.preloadAll();

    // 2. Inicializa o sequenciador e obtém os ritmos do instrumento padrão
    await rhythmEngine.init();
    rhythmsList = rhythmEngine.getRhythmsList();

    // 3. Metrônomo visual no botão Play
    rhythmEngine.onMetronomeTick = () => {
      isBlinking = true;
      setTimeout(() => { isBlinking = false; }, 100);
    };

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
    rhythmEngine.setBpm(currentBpm);
  }

  function handlePhaseChange(nextPhase) {
    musicPhase = nextPhase;
    rhythmEngine.setPhase(musicPhase);
    if (isPlaying && activeChord) {
      sampleEngine.playChord(activeChord, musicPhase);
    }
  }

  function handleRhythmChange(rhythmName) {
    selectedRhythm = rhythmName;
    rhythmEngine.setRhythm(rhythmName);
  }

  async function handleToggleInstrument() {
    currentInstrument = currentInstrument === 'orgao' ? 'piano' : 'orgao';
    await rhythmEngine.setInstrument(currentInstrument);
    rhythmsList = rhythmEngine.getRhythmsList();

    // Se o ritmo selecionado não existir no novo instrumento, reseta
    if (!rhythmsList.includes(selectedRhythm)) {
      selectedRhythm = 'Sem ritmo';
      rhythmEngine.setRhythm('Sem ritmo');
    }
  }

  // =========================================================================
  // DISPARO SINCRONIZADO: Fundo Contínuo + Acompanhamento Melódico do Ritmo
  // =========================================================================
  function handleChordClick(chordName) {
    activeChord = chordName;
    isPlaying = true;

    sampleEngine.playChord(chordName, musicPhase);
    rhythmEngine.triggerChord(chordName, musicPhase, currentBpm);

    setTimeout(() => {
      if (activeChord === chordName) activeChord = null;
    }, 300);
  }

  function handleTogglePlay() {
    isPlaying = !isPlaying;
    if (!isPlaying) {
      sampleEngine.stopAll();
      rhythmEngine.stop();
      activeChord = null;
    } else {
      const chordToPlay = activeChord || currentKey;
      sampleEngine.playChord(chordToPlay, musicPhase);
      rhythmEngine.triggerChord(chordToPlay, musicPhase, currentBpm);
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

  <!-- Seleção do Ritmo e Instrumento (com suporte a alternar Órgão / Piano) -->
  <RhythmBar 
    rhythms={rhythmsList}
    selectedRhythm={selectedRhythm}
    currentInstrument={currentInstrument}
    onRhythmSelect={handleRhythmChange}
    onInstrumentClick={handleToggleInstrument} 
  />

  <PlaybackControls 
    isPlaying={isPlaying} 
    isBlinking={isBlinking}
    phase={musicPhase}
    onTogglePlay={handleTogglePlay} 
    onPhaseChange={handlePhaseChange}
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