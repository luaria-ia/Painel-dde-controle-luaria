import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { visibleRange, WEEKDAYS, type CalendarMode } from '@/lib/calendar'
import { addDays, parseISODate, todayISO } from '@/lib/format'
import type { AgendaItem } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import type { ISODate } from '@/types'
import { AgendaChip, AgendaRow } from './AgendaItem'

function groupByDate(items: AgendaItem[]) {
  const map = new Map<ISODate, AgendaItem[]>()
  for (const i of items) map.set(i.date, [...(map.get(i.date) ?? []), i])
  return map
}

interface Props {
  mode: CalendarMode
  cursor: ISODate
  items: AgendaItem[]
  selectedDay: ISODate
  onSelectDay: (d: ISODate) => void
  onOpenItem: (i: AgendaItem) => void
}

export function CalendarView({ mode, cursor, items, selectedDay, onSelectDay, onOpenItem }: Props) {
  const { from } = visibleRange(mode, cursor)
  const byDate = groupByDate(items)
  const today = todayISO()

  if (mode === 'dia') {
    const list = byDate.get(cursor) ?? []
    return list.length ? (
      <div className="divide-y divide-line">
        {list.map((i) => (
          <AgendaRow key={`${i.kind}-${i.id}`} item={i} onClick={() => onOpenItem(i)} />
        ))}
      </div>
    ) : (
      <EmptyState compact icon={CalendarDays} title="Nada neste dia" description="Tarefas com prazo, eventos e conteúdos com data aparecem aqui." />
    )
  }

  if (mode === 'semana') {
    const days = Array.from({ length: 7 }, (_, i) => addDays(from, i))
    return (
      <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-7 md:divide-x md:divide-y-0">
        {days.map((day) => {
          const list = byDate.get(day) ?? []
          const d = parseISODate(day)
          return (
            <div key={day} className={cn('flex min-h-24 flex-col md:min-h-80', day === today && 'bg-accent-soft/40')}>
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className="flex cursor-pointer items-baseline gap-1.5 px-3 pt-2.5 pb-1.5 text-left md:flex-col md:items-start md:gap-0"
              >
                <span className="text-[11px] font-medium tracking-wide text-subtle uppercase">{WEEKDAYS[d.getDay()]}</span>
                <span className={cn('tabular text-lg font-semibold', day === today && 'text-accent')}>{d.getDate()}</span>
              </button>
              <div className="flex flex-col gap-1 px-2 pb-2.5">
                {list.map((i) => (
                  <AgendaChip key={`${i.kind}-${i.id}`} item={i} onClick={() => onOpenItem(i)} />
                ))}
                {list.length === 0 && <span className="hidden px-1 text-[11.5px] text-subtle md:block">—</span>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Mês
  const month = parseISODate(cursor).getMonth()
  const days = Array.from({ length: 42 }, (_, i) => addDays(from, i))
  return (
    <div>
      <div className="grid grid-cols-7 border-b border-line">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-1 py-2 text-center text-[11px] font-medium tracking-wide text-subtle uppercase sm:px-2 sm:text-left">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const d = parseISODate(day)
          const list = byDate.get(day) ?? []
          const outside = d.getMonth() !== month
          const selected = day === selectedDay
          return (
            <div
              key={day}
              role="button"
              tabIndex={0}
              aria-label={`${d.getDate()}: ${list.length} itens`}
              aria-pressed={selected}
              onClick={() => onSelectDay(day)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectDay(day)}
              className={cn(
                'flex min-h-14 cursor-pointer flex-col gap-1 border-line p-1 transition-colors outline-none hover:bg-surface-2/50 focus-visible:bg-surface-2 sm:min-h-24 sm:p-1.5 lg:min-h-28',
                idx % 7 !== 6 && 'border-r',
                idx < 35 && 'border-b',
                outside && 'bg-surface-2/30',
                selected && 'bg-accent-soft ring-1 ring-accent/40 ring-inset',
              )}
            >
              <span
                className={cn(
                  'tabular flex h-6 w-6 items-center justify-center self-center rounded-full text-[12.5px] sm:self-start',
                  outside ? 'text-subtle' : 'text-fg',
                  day === today && 'bg-accent font-semibold text-accent-fg',
                )}
              >
                {d.getDate()}
              </span>
              {/* Celular: pontinhos; telas maiores: pílulas */}
              <div className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                {list.slice(0, 4).map((i) => (
                  <span
                    key={`${i.kind}-${i.id}`}
                    className={cn('h-1.5 w-1.5 rounded-full', i.kind === 'task' ? 'bg-emerald-500' : i.kind === 'event' ? 'bg-sky-500' : 'bg-violet-500')}
                  />
                ))}
              </div>
              <div className="hidden flex-col gap-0.5 sm:flex">
                {list.slice(0, 3).map((i) => (
                  <AgendaChip key={`${i.kind}-${i.id}`} item={i} onClick={() => onOpenItem(i)} />
                ))}
                {list.length > 3 && <span className="px-1.5 text-[11px] font-medium text-muted">+{list.length - 3} mais</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
