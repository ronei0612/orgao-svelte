# 🧭 Guia de Contexto & Arquitetura IA - Projeto Órgão Virtual

Este documento serve como referência técnica e arquitetural para modelos de IA e desenvolvedores. Consulte estas diretrizes antes de propor ou refatorar qualquer código.

---

## 🚀 1. Stack Tecnológica
- **Framework:** Svelte 5 (Runes pura: `$state`, `$derived`, `$effect`, `$props`)
- **Build Tool / Bundler:** Vite
- **Áudio Core:** Web Audio API nativa com decodificação de amostras `.ogg`
- **Ícones:** Lucide Svelte (`lucide-svelte`)
- **Estilização:** CSS Scoped por componente + CSS Variables globais em `app.css`

---

## 📁 2. Estrutura de Arquivos e Responsabilidades

```text
├── public/
│   ├── assets/audio/          # Bancos de amostras de áudio (.ogg)
│   │   ├── Orgao/             # Amostras principais (C2 a B4)
│   │   ├── Epiano/            # Piano elétrico (oitavas e variações)
│   │   ├── Strings/           # Cordas contínuas
│   │   ├── Percussao/         # Chimes, pratos
│   │   └── studio/            # Kits de Bateria (Drums), Baixos, Flauta e Piano
│   ├── styles-melody.json     # Padrões rítmicos e matriz de vozes melódicas
│   └── styles.json            # Metadados complementares de estilos
├── src/
│   ├── main.js                # Bootstrap da aplicação (mount do Svelte 5)
│   ├── App.svelte             # Componente raiz: Orquestrador global de estado e áudio
│   ├── app.css                # Variáveis CSS globais, reset e temas (Light/Dark)
│   ├── audio/                 # Núcleo de Processamento de Áudio (Vanilla JS)
│   │   ├── sampleEngine.js    # Gerencia AudioContext, cache de AudioBuffers e vozes
│   │   ├── rhythmEngine.js    # Sequenciador rítmico de alta precisão (clock rAF)
│   │   └── organAudio.js      # Utilitários complementares / legado de síntese
│   └── components/            # Componentes de Interface (.svelte)
│       ├── Header.svelte           # Barra superior com branding e controles rápidos
│       ├── MainDisplay.svelte      # Display LCD/digital (Acorde atual, BPM, compasso)
│       ├── RhythmBar.svelte        # Seletor de ritmos/estilos e visualizador de compasso
│       ├── PlaybackControls.svelte # Botões de Start/Stop, Synchro, Tap Tempo, Slider BPM
│       ├── ChordPanel.svelte       # Matriz de botões de acordes para acompanhamento
│       ├── PianoKeyboard.svelte    # Teclado interativo de piano (execução manual)
│       └── Drawer.svelte           # Gaveta lateral de opções, timbres e configurações
```

---

## 🔄 3. Fluxo de Dados e Comunicação

```text
[Interação do Usuário]
   ├── Clicar no Teclado  ──> PianoKeyboard.svelte ──(event)──> App.svelte ──> sampleEngine.startPianoKey()
   ├── Escolher Acorde    ──> ChordPanel.svelte    ──(event)──> App.svelte ──> rhythmEngine.setChord()
   └── Start/Stop Ritmo   ──> PlaybackControls     ──(event)──> App.svelte ──> rhythmEngine.start()/stop()
                                                                   │
                                                                   ▼
                                                            rhythmEngine.js (Clock rAF)
                                                                   │ (disparo em tempo exato)
                                                                   ▼
                                                            sampleEngine.js
                                                            (playOneShot / playChord)
                                                                   │
                                                                   ▼
                                                          [Web Audio Destination]
```

---

## ⚙️ 4. Arquitetura dos Motores de Áudio (`src/audio/`)

### 4.1. `sampleEngine.js` (Gerenciador de Amostras)
- **Instância Singleton:** Mantém um único `AudioContext` compartilhado.
- **Cache de Buffers:** Carrega os arquivos `.ogg` sob demanda ou pré-carregados via `fetch` + `decodeAudioData`.
- **Modos de Reprodução:**
  - `startPianoKey(note, octave)` / `stopPianoKey(note, octave)`: Toca notas manuais com loop contínuo e release suave.
  - `playChord(chordData)`: Dispara tríades/títrades com envelope de sustentação.
  - `playOneShot(soundName, time, gain)`: Usado pelo sequenciador rítmico para batidas percussivas e notas curtas.

### 4.2. `rhythmEngine.js` (Sequenciador / Arranjador)
- **Clock Preciso:** Não utiliza `setInterval` (que sofre com drift e throttling de abas). Utiliza loop `requestAnimationFrame` cruzado com o `audioContext.currentTime` para agendamento antecipado (lookahead).
- **Matriz de Vozes (5 vozes):**
  - `V1 / V2`: Linha de contrabaixo / tônica e quinta.
  - `V3 a V5`: Harmonia rítmica (acordes picados ou arpejos).
- **Padrões Rítmicos:** Lê os arrays de passos de `styles-melody.json` onde:
  - `0` = Pausa / Silêncio.
  - `1` = Nota acentuada (forte).
  - `2` = Nota secundária (fraca/ghost note).

---

## 🌟 5. Regras de Ouro - Svelte 5 (Runes)

Ao editar ou criar componentes `.svelte`, **obedeça rigorosamente ao paradigma de Runes do Svelte 5**:

| Proibido (Svelte 3/4) | Obrigatório no Svelte 5 |
| :--- | :--- |
| `let count = 0;` (reativo) | `let count = $state(0);` |
| `$: double = count * 2;` | `let double = $derived(count * 2);` |
| `$: { console.log(x); }` | `$effect(() => { console.log(x); });` |
| `export let prop = val;` | `let { prop = val }: Props = $props();` |
| `createEventDispatcher()` | Callbacks via props: `let { onchange } = $props();` -> `onchange(val);` |
| `<slot />` | Snippets: `{#snippet children()}` ou `render` tags |

---

## 🎹 6. Convenções Musicais e de Arquivos

- **Nomenclatura de Sustenidos em Arquivos:** Como o caractere `#` não é seguro para URLs e sistemas de arquivos, ele é substituído por sublinhado `_`:
  - Dó Sustenido 3 (`C#3`) -> `orgao_c_3.ogg`
  - Fá Sustenido 2 (`F#2`) -> `orgao_f_2.ogg`
  - Fá Natural 2 (`F2`) -> `orgao_f2.ogg`
- **Normalização Enarmônica:** Bemóis sempre são normalizados para sustenidos antes do disparo (ex: `Db -> C#`, `Eb -> D#`, `Bb -> A#`).
- **Fases de Som (`musicPhase`):**
  - **Fase 1:** Som básico / clean.
  - **Fase 2:** Brilho adicional / vozes intermediárias.
  - **Fase 3:** Som cheio (full chorus / oitava superior adicionada).

---

## ⚠️ Instruções Críticas para a IA

1. **Subpastas e Deploy (`BASE_URL`):** Nunca use caminhos absolutos diretos como `"/assets/audio/..."`. Use sempre:
   ```javascript
   const baseUrl = import.meta.env.BASE_URL;
   const url = `${baseUrl}assets/audio/Orgao/${filename}`;
   ```
2. **Políticas de Autoplay dos Navegadores:** O `AudioContext` inicia no estado `suspended`. Ele **só pode ser resumido após um gesto explícito do usuário** (`pointerdown`, `click`). Toda inicialização de som deve checar `audioCtx.state === 'suspended'` e chamar `audioCtx.resume()`.
3. **Isolamento de Responsabilidades:** Não misture lógica de Web Audio dentro de componentes visuais do Svelte. Os componentes disparam eventos para o `App.svelte` ou chamam métodos públicos dos motores `sampleEngine` / `rhythmEngine`.
