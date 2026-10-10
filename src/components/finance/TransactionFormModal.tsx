import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Segmented } from '@/components/ui/Segmented'
import { useToast } from '@/components/ui/toastContext'
import { EXPENSE_CATEGORIES, EXPENSE_STATUS, INCOME_CATEGORIES, INCOME_STATUS } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { centsToInput, parseCurrencyToCents, todayISO } from '@/lib/format'
import { useData } from '@/store/useData'
import type { ID, Transaction, TransactionStatus, TransactionType } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  transaction?: Transaction | null
  type?: TransactionType
  defaults?: { projectId?: ID; clientId?: ID }
}

export function TransactionFormModal({ open, onClose, transaction, type = 'receita', defaults }: Props) {
  const { createTransaction, updateTransaction, projects, clients, transactions } = useData()
  const toast = useToast()
  const editing = !!transaction

  const { values, set, setValues, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => {
      const t = transaction?.type ?? type
      return {
        type: t,
        description: transaction?.description ?? '',
        amount: transaction ? centsToInput(transaction.amountCents) : '',
        date: transaction?.date ?? todayISO(),
        category: transaction?.category ?? '',
        projectId: transaction?.projectId ?? defaults?.projectId ?? '',
        clientId: transaction?.clientId ?? defaults?.clientId ?? '',
        status: transaction?.status ?? ((t === 'receita' ? 'recebido' : 'pago') as TransactionStatus),
        recurring: transaction?.recurring ?? (transaction?.recurrencePeriod === 'mensal' || transaction?.category?.toLowerCase() === 'mensalidade') ?? false,
        recurringDay: transaction?.recurringDay ? String(transaction.recurringDay) : (transaction?.date ? String(parseInt(transaction.date.split('-')[2], 10)) : ''),
      }
    },
    open ? (transaction?.id ?? `new-${type}`) : null,
  )

  const isIncome = values.type === 'receita'
  const statusMap = isIncome ? INCOME_STATUS : EXPENSE_STATUS
  // Sugestões: categorias padrão + categorias já usadas pelo usuário + categorias de recorrência.
  const baseSuggestions = isIncome
    ? ['Mensalidade', 'Implementação / Setup', ...INCOME_CATEGORIES]
    : ['Assinatura / Ferramentas', 'Servidores / APIs', ...EXPENSE_CATEGORIES]
  const categorySuggestions = Array.from(
    new Set([...baseSuggestions, ...transactions.filter((t) => t.type === values.type).map((t) => t.category)]),
  ).filter(Boolean)

  const switchType = (t: TransactionType) =>
    setValues((v) => ({ ...v, type: t, status: t === 'receita' ? 'recebido' : 'pago', category: '', clientId: t === 'despesa' ? '' : v.clientId }))

  const submit = async () => {
    const errs: typeof errors = {}
    const amountCents = parseCurrencyToCents(values.amount)
    if (!values.description.trim()) errs.description = 'Descreva o lançamento.'
    if (amountCents === null || amountCents <= 0) errs.amount = 'Informe um valor maior que zero.'
    if (!values.date) errs.date = 'Informe a data.'
    if (isIncome && !values.projectId) errs.projectId = 'Escolha o projeto desta receita.'
    if (Object.keys(errs).length) return setErrors(errs)

    setSubmitting(true)
    const recDay = values.recurring
      ? (values.recurringDay ? parseInt(values.recurringDay, 10) : parseInt(values.date.split('-')[2], 10))
      : null
    const payload = {
      type: values.type,
      description: values.description.trim(),
      amountCents: amountCents!,
      date: values.date,
      category: values.category.trim() || (values.recurring ? (isIncome ? 'Mensalidade' : 'Ferramentas') : 'Outros'),
      projectId: values.projectId || null,
      clientId: isIncome ? values.clientId || null : null,
      status: values.status,
      recurring: values.recurring,
      recurrencePeriod: (values.recurring ? 'mensal' : 'nenhuma') as 'mensal' | 'nenhuma',
      recurringDay: recDay && !isNaN(recDay) ? recDay : null,
    }
    const result = editing ? await updateTransaction(transaction!.id, payload) : await createTransaction(payload)
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Lançamento atualizado' : isIncome ? 'Receita registrada' : 'Despesa registrada')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Editar ${isIncome ? 'receita' : 'despesa'}` : isIncome ? 'Nova receita' : 'Nova despesa'}
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {editing ? 'Salvar alterações' : 'Registrar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!editing && (
          <Segmented
            ariaLabel="Tipo de lançamento"
            value={values.type}
            onChange={switchType}
            options={[
              { value: 'receita', label: 'Receita' },
              { value: 'despesa', label: 'Despesa' },
            ]}
          />
        )}
        <Field label="Descrição" required error={errors.description}>
          {(id) => (
            <Input
              id={id}
              value={values.description}
              invalid={!!errors.description}
              placeholder={isIncome ? 'Ex.: Mensalidade de outubro' : 'Ex.: Assinatura de ferramenta'}
              onChange={(e) => set('description', e.target.value)}
            />
          )}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Valor (R$)" required error={errors.amount}>
            {(id) => (
              <Input id={id} inputMode="decimal" value={values.amount} invalid={!!errors.amount} placeholder="0,00" onChange={(e) => set('amount', e.target.value)} />
            )}
          </Field>
          <Field label="Data" required error={errors.date}>
            {(id) => <Input id={id} type="date" value={values.date} invalid={!!errors.date} onChange={(e) => set('date', e.target.value)} />}
          </Field>
          <Field label="Categoria">
            {(id) => (
              <>
                <Input id={id} list={`${id}-list`} value={values.category} placeholder="Escolha ou digite" onChange={(e) => set('category', e.target.value)} />
                <datalist id={`${id}-list`}>
                  {categorySuggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
          <Field label="Status">
            {(id) => (
              <Select
                id={id}
                value={values.status}
                options={Object.entries(statusMap).map(([value, s]) => ({ value, label: s.label }))}
                onChange={(e) => set('status', e.target.value as TransactionStatus)}
              />
            )}
          </Field>
          <Field label="Projeto" required={isIncome} hint={isIncome ? undefined : 'Opcional'} error={errors.projectId}>
            {(id) => (
              <Select
                id={id}
                value={values.projectId}
                invalid={!!errors.projectId}
                placeholder={isIncome ? 'Selecione…' : 'Geral (sem projeto)'}
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                onChange={(e) => set('projectId', e.target.value)}
              />
            )}
          </Field>
          {isIncome && (
            <Field label="Cliente" hint="Opcional">
              {(id) => (
                <Select
                  id={id}
                  value={values.clientId}
                  placeholder="Nenhum"
                  options={clients.map((c) => ({ value: c.id, label: c.name }))}
                  onChange={(e) => set('clientId', e.target.value)}
                />
              )}
            </Field>
          )}
        </div>

        {/* Recorrência Mensal (Opcional) */}
        <div className="rounded-xl border border-line bg-surface-subtle/50 p-3.5 sm:p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-line text-accent focus:ring-accent"
              checked={values.recurring}
              onChange={(e) => {
                const checked = e.target.checked
                setValues((v) => ({
                  ...v,
                  recurring: checked,
                  category: checked && !v.category ? (v.type === 'receita' ? 'Mensalidade' : 'Assinatura / Ferramentas') : v.category,
                  recurringDay: checked && !v.recurringDay ? String(parseInt(v.date.split('-')[2], 10) || 10) : v.recurringDay,
                }))
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-fg">Lançamento recorrente mensal (Mensalidade)</span>
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider">Opcional</span>
              </div>
              <p className="mt-0.5 text-[12px] text-muted">
                {isIncome
                  ? 'Mensalidade de cliente (manutenção, suporte e evolução de IA todo mês, além do valor de implementação).'
                  : 'Despesa fixa recorrente da Luaria.IA (assinatura de ferramenta, infraestrutura, servidores ou APIs).'}
              </p>
            </div>
          </label>

          {values.recurring && (
            <div className="mt-3.5 border-t border-line/60 pt-3">
              <Field label="Dia do vencimento / cobrança todo mês" hint="Dia entre 1 e 31">
                {(id) => (
                  <Input
                    id={id}
                    type="number"
                    min={1}
                    max={31}
                    value={values.recurringDay}
                    placeholder="Ex.: 10"
                    onChange={(e) => set('recurringDay', e.target.value)}
                  />
                )}
              </Field>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
