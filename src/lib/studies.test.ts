import { describe, expect, it } from 'vitest'
import { ACTIVE_TRACKS, STUDY_TRACKS } from '@/data/studies'
import { designSites } from '@/data/studies/designSites'
import { socialMedia } from '@/data/studies/socialMedia'
import type { RichBlock, StudyHourLog, StudyProgress } from '@/types/studies'
import {
  dayStats,
  formatMinutes,
  itemStatus,
  moduleStats,
  nextStepPath,
  overallStats,
  projectMarkdown,
  stageItemId,
  studyStreak,
  toolItemId,
  trackStats,
  type ProgressMap,
} from './studies'

const TODAY = '2026-10-05'
const prog = (itemId: string, kind: StudyProgress['kind'], extra: Partial<StudyProgress> = {}): StudyProgress => ({
  id: itemId,
  itemId,
  kind,
  done: true,
  doneAt: TODAY,
  answer: '',
  notes: '',
  checks: [],
  level: null,
  createdAt: '',
  updatedAt: '',
  ...extra,
})
const hour = (date: string, minutes: number, trackId = 'social-media'): StudyHourLog => ({ id: date + minutes, date, minutes, trackId, note: '', createdAt: '', updatedAt: '' })
const mapOf = (list: StudyProgress[]): ProgressMap => new Map(list.map((p) => [p.itemId, p]))
const filled = (b: RichBlock) => (typeof b === 'string' ? b.trim().length > 0 : true)

describe('catálogo de estudos', () => {
  it('IDs são únicos e seguem a regra do banco', () => {
    const ids = STUDY_TRACKS.flatMap((t) => [
      ...t.modules.flatMap((m) => [m.id, m.exercise.id, ...m.lessons.map((l) => l.id)]),
      ...(t.project ? [t.project.id, ...t.project.stages.map((st) => stageItemId(t.project!, st.key))] : []),
    ])
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of [...ids, ...ACTIVE_TRACKS.flatMap((t) => t.tools.map((x) => toolItemId(x.id)))]) expect(id).toMatch(/^[a-z0-9][a-z0-9.-]{0,99}$/)
    expect(socialMedia.modules[0].lessons[0].id).toBe('social-media.m01.a1')
  })

  it('Social Media: 10 módulos, 28 aulas, 16 etapas, 14 dias; Design de Sites: 12 módulos, 14 dias', () => {
    expect(socialMedia.modules).toHaveLength(10)
    expect(socialMedia.modules.flatMap((m) => m.lessons)).toHaveLength(28)
    expect(socialMedia.project!.stages).toHaveLength(16)
    expect(socialMedia.days).toBe(14)
    expect(designSites.modules).toHaveLength(12)
    expect(designSites.days).toBe(14)
  })

  it('todas as aulas e exercícios das trilhas ativas têm conteúdo completo', () => {
    for (const t of ACTIVE_TRACKS) {
      let lastDay = 0
      for (const m of t.modules) {
        for (const l of m.lessons) {
          expect(l.objective.length, l.id).toBeGreaterThan(10)
          expect(l.content.length, l.id).toBeGreaterThanOrEqual(2)
          expect(l.content.every(filled), l.id).toBe(true)
          expect(l.concepts.length, l.id).toBeGreaterThanOrEqual(4)
          expect(l.example.length, l.id).toBeGreaterThan(0)
          expect(l.practice && l.task, l.id).toBeTruthy()
          expect(l.checklist.length, l.id).toBeGreaterThanOrEqual(3)
          expect(l.day, l.id).toBeGreaterThanOrEqual(lastDay) // dias em ordem
          lastDay = l.day
        }
        expect(m.exercise.steps.length, m.id).toBeGreaterThanOrEqual(4)
        expect(m.exercise.template.length, m.id).toBeGreaterThan(20)
      }
      for (let d = 1; d <= t.days; d++) expect(dayStats(t, new Map(), d).lessons.length, `${t.id} dia ${d}`).toBeGreaterThan(0)
      expect(t.tools.length).toBeGreaterThanOrEqual(4)
    }
  })
})

describe('progresso', () => {
  it('pondera aulas 60%, exercícios 25% e projeto 15%', () => {
    const allLessons = socialMedia.modules.flatMap((m) => m.lessons).map((l) => prog(l.id, 'lesson'))
    expect(trackStats(socialMedia, mapOf(allLessons), [], allLessons, TODAY).progress).toBe(60)
    const allEx = socialMedia.modules.map((m) => prog(m.exercise.id, 'exercise'))
    expect(trackStats(socialMedia, mapOf(allEx), [], allEx, TODAY).progress).toBe(25)
    const stages = socialMedia.project!.stages.map((st) => prog(stageItemId(socialMedia.project!, st.key), 'project'))
    const s = trackStats(socialMedia, mapOf(stages), [], stages, TODAY)
    expect(s.progress).toBe(15)
    expect(s.projectDone).toBe(true)
  })

  it('etapa com texto mas não concluída não conta', () => {
    const list = [prog(stageItemId(socialMedia.project!, 'empresa'), 'project', { done: false, doneAt: null, answer: 'Marmita da Lu' })]
    expect(trackStats(socialMedia, mapOf(list), [], list, TODAY).stepsDone).toBe(0)
  })

  it('status: não iniciada → em andamento (qualquer interação) → concluída', () => {
    const id = socialMedia.modules[0].lessons[0].id
    expect(itemStatus(new Map(), id)).toBe('not_started')
    expect(itemStatus(mapOf([prog(id, 'lesson', { done: false })]), id)).toBe('in_progress')
    expect(itemStatus(mapOf([prog(id, 'lesson')]), id)).toBe('done')
  })

  it('começa pela primeira aula; depois das aulas do módulo vem o exercício', () => {
    expect(nextStepPath(socialMedia, new Map())).toBe('/estudos/social-media/m01/aula/a1')
    const list = socialMedia.modules[0].lessons.map((l) => prog(l.id, 'lesson'))
    expect(nextStepPath(socialMedia, mapOf(list))).toBe('/estudos/social-media/m01/exercicio')
    expect(moduleStats(socialMedia.modules[0], mapOf(list)).progress).toBe(80) // 4 aulas de 5 itens
  })

  it('progresso do dia conta só as aulas daquele dia', () => {
    const day1 = dayStats(socialMedia, mapOf([prog('social-media.m01.a1', 'lesson')]), 1)
    expect(day1.lessons).toHaveLength(2)
    expect(day1.progress).toBe(50)
  })

  it('progresso geral soma as trilhas ativas', () => {
    const list = socialMedia.modules.flatMap((m) => m.lessons).map((l) => prog(l.id, 'lesson'))
    const o = overallStats(ACTIVE_TRACKS, mapOf(list), [hour(TODAY, 90)], list, TODAY)
    expect(o.lessonsDone).toBe(28)
    expect(o.minutes).toBe(90)
    expect(o.progress).toBeGreaterThan(0)
    expect(o.progress).toBeLessThan(60)
  })

  it('exporta o projeto em Markdown com empresa e etapas', () => {
    const p = socialMedia.project!
    const md = projectMarkdown(
      socialMedia,
      mapOf([prog(p.id, 'project', { done: false, answer: 'Marmita da Lu' }), prog(stageItemId(p, 'persona'), 'project', { answer: 'Camila, 34' })]),
    )
    expect(md).toContain('Marmita da Lu')
    expect(md).toContain('## 4. Persona\n\nCamila, 34')
    expect(md).toContain('_(não preenchido)_')
  })
})

describe('sequência', () => {
  it('conta dias seguidos e não quebra se hoje ainda não teve estudo', () => {
    const hours = [hour('2026-10-04', 30), hour('2026-10-03', 30), hour('2026-10-01', 30)]
    expect(studyStreak([], hours, TODAY)).toBe(2)
    expect(studyStreak([prog('social-media.m01.a1', 'lesson')], hours, TODAY)).toBe(3)
  })
  it('filtra por trilha e ignora nível de ferramenta', () => {
    expect(studyStreak([], [hour(TODAY, 30, 'design-sites')], TODAY, 'social-media')).toBe(0)
    expect(studyStreak([prog(toolItemId('figma'), 'tool', { level: 2 })], [], TODAY)).toBe(0)
  })
})

it('formata minutos', () => {
  expect(formatMinutes(90)).toBe('1h30')
  expect(formatMinutes(60)).toBe('1h')
  expect(formatMinutes(45)).toBe('45min')
})
