import type { BaseEntity, ID } from './index'

export type DepartmentSlug =
  | 'diretoria'
  | 'marketing'
  | 'comercial'
  | 'financeiro'
  | 'projetos'
  | 'atendimento'
  | 'estudos'
  | 'tecnologia'

export type AgentOperationalStatus = 'ativo' | 'pausado' | 'desabilitado' | 'executando'

export interface AgentDepartment extends BaseEntity {
  slug: DepartmentSlug
  name: string
  description: string
  color: string
  accentGlow: string
  iconName: string
  agentCount: number
  activeCount: number
  position: number
}

export type AIExecutionProvider = 'ollama' | 'gemini' | 'anthropic' | 'demo'

export interface AIAgent extends BaseEntity {
  slug: string
  name: string
  role: string
  departmentSlug: DepartmentSlug
  description: string
  primaryGoal: string
  systemInstructions: string
  model: string
  provider: AIExecutionProvider
  temperature: number
  authorizedTools: string[]
  status: AgentOperationalStatus
  avatarIcon: string
  executionCount: number
  successRate: number
  lastActiveAt: string | null
}

export type ExecutionState = 'pendente' | 'executando' | 'concluido' | 'falha' | 'aguardando_aprovacao'

export interface AgentExecution extends BaseEntity {
  agentId: ID
  agentName: string
  departmentSlug: DepartmentSlug
  taskTitle: string
  prompt: string
  output: string
  durationMs: number
  tokensCount: number
  status: ExecutionState
  errorMessage?: string
  requiresApproval?: boolean
  approvalId?: ID
  sourceModule?: 'radar' | 'projetos' | 'crm' | 'conteudo' | 'financeiro' | 'estudos' | 'manual'
  contextEntityId?: ID
}

export type ApprovalActionType = 'publicacao' | 'mensagem_cliente' | 'financeiro' | 'crm_update' | 'proposta' | 'outro'

export interface AgentApproval extends BaseEntity {
  executionId: ID
  agentId: ID
  agentName: string
  departmentSlug: DepartmentSlug
  title: string
  description: string
  actionType: ApprovalActionType
  contentToApprove: string
  payload?: Record<string, unknown>
  status: 'pendente' | 'aprovado' | 'rejeitado'
  resolvedAt?: string
  feedbackNote?: string
}

export interface OllamaModelInfo {
  name: string
  size?: number
  digest?: string
  modifiedAt?: string
}

export interface OllamaHealthStatus {
  available: boolean
  endpoint: string
  version?: string
  models: string[]
  activeModel: string
  error?: string
  latencyMs?: number
}
