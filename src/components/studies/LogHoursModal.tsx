import { Field, Input, Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { ACTIVE_TRACKS } from '@/data/studies'
import { useFormState } from '@/hooks/useFormState'
import { todayISO } from '@/lib/format'
import { formatMinutes } from '@/lib/studies'
import { useStudies } from '@/store/studiesContext'

export function LogHoursModal({ open, onClose, trackId }: { open: boolean; onClose: () => void; trackId?: string }) {
  const { logHours } = useStudies()
  const toast = useToast()
  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      date: todayISO(),
      hours: '1',
      minutes: '30',
      trackId: trackId ?? ACTIVE_TRACKS[0].id,
      note: '',
    }),
    open ? (trackId ?? 'new') : null,
  )

  const submit = async () => {
    const minutes = (Number(values.hours) || 0) * 60 + (Number(values.minutes) || 0)
    const errs: typeof errors = {}
    if (!values.date || values.date > todayISO()) errs.date = 'Informe uma data até hoje.'
    if (minutes <= 0) errs.hours = 'Informe o tempo estudado.'
    else if (minutes > 1440) errs.hours = 'No máximo 24h por registro.'
    if (Object.keys(errs).length) return setErrors(errs)
    setSubmitting(true)
    const created = await logHours({
      date: values.date,
      minutes,
      trackId: values.trackId,
      note: values.note.trim(),
    })
    setSubmitting(false)
    if (!created) return
    toast.success(`${formatMinutes(minutes)} registradas`)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar horas de estudo"
      size="sm"
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Registrar
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Data" required error={errors.date}>
          {(id) => <Input id={id} type="date" max={todayISO()} value={values.date} invalid={!!errors.date} onChange={(e) => set('date', e.target.value)} />}
        </Field>
        <Field label="Tempo" required error={errors.hours}>
          {(id) => (
            <div className="flex gap-2">
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                min={0}
                max={24}
                aria-label="Horas"
                value={values.hours}
                invalid={!!errors.hours}
                onChange={(e) => set('hours', e.target.value)}
              />
              <Select
                aria-label="Minutos"
                value={values.minutes}
                options={['0', '15', '30', '45'].map((m) => ({
                  value: m,
                  label: `${m} min`,
                }))}
                onChange={(e) => set('minutes', e.target.value)}
              />
            </div>
          )}
        </Field>
        <Field label="Trilha" className="sm:col-span-2">
          {(id) => (
            <Select
              id={id}
              value={values.trackId}
              options={ACTIVE_TRACKS.map((t) => ({
                value: t.id,
                label: t.title,
              }))}
              onChange={(e) => set('trackId', e.target.value)}
            />
          )}
        </Field>
        <Field label="Observação" hint="Opcional" className="sm:col-span-2">
          {(id) => <Input id={id} maxLength={300} value={values.note} placeholder="Ex.: Estudei planejamento de conteúdo." onChange={(e) => set('note', e.target.value)} />}
        </Field>
      </div>
    </Modal>
  )
}
