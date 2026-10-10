import { useState, type DragEvent } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Pencil, Plus, Trash2, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/confirmContext'
import { Menu } from '@/components/ui/Menu'
import { cn, plural } from '@/lib/utils'
import type { BoardApi } from '@/hooks/useBoard'
import type { ID } from '@/types'
import type { BoardCard, BoardList } from '@/types/boards'
import { BoardCardTile } from './BoardCardTile'

interface Props {
  api: BoardApi
  /** Cartões visíveis de cada lista, já filtrados e ordenados. */
  visible: (listId: ID) => BoardCard[]
  /** Ordem manual e sem filtros: arrastar define a posição exata. Senão, o cartão vai para o fim da lista. */
  exactDrop: boolean
  attachments: Map<ID, number>
  onOpenCard: (id: ID) => void
}

interface DropTarget {
  listId: ID
  index: number
}

/** Listas horizontais com arrastar-e-soltar nativo (HTML5). No toque, o cartão é movido pelo seletor “Mover para” nos detalhes. */
export function BoardColumns({ api, visible, exactDrop, attachments, onOpenCard }: Props) {
  const [dragId, setDragId] = useState<ID | null>(null)
  const [target, setTarget] = useState<DropTarget | null>(null)
  const [adding, setAdding] = useState(false)
  const [newList, setNewList] = useState('')
  const board = api.board!

  const reset = () => {
    setDragId(null)
    setTarget(null)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    const id = dragId ?? e.dataTransfer.getData('text/plain')
    const t = target
    reset()
    if (!id || !t) return
    const card = api.cards.find((c) => c.id === id)
    if (!card) return
    // Índice na ordem manual da lista de destino (sem o próprio cartão).
    const index = exactDrop ? t.index : Number.MAX_SAFE_INTEGER
    const same = card.listId === t.listId
    if (same && !exactDrop) return
    void api.moveCard(id, t.listId, index)
  }

  const submitList = async () => {
    const name = newList.trim()
    if (!name) return setAdding(false)
    if (await api.createList(name)) setNewList('')
  }

  return (
    <div className="scrollbar-thin -mx-4 flex snap-x items-start gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0" onDragEnd={reset}>
      {api.lists.map((list, i) => (
        <Column
          key={list.id}
          api={api}
          list={list}
          first={i === 0}
          last={i === api.lists.length - 1}
          cards={visible(list.id)}
          total={api.cards.filter((c) => c.listId === list.id).length}
          dragId={dragId}
          target={target?.listId === list.id ? target.index : null}
          attachments={attachments}
          fieldsOnCard={board.fields}
          onDragStart={(id) => setDragId(id)}
          onTarget={(index) => setTarget({ listId: list.id, index })}
          onDrop={onDrop}
          onOpenCard={onOpenCard}
        />
      ))}

      <div className="w-[78vw] max-w-xs shrink-0 snap-start sm:w-72">
        {adding ? (
          <form
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-2"
            onSubmit={(e) => {
              e.preventDefault()
              void submitList()
            }}
          >
            <input
              autoFocus
              value={newList}
              maxLength={60}
              onChange={(e) => setNewList(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
              placeholder="Nome da lista"
              aria-label="Nome da nova lista"
              className="h-9 rounded-lg border border-line bg-surface px-3 text-[13.5px] outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="primary">
                Adicionar lista
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 text-[13.5px] font-medium text-muted transition-colors hover:border-accent hover:text-fg"
          >
            <Plus className="h-4 w-4" /> Adicionar lista
          </button>
        )}
      </div>
    </div>
  )
}

interface ColumnProps {
  api: BoardApi
  list: BoardList
  first: boolean
  last: boolean
  cards: BoardCard[]
  total: number
  dragId: ID | null
  target: number | null
  attachments: Map<ID, number>
  fieldsOnCard: NonNullable<BoardApi['board']>['fields']
  onDragStart: (id: ID) => void
  onTarget: (index: number) => void
  onDrop: (e: DragEvent) => void
  onOpenCard: (id: ID) => void
}

function Column({ api, list, first, last, cards, total, dragId, target, attachments, fieldsOnCard, onDragStart, onTarget, onDrop, onOpenCard }: ColumnProps) {
  const confirm = useConfirm()
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(list.name)
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const isRef = list.kind === 'reference'
  // Índices ignoram o cartão arrastado (ele “sai” da lista enquanto é arrastado).
  const others = cards.filter((c) => c.id !== dragId)

  const saveName = () => {
    setRenaming(false)
    const n = name.trim()
    if (n && n !== list.name) void api.updateList(list.id, { name: n })
    else setName(list.name)
  }

  const addCard = async () => {
    const t = title.trim()
    if (!t) return setComposing(false)
    setTitle('')
    await api.createCard(list.id, t)
  }

  const remove = async () => {
    const ok = await confirm({
      title: `Excluir a lista “${list.name}”?`,
      message: total ? `${plural(total, 'cartão será excluído', 'cartões serão excluídos')} junto com ela.` : 'A lista está vazia.',
      danger: true,
    })
    if (ok) await api.deleteList(list.id)
  }

  return (
    <section
      aria-label={list.name}
      onDragOver={(e) => {
        if (!dragId) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        // Sobre a área vazia da coluna: fim da lista.
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.dropEnd) onTarget(others.length)
      }}
      onDrop={onDrop}
      className={cn(
        'flex max-h-[calc(100dvh-15rem)] w-[78vw] max-w-xs shrink-0 snap-start flex-col rounded-xl border transition-colors sm:w-72',
        isRef ? 'border-accent/25 bg-accent-soft' : 'border-line bg-surface-2/60',
        target !== null && 'border-accent/60',
      )}
    >
      <header className="flex items-center gap-1.5 px-3 pt-2.5 pb-2">
        {renaming ? (
          <input
            autoFocus
            value={name}
            maxLength={60}
            aria-label="Nome da lista"
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveName()
              if (e.key === 'Escape') {
                setName(list.name)
                setRenaming(false)
              }
            }}
            className="h-7 min-w-0 flex-1 rounded-md border border-accent bg-surface px-2 text-[13px] font-semibold outline-none"
          />
        ) : (
          <button type="button" onClick={() => setRenaming(true)} className="flex min-w-0 flex-1 cursor-text items-center gap-1.5 text-left" title="Renomear lista">
            {list.icon && <span aria-hidden="true">{list.icon}</span>}
            <h3 className="truncate text-[12.5px] font-semibold tracking-wide uppercase">{list.name}</h3>
            <span className="tabular shrink-0 text-[12px] text-subtle">{total}</span>
          </button>
        )}
        {isRef && (
          <span className="rounded bg-accent/12 px-1.5 py-px text-[10px] font-semibold tracking-wide text-accent uppercase" title="Dossiê permanente — não é etapa do fluxo">
            Dossiê
          </span>
        )}
        <Menu
          items={[
            { label: 'Renomear', icon: Pencil, onSelect: () => setRenaming(true) },
            ...(!first ? [{ label: 'Mover para a esquerda', icon: ArrowLeft, onSelect: () => void api.shiftList(list.id, -1) }] : []),
            ...(!last ? [{ label: 'Mover para a direita', icon: ArrowRight, onSelect: () => void api.shiftList(list.id, 1) }] : []),
            isRef
              ? { label: 'Tornar etapa do fluxo', icon: Workflow, onSelect: () => void api.updateList(list.id, { kind: 'flow' }) }
              : { label: 'Tornar dossiê (referência)', icon: BookOpen, onSelect: () => void api.updateList(list.id, { kind: 'reference' }) },
            { label: 'Excluir lista', icon: Trash2, danger: true, onSelect: () => void remove() },
          ]}
        />
      </header>

      <div className="scrollbar-thin flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2" data-drop-end="1">
        {cards.map((card) => {
          const dragging = card.id === dragId
          // Índice entre os demais cartões (o arrastado não conta)
          const i = others.indexOf(card)
          return (
            <div key={card.id}>
              {!dragging && target === i && <DropLine />}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', card.id)
                  onDragStart(card.id)
                }}
                onDragOver={(e) => {
                  if (!dragId || dragging) return
                  e.preventDefault()
                  e.stopPropagation()
                  const r = e.currentTarget.getBoundingClientRect()
                  onTarget(e.clientY < r.top + r.height / 2 ? i : i + 1)
                }}
                onDrop={onDrop}
                className={cn('active:cursor-grabbing', dragging && 'opacity-40')}
              >
                <BoardCardTile
                  card={card}
                  labels={api.labels}
                  fields={fieldsOnCard}
                  kind={list.kind}
                  comments={api.comments.get(card.id) ?? 0}
                  attachments={attachments.get(card.id) ?? 0}
                  onOpen={() => onOpenCard(card.id)}
                />
              </div>
            </div>
          )
        })}
        {target === others.length && <DropLine />}
        {cards.length === 0 && !composing && (
          <p data-drop-end="1" className="rounded-lg border border-dashed border-line-strong/70 px-3 py-4 text-center text-[12px] text-subtle">
            {dragId ? 'Solte aqui' : total ? 'Nenhum cartão com esses filtros' : 'Sem cartões'}
          </p>
        )}
        {composing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void addCard()
            }}
            className="flex flex-col gap-2"
          >
            <textarea
              autoFocus
              rows={2}
              value={title}
              maxLength={300}
              aria-label="Título do cartão"
              placeholder="Título do cartão…"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void addCard()
                }
                if (e.key === 'Escape') setComposing(false)
              }}
              className="resize-none rounded-lg border border-accent bg-surface px-3 py-2 text-[13.5px] shadow-card outline-none"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="primary">
                Adicionar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setComposing(false)}>
                Fechar
              </Button>
            </div>
          </form>
        ) : null}
      </div>
      {!composing && (
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="mx-2 mb-2 flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[13px] text-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <Plus className="h-4 w-4" /> Adicionar cartão
        </button>
      )}
    </section>
  )
}

function DropLine() {
  return <div className="my-0.5 h-0.5 rounded-full bg-accent" aria-hidden="true" />
}
