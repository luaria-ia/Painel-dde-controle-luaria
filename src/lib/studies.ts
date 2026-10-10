import type { CSSProperties } from 'react'
import { addDays, todayISO } from '@/lib/format'
import type { ISODate } from '@/types'
import type { StudyHourLog, StudyModule, StudyProgress, StudyProject, StudyTrack } from '@/types/studies'

/** Peso de cada parte no progresso de uma trilha. */
export const PROGRESS_WEIGHTS = {
  lessons: 0.6,
  exercises: 0.25,
  project: 0.15,
} as const

export type ProgressMap = Map<string, StudyProgress>

export interface TrackStats {
  lessons: number
  lessonsDone: number
  exercises: number
  exercisesDone: number
  steps: number
  stepsDone: number
  /** 0–1 por parte */
  lessonsRatio: number
  exercisesRatio: number
  projectRatio: number
  /** 0–100, ponderado */
  progress: number
  minutes: number
  projectDone: boolean
  streak: number
}

const ratio = (a: number, b: number) => (b ? a / b : 0)
const weighted = (l: number, e: number, p: number) => Math.round((l * PROGRESS_WEIGHTS.lessons + e * PROGRESS_WEIGHTS.exercises + p * PROGRESS_WEIGHTS.project) * 100)

export const isDone = (map: ProgressMap, id: string) => !!map.get(id)?.done

/** ID do progresso de uma etapa do projeto final (texto + concluída). */
export const stageItemId = (project: StudyProject, stageKey: string) => `${project.id}.${stageKey}`
/** ID do nível de domínio de uma ferramenta (o mesmo em todas as trilhas). */
export const toolItemId = (toolId: string) => `ferramenta.${toolId}`

export function projectStepsDone(track: StudyTrack, map: ProgressMap): number {
  const project = track.project
  if (!project) return 0
  return project.stages.filter((st) => isDone(map, stageItemId(project, st.key))).length
}

export type StudyStatus = 'not_started' | 'in_progress' | 'done'

/** Aula/exercício: concluído, em andamento (já teve alguma interação) ou não iniciado. */
export function itemStatus(map: ProgressMap, id: string): StudyStatus {
  const p = map.get(id)
  return p?.done ? 'done' : p ? 'in_progress' : 'not_started'
}

export function trackStats(track: StudyTrack, map: ProgressMap, hours: StudyHourLog[], progressList: StudyProgress[], today = todayISO()): TrackStats {
  const lessons = track.modules.flatMap((m) => m.lessons)
  const lessonsDone = lessons.filter((l) => isDone(map, l.id)).length
  const exercisesDone = track.modules.filter((m) => isDone(map, m.exercise.id)).length
  const steps = track.project?.stages.length ?? 0
  const stepsDone = projectStepsDone(track, map)
  const lessonsRatio = ratio(lessonsDone, lessons.length)
  const exercisesRatio = ratio(exercisesDone, track.modules.length)
  const projectRatio = ratio(stepsDone, steps)
  return {
    lessons: lessons.length,
    lessonsDone,
    exercises: track.modules.length,
    exercisesDone,
    steps,
    stepsDone,
    lessonsRatio,
    exercisesRatio,
    projectRatio,
    progress: weighted(lessonsRatio, exercisesRatio, projectRatio),
    minutes: hours.filter((h) => h.trackId === track.id).reduce((n, h) => n + h.minutes, 0),
    projectDone: steps > 0 && stepsDone === steps,
    streak: studyStreak(progressList, hours, today, track.id),
  }
}

/** Aulas de um dia da trilha e quantas estão concluídas. */
export function dayStats(track: StudyTrack, map: ProgressMap, day: number) {
  const lessons = track.modules.flatMap((m) => m.lessons).filter((l) => l.day === day)
  const done = lessons.filter((l) => isDone(map, l.id)).length
  return { lessons, done, progress: lessons.length ? Math.round((done / lessons.length) * 100) : 0 }
}

export interface OverallStats extends TrackStats {
  projects: number
  projectsDone: number
}

/** Progresso geral = mesma fórmula, somando os itens de todas as trilhas ativas. */
export function overallStats(tracks: StudyTrack[], map: ProgressMap, hours: StudyHourLog[], progressList: StudyProgress[], today = todayISO()): OverallStats {
  const all = tracks.map((t) => trackStats(t, map, hours, progressList, today))
  const sum = (k: keyof TrackStats) => all.reduce((n, s) => n + (s[k] as number), 0)
  const lessonsRatio = ratio(sum('lessonsDone'), sum('lessons'))
  const exercisesRatio = ratio(sum('exercisesDone'), sum('exercises'))
  const projectRatio = ratio(sum('stepsDone'), sum('steps'))
  return {
    lessons: sum('lessons'),
    lessonsDone: sum('lessonsDone'),
    exercises: sum('exercises'),
    exercisesDone: sum('exercisesDone'),
    steps: sum('steps'),
    stepsDone: sum('stepsDone'),
    lessonsRatio,
    exercisesRatio,
    projectRatio,
    progress: weighted(lessonsRatio, exercisesRatio, projectRatio),
    minutes: hours.reduce((n, h) => n + h.minutes, 0),
    projectDone: all.length > 0 && all.every((s) => s.projectDone),
    projects: all.filter((s) => s.steps > 0).length,
    projectsDone: all.filter((s) => s.projectDone).length,
    streak: studyStreak(progressList, hours, today),
  }
}

export function moduleStats(m: StudyModule, map: ProgressMap) {
  const lessonsDone = m.lessons.filter((l) => isDone(map, l.id)).length
  const exerciseDone = isDone(map, m.exercise.id)
  return {
    lessonsDone,
    exerciseDone,
    progress: Math.round(((lessonsDone + (exerciseDone ? 1 : 0)) / (m.lessons.length + 1)) * 100),
  }
}

/**
 * Dias seguidos com estudo (horas registradas ou aula/exercício concluído).
 * Hoje sem estudo ainda não quebra a sequência — ela conta até ontem.
 */
export function studyStreak(progressList: StudyProgress[], hours: StudyHourLog[], today: ISODate, trackId?: string): number {
  const days = new Set<string>()
  for (const h of hours) if (!trackId || h.trackId === trackId) days.add(h.date)
  for (const p of progressList) if (p.done && p.doneAt && p.kind !== 'tool' && (!trackId || p.itemId.startsWith(`${trackId}.`))) days.add(p.doneAt)
  let day = days.has(today) ? today : addDays(today, -1)
  let n = 0
  while (days.has(day)) {
    n++
    day = addDays(day, -1)
  }
  return n
}

export const statusOf = (progress: number): StudyStatus => (progress >= 100 ? 'done' : progress > 0 ? 'in_progress' : 'not_started')

/** 90 → "1h30", 45 → "45min" */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m}min`
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

// ---------- Rotas ----------

export const studyPaths = {
  home: '/estudos',
  track: (t: string) => `/estudos/${t}`,
  module: (t: string, m: string) => `/estudos/${t}/${m}`,
  lesson: (t: string, m: string, l: string) => `/estudos/${t}/${m}/aula/${l}`,
  exercise: (t: string, m: string) => `/estudos/${t}/${m}/exercicio`,
  project: (t: string) => `/estudos/${t}/projeto`,
  schedule: (t: string) => `/estudos/${t}/cronograma`,
  tools: '/ferramentas-ia',
  library: '/biblioteca',
  projects: '/projetos-de-estudo',
}

/** Próximo passo da trilha: primeira aula pendente, ou o exercício do módulo, ou o projeto final. */
export function nextStepPath(track: StudyTrack, map: ProgressMap): string {
  for (const m of track.modules) {
    const l = m.lessons.find((x) => !isDone(map, x.id))
    if (l) return studyPaths.lesson(track.id, m.key, l.key)
    if (!isDone(map, m.exercise.id)) return studyPaths.exercise(track.id, m.key)
  }
  return studyPaths.project(track.id)
}

/** Cor da trilha disponível como var(--tc) para os filhos. */
export const trackStyle = (track: Pick<StudyTrack, 'color'>) => ({ '--tc': track.color }) as CSSProperties

export function minutesInLastDays(hours: StudyHourLog[], days: number, today = todayISO()): number {
  const from = addDays(today, -(days - 1))
  return hours.filter((h) => h.date >= from && h.date <= today).reduce((n, h) => n + h.minutes, 0)
}

/** Projeto final em Markdown (para montar o case de portfólio). */
export function projectMarkdown(track: StudyTrack, map: ProgressMap): string {
  const project = track.project
  if (!project) return ''
  const company = map.get(project.id)?.answer.trim() || 'Empresa fictícia'
  const parts = project.stages.map((st, i) => `## ${i + 1}. ${st.title}\n\n${map.get(stageItemId(project, st.key))?.answer.trim() || '_(não preenchido)_'}`)
  return `# ${project.title.replace(/^Projeto Final — /, '')} — ${company}\n\n> Estudo de caso fictício desenvolvido na trilha ${track.title} do Business OS.\n\n${parts.join('\n\n')}\n`
}
