import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { EVENT_STATUS, EVENT_TYPE } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { useRemove } from '@/hooks/useRemove'
import { todayISO } from '@/lib/format'
import { useData } from '@/store/useData'
import type { CalendarEvent, EventStatus, EventType, ID, ISODate } from '@/types'

export interface EventDefaults {
  date?: ISODate
  projectId?: ID | null
  clientId?: ID | null
}

interface Props {
  open: boolean
  onClose: () => void
  event?: CalendarEvent | null
  defaults?: EventDefaults
}

export function EventFormModal({ open, onClose, event, defaults }: Props) {
  const { createEvent, updateEvent, deleteEvent, projects, clients } = useData()
  const toast = useToast()
  const remove = useRemove()
  const editing = !!event

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      title: event?.title ?? '',
      description: event?.description ?? '',
      type: event?.type ?? ('reuniao' as EventType),
      date: event?.date ?? defaults?.date ?? todayISO(),
      startTime: event?.startTime ?? '',
      endTime: event?.endTime ?? '',
      projectId: event?.projectId ?? defaults?.projectId ?? '',
      clientId: event?.clientId ?? defaults?.clientId ?? '',
      status: event?.status ?? ('agendado' as EventStatus),
    }),
    open ? (event?.id ?? `new-${defaults?.date ?? ''}`) : null,
  )

  const submit = async () => {
    const errs: typeof errors = {}
    if (!values.title.trim()) errs.title = 'Dê um título ao evento.'
    if (!values.date) errs.date = 'Informe a data.'
    if (values.endTime && !values.startTime) errs.startTime = 'Informe o horário inicial.'
    if (values.endTime && values.startTime && values.endTime < values.startTime) errs.endTime = 'O fim deve ser depois do início.'
    if (Object.keys(errs).length) return setErrors(errs)

    setSubmitting(true)
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      type: values.type,
      date: values.date,
      startTime: values.startTime || null,
      endTime: values.endTime || null,
      projectId: values.projectId || null,
      clientId: values.clientId || null,
      status: values.status,
    }
    const result = editing ? await updateEvent(event!.id, payload) : await createEvent(payload)
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Evento atualizado' : 'Evento criado')
    onClose()
  }

  const onDelete = async () => {
    if (await remove({ what: 'evento', name: event!.title, action: () => deleteEvent(event!.id) })) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar evento' : 'Novo evento'}
      description={editing ? undefined : 'Reuniões, eventos e compromissos com data e hora.'}
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
            {editing ? 'Salvar alterações' : 'Criar evento'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Título" required error={errors.title}>
          {(id) => <Input id={id} value={values.title} invalid={!!errors.title} placeholder="Ex.: Reunião com cliente" maxLength={140} onChange={(e) => set('title', e.target.value)} />}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo">
            {(id) => (
              <Select id={id} value={values.type} options={Object.entries(EVENT_TYPE).map(([value, t]) => ({ value, label: t.label }))} onChange={(e) => set('type', e.target.value as EventType)} />
            )}
          </Field>
          <Field label="Data" required error={errors.date}>
            {(id) => <Input id={id} type="date" value={values.date} invalid={!!errors.date} onChange={(e) => set('date', e.target.value)} />}
          </Field>
          <Field label="Início" hint="Vazio = dia inteiro" error={errors.startTime}>
            {(id) => <Input id={id} type="time" value={values.startTime} invalid={!!errors.startTime} onChange={(e) => set('startTime', e.target.value)} />}
          </Field>
          <Field label="Fim" hint="Opcional" error={errors.endTime}>
            {(id) => <Input id={id} type="time" value={values.endTime} invalid={!!errors.endTime} onChange={(e) => set('endTime', e.target.value)} />}
          </Field>
          <Field label="Projeto" hint="Opcional">
            {(id) => <Select id={id} value={values.projectId} placeholder="Nenhum" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => set('projectId', e.target.value)} />}
          </Field>
          <Field label="Cliente" hint="Opcional">
            {(id) => <Select id={id} value={values.clientId} placeholder="Nenhum" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => set('clientId', e.target.value)} />}
          </Field>
          <Field label="Status" className="sm:col-span-2">
            {(id) => (
              <Select id={id} value={values.status} options={Object.entries(EVENT_STATUS).map(([value, s]) => ({ value, label: s.label }))} onChange={(e) => set('status', e.target.value as EventStatus)} />
            )}
          </Field>
        </div>
        <Field label="Descrição">
          {(id) => <Textarea id={id} value={values.description} placeholder="Pauta, local, link da chamada…" onChange={(e) => set('description', e.target.value)} />}
        </Field>
      </div>
    </Modal>
  )
}
