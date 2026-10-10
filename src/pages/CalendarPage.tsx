import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAgendaDetails } from '@/components/calendar/AgendaDetails'
import { AgendaRow, KindLegend } from '@/components/calendar/AgendaItem'
import { KIND_STYLE } from '@/components/calendar/kindStyle'
import { CalendarView } from '@/components/calendar/CalendarView'
import { rangeTitle, visibleRange, type CalendarMode } from '@/lib/calendar'
import { EventFormModal } from '@/components/events/EventFormModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { LOCALE } from '@/config/app'
import { addDays, parseISODate, todayISO, toISODate } from '@/lib/format'
import { buildAgenda, type AgendaKind } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ISODate } from '@/types'

const MODES: CalendarMode[] = ['mes', 'semana', 'dia']

function shift(mode: CalendarMode, cursor: ISODate, dir: 1 | -1): ISODate {
  if (mode === 'dia') return addDays(cursor, dir)
  if (mode === 'semana') return addDays(cursor, 7 * dir)
  const d = parseISODate(cursor)
  return toISODate(new Date(d.getFullYear(), d.getMonth() + dir, 1))
}

export function CalendarPage() {
  const { tasks, events, contents, projects } = useData()
  const [params, setParams] = useSearchParams()
  const mode: CalendarMode = MODES.includes(params.get('modo') as CalendarMode) ? (params.get('modo') as CalendarMode) : 'mes'
  const cursor: ISODate = /^\d{4}-\d{2}-\d{2}$/.test(params.get('data') ?? '') ? params.get('data')! : todayISO()

  const [selectedDay, setSelectedDay] = useState<ISODate>(cursor)
  const [projectId, setProjectId] = useState('')
  const [kinds, setKinds] = useState<Record<AgendaKind, boolean>>({ task: true, event: true, content: true })
  const [hideDone, setHideDone] = useState(false)
  const [creatingOn, setCreatingOn] = useState<ISODate | null>(null)
  const details = useAgendaDetails()

  const go = (next: Partial<{ modo: CalendarMode; data: ISODate }>) => {
    const p = new URLSearchParams(params)
    if (next.modo) p.set('modo', next.modo)
    if (next.data) p.set('data', next.data)
    setParams(p, { replace: true })
    if (next.data) setSelectedDay(next.data)
  }

  // Busca um intervalo que cobre a visão atual e o dia selecionado.
  const { from, to } = visibleRange(mode, cursor)
  const all = buildAgenda({ tasks, events, contents }, from < selectedDay ? from : selectedDay, to > selectedDay ? to : selectedDay).filter(
    (i) => kinds[i.kind] && (!projectId || i.projectId === projectId) && (!hideDone || !i.done),
  )
  const visible = all.filter((i) => i.date >= from && i.date <= to)
  const dayItems = all.filter((i) => i.date === selectedDay)

  const toggleKind = (k: AgendaKind) => setKinds((s) => ({ ...s, [k]: !s[k] }))

  return (
    <div>
      <PageHeader
        title="Calendário"
        description="Prazos de tarefas, eventos e publicações de conteúdo em um só lugar."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreatingOn(mode === 'mes' ? selectedDay : cursor)}>
            Novo evento
          </Button>
        }
      />

      {/* Barra de navegação */}
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => go({ data: todayISO() })}>
            Hoje
          </Button>
          <div className="flex">
            <Button size="icon" variant="ghost" icon={ChevronLeft} aria-label="Anterior" onClick={() => go({ data: shift(mode, cursor, -1) })} />
            <Button size="icon" variant="ghost" icon={ChevronRight} aria-label="Próximo" onClick={() => go({ data: shift(mode, cursor, 1) })} />
          </div>
          <h2 className="text-base font-semibold first-letter:uppercase sm:text-lg">{rangeTitle(mode, cursor)}</h2>
        </div>
        <Segmented
          ariaLabel="Visualização"
          value={mode}
          onChange={(m) => go({ modo: m, data: m === 'dia' ? selectedDay : cursor })}
          options={[
            { value: 'mes', label: 'Mês' },
            { value: 'semana', label: 'Semana' },
            { value: 'dia', label: 'Dia' },
          ]}
        />
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(KIND_STYLE) as AgendaKind[]).map((k) => {
          const Icon = KIND_STYLE[k].icon
          return (
            <button
              key={k}
              type="button"
              aria-pressed={kinds[k]}
              onClick={() => toggleKind(k)}
              className={cn(
                'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[13px] transition-colors',
                kinds[k] ? 'border-line-strong bg-surface text-fg shadow-card' : 'border-dashed border-line text-subtle',
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', kinds[k] ? KIND_STYLE[k].text : 'text-subtle')} />
              {KIND_STYLE[k].label}s
            </button>
          )
        })}
        <Select compact aria-label="Projeto" value={projectId} placeholder="Todos os projetos" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />
        <label className="inline-flex h-8 cursor-pointer items-center gap-2 px-1 text-[13px] text-muted select-none">
          <input type="checkbox" className="accent-[var(--accent)]" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          Ocultar concluídos
        </label>
      </div>

      <div className={cn('grid grid-cols-1 gap-4', mode !== 'dia' && 'xl:grid-cols-[1fr_320px]')}>
        <Card className="overflow-hidden">
          <CalendarView
            mode={mode}
            cursor={cursor}
            items={visible}
            selectedDay={selectedDay}
            onSelectDay={(d) => (mode === 'semana' ? go({ modo: 'dia', data: d }) : setSelectedDay(d))}
            onOpenItem={details.open}
          />
        </Card>

        {mode !== 'dia' && (
          <Card className="h-fit overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
              <h3 className="text-sm font-semibold first-letter:uppercase">
                {parseISODate(selectedDay).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'short' })}
              </h3>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setCreatingOn(selectedDay)}>
                Evento
              </Button>
            </div>
            {dayItems.length ? (
              <div className="divide-y divide-line">
                {dayItems.map((i) => (
                  <AgendaRow key={`${i.kind}-${i.id}`} item={i} onClick={() => details.open(i)} />
                ))}
              </div>
            ) : (
              <EmptyState compact icon={CalendarDays} title="Nada neste dia" />
            )}
          </Card>
        )}
      </div>

      <KindLegend className="mt-4" />

      {details.modals}
      <EventFormModal open={!!creatingOn} defaults={{ date: creatingOn ?? undefined, projectId: projectId || null }} onClose={() => setCreatingOn(null)} />
    </div>
  )
}
