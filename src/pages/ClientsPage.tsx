import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { ClientList } from '@/components/clients/ClientList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { CLIENT_STATUS } from '@/config/labels'
import { normalize } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ClientStatus } from '@/types'

export function ClientsPage() {
  const { clients, projects } = useData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'todos' | ClientStatus>('todos')
  const [projectId, setProjectId] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return clients
      .filter(
        (c) =>
          (!q || normalize(`${c.name} ${c.company} ${c.email}`).includes(q)) &&
          (status === 'todos' || c.status === status) &&
          (!projectId || c.projectIds.includes(projectId)),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [clients, query, status, projectId])

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Pessoas e empresas com quem você trabalha."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
            Novo cliente
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input aria-label="Buscar clientes" className="h-8 pl-9 text-[13px]" placeholder="Buscar por nome, empresa ou e-mail…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Segmented
          ariaLabel="Filtrar por status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'todos', label: 'Todos', count: clients.length },
            ...(Object.keys(CLIENT_STATUS) as ClientStatus[]).map((s) => ({
              value: s,
              label: CLIENT_STATUS[s].label,
              count: clients.filter((c) => c.status === s).length,
            })),
          ]}
        />
        <Select compact aria-label="Filtrar por projeto" value={projectId} placeholder="Todos os projetos" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />
      </div>

      <Card className="overflow-hidden">
        <ClientList
          clients={filtered}
          emptyAction={
            clients.length === 0 && (
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                Cadastrar cliente
              </Button>
            )
          }
        />
      </Card>

      <ClientFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
