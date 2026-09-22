/**
 * src/utils/textFormatter.js
 * Processador de texto e cifras:
 * - Detecta linhas de acordes e envolve cada cifra em <b>...</b>
 * - Suporta notações brasileiras e internacionais (ex: C7M, F#m7, Am/G, C°).
 * - Higieniza colagens e quebras de linha.
 */

export class TextFormatter {
  // Regex expandida para cobrir acordes simples, extensões e baixos invertidos
  static chordRegex = /^[CDEFGAB][#b]?(?:m|M|maj|dim|aug|sus|add)?\d*(?:M|\+|°|º|-)?(?:\(?[#b+-]?(?:\d+|b5|9|11|13)\)?)?(?:\/[CDEFGAB][#b]?)?$/;
  static exceptions = ['intro', 'solo', 'refrão', 'refrao', 'ponte', 'bis', 'pausa', 'fim', 'coda'];

  /**
   * Verifica se uma linha inteira é composta prioritariamente por acordes
   */
  static isChordLine(lineText) {
    if (!lineText || lineText.trim() === '') return false;
    const tokens = lineText.trim().split(/\s+/);

    let hasChord = false;
    for (const token of tokens) {
      const clean = token.toLowerCase().replace(/[()[\]:,|]/g, '');
      if (clean === '') continue;

      if (this.chordRegex.test(token)) {
        hasChord = true;
      } else if (!this.exceptions.includes(clean) && !/^\d+x$/i.test(clean)) {
        // Se encontrar uma palavra comum de letra (ex: "Senhor", "Amor"), não é linha de cifra
        return false;
      }
    }
    return hasChord;
  }

  /**
   * Prepara e formata o conteúdo textual para exibição com <b> nas cifras
   */
  static prepareContent(content) {
    if (!content) return '';

    // Normaliza quebras de linha para <br> se for texto puro
    let htmlContent = content.includes('\n') ? content.replace(/\r?\n/g, '<br>') : content;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    this.autoFormatChords(tempDiv);
    return tempDiv.innerHTML;
  }

  /**
   * Varre os nós do DOM envolvendo os acordes em <b>
   */
  static autoFormatChords(root) {
    // 1. Remove tags <b> antigas para evitar duplicação em edições sucessivas
    const existingBold = root.querySelectorAll('b, strong');
    existingBold.forEach((b) => {
      const fragment = document.createDocumentFragment();
      while (b.firstChild) fragment.appendChild(b.firstChild);
      b.parentNode.replaceChild(fragment, b);
    });

    let currentLineNodes = [];
    let currentLineText = '';

    const processLine = () => {
      if (this.isChordLine(currentLineText)) {
        currentLineNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.nodeValue.split(/(\s+)/);
            const fragment = document.createDocumentFragment();

            parts.forEach((part) => {
              if (part.trim() !== '' && this.chordRegex.test(part)) {
                const b = document.createElement('b');
                b.textContent = part;
                fragment.appendChild(b);
              } else {
                fragment.appendChild(document.createTextNode(part));
              }
            });
            node.parentNode.replaceChild(fragment, node);
          }
        });
      }
      currentLineNodes = [];
      currentLineText = '';
    };

    const walk = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (['B', 'STRONG'].includes(node.tagName)) return;

        const isBlock = ['DIV', 'P', 'BR', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.tagName);
        if (isBlock) processLine();

        Array.from(node.childNodes).forEach(walk);
        if (isBlock) processLine();
      } else if (node.nodeType === Node.TEXT_NODE) {
        currentLineNodes.push(node);
        currentLineText += node.nodeValue;
      }
    };

    walk(root);
    processLine();
  }

  /**
   * Extrai o conteúdo do contenteditable e formata antes de salvar
   */
  static processEditorData(rootElement) {
    if (!rootElement) return '';
    const clone = rootElement.cloneNode(true);
    this.autoFormatChords(clone);
    return clone.innerHTML;
  }
}