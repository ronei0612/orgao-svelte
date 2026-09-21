# Contexto para IA - Orgao Svelte

Este documento fornece informações essenciais sobre a arquitetura e funcionamento do projeto para auxiliar modelos de IA no desenvolvimento e manutenção.

## 🚀 Tecnologias Principais
- **Framework:** Svelte 5 (Stable)
- **Build Tool:** Vite
- **Áudio:** Web Audio API (Amostras em `.ogg`)
- **Estilização:** CSS puro / Svelte components
- **Ícones:** Lucide Svelte

## 📂 Estrutura de Pastas Chave
- `src/audio/`: Core da lógica de som.
  - `sampleEngine.js`: Gerencia o `AudioContext`, carregamento de buffers e reprodução de notas/acordes sustentados (loop).
  - `rhythmEngine.js`: Gerenciador de sequenciamento rítmico (estilos). Controla o BPM e o disparo de vozes harmônicas.
- `src/components/`: Componentes de UI modulares.
- `public/assets/audio/Orgao/`: Onde residem os samples (notas de C2 a B4).

## 🛠 Arquitetura de Áudio e Estado
### 1. Svelte 5 Runes
O projeto utiliza **Svelte 5**. Ao editar componentes:
- Use `$state()` para reatividade.
- Use `$derived()` para valores computados.
- Use `$effect()` para efeitos colaterais.

### 2. Motor de Som (SampleEngine)
- As amostras são mapeadas para arquivos `.ogg` seguindo o padrão `orgao_{nota}{oitava}.ogg` (ex: `orgao_c_2.ogg` para Dó Sustenido oitava 2).
- Os acordes são formados dinamicamente com base em intervalos (maior, menor, 7ª, etc.).
- **Modos de reprodução:**
  - `playChord`: Som contínuo (loop) com ataque e release suaves.
  - `startPianoKey`: Para interação nota a nota no teclado.

### 3. Motor de Ritmo (RhythmEngine)
- Funciona como um sequenciador de colcheias.
- Utiliza um `requestAnimationFrame` para agendar notas com precisão milimétrica, evitando drift de tempo comum no `setInterval`.
- Os ritmos são carregados de um `styles-melody.json` ou usam um `DEFAULT_RHYTHMS` como fallback.
- Cada ritmo possui 5 vozes (V1/V2: Baixos, V3-V5: Harmonia).

## 🎹 Convenções de Música no Código
- **Notas:** `C, C#, D, D#, E, F, F#, G, G#, A, A#, B`.
- **Enarmonia:** O sistema normaliza bemóis para sustenidos internamente (ex: Eb -> D#).
- **Fases (musicPhase):** 
  - `1`: Básico.
  - `2`: Adiciona mais brilho/vozes (planejado).
  - `3`: Som cheio (adiciona oitava 4).

## 📝 Instruções para a IA
1. **Adição de Ritmos:** Para adicionar novos ritmos, edite o `styles-melody.json` seguindo a estrutura de matriz de vozes (0 = silêncio, 1 = forte, 2 = fraco).
2. **Reatividade:** Ao manipular variáveis no `App.svelte`, lembre-se que elas são `$state`.
3. **Áudio Context:** O `AudioContext` só pode ser iniciado após uma interação do usuário (`pointerdown`). Isso já é tratado no `onMount` do `App.svelte`.
4. **Caminhos de Arquivos:** Sempre use `import.meta.env.BASE_URL` para referenciar arquivos na pasta `public`, garantindo compatibilidade com o deploy em subpastas (como GitHub Pages).

## ⚠️ Pontos de Atenção
- O arquivo `sampleEngine.js` espera 36 amostras específicas (12 notas x 3 oitavas: 2, 3 e 4).
- O `rhythmEngine` depende do `sampleEngine` para tocar os sons via `playOneShot`.
