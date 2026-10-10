import { useEffect, useState } from 'react'
import { ArrowDown, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { AUTOMATION_ACTION, AUTOMATION_TRIGGER, SEVERITY, TASK_PRIORITY } from '@/config/labels'
import { useRemove } from '@/hooks/useRemove'
import { parseCurrencyToCents, centsToInput } from '@/lib/format'
import { useData } from '@/store/useData'
import type { Automation, AutomationActionType, AutomationTrigger, NotificationSeverity, TaskPriority } from '@/types'

const VARS: Record<string, string> = {
  task: '{titulo}, {projeto}',
  contract: '{titulo}, {dias}, {projeto}',
  content: '{titulo}, {projeto}',
  transaction: '{titulo}, {valor}, {projeto}',
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold tracking-wide text-subtle uppercase">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-[11px] text-accent">{n}</span>
        {title}
      </p>
      {children}
    </div>
  )
}

export function AutomationFormModal({ open, onClose, automation }: { open: boolean; onClose: () => void; automation?: Automation | null }) {
  const { createAutomation, updateAutomation, deleteAutomation, projects } = useData()
  const toast = useToast()
  const remove = useRemove()
  const editing = !!automation

  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState<AutomationTrigger>('task_overdue')
  const [projectId, setProjectId] = useState('')
  const [days, setDays] = useState('7')
  const [priority, setPriority] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [actionType, setActionType] = useState<AutomationActionType>('notify')
  const [severity, setSeverity] = useState<NotificationSeverity>('warning')
  const [message, setMessage] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('media')
  const [dueInDays, setDueInDays] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const a = automation
    setName(a?.name ?? '')
    setTrigger(a?.trigger ?? 'task_overdue')
    setProjectId(a?.conditions.projectId ?? '')
    setDays(String(a?.conditions.days ?? 7))
    setPriority(a?.conditions.priority ?? '')
    setMinAmount(a?.conditions.minAmountCents ? centsToInput(a.conditions.minAmountCents) : '')
    setActionType(a?.action.type ?? 'notify')
    setSeverity(a?.action.severity ?? 'warning')
    setMessage(a?.action.message ?? '')
    setTaskTitle(a?.action.taskTitle ?? '')
    setTaskPriority(a?.action.taskPriority ?? 'media')
    setDueInDays(String(a?.action.dueInDays ?? 1))
    setError(null)
  }, [open, automation])

  const entity = AUTOMATION_TRIGGER[trigger].entity
  const actions = (Object.keys(AUTOMATION_ACTION) as AutomationActionType[]).filter((t) => !AUTOMATION_ACTION[t].triggers || AUTOMATION_ACTION[t].triggers!.includes(trigger))
  useEffect(() => {
    if (!actions.includes(actionType)) setActionType('notify')
  }, [trigger]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!name.trim()) return setError('Dê um nome à regra.')
    const cents = minAmount.trim() ? parseCurrencyToCents(minAmount) : null
    if (minAmount.trim() && (cents === null || cents < 0)) return setError('Valor mínimo inválido.')
    setSaving(true)
    const payload = {
      name: name.trim(),
      enabled: automation?.enabled ?? true,
      trigger,
      conditions: {
        projectId: projectId || null,
        ...(trigger === 'contract_due' ? { days: Math.min(180, Math.max(1, Number(days) || 7)) } : {}),
        ...(entity === 'task' && priority ? { priority: priority as TaskPriority } : {}),
        ...(entity === 'transaction' && cents ? { minAmountCents: cents } : {}),
      },
      action: {
        type: actionType,
        ...(actionType === 'notify' ? { severity, message: message.trim() } : {}),
        ...(actionType === 'log' ? { message: message.trim() } : {}),
        ...(actionType === 'create_task' ? { taskTitle: taskTitle.trim(), taskPriority, dueInDays: Math.min(365, Math.max(0, Number(dueInDays) || 0)) } : {}),
      },
      isSystem: automation?.isSystem ?? false,
      lastRunAt: automation?.lastRunAt ?? null,
    }
    const res = editing ? await updateAutomation(automation!.id, payload) : await createAutomation(payload)
    setSaving(false)
    if (!res) return
    toast.success(editing ? 'Regra atualizada' : 'Regra criada')
    onClose()
  }

  const onDelete = async () => {
    if (await remove({ what: 'regra', name: automation!.name, action: () => deleteAutomation(automation!.id) })) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar automação' : 'Nova automação'}
      description="Quando algo acontecer → se as condições baterem → execute a ação."
      onSubmit={submit}
      footer={
        <>
          {editing && (
            <Button variant="ghost" icon={Trash2} onClick={onDelete} className="text-rose-600 sm:mr-auto dark:text-rose-400">
              Excluir
            </Button>
          )}
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={saving}>
            {editing ? 'Salvar' : 'Criar regra'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nome da regra" required error={error}>
          {(id) => <Input id={id} value={name} maxLength={120} placeholder="Ex.: Avisar contratos vencendo" onChange={(e) => (setName(e.target.value), setError(null))} />}
        </Field>

        <Step n={1} title="Quando">
          <Select aria-label="Gatilho" value={trigger} options={Object.entries(AUTOMATION_TRIGGER).map(([value, t]) => ({ value, label: t.label }))} onChange={(e) => setTrigger(e.target.value as AutomationTrigger)} />
          <p className="mt-2 text-[12px] text-subtle">
            {AUTOMATION_TRIGGER[trigger].kind === 'state' ? 'Verificado automaticamente ao abrir o app e a cada 10 minutos. Roda uma vez por item.' : 'Dispara no momento em que isso acontece no app.'}
          </p>
        </Step>
        <ArrowDown className="mx-auto h-4 w-4 text-subtle" />
        <Step n={2} title="Condições (opcional)">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Projeto">
              {(id) => <Select id={id} value={projectId} placeholder="Qualquer projeto" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />}
            </Field>
            {trigger === 'contract_due' && (
              <Field label="Antecedência (dias)">
                {(id) => <Input id={id} type="number" min={1} max={180} value={days} onChange={(e) => setDays(e.target.value)} />}
              </Field>
            )}
            {entity === 'task' && (
              <Field label="Prioridade da tarefa">
                {(id) => <Select id={id} value={priority} placeholder="Qualquer" options={Object.entries(TASK_PRIORITY).map(([value, p]) => ({ value, label: p.label }))} onChange={(e) => setPriority(e.target.value)} />}
              </Field>
            )}
            {entity === 'transaction' && (
              <Field label="Valor mínimo (R$)">
                {(id) => <Input id={id} inputMode="decimal" value={minAmount} placeholder="0,00" onChange={(e) => setMinAmount(e.target.value)} />}
              </Field>
            )}
          </div>
        </Step>
        <ArrowDown className="mx-auto h-4 w-4 text-subtle" />
        <Step n={3} title="Então">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Ação" className="sm:col-span-2" hint={AUTOMATION_ACTION[actionType].description}>
              {(id) => <Select id={id} value={actionType} options={actions.map((a) => ({ value: a, label: AUTOMATION_ACTION[a].label }))} onChange={(e) => setActionType(e.target.value as AutomationActionType)} />}
            </Field>
            {actionType === 'notify' && (
              <Field label="Tipo de alerta">
                {(id) => <Select id={id} value={severity} options={Object.entries(SEVERITY).map(([value, s]) => ({ value, label: s.label }))} onChange={(e) => setSeverity(e.target.value as NotificationSeverity)} />}
              </Field>
            )}
            {(actionType === 'notify' || actionType === 'log') && (
              <Field label="Mensagem" hint={`Variáveis: ${VARS[entity]}`} className={actionType === 'log' ? 'sm:col-span-2' : ''}>
                {(id) => <Input id={id} value={message} maxLength={200} placeholder="Ex.: Atenção: {titulo}" onChange={(e) => setMessage(e.target.value)} />}
              </Field>
            )}
            {actionType === 'create_task' && (
              <>
                <Field label="Título da tarefa" hint={`Variáveis: ${VARS[entity]}`} className="sm:col-span-2">
                  {(id) => <Input id={id} value={taskTitle} maxLength={140} placeholder="Ex.: Renovar {titulo}" onChange={(e) => setTaskTitle(e.target.value)} />}
                </Field>
                <Field label="Prioridade">
                  {(id) => <Select id={id} value={taskPriority} options={Object.entries(TASK_PRIORITY).map(([value, p]) => ({ value, label: p.label }))} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)} />}
                </Field>
                <Field label="Prazo (dias a partir de hoje)">
                  {(id) => <Input id={id} type="number" min={0} max={365} value={dueInDays} onChange={(e) => setDueInDays(e.target.value)} />}
                </Field>
              </>
            )}
          </div>
        </Step>
      </div>
    </Modal>
  )
}
