import { Badge } from '@/components/ui/Badge'
import { CONTENT_STATUS, CONTENT_TYPE, EVENT_STATUS, EVENT_TYPE, PROJECT_COLORS, TASK_PRIORITY, TASK_STATUS } from '@/config/labels'
import type { AgendaItem, AgendaKind } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import { KIND_STYLE } from './kindStyle'

/** Pílula compacta (células do mês / colunas da semana). */
export function AgendaChip({ item, onClick }: { item: AgendaItem; onClick: () => void }) {
  const style = KIND_STYLE[item.kind]
  const Icon = style.icon
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={`${style.label}: ${item.title}`}
      className={cn(
        'flex w-full cursor-pointer items-center gap-1 rounded-[5px] border-l-2 px-1.5 py-0.5 text-left text-[11.5px] leading-tight transition-colors hover:brightness-95 dark:hover:brightness-125',
        style.chip,
        item.done && 'opacity-55',
      )}
    >
      <Icon className={cn('h-3 w-3 shrink-0', style.text)} />
      {item.time && <span className="tabular shrink-0 text-subtle">{item.time}</span>}
      <span className={cn('truncate', item.done && 'line-through')}>{item.title}</span>
    </button>
  )
}

/** Detalhes de status/prioridade conforme o tipo. */
function ItemMeta({ item }: { item: AgendaItem }) {
  if (item.task)
    return (
      <>
        <Badge tone={TASK_STATUS[item.task.status].tone}>{TASK_STATUS[item.task.status].label}</Badge>
        <Badge tone={TASK_PRIORITY[item.task.priority].tone}>{TASK_PRIORITY[item.task.priority].label}</Badge>
      </>
    )
  if (item.event)
    return (
      <>
        <Badge tone={EVENT_TYPE[item.event.type].tone}>{EVENT_TYPE[item.event.type].label}</Badge>
        <Badge tone={EVENT_STATUS[item.event.status].tone}>{EVENT_STATUS[item.event.status].label}</Badge>
      </>
    )
  if (item.content)
    return (
      <>
        <Badge tone="neutral">{CONTENT_TYPE[item.content.type].label}</Badge>
        <Badge tone={CONTENT_STATUS[item.content.status].tone}>{CONTENT_STATUS[item.content.status].label}</Badge>
      </>
    )
  return null
}

/** Linha completa (agenda do dia, listas). Mostra título, projeto, status e prioridade. */
export function AgendaRow({ item, onClick }: { item: AgendaItem; onClick: () => void }) {
  const { projectById } = useData()
  const style = KIND_STYLE[item.kind]
  const Icon = style.icon
  const project = item.projectId ? projectById.get(item.projectId) : undefined
  const end = item.event?.endTime
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2/50 sm:px-5"
    >
      <div className="w-12 shrink-0 pt-0.5 text-right">
        {item.time ? (
          <span className="tabular text-[12.5px] font-medium">{item.time}</span>
        ) : (
          <span className="text-[11.5px] text-subtle">{item.kind === 'task' ? 'prazo' : 'dia'}</span>
        )}
        {end && <span className="tabular block text-[11px] text-subtle">{end}</span>}
      </div>
      <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-l-2', style.chip)}>
        <Icon className={cn('h-3.5 w-3.5', style.text)} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-[13.5px] font-medium', item.done && 'text-subtle line-through')}>{item.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={cn('text-[11.5px] font-medium', style.text)}>{style.label}</span>
          {project && (
            <span className="inline-flex items-center gap-1 text-[12px] text-muted">
              <span className={cn('h-1.5 w-1.5 rounded-full', PROJECT_COLORS[project.color]?.dot)} />
              {project.name}
            </span>
          )}
          <ItemMeta item={item} />
        </div>
      </div>
    </button>
  )
}

export function KindLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-[12px] text-muted', className)}>
      {(Object.keys(KIND_STYLE) as AgendaKind[]).map((k) => {
        const Icon = KIND_STYLE[k].icon
        return (
          <span key={k} className="inline-flex items-center gap-1.5">
            <Icon className={cn('h-3.5 w-3.5', KIND_STYLE[k].text)} />
            {KIND_STYLE[k].label}s
          </span>
        )
      })}
    </div>
  )
}
