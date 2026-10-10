import { useEffect, useMemo, useState } from 'react'
import { Check, CheckCircle2, History, MessageSquare, Paperclip, Plus, RotateCcw, Tag, Trash2, X } from 'lucide-react'
import { AutosaveStatus } from '@/components/studies/AutosaveStatus'
import { FileFormModal } from '@/components/files/FileFormModal'
import { FileList } from '@/components/files/FileList'
import { ProgressBar } from '@/components/studies/StudyUI'
import { Button } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/confirmContext'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Segmented } from '@/components/ui/Segmented'
import { useToast } from '@/components/ui/toastContext'
import { TASK_PRIORITY } from '@/config/labels'
import { useAutosave } from '@/hooks/useAutosave'
import type { BoardApi } from '@/hooks/useBoard'
import { LABEL_COLORS } from '@/lib/boards'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { cardCommentRepository, cardEventRepository } from '@/repositories/boards'
import { useData } from '@/store/useData'
import type { ID, Project, TaskPriority } from '@/types'
import type { BoardCard, BoardField, CardComment, CardEvent, ChecklistItem, CommentKind } from '@/types/boards'
import { Avatar, LabelChip } from './BoardBits'
import { LeadClientPanel } from './LeadClientPanel'
import { findBoardTemplate } from '@/data/boards/projectTypes'

const COMMENT_KINDS: Record<CommentKind, string> = { comentario: 'Comentário', ligacao: 'Ligação', whatsapp: 'WhatsApp', email: 'E-mail', reuniao: 'Reunião', outro: 'Outro' }

interface Props {
  api: BoardApi
  project?: Project
  cardId: ID | null
  /** Nomes sugeridos para “Responsável” (responsáveis do projeto + já usados). */
  people: string[]
  onClose: () => void
}

export function CardModal({ api, cardId, people, onClose }: Props) {
  const crm = findBoardTemplate(api.board?.templateKey)?.role === 'crm'
  const card = api.cards.find((c) => c.id === cardId)
  const list = api.lists.find((l) => l.id === card?.listId)
  return (
    <Modal
      open={!!card}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <span className="mr-auto self-center text-[12.5px] text-subtle">Tudo é salvo automaticamente — campos vazios podem ser preenchidos depois.</span>
          <Button variant="primary" icon={Check} onClick={onClose}>
            Salvar e fechar
          </Button>
        </>
      }
      title={
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
          {list?.icon} {list?.name}
          {list?.kind === 'reference' && <span className="text-subtle">· dossiê</span>}
        </span>
      }
    >
      {card && !card.id.startsWith('tmp-') && <CardDetail key={card.id} api={api} card={card} people={people} crm={crm} onClose={onClose} />}
    </Modal>
  )
}

function CardDetail({ api, card, people, crm, onClose }: { api: BoardApi; card: BoardCard; people: string[]; crm: boolean; onClose: () => void }) {
  const confirm = useConfirm()
  const toast = useToast()
  const { files } = useData()
  const board = api.board!
  // Título salvo ao digitar/sair/fechar; título vazio volta ao anterior (é o único dado necessário).
  const title = useAutosave(card.title, async (v) => (v.trim() && v.trim() !== card.title ? api.updateCard(card.id, { title: v.trim().slice(0, 300) }) : true), 700)
  const description = useAutosave(card.description, (v) => api.updateCard(card.id, { description: v }))
  const attachments = files.filter((f) => f.boardCardId === card.id)
  const [attaching, setAttaching] = useState(false)

  const remove = async () => {
    if (!(await confirm({ title: 'Excluir cartão?', message: `“${card.title}” e seus comentários serão excluídos.`, danger: true }))) return
    if (await api.deleteCard(card.id)) {
      toast.success('Cartão excluído')
      onClose()
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="flex min-w-0 flex-col gap-5">
        <textarea
          value={title.value}
          rows={1}
          maxLength={300}
          aria-label={crm ? 'Nome do contato' : 'Título do cartão'}
          placeholder={crm ? 'Nome do contato' : 'Título'}
          onChange={(e) => title.onChange(e.target.value)}
          onBlur={() => {
            if (!title.value.trim()) title.onChange(card.title)
            void title.flush()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
          className="field-sizing-content -mx-2 resize-none rounded-lg border border-transparent bg-transparent px-2 py-1 text-xl font-semibold tracking-tight outline-none hover:border-line focus:border-accent"
        />

        <LabelPicker api={api} card={card} />

        <section>
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="text-[12px] font-semibold tracking-wider text-subtle uppercase">Descrição</h3>
            <AutosaveStatus status={description.status} savedAt={description.savedAt} />
          </div>
          <Textarea
            rows={5}
            maxLength={20000}
            aria-label="Descrição"
            placeholder="Detalhes, contexto, links…"
            value={description.value}
            onChange={(e) => description.onChange(e.target.value)}
          />
        </section>

        {board.fields.length > 0 && <FieldsEditor fields={board.fields} card={card} api={api} />}

        <ChecklistEditor card={card} api={api} />

        <section>
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wider text-subtle uppercase">
              <Paperclip className="h-3.5 w-3.5" /> Anexos
            </h3>
            <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAttaching(true)}>
              Anexar
            </Button>
          </div>
          {attachments.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-line">
              <FileList files={attachments} showProject={false} />
            </div>
          ) : (
            <p className="text-[13px] text-subtle">Nenhum anexo. Os anexos também aparecem em Arquivos do projeto.</p>
          )}
          <FileFormModal open={attaching} onClose={() => setAttaching(false)} defaults={{ projectId: board.projectId, boardCardId: card.id }} />
        </section>

        <CardActivity api={api} card={card} />
      </div>

      <aside className="flex flex-col gap-3.5">
        {crm && <LeadClientPanel api={api} card={card} />}
        <Field label={crm ? 'Etapa' : 'Mover para'}>
          {(id) => (
            <Select
              id={id}
              value={card.listId}
              options={api.lists.map((l) => ({ value: l.id, label: `${l.icon} ${l.name}`.trim() }))}
              onChange={(e) => void api.moveCard(card.id, e.target.value, Number.MAX_SAFE_INTEGER)}
            />
          )}
        </Field>
        <Field label="Responsável">{(id) => <AssigneeInput id={id} value={card.assignee} people={people} onSave={(v) => void api.updateCard(card.id, { assignee: v })} />}</Field>
        <Field label="Prazo">
          {(id) => <Input id={id} type="date" value={card.dueDate ?? ''} onChange={(e) => void api.updateCard(card.id, { dueDate: e.target.value || null })} />}
        </Field>
        <Field label="Prioridade">
          {(id) => (
            <Select
              id={id}
              value={card.priority ?? ''}
              placeholder="Sem prioridade"
              options={(Object.keys(TASK_PRIORITY) as TaskPriority[]).map((p) => ({ value: p, label: TASK_PRIORITY[p].label }))}
              onChange={(e) => void api.updateCard(card.id, { priority: (e.target.value || null) as TaskPriority | null })}
            />
          )}
        </Field>
        {card.completedAt ? (
          <Button icon={RotateCcw} onClick={() => void api.updateCard(card.id, { completedAt: null })}>
            Reabrir
          </Button>
        ) : (
          <Button icon={CheckCircle2} onClick={() => void api.updateCard(card.id, { completedAt: new Date().toISOString() })}>
            Marcar como concluído
          </Button>
        )}
        <dl className="mt-1 flex flex-col gap-1 border-t border-line pt-3 text-[12px] text-subtle">
          <div>
            <dt className="inline">Criado em </dt>
            <dd className="inline">{formatDateTime(card.createdAt)}</dd>
          </div>
          {card.completedAt && (
            <div>
              <dt className="inline">Concluído em </dt>
              <dd className="inline">{formatDateTime(card.completedAt)}</dd>
            </div>
          )}
        </dl>
        <Button variant="ghost" icon={Trash2} onClick={remove} className="justify-start text-rose-600 dark:text-rose-400">
          Excluir cartão
        </Button>
      </aside>
    </div>
  )
}

function AssigneeInput({ id, value, people, onSave }: { id: string; value: string; people: string[]; onSave: (v: string) => void }) {
  const [v, setV] = useState(value)
  return (
    <div className="flex items-center gap-2">
      {value && <Avatar name={value} />}
      <Input
        id={id}
        value={v}
        maxLength={80}
        list={`${id}-people`}
        placeholder="Nome"
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v.trim() !== value && onSave(v.trim())}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <datalist id={`${id}-people`}>
        {people.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  )
}

function LabelPicker({ api, card }: { api: BoardApi; card: BoardCard }) {
  const [open, setOpen] = useState(false)
  const active = api.labels.filter((l) => card.labelIds.includes(l.id))
  const toggle = (id: ID) => void api.updateCard(card.id, { labelIds: card.labelIds.includes(id) ? card.labelIds.filter((x) => x !== id) : [...card.labelIds, id] })
  return (
    <section>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag className="h-3.5 w-3.5 text-subtle" aria-hidden="true" />
        {active.map((l) => (
          <LabelChip key={l.id} label={l} className="text-[11.5px]" />
        ))}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[12px] font-medium text-muted hover:bg-surface-2 hover:text-fg"
        >
          <Plus className="h-3.5 w-3.5" /> Etiquetas
        </button>
      </div>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-lg border border-line bg-surface-2/50 p-2">
          {api.labels.length === 0 && <p className="text-[12.5px] text-subtle">Crie etiquetas em “Etiquetas” no topo do quadro.</p>}
          {api.labels.map((l) => {
            const on = card.labelIds.includes(l.id)
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(l.id)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[12px] font-semibold ring-1 ring-inset transition',
                  LABEL_COLORS[l.color].chip,
                  on ? 'ring-2' : 'opacity-60 hover:opacity-100',
                )}
              >
                {on && <Check className="h-3 w-3" />}
                {l.name}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

function FieldsEditor({ fields, card, api }: { fields: BoardField[]; card: BoardCard; api: BoardApi }) {
  // Nenhum campo é obrigatório: vazio também é salvo.
  const save = (key: string, value: string) => {
    if ((card.fields[key] ?? '') === value) return Promise.resolve(true)
    return api.updateFields(card.id, { [key]: value })
  }
  return (
    <section>
      <h3 className="mb-2 text-[12px] font-semibold tracking-wider text-subtle uppercase">Campos</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <Field key={f.key} label={f.label} className={f.type === 'textarea' ? 'sm:col-span-2' : undefined}>
            {(id) => <FieldInput key={`${card.id}-${f.key}`} id={id} field={f} value={card.fields[f.key] ?? ''} onSave={(v) => save(f.key, v)} />}
          </Field>
        ))}
      </div>
    </section>
  )
}

/** Campo personalizado: textos são salvos enquanto você digita (e ao sair/fechar), datas e listas na hora. */
function FieldInput({ id, field, value, onSave }: { id: string; field: BoardField; value: string; onSave: (v: string) => Promise<boolean> }) {
  const text = useAutosave(value, (v) => onSave(field.type === 'textarea' ? v : v.trim()), 700)
  if (field.type === 'select')
    return <Select id={id} value={value} placeholder="—" options={(field.options ?? []).map((o) => ({ value: o, label: o }))} onChange={(e) => void onSave(e.target.value)} />
  if (field.type === 'date') return <Input id={id} type="date" value={value} onChange={(e) => void onSave(e.target.value)} />
  if (field.type === 'textarea')
    return <Textarea id={id} rows={3} value={text.value} maxLength={5000} onChange={(e) => text.onChange(e.target.value)} onBlur={() => void text.flush()} />
  return (
    <Input
      id={id}
      type={field.type === 'number' ? 'number' : 'text'}
      inputMode={field.type === 'currency' ? 'decimal' : field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : undefined}
      placeholder={field.type === 'currency' ? 'R$ 0' : undefined}
      value={text.value}
      maxLength={1000}
      onChange={(e) => text.onChange(e.target.value)}
      onBlur={() => void text.flush()}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  )
}

function ChecklistEditor({ card, api }: { card: BoardCard; api: BoardApi }) {
  const [text, setText] = useState('')
  const items = card.checklist
  const done = items.filter((i) => i.done).length
  const save = (next: ChecklistItem[]) => void api.updateCard(card.id, { checklist: next })
  const add = () => {
    const t = text.trim()
    if (!t) return
    save([...items, { id: Math.random().toString(36).slice(2, 10), text: t.slice(0, 300), done: false }])
    setText('')
  }
  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold tracking-wider text-subtle uppercase">Checklist</h3>
        {items.length > 0 && (
          <span className="tabular text-[12px] text-subtle">
            {done}/{items.length}
          </span>
        )}
      </div>
      {items.length > 0 && <ProgressBar value={(done / items.length) * 100} className="mb-2" label="Progresso do checklist" />}
      <ul className="flex flex-col gap-0.5">
        {items.map((it) => (
          <li key={it.id} className="group flex items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-surface-2">
            <input
              type="checkbox"
              checked={it.done}
              aria-label={it.text}
              onChange={() => save(items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))}
              className="h-[15px] w-[15px] shrink-0 cursor-pointer accent-[var(--accent)]"
            />
            <span className={cn('flex-1 text-[14px]', it.done && 'text-subtle line-through')}>{it.text}</span>
            <button
              type="button"
              aria-label={`Remover “${it.text}”`}
              onClick={() => save(items.filter((x) => x.id !== it.id))}
              className="cursor-pointer text-subtle opacity-0 group-hover:opacity-100 hover:text-rose-500 focus:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-1.5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <Input value={text} maxLength={300} placeholder="Novo item…" aria-label="Novo item do checklist" className="h-8 text-[13px]" onChange={(e) => setText(e.target.value)} />
        <Button type="submit" size="sm">
          Adicionar
        </Button>
      </form>
    </section>
  )
}

function CardActivity({ api, card }: { api: BoardApi; card: BoardCard }) {
  const toast = useToast()
  const [tab, setTab] = useState<'comentarios' | 'historico'>('comentarios')
  const [comments, setComments] = useState<CardComment[] | null>(null)
  const [events, setEvents] = useState<CardEvent[] | null>(null)
  const [body, setBody] = useState('')
  const [kind, setKind] = useState<CommentKind>('comentario')
  const isSales = findBoardTemplate(api.board?.templateKey)?.role === 'crm'

  useEffect(() => {
    let alive = true
    cardCommentRepository.listBy([card.id]).then(
      (c) => alive && setComments(c),
      () => alive && setComments([]),
    )
    return () => {
      alive = false
    }
  }, [card.id])
  // Histórico recarrega quando o cartão muda (o banco registra as alterações).
  const version = useMemo(() => [card.listId, card.title, card.dueDate, card.assignee, card.priority, card.completedAt, card.labelIds.join()].join('|'), [card])
  useEffect(() => {
    if (tab !== 'historico') return
    let alive = true
    const t = window.setTimeout(
      () =>
        cardEventRepository.listBy([card.id]).then(
          (e) => alive && setEvents(e),
          () => alive && setEvents([]),
        ),
      300,
    )
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [card.id, tab, version])

  const add = async () => {
    const text = body.trim()
    if (!text) return
    try {
      const created = await cardCommentRepository.create({ cardId: card.id, kind, body: text })
      setComments((c) => [created, ...(c ?? [])])
      setBody('')
      api.bumpComments(card.id, 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar.')
    }
  }

  const remove = async (id: ID) => {
    try {
      await cardCommentRepository.remove(id)
      setComments((c) => (c ?? []).filter((x) => x.id !== id))
      api.bumpComments(card.id, -1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  return (
    <section>
      <Segmented
        className="mb-3"
        ariaLabel="Atividade do cartão"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'comentarios', label: isSales ? 'Interações' : 'Comentários', icon: MessageSquare, count: comments?.length },
          { value: 'historico', label: 'Histórico', icon: History },
        ]}
      />
      {tab === 'comentarios' ? (
        <>
          <form
            className="mb-3 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void add()
            }}
          >
            <Textarea
              rows={2}
              maxLength={5000}
              value={body}
              aria-label="Novo comentário"
              placeholder={isSales ? 'Registre a interação: o que foi conversado, próximos passos…' : 'Escreva um comentário…'}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select
                compact
                aria-label="Tipo"
                value={kind}
                options={Object.entries(COMMENT_KINDS).map(([value, label]) => ({ value, label }))}
                onChange={(e) => setKind(e.target.value as CommentKind)}
              />
              <Button type="submit" size="sm" variant="primary" disabled={!body.trim()}>
                Salvar
              </Button>
            </div>
          </form>
          {comments === null ? (
            <div className="h-12 animate-pulse rounded-lg bg-surface-2/60" />
          ) : comments.length === 0 ? (
            <p className="text-[13px] text-subtle">{isSales ? 'Nenhuma interação registrada.' : 'Nenhum comentário.'}</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {comments.map((c) => (
                <li key={c.id} className="group rounded-lg border border-line bg-surface px-3 py-2">
                  <div className="mb-0.5 flex items-center gap-2 text-[11.5px] text-subtle">
                    <span className="font-medium text-muted">{COMMENT_KINDS[c.kind]}</span>
                    <span>{formatDateTime(c.createdAt)}</span>
                    <span className="flex-1" />
                    <button
                      type="button"
                      aria-label="Excluir"
                      onClick={() => void remove(c.id)}
                      className="cursor-pointer opacity-0 group-hover:opacity-100 hover:text-rose-500 focus:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[13.5px] whitespace-pre-wrap">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : events === null ? (
        <div className="h-12 animate-pulse rounded-lg bg-surface-2/60" />
      ) : events.length === 0 ? (
        <p className="text-[13px] text-subtle">Sem alterações registradas ainda.</p>
      ) : (
        <ol className="flex flex-col gap-2 border-l border-line pl-3">
          {events.map((e) => (
            <li key={e.id} className="text-[13px]">
              <span className="text-muted">{e.description}</span>
              <span className="block text-[11.5px] text-subtle">{formatDateTime(e.createdAt)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
