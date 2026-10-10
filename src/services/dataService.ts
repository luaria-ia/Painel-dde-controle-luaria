import { buildSeed } from '@/data/seed'
import { projectType } from '@/data/boards/projectTypes'
import { toAppError, unwrap } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { boardRepository, exportBoards, templatePayload } from '@/repositories/boards'
import { fromRow, toRow } from '@/repositories/createSupabaseRepository'
import type { Json } from '@/types/database'
import { libraryRepository, studyHoursRepository, studyProgressRepository } from '@/repositories/studies'
import { DEFAULT_AUTOMATIONS } from '@/services/automations/defaults'
import {
  activityRepository,
  automationRepository,
  clientRepository,
  knowledgeRepository,
  notificationRepository,
  contentRepository,
  contractRepository,
  eventRepository,
  fileRepository,
  projectRepository,
  prospectRepository,
  radarRepository,
  settingsRepository,
  taskRepository,
  transactionRepository,
} from '@/repositories'
import type { RadarOpportunity } from '@/types/radar'
import type {
  AppNotification,
  Automation,
  KnowledgeItem,
  CalendarEvent,
  Client,
  Content,
  ContentStatus,
  Contract,
  CreateInput,
  FileItem,
  ID,
  Project,
  ProspectCompany,
  Task,
  TaskStatus,
  Transaction,
  UpdateInput,
} from '@/types'
import { removeStoredFile, uploadFile } from './fileStorage'

/** Versão atual dos dados iniciais. */
const SEED_VERSION = 3

/**
 * Regras de negócio que envolvem mais de uma entidade.
 * As cascatas (excluir projeto/cliente desvincula tarefas e lançamentos) são feitas
 * pelo próprio banco via FKs `ON DELETE SET NULL`, garantindo consistência.
 */

export interface Snapshot {
  projects: Project[]
  tasks: Task[]
  clients: Client[]
  transactions: Transaction[]
  events: CalendarEvent[]
  contracts: Contract[]
  contents: Content[]
  files: FileItem[]
  knowledge: KnowledgeItem[]
  automations: Automation[]
  notifications: AppNotification[]
  prospects: ProspectCompany[]
  radarOpportunities: RadarOpportunity[]
}

export const EMPTY_SNAPSHOT: Snapshot = {
  projects: [],
  tasks: [],
  clients: [],
  transactions: [],
  events: [],
  contracts: [],
  contents: [],
  files: [],
  knowledge: [],
  automations: [],
  notifications: [],
  prospects: [],
  radarOpportunities: [],
}

export async function loadAll(): Promise<Snapshot> {
  const [projects, tasks, clients, transactions, events, contracts, contents, files, knowledge, automations, notifications, prospects, radarOpportunities] = await Promise.all([
    projectRepository.list(),
    taskRepository.list(),
    clientRepository.list(),
    transactionRepository.list(),
    eventRepository.list(),
    contractRepository.list(),
    contentRepository.list(),
    fileRepository.list(),
    knowledgeRepository.list(),
    automationRepository.list(),
    notificationRepository.list(),
    prospectRepository.list(),
    radarRepository.list(),
  ])
  // Projetos do cliente = projetos com client_id (+ vínculos antigos de client_projects).
  const withProjects = clients.map((c) => ({ ...c, projectIds: [...new Set([...projects.filter((p) => p.clientId === c.id).map((p) => p.id), ...c.projectIds])] }))
  return { projects, tasks, clients: withProjects, transactions, events, contracts, contents, files, knowledge, automations, notifications, prospects, radarOpportunities }
}

async function insertSeed(existingProjects: Project[] = []) {
  const seed = buildSeed(existingProjects)
  await projectRepository.insertMany(seed.projects)
  await clientRepository.insertMany(seed.clients)
  const links = seed.clients.flatMap((c) => c.projectIds.map((projectId) => ({ client_id: c.id, project_id: projectId })))
  if (links.length) {
    const { error } = await supabase.from('client_projects').insert(links)
    if (error) throw toAppError(error)
  }
  await Promise.all([
    taskRepository.insertMany(seed.tasks),
    transactionRepository.insertMany(seed.transactions),
    eventRepository.insertMany(seed.events),
    contractRepository.insertMany(seed.contracts),
    contentRepository.insertMany(seed.contents),
    fileRepository.insertMany(seed.files),
    knowledgeRepository.insertMany(seed.knowledge),
  ])
}

/** Cria as regras padrão de automação se a conta ainda não tiver nenhuma. */
async function ensureDefaultAutomations() {
  if ((await automationRepository.list()).length === 0) await automationRepository.insertMany(DEFAULT_AUTOMATIONS)
}

let seeding: Promise<void> | null = null

/**
 * Aplica os dados iniciais no primeiro acesso da conta. Não recria dados apagados.
 * Protegido contra execução dupla (StrictMode / abas) por promessa em andamento
 * e pelo índice único de nome de projeto no banco.
 */
export function ensureSeeded(): Promise<void> {
  seeding ??= (async () => {
    const settings = await settingsRepository.get()
    if (settings.seeded) {
      // Conta existente: não injeta exemplos novos (o usuário pode carregá-los em Configurações).
      if (settings.seedVersion < SEED_VERSION) {
        if (settings.seedVersion < 3) await ensureDefaultAutomations()
        await settingsRepository.save({ seedVersion: SEED_VERSION })
      }
      return
    }
    const existing = await projectRepository.list()
    if (existing.length === 0) await insertSeed()
    await ensureDefaultAutomations()
    await settingsRepository.save({ seeded: true, seedVersion: SEED_VERSION })
  })().finally(() => {
    seeding = null
  })
  return seeding
}

// ---------- Projetos / clientes ----------

export const deleteProject = (id: ID) => projectRepository.remove(id)

/**
 * Cria o projeto JÁ com os quadros do tipo dele, numa única transação no banco (create_project):
 * CLIENTE → PROJETO → TIPO → TEMPLATES → QUADROS → LISTAS → CARTÕES.
 */
export async function createProject(input: CreateInput<Project>): Promise<Project> {
  const templates = projectType(input.type).boards
  const args = { p_project: toRow(input, ['boardsProvisionedAt']), p_boards: templates.map((t, i) => templatePayload(t, i)) } as unknown as { p_project: Json; p_boards: Json }
  const id = unwrap(await supabase.rpc('create_project', args)) as ID
  return fromRow<Project>(unwrap(await supabase.from('projects').select('*').eq('id', id).single()) as Record<string, unknown>)
}

/** Atualiza o projeto; se o tipo mudou, cria os quadros do novo tipo que ainda faltam. */
export async function updateProject(id: ID, patch: UpdateInput<Project>, previousType?: string): Promise<Project> {
  const updated = await projectRepository.update(id, patch)
  if (patch.type && patch.type !== previousType) {
    const templates = projectType(patch.type).boards
    if (templates.length) await boardRepository.provision(id, templates)
  }
  return updated
}

export const deleteClient = (id: ID) => clientRepository.remove(id)

// ---------- Tarefas ----------

function withCompletion<T extends Partial<Task>>(patch: T, previous?: Task): T {
  if (!patch.status || patch.status === previous?.status) return patch
  return { ...patch, completedAt: patch.status === 'concluido' ? new Date().toISOString() : null }
}

export async function createTask(input: CreateInput<Task>): Promise<Task> {
  return taskRepository.create(withCompletion(input))
}

export async function updateTask(id: ID, patch: UpdateInput<Task>, previous?: Task): Promise<Task> {
  return taskRepository.update(id, withCompletion(patch, previous))
}

export async function setTaskStatus(task: Task, status: TaskStatus): Promise<Task> {
  return updateTask(task.id, { status }, task)
}

// ---------- Dados de exemplo ----------

/** Acrescenta os dados de exemplo (reaproveita Luaria/Med Resumos/Social Media se já existirem). */
export async function loadDemoData(): Promise<void> {
  await insertSeed(await projectRepository.list())
}

export async function clearDemoData(): Promise<number> {
  // Ordem: filhos primeiro; FKs desvinculam o que for real.
  await activityRepository.removeDemo()
  const counts = [
    await knowledgeRepository.removeDemo(),
    await eventRepository.removeDemo(),
    await contractRepository.removeDemo(),
    await contentRepository.removeDemo(),
    await fileRepository.removeDemo(),
    await transactionRepository.removeDemo(),
    await taskRepository.removeDemo(),
    await clientRepository.removeDemo(),
    await projectRepository.removeDemo(),
    await prospectRepository.removeDemo(),
  ]
  return counts.reduce((a, b) => a + b, 0)
}

/** Apaga TODOS os dados do usuário e reaplica o seed (útil para testes). */
export async function resetToSeed(): Promise<void> {
  await removeAllStoredFiles()
  for (const repo of [knowledgeRepository, eventRepository, contractRepository, contentRepository, fileRepository, transactionRepository, taskRepository, automationRepository, prospectRepository]) {
    await repo.removeAll()
  }
  await clientRepository.removeAll() // client_projects sai em cascata
  await projectRepository.removeAll()
  await notificationRepository.removeRead()
  await insertSeed()
  await ensureDefaultAutomations()
  await settingsRepository.save({ seeded: true, seedVersion: SEED_VERSION })
}

/** Exporta todos os dados em JSON (backup manual). */
export async function exportAll(): Promise<string> {
  const [snapshot, settings, studyProgress, studyHours, studyLibrary, boards] = await Promise.all([
    loadAll(),
    settingsRepository.get(),
    studyProgressRepository.list(),
    studyHoursRepository.list(),
    libraryRepository.list(),
    exportBoards(),
  ])
  const studies = { progress: studyProgress, hours: studyHours, library: studyLibrary }
  return JSON.stringify({ exportedAt: new Date().toISOString(), settings, ...snapshot, studies, boards }, null, 2)
}

// ---------- Conteúdo ----------

export const setContentStatus = (id: ID, status: ContentStatus) => contentRepository.update(id, { status })

// ---------- Arquivos ----------

/** Cria o registro; se houver arquivo, envia ao Storage primeiro (e desfaz o upload se o registro falhar). */
export async function createFile(input: CreateInput<FileItem>, file?: File | null): Promise<FileItem> {
  if (!file) return fileRepository.create(input)
  const storagePath = await uploadFile(file)
  try {
    return await fileRepository.create({
      ...input,
      storagePath,
      url: null,
      mimeType: file.type || input.mimeType,
      sizeBytes: file.size,
    })
  } catch (err) {
    await removeStoredFile(storagePath).catch(() => undefined)
    throw err
  }
}

/** Substitui o arquivo anexado (opcional) e atualiza os metadados. */
export async function updateFile(previous: FileItem, patch: UpdateInput<FileItem>, file?: File | null): Promise<FileItem> {
  if (!file) return fileRepository.update(previous.id, patch)
  const storagePath = await uploadFile(file)
  const updated = await fileRepository.update(previous.id, { ...patch, storagePath, url: null, mimeType: file.type, sizeBytes: file.size })
  if (previous.storagePath) await removeStoredFile(previous.storagePath).catch(() => undefined)
  return updated
}

export async function deleteFile(item: FileItem): Promise<void> {
  await fileRepository.remove(item.id)
  if (item.storagePath) await removeStoredFile(item.storagePath).catch(() => undefined)
}

async function removeAllStoredFiles() {
  const paths = (await fileRepository.list()).map((f) => f.storagePath).filter((p): p is string => !!p)
  await Promise.all(paths.map((p) => removeStoredFile(p).catch(() => undefined)))
}
