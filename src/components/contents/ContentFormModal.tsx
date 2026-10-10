import { CheckCircle2, Image as ImageIcon, RotateCcw, Trash2 } from 'lucide-react'
import { ContentAssist } from '@/components/ai/ContentAssist'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { CONTENT_STATUS, CONTENT_STATUS_ORDER, CONTENT_TYPE } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { useRemove } from '@/hooks/useRemove'
import { useData } from '@/store/useData'
import type { Content, ContentStatus, ContentType, ID } from '@/types'

export interface ContentDefaults {
  projectId?: ID | null
  clientId?: ID | null
  status?: ContentStatus
}

interface Props {
  open: boolean
  onClose: () => void
  content?: Content | null
  defaults?: ContentDefaults
}

export function ContentFormModal({ open, onClose, content, defaults }: Props) {
  const { createContent, updateContent, deleteContent, projects, clients } = useData()
  const toast = useToast()
  const remove = useRemove()
  const editing = !!content

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      title: content?.title ?? '',
      description: content?.description ?? '',
      projectId: content?.projectId ?? defaults?.projectId ?? '',
      clientId: content?.clientId ?? defaults?.clientId ?? '',
      type: content?.type ?? ('post' as ContentType),
      status: content?.status ?? defaults?.status ?? ('ideia' as ContentStatus),
      plannedDate: content?.plannedDate ?? '',
      publishDate: content?.publishDate ?? '',
      caption: content?.caption ?? '',
      cta: content?.cta ?? '',
      notes: content?.notes ?? '',
    }),
    open ? (content?.id ?? `new-${defaults?.status ?? ''}`) : null,
  )

  const submit = async () => {
    if (!values.title.trim()) return setErrors({ title: 'Dê um título ao conteúdo.' })
    setSubmitting(true)
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      projectId: values.projectId || null,
      clientId: values.clientId || null,
      type: values.type,
      status: values.status,
      plannedDate: values.plannedDate || null,
      publishDate: values.publishDate || null,
      caption: values.caption.trim(),
      cta: values.cta.trim(),
      notes: values.notes.trim(),
    }
    const result = editing ? await updateContent(content!.id, payload) : await createContent(payload)
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Conteúdo atualizado' : 'Conteúdo criado')
    onClose()
  }

  const onDelete = async () => {
    if (await remove({ what: 'conteúdo', name: content!.title, action: () => deleteContent(content!.id) })) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar conteúdo' : 'Novo conteúdo'}
      size="lg"
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
            {editing ? 'Salvar alterações' : 'Criar conteúdo'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título" required error={errors.title} className="sm:col-span-2">
          {(id) => <Input id={id} value={values.title} invalid={!!errors.title} placeholder="Ex.: 5 mitos sobre skincare" maxLength={140} onChange={(e) => set('title', e.target.value)} />}
        </Field>
        <Field label="Tipo">
          {(id) => (
            <Select id={id} value={values.type} options={Object.entries(CONTENT_TYPE).map(([value, t]) => ({ value, label: t.label }))} onChange={(e) => set('type', e.target.value as ContentType)} />
          )}
        </Field>
        <Field label="Status">
          {(id) => (
            <Select
              id={id}
              value={values.status}
              options={CONTENT_STATUS_ORDER.map((s) => ({ value: s, label: CONTENT_STATUS[s].label }))}
              onChange={(e) => set('status', e.target.value as ContentStatus)}
            />
          )}
        </Field>
        <Field label="Projeto">
          {(id) => <Select id={id} value={values.projectId} placeholder="Nenhum" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => set('projectId', e.target.value)} />}
        </Field>
        <Field label="Cliente" hint="Opcional">
          {(id) => <Select id={id} value={values.clientId} placeholder="Nenhum" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => set('clientId', e.target.value)} />}
        </Field>
        <Field label="Data prevista" hint="Quando deve ficar pronto">
          {(id) => <Input id={id} type="date" value={values.plannedDate} onChange={(e) => set('plannedDate', e.target.value)} />}
        </Field>
        <Field label="Data de publicação" hint="Aparece no calendário">
          {(id) => <Input id={id} type="date" value={values.publishDate} onChange={(e) => set('publishDate', e.target.value)} />}
        </Field>
        {values.status === 'aprovacao' && (
          <div className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 sm:col-span-2">
            <p className="text-[12.5px] font-medium text-amber-800 dark:text-amber-200">
              Fluxo de Aprovação:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => set('status', 'agendado')}>
                Aprovar (Mover para Agendado)
              </Button>
              <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => set('status', 'producao')}>
                Solicitar ajustes (Voltar para Produção)
              </Button>
            </div>
          </div>
        )}
        <ContentAssist
          projectId={values.projectId || null}
          clientId={values.clientId || null}
          draft={{ title: values.title, type: CONTENT_TYPE[values.type].label, description: values.description, caption: values.caption }}
          onApply={(field, text) => {
            if (field === 'hook') {
              set('description', values.description ? `${text}\n\n${values.description}` : text)
            } else if (field === 'cta') {
              set('cta', text.slice(0, 300))
            } else {
              set(field, text.slice(0, 5000))
            }
          }}
        />
        <Field label="Descrição / roteiro" className="sm:col-span-2">
          {(id) => <Textarea id={id} rows={3} value={values.description} placeholder="Ideia, roteiro, cenas, pilares…" onChange={(e) => set('description', e.target.value)} />}
        </Field>
        <Field label="Legenda / copy" className="sm:col-span-2">
          {(id) => <Textarea id={id} rows={3} value={values.caption} placeholder="Texto que vai na publicação" onChange={(e) => set('caption', e.target.value)} />}
        </Field>
        <Field label="CTA">
          {(id) => <Input id={id} value={values.cta} placeholder="Ex.: Link na bio" maxLength={300} onChange={(e) => set('cta', e.target.value)} />}
        </Field>
        <Field label="Observações">
          {(id) => <Input id={id} value={values.notes} placeholder="Referências, ajustes pedidos…" onChange={(e) => set('notes', e.target.value)} />}
        </Field>
        <div className="rounded-lg border border-line bg-surface-2/40 p-3 text-[12px] text-muted sm:col-span-2">
          <p className="flex items-center gap-1.5 font-medium text-fg">
            <ImageIcon className="h-3.5 w-3.5 text-subtle" /> Mídia e Ativos Visuais
          </p>
          <p className="mt-1 text-subtle leading-relaxed">
            Arquivos de mídia prontos podem ser anexados pelo módulo <strong>Arquivos</strong>. Geração de imagens e vídeos por IA depende de integração externa configurada com serviço provedor (ex.: Google Imagen / Midjourney API); nenhum arquivo fictício é gerado.
          </p>
        </div>
      </div>
    </Modal>
  )
}
