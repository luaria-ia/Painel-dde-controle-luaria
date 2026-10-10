import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CalendarClock, CheckSquare, Lightbulb, Megaphone, Sun } from 'lucide-react'
import { AIGenerateCard } from '@/components/ai/AIGenerateCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { SEVERITY } from '@/config/labels'
import { formatCurrency } from '@/lib/format'
import { generateInsights, todayFacts, type Insight } from '@/lib/insights'
import { contractsDueSoon, financeSummary, isTaskOverdue } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'

/** ATENÇÃO: o que precisa de ação (atrasos, vencimentos, alertas não lidos das automações). */
export function AttentionCard() {
  const { tasks, contracts, notifications, markNotificationsRead } = useData()
  const navigate = useNavigate()
  const overdue = tasks.filter((t) => isTaskOverdue(t)).length
  const due = contractsDueSoon(contracts, 7).length
  const alerts = notifications.filter((n) => !n.readAt && (n.severity === 'danger' || n.severity === 'warning')).slice(0, 4)

  const rows = [
    overdue > 0 && { key: 'o', tone: 'text-rose-600 dark:text-rose-400', text: `${overdue} tarefa${overdue > 1 ? 's' : ''} atrasada${overdue > 1 ? 's' : ''}`, to: '/tarefas?prazo=atrasadas' },
    due > 0 && { key: 'c', tone: 'text-amber-700 dark:text-amber-400', text: `${due} contrato${due > 1 ? 's' : ''} vencendo em até 7 dias`, to: '/contratos' },
  ].filter(Boolean) as Array<{ key: string; tone: string; text: string; to: string }>

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle className={cn('h-4 w-4', rows.length || alerts.length ? 'text-rose-500' : 'text-subtle')} /> Atenção
          </span>
        }
      />
      <ul className="divide-y divide-line border-t border-line">
        {rows.map((r) => (
          <li key={r.key}>
            <Link to={r.to} className="flex items-center justify-between gap-2 px-4 py-2.5 text-[13.5px] hover:bg-surface-2/50 sm:px-5">
              <span className={cn('font-medium', r.tone)}>{r.text}</span>
              <ArrowRight className="h-3.5 w-3.5 text-subtle" />
            </Link>
          </li>
        ))}
        {alerts.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => {
                markNotificationsRead([n.id])
                if (n.link) navigate(n.link)
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-[13px] hover:bg-surface-2/50 sm:px-5"
            >
              <span className={cn('h-2 w-2 shrink-0 rounded-full', SEVERITY[n.severity].dot)} />
              <span className="min-w-0 flex-1 truncate text-muted">{n.title}</span>
            </button>
          </li>
        ))}
        {!rows.length && !alerts.length && <li className="px-4 py-4 text-[13px] text-subtle sm:px-5">Nada exigindo atenção agora. 🎉</li>}
      </ul>
    </Card>
  )
}

/** HOJE: tarefas, reuniões/eventos e conteúdos do dia. */
export function TodayCard() {
  const { tasks, events, contents } = useData()
  const f = todayFacts({ tasks, events, contents })
  const cells = [
    { icon: CheckSquare, label: 'Tarefas', value: f.tasks.length, to: '/tarefas?prazo=hoje', tone: 'text-emerald-500' },
    { icon: CalendarClock, label: 'Eventos', value: f.events.length, to: '/calendario?modo=dia', tone: 'text-sky-500' },
    { icon: Megaphone, label: 'Conteúdos', value: f.contents.length, to: '/calendario?modo=dia', tone: 'text-violet-500' },
  ]
  const next = f.events[0]
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" /> Hoje
          </span>
        }
        description={next ? `Próximo: ${next.startTime ? next.startTime + ' · ' : ''}${next.title}` : undefined}
      />
      <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
        {cells.map((c) => (
          <Link key={c.label} to={c.to} className="flex flex-col gap-1 bg-surface p-4 hover:bg-surface-2/60">
            <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
              <c.icon className={cn('h-3.5 w-3.5', c.tone)} /> {c.label}
            </span>
            <span className={cn('tabular text-xl font-semibold', c.value === 0 && 'text-subtle')}>{c.value}</span>
          </Link>
        ))}
      </div>
    </Card>
  )
}

/** BRIEFING DO DIA: resumo determinístico sempre visível + versão com IA sob demanda. */
export function DailyBriefingCard() {
  const { tasks, events, contents, transactions } = useData()
  const f = todayFacts({ tasks, events, contents })
  const fin = financeSummary(transactions)
  const items = [
    `${f.tasks.length} tarefa${f.tasks.length === 1 ? '' : 's'} para hoje`,
    `${f.overdue.length} atrasada${f.overdue.length === 1 ? '' : 's'}`,
    `${f.events.length} evento${f.events.length === 1 ? '' : 's'} hoje`,
    `${contents.filter((c) => c.status === 'aprovacao').length} conteúdo(s) em aprovação`,
    `${formatCurrency(fin.aReceberCents)} a receber`,
  ]
  return (
    <AIGenerateCard
      className="h-full"
      title="Briefing do dia"
      description="Resumo dos seus dados de hoje"
      scope={{ type: 'overview' }}
      task="daily_briefing"
      prompt="Escreva o briefing de hoje."
      buttonLabel="Gerar com IA"
      placeholder={
        <div className="text-[13.5px] text-muted">
          <p className="mb-1.5">Hoje você possui:</p>
          <ul className="list-disc space-y-0.5 pl-5">
            {items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-subtle">Use “Gerar com IA” para um resumo com sugestão de prioridade (é só uma sugestão — a decisão é sua).</p>
        </div>
      }
    />
  )
}

export function InsightRow({ insight }: { insight: Insight }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3 sm:px-5">
      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', SEVERITY[insight.severity].dot)} />
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium">{insight.title}</p>
        <p className="text-[12.5px] text-muted">{insight.body}</p>
      </div>
      {insight.action && (
        <Link to={insight.action.to} className="shrink-0 text-[12.5px] font-medium text-accent hover:underline">
          {insight.action.label}
        </Link>
      )}
    </li>
  )
}

/** INSIGHTS: sugestões baseadas nos dados (regras, sem IA). */
export function InsightsCard({ projectId, className }: { projectId?: string; className?: string }) {
  const data = useData()
  const insights = generateInsights({ ...data, projectId })
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Sugestões
          </span>
        }
        description="Baseadas nos seus dados — você decide o que fazer"
      />
      <ul className="divide-y divide-line border-t border-line">
        {insights.slice(0, 5).map((i) => (
          <InsightRow key={i.id} insight={i} />
        ))}
      </ul>
    </Card>
  )
}
