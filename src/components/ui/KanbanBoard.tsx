import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KanbanColumn<S extends string> {
  id: S
  label: string
  /** Classe de cor da bolinha do cabeçalho (ex.: 'bg-sky-500'). */
  dot: string
}

interface Props<T, S extends string> {
  columns: KanbanColumn<S>[]
  items: T[]
  getId: (item: T) => string
  getStatus: (item: T) => S
  onMove: (item: T, status: S) => void
  renderCard: (item: T) => ReactNode
  onAdd?: (status: S) => void
  /** 'grid': colunas dividem a largura (poucas colunas). 'scroll': colunas de largura fixa com rolagem horizontal. */
  layout?: 'grid' | 'scroll'
  addLabel?: string
}

/**
 * Kanban genérico com drag-and-drop nativo do HTML5 (sem dependências).
 * Usado por Tarefas e Conteúdo. Em telas de toque, os cartões oferecem um seletor de status.
 */
export function KanbanBoard<T, S extends string>({
  columns,
  items,
  getId,
  getStatus,
  onMove,
  renderCard,
  onAdd,
  layout = 'grid',
  addLabel = 'Novo item',
}: Props<T, S>) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<S | null>(null)

  const drop = (status: S) => {
    const item = items.find((i) => getId(i) === dragId)
    setDragId(null)
    setOverCol(null)
    if (item && getStatus(item) !== status) onMove(item, status)
  }

  return (
    <div
      className={cn(
        'scrollbar-thin -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0',
        layout === 'grid' && 'md:grid md:overflow-visible',
      )}
      style={layout === 'grid' ? { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` } : undefined}
    >
      {columns.map((col) => {
        const list = items.filter((i) => getStatus(i) === col.id)
        const isOver = overCol === col.id && dragId !== null
        return (
          <section
            key={col.id}
            aria-label={col.label}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (overCol !== col.id) setOverCol(col.id)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null)
            }}
            onDrop={(e) => {
              e.preventDefault()
              drop(col.id)
            }}
            className={cn(
              'flex shrink-0 snap-start flex-col rounded-xl border bg-surface-2/60 transition-colors',
              layout === 'grid' ? 'w-[82vw] max-w-sm sm:w-80 md:w-auto md:max-w-none' : 'w-[78vw] max-w-xs sm:w-72',
              isOver ? 'border-accent/60 bg-accent-soft' : 'border-line',
            )}
          >
            <header className="flex items-center justify-between px-3 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', col.dot)} />
                <h3 className="text-[12px] font-semibold tracking-wide text-muted uppercase">{col.label}</h3>
                <span className="tabular text-[12px] text-subtle">{list.length}</span>
              </div>
              {onAdd && (
                <button
                  type="button"
                  aria-label={`${addLabel} em ${col.label}`}
                  onClick={() => onAdd(col.id)}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface hover:text-fg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </header>
            <div className="flex min-h-32 flex-1 flex-col gap-2 px-2 pb-2">
              {list.map((item) => {
                const id = getId(item)
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', id)
                      setDragId(id)
                    }}
                    onDragEnd={() => {
                      setDragId(null)
                      setOverCol(null)
                    }}
                    className={cn('active:cursor-grabbing', dragId === id && 'rotate-1 opacity-50')}
                  >
                    {renderCard(item)}
                  </div>
                )
              })}
              {list.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line-strong/70 px-3 py-6 text-center text-[12.5px] text-subtle">
                  {dragId ? 'Solte aqui' : 'Vazio'}
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
