import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Columns3, LayoutList, Lightbulb, Plus, Search, X } from 'lucide-react'
import { ContentIdeasModal } from '@/components/ai/ContentIdeasModal'
import { ContentKanban, ContentList } from '@/components/contents/ContentBoard'
import { ContentFormModal } from '@/components/contents/ContentFormModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { CONTENT_STATUS, CONTENT_STATUS_ORDER, CONTENT_TYPE } from '@/config/labels'
import { normalize } from '@/lib/utils'
import { withContentProject, withContentView } from '@/lib/contentFilters'
import { useData } from '@/store/useData'

export function ContentPage() {
  const { contents, projects, clients } = useData()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'lista' ? 'lista' : 'kanban'
  const [query, setQuery] = useState('')
  const projectId = params.get('projeto') ?? ''
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [creating, setCreating] = useState(false)
  const [ideasOpen, setIdeasOpen] = useState(false)

  const q = normalize(query.trim())
  const filtered = contents.filter(
    (c) =>
      (!q || normalize(`${c.title} ${c.description} ${c.caption}`).includes(q)) &&
      (!projectId || c.projectId === projectId) &&
      (!clientId || c.clientId === clientId) &&
      (!status || view === 'kanban' || c.status === status) &&
      (!type || c.type === type),
  )
  const hasFilters = !!(query || projectId || clientId || type || (status && view === 'lista'))
  const clear = () => {
    setQuery('')
    setParams(withContentProject(params, ''), { replace: true })
    setClientId('')
    setStatus('')
    setType('')
  }
  const defaults = { projectId: projectId || null, clientId: clientId || null }

  return (
    <div>
      <PageHeader
        title="Conteúdo"
        description="Do rascunho à publicação: Ideia → Roteiro → Produção → Aprovação → Agendado → Publicado."
        actions={
          <>
            <Segmented
              ariaLabel="Visualização"
              value={view}
              onChange={(v) => setParams(withContentView(params, v as 'kanban' | 'lista'), { replace: true })}
              options={[
                { value: 'kanban', label: 'Kanban', icon: Columns3 },
                { value: 'lista', label: 'Lista', icon: LayoutList },
              ]}
            />
            <Button icon={Lightbulb} onClick={() => setIdeasOpen(true)}>
              Ideias com IA
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              Novo conteúdo
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative col-span-2 sm:w-60">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input aria-label="Buscar conteúdo" className="h-8 pl-9 text-[13px]" placeholder="Buscar conteúdo…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select compact aria-label="Projeto" value={projectId} placeholder="Todos os projetos" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setParams(withContentProject(params, e.target.value), { replace: true })} />
        <Select compact aria-label="Cliente" value={clientId} placeholder="Todos os clientes" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => setClientId(e.target.value)} />
        <Select compact aria-label="Tipo" value={type} placeholder="Todos os tipos" options={Object.entries(CONTENT_TYPE).map(([value, t]) => ({ value, label: t.label }))} onChange={(e) => setType(e.target.value)} />
        {view === 'lista' && (
          <Select
            compact
            aria-label="Status"
            value={status}
            placeholder="Qualquer status"
            options={CONTENT_STATUS_ORDER.map((s) => ({ value: s, label: CONTENT_STATUS[s].label }))}
            onChange={(e) => setStatus(e.target.value)}
          />
        )}
        {hasFilters && (
          <Button size="sm" variant="ghost" icon={X} onClick={clear} className="col-span-2 justify-self-start sm:col-span-1">
            Limpar filtros
          </Button>
        )}
      </div>

      {view === 'kanban' ? (
        <>
          <ContentKanban contents={filtered} defaults={defaults} />
          <p className="mt-3 hidden text-[12.5px] text-subtle lg:block">Dica: arraste os cartões entre as colunas. Conteúdos com data aparecem no Calendário.</p>
        </>
      ) : (
        <Card className="overflow-hidden">
          <ContentList
            contents={filtered}
            emptyAction={
              !hasFilters && (
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                  Criar conteúdo
                </Button>
              )
            }
          />
        </Card>
      )}

      <ContentFormModal open={creating} defaults={defaults} onClose={() => setCreating(false)} />
      <ContentIdeasModal open={ideasOpen} defaults={defaults} onClose={() => setIdeasOpen(false)} />
    </div>
  )
}
