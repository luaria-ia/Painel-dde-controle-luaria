import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, Plus, Users } from 'lucide-react'
import { ClientAvatar } from '@/components/clients/ClientList'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { CLIENT_STATUS } from '@/config/labels'
import { contentStats } from '@/lib/contentStats'
import { useData } from '@/store/useData'
import type { Client, Project } from '@/types'

/** Clientes da operação (ex.: Social Media). Cada um abre o espaço próprio dentro do projeto. */
export function OperationClients({ project, clients }: { project: Project; clients: Client[] }) {
  const { contents, clients: allClients, updateClient } = useData()
  const toast = useToast()
  const [creating, setCreating] = useState(false)
  const [linkId, setLinkId] = useState('')
  const available = allClients.filter((c) => !clients.some((x) => x.id === c.id))

  const link = async () => {
    const c = allClients.find((x) => x.id === linkId)
    if (!c) return
    if (await updateClient(c.id, { name: c.name, projectIds: [...new Set([...c.projectIds, project.id])] })) {
      toast.success(`${c.name} adicionado a ${project.name}`)
      setLinkId('')
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={`Clientes · ${clients.length}`}
        description="Cada cliente tem a própria estratégia, conteúdo e métricas."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {available.length > 0 && (
              <>
                <Select
                  compact
                  aria-label="Adicionar cliente existente"
                  value={linkId}
                  placeholder="Cliente existente…"
                  options={available.map((c) => ({ value: c.id, label: c.name }))}
                  onChange={(e) => setLinkId(e.target.value)}
                />
                {linkId && (
                  <Button size="sm" icon={Link2} onClick={() => void link()}>
                    Adicionar
                  </Button>
                )}
              </>
            )}
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              Novo cliente
            </Button>
          </div>
        }
      />
      {clients.length === 0 ? (
        <EmptyState compact icon={Users} title="Nenhum cliente nesta operação" description="Adicione um cliente existente ou cadastre um novo." />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {clients.map((c) => {
            const s = contentStats(contents.filter((x) => x.projectId === project.id && x.clientId === c.id))
            return (
              <li key={c.id}>
                <Link
                  to={`/projetos/${project.id}/clientes/${c.id}`}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/50 sm:flex-nowrap sm:px-5"
                >
                  <ClientAvatar client={c} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{c.name}</p>
                    <p className="truncate text-[12px] text-subtle">{c.company || c.whatsapp || c.email || '—'}</p>
                  </div>
                  <span className="tabular flex gap-3 text-[12px] text-subtle">
                    <span>{s.production} em produção</span>
                    <span>{s.approval} em aprovação</span>
                    <span>{s.scheduled} agendados</span>
                  </span>
                  <Badge tone={CLIENT_STATUS[c.status].tone}>{CLIENT_STATUS[c.status].label}</Badge>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      <ClientFormModal open={creating} onClose={() => setCreating(false)} defaultProjectId={project.id} />
    </Card>
  )
}
