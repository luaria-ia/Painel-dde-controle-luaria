import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface MenuItem {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  danger?: boolean
}

interface Position {
  top: number
  left: number
  openUp: boolean
}

const GAP = 4
const MARGIN = 8

/**
 * Menu de ações "⋯". O painel é renderizado num portal com posição fixa, para não ser
 * cortado por contêineres com overflow (tabelas roláveis, cards). Abre para cima
 * quando não há espaço abaixo.
 */
export function Menu({ items, trigger, align = 'right' }: { items: MenuItem[]; trigger?: ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Position | null>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Calcula a posição a partir do botão e do tamanho real do painel.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = anchorRef.current?.getBoundingClientRect()
      const panel = panelRef.current
      if (!anchor || !panel) return
      const { offsetWidth: w, offsetHeight: h } = panel
      const spaceBelow = window.innerHeight - anchor.bottom
      const openUp = spaceBelow < h + GAP + MARGIN && anchor.top > spaceBelow
      const top = openUp ? anchor.top - h - GAP : anchor.bottom + GAP
      let left = align === 'right' ? anchor.right - w : anchor.left
      left = Math.min(Math.max(MARGIN, left), window.innerWidth - w - MARGIN)
      setPos({ top, left, openUp })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open, align])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!anchorRef.current?.contains(t) && !panelRef.current?.contains(t)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    // Rolar a página fecha o menu (evita painel "solto" na tela).
    const onScroll = (e: Event) => {
      if (!panelRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const toggle = () => {
    setPos(null)
    setOpen((v) => !v)
  }

  return (
    <div ref={anchorRef} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      {trigger ? (
        <span onClick={toggle}>{trigger}</span>
      ) : (
        <Button variant="ghost" size="icon" icon={MoreHorizontal} aria-label="Mais ações" aria-haspopup="menu" aria-expanded={open} onClick={toggle} />
      )}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}
            className="animate-pop-in fixed z-[70] min-w-40 rounded-lg border border-line bg-surface p-1 shadow-pop"
          >
            {items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    item.onSelect()
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors',
                    item.danger ? 'text-rose-600 hover:bg-rose-500/10 dark:text-rose-400' : 'text-fg hover:bg-surface-2',
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 opacity-80" />}
                  {item.label}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
