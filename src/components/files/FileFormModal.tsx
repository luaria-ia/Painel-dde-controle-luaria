import { useEffect, useRef, useState } from 'react'
import { Link2, Paperclip, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Segmented } from '@/components/ui/Segmented'
import { useToast } from '@/components/ui/toastContext'
import { FILE_CATEGORY } from '@/config/labels'
import { useFormState } from '@/hooks/useFormState'
import { ACCEPTED_TYPES, formatBytes, validateFile } from '@/services/fileStorage'
import { useData } from '@/store/useData'
import type { FileCategory, FileItem, ID } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  file?: FileItem | null
  defaults?: { projectId?: ID; clientId?: ID; boardCardId?: ID }
}

type Source = 'upload' | 'link' | 'none'

/** Sugere a categoria a partir do tipo do arquivo. */
function guessCategory(mime: string, name: string): FileCategory {
  if (mime.startsWith('image/')) return 'imagem'
  if (mime.startsWith('video/')) return 'video'
  if (/sheet|excel|csv/.test(mime) || /\.(xlsx?|csv)$/i.test(name)) return 'planilha'
  if (/briefing/i.test(name)) return 'briefing'
  if (/pdf|word|text|presentation/.test(mime)) return 'documento'
  return 'outro'
}

export function FileFormModal({ open, onClose, file, defaults }: Props) {
  const { createFile, updateFile, projects, clients } = useData()
  const toast = useToast()
  const editing = !!file
  const inputRef = useRef<HTMLInputElement>(null)
  const [picked, setPicked] = useState<File | null>(null)

  const { values, set, setValues, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => {
      return {
        source: (file ? (file.url ? 'link' : file.storagePath ? 'upload' : 'none') : 'upload') as Source,
        name: file?.name ?? '',
        description: file?.description ?? '',
        category: file?.category ?? ('documento' as FileCategory),
        projectId: file?.projectId ?? defaults?.projectId ?? '',
        clientId: file?.clientId ?? defaults?.clientId ?? '',
        url: file?.url ?? '',
      }
    },
    open ? (file?.id ?? 'new') : null,
  )

  // Limpa o arquivo escolhido sempre que o modal abre.
  useEffect(() => {
    if (open) setPicked(null)
  }, [open])

  const onPick = (f: File | undefined) => {
    if (!f) return
    const err = validateFile(f)
    if (err) return setErrors({ name: err })
    setPicked(f)
    setValues((v) => ({
      ...v,
      name: v.name || f.name.replace(/\.[^.]+$/, ''),
      category: v.name ? v.category : guessCategory(f.type, f.name),
    }))
    setErrors({})
  }

  const submit = async () => {
    const errs: typeof errors = {}
    if (!values.name.trim()) errs.name = 'Dê um nome ao arquivo.'
    if (!values.projectId) errs.projectId = 'Escolha o projeto.'
    if (values.source === 'upload' && !picked && !file?.storagePath) errs.name = 'Escolha um arquivo para enviar.'
    if (values.source === 'link' && !/^https:\/\/\S+$/.test(values.url.trim())) errs.url = 'Informe um link começando com https://'
    if (Object.keys(errs).length) return setErrors(errs)

    setSubmitting(true)
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      projectId: values.projectId || null,
      clientId: values.clientId || null,
      url: values.source === 'link' ? values.url.trim() : null,
      storagePath: values.source === 'upload' ? (file?.storagePath ?? null) : null,
      mimeType: values.source === 'link' ? 'text/uri-list' : (file?.mimeType ?? ''),
      sizeBytes: values.source === 'upload' ? (file?.sizeBytes ?? null) : null,
      boardCardId: file?.boardCardId ?? defaults?.boardCardId ?? null,
    }
    const upload = values.source === 'upload' ? picked : null
    const result = editing ? await updateFile(file!.id, payload, upload) : await createFile(payload, upload)
    setSubmitting(false)
    if (!result) return
    toast.success(editing ? 'Arquivo atualizado' : upload ? 'Arquivo enviado' : 'Arquivo registrado')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar arquivo' : 'Adicionar arquivo'}
      description={editing ? undefined : 'Envie um arquivo (até 25 MB) ou registre um link.'}
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {submitting && picked ? 'Enviando…' : editing ? 'Salvar alterações' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Segmented
          ariaLabel="Origem"
          value={values.source === 'none' ? 'upload' : values.source}
          onChange={(v) => set('source', v)}
          options={[
            { value: 'upload', label: 'Enviar arquivo', icon: Upload },
            { value: 'link', label: 'Link externo', icon: Link2 },
          ]}
        />

        {values.source !== 'link' ? (
          <div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={(e) => {
                onPick(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            {picked || file?.storagePath ? (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 text-sm">
                <Paperclip className="h-4 w-4 shrink-0 text-subtle" />
                <span className="min-w-0 flex-1 truncate">{picked ? picked.name : 'Arquivo atual mantido'}</span>
                <span className="text-[12px] text-subtle">{formatBytes(picked ? picked.size : (file?.sizeBytes ?? null))}</span>
                <Button size="sm" onClick={() => inputRef.current?.click()}>
                  Trocar
                </Button>
                {picked && <Button size="icon" variant="ghost" icon={X} aria-label="Remover seleção" onClick={() => setPicked(null)} />}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  onPick(e.dataTransfer.files?.[0])
                }}
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted transition-colors hover:border-accent hover:bg-accent-soft"
              >
                <Upload className="h-5 w-5 text-subtle" />
                <span>
                  <strong className="font-medium text-fg">Clique para escolher</strong> ou arraste um arquivo aqui
                </span>
                <span className="text-[12px] text-subtle">PDF, imagens, vídeos, planilhas, documentos · até 25 MB</span>
              </button>
            )}
          </div>
        ) : (
          <Field label="Link" required error={errors.url} hint="Google Drive, Canva, Figma…">
            {(id) => <Input id={id} type="url" inputMode="url" value={values.url} invalid={!!errors.url} placeholder="https://" onChange={(e) => set('url', e.target.value)} />}
          </Field>
        )}

        <Field label="Nome" required error={errors.name}>
          {(id) => <Input id={id} value={values.name} invalid={!!errors.name} placeholder="Ex.: Briefing — Clínica X" maxLength={200} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Categoria">
            {(id) => (
              <Select id={id} value={values.category} options={Object.entries(FILE_CATEGORY).map(([value, c]) => ({ value, label: c.label }))} onChange={(e) => set('category', e.target.value as FileCategory)} />
            )}
          </Field>
          <Field label="Projeto" required error={errors.projectId}>
            {(id) => (
              <Select
                id={id}
                value={values.projectId}
                invalid={!!errors.projectId}
                placeholder="Selecione…"
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                onChange={(e) => set('projectId', e.target.value)}
              />
            )}
          </Field>
          <Field label="Cliente" hint="Opcional" className="sm:col-span-2">
            {(id) => <Select id={id} value={values.clientId} placeholder="Nenhum" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => set('clientId', e.target.value)} />}
          </Field>
        </div>
        <Field label="Descrição">
          {(id) => <Textarea id={id} rows={2} value={values.description} placeholder="Opcional" onChange={(e) => set('description', e.target.value)} />}
        </Field>
      </div>
    </Modal>
  )
}
