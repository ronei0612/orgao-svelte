<script>
  import { onMount } from 'svelte';
  import { ChevronDown, Search, ArrowDownCircle } from 'lucide-svelte';

  let containerEl = $state(null);
  const STORAGE_KEY = 'scrollTopMissa';

  // Controle dos Acordeões das 5 Orações Eucarísticas (OE 2 aberta por padrão)
  let openOE = $state({
    1: false,
    2: true,
    3: false,
    4: false,
    5: false
  });

  let searchQuery = $state('');

  function toggleOE(num) {
    openOE[num] = !openOE[num];
  }

  function scrollToSection(id) {
    if (!containerEl) return;
    const target = containerEl.querySelector(`#${id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onMount(() => {
    if (containerEl && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        containerEl.scrollTop = parseInt(saved, 10);
      }
    }
  });

  let scrollTimeout = null;
  function handleScroll(e) {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, e.target.scrollTop);
      }
    }, 150);
  }

  function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function handleSearchInput(e) {
    searchQuery = e.target.value;
    const q = normalize(searchQuery.trim());
    if (q.length > 0) {
      openOE = { 1: true, 2: true, 3: true, 4: true, 5: true };
    }
  }
</script>

<div 
  bind:this={containerEl} 
  class="liturgico-container" 
  onscroll={handleScroll}
>
  <main class="liturgico-content">

    <!-- RITOS INICIAIS -->
    <section class="secao-liturgica">
      <h1>Ritos Iniciais</h1>

      <p><span class="rubrica fw-bold me-2">CP</span> Em nome do Pai e do Filho e do Espírito Santo.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>

      <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> A graça de nosso Senhor Jesus Cristo, o amor do Pai e a comunhão do Espírito Santo estejam convosco.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Bendito seja Deus, que nos reuniu no amor de Cristo.</p>

      <p class="text-center my-3 rubrica-instrucao">— ou —</p>

      <p><span class="rubrica fw-bold me-2">CP</span> O Senhor esteja convosco.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Ele está no meio de nós.</p>
    </section>

    <hr class="divisor">

    <!-- ATO PENITENCIAL -->
    <section class="secao-liturgica">
      <h2>Ato Penitencial</h2>
      <p><span class="rubrica fw-bold me-2">CP</span> Irmãos e irmãs, reconheçamos os nossos pecados, para celebrarmos dignamente os santos mistérios.</p>

      <h3 class="subtitulo">Primeira fórmula</h3>
      <p><span class="rubrica fw-bold me-2">CP</span> Confessemos os nossos pecados:</p>

      <div class="fw-bold mb-3 ps-3 border-left-destaque">
        <p class="mb-0"><span class="rubrica fw-bold me-2">AS</span> Confesso a Deus todo-poderoso e a vós, irmãos e irmãs,</p>
        <p class="mb-0">que pequei muitas vezes por pensamentos e palavras, atos e omissões,</p>
        <p class="mb-0 rubrica-instrucao">(batendo no peito, dizem:)</p>
        <p class="mb-1">por minha culpa, minha culpa, minha tão grande culpa.</p>
        <p class="mb-0">E peço à Virgem Maria, aos Anjos e Santos,</p>
        <p class="mb-0">e a vós, irmãos e irmãs, que rogueis por mim a Deus, nosso Senhor.</p>
      </div>

      <p><span class="rubrica fw-bold me-2">CP</span> Deus todo-poderoso tenha compaixão de nós, perdoe os nossos pecados e nos conduza à vida eterna.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>

      <p class="mt-3 mb-0"><span class="rubrica fw-bold me-2">CP</span> Senhor, tende piedade de nós.</p>
      <p class="fw-bold mb-2"><span class="rubrica fw-bold me-2">AS</span> Senhor, tende piedade de nós.</p>
      <p class="mb-0"><span class="rubrica fw-bold me-2">CP</span> Cristo, tende piedade de nós.</p>
      <p class="fw-bold mb-2"><span class="rubrica fw-bold me-2">AS</span> Cristo, tende piedade de nós.</p>
      <p class="mb-0"><span class="rubrica fw-bold me-2">CP</span> Senhor, tende piedade de nós.</p>
      <p class="fw-bold mb-4"><span class="rubrica fw-bold me-2">AS</span> Senhor, tende piedade de nós.</p>

      <div class="btn-wrap-center">
        <button type="button" class="btn-salto" onclick={() => scrollToSection('gloria')}>
          <ArrowDownCircle size={16} /> Ir para o Glória
        </button>
      </div>

      <hr class="divisor">

      <h3 class="subtitulo">Segunda fórmula</h3>
      <p><span class="rubrica fw-bold me-2">CP</span> Tende compaixão de nós, Senhor.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Porque somos pecadores.</p>
      <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Manifestai, Senhor, a vossa misericórdia.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> E dai-nos a vossa salvação.</p>

      <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Deus todo-poderoso tenha compaixão de nós, perdoe os nossos pecados e nos conduza à vida eterna.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>

      <hr class="divisor">

      <h3 class="subtitulo">Terceira fórmula</h3>
      <p><span class="rubrica fw-bold me-2">CP</span> Senhor, que viestes salvar os corações arrependidos, tende piedade de nós.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Senhor, tende piedade de nós.</p>

      <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Cristo, que viestes chamar os pecadores, tende piedade de nós.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Cristo, tende piedade de nós.</p>

      <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Senhor, que intercedeis por nós junto do Pai, tende piedade de nós.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Senhor, tende piedade de nós.</p>

      <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Deus todo-poderoso tenha compaixão de nós, perdoe os nossos pecados e nos conduza à vida eterna.</p>
      <p class="fw-bold mb-4"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>

      <div class="btn-wrap-center">
        <button type="button" class="btn-salto" onclick={() => scrollToSection('oracoes-eucaristicas')}>
          <ArrowDownCircle size={16} /> Ir para Oração Eucarística
        </button>
      </div>
    </section>

    <!-- GLÓRIA -->
    <section id="gloria" class="secao-liturgica">
      <h2>Glória</h2>
      <div class="fw-bold mb-4">
        <p class="mb-0">Glória a Deus nas alturas,</p>
        <p class="mb-0">e paz na terra aos homens por Ele amados.</p>
        <p class="mb-0">Senhor Deus, rei dos céus,</p>
        <p class="mb-0">Deus Pai todo-poderoso.</p>
        <p class="mb-0">Nós vos louvamos,</p>
        <p class="mb-0">nós vos bendizemos,</p>
        <p class="mb-0">nós vos adoramos,</p>
        <p class="mb-0">nós vos glorificamos,</p>
        <p class="mb-0">nós vos damos graças</p>
        <p class="mb-0">por vossa imensa glória.</p>
        <p class="mb-0">Senhor Jesus Cristo, Filho Unigênito,</p>
        <p class="mb-0">Senhor Deus, Cordeiro de Deus,</p>
        <p class="mb-0">Filho de Deus Pai.</p>
        <p class="mb-0">Vós que tirais o pecado do mundo,</p>
        <p class="mb-0">tende piedade de nós.</p>
        <p class="mb-0">Vós que tirais o pecado do mundo,</p>
        <p class="mb-0">acolhei a nossa súplica.</p>
        <p class="mb-0">Vós que estais à direita do Pai,</p>
        <p class="mb-0">tende piedade de nós.</p>
        <p class="mb-0">Só Vós sois o Santo,</p>
        <p class="mb-0">só vós, o Senhor,</p>
        <p class="mb-0">só vós, o Altíssimo,</p>
        <p class="mb-0">Jesus Cristo,</p>
        <p class="mb-0">com o Espírito Santo,</p>
        <p class="mb-0">na glória de Deus Pai.</p>
        <p class="mb-0">Amém.</p>
      </div>

      <p><span class="rubrica fw-bold me-2">CP</span> Oremos... <span class="rubrica-instrucao">(proclama a Coleta)</span></p>
      <p class="fw-bold mb-4"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>

      <div class="btn-wrap-center">
        <button type="button" class="btn-salto" onclick={() => scrollToSection('oracoes-eucaristicas')}>
          <ArrowDownCircle size={16} /> Ir para Oração Eucarística
        </button>
      </div>
    </section>

    <hr class="divisor">

    <!-- LITURGIA DA PALAVRA -->
    <section class="secao-liturgica">
      <h1>Liturgia da Palavra</h1>

      <h3 class="subtitulo mt-4">Credo (Símbolo dos Apóstolos)</h3>
      <div class="fw-bold mb-4">
        <p class="mb-0">Creio em Deus Pai todo-poderoso,</p>
        <p class="mb-0">Criador do céu e da terra.</p>
        <p class="mb-0">E em Jesus Cristo, seu único Filho, nosso Senhor,</p>
        <p class="mb-0 rubrica-instrucao">(Todos se inclinam)</p>
        <p class="mb-0">que foi concebido pelo poder do Espírito Santo,</p>
        <p class="mb-0">nasceu da Virgem Maria,</p>
        <p class="mb-0 rubrica-instrucao">(Retorna-se à posição anterior)</p>
        <p class="mb-0">padeceu sob Pôncio Pilatos,</p>
        <p class="mb-0">foi crucificado, morto e sepultado,</p>
        <p class="mb-0">desceu à mansão dos mortos,</p>
        <p class="mb-0">ressuscitou ao terceiro dia,</p>
        <p class="mb-0">subiu aos céus,</p>
        <p class="mb-0">está sentado à direita de Deus Pai todo-poderoso,</p>
        <p class="mb-0">donde há de vir a julgar os vivos e os mortos.</p>
        <p class="mb-0">Creio no Espírito Santo,</p>
        <p class="mb-0">na santa Igreja Católica,</p>
        <p class="mb-0">na comunhão dos santos,</p>
        <p class="mb-0">na remissão dos pecados,</p>
        <p class="mb-0">na ressurreição da carne</p>
        <p class="mb-0">e na vida eterna.</p>
        <p class="mb-0">Amém.</p>
      </div>

      <h3 class="subtitulo mt-4">Niceno-Constantinopolitano</h3>
      <div class="fw-bold mb-4">
        <p class="mb-0">Creio em um só Deus, Pai todo-poderoso,</p>
        <p class="mb-0">Criador do céu e da terra,</p>
        <p class="mb-0">de todas as coisas visíveis e invisíveis.</p>
        <p class="mb-0">Creio em um só Senhor, Jesus Cristo,</p>
        <p class="mb-0">Filho Unigênito de Deus,</p>
        <p class="mb-0">nascido do Pai antes de todos os séculos:</p>
        <p class="mb-0">Deus de Deus, luz da luz,</p>
        <p class="mb-0">Deus verdadeiro de Deus verdadeiro,</p>
        <p class="mb-0">gerado, não criado,</p>
        <p class="mb-0">consubstancial ao Pai.</p>
        <p class="mb-0">Por Ele todas as coisas foram feitas.</p>
        <p class="mb-0">E, por nós, homens, e para a nossa salvação,</p>
        <p class="mb-0">desceu dos céus:</p>
        <p class="mb-0 rubrica-instrucao">(Todos se inclinam)</p>
        <p class="mb-0">e se encarnou pelo Espírito Santo,</p>
        <p class="mb-0">no seio da Virgem Maria,</p>
        <p class="mb-0">e se fez homem.</p>
        <p class="mb-0 rubrica-instrucao">(Retorna-se à posição anterior)</p>
        <p class="mb-0">Também por nós foi crucificado</p>
        <p class="mb-0">sob Pôncio Pilatos;</p>
        <p class="mb-0">padeceu e foi sepultado.</p>
        <p class="mb-0">Ressuscitou ao terceiro dia,</p>
        <p class="mb-0">conforme as escrituras;</p>
        <p class="mb-0">E subiu aos céus,</p>
        <p class="mb-0">onde está sentado à direita do Pai.</p>
        <p class="mb-0">E de novo há de vir, em sua glória,</p>
        <p class="mb-0">para julgar os vivos e os mortos;</p>
        <p class="mb-0">e o seu reino não terá fim.</p>
        <p class="mb-0">Creio no Espírito Santo,</p>
        <p class="mb-0">Senhor que dá a vida,</p>
        <p class="mb-0">e procede do Pai e do Filho;</p>
        <p class="mb-0">e com o Pai e o Filho</p>
        <p class="mb-0">é adorado e glorificado:</p>
        <p class="mb-0">Ele que falou pelos profetas.</p>
        <p class="mb-0">Creio na Igreja una, santa,</p>
        <p class="mb-0">católica e apostólica.</p>
        <p class="mb-0">Professo um só batismo</p>
        <p class="mb-0">para remissão dos pecados.</p>
        <p class="mb-0">Espero a ressurreição dos mortos;</p>
        <p class="mb-0">E a vida do mundo que há de vir.</p>
        <p class="mb-0">Amém.</p>
      </div>
    </section>

    <hr class="divisor">

    <!-- LITURGIA EUCARÍSTICA -->
    <section class="secao-liturgica" id="oracoes-eucaristicas">
      <h1>Liturgia Eucarística</h1>

      <p><span class="rubrica fw-bold me-2">CP</span> Bendito sejais, Senhor, Deus do universo, pelo pão que recebemos de vossa bondade, fruto da terra e do trabalho humano, que agora vos apresentamos, e para nós se vai tornar pão da vida.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Bendito seja Deus para sempre!</p>

      <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Bendito sejais, Senhor, Deus do universo, pelo vinho que recebemos de vossa bondade, fruto da videira e do trabalho humano, que agora vos apresentamos, e que para nós se vai tornar vinho da salvação.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Bendito seja Deus para sempre!</p>

      <p class="mt-4"><span class="rubrica fw-bold me-2">CP</span> Orai, irmãos e irmãs, para que o meu e o vosso sacrifício seja aceito por Deus Pai todo-poderoso.</p>
      <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Receba o Senhor por tuas mãos este sacrifício, para glória do seu nome, para nosso bem e de toda a sua santa Igreja.</p>

      <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> <span class="rubrica-instrucao">(proclama a Oração sobre as Oferendas)</span></p>
      <p class="fw-bold mb-4"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>

      <h2>Orações Eucarísticas</h2>

      <div class="oe-search-bar">
        <Search size={18} />
        <input 
          type="search" 
          placeholder="Pesquisar oração..." 
          value={searchQuery}
          oninput={handleSearchInput}
          aria-label="Pesquisar Oração Eucarística"
        />
      </div>

      <div class="accordion-list">

        <!-- ORAÇÃO I -->
        <div class="accordion-card">
          <button type="button" class="accordion-header-btn" onclick={() => toggleOE(1)}>
            <span>Oração Eucarística I (Cânon Romano)</span>
            <span class="accordion-arrow" class:rotated={openOE[1]}>
              <ChevronDown size={18} />
            </span>
          </button>
          {#if openOE[1]}
            <div class="accordion-body">
              <p><span class="rubrica fw-bold me-2">CP</span> O Senhor esteja convosco.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Ele está no meio de nós.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Corações ao alto.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> O nosso coração está em Deus.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Demos graças ao Senhor, nosso Deus.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> É nosso dever e nossa salvação.</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Na verdade (...). Concedei-nos, também a nós, associar-nos a seus louvores cantando (dizendo) a uma só voz:</p>

              <div class="fw-bold my-3">
                <p class="mb-0"><span class="rubrica fw-bold me-2">AS</span> Santo, Santo, Santo,</p>
                <p class="mb-0">Senhor, Deus do universo.</p>
                <p class="mb-0">O céu e a terra proclamam a vossa glória.</p>
                <p class="mb-0">Hosana nas alturas!</p>
                <p class="mb-0">Bendito o que vem em nome do Senhor!</p>
                <p class="mb-0">Hosana nas alturas!</p>
              </div>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Pai de misericórdia, a quem sobem nossos louvores, suplicantes, vos rogamos e pedimos por Jesus Cristo, vosso Filho e Senhor nosso, que aceiteis e abençoeis ✠ estes dons, estas oferendas, este sacrifício puro e santo, que oferecemos, antes de tudo, pela vossa Igreja santa e católica: concedei-lhe paz e proteção, unindo-a num só corpo e governando-a por toda a terra, em comunhão com o vosso servo o Papa N., o nosso Bispo N., e todos os que guardam a fé católica que receberam dos Apóstolos.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Abençoai nossa oferenda, ó Senhor!</p>

              <p class="rubrica-instrucao text-center mt-3 border-bottom pb-1">“memento dos vivos”</p>
              <p><span class="rubrica fw-bold me-2">1C</span> Lembrai-vos, ó Pai, dos vossos filhos e filhas N. N. e de todos os que circundam este altar, dos quais conheceis a fé e a dedicação ao vosso serviço. Por eles nós vos oferecemos e também eles vos oferecem este sacrifício de louvor por si e por todos os seus, e elevam a vós as suas preces, Deus eterno, vivo e verdadeiro, para alcançar o perdão de suas faltas, a segurança em suas vidas e a salvação que esperam.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Lembrai-vos, ó Pai, de vossos filhos!</p>

              <p class="rubrica-instrucao text-center mt-3 border-bottom pb-1">“Infra actionem”</p>
              <p><span class="rubrica fw-bold me-2">2C</span> Em comunhão com toda a Igreja, celebramos em primeiro lugar a memória da Mãe de nosso Deus e Senhor Jesus Cristo, a gloriosa sempre Virgem Maria, a de seu esposo São José, e também a dos Santos Apóstolos e Mártires: Pedro e Paulo, André, (Tiago e João, Tomé, Tiago e Filipe, Bartolomeu e Mateus, Simão e Tadeu, Lino, Cleto, Clemente, Sisto, Cornélio e Cipriano, Lourenço e Crisógono, João e Paulo, Cosme e Damião), e todos os vossos Santos. Por seus méritos e preces concedei-nos sem cessar a vossa proteção. (Por Cristo, nosso Senhor. Amém).</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Em comunhão com os vossos Santos vos louvamos!</p>

              <p><span class="rubrica fw-bold me-2">CC</span> Dignai-vos, ó Pai, aceitar, abençoar e santificar estas oferendas, recebei-as como sacrifício espiritual perfeito, a fim de que se tornem para nós o Corpo e ✠ o Sangue de vosso amado Filho, nosso Senhor Jesus Cristo.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Enviai o vosso Espírito Santo!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Na véspera de sua paixão, ele tomou o pão...)</span> <br> <strong>TOMAI, TODOS, E COMEI: ISTO É O MEU CORPO, QUE SERÁ ENTREGUE POR VÓS.</strong></p>
              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Do mesmo modo, ao fim da Ceia, ele tomou este precioso cálice...)</span> <br> <strong>TOMAI, TODOS, E BEBEI: ESTE É O CÁLICE DO MEU SANGUE, O SANGUE DA NOVA E ETERNA ALIANÇA, QUE SERÁ DERRAMADO POR VÓS E POR TODOS, PRA REMISSÃO DOS PECADOS. FAZEI ISTO EM MEMÓRIA DE MIM.</strong></p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP</span> Mistério da fé!</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Anunciamos, Senhor, a vossa morte e proclamamos a vossa ressurreição. Vinde, Senhor Jesus!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP/CC</span> Por Cristo, com Cristo, e em Cristo, a vós, Deus Pai todo-poderoso, na unidade do Espírito Santo, toda a honra e toda a glória, por todos os séculos dos séculos.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>
            </div>
          {/if}
        </div>

        <!-- ORAÇÃO II (ABERTA POR PADRÃO) -->
        <div class="accordion-card">
          <button type="button" class="accordion-header-btn" onclick={() => toggleOE(2)}>
            <span>Oração Eucarística II</span>
            <span class="accordion-arrow" class:rotated={openOE[2]}>
              <ChevronDown size={18} />
            </span>
          </button>
          {#if openOE[2]}
            <div class="accordion-body">
              <p><span class="rubrica fw-bold me-2">CP</span> O Senhor esteja convosco.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Ele está no meio de nós.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Corações ao alto.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> O nosso coração está em Deus.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Demos graças ao Senhor, nosso Deus.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> É nosso dever e nossa salvação.</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Na verdade, é digno e justo, é nosso dever e salvação dar-vos graças sempre e em todo o lugar, Senhor, Pai santo, por vosso amado Filho, Jesus Cristo. Ele é a vossa Palavra, pela qual tudo criastes. Ele é o nosso Salvador e Redentor, que se encarnou pelo Espírito Santo e nasceu da Virgem Maria. Ele, para cumprir a vossa vontade e adquirir para vós um povo santo, estendeu os braços na hora da sua paixão, a fim de vencer a morte e manifestar a ressurreição. Por isso, com os Anjos e todos os Santos, proclamamos vossa glória, cantando (dizendo) a uma só voz:</p>

              <div class="fw-bold my-3">
                <p class="mb-0"><span class="rubrica fw-bold me-2">AS</span> Santo, Santo, Santo,</p>
                <p class="mb-0">Senhor, Deus do universo.</p>
                <p class="mb-0">O céu e a terra proclamam a vossa glória.</p>
                <p class="mb-0">Hosana nas alturas!</p>
                <p class="mb-0">Bendito o que vem em nome do Senhor!</p>
                <p class="mb-0">Hosana nas alturas!</p>
              </div>

              <p><span class="rubrica fw-bold me-2">CP</span> Na verdade, ó Pai, vós sois Santo, fonte de toda santidade.</p>
              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> Santificai, pois, estes dons, derramando sobre eles o vosso Espírito, a fim de que se tornem para nós o Corpo e ✠ o Sangue de nosso Senhor Jesus Cristo.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Enviai o Vosso Espírito Santo!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Estando para ser entregue...)</span> <br> <strong>TOMAI, TODOS, E COMEI: ISTO É O MEU CORPO, QUE SERÁ ENTREGUE POR VÓS.</strong></p>
              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Do mesmo modo, no fim da Ceia...)</span> <br> <strong>TOMAI, TODOS, E BEBEI: ESTE É O CÁLICE DO MEU SANGUE, O SANGUE DA NOVA E ETERNA ALIANÇA, QUE SERÁ DERRAMADO POR VÓS E POR TODOS, PARA A REMISSÃO DOS PECADOS. FAZEI ISTO EM MEMÓRIA DE MIM.</strong></p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP</span> Mistério da fé!</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Anunciamos, Senhor, a vossa morte e proclamamos a vossa ressurreição. Vinde, Senhor Jesus!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CC</span> Celebrando, pois, o memorial da morte e ressurreição do vosso Filho, nós vos oferecemos, ó Pai, o Pão da vida e o Cálice da salvação; e vos agradecemos porque nos tornastes dignos de estar aqui na vossa presença e vos servir.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Aceitai, ó Senhor, a nossa oferta!</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> Suplicantes, vos pedimos que, participando do Corpo e Sangue de Cristo, sejamos reunidos pelo Espírito Santo num só corpo.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> O Espírito nos una num só corpo!</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">1C</span> Lembrai-vos, ó Pai, da vossa Igreja que se faz presente pelo mundo inteiro; que ela cresça na caridade, em comunhão com o papa N., com o nosso bispo N., os bispos do mundo inteiro, os presbíteros, os diáconos e todos os ministros do vosso povo.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Lembrai-vos, ó Pai, da vossa Igreja!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP/CC</span> Por Cristo, com Cristo, e em Cristo, a vós, Deus Pai todo-poderoso, na unidade do Espírito Santo, toda a honra e toda a glória, por todos os séculos dos séculos.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém!</p>
            </div>
          {/if}
        </div>

        <!-- ORAÇÃO III -->
        <div class="accordion-card">
          <button type="button" class="accordion-header-btn" onclick={() => toggleOE(3)}>
            <span>Oração Eucarística III</span>
            <span class="accordion-arrow" class:rotated={openOE[3]}>
              <ChevronDown size={18} />
            </span>
          </button>
          {#if openOE[3]}
            <div class="accordion-body">
              <p><span class="rubrica fw-bold me-2">CP</span> O Senhor esteja convosco.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Ele está no meio de nós.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Corações ao alto.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> O nosso coração está em Deus.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Demos graças ao Senhor, nosso Deus.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> É nosso dever e nossa salvação.</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Na verdade, vós sois Santo, ó Deus do universo, e tudo o que criastes proclama o vosso louvor, porque, por Jesus Cristo, vosso Filho e Senhor nosso, e pela força do Espírito Santo, dais vida e santidade a todas as coisas e não cessais de reunir para vós um povo que vos ofereça em toda parte, do nascer ao pôr do sol, um sacrifício perfeito.</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> Por isso, ó Pai, nós vos suplicamos: santificai pelo Espírito Santo as oferendas que vos apresentamos para serem consagradas a fim de que se tornem o Corpo ✠ e o Sangue de vosso Filho, nosso Senhor Jesus Cristo, que nos mandou celebrar estes mistérios.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Enviai o vosso Espírito Santo!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Na noite em que ia ser entregue...)</span> <br> <strong>TOMAI, TODOS, E COMEI: ISTO É O MEU CORPO, QUE SERÁ ENTREGUE POR VÓS.</strong></p>
              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Do mesmo modo, ao fim da Ceia...)</span> <br> <strong>TOMAI, TODOS, E BEBEI: ESTE É O CÁLICE DO MEU SANGUE, O SANGUE DA NOVA E ETERNA ALIANÇA, QUE SERÁ DERRAMADO POR VÓS E POR TODOS, PARA A REMISSÃO DOS PECADOS. FAZEI ISTO EM MEMÓRIA DE MIM.</strong></p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP</span> Mistério da fé!</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Anunciamos, Senhor, a vossa morte e proclamamos a vossa ressurreição. Vinde, Senhor Jesus!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP/CC</span> Por Cristo, com Cristo, e em Cristo, a vós, Deus Pai todo-poderoso, na unidade do Espírito Santo, toda honra e toda glória, por todos os séculos dos séculos.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém!</p>
            </div>
          {/if}
        </div>

        <!-- ORAÇÃO IV -->
        <div class="accordion-card">
          <button type="button" class="accordion-header-btn" onclick={() => toggleOE(4)}>
            <span>Oração Eucarística IV</span>
            <span class="accordion-arrow" class:rotated={openOE[4]}>
              <ChevronDown size={18} />
            </span>
          </button>
          {#if openOE[4]}
            <div class="accordion-body">
              <p><span class="rubrica fw-bold me-2">CP</span> O Senhor esteja convosco.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Ele está no meio de nós.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Corações ao alto.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> O nosso coração está em Deus.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Demos graças ao Senhor, nosso Deus.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> É nosso dever e nossa salvação.</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Na verdade, ó Pai, é nosso dever dar-vos graças, é nossa salvação dar-vos glória. Só vós sois o Deus vivo e verdadeiro que existis antes de todo o tempo e permaneceis para sempre, habitando em luz inacessível.</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> Por isso, nós vos pedimos, ó Pai, que o mesmo Espírito Santo santifique estas oferendas, a fim de que se tornem o Corpo ✠ e o Sangue de Jesus Cristo, vosso Filho e Senhor nosso.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Enviai o vosso Espírito Santo!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Quando, pois, chegou a hora...)</span> <br> <strong>TOMAI, TODOS, E COMEI: ISTO É O MEU CORPO, QUE SERÁ ENTREGUE POR VÓS.</strong></p>
              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Do mesmo modo, ele tomou em suas mãos o cálice...)</span> <br> <strong>TOMAI, TODOS, E BEBEI: ESTE É O CÁLICE DO MEU SANGUE, O SANGUE DA NOVA E ETERNA ALIANÇA, QUE SERÁ DERRAMADO POR VÓS E POR TODOS, PRA REMISSÃO DOS PECADOS. FAZEI ISTO EM MEMÓRIA DE MIM.</strong></p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP</span> Mistério da fé!</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Anunciamos, Senhor, a vossa morte e proclamamos a vossa ressurreição. Vinde, Senhor Jesus!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP/CC</span> Por Cristo, com Cristo, e em Cristo, a vós, Deus Pai todo-poderoso, na unidade do Espírito Santo, toda a honra e toda a glória, por todos os séculos dos séculos.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém!</p>
            </div>
          {/if}
        </div>

        <!-- ORAÇÃO V -->
        <div class="accordion-card">
          <button type="button" class="accordion-header-btn" onclick={() => toggleOE(5)}>
            <span>Oração Eucarística V</span>
            <span class="accordion-arrow" class:rotated={openOE[5]}>
              <ChevronDown size={18} />
            </span>
          </button>
          {#if openOE[5]}
            <div class="accordion-body">
              <p class="rubrica-instrucao text-center border-bottom pb-1">O prefácio não pode ser substituído por outro.</p>
              <p><span class="rubrica fw-bold me-2">CP</span> O Senhor esteja convosco.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Ele está no meio de nós.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Corações ao alto.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> O nosso coração está em Deus.</p>
              <p class="mt-2"><span class="rubrica fw-bold me-2">CP</span> Demos graças ao Senhor, nosso Deus.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> É nosso dever e nossa salvação.</p>

              <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Ó Pai, vós que sempre quisestes ficar muito perto de nós, vivendo conosco no Cristo, falando conosco por ele, mandai o vosso Espírito Santo, a fim de que as nossas ofertas se mudem no Corpo ✠ e no Sangue de nosso Senhor Jesus Cristo.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Mandai vosso Espírito Santo!</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Na noite em que ia ser entregue...)</span> <br> <strong>TOMAI, TODOS, E COMEI: ISTO É O MEU CORPO, QUE SERÁ ENTREGUE POR VÓS.</strong></p>
              <p class="mt-3"><span class="rubrica fw-bold me-2">CC</span> <span class="rubrica-instrucao">(Do mesmo modo, no fim da Ceia...)</span> <br> <strong>TOMAI, TODOS, E BEBEI: ESTE É O CÁLICE DO MEU SANGUE, O SANGUE DA NOVA E ETERNA ALIANÇA, QUE SERÁ DERRAMADO POR VÓS E POR TODOS, PARA A REMISSÃO DOS PECADOS. FAZEI ISTO EM MEMÓRIA DE MIM.</strong></p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP</span> Tudo isto é mistério da fé!</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Toda vez que comemos deste Pão, toda vez que bebemos deste Vinho, recordamos a paixão de Jesus Cristo e ficamos esperando sua vinda.</p>

              <p class="mt-4"><span class="rubrica fw-bold me-2">CP/CC</span> Por Cristo, com Cristo, em Cristo, a vós, Deus Pai todo poderoso, na unidade do Espírito Santo, toda honra e toda a glória, por todos os séculos dos séculos.</p>
              <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém!</p>
            </div>
          {/if}
        </div>

      </div>
    </section>

    <hr class="divisor">

    <!-- RITO DA COMUNHÃO -->
    <section class="secao-liturgica">
      <h1>Rito da Comunhão</h1>
      <p><span class="rubrica fw-bold me-2">CP</span> Obedientes à palavra do Salvador e formados por seu divino ensinamento, ousamos dizer:</p>

      <div class="fw-bold my-4">
        <p class="mb-0"><span class="rubrica fw-bold me-2">AS</span> Pai nosso que estais nos céus,</p>
        <p class="mb-0">santificado seja o vosso nome;</p>
        <p class="mb-0">venha a nós o vosso reino,</p>
        <p class="mb-0">seja feita a vossa vontade,</p>
        <p class="mb-0">assim na terra como no céu.</p>
        <p class="mb-0">O pão nosso de cada dia nos dai hoje;</p>
        <p class="mb-0">perdoai-nos as nossas ofensas,</p>
        <p class="mb-0">assim como nós perdoamos</p>
        <p class="mb-0">a quem nos tem ofendido;</p>
        <p class="mb-0">e não nos deixeis cair em tentação,</p>
        <p class="mb-0">mas livrai-nos do mal.</p>
      </div>

      <div class="mt-3">
        <p><span class="rubrica fw-bold me-2">CP</span> Livrai-nos de todos os males, ó Pai, e dai-nos hoje a vossa paz. Ajudados pela vossa misericórdia, sejamos sempre livres do pecado e protegidos de todos os perigos, enquanto aguardamos a feliz esperança e a vinda do Nosso Salvador, Jesus Cristo.</p>
        <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Vosso é o reino, o poder e a glória para sempre.</p>
      </div>

      <div class="mt-4">
        <p><span class="rubrica fw-bold me-2">CP</span> Senhor Jesus Cristo, dissestes aos vossos Apóstolos: eu vos deixo a paz, eu vos dou a minha paz. Não olheis os nossos pecados, mas a fé que anima vossa Igreja; dai-lhe, segundo o vosso desejo, a paz e a unidade. Vós, que sois Deus, com o Pai e o Espírito Santo.</p>
        <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>
      </div>

      <div class="mt-3">
        <p><span class="rubrica fw-bold me-2">CP</span> A paz do Senhor esteja sempre convosco.</p>
        <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> O amor de Cristo nos uniu.</p>
      </div>

      <p class="mt-3"><span class="rubrica fw-bold me-2">CP</span> Irmãos e irmãs, saudai-vos em Cristo Jesus. <span class="rubrica-instrucao">(Momento do abraço da paz)</span></p>

      <div class="fw-bold my-4">
        <p class="mb-0"><span class="rubrica fw-bold me-2">AS</span> Cordeiro de Deus,</p>
        <p class="mb-0">que tirais o pecado do mundo,</p>
        <p class="mb-0">tende piedade de nós.</p>
        <p class="mb-0">Cordeiro de Deus,</p>
        <p class="mb-0">que tirais o pecado do mundo,</p>
        <p class="mb-0">tende piedade de nós.</p>
        <p class="mb-0">Cordeiro de Deus,</p>
        <p class="mb-0">que tirais o pecado do mundo,</p>
        <p class="mb-0">dai-nos a paz.</p>
      </div>

      <div class="mt-4">
        <p><span class="rubrica fw-bold me-2">CP</span> Felizes os convidados para a Ceia do Senhor. Eis o Cordeiro de Deus, que tira o pecado do mundo.</p>
        <p class="fw-bold"><span class="rubrica fw-bold me-2">AS</span> Senhor, eu não sou digno(a) de que entreis em minha morada, mas dizei uma palavra e serei salvo(a).</p>
      </div>

      <p class="mt-4 rubrica-instrucao"><span class="rubrica fw-bold me-2">CP</span> (Momento da Comunhão e silêncio sagrado)</p>

      <p class="mt-5"><span class="rubrica fw-bold me-2">CP</span> Oremos... <span class="rubrica-instrucao">(proclama a Oração depois da Comunhão)</span></p>
      <p class="fw-bold mb-4"><span class="rubrica fw-bold me-2">AS</span> Amém.</p>
    </section>

  </main>
</div>

<style>
  .liturgico-container {
    flex: 1;
    overflow-y: auto;
    background-color: var(--app-bg-display, #fcfbf7);
    color: var(--app-text, #212529);
    font-family: 'Roboto', system-ui, -apple-system, sans-serif;
    font-size: 1.08rem;
    line-height: 1.45;
    padding: 16px 20px 140px 20px;
    border-radius: 6px;
    border: 1px solid var(--app-border-display, #dee2e6);
  }

  .liturgico-content {
    max-width: 760px;
    margin: 0 auto;
  }

  h1 {
    font-size: 1.85rem;
    font-weight: 700;
    margin: 1.5rem 0 1.25rem 0;
    text-align: center;
    color: inherit;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 1.75rem 0 1rem 0;
    text-align: center;
    color: #b22222;
  }

  :global([data-theme="dark"]) h2 {
    color: #ff6b6b;
  }

  .subtitulo {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 1.5rem 0 0.5rem 0;
    color: inherit;
  }

  .rubrica {
    color: #b22222;
  }

  :global([data-theme="dark"]) .rubrica {
    color: #ff6b6b;
  }

  .rubrica-instrucao {
    color: #b22222;
    font-style: italic;
    font-size: 0.95em;
  }

  :global([data-theme="dark"]) .rubrica-instrucao {
    color: #ff8585;
  }

  .divisor {
    border: none;
    border-top: 1px solid var(--app-border, rgba(0, 0, 0, 0.12));
    margin: 2.25rem 0;
  }

  .border-left-destaque {
    border-left: 3px solid rgba(178, 34, 34, 0.35);
    padding-left: 12px;
  }

  .btn-wrap-center {
    display: flex;
    justify-content: center;
    margin: 1.5rem 0;
  }

  .btn-salto {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--app-surface, #ffffff);
    color: var(--app-text, #212529);
    border: 1px solid var(--app-border, #ccc);
    padding: 8px 18px;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    transition: background-color 0.15s, border-color 0.15s;
  }

  .btn-salto:hover {
    background-color: var(--app-bg-body, #f0f0f0);
    border-color: #b22222;
  }

  .oe-search-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--app-surface, #ffffff);
    padding: 8px 12px;
    border: 1px solid var(--app-border, #ced4da);
    border-radius: 6px;
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .oe-search-bar input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    font-size: 1rem;
    color: var(--app-text);
  }

  :global([data-theme="dark"]) .oe-search-bar {
    background: #2b2b2b;
    border-color: #444;
  }

  .accordion-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 2rem;
  }

  .accordion-card {
    border: 1px solid var(--app-border, rgba(0, 0, 0, 0.12));
    border-radius: 6px;
    overflow: hidden;
    background: var(--app-surface, #ffffff);
  }

  .accordion-header-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: none;
    background: rgba(178, 34, 34, 0.06);
    color: #b22222;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }

  .accordion-header-btn:hover {
    background: rgba(178, 34, 34, 0.12);
  }

  :global([data-theme="dark"]) .accordion-header-btn {
    background: rgba(255, 107, 107, 0.12);
    color: #ff6b6b;
  }

  .accordion-body {
    padding: 16px;
    border-top: 1px solid var(--app-border, rgba(0, 0, 0, 0.08));
  }

  .accordion-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .accordion-arrow.rotated {
    transform: rotate(180deg);
  }

  .mb-0 { margin-bottom: 0; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1.25rem; }
  .mb-5 { margin-bottom: 2rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1.25rem; }
  .mt-5 { margin-top: 2rem; }
  .me-2 { margin-right: 0.5rem; }
  .ps-3 { padding-left: 1rem; }
  .fw-bold { font-weight: 700; }
  .text-center { text-align: center; }
</style>