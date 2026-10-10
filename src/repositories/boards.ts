import type { SupabaseClient } from '@supabase/supabase-js'
import { toAppError, unwrap } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import type { ID } from '@/types'
import type { Board, BoardCard, BoardLabel, BoardList, BoardTemplate, CardComment, CardEvent } from '@/types/boards'
import { fromRow, toRow } from './createSupabaseRepository'

const db = supabase as unknown as SupabaseClient
type Row = Record<string, unknown>
const OMIT = ['id', 'createdAt', 'updatedAt']

/** CRUD de uma tabela de quadros, sempre filtrado por um pai (projeto, quadro ou cartão). */
function table<T>(name: string, parentColumn: string, order: { column: string; ascending: boolean }) {
  return {
    async listBy(parentIds: ID[]): Promise<T[]> {
      if (!parentIds.length) return []
      const rows = unwrap(await db.from(name).select('*').in(parentColumn, parentIds).order(order.column, { ascending: order.ascending }))
      return (rows as Row[]).map((r) => fromRow<T>(r))
    },
    async create(input: Partial<T>): Promise<T> {
      return fromRow<T>(
        unwrap(
          await db
            .from(name)
            .insert(toRow(input as object, OMIT))
            .select('*')
            .single(),
        ) as Row,
      )
    },
    async update(id: ID, patch: Partial<T>): Promise<T> {
      return fromRow<T>(
        unwrap(
          await db
            .from(name)
            .update(toRow(patch as object, OMIT))
            .eq('id', id)
            .select('*')
            .single(),
        ) as Row,
      )
    },
    async remove(id: ID): Promise<void> {
      const { error } = await db.from(name).delete().eq('id', id)
      if (error) throw toAppError(error)
    },
  }
}

export const boardRepository = {
  ...table<Board>('boards', 'project_id', { column: 'position', ascending: true }),
  async get(id: ID): Promise<Board | null> {
    const row = unwrap(await db.from('boards').select('*').eq('id', id).maybeSingle())
    return row ? fromRow<Board>(row as Row) : null
  },
  /** Cria o quadro inteiro (listas, etiquetas e cartões do template) numa transação no banco. */
  async instantiate(projectId: ID, template: BoardTemplate, position: number): Promise<ID> {
    return unwrap(await db.rpc('instantiate_board', { p_project_id: projectId, p_board: templatePayload(template, position) })) as ID
  },
  /** Quadro de uma área de CLIENTE dentro do projeto (cria uma vez por projeto+cliente+template). */
  async provisionForClient(projectId: ID, clientId: ID, template: BoardTemplate): Promise<ID> {
    return unwrap(await db.rpc('provision_client_board', { p_project_id: projectId, p_client_id: clientId, p_board: templatePayload(template, 0) })) as ID
  },
  /** Cria os quadros do tipo que ainda faltam (por template) e marca o projeto como provisionado. */
  async provision(projectId: ID, templates: BoardTemplate[]): Promise<number> {
    return unwrap(await db.rpc('provision_project_boards', { p_project_id: projectId, p_boards: templates.map((t, i) => templatePayload(t, i)) })) as number
  },
}

/** Template → JSON aceito pelas funções do banco (instantiate_board / create_project). */
export function templatePayload(template: BoardTemplate, position: number) {
  return {
    key: template.key,
    name: template.name,
    icon: template.icon,
    position,
    fields: template.fields,
    automations: template.automations,
    labels: template.labels,
    lists: template.lists.map((l) => ({
      key: l.key,
      name: l.name,
      icon: l.icon,
      kind: l.kind ?? 'flow',
      cards: (l.cards ?? []).map((c) => ({
        title: c.title,
        description: c.description ?? '',
        labels: c.labels ?? [],
        checklist: (c.checklist ?? []).map((text, i) => ({ id: `t${i}`, text, done: false })),
      })),
    })),
  }
}

export const boardListRepository = table<BoardList>('board_lists', 'board_id', { column: 'position', ascending: true })
export const boardLabelRepository = table<BoardLabel>('board_labels', 'board_id', { column: 'position', ascending: true })
export const boardCardRepository = table<BoardCard>('board_cards', 'board_id', { column: 'position', ascending: true })
export const cardCommentRepository = table<CardComment>('board_card_comments', 'card_id', { column: 'created_at', ascending: false })
export const cardEventRepository = table<CardEvent>('board_card_events', 'card_id', { column: 'created_at', ascending: false })

/** Resumo leve dos cartões de vários quadros (para os cards de quadro do projeto). */
export async function boardCardSummaries(boardIds: ID[]): Promise<Array<Pick<BoardCard, 'boardId' | 'dueDate' | 'completedAt'>>> {
  if (!boardIds.length) return []
  const rows = unwrap(await db.from('board_cards').select('board_id, due_date, completed_at').in('board_id', boardIds))
  return (rows as Row[]).map((r) => fromRow(r))
}

/** Quantidade de comentários por cartão de um quadro. */
export async function commentCounts(cardIds: ID[]): Promise<Map<ID, number>> {
  const counts = new Map<ID, number>()
  if (!cardIds.length) return counts
  const rows = unwrap(await db.from('board_card_comments').select('card_id').in('card_id', cardIds)) as Array<{ card_id: ID }>
  for (const r of rows) counts.set(r.card_id, (counts.get(r.card_id) ?? 0) + 1)
  return counts
}

/** Todos os dados de quadros do usuário (backup). O RLS limita ao dono. */
export async function exportBoards() {
  const tables = ['boards', 'board_lists', 'board_labels', 'board_cards', 'board_card_comments'] as const
  const results = await Promise.all(tables.map((t) => db.from(t).select('*')))
  return Object.fromEntries(tables.map((t, i) => [t, ((unwrap(results[i]) as Row[]) ?? []).map((r) => fromRow(r))]))
}

/** Oportunidades/cartões vinculados a um cliente (histórico comercial), com etapa e projeto. */
export async function cardsByClient(clientId: ID) {
  const cards = (unwrap(await db.from('board_cards').select('*').eq('client_id', clientId).order('created_at', { ascending: false })) as Row[]).map((r) => fromRow<BoardCard>(r))
  if (!cards.length) return []
  const boardIds = [...new Set(cards.map((c) => c.boardId))]
  const [boards, lists, counts] = await Promise.all([
    db.from('boards').select('id, project_id, template_key, name').in('id', boardIds),
    db.from('board_lists').select('id, name, icon').in('board_id', boardIds),
    commentCounts(cards.map((c) => c.id)),
  ])
  const b = (unwrap(boards) as Row[]).map((r) => fromRow<Pick<Board, 'id' | 'projectId' | 'templateKey' | 'name'>>(r))
  const l = (unwrap(lists) as Row[]).map((r) => fromRow<Pick<BoardList, 'id' | 'name' | 'icon'>>(r))
  return cards.map((card) => ({ card, board: b.find((x) => x.id === card.boardId), list: l.find((x) => x.id === card.listId), interactions: counts.get(card.id) ?? 0 }))
}
