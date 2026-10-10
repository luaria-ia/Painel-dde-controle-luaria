import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { CONTRACT_PERIODICITY, CONTRACT_STATUS } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { centsToInput, parseCurrencyToCents, todayISO } from '@/lib/format'
import { useData } from '@/store/useData'
import type { Contract, ContractPeriodicity, ContractStatus, ID } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  contract?: Contract | null
  defaults?: { clientId?: ID; projectId?: ID }
  onCreated?: (c: Contract) => void
}

export function ContractFormModal({ open, onClose, contract, defaults, onCreated }: Props) {
  const { createContract, updateContract, clients, projects } = useData()
  const toast = useToast()
  const editing = !!contract

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      title: contract?.title ?? '',
      clientId: contract?.clientId ?? defaults?.clientId ?? '',
      projectId: contract?.projectId ?? defaults?.projectId ?? '',
      service: contract?.service ?? '',
      amount: contract ? centsToInput(contract.amountCents) : '',
      periodicity: contract?.periodicity ?? ('mensal' as ContractPeriodicity),
      startDate: contract?.startDate ?? todayISO(),
      endDate: contract?.endDate ?? '',
      nextRenewal: contract?.nextRenewal ?? '',
      status: contract?.status ?? ('ativo' as ContractStatus),
      notes: contract?.notes ?? '',
    }),
    open ? (contract?.id ?? 'new') : null,
  )

  // Ao escolher o cliente, sugere o primeiro projeto relacionado.
  const pickClient = (clientId: string) => {
    set('clientId', clientId)
    if (!values.projectId) {
      const first = clients.find((c) => c.id === clientId)?.projectIds[0]
      if (first) set('projectId', first)
    }
  }

  const submit = async () => {
    const errs: typeof errors = {}
    const amountCents = values.amount.trim() ? parseCurrencyToCents(values.amount) : 0
    if (!values.title.trim()) errs.title = 'Dê um nome ao contrato.'
    if (!values.clientId) errs.clientId = 'Escolha o cliente.'
    if (amountCents === null || amountCents < 0) errs.amount = 'Valor inválido.'
    if (!values.startDate) errs.startDate = 'Informe a data de início.'
    if (values.endDate && values.endDate < values.startDate) errs.endDate = 'O término deve ser depois do início.'
    if (Object.keys(errs).length) return setErrors(errs)

    setSubmitting(true)
    const payload = {
      title: values.title.trim(),
      clientId: values.clientId || null,
      projectId: values.projectId || null,
      service: values.service.trim(),
      amountCents: amountCents!,
      periodicity: values.periodicity,
      startDate: values.startDate,
      endDate: values.endDate || null,
      nextRenewal: values.nextRenewal || null,
      status: values.status,
      notes: values.notes.trim(),
    }
    const result = editing ? await updateContract(contract!.id, payload) : await createContract(payload)
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Contrato atualizado' : 'Contrato criado')
    onClose()
    if (!editing) onCreated?.(result)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar contrato' : 'Novo contrato'}
      size="lg"
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {editing ? 'Salvar alterações' : 'Criar contrato'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome do contrato" required error={errors.title} className="sm:col-span-2">
          {(id) => <Input id={id} value={values.title} invalid={!!errors.title} placeholder="Ex.: Gestão de Redes Sociais — Clínica X" maxLength={140} onChange={(e) => set('title', e.target.value)} />}
        </Field>
        <Field label="Cliente" required error={errors.clientId}>
          {(id) => (
            <Select
              id={id}
              value={values.clientId}
              invalid={!!errors.clientId}
              placeholder={clients.length ? 'Selecione…' : 'Cadastre um cliente primeiro'}
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              onChange={(e) => pickClient(e.target.value)}
            />
          )}
        </Field>
        <Field label="Projeto" hint="Opcional">
          {(id) => <Select id={id} value={values.projectId} placeholder="Nenhum" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => set('projectId', e.target.value)} />}
        </Field>
        <Field label="Serviço" className="sm:col-span-2">
          {(id) => <Input id={id} value={values.service} placeholder="O que está incluído" maxLength={200} onChange={(e) => set('service', e.target.value)} />}
        </Field>
        <Field label="Valor (R$)" hint="Por ciclo da periodicidade" error={errors.amount}>
          {(id) => <Input id={id} inputMode="decimal" value={values.amount} invalid={!!errors.amount} placeholder="0,00" onChange={(e) => set('amount', e.target.value)} />}
        </Field>
        <Field label="Periodicidade">
          {(id) => (
            <Select
              id={id}
              value={values.periodicity}
              options={Object.entries(CONTRACT_PERIODICITY).map(([value, p]) => ({ value, label: p.label }))}
              onChange={(e) => set('periodicity', e.target.value as ContractPeriodicity)}
            />
          )}
        </Field>
        <Field label="Início" required error={errors.startDate}>
          {(id) => <Input id={id} type="date" value={values.startDate} invalid={!!errors.startDate} onChange={(e) => set('startDate', e.target.value)} />}
        </Field>
        <Field label="Término" hint="Opcional" error={errors.endDate}>
          {(id) => <Input id={id} type="date" value={values.endDate} invalid={!!errors.endDate} onChange={(e) => set('endDate', e.target.value)} />}
        </Field>
        <Field label="Próxima renovação" hint="Opcional — gera o alerta de vencimento">
          {(id) => <Input id={id} type="date" value={values.nextRenewal} onChange={(e) => set('nextRenewal', e.target.value)} />}
        </Field>
        <Field label="Status">
          {(id) => (
            <Select id={id} value={values.status} options={Object.entries(CONTRACT_STATUS).map(([value, s]) => ({ value, label: s.label }))} onChange={(e) => set('status', e.target.value as ContractStatus)} />
          )}
        </Field>
        <Field label="Observações" className="sm:col-span-2">
          {(id) => <Textarea id={id} value={values.notes} placeholder="Cláusulas importantes, reajustes, combinados…" onChange={(e) => set('notes', e.target.value)} />}
        </Field>
      </div>
    </Modal>
  )
}
