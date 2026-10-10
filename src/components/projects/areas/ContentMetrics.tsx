import { CalendarCheck, CheckCircle2, Clock, Eye, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { useBoard } from '@/hooks/useBoard'
import { dueState } from '@/lib/boards'
import { todayISO } from '@/lib/format'
import type { ID } from '@/types'
import type { BoardCard } from '@/types/boards'

function Stat({ label, value, icon: Icon, hint }: { label: string; value: number | string; icon: LucideIcon; hint?: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
      </div>
      <p className="tabular mt-3 text-xl font-semibold tracking-tight sm:text-[22px]">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-subtle">{hint}</p>}
    </div>
  )
}

function Breakdown({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <Card>
      <CardHeader title={title} />
      <div className="flex flex-col gap-2.5 px-4 pb-5 sm:px-5">
        {rows.length === 0 && <p className="text-[13px] text-subtle">Sem dados ainda.</p>}
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[110px_1fr_32px] items-center gap-3 text-[13px]">
            <span className="truncate">{k}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(v / max) * 100}%` }} />
            </div>
            <span className="tabular text-right text-muted">{v}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

const count = (cards: BoardCard[], key: string) => {
  const m = new Map<string, number>()
  for (const c of cards) {
    const v = c.fields[key]?.trim()
    if (v) m.set(v, (m.get(v) ?? 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

/** Métricas do Social Media, calculadas do workflow de Conteúdo (não é um Kanban). */
export function ContentMetrics({ boardId }: { boardId: ID }) {
  const api = useBoard(boardId)
  if (api.status === 'loading') return <div className="h-64 animate-pulse rounded-xl bg-surface-2/60" aria-busy="true" />
  if (api.status !== 'ready') return <Card className="p-5 text-[13px] text-muted">Não foi possível carregar as métricas.</Card>

  const key = (listId: ID) => api.lists.find((l) => l.id === listId)?.templateKey
  const month = todayISO().slice(0, 7)
  const published = api.cards.filter((c) => key(c.listId) === 'publicados')
  const publishedMonth = published.filter((c) => (c.fields.data_publicacao || c.completedAt || '').startsWith(month))
  const approval = api.cards.filter((c) => key(c.listId) === 'aprovacao')
  const scheduled = api.cards.filter((c) => key(c.listId) === 'agendados')
  const inProgress = api.cards.filter((c) => !['publicados', 'ideias'].includes(key(c.listId) ?? ''))
  const late = api.cards.filter((c) => dueState(c) === 'overdue')
  const byStage = api.lists.map((l) => [`${l.icon} ${l.name}`, api.cards.filter((c) => c.listId === l.id).length] as [string, number])

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Indicadores de conteúdo" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Publicados no mês" value={publishedMonth.length} icon={CheckCircle2} hint={`${published.length} no total`} />
        <Stat label="Agendados" value={scheduled.length} icon={CalendarCheck} />
        <Stat label="Em aprovação" value={approval.length} icon={Eye} hint="aguardando o cliente" />
        <Stat label="Em produção" value={inProgress.length} icon={Layers} hint="planejamento → agendados" />
        <Stat label="Atrasados" value={late.length} icon={Clock} hint="prazo vencido" />
      </section>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Breakdown title="Por etapa" rows={byStage} />
        <Breakdown title="Por formato" rows={count(api.cards, 'formato')} />
        <Breakdown title="Por pilar" rows={count(api.cards, 'pilar')} />
      </div>
      <p className="text-[12.5px] text-subtle">Métricas de alcance e engajamento do Instagram poderão ser ligadas aqui numa próxima versão.</p>
    </div>
  )
}
