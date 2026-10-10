import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { KNOWLEDGE_CATEGORY } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { useRemove } from '@/hooks/useRemove'
import { useData } from '@/store/useData'
import type { ID, KnowledgeCategory, KnowledgeItem } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  item?: KnowledgeItem | null
  defaults?: { projectId?: ID; clientId?: ID; category?: KnowledgeCategory }
}

export function KnowledgeFormModal({ open, onClose, item, defaults }: Props) {
  const { createKnowledge, updateKnowledge, deleteKnowledge, projects, clients } = useData()
  const toast = useToast()
  const remove = useRemove()
  const editing = !!item

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      title: item?.title ?? '',
      content: item?.content ?? '',
      category: item?.category ?? defaults?.category ?? ('contexto' as KnowledgeCategory),
      projectId: item?.projectId ?? defaults?.projectId ?? '',
      clientId: item?.clientId ?? defaults?.clientId ?? '',
      tags: (item?.tags ?? []).join(', '),
    }),
    open ? (item?.id ?? 'new') : null,
  )

  const submit = async () => {
    const errs: typeof errors = {}
    if (!values.title.trim()) errs.title = 'Dê um título.'
    if (!values.content.trim()) errs.content = 'Escreva o conteúdo.'
    if (!values.projectId && !values.clientId) errs.projectId = 'Relacione a um projeto (ou a um cliente).'
    if (Object.keys(errs).length) return setErrors(errs)
    setSubmitting(true)
    const payload = {
      title: values.title.trim(),
      content: values.content.trim(),
      category: values.category,
      projectId: values.projectId || null,
      clientId: values.clientId || null,
      tags: Array.from(new Set(values.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))).slice(0, 20),
    }
    const result = editing ? await updateKnowledge(item!.id, payload) : await createKnowledge(payload)
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Conhecimento atualizado' : 'Conhecimento adicionado')
    onClose()
  }

  const onDelete = async () => {
    if (await remove({ what: 'conhecimento', name: item!.title, action: () => deleteKnowledge(item!.id) })) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar conhecimento' : 'Novo conhecimento'}
      description="Informações que a IA usa como contexto (sobre a empresa, público, processos…)."
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
            {editing ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título" required error={errors.title} className="sm:col-span-2">
          {(id) => <Input id={id} value={values.title} invalid={!!errors.title} placeholder="Ex.: Posicionamento da marca" maxLength={160} onChange={(e) => set('title', e.target.value)} />}
        </Field>
        <Field label="Categoria">
          {(id) => (
            <Select id={id} value={values.category} options={Object.entries(KNOWLEDGE_CATEGORY).map(([value, c]) => ({ value, label: c.label }))} onChange={(e) => set('category', e.target.value as KnowledgeCategory)} />
          )}
        </Field>
        <Field label="Projeto" error={errors.projectId}>
          {(id) => <Select id={id} value={values.projectId} invalid={!!errors.projectId} placeholder="Nenhum" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => set('projectId', e.target.value)} />}
        </Field>
        <Field label="Cliente" hint="Opcional">
          {(id) => <Select id={id} value={values.clientId} placeholder="Nenhum" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => set('clientId', e.target.value)} />}
        </Field>
        <Field label="Tags" hint="Separadas por vírgula">
          {(id) => <Input id={id} value={values.tags} placeholder="tom de voz, público" onChange={(e) => set('tags', e.target.value)} />}
        </Field>
        <Field label="Conteúdo" required error={errors.content} className="sm:col-span-2" hint={`${values.content.length.toLocaleString('pt-BR')} / 20.000 caracteres`}>
          {(id) => (
            <Textarea
              id={id}
              rows={9}
              maxLength={20000}
              value={values.content}
              aria-invalid={!!errors.content || undefined}
              placeholder="Ex.: A Luaria é uma empresa focada em… Nosso público é… Diferenciais…"
              onChange={(e) => set('content', e.target.value)}
            />
          )}
        </Field>
      </div>
    </Modal>
  )
}
