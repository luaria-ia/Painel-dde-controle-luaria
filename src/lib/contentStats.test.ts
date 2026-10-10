import { describe, expect, it } from 'vitest'
import type { Content } from '@/types'
import { contentStats } from './contentStats'

const c = (id: string, status: Content['status'], date: string | null, clientId = 'x'): Content =>
  ({
    id,
    status,
    plannedDate: date,
    publishDate: null,
    projectId: 'p',
    clientId,
    title: id,
    description: '',
    type: 'post',
    caption: '',
    cta: '',
    notes: '',
    createdAt: '',
    updatedAt: '',
  }) as Content

describe('contentStats', () => {
  it('conta por etapa, atrasados e próximos 14 dias', () => {
    const list = [c('a', 'roteiro', '2026-10-01'), c('b', 'producao', '2026-10-10'), c('d', 'aprovacao', null), c('e', 'agendado', '2026-10-06'), c('f', 'publicado', '2026-10-02')]
    const s = contentStats(list, '2026-10-05')
    expect([s.production, s.approval, s.scheduled, s.published, s.publishedMonth]).toEqual([2, 1, 1, 1, 1])
    expect(s.late).toBe(1)
    expect(s.upcoming.map((x) => x.id)).toEqual(['e', 'b'])
  })
})
