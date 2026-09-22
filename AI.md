# 🧭 Guia de Contexto & Arquitetura IA - Projeto Órgão Virtual

Este documento serve como mapa técnico e arquitetural para modelos de IA e desenvolvedores. Consulte estas diretrizes antes de propor ou refatorar qualquer código neste projeto.

---

## 🚀 1. Stack Tecnológica
- **Framework:** Svelte 5 (Runes pura: `$state`, `$derived`, `$effect`, `$props`)
- **Build Tool:** Vite (`base: './'` configurado para deploy relativo no GitHub Pages/servidores estáticos)
- **Áudio Core:** Web Audio API nativa com decodificação assíncrona de amostras `.ogg`
- **Ícones:** Lucide Svelte (`lucide-svelte`) para ícones de sistema e **SVGs inline nativos** para ícones musicais e de marcas (ex: GitHub)
- **Estilização:** CSS Scoped por componente + variáveis globais em `app.css` (temas Claro e Escuro)
- **Testes Unitários:** Vitest + jsdom + `@testing-library/svelte`

---

## 📁 2. Estrutura de Arquivos e Responsabilidades

```text
├── public/
│   ├── assets/audio/          # Amostras de áudio (.ogg)
│   │   ├── Orgao/             # Amostras contínuas de Órgão (C2 a B4)
│   │   ├── Strings/           # Amostras contínuas de Cordas orquestrais (C2 a B4)
│   │   ├── studio/            # Amostras percussivas/staccato para os ritmos
│   │   │   ├── Orgao/         # Órgão de estúdio (oitavas 2 a 5)
│   │   │   └── Piano/         # Piano acústico de estúdio (oitavas 2 a 6)
│   ├── styles-melody.json     # Matriz rítmica de 5 vozes (Orgao e Piano)
│   └── styles.json            # Metadados complementares de estilos
├── src/
│   ├── main.js                # Ponto de entrada (mount do Svelte 5)
│   ├── App.svelte             # Orquestrador de estado global, repertório, áudio e atalhos
│   ├── app.css                # Variáveis CSS globais, reset e layout responsivo
│   ├── audio/                 # Núcleo de Processamento de Áudio (Vanilla JS)
│   │   ├── sampleEngine.js    # Gerencia AudioContext, buffers e síntese contínua (pad)
│   │   └── rhythmEngine.js    # Sequenciador rítmico melódico (clock rAF + 5 vozes)
│   ├── utils/                 # Regras de Negócio e Utilitários Independentes
│   │   ├── textFormatter.js   # Analisador de cifras (Regex), envelopamento <b> e colagem limpa
│   │   ├── musicTheory.js     # Transposição de cifras/HTML e detecção inteligente de tom
│   │   ├── databaseManager.js # CRUD no LocalStorage e motor de análise/mesclagem JSON
│   │   └── wakeLock.js        # API Screen WakeLock (mantém a tela ativa em apresentações)
│   └── components/            # Componentes visuais (.svelte)
│       ├── Header.svelte           # Toolbar responsiva (Menu, Tom, BPM, Música + Ações)
│       ├── MainDisplay.svelte      # Visor multifunção (Cifras, Edição, Liturgia, Missa, Orações)
│       ├── RhythmBar.svelte        # Grupo unido (Select de Ritmo + Botão Órgão/Piano)
│       ├── PlaybackControls.svelte # Play/Stop, Fase Harmônica e Navegação de Cifras (◀ / ▶)
│       ├── ChordPanel.svelte       # Grade de 11 acordes (5 aux + 6 principais) com aura ativa
│       ├── PianoKeyboard.svelte    # Teclado manual interativo de 2 oitavas
│       ├── Drawer.svelte           # Gaveta lateral de opções, liturgia e configurações
│       ├── ExportModal.svelte      # Modal para seleção e download do repertório (.json)
│       ├── ImportModal.svelte      # Modal para upload e mesclagem inteligente de repertório
│       └── AboutModal.svelte       # Modal com dados da versão, créditos e link GitHub
```

---

## 🔄 3. Fluxo de Dados e Comunicação

```text
[Interação do Usuário]
   ├── Clicar no Teclado       ──> PianoKeyboard.svelte ──> sampleEngine.startPianoKey()
   ├── Escolher Acorde Livre   ──> ChordPanel.svelte    ──> App.svelte:
   │                                                          ├── sampleEngine.playChord()
   │                                                          └── rhythmEngine.triggerChord()
   ├── Clicar Cifra no Texto   ──> MainDisplay.svelte   ──> App.svelte (atualiza passo, toca som e ativa Play)
   ├── Avançar/Voltar Cifra    ──> PlaybackControls     ──> App.svelte ──> MainDisplay (auto-scroll e destaque)
   ├── Start/Stop              ──> PlaybackControls     ──> App.svelte ──> rhythmEngine / sampleEngine
   ├── Mudar Tom (Header)      ──> Header.svelte        ──> App.svelte:
   │                                                          ├── Transpõe HTML no MainDisplay
   │                                                          └── NÃO interrompe o som ativo
   ├── Mudar Fase              ──> PlaybackControls     ──> rhythmEngine.setPhase() (aplica no próximo acorde)
   ├── Alternar Conteúdo       ──> Drawer.svelte        ──> App.svelte (Muda para Liturgia/Missa/Orações)
   └── Retorno Rápido          ──> MainDisplay.svelte   ──> App.svelte (Volta em 1 toque para a música ativa)
```

---

## ⚙️ 4. Regras Críticas dos Motores de Áudio

### 4.1. `sampleEngine.js`
- **Singleton:** Mantém um único `AudioContext`, com `DynamicsCompressor` e `masterGain`.
- **Fundo Contínuo (Pad):**
  - **Fase 1:** Órgão limpo (Baixo na oitava 2 + Tríade na oitava 3).
  - **Fase 2:** Órgão + camada orquestral de **Strings** suave no fundo.
  - **Fase 3:** Órgão + Strings + oitava 4 superior adicionada (**Som Cheio**).
- **Amostras de Estúdio (`playStudioNote`):**
  - Toca os samples da pasta `public/assets/audio/studio/`.
  - Pode receber uma string (ex: `'orgao_c3.ogg'`) OU um **array de arquivos** (ex: `['piano_c4.ogg', 'piano_e4.ogg', 'piano_g4.ogg']`) para a **Pianada** da Voz 5 do Piano.
  - `stopRhythmNotes()` corta suavemente as notas ativas do ritmo anterior com release de 200ms para evitar sobreposição suja ao trocar de acorde.

### 4.2. `rhythmEngine.js` (Sequenciador de 5 Vozes)
- **Clock via `requestAnimationFrame`:** Agendamento antecipado (*lookahead* de 80ms) cruzado com o `AudioContext.currentTime` para precisão rítmica imune ao throttling de abas.
- **Execução One-Shot (Sem Loop no Ritmo):** O acompanhamento rítmico toca exatamente **1 compasso** (`numSteps`) a cada disparo de acorde e finaliza suavemente. O som contínuo em loop pertence exclusivamente ao pad harmônico do órgão (`sampleEngine.playChord`).
- **Metrônomo e BPM:** Pulso visual piscando no botão Play no andamento definido por `bpm` (`beatDuration = 60.0 / bpm`, `stepDuration = beatDuration / 2`).
- **Divisão das Vozes:**
  - `V1`: Baixo tônica (Oitava 2 fixa).
  - `V2`: Baixo sustentação / alternado (Oitava 3 fixa).
  - `V3`: Terça ou intermediária.
  - `V4`: Quinta ou intermediária.
  - `V5`: Linha melódica superior (Órgão) ou **Pianada** (tríade simultânea no Piano).
- **Matemática do `octaveShift`:**
  - Terças e quintas que cruzam o Dó recebem `Math.floor(abs / 12)` para subirem de oitava corretamente.
- **Troca de Fase:**
  - Chamar `setPhase(phase)` apenas atualiza o estado interno; o som em reprodução não muda no meio do compasso, apenas no próximo acorde disparado.

---

## 📝 5. Regras Críticas de Texto, Display e Edição

### 5.1. `MainDisplay.svelte` & A Regra de Ouro do `contenteditable`
- **Ação Svelte (`use:setupEditor`):**
  - **NUNCA faça binding reativo contínuo (`bind:innerHTML`) ou reescreva `innerHTML` via `$effect` enquanto o usuário digita.** Isso causa o bug clássico de destruição de nós do DOM e faz o cursor pular para o início da linha a cada letra digitada.
  - A inicialização do `innerHTML` em modo de edição é feita **exclusivamente na montagem** através da action `use:setupEditor`, posicionando o cursor no final do texto (`placeCaretAtEnd`).
- **Higienização de Colagem (`paste` puro):**
  - O evento `paste` é interceptado para extrair estritamente `text/plain`, usando `document.execCommand('insertText')` ou a Selection API para não herdar tags e estilos estranhos da web.
- **Formatação Automática de Cifras (`TextFormatter.js`):**
  - Executa na exibição da música e ao clicar em "Salvar".
  - Analisa linha por linha com Regex tolerante a notações brasileiras (`7M`, `m7(b5)`, `dim`, `aug`, baixos invertidos `/`).
  - Linhas com palavras de letra convencional são preservadas intactas; cifras são automaticamente envolvidas em `<b>...</b>`.
- **Modo Letra (`Tom = 'L'`):**
  - Aplica a classe `.lyrics-only`. Oculta completamente todos os `<b>` e `<strong>` (`display: none !important`), muda a tipografia para `Roboto, 16px` e adiciona `padding-bottom: 220px` para leitura confortável até o fim da página.

### 5.2. Navegação de Cifras, Destaque e Auto-Scroll (Fase 3)
- **Destaque Luminoso:** O acorde ativo recebe a classe `.chord-highlight` (amarelo luminoso no tema claro; âmbar/laranja no tema escuro).
- **Auto-Scroll Suave:** Qualquer transição de acorde (via clique no texto, botões de navegação ou atalhos) dispara `scrollIntoView({ behavior: 'smooth', block: 'center' })` para manter o acorde ativo no centro vertical do visor.
- **Atalhos de Teclado para Músicos:**
  - `Espaço`: Play / Stop.
  - `Seta Direita` (`→`): Próximo Acorde.
  - `Seta Esquerda` (`←`): Acorde Anterior.
  *(Os atalhos são desativados automaticamente se o usuário estiver digitando em inputs ou no modo de edição).*
- **Alternância de Espaço (Painel Livre vs. Repertório):**
  - **Sem música selecionada:** O `ChordPanel` (11 botões de graus) fica visível para execução livre.
  - **Com música aberta:** O `ChordPanel` se recolhe para dar altura total ao visor da música, e os botões `◀` e `▶` aparecem ao redor do Play.

### 5.3. Retorno Rápido (Quick Return) & Visualizadores
- **Visualizador de Liturgia Diária:** Incorpora o portal oficial da CNBB em `<iframe>`. No tema escuro, aplica filtro inteligente de inversão de cores (`filter: invert(0.9) hue-rotate(180deg)`) para transformar sites brancos em modo escuro sem quebrar imagens.
- **Ordinário da Missa e Orações:** Renderizados nativamente com tipografia legível e respostas do povo destacadas em verde-petróleo.
- **Barra de Retorno Rápido:** Quando o usuário está com uma música aberta e abre a Liturgia ou Orações, uma barra persistente no topo do visor permite voltar para a música em **um único clique** (`↩ Voltar para: [Nome da Música]`).

---

## 🎨 6. Padrões Visuais e Componentes

### 6.1. `ChordPanel.svelte` (Grade de Acordes)
- **Paleta Exata:**
  - **Linha Auxiliar (5 botões):** bVII (`#788290`), VI (`#b095e6`), VII° (`#788290`), III (`#9c67d6`), II (`#788290`).
  - **Linha Principal (6 botões):** I (`#4c8ade`), VIm (`#8056d6`), IV (`#d16baf`), IIm (`#e06c6c`), V (`#e88d4f`), IIIm (`#d9aa45`).
- **Estado Ativo:** O botão afunda e escurece (`filter: brightness(0.68); transform: scale(0.95);`) com aura difusa na cor do próprio botão (`box-shadow: 0 0 24px 8px var(--btn-color);`).

### 6.2. `PlaybackControls.svelte`
- **Play/Stop:** Parado em azul elétrico (`#2680eb`); Tocando em coral/vermelho (`#ff5733`).
- **Fase Harmônica (`btn-music`):** Círculo teal sólido (`#0b8e8e`). Fase 1: `♪`; Fase 2: `♫`; Fase 3: `🎶` com brilho pulsante.

### 6.3. Modais de Backup (`ExportModal` e `ImportModal`)
- **Exportação:** Seleção múltipla com "Selecionar Tudo" e download de `repertorio_AAAA-MM-DD.json`.
- **Importação:** Leitura assíncrona com FileReader e categorização automática:
  - Badge Amarelo **"Substituir"**: Quando o título já existe no repertório.
  - Badge Verde **"Nova"**: Para músicas inéditas.
- **WakeLock (`wakeLock.js`):** Ativado no primeiro toque do usuário (`pointerdown`), impedindo que a tela do dispositivo móvel apague no meio de uma apresentação.

---

## 🌟 7. Regras de Ouro - Svelte 5 (Runes)

1. **Reatividade:** Use exclusivamente `$state()`, `$derived()` e `$effect()`. **Nunca use** a sintaxe legada `let count = 0` reativa ou `$:` do Svelte 3/4.
2. **Props:** Receba propriedades com desestruturação via `$props()`: `let { prop1, prop2 } = $props();`.
3. **Eventos:** Não utilize `createEventDispatcher`. Dispare callbacks passados via props: `let { onclick } = $props();` -> `onclick()`.
4. **Isolamento de Efeitos:** Se precisar ler uma variável dentro de um `$effect` sem criar dependência reativa indesejada, utilize `untrack(() => variavel)`.

---

## ⚠️ Instruções Críticas para a IA
1. **Ícones de Marcas (Lucide):** O `lucide-svelte` **NÃO CONTÉM ÍCONES DE MARCAS** (como `Github`, `Twitter`, etc.). Sempre utilize SVGs nativos inline para logos de marcas comerciais.
2. **Caminhos de Arquivos (`BASE_URL`):** Sempre use `import.meta.env.BASE_URL` para referenciar qualquer amostra ou arquivo JSON em `public/`.
3. **Políticas de Autoplay:** O `AudioContext` só é desbloqueado após um gesto explícito do usuário (`pointerdown`), tratado no `onMount` do `App.svelte`.
4. **Nomenclatura de Sustenidos:** Os arquivos de áudio usam sublinhado `_` no lugar de `#` (ex: `orgao_c_3.ogg` para Dó Sustenido 3).
5. **Transposição Dinâmica:** Mudar o tom no Header durante o modo de leitura deve transpor imediatamente os acordes `<b>` exibidos na tela através do `MusicTheory.transposeHtmlContent()`.