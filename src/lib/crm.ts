import { addDays, todayISO } from '@/lib/format'
import { normalize } from '@/lib/utils'
import type { ID } from '@/types'
import type { BoardCard, BoardList } from '@/types/boards'

/*
 * CRM em TABELA = outra visualização dos MESMOS cartões do Kanban (mesma tabela board_cards).
 * Etapa = lista do cartão; Status = campo `status` (situação do lead). Campos: fields.empresa, whatsapp, instagram, segmento, cidade, problema,
 * data (primeiro contato) e proxima_acao_data (próximo follow-up). Nome = título; observação = descrição.
 */

export const CRM_FIELD = { firstContact: 'data', followUp: 'proxima_acao_data', company: 'empresa', segment: 'segmento', city: 'cidade', status: 'status' } as const

export interface CrmFilters {
  /** Etapas (listas do Kanban). */
  listIds: ID[]
  /** Status do lead (campo). */
  status: string
  segment: string
  city: string
  from: string
  to: string
  followUp: '' | 'overdue' | 'today' | 'week' | 'none'
}

export const EMPTY_CRM_FILTERS: CrmFilters = { listIds: [], status: '', segment: '', city: '', from: '', to: '', followUp: '' }

export const crmFilterCount = (f: CrmFilters) => f.listIds.length + (f.status ? 1 : 0) + (f.segment ? 1 : 0) + (f.city ? 1 : 0) + (f.from || f.to ? 1 : 0) + (f.followUp ? 1 : 0)

export function matchesCrm(card: BoardCard, f: CrmFilters, today = todayISO()): boolean {
  if (f.listIds.length && !f.listIds.includes(card.listId)) return false
  if (f.status && (card.fields[CRM_FIELD.status] ?? '') !== f.status) return false
  if (f.segment && normalize(card.fields[CRM_FIELD.segment] ?? '') !== normalize(f.segment)) return false
  if (f.city && normalize(card.fields[CRM_FIELD.city] ?? '') !== normalize(f.city)) return false
  const first = card.fields[CRM_FIELD.firstContact] ?? ''
  if (f.from && (!first || first < f.from)) return false
  if (f.to && (!first || first > f.to)) return false
  const fu = card.fields[CRM_FIELD.followUp] ?? ''
  if (f.followUp === 'none' && fu) return false
  if (f.followUp === 'overdue' && !(fu && fu < today)) return false
  if (f.followUp === 'today' && fu !== today) return false
  if (f.followUp === 'week' && !(fu && fu >= today && fu <= addDays(today, 7))) return false
  return true
}

/** Valores distintos de um campo (para os filtros de Segmento/Cidade), em ordem alfabética. */
export function distinctValues(cards: BoardCard[], key: string): string[] {
  const seen = new Map<string, string>()
  for (const c of cards) {
    const v = c.fields[key]?.trim()
    if (v && !seen.has(normalize(v))) seen.set(normalize(v), v)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

/** 'stage' = etapa (ordem das listas); 'status' = status do lead. */
export type CrmSortKey = 'firstContact' | 'company' | 'name' | 'segment' | 'stage' | 'status' | 'followUp'
export interface CrmSort {
  key: CrmSortKey
  dir: 'asc' | 'desc'
}

/** Ordena as linhas. Vazios sempre vão para o fim, nos dois sentidos. */
export function sortCrm(cards: BoardCard[], lists: BoardList[], sort: CrmSort): BoardCard[] {
  const listPos = new Map(lists.map((l) => [l.id, l.position]))
  const value = (c: BoardCard): string | number => {
    switch (sort.key) {
      case 'firstContact':
        return c.fields[CRM_FIELD.firstContact] ?? ''
      case 'followUp':
        return c.fields[CRM_FIELD.followUp] ?? ''
      case 'company':
        return normalize(c.fields[CRM_FIELD.company] ?? '')
      case 'segment':
        return normalize(c.fields[CRM_FIELD.segment] ?? '')
      case 'name':
        return normalize(c.title)
      case 'stage':
        return listPos.get(c.listId) ?? 0
      case 'status':
        return c.fields[CRM_FIELD.status] ?? ''
    }
  }
  const dir = sort.dir === 'asc' ? 1 : -1
  return [...cards].sort((a, b) => {
    const va = value(a)
    const vb = value(b)
    if (va === '' && vb !== '') return 1
    if (vb === '' && va !== '') return -1
    if (va < vb) return -dir
    if (va > vb) return dir
    return b.createdAt.localeCompare(a.createdAt)
  })
}
