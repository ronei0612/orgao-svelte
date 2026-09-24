<script>
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import MainDisplay from './components/MainDisplay.svelte';
  import RhythmBar from './components/RhythmBar.svelte';
  import PlaybackControls from './components/PlaybackControls.svelte';
  import ChordPanel from './components/ChordPanel.svelte';
  import PianoKeyboard from './components/PianoKeyboard.svelte';
  import Drawer from './components/Drawer.svelte';
  import ExportModal from './components/ExportModal.svelte';
  import ImportModal from './components/ImportModal.svelte';
  import AboutModal from './components/AboutModal.svelte';

  import { sampleEngine } from './audio/sampleEngine.js';
  import { rhythmEngine } from './audio/rhythmEngine.js';
  import { TextFormatter } from './utils/textFormatter.js';
  import { MusicTheory } from './utils/musicTheory.js';
  import { DatabaseManager } from './utils/databaseManager.js';
  import { wakeLockController } from './utils/wakeLock.js';

  // --- ESTADOS DO SISTEMA ---
  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);
  let isExportModalOpen = $state(false);
  let isImportModalOpen = $state(false);
  let isAboutModalOpen = $state(false);

  let activeTab = $state('song');

  let currentKey = $state('C');
  let currentBpm = $state(90);

  let activeSlot = $state(null);
  let currentPlayingChord = $state('C');

  let isPlaying = $state(false);
  let isBlinking = $state(false);
  let musicPhase = $state(1);
  let currentInstrument = $state('orgao');

  let rhythmsList = $state(['Sem ritmo']);
  let selectedRhythm = $state('Sem ritmo');

  // --- REPERTÓRIO & EDIÇÃO ---
  let isEditing = $state(false);
  let songTitle = $state('');
  let editingContent = $state('');
  let displayedContent = $state('');
  let selectedSongId = $state(''); // '' = Acordes (padrão)
  let songs = $state([]);

  let currentStepIndex = $state(-1);
  let totalChordSteps = $state(0);

  // Flag de controle manual do tom
  let isUserSetKey = $state(false);

  const isLyricsOnly = $derived(currentKey === 'L');
  const showNav = $derived(!isEditing && activeTab === 'song' && selectedSongId !== '' && totalChordSteps > 0 && !isLyricsOnly);

  const currentSong = $derived(songs.find((s) => s.id === selectedSongId));
  const quickReturnSongTitle = $derived(currentSong ? currentSong.title : '');

  onMount(async () => {
    sampleEngine.preloadAll();

    await rhythmEngine.init();
    rhythmsList = rhythmEngine.getRhythmsList();

    rhythmEngine.onMetronomeTick = () => {
      isBlinking = true;
      setTimeout(() => { isBlinking = false; }, 100);
    };

    const unlockAudioAndWakeLock = () => {
      sampleEngine.init();
      wakeLockController.request();
      window.removeEventListener('pointerdown', unlockAudioAndWakeLock);
    };
    window.addEventListener('pointerdown', unlockAudioAndWakeLock);

    function handleKeydown(e) {
      if (isEditing) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowRight' && showNav) {
        e.preventDefault();
        handleNextChord();
      } else if (e.key === 'ArrowLeft' && showNav) {
        e.preventDefault();
        handlePrevChord();
      }
    }

    window.addEventListener('keydown', handleKeydown);

    // Carrega o banco do localStorage
    songs = DatabaseManager.getSongs();

    // REGRA: Ao carregar a página, inicia SEMPRE em "Acordes" por padrão
    selectedSongId = '';
    displayedContent = '';
    currentKey = 'C';
    currentStepIndex = -1;

    return () => window.removeEventListener('keydown', handleKeydown);
  });

  function loadSong(id) {
    if (!id) {
      // Volta para o modo 'Acordes'
      selectedSongId = '';
      displayedContent = '';
      currentStepIndex = -1;
      if (currentKey === 'L') currentKey = 'C';
      return;
    }

    const song = songs.find((s) => s.id === id);
    if (!song) return;

    selectedSongId = song.id;
    activeTab = 'song';
    currentKey = song.key || 'C';
    currentBpm = song.bpm || 90;
    rhythmEngine.setBpm(currentBpm);

    if (song.instrument && song.instrument !== currentInstrument) {
      currentInstrument = song.instrument;
      rhythmEngine.setInstrument(currentInstrument);
    }

    if (song.style) {
      selectedRhythm = song.style;
      rhythmEngine.setRhythm(song.style);
    }

    displayedContent = TextFormatter.prepareContent(song.content);
    currentStepIndex = 0;
    isUserSetKey = false;
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }

  function handleKeyChange(newVal) {
    isUserSetKey = true;
    const baseKeys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

    if (typeof newVal === 'number') {
      if (currentKey === 'L') return;

      const isMinor = currentKey.endsWith('m');
      const rootOnly = isMinor ? currentKey.slice(0, -1) : currentKey;
      const idx = MusicTheory.getNoteIndex(rootOnly);

      if (idx !== -1) {
        const nextIdx = (idx + newVal + 12) % 12;
        const nextNote = baseKeys[nextIdx];
        currentKey = isMinor ? `${nextNote}m` : nextNote;
        transposeDisplayedSong(newVal);
      }
    } else {
      if (newVal === 'L') {
        currentKey = 'L';
      } else {
        const oldRoot = currentKey.replace('m', '');
        const newRoot = newVal.replace('m', '');
        const oldIdx = MusicTheory.getNoteIndex(oldRoot);
        const newIdx = MusicTheory.getNoteIndex(newRoot);

        if (oldIdx !== -1 && newIdx !== -1) {
          let delta = newIdx - oldIdx;
          if (delta > 6) delta -= 12;
          if (delta < -6) delta += 12;
          currentKey = newVal;
          transposeDisplayedSong(delta);
        } else {
          currentKey = newVal;
        }
      }
    }
  }

  function transposeDisplayedSong(delta) {
    if (!isEditing && displayedContent && delta !== 0) {
      displayedContent = MusicTheory.transposeHtmlContent(displayedContent, delta);
    }
  }

  function handleBpmChange(delta) {
    currentBpm = Math.max(30, Math.min(300, currentBpm + delta));
    rhythmEngine.setBpm(currentBpm);
  }

  function handleBpmSet(val) {
    if (isNaN(val) || val <= 0) return;
    currentBpm = Math.max(30, Math.min(300, val));
    rhythmEngine.setBpm(currentBpm);
  }

  function handlePhaseChange(nextPhase) {
    musicPhase = nextPhase;
    rhythmEngine.setPhase(musicPhase);
  }

  function handleRhythmChange(rhythmName) {
    selectedRhythm = rhythmName;
    rhythmEngine.setRhythm(rhythmName);
  }

  async function handleToggleInstrument() {
    currentInstrument = currentInstrument === 'orgao' ? 'piano' : 'orgao';
    await rhythmEngine.setInstrument(currentInstrument);
    rhythmsList = rhythmEngine.getRhythmsList();

    if (!rhythmsList.includes(selectedRhythm)) {
      selectedRhythm = 'Sem ritmo';
      rhythmEngine.setRhythm('Sem ritmo');
    }
  }

  function handleNextChord() {
    if (totalChordSteps === 0) return;
    currentStepIndex = (currentStepIndex + 1) % totalChordSteps;
    if (isPlaying && currentPlayingChord) {
      playChordSound(currentPlayingChord);
    }
  }

  function handlePrevChord() {
    if (totalChordSteps === 0) return;
    currentStepIndex = currentStepIndex <= 0 ? 0 : currentStepIndex - 1;
    if (isPlaying && currentPlayingChord) {
      playChordSound(currentPlayingChord);
    }
  }

  function playChordSound(chordName) {
    currentPlayingChord = chordName;
    sampleEngine.playChord(chordName, musicPhase);
    rhythmEngine.triggerChord(chordName, musicPhase, currentBpm);
  }

  function handleDisplayChordClick(chordName, index) {
    currentStepIndex = index;
    isPlaying = true;
    playChordSound(chordName);
  }

  function handleActiveChordChange(chordName) {
    currentPlayingChord = chordName;
  }

  function handleTogglePlay() {
    isPlaying = !isPlaying;
    if (!isPlaying) {
      sampleEngine.stopAll();
      rhythmEngine.stop();
      activeSlot = null;
    } else {
      if (selectedSongId && totalChordSteps > 0 && currentStepIndex < 0) {
        currentStepIndex = 0;
      }
      activeSlot = activeSlot || 'main-0';
      const chordToPlay = currentPlayingChord || currentKey;
      playChordSound(chordToPlay);
    }
  }

  function handleChordPanelClick(chordName, slotId) {
    activeSlot = slotId;
    isPlaying = true;
    playChordSound(chordName);
  }

  // --- AÇÕES CRUD ---
  function handleAddSong() {
    activeTab = 'song';
    isEditing = true;
    isUserSetKey = false;
    songTitle = '';
    editingContent = '';
    currentKey = 'C';
  }

  function handleEditSong() {
    if (!selectedSongId) return;
    const song = songs.find((s) => s.id === selectedSongId);
    if (!song) return;

    activeTab = 'song';
    isEditing = true;
    isUserSetKey = false;
    songTitle = song.title;
    editingContent = song.content;
    currentKey = song.key || 'C';
  }

  function handleCancelEdit() {
    isEditing = false;
    isUserSetKey = false;
    songTitle = '';
    editingContent = '';
  }

  function handleSaveSong() {
    const title = songTitle.trim();
    if (!title) {
      alert('O título da música é obrigatório!');
      return;
    }

    let keyToSave = currentKey;

    // Se o usuário não alterou manualmente, detecta pelo texto
    if (!isUserSetKey) {
      const detectedKey = MusicTheory.detectKeyFromChords(editingContent);
      keyToSave = detectedKey || 'C';
      currentKey = keyToSave;
    }

    const payload = {
      title,
      content: editingContent,
      key: keyToSave,
      bpm: currentBpm,
      instrument: currentInstrument,
      style: selectedRhythm
    };

    if (selectedSongId && songs.some((s) => s.id === selectedSongId)) {
      DatabaseManager.updateSong(selectedSongId, payload);
      songs = DatabaseManager.getSongs();
      displayedContent = TextFormatter.prepareContent(payload.content);
    } else {
      const created = DatabaseManager.addSong(payload);
      songs = DatabaseManager.getSongs();
      selectedSongId = created.id;
      displayedContent = TextFormatter.prepareContent(created.content);
    }

    currentStepIndex = 0;
    isEditing = false;
    isUserSetKey = false;
  }

  function handleDeleteSong() {
    if (!selectedSongId) return;
    songs = DatabaseManager.deleteSong(selectedSongId);
    selectedSongId = '';
    displayedContent = '';
    currentStepIndex = -1;
    currentKey = 'C';
  }

  function handleImportComplete(newSongsList) {
    songs = newSongsList;
    if (songs.length > 0) {
      loadSong(songs[songs.length - 1].id);
    }
  }

  function handleRestoreApp() {
    if (confirm('⚠️ ATENÇÃO: Isso apagará TODO o repertório salvo e restaurará os dados de fábrica. Deseja continuar?')) {
      localStorage.clear();
      songs = DatabaseManager.getSongs();
      selectedSongId = '';
      displayedContent = '';
      currentKey = 'C';
      alert('Aplicativo restaurado com sucesso.');
    }
  }
</script>

<div class="app-container">
  <Header 
    onOpenMenu={() => (isMenuOpen = true)}
    selectedKey={currentKey}
    bpm={currentBpm}
    {isEditing}
    {songs}
    {selectedSongId}
    {songTitle}
    onKeyChange={handleKeyChange}
    onBpmChange={handleBpmChange}
    onBpmSet={handleBpmSet}
    onSongChange={loadSong}
    onTitleChange={(val) => (songTitle = val)}
    onAddSong={handleAddSong}
    onEditSong={handleEditSong}
    onDeleteSong={handleDeleteSong}
    onSaveSong={handleSaveSong}
    onCancelEdit={handleCancelEdit}
  />

  <MainDisplay 
    content={isEditing ? editingContent : displayedContent}
    {isEditing}
    {isLyricsOnly}
    {activeTab}
    {quickReturnSongTitle}
    onReturnToSong={() => (activeTab = 'song')}
    activeStepIndex={currentStepIndex}
    onContentChange={(val) => (editingContent = val)}
    onChordClick={handleDisplayChordClick}
    onStepsCount={(count) => (totalChordSteps = count)}
    onActiveChordChange={handleActiveChordChange}
  />

  <RhythmBar 
    rhythms={rhythmsList}
    selectedRhythm={selectedRhythm}
    currentInstrument={currentInstrument}
    onRhythmSelect={handleRhythmChange}
    onInstrumentClick={handleToggleInstrument} 
  />

  <PlaybackControls 
    {isPlaying} 
    {isBlinking}
    phase={musicPhase}
    {showNav}
    onTogglePlay={handleTogglePlay} 
    onPhaseChange={handlePhaseChange}
    onPrevChord={handlePrevChord}
    onNextChord={handleNextChord}
  />

  <!-- Grade de 11 botões exibida quando estiver no modo 'Acordes' -->
  {#if !selectedSongId && activeTab === 'song'}
    <ChordPanel 
      selectedKey={currentKey}
      {activeSlot} 
      onChordClick={handleChordPanelClick} 
    />
  {/if}

  <PianoKeyboard 
    onNoteDown={(note) => sampleEngine.startPianoKey(note)}
    onNoteUp={(note) => sampleEngine.stopPianoKey(note)}
  />

  <Drawer 
    isOpen={isMenuOpen} 
    onClose={() => (isMenuOpen = false)} 
    {isDarkMode} 
    onToggleTheme={toggleTheme}
    onSelectView={(view) => (activeTab = view)}
    onOpenExport={() => (isExportModalOpen = true)}
    onOpenImport={() => (isImportModalOpen = true)}
    onOpenAbout={() => (isAboutModalOpen = true)}
    onRestoreApp={handleRestoreApp}
  />

  <ExportModal 
    isOpen={isExportModalOpen}
    {songs}
    onClose={() => (isExportModalOpen = false)}
  />

  <ImportModal 
    isOpen={isImportModalOpen}
    currentSongs={songs}
    onImportComplete={handleImportComplete}
    onClose={() => (isImportModalOpen = false)}
  />

  <AboutModal 
    isOpen={isAboutModalOpen}
    onClose={() => (isAboutModalOpen = false)}
  />
</div>