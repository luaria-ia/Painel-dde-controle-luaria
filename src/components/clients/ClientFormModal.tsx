import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { CLIENT_STATUS, PROJECT_COLORS, PROJECT_STATUS } from '@/config/labels'
import { PROJECT_TYPES, projectType } from '@/data/boards/projectTypes'
import { useFormState } from '@/hooks/useFormState'
import { cn, isValidEmail } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { Client, ClientStatus, ID, ProjectColor } from '@/types'

interface NewProject {
  key: string
  type: string
  name: string
}

interface Props {
  open: boolean
  onClose: () => void
  client?: Client | null
  defaultProjectId?: ID
  onCreated?: (client: Client) => void
}

export function ClientFormModal({ open, onClose, client, defaultProjectId, onCreated }: Props) {
  const { createClient, updateClient, createProject, updateProject, projects, projectById } = useData()
  const [newProjects, setNewProjects] = useState<NewProject[]>([])
  const [lastOpen, setLastOpen] = useState(open)
  // Limpa os projetos novos sempre que o modal abre.
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) setNewProjects([])
  }
  const toast = useToast()
  const editing = !!client

  const { values, set, errors, setErrors, submitting, setSubmitting } = useFormState(
    () => ({
      name: client?.name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      whatsapp: client?.whatsapp ?? '',
      company: client?.company ?? '',
      notes: client?.notes ?? '',
      status: client?.status ?? ('ativo' as ClientStatus),
    }),
    open ? (client?.id ?? 'new') : null,
  )

  const addProject = (type: string) => setNewProjects((ps) => [...ps, { key: Math.random().toString(36).slice(2), type, name: projectType(type).label }])
  // Operações (ex.: Social Media) atendem vários clientes: o cliente ENTRA nelas, não ganha um projeto separado.
  const operations = projects.filter((p) => !!projectType(p.type).clientWorkspace)
  const projectTypesForClient = PROJECT_TYPES.filter((t) => !t.clientWorkspace)
  const initialJoined = (client?.projectIds ?? []).filter((id) => operations.some((o) => o.id === id))
  const [joined, setJoined] = useState<string[]>(initialJoined)
  const [joinedFor, setJoinedFor] = useState<string | null>(null)
  const openKey = open ? (client?.id ?? 'new') : null
  if (openKey !== joinedFor) {
    setJoinedFor(openKey)
    setJoined(initialJoined)
  }
  const existing = (client?.projectIds ?? []).map((id) => projectById.get(id)).filter((p): p is NonNullable<typeof p> => !!p && !projectType(p.type).clientWorkspace)

  const submit = async () => {
    const name = values.name.trim()
    const email = values.email.trim()
    const errs: typeof errors = {}
    if (!name) errs.name = 'Informe o nome do cliente.'
    if (email && !isValidEmail(email)) errs.email = 'E-mail inválido.'
    if (Object.keys(errs).length) return setErrors(errs)

    setSubmitting(true)
    const payload = {
      ...values,
      name,
      email,
      phone: values.phone.trim(),
      whatsapp: values.whatsapp.trim(),
      company: values.company.trim(),
      notes: values.notes.trim(),
    }
    const fromProject = !editing && defaultProjectId ? projectById.get(defaultProjectId) : undefined
    // Projeto-operação (ex.: Social Media): o cliente entra na lista de clientes da operação.
    const operation = !!fromProject && !!projectType(fromProject.type).clientWorkspace
    // Vínculos com operações (somente projetos-operação; projetos próprios do cliente usam client_id).
    const operationLinks = [...new Set([...joined, ...(operation ? [fromProject!.id] : [])])]
    const legacyLinks = (client?.projectIds ?? []).filter((id) => !operations.some((o) => o.id === id) && !projects.some((p) => p.id === id && p.clientId === client?.id))
    const result = editing
      ? await updateClient(client!.id, { ...payload, projectIds: [...legacyLinks, ...operationLinks] })
      : await createClient({ ...payload, projectIds: operationLinks })
    if (!result) return setSubmitting(false)

    // Criado a partir de um projeto de cliente sem dono: o cliente vira o dono do projeto.
    if (fromProject && !operation && !fromProject.clientId) await updateProject(fromProject.id, { clientId: result.id })

    // Projetos reais do cliente — cada um já nasce com os quadros do seu tipo.
    const used = projects.map((p) => p.color)
    let created = 0
    for (const np of newProjects) {
      const n = np.name.trim() || projectType(np.type).label
      const color = nextColor([...used])
      used.push(color)
      const project = await createProject({
        name: n,
        description: '',
        status: 'ativo',
        color,
        type: np.type,
        clientId: result.id,
        owners: [],
        startDate: null,
        dueDate: null,
        boardsProvisionedAt: null,
      })
      if (project) created++
    }
    setSubmitting(false)
    toast.success(`${editing ? 'Cliente atualizado' : 'Cliente cadastrado'}${created ? ` · ${created === 1 ? '1 projeto criado' : `${created} projetos criados`}` : ''}`)
    onClose()
    if (!editing) onCreated?.(result)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar cliente' : 'Novo cliente'}
      size="lg"
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {editing ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome" required error={errors.name}>
          {(id) => <Input id={id} value={values.name} invalid={!!errors.name} placeholder="Nome do cliente ou contato" onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label="Empresa">{(id) => <Input id={id} value={values.company} placeholder="Opcional" onChange={(e) => set('company', e.target.value)} />}</Field>
        <Field label="E-mail" error={errors.email}>
          {(id) => (
            <Input
              id={id}
              type="email"
              inputMode="email"
              value={values.email}
              invalid={!!errors.email}
              placeholder="nome@empresa.com"
              onChange={(e) => set('email', e.target.value)}
            />
          )}
        </Field>
        <Field label="Status">
          {(id) => (
            <Select
              id={id}
              value={values.status}
              options={Object.entries(CLIENT_STATUS).map(([value, s]) => ({ value, label: s.label }))}
              onChange={(e) => set('status', e.target.value as ClientStatus)}
            />
          )}
        </Field>
        <Field label="Telefone">
          {(id) => <Input id={id} type="tel" inputMode="tel" value={values.phone} placeholder="(00) 0000-0000" onChange={(e) => set('phone', e.target.value)} />}
        </Field>
        <Field label="WhatsApp">
          {(id) => <Input id={id} type="tel" inputMode="tel" value={values.whatsapp} placeholder="(00) 90000-0000" onChange={(e) => set('whatsapp', e.target.value)} />}
        </Field>

        <div className="flex flex-col gap-2 rounded-xl border border-line p-3.5 sm:col-span-2">
          <div>
            <p className="text-[13px] font-medium">Projetos do cliente</p>
            <p className="text-[12px] text-subtle">Cada projeto é independente; o tipo define as áreas e workflows dele.</p>
          </div>
          {existing.length > 0 && (
            <ul className="flex flex-col gap-1">
              {existing.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-[13px]">
                  <span className={cn('h-2 w-2 rounded-full', PROJECT_COLORS[p.color]?.dot)} />
                  <Link to={`/projetos/${p.id}`} className="font-medium hover:underline" onClick={onClose}>
                    {p.name}
                  </Link>
                  <span className="text-subtle">
                    · {projectType(p.type).icon} {projectType(p.type).label} · {PROJECT_STATUS[p.status].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {newProjects.map((np, i) => (
            <div key={np.key} className="flex flex-wrap items-center gap-2">
              <Select
                compact
                aria-label={`Tipo do projeto ${i + 1}`}
                value={np.type}
                options={PROJECT_TYPES.map((t) => ({ value: t.id, label: `${t.icon} ${t.label}` }))}
                onChange={(e) =>
                  setNewProjects((ps) =>
                    ps.map((x) => (x.key === np.key ? { ...x, type: e.target.value, name: x.name === projectType(x.type).label ? projectType(e.target.value).label : x.name } : x)),
                  )
                }
              />
              <Input
                aria-label={`Nome do projeto ${i + 1}`}
                value={np.name}
                maxLength={80}
                className="h-8 min-w-40 flex-1 text-[13px]"
                onChange={(e) => setNewProjects((ps) => ps.map((x) => (x.key === np.key ? { ...x, name: e.target.value } : x)))}
              />
              <span className="text-[11.5px] text-subtle">
                {projectType(np.type)
                  .areas.map((a) => `${a.icon} ${a.label}`)
                  .join(' · ') || 'sem workflow'}
              </span>
              <Button size="icon" variant="ghost" icon={X} aria-label="Remover projeto" onClick={() => setNewProjects((ps) => ps.filter((x) => x.key !== np.key))} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {projectTypesForClient.map((t) => (
              <Button key={t.id} size="sm" icon={Plus} onClick={() => addProject(t.id)}>
                {t.icon} {t.label}
              </Button>
            ))}
          </div>
          {operations.length > 0 && (
            <div className="mt-1 flex flex-col gap-1.5 border-t border-line pt-3">
              <p className="text-[12.5px] text-muted">Operações que atendem este cliente (o espaço dele fica dentro do projeto):</p>
              <div className="flex flex-wrap gap-2">
                {operations.map((p) => {
                  const on = joined.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setJoined((j) => (on ? j.filter((x) => x !== p.id) : [...j, p.id]))}
                      className={cn(
                        'inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-[13px] transition-colors',
                        on ? 'border-accent/50 bg-accent-soft text-fg' : 'border-line text-muted hover:border-line-strong hover:text-fg',
                      )}
                    >
                      {projectType(p.type).icon} {p.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <Field label="Observações" className="sm:col-span-2">
          {(id) => <Textarea id={id} value={values.notes} placeholder="Preferências, combinados, histórico…" onChange={(e) => set('notes', e.target.value)} />}
        </Field>
      </div>
    </Modal>
  )
}

function nextColor(used: ProjectColor[]): ProjectColor {
  const all = Object.keys(PROJECT_COLORS) as ProjectColor[]
  return all.find((c) => !used.includes(c)) ?? all[used.length % all.length]
}
