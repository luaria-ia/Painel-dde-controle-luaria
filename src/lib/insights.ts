import { contentDate, contractDueDate, contractsDueSoon, financeSummary, inMonth, isTaskOverdue } from '@/lib/selectors'
import type { CalendarEvent, Content, Contract, ID, NotificationSeverity, Project, Task, Transaction } from '@/types'
import { daysFromToday, formatCurrency, todayISO } from './format'

/**
 * Insights determinísticos (regras sobre os dados reais — não usam IA).
 * Servem de "sugestões baseadas nos dados" e funcionam mesmo sem IA configurada.
 * Nunca alteram dados: cada insight traz apenas um link para o usuário agir.
 */

export interface Insight {
  id: string
  severity: NotificationSeverity
  title: string
  body: string
  action?: { label: string; to: string }
}

interface Input {
  tasks: Task[]
  contracts: Contract[]
  contents: Content[]
  transactions: Transaction[]
  projects: Project[]
  /** Restringe a um projeto. */
  projectId?: ID
}

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`

export function generateInsights({ tasks, contracts, contents, transactions, projects, projectId }: Input): Insight[] {
  const scope = <T extends { projectId: ID | null }>(list: T[]) => (projectId ? list.filter((i) => i.projectId === projectId) : list)
  const t = scope(tasks)
  const k = scope(contracts)
  const c = scope(contents)
  const trx = scope(transactions)
  const base = projectId ? `/projetos/${projectId}` : ''
  const out: Insight[] = []

  const overdue = t.filter((x) => isTaskOverdue(x))
  if (overdue.length) {
    // Projeto com mais atrasos (visão geral)
    let where = ''
    if (!projectId) {
      const counts = new Map<string, number>()
      for (const x of overdue) if (x.projectId) counts.set(x.projectId, (counts.get(x.projectId) ?? 0) + 1)
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
      const name = top && projects.find((p) => p.id === top[0])?.name
      if (name) where = ` A maior parte está em ${name}.`
    }
    out.push({
      id: 'overdue',
      severity: 'danger',
      title: `${plural(overdue.length, 'tarefa atrasada', 'tarefas atrasadas')}`,
      body: `Revise prazos ou priorize: ${overdue.slice(0, 2).map((x) => `"${x.title}"`).join(', ')}.${where}`,
      action: { label: 'Ver tarefas', to: projectId ? `${base}?aba=tarefas` : '/tarefas?prazo=atrasadas' },
    })
  }

  const approval = c.filter((x) => x.status === 'aprovacao')
  if (approval.length)
    out.push({
      id: 'approval',
      severity: 'warning',
      title: `${plural(approval.length, 'conteúdo aguardando', 'conteúdos aguardando')} aprovação`,
      body: `Cobrar retorno evita atrasos na publicação: ${approval.slice(0, 2).map((x) => `"${x.title}"`).join(', ')}.`,
      action: { label: 'Ver conteúdo', to: projectId ? `${base}?aba=conteudo` : '/conteudo' },
    })

  const due = contractsDueSoon(k, 30)
  if (due.length) {
    const first = due[0]
    out.push({
      id: 'contracts',
      severity: daysFromToday(contractDueDate(first)!) <= 7 ? 'warning' : 'info',
      title: `${plural(due.length, 'contrato vence', 'contratos vencem')} nos próximos 30 dias`,
      body: `Revisar "${first.title}" (em ${daysFromToday(contractDueDate(first)!)} dias) e conversar sobre renovação.`,
      action: { label: 'Ver contrato', to: `/contratos/${first.id}` },
    })
  }

  const fin = financeSummary(trx)
  if (fin.atrasadoCents)
    out.push({
      id: 'late-income',
      severity: 'warning',
      title: `${formatCurrency(fin.atrasadoCents)} em recebimentos atrasados`,
      body: 'Vale entrar em contato com os clientes e atualizar o status dos lançamentos.',
      action: { label: 'Ver receitas', to: '/financeiro?tab=receitas' },
    })

  const month = financeSummary(inMonth(trx))
  if (month.despesaCents > month.receitaCents && month.despesaCents > 0)
    out.push({
      id: 'month-negative',
      severity: 'info',
      title: 'Despesas acima da receita neste mês',
      body: `Até agora: receita ${formatCurrency(month.receitaCents)} e despesas ${formatCurrency(month.despesaCents)}.`,
      action: { label: 'Ver financeiro', to: projectId ? `${base}?aba=financeiro` : '/financeiro' },
    })

  const today = todayISO()
  const todayTasks = t.filter((x) => x.status !== 'concluido' && x.dueDate === today)
  if (todayTasks.length && !overdue.length)
    out.push({
      id: 'today',
      severity: 'info',
      title: `${plural(todayTasks.length, 'tarefa vence', 'tarefas vencem')} hoje`,
      body: todayTasks.slice(0, 3).map((x) => x.title).join(' · '),
      action: { label: 'Ver tarefas', to: projectId ? `${base}?aba=tarefas` : '/tarefas?prazo=hoje' },
    })

  if (!out.length)
    out.push({ id: 'ok', severity: 'success', title: 'Nada urgente', body: 'Nenhum atraso, aprovação pendente ou vencimento próximo encontrado.' })
  return out
}

/** Resumo do dia (determinístico) — base do bloco "Hoje" e do briefing sem IA. */
export function todayFacts({ tasks, events, contents }: { tasks: Task[]; events: CalendarEvent[]; contents: Content[] }) {
  const today = todayISO()
  return {
    tasks: tasks.filter((t) => t.status !== 'concluido' && t.dueDate === today),
    overdue: tasks.filter((t) => isTaskOverdue(t)),
    events: events.filter((e) => e.date === today && e.status === 'agendado').sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    contents: contents.filter((c) => contentDate(c) === today && c.status !== 'publicado'),
  }
}
