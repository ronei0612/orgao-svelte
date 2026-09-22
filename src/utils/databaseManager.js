/**
 * src/utils/databaseManager.js
 * Gerenciador de persistência no LocalStorage e utilitários de backup (JSON).
 */

export class DatabaseManager {
  static STORAGE_KEY = 'songs';

  static defaultSongs = [
    {
      id: 'demo-1',
      title: 'Segura na Mão de Deus',
      content: `G              D
Segura na mão de Deus
C              G
Segura na mão de Deus
               D
Pois ela te sustentará
G              D
Não temas, segue adiante
C              G
E não olhes para trás
               D     G
Segura na mão de Deus e vai`,
      key: 'G',
      bpm: 85,
      instrument: 'orgao',
      style: '4/4'
    }
  ];

  static getSongs() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      this.saveSongs(this.defaultSongs);
      return this.defaultSongs;
    }
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : this.defaultSongs;
    } catch (err) {
      console.warn('[DatabaseManager] Falha ao ler músicas do localStorage:', err);
      return this.defaultSongs;
    }
  }

  static saveSongs(songs) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(songs));
  }

  static addSong(songData) {
    const songs = this.getSongs();
    const safeId = 'song-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newSong = {
      id: safeId,
      title: songData.title.trim(),
      content: songData.content || '',
      artist: songData.artist || '',
      key: songData.key || 'C',
      bpm: Number(songData.bpm) || 90,
      instrument: songData.instrument || 'orgao',
      style: songData.style || 'Sem ritmo'
    };

    songs.push(newSong);
    this.saveSongs(songs);
    return newSong;
  }

  static updateSong(id, songData) {
    const songs = this.getSongs();
    const index = songs.findIndex((s) => s.id === id);
    if (index === -1) return null;

    songs[index] = {
      ...songs[index],
      title: songData.title ? songData.title.trim() : songs[index].title,
      content: songData.content !== undefined ? songData.content : songs[index].content,
      artist: songData.artist !== undefined ? songData.artist : songs[index].artist,
      key: songData.key || songs[index].key,
      bpm: Number(songData.bpm) || songs[index].bpm,
      instrument: songData.instrument || songs[index].instrument,
      style: songData.style || songs[index].style
    };

    this.saveSongs(songs);
    return songs[index];
  }

  static deleteSong(id) {
    let songs = this.getSongs();
    songs = songs.filter((s) => s.id !== id);
    this.saveSongs(songs);
    return songs;
  }

  /**
   * Analisa um arquivo JSON importado comparando com o repertório atual
   */
  static analyzeImport(importedArray, currentSongs) {
    if (!Array.isArray(importedArray)) return [];

    return importedArray.map((item, index) => {
      // Suporte tanto ao formato atual quanto ao legado (index.html antigo)
      const title = (item.title || item.titulo || 'Sem Título').trim();
      const content = item.content || item.cifra || item.chords || '';
      const artist = item.artist || item.artista || '';
      const key = item.key || item.tom || 'C';
      const bpm = Number(item.bpm) || 90;
      const instrument = item.instrument || item.instrumento || 'orgao';
      const style = item.style || item.ritmo || 'Sem ritmo';

      const existing = currentSongs.find((s) => s.title.toLowerCase() === title.toLowerCase());
      const isUpdate = !!existing;

      return {
        index,
        title,
        content,
        artist,
        key,
        bpm,
        instrument,
        style,
        isUpdate,
        existingId: existing ? existing.id : null
      };
    });
  }

  /**
   * Aplica os itens selecionados da importação no repertório
   */
  static applyImport(analyzedSongs, selectedIndices, currentSongs) {
    const updatedList = [...currentSongs];

    selectedIndices.forEach((idx) => {
      const item = analyzedSongs[idx];
      if (!item) return;

      if (item.isUpdate && item.existingId) {
        // Substitui a música existente
        const targetIndex = updatedList.findIndex((s) => s.id === item.existingId);
        if (targetIndex !== -1) {
          updatedList[targetIndex] = {
            ...updatedList[targetIndex],
            title: item.title,
            content: item.content,
            artist: item.artist,
            key: item.key,
            bpm: item.bpm,
            instrument: item.instrument,
            style: item.style
          };
        }
      } else {
        // Adiciona nova música
        const safeId = 'song-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        updatedList.push({
          id: safeId,
          title: item.title,
          content: item.content,
          artist: item.artist,
          key: item.key,
          bpm: item.bpm,
          instrument: item.instrument,
          style: item.style
        });
      }
    });

    this.saveSongs(updatedList);
    return updatedList;
  }
}