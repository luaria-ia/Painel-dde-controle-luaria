import { toAppError, unwrap } from '@/lib/errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { BaseEntity, CreateInput, ID, UpdateInput } from '@/types'
import type { TableName } from '@/types/database'

// O repositório genérico trabalha com nomes de tabela dinâmicos; a validação de tipos
// fica nos tipos de domínio (src/types) e nas constraints do banco.
const db = supabase as unknown as SupabaseClient

/**
 * Contrato de um repositório. As páginas só conhecem esta interface —
 * trocar o banco significa reimplementar este arquivo, não a interface.
 */
export interface Repository<T extends BaseEntity> {
  list(): Promise<T[]>
  create(input: CreateInput<T>): Promise<T>
  update(id: ID, patch: UpdateInput<T>): Promise<T>
  remove(id: ID): Promise<void>
  /** Inserção em lote (seed). Aceita id/createdAt pré-definidos. */
  insertMany(items: Array<CreateInput<T> & Partial<Pick<T, 'id' | 'createdAt'>>>): Promise<void>
  /** Remove registros marcados como exemplo. Retorna quantos foram removidos. */
  removeDemo(): Promise<number>
  /** Remove todos os registros do usuário logado (o RLS garante o escopo). */
  removeAll(): Promise<void>
}

type Row = Record<string, unknown>

const toSnake = (k: string) => k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
const toCamel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

/** Campos que o cliente nunca envia: o banco controla. */
const SERVER_FIELDS = new Set(['userId', 'updatedAt'])

export function toRow(obj: object, omit: string[] = []): Row {
  const row: Row = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || SERVER_FIELDS.has(k) || omit.includes(k)) continue
    row[toSnake(k)] = v
  }
  return row
}

export function fromRow<T>(row: Row): T {
  const obj: Row = {}
  for (const [k, v] of Object.entries(row)) {
    if (k === 'user_id') continue
    obj[toCamel(k)] = v
  }
  return obj as T
}

interface Options<T> {
  table: TableName
  select?: string
  /** Campos do tipo que não são colunas da tabela (ex.: relações). */
  virtualFields?: string[]
  map?: (row: Row) => T
  order?: { column: string; ascending: boolean }
}

export function createSupabaseRepository<T extends BaseEntity>({
  table,
  select = '*',
  virtualFields = [],
  map = (r) => fromRow<T>(r),
  order = { column: 'created_at', ascending: true },
}: Options<T>): Repository<T> {
  return {
    async list() {
      const rows = unwrap(await db.from(table).select(select).order(order.column, { ascending: order.ascending }))
      return (rows as unknown as Row[]).map(map)
    },

    async create(input) {
      const row = unwrap(await db.from(table).insert(toRow(input, [...virtualFields, 'id', 'createdAt'])).select(select).single())
      return map(row as unknown as Row)
    },

    async update(id, patch) {
      const row = unwrap(
        await db.from(table).update(toRow(patch, [...virtualFields, 'id', 'createdAt'])).eq('id', id).select(select).single(),
      )
      return map(row as unknown as Row)
    },

    async remove(id) {
      const { error } = await db.from(table).delete().eq('id', id)
      if (error) throw toAppError(error)
    },

    async insertMany(items) {
      if (!items.length) return
      const { error } = await db.from(table).insert(items.map((i) => toRow(i, virtualFields)))
      if (error) throw toAppError(error)
    },

    async removeDemo() {
      const { error, count } = await db.from(table).delete({ count: 'exact' }).eq('is_demo', true)
      if (error) throw toAppError(error)
      return count ?? 0
    },

    async removeAll() {
      const { error } = await db.from(table).delete().not('id', 'is', null)
      if (error) throw toAppError(error)
    },
  }
}
