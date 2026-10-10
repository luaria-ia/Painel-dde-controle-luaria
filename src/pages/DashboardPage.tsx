import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CalendarDays, CircleDashed, CircleDot, Clock, FileSignature, FolderKanban, Megaphone, Plus, TrendingDown, TrendingUp, Wallet, CheckCircle2 } from 'lucide-react'
import { useAgendaDetails } from '@/components/calendar/AgendaDetails'
import { AgendaRow } from '@/components/calendar/AgendaItem'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { DemoBanner } from '@/components/common/DemoBanner'
import { AttentionCard, DailyBriefingCard, InsightsCard, TodayCard } from '@/components/dashboard/SmartBlocks'
import { ContractDueAlert } from '@/components/contracts/ContractList'
import { ProjectLink } from '@/components/common/EntityLinks'
import { DueDate } from '@/components/common/DueDate'
import { FinancialCard } from '@/components/finance/FinancialCard'
import { TransactionFormModal } from '@/components/finance/TransactionFormModal'
import { ContentFormModal } from '@/components/contents/ContentFormModal'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Menu } from '@/components/ui/Menu'
import { CONTENT_STATUS, TASK_PRIORITY } from '@/config/labels'
import { useTaskActions } from '@/hooks/useTaskActions'
import { LOCALE } from '@/config/app'
import { addDays, formatCurrency, todayISO } from '@/lib/format'
import { buildAgenda, contractSummary, contractsDueSoon, financeSummary, inMonth, taskCounts, upcomingTasks } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { Task } from '@/types'

export function DashboardPage() {
  const { settings, projects, tasks, transactions, events, contents, contracts } = useData()
  const actions = useTaskActions()
  const [newProject, setNewProject] = useState(false)
  const [newTask, setNewTask] = useState(false)
  const [newClient, setNewClient] = useState(false)
  const [newTransaction, setNewTransaction] = useState(false)
  const [newContent, setNewContent] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const month = financeSummary(inMonth(transactions))
  const all = financeSummary(transactions)
  const counts = taskCounts(tasks)
  const details = useAgendaDetails()
  // Próximos 7 dias: eventos e conteúdos (as tarefas já têm o bloco "Próximas tarefas").
  const agenda = buildAgenda({ tasks: [], events, contents }, todayISO(), addDays(todayISO(), 7)).filter((i) => !i.done)
  const csum = contractSummary(contracts)
  const dueContracts = contractsDueSoon(contracts)
  const contentCount = (s: keyof typeof CONTENT_STATUS) => contents.filter((c) => c.status === s).length
  const upcoming = upcomingTasks(tasks, 6)
  const activeProjects = projects.filter((p) => p.status === 'ativo')
  const monthName = new Date().toLocaleDateString(LOCALE, { month: 'long' })
  const today = new Date().toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[13px] text-subtle first-letter:uppercase">{today}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Olá, {settings.userName || 'você'} 👋</h1>
          <p className="mt-1 text-sm text-muted">
            {counts.pendentes === 0
              ? 'Nenhuma tarefa pendente. Bom momento para planejar o próximo passo.'
              : `Você tem ${counts.pendentes} tarefa${counts.pendentes > 1 ? 's' : ''} pendente${counts.pendentes > 1 ? 's' : ''}${counts.atrasadas ? `, ${counts.atrasadas} atrasada${counts.atrasadas > 1 ? 's' : ''}` : ''}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button icon={Plus} onClick={() => setNewProject(true)}>
            Novo projeto
          </Button>
          <Button icon={Plus} onClick={() => setNewTask(true)} variant="primary">
            Nova tarefa
          </Button>
          <Menu
            trigger={<Button icon={Plus}>Mais</Button>}
            items={[
              { label: 'Novo cliente', onSelect: () => setNewClient(true) },
              { label: 'Nova receita / despesa', onSelect: () => setNewTransaction(true) },
              { label: 'Novo conteúdo', onSelect: () => setNewContent(true) },
            ]}
          />
        </div>
      </div>

      <DemoBanner />

      {/* Financeiro do mês */}
      <section aria-label="Resumo financeiro do mês" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FinancialCard label="Receita do mês" cents={month.receitaCents} icon={TrendingUp} tone="positive" hint={<span className="capitalize">{monthName} · recebido</span>} />
        <FinancialCard label="Despesas do mês" cents={month.despesaCents} icon={TrendingDown} tone="negative" hint={<span className="capitalize">{monthName} · pago</span>} />
        <FinancialCard label="Saldo" cents={month.saldoCents} icon={Wallet} signed hint="Receita − despesas do mês" />
        <FinancialCard
          label="A receber"
          cents={all.aReceberCents}
          icon={Clock}
          tone="warning"
          hint={all.atrasadoCents > 0 ? <span className="text-rose-600 dark:text-rose-400">dos quais atrasado: {formatCurrency(all.atrasadoCents)}</span> : 'Pendentes e atrasados'}
        />
      </section>

      {/* V3 — Atenção / Hoje / Briefing / Sugestões */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <AttentionCard />
        <TodayCard />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DailyBriefingCard />
        </div>
        <InsightsCard className="lg:col-span-2" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Próximas tarefas */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Próximas tarefas"
            description="Não concluídas, ordenadas por prazo"
            action={
              <Link to="/tarefas" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-fg">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState compact icon={CheckCircle2} title="Tudo em dia" description="Nenhuma tarefa pendente." action={<Button size="sm" icon={Plus} onClick={() => setNewTask(true)}>Nova tarefa</Button>} />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {upcoming.map((t) => (
                <li
                  key={t.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2/50 sm:px-5"
                  onClick={() => setEditingTask(t)}
                >
                  <TaskCheckbox task={t} onToggle={() => actions.toggleDone(t)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{t.title}</p>
                    <div className="mt-0.5 flex items-center gap-3">
                      <ProjectLink id={t.projectId} className="text-[12px]" />
                    </div>
                  </div>
                  <span className="hidden xl:inline">
                    <Badge tone={TASK_PRIORITY[t.priority].tone}>{TASK_PRIORITY[t.priority].label}</Badge>
                  </span>
                  <DueDate task={t} className="shrink-0 justify-end text-right text-[12px]" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Resumo das tarefas */}
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader title="Resumo das tarefas" description={`${counts.total} no total`} />
          <div className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-b-xl border-t border-line bg-line">
            <TaskStat label="A fazer" value={counts.aFazer} icon={CircleDashed} to="/tarefas?status=a_fazer" />
            <TaskStat label="Em andamento" value={counts.emAndamento} icon={CircleDot} tone="text-sky-500" to="/tarefas?status=em_andamento" />
            <TaskStat label="Concluídas" value={counts.concluidas} icon={CheckCircle2} tone="text-emerald-500" to="/tarefas?status=concluido" />
            <TaskStat
              label="Atrasadas"
              value={counts.atrasadas}
              icon={AlertTriangle}
              tone={counts.atrasadas ? 'text-rose-500' : undefined}
              highlight={counts.atrasadas > 0}
              to="/tarefas?prazo=atrasadas"
            />
          </div>
        </Card>
      </div>

      {/* Agenda + contratos + conteúdo (V2) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader
            title="Próximos eventos"
            description="Reuniões, compromissos e publicações dos próximos 7 dias"
            action={
              <Link to="/calendario" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-fg">
                Calendário <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {agenda.length ? (
            <div className="divide-y divide-line border-t border-line">
              {agenda.slice(0, 6).map((i) => (
                <AgendaRow key={`${i.kind}-${i.id}`} item={i} onClick={() => details.open(i)} />
              ))}
            </div>
          ) : (
            <EmptyState compact icon={CalendarDays} title="Agenda livre" description="Nenhum evento ou publicação nos próximos 7 dias." />
          )}
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader
              title="Contratos"
              action={
                <Link to="/contratos" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-fg">
                  Ver <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
              <Link to="/contratos?status=ativo" className="flex flex-col gap-1 bg-surface p-4 hover:bg-surface-2/60">
                <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
                  <FileSignature className="h-3.5 w-3.5 text-subtle" /> Ativos
                </span>
                <span className="tabular text-xl font-semibold">{csum.ativos}</span>
              </Link>
              <Link to="/contratos" className="flex flex-col gap-1 bg-surface p-4 hover:bg-surface-2/60">
                <span className="text-[12.5px] text-muted">Recorrente/mês</span>
                <span className="tabular text-xl font-semibold">{formatCurrency(csum.mrrCents)}</span>
              </Link>
            </div>
            {dueContracts.length > 0 && (
              <ul className="divide-y divide-line border-t border-line">
                {dueContracts.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <Link to={`/contratos/${c.id}`} className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-surface-2/50 sm:px-5">
                      <span className="min-w-0 truncate text-[13px]">{c.title}</span>
                      <ContractDueAlert contract={c} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Conteúdo"
              action={
                <Link to="/conteudo" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-fg">
                  Kanban <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
              {(['producao', 'aprovacao', 'agendado'] as const).map((s) => (
                <Link key={s} to={`/conteudo?status=${s}&view=lista`} className="flex flex-col gap-1 bg-surface p-4 hover:bg-surface-2/60">
                  <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
                    <span className={cn('h-1.5 w-1.5 rounded-full', CONTENT_STATUS[s].dot)} />
                    {CONTENT_STATUS[s].label}
                  </span>
                  <span className={cn('tabular text-xl font-semibold', contentCount(s) === 0 && 'text-subtle')}>{contentCount(s)}</span>
                </Link>
              ))}
            </div>
            {contents.length === 0 && (
              <p className="flex items-center gap-2 border-t border-line px-4 py-3 text-[12.5px] text-subtle sm:px-5">
                <Megaphone className="h-3.5 w-3.5" /> Planeje posts, reels e vídeos no módulo Conteúdo.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Projetos ativos */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Projetos ativos <span className="ml-1 font-normal text-subtle tabular">{activeProjects.length}</span>
          </h2>
          <Link to="/projetos" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-fg">
            Todos os projetos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <Card>
            <EmptyState
              icon={FolderKanban}
              title="Você ainda não possui projetos ativos."
              description="Crie seu primeiro projeto para começar."
              action={<Button variant="primary" icon={Plus} onClick={() => setNewProject(true)}>Criar projeto</Button>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <ProjectFormModal open={newProject} onClose={() => setNewProject(false)} goToCreated />
      <TaskFormModal open={newTask} onClose={() => setNewTask(false)} />
      <ClientFormModal open={newClient} onClose={() => setNewClient(false)} />
      <TransactionFormModal open={newTransaction} onClose={() => setNewTransaction(false)} />
      <ContentFormModal open={newContent} onClose={() => setNewContent(false)} />
      {details.modals}
      <TaskFormModal open={!!editingTask} task={editingTask} onClose={() => setEditingTask(null)} />
    </div>
  )
}

function TaskStat({
  label,
  value,
  icon: Icon,
  tone,
  highlight,
  to,
}: {
  label: string
  value: number
  icon: typeof Clock
  tone?: string
  highlight?: boolean
  to: string
}) {
  return (
    <Link to={to} className={cn('group flex flex-col gap-3 bg-surface p-4 transition-colors hover:bg-surface-2/60 sm:p-5', highlight && 'bg-rose-500/[0.03]')}>
      <span className="flex items-center gap-1.5 text-[13px] text-muted">
        <Icon className={cn('h-3.5 w-3.5', tone ?? 'text-subtle')} />
        {label}
      </span>
      <span className={cn('tabular text-2xl font-semibold tracking-tight', value === 0 && 'text-subtle', highlight && 'text-rose-600 dark:text-rose-400')}>
        {value}
      </span>
    </Link>
  )
}
