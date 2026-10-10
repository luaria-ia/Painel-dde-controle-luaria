import { Smartphone } from 'lucide-react'
import { defineTrack, lesson as L, stage, studyModule as M } from './define'

/** Formação Social Media + IA — 14 dias, 10 módulos. */
export const socialMedia = defineTrack({
  id: 'social-media',
  title: 'Social Media',
  icon: Smartphone,
  color: '#d6457c',
  description: 'Aprenda a criar, planejar, executar e analisar estratégias de conteúdo para clientes.',
  modules: [
    M(
      'm01',
      'Fundamentos de Social Media',
      'Entender a profissão, os papéis ao redor dela e ler um perfil com olhar estratégico.',
      [
        L('a1', 1, 'O que faz um social media', {
          objective: 'Entender o escopo real do trabalho e o que o cliente compra quando contrata você.',
          content: [
            'Social media é o profissional responsável por **planejar, produzir, publicar e analisar** o conteúdo de uma marca nas redes sociais. O cliente não compra “posts”: compra presença consistente que gera resultado — mais pessoas conhecendo, confiando e comprando.',
            'Na prática, o trabalho tem quatro blocos. **Estratégia**: para quem falar, sobre o quê e por quê. **Produção**: ideias, copy, roteiros e peças. **Operação**: calendário, aprovação, publicação e respostas. **Análise**: métricas, aprendizados e ajustes. Iniciantes costumam focar só em produção e viram “fazedores de post” — fáceis de substituir, principalmente agora.',
            'Com IA, produzir ficou barato. O que continua valioso é o julgamento: saber o que postar, para quem, com qual objetivo, e reconhecer quando um conteúdo gerado está genérico. É essa camada que esta formação treina.',
          ],
          concepts: [
            ['Estratégia', 'Decisões sobre público, mensagem e objetivo tomadas antes de criar qualquer peça.'],
            ['Produção', 'Transformar a estratégia em conteúdo: ideia, texto, design, vídeo.'],
            ['Operação', 'A rotina que mantém a máquina girando: calendário, aprovação, postagem, interação.'],
            ['Análise', 'Ler os números para decidir o que repetir, ajustar ou abandonar.'],
          ],
          example: [
            'Uma pizzaria contrata um social media. O “fazedor de post” entrega 12 artes de pizza por mês.',
            'O social media estratégico descobre que a maior parte das vendas vem do delivery à noite, cria conteúdo para quem decide o jantar às 18h, publica nesse horário e mede quantas pessoas clicam no link do cardápio. Mesma quantidade de posts, resultado completamente diferente.',
          ],
          practice: 'Abra o perfil de um pequeno negócio que você conhece e tente responder em uma frase: qual é o objetivo desse perfil? Ele fica claro olhando os posts?',
          task: 'Escreva as 4 áreas (estratégia, produção, operação, análise) e, para cada uma, uma tarefa concreta que você faria para um cliente real.',
          checklist: [
            'Sei explicar o que um social media entrega além de posts',
            'Diferencio estratégia, produção, operação e análise',
            'Entendo onde a IA ajuda e onde o julgamento humano é indispensável',
          ],
        }),
        L('a2', 1, 'Social media, designer, tráfego e copywriter', {
          objective: 'Conhecer os limites do seu papel para vender o serviço certo e não prometer o que não entrega.',
          content: [
            'Em pequenos negócios esses papéis se misturam, e o cliente frequentemente espera que você faça tudo. Entender as diferenças ajuda a precificar, a dizer não com segurança e a formar parcerias.',
            '**Social media** cuida da presença orgânica: estratégia, calendário, conteúdo e comunidade. **Designer** resolve problemas visuais: identidade, layouts, peças com acabamento. **Gestor de tráfego** administra anúncios pagos (Meta Ads, Google Ads), orçamento e campanhas. **Copywriter** escreve textos persuasivos: legendas, páginas de venda, anúncios, e-mails.',
            'Como social media, você precisa de noções de design e copy para entregar bem — e é isso que os módulos 3, 4 e 6 cobrem. Seu diferencial é conectar tudo à estratégia. Tráfego pago é outra especialidade: se o cliente pedir, deixe claro que é um serviço separado ou indique um parceiro.',
          ],
          concepts: [
            ['Orgânico', 'Alcance conquistado sem pagar anúncio — depende de conteúdo e consistência.'],
            ['Pago', 'Alcance comprado via anúncios, com segmentação de público e orçamento.'],
            ['Escopo', 'O que está e o que não está incluído no seu serviço. Escrito, não combinado de boca.'],
            ['Parceria', 'Indicar ou subcontratar quem domina outra área em vez de fingir que faz tudo.'],
          ],
          example: [
            'Cliente: “Quero vender mais pelo Instagram.”',
            'Resposta madura: “Eu cuido do conteúdo e do perfil para gerar confiança e procura. Se quiser acelerar com anúncios, isso é gestão de tráfego — posso indicar alguém ou orçar à parte.”',
          ],
          practice: 'Pense no serviço que você quer oferecer primeiro. Escreva o que fica DENTRO e o que fica FORA do escopo.',
          task: 'Monte uma tabela com os 4 papéis: principal entrega, ferramenta típica e como cada um mede sucesso.',
          checklist: ['Sei diferenciar os 4 papéis', 'Defini o que está fora do meu escopo', 'Sei como responder a um pedido fora do escopo'],
        }),
        L('a3', 2, 'Perfil profissional e os 4 objetivos de um Instagram', {
          objective: 'Entender os elementos de um perfil e os quatro objetivos que guiam todo conteúdo.',
          content: [
            'Um perfil profissional é uma vitrine: em 5 segundos a pessoa precisa entender **quem é, o que oferece, para quem e o que fazer em seguida**. Os elementos que resolvem isso são foto (logo ou rosto legível em tamanho pequeno), nome com palavra-chave pesquisável, bio com proposta de valor, link com chamada para ação, destaques organizados e um feed coerente.',
            'Todo conteúdo serve a pelo menos um de quatro objetivos. **Alcance**: chegar a pessoas novas (Reels, conteúdo compartilhável). **Engajamento**: gerar interação e relação (perguntas, bastidores, opinião). **Autoridade**: provar que a marca sabe o que faz (conteúdo educativo, cases, resultados). **Conversão**: transformar interesse em ação — mensagem, clique, compra.',
            'Erro comum: postar só conversão (“compre agora”) ou só alcance (trends sem relação com o negócio). Perfis saudáveis equilibram os quatro de acordo com o momento da marca: um perfil novo precisa de mais alcance; um perfil com muitos seguidores e poucas vendas precisa de mais autoridade e conversão.',
          ],
          concepts: [
            ['Bio', '150 caracteres que respondem: o que faço, para quem, por que eu e qual o próximo passo.'],
            ['Destaques', 'Stories fixos que funcionam como menu: serviços, depoimentos, dúvidas, como comprar.'],
            ['Alcance e engajamento', 'Alcance mede quantas pessoas viram; engajamento mede quantas reagiram.'],
            ['Autoridade e conversão', 'Autoridade constrói confiança; conversão pede a ação. Sem a primeira, a segunda não funciona.'],
          ],
          example: [
            '**Bio fraca:** “Amo o que faço 💕 Doces artesanais”.',
            '**Bio forte:** “Doces artesanais para festas em Curitiba 🎂 | Encomendas com 5 dias de antecedência | Peça pelo link 👇”. A segunda diz o que é, onde, como funciona e o que fazer agora.',
          ],
          practice: 'Reescreva a bio de um perfil que você acompanha usando a fórmula: o que faz + para quem + diferencial + CTA.',
          task: 'Classifique os últimos 9 posts de um perfil nos 4 objetivos. Qual objetivo está faltando ou sobrando?',
          checklist: ['Conheço os elementos de um perfil profissional', 'Sei classificar um post pelos 4 objetivos', 'Reescrevi pelo menos uma bio'],
        }),
        L('a4', 2, 'Como analisar um perfil', {
          objective: 'Ter um método repetível de diagnóstico — a base de qualquer proposta comercial.',
          content: [
            'Analisar um perfil é a primeira entrega de valor para um cliente. Use sempre a mesma ordem para não depender de achismo: **1) Primeira impressão** (foto, nome, bio, link, destaques). **2) Posicionamento** (está claro para quem é e por que escolher essa marca?). **3) Conteúdo** (formatos, temas, frequência, qualidade). **4) Interação** (comentários reais, respostas da marca). **5) Conversão** (o perfil pede alguma ação, e é fácil agir?).',
            'Para estimar engajamento sem acesso às métricas internas: some curtidas + comentários dos últimos 9 a 12 posts, divida pelo número de posts e depois pelo número de seguidores. Entre 1% e 3% é razoável para perfis pequenos e médios; abaixo de 1% merece investigação. É uma estimativa grosseira, útil para comparar perfis do mesmo nicho.',
            'Termine sempre com **3 melhorias priorizadas**: a mais rápida de fazer, a de maior impacto e a mais estratégica. Nenhum cliente quer uma lista de 20 problemas; ele quer saber por onde começar.',
          ],
          concepts: [
            ['Engajamento estimado', '(curtidas + comentários) ÷ nº de posts ÷ seguidores × 100.'],
            ['Diagnóstico', 'Análise organizada feita antes de propor qualquer solução.'],
            ['Benchmark', 'Perfis de referência do mesmo nicho usados para comparação.'],
            ['Priorização', 'Escolher poucas ações de alto valor em vez de listar tudo.'],
          ],
          example: [
            'Clínica odontológica, 3.200 seguidores. Bio genérica (“Cuidando do seu sorriso”), sem link de agendamento, 80% dos posts são datas comemorativas. Engajamento estimado: 0,6%.',
            'Melhorias: 1) bio com especialidade + link de WhatsApp (rápida); 2) série semanal respondendo dúvidas reais de pacientes (impacto); 3) definir 3 pilares de conteúdo (estratégica).',
          ],
          practice: 'Calcule o engajamento estimado de dois perfis do mesmo nicho e compare. O número bate com a sua impressão visual?',
          task: 'Aplique o método de 5 etapas em um perfil e termine com 3 melhorias priorizadas. Isso já é o começo do Exercício 1.',
          checklist: ['Sei aplicar o método de 5 etapas', 'Sei calcular o engajamento estimado', 'Sei priorizar 3 melhorias'],
        }),
      ],
      {
        title: 'Análise de 3 perfis reais',
        objective: 'Treinar o olhar estratégico aplicando o método de diagnóstico de 5 etapas.',
        steps: [
          'Escolha 3 perfis de negócios, de preferência do nicho que você quer atender.',
          'Para cada perfil, aplique as 5 etapas: primeira impressão, posicionamento, conteúdo, interação e conversão.',
          'Calcule o engajamento estimado de cada um.',
          'Liste pontos fortes, pontos fracos e 3 melhorias priorizadas (rápida, impacto, estratégica).',
          'Feche com uma conclusão: o que o melhor perfil faz que os outros não fazem?',
        ],
        checklist: [
          '3 perfis escolhidos',
          'Método de 5 etapas aplicado nos 3',
          'Engajamento estimado calculado',
          '3 melhorias priorizadas por perfil',
          'Conclusão comparativa escrita',
        ],
        template:
          'PERFIL 1: @\nNicho:\nPrimeira impressão:\nPosicionamento:\nConteúdo (formatos, temas, frequência):\nInteração:\nConversão:\nEngajamento estimado:\nPontos fortes:\nPontos fracos:\nMelhorias: 1) rápida — 2) impacto — 3) estratégica —\n\nPERFIL 2: @\n...\n\nPERFIL 3: @\n...\n\nCONCLUSÃO:\n',
      },
    ),
    M(
      'm02',
      'Estratégia de Conteúdo',
      'Público, persona, posicionamento, pilares, jornada do cliente e calendário editorial.',
      [
        L('a1', 3, 'Nicho, público-alvo e persona', {
          objective: 'Saber para quem você está criando — e transformar isso em pautas.',
          content: [
            '**Nicho** é o recorte de mercado em que a marca atua (ex.: odontologia estética). **Público-alvo** é a descrição do grupo atendido: idade, região, renda, comportamento. **Persona** é um personagem semifictício que representa o cliente ideal, com dores, desejos, objeções e rotina.',
            'O público diz *quem*; a persona diz *como essa pessoa pensa*. É a persona que gera conteúdo bom, porque cada dor, dúvida ou objeção vira uma pauta. Persona sem dores concretas é decoração.',
            'Para montar uma persona sem pesquisa formal: leia comentários e avaliações de concorrentes, pergunte ao cliente quais são as 10 dúvidas que mais recebe, olhe as conversas de WhatsApp e direct. A IA ajuda a organizar, mas a matéria-prima precisa vir do mundo real.',
          ],
          concepts: [
            ['Dores', 'Problemas concretos que incomodam a persona no dia a dia.'],
            ['Desejos', 'O estado que ela quer alcançar — o “depois”.'],
            ['Objeções', 'Motivos que a impedem de comprar: preço, desconfiança, falta de tempo.'],
            ['Linguagem', 'As palavras que ela usa. Copy boa repete a linguagem do cliente.'],
          ],
          example: [
            '**Persona:** Camila, 34 anos, analista, mãe de um filho de 4 anos. *Dor:* não tem energia para cozinhar à noite. *Desejo:* alimentar o filho bem sem culpa. *Objeção:* “comida congelada não é saudável”.',
            '**Pautas que saem daí:** “3 mitos sobre comida congelada”, “o que tem dentro da nossa marmita”, “jantar completo em 8 minutos”.',
          ],
          practice: 'Pegue uma persona (pode ser a Camila) e transforme cada dor e cada objeção em 2 ideias de post.',
          task: 'Crie uma persona completa para a empresa fictícia que você vai usar nos exercícios: nome, idade, rotina, 3 dores, 3 desejos, 3 objeções e frases que ela diria.',
          checklist: ['Diferencio nicho, público e persona', 'Sei de onde tirar dores e objeções reais', 'Criei uma persona com pelo menos 3 dores'],
        }),
        L('a2', 3, 'Posicionamento e pilares de conteúdo', {
          objective: 'Definir por que alguém escolheria essa marca e quais temas sustentam o perfil.',
          content: [
            '**Posicionamento** é o lugar que a marca quer ocupar na mente do público: por que escolher ela e não a concorrente? Fórmula útil: “Para [público] que [dor/desejo], [marca] é a [categoria] que [diferencial], porque [prova].”',
            '**Pilares de conteúdo** são 3 a 5 grandes temas que sustentam o posicionamento e acabam com o “o que eu posto hoje?”. Cada pilar precisa ser relevante para a persona e conectado ao que a marca vende. Para uma nutricionista esportiva: 1) alimentação para performance, 2) mitos e verdades, 3) rotina e bastidores, 4) resultados de pacientes.',
            'Defina uma proporção (ex.: 40/25/20/15) para não pender demais para um lado. Depois de alguns meses, os pilares também viram unidade de análise: você descobre qual gera alcance, qual gera salvamentos e qual gera mensagens.',
          ],
          concepts: [
            ['Posicionamento', 'A frase que explica por que escolher essa marca.'],
            ['Diferencial', 'Algo verdadeiro, específico e relevante para a persona — “qualidade” não conta.'],
            ['Pilar', 'Tema recorrente que conecta o interesse da persona ao que a marca vende.'],
            ['Proporção', 'A distribuição planejada dos pilares no calendário.'],
          ],
          example: [
            '“Para mães que trabalham fora e querem alimentar a família bem, a **Marmita da Lu** é a marmitaria que entrega comida caseira congelada sem conservantes, porque produz em pequenos lotes com receitas validadas por nutricionista.”',
            'Pilares: Rotina sem culpa (40%) · Bastidores da cozinha (25%) · Nutrição descomplicada (20%) · Clientes reais (15%).',
          ],
          practice: 'Escolha um perfil que você analisou ontem e tente escrever o posicionamento dele com a fórmula. Se não conseguir, o perfil tem um problema de posicionamento.',
          task: 'Escreva o posicionamento e 4 pilares com proporção para a sua empresa fictícia.',
          checklist: ['Escrevi um posicionamento com a fórmula', 'Defini de 3 a 5 pilares', 'Cada pilar se conecta a algo que a marca vende'],
        }),
        L('a3', 4, 'Jornada do cliente e os 4 tipos de conteúdo', {
          objective: 'Criar conteúdo para cada etapa da decisão de compra.',
          content: [
            'Ninguém compra no primeiro contato. A jornada simplificada tem quatro etapas: **descoberta** (não conhece a marca), **consideração** (conhece e está avaliando), **decisão** (está pronto para comprar) e **fidelização** (comprou e pode voltar e indicar).',
            'Cada etapa pede um tipo de conteúdo. **Atração**: temas amplos e compartilháveis para quem não conhece a marca (curiosidades, erros comuns, trends adaptadas). **Autoridade**: provar competência (tutoriais, análises, bastidores técnicos, resultados). **Relacionamento**: criar conexão e confiança (histórias, rotina, opinião, respostas a seguidores). **Conversão**: convidar à ação (oferta, depoimento, quebra de objeção, como comprar).',
            'Um calendário equilibrado mistura os quatro. Se o perfil só atrai, cresce mas não vende. Se só converte, vende para poucos e cansa a audiência.',
          ],
          concepts: [
            ['Atração', 'Topo do funil: alcançar quem ainda não conhece a marca.'],
            ['Autoridade', 'Meio do funil: mostrar que a marca entende do assunto.'],
            ['Relacionamento', 'Gera vínculo e confiança; humaniza a marca.'],
            ['Conversão', 'Fundo do funil: tira dúvidas finais e pede a ação.'],
          ],
          example: [
            'Academia de bairro:',
            '**Atração** — “5 erros que fazem você desistir da academia no primeiro mês”. **Autoridade** — “Como montamos o treino de quem nunca treinou”. **Relacionamento** — “A história do aluno de 62 anos que começou aqui”. **Conversão** — “Aula experimental gratuita: como agendar”.',
          ],
          practice: 'Volte aos 9 posts que você classificou no Módulo 1 e marque também o tipo de conteúdo. O perfil está preso em alguma etapa?',
          task: 'Para a sua empresa fictícia, crie 2 ideias de cada tipo (8 ideias no total).',
          checklist: ['Conheço as 4 etapas da jornada', 'Sei qual tipo de conteúdo serve a cada etapa', 'Criei 8 ideias distribuídas nos 4 tipos'],
        }),
        L('a4', 4, 'Calendário editorial', {
          objective: 'Transformar estratégia em rotina previsível e aprovável.',
          content: [
            'Calendário editorial é o plano do que será publicado, quando, em qual formato e com qual objetivo. Ele transforma estratégia em rotina e permite que o cliente aprove com antecedência — o que evita a correria do “posta alguma coisa hoje”.',
            'Colunas mínimas: **data, formato** (Reels, carrossel, estático, stories), **pilar, tipo de conteúdo** (atração, autoridade, relacionamento, conversão), **tema** e **status** (ideia → produção → aprovação → agendado → publicado). Pode ser uma planilha, o Notion ou a própria ferramenta de agendamento.',
            'Frequência realista vence frequência ambiciosa. Para pequenos negócios, 3 posts no feed por semana + stories quase diários já é consistente. Planeje por mês, deixe uns 20% de espaço para assuntos do momento e produza em lote.',
          ],
          concepts: [
            ['Frequência', 'Quantos posts por semana a marca consegue manter por meses, não por uma semana.'],
            ['Produção em lote', 'Criar vários conteúdos de uma vez — muito mais eficiente que um por dia.'],
            ['Status', 'Etapa em que cada conteúdo está; evita que algo se perca.'],
            ['Datas relevantes', 'Datas do nicho e do calendário comercial — use só as que fazem sentido para a marca.'],
          ],
          example: [
            {
              table: [
                ['Dia', 'Formato', 'Pilar', 'Tipo', 'Tema'],
                ['Seg', 'Reels', 'Nutrição descomplicada', 'Atração', '3 mitos sobre comida congelada'],
                ['Qua', 'Carrossel', 'Rotina sem culpa', 'Autoridade', 'Monte a semana de jantares em 20 min'],
                ['Sex', 'Estático', 'Clientes reais', 'Conversão', 'Depoimento da Camila + link do kit'],
                ['Diário', 'Stories', 'Bastidores', 'Relacionamento', 'Produção do dia, enquetes, caixinha'],
              ],
            },
          ],
          practice: 'Abra uma planilha e crie as colunas do calendário. Ela será usada no Exercício 2 e no Projeto Final.',
          task: 'Monte um calendário de 2 semanas para a sua empresa fictícia, respeitando a proporção dos pilares.',
          checklist: ['Criei a estrutura de colunas', 'Defini uma frequência realista', 'Montei 2 semanas de calendário'],
        }),
      ],
      {
        title: 'Estratégia de conteúdo de uma empresa fictícia',
        objective: 'Construir uma estratégia completa que poderia ser apresentada a um cliente.',
        steps: [
          'Crie uma empresa fictícia (ou use a Marmita da Lu) e descreva o negócio em 3 linhas.',
          'Defina nicho, público-alvo e uma persona completa.',
          'Escreva o posicionamento com a fórmula do Módulo 2.',
          'Defina 4 pilares com proporção.',
          'Crie 2 ideias para cada tipo de conteúdo (atração, autoridade, relacionamento, conversão).',
          'Monte um calendário de 2 semanas.',
        ],
        checklist: [
          'Empresa descrita',
          'Persona com dores, desejos e objeções',
          'Posicionamento escrito',
          '4 pilares com proporção',
          '8 ideias nos 4 tipos',
          'Calendário de 2 semanas',
        ],
        template:
          'EMPRESA:\nNegócio em 3 linhas:\n\nNICHO:\nPÚBLICO-ALVO:\nPERSONA (nome, idade, rotina):\n- Dores:\n- Desejos:\n- Objeções:\n\nPOSICIONAMENTO: Para ___ que ___, ___ é a ___ que ___, porque ___.\n\nPILARES (%):\n1)\n2)\n3)\n4)\n\nIDEIAS\nAtração:\nAutoridade:\nRelacionamento:\nConversão:\n\nCALENDÁRIO (2 semanas):\n',
      },
    ),
    M(
      'm03',
      'Copywriting para Instagram',
      'Hooks, headlines, anatomia da mensagem persuasiva, storytelling e copy por formato.',
      [
        L('a1', 5, 'Copywriting e a anatomia de uma mensagem', {
          objective: 'Escrever textos que geram ação usando problema, desejo, benefício, prova e CTA.',
          content: [
            'Copywriting é escrever para gerar uma ação: parar o scroll, ler até o fim, salvar, comentar, chamar no direct, comprar. Não é escrever bonito — é escrever **claro, específico e centrado no leitor**.',
            'A maioria das mensagens persuasivas segue a mesma anatomia. **Problema**: a dor que o leitor reconhece. **Desejo**: o estado que ele quer alcançar. **Benefício**: o que muda na vida dele (não a característica do produto). **Prova**: depoimento, número, demonstração, credencial. **CTA**: a próxima ação, clara e única.',
            'Regra de ouro: fale de benefício, não de característica. “Marmitas com 400 kcal” é característica; “jante bem sem precisar contar calorias” é benefício. E troque adjetivos vagos (“qualidade”, “excelência”) por fatos concretos (“receitas assinadas por nutricionista”).',
          ],
          concepts: [
            ['Característica × benefício', 'O que o produto tem × o que muda para quem usa.'],
            ['Prova', 'Qualquer evidência que torne a promessa crível.'],
            ['CTA', 'Chamada para ação. Uma por peça, específica.'],
            ['Especificidade', 'Números, nomes e detalhes vencem adjetivos.'],
          ],
          example: [
            '**Antes:** “Somos uma marmitaria de qualidade com comida deliciosa. Peça já!”',
            '**Depois:** “Chegou em casa às 20h sem energia para cozinhar? *(problema)* Nossas marmitas ficam prontas em 6 minutos no micro-ondas *(benefício)* e são montadas com receitas de nutricionista, sem conservantes *(prova)*. Peça o kit da semana pelo link da bio *(CTA)*.”',
          ],
          practice: 'Pegue 3 frases genéricas de marcas reais e reescreva trocando característica por benefício e adjetivo por fato.',
          task: 'Escreva uma mensagem completa (problema, desejo, benefício, prova, CTA) para o produto principal da sua empresa fictícia.',
          checklist: ['Sei as 5 partes da mensagem persuasiva', 'Diferencio característica de benefício', 'Reescrevi 3 frases genéricas'],
        }),
        L('a2', 5, 'Hooks, headlines e gatilhos de atenção', {
          objective: 'Criar aberturas que fazem a pessoa parar de rolar.',
          content: [
            'O **hook** é a primeira frase ou os primeiros segundos — o que faz alguém parar. A **headline** é o título principal: capa do carrossel, texto na tela do Reels. Se o hook falha, o resto do conteúdo simplesmente não é visto.',
            'Gatilhos de atenção mais usados: **curiosidade** (“o erro que ninguém comenta sobre…”), **especificidade** (“3 jantares por menos de R$ 15”), **quebra de crença** (“comer à noite não engorda”), **identificação** (“se você chega exausto do trabalho…”), **medo de perder** (“pare de fazer isso antes de treinar”) e **resultado** (“como a Ana organizou a semana inteira em 1 hora”).',
            'Um bom hook é curto, fala com uma pessoa específica e promete algo que o conteúdo realmente entrega. Hook que promete demais gera clique e depois decepção — a pessoa sai cedo, e isso derruba a distribuição do conteúdo.',
          ],
          concepts: [
            ['Hook', 'Abertura que segura a atenção nos primeiros segundos.'],
            ['Headline', 'O título principal da peça, legível em miniatura.'],
            ['Quebra de crença', 'Contradizer algo que o público acredita — precisa ser verdade.'],
            ['Promessa', 'O que o leitor ganha por continuar. Tem que ser cumprida.'],
          ],
          example: [
            'Tema: alimentação saudável na rotina corrida.',
            {
              list: [
                'Curiosidade — “O motivo real de você comer mal à noite (não é falta de força de vontade)”',
                'Especificidade — “5 jantares em 10 minutos com 6 ingredientes”',
                'Quebra de crença — “Comida congelada pode ser mais nutritiva que a feita na hora”',
                'Identificação — “Se você abre o iFood toda noite às 21h, isso é para você”',
                'Resultado — “Como a Camila parou de pedir delivery 5 vezes por semana”',
              ],
            },
          ],
          practice: 'Escolha um tema e escreva o mesmo hook em 5 versões, uma para cada gatilho. Leia em voz alta e escolha o mais forte.',
          task: 'Escreva 10 hooks para a sua empresa fictícia, usando pelo menos 5 gatilhos diferentes.',
          checklist: ['Conheço pelo menos 5 gatilhos de atenção', 'Sei a diferença entre hook e headline', 'Escrevi 10 hooks'],
        }),
        L('a3', 6, 'Storytelling', {
          objective: 'Usar histórias curtas para gerar conexão e tornar argumentos memoráveis.',
          content: [
            'Histórias prendem atenção porque o cérebro quer saber como terminam. Em redes sociais, storytelling não é contar a vida inteira: é usar uma **estrutura curta de transformação**.',
            'Estrutura em 4 partes: **Situação** (onde o personagem estava). **Conflito** (o problema ou a virada). **Virada** (o que ele fez ou descobriu — aqui entra o produto ou a ideia). **Resultado + lição** (o que mudou e o que o leitor tira disso).',
            'Personagens possíveis: o fundador, um cliente, um funcionário, o próprio leitor (“imagine que…”). Detalhes concretos — horário, lugar, uma frase dita — dão credibilidade. Uma história sem detalhe soa inventada.',
          ],
          concepts: [
            ['Situação', 'O ponto de partida com que o leitor se identifica.'],
            ['Conflito', 'A tensão; sem conflito não há história.'],
            ['Virada', 'A decisão ou descoberta que muda o rumo.'],
            ['Lição', 'A ponte entre a história e o leitor.'],
          ],
          example: [
            '“Em 2021, a Lu cozinhava para a família todo domingo e via a comida acabar na terça. *(situação)* Numa quinta, o filho comeu salgadinho no jantar porque não havia mais nada. *(conflito)* Ela começou a congelar porções e testar receitas que mantinham sabor depois de aquecidas. *(virada)* Hoje são 300 marmitas por semana para mães que viveram a mesma quinta-feira. A lição: planejar o jantar não é luxo, é o que tira a culpa da rotina. *(resultado + lição)*”',
          ],
          practice: 'Pense em uma história real sua relacionada a aprender algo novo e escreva nas 4 partes, em no máximo 6 frases.',
          task: 'Escreva 1 storytelling de cliente e 1 de bastidor para a sua empresa fictícia.',
          checklist: ['Conheço as 4 partes da estrutura', 'Usei detalhes concretos', 'Escrevi 2 histórias'],
        }),
        L('a4', 6, 'Copy por formato: carrossel, Reels e legendas', {
          objective: 'Adaptar o texto às regras de cada formato.',
          content: [
            '**Carrossel:** a capa é a headline; cada slide carrega uma ideia; frases curtas; o fim de um slide puxa o próximo; o último tem o CTA. Pense em slides como frases de um argumento, não como páginas de apostila.',
            '**Reels:** existem duas camadas — o que é falado e o texto na tela. O texto na tela reforça o hook (muita gente assiste sem som) e a legenda complementa, sem repetir o vídeo inteiro.',
            '**Legenda:** a primeira linha é um segundo hook, porque é o que aparece antes do “mais”. Depois vem o valor (explicação, história, contexto), o CTA e, se usar, poucas hashtags relevantes. Legenda curta combina com Reels de entretenimento; legenda longa funciona em autoridade e storytelling.',
          ],
          concepts: [
            ['Primeira linha', 'O trecho visível antes do “mais”. Precisa dar motivo para expandir.'],
            ['Texto na tela', 'Reforça a mensagem para quem assiste sem som.'],
            ['CTA único', 'Uma ação por peça. Duas ações competem entre si.'],
            ['Hashtags', 'Poucas e específicas do assunto; não são o motor do alcance.'],
          ],
          example: [
            '**Legenda:**',
            '“Você não precisa cozinhar todo dia para comer bem todo dia.\n\nO segredo da semana organizada é decidir o jantar uma vez só, no domingo. Separe 3 proteínas, 2 bases e 2 legumes e combine ao longo da semana. Isso dá 12 jantares diferentes com 7 ingredientes.\n\nSalve para montar a sua lista no domingo e mande para quem vive pedindo delivery às 21h.”',
          ],
          practice: 'Pegue um post seu ou de alguém e reescreva só a primeira linha da legenda de 3 jeitos diferentes.',
          task: 'Escreva 3 legendas completas (uma de atração, uma de autoridade, uma de conversão) para a sua empresa fictícia.',
          checklist: ['Sei como a copy muda em cada formato', 'Escrevo primeiras linhas que funcionam como hook', 'Escrevi 3 legendas'],
        }),
      ],
      {
        title: '10 hooks, 3 carrosséis e 3 legendas',
        objective: 'Praticar copy em volume para o mesmo negócio, variando gatilhos e formatos.',
        steps: [
          'Use a empresa fictícia do Exercício 2.',
          'Escreva 10 hooks usando pelo menos 5 gatilhos diferentes (indique qual).',
          'Escreva o texto de 3 carrosséis (título de cada slide + texto de apoio).',
          'Escreva 3 legendas completas: atração, autoridade e conversão.',
          'Releia tudo com o checklist: benefício em vez de característica, especificidade, CTA único.',
        ],
        checklist: ['10 hooks com gatilhos identificados', '3 carrosséis com texto slide a slide', '3 legendas completas', 'Revisão com checklist feita'],
        template:
          'HOOKS\n1) [curiosidade]\n2) [especificidade]\n3) [quebra de crença]\n4) [identificação]\n5) [resultado]\n6)\n7)\n8)\n9)\n10)\n\nCARROSSEL 1 — Promessa:\nS1 (capa):\nS2:\n...\n\nCARROSSEL 2\n\nCARROSSEL 3\n\nLEGENDA — Atração:\n\nLEGENDA — Autoridade:\n\nLEGENDA — Conversão:\n',
      },
    ),
    M(
      'm04',
      'Carrosséis',
      'Estrutura, capa, ritmo, hierarquia da informação e como transformar ideia em carrossel.',
      [
        L('a1', 7, 'Estrutura de um bom carrossel e o primeiro slide', {
          objective: 'Montar a espinha dorsal de um carrossel e criar capas que fazem deslizar.',
          content: [
            'Carrossel é o formato com maior potencial de **salvamento e compartilhamento**, porque entrega valor em sequência e o leitor controla o ritmo. Cada deslize indica interesse, e um carrossel que a pessoa não deslizou pode voltar a aparecer mostrando outro slide.',
            'Estrutura base de 7 a 10 slides: **1. Capa** com headline forte. **2. Contexto**: o problema que justifica continuar. **3 a 8. Desenvolvimento**: uma ideia por slide. **9. Resumo ou virada**. **10. CTA**.',
            'O primeiro slide decide tudo. Ele precisa de headline curta (até ~10 palavras), legível no tamanho de miniatura, promessa clara e algum contraste visual com o resto do feed. Teste: tapando todo o resto, a capa sozinha faz alguém querer deslizar?',
          ],
          concepts: [
            ['Capa', 'Slide 1. Funciona como hook visual + headline.'],
            ['Slide de contexto', 'Explica por que o assunto importa para o leitor.'],
            ['Uma ideia por slide', 'Se o slide precisa de dois títulos, são dois slides.'],
            ['Salvamento', 'Sinal de que o conteúdo tem valor de consulta.'],
          ],
          example: [
            '**Capas fracas:** “Dicas de alimentação” · “Você sabia?” · “Nutrição saudável”.',
            '**Capas fortes:** “7 jantares que ficam prontos antes do micro-ondas apitar” · “O erro do domingo que estraga sua semana inteira” · “Pare de jogar comida fora: o método das 3 caixas”.',
          ],
          practice: 'Escolha um tema e escreva 5 capas diferentes para ele. Mostre para alguém e pergunte em qual essa pessoa clicaria.',
          task: 'Escreva a estrutura (só os títulos de cada slide) de 1 carrossel de 8 slides.',
          checklist: ['Conheço a estrutura base', 'Sei os critérios de uma boa capa', 'Escrevi 5 capas para o mesmo tema'],
        }),
        L('a2', 7, 'Desenvolvimento, ritmo, hierarquia, CTA e erros comuns', {
          objective: 'Fazer o leitor chegar ao último slide e agir.',
          content: [
            '**Ritmo:** alterne tipos de slide (afirmação, lista curta, exemplo, imagem, pergunta) e termine slides com uma ponte para o próximo (“mas tem um detalhe…”). **Hierarquia:** título do slide → texto de apoio → detalhe. Mire em 20 a 40 palavras por slide; mais que isso vira apostila.',
            '**CTA ligado ao conteúdo:** “salve para usar na próxima compra”, “mande para quem vive pedindo delivery”, “comente CARDÁPIO e eu envio a lista”. “Siga para mais conteúdo” é o CTA mais fraco que existe.',
            '**Erros comuns:** texto demais, fonte pequena, slides sem ligação entre si, capa genérica, informação mais importante escondida no meio, visual diferente a cada slide. **De ideia a carrossel em 6 passos:** 1) defina a promessa; 2) liste tudo que sabe sobre o tema; 3) corte para 5 a 7 pontos; 4) ordene do mais simples ao mais forte; 5) escreva a capa por último; 6) escolha um CTA coerente.',
          ],
          concepts: [
            ['Ritmo', 'Variação que evita monotonia e mantém o deslize.'],
            ['Ponte', 'Frase final de um slide que cria vontade de ver o próximo.'],
            ['Hierarquia', 'Ordem de leitura definida por tamanho, peso e posição.'],
            ['CTA coerente', 'Ação natural para quem acabou de consumir aquele conteúdo.'],
          ],
          example: [
            '**Ideia solta:** “falar sobre organizar a semana de jantares”.',
            '**Carrossel:** 1) “Monte 12 jantares com 7 ingredientes” · 2) Por que você pede delivery às 21h (não é preguiça) · 3) Passo 1: escolha 3 proteínas · 4) Passo 2: 2 bases · 5) Passo 3: 2 legumes · 6) A tabela de combinações · 7) Exemplo de segunda a sexta · 8) O que fazer quando faltar tempo até para isso · 9) Resumo em uma linha · 10) “Salve e use no domingo”.',
          ],
          practice: 'Pegue um carrossel que você salvou recentemente e identifique: estrutura, ritmo, pontes e CTA. O que ele faz bem?',
          task: 'Escreva o texto completo de 1 carrossel usando os 6 passos.',
          checklist: ['Sei manter ritmo e hierarquia', 'Escolho CTAs coerentes com o conteúdo', 'Conheço os erros comuns', 'Apliquei os 6 passos em uma ideia'],
        }),
      ],
      {
        title: '3 carrosséis completos',
        objective: 'Produzir carrosséis prontos para virar design, com estrutura, ritmo e CTA.',
        steps: [
          'Escolha 3 temas de pilares diferentes.',
          'Para cada um, aplique os 6 passos (promessa → lista → corte → ordem → capa → CTA).',
          'Escreva o texto final de cada slide (máx. ~40 palavras por slide).',
          'Adicione uma orientação visual por slide (ex.: “ícone de relógio”, “foto da marmita”).',
          'Revise: capa passa no teste da miniatura? Existe ponte entre slides?',
        ],
        checklist: ['3 temas de pilares diferentes', 'Texto final de todos os slides', 'Orientação visual por slide', 'CTA coerente em cada carrossel', 'Capas testadas'],
        template: 'CARROSSEL 1\nPilar:\nPromessa:\nS1 capa — texto: | visual:\nS2 — texto: | visual:\nS3 —\nS4 —\nS5 —\nS6 —\nS7 —\nS8 CTA —\n\nCARROSSEL 2\n\nCARROSSEL 3\n',
      },
    ),
    M(
      'm05',
      'Reels e Vídeos',
      'Estrutura de Reels, hook nos primeiros segundos, roteiro, tipos de vídeo, B-roll e legendas.',
      [
        L('a1', 8, 'Estrutura de um Reel, hook e roteiro', {
          objective: 'Roteirizar vídeos curtos que seguram a atenção do início ao fim.',
          content: [
            'Reels é o principal formato de **alcance**. A plataforma observa principalmente quanto do vídeo as pessoas assistem (retenção), se assistem de novo e se compartilham. Por isso, cada segundo precisa justificar o próximo.',
            'Estrutura: **Hook (0 a 3s)** — visual + fala + texto na tela trabalhando juntos. **Desenvolvimento** — entregue a promessa rápido, sem introdução (“oi gente, tudo bem?” é retenção jogada fora); troque de plano a cada 2 a 4 segundos. **CTA** — curto, no fim. Vídeos educativos funcionam bem entre 15 e 45 segundos.',
            'Roteiro em duas colunas: **o que se vê** (cena, B-roll, texto na tela) e **o que se ouve** (fala, narração, áudio). Hook visual forte: movimento logo no início, objeto inesperado ou mostrar o resultado antes do processo.',
          ],
          concepts: [
            ['Retenção', 'Quanto do vídeo as pessoas assistem. Métrica central do Reels.'],
            ['Hook visual', 'O primeiro frame já precisa ter algo acontecendo.'],
            ['Corte', 'Troca de plano que renova a atenção.'],
            ['Roteiro em 2 colunas', 'Separa imagem e som para planejar a gravação.'],
          ],
          example: [
            {
              table: [
                ['Tempo', 'O que se vê', 'O que se ouve'],
                ['0–3s', 'Mão abrindo freezer cheio de marmitas. Texto: “12 jantares, 7 ingredientes”', '“Você não precisa cozinhar todo dia.”'],
                ['3–12s', '3 proteínas na bancada, cortes rápidos', '“Escolha 3 proteínas no domingo…”'],
                ['12–24s', 'Montagem das combinações, close nas caixas', '“…combine com 2 bases e 2 legumes.”'],
                ['24–30s', 'Marmita saindo do micro-ondas. Texto: “Salve para domingo”', '“Salva esse vídeo e testa nesse domingo.”'],
              ],
            },
          ],
          practice: 'Assista a 5 Reels do seu nicho e anote só os 3 primeiros segundos de cada um. O que fez você continuar ou sair?',
          task: 'Escreva 1 roteiro completo em duas colunas para a sua empresa fictícia.',
          checklist: ['Sei a estrutura hook, desenvolvimento e CTA', 'Sei por que retenção importa', 'Escrevi um roteiro em 2 colunas'],
        }),
        L('a2', 8, 'Tipos de vídeo, B-roll e legendas na tela', {
          objective: 'Escolher o tipo certo de vídeo e produzir com qualidade usando o celular.',
          content: [
            '**Tipos de vídeo:** educativo (dica, tutorial, mito ou verdade); autoridade (bastidores técnicos, análise, case, processo); venda (demonstração, depoimento, oferta, resposta a objeção); relacionamento (rotina, opinião, trend adaptada ao nicho). Cada tipo serve a uma etapa da jornada do Módulo 2.',
            '**B-roll** são imagens de apoio que cobrem a fala: mãos trabalhando, ambiente, produto, detalhes. Elas escondem cortes e deixam o vídeo dinâmico. Hábito profissional: toda sessão de gravação inclui 10 a 15 clipes de 3 a 5 segundos para usar depois.',
            '**Legendas na tela** são obrigatórias, porque boa parte das pessoas assiste sem som. Use fonte grande, no máximo 2 linhas, alto contraste, e mantenha o texto longe das bordas e da parte de baixo, onde a interface cobre o vídeo. **Produção simples:** luz natural de frente, celular na vertical e na altura dos olhos, microfone perto da boca — áudio ruim derruba um vídeo mais que imagem ruim.',
          ],
          concepts: [
            ['B-roll', 'Imagens de cobertura que ilustram a fala e escondem cortes.'],
            ['Área segura', 'Região do vídeo que a interface do app não cobre.'],
            ['Banco de imagens próprio', 'Clipes gravados com antecedência para reaproveitar.'],
            ['Trend adaptada', 'Usar um formato em alta trazendo o assunto do nicho.'],
          ],
          example: [
            'Vídeo de venda para a marmitaria, 25s: hook “Quanto custa comer bem por dia?” → B-roll de supermercado com preços → corte para a marmita pronta → comparação simples → depoimento curto de cliente → CTA “Kit da semana no link da bio”.',
          ],
          practice: 'Grave 10 clipes de B-roll de qualquer coisa ao seu redor (mesa, mãos, ambiente) só para treinar enquadramento e luz.',
          task: 'Liste 5 ideias de Reels, uma de cada tipo (2 educativos), já com o hook escrito.',
          checklist: ['Conheço os 4 tipos de vídeo', 'Sei para que serve B-roll', 'Sei as regras de legenda na tela', 'Gravei clipes de treino'],
        }),
      ],
      {
        title: '5 roteiros de Reels',
        objective: 'Roteirizar vídeos curtos de tipos diferentes, prontos para gravar.',
        steps: [
          'Crie 5 roteiros: 2 educativos, 1 de autoridade, 1 de venda e 1 de relacionamento.',
          'Use o formato de 2 colunas: o que se vê / o que se ouve, com marcação de tempo.',
          'Escreva o texto na tela do hook e a legenda de cada vídeo.',
          'Liste o B-roll necessário para cada roteiro.',
        ],
        checklist: ['5 roteiros nos tipos pedidos', 'Hook nos 3 primeiros segundos', 'Formato em 2 colunas com tempo', 'Texto na tela e legenda', 'Lista de B-roll'],
        template:
          'REELS 1 — Educativo\nHook (texto na tela):\n0–3s | VEJO: | OUÇO:\n3–10s | VEJO: | OUÇO:\n10–20s | VEJO: | OUÇO:\nCTA | VEJO: | OUÇO:\nB-roll necessário:\nLegenda:\n\nREELS 2 — Educativo\n\nREELS 3 — Autoridade\n\nREELS 4 — Venda\n\nREELS 5 — Relacionamento\n',
      },
    ),
    M(
      'm06',
      'Design para Social Media',
      'Hierarquia visual, tipografia, cores, contraste, composição e identidade visual.',
      [
        L('a1', 9, 'Hierarquia, tipografia, cores e contraste', {
          objective: 'Entender os princípios que fazem uma peça ser lida em 2 segundos.',
          content: [
            'Design em social media existe para a mensagem ser entendida rápido. **Hierarquia visual** é o olho saber o que ler primeiro, segundo e terceiro — controlada por tamanho, peso, cor e posição. Se tudo tem o mesmo destaque, nada tem.',
            '**Tipografia:** no máximo 2 famílias — uma para títulos (com personalidade) e uma para texto (legível). Em uma arte de 1080 px de largura, texto corrido abaixo de ~28 px fica difícil de ler no celular. Evite caixa alta em textos longos e frases centralizadas com muitas linhas.',
            '**Cores:** uma cor principal, uma de destaque e neutros. A regra 60-30-10 (60% base, 30% secundária, 10% destaque) ajuda a manter equilíbrio. **Contraste:** texto sobre foto precisa de uma camada escura ou clara por trás. Teste final: veja a peça no celular, com brilho baixo, a um braço de distância.',
          ],
          concepts: [
            ['Hierarquia', 'Ordem de leitura definida pelo design.'],
            ['Família tipográfica', 'Conjunto de pesos de uma mesma fonte. Use pesos antes de adicionar fontes.'],
            ['60-30-10', 'Proporção de uso das cores para manter equilíbrio.'],
            ['Contraste', 'Diferença de luminosidade entre texto e fundo; define a legibilidade.'],
          ],
          example: [
            'Post de promoção com 5 informações no mesmo tamanho → ninguém lê. Versão corrigida: “Kit 10 marmitas” enorme no topo; “R$ X” em destaque com a cor de acento; “até domingo” menor; logo discreto embaixo. O olho segue um caminho.',
          ],
          practice: 'Abra 5 posts do seu nicho e, para cada um, diga qual é o 1º, 2º e 3º elemento que você leu. A ordem é a que a marca queria?',
          task: 'Escolha uma paleta (3 a 5 cores com código hexadecimal) e um par de fontes para a sua empresa fictícia.',
          checklist: ['Sei identificar hierarquia em uma peça', 'Uso no máximo 2 fontes', 'Sei aplicar 60-30-10', 'Testo contraste no celular'],
        }),
        L('a2', 9, 'Espaçamento, composição, identidade e consistência do feed', {
          objective: 'Produzir peças com aparência profissional e um feed reconhecível.',
          content: [
            '**Espaçamento:** respiro é o que mais separa amador de profissional. Margens generosas (por volta de 80 a 100 px numa arte de 1080 px) e espaço entre blocos. **Composição:** alinhe elementos a um grid, tenha um único ponto focal por peça e use alinhamento consistente (texto alinhado à esquerda costuma ler melhor que centralizado).',
            '**Identidade visual** é o conjunto de logo, paleta, fontes, estilo de foto e elementos gráficos, documentado em um mini manual de 1 página. **Consistência do feed** vem de templates por tipo de conteúdo — o seguidor reconhece a marca antes de ler o nome.',
            'Formatos de referência: 1080×1350 (4:5) para feed e 1080×1920 (9:16) para stories e Reels. A miniatura do perfil recorta as bordas, então mantenha o essencial no centro. O que torna um post profissional: alinhamento, consistência, pouco texto, imagens nítidas e nada amontoado.',
          ],
          concepts: [
            ['Respiro', 'Espaço vazio intencional que organiza a leitura.'],
            ['Grid', 'Estrutura invisível que alinha os elementos.'],
            ['Mini manual', 'Uma página com as regras visuais da marca.'],
            ['Template', 'Modelo reaproveitável por tipo de conteúdo.'],
          ],
          example: [
            '**Mini manual da Marmita da Lu:** paleta verde-folha #2F6B3F, creme #F3EDE2, laranja #E8833A (acento), grafite #2B2B2B · títulos em fonte arredondada e pesada, textos em sans-serif simples · fotos com luz natural e fundo de madeira · elemento gráfico: etiqueta de papel kraft · 3 templates: dica (fundo creme), depoimento (foto + aspas), oferta (fundo verde).',
          ],
          practice: 'Abra um perfil que você admira visualmente e descubra o “manual” dele: quantas cores, quantas fontes, quantos templates?',
          task: 'Escreva o mini manual da sua empresa fictícia e defina 3 templates.',
          checklist: ['Uso margens e respiro', 'Sei montar um mini manual', 'Defini templates por tipo de conteúdo'],
        }),
      ],
      {
        title: 'Identidade visual simples + 5 peças',
        objective: 'Criar uma identidade visual coerente e aplicá-la em peças reais.',
        steps: [
          'Escreva o mini manual: paleta (com hex), 2 fontes, estilo de foto, elementos gráficos.',
          'Defina 3 templates (ex.: dica, depoimento, oferta).',
          'Produza 5 peças (Canva, BestContent ou outra ferramenta) usando textos dos exercícios anteriores.',
          'Monte uma visualização do feed com as 5 peças lado a lado e avalie a consistência.',
          'Descreva abaixo as decisões e cole os links das peças.',
        ],
        checklist: ['Mini manual escrito', '3 templates definidos', '5 peças produzidas', 'Feed avaliado lado a lado', 'Links e decisões registrados'],
        template:
          'MINI MANUAL\nPaleta: principal # | secundária # | acento # | neutros #\nFonte de título:\nFonte de texto:\nEstilo de foto:\nElementos gráficos:\n\nTEMPLATES\n1)\n2)\n3)\n\nPEÇAS (link + decisão de design)\n1)\n2)\n3)\n4)\n5)\n\nAVALIAÇÃO DO FEED:\n',
      },
    ),
    M(
      'm07',
      'IA para Social Media',
      'ChatGPT, Claude e BestContent no fluxo de trabalho — e como revisar o que a IA produz.',
      [
        L('a1', 10, 'ChatGPT: brainstorming, pesquisa, copy e prompts', {
          objective: 'Usar o ChatGPT como assistente de pensamento, não como gerador de texto pronto.',
          content: [
            'Usos de maior valor: **brainstorming** (pedir 30 ideias e você filtrar 3), **pesquisa** (mapear dúvidas e objeções do público — sempre conferindo), **estratégia** (rascunhar persona e pilares a partir de um briefing), **copy** (variações de hooks e CTAs), **análise** (colar métricas e pedir padrões) e **criação de prompts** reutilizáveis.',
            'Estrutura de um bom prompt: **Papel** (quem a IA deve ser) + **Contexto** (marca, persona, objetivo) + **Tarefa** (o que fazer) + **Formato** (como entregar) + **Restrições** (o que evitar) + **Exemplo** (algo que você considera bom).',
            'Trabalhe em ciclos: gere muitas opções → escolha → peça para desenvolver → peça crítica → edite você mesmo. A primeira resposta quase nunca é a melhor; a qualidade vem da iteração.',
          ],
          concepts: [
            ['Prompt', 'A instrução dada à IA. Quanto mais contexto, menos genérica a resposta.'],
            ['Iteração', 'Refinar a resposta em várias rodadas em vez de aceitar a primeira.'],
            ['Prompt reutilizável', 'Modelo com campos variáveis para usar com vários clientes.'],
            ['Checagem', 'Conferir fatos, números e afirmações antes de publicar.'],
          ],
          example: [
            {
              prompt:
                'Você é um estrategista de conteúdo para pequenos negócios de alimentação.\nContexto: a Marmita da Lu vende marmitas congeladas saudáveis para mães que trabalham fora (persona: Camila, 34 anos, sem tempo à noite, acha que congelado não é saudável).\nTarefa: crie 20 ideias de posts de ATRAÇÃO que respondam a dores reais dessa persona.\nFormato: tabela com ideia, formato sugerido (Reels/carrossel) e hook.\nRestrições: nada de frases motivacionais genéricas, nada de datas comemorativas.\nExemplo de ideia boa: "3 mitos sobre comida congelada" — Reels — "Congelado não é sinônimo de ultraprocessado".',
            },
          ],
          practice: 'Rode esse prompt (ou uma versão para outro negócio) e depois peça: “Agora escolha as 5 mais fortes e explique por quê.” Compare com as que você escolheria.',
          task: 'Escreva 3 prompts reutilizáveis: um de ideias, um de hooks e um de análise de métricas. Guarde na Biblioteca.',
          checklist: ['Conheço os 6 componentes de um prompt', 'Trabalho em ciclos de iteração', 'Criei 3 prompts reutilizáveis'],
        }),
        L('a2', 10, 'Claude: projetos, contexto de clientes e sistemas de conteúdo', {
          objective: 'Organizar cada cliente como um projeto com contexto permanente.',
          content: [
            'O recurso de **Projetos** do Claude permite guardar instruções e documentos de um cliente — briefing, persona, posicionamento, tom de voz, exemplos aprovados — e conversar sempre com esse contexto carregado. Regra prática: **um projeto por cliente**.',
            'Monte um **documento mestre do cliente** com: resumo do negócio, persona, posicionamento, pilares, tom de voz (“falamos assim / não falamos assim”), palavras proibidas, produtos e preços, e 5 posts aprovados como referência. Esse documento vira a base de tudo.',
            'Bons usos: planejamento mensal a partir do documento mestre, revisão de copy contra o tom de voz, criação de **sistemas** (template de roteiro, checklist de publicação, estrutura de relatório) e análise de documentos longos, como relatórios e transcrições de reunião.',
          ],
          concepts: [
            ['Projeto', 'Espaço com instruções e arquivos fixos de um cliente.'],
            ['Documento mestre', 'Fonte única da verdade sobre a marca.'],
            ['Tom de voz', 'Como a marca fala — com exemplos do que é e do que não é.'],
            ['Sistema de conteúdo', 'Processos e modelos que tornam a produção repetível.'],
          ],
          example: [
            {
              prompt:
                'Instruções do projeto (exemplo):\nVocê é o estrategista de conteúdo da Marmita da Lu. Antes de responder, consulte o documento mestre anexado.\nTom de voz: acolhedor, prático, sem culpa, sem termos técnicos de nutrição.\nNunca: prometer emagrecimento, usar "dieta", usar mais de 2 emojis por legenda.\nSempre: falar com a Camila (persona), terminar com um único CTA.\nQuando eu pedir revisão, aponte primeiro o que está genérico e depois sugira a versão melhorada.',
            },
          ],
          practice: 'Escreva a seção “falamos assim / não falamos assim” do tom de voz da sua empresa fictícia, com 3 exemplos de cada lado.',
          task: 'Monte o documento mestre completo da sua empresa fictícia. Ele será usado no Exercício 7 e no Projeto Final.',
          checklist: ['Entendo o uso de projetos por cliente', 'Montei um documento mestre', 'Escrevi instruções de projeto'],
        }),
        L('a3', 11, 'BestContent: produção visual em escala e agendamento', {
          objective: 'Encaixar uma ferramenta de produção com IA no lugar certo do fluxo.',
          content: [
            'Ferramentas como o BestContent aceleram a parte visual e operacional: **criação de posts e carrosséis, aplicação de identidade visual, adaptação de um conteúdo para vários formatos, produção em escala e agendamento**. Explore os recursos da sua conta — o fluxo abaixo vale para qualquer ferramenta desse tipo.',
            'Regra de ouro: **nunca comece pela ferramenta**. A ordem certa é estratégia (Módulo 2) → texto aprovado (ChatGPT/Claude + sua edição) → produção visual (BestContent) → revisão → agendamento. Quem começa clicando em “gerar” recebe conteúdo bonito e vazio.',
            'Fluxo prático: 1) configure a identidade visual da marca (cores, fontes, logo) uma vez; 2) leve o texto já revisado; 3) gere as peças; 4) ajuste hierarquia e respiro com o olhar do Módulo 6; 5) adapte para os formatos necessários (feed, stories); 6) agende seguindo o calendário editorial.',
          ],
          concepts: [
            ['Produção em escala', 'Gerar várias peças consistentes a partir de um padrão.'],
            ['Adaptação', 'Transformar um conteúdo em outros formatos (carrossel → stories → estático).'],
            ['Agendamento', 'Programar publicações seguindo o calendário.'],
            ['Estratégia primeiro', 'A ferramenta executa; quem decide é você.'],
          ],
          example: [
            'Semana da marmitaria: o calendário já define 3 posts. Os textos saem do projeto do Claude e você edita. No BestContent, a identidade já está configurada: os 3 posts viram peças, o carrossel de autoridade também vira uma sequência de stories, e tudo fica agendado para seg, qua e sex às 17h.',
          ],
          practice: 'Configure (ou simule no papel) a identidade da sua empresa fictícia na ferramenta e gere 1 peça a partir de um texto que você já escreveu.',
          task: 'Desenhe o fluxo completo de produção semanal com as 3 ferramentas: quem faz o quê, em que ordem e onde fica cada arquivo.',
          checklist: ['Sei onde a ferramenta entra no fluxo', 'Configurei ou planejei a identidade visual', 'Desenhei o fluxo semanal'],
        }),
        L('a4', 11, 'Como revisar e melhorar o que a IA produz', {
          objective: 'Desenvolver a habilidade que separa um social media de alguém que aperta botão.',
          content: [
            'IA tende a produzir o “médio”: texto correto, genérico e reconhecível. Seu trabalho é levar do médio ao específico. Use este checklist em tudo: **1)** serviria para qualquer marca ou só para esta? **2)** os fatos e números são verificáveis? (IA inventa dados com confiança) **3)** está no tom de voz da marca? **4)** tem clichês (“no mundo de hoje”, “transforme sua vida”, “desbloqueie”, excesso de emojis)? **5)** a promessa é honesta? **6)** tem um único CTA claro? **7)** soa natural lido em voz alta?',
            'Técnicas: dê contexto e exemplos bons *antes* de pedir; peça crítica (“aponte as 3 partes mais genéricas e reescreva só elas”); reescreva você mesmo a primeira linha; corte 20 a 30% do texto; troque adjetivos por fatos do cliente. Use a IA como editora e parceira de ideias, não como autora final.',
            'Atenção a regras do nicho: áreas como saúde, nutrição e odontologia têm normas dos conselhos profissionais sobre publicidade (por exemplo, sobre promessas de resultado e imagens de antes/depois). A responsabilidade pelo que é publicado é de quem publica — não da IA.',
          ],
          concepts: [
            ['Texto médio', 'Correto mas genérico; serve para qualquer marca.'],
            ['Alucinação', 'Quando a IA afirma algo falso com segurança.'],
            ['Edição por corte', 'Remover o que não adiciona — geralmente melhora mais que reescrever.'],
            ['Responsabilidade', 'O profissional responde pelo conteúdo publicado.'],
          ],
          example: [
            '**Gerado:** “Descubra o poder de uma alimentação saudável e transforme sua rotina com nossas deliciosas marmitas! 🌱✨💪🥗”',
            '**Revisado:** “Jantar pronto em 6 minutos, feito com receita de nutricionista. Sem conservantes, sem culpa por não ter cozinhado.” — específico, verificável, no tom da marca, sem clichê.',
          ],
          practice: 'Peça a uma IA uma legenda para qualquer negócio e passe o checklist de 7 pontos. Quantos itens ela reprova?',
          task: 'Pegue 3 textos gerados por IA e documente: versão original, problemas encontrados no checklist e sua versão final.',
          checklist: ['Sei o checklist de 7 pontos', 'Uso a IA para criticar, não só para gerar', 'Conheço o cuidado com normas de nichos regulados', 'Revisei 3 textos gerados'],
        }),
      ],
      {
        title: 'Uma semana de conteúdo com ChatGPT + Claude + BestContent',
        objective: 'Executar o fluxo completo com IA — e documentar onde o seu julgamento entrou.',
        steps: [
          'Crie no Claude um projeto para a empresa fictícia com o documento mestre.',
          'Use o ChatGPT para gerar ideias e hooks; escolha os melhores.',
          'Use o projeto do Claude para planejar a semana e escrever/revisar as copies no tom da marca.',
          'Passe tudo pelo checklist de revisão de 7 pontos e edite.',
          'Produza as peças no BestContent e organize o agendamento.',
          'Registre os prompts usados e, para pelo menos 2 peças, a versão original da IA e a sua versão final.',
        ],
        checklist: [
          'Projeto com documento mestre criado',
          'Ideias e hooks gerados e filtrados',
          'Semana planejada e copies escritas',
          'Checklist de revisão aplicado',
          'Peças produzidas e agendadas',
          'Prompts e comparações documentados',
        ],
        template:
          'SEMANA — Empresa:\n\nPROMPTS USADOS\nChatGPT:\nClaude:\n\nPLANO DA SEMANA\nSeg:\nTer:\nQua:\nQui:\nSex:\nStories:\n\nCOMPARAÇÃO IA × FINAL\nPeça 1 — original da IA:\nProblemas (checklist):\nVersão final:\n\nPeça 2 — original da IA:\nProblemas:\nVersão final:\n\nO QUE APRENDI SOBRE REVISAR IA:\n',
      },
    ),
    M(
      'm08',
      'Análise de Métricas',
      'O que cada métrica significa e como decidir o que repetir, modificar ou abandonar.',
      [
        L('a1', 12, 'O que cada métrica significa', {
          objective: 'Ler os números do Instagram sabendo o que cada um indica.',
          content: [
            '**Alcance:** contas únicas que viram o conteúdo. **Impressões / visualizações:** total de exibições, contando repetições. **Curtidas:** sinal fraco, de reação rápida. **Comentários:** conversa — indica que o tema mexeu com alguém. **Compartilhamentos:** sinal forte; a pessoa colocou a reputação dela no seu conteúdo e isso puxa alcance novo. **Salvamentos:** valor de consulta; ótimo indicador de autoridade.',
            '**Crescimento de seguidores:** seguidores ganhos menos perdidos; olhe quais posts trouxeram seguidores. **Retenção (Reels):** tempo médio assistido e em que momento as pessoas saem. **Cliques:** no link, no perfil, em botões. **Conversão:** a ação final que importa para o negócio — mensagem, agendamento, venda.',
            'Separe **métricas de vaidade** (curtidas, seguidores isolados) de **métricas de negócio** (mensagens, cliques, vendas). Uma taxa útil para comparar posts: engajamento sobre alcance = (curtidas + comentários + compartilhamentos + salvamentos) ÷ alcance × 100.',
          ],
          concepts: [
            ['Alcance', 'Quantas pessoas diferentes viram.'],
            ['Compartilhamento', 'Gera alcance novo; sinal de conteúdo que as pessoas querem mostrar.'],
            ['Salvamento', 'Indica utilidade e autoridade.'],
            ['Conversão', 'A ação que paga as contas do cliente.'],
          ],
          example: [
            'Post A: 10.000 de alcance, 400 curtidas, 3 salvamentos. Post B: 2.000 de alcance, 90 curtidas, 180 salvamentos. O A foi visto; o B foi útil. Para autoridade, o B é o melhor post — mesmo “parecendo” pior.',
          ],
          practice: 'Se você tem um perfil (pessoal ou profissional), abra os insights e anote as métricas dos últimos 5 posts.',
          task: 'Escreva com suas palavras o que cada uma das 10 métricas significa e qual objetivo (alcance, engajamento, autoridade, conversão) ela indica.',
          checklist: ['Sei o que cada métrica mede', 'Diferencio vaidade de negócio', 'Sei calcular engajamento sobre alcance'],
        }),
        L('a2', 12, 'Interpretando resultados: repetir, modificar ou abandonar', {
          objective: 'Transformar números em decisões de conteúdo.',
          content: [
            'Compare cada post com a **média do próprio perfil**, não com outros perfis. E nunca decida com um post isolado: olhe padrões em 3 ou mais conteúdos do mesmo tema ou formato.',
            'Matriz de decisão: **alcance alto + salvamento/compartilhamento alto** → REPETIR (fórmula vencedora; faça variações). **Alcance alto + engajamento baixo** → hook bom, conteúdo fraco → MODIFICAR o desenvolvimento. **Alcance baixo + engajamento alto** → conteúdo bom, embalagem fraca → MODIFICAR capa/hook e testar de novo. **Baixo em tudo por 3 tentativas** → ABANDONAR o tema ou formato.',
            'Também olhe o agregado: qual pilar e qual formato performam melhor no mês? E cruze sempre com o objetivo — um post de conversão com pouco alcance e 15 mensagens no direct pode ser o melhor post do mês.',
          ],
          concepts: [
            ['Média do perfil', 'A régua certa para comparar desempenho.'],
            ['Padrão', 'Repetição de resultado em vários posts; amostra mínima de 3.'],
            ['Variação', 'Repetir a fórmula vencedora com outro tema ou ângulo.'],
            ['Teste', 'Mudar uma variável por vez (capa, hook, horário) para aprender.'],
          ],
          example: [
            'Um Reels de trend teve o maior alcance do mês, mas quase nenhum salvamento, compartilhamento ou seguidor novo. Conclusão: alcance vazio. Decisão: não abandonar trends, mas MODIFICAR — usar o formato da trend trazendo o assunto do nicho.',
          ],
          practice: 'Aplique a matriz nos 5 posts que você anotou na aula anterior (ou em dados de exemplo).',
          task: 'Resolva o Exercício 8 com o conjunto de métricas fictícias.',
          checklist: ['Comparo com a média do perfil', 'Uso a matriz repetir / modificar / abandonar', 'Cruzo resultado com o objetivo do post'],
        }),
      ],
      {
        title: 'Análise de métricas fictícias',
        objective: 'Decidir quais conteúdos repetir, modificar ou abandonar com base em dados.',
        steps: [
          'Analise a tabela de 10 posts da Marmita da Lu abaixo.',
          'Calcule a taxa de engajamento sobre alcance de cada post.',
          'Calcule a média de alcance do perfil e compare cada post com ela.',
          'Classifique cada post em REPETIR, MODIFICAR ou ABANDONAR, explicando o porquê.',
          'Escreva 3 recomendações para o próximo mês.',
        ],
        data: [
          {
            table: [
              ['#', 'Formato', 'Tema', 'Alcance', 'Curt.', 'Coment.', 'Compart.', 'Salv.', 'Seguid.'],
              ['1', 'Reels', '3 mitos sobre congelados', '8.400', '310', '42', '95', '120', '38'],
              ['2', 'Carrossel', 'Cardápio da semana', '1.100', '64', '5', '2', '9', '1'],
              ['3', 'Reels', 'Bastidores da cozinha às 6h', '3.900', '280', '31', '12', '8', '14'],
              ['4', 'Carrossel', 'Guia: monte seu prato equilibrado', '2.300', '150', '12', '40', '210', '9'],
              ['5', 'Estático', 'Promoção kit 10 marmitas', '900', '35', '9', '1', '2', '0'],
              ['6', 'Reels', 'Trend de dança da equipe', '12.500', '420', '18', '30', '3', '6'],
              ['7', 'Carrossel', '5 erros que sabotam sua dieta à noite', '6.800', '390', '27', '88', '260', '41'],
              ['8', 'Reels', 'Depoimento: Camila e o filho', '2.600', '190', '36', '15', '6', '11'],
              ['9', 'Estático', 'Feliz dia do nutricionista', '700', '48', '3', '0', '0', '0'],
              ['10', 'Reels', 'Quanto custa comer saudável por dia', '5.200', '260', '64', '70', '95', '27'],
            ],
          },
          'Informação extra: o post 5 gerou 14 mensagens no direct pedindo o kit; o post 8 gerou 9.',
        ],
        checklist: [
          'Taxa de engajamento calculada para os 10',
          'Média de alcance calculada',
          '10 posts classificados com justificativa',
          'Considerei as mensagens (conversão), não só o alcance',
          '3 recomendações escritas',
        ],
        template:
          'Média de alcance:\n\n#1 — taxa: % — decisão: — porquê:\n#2 —\n#3 —\n#4 —\n#5 —\n#6 —\n#7 —\n#8 —\n#9 —\n#10 —\n\nPADRÕES (formato / tema):\n\nRECOMENDAÇÕES PARA O PRÓXIMO MÊS\n1)\n2)\n3)\n',
      },
    ),
    M(
      'm09',
      'Gestão de Clientes',
      'Briefing, reunião inicial, objetivos, aprovação, revisões, entregas, arquivos e relatórios.',
      [
        L('a1', 13, 'Briefing, reunião inicial e definição de objetivos', {
          objective: 'Começar a relação com um cliente entendendo o negócio de verdade.',
          content: [
            'A **reunião inicial** (30 a 60 minutos) serve para escutar mais do que falar. Perguntas de descoberta: o que você vende e qual produto dá mais lucro? Quem é o cliente ideal e quem é o cliente que você não quer? Como as vendas acontecem hoje? Quem são os concorrentes? O que já tentou nas redes e o que deu certo ou errado? O que você não quer de jeito nenhum? Quem vai gravar vídeos e enviar fotos? Quem aprova o conteúdo?',
            'O **briefing** é o documento que organiza essas respostas. Ele vira a base do documento mestre (Módulo 7) e evita retrabalho.',
            '**Objetivos** precisam ser específicos, mensuráveis e com prazo. “Crescer no Instagram” não é objetivo. “Aumentar as mensagens no WhatsApp vindas do Instagram de 10 para 25 por mês em 90 dias” é. Alinhe também a expectativa: orgânico é trabalho de médio prazo, e os primeiros 2 a 3 meses são de construção.',
          ],
          concepts: [
            ['Descoberta', 'Fase de perguntas antes de qualquer proposta.'],
            ['Briefing', 'Documento com as informações essenciais do cliente.'],
            ['Objetivo mensurável', 'Tem número, métrica e prazo.'],
            ['Alinhamento de expectativa', 'Deixar claro o que é realista e em quanto tempo.'],
          ],
          example: [
            '**Objetivo mal definido:** “Quero mais engajamento.”',
            '**Bem definido:** “Chegar a 40 mensagens por mês pedindo orçamento de kit, partindo de 12, até o fim do trimestre — medindo pelos cliques no link do WhatsApp e mensagens no direct.”',
          ],
          practice: 'Faça a reunião inicial com alguém próximo que tenha um negócio (ou simule com a IA fazendo o papel de cliente).',
          task: 'Monte seu roteiro de perguntas de descoberta com pelo menos 15 perguntas, agrupadas por tema.',
          checklist: ['Tenho um roteiro de descoberta', 'Sei transformar desejo vago em objetivo mensurável', 'Sei alinhar expectativas de prazo'],
        }),
        L('a2', 13, 'Aprovação, revisões, entregas, arquivos, comunicação e relatórios', {
          objective: 'Rodar a operação mensal de um cliente sem caos.',
          content: [
            '**Fluxo mensal:** planejamento (última semana do mês anterior) → aprovação do calendário → produção em lote → aprovação das peças (com prazo, por exemplo 48 h) → agendamento → acompanhamento → relatório. **Revisões:** defina no contrato quantas rodadas cada peça tem (ex.: 2). Sem limite, o mês nunca fecha.',
            '**Arquivos:** estrutura padrão de pastas — Cliente / Ano / Mês / 01_Planejamento, 02_Producao, 03_Aprovados, 04_Publicados, 05_Brutos — e nomes padronizados como *2026-10-07_reels_mitos-congelados_v2*. **Comunicação:** um canal oficial, horário de atendimento combinado e resumo por escrito depois de cada reunião.',
            '**Relatório mensal** em 1 página, na linguagem do cliente: resumo do mês, números principais comparados ao mês anterior, 3 melhores conteúdos e por quê, aprendizados e próximos passos. O relatório é o que faz o cliente renovar.',
          ],
          concepts: [
            ['Rodada de revisão', 'Uma volta de ajustes pedida pelo cliente.'],
            ['Prazo de aprovação', 'Tempo que o cliente tem para aprovar antes de afetar o calendário.'],
            ['Nomenclatura', 'Padrão de nomes que permite achar qualquer arquivo.'],
            ['Relatório', 'Prova de valor do seu trabalho.'],
          ],
          example: [
            '**Relatório de outubro — Marmita da Lu:** “Alcance subiu 38%. O carrossel ‘5 erros que sabotam sua dieta à noite’ gerou 260 salvamentos e 41 seguidores. Mensagens pedindo kit: 19 (eram 12). Aprendizado: conteúdo de erros comuns é o nosso melhor formato. Próximo mês: série semanal de erros + 2 depoimentos em vídeo.”',
          ],
          practice: 'Crie agora no seu computador a estrutura de pastas para o seu cliente fictício.',
          task: 'Escreva o modelo do seu relatório mensal com as 5 seções.',
          checklist: ['Conheço o fluxo mensal', 'Defini limite de revisões', 'Criei estrutura de pastas', 'Tenho um modelo de relatório'],
        }),
      ],
      {
        title: 'Briefing completo de um cliente fictício',
        objective: 'Criar o documento que inicia qualquer trabalho de social media.',
        steps: [
          'Simule a reunião inicial (você pode pedir para uma IA interpretar o dono do negócio).',
          'Preencha todas as seções do briefing abaixo.',
          'Transforme o desejo do cliente em 1 objetivo principal mensurável e com prazo.',
          'Liste as combinações operacionais: canal de comunicação, prazo de aprovação, rodadas de revisão, quem fornece fotos e vídeos.',
        ],
        checklist: ['Reunião inicial simulada', 'Todas as seções preenchidas', 'Objetivo mensurável com prazo', 'Combinações operacionais definidas'],
        template:
          'BRIEFING\nEmpresa / responsável:\nO que vende (produto mais lucrativo):\nComo vende hoje:\nCliente ideal:\nCliente que NÃO quer:\nConcorrentes (3):\nDiferenciais reais:\nO que já tentou nas redes:\nO que não quer de jeito nenhum:\nTom de voz desejado:\nMaterial disponível (fotos, vídeos, quem grava):\nQuem aprova:\n\nOBJETIVO PRINCIPAL (métrica + número + prazo):\n\nOPERAÇÃO\nCanal oficial:\nPrazo de aprovação:\nRodadas de revisão:\nDia da reunião mensal:\n',
      },
    ),
    M(
      'm10',
      'Montando meu Primeiro Serviço',
      'O que vender, pacotes, portfólio, primeiros clientes e organização da operação.',
      [
        L('a1', 14, 'O que vender e como montar um pacote', {
          objective: 'Definir uma oferta clara, entregável e repetível.',
          content: [
            'Comece vendendo algo que você entrega bem e de forma repetível. Componentes possíveis de um pacote: planejamento mensal, quantidade de posts no feed, stories, roteiros de Reels (o cliente grava ou você grava?), gestão de comunidade (responder comentários e directs?), relatório e reunião mensal.',
            'Exemplo de estrutura: **Essencial** — 8 posts/mês, calendário, relatório simples. **Crescimento** — 12 posts incluindo 4 Reels roteirizados, stories 3× por semana, relatório + reunião mensal. Defina a quantidade de posts pelo objetivo do cliente e pela capacidade dele de fornecer material (fotos, vídeos, tempo para gravar).',
            'Para precificar, estime as horas por mês que o pacote exige (planejamento + produção + revisões + reuniões + relatório), multiplique por quanto vale sua hora e adicione margem. Pesquise o que profissionais da sua região e do seu nível cobram — preços variam muito por cidade e nicho.',
          ],
          concepts: [
            ['Pacote', 'Conjunto fechado de entregas com preço fixo.'],
            ['Escopo', 'O que está incluso, por escrito.'],
            ['Capacidade do cliente', 'O que o cliente consegue fornecer (material, tempo, aprovação).'],
            ['Preço por horas', 'Horas estimadas × valor-hora + margem.'],
          ],
          example: [
            'Pacote Crescimento: estimativa de 4 h de planejamento, 14 h de produção, 3 h de revisões, 2 h de reunião e relatório = 23 h/mês. Com esse número, você decide o preço sabendo quanto ganha por hora — e percebe que mais de 3 ou 4 clientes nesse pacote já ocupam a semana.',
          ],
          practice: 'Liste suas horas reais disponíveis por semana para trabalhar com social media e calcule quantos clientes cabem.',
          task: 'Desenhe 2 pacotes com entregas, limites de revisão e estimativa de horas.',
          checklist: ['Sei o que pode entrar em um pacote', 'Montei 2 pacotes', 'Estimei horas por pacote', 'Sei quantos clientes cabem na minha rotina'],
        }),
        L('a2', 14, 'Portfólio, primeiros clientes e organização', {
          objective: 'Sair da teoria e conseguir os primeiros clientes sem se desorganizar.',
          content: [
            '**Portfólio sem clientes:** o Projeto Final desta formação (deixe claro que é um estudo de caso), análises de perfis reais com “como eu melhoraria”, e um perfil próprio aplicando o que você aprendeu. Mostre processo e raciocínio, não só peças bonitas.',
            '**Primeiros clientes:** comece pela rede próxima (família, amigos, conhecidos com negócio) e negócios locais com perfil fraco. Em vez de “faço social media”, envie um **mini diagnóstico gratuito** com 3 melhorias (o método do Módulo 1). Considere 1 ou 2 clientes piloto com prazo definido, em troca de depoimento e permissão para usar como case.',
            '**Apresentação:** diagnóstico → problema → proposta → pacote → próximos passos. **Como não se desorganizar:** contrato simples, calendário de produção fixo, templates para tudo (briefing, calendário, relatório), checklist de publicação e um limite de clientes compatível com sua rotina.',
          ],
          concepts: [
            ['Estudo de caso', 'Projeto que mostra problema, processo e resultado.'],
            ['Mini diagnóstico', 'Análise curta e gratuita que prova sua competência.'],
            ['Cliente piloto', 'Primeiro cliente com condição especial, prazo definido e contrapartida.'],
            ['Limite de clientes', 'Teto que protege a qualidade da entrega.'],
          ],
          example: [
            '**Abordagem ruim:** “Oi! Sou social media, quer contratar?”',
            '**Abordagem boa:** “Oi, Marina! Acompanho a confeitaria e preparei 3 ajustes rápidos que podem trazer mais encomendas pelo Instagram: (1) bio com prazo de encomenda e link direto, (2) destaques organizados por tipo de bolo, (3) uma série semanal mostrando bastidores. Se fizer sentido, posso explicar em 15 minutos.”',
          ],
          practice: 'Escolha 3 negócios locais e anote para cada um as 3 melhorias que você enviaria.',
          task: 'Escreva sua mensagem de abordagem e a estrutura da sua apresentação de proposta.',
          checklist: ['Sei montar portfólio sem clientes', 'Tenho uma mensagem de abordagem', 'Sei estruturar uma apresentação', 'Tenho regras para não me desorganizar'],
        }),
      ],
      {
        title: 'Operação completa de social media',
        objective: 'Desenhar a operação de ponta a ponta como se fosse começar com um cliente amanhã.',
        steps: [
          'Defina o pacote vendido para o cliente fictício (entregas, limites, horas).',
          'Monte o cronograma mensal (semana a semana).',
          'Descreva o fluxo de aprovação e revisões.',
          'Defina a estrutura de pastas e a nomenclatura de arquivos.',
          'Escreva o modelo de relatório mensal.',
          'Escreva a mensagem de abordagem e o roteiro da apresentação da proposta.',
        ],
        checklist: ['Pacote definido', 'Cronograma mensal', 'Fluxo de aprovação', 'Estrutura de pastas e nomes', 'Modelo de relatório', 'Abordagem e apresentação'],
        template:
          'PACOTE\nNome:\nEntregas:\nRevisões:\nHoras estimadas/mês:\n\nCRONOGRAMA MENSAL\nSemana 1:\nSemana 2:\nSemana 3:\nSemana 4:\n\nFLUXO DE APROVAÇÃO:\n\nPASTAS E NOMES:\n\nRELATÓRIO (modelo):\n\nMENSAGEM DE ABORDAGEM:\n\nAPRESENTAÇÃO (diagnóstico → problema → proposta → pacote → próximos passos):\n',
      },
    ),
  ],
  project: {
    title: 'Projeto Final — Estratégia completa de Social Media para uma empresa fictícia',
    description: 'Uma operação completa, da análise ao relatório. Termine e ela vira o primeiro case do seu portfólio — exporte em texto para montar a apresentação.',
    stages: [
      stage('empresa', 'Empresa fictícia', 'Nome, o que vende, onde, há quanto tempo, ticket médio, como vende hoje.'),
      stage('analise', 'Análise do negócio', 'Diagnóstico de 5 etapas do perfil atual (ou do perfil imaginado), concorrentes e oportunidades.'),
      stage('publico', 'Público', 'Público-alvo com dados demográficos e comportamento.'),
      stage('persona', 'Persona', 'Personagem com rotina, dores, desejos, objeções e frases que diria.'),
      stage('posicionamento', 'Posicionamento', 'Frase de posicionamento + diferenciais com prova.'),
      stage('pilares', 'Pilares de conteúdo', '4 pilares com proporção e exemplos de temas.'),
      stage('estrategia', 'Estratégia', 'Objetivo mensurável, frequência, formatos, mix de atração/autoridade/relacionamento/conversão.'),
      stage('calendario', 'Calendário', 'Calendário de 1 mês com data, formato, pilar, tipo e tema.'),
      stage('ideias', 'Ideias', 'Banco de 20 ideias com hook.'),
      stage('copy', 'Copy', 'Legendas finais do mês, revisadas com o checklist de 7 pontos.'),
      stage('carrosseis', 'Carrosséis', 'Texto slide a slide dos carrosséis do mês.'),
      stage('reels', 'Reels', 'Roteiros em 2 colunas + lista de B-roll.'),
      stage('design', 'Design', 'Mini manual da identidade, templates e links das peças produzidas.'),
      stage('publicacao', 'Publicação', 'Agendamento, horários escolhidos e checklist de publicação.'),
      stage('metricas', 'Métricas', 'Resultados (reais ou simulados) e classificação repetir/modificar/abandonar.'),
      stage('relatorio', 'Relatório', 'Relatório de 1 página no formato de cliente — esta é a peça principal do case.'),
    ],
  },
  tools: [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      purpose: 'Gerar volume de ideias, variações de copy, pesquisa exploratória e análise rápida de dados colados.',
      when: 'No começo do processo (brainstorming e hooks) e quando você precisa de muitas variações para escolher.',
      learn: [
        'Estrutura de prompt em 6 partes',
        'Iterar em ciclos: gerar → escolher → desenvolver → criticar',
        'Criar prompts reutilizáveis por tipo de tarefa',
        'Checar fatos e números antes de usar',
      ],
    },
    {
      id: 'claude',
      name: 'Claude',
      purpose: 'Trabalhar com contexto profundo de cada cliente: estratégia, planejamento, revisão de copy e criação de sistemas.',
      when: 'Quando o trabalho depende de muita informação do cliente (briefing, tom de voz, histórico) e de consistência ao longo dos meses.',
      learn: [
        'Um projeto por cliente com documento mestre',
        'Instruções de projeto com tom de voz e proibições',
        'Pedir crítica antes de pedir reescrita',
        'Montar templates de roteiro, relatório e checklist',
      ],
    },
    {
      id: 'bestcontent',
      name: 'BestContent',
      purpose: 'Produção visual: posts, carrosséis, aplicação de identidade visual, adaptação de formatos, produção em escala e agendamento.',
      when: 'Depois que a estratégia e os textos estão aprovados — nunca como ponto de partida.',
      learn: [
        'Configurar a identidade visual da marca',
        'Transformar texto aprovado em peças',
        'Adaptar um conteúdo para vários formatos',
        'Agendar seguindo o calendário editorial',
      ],
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      purpose: 'Criar automações e pequenas ferramentas com código: organizar arquivos, gerar relatórios a partir de planilhas, montar painéis.',
      when: 'Quando uma tarefa repetitiva começa a tomar horas toda semana — depois de dominar a operação manual.',
      learn: [
        'Descrever bem uma automação antes de pedir',
        'Automatizar relatório a partir de CSV de métricas',
        'Renomear e organizar arquivos em lote',
        'Entender o básico do que o código faz para revisar',
      ],
    },
    {
      id: 'codex',
      name: 'Codex',
      purpose: 'Agente de programação da OpenAI, com usos parecidos com o Claude Code: scripts, automações e ferramentas internas.',
      when: 'Mesma fase do Claude Code; útil para comparar abordagens e escolher a ferramenta que se encaixa melhor no seu fluxo.',
      learn: ['Pedir tarefas pequenas e bem delimitadas', 'Testar o resultado antes de usar com cliente', 'Versionar o que foi criado', 'Documentar cada automação'],
    },
  ],
})
