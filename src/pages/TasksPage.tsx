import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Columns3, LayoutList, Plus, Search, Sparkles, X } from 'lucide-react'
import { BriefingToTasksModal } from '@/components/ai/BriefingToTasksModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { TaskKanban } from '@/components/tasks/TaskKanban'
import { TaskList } from '@/components/tasks/TaskList'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { TASK_PRIORITY, TASK_STATUS, TASK_STATUS_ORDER } from '@/config/labels'
import { isTaskOverdue, sortByDue } from '@/lib/selectors'
import { addDays, todayISO } from '@/lib/format'
import { normalize } from '@/lib/utils'
import type { Task } from '@/types'
import { useData } from '@/store/useData'

type View = 'lista' | 'kanban'
type DueFilter = '' | 'atrasadas' | 'hoje' | 'semana' | 'sem_prazo'

const DUE_OPTIONS = [
  { value: 'atrasadas', label: 'Atrasadas' },
  { value: 'hoje', label: 'Vencem hoje' },
  { value: 'semana', label: 'Próximos 7 dias' },
  { value: 'sem_prazo', label: 'Sem prazo' },
]

function matchesDue(t: Task, due: DueFilter): boolean {
  if (!due) return true
  if (due === 'sem_prazo') return !t.dueDate
  if (due === 'atrasadas') return isTaskOverdue(t)
  if (!t.dueDate || t.status === 'concluido') return false
  const today = todayISO()
  return due === 'hoje' ? t.dueDate === today : t.dueDate >= today && t.dueDate <= addDays(today, 7)
}

export function TasksPage() {
  const { tasks, projects, clients } = useData()
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'kanban' ? 'kanban' : 'lista'
  // ?filtro=atrasadas (link do Dashboard) continua funcionando.
  const due = (params.get('prazo') ?? (params.get('filtro') === 'atrasadas' ? 'atrasadas' : '')) as DueFilter
  const projectId = params.get('projeto') ?? ''
  const clientId = params.get('cliente') ?? ''
  const priority = params.get('prioridade') ?? ''
  const status = params.get('status') ?? ''

  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [briefingOpen, setBriefingOpen] = useState(false)

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const setProjectId = (val: string) => setParam('projeto', val || null)
  const setClientId = (val: string) => setParam('cliente', val || null)
  const setPriority = (val: string) => setParam('prioridade', val || null)
  const setStatus = (val: string) => setParam('status', val || null)

  const setDue = (value: DueFilter) => {
    const next = new URLSearchParams(params)
    next.delete('filtro')
    if (value) next.set('prazo', value)
    else next.delete('prazo')
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    const list = tasks.filter(
      (t) =>
        (!q || normalize(`${t.title} ${t.description}`).includes(q)) &&
        (!projectId || (projectId === '_none' ? !t.projectId : t.projectId === projectId)) &&
        (!clientId || t.clientId === clientId) &&
        (!priority || t.priority === priority) &&
        (view === 'kanban' || !status || t.status === status) &&
        matchesDue(t, due),
    )
    // Lista: pendentes primeiro (por prazo), concluídas no fim.
    const sorted = sortByDue(list)
    return [...sorted.filter((t) => t.status !== 'concluido'), ...sorted.filter((t) => t.status === 'concluido')]
  }, [tasks, query, projectId, clientId, priority, status, view, due])

  const hasFilters = !!(query || projectId || clientId || priority || (status && view === 'lista') || due)
  const clearFilters = () => {
    setQuery('')
    const next = new URLSearchParams()
    if (view === 'kanban') next.set('view', 'kanban')
    setParams(next, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description="Organize o que precisa ser feito em todos os projetos."
        actions={
          <>
            <Segmented
              ariaLabel="Visualização"
              value={view}
              onChange={(v) => setParam('view', v === 'kanban' ? 'kanban' : null)}
              options={[
                { value: 'lista', label: 'Lista', icon: LayoutList },
                { value: 'kanban', label: 'Kanban', icon: Columns3 },
              ]}
            />
            <Button icon={Sparkles} onClick={() => setBriefingOpen(true)}>
              Briefing → tarefas
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              Nova tarefa
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative col-span-2 sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input aria-label="Buscar tarefas" className="h-8 pl-9 text-[13px]" placeholder="Buscar tarefas…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select
          compact
          aria-label="Filtrar por projeto"
          value={projectId}
          placeholder="Todos os projetos"
          options={[...projects.map((p) => ({ value: p.id, label: p.name })), { value: '_none', label: 'Sem projeto' }]}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <Select compact aria-label="Filtrar por cliente" value={clientId} placeholder="Todos os clientes" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => setClientId(e.target.value)} />
        <Select
          compact
          aria-label="Filtrar por prioridade"
          value={priority}
          placeholder="Qualquer prioridade"
          options={Object.entries(TASK_PRIORITY).map(([value, p]) => ({ value, label: p.label }))}
          onChange={(e) => setPriority(e.target.value)}
        />
        {view === 'lista' && (
          <Select
            compact
            aria-label="Filtrar por status"
            value={status}
            placeholder="Qualquer status"
            options={TASK_STATUS_ORDER.map((s) => ({ value: s, label: TASK_STATUS[s].label }))}
            onChange={(e) => setStatus(e.target.value)}
          />
        )}
        <Select
          compact
          aria-label="Filtrar por prazo"
          value={due}
          placeholder="Qualquer prazo"
          options={DUE_OPTIONS}
          onChange={(e) => setDue(e.target.value as DueFilter)}
        />
        {hasFilters && (
          <Button size="sm" variant="ghost" icon={X} onClick={clearFilters} className="col-span-2 justify-self-start sm:col-span-1">
            Limpar filtros
          </Button>
        )}
      </div>

      {view === 'lista' ? (
        <Card className="overflow-hidden">
          <TaskList
            tasks={filtered}
            emptyTitle={hasFilters ? 'Nenhuma tarefa com esses filtros' : 'Você ainda não possui tarefas.'}
            emptyDescription={hasFilters ? 'Tente remover algum filtro.' : 'Crie a primeira tarefa para organizar seu trabalho.'}
            emptyAction={
              hasFilters ? (
                <Button size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                  Criar tarefa
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          <TaskKanban tasks={filtered} defaults={{ projectId: projectId && projectId !== '_none' ? projectId : null, clientId: clientId || null }} />
          <p className="mt-3 hidden text-[12.5px] text-subtle lg:block">Dica: arraste os cartões entre as colunas para mudar o status.</p>
        </>
      )}

      <BriefingToTasksModal open={briefingOpen} projectId={projectId && projectId !== '_none' ? projectId : undefined} onClose={() => setBriefingOpen(false)} />
      <TaskFormModal
        open={creating}
        defaults={{ projectId: projectId && projectId !== '_none' ? projectId : null, clientId: clientId || null }}
        onClose={() => setCreating(false)}
      />
    </div>
  )
}
