import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, LogOut, Search } from 'lucide-react'
import { useAuth } from '@/auth/authContext'
import { Button } from '@/components/ui/Button'
import { NAV_SECTIONS, NAV_TOP, type NavBadge, type NavItem, type NavSection } from '@/config/navigation'
import { PROJECT_COLORS } from '@/config/labels'
import { useSidebarSections } from '@/hooks/useSidebarSections'
import { cn, initials } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { Project } from '@/types'
import { Logo } from './Logo'
import { NotificationBell } from '@/components/notifications/NotificationCenter'

function NavEntry({ item, badge }: { item: NavItem; badge?: number }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'group flex h-[32px] items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium transition-colors',
          isActive
            ? item.to === '/agentes'
              ? 'bg-[#5b50e6] text-white shadow-md shadow-indigo-500/25 font-semibold'
              : 'bg-surface text-fg shadow-card ring-1 ring-line'
            : 'text-muted hover:bg-surface hover:text-fg',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-4 w-4',
              isActive
                ? item.to === '/agentes'
                  ? 'text-white'
                  : 'text-accent'
                : 'text-subtle group-hover:text-muted',
            )}
            strokeWidth={2}
          />
          <span className="flex-1">{item.label}</span>
          {!!badge && (
            <span
              className={cn(
                'tabular text-[11px]',
                isActive && item.to === '/agentes' ? 'text-white/80' : 'text-subtle',
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function ProjectEntry({ project }: { project: Project }) {
  return (
    <NavLink
      to={`/projetos/${project.id}`}
      className={({ isActive }) =>
        cn(
          'flex h-7 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors',
          isActive ? 'bg-surface text-fg ring-1 ring-line' : 'text-muted hover:bg-surface hover:text-fg',
        )
      }
    >
      <span className={cn('h-2 w-2 rounded-full', PROJECT_COLORS[project.color]?.dot)} />
      <span className="truncate">{project.name}</span>
    </NavLink>
  )
}

const matches = (pathname: string, to: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`))

/** Seção recolhível (accordion): título é um botão real; várias podem ficar abertas. */
function SidebarSection({
  section,
  open,
  onToggle,
  hasActive,
  count,
  children,
}: {
  section: NavSection
  open: boolean
  onToggle: () => void
  hasActive: boolean
  count: number
  children: ReactNode
}) {
  const panelId = `nav-section-${section.id}`
  return (
    <div>
      <button
        type="button"
        data-nav-section
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex h-7 w-full cursor-pointer items-center gap-1.5 rounded-md pr-1.5 pl-2.5 text-[10.5px] font-medium tracking-wider text-subtle uppercase transition-colors hover:bg-surface/55 hover:text-muted"
      >
        <span className="flex-1 text-left">{section.title}</span>
        {!open && count > 0 && <span className="tabular tracking-normal">{count}</span>}
        {!open && hasActive && <span className="h-[5px] w-[5px] rounded-full bg-accent" title="A página atual está nesta seção" />}
        <ChevronDown className={cn('h-3.5 w-3.5 opacity-80 transition-transform duration-200 ease-out', open && 'rotate-180')} />
      </button>
      <div
        id={panelId}
        role="region"
        aria-label={section.title}
        className={cn('grid transition-[grid-template-rows] duration-200 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div
          inert={!open}
          className={cn(
            'flex min-h-0 flex-col gap-0.5 overflow-hidden transition-[opacity,translate,visibility] duration-200 ease-out',
            open ? 'visible pt-0.5 pb-2 opacity-100' : 'invisible -translate-y-0.5 opacity-0',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/** Sidebar fixa (desktop ≥ lg). */
export function Sidebar({ onSearch }: { onSearch: () => void }) {
  const { projects, tasks, settings } = useData()
  const { user, signOut } = useAuth()
  const active = projects.filter((p) => p.status === 'ativo')
  const badges: Record<NavBadge, number> = { pendingTasks: tasks.filter((t) => t.status !== 'concluido').length }
  const { pathname } = useLocation()
  const { isOpen, toggle } = useSidebarSections()
  const navRef = useRef<HTMLElement>(null)

  /** ↑ ↓ Home End movem o foco entre os títulos de seção (padrão WAI-ARIA Accordion). */
  function onSectionKeys(e: KeyboardEvent<HTMLElement>) {
    const target = e.target as HTMLElement
    if (!target.hasAttribute('data-nav-section')) return
    const heads = [...(navRef.current?.querySelectorAll<HTMLElement>('[data-nav-section]') ?? [])]
    const i = heads.indexOf(target)
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: heads.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    heads[(next + heads.length) % heads.length]?.focus()
  }
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-bg lg:flex">
      <div className="flex h-14 shrink-0 items-center justify-between pr-2.5 pl-4">
        <Logo />
        <NotificationBell />
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-subtle shadow-card transition-colors hover:border-line-strong hover:text-muted"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Buscar…</span>
          <kbd className="rounded border border-line px-1 text-[10.5px]">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-3">
        <nav className="flex flex-col px-3 pt-1" aria-label="Navegação principal" onKeyDown={onSectionKeys} ref={navRef}>
          <NavEntry item={NAV_TOP} />
          <div className="mx-2.5 my-2 h-px bg-line" />
          {NAV_SECTIONS.map((section) => {
            const projects = section.source === 'activeProjects' ? active.slice(0, 8) : []
            const items = section.items ?? []
            if (!items.length && !projects.length) return null
            const hasActive = items.some((i) => matches(pathname, i.to)) || projects.some((p) => pathname === `/projetos/${p.id}`)
            const count = items.reduce((n, i) => n + (i.badge ? badges[i.badge] : 0), 0)
            return (
              <SidebarSection key={section.id} section={section} open={isOpen(section)} onToggle={() => toggle(section)} hasActive={hasActive} count={count}>
                {items.map((item) => (
                  <NavEntry key={item.to} item={item} badge={item.badge ? badges[item.badge] : undefined} />
                ))}
                {projects.map((p) => (
                  <ProjectEntry key={p.id} project={p} />
                ))}
              </SidebarSection>
            )
          })}
        </nav>
      </div>

      <div className="flex shrink-0 flex-col gap-0.5 border-t border-line px-3 py-3">
        <div className="flex items-center gap-2.5 py-1 pl-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
            {initials(settings.userName || '?')}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium">{settings.userName}</p>
            <p className="truncate text-[11px] text-subtle" title={user?.email}>
              {user?.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" icon={LogOut} aria-label="Sair" title="Sair" onClick={signOut} />
        </div>
      </div>
    </aside>
  )
}
