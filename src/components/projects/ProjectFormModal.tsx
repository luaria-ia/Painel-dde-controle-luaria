import { useNavigate } from 'react-router-dom'
import { Check, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { PROJECT_COLORS, PROJECT_STATUS } from '@/config/labels'
import { PROJECT_TYPES, projectType } from '@/data/boards/projectTypes'
import { useFormState } from '@/hooks/useFormState'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { Project, ProjectColor, ProjectStatus } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  project?: Project | null
  /** Navegar para a página do projeto após criar. */
  goToCreated?: boolean
  /** Cliente pré-selecionado (ex.: criando a partir da página do cliente). */
  defaultClientId?: string
  /** Tipo pré-selecionado. */
  defaultType?: string
}

/**
 * Criar/editar projeto. O TIPO define as áreas (abas) e workflows: ao criar, o banco cria o projeto e o
 * armazenamento das áreas na mesma transação. Ao trocar o tipo, as áreas do novo tipo são preparadas.
 */
export function ProjectFormModal({ open, onClose, project, goToCreated, defaultClientId, defaultType }: Props) {
  const { createProject, updateProject, projects, clients } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const editing = !!project

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      name: project?.name ?? '',
      description: project?.description ?? '',
      status: project?.status ?? ('ativo' as ProjectStatus),
      color: project?.color ?? nextColor(projects.map((p) => p.color)),
      type: project?.type ?? defaultType ?? 'social_media',
      clientId: project?.clientId ?? defaultClientId ?? '',
      owners: (project?.owners ?? []).join(', '),
      startDate: project?.startDate ?? '',
      dueDate: project?.dueDate ?? '',
    }),
    open ? (project?.id ?? 'new') : null,
  )
  const def = projectType(values.type)
  const typeChanged = editing && project!.type !== values.type

  const submit = async () => {
    const name = values.name.trim()
    const errs: typeof errors = {}
    if (!name) errs.name = 'Dê um nome ao projeto.'
    if (values.startDate && values.dueDate && values.dueDate < values.startDate) errs.dueDate = 'A entrega deve ser depois do início.'
    if (Object.keys(errs).length) return setErrors(errs)
    setSubmitting(true)
    const payload = {
      name,
      description: values.description.trim(),
      status: values.status,
      color: values.color,
      type: values.type,
      clientId: values.clientId || null,
      owners: [
        ...new Set(
          values.owners
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean),
        ),
      ].slice(0, 10),
      startDate: values.startDate || null,
      dueDate: values.dueDate || null,
    }
    const result = editing ? await updateProject(project!.id, payload) : await createProject({ ...payload, boardsProvisionedAt: null })
    setSubmitting(false)
    if (!result) return
    const areas = def.areas.length
    toast.success(editing ? 'Projeto atualizado' : areas ? `Projeto criado com as áreas de ${def.label}` : 'Projeto criado')
    onClose()
    if (!editing && (goToCreated || areas)) navigate(`/projetos/${result.id}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar projeto' : 'Novo projeto'}
      description={editing ? undefined : 'O tipo do projeto define as áreas e workflows dele.'}
      size="lg"
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {editing ? 'Salvar alterações' : 'Criar projeto'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome do projeto" required error={errors.name} className="sm:col-span-2">
          {(id) => (
            <Input id={id} value={values.name} invalid={!!errors.name} placeholder="Ex.: Gestão de Instagram" maxLength={80} onChange={(e) => set('name', e.target.value)} />
          )}
        </Field>
        <Field label="Cliente" hint="Vazio = projeto interno.">
          {(id) => (
            <Select
              id={id}
              value={values.clientId}
              placeholder="Sem cliente (interno)"
              options={clients.map((c) => ({ value: c.id, label: c.company ? `${c.name} · ${c.company}` : c.name }))}
              onChange={(e) => set('clientId', e.target.value)}
            />
          )}
        </Field>
        <Field label="Tipo do projeto" required>
          {(id) => (
            <Select
              id={id}
              value={values.type}
              options={PROJECT_TYPES.map((t) => ({ value: t.id, label: `${t.icon} ${t.label}` }))}
              onChange={(e) => set('type', e.target.value)}
            />
          )}
        </Field>

        <div className="rounded-xl border border-line bg-surface-2/50 p-3.5 sm:col-span-2">
          <p className="flex items-center gap-2 text-[13px] font-medium">
            <LayoutGrid className="h-4 w-4 text-accent" />
            {def.areas.length
              ? editing && typeChanged
                ? `Ao salvar, o projeto passa a ter as áreas de ${def.label}:`
                : `Áreas do projeto ${def.label}:`
              : 'Este tipo não tem áreas de workflow (abas padrão do projeto).'}
          </p>
          <p className="mt-1 text-[12.5px] text-muted">{def.description}</p>
          {def.areas.length > 0 && (
            <ul className="mt-2.5 flex flex-col gap-2 pl-6">
              {def.areas.map((a) => {
                const tpl = def.boards.find((b) => b.key === a.board)
                return (
                  <li key={a.key} className="text-[12.5px]">
                    <span className="font-medium">
                      {a.icon} {a.label}
                    </span>
                    <span className="block text-subtle">
                      {a.kind === 'dossier'
                        ? `Dossiê: ${tpl?.lists[0]?.cards?.map((c) => c.title).join(' · ')}`
                        : a.kind === 'metrics'
                          ? a.description
                          : tpl?.lists.map((l) => `${l.icon} ${l.name}`).join(' → ')}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {editing && typeChanged && <p className="mt-1.5 text-[12.5px] text-subtle">Dados de áreas anteriores não são apagados.</p>}
        </div>

        <Field label="Status">
          {(id) => (
            <Select
              id={id}
              value={values.status}
              options={Object.entries(PROJECT_STATUS).map(([value, s]) => ({ value, label: s.label }))}
              onChange={(e) => set('status', e.target.value as ProjectStatus)}
            />
          )}
        </Field>
        <Field label="Responsáveis" hint="Nomes separados por vírgula.">
          {(id) => <Input id={id} value={values.owners} placeholder="Ex.: André" onChange={(e) => set('owners', e.target.value)} />}
        </Field>
        <Field label="Início">{(id) => <Input id={id} type="date" value={values.startDate} onChange={(e) => set('startDate', e.target.value)} />}</Field>
        <Field label="Entrega / prazo" error={errors.dueDate}>
          {(id) => <Input id={id} type="date" value={values.dueDate} invalid={!!errors.dueDate} onChange={(e) => set('dueDate', e.target.value)} />}
        </Field>
        <Field label="Descrição" className="sm:col-span-2">
          {(id) => <Textarea id={id} value={values.description} placeholder="Qual é o objetivo deste projeto?" onChange={(e) => set('description', e.target.value)} />}
        </Field>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[13px] font-medium">Cor</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor do projeto">
            {(Object.keys(PROJECT_COLORS) as ProjectColor[]).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={values.color === c}
                aria-label={PROJECT_COLORS[c].label}
                title={PROJECT_COLORS[c].label}
                onClick={() => set('color', c)}
                className={cn(
                  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition',
                  PROJECT_COLORS[c].dot,
                  values.color === c ? 'ring-2 ring-fg/60' : 'opacity-80 hover:opacity-100',
                )}
              >
                {values.color === c && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function nextColor(used: ProjectColor[]): ProjectColor {
  const all = Object.keys(PROJECT_COLORS) as ProjectColor[]
  return all.find((c) => !used.includes(c)) ?? all[used.length % all.length]
}
