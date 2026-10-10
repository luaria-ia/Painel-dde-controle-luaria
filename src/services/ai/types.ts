import type { AICascadePrefs, AIModel } from '@/types'

/** O que a IA está fazendo (define instruções, formato e esforço). */
export type AITask =
  | 'chat'
  | 'project_summary'
  | 'daily_briefing'
  | 'finance_analysis'
  | 'client_brief'
  | 'content_ideas'
  | 'content_assist'
  | 'briefing_to_tasks'
  | 'diagnostic'
  | 'strategic_plan'
  | 'editorial_calendar'
  | 'campaign_ideas'
  | 'script_writer'
  | 'caption_writer'
  | 'commercial_proposal'
  | 'briefing_generator'
  | 'improvement_suggestions'

export type AIScope = 'project' | 'client' | 'finance' | 'overview'

/** Fatos já calculados a partir dos dados reais (a IA interpreta, não calcula). */
export interface ContextFacts {
  name: string
  tasks?: {
    total: number
    pending: number
    inProgress: number
    done: number
    overdue: Array<{ title: string; due: string; project?: string }>
    today: Array<{ title: string; project?: string }>
    next: Array<{ title: string; due: string; priority: string; project?: string }>
  }
  finance?: {
    monthLabel: string
    month: FinanceFacts
    prevMonthLabel: string
    prevMonth: FinanceFacts
    total: FinanceFacts
    byProject: Array<{ name: string; receita: number; despesa: number; saldo: number }>
    topExpenseCategories: Array<{ name: string; value: number }>
  }
  contents?: { byStatus: Record<string, number>; approval: string[]; scheduled: Array<{ title: string; date: string }>; recent: string[] }
  contracts?: { active: number; mrr: number; dueSoon: Array<{ title: string; days: number }>; list: string[] }
  events?: Array<{ title: string; date: string; time: string | null; type: string }>
  clients?: string[]
  knowledgeCount?: number
  activity?: string[]
}

export interface FinanceFacts {
  receita: number
  despesa: number
  saldo: number
  aReceber: number
  atrasado: number
  aPagar: number
}

export interface AIContext {
  scope: AIScope
  /**
   * Sensibilidade dos dados (política de privacidade da cascata):
   * 'sensitive' (cliente, financeiro) pode ser bloqueado das camadas gratuitas nas Configurações.
   */
  sensitivity: 'public' | 'internal' | 'sensitive'
  /** Rótulo legível: "Projeto: Social Media". */
  label: string
  /** Texto enviado ao modelo (somente o escopo selecionado). */
  text: string
  facts: ContextFacts
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIRequest {
  task: AITask
  context: AIContext
  /** Pergunta/pedido atual. */
  input: string
  /** Conversa anterior (somente no chat). */
  history?: AIMessage[]
  /** Para tarefas com saída estruturada. */
  jsonSchema?: Record<string, unknown>
}

export interface AIResult {
  text: string
  data?: unknown
  /** 'ai' = resposta real do modelo; 'demo' = gerada por regras locais (claramente identificada). */
  source: 'ai' | 'demo'
  model?: string
  /** Aviso a mostrar (ex.: "IA não configurada — exibindo demonstração"). */
  notice?: string
  /** Qual camada respondeu (ex.: "Gemini Free #2") e se houve fallback — sem detalhes técnicos. */
  servedBy?: { label: string; tier: 'free' | 'paid'; provider: string; fallback: boolean }
}

export interface ProviderRequest {
  task: AITask
  /** Preferência enviada ao servidor ('auto' = cascata Gemini se houver chave, senão Claude). */
  provider: 'auto' | 'gemini' | 'anthropic'
  /** Preferências da cascata (o servidor valida e completa com os padrões). */
  cascade: AICascadePrefs
  sensitivity: AIContext['sensitivity']
  model: AIModel
  system: string
  messages: AIMessage[]
  effort: 'low' | 'medium' | 'high'
  jsonSchema?: Record<string, unknown>
}

/** Contrato de um provedor de IA (Anthropic via servidor, demonstração, futuros…). */
export interface AIProvider {
  id: string
  run(req: ProviderRequest, original: AIRequest): Promise<AIResult>
}

export class AIError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}
