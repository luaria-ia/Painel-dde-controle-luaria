import { CalendarDays } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { CONTENT_STATUS, CONTENT_STATUS_ORDER, CONTENT_TYPE } from '@/config/labels'
import { formatDateShort } from '@/lib/format'
import type { Content, ContentStatus } from '@/types'

/** Cartão de conteúdo no Kanban. */
export function ContentCard({ content, onOpen, onStatusChange }: { content: Content; onOpen: () => void; onStatusChange: (s: ContentStatus) => void }) {
  const date = content.publishDate ?? content.plannedDate
  return (
    <article onClick={onOpen} className="cursor-pointer rounded-lg border border-line bg-surface p-3 shadow-card transition-all hover:border-line-strong">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[13.5px] leading-snug font-medium">{content.title}</p>
        <Badge tone="neutral" className="shrink-0">
          {CONTENT_TYPE[content.type].label}
        </Badge>
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {content.projectId && <ProjectLink id={content.projectId} />}
        {content.clientId && <ClientLink id={content.clientId} className="text-[12px]" />}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {date ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-muted" title={content.publishDate ? 'Publicação' : 'Data prevista'}>
            <CalendarDays className="h-3.5 w-3.5 text-subtle" />
            {content.publishDate ? 'Publica' : 'Prevista'} {formatDateShort(date)}
          </span>
        ) : (
          <span className="text-[12px] text-subtle">Sem data</span>
        )}
        {content.isDemo && <DemoBadge />}
      </div>
      {content.status === 'aprovacao' && (
        <div className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11.5px] font-medium text-amber-600 dark:text-amber-400">Em aprovação</span>
          <button
            type="button"
            className="cursor-pointer inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-[11.5px] font-medium text-accent hover:bg-accent/20 transition-colors"
            onClick={() => onStatusChange('agendado')}
          >
            Aprovar ✓
          </button>
        </div>
      )}
      <div className="mt-2.5 lg:hidden" onClick={(e) => e.stopPropagation()}>
        <Select
          compact
          aria-label="Mover para"
          value={content.status}
          options={CONTENT_STATUS_ORDER.map((s) => ({ value: s, label: CONTENT_STATUS[s].label }))}
          onChange={(e) => onStatusChange(e.target.value as ContentStatus)}
        />
      </div>
    </article>
  )
}
