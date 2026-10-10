import { createContext } from 'react'
import type {
  ActivityLog,
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
  Settings,
  Task,
  TaskStatus,
  Transaction,
  UpdateInput,
} from '@/types'
import type { RadarOpportunity } from '@/types/radar'

export interface DataContextValue {
  ready: boolean
  loadError: string | null
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
  settings: Settings
  hasDemoData: boolean

  // Lookups rápidos para relacionamentos
  projectById: Map<ID, Project>
  clientById: Map<ID, Client>

  // Ações — resolvem com o registro (ou true) em sucesso, null/false em falha (erro já notificado).
  createProject(input: CreateInput<Project>): Promise<Project | null>
  updateProject(id: ID, patch: UpdateInput<Project>): Promise<Project | null>
  deleteProject(id: ID): Promise<boolean>

  createTask(input: CreateInput<Task>): Promise<Task | null>
  updateTask(id: ID, patch: UpdateInput<Task>): Promise<Task | null>
  setTaskStatus(id: ID, status: TaskStatus): Promise<Task | null>
  deleteTask(id: ID): Promise<boolean>

  createClient(input: CreateInput<Client>): Promise<Client | null>
  updateClient(id: ID, patch: UpdateInput<Client>): Promise<Client | null>
  deleteClient(id: ID): Promise<boolean>

  createTransaction(input: CreateInput<Transaction>): Promise<Transaction | null>
  updateTransaction(id: ID, patch: UpdateInput<Transaction>): Promise<Transaction | null>
  deleteTransaction(id: ID): Promise<boolean>

  // V2
  createEvent(input: CreateInput<CalendarEvent>): Promise<CalendarEvent | null>
  updateEvent(id: ID, patch: UpdateInput<CalendarEvent>): Promise<CalendarEvent | null>
  deleteEvent(id: ID): Promise<boolean>

  createContract(input: CreateInput<Contract>): Promise<Contract | null>
  updateContract(id: ID, patch: UpdateInput<Contract>): Promise<Contract | null>
  deleteContract(id: ID): Promise<boolean>

  createContent(input: CreateInput<Content>): Promise<Content | null>
  updateContent(id: ID, patch: UpdateInput<Content>): Promise<Content | null>
  setContentStatus(id: ID, status: ContentStatus): Promise<Content | null>
  deleteContent(id: ID): Promise<boolean>

  /** Cria o registro do arquivo e, se `file` for enviado, faz o upload. */
  createFile(input: CreateInput<FileItem>, file?: File | null): Promise<FileItem | null>
  updateFile(id: ID, patch: UpdateInput<FileItem>, file?: File | null): Promise<FileItem | null>
  deleteFile(id: ID): Promise<boolean>

  // V3
  createKnowledge(input: CreateInput<KnowledgeItem>): Promise<KnowledgeItem | null>
  updateKnowledge(id: ID, patch: UpdateInput<KnowledgeItem>): Promise<KnowledgeItem | null>
  deleteKnowledge(id: ID): Promise<boolean>

  createAutomation(input: CreateInput<Automation>): Promise<Automation | null>
  updateAutomation(id: ID, patch: UpdateInput<Automation>): Promise<Automation | null>
  deleteAutomation(id: ID): Promise<boolean>
  /** Roda a varredura de automações agora. Retorna quantas ações foram executadas. */
  runAutomations(): Promise<number | null>

  // Radar de Mercado & Prospecção
  createProspect(input: CreateInput<ProspectCompany>): Promise<ProspectCompany | null>
  updateProspect(id: ID, patch: UpdateInput<ProspectCompany>): Promise<ProspectCompany | null>
  deleteProspect(id: ID): Promise<boolean>
  convertProspectToClient(prospect: ProspectCompany): Promise<Client | null>
  convertProspectToCrmLead(prospect: ProspectCompany, projectId?: ID | null): Promise<boolean>

  // Radar Luaria.IA (Módulo K)
  createRadarOpportunity(input: CreateInput<RadarOpportunity>): Promise<RadarOpportunity | null>
  updateRadarOpportunity(id: ID, patch: UpdateInput<RadarOpportunity>): Promise<RadarOpportunity | null>
  deleteRadarOpportunity(id: ID): Promise<boolean>
  sendRadarOpportunityToCrm(opportunity: RadarOpportunity, projectId?: ID | null): Promise<boolean>
  importRadarOpportunities(items: CreateInput<RadarOpportunity>[]): Promise<number>

  markNotificationsRead(ids: ID[]): Promise<boolean>
  clearReadNotifications(): Promise<boolean>

  /** Histórico (carregado sob demanda). */
  listActivity(filter?: { projectId?: ID; clientId?: ID; limit?: number }): Promise<ActivityLog[]>

  updateSettings(patch: Partial<Settings>): Promise<Settings | null>
  loadDemoData(): Promise<boolean>
  clearDemoData(): Promise<number | null>
  resetToSeed(): Promise<boolean>
  exportAll(): Promise<string | null>
}

export const DataContext = createContext<DataContextValue | null>(null)
