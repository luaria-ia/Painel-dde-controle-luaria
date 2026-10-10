import type { BaseEntity, ID, ISODate, ISODateTime, TaskPriority } from './index'

/*
 * Quadros (Kanban) por projeto:  Cliente → Projeto → Quadros → Listas → Cartões.
 * Os templates (src/data/boards) definem quais quadros cada TIPO de projeto recebe.
 */

export type LabelColor = 'sky' | 'violet' | 'emerald' | 'amber' | 'orange' | 'rose' | 'teal' | 'slate'

export type BoardFieldType = 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'url' | 'email' | 'phone'

/** Campo personalizado do quadro (cada cartão guarda o valor em `fields[key]`). */
export interface BoardField {
  key: string
  label: string
  type: BoardFieldType
  options?: string[]
  /** Mostrar o valor na face do cartão. */
  showOnCard?: boolean
}

/** Automação declarativa do quadro. `list`/`label` usam a chave da lista ou o nome da etiqueta. */
export type AutomationTrigger =
  | { type: 'card_entered_list'; list: string }
  | { type: 'label_added'; label: string }
  /** Ainda não executada — reservada para alertas por data (ex.: data de publicação). */
  | { type: 'date_reached'; field: string }

export type AutomationAction =
  | { type: 'add_label'; label: string }
  | { type: 'remove_label'; label: string }
  | { type: 'complete_card' }
  /** Cria uma tarefa no projeto. `{card}` vira o título do cartão. Prazo: campo de data do cartão ou +N dias. */
  | { type: 'create_task'; title: string; dueFromField?: string; dueInDays?: number; priority?: TaskPriority }
  | { type: 'notify'; message: string }

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  when: AutomationTrigger
  then: AutomationAction[]
}

export interface Board extends BaseEntity {
  projectId: ID
  /** Quadro de um cliente dentro de um projeto-operação (null = área do projeto). */
  clientId: ID | null
  templateKey: string | null
  name: string
  icon: string
  position: number
  fields: BoardField[]
  automations: AutomationRule[]
}

export type BoardListKind = 'flow' | 'reference'

export interface BoardList extends BaseEntity {
  boardId: ID
  name: string
  icon: string
  /** 'reference' = dossiê permanente (ex.: Estratégia), não é etapa do fluxo. */
  kind: BoardListKind
  templateKey: string | null
  position: number
}

export interface BoardLabel extends BaseEntity {
  boardId: ID
  name: string
  color: LabelColor
  position: number
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface BoardCard extends BaseEntity {
  boardId: ID
  listId: ID
  title: string
  description: string
  position: number
  priority: TaskPriority | null
  dueDate: ISODate | null
  assignee: string
  labelIds: ID[]
  checklist: ChecklistItem[]
  fields: Record<string, string>
  completedAt: ISODateTime | null
  /** Cliente originado desta oportunidade (CRM → conversão). */
  clientId: ID | null
}

export type CommentKind = 'comentario' | 'ligacao' | 'whatsapp' | 'email' | 'reuniao' | 'outro'

export interface CardComment extends BaseEntity {
  cardId: ID
  kind: CommentKind
  body: string
}

export interface CardEvent extends BaseEntity {
  cardId: ID
  type: string
  description: string
}

// ---------- Templates ----------

export interface CardTemplate {
  title: string
  description?: string
  checklist?: string[]
  labels?: string[]
}

export interface ListTemplate {
  /** Chave estável (usada por automações). */
  key: string
  name: string
  icon: string
  kind?: BoardListKind
  cards?: CardTemplate[]
}

export interface BoardTemplate {
  key: string
  /** 'crm' = oportunidades (lead → cliente); padrão = workflow de produção. */
  role?: 'crm'
  name: string
  icon: string
  description: string
  lists: ListTemplate[]
  labels: Array<{ name: string; color: LabelColor }>
  fields: BoardField[]
  automations: AutomationRule[]
}

/**
 * Área do projeto = uma aba na navegação do projeto, definida pelo TIPO.
 * - kanban:  workflow em colunas (usa um quadro do template `board`).
 * - dossier: informações permanentes, em seções (usa um quadro de uma lista só, como armazenamento).
 * - metrics: painel calculado a partir de outra área (`source`).
 */
export interface ProjectAreaDef {
  /** Id da aba (aparece na URL: ?aba=…). */
  key: string
  label: string
  icon: string
  /**
   * kanban/dossier/metrics usam quadros; contents = Kanban do módulo Conteúdo (tabela contents)
   * filtrado por projeto+cliente; contents-metrics = painel calculado desses conteúdos.
   */
  kind: 'kanban' | 'dossier' | 'metrics' | 'contents' | 'contents-metrics'
  /** Template de quadro que guarda os dados da área (kanban/dossier). */
  board?: string
  /** Área de origem dos dados (metrics). */
  source?: string
  description?: string
}

/** Abas nativas do projeto (módulos já existentes do Business OS). */
export type BuiltinProjectTab = 'ia' | 'tarefas' | 'conteudo' | 'clientes' | 'financeiro' | 'contratos' | 'arquivos' | 'conhecimento' | 'agenda' | 'atividade' | 'configuracoes'

export interface ProjectTypeDef {
  id: string
  label: string
  icon: string
  description: string
  /** Templates dos quadros que armazenam as áreas deste tipo. */
  boards: BoardTemplate[]
  /** Áreas específicas do tipo, na ordem das abas (logo depois de “Visão geral”). */
  areas: ProjectAreaDef[]
  /** Abas nativas mostradas para este tipo (ordem). Ausente = todas (comportamento original). */
  tabs?: BuiltinProjectTab[]
  /**
   * Projeto-OPERAÇÃO com vários clientes (ex.: Social Media): cada cliente tem seu espaço dentro do projeto
   * (Projeto → Clientes → Cliente → Estratégia/Conteúdo/…), com dados isolados por project_id + client_id.
   */
  clientWorkspace?: ClientWorkspaceDef
}

/** Abas fixas do espaço do cliente, além das áreas. */
export type ClientBuiltinTab = 'tarefas' | 'arquivos' | 'atividade'

export interface ClientWorkspaceDef {
  /** Templates dos quadros por cliente (ex.: dossiê de Estratégia). */
  boards: BoardTemplate[]
  areas: ProjectAreaDef[]
  /** Ordem das abas depois de “Visão geral” (chaves de áreas ou abas fixas). */
  tabs: Array<string>
}
