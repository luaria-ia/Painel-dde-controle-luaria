import type { LucideIcon } from 'lucide-react'
import type { BaseEntity, ISODate } from './index'

/*
 * Estudos — o CATÁLOGO (trilhas, módulos, aulas) é definido em código (src/data/studies);
 * o que é do usuário (progresso, respostas, horas, biblioteca) fica no Supabase.
 *
 * IDs do progresso são derivados das chaves do catálogo:
 *   aula "social-media.m01.a1" · exercício "social-media.m01.ex" · projeto "social-media.projeto"
 *   (guarda o nome da empresa) · etapa "social-media.projeto.persona" · ferramenta "ferramenta.chatgpt".
 * Por isso: nunca renomeie chaves existentes; ao inserir conteúdo novo, use uma chave nova.
 * Checklists guardam a POSIÇÃO marcada — acrescente itens só no fim.
 */

/**
 * Bloco de conteúdo seguro (nunca HTML): texto com **negrito** e *itálico*,
 * tabela (1ª linha = cabeçalho), prompt (bloco monoespaçado) ou lista.
 */
export type RichBlock = string | { table: string[][] } | { prompt: string } | { list: string[] }

export interface StudyLesson {
  /** Chave estável dentro do módulo (ex.: "a1"). */
  key: string
  /** Preenchido por defineTrack: "trilha.modulo.aula". */
  id: string
  /** Dia da trilha em que a aula é estudada (1…track.days). */
  day: number
  title: string
  objective: string
  content: RichBlock[]
  /** [termo, definição] */
  concepts: Array<[string, string]>
  example: RichBlock[]
  practice: string
  /** "Exercício da aula" — tarefa curta respondida na própria aula. */
  task: string
  checklist: string[]
}

export interface StudyExercise {
  id: string
  title: string
  objective: string
  steps: string[]
  /** Dados de apoio (ex.: tabela de métricas fictícias). */
  data?: RichBlock[]
  checklist: string[]
  /** Texto inserido pelo botão "Inserir modelo". */
  template: string
}

export interface StudyModule {
  /** Chave estável na URL e no progresso (ex.: "m01"). */
  key: string
  id: string
  number: number
  title: string
  description: string
  lessons: StudyLesson[]
  exercise: StudyExercise
  /** Dias da trilha cobertos pelo módulo (derivado das aulas). */
  days: number[]
}

export interface ProjectStage {
  /** Chave estável (o texto e a conclusão da etapa são salvos por ela). */
  key: string
  title: string
  hint: string
}

export interface StudyProject {
  id: string
  title: string
  description: string
  stages: ProjectStage[]
}

export interface StudyTool {
  /** Chave global: o nível de domínio é o mesmo em todas as trilhas. */
  id: string
  name: string
  purpose: string
  when: string
  learn: string[]
}

export interface StudyTrack {
  /** Slug estável (URL e progresso). */
  id: string
  title: string
  description: string
  icon: LucideIcon
  /** Cor de destaque da trilha (hex). */
  color: string
  /** Duração da trilha em dias (maior dia das aulas). */
  days: number
  modules: StudyModule[]
  project: StudyProject | null
  tools: StudyTool[]
  /** Trilha anunciada, ainda sem conteúdo: aparece como "Próximas trilhas". */
  planned?: boolean
}

export type StudyItemKind = 'lesson' | 'exercise' | 'project' | 'tool'

/** Progresso de uma aula, exercício ou projeto (uma linha por item). */
export interface StudyProgress extends BaseEntity {
  itemId: string
  kind: StudyItemKind
  done: boolean
  doneAt: ISODate | null
  answer: string
  notes: string
  /** Posições marcadas no checklist. */
  checks: number[]
  /** Nível de domínio de uma ferramenta (0–4). */
  level: number | null
}

export type StudyProgressPatch = Partial<Pick<StudyProgress, 'done' | 'doneAt' | 'answer' | 'notes' | 'checks' | 'level'>>

export interface StudyHourLog extends BaseEntity {
  date: ISODate
  minutes: number
  trackId: string
  note: string
}

export type LibraryItemType = 'prompt' | 'template' | 'referencia' | 'site' | 'artigo' | 'video' | 'checklist' | 'material' | 'livro' | 'ferramenta'

export interface LibraryItem extends BaseEntity {
  type: LibraryItemType
  title: string
  url: string
  content: string
  tags: string[]
  /** null = geral (vale para todas as trilhas). */
  trackId: string | null
}
