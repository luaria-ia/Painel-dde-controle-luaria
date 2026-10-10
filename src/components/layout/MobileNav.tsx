import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, Search, Settings, X } from 'lucide-react'
import { MAIN_NAV, NAV_GROUPS, SECONDARY_NAV } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { NotificationBell } from '@/components/notifications/NotificationCenter'

/** Barra superior compacta (< lg). */
export function MobileTopBar({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-md lg:hidden">
      <Link to="/" aria-label="Ir para o Dashboard">
        <Logo />
      </Link>
      <div className="flex items-center gap-1">
        <NotificationBell align="right" className="h-9 w-9" />
        <button
          type="button"
          aria-label="Buscar"
          onClick={onSearch}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        <NavLink
          to="/configuracoes"
          aria-label="Configurações"
          className={({ isActive }) =>
            cn('flex h-9 w-9 items-center justify-center rounded-lg transition-colors', isActive ? 'bg-surface text-fg ring-1 ring-line' : 'text-muted hover:bg-surface')
          }
        >
          <Settings className="h-[18px] w-[18px]" />
        </NavLink>
      </div>
    </header>
  )
}

const itemClass = (active: boolean) =>
  cn('flex h-15 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors', active ? 'text-accent' : 'text-subtle hover:text-muted')

/** Navegação inferior estilo app (< lg): 4 atalhos + "Mais" com todos os módulos. */
export function MobileBottomNav() {
  const [more, setMore] = useState(false)
  const { pathname } = useLocation()
  const primary = MAIN_NAV.filter((i) => i.mobile)
  const inMore = !primary.some((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)))

  useEffect(() => setMore(false), [pathname])

  return (
    <>
      {more && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Todos os módulos">
          <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={() => setMore(false)} />
          <div className="animate-slide-up absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-surface px-4 pt-3 pb-[calc(5rem+env(safe-area-inset-bottom))]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Módulos</p>
              <button type="button" aria-label="Fechar" onClick={() => setMore(false)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-surface-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            {NAV_GROUPS.map((g) => (
              <div key={g.label} className="mb-3">
                <p className="pb-1.5 text-[10.5px] font-medium tracking-wider text-subtle uppercase">{g.label}</p>
                <div className="grid grid-cols-4 gap-2">
                  {g.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-[11.5px] font-medium',
                            isActive ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line text-muted',
                          )
                        }
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.9} />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2">
              {SECONDARY_NAV.map((item) => (
                <NavLink key={item.to} to={item.to} className="flex flex-col items-center gap-1.5 rounded-xl border border-line px-1 py-2.5 text-[11.5px] font-medium text-muted">
                  <item.icon className="h-5 w-5" strokeWidth={1.9} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {primary.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => itemClass(isActive && !more)}>
                <Icon className="h-5 w-5" strokeWidth={1.9} />
                {item.label}
              </NavLink>
            )
          })}
          <button type="button" aria-expanded={more} onClick={() => setMore((v) => !v)} className={cn(itemClass(more || inMore), 'cursor-pointer')}>
            <LayoutGrid className="h-5 w-5" strokeWidth={1.9} />
            Mais
          </button>
        </div>
      </nav>
    </>
  )
}
