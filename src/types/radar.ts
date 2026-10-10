import type { BaseEntity, ID, ISODate, ISODateTime } from './index'

export type RadarOpportunitySource =
  | 'workana'
  | 'prospeccao_direta'
  | 'pesquisa'
  | 'indicacao'
  | 'instagram'
  | 'comunidade'
  | 'site'
  | 'outro'

export type RadarOpportunityStatus =
  | 'nova'
  | 'em_analise'
  | 'prioritaria'
  | 'aprovada'
  | 'proposta_em_preparacao'
  | 'proposta_enviada'
  | 'em_negociacao'
  | 'aguardando_resposta'
  | 'ganha'
  | 'perdida'
  | 'descartada'

export type RadarPriority = 'baixa' | 'media' | 'alta' | 'urgente'

export type EffortLevel = 'baixo' | 'medio' | 'alto'

export type TechnicalDifficulty = 'baixa' | 'media' | 'alta'

export type FitLuaria = 'alto' | 'medio' | 'baixo' | 'fora_de_escopo'

export interface RadarOpportunityHistory {
  id: ID
  action: string
  fromStatus?: RadarOpportunityStatus
  toStatus?: RadarOpportunityStatus
  responsibleName: string
  notes?: string
  createdAt: ISODateTime
}

export interface RadarOpportunity extends BaseEntity {
  /** Título do serviço ou nome da oportunidade */
  title: string
  /** Empresa ou cliente solicitante */
  clientName: string
  /** Plataforma ou origem da oportunidade */
  source: RadarOpportunitySource
  /** Link original do anúncio, vaga ou perfil */
  originalUrl?: string
  /** Data em que foi identificada (YYYY-MM-DD) */
  identifiedDate: ISODate
  /** Descrição detalhada do pedido ou necessidade */
  description: string
  /** Perfil do potencial cliente quando disponível */
  clientProfile?: string
  /** Escopo solicitado */
  requestedScope?: string
  /** Necessidades identificadas */
  identifiedNeeds?: string
  /** Grau de adequação ao foco Luaria.IA (automação e IA) */
  fitLuaria: FitLuaria
  /** Dificuldade técnica estimada */
  technicalDifficulty: TechnicalDifficulty
  /** Esforço de entrega estimado */
  estimatedEffort: EffortLevel
  /** Prazo solicitado pelo cliente ou desejado */
  deadlineRequested?: string
  /** Orçamento informado pelo cliente (em centavos ou valor textual) */
  clientBudgetCents?: number | null
  /** Preço sugerido pela Luaria.IA em centavos */
  suggestedPriceCents?: number | null
  /** Preço mínimo recomendado em centavos */
  minimumPriceCents?: number | null
  /** Prioridade calculada/atribuída */
  priority: RadarPriority
  /** Score ponderado de prioridade (0 a 100) */
  priorityScore: number
  /** Justificativa clara da decisão / prioridade */
  decisionRationale: string
  /** Status atual no funil do radar */
  status: RadarOpportunityStatus
  /** Rascunho ou texto da proposta comercial / mensagem de abordagem */
  proposalText?: string
  /** Data de envio da proposta (YYYY-MM-DD) */
  proposalSentDate?: ISODate | null
  /** Próxima ação comercial planejada */
  nextAction?: string
  /** Data limite para a próxima ação (YYYY-MM-DD) */
  nextActionDueDate?: ISODate | null
  /** Responsável comercial pela oportunidade */
  responsibleName: string
  /** Resultado final da candidatura/proposta */
  candidacyResult?: 'pendente' | 'aceita' | 'recusada' | 'sem_resposta' | 'cancelada'
  /** Motivo de descarte ou perda quando aplicável */
  lostReason?: string

  // Dados para Prospecção Direta de Empresas
  companySegment?: string
  companyCity?: string
  companyWebsite?: string
  companyInstagram?: string
  companyPhone?: string
  companyWhatsapp?: string
  keyContactName?: string
  perceivedProblem?: string
  suggestedAutomation?: string

  // Integração com CRM
  boardCardId?: ID | null
  crmSyncedAt?: ISODateTime | null
  crmBoardId?: ID | null

  // Análise de IA gerada
  aiAnalysis?: {
    summary?: string
    clientProblem?: string
    luariaFitReason?: string
    qualificationQuestions?: string[]
    missingInformation?: string[]
    customApproach?: string
    proposalDraft?: string
    suggestedPriceRange?: string
    risksAndObjections?: string[]
    recommendedNextStep?: string
    analyzedAt?: ISODateTime
  }

  // Histórico de mudanças
  history: RadarOpportunityHistory[]
}
