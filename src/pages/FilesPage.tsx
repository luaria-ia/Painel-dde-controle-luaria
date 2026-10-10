import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { FileFormModal } from '@/components/files/FileFormModal'
import { FileList } from '@/components/files/FileList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { FILE_CATEGORY } from '@/config/labels'
import { normalize } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { FileCategory } from '@/types'

export function FilesPage() {
  const { files, projects, clients } = useData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'todos' | FileCategory>('todos')
  const [projectId, setProjectId] = useState('')
  const [clientId, setClientId] = useState('')
  const [creating, setCreating] = useState(false)

  const q = normalize(query.trim())
  const filtered = files.filter(
    (f) =>
      (!q || normalize(`${f.name} ${f.description}`).includes(q)) &&
      (category === 'todos' || f.category === category) &&
      (!projectId || f.projectId === projectId) &&
      (!clientId || f.clientId === clientId),
  )

  return (
    <div>
      <PageHeader
        title="Arquivos"
        description="Documentos, briefings e materiais organizados por projeto. Arquivos enviados ficam privados."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
            Adicionar arquivo
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2">
        <Segmented
          ariaLabel="Categoria"
          value={category}
          onChange={setCategory}
          options={[
            { value: 'todos', label: 'Todos', count: files.length },
            ...(Object.keys(FILE_CATEGORY) as FileCategory[]).map((c) => ({ value: c, label: FILE_CATEGORY[c].label, count: files.filter((f) => f.category === c).length })),
          ]}
        />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <div className="relative col-span-2 sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
            <Input aria-label="Buscar arquivos" className="h-8 pl-9 text-[13px]" placeholder="Buscar arquivos…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select compact aria-label="Projeto" value={projectId} placeholder="Todos os projetos" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />
          <Select compact aria-label="Cliente" value={clientId} placeholder="Todos os clientes" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => setClientId(e.target.value)} />
        </div>
      </div>

      <Card className="overflow-hidden">
        <FileList
          files={filtered}
          emptyAction={
            files.length === 0 && (
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                Adicionar arquivo
              </Button>
            )
          }
        />
      </Card>

      <FileFormModal open={creating} defaults={{ projectId: projectId || undefined, clientId: clientId || undefined }} onClose={() => setCreating(false)} />
    </div>
  )
}
