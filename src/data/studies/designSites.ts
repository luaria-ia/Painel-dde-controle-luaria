import { Monitor } from 'lucide-react'
import { defineTrack, lesson as L, stage, studyModule as M } from './define'

/**
 * Formação Design de Sites + IA — 14 dias, 12 módulos.
 * Empresa de exemplo usada ao longo da trilha: Alma Pilates (estúdio de bairro).
 */
export const designSites = defineTrack({
  id: 'design-sites',
  title: 'Design de Sites',
  icon: Monitor,
  color: '#3b6fd8',
  description: 'Aprenda UX, UI, estrutura, design e criação de sites e landing pages profissionais.',
  modules: [
    M(
      'm01',
      'Fundamentos de Web Design',
      'Entender a profissão, o que o cliente compra, como um site é organizado e como um projeto acontece.',
      [
        L('a1', 1, 'O que faz um web designer (e o que o cliente compra)', {
          objective: 'Entender o escopo do trabalho e por que um site é uma ferramenta de negócio, não uma peça de decoração.',
          content: [
            'Web designer é o profissional que **planeja, desenha e entrega páginas na internet que cumprem um objetivo** — gerar contatos, vender, agendar, informar. O cliente não compra “um site bonito”: compra mais pedidos de orçamento, mais agendamentos, mais confiança de quem chega pelo Google ou pelo Instagram.',
            'O trabalho tem quatro camadas. **Estratégia**: para quem é o site, o que a pessoa precisa encontrar e que ação deve tomar. **Estrutura (UX)**: quais páginas e seções existem e em que ordem. **Visual (UI)**: tipografia, cores, espaçamento, imagens. **Construção e publicação**: montar no construtor ou em código, publicar, medir. Quem começa pelo visual entrega sites bonitos que ninguém usa.',
            'Com IA e construtores modernos, montar uma página ficou rápido. O que continua valioso é o julgamento: entender o negócio, organizar a informação, escrever o que convence e perceber quando um layout gerado está genérico ou confuso. É essa camada que esta formação treina.',
          ],
          concepts: [
            ['UX', 'Experiência do usuário: o quanto é fácil entender, encontrar e agir no site.'],
            ['UI', 'Interface: a camada visual — tipografia, cores, componentes, espaçamento.'],
            ['Objetivo do site', 'A ação principal que o site deve gerar (ex.: agendar aula experimental).'],
            ['Construção', 'Transformar o design em página publicada, com construtor ou código.'],
          ],
          example: [
            'O Alma Pilates pede “um site moderno”. Um entregador de layouts faz uma home com foto grande, frase bonita e 8 seções.',
            'O web designer estratégico descobre que 70% das alunas chegam pelo Instagram procurando alívio para dor nas costas e querem saber preço e horário antes de marcar. Ele cria uma página que responde isso nos primeiros segundos e coloca um botão “Agendar aula experimental” sempre à vista. Mesmo número de seções, resultado completamente diferente.',
          ],
          practice: 'Abra o site de um negócio local e tente responder em 10 segundos: o que eles fazem, para quem e o que eu devo fazer agora? Anote o que faltou.',
          task: 'Escreva as 4 camadas (estratégia, estrutura, visual, construção) e, para cada uma, uma decisão concreta que você tomaria para o site de um negócio real.',
          checklist: ['Sei explicar o que o cliente compra quando contrata um site', 'Diferencio UX de UI', 'Entendo onde a IA acelera e onde o julgamento é indispensável'],
        }),
        L('a2', 1, 'Anatomia de um site e o processo de um projeto', {
          objective: 'Conhecer as partes de uma página e as etapas de um projeto do briefing à publicação.',
          content: [
            'Uma página bem organizada tem partes previsíveis: **cabeçalho** (logo, menu e um botão de ação), **primeira dobra** (o que aparece antes de rolar — título, subtítulo, imagem e CTA), **seções de conteúdo** (benefícios, como funciona, provas, preços, perguntas frequentes) e **rodapé** (contato, endereço, redes, links legais). As pessoas esperam encontrar as coisas nesses lugares.',
            'O processo de um projeto segue uma ordem que evita retrabalho: **1) briefing** (entender negócio, público e objetivo) → **2) pesquisa e referências** → **3) mapa do site e estrutura das seções** → **4) wireframe** → **5) copy** → **6) design visual** → **7) construção** → **8) testes** (celular, velocidade, formulários) → **9) publicação** → **10) medição e ajustes**.',
            'Combine com o cliente onde estão as aprovações: estrutura e wireframe aprovados antes do visual, visual aprovado antes de construir. Mudar a estrutura depois do site pronto custa muito mais do que mudar um rascunho.',
          ],
          concepts: [
            ['Primeira dobra', 'O que aparece na tela antes de rolar. Precisa explicar o que é e o que fazer.'],
            ['Seção', 'Bloco da página com um único propósito (ex.: prova social).'],
            ['Wireframe', 'Rascunho da estrutura, sem cores nem fotos, para decidir a ordem do conteúdo.'],
            ['Ponto de aprovação', 'Momento em que o cliente valida uma etapa antes de seguir.'],
          ],
          example: [
            {
              table: [
                ['Etapa', 'Entrega', 'Aprovação do cliente?'],
                ['Briefing', 'Documento com objetivo, público e conteúdo', 'Sim'],
                ['Estrutura + wireframe', 'Mapa do site e rascunho das seções', 'Sim'],
                ['Copy', 'Textos de cada seção', 'Sim'],
                ['Design visual', 'Layout desktop e celular', 'Sim'],
                ['Construção e testes', 'Site funcionando em endereço provisório', 'Sim'],
                ['Publicação', 'Site no domínio oficial + medição', '—'],
              ],
            },
          ],
          practice: 'Abra 3 sites e identifique cabeçalho, primeira dobra, seções e rodapé. Algum deles esconde a ação principal?',
          task: 'Liste as 10 etapas do processo e, ao lado de cada uma, quanto tempo você estima gastar em uma landing page simples.',
          checklist: ['Conheço as partes de uma página', 'Sei as 10 etapas do processo', 'Sei onde ficam as aprovações do cliente'],
        }),
      ],
      {
        title: 'Análise de 3 sites reais',
        objective: 'Treinar o olhar estratégico avaliando sites com um método repetível.',
        steps: [
          'Escolha 3 sites de negócios, de preferência do nicho que você quer atender.',
          'Para cada um, avalie: clareza da primeira dobra, objetivo do site, facilidade de agir, provas de confiança e experiência no celular.',
          'Dê uma nota de 1 a 5 para cada critério.',
          'Liste pontos fortes, pontos fracos e 3 melhorias priorizadas (rápida, impacto, estratégica).',
          'Feche com uma conclusão: o que o melhor site faz que os outros não fazem?',
        ],
        checklist: ['3 sites escolhidos', '5 critérios avaliados nos 3', 'Notas atribuídas', '3 melhorias priorizadas por site', 'Conclusão comparativa escrita'],
        template:
          'SITE 1: https://\nNicho:\nObjetivo aparente do site:\nPrimeira dobra (1–5):\nFacilidade de agir (1–5):\nProvas de confiança (1–5):\nExperiência no celular (1–5):\nPontos fortes:\nPontos fracos:\nMelhorias: 1) rápida — 2) impacto — 3) estratégica —\n\nSITE 2:\n...\n\nSITE 3:\n...\n\nCONCLUSÃO:\n',
      },
    ),
    M(
      'm02',
      'UX e Experiência do Usuário',
      'Princípios de usabilidade, jornada do visitante e arquitetura da informação.',
      [
        L('a1', 2, 'Princípios de UX: clareza, esforço e confiança', {
          objective: 'Aplicar os princípios que fazem um visitante entender, confiar e agir.',
          content: [
            'Boa UX se resume a três perguntas. **Clareza**: a pessoa entende em segundos o que é, para quem e o que fazer? **Esforço**: quantos passos, campos e decisões ela precisa para agir? **Confiança**: existem sinais de que o negócio é real e competente (fotos reais, depoimentos, endereço, preço claro)?',
            'Algumas leis ajudam a decidir. **Lei de Jakob**: as pessoas passam a maior parte do tempo em outros sites, então esperam que o seu funcione igual — menu no topo, logo levando à home, botão com cara de botão. **Lei de Hick**: quanto mais opções, mais demora a decisão — uma página com 6 botões diferentes paralisa. **Lei de Fitts**: alvos grandes e próximos são mais fáceis de clicar, o que importa muito no celular.',
            'O erro mais comum é projetar para o dono do negócio, não para o visitante: textos sobre a história da empresa no topo, jargão técnico, informação que o cliente procura (preço, horários, localização) escondida. Pergunte sempre: o que a pessoa quer saber antes de decidir?',
          ],
          concepts: [
            ['Clareza', 'Entender o que é e o que fazer sem precisar pensar.'],
            ['Carga cognitiva', 'Esforço mental exigido para usar a página. Menos é melhor.'],
            ['Convenção', 'Padrão que o usuário já conhece; quebrar exige um bom motivo.'],
            ['Sinal de confiança', 'Elemento que prova que o negócio é real e competente.'],
          ],
          example: [
            '**Antes:** primeira dobra do Alma Pilates com “Bem-vindo ao nosso espaço de bem-estar” e 4 botões (Sobre, Aulas, Blog, Contato).',
            '**Depois:** “Pilates para aliviar dor nas costas, em turmas de até 4 alunas — no Batel, Curitiba” + um único botão “Agendar aula experimental grátis” + foto real do estúdio. Clareza, menos decisões, mais confiança.',
          ],
          practice: 'Escolha um site e conte quantas opções de clique existem na primeira dobra. Quais você removeria?',
          task: 'Avalie um site pelos 3 princípios (clareza, esforço, confiança) e escreva 2 problemas e 2 soluções para cada um.',
          checklist: ['Sei avaliar clareza, esforço e confiança', 'Conheço as leis de Jakob, Hick e Fitts', 'Projeto pensando no visitante, não no dono'],
        }),
        L('a2', 2, 'Jornada do usuário e arquitetura da informação', {
          objective: 'Organizar páginas e conteúdos na ordem em que o visitante precisa deles.',
          content: [
            'A **jornada do usuário** descreve o caminho do visitante: de onde ele vem (Instagram, Google, indicação), o que sabe ao chegar, que dúvidas tem e o que precisa ver para agir. Quem chega pelo Instagram já conhece a marca e quer detalhes; quem chega pelo Google talvez esteja comparando três estúdios.',
            'A **arquitetura da informação** organiza o conteúdo: quais páginas existem, o que vai em cada uma, como se chega até elas. Ferramentas simples: **mapa do site** (árvore de páginas) e **ordem das seções** de cada página. Regra prática: nenhuma informação importante a mais de 2 cliques da home.',
            'Uma ordem que funciona para páginas de serviço segue as dúvidas do visitante: **o que é e para quem** → **como resolve meu problema** → **por que confiar** → **como funciona** → **quanto custa** → **perguntas frequentes** → **ação**. Cada seção responde à objeção que a anterior levanta.',
          ],
          concepts: [
            ['Jornada', 'Caminho do visitante, da origem até a ação.'],
            ['Mapa do site', 'Árvore com todas as páginas e como se ligam.'],
            ['Hierarquia de conteúdo', 'O mais importante primeiro, o detalhe depois.'],
            ['Objeção', 'Dúvida que impede a ação; cada seção deve responder a uma.'],
          ],
          example: [
            'Jornada da visitante do Alma Pilates que chega pelo Instagram: vê um Reels sobre dor lombar → clica no link da bio → quer saber se funciona para iniciantes, onde fica, quanto custa e se pode experimentar → agenda.',
            'Ordem das seções: promessa + CTA → para quem é → como a aula funciona → depoimentos de alunas com dor nas costas → planos e preços → perguntas frequentes → CTA final + mapa.',
          ],
          practice: 'Escolha um negócio e escreva 5 dúvidas que um visitante tem antes de comprar. Em que ordem elas aparecem?',
          task: 'Desenhe a jornada de um visitante para o seu negócio fictício e, a partir dela, a ordem das seções da página principal.',
          checklist: ['Sei mapear a jornada do visitante', 'Sei montar um mapa do site', 'Ordeno seções pelas dúvidas do visitante'],
        }),
      ],
      {
        title: 'Jornada e mapa do site de um negócio fictício',
        objective: 'Transformar dúvidas reais do visitante em estrutura de site.',
        steps: [
          'Crie um negócio fictício (ou use o Alma Pilates) e descreva-o em 3 linhas.',
          'Liste 3 origens de visitantes e o que cada um sabe ao chegar.',
          'Liste as 8 principais dúvidas ou objeções antes de comprar.',
          'Monte o mapa do site (páginas e subpáginas).',
          'Defina a ordem das seções da página principal, indicando qual dúvida cada seção responde.',
        ],
        checklist: ['Negócio descrito', '3 origens de visitantes', '8 dúvidas listadas', 'Mapa do site', 'Ordem das seções justificada'],
        template:
          'NEGÓCIO:\n\nORIGENS DE VISITANTES\n1) — o que já sabe:\n2) —\n3) —\n\nDÚVIDAS / OBJEÇÕES\n1)\n2)\n3)\n4)\n5)\n6)\n7)\n8)\n\nMAPA DO SITE\n- Home\n  -\n\nSEÇÕES DA PÁGINA PRINCIPAL (seção → dúvida que responde)\n1)\n2)\n3)\n4)\n5)\n6)\n',
      },
    ),
    M(
      'm03',
      'UI e Design Visual',
      'Hierarquia visual, padrões de leitura, espaçamento, grids e componentes.',
      [
        L('a1', 3, 'Hierarquia visual e padrões de leitura', {
          objective: 'Controlar o que o visitante lê primeiro, segundo e terceiro.',
          content: [
            'Ninguém lê um site: as pessoas **escaneiam**. A hierarquia visual define o caminho do olho usando **tamanho, peso, cor, contraste e posição**. Se tudo grita, nada é ouvido. Em cada seção, deve existir um elemento claramente principal (título), um secundário (texto de apoio) e um de ação (botão).',
            'Dois padrões de leitura ajudam. **Padrão F**: em páginas com muito texto, o olho percorre a parte de cima e desce pela esquerda — por isso títulos e inícios de parágrafo carregam a informação. **Padrão Z**: em páginas com pouco texto, o olho vai do canto superior esquerdo para o direito e desce em diagonal — logo à esquerda, ação à direita, CTA no fim do Z.',
            'Botões merecem atenção especial: o **CTA principal** tem uma cor de destaque usada só para ação, texto que descreve o que acontece (“Agendar aula grátis”, não “Enviar”) e tamanho confortável para o dedo. Ações secundárias usam estilo mais discreto (contorno ou link).',
          ],
          concepts: [
            ['Hierarquia visual', 'Ordem de leitura criada por tamanho, peso, cor e posição.'],
            ['Escaneamento', 'Leitura rápida em busca de palavras-chave, típica da web.'],
            ['Padrões F e Z', 'Caminhos comuns do olhar em páginas densas (F) e simples (Z).'],
            ['CTA primário × secundário', 'A ação principal tem destaque máximo; as outras ficam discretas.'],
          ],
          example: [
            'Seção de planos do Alma Pilates com 3 cards iguais → a visitante não sabe qual escolher.',
            'Versão corrigida: o plano mais escolhido fica levemente maior, com etiqueta “Mais escolhido” e botão preenchido; os outros dois têm botão de contorno. O olho encontra a recomendação em um segundo.',
          ],
          practice: 'Faça o “teste do borrão”: tire um print de um site, desfoque a imagem e veja o que ainda se destaca. É o que deveria se destacar?',
          task: 'Pegue uma seção de um site real e descreva a hierarquia atual (1º, 2º, 3º elemento). Depois proponha a hierarquia ideal.',
          checklist: ['Sei identificar hierarquia em uma página', 'Conheço os padrões F e Z', 'Sei diferenciar CTA primário e secundário'],
        }),
        L('a2', 3, 'Espaçamento, grids e componentes', {
          objective: 'Dar aparência profissional e consistente às páginas.',
          content: [
            '**Espaçamento** é o que mais separa amador de profissional. Use uma escala fixa — por exemplo múltiplos de 8 px (8, 16, 24, 32, 48, 64, 96) — em vez de valores aleatórios. Elementos relacionados ficam próximos; grupos diferentes ficam afastados (princípio da **proximidade**). Seções precisam de respiro generoso entre si.',
            'O **grid** é a estrutura invisível que alinha tudo. No desktop, um grid de 12 colunas permite dividir em 2, 3, 4 ou 6 partes; no celular, quase tudo vira uma coluna. Defina uma largura máxima de conteúdo (algo entre 1100 e 1280 px) para o texto não ficar espalhado em telas grandes.',
            '**Componentes** são peças reutilizáveis: botão, card, campo de formulário, depoimento, item de pergunta frequente. Desenhe cada componente uma vez, com seus estados (normal, passar o mouse, foco, desabilitado), e reutilize. Isso garante consistência e acelera a construção.',
          ],
          concepts: [
            ['Escala de espaçamento', 'Conjunto fixo de distâncias usado no projeto inteiro.'],
            ['Proximidade', 'Coisas relacionadas ficam juntas; o espaço comunica grupos.'],
            ['Grid de colunas', 'Estrutura que alinha elementos e define larguras.'],
            ['Componente', 'Elemento reutilizável com variações e estados definidos.'],
          ],
          example: [
            'Mini sistema do Alma Pilates: espaçamentos 8/16/24/48/96 px · conteúdo com no máximo 1200 px · botão primário (verde-sálvia, cantos arredondados, 48 px de altura) e secundário (contorno) · card de depoimento (foto, nome, frase, “aluna há 2 anos”) · item de FAQ que abre e fecha.',
          ],
          practice: 'Abra um site que você acha bonito e meça (com a régua do navegador ou um print) os espaços entre seções. Eles se repetem?',
          task: 'Defina a escala de espaçamento, a largura máxima e 5 componentes (com estados) para o seu negócio fictício.',
          checklist: ['Uso uma escala de espaçamento', 'Sei usar grid e largura máxima', 'Defini componentes com estados'],
        }),
      ],
      {
        title: 'Redesenho de uma seção',
        objective: 'Aplicar hierarquia, espaçamento e componentes para melhorar uma seção real.',
        steps: [
          'Escolha uma seção fraca de um site real (planos, serviços, depoimentos ou primeira dobra).',
          'Descreva os problemas: hierarquia, espaçamento, alinhamento, CTA.',
          'Redesenhe a seção (no papel, no Figma ou em um construtor).',
          'Explique cada decisão usando os conceitos do módulo.',
          'Compare antes e depois com o teste do borrão.',
        ],
        checklist: ['Seção escolhida', 'Problemas descritos', 'Redesenho feito', 'Decisões justificadas', 'Antes e depois comparados'],
        template:
          'SITE / SEÇÃO:\n\nPROBLEMAS\nHierarquia:\nEspaçamento:\nAlinhamento:\nCTA:\n\nREDESENHO (link ou descrição):\n\nDECISÕES\n1)\n2)\n3)\n\nTESTE DO BORRÃO — antes × depois:\n',
      },
    ),
    M(
      'm04',
      'Tipografia e Cores',
      'Fontes legíveis, escala tipográfica, paleta, contraste e acessibilidade.',
      [
        L('a1', 4, 'Tipografia para web', {
          objective: 'Escolher e aplicar fontes que deixam o site legível e com personalidade.',
          content: [
            'Use **no máximo duas famílias**: uma para títulos (pode ter personalidade) e uma para textos (precisa ser muito legível). Antes de adicionar outra fonte, use os pesos da mesma família (regular, médio, negrito). Fontes do Google Fonts são gratuitas e funcionam em praticamente todos os construtores.',
            'Regras de legibilidade: texto corrido com **pelo menos 16 px**, **altura de linha** em torno de 1,5, linhas com cerca de **45 a 75 caracteres** (linhas longas cansam), alinhamento à esquerda para textos longos. Evite texto justificado, caixa alta em parágrafos e cinza-claro sobre branco.',
            'Monte uma **escala tipográfica**: poucos tamanhos usados com consistência — por exemplo 14, 16, 20, 24, 32 e 48 px. Títulos de seção sempre do mesmo tamanho, subtítulos sempre do mesmo tamanho. A consistência é o que faz o site parecer “desenhado” e não “montado”.',
          ],
          concepts: [
            ['Família tipográfica', 'Conjunto de pesos e estilos de uma mesma fonte.'],
            ['Altura de linha', 'Espaço vertical entre linhas; ~1,5 para textos.'],
            ['Comprimento de linha', 'Quantidade de caracteres por linha; 45–75 é confortável.'],
            ['Escala tipográfica', 'Conjunto fixo de tamanhos usado no site inteiro.'],
          ],
          example: [
            'Alma Pilates: títulos em uma serifada suave (transmite cuidado e calma), textos em uma sans-serif bem legível. Escala: 48 (título principal) · 32 (títulos de seção) · 20 (subtítulos) · 16 (texto) · 14 (legendas).',
          ],
          practice: 'Abra 3 sites e identifique: quantas fontes usam, o tamanho do texto corrido e o comprimento das linhas. Algum cansa a leitura?',
          task: 'Escolha um par de fontes e uma escala tipográfica para o seu negócio fictício, explicando a escolha.',
          checklist: ['Uso no máximo 2 famílias', 'Conheço as regras de legibilidade', 'Defini uma escala tipográfica'],
        }),
        L('a2', 4, 'Cores, contraste e acessibilidade', {
          objective: 'Criar uma paleta funcional e garantir que todos consigam ler o site.',
          content: [
            'Uma paleta de site tem papéis, não só cores bonitas: **fundo**, **texto**, **cor principal da marca**, **cor de ação** (botões e links) e **cores de estado** (sucesso, erro, aviso). A regra 60-30-10 ajuda: 60% neutros, 30% cor de apoio, 10% destaque. A cor de ação deve aparecer só em elementos clicáveis — assim o visitante aprende o que é clicável.',
            '**Contraste** define legibilidade. As diretrizes de acessibilidade (WCAG) pedem contraste de pelo menos **4,5:1** para texto normal e **3:1** para texto grande. Existem verificadores gratuitos de contraste: cole as duas cores e veja se passa. Cinza-claro elegante sobre branco quase sempre reprova.',
            'Acessibilidade vai além da cor: não use **só cor** para transmitir informação (um campo com erro precisa de mensagem, não só borda vermelha), escreva textos alternativos em imagens importantes, mantenha o foco visível para quem navega pelo teclado e use botões com área de toque confortável (por volta de 44 a 48 px no celular). Site acessível é site melhor para todo mundo.',
          ],
          concepts: [
            ['Papéis de cor', 'Cada cor tem uma função: fundo, texto, marca, ação, estado.'],
            ['Contraste 4,5:1', 'Mínimo recomendado pela WCAG para texto normal.'],
            ['Texto alternativo', 'Descrição de uma imagem para leitores de tela e buscadores.'],
            ['Área de toque', 'Tamanho mínimo confortável para tocar com o dedo.'],
          ],
          example: [
            {
              table: [
                ['Papel', 'Cor (Alma Pilates)', 'Uso'],
                ['Fundo', '#FAF7F2 (areia clara)', 'Fundo das seções'],
                ['Texto', '#2E2A26 (grafite quente)', 'Títulos e parágrafos'],
                ['Marca', '#8FA89B (verde-sálvia)', 'Detalhes e ícones'],
                ['Ação', '#2F5D50 (verde profundo)', 'Somente botões e links'],
                ['Erro', '#B3261E', 'Mensagens de formulário'],
              ],
            },
          ],
          practice: 'Use um verificador de contraste em 3 combinações de texto e fundo de um site. Quantas passam em 4,5:1?',
          task: 'Monte a paleta do seu negócio fictício com papéis, códigos hex e o contraste das combinações principais.',
          checklist: ['Defino cores por papel', 'Verifico contraste com ferramenta', 'Não uso só cor para transmitir informação', 'Penso em área de toque no celular'],
        }),
      ],
      {
        title: 'Mini guia visual',
        objective: 'Documentar as regras visuais de uma marca para usar no site inteiro.',
        steps: [
          'Defina o par de fontes e a escala tipográfica.',
          'Monte a paleta com papéis e códigos hex.',
          'Verifique o contraste das combinações de texto e botões.',
          'Defina estilo de imagens (fotos reais, ilustrações, tratamento).',
          'Desenhe ou descreva 3 componentes aplicando o guia (botão, card, depoimento).',
        ],
        checklist: ['Fontes e escala definidas', 'Paleta com papéis', 'Contraste verificado', 'Estilo de imagem definido', '3 componentes aplicados'],
        template:
          'FONTES\nTítulos:\nTextos:\nEscala (px):\n\nPALETA (papel — hex)\nFundo:\nTexto:\nMarca:\nAção:\nEstados:\n\nCONTRASTE\nTexto × fundo:\nBotão (texto × cor):\n\nIMAGENS\nEstilo:\n\nCOMPONENTES\nBotão:\nCard:\nDepoimento:\n',
      },
    ),
    M(
      'm05',
      'Wireframes',
      'Estruturar páginas antes do visual e montar uma biblioteca de seções.',
      [
        L('a1', 5, 'Do rascunho ao wireframe', {
          objective: 'Decidir estrutura e conteúdo antes de pensar em cores e fotos.',
          content: [
            '**Wireframe** é o esqueleto da página: caixas, títulos provisórios e indicação de imagens, sem cores nem acabamento. Ele existe para discutir **o que** aparece e **em que ordem**, sem distração estética. Mudar um wireframe leva minutos; mudar um site pronto leva dias.',
            'Existem níveis. **Rascunho em papel** (baixa fidelidade): rápido, ótimo para explorar 3 ou 4 alternativas. **Wireframe digital** (média fidelidade): caixas cinza no Figma ou no construtor, com textos reais ou aproximados. **Protótipo** (alta fidelidade): já com visual e cliques simulados, usado para testar com pessoas.',
            'Escreva o wireframe com **conteúdo real sempre que possível**. “Lorem ipsum” esconde problemas: um título que na prática tem 3 linhas, um depoimento que não existe, uma foto que o cliente não tem. Se o conteúdo ainda não existe, escreva uma versão aproximada — ela vira o primeiro rascunho da copy.',
          ],
          concepts: [
            ['Baixa fidelidade', 'Rascunho rápido para explorar ideias.'],
            ['Média fidelidade', 'Estrutura digital com conteúdo aproximado.'],
            ['Protótipo', 'Versão navegável para testar antes de construir.'],
            ['Conteúdo real', 'Textos e imagens verdadeiros, que revelam problemas cedo.'],
          ],
          example: [
            'Wireframe da primeira dobra do Alma Pilates, em média fidelidade:',
            {
              list: [
                'Cabeçalho: [logo] ······ [Aulas] [Planos] [Contato] [Botão: Agendar aula grátis]',
                'Esquerda: título “Pilates para aliviar dor nas costas” · subtítulo com turma pequena e bairro · botão principal · linha “★ 4,9 no Google · 120 avaliações”',
                'Direita: [foto real de aula com instrutora corrigindo postura]',
              ],
            },
          ],
          practice: 'Desenhe no papel 3 versões diferentes da primeira dobra para o mesmo negócio, em 5 minutos cada.',
          task: 'Faça o wireframe completo da página principal do seu negócio fictício em média fidelidade.',
          checklist: ['Sei para que serve um wireframe', 'Conheço os níveis de fidelidade', 'Uso conteúdo real ou aproximado'],
        }),
        L('a2', 5, 'Seções padrão e biblioteca de blocos', {
          objective: 'Montar páginas rapidamente com blocos que já funcionam.',
          content: [
            'A maioria dos sites de serviço usa as mesmas seções, em combinações diferentes: **hero** (primeira dobra), **problema/identificação**, **benefícios**, **como funciona** (passo a passo), **prova social** (depoimentos, avaliações, logos), **serviços ou planos**, **sobre/quem atende**, **perguntas frequentes**, **CTA final** e **rodapé**.',
            'Monte sua **biblioteca de blocos**: para cada seção, 2 ou 3 variações de layout em wireframe (ex.: depoimentos em grade, em carrossel ou um destaque grande). Com ela, você não começa do zero a cada cliente — escolhe e adapta. Construtores como Framer e Webflow trabalham exatamente assim.',
            'Critério de escolha: a seção certa é a que responde à dúvida daquele visitante naquele ponto da página. Não coloque um bloco só porque “todo site tem”. Uma landing page de aula experimental não precisa de blog; um site institucional de clínica provavelmente precisa de página de equipe.',
          ],
          concepts: [
            ['Hero', 'A primeira seção: promessa, apoio, CTA e imagem.'],
            ['Prova social', 'Evidência de que outras pessoas confiam e tiveram resultado.'],
            ['Biblioteca de blocos', 'Coleção de seções prontas para reutilizar.'],
            ['Seção com propósito', 'Cada bloco existe para responder a uma dúvida.'],
          ],
          example: [
            {
              table: [
                ['Seção', 'Dúvida que responde (Alma Pilates)', 'Variação escolhida'],
                ['Hero', 'O que é e é para mim?', 'Texto à esquerda + foto real'],
                ['Identificação', 'Isso resolve meu problema?', '3 dores com ícones'],
                ['Como funciona', 'Como é a primeira aula?', 'Passo a passo em 3 etapas'],
                ['Prova social', 'Funciona mesmo?', '3 depoimentos com foto'],
                ['Planos', 'Quanto custa?', '3 cards com destaque no do meio'],
                ['FAQ', 'E se eu nunca fiz exercício?', 'Lista que abre e fecha'],
              ],
            },
          ],
          practice: 'Analise 3 landing pages e liste as seções de cada uma na ordem. Quais se repetem?',
          task: 'Crie sua biblioteca com 6 seções, cada uma com 2 variações de wireframe.',
          checklist: ['Conheço as seções padrão', 'Montei variações de blocos', 'Escolho seções pela dúvida que respondem'],
        }),
      ],
      {
        title: 'Wireframe de uma landing page',
        objective: 'Estruturar uma página completa antes de qualquer decisão visual.',
        steps: [
          'Use o negócio do Exercício 2 e defina o objetivo da página.',
          'Escolha as seções e a ordem, justificando cada uma pela dúvida que responde.',
          'Faça o wireframe em média fidelidade (Figma, construtor ou papel fotografado) com conteúdo aproximado.',
          'Faça também a versão para celular (uma coluna).',
          'Mostre a alguém e pergunte: em 5 segundos, o que é e o que fazer?',
        ],
        checklist: ['Objetivo da página definido', 'Seções justificadas', 'Wireframe desktop', 'Wireframe celular', 'Teste de 5 segundos feito'],
        template:
          'OBJETIVO DA PÁGINA:\n\nSEÇÕES (ordem — dúvida)\n1)\n2)\n3)\n4)\n5)\n6)\n7)\n\nLINK DO WIREFRAME (desktop):\nLINK DO WIREFRAME (celular):\n\nTESTE DE 5 SEGUNDOS\nO que a pessoa entendeu:\nO que ela faria:\nAjustes:\n',
      },
    ),
    M(
      'm06',
      'Landing Pages',
      'Estrutura que converte, copy para páginas e prova social, objeções e CTA.',
      [
        L('a1', 6, 'Estrutura de uma landing page que converte', {
          objective: 'Montar uma página focada em uma única ação.',
          content: [
            '**Landing page** é uma página com **um objetivo só**: agendar, baixar, comprar, pedir orçamento. Diferente do site institucional, ela remove distrações — em geral sem menu completo, sem links para outras páginas, sem cinco CTAs diferentes. Tudo leva à mesma ação.',
            'Estrutura que funciona para serviços: **1) Hero** com promessa clara, apoio e CTA. **2) Identificação** — as dores do visitante. **3) Solução** — como o serviço resolve. **4) Como funciona** — passos simples. **5) Prova social**. **6) Oferta** — o que está incluído, preço ou condição. **7) Objeções / FAQ**. **8) CTA final** repetindo a promessa. O mesmo CTA aparece em vários pontos da página.',
            'A **coerência com a origem** é decisiva: se o anúncio ou o post fala de “aula experimental grátis para dor nas costas”, a página precisa repetir exatamente essa promessa no topo. Quando a pessoa clica numa coisa e chega em outra, ela sai.',
          ],
          concepts: [
            ['Landing page', 'Página de objetivo único, sem distrações.'],
            ['Promessa', 'O resultado que a pessoa ganha ao agir.'],
            ['Coerência de mensagem', 'A página continua exatamente a conversa que trouxe o visitante.'],
            ['Taxa de conversão', 'Visitantes que fizeram a ação ÷ total de visitantes × 100.'],
          ],
          example: [
            'Landing “Aula experimental” do Alma Pilates: hero “Sua primeira aula de pilates é por nossa conta” → 3 dores (dor lombar, rigidez, falta de tempo) → como é a aula experimental em 3 passos → 3 depoimentos → o que inclui (avaliação postural + aula de 50 min) → FAQ (“nunca fiz exercício”, “tenho hérnia”) → CTA final + formulário curto.',
          ],
          practice: 'Encontre uma landing page de anúncio (pesquise um serviço e clique em um resultado patrocinado) e identifique as 8 partes. Qual está faltando?',
          task: 'Escreva a estrutura (título de cada seção + o que contém) de uma landing page para o seu negócio fictício.',
          checklist: ['Sei o que diferencia landing page de site', 'Conheço a estrutura de 8 partes', 'Entendo a coerência com a origem do tráfego'],
        }),
        L('a2', 6, 'Copy para landing pages', {
          objective: 'Escrever títulos e textos que fazem o visitante entender e agir.',
          content: [
            'O **título do hero** é a frase mais importante do site. Fórmulas úteis: **resultado + para quem** (“Pilates para aliviar dor nas costas de quem passa o dia sentado”), **resultado + sem objeção** (“Comece pilates sem nunca ter feito exercício”), **o que é + diferencial** (“Pilates em turmas de até 4 alunas no Batel”). O subtítulo completa com o como e o porquê.',
            'Escreva **benefícios, não características**: “aparelhos modernos” é característica; “exercícios adaptados ao seu corpo, sem risco de lesão” é benefício. Use a linguagem do cliente (como ele descreve o problema), frases curtas, intertítulos que funcionam sozinhos para quem só escaneia, e números concretos sempre que possível.',
            'O **texto do botão** diz o que acontece: “Agendar minha aula grátis” converte melhor que “Enviar”, porque descreve o ganho. Perto do botão, um **microtexto** reduz o medo: “Sem compromisso · Resposta em até 2 horas · Não pedimos cartão”.',
          ],
          concepts: [
            ['Título do hero', 'A promessa principal, entendida em segundos.'],
            ['Benefício', 'O que muda na vida do cliente, não o que o serviço tem.'],
            ['Intertítulo', 'Título de seção que resume a ideia para quem escaneia.'],
            ['Microtexto', 'Frase curta perto do CTA que remove uma objeção.'],
          ],
          example: [
            '**Antes:** “Bem-vindo ao Studio Alma. Excelência em pilates desde 2015.” Botão: “Saiba mais”.',
            '**Depois:** “Alivie a dor nas costas com pilates em turmas de até 4 alunas.” Subtítulo: “Aulas guiadas por fisioterapeutas, no Batel, com horários das 6h às 21h.” Botão: “Agendar minha aula grátis”. Microtexto: “Sem compromisso · Leva 1 minuto”.',
          ],
          practice: 'Reescreva o título e o botão de 3 sites reais usando as fórmulas da aula.',
          task: 'Escreva 5 opções de título para o hero do seu negócio fictício, escolha a melhor e escreva subtítulo, botão e microtexto.',
          checklist: [
            'Conheço fórmulas de título',
            'Escrevo benefícios em vez de características',
            'Escrevo botões que dizem o que acontece',
            'Uso microtexto para reduzir objeções',
          ],
        }),
        L('a3', 7, 'Prova social, objeções e formulário', {
          objective: 'Tornar a promessa crível e o próximo passo fácil.',
          content: [
            '**Prova social** funciona quando é específica: depoimento com nome, foto e um resultado concreto (“voltei a dormir sem dor depois de 2 meses”) vale mais que “ótimo atendimento!”. Outros formatos: nota e número de avaliações no Google, quantidade de alunos atendidos, antes e depois (com cuidado com regras do nicho), logos de empresas atendidas, selos e certificações.',
            'Mapeie as **objeções** e responda cada uma na página: preço (“quanto custa?”), risco (“e se eu não gostar?”), capacidade (“consigo, mesmo sem condicionamento?”), tempo (“tem horário à noite?”), confiança (“quem vai me atender?”). As perguntas frequentes são o lugar natural para as objeções que sobraram.',
            '**Formulário** é onde muita página perde clientes. Peça só o necessário para o próximo passo — nome e WhatsApp costumam bastar para agendar. Cada campo extra reduz envios. Deixe claro o que acontece depois do envio, mostre erros de forma compreensível e, se coletar dados pessoais, informe a finalidade e tenha uma política de privacidade (exigência da LGPD).',
          ],
          concepts: [
            ['Prova social específica', 'Depoimento com pessoa real e resultado concreto.'],
            ['Objeção', 'Dúvida ou medo que impede a ação.'],
            ['Atrito', 'Qualquer esforço extra no caminho até a ação.'],
            ['LGPD', 'Lei de proteção de dados: informe finalidade e trate os dados com cuidado.'],
          ],
          example: [
            '**Formulário antes:** nome, sobrenome, e-mail, telefone, data de nascimento, endereço, “como nos conheceu?”, mensagem.',
            '**Depois:** nome + WhatsApp + período preferido (manhã/tarde/noite). Abaixo: “Respondemos em até 2 horas para confirmar o horário. Seus dados são usados só para o agendamento.” Menos campos, mais envios.',
          ],
          practice: 'Liste as 5 objeções mais prováveis do seu negócio fictício e escreva uma resposta curta para cada.',
          task: 'Escreva a seção de prova social, o FAQ (5 perguntas) e o formulário da sua landing page.',
          checklist: ['Sei o que torna prova social crível', 'Mapeio e respondo objeções', 'Peço só os campos necessários', 'Informo a finalidade dos dados'],
        }),
      ],
      {
        title: 'Copy e estrutura completa de uma landing page',
        objective: 'Escrever uma landing page inteira, pronta para virar design.',
        steps: [
          'Defina a origem do tráfego e a promessa (coerente com ela).',
          'Escreva o hero: 5 títulos, o escolhido, subtítulo, botão e microtexto.',
          'Escreva o texto de todas as seções da estrutura de 8 partes.',
          'Escreva 3 depoimentos de exemplo (marcados como fictícios) e o FAQ com 5 perguntas.',
          'Defina o formulário (campos, texto pós-envio e aviso de privacidade).',
          'Revise: benefícios no lugar de características, um único CTA, linguagem do cliente.',
        ],
        checklist: ['Origem e promessa definidas', 'Hero completo', '8 seções escritas', 'Prova social e FAQ', 'Formulário definido', 'Revisão feita'],
        template:
          'ORIGEM DO TRÁFEGO:\nPROMESSA:\n\nHERO\nTítulos (5):\n1)\n2)\n3)\n4)\n5)\nEscolhido:\nSubtítulo:\nBotão:\nMicrotexto:\n\nIDENTIFICAÇÃO:\nSOLUÇÃO:\nCOMO FUNCIONA:\nPROVA SOCIAL:\nOFERTA:\nFAQ:\nCTA FINAL:\n\nFORMULÁRIO\nCampos:\nDepois do envio:\nAviso de privacidade:\n',
      },
    ),
    M(
      'm07',
      'Sites Institucionais',
      'Páginas essenciais, mapa do site, navegação e SEO básico.',
      [
        L('a1', 7, 'Páginas essenciais e mapa do site', {
          objective: 'Planejar um site completo para uma empresa ou profissional.',
          content: [
            'O **site institucional** apresenta o negócio como um todo e atende vários públicos: quem quer contratar, quem quer conferir se a empresa é séria, quem procura endereço ou telefone, quem quer trabalhar lá. Por isso tem várias páginas, cada uma com seu objetivo.',
            'Páginas essenciais para negócios de serviço: **Home** (resumo de tudo e caminhos para o resto), **Serviços** (uma página por serviço importante ajuda muito no Google), **Sobre / Equipe** (quem atende e por que confiar), **Depoimentos ou Casos**, **Contato** (formulário, WhatsApp, mapa, horários) e **Política de privacidade**. Blog só faz sentido se alguém vai escrever com frequência.',
            'A **home** de um site institucional funciona como uma landing page com várias saídas: hero com proposta clara → serviços em cards levando às páginas → diferenciais → prova social → sobre resumido → CTA. O visitante deve achar o caminho para o que procura em 1 clique.',
          ],
          concepts: [
            ['Site institucional', 'Site de várias páginas que apresenta o negócio inteiro.'],
            ['Página de serviço', 'Página dedicada a um serviço — boa para SEO e para conversão.'],
            ['Home', 'Página de entrada que resume e distribui o visitante.'],
            ['Política de privacidade', 'Página obrigatória quando o site coleta dados pessoais.'],
          ],
          example: [
            'Mapa do site do Alma Pilates:',
            {
              list: [
                'Home',
                'Aulas → Pilates para dor nas costas · Pilates para gestantes · Pilates 60+',
                'Planos e horários',
                'Equipe (fisioterapeutas e formação)',
                'Depoimentos',
                'Contato (WhatsApp, mapa, estacionamento)',
                'Política de privacidade',
              ],
            },
          ],
          practice: 'Escolha um negócio local e desenhe o mapa do site ideal. Compare com o site atual dele (se existir).',
          task: 'Monte o mapa do site do seu negócio fictício e escreva o objetivo de cada página em uma frase.',
          checklist: ['Sei quando usar site institucional × landing page', 'Conheço as páginas essenciais', 'Escrevi o objetivo de cada página'],
        }),
        L('a2', 8, 'Navegação, SEO básico e conteúdo', {
          objective: 'Fazer o site ser fácil de navegar e encontrado no Google.',
          content: [
            '**Navegação**: menu com até 5 ou 6 itens, nomes óbvios (“Serviços”, não “Soluções integradas”), botão de ação destacado no cabeçalho e o mesmo menu em todas as páginas. No celular, o menu vira um ícone, mas o botão principal (ex.: WhatsApp) deve continuar visível.',
            '**SEO básico** (otimização para buscadores): cada página tem um **título** e uma **descrição** próprios que aparecem no Google; um único título principal (H1) com a palavra que as pessoas pesquisam (“pilates para dor nas costas em Curitiba”); URLs legíveis (/aulas/pilates-dor-nas-costas); textos que respondem às dúvidas reais; imagens com texto alternativo. Para negócios locais, o **Perfil da Empresa no Google** (Google Maps) costuma trazer mais clientes que o próprio site — ligue um ao outro.',
            '**Conteúdo**: o maior atraso de projetos é esperar o cliente mandar textos e fotos. Envie um formulário de conteúdo logo no início, combine prazos e ofereça escrever os textos a partir de uma entrevista. Fotos reais do negócio valem mais que bancos de imagem.',
          ],
          concepts: [
            ['SEO', 'Práticas para o site aparecer nas buscas.'],
            ['Título e descrição', 'O que aparece no resultado do Google; um por página.'],
            ['H1', 'O título principal da página; deve conter o tema buscado.'],
            ['Perfil da Empresa no Google', 'Ficha no Google Maps, decisiva para negócios locais.'],
          ],
          example: [
            {
              table: [
                ['Página', 'Título (Google)', 'H1'],
                ['Home', 'Alma Pilates | Pilates no Batel, Curitiba', 'Pilates para aliviar dor nas costas'],
                ['Aula para dor nas costas', 'Pilates para dor nas costas em Curitiba | Alma', 'Pilates para dor lombar e hérnia'],
                ['Contato', 'Contato e horários | Alma Pilates', 'Agende sua aula experimental'],
              ],
            },
          ],
          practice: 'Pesquise no Google um serviço + sua cidade e observe os títulos e descrições dos 5 primeiros resultados. O que eles têm em comum?',
          task: 'Escreva o menu, e para cada página do seu mapa: título, descrição (até ~155 caracteres) e H1.',
          checklist: [
            'Sei montar um menu claro',
            'Sei escrever título, descrição e H1',
            'Sei a importância do Perfil da Empresa no Google',
            'Tenho um plano para coletar conteúdo',
          ],
        }),
      ],
      {
        title: 'Planejamento de um site institucional',
        objective: 'Planejar páginas, navegação, SEO e conteúdo de um site completo.',
        steps: [
          'Monte o mapa do site com o objetivo de cada página.',
          'Defina o menu e o botão de ação do cabeçalho.',
          'Escreva título, descrição e H1 de todas as páginas.',
          'Faça a estrutura de seções da home.',
          'Monte o formulário de conteúdo que você enviaria ao cliente (textos e fotos que precisa receber).',
        ],
        checklist: ['Mapa do site', 'Menu definido', 'SEO de cada página', 'Estrutura da home', 'Formulário de conteúdo'],
        template:
          'MAPA DO SITE (página — objetivo)\n\nMENU:\nBOTÃO DO CABEÇALHO:\n\nSEO (página — título — descrição — H1)\n\nHOME (seções)\n1)\n2)\n3)\n4)\n5)\n\nFORMULÁRIO DE CONTEÚDO PARA O CLIENTE\n- Textos:\n- Fotos:\n- Depoimentos:\n- Prazo:\n',
      },
    ),
    M(
      'm08',
      'Responsividade',
      'Mobile first, breakpoints, desempenho e testes em dispositivos reais.',
      [
        L('a1', 8, 'Mobile first e breakpoints', {
          objective: 'Projetar sites que funcionam bem primeiro no celular.',
          content: [
            'Na maioria dos negócios locais, **a maior parte das visitas vem do celular** — confira nos dados de cada cliente. **Mobile first** significa desenhar primeiro a versão do celular, onde o espaço obriga a priorizar, e depois expandir para telas maiores. O caminho inverso costuma gerar sites de celular apertados e confusos.',
            '**Breakpoints** são as larguras em que o layout muda. Em vez de desenhar para modelos de aparelho, pense em faixas: celular (até ~640 px), tablet (~768 px), notebook (~1024 px) e telas grandes (~1280 px ou mais). Em cada faixa: quantas colunas, tamanho de títulos, o que some ou muda de lugar.',
            'Regras práticas para celular: uma coluna, títulos menores (mas texto corrido continua com 16 px), botões largos e fáceis de tocar, telefone e WhatsApp clicáveis, menu simples, nada de textos dentro de imagens, formulários curtos com o teclado certo (numérico para telefone).',
          ],
          concepts: [
            ['Mobile first', 'Desenhar primeiro para a tela menor.'],
            ['Breakpoint', 'Largura em que o layout se reorganiza.'],
            ['Layout fluido', 'Elementos que se adaptam à largura disponível.'],
            ['Polegar', 'A área da tela que o dedão alcança — onde ficam as ações.'],
          ],
          example: [
            'Hero do Alma Pilates no desktop: texto à esquerda, foto à direita. No celular: título curto, subtítulo de 2 linhas, botão largo “Agendar aula grátis”, e a foto vem **depois** do botão — a ação aparece sem rolar. Um botão flutuante de WhatsApp acompanha a rolagem.',
          ],
          practice: 'Abra 3 sites no celular e anote: a ação principal aparece sem rolar? O texto é legível sem zoom? Os botões são fáceis de tocar?',
          task: 'Descreva como cada seção da sua landing page muda do desktop para o celular (ordem, colunas, o que some).',
          checklist: ['Desenho começando pelo celular', 'Conheço as faixas de breakpoint', 'Sei as regras práticas para celular'],
        }),
        L('a2', 9, 'Desempenho, imagens e testes em dispositivos', {
          objective: 'Garantir que o site carregue rápido e funcione em aparelhos reais.',
          content: [
            'Site lento perde visitantes antes de mostrar qualquer coisa. O Google mede a experiência com as **Core Web Vitals**: **LCP** (quanto tempo o maior elemento leva para aparecer — ideal até 2,5 s), **INP** (quão rápido a página responde a um toque — ideal até 200 ms) e **CLS** (quanto o layout “pula” enquanto carrega — ideal abaixo de 0,1). O **PageSpeed Insights** mostra esses números de graça.',
            'O maior vilão costuma ser **imagem pesada**. Exporte no tamanho em que será exibida (não uma foto de 5000 px para um espaço de 800 px), use formatos modernos como **WebP** ou **AVIF**, comprima e carregue sob demanda as imagens que ficam mais abaixo. Vídeo de fundo e muitas fontes também pesam.',
            '**Teste em aparelhos reais**, não só redimensionando o navegador: um Android intermediário, um iPhone, com internet móvel. Checklist: o menu abre? Os botões funcionam? O formulário envia e chega? O WhatsApp abre com mensagem pronta? Nada fica cortado na horizontal? O texto é legível com o brilho baixo?',
          ],
          concepts: [
            ['Core Web Vitals', 'Métricas do Google para velocidade e estabilidade (LCP, INP, CLS).'],
            ['WebP / AVIF', 'Formatos de imagem leves para a web.'],
            ['Carregamento sob demanda', 'Imagens abaixo da tela carregam só quando necessário.'],
            ['Teste em dispositivo real', 'Conferir em aparelhos e redes de verdade.'],
          ],
          example: [
            'A página do Alma Pilates tinha LCP de 5,8 s no celular por causa de uma foto de 4,2 MB no hero. Depois de exportar em 1600 px, converter para WebP (180 KB) e remover uma fonte não usada, o LCP caiu para 1,9 s — e o envio de formulários pelo celular subiu na semana seguinte.',
          ],
          practice: 'Rode o PageSpeed Insights em 2 sites e anote LCP, INP e CLS no celular. Qual é o maior problema apontado?',
          task: 'Monte seu checklist de testes antes de publicar (pelo menos 12 itens) e aplique em um site real.',
          checklist: ['Conheço LCP, INP e CLS', 'Sei otimizar imagens', 'Testo em aparelhos reais', 'Tenho um checklist de testes'],
        }),
      ],
      {
        title: 'Auditoria mobile de 3 sites',
        objective: 'Avaliar a experiência no celular e propor correções priorizadas.',
        steps: [
          'Escolha 3 sites de negócios locais.',
          'Abra cada um no celular e aplique seu checklist de testes.',
          'Rode o PageSpeed Insights (celular) e anote LCP, INP e CLS.',
          'Liste os 3 problemas mais graves de cada site.',
          'Proponha correções priorizadas por impacto e esforço.',
        ],
        checklist: ['3 sites escolhidos', 'Checklist aplicado no celular', 'Métricas do PageSpeed anotadas', 'Problemas listados', 'Correções priorizadas'],
        template:
          'SITE 1: https://\nLCP: | INP: | CLS:\nAção principal visível sem rolar? \nProblemas:\n1)\n2)\n3)\nCorreções (impacto/esforço):\n\nSITE 2:\n\nSITE 3:\n\nCONCLUSÃO:\n',
      },
    ),
    M(
      'm09',
      'Conversão e CRO',
      'Princípios de conversão, funil, formulários, testes e métricas.',
      [
        L('a1', 9, 'Princípios de conversão e o funil do site', {
          objective: 'Entender por que visitantes agem ou vão embora.',
          content: [
            '**CRO** (otimização da taxa de conversão) é melhorar o site para que mais visitantes façam a ação desejada, sem precisar trazer mais tráfego. A conta é simples: **taxa de conversão = conversões ÷ visitantes × 100**. Dobrar a conversão tem o mesmo efeito que dobrar o tráfego — e custa muito menos.',
            'Um jeito útil de pensar: a ação acontece quando **motivação** (a pessoa quer resolver o problema), **clareza** (entende a oferta) e **confiança** (acredita) superam o **atrito** (esforço, dúvida, medo). Você aumenta os três primeiros e reduz o último.',
            'Olhe o site como um **funil**: visitas → leram o hero → rolaram até a oferta → clicaram no CTA → enviaram o formulário → viraram cliente. Medindo cada etapa, você descobre **onde** as pessoas desistem. Não adianta mudar a cor do botão se 70% saem antes de rolar.',
          ],
          concepts: [
            ['CRO', 'Otimização da taxa de conversão.'],
            ['Taxa de conversão', 'Conversões ÷ visitantes × 100.'],
            ['Atrito', 'Tudo que dificulta ou assusta no caminho até a ação.'],
            ['Funil', 'Etapas do visitante até a ação; mostra onde ele desiste.'],
          ],
          example: [
            'Alma Pilates, mês passado: 2.000 visitas, 260 cliques no botão, 40 formulários enviados, 22 aulas agendadas. Conversão da página (formulários ÷ visitas) = 2%. O gargalo está entre o clique (13%) e o envio: muita gente clica e desiste no formulário.',
          ],
          practice: 'Pense em uma compra que você abandonou num site. Qual foi o atrito? O que teria feito você continuar?',
          task: 'Desenhe o funil do seu negócio fictício com as etapas e as métricas que você mediria em cada uma.',
          checklist: ['Sei calcular taxa de conversão', 'Entendo motivação, clareza, confiança e atrito', 'Sei montar um funil e achar o gargalo'],
        }),
        L('a2', 10, 'CTAs, formulários, testes e métricas', {
          objective: 'Melhorar a conversão com mudanças medidas, não com achismo.',
          content: [
            '**Onde mexer primeiro** (em geral, maior impacto): clareza da promessa no hero, CTA visível sem rolar e repetido ao longo da página, formulário mais curto, prova social perto do CTA, velocidade no celular, opção de contato direto (WhatsApp com mensagem pronta). Mudanças de cor e microdetalhes vêm depois.',
            '**Medição**: instale uma ferramenta de análise (como o Google Analytics) e registre os **eventos** importantes — clique no botão, envio do formulário, clique no WhatsApp. Ferramentas de mapa de calor e gravação de sessões (como o Microsoft Clarity, gratuito) mostram onde as pessoas clicam e até onde rolam. Ao usar essas ferramentas, informe na política de privacidade.',
            '**Testes**: mude **uma coisa por vez** e compare períodos ou versões (teste A/B). Teste A/B precisa de volume — com poucas visitas por semana, a diferença pode ser acaso. Em sites pequenos, prefira melhorias claras baseadas em boas práticas e em gravações de sessão, e acompanhe a tendência por algumas semanas. Priorize ideias com a nota **ICE**: impacto, confiança e facilidade, de 1 a 10.',
          ],
          concepts: [
            ['Evento', 'Ação registrada pela ferramenta de análise (clique, envio).'],
            ['Mapa de calor', 'Visualização de onde as pessoas clicam e até onde rolam.'],
            ['Teste A/B', 'Comparar duas versões mudando uma única variável.'],
            ['ICE', 'Priorização por Impacto, Confiança e Facilidade.'],
          ],
          example: [
            {
              table: [
                ['Ideia (Alma Pilates)', 'Impacto', 'Confiança', 'Facilidade', 'ICE'],
                ['Reduzir formulário de 8 para 3 campos', '8', '8', '9', '25'],
                ['Adicionar WhatsApp com mensagem pronta', '7', '7', '10', '24'],
                ['Depoimento ao lado do formulário', '6', '6', '8', '20'],
                ['Trocar a cor do botão', '3', '3', '10', '16'],
              ],
            },
          ],
          practice: 'Instale (ou simule) o Microsoft Clarity em um site seu ou de teste e observe 5 gravações. O que você percebeu que não esperava?',
          task: 'Liste 8 ideias de melhoria para uma página e priorize com a nota ICE.',
          checklist: ['Sei onde mexer primeiro', 'Sei quais eventos medir', 'Entendo os limites do teste A/B', 'Priorizo com ICE'],
        }),
      ],
      {
        title: 'Auditoria de conversão com dados fictícios',
        objective: 'Encontrar o gargalo de uma página e decidir o que melhorar primeiro.',
        steps: [
          'Analise a tabela de resultados da landing page do Alma Pilates abaixo.',
          'Calcule, para cada origem: taxa de clique (cliques ÷ visitas), taxa de envio (formulários ÷ cliques) e conversão final (aulas ÷ visitas).',
          'Identifique o maior gargalo e a origem com pior desempenho.',
          'Use as informações extras para levantar hipóteses.',
          'Proponha 5 melhorias priorizadas com ICE e diga como vai medir cada uma.',
        ],
        data: [
          {
            table: [
              ['Origem', 'Aparelho', 'Visitas', 'Cliques no CTA', 'Formulários', 'Aulas agendadas'],
              ['Instagram', 'Celular', '1.840', '210', '38', '21'],
              ['Google', 'Celular', '620', '95', '31', '19'],
              ['Google', 'Computador', '410', '72', '29', '17'],
              ['Link no WhatsApp', 'Celular', '300', '60', '6', '4'],
            ],
          },
          'Informações extras: o formulário tem 9 campos; no celular, o botão do WhatsApp só aparece depois de 3 rolagens; o carregamento no celular leva 5,8 s; quem chega pelo link do WhatsApp já conversou com a recepção antes.',
        ],
        checklist: ['Taxas calculadas por origem', 'Gargalo identificado', 'Hipóteses com base nas informações extras', '5 melhorias com ICE', 'Forma de medir cada melhoria'],
        template:
          'TAXAS (clique / envio / conversão final)\nInstagram celular:\nGoogle celular:\nGoogle computador:\nWhatsApp celular:\n\nMAIOR GARGALO:\nPIOR ORIGEM:\n\nHIPÓTESES\n1)\n2)\n3)\n\nMELHORIAS (ICE — como medir)\n1)\n2)\n3)\n4)\n5)\n',
      },
    ),
    M(
      'm10',
      'IA para Criação de Sites',
      'IA para estrutura, copy, layout e imagens — e como revisar o que ela gera.',
      [
        L('a1', 11, 'IA para pesquisa, estrutura e copy', {
          objective: 'Usar ChatGPT e Claude para acelerar o planejamento sem perder o julgamento.',
          content: [
            'Usos de maior valor no começo do projeto: **organizar o briefing** (colar a transcrição da reunião e pedir um resumo estruturado), **mapear objeções** do público, **propor estruturas de página**, **gerar variações de títulos e CTAs** e **revisar textos** contra o tom de voz. A IA acelera o rascunho; quem decide é você.',
            'Use a mesma estrutura de prompt das outras áreas: **Papel + Contexto + Tarefa + Formato + Restrições + Exemplo**. Para sites, o contexto precisa incluir o objetivo da página, a origem do tráfego, a persona, as objeções e o tom de voz. Sem isso, a resposta é a landing page genérica que todo mundo já viu.',
            'Organize cada cliente em um **projeto do Claude** com o documento mestre (briefing, persona, diferenciais, depoimentos reais, tom de voz, palavras proibidas). Assim, toda página nova nasce com o contexto certo e a copy fica consistente entre as páginas.',
          ],
          concepts: [
            ['Contexto', 'Informações do negócio e do público que tornam a resposta específica.'],
            ['Rascunho × decisão', 'A IA propõe; o profissional escolhe e edita.'],
            ['Documento mestre', 'Fonte única de verdade do cliente, usada em todos os prompts.'],
            ['Iteração', 'Gerar, escolher, pedir crítica e refinar em rodadas.'],
          ],
          example: [
            {
              prompt:
                'Você é um especialista em landing pages para pequenos negócios de saúde e bem-estar.\nContexto: Alma Pilates, estúdio no Batel (Curitiba), turmas de até 4 alunas, aulas com fisioterapeutas. Público: mulheres de 35–55 anos com dor nas costas, que passam o dia sentadas. Origem do tráfego: Reels no Instagram sobre dor lombar. Objetivo: agendar aula experimental grátis.\nObjeções: "nunca fiz exercício", "tenho hérnia", "não tenho tempo", "deve ser caro".\nTarefa: proponha a estrutura de seções da landing page e escreva 10 opções de título para o hero.\nFormato: lista de seções (com a objeção que cada uma responde) + tabela de títulos com a fórmula usada.\nRestrições: sem promessas de cura, sem jargão técnico, sem "transforme sua vida".',
            },
          ],
          practice: 'Rode o prompt acima (ou uma versão para outro negócio), depois peça: “Critique sua própria estrutura: o que está genérico?” Compare as duas respostas.',
          task: 'Escreva 3 prompts reutilizáveis para sites: um de estrutura de página, um de títulos e um de revisão de copy. Guarde na Biblioteca.',
          checklist: ['Uso a estrutura de prompt em 6 partes', 'Incluo objetivo, origem e objeções no contexto', 'Organizo clientes em projetos', 'Criei 3 prompts reutilizáveis'],
        }),
        L('a2', 11, 'IA para layout, imagens e construtores — e como revisar', {
          objective: 'Gerar páginas com IA rapidamente e revisá-las com olhar profissional.',
          content: [
            'Ferramentas como **v0**, **Lovable**, **Bolt** e os recursos de IA do **Framer** geram páginas a partir de uma descrição. Elas são ótimas para **explorar layouts**, montar protótipos e chegar rápido a uma primeira versão. A regra é a mesma da social media: **estratégia e copy primeiro, ferramenta depois**. Quem começa pedindo “um site bonito para pilates” recebe exatamente o site genérico que mil pessoas também receberam.',
            'Para **imagens**, a IA ajuda com ilustrações, fundos e variações, mas negócios locais vendem confiança — **fotos reais** do lugar, da equipe e dos clientes quase sempre convertem melhor. Nunca use imagens geradas que pareçam ser clientes ou resultados reais: isso engana o visitante e pode violar regras do nicho.',
            'Checklist de revisão de tudo que a IA gera: **1)** a estrutura segue as dúvidas do visitante? **2)** os textos são específicos deste negócio? **3)** há promessas exageradas ou dados inventados? **4)** a hierarquia visual está clara? **5)** o contraste passa em 4,5:1? **6)** funciona bem no celular? **7)** o código ou construtor gerado é algo que você consegue manter e entregar ao cliente?',
          ],
          concepts: [
            ['Gerador de páginas', 'Ferramenta que cria layout (e às vezes código) a partir de texto.'],
            ['Protótipo rápido', 'Primeira versão para validar ideia, não o produto final.'],
            ['Imagem real × gerada', 'Fotos reais constroem confiança; geradas não podem simular clientes.'],
            ['Manutenção', 'Capacidade de editar e evoluir o site depois da entrega.'],
          ],
          example: [
            '**Pedido fraco:** “Crie um site bonito para um estúdio de pilates.” → hero com “Transforme seu corpo e sua mente”, foto genérica e 4 serviços inventados.',
            '**Pedido forte:** a estrutura e a copy aprovadas (do projeto do Claude) + guia visual (fontes, cores, espaçamentos) + “uma coluna no celular, botão fixo de WhatsApp, contraste mínimo 4,5:1”. Resultado: uma primeira versão próxima do final, que você ajusta em vez de refazer.',
          ],
          practice: 'Gere a mesma página em uma ferramenta de IA com o pedido fraco e com o pedido forte. Passe as duas pelo checklist de 7 pontos.',
          task: 'Documente: o prompt usado, o que a IA gerou, os problemas encontrados no checklist e o que você corrigiu.',
          checklist: [
            'Sei onde geradores de página entram no fluxo',
            'Uso fotos reais para provar confiança',
            'Aplico o checklist de 7 pontos',
            'Avalio se consigo manter o que foi gerado',
          ],
        }),
      ],
      {
        title: 'Uma landing page criada com IA',
        objective: 'Executar o fluxo completo com IA — e documentar onde o seu julgamento entrou.',
        steps: [
          'Crie um projeto no Claude para o negócio fictício com o documento mestre.',
          'Use a IA para propor estrutura e títulos; escolha e justifique.',
          'Escreva e revise a copy no tom da marca.',
          'Gere a página em uma ferramenta de IA (v0, Lovable, Framer AI ou outra) usando copy e guia visual aprovados.',
          'Passe o resultado pelo checklist de 7 pontos e corrija.',
          'Registre os prompts e compare a versão da IA com a sua versão final.',
        ],
        checklist: [
          'Projeto com documento mestre',
          'Estrutura e títulos escolhidos',
          'Copy revisada',
          'Página gerada com IA',
          'Checklist aplicado e correções feitas',
          'Prompts e comparação documentados',
        ],
        template:
          'NEGÓCIO:\n\nPROMPTS USADOS\nEstrutura:\nTítulos:\nGeração da página:\n\nLINK DA PÁGINA:\n\nCHECKLIST (problemas encontrados)\n1) Estrutura:\n2) Especificidade:\n3) Promessas/dados:\n4) Hierarquia:\n5) Contraste:\n6) Celular:\n7) Manutenção:\n\nIA × VERSÃO FINAL\n\nO QUE APRENDI:\n',
      },
    ),
    M(
      'm11',
      'Ferramentas',
      'Figma, construtores (Framer, Webflow, WordPress) e publicação com domínio próprio.',
      [
        L('a1', 12, 'Figma essencial para sites', {
          objective: 'Usar o Figma para wireframes, layouts e entrega organizada.',
          content: [
            'O **Figma** é a ferramenta padrão de design de interfaces: roda no navegador, tem plano gratuito e permite que o cliente comente direto no layout. Para sites, você vai usar principalmente **frames** (as telas: desktop com 1440 px de largura, celular com 390 px), **auto layout** (caixas que se ajustam ao conteúdo, como na web) e **componentes** (botão, card, cabeçalho reutilizáveis).',
            'Organize o arquivo em páginas: **Referências**, **Wireframes**, **Guia visual** (cores, textos e componentes), **Layout desktop**, **Layout celular** e **Entrega**. Use estilos de cor e de texto em vez de valores soltos — trocar a cor principal do site inteiro vira um clique.',
            'Na apresentação ao cliente, mostre o layout dentro de um contexto (celular e notebook), conte a história das decisões (“o botão está aqui porque…”) e peça comentários no próprio Figma, com prazo. Para construir depois, o Figma também mostra medidas, cores e textos de cada elemento.',
          ],
          concepts: [
            ['Frame', 'A “tela” em que você desenha (desktop, celular).'],
            ['Auto layout', 'Recurso que organiza elementos com espaçamento automático.'],
            ['Componente', 'Elemento mestre reutilizável; mudar o mestre muda todas as cópias.'],
            ['Estilos', 'Cores e textos salvos para manter consistência.'],
          ],
          example: [
            'Arquivo do Alma Pilates: página “Guia visual” com 5 estilos de cor e 6 de texto · componentes Botão (primário/secundário), Card de plano e Depoimento · frames “Home — 1440” e “Home — 390” · link de comentário enviado à cliente com prazo de 48 h.',
          ],
          practice: 'Crie um arquivo no Figma, um frame de 390 px e monte um botão com auto layout que cresce conforme o texto.',
          task: 'Monte no Figma o guia visual do seu negócio fictício (estilos de cor e texto + 3 componentes).',
          checklist: ['Sei criar frames de desktop e celular', 'Uso auto layout', 'Crio componentes e estilos', 'Organizo o arquivo em páginas'],
        }),
        L('a2', 13, 'Construtores e publicação: Framer, Webflow, WordPress, domínio e hospedagem', {
          objective: 'Escolher a ferramenta certa para cada projeto e colocar o site no ar.',
          content: [
            '**Framer**: muito rápido para landing pages e sites de apresentação, com animações e recursos de IA; ótimo para quem vem do Figma. **Webflow**: mais controle de layout e um bom gerenciador de conteúdo para sites com muitas páginas (blog, cases); curva de aprendizado maior. **WordPress** (com construtores visuais): o mais usado no mundo, com muitos plugins; exige mais cuidado com atualizações, segurança e velocidade. Os três têm custos mensais diferentes — confira os planos atuais antes de orçar.',
            'Como escolher: pense em **quem vai editar depois** (o cliente quer mudar textos sozinho?), **quantas páginas** e **que tipo de conteúdo** terá, **orçamento mensal** do cliente e **integrações** necessárias (agenda, pagamentos, formulários). A melhor ferramenta é a que o projeto precisa e que você domina — não a da moda.',
            '**Publicação**: o **domínio** (ex.: almapilates.com.br) é registrado no Registro.br para endereços .br; a **hospedagem** é onde o site fica (os construtores já incluem). Deixe o domínio **no nome do cliente** — ele é dono do endereço. Depois de publicar: certificado de segurança (cadeado) ativo, redirecionamentos de páginas antigas, formulários testados, Google Search Console e ferramenta de análise configurados.',
          ],
          concepts: [
            ['Construtor visual', 'Ferramenta para montar sites sem escrever código.'],
            ['CMS', 'Gerenciador de conteúdo: permite editar textos e posts sem mexer no layout.'],
            ['Domínio', 'O endereço do site; deve ficar registrado no nome do cliente.'],
            ['Hospedagem', 'Serviço onde o site fica armazenado e disponível.'],
          ],
          example: [
            {
              table: [
                ['Projeto', 'Ferramenta sugerida', 'Por quê'],
                ['Landing de aula experimental', 'Framer', 'Rápido, visual, fácil de ajustar'],
                ['Site da clínica com 15 páginas e blog', 'Webflow', 'CMS forte e controle de layout'],
                ['Loja pequena com muitos plugins', 'WordPress', 'Ecossistema de plugins e integrações'],
              ],
            },
          ],
          practice: 'Crie uma conta gratuita em um construtor e publique uma página de teste em um endereço provisório.',
          task: 'Para o seu negócio fictício, escolha a ferramenta e justifique; depois liste o checklist de publicação.',
          checklist: [
            'Conheço os pontos fortes de Framer, Webflow e WordPress',
            'Sei escolher pela necessidade do projeto',
            'Sei registrar domínio no nome do cliente',
            'Tenho um checklist de publicação',
          ],
        }),
      ],
      {
        title: 'Publicar uma página no ar',
        objective: 'Levar uma página do design à internet, com o checklist de publicação completo.',
        steps: [
          'Escolha o construtor e justifique a escolha.',
          'Monte a landing page do Exercício 6 (ou a gerada no Exercício 10) com o guia visual.',
          'Faça a versão de celular e teste em 2 aparelhos reais.',
          'Publique em endereço provisório ou domínio próprio.',
          'Aplique o checklist de publicação e rode o PageSpeed Insights.',
          'Salve o link na Biblioteca.',
        ],
        checklist: ['Ferramenta escolhida e justificada', 'Página montada', 'Testada no celular', 'Publicada', 'Checklist de publicação aplicado', 'Link salvo na Biblioteca'],
        template:
          'FERRAMENTA:\nPOR QUÊ:\n\nLINK PUBLICADO:\n\nTESTES NO CELULAR\nAparelho 1:\nAparelho 2:\n\nPAGESPEED (celular)\nLCP: | INP: | CLS:\n\nCHECKLIST DE PUBLICAÇÃO\n[ ] Cadeado (HTTPS)\n[ ] Formulário testado\n[ ] WhatsApp com mensagem pronta\n[ ] Título e descrição\n[ ] Análise instalada\n[ ] Política de privacidade\n',
      },
    ),
    M(
      'm12',
      'Projeto Final e Primeiro Serviço',
      'Briefing, proposta, precificação, entrega, portfólio e primeiros clientes.',
      [
        L('a1', 14, 'Briefing, proposta e precificação', {
          objective: 'Vender um projeto de site com escopo claro e preço sustentável.',
          content: [
            'O **briefing** de site precisa responder: objetivo do site (qual ação), público e origem do tráfego, páginas necessárias, conteúdo disponível (textos, fotos, depoimentos), referências que o cliente gosta e não gosta, integrações (agenda, WhatsApp, pagamento), quem vai editar depois, prazo e orçamento. Sem essas respostas, qualquer preço é chute.',
            'A **proposta** segue a lógica: diagnóstico (o que você viu) → objetivo → solução (páginas e entregas) → etapas e prazos com pontos de aprovação → **o que não está incluso** → investimento e forma de pagamento → próximos passos. Defina **rodadas de revisão** (ex.: 2 por etapa) e o que acontece depois da entrega (suporte por 30 dias, manutenção mensal opcional).',
            'Para **precificar**, estime as horas por etapa (briefing, estrutura, copy, design, construção, testes, publicação, reuniões), multiplique pelo seu valor-hora e some uma margem para imprevistos. Ofereça pacotes simples — por exemplo, landing page, site institucional pequeno e manutenção mensal — e pesquise o que profissionais do seu nível e da sua região cobram. Custos de ferramenta e domínio devem estar claros (quem paga e quanto).',
          ],
          concepts: [
            ['Escopo', 'Páginas, entregas e limites descritos por escrito.'],
            ['Rodada de revisão', 'Uma volta de ajustes pedida pelo cliente em uma etapa.'],
            ['Manutenção', 'Serviço recorrente de atualização, ajustes e suporte.'],
            ['Valor-hora', 'Base do preço: horas estimadas × valor + margem.'],
          ],
          example: [
            'Landing page do Alma Pilates: briefing 2 h · estrutura e wireframe 4 h · copy 4 h · design 6 h · construção 8 h · testes e publicação 3 h · reuniões 3 h = 30 h. Com esse número você define o preço sabendo quanto ganha por hora — e percebe quantos projetos cabem por mês. Manutenção mensal opcional: até 2 h de ajustes + relatório simples.',
          ],
          practice: 'Liste suas horas disponíveis por semana e calcule quantas landing pages você consegue entregar por mês com qualidade.',
          task: 'Monte 3 pacotes (landing page, site institucional pequeno, manutenção) com entregas, prazos, revisões e estimativa de horas.',
          checklist: ['Sei o que perguntar no briefing de site', 'Sei estruturar uma proposta', 'Defino o que não está incluso', 'Precifico a partir de horas'],
        }),
        L('a2', 14, 'Entrega, case de portfólio e primeiros clientes', {
          objective: 'Entregar com profissionalismo e transformar projetos em novos clientes.',
          content: [
            '**Entrega**: transfira acessos (construtor, domínio, análise) para o cliente ou deixe-o como dono, entregue um guia curto de como editar textos e imagens, grave um vídeo de 5 minutos mostrando o painel e combine o período de suporte. Um mês depois, mande os primeiros números (visitas, cliques, formulários) — isso abre espaço para a manutenção.',
            '**Portfólio sem clientes**: o Projeto Final desta trilha (deixe claro que é um estudo de caso), redesenhos de sites reais com “antes e depois” e o raciocínio, e o seu próprio site. Um bom case mostra **problema → processo → solução → resultado (ou resultado esperado)**, não só imagens bonitas.',
            '**Primeiros clientes**: comece pela rede próxima e por negócios locais com site fraco ou sem site. Em vez de “faço sites”, envie um **mini diagnóstico**: 3 melhorias concretas com print do problema (método do Módulo 1). Considere 1 ou 2 projetos piloto com prazo definido, em troca de depoimento e permissão para usar como case.',
          ],
          concepts: [
            ['Entrega', 'Site no ar + acessos + orientação de uso + suporte combinado.'],
            ['Estudo de caso', 'Problema, processo, solução e resultado de um projeto.'],
            ['Mini diagnóstico', 'Análise curta e gratuita que prova sua competência.'],
            ['Projeto piloto', 'Primeiro trabalho com condição especial e contrapartida.'],
          ],
          example: [
            '**Abordagem ruim:** “Oi! Faço sites, tem interesse?”',
            '**Abordagem boa:** “Oi, Paula! Vi o site do estúdio no celular e separei 3 ajustes rápidos que podem trazer mais agendamentos: (1) o botão de agendar só aparece depois de 3 rolagens, (2) o formulário pede 9 campos, (3) a página leva quase 6 segundos para carregar. Se fizer sentido, te mostro em 15 minutos como resolver.”',
          ],
          practice: 'Escolha 3 negócios locais e anote, para cada um, as 3 melhorias que você enviaria (com print).',
          task: 'Escreva sua mensagem de abordagem, a estrutura do seu case de portfólio e o checklist de entrega.',
          checklist: ['Sei entregar com acessos e orientação', 'Sei montar um case', 'Tenho uma mensagem de abordagem', 'Tenho um checklist de entrega'],
        }),
      ],
      {
        title: 'Proposta comercial completa',
        objective: 'Desenhar a oferta de ponta a ponta como se fosse começar com um cliente amanhã.',
        steps: [
          'Escreva o roteiro de briefing (pelo menos 15 perguntas, agrupadas por tema).',
          'Defina 3 pacotes com entregas, prazos, revisões e horas estimadas.',
          'Escreva a proposta para o negócio fictício seguindo a estrutura da aula.',
          'Liste o que não está incluso e as condições de pagamento.',
          'Escreva o checklist de entrega e a mensagem de abordagem.',
        ],
        checklist: ['Roteiro de briefing', '3 pacotes definidos', 'Proposta escrita', 'Escopo negativo e pagamento', 'Checklist de entrega e abordagem'],
        template:
          'ROTEIRO DE BRIEFING\nNegócio:\nObjetivo:\nPúblico:\nConteúdo:\nTécnico:\n\nPACOTES\n1) Landing page —\n2) Site institucional —\n3) Manutenção —\n\nPROPOSTA\nDiagnóstico:\nObjetivo:\nSolução:\nEtapas e prazos:\nNão incluso:\nInvestimento:\nPróximos passos:\n\nCHECKLIST DE ENTREGA:\n\nMENSAGEM DE ABORDAGEM:\n',
      },
    ),
  ],
  project: {
    title: 'Projeto Final — Landing page profissional para uma empresa fictícia',
    description: 'Do briefing à publicação, com um case pronto para o portfólio. Exporte em texto para montar a apresentação.',
    stages: [
      stage('briefing', 'Briefing', 'Empresa fictícia, o que vende, para quem, objetivo do site, origem do tráfego e prazo.'),
      stage('referencias', 'Análise e referências', 'Análise de 3 concorrentes e 5 referências com o que aproveitar de cada uma.'),
      stage('objetivo', 'Objetivo e métricas', 'Ação principal, meta de conversão e eventos que serão medidos.'),
      stage('publico', 'Público e persona', 'Persona com dores, desejos, objeções e como chega ao site.'),
      stage('mensagem', 'Mensagem e posicionamento', 'Promessa principal, diferenciais com prova e tom de voz.'),
      stage('estrutura', 'Estrutura de seções', 'Ordem das seções e a dúvida que cada uma responde.'),
      stage('wireframe', 'Wireframe', 'Wireframe desktop e celular (link) com conteúdo aproximado.'),
      stage('copy', 'Copy', 'Textos finais de todas as seções, revisados.'),
      stage('guia-visual', 'Guia visual', 'Fontes, escala, paleta com papéis, contraste verificado e componentes.'),
      stage('desktop', 'Layout desktop', 'Link do layout final para desktop e principais decisões.'),
      stage('mobile', 'Layout celular', 'Link do layout para celular e o que muda em relação ao desktop.'),
      stage('construcao', 'Construção', 'Ferramenta escolhida, link provisório e o que foi configurado.'),
      stage('seo', 'SEO e desempenho', 'Título, descrição, H1, imagens otimizadas e resultado do PageSpeed.'),
      stage('testes', 'Testes e conversão', 'Checklist de testes aplicado e melhorias priorizadas com ICE.'),
      stage('publicacao', 'Publicação', 'Link final, checklist de publicação e ferramenta de análise configurada.'),
      stage('case', 'Case de portfólio', 'Problema → processo → solução → resultado esperado. Esta é a peça principal do case.'),
    ],
  },
  tools: [
    {
      id: 'figma',
      name: 'Figma',
      purpose: 'Wireframes, layouts, guia visual, componentes e aprovação com o cliente por comentários.',
      when: 'Da estrutura ao visual final — antes de construir. Em projetos simples, pode ser substituído pelo próprio construtor.',
      learn: ['Frames de desktop e celular', 'Auto layout', 'Componentes e estilos', 'Organizar o arquivo e receber comentários'],
    },
    {
      id: 'framer',
      name: 'Framer',
      purpose: 'Construir e publicar landing pages e sites de apresentação rapidamente, com animações e recursos de IA.',
      when: 'Projetos de 1 a poucas páginas, com foco em visual e velocidade de entrega.',
      learn: ['Montar seções com layout responsivo', 'Usar componentes e variáveis', 'Publicar com domínio próprio', 'Configurar SEO de cada página'],
    },
    {
      id: 'webflow',
      name: 'Webflow',
      purpose: 'Sites com muitas páginas e conteúdo gerenciável (blog, cases, serviços) com controle fino de layout.',
      when: 'Sites institucionais maiores ou quando o cliente vai publicar conteúdo com frequência.',
      learn: ['Modelo de caixas (flexbox e grid)', 'Classes e estilos reutilizáveis', 'CMS e coleções', 'Permissões de edição para o cliente'],
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      purpose: 'Plataforma mais usada do mundo, com construtores visuais e plugins para quase tudo.',
      when: 'Quando o projeto depende de plugins específicos ou o cliente já usa WordPress.',
      learn: ['Escolher tema e construtor leves', 'Plugins essenciais (segurança, cache, SEO)', 'Rotina de atualização e backup', 'Cuidados com velocidade'],
    },
    {
      id: 'geradores-ia',
      name: 'v0 / Lovable / Bolt',
      purpose: 'Gerar layouts e protótipos a partir de descrição, para explorar ideias e acelerar a primeira versão.',
      when: 'Depois que estrutura, copy e guia visual estão definidos — nunca como ponto de partida.',
      learn: ['Descrever a página com estrutura, copy e guia visual', 'Iterar por seções', 'Revisar com o checklist de 7 pontos', 'Avaliar se o resultado é mantível'],
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      purpose: 'Organizar briefings, mapear objeções e gerar variações de títulos, CTAs e textos de seção.',
      when: 'No planejamento e na copy, quando você precisa de muitas opções para escolher.',
      learn: ['Prompt com objetivo, origem e objeções', 'Gerar variações e escolher', 'Pedir crítica da própria resposta', 'Checar dados e promessas'],
    },
    {
      id: 'claude',
      name: 'Claude',
      purpose: 'Manter o contexto de cada cliente em projetos e escrever/revisar copy consistente entre páginas.',
      when: 'Ao longo de todo o projeto, sempre que o trabalho depende do briefing e do tom de voz.',
      learn: ['Um projeto por cliente com documento mestre', 'Revisar copy contra o tom de voz', 'Montar propostas e checklists', 'Analisar transcrições de reuniões'],
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      purpose: 'Criar sites e ferramentas em código quando o construtor não basta: páginas sob medida, automações e integrações.',
      when: 'Depois de dominar estrutura e visual — para projetos que pedem mais controle ou integrações.',
      learn: ['Descrever bem a página antes de pedir', 'Publicar em hospedagem estática', 'Revisar e testar o que foi gerado', 'Versionar o projeto'],
    },
  ],
})
