import { useEffect, useState } from 'react'
import { Check, ListChecks, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { TASK_PRIORITY } from '@/config/labels'
import { useAI } from '@/hooks/useAI'
import { useAIContext } from '@/hooks/useAIContext'
import { addDays, formatDateShort, todayISO } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SCHEMA_TASKS } from '@/services/ai/promptBuilder'
import { useData } from '@/store/useData'
import type { ID, TaskPriority } from '@/types'
import { AIErrorBox, AILoading, AISourceBadge } from './AIResultCard'

interface Draft {
  selected: boolean
  title: string
  description: string
  priority: TaskPriority
  dueInDays: number
}

/**
 * "Transformar briefing em tarefas": a IA sugere, o usuário revisa/edita/desmarca
 * e só então confirma a criação. Nada é criado automaticamente.
 */
export function BriefingToTasksModal({ open, onClose, projectId: initialProject }: { open: boolean; onClose: () => void; projectId?: ID }) {
  const { projects, createTask } = useData()
  const ai = useAI()
  const buildContext = useAIContext()
  const toast = useToast()
  const [projectId, setProjectId] = useState(initialProject ?? '')
  const [briefing, setBriefing] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!open) return
    setProjectId(initialProject ?? '')
    setBriefing('')
    setDrafts([])
    ai.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialProject])

  const generate = async () => {
    if (!projectId || !briefing.trim()) return
    const res = await ai.run({ task: 'briefing_to_tasks', context: await buildContext({ type: 'project', id: projectId }), input: `Briefing:\n${briefing.trim()}`, jsonSchema: SCHEMA_TASKS as unknown as Record<string, unknown> })
    const tasks = (res?.data as { tasks?: Array<{ title: string; description: string; priority: TaskPriority; due_in_days: number }> } | undefined)?.tasks ?? []
    setDrafts(
      tasks.slice(0, 15).map((t) => ({
        selected: true,
        title: String(t.title).slice(0, 140),
        description: String(t.description ?? '').slice(0, 2000),
        priority: (['baixa', 'media', 'alta', 'urgente'] as const).includes(t.priority) ? t.priority : 'media',
        dueInDays: Math.min(365, Math.max(0, Math.round(Number(t.due_in_days) || 0))),
      })),
    )
  }

  const update = (i: number, patch: Partial<Draft>) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const chosen = drafts.filter((d) => d.selected && d.title.trim())

  const confirmCreate = async () => {
    setCreating(true)
    let ok = 0
    for (const d of chosen) {
      const created = await createTask({
        title: d.title.trim(),
        description: d.description.trim(),
        projectId: projectId || null,
        clientId: null,
        status: 'a_fazer',
        priority: d.priority,
        dueDate: addDays(todayISO(), d.dueInDays),
        completedAt: null,
      })
      if (created) ok++
    }
    setCreating(false)
    if (ok) {
      toast.success(`${ok} tarefa${ok > 1 ? 's' : ''} criada${ok > 1 ? 's' : ''}`)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-accent" /> Briefing → tarefas
        </span>
      }
      description="A IA sugere as tarefas; você revisa e confirma antes de criar."
      footer={
        drafts.length ? (
          <>
            <Button onClick={() => setDrafts([])}>Voltar ao briefing</Button>
            <Button variant="primary" icon={Check} loading={creating} disabled={!chosen.length} onClick={confirmCreate}>
              Criar {chosen.length} tarefa{chosen.length === 1 ? '' : 's'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" icon={Sparkles} loading={ai.loading} disabled={!projectId || !briefing.trim()} onClick={generate}>
              Sugerir tarefas
            </Button>
          </>
        )
      }
    >
      {!drafts.length ? (
        <div className="flex flex-col gap-4">
          <Field label="Projeto" required hint="A IA usa o contexto deste projeto (conhecimento, tarefas existentes…).">
            {(id) => <Select id={id} value={projectId} placeholder="Selecione…" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />}
          </Field>
          <Field label="Briefing" required>
            {(id) => (
              <Textarea id={id} rows={6} maxLength={6000} value={briefing} placeholder="Ex.: Criar a campanha de outubro para a Clínica Aurora, com foco em agendamentos de avaliação…" onChange={(e) => setBriefing(e.target.value)} />
            )}
          </Field>
          {ai.loading && <AILoading label="Quebrando o briefing em tarefas…" />}
          {ai.error && <AIErrorBox message={ai.error} onRetry={generate} />}
          {ai.result && !ai.loading && !ai.error && ((ai.result.data as { tasks?: unknown[] })?.tasks?.length ?? 0) === 0 && (
            <AIErrorBox message="A IA não sugeriu nenhuma tarefa. Tente detalhar mais o briefing." />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ai.result && (
            <div className="flex flex-wrap items-center gap-2">
              <AISourceBadge result={ai.result} />
              {ai.result.notice && <span className="text-[12px] text-subtle">{ai.result.notice}</span>}
            </div>
          )}
          <p className="text-[13px] text-muted">Revise, edite ou desmarque antes de criar:</p>
          <ul className="flex flex-col gap-2">
            {drafts.map((d, i) => (
              <li key={i} className={cn('flex items-start gap-3 rounded-lg border p-3 transition-colors', d.selected ? 'border-line' : 'border-dashed border-line opacity-60')}>
                <input type="checkbox" className="mt-2.5 accent-[var(--accent)]" checked={d.selected} onChange={(e) => update(i, { selected: e.target.checked })} aria-label={`Incluir ${d.title}`} />
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-[1fr_120px_110px]">
                  <Input aria-label="Título" className="col-span-2 sm:col-span-1" value={d.title} onChange={(e) => update(i, { title: e.target.value })} />
                  <Select
                    compact
                    aria-label="Prioridade"
                    value={d.priority}
                    options={Object.entries(TASK_PRIORITY).map(([value, p]) => ({ value, label: p.label }))}
                    onChange={(e) => update(i, { priority: e.target.value as TaskPriority })}
                  />
                  <label className="flex items-center gap-1.5 text-[12px] text-subtle">
                    <Input aria-label="Prazo em dias" type="number" min={0} max={365} className="h-8 w-16 text-[13px]" value={d.dueInDays} onChange={(e) => update(i, { dueInDays: Math.max(0, Number(e.target.value) || 0) })} />
                    dias · {formatDateShort(addDays(todayISO(), d.dueInDays))}
                  </label>
                  {d.description && <p className="col-span-2 text-[12px] text-subtle sm:col-span-3">{d.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}
