import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SEVERITY } from '@/config/labels'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { AppNotification } from '@/types'

function timeAgo(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} h`
  return `${Math.round(h / 24)} d`
}

/** Sino com a central de notificações internas (geradas pelas automações). */
export function NotificationBell({ className, align = 'left' }: { className?: string; align?: 'left' | 'right' }) {
  const { notifications, markNotificationsRead, clearReadNotifications } = useData()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((n) => !n.readAt)

  useEffect(() => {
    if (!open) return
    const r = btnRef.current!.getBoundingClientRect()
    const width = Math.min(380, window.innerWidth - 16)
    const left = align === 'left' ? Math.min(r.left, window.innerWidth - width - 8) : Math.max(8, r.right - width)
    setPos({ top: r.bottom + 6, left })
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, align])

  const openItem = (n: AppNotification) => {
    if (!n.readAt) markNotificationsRead([n.id])
    setOpen(false)
    if (n.link?.startsWith('/')) navigate(n.link)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Notificações${unread.length ? ` (${unread.length} não lidas)` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn('relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-fg', className)}
      >
        <Bell className="h-[17px] w-[17px]" />
        {unread.length > 0 && (
          <span className="tabular absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notificações"
            style={{ top: pos.top, left: pos.left, width: Math.min(380, window.innerWidth - 16) }}
            className="animate-pop-in fixed z-[70] flex max-h-[70dvh] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="text-sm font-semibold">Notificações</p>
              <div className="flex items-center gap-1">
                {unread.length > 0 && (
                  <button type="button" onClick={() => markNotificationsRead(unread.map((n) => n.id))} className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted hover:bg-surface-2 hover:text-fg">
                    <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
                  </button>
                )}
                {notifications.some((n) => n.readAt) && (
                  <button type="button" onClick={() => clearReadNotifications()} className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted hover:bg-surface-2 hover:text-fg" title="Apagar as já lidas">
                    <Trash2 className="h-3.5 w-3.5" /> Limpar lidas
                  </button>
                )}
              </div>
            </div>
            <div className="scrollbar-thin overflow-y-auto">
              {notifications.length === 0 ? (
                <EmptyState compact icon={Bell} title="Nenhuma notificação" description="Alertas das automações aparecem aqui." />
              ) : (
                <ul className="divide-y divide-line">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button type="button" onClick={() => openItem(n)} className={cn('flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2/60', !n.readAt && 'bg-accent-soft/40')}>
                        <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', SEVERITY[n.severity].dot)} />
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-[13px]', !n.readAt ? 'font-medium text-fg' : 'text-muted')}>{n.title}</span>
                          {n.body && <span className="block truncate text-[11.5px] text-subtle">{n.body}</span>}
                        </span>
                        <span className="shrink-0 text-[11px] text-subtle">{timeAgo(n.createdAt)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
