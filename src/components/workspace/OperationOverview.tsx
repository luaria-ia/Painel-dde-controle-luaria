import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Eye, Layers, ListChecks, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { CONTENT_STATUS } from '@/config/labels'
import { contentStats } from '@/lib/contentStats'
import { formatDateShort } from '@/lib/format'
import { contentDate } from '@/lib/selectors'
import { useData } from '@/store/useData'
import type { Client, Project } from '@/types'
import { Stat } from './ContentMetricsPanel'

/** Visão da OPERAÇÃO (ex.: Social Media): números agregados e por cliente — sem listar todos os conteúdos aqui. */
export function OperationOverview({ project, clients }: { project: Project; clients: Client[] }) {
  const { contents, tasks, clientById } = useData()
  const projectContents = contents.filter((c) => c.projectId === project.id && c.clientId)
  const s = contentStats(projectContents)
  const pendingTasks = tasks.filter((t) => t.projectId === project.id && t.status !== 'concluido').length
  const active = clients.filter((c) => c.status === 'ativo').length

  return (
    <div className="mb-6 flex flex-col gap-4">
      <section aria-label="Resumo da operação" className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Clientes ativos" value={active} icon={Users} hint={`${clients.length} no total`} />
        <Stat label="Em produção" value={s.production} icon={Layers} />
        <Stat label="Em aprovação" value={s.approval} icon={Eye} />
        <Stat label="Agendados" value={s.scheduled} icon={CalendarCheck} />
        <Stat label="Publicados no mês" value={s.publishedMonth} icon={CheckCircle2} />
        <Stat label="Tarefas pendentes" value={pendingTasks} icon={ListChecks} />
      </section>
      <Card>
        <CardHeader title="Próximos prazos" description="Conteúdos dos clientes nos próximos 14 dias" />
        {s.upcoming.length === 0 ? (
          <p className="px-4 pb-5 text-[13px] text-subtle sm:px-5">Nada programado para os próximos dias.</p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {s.upcoming.slice(0, 8).map((c) => {
              const client = c.clientId ? clientById.get(c.clientId) : undefined
              return (
                <li key={c.id}>
                  <Link
                    to={`/projetos/${project.id}/clientes/${c.clientId}?aba=conteudo`}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors hover:bg-surface-2/50 sm:px-5"
                  >
                    <span className="tabular w-12 text-subtle">{formatDateShort(contentDate(c))}</span>
                    <span className="w-32 shrink-0 truncate text-muted">{client?.name ?? '—'}</span>
                    <span className="min-w-0 flex-1 truncate">{c.title}</span>
                    <Badge tone={CONTENT_STATUS[c.status].tone}>{CONTENT_STATUS[c.status].label}</Badge>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
