# 🧭 Guia de Contexto & Arquitetura IA - Projeto Órgão Virtual

Este documento serve como mapa técnico e arquitetural para modelos de IA e desenvolvedores. Consulte estas diretrizes antes de propor ou refatorar qualquer código neste projeto.

---

## 🚀 1. Stack Tecnológica
- **Framework:** Svelte 5 (Runes pura: `$state`, `$derived`, `$effect`, `$props`)
- **Build Tool:** Vite (`base: './'` configurado para deploy relativo)
- **Áudio Core:** Web Audio API nativa com decodificação assíncrona de amostras `.ogg`
- **Ícones:** Lucide Svelte (`lucide-svelte`) e SVGs nativos para ícones musicais precisos
- **Estilização:** CSS Scoped por componente + variáveis globais em `app.css`

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
│   ├── App.svelte             # Componente raiz: Orquestrador de estado global e áudio
│   ├── app.css                # Variáveis CSS globais, reset e layout responsivo
│   ├── audio/                 # Núcleo de Processamento de Áudio (Vanilla JS)
│   │   ├── sampleEngine.js    # Gerencia AudioContext, buffers e síntese de acordes/teclas
│   │   └── rhythmEngine.js    # Sequenciador rítmico melódico (clock rAF + 5 vozes)
│   └── components/            # Componentes visuais (.svelte)
│       ├── Header.svelte           # Toolbar responsiva (Menu, Tom, BPM, Música + Ações)
│       ├── MainDisplay.svelte      # Visor LCD de letras e cifras
│       ├── RhythmBar.svelte        # Grupo unido (Select de Ritmo + Botão Órgão/Piano)
│       ├── PlaybackControls.svelte # Botões Play/Stop e Fase Harmônica (btn-music)
│       ├── ChordPanel.svelte       # Grade de 11 acordes (5 aux + 6 principais) com aura ativa
│       ├── PianoKeyboard.svelte    # Teclado manual interativo de 2 oitavas
│       └── Drawer.svelte           # Gaveta lateral de opções e configurações
```

---

## 🔄 3. Fluxo de Dados e Comunicação

```text
[Interação do Usuário]
   ├── Clicar no Teclado  ──> PianoKeyboard.svelte ──> sampleEngine.startPianoKey()
   ├── Escolher Acorde    ──> ChordPanel.svelte    ──> App.svelte:
   │                                                     ├── sampleEngine.playChord()
   │                                                     └── rhythmEngine.triggerChord()
   ├── Start/Stop         ──> PlaybackControls     ──> App.svelte ──> rhythmEngine / sampleEngine
   ├── Mudar Tom (Header) ──> Header.svelte        ──> App.svelte (Apenas muda o tom no display;
   │                                                               NÃO interrompe o som ativo)
   └── Mudar Fase         ──> PlaybackControls     ──> rhythmEngine.setPhase()
                                                       (Aplica a fase SOMENTE no próximo acorde)
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
  - **Atenção:** Pode receber uma string (ex: `'orgao_c3.ogg'`) OU um **array de arquivos** (ex: `['piano_c4.ogg', 'piano_e4.ogg', 'piano_g4.ogg']`) para a **Pianada** da Voz 5 do Piano.
  - `stopRhythmNotes()` corta suavemente as notas ativas do ritmo anterior com release de 200ms para evitar sobreposição suja ao trocar de acorde.

### 4.2. `rhythmEngine.js` (Sequenciador de 5 Vozes)
- **Clock via `requestAnimationFrame`:** Loop contínuo com agendamento antecipado (*lookahead* de 80ms) cruzado com o `AudioContext.currentTime` para garantir precisão rítmica imune a throttling de abas.
- **Execução One-Shot (Sem Loop no Ritmo):** O acompanhamento rítmico (Melody) toca exatamente **1 compasso** (`numSteps`) a cada disparo de acorde e finaliza suavemente. O som contínuo em loop pertence exclusivamente ao pad harmônico do órgão (`sampleEngine.playChord`).
- **Metrônomo e BPM:** Mantém o pulso visual do metrônomo piscando no botão Play no andamento definido por `bpm` enquanto a reprodução estiver ativa, calculando dinamicamente `beatDuration = 60.0 / bpm` (semínimas) e `stepDuration = beatDuration / 2` (colcheias).
- **Divisão das Vozes:**
  - `V1`: Baixo tônica (Oitava 2 fixa).
  - `V2`: Baixo sustentação / alternado (Oitava 3 fixa).
  - `V3`: Terça ou nota intermediária.
  - `V4`: Quinta ou nota intermediária.
  - `V5`: Linha melódica superior (no Órgão) ou **Pianada** (tríade simultânea no Piano).
- **Matemática do `octaveShift`:**
  - Ao calcular terças e quintas (`rootIdx + interval`), notas que cruzam o Dó recebem `Math.floor(abs / 12)` para subirem de oitava corretamente, impedindo que notas graves apareçam no meio do arpejo.
- **Regra de Troca de Fase:**
  - Chamar `setPhase(phase)` apenas atualiza o estado interno. O som em reprodução **não muda no meio do compasso**; a nova textura sonora só entra no próximo acorde disparado.
- **Ordenação dos Ritmos:**
  - `getRhythmsList()` retorna os estilos ordenados alfabeticamente (ordenação natural numérica), mantendo `"Sem ritmo"` fixo como a primeira opção.

---

## 🎨 5. Padrões de Interface e Comportamento Visual

### 5.1. `ChordPanel.svelte` (Grade de Acordes)
- **Paleta Exata:**
  - **Linha Auxiliar (5 botões):** bVII (`#788290`), VI (`#b095e6`), VII° (`#788290`), III (`#9c67d6`), II (`#788290`).
  - **Linha Principal (6 botões):** I (`#4c8ade`), VIm (`#8056d6`), IV (`#d16baf`), IIm (`#e06c6c`), V (`#e88d4f`), IIIm (`#d9aa45`).
- **Estado Ativo (Tocando):**
  - O botão **afunda e escurece** (`filter: brightness(0.68); transform: scale(0.95);`).
  - Projeta uma **aura luminosa difusa na cor do próprio botão** (`box-shadow: 0 0 24px 8px var(--btn-color);`).
- **Persistência ao Mudar de Tom:**
  - O botão ativo é mapeado pelo seu slot de grau (`activeSlot`, ex: `'main-0'`). Quando o tom muda no topo, as letras dos acordes são recalculadas, mas a tecla que estava soando **continua afundada e com a aura luminosa**, pois o som continua tocando.
- **Efeito de Repique (Repress):**
  - Clicar novamente no mesmo acorde que já está tocando dispara a animação `chordRepress`, afundando o botão brevemente (`scale(0.85)`) com pulso de luz e reiniciando o compasso no ritmo.

### 5.2. `PlaybackControls.svelte`
- **Botão Play/Stop:**
  - Parado: Azul elétrico (`#2680eb`) com aura ciano.
  - Tocando: Coral/Vermelho (`#ff5733`) com aura vermelha.
  - Metrônomo: Pisca brevemente no pulso da semínima (`bpm-blink`).
- **Botão Fase Harmônica (`btn-music`):**
  - Círculo verde-petróleo/teal sólido (`#0b8e8e`) sem badges por cima.
  - Fase 1: Ícone de colcheia individual (`♪`).
  - Fase 2: Ícone de colcheias ligadas com barra (`♫`).
  - Fase 3: Emoji `🎶` com brilho pulsante.

### 5.3. `Header.svelte` e `RhythmBar.svelte`
- **Toolbar Responsiva:**
  - No Desktop: tudo em uma linha contínua.
  - No Celular (< 680px): quebra para 2 linhas (Linha 1: Menu + Tom + BPM; Linha 2: Música + Ações).
- **Grupos Unidos (Input-Groups):**
  - O select de música e o botão `+` são colados como um único componente.
  - Ao clicar no `+`, expande para os botões de Adicionar, Editar e Excluir.
  - **Clique fora:** Qualquer clique fora do grupo recolhe os botões de volta para o `+`.
  - O select de ritmo e o botão `ÓRGÃO / PIANO` são colados sem espaço entre si.

---

## 🌟 6. Regras de Ouro - Svelte 5 (Runes)

1. **Reatividade:** Use exclusivamente `$state()`, `$derived()` e `$effect()`. Nunca use a sintaxe legada `let count = 0` (reativo) ou `$:`.
2. **Props:** Receba propriedades com desestruturação via `$props()`: `let { prop1, prop2 } = $props();`.
3. **Eventos:** Não utilize `createEventDispatcher`. Dispare callbacks passados via props: `let { onclick } = $props();` -> `onclick()`.

---

## ⚠️ Instruções Críticas para a IA
1. **Caminhos de Arquivos (`BASE_URL`):** Sempre use `import.meta.env.BASE_URL` para referenciar qualquer amostra ou arquivo JSON em `public/`.
2. **Políticas de Autoplay:** O `AudioContext` só é desbloqueado após um gesto explícito do usuário (`pointerdown`). Isso é tratado no `onMount` do `App.svelte`.
3. **Nomenclatura de Sustenidos:** Os arquivos de áudio usam sublinhado `_` no lugar de `#` (ex: `orgao_c_3.ogg` para Dó Sustenido 3).
