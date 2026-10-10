import { CONTENT_STATUS, CONTENT_STATUS_ORDER, EVENT_TYPE, KNOWLEDGE_CATEGORY, TASK_PRIORITY, TASK_STATUS } from '@/config/labels'
import { addDays, daysFromToday, formatCurrency, formatDate, monthKey, monthLabel, todayISO } from '@/lib/format'
import {
  byClient,
  byProject,
  contentDate,
  contractDueDate,
  contractMonthlyCents,
  contractStatus,
  contractsDueSoon,
  financeSummary,
  inMonth,
  isTaskOverdue,
  sortByDue,
  taskCounts,
} from '@/lib/selectors'
import type { DataContextValue } from '@/store/DataContext'
import type { ActivityLog, CalendarEvent, Content, Contract, ID, KnowledgeItem, Task, Transaction } from '@/types'
import type { AIContext, ContextFacts, FinanceFacts } from './types'

/**
 * Montagem de contexto para a IA.
 *
 * Princípios (privacidade e precisão):
 * - Cada função envia SOMENTE o escopo pedido (um projeto, um cliente, o financeiro).
 * - Os números são calculados aqui a partir dos dados reais — a IA apenas interpreta.
 * - Nada de e-mails/telefones de clientes no contexto (não são necessários para as análises).
 * - Limites de tamanho por seção para não enviar dados desnecessários.
 */

type Data = Pick<
  DataContextValue,
  'projects' | 'tasks' | 'clients' | 'transactions' | 'events' | 'contracts' | 'contents' | 'knowledge' | 'projectById' | 'clientById' | 'settings'
>

const MAX_ITEMS = 12
const MAX_KNOWLEDGE_CHARS = 12_000
const brl = (cents: number) => formatCurrency(cents)
const prevMonthKey = () => {
  const d = new Date()
  const p = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  return `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}`
}

function finFacts(list: Transaction[]): FinanceFacts {
  const s = financeSummary(list)
  return { receita: s.receitaCents, despesa: s.despesaCents, saldo: s.saldoCents, aReceber: s.aReceberCents, atrasado: s.atrasadoCents, aPagar: s.aPagarCents }
}

function taskFacts(tasks: Task[], projectName?: (id: ID | null) => string | undefined): NonNullable<ContextFacts['tasks']> {
  const c = taskCounts(tasks)
  const today = todayISO()
  const pending = sortByDue(tasks.filter((t) => t.status !== 'concluido'))
  return {
    total: c.total,
    pending: c.pendentes,
    inProgress: c.emAndamento,
    done: c.concluidas,
    overdue: pending.filter((t) => isTaskOverdue(t)).slice(0, MAX_ITEMS).map((t) => ({ title: t.title, due: t.dueDate!, project: projectName?.(t.projectId) })),
    today: pending.filter((t) => t.dueDate === today).slice(0, MAX_ITEMS).map((t) => ({ title: t.title, project: projectName?.(t.projectId) })),
    next: pending
      .filter((t) => !isTaskOverdue(t))
      .slice(0, MAX_ITEMS)
      .map((t) => ({ title: t.title, due: t.dueDate ?? '', priority: TASK_PRIORITY[t.priority].label, project: projectName?.(t.projectId) })),
  }
}

function contentFacts(contents: Content[]): NonNullable<ContextFacts['contents']> {
  const byStatus: Record<string, number> = {}
  for (const s of CONTENT_STATUS_ORDER) byStatus[CONTENT_STATUS[s].label] = contents.filter((c) => c.status === s).length
  return {
    byStatus,
    approval: contents.filter((c) => c.status === 'aprovacao').slice(0, MAX_ITEMS).map((c) => c.title),
    scheduled: contents
      .filter((c) => c.status === 'agendado')
      .slice(0, MAX_ITEMS)
      .map((c) => ({ title: c.title, date: contentDate(c) ?? '' })),
    recent: [...contents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8).map((c) => `${c.title} (${CONTENT_STATUS[c.status].label})`),
  }
}

function contractFacts(contracts: Contract[]): NonNullable<ContextFacts['contracts']> {
  const active = contracts.filter((c) => contractStatus(c) === 'ativo')
  return {
    active: active.length,
    mrr: active.reduce((a, c) => a + contractMonthlyCents(c), 0),
    dueSoon: contractsDueSoon(contracts, 30).map((c) => ({ title: c.title, days: daysFromToday(contractDueDate(c)!) })),
    list: contracts.slice(0, MAX_ITEMS).map((c) => `${c.title} — ${contractStatus(c)} — ${brl(c.amountCents)} (${c.periodicity})`),
  }
}

function eventFacts(events: CalendarEvent[], days = 14) {
  const today = todayISO()
  const end = addDays(today, days)
  return events
    .filter((e) => e.date >= today && e.date <= end && e.status === 'agendado')
    .sort((a, b) => (a.date + (a.startTime ?? '')).localeCompare(b.date + (b.startTime ?? '')))
    .slice(0, MAX_ITEMS)
    .map((e) => ({ title: e.title, date: e.date, time: e.startTime, type: EVENT_TYPE[e.type].label }))
}

// ---------- Renderização em texto ----------

function renderFinance(f: FinanceFacts) {
  return `receita recebida ${brl(f.receita)}; despesas pagas ${brl(f.despesa)}; saldo ${brl(f.saldo)}; a receber ${brl(f.aReceber)} (atrasado ${brl(f.atrasado)}); a pagar ${brl(f.aPagar)}`
}

function renderKnowledge(items: KnowledgeItem[]) {
  let budget = MAX_KNOWLEDGE_CHARS
  const out: string[] = []
  for (const k of items) {
    if (budget <= 0) break
    const body = k.content.slice(0, Math.min(3000, budget))
    budget -= body.length
    out.push(`### ${k.title} [${KNOWLEDGE_CATEGORY[k.category].label}]\n${body}`)
  }
  return out.join('\n\n')
}

function renderFacts(f: ContextFacts, extra: string[] = []): string {
  const lines: string[] = [`Data de hoje: ${formatDate(todayISO())}.`]
  if (f.tasks) {
    const t = f.tasks
    lines.push(
      `\n## Tarefas\nTotal ${t.total} · pendentes ${t.pending} · em andamento ${t.inProgress} · concluídas ${t.done} · atrasadas ${t.overdue.length}.`,
    )
    if (t.overdue.length) lines.push('Atrasadas:\n' + t.overdue.map((x) => `- ${x.title} (prazo ${formatDate(x.due)}${x.project ? `, ${x.project}` : ''})`).join('\n'))
    if (t.today.length) lines.push('Vencem hoje:\n' + t.today.map((x) => `- ${x.title}${x.project ? ` (${x.project})` : ''}`).join('\n'))
    if (t.next.length)
      lines.push('Próximas:\n' + t.next.map((x) => `- ${x.title} — ${x.due ? formatDate(x.due) : 'sem prazo'} — prioridade ${x.priority}${x.project ? ` — ${x.project}` : ''}`).join('\n'))
  }
  if (f.events) lines.push('\n## Próximos eventos\n' + (f.events.length ? f.events.map((e) => `- ${formatDate(e.date)}${e.time ? ` ${e.time}` : ''} — ${e.type}: ${e.title}`).join('\n') : 'Nenhum.'))
  if (f.contents) {
    lines.push('\n## Conteúdos\n' + Object.entries(f.contents.byStatus).map(([k, v]) => `${k}: ${v}`).join(' · '))
    if (f.contents.approval.length) lines.push('Aguardando aprovação: ' + f.contents.approval.join('; '))
    if (f.contents.scheduled.length) lines.push('Agendados: ' + f.contents.scheduled.map((c) => `${c.title} (${c.date ? formatDate(c.date) : 'sem data'})`).join('; '))
    if (f.contents.recent.length) lines.push('Atualizados recentemente: ' + f.contents.recent.join('; '))
  }
  if (f.contracts) {
    lines.push(`\n## Contratos\nAtivos: ${f.contracts.active} · recorrente mensal: ${brl(f.contracts.mrr)}.`)
    if (f.contracts.dueSoon.length) lines.push('Vencendo em até 30 dias: ' + f.contracts.dueSoon.map((c) => `${c.title} (${c.days} dias)`).join('; '))
    if (f.contracts.list.length) lines.push(f.contracts.list.map((c) => `- ${c}`).join('\n'))
  }
  if (f.finance) {
    const fin = f.finance
    lines.push(
      `\n## Financeiro (valores reais, já calculados)\n- ${fin.monthLabel}: ${renderFinance(fin.month)}\n- ${fin.prevMonthLabel}: ${renderFinance(fin.prevMonth)}\n- Acumulado: ${renderFinance(fin.total)}`,
    )
    if (fin.byProject.length) lines.push('Por projeto (acumulado): ' + fin.byProject.map((p) => `${p.name}: receita ${brl(p.receita)}, despesas ${brl(p.despesa)}, resultado ${brl(p.saldo)}`).join('; '))
    if (fin.topExpenseCategories.length) lines.push('Maiores despesas por categoria (acumulado): ' + fin.topExpenseCategories.map((c) => `${c.name} ${brl(c.value)}`).join('; '))
  }
  if (f.clients) lines.push('\n## Clientes\n' + (f.clients.length ? f.clients.join('; ') : 'Nenhum.'))
  if (f.activity?.length) lines.push('\n## Atividade recente\n' + f.activity.map((a) => `- ${a}`).join('\n'))
  return [...lines, ...extra].join('\n')
}

function financeOf(transactions: Transaction[], data: Data): NonNullable<ContextFacts['finance']> {
  const mk = monthKey(todayISO())
  const pk = prevMonthKey()
  const projects = data.projects
    .map((p) => {
      const s = financeSummary(byProject(transactions, p.id))
      return { name: p.name, receita: s.receitaCents, despesa: s.despesaCents, saldo: s.saldoCents }
    })
    .filter((p) => p.receita || p.despesa)
    .sort((a, b) => b.receita - a.receita)
  const cats = new Map<string, number>()
  for (const t of transactions) if (t.type === 'despesa' && t.status === 'pago') cats.set(t.category, (cats.get(t.category) ?? 0) + t.amountCents)
  return {
    monthLabel: `Mês atual (${monthLabel(mk)}/${mk.slice(0, 4)})`,
    month: finFacts(inMonth(transactions, mk)),
    prevMonthLabel: `Mês anterior (${monthLabel(pk)}/${pk.slice(0, 4)})`,
    prevMonth: finFacts(inMonth(transactions, pk)),
    total: finFacts(transactions),
    byProject: projects,
    topExpenseCategories: [...cats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value })),
  }
}

const activityLines = (logs: ActivityLog[]) => logs.slice(0, 15).map((l) => `${formatDate(l.createdAt.slice(0, 10))}: ${l.description}`)

// ---------- Construtores públicos ----------

export function buildProjectContext(data: Data, projectId: ID, activity: ActivityLog[] = []): AIContext {
  const project = data.projectById.get(projectId)
  if (!project) throw new Error('Projeto não encontrado.')
  const tasks = byProject(data.tasks, projectId)
  const transactions = byProject(data.transactions, projectId)
  const knowledge = data.knowledge.filter((k) => k.projectId === projectId)
  const facts: ContextFacts = {
    name: project.name,
    tasks: taskFacts(tasks),
    events: eventFacts(byProject(data.events, projectId)),
    contents: contentFacts(byProject(data.contents, projectId)),
    contracts: contractFacts(byProject(data.contracts, projectId)),
    finance: { ...financeOf(transactions, data), byProject: [] },
    clients: data.clients.filter((c) => c.projectIds.includes(projectId)).map((c) => `${c.name}${c.company ? ` (${c.company})` : ''} — ${c.status}`),
    knowledgeCount: knowledge.length,
    activity: activityLines(activity),
  }
  const header = `# Projeto: ${project.name}\nStatus: ${project.status}. Descrição: ${project.description || '(sem descrição)'}`
  const kb = knowledge.length ? `\n\n## Base de conhecimento do projeto\n${renderKnowledge(knowledge)}` : '\n\n## Base de conhecimento do projeto\n(vazia)'
  return { scope: 'project', sensitivity: 'internal', label: `Projeto: ${project.name}`, facts, text: `${header}\n${renderFacts(facts)}${kb}` }
}

export function buildClientContext(data: Data, clientId: ID, activity: ActivityLog[] = []): AIContext {
  const client = data.clientById.get(clientId)
  if (!client) throw new Error('Cliente não encontrado.')
  const tasks = byClient(data.tasks, clientId)
  const knowledge = data.knowledge.filter((k) => k.clientId === clientId)
  const facts: ContextFacts = {
    name: client.name,
    tasks: taskFacts(tasks, (id) => (id ? data.projectById.get(id)?.name : undefined)),
    events: eventFacts(byClient(data.events, clientId), 30),
    contents: contentFacts(byClient(data.contents, clientId)),
    contracts: contractFacts(byClient(data.contracts, clientId)),
    finance: { ...financeOf(byClient(data.transactions, clientId), data), byProject: [] },
    knowledgeCount: knowledge.length,
    activity: activityLines(activity),
  }
  const projects = client.projectIds.map((id) => data.projectById.get(id)?.name).filter(Boolean)
  const header = `# Cliente: ${client.name}\nEmpresa: ${client.company || '—'} · status: ${client.status} · cliente desde ${formatDate(client.createdAt.slice(0, 10))}\nProjetos relacionados: ${projects.join(', ') || 'nenhum'}\nObservações: ${client.notes || '—'}`
  const kb = knowledge.length ? `\n\n## Conhecimento sobre o cliente\n${renderKnowledge(knowledge)}` : ''
  return { scope: 'client', sensitivity: 'sensitive', label: `Cliente: ${client.name}`, facts, text: `${header}\n${renderFacts(facts)}${kb}` }
}

export function buildFinancialContext(data: Data, filters: { projectId?: ID | null } = {}): AIContext {
  const project = filters.projectId ? data.projectById.get(filters.projectId) : undefined
  const transactions = project ? byProject(data.transactions, project.id) : data.transactions
  const facts: ContextFacts = { name: project ? `Financeiro — ${project.name}` : 'Financeiro geral', finance: financeOf(transactions, data) }
  if (project) facts.finance!.byProject = []
  const count = `Quantidade de lançamentos considerados: ${transactions.length}.`
  return { scope: 'finance', sensitivity: 'sensitive', label: project ? `Financeiro: ${project.name}` : 'Financeiro: todos os projetos', facts, text: `# ${facts.name}\n${count}\n${renderFacts(facts)}` }
}

/** Visão do dia (briefing): resume todos os projetos, só com o necessário para priorizar. */
export function buildOverviewContext(data: Data): AIContext {
  const projectName = (id: ID | null) => (id ? data.projectById.get(id)?.name : undefined)
  const today = todayISO()
  const facts: ContextFacts = {
    name: 'Visão geral do dia',
    tasks: taskFacts(data.tasks, projectName),
    events: eventFacts(data.events, 2),
    contents: contentFacts(data.contents),
    contracts: contractFacts(data.contracts),
    finance: financeOf(data.transactions, data),
  }
  const todayContents = data.contents.filter((c) => contentDate(c) === today && c.status !== 'publicado').map((c) => c.title)
  const extra = [
    `\n## Projetos ativos\n${data.projects.filter((p) => p.status === 'ativo').map((p) => p.name).join(', ') || 'nenhum'}`,
    `Conteúdos com data para hoje: ${todayContents.join('; ') || 'nenhum'}`,
    `Status das tarefas: ${Object.values(TASK_STATUS).map((s) => s.label).join(' / ')}`,
  ]
  return { scope: 'overview', sensitivity: 'internal', label: 'Visão geral (todos os projetos)', facts, text: `# Briefing do dia\n${renderFacts(facts, extra)}` }
}
