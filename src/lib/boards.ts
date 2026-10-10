import { addDays, daysFromToday, todayISO } from '@/lib/format'
import { normalize } from '@/lib/utils'
import type { ID, ISODate, TaskPriority } from '@/types'
import type { AutomationAction, AutomationRule, Board, BoardCard, BoardLabel, BoardList, LabelColor } from '@/types/boards'

// ---------- Ordem (posições fracionárias) ----------

export const POSITION_STEP = 1024

/** Posição para inserir entre `before` e `after` (qualquer um pode faltar). */
export function positionBetween(before: number | undefined, after: number | undefined): number {
  if (before === undefined && after === undefined) return POSITION_STEP
  if (before === undefined) return after! - POSITION_STEP
  if (after === undefined) return before + POSITION_STEP
  return (before + after) / 2
}

/** Cartões de uma lista na ordem manual. */
export const cardsOfList = (cards: BoardCard[], listId: ID) => cards.filter((c) => c.listId === listId).sort((a, b) => a.position - b.position)

/**
 * Posição para soltar um cartão em `listId` no índice `index` (desconsiderando o próprio cartão).
 * Retorna também `renumber` quando o espaço entre vizinhos ficou pequeno demais.
 */
export function dropPosition(cards: BoardCard[], cardId: ID, listId: ID, index: number) {
  const list = cardsOfList(cards, listId).filter((c) => c.id !== cardId)
  const before = list[index - 1]?.position
  const after = list[index]?.position
  const position = positionBetween(before, after)
  const tight = before !== undefined && after !== undefined && Math.abs(after - before) < 1e-6
  return { position, renumber: tight }
}

// ---------- Prazos ----------

export type DueState = 'overdue' | 'today' | 'soon' | 'later' | 'done'

export function dueState(card: Pick<BoardCard, 'dueDate' | 'completedAt'>): DueState | null {
  if (!card.dueDate) return null
  if (card.completedAt) return 'done'
  const d = daysFromToday(card.dueDate)
  return d < 0 ? 'overdue' : d === 0 ? 'today' : d <= 2 ? 'soon' : 'later'
}

// ---------- Filtros e ordenação ----------

export interface BoardFilters {
  query: string
  labelIds: ID[]
  assignee: string
  due: '' | 'overdue' | 'week' | 'none'
  showCompleted: boolean
}

export const EMPTY_FILTERS: BoardFilters = { query: '', labelIds: [], assignee: '', due: '', showCompleted: true }

export type BoardSort = 'manual' | 'due' | 'priority' | 'recent'

const PRIORITY_RANK: Record<TaskPriority, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 }

export function matchesFilters(card: BoardCard, f: BoardFilters): boolean {
  if (!f.showCompleted && card.completedAt) return false
  if (f.labelIds.length && !f.labelIds.some((id) => card.labelIds.includes(id))) return false
  if (f.assignee && card.assignee !== f.assignee) return false
  if (f.due === 'none' && card.dueDate) return false
  if (f.due === 'overdue' && dueState(card) !== 'overdue') return false
  if (f.due === 'week' && (!card.dueDate || card.completedAt || daysFromToday(card.dueDate) > 7)) return false
  if (f.query.trim()) {
    const q = normalize(f.query.trim())
    const hay = normalize([card.title, card.description, card.assignee, ...Object.values(card.fields), ...card.checklist.map((i) => i.text)].join(' '))
    if (!hay.includes(q)) return false
  }
  return true
}

export function sortCards(cards: BoardCard[], sort: BoardSort): BoardCard[] {
  const list = [...cards]
  if (sort === 'manual') return list.sort((a, b) => a.position - b.position)
  if (sort === 'recent') return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sort === 'due') return list.sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || a.position - b.position)
  return list.sort((a, b) => (a.priority ? PRIORITY_RANK[a.priority] : 9) - (b.priority ? PRIORITY_RANK[b.priority] : 9) || a.position - b.position)
}

export const activeFilterCount = (f: BoardFilters) => (f.query.trim() ? 1 : 0) + f.labelIds.length + (f.assignee ? 1 : 0) + (f.due ? 1 : 0) + (f.showCompleted ? 0 : 1)

// ---------- Automações ----------

export type AutomationEvent = { type: 'card_entered_list'; list: BoardList } | { type: 'label_added'; label: BoardLabel }

/** Efeitos concretos de uma automação, para o app aplicar. */
export interface AutomationEffects {
  addLabelIds: ID[]
  removeLabelIds: ID[]
  complete: boolean
  tasks: Array<{ title: string; dueDate: ISODate | null; priority: TaskPriority }>
  /** Regras que dispararam (para avisar o usuário). */
  fired: AutomationRule[]
}

const fill = (text: string, card: BoardCard) => text.replace(/\{card\}/g, card.title)

/**
 * Avalia as automações ativas do quadro para um evento. Função pura: não grava nada.
 * Regras com gatilho ainda não suportado (ex.: date_reached) são ignoradas.
 */
export function evaluateAutomations(board: Pick<Board, 'automations'>, labels: BoardLabel[], card: BoardCard, event: AutomationEvent, today = todayISO()): AutomationEffects {
  const effects: AutomationEffects = { addLabelIds: [], removeLabelIds: [], complete: false, tasks: [], fired: [] }
  const labelByName = (name: string) => labels.find((l) => normalize(l.name) === normalize(name))
  for (const rule of board.automations) {
    if (!rule.enabled) continue
    const w = rule.when
    const matches =
      (w.type === 'card_entered_list' && event.type === 'card_entered_list' && event.list.templateKey === w.list) ||
      (w.type === 'label_added' && event.type === 'label_added' && normalize(event.label.name) === normalize(w.label))
    if (!matches) continue
    effects.fired.push(rule)
    for (const a of rule.then) applyAction(a)
  }
  return effects

  function applyAction(a: AutomationAction) {
    if (a.type === 'add_label') {
      const l = labelByName(a.label)
      if (l && !card.labelIds.includes(l.id) && !effects.addLabelIds.includes(l.id)) effects.addLabelIds.push(l.id)
    } else if (a.type === 'remove_label') {
      const l = labelByName(a.label)
      if (l && card.labelIds.includes(l.id)) effects.removeLabelIds.push(l.id)
    } else if (a.type === 'complete_card') {
      if (!card.completedAt) effects.complete = true
    } else if (a.type === 'create_task') {
      const fromField = a.dueFromField ? card.fields[a.dueFromField] : ''
      const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(fromField ?? '') ? fromField : a.dueInDays !== undefined ? addDays(today, a.dueInDays) : null
      effects.tasks.push({ title: fill(a.title, card).slice(0, 200), dueDate, priority: a.priority ?? 'media' })
    }
  }
}

export const hasEffects = (e: AutomationEffects) => e.addLabelIds.length + e.removeLabelIds.length + e.tasks.length > 0 || e.complete

// ---------- Visual ----------

export const LABEL_COLORS: Record<LabelColor, { name: string; chip: string; bar: string }> = {
  sky: { name: 'Azul', chip: 'bg-sky-500/12 text-sky-700 ring-sky-600/20 dark:text-sky-300', bar: 'bg-sky-500' },
  violet: { name: 'Roxo', chip: 'bg-violet-500/12 text-violet-700 ring-violet-600/20 dark:text-violet-300', bar: 'bg-violet-500' },
  emerald: { name: 'Verde', chip: 'bg-emerald-500/12 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300', bar: 'bg-emerald-500' },
  amber: { name: 'Amarelo', chip: 'bg-amber-500/14 text-amber-800 ring-amber-600/20 dark:text-amber-300', bar: 'bg-amber-400' },
  orange: { name: 'Laranja', chip: 'bg-orange-500/12 text-orange-700 ring-orange-600/20 dark:text-orange-300', bar: 'bg-orange-500' },
  rose: { name: 'Vermelho', chip: 'bg-rose-500/12 text-rose-700 ring-rose-600/20 dark:text-rose-300', bar: 'bg-rose-500' },
  teal: { name: 'Turquesa', chip: 'bg-teal-500/12 text-teal-700 ring-teal-600/20 dark:text-teal-300', bar: 'bg-teal-500' },
  slate: { name: 'Cinza', chip: 'bg-slate-500/12 text-slate-700 ring-slate-600/20 dark:text-slate-300', bar: 'bg-slate-400' },
}

export function formatFieldValue(type: string, value: string): string {
  if (!value) return ''
  if (type === 'currency') {
    const n = Number(value.replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) : value
  }
  if (type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().slice(0, 2).join('/')
  return value
}
