import { useState } from 'react'
import { FolderKanban, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { PROJECT_STATUS } from '@/config/labels'
import { useData } from '@/store/useData'
import type { ProjectStatus } from '@/types'

type Filter = 'todos' | ProjectStatus

export function ProjectsPage() {
  const { projects } = useData()
  const [filter, setFilter] = useState<Filter>('todos')
  const [creating, setCreating] = useState(false)

  const statusOrder: ProjectStatus[] = ['ativo', 'pausado', 'concluido', 'arquivado']
  const visible = projects
    .filter((p) => (filter === 'todos' ? p.status !== 'arquivado' : p.status === filter))
    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || a.name.localeCompare(b.name))

  const createButton = (
    <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
      Criar projeto
    </Button>
  )

  return (
    <div>
      <PageHeader title="Projetos" description="Cada projeto é um pequeno ambiente com tarefas, clientes e finanças." actions={createButton} />

      {projects.length > 0 && (
        <Segmented
          className="mb-5"
          ariaLabel="Filtrar por status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todos', label: 'Todos', count: projects.filter((p) => p.status !== 'arquivado').length },
            ...statusOrder.map((s) => ({ value: s, label: PROJECT_STATUS[s].label, count: projects.filter((p) => p.status === s).length })),
          ]}
        />
      )}

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title="Você ainda não possui projetos."
            description="Crie seu primeiro projeto para começar."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                Criar projeto
              </Button>
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState compact icon={FolderKanban} title={`Nenhum projeto ${PROJECT_STATUS[filter as ProjectStatus]?.label.toLowerCase() ?? ''}`} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
      {filter === 'todos' && projects.some((p) => p.status === 'arquivado') && (
        <p className="mt-4 text-[12.5px] text-subtle">Projetos arquivados ficam ocultos. Use o filtro “Arquivado” para vê-los.</p>
      )}

      <ProjectFormModal open={creating} onClose={() => setCreating(false)} goToCreated />
    </div>
  )
}
