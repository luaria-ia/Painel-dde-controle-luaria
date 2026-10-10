import type { LucideIcon } from 'lucide-react'
import type { ProjectStage, StudyExercise, StudyLesson, StudyModule, StudyTool, StudyTrack } from '@/types/studies'

type LessonInput = Omit<StudyLesson, 'id' | 'key' | 'day' | 'title'>
interface ModuleInput {
  key: string
  title: string
  description: string
  lessons: Array<Omit<StudyLesson, 'id'>>
  exercise: Omit<StudyExercise, 'id'>
}
interface TrackInput {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
  modules: ModuleInput[]
  project: { title: string; description: string; stages: ProjectStage[] } | null
  tools: StudyTool[]
}

/** Atalhos para escrever o catálogo de forma enxuta. */
export const lesson = (key: string, day: number, title: string, body: LessonInput): Omit<StudyLesson, 'id'> => ({ key, day, title, ...body })
export const studyModule = (key: string, title: string, description: string, lessons: ModuleInput['lessons'], exercise: ModuleInput['exercise']): ModuleInput => ({
  key,
  title,
  description,
  lessons,
  exercise,
})
export const stage = (key: string, title: string, hint: string): ProjectStage => ({ key, title, hint })

/** Gera os IDs estáveis (trilha.modulo.aula) e os dias de cada módulo. */
export function defineTrack(input: TrackInput): StudyTrack {
  const modules: StudyModule[] = input.modules.map((m, i) => {
    const id = `${input.id}.${m.key}`
    const lessons = m.lessons.map((l) => ({ ...l, id: `${id}.${l.key}` }))
    return {
      key: m.key,
      id,
      number: i + 1,
      title: m.title,
      description: m.description,
      lessons,
      exercise: { ...m.exercise, id: `${id}.ex` },
      days: [...new Set(lessons.map((l) => l.day))].sort((a, b) => a - b),
    }
  })
  const days = Math.max(0, ...modules.flatMap((m) => m.days))
  return { ...input, modules, days, project: input.project && { ...input.project, id: `${input.id}.projeto` } }
}

/** Trilha anunciada (sem conteúdo ainda). */
export function plannedTrack(id: string, title: string, icon: LucideIcon): StudyTrack {
  return { id, title, icon, description: '', color: '#8d8f88', days: 0, modules: [], project: null, tools: [], planned: true }
}
