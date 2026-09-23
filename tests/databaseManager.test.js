// tests/databaseManager.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseManager } from '../src/utils/databaseManager.js';

/**
 * ============================================================================
 * SUÍTE: DatabaseManager (Persistência, CRUD e Importação Inteligente)
 * ============================================================================
 * Valida o gerenciador do LocalStorage:
 * - Carga de repertório semente padrão (seed) no primeiro acesso.
 * - Operações de Adicionar, Atualizar e Excluir músicas.
 * - Motor de análise de importação (.json) separando músicas repetidas de novas.
 * - Resiliência e tratamento de erros contra JSONs inválidos ou corrompidos.
 */
describe('DatabaseManager - Persistência e Backup Inteligente', () => {
  beforeEach(() => {
    // Limpa o armazenamento antes de cada teste para isolamento de dados
    localStorage.clear();
  });

  /**
   * 🎯 Objetivo: Garantir que um usuário recém-chegado nunca encontre uma tela em branco.
   * 📜 Regra: Se o LocalStorage estiver vazio, inicializa automaticamente a música padrão.
   */
  it('deve carregar a música demo padrão caso o localStorage esteja vazio', () => {
    const songs = DatabaseManager.getSongs();
    expect(songs.length).toBeGreaterThan(0);
    expect(songs[0].title).toBe('Segura na Mão de Deus');
  });

  /**
   * 🎯 Objetivo: Validar o ciclo de vida completo de persistência (CRUD).
   * 📜 Regra: As músicas salvas devem receber um ID único seguro e persistir no LocalStorage.
   */
  it('deve adicionar, atualizar e excluir músicas com persistência', () => {
    // 1. Adicionar nova música
    const nova = DatabaseManager.addSong({
      title: 'Hino da Glória',
      content: 'C  G  C',
      key: 'C',
      bpm: 100
    });
    expect(nova.id).toBeDefined();

    let songs = DatabaseManager.getSongs();
    expect(songs.some((s) => s.id === nova.id)).toBe(true);

    // 2. Atualizar propriedade existente (BPM)
    DatabaseManager.updateSong(nova.id, { bpm: 110 });
    const atualizada = DatabaseManager.getSongs().find((s) => s.id === nova.id);
    expect(atualizada.bpm).toBe(110);

    // 3. Excluir música
    DatabaseManager.deleteSong(nova.id);
    songs = DatabaseManager.getSongs();
    expect(songs.some((s) => s.id === nova.id)).toBe(false);
  });

  /**
   * 🎯 Objetivo: Testar a inteligência de importação antes de salvar no banco.
   * 📜 Regra do Modal de Importação:
   *   - Se o título da música importada já existir no banco (insensível a maiúsculas/minúsculas):
   *     deve marcar como isUpdate: true e associar ao existingId (para o selo 'Substituir').
   *   - Se for inédita: deve marcar como isUpdate: false (para o selo 'Nova').
   */
  it('deve analisar importação categorizando "Substituir" para títulos repetidos e "Nova" para inéditos', () => {
    const musicasExistentes = [
      { id: '1', title: 'Noites Traiçoeiras', content: 'C  G' }
    ];

    const pacoteImportado = [
      // Repetida (com diferença de caixa alta/baixa)
      { title: 'noites traiçoeiras', content: 'D  A' },
      // Inédita
      { title: 'Tão Sublime Sacramento', content: 'F  C' }
    ];

    const analise = DatabaseManager.analyzeImport(pacoteImportado, musicasExistentes);

    // 1. A primeira deve ser identificada como atualização/substituição
    expect(analise[0].isUpdate).toBe(true);
    expect(analise[0].existingId).toBe('1');

    // 2. A segunda deve ser identificada como nova adição
    expect(analise[1].isUpdate).toBe(false);
    expect(analise[1].existingId).toBeNull();
  });

  /**
   * 🎯 Objetivo: Proteger o aplicativo contra crashes por upload de arquivos malformatados.
   * 📜 Regra: Se o arquivo selecionado não for um array válido ou estiver vazio,
   *   deve retornar um array vazio sem disparar exceções não tratadas.
   */
  it('não deve quebrar a aplicação caso o JSON importado seja corrompido ou vazio', () => {
    expect(DatabaseManager.analyzeImport(null, [])).toEqual([]);
    expect(DatabaseManager.analyzeImport('texto invalido', [])).toEqual([]);
    expect(DatabaseManager.analyzeImport({}, [])).toEqual([]);
  });
});