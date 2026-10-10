import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { TASK_PRIORITY, TASK_STATUS, TASK_STATUS_ORDER } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { useRemove } from '@/hooks/useRemove'
import { useData } from '@/store/useData'
import type { ID, Task, TaskPriority, TaskStatus } from '@/types'

export interface TaskDefaults {
  projectId?: ID | null
  clientId?: ID | null
  status?: TaskStatus
}

interface Props {
  open: boolean
  onClose: () => void
  task?: Task | null
  defaults?: TaskDefaults
}

export function TaskFormModal({ open, onClose, task, defaults }: Props) {
  const { createTask, updateTask, deleteTask, projects, clients } = useData()
  const toast = useToast()
  const remove = useRemove()
  const editing = !!task

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      title: task?.title ?? '',
      description: task?.description ?? '',
      projectId: task?.projectId ?? defaults?.projectId ?? '',
      clientId: task?.clientId ?? defaults?.clientId ?? '',
      status: task?.status ?? defaults?.status ?? ('a_fazer' as TaskStatus),
      priority: task?.priority ?? ('media' as TaskPriority),
      dueDate: task?.dueDate ?? '',
    }),
    open ? (task?.id ?? 'new') : null,
  )

  // Clientes do projeto escolhido aparecem primeiro.
  const projectClients = clients.filter((c) => values.projectId && c.projectIds.includes(values.projectId))
  const otherClients = clients.filter((c) => !projectClients.includes(c))
  const clientOptions = [...projectClients, ...otherClients].map((c) => ({
    value: c.id,
    label: projectClients.includes(c) || !values.projectId ? c.name : `${c.name} (outro projeto)`,
  }))

  const submit = async () => {
    const title = values.title.trim()
    if (!title) return setErrors({ title: 'Escreva um título para a tarefa.' })
    setSubmitting(true)
    const payload = {
      title,
      description: values.description.trim(),
      projectId: values.projectId || null,
      clientId: values.clientId || null,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || null,
    }
    const result = editing ? await updateTask(task!.id, payload) : await createTask({ ...payload, completedAt: null })
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Tarefa atualizada' : 'Tarefa criada')
    onClose()
  }

  const onDelete = async () => {
    if (await remove({ what: 'tarefa', name: task!.title, action: () => deleteTask(task!.id) })) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar tarefa' : 'Nova tarefa'}
      onSubmit={submit}
      footer={
        <>
          {editing && (
            <Button variant="ghost" icon={Trash2} onClick={onDelete} className="text-rose-600 sm:mr-auto dark:text-rose-400">
              Excluir
            </Button>
          )}
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {editing ? 'Salvar alterações' : 'Criar tarefa'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Título" required error={errors.title}>
          {(id) => (
            <Input id={id} value={values.title} invalid={!!errors.title} placeholder="Ex.: Criar carrossel de novembro" maxLength={140} onChange={(e) => set('title', e.target.value)} />
          )}
        </Field>
        <Field label="Descrição">
          {(id) => <Textarea id={id} value={values.description} placeholder="Detalhes, links, checklist…" onChange={(e) => set('description', e.target.value)} />}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Projeto">
            {(id) => (
              <Select
                id={id}
                value={values.projectId}
                placeholder="Sem projeto"
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                onChange={(e) => set('projectId', e.target.value)}
              />
            )}
          </Field>
          <Field label="Cliente" hint="Opcional">
            {(id) => <Select id={id} value={values.clientId} placeholder="Nenhum" options={clientOptions} onChange={(e) => set('clientId', e.target.value)} />}
          </Field>
          <Field label="Status">
            {(id) => (
              <Select
                id={id}
                value={values.status}
                options={TASK_STATUS_ORDER.map((s) => ({ value: s, label: TASK_STATUS[s].label }))}
                onChange={(e) => set('status', e.target.value as TaskStatus)}
              />
            )}
          </Field>
          <Field label="Prioridade">
            {(id) => (
              <Select
                id={id}
                value={values.priority}
                options={Object.entries(TASK_PRIORITY).map(([value, p]) => ({ value, label: p.label }))}
                onChange={(e) => set('priority', e.target.value as TaskPriority)}
              />
            )}
          </Field>
          <Field label="Prazo" className="sm:col-span-2">
            {(id) => <Input id={id} type="date" value={values.dueDate} onChange={(e) => set('dueDate', e.target.value)} />}
          </Field>
        </div>
      </div>
    </Modal>
  )
}
