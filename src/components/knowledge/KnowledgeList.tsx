import { useState } from 'react'
import { Brain } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { KNOWLEDGE_CATEGORY } from '@/config/labels'
import { formatDateTime } from '@/lib/format'
import type { KnowledgeItem } from '@/types'
import { KnowledgeFormModal } from './KnowledgeFormModal'

/** Cartões de conhecimento (texto resumido); clique para editar. */
export function KnowledgeList({ items, showProject = true, emptyAction }: { items: KnowledgeItem[]; showProject?: boolean; emptyAction?: React.ReactNode }) {
  const [editing, setEditing] = useState<KnowledgeItem | null>(null)
  if (items.length === 0)
    return (
      <EmptyState
        compact
        icon={Brain}
        title="Nenhum conhecimento registrado"
        description="Adicione informações sobre a empresa, público, produtos e processos. A IA usa esse conteúdo como contexto."
        action={emptyAction}
      />
    )
  return (
    <>
      <ul className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2">
        {items.map((k) => (
          <li key={k.id}>
            <button
              type="button"
              onClick={() => setEditing(k)}
              className="flex h-full w-full cursor-pointer flex-col gap-2 rounded-lg border border-line bg-surface p-3.5 text-left transition-colors hover:border-line-strong"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13.5px] font-semibold">{k.title}</p>
                <Badge tone={KNOWLEDGE_CATEGORY[k.category].tone} className="shrink-0">
                  {KNOWLEDGE_CATEGORY[k.category].label}
                </Badge>
              </div>
              <p className="line-clamp-3 text-[12.5px] leading-relaxed text-muted">{k.content}</p>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11.5px] text-subtle">
                {showProject && k.projectId && <ProjectLink id={k.projectId} className="text-[12px]" />}
                {k.clientId && <ClientLink id={k.clientId} className="text-[12px]" />}
                {k.tags.slice(0, 4).map((t) => (
                  <span key={t}>#{t}</span>
                ))}
                <span className="ml-auto">{formatDateTime(k.updatedAt)}</span>
                {k.isDemo && <DemoBadge />}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <KnowledgeFormModal open={!!editing} item={editing} onClose={() => setEditing(null)} />
    </>
  )
}
