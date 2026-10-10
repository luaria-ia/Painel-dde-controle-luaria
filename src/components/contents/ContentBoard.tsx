import { useState } from 'react'
import { FileText } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { KanbanBoard, type KanbanColumn } from '@/components/ui/KanbanBoard'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { useToast } from '@/components/ui/toastContext'
import { CONTENT_STATUS, CONTENT_STATUS_ORDER, CONTENT_TYPE } from '@/config/labels'
import { formatDateShort } from '@/lib/format'
import { contentDate } from '@/lib/selectors'
import { useData } from '@/store/useData'
import type { Content, ContentStatus } from '@/types'
import { ContentCard } from './ContentCard'
import { ContentFormModal, type ContentDefaults } from './ContentFormModal'

const COLUMNS: KanbanColumn<ContentStatus>[] = CONTENT_STATUS_ORDER.map((s) => ({ id: s, label: CONTENT_STATUS[s].label, dot: CONTENT_STATUS[s].dot }))

const byDate = (a: Content, b: Content) => (contentDate(a) ?? '9999').localeCompare(contentDate(b) ?? '9999')

function useMove() {
  const { setContentStatus } = useData()
  const toast = useToast()
  return async (c: Content, status: ContentStatus) => {
    if (c.status === status) return
    if (await setContentStatus(c.id, status)) toast.success(`Movido para "${CONTENT_STATUS[status].label}"`)
  }
}

/** Kanban de conteúdo (Ideia → Publicado), reutilizando o KanbanBoard genérico. */
export function ContentKanban({ contents, defaults }: { contents: Content[]; defaults?: ContentDefaults }) {
  const move = useMove()
  const [editing, setEditing] = useState<Content | null>(null)
  const [creatingIn, setCreatingIn] = useState<ContentStatus | null>(null)
  return (
    <>
      <KanbanBoard
        layout="scroll"
        columns={COLUMNS}
        items={[...contents].sort(byDate)}
        getId={(c) => c.id}
        getStatus={(c) => c.status}
        onMove={move}
        onAdd={setCreatingIn}
        addLabel="Novo conteúdo"
        renderCard={(c) => <ContentCard content={c} onOpen={() => setEditing(c)} onStatusChange={(s) => move(c, s)} />}
      />
      <ContentFormModal open={!!editing} content={editing} onClose={() => setEditing(null)} />
      <ContentFormModal open={!!creatingIn} defaults={{ ...defaults, status: creatingIn ?? undefined }} onClose={() => setCreatingIn(null)} />
    </>
  )
}

/** Lista de conteúdo (tabela no desktop, cartões no celular). */
export function ContentList({ contents, showProject = true, emptyAction }: { contents: Content[]; showProject?: boolean; emptyAction?: React.ReactNode }) {
  const [editing, setEditing] = useState<Content | null>(null)
  if (contents.length === 0) return <EmptyState compact icon={FileText} title="Nenhum conteúdo" action={emptyAction} />
  const sorted = [...contents].sort(byDate)
  return (
    <div className="@container">
      <div className="hidden @3xl:block">
        <Table>
          <THead>
            <tr>
              <Th>Conteúdo</Th>
              <Th className="w-28">Tipo</Th>
              {showProject && <Th className="w-36">Projeto</Th>}
              <Th className="w-36">Cliente</Th>
              <Th className="w-32">Status</Th>
              <Th className="w-28">Data</Th>
            </tr>
          </THead>
          <TBody>
            {sorted.map((c) => (
              <Tr key={c.id} className="cursor-pointer" onClick={() => setEditing(c)}>
                <Td>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{c.title}</span>
                    {c.isDemo && <DemoBadge />}
                  </div>
                </Td>
                <Td className="text-[13px] text-muted">{CONTENT_TYPE[c.type].label}</Td>
                {showProject && (
                  <Td className="max-w-36">
                    <ProjectLink id={c.projectId} />
                  </Td>
                )}
                <Td className="max-w-36">
                  <ClientLink id={c.clientId} />
                </Td>
                <Td>
                  <Badge tone={CONTENT_STATUS[c.status].tone}>{CONTENT_STATUS[c.status].label}</Badge>
                </Td>
                <Td className="text-[13px] text-muted">{formatDateShort(contentDate(c))}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
      <ul className="divide-y divide-line border-t border-line @3xl:hidden">
        {sorted.map((c) => (
          <li key={c.id} className="flex cursor-pointer items-center gap-3 px-4 py-3" onClick={() => setEditing(c)}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-subtle">
                <span>{CONTENT_TYPE[c.type].label}</span>
                {contentDate(c) && <span>· {formatDateShort(contentDate(c))}</span>}
                {showProject && c.projectId && <ProjectLink id={c.projectId} className="text-[12px]" />}
              </div>
            </div>
            <Badge tone={CONTENT_STATUS[c.status].tone}>{CONTENT_STATUS[c.status].label}</Badge>
          </li>
        ))}
      </ul>
      <ContentFormModal open={!!editing} content={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
