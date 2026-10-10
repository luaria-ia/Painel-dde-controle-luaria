import { useNavigate } from 'react-router-dom'
import { Mail, MessageCircle, Users } from 'lucide-react'
import { ProjectLink } from '@/components/common/EntityLinks'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { CLIENT_STATUS } from '@/config/labels'
import { formatCurrency } from '@/lib/format'
import { byClient, financeSummary } from '@/lib/selectors'
import { initials } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { Client } from '@/types'

export function ClientAvatar({ client, size = 'md' }: { client: Client; size?: 'md' | 'lg' }) {
  return (
    <div
      className={
        size === 'lg'
          ? 'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base font-semibold text-accent'
          : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-[12px] font-semibold text-accent'
      }
    >
      {initials(client.name)}
    </div>
  )
}

export function ClientList({ clients, emptyAction }: { clients: Client[]; emptyAction?: React.ReactNode }) {
  const navigate = useNavigate()
  const { tasks, transactions } = useData()

  if (clients.length === 0) {
    return <EmptyState icon={Users} title="Nenhum cliente encontrado" description="Cadastre clientes para relacioná-los a projetos, tarefas e receitas." action={emptyAction} />
  }

  const stats = (c: Client) => ({
    openTasks: byClient(tasks, c.id).filter((t) => t.status !== 'concluido').length,
    revenue: financeSummary(byClient(transactions, c.id)).receitaCents,
  })

  return (
    <div className="@container">
      <div className="hidden @3xl:block">
        <Table>
          <THead>
            <tr>
              <Th>Cliente</Th>
              <Th className="hidden 2xl:table-cell">Contato</Th>
              <Th>Projetos</Th>
              <Th className="w-32">Status</Th>
              <Th className="w-24 text-right">Tarefas</Th>
              <Th className="w-32 text-right">Receita</Th>
            </tr>
          </THead>
          <TBody>
            {clients.map((c) => {
              const s = stats(c)
              return (
                <Tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/clientes/${c.id}`)}>
                  <Td>
                    <div className="flex min-w-0 items-center gap-3">
                      <ClientAvatar client={c} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{c.name}</span>
                          {c.isDemo && <DemoBadge />}
                        </div>
                        {c.company && <p className="truncate text-[12px] text-subtle">{c.company}</p>}
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden text-[13px] text-muted 2xl:table-cell">
                    <div className="flex flex-col gap-0.5">
                      {c.email && (
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 text-subtle" /> {c.email}
                        </span>
                      )}
                      {c.whatsapp && (
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="h-3 w-3 text-subtle" /> {c.whatsapp}
                        </span>
                      )}
                      {!c.email && !c.whatsapp && <span className="text-subtle">—</span>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      {c.projectIds.length ? c.projectIds.map((id) => <ProjectLink key={id} id={id} />) : <span className="text-subtle">—</span>}
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={CLIENT_STATUS[c.status].tone} dot>
                      {CLIENT_STATUS[c.status].label}
                    </Badge>
                  </Td>
                  <Td className="tabular text-right text-muted">{s.openTasks}</Td>
                  <Td className="tabular text-right font-medium">{formatCurrency(s.revenue)}</Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      </div>

      <ul className="divide-y divide-line border-t border-line @3xl:hidden">
        {clients.map((c) => {
          const s = stats(c)
          return (
            <li key={c.id} className="flex cursor-pointer items-center gap-3 px-4 py-3" onClick={() => navigate(`/clientes/${c.id}`)}>
              <ClientAvatar client={c} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  {c.isDemo && <DemoBadge />}
                </div>
                <p className="truncate text-[12px] text-subtle">{c.company || c.email || 'Sem empresa'}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge tone={CLIENT_STATUS[c.status].tone} dot>
                    {CLIENT_STATUS[c.status].label}
                  </Badge>
                  <span className="text-[12px] text-subtle">{s.openTasks} tarefas abertas</span>
                </div>
              </div>
              <span className="tabular text-[13px] font-medium">{formatCurrency(s.revenue)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
