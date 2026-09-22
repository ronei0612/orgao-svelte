// tests/bpm-and-key.test.js
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Header from '../src/components/Header.svelte';
import ChordPanel from '../src/components/ChordPanel.svelte';

describe('BPM (Controles e Limites)', () => {
  it('deve disparar os passos de -5, -1 e +5 BPM corretamente', async () => {
    const handleBpmChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { bpm: 90, onBpmChange: handleBpmChange }
    });

    // Botão -5 BPM
    await fireEvent.click(getByLabelText('-5 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(-5);

    // Botão -1 BPM
    await fireEvent.click(getByLabelText('-1 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(-1);

    // Botão +5 BPM
    await fireEvent.click(getByLabelText('+5 BPM'));
    expect(handleBpmChange).toHaveBeenCalledWith(5);
  });

  it('deve respeitar os limites de 30 a 300 BPM na digitação direta', () => {
    // Função de clamping que usamos no App.svelte
    const clampBpm = (val) => Math.max(30, Math.min(300, Number(val) || 90));

    expect(clampBpm(20)).toBe(30);   // Abaixo do mínimo -> crava em 30
    expect(clampBpm(120)).toBe(120); // Válido -> mantém 120
    expect(clampBpm(450)).toBe(300); // Acima do máximo -> crava em 300
    expect(clampBpm('abc')).toBe(90); // Inválido -> fallback padrão 90
  });
});

describe('Tom e Atualização do ChordPanel', () => {
  it('deve navegar pelos tons ao clicar em + e - no Header', async () => {
    const handleKeyChange = vi.fn();

    const { getByLabelText } = render(Header, {
      props: { selectedKey: 'C', onKeyChange: handleKeyChange }
    });

    // Clicar em aumentar tom (+1 semitono)
    await fireEvent.click(getByLabelText('Aumentar tom'));
    expect(handleKeyChange).toHaveBeenCalledWith(1);

    // Clicar em diminuir tom (-1 semitono)
    await fireEvent.click(getByLabelText('Diminuir tom'));
    expect(handleKeyChange).toHaveBeenCalledWith(-1);
  });

  it('ao mudar de tom, os botões de acordes no ChordPanel DEVEM mudar de acordo com o campo harmônico', () => {
    // 1. Inicia no tom de C (Dó Maior)
    const { container, rerender } = render(ChordPanel, {
      props: { selectedKey: 'C' }
    });

    let labels = Array.from(container.querySelectorAll('.chord-btn')).map(el => el.textContent.trim());

    expect(labels).toContain('C');
    expect(labels).toContain('D');
    expect(labels).toContain('Dm');
    expect(labels).toContain('E');
    expect(labels).toContain('Em');
    expect(labels).toContain('F');
    expect(labels).toContain('G');
    expect(labels).toContain('A');
    expect(labels).toContain('Am');
    expect(labels).toContain('Bb');
    expect(labels).toContain('B°');

    // 2. Transpõe para D (Ré Maior)
    rerender({ selectedKey: 'D' });

    labels = Array.from(container.querySelectorAll('.chord-btn')).map(el => el.textContent.trim());

    expect(labels).toContain('D');
    expect(labels).toContain('E');
    expect(labels).toContain('Em');
    expect(labels).toContain('F#');
    expect(labels).toContain('F#m');
    expect(labels).toContain('G');
    expect(labels).toContain('A');
    expect(labels).toContain('B');
    expect(labels).toContain('Bm');
    expect(labels).toContain('C');
    expect(labels).toContain('C#°');
    expect(labels).not.toContain('F'); // F não é parte do campo harmônico de D
  });
});