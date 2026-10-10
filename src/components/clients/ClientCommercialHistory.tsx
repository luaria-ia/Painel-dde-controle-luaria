import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { areaForBoard } from '@/data/boards/projectTypes'
import { formatFieldValue } from '@/lib/boards'
import { formatDate } from '@/lib/format'
import { cardsByClient } from '@/repositories/boards'
import { useData } from '@/store/useData'
import type { ID } from '@/types'

type Item = Awaited<ReturnType<typeof cardsByClient>>[number]

/** Oportunidades do CRM que viraram este cliente — o histórico comercial continua no mesmo registro. */
export function ClientCommercialHistory({ clientId }: { clientId: ID }) {
  const { projectById } = useData()
  const [items, setItems] = useState<Item[] | null>(null)

  useEffect(() => {
    let alive = true
    cardsByClient(clientId).then(
      (r) => alive && setItems(r),
      () => alive && setItems([]),
    )
    return () => {
      alive = false
    }
  }, [clientId])

  if (!items?.length) return null
  return (
    <Card className="p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold">Histórico comercial</h2>
      <ul className="flex flex-col gap-2">
        {items.map(({ card, board, list, interactions }) => {
          const project = board ? projectById.get(board.projectId) : undefined
          const area = project && board ? areaForBoard(project.type, board.templateKey) : undefined
          const to = project ? `/projetos/${project.id}?${new URLSearchParams({ ...(area ? { aba: area.key } : {}), cartao: card.id })}` : undefined
          const body = (
            <>
              <span className="block text-[13.5px] font-medium">{card.title}</span>
              <span className="mt-0.5 flex flex-wrap gap-x-2 text-[12px] text-subtle">
                {list && (
                  <span>
                    {list.icon} {list.name}
                  </span>
                )}
                {card.fields.valor_potencial && <span>{formatFieldValue('currency', card.fields.valor_potencial)}</span>}
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> {interactions}
                </span>
                <span>desde {formatDate(card.createdAt.slice(0, 10))}</span>
              </span>
              {project && (
                <span className="mt-0.5 block text-[11.5px] text-subtle">
                  {project.name} · {area?.label ?? board?.name}
                </span>
              )}
            </>
          )
          return (
            <li key={card.id}>
              {to ? (
                <Link to={to} className="-mx-2 block rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2/60">
                  {body}
                </Link>
              ) : (
                <div className="py-1.5">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
