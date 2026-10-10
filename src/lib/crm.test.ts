import { describe, expect, it } from 'vitest'
import type { BoardCard, BoardList } from '@/types/boards'
import { distinctValues, EMPTY_CRM_FILTERS, matchesCrm, sortCrm } from './crm'

const lists: BoardList[] = ['interessados', 'conversas', 'reunioes'].map((k, i) => ({
  id: k,
  boardId: 'b',
  name: k,
  icon: '',
  kind: 'flow',
  templateKey: k,
  position: i * 1024,
  createdAt: '',
  updatedAt: '',
}))
const card = (id: string, listId: string, title: string, fields: Record<string, string>): BoardCard => ({
  id,
  boardId: 'b',
  listId,
  title,
  description: '',
  position: 0,
  priority: null,
  dueDate: null,
  assignee: '',
  labelIds: [],
  checklist: [],
  fields,
  completedAt: null,
  clientId: null,
  createdAt: `2026-10-0${id.length}`,
  updatedAt: '',
})
const TODAY = '2026-10-05'
const cards = [
  card('a', 'conversas', 'Luan Abul', {
    empresa: 'Luan Abul Negócios Imobiliários',
    segmento: 'Imobiliário',
    cidade: 'Vila Velha/ES',
    data: '2026-10-05',
    proxima_acao_data: '2026-10-08',
  }),
  card('bb', 'interessados', 'Ana', { empresa: 'Clínica Vida', segmento: 'Saúde', cidade: 'Curitiba/PR', data: '2026-09-20', proxima_acao_data: '2026-10-01' }),
  card('ccc', 'reunioes', 'Bruno', { segmento: 'imobiliário', data: '2026-10-02' }),
]

describe('CRM em tabela', () => {
  it('filtra por status, segmento (sem acento/caixa), cidade e datas', () => {
    expect(cards.filter((c) => matchesCrm(c, { ...EMPTY_CRM_FILTERS, listIds: ['conversas'] }, TODAY)).map((c) => c.id)).toEqual(['a'])
    expect(cards.filter((c) => matchesCrm(c, { ...EMPTY_CRM_FILTERS, segment: 'Imobiliario' }, TODAY)).map((c) => c.id)).toEqual(['a', 'ccc'])
    expect(cards.filter((c) => matchesCrm(c, { ...EMPTY_CRM_FILTERS, city: 'Vila Velha/ES' }, TODAY)).map((c) => c.id)).toEqual(['a'])
    expect(cards.filter((c) => matchesCrm(c, { ...EMPTY_CRM_FILTERS, from: '2026-10-01', to: '2026-10-31' }, TODAY)).map((c) => c.id)).toEqual(['a', 'ccc'])
  })
  it('filtra pelo status do lead, separado da etapa', () => {
    const withStatus = [{ ...cards[0], fields: { ...cards[0].fields, status: '🟡 Interessado' } }, cards[1]]
    expect(withStatus.filter((c) => matchesCrm(c, { ...EMPTY_CRM_FILTERS, status: '🟡 Interessado' }, TODAY)).map((c) => c.id)).toEqual(['a'])
  })
  it('filtra o próximo follow-up: atrasado, próximos 7 dias e sem follow-up', () => {
    const ids = (followUp: (typeof EMPTY_CRM_FILTERS)['followUp']) => cards.filter((c) => matchesCrm(c, { ...EMPTY_CRM_FILTERS, followUp }, TODAY)).map((c) => c.id)
    expect(ids('overdue')).toEqual(['bb'])
    expect(ids('week')).toEqual(['a'])
    expect(ids('none')).toEqual(['ccc'])
  })
  it('valores distintos para os filtros sem duplicar variações de acento', () => {
    expect(distinctValues(cards, 'segmento')).toEqual(['Imobiliário', 'Saúde'])
  })
  it('ordena por empresa, etapa e primeiro contato; vazios no fim', () => {
    expect(sortCrm(cards, lists, { key: 'company', dir: 'asc' }).map((c) => c.id)).toEqual(['bb', 'a', 'ccc'])
    expect(sortCrm(cards, lists, { key: 'company', dir: 'desc' }).map((c) => c.id)).toEqual(['a', 'bb', 'ccc'])
    expect(sortCrm(cards, lists, { key: 'stage', dir: 'asc' }).map((c) => c.id)).toEqual(['bb', 'a', 'ccc'])
    expect(sortCrm(cards, lists, { key: 'firstContact', dir: 'desc' }).map((c) => c.id)).toEqual(['a', 'ccc', 'bb'])
  })
})
