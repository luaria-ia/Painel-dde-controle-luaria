import { AUTOMATION_TRIGGER } from '@/config/labels'
import { addDays, daysFromToday, formatCurrency, todayISO } from '@/lib/format'
import { contractDueDate, contractsDueSoon, isTaskOverdue } from '@/lib/selectors'
import {
  activityRepository,
  automationRepository,
  automationRunRepository,
  contentRepository,
  notificationRepository,
  taskRepository,
} from '@/repositories'
import type { Automation, AutomationTrigger, Content, Contract, ID, Project, Task, Transaction } from '@/types'

/**
 * Motor de automações: QUANDO (gatilho) → CONDIÇÕES → AÇÃO.
 *
 * - Gatilhos de "evento" são emitidos pelo DataProvider após uma ação do usuário.
 * - Gatilhos de "estado" (atraso, vencimento, aprovação) são verificados por varredura.
 * - Antes de agir, a execução é "reivindicada" em automation_runs (chave única no banco):
 *   a mesma regra nunca age duas vezes sobre o mesmo item, nem com várias abas abertas.
 * - As ações usam os repositórios diretamente e NÃO emitem novos eventos (sem cascatas/loops).
 * - Nenhuma ação é destrutiva: só cria alertas/tarefas/registros ou preenche um campo vazio.
 *
 * Preparado para V3+: uma ação futura do tipo "pedir recomendação à IA" entraria em `execute`,
 * gerando uma sugestão que o usuário aprova antes de qualquer alteração.
 */

export type AutomationEvent =
  | { type: 'task_created' | 'task_completed'; task: Task }
  | { type: 'content_published'; content: Content }
  | { type: 'income_created' | 'expense_created'; transaction: Transaction }

export interface EngineData {
  automations: Automation[]
  tasks: Task[]
  contracts: Contract[]
  contents: Content[]
  projects: Project[]
}

/** Item alvo normalizado (o que a ação precisa saber). */
interface Target {
  key: string
  entity: 'task' | 'contract' | 'content' | 'transaction'
  id: ID
  title: string
  projectId: ID | null
  clientId: ID | null
  link: string
  vars: Record<string, string>
  priority?: Task['priority']
  amountCents?: number
  content?: Content
}

const render = (template: string, vars: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')

function taskTarget(t: Task, projects: Project[], suffix = ''): Target {
  const project = projects.find((p) => p.id === t.projectId)
  return {
    key: `task:${t.id}${suffix}`,
    entity: 'task',
    id: t.id,
    title: t.title,
    projectId: t.projectId,
    clientId: t.clientId,
    link: t.projectId ? `/projetos/${t.projectId}?aba=tarefas` : '/tarefas',
    vars: { titulo: t.title, projeto: project?.name ?? 'sem projeto' },
    priority: t.priority,
  }
}

function contentTarget(c: Content, projects: Project[]): Target {
  return {
    key: `content:${c.id}`,
    entity: 'content',
    id: c.id,
    title: c.title,
    projectId: c.projectId,
    clientId: c.clientId,
    link: c.projectId ? `/projetos/${c.projectId}?aba=conteudo` : '/conteudo',
    vars: { titulo: c.title, projeto: projects.find((p) => p.id === c.projectId)?.name ?? 'sem projeto' },
    content: c,
  }
}

function matches(a: Automation, t: Target): boolean {
  const c = a.conditions ?? {}
  if (c.projectId && t.projectId !== c.projectId) return false
  if (c.priority && t.priority && t.priority !== c.priority) return false
  if (c.minAmountCents && (t.amountCents ?? 0) < c.minAmountCents) return false
  return true
}

async function execute(a: Automation, t: Target): Promise<boolean> {
  // Reivindica primeiro: se já rodou para este item, não faz nada.
  if (!(await automationRunRepository.claim(a.id, t.key))) return false
  const action = a.action
  switch (action.type) {
    case 'notify':
      await notificationRepository.create({
        severity: action.severity ?? 'info',
        title: render(action.message || `${AUTOMATION_TRIGGER[a.trigger].label}: {titulo}`, t.vars),
        body: `Regra: ${a.name}`,
        link: t.link,
        entity: t.entity,
        entityId: t.id,
        automationId: a.id,
        dedupeKey: `${a.id}:${t.key}`,
      })
      break
    case 'create_task':
      await taskRepository.create({
        title: render(action.taskTitle || 'Acompanhar: {titulo}', t.vars).slice(0, 140),
        description: `Criada automaticamente pela regra "${a.name}".`,
        projectId: t.projectId,
        clientId: t.clientId,
        status: 'a_fazer',
        priority: action.taskPriority ?? 'media',
        dueDate: addDays(todayISO(), action.dueInDays ?? 1),
        completedAt: null,
      })
      break
    case 'set_publish_date':
      if (t.content && !t.content.publishDate) await contentRepository.update(t.id, { publishDate: todayISO() })
      break
    case 'log':
      await activityRepository.add({
        type: 'automation',
        entity: t.entity,
        entityId: t.id,
        description: render(action.message || `Regra "${a.name}": {titulo}`, t.vars),
        projectId: t.projectId,
        clientId: t.clientId,
      })
      break
  }
  return true
}

async function runFor(automations: Automation[], trigger: AutomationTrigger, targets: Target[]): Promise<number> {
  let count = 0
  for (const a of automations.filter((x) => x.enabled && x.trigger === trigger)) {
    let ran = 0
    for (const t of targets) {
      if (!matches(a, t)) continue
      try {
        if (await execute(a, t)) ran++
      } catch (err) {
        console.warn(`[automação] "${a.name}" falhou para ${t.key}`, err)
      }
    }
    if (ran) {
      count += ran
      await automationRepository.update(a.id, { lastRunAt: new Date().toISOString() }).catch(() => undefined)
    }
  }
  return count
}

/** Processa um evento (ex.: tarefa concluída). Retorna quantas ações foram executadas. */
export async function runEvent(data: EngineData, event: AutomationEvent): Promise<number> {
  const { automations, projects } = data
  switch (event.type) {
    case 'task_created':
    case 'task_completed':
      return runFor(automations, event.type, [taskTarget(event.task, projects, event.type === 'task_completed' ? ':done' : '')])
    case 'content_published':
      return runFor(automations, 'content_published', [{ ...contentTarget(event.content, projects), key: `content:${event.content.id}:pub` }])
    case 'income_created':
    case 'expense_created': {
      const t = event.transaction
      return runFor(automations, event.type, [
        {
          key: `trx:${t.id}`,
          entity: 'transaction',
          id: t.id,
          title: t.description,
          projectId: t.projectId,
          clientId: t.clientId,
          link: t.type === 'receita' ? '/financeiro?tab=receitas' : '/financeiro?tab=despesas',
          vars: { titulo: t.description, valor: formatCurrency(t.amountCents), projeto: projects.find((p) => p.id === t.projectId)?.name ?? 'geral' },
          amountCents: t.amountCents,
        },
      ])
    }
  }
}

/** Verifica gatilhos de estado (atrasos, vencimentos, aprovações). */
export async function runScan(data: EngineData): Promise<number> {
  const { automations, tasks, contracts, contents, projects } = data
  const active = automations.filter((a) => a.enabled && AUTOMATION_TRIGGER[a.trigger].kind === 'state')
  if (!active.length) return 0
  let count = 0

  // Tarefa atrasada: a chave inclui o prazo — se o prazo mudar e atrasar de novo, alerta de novo.
  const overdue = tasks.filter((t) => isTaskOverdue(t)).map((t) => taskTarget(t, projects, `:${t.dueDate}`))
  count += await runFor(active, 'task_overdue', overdue)

  // Contrato: cada regra tem sua antecedência (padrão 30 dias).
  for (const a of active.filter((x) => x.trigger === 'contract_due')) {
    const days = a.conditions.days ?? 30
    const targets: Target[] = contractsDueSoon(contracts, days).map((c) => {
      const due = contractDueDate(c)!
      return {
        key: `contract:${c.id}:${due}`,
        entity: 'contract',
        id: c.id,
        title: c.title,
        projectId: c.projectId,
        clientId: c.clientId,
        link: `/contratos/${c.id}`,
        vars: { titulo: c.title, dias: String(daysFromToday(due)), projeto: projects.find((p) => p.id === c.projectId)?.name ?? '' },
      }
    })
    count += await runFor([a], 'contract_due', targets)
  }

  const approval = contents.filter((c) => c.status === 'aprovacao').map((c) => contentTarget(c, projects))
  count += await runFor(active, 'content_approval', approval)
  return count
}
