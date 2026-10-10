import { DEFAULT_USER_NAME } from '@/config/app'
import { toAppError } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import type {
  AICascadePrefs,
  AIUsageLog,
  AIModel,
  AIProviderPreference,
  ActivityLog,
  AppNotification,
  Automation,
  AutomationRun,
  KnowledgeItem,
  CalendarEvent,
  Client,
  Content,
  Contract,
  CreateInput,
  FileItem,
  ID,
  Project,
  Settings,
  Task,
  ThemePreference,
  Transaction,
  UpdateInput,
} from '@/types'
import type { Json } from '@/types/database'
import { createSupabaseRepository, fromRow, type Repository } from './createSupabaseRepository'

export type { Repository } from './createSupabaseRepository'

export const projectRepository = createSupabaseRepository<Project>({ table: 'projects' })
export const taskRepository = createSupabaseRepository<Task>({ table: 'tasks' })
export const transactionRepository = createSupabaseRepository<Transaction>({
  table: 'transactions',
  order: { column: 'date', ascending: false },
})

// ---------- V2 ----------

/** Postgres devolve `time` como 'HH:MM:SS'; o app usa 'HH:MM'. */
const hhmm = (t: unknown) => (typeof t === 'string' ? t.slice(0, 5) : null)

export const eventRepository = createSupabaseRepository<CalendarEvent>({
  table: 'events',
  order: { column: 'date', ascending: true },
  map: (row) => {
    const e = fromRow<CalendarEvent>(row)
    return { ...e, startTime: hhmm(row.start_time), endTime: hhmm(row.end_time) }
  },
})
export const contractRepository = createSupabaseRepository<Contract>({ table: 'contracts' })
export const fileRepository = createSupabaseRepository<FileItem>({ table: 'files', order: { column: 'created_at', ascending: false } })
export const contentRepository = createSupabaseRepository<Content>({ table: 'contents' })

// ---------- V3 ----------

export const knowledgeRepository = createSupabaseRepository<KnowledgeItem>({ table: 'knowledge_items', order: { column: 'updated_at', ascending: false } })
export const automationRepository = createSupabaseRepository<Automation>({ table: 'automations' })

/** Histórico: somente leitura/inserção (o banco registra a maior parte sozinho, via gatilhos). */
export const activityRepository = {
  async list(filter: { projectId?: ID; clientId?: ID; limit?: number } = {}): Promise<ActivityLog[]> {
    let q = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(filter.limit ?? 50)
    if (filter.projectId) q = q.eq('project_id', filter.projectId)
    if (filter.clientId) q = q.eq('client_id', filter.clientId)
    const { data, error } = await q
    if (error) throw toAppError(error)
    return (data ?? []).map((r) => fromRow<ActivityLog>(r))
  },
  async add(entry: { type: string; entity: string; entityId?: ID | null; description: string; projectId?: ID | null; clientId?: ID | null }) {
    const { error } = await supabase.from('activity_logs').insert({
      type: entry.type,
      entity: entry.entity,
      entity_id: entry.entityId ?? null,
      description: entry.description.slice(0, 300),
      project_id: entry.projectId ?? null,
      client_id: entry.clientId ?? null,
    })
    if (error) throw toAppError(error)
  },
  async removeDemo() {
    const { error } = await supabase.from('activity_logs').delete().eq('is_demo', true)
    if (error) throw toAppError(error)
  },
}

export const automationRunRepository = {
  /**
   * "Reivindica" a execução de uma regra para uma entidade. Retorna false se já foi executada
   * (restrição única no banco) — garante que a mesma ação nunca roda duas vezes, mesmo com várias abas.
   */
  async claim(automationId: ID, entityKey: string): Promise<boolean> {
    const { error } = await supabase.from('automation_runs').insert({ automation_id: automationId, entity_key: entityKey })
    if (!error) return true
    if (error.code === '23505') return false
    throw toAppError(error)
  },
  async list(limit = 30): Promise<AutomationRun[]> {
    const { data, error } = await supabase.from('automation_runs').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) throw toAppError(error)
    return (data ?? []).map((r) => fromRow<AutomationRun>(r))
  },
}

export const notificationRepository = {
  async list(limit = 60): Promise<AppNotification[]> {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) throw toAppError(error)
    return (data ?? []).map((r) => fromRow<AppNotification>(r))
  },
  /** Cria a notificação; se já existir uma com a mesma chave, não duplica. */
  async create(n: Omit<AppNotification, 'id' | 'readAt' | 'createdAt'>) {
    const { error } = await supabase.from('notifications').insert({
      severity: n.severity,
      title: n.title.slice(0, 200),
      body: n.body.slice(0, 1000),
      link: n.link,
      entity: n.entity,
      entity_id: n.entityId,
      automation_id: n.automationId,
      dedupe_key: n.dedupeKey,
    })
    if (error && error.code !== '23505') throw toAppError(error)
  },
  async markRead(ids: ID[]) {
    if (!ids.length) return
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).in('id', ids)
    if (error) throw toAppError(error)
  },
  async remove(id: ID) {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) throw toAppError(error)
  },
  async removeRead() {
    const { error } = await supabase.from('notifications').delete().not('read_at', 'is', null)
    if (error) throw toAppError(error)
  },
}

/** Registro de uso/custo da IA (escrito pelo servidor; aqui só leitura). Sem conteúdo de prompts. */
export const aiUsageRepository = {
  async listSince(sinceIso: string, limit = 1000): Promise<AIUsageLog[]> {
    const { data, error } = await supabase.from('ai_usage_logs').select('*').gte('created_at', sinceIso).order('created_at', { ascending: false }).limit(limit)
    if (error) throw toAppError(error)
    return (data ?? []).map((r) => fromRow<AIUsageLog>(r))
  },
}

// ---------- Clientes (com relação N:N para projetos) ----------

const baseClients = createSupabaseRepository<Client>({
  table: 'clients',
  select: '*, client_projects(project_id)',
  virtualFields: ['projectIds'],
  map: (row) => {
    const { client_projects, ...rest } = row as { client_projects?: Array<{ project_id: string }> }
    return { ...fromRow<Client>(rest), projectIds: (client_projects ?? []).map((cp) => cp.project_id) }
  },
})

/** Grava os vínculos cliente↔projeto numa única transação (função SQL). */
async function setClientProjects(clientId: ID, projectIds: ID[]) {
  const { error } = await supabase.rpc('set_client_projects', { p_client_id: clientId, p_project_ids: projectIds })
  if (error) throw toAppError(error)
}

export const clientRepository: Repository<Client> & { setProjects: typeof setClientProjects } = {
  ...baseClients,
  setProjects: setClientProjects,
  async create(input: CreateInput<Client>) {
    const created = await baseClients.create(input)
    if (input.projectIds.length) await setClientProjects(created.id, input.projectIds)
    return { ...created, projectIds: input.projectIds }
  },
  async update(id: ID, patch: UpdateInput<Client>) {
    const updated = await baseClients.update(id, patch)
    if (patch.projectIds) {
      await setClientProjects(id, patch.projectIds)
      return { ...updated, projectIds: patch.projectIds }
    }
    return updated
  },
}

// ---------- Preferências ----------

export const DEFAULT_CASCADE: AICascadePrefs = { strategy: 'auto', privacy: 'allow_free', layers: [] }

function parseCascade(raw: unknown): AICascadePrefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<AICascadePrefs>
  return {
    strategy: r.strategy === 'free_only' || r.strategy === 'paid_only' ? r.strategy : 'auto',
    privacy: r.privacy === 'paid_for_sensitive' ? 'paid_for_sensitive' : 'allow_free',
    layers: Array.isArray(r.layers) ? r.layers.filter((l) => l && typeof l.id === 'string') : [],
  }
}

const DEFAULT_SETTINGS: Settings = {
  userName: DEFAULT_USER_NAME,
  theme: 'system',
  seeded: false,
  seedVersion: 0,
  aiProvider: 'auto',
  aiModel: 'gemini-flash-latest',
  aiInstructions: '',
  aiCascade: DEFAULT_CASCADE,
}

export const settingsRepository = {
  async get(): Promise<Settings> {
    const { data: row, error } = await supabase.from('user_settings').select('user_name, theme, seeded, seed_version, ai_provider, ai_model, ai_instructions, ai_cascade').maybeSingle()
    if (error) throw toAppError(error)
    if (!row) return DEFAULT_SETTINGS
    return {
      userName: row.user_name || DEFAULT_USER_NAME,
      theme: row.theme as ThemePreference,
      seeded: row.seeded,
      seedVersion: row.seed_version,
      aiProvider: row.ai_provider as AIProviderPreference,
      aiModel: row.ai_model as AIModel,
      aiInstructions: row.ai_instructions,
      aiCascade: parseCascade(row.ai_cascade),
    }
  },
  async save(patch: Partial<Settings>): Promise<Settings> {
    const next = { ...(await this.get()), ...patch }
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_name: next.userName,
          theme: next.theme,
          seeded: next.seeded,
          seed_version: next.seedVersion,
          ai_provider: next.aiProvider,
          ai_model: next.aiModel,
          ai_instructions: next.aiInstructions,
          ai_cascade: next.aiCascade as unknown as Json,
        },
        { onConflict: 'user_id' },
      )
    if (error) throw toAppError(error)
    return next
  },
}

export { prospectRepository } from './prospects'
export { radarRepository } from './radar'
