import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmContext } from '@/components/ui/confirmContext'
import { findBoardTemplate } from '@/data/boards/projectTypes'
import type { BoardApi } from '@/hooks/useBoard'
import type { Board, BoardCard, BoardLabel, BoardList } from '@/types/boards'
import { BoardColumns } from './BoardColumns'
import { CrmTable } from './CrmTable'

vi.mock('@/lib/supabase', () => ({ supabase: {} }))

// Quadro Social Media montado a partir do template real.
const tpl = findBoardTemplate('luaria-marketing-v2')!
const board: Board = {
  id: 'b',
  projectId: 'p',
  clientId: null,
  templateKey: tpl.key,
  name: tpl.name,
  icon: tpl.icon,
  position: 0,
  fields: tpl.fields,
  automations: tpl.automations,
  createdAt: '',
  updatedAt: '',
}
const lists: BoardList[] = tpl.lists.map((l, i) => ({
  id: `l${i}`,
  boardId: 'b',
  name: l.name,
  icon: l.icon,
  kind: l.kind ?? 'flow',
  templateKey: l.key,
  position: i,
  createdAt: '',
  updatedAt: '',
}))
const labels: BoardLabel[] = tpl.labels.map((l, i) => ({ id: `t${i}`, boardId: 'b', name: l.name, color: l.color, position: i, createdAt: '', updatedAt: '' }))
const base = { description: '', priority: null, dueDate: null, assignee: '', labelIds: [], checklist: [], fields: {}, completedAt: null, clientId: null, createdAt: '2026-10-01', updatedAt: '' }
const cards: BoardCard[] = [
  {
    ...base,
    id: 'c1',
    boardId: 'b',
    listId: 'l1',
    title: 'Reels <b>mitos</b>',
    position: 1,
    priority: 'urgente',
    dueDate: '2020-01-01',
    assignee: 'André',
    labelIds: ['t0'],
    checklist: [{ id: 'x', text: 'roteiro', done: true }],
    fields: { formato: 'Reel' },
  },
]
const noop = async () => null
const api = {
  status: 'ready',
  board,
  lists,
  labels,
  cards,
  comments: new Map([['c1', 3]]),
  reload: noop,
  createCard: noop,
  updateCard: noop,
  moveCard: noop,
  deleteCard: noop,
  createList: noop,
  updateList: noop,
  shiftList: noop,
  deleteList: noop,
  createLabel: noop,
  updateLabel: noop,
  deleteLabel: noop,
  updateBoard: noop,
  bumpComments: () => {},
} as unknown as BoardApi

describe('BoardColumns', () => {
  it('renderiza listas, cartões com etiqueta, prazo, checklist, campos e avatar', () => {
    const html = renderToString(
      <ConfirmContext.Provider value={async () => true}>
        <MemoryRouter>
          <BoardColumns api={api} visible={(id) => cards.filter((c) => c.listId === id)} exactDrop attachments={new Map([['c1', 2]])} onOpenCard={() => {}} />
        </MemoryRouter>
      </ConfirmContext.Provider>,
    ).replace(/<!-- -->/g, '')
    for (const name of ['Banco de ideias', 'Aprovação', 'Publicados', 'Adicionar lista']) expect(html).toContain(name)
    expect(html).toContain('Reels &lt;b&gt;mitos&lt;/b&gt;') // texto do usuário escapado
    expect(html).toContain('Formato:</span> Reel')
    expect(html).toContain('1/1') // checklist
    expect(html).toContain('aria-label="André"')
    expect(html).toContain('bg-rose-500/12') // prazo atrasado
  })
})

describe('CrmTable', () => {
  it('mostra os mesmos cartões em linhas, com status editável igual às listas do Kanban', () => {
    const crmCard = { ...base, id: 'l1', boardId: 'b', listId: 'l1', title: 'Luan Abul', position: 1, fields: { empresa: 'Luan Abul Negócios Imobiliários', segmento: 'Imobiliário', cidade: 'Vila Velha/ES', data: '2026-10-05', proxima_acao_data: '2026-10-08', whatsapp: '27 99999-0000', instagram: '@luanimoveis' }, description: 'Quer automatizar atendimento' }
    const html = renderToString(<CrmTable api={{ ...api, cards: [crmCard] } as unknown as BoardApi} cards={[crmCard]} onOpenCard={() => {}} />).replace(/<!-- -->/g, '')
    for (const t of ['Luan Abul Negócios Imobiliários', 'Imobiliário', 'Vila Velha/ES', '@luanimoveis', 'Quer automatizar atendimento', '2026-10-08', 'Novo lead']) expect(html).toContain(t)
    // o seletor de status lista as mesmas colunas do Kanban, com a atual selecionada
    for (const l of lists) expect(html).toContain(l.name)
    expect(html).toMatch(/<option value="l1" selected="">/)
    expect(html).toContain('Etapa')
    expect(html).toContain('Nome do contato')
  })
})
