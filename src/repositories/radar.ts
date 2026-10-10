import { calculateRadarScore } from '@/lib/radarScore'
import { supabase } from '@/lib/supabase'
import type { CreateInput, ID, UpdateInput } from '@/types'
import type { RadarOpportunity, RadarOpportunityHistory } from '@/types/radar'
import type { Repository } from './createSupabaseRepository'
import { fromRow, toRow } from './createSupabaseRepository'

const STORAGE_KEY = 'business_os_radar_opportunities'

export const INITIAL_RADAR_OPPORTUNITIES: RadarOpportunity[] = [
  // 1. Oportunidade Workana - Automação WhatsApp & Qualificação de Leads (Perfeita para Luaria.IA)
  {
    id: 'radar-opp-1',
    title: 'Automação de Atendimento WhatsApp com IA e Qualificação de Leads',
    clientName: 'Imobiliária & Construtora Prime',
    source: 'workana',
    originalUrl: 'https://www.workana.com/job/automacao-atendimento-whatsapp-ia-leads',
    identifiedDate: '2026-10-08',
    description:
      'Temos alto volume de leads que chegam pelo Instagram e Google Ads mas nossa equipe demora horas para responder. Precisamos de um agente que atenda 24/7 no WhatsApp, colete renda, região de interesse e agende visita com corretor no CRM.',
    clientProfile: 'Empresa do setor imobiliário com mais de 30 corretores. Cliente já contratou freelancers anteriormente.',
    requestedScope:
      'Integração oficial WhatsApp API + IA para qualificação com perguntas dinâmicas + disparo para CRM e notificação no grupo de corretores.',
    identifiedNeeds: 'Redução do tempo de resposta (SLA < 1 min), qualificação automática de compradores reais e organização de agenda.',
    fitLuaria: 'alto',
    technicalDifficulty: 'media',
    estimatedEffort: 'baixo',
    deadlineRequested: '15 dias',
    clientBudgetCents: 350000,
    suggestedPriceCents: 380000,
    minimumPriceCents: 320000,
    priority: 'urgente',
    priorityScore: 92,
    decisionRationale:
      'Forte alinhamento com soluções de automação e agentes de IA da Luaria.IA. Rápida execução e entrega inicial viável. Excelente relação retorno/esforço. Baixo risco técnico e alta previsibilidade.',
    status: 'proposta_em_preparacao',
    proposalText:
      'Olá! Vimos que a sua principal dor é o tempo de resposta aos leads do WhatsApp. Na Luaria.IA desenvolvemos agentes de atendimento que não apenas respondem instantaneamente com linguagem natural, mas filtram o perfil do comprador (renda, interesse, urgência) e conectam o corretor apenas com leads qualificados. Conseguimos colocar essa estrutura no ar em 10 dias com integração direta ao seu CRM. Podemos agendar uma demonstração rápida de 15 minutos amanhã?',
    proposalSentDate: null,
    nextAction: 'Finalizar proposta personalizada e enviar candidatura na plataforma',
    nextActionDueDate: '2026-10-10',
    responsibleName: 'Cofundador Comercial',
    candidacyResult: 'pendente',
    history: [
      {
        id: 'hist-1',
        action: 'Oportunidade identificada na Workana',
        responsibleName: 'Cofundador Comercial',
        createdAt: '2026-10-08T14:00:00.000Z',
      },
      {
        id: 'hist-2',
        action: 'Classificada como Prioridade Urgente pelo Radar',
        fromStatus: 'nova',
        toStatus: 'proposta_em_preparacao',
        responsibleName: 'Radar Luaria.IA',
        createdAt: '2026-10-08T15:30:00.000Z',
      },
    ],
    createdAt: '2026-10-08T14:00:00.000Z',
    updatedAt: '2026-10-09T18:00:00.000Z',
    isDemo: false,
  },

  // 2. Oportunidade Workana - Integração de Sistemas & Notificações
  {
    id: 'radar-opp-2',
    title: 'Integração de Pedidos e Notificações Automáticas de Follow-up',
    clientName: 'Distribuidora Aliança B2B',
    source: 'workana',
    originalUrl: 'https://www.workana.com/job/integracao-pedidos-notificacoes-follow-up',
    identifiedDate: '2026-10-07',
    description:
      'Pedidos faturados no ERP precisam notificar o cliente via WhatsApp com status e chave da nota fiscal, além de alertar o representante quando o cliente passar 30 dias sem recompra.',
    clientProfile: 'Empresa atacadista tradicional com equipe externa de vendas.',
    requestedScope: 'Conector via webhook entre ERP e mensageria WhatsApp com regras de alerta de inatividade.',
    identifiedNeeds: 'Automação de pós-venda e prevenção de churn de clientes recorrentes.',
    fitLuaria: 'alto',
    technicalDifficulty: 'media',
    estimatedEffort: 'medio',
    deadlineRequested: '20 dias',
    clientBudgetCents: 280000,
    suggestedPriceCents: 300000,
    minimumPriceCents: 250000,
    priority: 'alta',
    priorityScore: 78,
    decisionRationale:
      'Forte alinhamento com foco em integrações empresariais. Remuneração condizente com o escopo e oportunidade de contrato de manutenção mensal.',
    status: 'proposta_enviada',
    proposalText:
      'Olá! Essa automação de régua de pós-venda e reativação de clientes inativos é exatamente o que fazemos na Luaria.IA. Criamos uma esteira que monitora o ERP e age proativamente no WhatsApp tanto para manter o cliente informado quanto para acionar os representantes nos momentos exatos de recompra. Já entregamos arquiteturas semelhantes com alta estabilidade.',
    proposalSentDate: '2026-10-08',
    nextAction: 'Acompanhar abertura da proposta e resposta na plataforma',
    nextActionDueDate: '2026-10-11',
    responsibleName: 'Cofundador Comercial',
    candidacyResult: 'pendente',
    history: [
      {
        id: 'hist-3',
        action: 'Proposta enviada ao cliente na Workana',
        fromStatus: 'proposta_em_preparacao',
        toStatus: 'proposta_enviada',
        responsibleName: 'Cofundador Comercial',
        createdAt: '2026-10-08T11:00:00.000Z',
      },
    ],
    createdAt: '2026-10-07T10:00:00.000Z',
    updatedAt: '2026-10-08T11:00:00.000Z',
    isDemo: false,
  },

  // 3. Prospecção Direta de Empresa - Clínica Médica & Estética
  {
    id: 'radar-opp-3',
    title: 'Automação de Agendamentos e Pré-Qualificação de Procedimentos',
    clientName: 'Clínica Lumina Estética & Dermatologia',
    source: 'prospeccao_direta',
    originalUrl: 'https://instagram.com/lumina.estetica',
    identifiedDate: '2026-10-06',
    description:
      'Clínica com mais de 35 mil seguidores no Instagram e alto volume de comentários e directs. A recepção não consegue responder em tempo ágil e os agendamentos são perdidos para concorrentes.',
    clientProfile: 'Clínica de alto padrão localizada em São Paulo com 4 especialistas.',
    requestedScope: 'Agente conversacional de triagem no WhatsApp + integração com Google Agenda / prontuário.',
    identifiedNeeds: 'Qualificar o procedimento desejado, informar faixa de investimento prévia e marcar horário automaticamente.',
    fitLuaria: 'alto',
    technicalDifficulty: 'baixa',
    estimatedEffort: 'baixo',
    deadlineRequested: 'Imediato',
    clientBudgetCents: null,
    suggestedPriceCents: 240000,
    minimumPriceCents: 190000,
    priority: 'alta',
    priorityScore: 84,
    decisionRationale:
      'Nicho com altíssima conversão para agentes de IA de atendimento. Fácil demonstração de ROI e possibilidade de retenção mensal.',
    status: 'aprovada',
    proposalText:
      'Dra. Camila, identificamos que o perfil da Lumina possui um engajamento visual incrível, mas o tempo de resposta no direct e WhatsApp pode estar deixando pacientes decidirem por outras clínicas. Desenvolvemos assistentes de atendimento para clínicas que atendem em segundos, tiram dúvidas frequentes e já entregam o paciente pré-agendado para a sua recepção.',
    proposalSentDate: null,
    nextAction: 'Enviar mensagem personalizada para a gestora da clínica no WhatsApp',
    nextActionDueDate: '2026-10-10',
    responsibleName: 'Cofundador Comercial',
    candidacyResult: 'pendente',
    companySegment: 'Saúde & Estética',
    companyCity: 'São Paulo - SP',
    companyWebsite: 'https://luminaestetica.com.br',
    companyInstagram: '@lumina.estetica',
    companyWhatsapp: '11988887777',
    keyContactName: 'Dra. Camila (Sócia-fundadora)',
    perceivedProblem: 'Lentidão no atendimento do primeiro contato gerando perda de pacientes qualificados.',
    suggestedAutomation: 'Assistente 24/7 no WhatsApp com confirmação de presença e triagem estética.',
    history: [
      {
        id: 'hist-4',
        action: 'Empresa identificada via pesquisa no Instagram e validada no Google Maps',
        responsibleName: 'Cofundador Comercial',
        createdAt: '2026-10-06T15:20:00.000Z',
      },
    ],
    createdAt: '2026-10-06T15:20:00.000Z',
    updatedAt: '2026-10-09T14:10:00.000Z',
    isDemo: false,
  },

  // 4. Oportunidade Workana Fora de Escopo (Exemplo educativo de filtragem inteligente)
  {
    id: 'radar-opp-4',
    title: 'Criação de Site Institucional em WordPress Simples',
    clientName: 'Escritório Contábil ABC',
    source: 'workana',
    originalUrl: 'https://www.workana.com/job/site-institucional-wordpress',
    identifiedDate: '2026-10-05',
    description:
      'Preciso de um site básico institucional em WordPress com 4 páginas (Home, Sobre, Serviços, Contato). Já tenho hospedagem e logo.',
    clientProfile: 'Pequeno escritório tradicional.',
    requestedScope: 'Instalação de tema WordPress simples.',
    identifiedNeeds: 'Apenas presença online estática.',
    fitLuaria: 'fora_de_escopo',
    technicalDifficulty: 'baixa',
    estimatedEffort: 'baixo',
    deadlineRequested: '7 dias',
    clientBudgetCents: 60000,
    suggestedPriceCents: 80000,
    minimumPriceCents: 50000,
    priority: 'baixa',
    priorityScore: 28,
    decisionRationale:
      'Demanda fora do escopo estratégico de IA. Serviço de criação de site básico sem automação ou diferenciação tecnológica da Luaria.IA. Não recomendado para abordagem ativa.',
    status: 'descartada',
    lostReason: 'Serviço de site estático sem componente de inteligência artificial ou automação empresarial.',
    proposalText: '',
    proposalSentDate: null,
    nextAction: 'Descartado - focar em projetos de automação de alto valor',
    nextActionDueDate: null,
    responsibleName: 'Radar Luaria.IA',
    candidacyResult: 'cancelada',
    history: [
      {
        id: 'hist-5',
        action: 'Descartada automaticamente pelo critério de alinhamento com IA',
        fromStatus: 'nova',
        toStatus: 'descartada',
        responsibleName: 'Radar Luaria.IA',
        notes: 'Fora do posicionamento de mercado da Luaria.',
        createdAt: '2026-10-05T18:00:00.000Z',
      },
    ],
    createdAt: '2026-10-05T17:40:00.000Z',
    updatedAt: '2026-10-05T18:00:00.000Z',
    isDemo: false,
  },
]

function readLocal(): RadarOpportunity[] {
  if (typeof localStorage === 'undefined') return INITIAL_RADAR_OPPORTUNITIES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_RADAR_OPPORTUNITIES
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RADAR_OPPORTUNITIES
  } catch {
    return INITIAL_RADAR_OPPORTUNITIES
  }
}

function writeLocal(list: RadarOpportunity[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota issues */
  }
}

export const radarRepository: Repository<RadarOpportunity> = {
  async list(): Promise<RadarOpportunity[]> {
    try {
      const { data, error } = await supabase
        .from('radar_opportunities' as any)
        .select('*')
        .order('priority_score', { ascending: false })
      if (!error && data && data.length > 0) {
        return data.map((r: any) => fromRow<RadarOpportunity>(r))
      }
    } catch {
      /* fallback to local storage */
    }
    return readLocal()
  },

  async create(input: CreateInput<RadarOpportunity>): Promise<RadarOpportunity> {
    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    // Recalcula score se necessário
    const calculated = calculateRadarScore({
      fitLuaria: input.fitLuaria,
      estimatedEffort: input.estimatedEffort,
      technicalDifficulty: input.technicalDifficulty,
      suggestedPriceCents: input.suggestedPriceCents,
      clientBudgetCents: input.clientBudgetCents,
      requestedScope: input.requestedScope || input.description,
    })

    const initialHistory: RadarOpportunityHistory[] = [
      {
        id: crypto.randomUUID(),
        action: `Oportunidade cadastrada na origem: ${input.source}`,
        responsibleName: input.responsibleName || 'Cofundador Comercial',
        createdAt: now,
      },
    ]

    const item: RadarOpportunity = {
      id,
      ...input,
      priority: input.priority || calculated.priority,
      priorityScore: input.priorityScore ?? calculated.score,
      decisionRationale: input.decisionRationale || calculated.rationale,
      history: input.history || initialHistory,
      createdAt: now,
      updatedAt: now,
    }

    try {
      const { data, error } = await supabase
        .from('radar_opportunities' as any)
        .insert(toRow(item) as any)
        .select()
        .single()
      if (!error && data) {
        return fromRow<RadarOpportunity>(data as any)
      }
    } catch {
      /* fallback to local */
    }

    const current = readLocal()
    const updated = [item, ...current]
    writeLocal(updated)
    return item
  },

  async update(id: ID, patch: UpdateInput<RadarOpportunity>): Promise<RadarOpportunity> {
    const now = new Date().toISOString()
    const current = readLocal()
    const existing = current.find((o) => o.id === id)

    // Se houve mudança de status, adiciona ao histórico
    let updatedHistory = patch.history || existing?.history || []
    if (patch.status && existing && patch.status !== existing.status) {
      updatedHistory = [
        {
          id: crypto.randomUUID(),
          action: `Status alterado de "${existing.status}" para "${patch.status}"`,
          fromStatus: existing.status,
          toStatus: patch.status,
          responsibleName: patch.responsibleName || existing.responsibleName || 'Cofundador Comercial',
          createdAt: now,
        },
        ...updatedHistory,
      ]
      patch.history = updatedHistory
    }

    try {
      const { data, error } = await supabase
        .from('radar_opportunities' as any)
        .update(toRow({ ...patch, updated_at: now }) as any)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) {
        return fromRow<RadarOpportunity>(data as any)
      }
    } catch {
      /* fallback */
    }

    const updated = current.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: now } : item))
    writeLocal(updated)
    return updated.find((o) => o.id === id) || (patch as RadarOpportunity)
  },

  async remove(id: ID): Promise<void> {
    try {
      await supabase
        .from('radar_opportunities' as any)
        .delete()
        .eq('id', id)
    } catch {
      /* fallback */
    }
    const current = readLocal()
    writeLocal(current.filter((o) => o.id !== id))
  },

  async insertMany(items: Array<CreateInput<RadarOpportunity> & Partial<Pick<RadarOpportunity, 'id' | 'createdAt'>>>): Promise<void> {
    const now = new Date().toISOString()
    const mapped: RadarOpportunity[] = items.map((it) => ({
      ...it,
      id: it.id || crypto.randomUUID(),
      createdAt: it.createdAt || now,
      updatedAt: now,
      history: it.history || [],
      priority: it.priority || 'media',
      priorityScore: it.priorityScore ?? 70,
      decisionRationale: it.decisionRationale || '',
      status: it.status || 'nova',
      responsibleName: it.responsibleName || 'Cofundador Comercial',
    }))
    try {
      await supabase.from('radar_opportunities' as any).insert(mapped.map((m) => toRow(m)) as any)
    } catch {
      /* fallback */
    }
    const current = readLocal()
    writeLocal([...mapped, ...current])
  },

  async removeDemo(): Promise<number> {
    const current = readLocal()
    const filtered = current.filter((o) => !o.isDemo)
    const removedCount = current.length - filtered.length
    writeLocal(filtered)
    try {
      await supabase.from('radar_opportunities' as any).delete().eq('is_demo', true)
    } catch {
      /* fallback */
    }
    return removedCount
  },

  async removeAll(): Promise<void> {
    try {
      await supabase.from('radar_opportunities' as any).delete().neq('id', '')
    } catch {
      /* fallback */
    }
    writeLocal([])
  },
}

/** Exportação em JSON */
export function exportRadarToJson(opportunities: RadarOpportunity[]): string {
  return JSON.stringify(opportunities, null, 2)
}

/** Exportação em CSV */
export function exportRadarToCsv(opportunities: RadarOpportunity[]): string {
  const headers = [
    'ID',
    'Título',
    'Cliente/Empresa',
    'Origem',
    'Status',
    'Prioridade',
    'Score',
    'Adequação Luaria',
    'Esforço',
    'Dificuldade',
    'Preço Sugerido (R$)',
    'Orçamento Cliente (R$)',
    'Data Identificada',
    'Próxima Ação',
    'Data Próxima Ação',
    'Link Original',
    'Responsável',
  ]

  const rows = opportunities.map((o) => [
    `"${o.id}"`,
    `"${(o.title || '').replace(/"/g, '""')}"`,
    `"${(o.clientName || '').replace(/"/g, '""')}"`,
    `"${o.source}"`,
    `"${o.status}"`,
    `"${o.priority}"`,
    o.priorityScore,
    `"${o.fitLuaria}"`,
    `"${o.estimatedEffort}"`,
    `"${o.technicalDifficulty}"`,
    o.suggestedPriceCents ? (o.suggestedPriceCents / 100).toFixed(2) : '',
    o.clientBudgetCents ? (o.clientBudgetCents / 100).toFixed(2) : '',
    `"${o.identifiedDate || ''}"`,
    `"${(o.nextAction || '').replace(/"/g, '""')}"`,
    `"${o.nextActionDueDate || ''}"`,
    `"${(o.originalUrl || '').replace(/"/g, '""')}"`,
    `"${(o.responsibleName || '').replace(/"/g, '""')}"`,
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
