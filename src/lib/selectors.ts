import { CONTRACT_PERIODICITY, TASK_PRIORITY } from '@/config/labels'
import type { CalendarEvent, Content, Contract, ContractStatus, ID, ISODate, Task, Transaction } from '@/types'
import { addDays, daysFromToday, formatCurrency, monthKey, todayISO } from './format'

/** Funções puras de derivação de dados. Sem efeitos colaterais, fáceis de testar. */

export function isTaskOverdue(task: Task, today = todayISO()): boolean {
  return task.status !== 'concluido' && !!task.dueDate && task.dueDate < today
}

export function taskCounts(tasks: Task[]) {
  const today = todayISO()
  return {
    aFazer: tasks.filter((t) => t.status === 'a_fazer').length,
    emAndamento: tasks.filter((t) => t.status === 'em_andamento').length,
    concluidas: tasks.filter((t) => t.status === 'concluido').length,
    atrasadas: tasks.filter((t) => isTaskOverdue(t, today)).length,
    pendentes: tasks.filter((t) => t.status !== 'concluido').length,
    total: tasks.length,
  }
}

/** Ordena por prazo (sem prazo por último), depois por prioridade. */
export function sortByDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    return TASK_PRIORITY[b.priority].weight - TASK_PRIORITY[a.priority].weight
  })
}

export function upcomingTasks(tasks: Task[], limit = 6): Task[] {
  return sortByDue(tasks.filter((t) => t.status !== 'concluido')).slice(0, limit)
}

export interface FinanceSummary {
  receitaCents: number // recebido
  despesaCents: number // pago
  saldoCents: number
  aReceberCents: number // pendente + atrasado
  atrasadoCents: number
  aPagarCents: number
  mrrCents: number // Receita Recorrente Mensal (mensalidades de clientes)
  despesasRecorrentesCents: number // Despesas recorrentes mensais (ferramentas, servidores)
  margemRecorrenteCents: number // Margem líquida recorrente
}

const sum = (list: Transaction[]) => list.reduce((acc, t) => acc + t.amountCents, 0)

export function financeSummary(transactions: Transaction[]): FinanceSummary {
  const receitas = transactions.filter((t) => t.type === 'receita')
  const despesas = transactions.filter((t) => t.type === 'despesa')
  const receitaCents = sum(receitas.filter((t) => t.status === 'recebido'))
  const despesaCents = sum(despesas.filter((t) => t.status === 'pago'))
  const mrrCents = sum(
    receitas.filter((t) => Boolean(t.recurring || t.recurrencePeriod === 'mensal' || t.category?.toLowerCase() === 'mensalidade')),
  )
  const despesasRecorrentesCents = sum(
    despesas.filter((t) => Boolean(t.recurring || t.recurrencePeriod === 'mensal')),
  )
  return {
    receitaCents,
    despesaCents,
    saldoCents: receitaCents - despesaCents,
    aReceberCents: sum(receitas.filter((t) => t.status === 'pendente' || t.status === 'atrasado')),
    atrasadoCents: sum(receitas.filter((t) => t.status === 'atrasado')),
    aPagarCents: sum(despesas.filter((t) => t.status === 'a_pagar')),
    mrrCents,
    despesasRecorrentesCents,
    margemRecorrenteCents: mrrCents - despesasRecorrentesCents,
  }
}

export function inMonth(transactions: Transaction[], key = monthKey(todayISO())): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === key)
}

/** Série mensal (últimos N meses) de receitas recebidas x despesas pagas. */
export function monthlySeries(transactions: Transaction[], months = 6) {
  const now = new Date()
  const keys: string[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys.map((key) => {
    const list = inMonth(transactions, key)
    return {
      key,
      receitas: sum(list.filter((t) => t.type === 'receita' && t.status === 'recebido')) / 100,
      despesas: sum(list.filter((t) => t.type === 'despesa' && t.status === 'pago')) / 100,
    }
  })
}

export function recentTransactions(transactions: Transaction[], limit = 8): Transaction[] {
  return [...transactions]
    .sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : a.date < b.date ? 1 : -1))
    .slice(0, limit)
}

export function byProject<T extends { projectId: ID | null }>(list: T[], projectId: ID): T[] {
  return list.filter((i) => i.projectId === projectId)
}

export function byClient<T extends { clientId: ID | null }>(list: T[], clientId: ID): T[] {
  return list.filter((i) => i.clientId === clientId)
}

export function dueSoon(task: Task): boolean {
  return !!task.dueDate && task.status !== 'concluido' && task.dueDate <= addDays(todayISO(), 2)
}

// =========================================================
// V2
// =========================================================


// ---------- Contratos ----------

/** Status efetivo: um contrato "ativo" cuja data de término já passou é tratado como expirado. */
export function contractStatus(c: Contract, today = todayISO()): ContractStatus {
  if (c.status === 'ativo' && c.endDate && c.endDate < today) return 'expirado'
  return c.status
}

/** Valor mensal equivalente (0 para pagamento único). */
export function contractMonthlyCents(c: Contract): number {
  const months = CONTRACT_PERIODICITY[c.periodicity].months
  return months ? Math.round(c.amountCents / months) : 0
}

/** Próxima data relevante: renovação, ou término. */
export function contractDueDate(c: Contract): ISODate | null {
  return c.nextRenewal ?? c.endDate
}

/** "R$ 600,00/mês" */
export function contractValueLabel(c: Contract): string {
  return `${formatCurrency(c.amountCents)}${CONTRACT_PERIODICITY[c.periodicity].short}`
}

export const CONTRACT_ALERT_DAYS = 30

/** Contratos ativos que vencem/renovam nos próximos N dias. */
export function contractsDueSoon(contracts: Contract[], days = CONTRACT_ALERT_DAYS): Contract[] {
  return contracts
    .filter((c) => {
      const due = contractDueDate(c)
      if (contractStatus(c) !== 'ativo' || !due) return false
      const diff = daysFromToday(due)
      return diff >= 0 && diff <= days
    })
    .sort((a, b) => (contractDueDate(a)! < contractDueDate(b)! ? -1 : 1))
}

export function contractSummary(contracts: Contract[]) {
  const active = contracts.filter((c) => contractStatus(c) === 'ativo')
  return {
    ativos: active.length,
    pendentes: contracts.filter((c) => contractStatus(c) === 'pendente').length,
    expirados: contracts.filter((c) => contractStatus(c) === 'expirado').length,
    vencendo: contractsDueSoon(contracts).length,
    mrrCents: active.reduce((acc, c) => acc + contractMonthlyCents(c), 0),
  }
}

// ---------- Agenda unificada (calendário) ----------

export type AgendaKind = 'task' | 'event' | 'content'

export interface AgendaItem {
  kind: AgendaKind
  id: string
  date: ISODate
  /** 'HH:MM' quando houver. */
  time: string | null
  title: string
  projectId: string | null
  done: boolean
  task?: Task
  event?: CalendarEvent
  content?: Content
}

/** Data de calendário de um conteúdo: publicação; se ainda não houver, a data prevista. */
export function contentDate(c: Content): ISODate | null {
  return c.publishDate ?? c.plannedDate
}

export function buildAgenda(
  { tasks, events, contents }: { tasks: Task[]; events: CalendarEvent[]; contents: Content[] },
  from: ISODate,
  to: ISODate,
): AgendaItem[] {
  const inRange = (d: ISODate | null): d is ISODate => !!d && d >= from && d <= to
  const items: AgendaItem[] = []
  for (const t of tasks) {
    if (inRange(t.dueDate))
      items.push({ kind: 'task', id: t.id, date: t.dueDate, time: null, title: t.title, projectId: t.projectId, done: t.status === 'concluido', task: t })
  }
  for (const e of events) {
    if (inRange(e.date))
      items.push({ kind: 'event', id: e.id, date: e.date, time: e.startTime, title: e.title, projectId: e.projectId, done: e.status !== 'agendado', event: e })
  }
  for (const c of contents) {
    const d = contentDate(c)
    if (inRange(d))
      items.push({ kind: 'content', id: c.id, date: d, time: null, title: c.title, projectId: c.projectId, done: c.status === 'publicado', content: c })
  }
  const kindOrder: Record<AgendaKind, number> = { event: 0, content: 1, task: 2 }
  return items.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time ?? '99').localeCompare(b.time ?? '99') ||
      kindOrder[a.kind] - kindOrder[b.kind] ||
      a.title.localeCompare(b.title),
  )
}

// ---------- Relatórios ----------

/** Série mensal entre duas chaves 'YYYY-MM' (inclusive). */
export function monthlySeriesBetween(transactions: Transaction[], fromKey: string, toKey: string) {
  const keys: string[] = []
  let [y, m] = fromKey.split('-').map(Number)
  const [ty, tm] = toKey.split('-').map(Number)
  while (y < ty || (y === ty && m <= tm)) {
    keys.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) {
      m = 1
      y++
    }
    if (keys.length > 60) break
  }
  return keys.map((key) => {
    const list = inMonth(transactions, key)
    return {
      key,
      receitas: sum(list.filter((t) => t.type === 'receita' && t.status === 'recebido')) / 100,
      despesas: sum(list.filter((t) => t.type === 'despesa' && t.status === 'pago')) / 100,
    }
  })
}
