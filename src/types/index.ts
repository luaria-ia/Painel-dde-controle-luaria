/**
 * Tipos de domínio do Business OS.
 *
 * Convenções:
 * - `id`: string única (gerada no cliente na V1; no banco pode virar uuid).
 * - Datas de calendário (prazo, data de lançamento): 'YYYY-MM-DD'.
 * - Carimbos de tempo (createdAt/updatedAt): ISO 8601 completo.
 * - `isDemo`: marca registros de demonstração, removíveis em Configurações.
 */

export type ID = string
export type ISODate = string // 'YYYY-MM-DD'
export type ISODateTime = string

export interface BaseEntity {
  id: ID
  createdAt: ISODateTime
  updatedAt: ISODateTime
  isDemo?: boolean
}

// ---------- Projetos ----------
export type ProjectStatus = 'ativo' | 'pausado' | 'concluido' | 'arquivado'

export interface Project extends BaseEntity {
  name: string
  description: string
  status: ProjectStatus
  /** Cor de identificação (token da paleta de projetos). */
  color: ProjectColor
  /** Tipo do projeto (src/data/boards/projectTypes.ts) — define os quadros criados automaticamente. */
  type: string
  /** Cliente dono do projeto (null = projeto interno). */
  clientId: ID | null
  /** Responsáveis pelo projeto (nomes). */
  owners: string[]
  startDate: ISODate | null
  dueDate: ISODate | null
  /** Quando os quadros do tipo foram criados (null = ainda não). */
  boardsProvisionedAt: ISODateTime | null
}

export type ProjectColor = 'teal' | 'amber' | 'violet' | 'rose' | 'sky' | 'lime' | 'slate'

// ---------- Tarefas ----------
export type TaskStatus = 'a_fazer' | 'em_andamento' | 'concluido'
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente'

export interface Task extends BaseEntity {
  title: string
  description: string
  projectId: ID | null
  clientId: ID | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: ISODate | null
  completedAt: ISODateTime | null
}

// ---------- Clientes ----------
export type ClientStatus = 'ativo' | 'negociacao' | 'inativo'

export interface Client extends BaseEntity {
  name: string
  email: string
  phone: string
  whatsapp: string
  company: string
  notes: string
  status: ClientStatus
  /**
   * Projetos do cliente — calculado ao carregar: projetos com `clientId` = este cliente
   * (+ vínculos antigos da tabela client_projects, mantidos por compatibilidade). Não é editado diretamente.
   */
  projectIds: ID[]
}

// ---------- Financeiro ----------
export type TransactionType = 'receita' | 'despesa'
export type IncomeStatus = 'recebido' | 'pendente' | 'atrasado'
export type ExpenseStatus = 'pago' | 'a_pagar'
export type TransactionStatus = IncomeStatus | ExpenseStatus

export interface Transaction extends BaseEntity {
  type: TransactionType
  description: string
  /** Valor em centavos, sempre positivo (evita erros de ponto flutuante). */
  amountCents: number
  date: ISODate
  category: string
  projectId: ID | null
  clientId: ID | null
  status: TransactionStatus
}

// ---------- Configurações ----------
export type ThemePreference = 'light' | 'dark' | 'system'

export interface Settings {
  userName: string
  theme: ThemePreference
  /** Indica que o seed inicial já foi aplicado (evita recriar dados apagados). */
  seeded: boolean
  /** Versão dos dados iniciais já aplicada (1 = V1, 2 = V2, 3 = V3). */
  seedVersion: number
  /** IA (V3). A chave do provedor fica no servidor, nunca aqui. */
  aiProvider: AIProviderPreference
  aiModel: AIModel
  aiInstructions: string
  aiCascade: AICascadePrefs
}

/** Campos que o usuário informa ao criar (o resto é gerado). */
export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity> & { isDemo?: boolean }
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt'>>

// ---------- Eventos (V2) ----------
// Tarefas = trabalho a fazer. Eventos = compromissos com data/hora.
export type EventType = 'reuniao' | 'evento' | 'compromisso'
export type EventStatus = 'agendado' | 'concluido' | 'cancelado'

export interface CalendarEvent extends BaseEntity {
  title: string
  description: string
  type: EventType
  date: ISODate
  /** 'HH:MM' ou null (dia inteiro). */
  startTime: string | null
  endTime: string | null
  projectId: ID | null
  clientId: ID | null
  status: EventStatus
}

// ---------- Contratos (V2) ----------
export type ContractPeriodicity = 'unico' | 'mensal' | 'trimestral' | 'semestral' | 'anual'
export type ContractStatus = 'ativo' | 'pendente' | 'encerrado' | 'expirado'

export interface Contract extends BaseEntity {
  title: string
  clientId: ID | null
  projectId: ID | null
  service: string
  /** Valor por ciclo da periodicidade, em centavos. */
  amountCents: number
  periodicity: ContractPeriodicity
  startDate: ISODate
  endDate: ISODate | null
  nextRenewal: ISODate | null
  status: ContractStatus
  notes: string
}

// ---------- Arquivos (V2) ----------
export type FileCategory = 'documento' | 'briefing' | 'imagem' | 'video' | 'planilha' | 'outro'

export interface FileItem extends BaseEntity {
  name: string
  description: string
  category: FileCategory
  projectId: ID | null
  clientId: ID | null
  mimeType: string
  sizeBytes: number | null
  /** Caminho no Storage (arquivo enviado) — ou null. */
  storagePath: string | null
  /** Link externo (https) — alternativa ao upload. */
  url: string | null
  /** Anexo de um cartão de quadro (opcional). */
  boardCardId?: ID | null
}

// ---------- Conteúdo (V2) ----------
export type ContentType = 'post' | 'carrossel' | 'reel' | 'story' | 'video' | 'artigo' | 'outro'
export type ContentStatus = 'ideia' | 'roteiro' | 'producao' | 'aprovacao' | 'agendado' | 'publicado'

export interface Content extends BaseEntity {
  title: string
  description: string
  projectId: ID | null
  clientId: ID | null
  type: ContentType
  status: ContentStatus
  plannedDate: ISODate | null
  publishDate: ISODate | null
  caption: string
  cta: string
  notes: string
}

// =========================================================
// V3 — Inteligência
// =========================================================

// ---------- Base de conhecimento ----------
export type KnowledgeCategory = 'contexto' | 'processo' | 'estrategia' | 'publico' | 'produto' | 'servico' | 'referencia' | 'outro'

export interface KnowledgeItem extends BaseEntity {
  title: string
  content: string
  category: KnowledgeCategory
  projectId: ID | null
  clientId: ID | null
  tags: string[]
}

// ---------- Radar de Mercado & Prospecção ----------
export type ProspectStatus = 'mapeada' | 'em_pesquisa' | 'contatada' | 'qualificada' | 'descartada' | 'convertida'
export type ProspectConfidence = 'baixo' | 'medio' | 'alto'

export interface ProspectCompany extends BaseEntity {
  name: string
  segment: string
  location: string
  website: string
  channels: {
    instagram?: string
    linkedin?: string
    whatsapp?: string
    other?: string
  }
  sourcesConsulted: string[]
  lastVerifiedAt: ISODate | null
  opportunities: string
  observations: string
  confidenceLevel: ProspectConfidence
  status: ProspectStatus
  nextStep: string
  clientId: ID | null
  boardCardId: ID | null
}

// ---------- Histórico ----------
export interface ActivityLog {
  id: ID
  type: string
  entity: string
  entityId: ID | null
  description: string
  projectId: ID | null
  clientId: ID | null
  isDemo?: boolean
  createdAt: ISODateTime
}

// ---------- Automações ----------
export type AutomationTrigger =
  | 'task_created'
  | 'task_completed'
  | 'task_overdue'
  | 'contract_due'
  | 'content_approval'
  | 'content_published'
  | 'income_created'
  | 'expense_created'

export type AutomationActionType = 'notify' | 'create_task' | 'set_publish_date' | 'log'
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger'

export interface AutomationConditions {
  /** Só dispara para este projeto (vazio = todos). */
  projectId?: ID | null
  /** contract_due: dias de antecedência. */
  days?: number
  /** Receitas/despesas: valor mínimo em centavos. */
  minAmountCents?: number
  /** Tarefas: só esta prioridade. */
  priority?: TaskPriority | null
}

export interface AutomationAction {
  type: AutomationActionType
  /** notify */
  severity?: NotificationSeverity
  /** Modelo de texto. Variáveis: {titulo}, {projeto}, {dias}, {valor}. */
  message?: string
  /** create_task */
  taskTitle?: string
  taskPriority?: TaskPriority
  dueInDays?: number
}

export interface Automation extends BaseEntity {
  name: string
  enabled: boolean
  trigger: AutomationTrigger
  conditions: AutomationConditions
  action: AutomationAction
  isSystem: boolean
  lastRunAt: ISODateTime | null
}

export interface AutomationRun {
  id: ID
  automationId: ID
  entityKey: string
  status: 'ok' | 'erro'
  message: string
  createdAt: ISODateTime
}

// ---------- Notificações ----------
export interface AppNotification {
  id: ID
  severity: NotificationSeverity
  title: string
  body: string
  /** Caminho interno (ex.: /tarefas?prazo=atrasadas). */
  link: string | null
  entity: string | null
  entityId: ID | null
  automationId: ID | null
  dedupeKey: string | null
  readAt: ISODateTime | null
  createdAt: ISODateTime
}

// ---------- IA ----------
export type AIProviderPreference = 'auto' | 'gemini' | 'anthropic' | 'demo'

// ---------- Cascata de IA (Gemini grátis → grátis → grátis → pago) ----------
export type CascadeStrategy = 'auto' | 'free_only' | 'paid_only'
export type CascadePrivacy = 'allow_free' | 'paid_for_sensitive'
export interface CascadeLayerPref {
  id: string
  model?: string
  enabled?: boolean
}
/** Preferências do usuário. Timeouts/retries ficam no servidor; o servidor valida tudo. */
export interface AICascadePrefs {
  strategy: CascadeStrategy
  privacy: CascadePrivacy
  layers: CascadeLayerPref[]
}

export interface AIUsageLog {
  id: ID
  requestId: ID
  task: string
  layer: string
  provider: string
  model: string
  tier: 'free' | 'paid'
  status: 'success' | 'error' | 'skipped'
  reason: string | null
  durationMs: number
  retries: number
  inputTokens: number | null
  outputTokens: number | null
  estimatedCostUsd: number | null
  fallbackFrom: string | null
  createdAt: ISODateTime
}
export type AIModel = 'gemini-flash-latest' | 'gemini-flash-lite-latest' | 'claude-opus-5-5' | 'claude-sonnet-5-5' | 'claude-haiku-4-5'
