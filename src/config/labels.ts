import type {
  ClientStatus,
  ContentStatus,
  ContentType,
  ContractPeriodicity,
  ContractStatus,
  EventStatus,
  EventType,
  FileCategory,
  AutomationActionType,
  AutomationTrigger,
  KnowledgeCategory,
  NotificationSeverity,
  ExpenseStatus,
  IncomeStatus,
  ProjectColor,
  ProjectStatus,
  ProspectConfidence,
  ProspectStatus,
  TaskPriority,
  TaskStatus,
} from '@/types'
import type { BadgeTone } from '@/components/ui/Badge'

/** Rótulos e tons visuais de cada enum. Centralizado para manter consistência. */

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  ativo: { label: 'Ativo', tone: 'success' },
  pausado: { label: 'Pausado', tone: 'warning' },
  concluido: { label: 'Concluído', tone: 'info' },
  arquivado: { label: 'Arquivado', tone: 'neutral' },
}

export const TASK_STATUS: Record<TaskStatus, { label: string; tone: BadgeTone }> = {
  a_fazer: { label: 'A fazer', tone: 'neutral' },
  em_andamento: { label: 'Em andamento', tone: 'info' },
  concluido: { label: 'Concluído', tone: 'success' },
}

export const TASK_STATUS_ORDER: TaskStatus[] = ['a_fazer', 'em_andamento', 'concluido']

export const TASK_PRIORITY: Record<TaskPriority, { label: string; tone: BadgeTone; weight: number }> = {
  baixa: { label: 'Baixa', tone: 'neutral', weight: 0 },
  media: { label: 'Média', tone: 'info', weight: 1 },
  alta: { label: 'Alta', tone: 'warning', weight: 2 },
  urgente: { label: 'Urgente', tone: 'danger', weight: 3 },
}

export const CLIENT_STATUS: Record<ClientStatus, { label: string; tone: BadgeTone }> = {
  ativo: { label: 'Ativo', tone: 'success' },
  negociacao: { label: 'Em negociação', tone: 'warning' },
  inativo: { label: 'Inativo', tone: 'neutral' },
}

export const PROSPECT_STATUS: Record<ProspectStatus, { label: string; tone: BadgeTone; dot: string }> = {
  mapeada: { label: 'Mapeada', tone: 'neutral', dot: 'bg-zinc-400' },
  em_pesquisa: { label: 'Em pesquisa', tone: 'info', dot: 'bg-sky-500' },
  contatada: { label: 'Contatada', tone: 'warning', dot: 'bg-amber-500' },
  qualificada: { label: 'Qualificada', tone: 'accent', dot: 'bg-violet-500' },
  descartada: { label: 'Descartada', tone: 'neutral', dot: 'bg-zinc-500' },
  convertida: { label: 'Convertida', tone: 'success', dot: 'bg-emerald-500' },
}

export const PROSPECT_STATUS_ORDER: ProspectStatus[] = ['mapeada', 'em_pesquisa', 'contatada', 'qualificada', 'descartada', 'convertida']

export const PROSPECT_CONFIDENCE: Record<ProspectConfidence, { label: string; tone: BadgeTone }> = {
  baixo: { label: 'Baixa (Hipótese)', tone: 'neutral' },
  medio: { label: 'Média (Checada)', tone: 'info' },
  alto: { label: 'Alta (Validada)', tone: 'success' },
}

export const INCOME_STATUS: Record<IncomeStatus, { label: string; tone: BadgeTone }> = {
  recebido: { label: 'Recebido', tone: 'success' },
  pendente: { label: 'Pendente', tone: 'warning' },
  atrasado: { label: 'Atrasado', tone: 'danger' },
}

export const EXPENSE_STATUS: Record<ExpenseStatus, { label: string; tone: BadgeTone }> = {
  pago: { label: 'Pago', tone: 'success' },
  a_pagar: { label: 'A pagar', tone: 'warning' },
}

export const INCOME_CATEGORIES = ['Serviço', 'Produto digital', 'Mensalidade', 'Venda', 'Outros']
export const EXPENSE_CATEGORIES = ['Ferramentas', 'Anúncios', 'Impostos', 'Freelancer', 'Equipamento', 'Outros']

/** Paleta de cores para identificar projetos (classes Tailwind completas para o JIT encontrar). */
export const PROJECT_COLORS: Record<ProjectColor, { dot: string; soft: string; label: string }> = {
  teal: { dot: 'bg-teal-500', soft: 'bg-teal-500/12 text-teal-700 dark:text-teal-300', label: 'Verde-azulado' },
  amber: { dot: 'bg-amber-500', soft: 'bg-amber-500/12 text-amber-700 dark:text-amber-300', label: 'Âmbar' },
  violet: { dot: 'bg-violet-500', soft: 'bg-violet-500/12 text-violet-700 dark:text-violet-300', label: 'Violeta' },
  rose: { dot: 'bg-rose-500', soft: 'bg-rose-500/12 text-rose-700 dark:text-rose-300', label: 'Rosa' },
  sky: { dot: 'bg-sky-500', soft: 'bg-sky-500/12 text-sky-700 dark:text-sky-300', label: 'Azul' },
  lime: { dot: 'bg-lime-500', soft: 'bg-lime-500/12 text-lime-700 dark:text-lime-300', label: 'Lima' },
  slate: { dot: 'bg-slate-500', soft: 'bg-slate-500/12 text-slate-700 dark:text-slate-300', label: 'Grafite' },
}

// ---------- V2 ----------

export const EVENT_TYPE: Record<EventType, { label: string; tone: BadgeTone }> = {
  reuniao: { label: 'Reunião', tone: 'info' },
  evento: { label: 'Evento', tone: 'accent' },
  compromisso: { label: 'Compromisso', tone: 'neutral' },
}

export const EVENT_STATUS: Record<EventStatus, { label: string; tone: BadgeTone }> = {
  agendado: { label: 'Agendado', tone: 'info' },
  concluido: { label: 'Concluído', tone: 'success' },
  cancelado: { label: 'Cancelado', tone: 'neutral' },
}

export const CONTRACT_STATUS: Record<ContractStatus, { label: string; tone: BadgeTone }> = {
  ativo: { label: 'Ativo', tone: 'success' },
  pendente: { label: 'Pendente', tone: 'warning' },
  encerrado: { label: 'Encerrado', tone: 'neutral' },
  expirado: { label: 'Expirado', tone: 'danger' },
}

/** `months`: duração do ciclo em meses (0 = pagamento único). Usado para calcular o valor mensal recorrente. */
export const CONTRACT_PERIODICITY: Record<ContractPeriodicity, { label: string; short: string; months: number }> = {
  unico: { label: 'Único', short: '', months: 0 },
  mensal: { label: 'Mensal', short: '/mês', months: 1 },
  trimestral: { label: 'Trimestral', short: '/trimestre', months: 3 },
  semestral: { label: 'Semestral', short: '/semestre', months: 6 },
  anual: { label: 'Anual', short: '/ano', months: 12 },
}

export const FILE_CATEGORY: Record<FileCategory, { label: string; tone: BadgeTone }> = {
  documento: { label: 'Documento', tone: 'neutral' },
  briefing: { label: 'Briefing', tone: 'accent' },
  imagem: { label: 'Imagem', tone: 'info' },
  video: { label: 'Vídeo', tone: 'warning' },
  planilha: { label: 'Planilha', tone: 'success' },
  outro: { label: 'Outro', tone: 'neutral' },
}

export const CONTENT_TYPE: Record<ContentType, { label: string }> = {
  post: { label: 'Post' },
  carrossel: { label: 'Carrossel' },
  reel: { label: 'Reel' },
  story: { label: 'Story' },
  video: { label: 'Vídeo' },
  artigo: { label: 'Artigo' },
  outro: { label: 'Outro' },
}

export const CONTENT_STATUS: Record<ContentStatus, { label: string; tone: BadgeTone; dot: string }> = {
  ideia: { label: 'Ideia', tone: 'neutral', dot: 'bg-subtle' },
  roteiro: { label: 'Roteiro', tone: 'accent', dot: 'bg-violet-500' },
  producao: { label: 'Produção', tone: 'info', dot: 'bg-sky-500' },
  aprovacao: { label: 'Aprovação', tone: 'warning', dot: 'bg-amber-500' },
  agendado: { label: 'Agendado', tone: 'info', dot: 'bg-teal-500' },
  publicado: { label: 'Publicado', tone: 'success', dot: 'bg-emerald-500' },
}

export const CONTENT_STATUS_ORDER: ContentStatus[] = ['ideia', 'roteiro', 'producao', 'aprovacao', 'agendado', 'publicado']

// ---------- V3 ----------

export const KNOWLEDGE_CATEGORY: Record<KnowledgeCategory, { label: string; tone: BadgeTone }> = {
  contexto: { label: 'Contexto', tone: 'accent' },
  processo: { label: 'Processo', tone: 'info' },
  estrategia: { label: 'Estratégia', tone: 'warning' },
  publico: { label: 'Público', tone: 'success' },
  produto: { label: 'Produto', tone: 'neutral' },
  servico: { label: 'Serviço', tone: 'neutral' },
  referencia: { label: 'Referência', tone: 'neutral' },
  outro: { label: 'Outro', tone: 'neutral' },
}

/**
 * Gatilhos de automação. `kind`:
 * - 'event': dispara quando algo acontece no app (ex.: tarefa concluída);
 * - 'state': verificado periodicamente (ex.: tarefa atrasada) — roda 1x por item.
 */
export const AUTOMATION_TRIGGER: Record<AutomationTrigger, { label: string; kind: 'event' | 'state'; entity: 'task' | 'contract' | 'content' | 'transaction' }> = {
  task_created: { label: 'Tarefa criada', kind: 'event', entity: 'task' },
  task_completed: { label: 'Tarefa concluída', kind: 'event', entity: 'task' },
  task_overdue: { label: 'Tarefa ficou atrasada', kind: 'state', entity: 'task' },
  contract_due: { label: 'Contrato próximo do vencimento', kind: 'state', entity: 'contract' },
  content_approval: { label: 'Conteúdo aguardando aprovação', kind: 'state', entity: 'content' },
  content_published: { label: 'Conteúdo publicado', kind: 'event', entity: 'content' },
  income_created: { label: 'Receita registrada', kind: 'event', entity: 'transaction' },
  expense_created: { label: 'Despesa registrada', kind: 'event', entity: 'transaction' },
}

export const AUTOMATION_ACTION: Record<AutomationActionType, { label: string; description: string; triggers?: AutomationTrigger[] }> = {
  notify: { label: 'Criar alerta', description: 'Notificação na central e no bloco “Atenção” do Dashboard' },
  create_task: { label: 'Criar tarefa', description: 'Cria uma tarefa vinculada ao mesmo projeto' },
  set_publish_date: { label: 'Registrar data de publicação', description: 'Preenche a data de publicação (se vazia) com hoje', triggers: ['content_published'] },
  log: { label: 'Adicionar registro ao histórico', description: 'Grava uma linha na atividade do projeto' },
}

export const SEVERITY: Record<NotificationSeverity, { label: string; dot: string; tone: BadgeTone }> = {
  danger: { label: 'Urgente', dot: 'bg-rose-500', tone: 'danger' },
  warning: { label: 'Atenção', dot: 'bg-amber-500', tone: 'warning' },
  info: { label: 'Informação', dot: 'bg-sky-500', tone: 'info' },
  success: { label: 'Positivo', dot: 'bg-emerald-500', tone: 'success' },
}

export const AI_MODELS = [
  { value: 'gemini-flash-latest', provider: 'gemini', label: 'Gemini Flash', hint: 'Plano grátis do Google · bom equilíbrio (padrão)' },
  { value: 'gemini-flash-lite-latest', provider: 'gemini', label: 'Gemini Flash-Lite', hint: 'Plano grátis · mais rápido e com cota maior' },
  { value: 'claude-haiku-4-5', provider: 'anthropic', label: 'Claude Haiku 4.5', hint: 'Pago · mais econômico da Anthropic' },
  { value: 'claude-sonnet-5-5', provider: 'anthropic', label: 'Claude Sonnet 5.5', hint: 'Pago · rápido e equilibrado' },
  { value: 'claude-opus-5-5', provider: 'anthropic', label: 'Claude Opus 5.5', hint: 'Pago · mais capaz' },
] as const

export const AI_DEFAULT_MODEL = { gemini: 'gemini-flash-latest', anthropic: 'claude-haiku-4-5' } as const
