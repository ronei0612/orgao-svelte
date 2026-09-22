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

  import { sampleEngine } from './audio/sampleEngine.js';
  import { rhythmEngine } from './audio/rhythmEngine.js';
  import { TextFormatter } from './utils/textFormatter.js';
  import { MusicTheory } from './utils/musicTheory.js';
  import { DatabaseManager } from './utils/databaseManager.js';

  // --- ESTADOS DO SISTEMA ---
  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);
  let isExportModalOpen = $state(false);
  let isImportModalOpen = $state(false);

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

  // --- ESTADOS DO REPERTÓRIO & DISPLAY ---
  let isEditing = $state(false);
  let songTitle = $state('');
  let editingContent = $state('');
  let displayedContent = $state('');
  let selectedSongId = $state('');
  let songs = $state([]);

  const isLyricsOnly = $derived(currentKey === 'L');

  onMount(async () => {
    sampleEngine.preloadAll();

    await rhythmEngine.init();
    rhythmsList = rhythmEngine.getRhythmsList();

    rhythmEngine.onMetronomeTick = () => {
      isBlinking = true;
      setTimeout(() => { isBlinking = false; }, 100);
    };

    const unlockAudio = () => {
      sampleEngine.init();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);

    // Carrega o repertório via DatabaseManager
    songs = DatabaseManager.getSongs();
    if (songs.length > 0) {
      loadSong(songs[0].id);
    }
  });

  function loadSong(id) {
    const song = songs.find((s) => s.id === id);
    if (!song) {
      selectedSongId = '';
      displayedContent = '';
      return;
    }

    selectedSongId = song.id;
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
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }

  function handleKeyChange(newVal) {
    const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

    if (typeof newVal === 'number') {
      if (currentKey === 'L') return;
      const idx = keys.indexOf(currentKey);
      if (idx !== -1) {
        const nextIdx = (idx + newVal + 12) % 12;
        currentKey = keys[nextIdx];
        transposeDisplayedSong(newVal);
      }
    } else {
      if (newVal === 'L') {
        currentKey = 'L';
      } else {
        const oldIdx = keys.indexOf(currentKey);
        const newIdx = keys.indexOf(newVal);
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

  // --- CRUD REPERTÓRIO ---
  function handleAddSong() {
    isEditing = true;
    songTitle = '';
    editingContent = '';
  }

  function handleEditSong() {
    if (!selectedSongId) {
      alert('Selecione uma música para editar.');
      return;
    }
    const song = songs.find((s) => s.id === selectedSongId);
    if (!song) return;

    isEditing = true;
    songTitle = song.title;
    editingContent = song.content;
  }

  function handleCancelEdit() {
    isEditing = false;
    songTitle = '';
    editingContent = '';
  }

  function handleSaveSong() {
    const title = songTitle.trim();
    if (!title) {
      alert('O título da música é obrigatório!');
      return;
    }

    const payload = {
      title,
      content: editingContent,
      key: currentKey,
      bpm: currentBpm,
      instrument: currentInstrument,
      style: selectedRhythm
    };

    if (selectedSongId && songs.some((s) => s.id === selectedSongId)) {
      const updated = DatabaseManager.updateSong(selectedSongId, payload);
      songs = DatabaseManager.getSongs();
      displayedContent = TextFormatter.prepareContent(updated.content);
    } else {
      const created = DatabaseManager.addSong(payload);
      songs = DatabaseManager.getSongs();
      selectedSongId = created.id;
      displayedContent = TextFormatter.prepareContent(created.content);
    }

    isEditing = false;
  }

  function handleDeleteSong() {
    if (!selectedSongId) return;
    const song = songs.find((s) => s.id === selectedSongId);
    if (!song) return;

    if (confirm(`Deseja excluir a música "${song.title}"?`)) {
      songs = DatabaseManager.deleteSong(selectedSongId);
      selectedSongId = '';
      displayedContent = '';
    }
  }

  function handleImportComplete(newSongsList) {
    songs = newSongsList;
    if (songs.length > 0) {
      loadSong(songs[songs.length - 1].id);
    }
  }

  function handleRestoreApp() {
    if (confirm('⚠️ ATENÇÃO: Isso apagará TODO o repertório salvo e restaurará o estado inicial de fábrica. Deseja continuar?')) {
      localStorage.clear();
      songs = DatabaseManager.getSongs();
      if (songs.length > 0) {
        loadSong(songs[0].id);
      }
      alert('Aplicativo restaurado com sucesso.');
    }
  }

  function handleChordClick(chordName, slotId) {
    activeSlot = slotId;
    currentPlayingChord = chordName;
    isPlaying = true;

    sampleEngine.playChord(chordName, musicPhase);
    rhythmEngine.triggerChord(chordName, musicPhase, currentBpm);
  }

  function handleDisplayChordClick(chordName, node) {
    currentPlayingChord = chordName;
    isPlaying = true;

    document.querySelectorAll('.chord-highlight').forEach((el) => el.classList.remove('chord-highlight'));
    node.classList.add('chord-highlight');

    sampleEngine.playChord(chordName, musicPhase);
    rhythmEngine.triggerChord(chordName, musicPhase, currentBpm);
  }

  function handleTogglePlay() {
    isPlaying = !isPlaying;
    if (!isPlaying) {
      sampleEngine.stopAll();
      rhythmEngine.stop();
      activeSlot = null;
      document.querySelectorAll('.chord-highlight').forEach((el) => el.classList.remove('chord-highlight'));
    } else {
      activeSlot = activeSlot || 'main-0';
      const chordToPlay = currentPlayingChord || currentKey;
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
    onContentChange={(val) => (editingContent = val)}
    onChordClick={handleDisplayChordClick}
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
    onTogglePlay={handleTogglePlay} 
    onPhaseChange={handlePhaseChange}
  />

  <ChordPanel 
    selectedKey={currentKey}
    {activeSlot} 
    onChordClick={handleChordClick} 
  />

  <PianoKeyboard 
    onNoteDown={(note) => sampleEngine.startPianoKey(note)}
    onNoteUp={(note) => sampleEngine.stopPianoKey(note)}
  />

  <Drawer 
    isOpen={isMenuOpen} 
    onClose={() => (isMenuOpen = false)} 
    {isDarkMode} 
    onToggleTheme={toggleTheme}
    onOpenExport={() => (isExportModalOpen = true)}
    onOpenImport={() => (isImportModalOpen = true)}
    onRestoreApp={handleRestoreApp}
  />

  <!-- Modais de Backup / Repertório -->
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
</div>