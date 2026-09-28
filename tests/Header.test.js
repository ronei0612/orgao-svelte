// tests/Header.test.js
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Header from '../src/components/Header.svelte';
import ChordPanel from '../src/components/ChordPanel.svelte';

describe('BPM (Controles e Limites)', () => {
  it('deve alterar o BPM corretamente ao clicar nos botões -5, -1 e +5', async () => {
    const handleBpmChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { bpm: 90, onBpmChange: handleBpmChange }
    });

    await fireEvent.click(getByLabelText('-5 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(-5);

    await fireEvent.click(getByLabelText('-1 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(-1);

    await fireEvent.click(getByLabelText('+5 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(5);
  });

  it('deve chamar onBpmSet ao digitar diretamente no campo de número do BPM', async () => {
    const handleBpmSet = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { bpm: 90, onBpmSet: handleBpmSet }
    });

    const bpmInput = getByLabelText('BPM');
    await fireEvent.input(bpmInput, { target: { value: '135' } });

    expect(handleBpmSet).toHaveBeenCalledWith(135);
  });

  it('deve respeitar os limites de 30 a 300 BPM na digitação direta', () => {
    const clampBpm = (val) => Math.max(30, Math.min(300, Number(val) || 90));

    expect(clampBpm(20)).toBe(30);
    expect(clampBpm(120)).toBe(120);
    expect(clampBpm(450)).toBe(300);
    expect(clampBpm('abc')).toBe(90);
  });
});

describe('Tom', () => {
  it('deve navegar pelos tons ao clicar em + e - no Tom', async () => {
    const handleKeyChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { selectedKey: 'C', onKeyChange: handleKeyChange }
    });

    await fireEvent.click(getByLabelText('Aumentar tom'));
    expect(handleKeyChange).toHaveBeenCalledWith(1);

    await fireEvent.click(getByLabelText('Diminuir tom'));
    expect(handleKeyChange).toHaveBeenCalledWith(-1);
  });

  it('deve disparar onKeyChange ao alterar o Tom diretamente no dropdown', async () => {
    const handleKeyChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { selectedKey: 'C', onKeyChange: handleKeyChange }
    });

    const selectTom = getByLabelText('Tom');
    await fireEvent.change(selectTom, { target: { value: 'G' } });

    expect(handleKeyChange).toHaveBeenCalledWith('G');
  });

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

  it('deve expandir os botões de ação (+, Editar, Excluir) ao clicar no botão de ações', async () => {
    const { container, getByTitle } = render(Header, {
      props: { isEditing: false }
    });

    const btnToggle = getByTitle('Ações');
    await fireEvent.click(btnToggle);

    expect(container.querySelector('.btn-add')).not.toBeNull();
    expect(container.querySelector('.btn-edit')).not.toBeNull();
    expect(container.querySelector('.btn-delete')).not.toBeNull();
  });

  it('em modo de edição (isEditing: true), deve exibir o campo de título e abrir modais de confirmação Sim/Não ao Salvar e Cancelar', async () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    const handleTitle = vi.fn();

    const { getByLabelText, getByTitle, getByRole } = render(Header, {
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

    // 2. Clique no botão Salvar -> Abre modal e confirma clicando em "Sim"
    await fireEvent.click(getByTitle('Salvar'));
    const btnConfirmSave = getByRole('button', { name: 'Sim' });
    await fireEvent.click(btnConfirmSave);
    expect(handleSave).toHaveBeenCalledTimes(1);

    // 3. Clique no botão Cancelar -> Abre modal e confirma clicando em "Sim"
    await fireEvent.click(getByTitle('Cancelar'));
    const btnConfirmCancel = getByRole('button', { name: 'Sim' });
    await fireEvent.click(btnConfirmCancel);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});

describe('Tom e Atualização do ChordPanel', () => {
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

  it('deve disparar onChordClick com nome e ID do slot ao clicar no acorde', async () => {
    const handleChordClick = vi.fn();

    const { container } = render(ChordPanel, {
      props: { selectedKey: 'C', onChordClick: handleChordClick }
    });

    const btnTonica = container.querySelector('.main-row .chord-btn');
    await fireEvent.click(btnTonica);

    expect(handleChordClick).toHaveBeenCalledWith('C', 'main-0');
  });

  it('ao mudar de tom, os botões de acordes no ChordPanel DEVEM mudar de acordo com o campo harmônico', async () => {
    const { container, rerender } = render(ChordPanel, {
      props: { selectedKey: 'C' }
    });

    let labels = Array.from(container.querySelectorAll('.chord-btn')).map(el => el.textContent.trim());
    const esperadosC = ['C', 'D', 'Dm', 'E', 'Em', 'F', 'G', 'A', 'Am', 'Bb', 'B°'];
    expect(labels).toEqual(expect.arrayContaining(esperadosC));
    expect(labels).toHaveLength(11);

    await rerender({ selectedKey: 'D' });

    labels = Array.from(container.querySelectorAll('.chord-btn')).map(el => el.textContent.trim());
    const esperadosD = ['D', 'E', 'Em', 'F#', 'F#m', 'G', 'A', 'B', 'Bm', 'C', 'C#°'];
    expect(labels).toEqual(expect.arrayContaining(esperadosD));
    expect(labels).toHaveLength(11);
    expect(labels).not.toContain('F');
  });

  it('REGRA DE OURO DO AI.MD: Ao mudar o tom, a tecla tocando DEVE permanecer afundada com aura luminosa (.active)', async () => {
    const { container, rerender } = render(ChordPanel, {
      props: { selectedKey: 'C', activeSlot: 'main-0' }
    });

    let btnTonica = container.querySelector('.main-row .chord-btn');
    expect(btnTonica.textContent.trim()).toBe('C');
    expect(btnTonica.classList.contains('active')).toBe(true);

    await rerender({ selectedKey: 'D', activeSlot: 'main-0' });

    btnTonica = container.querySelector('.main-row .chord-btn');
    expect(btnTonica.textContent.trim()).toBe('D');
    expect(btnTonica.classList.contains('active')).toBe(true);
  });
});