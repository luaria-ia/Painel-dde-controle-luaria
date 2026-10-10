import { Link } from 'react-router-dom'
import { PROJECT_COLORS } from '@/config/labels'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ID } from '@/types'

/** Link para um projeto com bolinha de cor. Mostra "—" quando não há projeto. */
export function ProjectLink({ id, className }: { id: ID | null; className?: string }) {
  const { projectById } = useData()
  const project = id ? projectById.get(id) : undefined
  if (!project) return <span className="text-subtle">—</span>
  return (
    <Link
      to={`/projetos/${project.id}`}
      onClick={(e) => e.stopPropagation()}
      className={cn('inline-flex max-w-full items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg', className)}
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', PROJECT_COLORS[project.color]?.dot)} />
      <span className="truncate">{project.name}</span>
    </Link>
  )
}

export function ClientLink({ id, className }: { id: ID | null; className?: string }) {
  const { clientById } = useData()
  const client = id ? clientById.get(id) : undefined
  if (!client) return <span className="text-subtle">—</span>
  return (
    <Link
      to={`/clientes/${client.id}`}
      onClick={(e) => e.stopPropagation()}
      className={cn('inline-block max-w-full truncate text-[13px] text-muted transition-colors hover:text-fg', className)}
    >
      {client.name}
    </Link>
  )
}
