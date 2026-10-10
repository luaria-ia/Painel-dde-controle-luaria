import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { PROJECT_COLORS, PROJECT_STATUS } from '@/config/labels'
import { DEFAULT_PROJECT_TYPE, projectType } from '@/data/boards/projectTypes'
import { formatCurrency } from '@/lib/format'
import { byProject, financeSummary, taskCounts } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { Project } from '@/types'

export function ProjectCard({ project, showFinance = true }: { project: Project; showFinance?: boolean }) {
  const { tasks, transactions } = useData()
  const counts = taskCounts(byProject(tasks, project.id))
  const fin = financeSummary(byProject(transactions, project.id))
  const progress = counts.total ? Math.round((counts.concluidas / counts.total) * 100) : 0
  const color = PROJECT_COLORS[project.color] ?? PROJECT_COLORS.slate
  const status = PROJECT_STATUS[project.status]

  return (
    <Link
      to={`/projetos/${project.id}`}
      className="group relative flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition-all hover:-translate-y-px hover:border-line-strong hover:shadow-pop sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold', color.soft)}>
            {project.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{project.name}</h3>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
        {project.type !== DEFAULT_PROJECT_TYPE && (
          <Badge>
            {projectType(project.type).icon} {projectType(project.type).label}
          </Badge>
        )}
        {project.isDemo && <DemoBadge />}
      </div>

      {project.clientId && <ClientName id={project.clientId} />}
      {project.description && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">{project.description}</p>}

      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted">
          <span>
            <span className="font-medium text-fg tabular">{counts.pendentes}</span> pendentes ·{' '}
            <span className="font-medium text-fg tabular">{counts.concluidas}</span> concluídas
          </span>
          {counts.atrasadas > 0 && <span className="text-rose-600 dark:text-rose-400">{counts.atrasadas} atrasada{counts.atrasadas > 1 && 's'}</span>}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" aria-label={`${progress}% concluído`}>
          <div className={cn('h-full rounded-full transition-all', color.dot)} style={{ width: `${progress}%` }} />
        </div>
        {showFinance && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[12px]">
            <span className="text-subtle">Resultado</span>
            <span className={cn('font-medium tabular', fin.saldoCents < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-fg')}>
              {formatCurrency(fin.saldoCents)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

function ClientName({ id }: { id: string }) {
  const { clientById } = useData()
  const c = clientById.get(id)
  return c ? <p className="mt-2 text-[12.5px] text-muted">Cliente: {c.name}</p> : null
}
