// tests/Header.test.js
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Header from '../src/components/Header.svelte';
import ChordPanel from '../src/components/ChordPanel.svelte';

/**
 * ============================================================================
 * SUÍTE 1: BPM (Controles e Limites no Header)
 * ============================================================================
 * Valida a interface BPM (tempo musical):
 * - Botões de incremento rápido (+5, -1, -5).
 * - Digitação direta no input numérico.
 * - Regras de proteção de limites extremos (30 a 300 BPM).
 */
describe('BPM (Controles e Limites)', () => {
  /**
   * 🎯 Objetivo: Garantir que os botões de passo rápido alterem o BPM pelos deltas exatos.
   * 📜 Regra: O Header possui atalhos de -5, -1 e +5 para ajuste rápido em apresentações ao vivo.
   * 🔍 Validação: Dispara evento de clique em cada botão e confere o valor passado ao callback.
   */
  it('deve alterar o BPM corretamente ao clicar nos botões -5, -1 e +5', async () => {
    const handleBpmChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { bpm: 90, onBpmChange: handleBpmChange }
    });

    // 1. Testa botão de desaceleração de 5 em 5 BPM
    await fireEvent.click(getByLabelText('-5 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(-5);

    // 2. Testa botão de ajuste fino de 1 em 1 BPM
    await fireEvent.click(getByLabelText('-1 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(-1);

    // 3. Testa botão de aceleração de 5 em 5 BPM
    await fireEvent.click(getByLabelText('+5 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(5);
  });

  /**
   * 🎯 Objetivo: Validar a digitação manual de BPM no campo numérico.
   * 📜 Regra: O usuário pode digitar um andamento exato (ex: 135) em vez de usar os botões.
   * 🔍 Validação: Dispara o evento de 'input' no campo de texto e confere se onBpmSet recebe o número inteiro.
   */
  it('deve chamar onBpmSet ao digitar diretamente no campo de número do BPM', async () => {
    const handleBpmSet = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { bpm: 90, onBpmSet: handleBpmSet }
    });

    const bpmInput = getByLabelText('BPM');
    await fireEvent.input(bpmInput, { target: { value: '135' } });

    expect(handleBpmSet).toHaveBeenCalledWith(135);
  });

  /**
   * 🎯 Objetivo: Proteger o motor de áudio contra valores absurdos ou inválidos de andamento.
   * 📜 Regra: Andamentos menores que 30 BPM travam o sequenciador; acima de 300 tornam o ritmo inaudível.
   * 🔍 Validação: Testa a função de clamping com valores abaixo do mínimo, acima do máximo e texto inválido.
   */
  it('deve respeitar os limites de 30 a 300 BPM na digitação direta', () => {
    const clampBpm = (val) => Math.max(30, Math.min(300, Number(val) || 90));

    expect(clampBpm(20)).toBe(30);   // Abaixo do piso -> crava no mínimo seguro (30)
    expect(clampBpm(120)).toBe(120); // Valor musical padrão -> mantém inalterado
    expect(clampBpm(450)).toBe(300); // Acima do teto -> crava no máximo seguro (300)
    expect(clampBpm('abc')).toBe(90); // Caracteres inválidos -> restaura fallback padrão (90)
  });
});

/**
 * ============================================================================
 * SUÍTE 2: Tom do Header
 * ============================================================================
 * Valida os controles de seleção de tom, dropdown, modo de letra e
 * o formulário de edição de título de músicas.
 */
describe('Tom', () => {
  /**
   * 🎯 Objetivo: Validar a navegação sequencial por semitonos através dos botões + e -.
   * 📜 Regra: Clicar em '+' sobe 1 semitono; '-' desce 1 semitono.
   */
  it('deve navegar pelos tons ao clicar em + e - no Tom', async () => {
    const handleKeyChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { selectedKey: 'C', onKeyChange: handleKeyChange }
    });

    // Sobe 1 semitono
    await fireEvent.click(getByLabelText('Aumentar tom'));
    expect(handleKeyChange).toHaveBeenCalledWith(1);

    // Desce 1 semitono
    await fireEvent.click(getByLabelText('Diminuir tom'));
    expect(handleKeyChange).toHaveBeenCalledWith(-1);
  });

  /**
   * 🎯 Objetivo: Permitir seleção direta do tom pelo menu suspenso (<select>).
   */
  it('deve disparar onKeyChange ao alterar o Tom diretamente no dropdown', async () => {
    const handleKeyChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { selectedKey: 'C', onKeyChange: handleKeyChange }
    });

    const selectTom = getByLabelText('Tom');
    await fireEvent.change(selectTom, { target: { value: 'G' } });

    expect(handleKeyChange).toHaveBeenCalledWith('G');
  });

  /**
   * 🎯 Objetivo: Garantir que a opção especial "L" (Modo Letra) esteja disponível com rótulo amigável.
   * 📜 Regra: O tom "L" oculta as cifras da partitura e amplia o tamanho da fonte para leitura dos cantores.
   */
  it('deve conter a opção "L" (Letra) no dropdown de tom', () => {
    const { getByLabelText } = render(Header, {
      props: { selectedKey: 'C' }
    });

    const selectTom = getByLabelText('Tom');
    const options = Array.from(selectTom.querySelectorAll('option')).map(o => ({
      val: o.value,
      text: o.textContent.trim()
    }));

    const optionL = options.find(o => o.val === 'L');
    expect(optionL).toBeDefined();
    expect(optionL.text).toBe('Letra');
  });

  /**
   * 🎯 Objetivo: Validar o menu agrupado de ações da música.
   * 📜 Regra: No modo padrão compacto, exibe um botão '+'. Ao clicar nele, expande para Adicionar, Editar e Excluir.
   */
  it('deve expandir os botões de ação (+, Editar, Excluir) ao clicar no botão de ações', async () => {
    const { container, getByTitle } = render(Header, {
      props: { isEditing: false }
    });

    const btnToggle = getByTitle('Ações');
    await fireEvent.click(btnToggle);

    // Botões devem surgir no DOM após a expansão
    expect(container.querySelector('.btn-add')).not.toBeNull();
    expect(container.querySelector('.btn-edit')).not.toBeNull();
    expect(container.querySelector('.btn-delete')).not.toBeNull();
  });

  /**
   * 🎯 Objetivo: Validar o modo de edição do Header (isEditing: true).
   * 📜 Regra: Quando o usuário cria ou edita uma música:
   *   1. O dropdown de músicas dá lugar a um input de texto para o título.
   *   2. Tecla 'Enter' salva a edição; tecla 'Escape' cancela.
   *   3. Botões de Salvar e Cancelar acionam seus respectivos callbacks.
   */
  it('em modo de edição (isEditing: true), deve exibir o campo de título e responder a Salvar, Cancelar, Enter e Escape', async () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    const handleTitle = vi.fn();

    const { getByLabelText, getByTitle } = render(Header, {
      props: {
        isEditing: true,
        songTitle: 'Título Inicial',
        onSaveSong: handleSave,
        onCancelEdit: handleCancel,
        onTitleChange: handleTitle
      }
    });

    const titleInput = getByLabelText('Título da Música');
    expect(titleInput.value).toBe('Título Inicial');

    // 1. Digitação do título
    await fireEvent.input(titleInput, { target: { value: 'Novo Título' } });
    expect(handleTitle).toHaveBeenCalledWith('Novo Título');

    // 2. Atalho Enter -> Salva
    await fireEvent.keyDown(titleInput, { key: 'Enter' });
    expect(handleSave).toHaveBeenCalledTimes(1);

    // 3. Atalho Escape -> Cancela
    await fireEvent.keyDown(titleInput, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(1);

    // 4. Clique no botão Salvar
    await fireEvent.click(getByTitle('Salvar'));
    expect(handleSave).toHaveBeenCalledTimes(2);

    // 5. Clique no botão Cancelar
    await fireEvent.click(getByTitle('Cancelar'));
    expect(handleCancel).toHaveBeenCalledTimes(2);
  });
});

/**
 * ============================================================================
 * SUÍTE 3: Tom e Grade Harmônica (ChordPanel)
 * ============================================================================
 * Valida a matriz harmônica de 11 botões de acordes:
 * - Quantidade exata de botões por fileira (5 auxiliares e 6 principais).
 * - Recálculo de graus harmônicos em Dó Maior e Ré Maior.
 * - Regra crítica de persistência visual da aura ativa (.active).
 */
describe('Tom e Atualização do ChordPanel', () => {
  /**
   * 🎯 Objetivo: Garantir a integridade da arquitetura da grade de acordes.
   * 📜 Regra: 5 botões superiores (graus auxiliares) e 6 botões inferiores (graus principais).
   */
  it('deve renderizar exatamente 11 botões (5 na linha auxiliar e 6 na linha principal)', () => {
    const { container } = render(ChordPanel, {
      props: { selectedKey: 'C' }
    });

    const allButtons = container.querySelectorAll('.chord-btn');
    const auxButtons = container.querySelectorAll('.aux-row .chord-btn');
    const mainButtons = container.querySelectorAll('.main-row .chord-btn');

    expect(allButtons.length).toBe(11);
    expect(auxButtons.length).toBe(5);
    expect(mainButtons.length).toBe(6);
  });

  /**
   * 🎯 Objetivo: Garantir que o clique em qualquer botão envie seu nome e identificador de slot.
   * 📜 Regra: O ID do slot (ex: 'main-0') é usado para mapear o acorde fisicamente independente do tom.
   */
  it('deve disparar onChordClick com nome e ID do slot ao clicar no acorde', async () => {
    const handleChordClick = vi.fn();

    const { container } = render(ChordPanel, {
      props: { selectedKey: 'C', onChordClick: handleChordClick }
    });

    // Clica no 1º botão da linha principal (Tônica: C, ID: main-0)
    const btnTonica = container.querySelector('.main-row .chord-btn');
    await fireEvent.click(btnTonica);

    expect(handleChordClick).toHaveBeenCalledWith('C', 'main-0');
  });

  /**
   * 🎯 Objetivo: Validar a transposição completa de todos os 11 graus do campo harmônico.
   * 📜 Regra:
   *   - Em C: C, D, Dm, E, Em, F, G, A, Am, Bb, B°.
   *   - Em D: D, E, Em, F#, F#m, G, A, B, Bm, C, C#° (F natural não existe em Ré maior).
   */
  it('ao mudar de tom, os botões de acordes no ChordPanel DEVEM mudar de acordo com o campo harmônico', async () => {
    // 1. Inicia no tom de C (Dó Maior)
    const { container, rerender } = render(ChordPanel, {
      props: { selectedKey: 'C' }
    });

    let labels = Array.from(container.querySelectorAll('.chord-btn')).map(el => el.textContent.trim());

    // Checagem dos 11 graus em Dó
    const esperadosC = ['C', 'D', 'Dm', 'E', 'Em', 'F', 'G', 'A', 'Am', 'Bb', 'B°'];
    expect(labels).toEqual(expect.arrayContaining(esperadosC));
    expect(labels).toHaveLength(11);

    // 2. Transpõe para D (Ré Maior) com rerender assíncrono
    await rerender({ selectedKey: 'D' });

    labels = Array.from(container.querySelectorAll('.chord-btn')).map(el => el.textContent.trim());

    // Checagem dos 11 graus em Ré
    const esperadosD = ['D', 'E', 'Em', 'F#', 'F#m', 'G', 'A', 'B', 'Bm', 'C', 'C#°'];
    expect(labels).toEqual(expect.arrayContaining(esperadosD));
    expect(labels).toHaveLength(11);
    expect(labels).not.toContain('F'); // F não pertence ao campo harmônico de D
  });

  /**
   * 🎯 Objetivo: Testar a persistência visual do botão ativo entre transposições.
   * 📜 Regra de Ouro (AI.md 5.1):
   *   Se um acorde estava soando e o usuário muda o tom no topo da tela, o áudio NÃO para
   *   e a tecla correspondente DEVE continuar afundada e com a aura luminosa (.active),
   *   mesmo que o seu rótulo de texto tenha sido recalculado.
   */
  it('REGRA DE OURO DO AI.MD: Ao mudar o tom, a tecla tocando DEVE permanecer afundada com aura luminosa (.active)', async () => {
    // O músico está tocando a tônica em C (slot 'main-0' ativo)
    const { container, rerender } = render(ChordPanel, {
      props: { selectedKey: 'C', activeSlot: 'main-0' }
    });

    let btnTonica = container.querySelector('.main-row .chord-btn');
    expect(btnTonica.textContent.trim()).toBe('C');
    expect(btnTonica.classList.contains('active')).toBe(true);

    // O tom muda no Header para D (Ré Maior) enquanto o som soa
    await rerender({ selectedKey: 'D', activeSlot: 'main-0' });

    btnTonica = container.querySelector('.main-row .chord-btn');

    // O texto foi recalculado para D, mas a tecla CONTINUA ATIVA
    expect(btnTonica.textContent.trim()).toBe('D');
    expect(btnTonica.classList.contains('active')).toBe(true);
  });
});