import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { LIBRARY_TYPES } from '@/config/library'
import { ACTIVE_TRACKS } from '@/data/studies'
import { useFormState } from '@/hooks/useFormState'
import { useRemove } from '@/hooks/useRemove'
import { useStudies } from '@/store/studiesContext'
import type { LibraryItem, LibraryItemType } from '@/types/studies'

interface Props {
  open: boolean
  onClose: () => void
  item?: LibraryItem | null
  defaults?: { trackId?: string | null; type?: LibraryItemType }
}

export function LibraryItemModal({ open, onClose, item, defaults }: Props) {
  const { createLibraryItem, updateLibraryItem, deleteLibraryItem } = useStudies()
  const toast = useToast()
  const remove = useRemove()
  const editing = !!item

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      type: item?.type ?? defaults?.type ?? ('prompt' as LibraryItemType),
      title: item?.title ?? '',
      trackId: item?.trackId ?? defaults?.trackId ?? '',
      url: item?.url ?? '',
      content: item?.content ?? '',
      tags: (item?.tags ?? []).join(', '),
    }),
    open ? (item?.id ?? 'new') : null,
  )

  const submit = async () => {
    const errs: typeof errors = {}
    const url = values.url.trim()
    if (!values.title.trim()) errs.title = 'Dê um título.'
    if (url && !/^https?:\/\/\S+$/i.test(url)) errs.url = 'O link deve começar com http:// ou https://'
    if (!url && !values.content.trim()) errs.content = 'Escreva o conteúdo ou informe um link.'
    if (Object.keys(errs).length) return setErrors(errs)
    setSubmitting(true)
    const payload = {
      type: values.type,
      title: values.title.trim(),
      trackId: values.trackId || null,
      url,
      content: values.content,
      tags: Array.from(
        new Set(
          values.tags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
        ),
      ).slice(0, 20),
    }
    const result = editing ? await updateLibraryItem(item!.id, payload) : await createLibraryItem(payload)
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Item atualizado' : 'Item adicionado à Biblioteca')
    onClose()
  }

  const onDelete = async () => {
    if (
      await remove({
        what: 'item',
        name: item!.title,
        action: () => deleteLibraryItem(item!.id),
      })
    )
      onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar item' : 'Novo item na Biblioteca'}
      description="Prompts, templates, referências e materiais para usar em qualquer trilha."
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
        <Field label="Tipo">
          {(id) => (
            <Select
              id={id}
              value={values.type}
              options={Object.entries(LIBRARY_TYPES).map(([value, t]) => ({
                value,
                label: t.label,
              }))}
              onChange={(e) => set('type', e.target.value as LibraryItemType)}
            />
          )}
        </Field>
        <Field label="Trilha">
          {(id) => (
            <Select
              id={id}
              value={values.trackId}
              placeholder="Geral (todas as trilhas)"
              options={ACTIVE_TRACKS.map((t) => ({
                value: t.id,
                label: t.title,
              }))}
              onChange={(e) => set('trackId', e.target.value)}
            />
          )}
        </Field>
        <Field label="Título" required error={errors.title} className="sm:col-span-2">
          {(id) => (
            <Input
              id={id}
              value={values.title}
              invalid={!!errors.title}
              maxLength={160}
              placeholder="Ex.: Prompt para gerar ganchos de Reels"
              onChange={(e) => set('title', e.target.value)}
            />
          )}
        </Field>
        <Field label="Link" hint="Opcional" error={errors.url} className="sm:col-span-2">
          {(id) => (
            <Input
              id={id}
              type="url"
              inputMode="url"
              value={values.url}
              invalid={!!errors.url}
              maxLength={1000}
              placeholder="https://"
              onChange={(e) => set('url', e.target.value)}
            />
          )}
        </Field>
        <Field label="Conteúdo" error={errors.content} className="sm:col-span-2" hint={`${values.content.length.toLocaleString('pt-BR')} / 20.000 caracteres`}>
          {(id) => (
            <Textarea
              id={id}
              rows={8}
              maxLength={20000}
              value={values.content}
              aria-invalid={!!errors.content || undefined}
              placeholder="Texto do prompt, template, anotações…"
              className="font-mono text-[13px]"
              onChange={(e) => set('content', e.target.value)}
            />
          )}
        </Field>
        <Field label="Tags" hint="Separadas por vírgula" className="sm:col-span-2">
          {(id) => <Input id={id} value={values.tags} placeholder="reels, copy" onChange={(e) => set('tags', e.target.value)} />}
        </Field>
      </div>
    </Modal>
  )
}
