import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Brain, LayoutGrid, SquarePlus, CalendarClock, CheckCircle2, FileSignature, FolderPlus, History, Megaphone, Plus, UserPlus, Zap, type LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { LOCALE } from '@/config/app'
import { daysFromToday, toISODate } from '@/lib/format'
import { useData } from '@/store/useData'
import type { ActivityLog, ID } from '@/types'

const ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  task_created: { icon: Plus, tone: 'text-subtle' },
  task_completed: { icon: CheckCircle2, tone: 'text-emerald-500' },
  project_created: { icon: FolderPlus, tone: 'text-accent' },
  client_created: { icon: UserPlus, tone: 'text-sky-500' },
  income_created: { icon: ArrowUpRight, tone: 'text-emerald-500' },
  expense_created: { icon: ArrowDownRight, tone: 'text-rose-500' },
  contract_created: { icon: FileSignature, tone: 'text-sky-500' },
  content_created: { icon: Megaphone, tone: 'text-violet-500' },
  content_published: { icon: Megaphone, tone: 'text-emerald-500' },
  event_created: { icon: CalendarClock, tone: 'text-sky-500' },
  knowledge_created: { icon: Brain, tone: 'text-accent' },
  automation: { icon: Zap, tone: 'text-amber-500' },
  board_created: { icon: LayoutGrid, tone: 'text-accent' },
  card_created: { icon: SquarePlus, tone: 'text-subtle' },
  card_moved: { icon: ArrowRightLeft, tone: 'text-sky-500' },
}

function dayLabel(iso: string) {
  const local = new Date(iso)
  const diff = daysFromToday(toISODate(local))
  if (diff === 0) return 'Hoje'
  if (diff === -1) return 'Ontem'
  return local.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: diff < -300 ? 'numeric' : undefined })
}

/** Linha do tempo de atividades (registradas automaticamente pelo banco). */
export function ActivityFeed({ projectId, clientId, limit = 20 }: { projectId?: ID; clientId?: ID; limit?: number }) {
  const { listActivity, tasks, transactions, contents } = useData()
  const [logs, setLogs] = useState<ActivityLog[] | null>(null)
  // Recarrega quando os dados mudam (ex.: tarefa concluída em outra parte da tela).
  const version = tasks.length + transactions.length + contents.length + tasks.filter((t) => t.status === 'concluido').length

  useEffect(() => {
    let alive = true
    listActivity({ projectId, clientId, limit })
      .then((l) => alive && setLogs(l))
      .catch(() => alive && setLogs([]))
    return () => {
      alive = false
    }
  }, [listActivity, projectId, clientId, limit, version])

  if (logs === null) return <div className="h-24 animate-pulse rounded-lg bg-surface-2/60" />
  if (!logs.length) return <EmptyState compact icon={History} title="Sem atividade registrada ainda" />

  const labels = logs.map((l) => dayLabel(l.createdAt))
  return (
    <ol className="flex flex-col">
      {logs.map((l, i) => {
        const label = labels[i]
        const header = label !== labels[i - 1] ? label : null
        const { icon: Icon, tone } = ICONS[l.type] ?? { icon: History, tone: 'text-subtle' }
        return (
          <li key={l.id}>
            {header && <p className="px-4 pt-3 pb-1 text-[11px] font-medium tracking-wide text-subtle uppercase sm:px-5">{header}</p>}
            <div className="flex items-start gap-2.5 px-4 py-1.5 text-[13px] sm:px-5">
              <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tone}`} />
              <span className="min-w-0 flex-1 text-muted">{l.description}</span>
              <span className="tabular shrink-0 text-[11.5px] text-subtle">{new Date(l.createdAt).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
