import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { KnowledgeFormModal } from '@/components/knowledge/KnowledgeFormModal'
import { KnowledgeList } from '@/components/knowledge/KnowledgeList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { KNOWLEDGE_CATEGORY } from '@/config/labels'
import { normalize } from '@/lib/utils'
import { useData } from '@/store/useData'

export function KnowledgePage() {
  const { knowledge, projects, clients } = useData()
  const [query, setQuery] = useState('')
  const [projectId, setProjectId] = useState('')
  const [clientId, setClientId] = useState('')
  const [category, setCategory] = useState('')
  const [creating, setCreating] = useState(false)

  const q = normalize(query.trim())
  const filtered = knowledge.filter(
    (k) =>
      (!q || normalize(`${k.title} ${k.content} ${k.tags.join(' ')}`).includes(q)) &&
      (!projectId || k.projectId === projectId) &&
      (!clientId || k.clientId === clientId) &&
      (!category || k.category === category),
  )

  return (
    <div>
      <PageHeader
        title="Conhecimento"
        description="O que a IA precisa saber sobre cada projeto e cliente: posicionamento, público, processos, produtos."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
            Novo conhecimento
          </Button>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative col-span-2 sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input aria-label="Buscar" className="h-8 pl-9 text-[13px]" placeholder="Buscar no conhecimento…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select compact aria-label="Projeto" value={projectId} placeholder="Todos os projetos" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />
        <Select compact aria-label="Cliente" value={clientId} placeholder="Todos os clientes" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => setClientId(e.target.value)} />
        <Select compact aria-label="Categoria" value={category} placeholder="Todas as categorias" options={Object.entries(KNOWLEDGE_CATEGORY).map(([value, c]) => ({ value, label: c.label }))} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <Card className="overflow-hidden">
        <KnowledgeList
          items={filtered}
          emptyAction={
            !knowledge.length && (
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                Adicionar conhecimento
              </Button>
            )
          }
        />
      </Card>
      <KnowledgeFormModal open={creating} defaults={{ projectId: projectId || undefined, clientId: clientId || undefined }} onClose={() => setCreating(false)} />
    </div>
  )
}
