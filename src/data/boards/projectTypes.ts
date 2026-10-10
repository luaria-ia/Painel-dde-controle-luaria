import type { BoardField, BoardTemplate, BuiltinProjectTab, CardTemplate, ListTemplate, ProjectTypeDef } from '@/types/boards'

/*
 * CLIENTE → PROJETO → TIPO → ÁREAS (abas do projeto) → workflow / dossiê / painel.
 *
 * Kanban NÃO é um módulo global: é a interface de workflow de uma ÁREA específica do projeto.
 * Cada tipo declara:
 *   - areas: as abas próprias do tipo (ex.: Luaria.IA → CRM, Marketing; Social Media → Estratégia, Conteúdo, Métricas);
 *   - boards: os templates que armazenam os dados dessas áreas (criados pelo banco junto com o projeto);
 *   - tabs: quais abas nativas do Business OS fazem sentido para o tipo.
 * Novo tipo = um objeto a mais em PROJECT_TYPES. As chaves (`key`) de listas e templates são usadas
 * pelas automações e pelo armazenamento — não renomeie.
 */

// ---------- Blocos reutilizáveis ----------

const list = (key: string, name: string, icon: string, kind?: ListTemplate['kind'], cards?: CardTemplate[]): ListTemplate => ({ key, name, icon, kind, cards })

/** Workflow de produção de conteúdo (Marketing da Luaria e Conteúdo de Social Media). */
const contentFlow: ListTemplate[] = [
  list('ideias', 'Banco de ideias', '💡'),
  list('planejamento', 'Planejamento', '📅'),
  list('copy', 'Copy', '✍️'),
  list('producao', 'Produção', '🎨'),
  list('aprovacao', 'Aprovação', '👀'),
  list('agendados', 'Agendados', '📆'),
  list('publicados', 'Publicados', '✅'),
]

const contentLabels = (approvalLabel: string): BoardTemplate['labels'] => [
  { name: 'Reel', color: 'sky' },
  { name: 'Carrossel', color: 'violet' },
  { name: 'Story', color: 'emerald' },
  { name: 'Post estático', color: 'amber' },
  { name: 'Urgente', color: 'rose' },
  { name: approvalLabel, color: 'orange' },
  { name: 'Pronto para publicar', color: 'teal' },
]

const contentFields: BoardField[] = [
  { key: 'formato', label: 'Formato', type: 'select', options: ['Reel', 'Carrossel', 'Story', 'Post estático'], showOnCard: true },
  { key: 'pilar', label: 'Pilar de conteúdo', type: 'text' },
  { key: 'objetivo', label: 'Objetivo', type: 'select', options: ['Alcance', 'Engajamento', 'Autoridade', 'Conversão'] },
  { key: 'data_publicacao', label: 'Data de publicação', type: 'date', showOnCard: true },
  { key: 'cta', label: 'CTA', type: 'text' },
  { key: 'copy', label: 'Copy / legenda', type: 'textarea' },
  { key: 'roteiro', label: 'Roteiro', type: 'textarea' },
]

const contentAutomations = (approvalLabel: string): BoardTemplate['automations'] => [
  {
    id: 'aprovacao-etiqueta',
    name: `Ao entrar em Aprovação → etiqueta “${approvalLabel}”`,
    enabled: true,
    when: { type: 'card_entered_list', list: 'aprovacao' },
    then: [{ type: 'add_label', label: approvalLabel }],
  },
  {
    id: 'agendados-pronto',
    name: 'Ao entrar em Agendados → “Pronto para publicar”',
    enabled: true,
    when: { type: 'card_entered_list', list: 'agendados' },
    then: [
      { type: 'remove_label', label: approvalLabel },
      { type: 'add_label', label: 'Pronto para publicar' },
    ],
  },
  {
    id: 'publicados-concluir',
    name: 'Ao entrar em Publicados → concluir',
    enabled: true,
    when: { type: 'card_entered_list', list: 'publicados' },
    then: [{ type: 'complete_card' }],
  },
  {
    id: 'data-publicacao-alerta',
    name: 'Na data de publicação → gerar alerta',
    enabled: false,
    when: { type: 'date_reached', field: 'data_publicacao' },
    then: [{ type: 'notify', message: 'Hoje é dia de publicar “{card}”' }],
  },
]

/** Dossiê = um quadro de uma lista só (seções permanentes). Não é Kanban: a área mostra as seções como documento. */
const dossier = (key: string, name: string, sections: Array<[string, string]>): BoardTemplate => ({
  key,
  name,
  icon: '🧭',
  description: 'Informações permanentes do projeto.',
  lists: [
    list(
      'secoes',
      name,
      '🧭',
      'reference',
      sections.map(([title, description]) => ({ title, description })),
    ),
  ],
  labels: [],
  fields: [],
  automations: [],
})

/** Workflow simples de entrega (cada etapa uma coluna). */
const workflow = (key: string, name: string, icon: string, steps: Array<[string, string, string]>, done: string): BoardTemplate => ({
  key,
  name,
  icon,
  description: `Workflow de ${name.toLowerCase()}.`,
  lists: steps.map(([k, n, i]) => list(k, n, i)),
  labels: [
    { name: 'Urgente', color: 'rose' },
    { name: 'Aguardando cliente', color: 'orange' },
    { name: 'Bloqueado', color: 'amber' },
  ],
  fields: [],
  automations: [
    ...(steps.some((s) => s[0] === 'aprovacao')
      ? [
          {
            id: 'aprovacao-etiqueta',
            name: 'Ao entrar em Aprovação → etiqueta “Aguardando cliente”',
            enabled: true,
            when: { type: 'card_entered_list' as const, list: 'aprovacao' },
            then: [{ type: 'add_label' as const, label: 'Aguardando cliente' }],
          },
        ]
      : []),
    {
      id: 'concluir',
      name: `Ao entrar em ${steps.find((s) => s[0] === done)?.[1]} → concluir`,
      enabled: true,
      when: { type: 'card_entered_list', list: done },
      then: [{ type: 'complete_card' }],
    },
  ],
})

// ---------- Luaria.IA (operação própria) ----------

/** Situação atual do lead (diferente da etapa). O último é aplicado na conversão em cliente. */
export const LEAD_STATUS = ['⚪ Não respondeu', '🟡 Interessado', '🔵 Conversão', '🟣 Demonstração marcada', '🟠 Pensando', '🔴 Sem interesse', '🟢 Cliente']
export const LEAD_STATUS_CLIENT = '🟢 Cliente'

const luariaCrm: BoardTemplate = {
  key: 'luaria-crm',
  role: 'crm',
  name: 'CRM / Prospecção',
  icon: '💼',
  description: 'Oportunidades vindas de divulgação orgânica. Cada oportunidade é um registro; ao fechar, converta em cliente.',
  lists: [
    list('interessados', 'Possíveis clientes', '👀'),
    list('conversas', 'Conversas', '💬'),
    list('reunioes', 'Reuniões', '🗓️'),
    list('propostas', 'Propostas', '📄'),
    list('negociacao', 'Negociação', '🤝'),
    list('fechados', 'Fechados', '💰'),
    list('perdidos', 'Perdidos', '❌'),
  ],
  labels: [
    { name: 'Quente', color: 'rose' },
    { name: 'Morno', color: 'amber' },
    { name: 'Frio', color: 'sky' },
  ],
  // Etapa = lista do Kanban (posição no processo). Status = situação atual do lead (campo). Nome do contato = título do cartão.
  fields: [
    { key: 'empresa', label: 'Empresa', type: 'text', showOnCard: true },
    { key: 'whatsapp', label: 'WhatsApp', type: 'phone' },
    { key: 'instagram', label: 'Instagram', type: 'text' },
    { key: 'origem', label: 'Origem', type: 'select', options: ['Grupos da faculdade', 'Instagram', 'Indicação', 'WhatsApp', 'Outro'], showOnCard: true },
    { key: 'data', label: 'Data do primeiro contato', type: 'date' },
    { key: 'proxima_acao_data', label: 'Próximo follow-up', type: 'date', showOnCard: true },
    { key: 'segmento', label: 'Segmento', type: 'text', showOnCard: true },
    { key: 'cidade', label: 'Cidade', type: 'text' },
    { key: 'problema', label: 'Problema percebido', type: 'textarea' },
    { key: 'interesse', label: 'Interesse', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: LEAD_STATUS, showOnCard: true },
    { key: 'valor_potencial', label: 'Valor potencial', type: 'currency', showOnCard: true },
  ],

  automations: [
    {
      id: 'fechados-concluir',
      name: 'Ao entrar em Fechados → concluir (depois converta em cliente)',
      enabled: true,
      when: { type: 'card_entered_list', list: 'fechados' },
      then: [{ type: 'complete_card' }],
    },
  ],
}

const luariaMarketing: BoardTemplate = {
  key: 'luaria-marketing-v2',
  name: 'Marketing',
  icon: '📱',
  description: 'Instagram e ações de marketing da própria Luaria.IA.',
  lists: contentFlow,
  labels: contentLabels('Aguardando aprovação'),
  fields: contentFields,
  automations: contentAutomations('Aguardando aprovação'),
}

// ---------- Social Media (projeto de cliente) ----------

const socialStrategy = dossier('social-estrategia', 'Estratégia', [
  ['Briefing', 'Resumo do negócio: o que vende, para quem, como vende hoje, o que espera do Instagram e o que não quer.'],
  ['Público-alvo', 'Quem o negócio atende: idade, região, renda, comportamento, onde está on-line.'],
  ['Persona', 'Nome, idade, rotina, dores, desejos, objeções e frases que essa pessoa diria.'],
  ['Posicionamento', 'Para [público] que [dor/desejo], [marca] é a [categoria] que [diferencial], porque [prova].'],
  ['Diferenciais', 'O que é verdadeiro, específico e relevante — com prova.'],
  ['Objetivos', 'Objetivos mensuráveis com prazo (ex.: de 12 para 25 mensagens/mês em 90 dias).'],
  ['Tom de voz', '“Falamos assim / não falamos assim”, palavras proibidas, uso de emojis.'],
  ['Concorrentes', '3 a 5 concorrentes: o que fazem bem, onde falham, oportunidades.'],
  ['Análise do Instagram', 'Primeira impressão, posicionamento, conteúdo, interação, conversão e engajamento estimado.'],
  ['Diagnóstico', 'O que está impedindo o perfil de gerar resultado.'],
  ['Pontos fortes', 'O que já funciona e deve ser mantido.'],
  ['Pontos fracos', 'O que precisa mudar primeiro.'],
  ['Oportunidades', 'Espaços que os concorrentes não ocupam, temas e formatos com potencial.'],
  ['Estratégia de conteúdo', 'Pilares com proporção e mix de atração, autoridade, relacionamento e conversão.'],
  ['Direção visual', 'Paleta, fontes, estilo de foto, templates e referências visuais.'],
  ['KPIs', 'Métricas acompanhadas, metas e frequência do relatório.'],
])

// ---------- Web Design / Tráfego / Luaria.IA para cliente ----------

const webBriefing = dossier('web-briefing', 'Briefing', [
  ['Objetivo do site', 'Qual ação principal o site deve gerar (agendar, pedir orçamento, comprar…).'],
  ['Público e origem do tráfego', 'Quem visita, de onde vem (Instagram, Google, anúncios) e o que já sabe.'],
  ['Páginas e seções', 'Mapa do site e ordem das seções da página principal.'],
  ['Conteúdo disponível', 'Textos, fotos, depoimentos e logos que o cliente vai enviar — e prazos.'],
  ['Referências', 'Sites que o cliente gosta e não gosta, com o porquê.'],
  ['Identidade visual', 'Cores, fontes, logo e estilo de imagem.'],
  ['Domínio, hospedagem e acessos', 'Quem é dono do domínio, ferramenta escolhida e acessos necessários.'],
])
const webFlow = workflow(
  'web-workflow',
  'Produção do site',
  '🌐',
  [
    ['briefing', 'Briefing', '📝'],
    ['ux-ui', 'UX/UI', '🎨'],
    ['desenvolvimento', 'Desenvolvimento', '🛠️'],
    ['revisao', 'Revisão', '🔍'],
    ['aprovacao', 'Aprovação', '👀'],
    ['publicacao', 'Publicação', '🚀'],
  ],
  'publicacao',
)

const trafficFlow = workflow(
  'trafego-campanhas',
  'Campanhas',
  '📢',
  [
    ['planejamento', 'Planejamento', '📅'],
    ['criativos', 'Criativos', '🎨'],
    ['configuracao', 'Configuração', '⚙️'],
    ['ativa', 'Campanha ativa', '🟢'],
    ['otimizacao', 'Otimização', '📈'],
    ['relatorio', 'Relatório', '📊'],
  ],
  'relatorio',
)

const luariaClientBriefing = dossier('luaria-cliente-briefing', 'Briefing', [
  ['Objetivo da solução', 'Que problema o cliente quer resolver com IA e como vai medir o resultado.'],
  ['Processo atual', 'Como o processo funciona hoje, quem participa e onde estão os gargalos.'],
  ['Integrações e acessos', 'Sistemas, canais (WhatsApp, Instagram, site), contas e permissões necessárias.'],
  ['Escopo contratado', 'O que está incluído e o que não está.'],
  ['Critérios de aceite', 'Como saberemos que a implementação está pronta.'],
])
const luariaClientFlow = workflow(
  'luaria-cliente-implementacao',
  'Implementação',
  '🤖',
  [
    ['briefing', 'Briefing', '📝'],
    ['diagnostico', 'Diagnóstico', '🔎'],
    ['estrategia', 'Estratégia', '🧭'],
    ['desenvolvimento', 'Desenvolvimento', '🛠️'],
    ['testes', 'Testes', '🧪'],
    ['aprovacao', 'Aprovação', '👀'],
    ['implementacao', 'Implementação', '⚙️'],
    ['entregue', 'Entregue', '✅'],
  ],
  'entregue',
)

// ---------- Tipos de projeto ----------

/** Abas nativas típicas de um projeto de cliente (sem as irrelevantes). */
const clientTabs: BuiltinProjectTab[] = ['tarefas', 'arquivos', 'financeiro', 'contratos', 'ia', 'agenda', 'atividade', 'configuracoes']

export const PROJECT_TYPES: ProjectTypeDef[] = [
  {
    id: 'luaria_ai',
    label: 'Luaria.IA (operação)',
    icon: '🤖',
    description: 'Operação da própria Luaria.IA: CRM simples de prospecção orgânica e Marketing (Instagram).',
    boards: [luariaCrm, luariaMarketing],
    areas: [
      { key: 'crm', label: 'CRM', icon: '💼', kind: 'kanban', board: luariaCrm.key, description: luariaCrm.description },
      { key: 'marketing', label: 'Marketing', icon: '📱', kind: 'kanban', board: luariaMarketing.key, description: luariaMarketing.description },
    ],
    tabs: ['ia', 'tarefas', 'financeiro', 'contratos', 'arquivos', 'conhecimento', 'agenda', 'atividade', 'configuracoes'],
  },
  {
    id: 'social_media',
    label: 'Social Media',
    icon: '📱',
    description: 'Operação de Social Media: o projeto gerencia a operação; cada cliente tem a própria estratégia, conteúdo e métricas.',
    boards: [],
    areas: [],
    // Sem aba “Conteúdo” no projeto: o conteúdo pertence a cada cliente.
    tabs: ['ia', 'tarefas', 'clientes', 'financeiro', 'contratos', 'arquivos', 'conhecimento', 'agenda', 'atividade', 'configuracoes'],
    clientWorkspace: {
      boards: [socialStrategy],
      areas: [
        { key: 'estrategia', label: 'Estratégia', icon: '🧭', kind: 'dossier', board: socialStrategy.key, description: 'Dossiê estratégico permanente deste cliente.' },
        { key: 'conteudo', label: 'Conteúdo', icon: '📱', kind: 'contents', description: 'Conteúdos deste cliente, da ideia à publicação.' },
        { key: 'metricas', label: 'Métricas', icon: '📊', kind: 'contents-metrics', description: 'Indicadores dos conteúdos deste cliente.' },
      ],
      tabs: ['estrategia', 'conteudo', 'tarefas', 'arquivos', 'metricas', 'atividade'],
    },
  },
  {
    id: 'luaria_ai_cliente',
    label: 'Luaria.IA (cliente)',
    icon: '🤖',
    description: 'Implementação da solução de IA da Luaria para um cliente — começa na execução (o comercial já aconteceu no CRM).',
    boards: [luariaClientBriefing, luariaClientFlow],
    areas: [
      { key: 'briefing', label: 'Briefing', icon: '📝', kind: 'dossier', board: luariaClientBriefing.key },
      { key: 'implementacao', label: 'Implementação', icon: '⚙️', kind: 'kanban', board: luariaClientFlow.key },
    ],
    tabs: clientTabs,
  },
  {
    id: 'web_design',
    label: 'Web Design',
    icon: '🌐',
    description: 'Criação de site ou landing page: briefing e workflow do briefing à publicação.',
    boards: [webBriefing, webFlow],
    areas: [
      { key: 'briefing', label: 'Briefing', icon: '📝', kind: 'dossier', board: webBriefing.key },
      { key: 'producao', label: 'Produção', icon: '🌐', kind: 'kanban', board: webFlow.key },
    ],
    tabs: clientTabs,
  },
  {
    id: 'trafego_pago',
    label: 'Tráfego Pago',
    icon: '📢',
    description: 'Gestão de campanhas: do planejamento ao relatório.',
    boards: [trafficFlow],
    areas: [{ key: 'campanhas', label: 'Campanhas', icon: '📢', kind: 'kanban', board: trafficFlow.key }],
    tabs: clientTabs,
  },
  // Sem workflow: mantém exatamente as abas originais (ex.: Med Resumos).
  { id: 'outro', label: 'Outro / interno', icon: '🗂️', description: 'Projeto sem workflow específico (ex.: produto próprio).', boards: [], areas: [] },
  // Futuros: design, automacao, consultoria — mesmo formato.
]

/** Tipo padrão quando o projeto não informa (ou informa um tipo desconhecido). */
export const DEFAULT_PROJECT_TYPE = 'outro'

export const projectType = (id: string | undefined) => PROJECT_TYPES.find((t) => t.id === id) ?? PROJECT_TYPES.find((t) => t.id === DEFAULT_PROJECT_TYPE)!

/** O tipo tem áreas próprias (workflow)? */
export const hasBoards = (typeId: string | undefined) => projectType(typeId).areas.length > 0

/** Template de quadro pela chave (em qualquer tipo). */
export function findBoardTemplate(key: string | null | undefined): BoardTemplate | undefined {
  if (!key) return undefined
  for (const t of PROJECT_TYPES) for (const b of [...t.boards, ...(t.clientWorkspace?.boards ?? [])]) if (b.key === key) return b
  return undefined
}

/** Área do tipo que usa o quadro (para links de cartões). */
export function areaForBoard(typeId: string, boardKey: string | null) {
  return projectType(typeId).areas.find((a) => a.board === boardKey)
}

export const ALL_BOARD_TEMPLATES: BoardTemplate[] = PROJECT_TYPES.flatMap((t) => [...t.boards, ...(t.clientWorkspace?.boards ?? [])])
