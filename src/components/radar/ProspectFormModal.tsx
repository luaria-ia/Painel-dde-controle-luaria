import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { PROSPECT_CONFIDENCE, PROSPECT_STATUS, PROSPECT_STATUS_ORDER } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { useData } from '@/store/useData'
import type { ProspectCompany, ProspectConfidence, ProspectStatus } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  prospect?: ProspectCompany | null
  onSaved?: (prospect: ProspectCompany) => void
}

const COMMON_SOURCES = [
  'Google Maps / Busca Google',
  'LinkedIn Empresa / Sócios',
  'Instagram / Redes Sociais',
  'Receita Federal / CNPJ Público',
  'Site Institucional',
  'Indicação / Networking',
  'Evento / Feira do Setor',
]

export function ProspectFormModal({ open, onClose, prospect, onSaved }: Props) {
  const { createProspect, updateProspect } = useData()
  const toast = useToast()
  const editing = !!prospect

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      name: prospect?.name ?? '',
      segment: prospect?.segment ?? '',
      location: prospect?.location ?? '',
      website: prospect?.website ?? '',
      whatsapp: prospect?.channels?.whatsapp ?? '',
      instagram: prospect?.channels?.instagram ?? '',
      linkedin: prospect?.channels?.linkedin ?? '',
      otherChannels: prospect?.channels?.other ?? '',
      sourcesConsulted: prospect?.sourcesConsulted ?? [],
      lastVerifiedAt: prospect?.lastVerifiedAt ?? new Date().toISOString().slice(0, 10),
      opportunities: prospect?.opportunities ?? '',
      observations: prospect?.observations ?? '',
      confidenceLevel: prospect?.confidenceLevel ?? ('medio' as ProspectConfidence),
      status: prospect?.status ?? ('mapeada' as ProspectStatus),
      nextStep: prospect?.nextStep ?? '',
    }),
    open ? (prospect?.id ?? 'new') : null,
  )

  const [customSource, setCustomSource] = useState('')

  const toggleSource = (source: string) => {
    const list = values.sourcesConsulted
    if (list.includes(source)) {
      set('sourcesConsulted', list.filter((s) => s !== source))
    } else {
      set('sourcesConsulted', [...list, source])
    }
  }

  const addCustomSource = () => {
    const trimmed = customSource.trim()
    if (!trimmed) return
    if (!values.sourcesConsulted.includes(trimmed)) {
      set('sourcesConsulted', [...values.sourcesConsulted, trimmed])
    }
    setCustomSource('')
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (submitting) return

    const errs: Record<string, string> = {}
    if (!values.name.trim()) errs.name = 'Nome da empresa é obrigatório'
    if (!values.segment.trim()) errs.segment = 'Segmento de mercado é obrigatório'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const payload = {
        name: values.name.trim(),
        segment: values.segment.trim(),
        location: values.location.trim(),
        website: values.website.trim(),
        channels: {
          whatsapp: values.whatsapp.trim() || undefined,
          instagram: values.instagram.trim() || undefined,
          linkedin: values.linkedin.trim() || undefined,
          other: values.otherChannels.trim() || undefined,
        },
        sourcesConsulted: values.sourcesConsulted,
        lastVerifiedAt: values.lastVerifiedAt || null,
        opportunities: values.opportunities.trim(),
        observations: values.observations.trim(),
        confidenceLevel: values.confidenceLevel,
        status: values.status,
        nextStep: values.nextStep.trim(),
        clientId: prospect?.clientId ?? null,
        boardCardId: prospect?.boardCardId ?? null,
      }

      let saved: ProspectCompany | null
      if (editing && prospect) {
        saved = await updateProspect(prospect.id, payload)
        toast.success('Empresa prospectada atualizada com sucesso.')
      } else {
        saved = await createProspect(payload)
        toast.success('Empresa registrada no Radar de Prospecção.')
      }

      if (saved && onSaved) onSaved(saved)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar prospecção.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar Prospecção' : 'Nova Empresa no Radar'}
      size="lg"
      onSubmit={() => void handleSubmit()}
      footer={
        <>
          <Button type="button" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {editing ? 'Salvar Alterações' : 'Cadastrar Prospecção'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome da Empresa" required error={errors.name}>
            {(id) => (
              <Input
                id={id}
                value={values.name}
                invalid={!!errors.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex.: Clínica Sorriso & Arte"
                autoFocus
              />
            )}
          </Field>

          <Field label="Segmento de Mercado" required error={errors.segment}>
            {(id) => (
              <Input
                id={id}
                value={values.segment}
                invalid={!!errors.segment}
                onChange={(e) => set('segment', e.target.value)}
                placeholder="Ex.: Odontologia / Saúde"
              />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Localização / Cidade">
            {(id) => (
              <Input
                id={id}
                value={values.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Ex.: Vila Velha / ES"
              />
            )}
          </Field>

          <Field label="Website / Link Oficial">
            {(id) => (
              <Input
                id={id}
                value={values.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://exemplo.com.br"
              />
            )}
          </Field>
        </div>

        <div className="rounded-lg border border-border/70 p-3.5 bg-muted/20 space-y-3">
          <div className="text-[13px] font-medium text-foreground">Canais Públicos de Contato</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="WhatsApp Comercial">
              {(id) => (
                <Input
                  id={id}
                  value={values.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  placeholder="(27) 99999-9999"
                />
              )}
            </Field>

            <Field label="Instagram (@)">
              {(id) => (
                <Input
                  id={id}
                  value={values.instagram}
                  onChange={(e) => set('instagram', e.target.value)}
                  placeholder="@clinicasorriso"
                />
              )}
            </Field>

            <Field label="LinkedIn">
              {(id) => (
                <Input
                  id={id}
                  value={values.linkedin}
                  onChange={(e) => set('linkedin', e.target.value)}
                  placeholder="linkedin.com/company/..."
                />
              )}
            </Field>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[13px] font-medium text-foreground">Fontes Públicas Consultadas</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {COMMON_SOURCES.map((source) => {
              const checked = values.sourcesConsulted.includes(source)
              return (
                <label
                  key={source}
                  className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                    checked ? 'bg-primary/10 border-primary/40 text-foreground' : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSource(source)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span>{source}</span>
                </label>
              )
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              placeholder="Outra fonte consultada..."
              className="text-xs h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomSource()
                }
              }}
            />
            <Button type="button" size="sm" onClick={addCustomSource}>
              Adicionar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Data da Última Verificação">
            {(id) => (
              <Input
                id={id}
                type="date"
                value={values.lastVerifiedAt ?? ''}
                onChange={(e) => set('lastVerifiedAt', e.target.value)}
              />
            )}
          </Field>

          <Field label="Nível de Confiança">
            {(id) => (
              <Select
                id={id}
                value={values.confidenceLevel}
                onChange={(e) => set('confidenceLevel', e.target.value as ProspectConfidence)}
                options={Object.entries(PROSPECT_CONFIDENCE).map(([value, conf]) => ({
                  value,
                  label: conf.label,
                }))}
              />
            )}
          </Field>

          <Field label="Status Comercial">
            {(id) => (
              <Select
                id={id}
                value={values.status}
                onChange={(e) => set('status', e.target.value as ProspectStatus)}
                options={PROSPECT_STATUS_ORDER.map((value) => ({
                  value,
                  label: PROSPECT_STATUS[value].label,
                }))}
              />
            )}
          </Field>
        </div>

        <Field label="Oportunidades Comerciais Identificadas">
          {(id) => (
            <Textarea
              id={id}
              value={values.opportunities}
              onChange={(e) => set('opportunities', e.target.value)}
              rows={2}
              placeholder="Ex.: Site não responsivo, perfil do Instagram sem postagens há 45 dias, sem atendimento via WhatsApp integrado."
            />
          )}
        </Field>

        <Field
          label="Observações e Hipóteses"
          hint="Importante: hipóteses levantadas devem ser validadas em contato e não tratadas como fatos consumados."
        >
          {(id) => (
            <Textarea
              id={id}
              value={values.observations}
              onChange={(e) => set('observations', e.target.value)}
              rows={2}
              placeholder="Ex.: Empresa parece estar expandindo filial; possível demanda por posicionamento e gestão de tráfego local."
            />
          )}
        </Field>

        <Field label="Próximo Passo / Ação Recomendada">
          {(id) => (
            <Input
              id={id}
              value={values.nextStep}
              onChange={(e) => set('nextStep', e.target.value)}
              placeholder="Ex.: Enviar mensagem de apresentação personalizada via WhatsApp até sexta-feira."
            />
          )}
        </Field>
      </div>
    </Modal>
  )
}
