import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Brain, CalendarClock, CheckSquare, CornerDownLeft, FileSignature, FolderKanban, FolderOpen, Megaphone, Search, Users, type LucideIcon } from 'lucide-react'
import { ContentFormModal } from '@/components/contents/ContentFormModal'
import { EventFormModal } from '@/components/events/EventFormModal'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { MAIN_NAV, SECONDARY_NAV } from '@/config/navigation'
import { cn, normalize } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { CalendarEvent, Content, Task } from '@/types'

interface Result {
  key: string
  group: string
  icon: LucideIcon
  title: string
  subtitle?: string
  run: () => void
}

const GROUP_ORDER = ['Ir para', 'Projetos', 'Clientes', 'Contratos', 'Tarefas', 'Conteúdos', 'Conhecimento', 'Eventos', 'Arquivos']
const MAX_PER_GROUP = 5

/**
 * Busca global (Cmd/Ctrl+K). Procura em projetos, clientes, contratos, tarefas,
 * conteúdos, eventos e arquivos — tudo em memória, a partir do estado já carregado.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { projects, clients, contracts, tasks, contents, events, files, knowledge, projectById, clientById } = useData()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [task, setTask] = useState<Task | null>(null)
  const [content, setContent] = useState<Content | null>(null)
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  const results = useMemo<Result[]>(() => {
    const q = normalize(query.trim())
    const go = (to: string) => () => navigate(to)
    const match = (...texts: Array<string | undefined | null>) => !q || normalize(texts.filter(Boolean).join(' ')).includes(q)
    const projectName = (id: string | null) => (id ? projectById.get(id)?.name : undefined)
    const out: Result[] = []

    for (const n of [...MAIN_NAV, ...SECONDARY_NAV]) if (match(n.label)) out.push({ key: `nav${n.to}`, group: 'Ir para', icon: n.icon, title: n.label, run: go(n.to) })
    if (!q) return out

    const push = (items: Result[]) => out.push(...items.slice(0, MAX_PER_GROUP))
    push(projects.filter((p) => match(p.name, p.description)).map((p) => ({ key: `p${p.id}`, group: 'Projetos', icon: FolderKanban, title: p.name, run: go(`/projetos/${p.id}`) })))
    push(clients.filter((c) => match(c.name, c.company, c.email)).map((c) => ({ key: `c${c.id}`, group: 'Clientes', icon: Users, title: c.name, subtitle: c.company, run: go(`/clientes/${c.id}`) })))
    push(contracts
        .filter((k) => match(k.title, k.service, k.clientId ? clientById.get(k.clientId)?.name : ''))
        .map((k) => ({ key: `k${k.id}`, group: 'Contratos', icon: FileSignature, title: k.title, subtitle: k.clientId ? clientById.get(k.clientId)?.name : undefined, run: go(`/contratos/${k.id}`) })),
    )
    push(tasks.filter((t) => match(t.title, t.description)).map((t) => ({ key: `t${t.id}`, group: 'Tarefas', icon: CheckSquare, title: t.title, subtitle: projectName(t.projectId), run: () => setTask(t) })))
    push(contents.filter((c) => match(c.title, c.caption)).map((c) => ({ key: `n${c.id}`, group: 'Conteúdos', icon: Megaphone, title: c.title, subtitle: projectName(c.projectId), run: () => setContent(c) })))
    push(events.filter((e) => match(e.title, e.description)).map((e) => ({ key: `e${e.id}`, group: 'Eventos', icon: CalendarClock, title: e.title, subtitle: e.date.split('-').reverse().join('/'), run: () => setEvent(e) })))
    push(
      knowledge
        .filter((k) => match(k.title, k.content, k.tags.join(' ')))
        .map((k) => ({ key: `kn${k.id}`, group: 'Conhecimento', icon: Brain, title: k.title, subtitle: projectName(k.projectId), run: go(k.projectId ? `/projetos/${k.projectId}?aba=conhecimento` : '/conhecimento') })),
    )
    push(files.filter((f) => match(f.name, f.description)).map((f) => ({ key: `f${f.id}`, group: 'Arquivos', icon: FolderOpen, title: f.name, subtitle: projectName(f.projectId), run: go('/arquivos') })))
    return out.sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
  }, [query, projects, clients, contracts, tasks, contents, events, files, knowledge, projectById, clientById, navigate])

  const select = (r: Result | undefined) => {
    if (!r) return
    onClose()
    r.run()
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(results[active])
    } else if (e.key === 'Escape') onClose()
  }

  return (
    <>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[10vh] sm:px-6" role="dialog" aria-modal="true" aria-label="Busca global">
            <div className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="animate-pop-in relative flex max-h-[70dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="h-4 w-4 shrink-0 text-subtle" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActive(0)
                  }}
                  onKeyDown={onKey}
                  placeholder="Buscar projetos, clientes, contratos, tarefas, conhecimento…"
                  className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
                  aria-label="Buscar"
                />
                <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[11px] text-subtle sm:block">Esc</kbd>
              </div>
              <div ref={listRef} className="scrollbar-thin overflow-y-auto p-2">
                {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-subtle">Nada encontrado para “{query}”.</p>}
                {results.map((r, i) => {
                  const header = r.group !== results[i - 1]?.group ? r.group : null
                  const Icon = r.icon
                  return (
                    <div key={r.key}>
                      {header && <p className="px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-subtle uppercase">{header}</p>}
                      <button
                        type="button"
                        data-index={i}
                        onMouseMove={() => setActive(i)}
                        onClick={() => select(r)}
                        className={cn('flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm', i === active ? 'bg-surface-2' : '')}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-subtle" />
                        <span className="min-w-0 flex-1 truncate">{r.title}</span>
                        {r.subtitle && <span className="max-w-[40%] truncate text-[12px] text-subtle">{r.subtitle}</span>}
                        {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-subtle" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
      <TaskFormModal open={!!task} task={task} onClose={() => setTask(null)} />
      <ContentFormModal open={!!content} content={content} onClose={() => setContent(null)} />
      <EventFormModal open={!!event} event={event} onClose={() => setEvent(null)} />
    </>
  )
}
