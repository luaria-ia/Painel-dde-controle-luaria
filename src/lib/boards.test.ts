import { describe, expect, it } from 'vitest'
import { ALL_BOARD_TEMPLATES, findBoardTemplate, PROJECT_TYPES, projectType } from '@/data/boards/projectTypes'
import type { BoardCard, BoardLabel, BoardList } from '@/types/boards'
import { dropPosition, EMPTY_FILTERS, evaluateAutomations, matchesFilters, positionBetween, sortCards } from './boards'

const card = (id: string, listId: string, position: number, extra: Partial<BoardCard> = {}): BoardCard => ({
  id,
  boardId: 'b',
  listId,
  title: id,
  description: '',
  position,
  priority: null,
  dueDate: null,
  assignee: '',
  labelIds: [],
  checklist: [],
  fields: {},
  completedAt: null,
  clientId: null,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '',
  ...extra,
})
const list = (id: string, templateKey: string): BoardList => ({
  id,
  boardId: 'b',
  name: templateKey,
  icon: '',
  kind: 'flow',
  templateKey,
  position: 0,
  createdAt: '',
  updatedAt: '',
})
const label = (id: string, name: string): BoardLabel => ({ id, boardId: 'b', name, color: 'sky', position: 0, createdAt: '', updatedAt: '' })

describe('templates', () => {
  it('tipos explícitos; tipo desconhecido cai em “outro”, sem áreas nem quadros', () => {
    expect(PROJECT_TYPES.map((t) => t.id)).toEqual(['luaria_ai', 'social_media', 'luaria_ai_cliente', 'web_design', 'trafego_pago', 'outro'])
    expect(projectType('xyz').id).toBe('outro')
    expect(projectType('outro').boards).toHaveLength(0)
    expect(projectType('outro').areas).toHaveLength(0)
    expect(projectType('outro').tabs).toBeUndefined() // Med Resumos: abas originais
  })

  it('cada área kanban/dossiê aponta para um template do próprio tipo; métricas para uma área existente', () => {
    for (const t of PROJECT_TYPES) {
      const keys = t.boards.map((b) => b.key)
      for (const a of t.areas) {
        if (a.kind === 'metrics')
          expect(
            t.areas.map((x) => x.key),
            `${t.id}.${a.key}`,
          ).toContain(a.source)
        else expect(keys, `${t.id}.${a.key}`).toContain(a.board)
      }
      expect(new Set(t.areas.map((a) => a.key)).size).toBe(t.areas.length)
      expect(t.tabs ?? [], t.id).not.toContain('quadros')
    }
  })

  it('Luaria.IA: abas CRM e Marketing; CRM simples de 7 etapas; Marketing é o workflow de conteúdo', () => {
    const t = projectType('luaria_ai')
    expect(t.areas.map((a) => a.label)).toEqual(['CRM', 'Marketing'])
    const crm = findBoardTemplate(t.areas[0].board)!
    expect(crm.role).toBe('crm')
    expect(crm.lists.map((l) => l.name)).toEqual(['Possíveis clientes', 'Conversas', 'Reuniões', 'Propostas', 'Negociação', 'Fechados', 'Perdidos'])
    const mkt = findBoardTemplate(t.areas[1].board)!
    expect(mkt.lists.map((l) => l.name)).toEqual(['Banco de ideias', 'Planejamento', 'Copy', 'Produção', 'Aprovação', 'Agendados', 'Publicados'])
    expect(mkt.fields.map((f) => f.key)).toEqual(expect.arrayContaining(['formato', 'pilar', 'objetivo', 'copy', 'roteiro', 'cta', 'data_publicacao']))
  })

  it('Social Media é uma OPERAÇÃO: sem aba Conteúdo no projeto; cada cliente tem Estratégia, Conteúdo e Métricas', () => {
    const t = projectType('social_media')
    expect(t.areas).toHaveLength(0)
    expect(t.tabs).not.toContain('conteudo')
    expect(t.tabs).toContain('clientes')
    const w = t.clientWorkspace!
    expect(w.tabs).toEqual(['estrategia', 'conteudo', 'tarefas', 'arquivos', 'metricas', 'atividade'])
    expect(w.areas.map((a) => [a.key, a.kind])).toEqual([
      ['estrategia', 'dossier'],
      ['conteudo', 'contents'],
      ['metricas', 'contents-metrics'],
    ])
    const est = findBoardTemplate(w.areas[0].board)!
    expect(est.lists[0].kind).toBe('reference')
    expect(est.lists[0].cards!.map((c) => c.title)).toEqual([
      'Briefing',
      'Público-alvo',
      'Persona',
      'Posicionamento',
      'Diferenciais',
      'Objetivos',
      'Tom de voz',
      'Concorrentes',
      'Análise do Instagram',
      'Diagnóstico',
      'Pontos fortes',
      'Pontos fracos',
      'Oportunidades',
      'Estratégia de conteúdo',
      'Direção visual',
      'KPIs',
    ])
  })

  it('somente operações têm espaço por cliente; Med Resumos (outro) não', () => {
    expect(PROJECT_TYPES.filter((t) => t.clientWorkspace).map((t) => t.id)).toEqual(['social_media'])
  })

  it('Luaria.IA para cliente começa na execução (sem CRM)', () => {
    const t = projectType('luaria_ai_cliente')
    expect(t.boards.some((b) => b.role === 'crm')).toBe(false)
    expect(findBoardTemplate(t.areas[1].board)!.lists.map((l) => l.name)).toEqual([
      'Briefing',
      'Diagnóstico',
      'Estratégia',
      'Desenvolvimento',
      'Testes',
      'Aprovação',
      'Implementação',
      'Entregue',
    ])
  })

  it('integridade: chaves únicas e automações apontam para listas/etiquetas/campos que existem', () => {
    expect(new Set(PROJECT_TYPES.map((t) => t.id)).size).toBe(PROJECT_TYPES.length)
    for (const b of ALL_BOARD_TEMPLATES) {
      const keys = b.lists.map((l) => l.key)
      expect(new Set(keys).size, b.key).toBe(keys.length)
      expect(new Set(b.fields.map((f) => f.key)).size, b.key).toBe(b.fields.length)
      const labels = b.labels.map((l) => l.name)
      for (const r of b.automations) {
        if (r.when.type === 'card_entered_list') expect(keys, r.id).toContain(r.when.list)
        if (r.when.type === 'label_added') expect(labels, r.id).toContain(r.when.label)
        if (r.when.type === 'date_reached')
          expect(
            b.fields.map((f) => f.key),
            r.id,
          ).toContain(r.when.field)
        for (const a of r.then) {
          if (a.type === 'add_label' || a.type === 'remove_label') expect(labels, r.id).toContain(a.label)
          if (a.type === 'create_task' && a.dueFromField)
            expect(
              b.fields.map((f) => f.key),
              r.id,
            ).toContain(a.dueFromField)
        }
      }
      for (const l of b.lists) for (const c of l.cards ?? []) for (const n of c.labels ?? []) expect(labels).toContain(n)
    }
  })
})

describe('posições', () => {
  it('insere entre vizinhos, no início e no fim', () => {
    expect(positionBetween(undefined, undefined)).toBe(1024)
    expect(positionBetween(1024, 2048)).toBe(1536)
    expect(positionBetween(undefined, 1024)).toBe(0)
    expect(positionBetween(2048, undefined)).toBe(3072)
  })
  it('calcula a posição ignorando o próprio cartão e pede renumeração quando não há espaço', () => {
    const cards = [card('a', 'L', 1024), card('b', 'L', 2048), card('c', 'L', 3072)]
    expect(dropPosition(cards, 'c', 'L', 0).position).toBe(0) // c para o topo
    expect(dropPosition(cards, 'a', 'L', 1).position).toBe(2560) // a entre b e c
    expect(dropPosition(cards, 'x', 'M', 99).position).toBe(1024) // lista vazia
    expect(dropPosition([card('a', 'L', 1), card('b', 'L', 1 + 1e-9)], 'z', 'L', 1).renumber).toBe(true)
  })
})

describe('filtros e ordenação', () => {
  it('filtra por texto em campos, etiqueta, responsável e concluídos', () => {
    const c = card('a', 'L', 1, { fields: { nicho: 'Imobiliária' }, labelIds: ['l1'], assignee: 'André', completedAt: '2026-10-01' })
    expect(matchesFilters(c, { ...EMPTY_FILTERS, query: 'imobiliaria' })).toBe(true)
    expect(matchesFilters(c, { ...EMPTY_FILTERS, labelIds: ['l2'] })).toBe(false)
    expect(matchesFilters(c, { ...EMPTY_FILTERS, assignee: 'Ana' })).toBe(false)
    expect(matchesFilters(c, { ...EMPTY_FILTERS, showCompleted: false })).toBe(false)
  })
  it('ordena por prioridade e por prazo', () => {
    const cards = [card('a', 'L', 1, { priority: 'baixa', dueDate: '2026-10-09' }), card('b', 'L', 2, { priority: 'urgente' }), card('c', 'L', 3, { dueDate: '2026-10-07' })]
    expect(sortCards(cards, 'priority').map((c) => c.id)).toEqual(['b', 'a', 'c'])
    expect(sortCards(cards, 'due').map((c) => c.id)).toEqual(['c', 'a', 'b'])
  })
})

describe('automações', () => {
  const social = findBoardTemplate('luaria-marketing-v2')!
  const crm = findBoardTemplate('luaria-crm')!
  const socialLabels = social.labels.map((l, i) => label(`s${i}`, l.name))
  const salesLabels = crm.labels.map((l, i) => label(`v${i}`, l.name))

  it('Aprovação → etiqueta “Aguardando aprovação”; Agendados troca por “Pronto para publicar”; Publicados conclui', () => {
    const c = card('a', 'L', 1)
    const aguardando = socialLabels.find((l) => l.name === 'Aguardando aprovação')!
    const fx1 = evaluateAutomations(social, socialLabels, c, { type: 'card_entered_list', list: list('L2', 'aprovacao') })
    expect(fx1.addLabelIds).toEqual([aguardando.id])
    const fx2 = evaluateAutomations(social, socialLabels, { ...c, labelIds: [aguardando.id] }, { type: 'card_entered_list', list: list('L3', 'agendados') })
    expect(fx2.removeLabelIds).toEqual([aguardando.id])
    expect(fx2.addLabelIds).toEqual([socialLabels.find((l) => l.name === 'Pronto para publicar')!.id])
    expect(evaluateAutomations(social, socialLabels, c, { type: 'card_entered_list', list: list('L4', 'publicados') }).complete).toBe(true)
  })

  it('CRM: entrar em Fechados conclui a oportunidade; create_task usa campo de data ou +N dias', () => {
    const c = card('a', 'L', 1, { title: 'Clínica Vida' })
    expect(evaluateAutomations(crm, salesLabels, c, { type: 'card_entered_list', list: list('F', 'fechados') }).complete).toBe(true)
    const rule = {
      automations: [
        {
          id: 'x',
          name: 'x',
          enabled: true,
          when: { type: 'card_entered_list' as const, list: 'fechados' },
          then: [{ type: 'create_task' as const, title: 'Handoff: {card}', dueFromField: 'proxima_acao_data', dueInDays: 2 }],
        },
      ],
    }
    expect(evaluateAutomations(rule, [], c, { type: 'card_entered_list', list: list('F', 'fechados') }, '2026-10-05').tasks[0]).toEqual({
      title: 'Handoff: Clínica Vida',
      dueDate: '2026-10-07',
      priority: 'media',
    })
    const withDate = { ...c, fields: { proxima_acao_data: '2026-10-20' } }
    expect(evaluateAutomations(rule, [], withDate, { type: 'card_entered_list', list: list('F', 'fechados') }, '2026-10-05').tasks[0].dueDate).toBe('2026-10-20')
  })

  it('regras desativadas e gatilhos futuros não disparam', () => {
    const off = { automations: social.automations.map((r) => ({ ...r, enabled: false })) }
    expect(evaluateAutomations(off, socialLabels, card('a', 'L', 1), { type: 'card_entered_list', list: list('L', 'aprovacao') }).fired).toHaveLength(0)
  })
})
