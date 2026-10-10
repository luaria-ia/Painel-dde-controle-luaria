import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui/toastContext'
import { dropPosition, evaluateAutomations, hasEffects, POSITION_STEP, type AutomationEvent, cardsOfList } from '@/lib/boards'
import { boardCardRepository, boardLabelRepository, boardListRepository, boardRepository, commentCounts as fetchCommentCounts } from '@/repositories/boards'
import { useData } from '@/store/useData'
import type { ID } from '@/types'
import type { Board, BoardCard, BoardLabel, BoardList } from '@/types/boards'

const message = (err: unknown) => (err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')
const tmpId = () => `tmp-${Math.random().toString(36).slice(2)}`

/**
 * Estado de um quadro (listas, etiquetas, cartões) com atualizações otimistas.
 * Em caso de erro, avisa e recarrega do servidor. Executa as automações do quadro ao mover cartões / adicionar etiquetas.
 */
export function useBoard(boardId: ID) {
  const toast = useToast()
  const { createTask } = useData()
  const [board, setBoard] = useState<Board | null>(null)
  const [lists, setLists] = useState<BoardList[]>([])
  const [labels, setLabels] = useState<BoardLabel[]>([])
  const [cards, setCards] = useState<BoardCard[]>([])
  const [comments, setComments] = useState<Map<ID, number>>(new Map())
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const ref = useRef({ board, lists, labels, cards })
  useEffect(() => {
    ref.current = { board, lists, labels, cards }
  })

  const load = useCallback(async () => {
    try {
      const b = await boardRepository.get(boardId)
      if (!b) return setStatus('missing')
      const [l, lb, c] = await Promise.all([boardListRepository.listBy([boardId]), boardLabelRepository.listBy([boardId]), boardCardRepository.listBy([boardId])])
      setBoard(b)
      setLists(l)
      setLabels(lb)
      setCards(c)
      setStatus('ready')
      setComments(await fetchCommentCounts(c.map((x) => x.id)))
    } catch (err) {
      toast.error(message(err))
      setStatus('error')
    }
  }, [boardId, toast])

  // O componente que usa o hook deve ter `key={boardId}`: trocar de quadro reinicia o estado.
  useEffect(() => {
    void load()
  }, [load])

  /** Executa a gravação; se falhar, avisa e recarrega o estado real. */
  const run = useCallback(
    async <R>(fn: () => Promise<R>): Promise<R | null> => {
      try {
        return await fn()
      } catch (err) {
        toast.error(message(err))
        void load()
        return null
      }
    },
    [load, toast],
  )

  // ---------- Automações ----------
  const automate = useCallback(
    async (card: BoardCard, event: AutomationEvent) => {
      const b = ref.current.board
      if (!b) return
      const fx = evaluateAutomations(b, ref.current.labels, card, event)
      if (!hasEffects(fx)) return
      const labelIds = [...card.labelIds.filter((id) => !fx.removeLabelIds.includes(id)), ...fx.addLabelIds]
      const patch: Partial<BoardCard> = {}
      if (fx.addLabelIds.length || fx.removeLabelIds.length) patch.labelIds = labelIds
      if (fx.complete) patch.completedAt = new Date().toISOString()
      if (Object.keys(patch).length) {
        setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, ...patch } : c)))
        await run(() => boardCardRepository.update(card.id, patch))
      }
      for (const t of fx.tasks)
        await createTask({
          title: t.title,
          description: `Criada automaticamente pelo quadro “${b.name}”.`,
          projectId: b.projectId,
          clientId: null,
          status: 'a_fazer',
          priority: t.priority,
          dueDate: t.dueDate,
          completedAt: null,
        })
      toast.info(`Automação: ${fx.fired.map((r) => r.name.split('→').pop()?.trim()).join(' · ')}`)
    },
    [createTask, run, toast],
  )

  // ---------- Cartões ----------
  const createCard = useCallback(
    async (listId: ID, title: string) => {
      const list = cardsOfList(ref.current.cards, listId)
      const position = (list.at(-1)?.position ?? 0) + POSITION_STEP
      const now = new Date().toISOString()
      const draft: BoardCard = {
        id: tmpId(),
        boardId,
        listId,
        title,
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
        createdAt: now,
        updatedAt: now,
      }
      setCards((cs) => [...cs, draft])
      const created = await run(() => boardCardRepository.create({ boardId, listId, title, position }))
      setCards((cs) => (created ? cs.map((c) => (c.id === draft.id ? created : c)) : cs.filter((c) => c.id !== draft.id)))
      return created
    },
    [boardId, run],
  )

  const updateCard = useCallback(
    async (id: ID, patch: Partial<BoardCard>) => {
      const before = ref.current.cards.find((c) => c.id === id)
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      const saved = await run(() => boardCardRepository.update(id, patch))
      if (saved && before) {
        // Etiquetas novas podem disparar automações
        const added = (patch.labelIds ?? []).filter((l) => !before.labelIds.includes(l))
        for (const labelId of added) {
          const label = ref.current.labels.find((l) => l.id === labelId)
          if (label) await automate({ ...before, ...patch }, { type: 'label_added', label })
        }
      }
      return !!saved
    },
    [automate, run],
  )

  /**
   * Atualiza só alguns campos personalizados, mesclando com o valor MAIS RECENTE do cartão
   * (dois campos salvos em sequência nunca sobrescrevem um ao outro). Campos vazios são permitidos.
   */
  const updateFields = useCallback(
    async (id: ID, partial: Record<string, string>) => {
      const current = ref.current.cards.find((c) => c.id === id)
      if (!current) return false
      const fields = { ...current.fields, ...partial }
      ref.current = { ...ref.current, cards: ref.current.cards.map((c) => (c.id === id ? { ...c, fields } : c)) }
      return updateCard(id, { fields })
    },
    [updateCard],
  )

  /** Move para `listId` no índice `index` (ordem manual da lista de destino). */
  const moveCard = useCallback(
    async (id: ID, listId: ID, index: number) => {
      const card = ref.current.cards.find((c) => c.id === id)
      if (!card) return
      const { position, renumber } = dropPosition(ref.current.cards, id, listId, index)
      const changedList = card.listId !== listId
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, listId, position } : c)))
      const ok = await run(() => boardCardRepository.update(id, { listId, position }))
      if (!ok) return
      if (renumber) {
        // Espaço entre posições esgotado: renumera a lista de destino.
        const ordered = cardsOfList(ref.current.cards, listId)
        const updates = ordered.map((c, i) => ({ id: c.id, position: (i + 1) * POSITION_STEP }))
        setCards((cs) => cs.map((c) => ({ ...c, position: updates.find((u) => u.id === c.id)?.position ?? c.position })))
        await run(() => Promise.all(updates.map((u) => boardCardRepository.update(u.id, { position: u.position }))))
      }
      const list = ref.current.lists.find((l) => l.id === listId)
      if (changedList && list) await automate({ ...card, listId, position }, { type: 'card_entered_list', list })
    },
    [automate, run],
  )

  const deleteCard = useCallback(
    async (id: ID) => {
      setCards((cs) => cs.filter((c) => c.id !== id))
      return (await run(() => boardCardRepository.remove(id).then(() => true))) ?? false
    },
    [run],
  )

  // ---------- Listas ----------
  const createList = useCallback(
    async (name: string) => {
      const position = (ref.current.lists.at(-1)?.position ?? 0) + POSITION_STEP
      const created = await run(() => boardListRepository.create({ boardId, name, position, kind: 'flow' }))
      if (created) setLists((ls) => [...ls, created])
      return created
    },
    [boardId, run],
  )
  const updateList = useCallback(
    async (id: ID, patch: Partial<BoardList>) => {
      setLists((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)).sort((a, b) => a.position - b.position))
      return !!(await run(() => boardListRepository.update(id, patch)))
    },
    [run],
  )
  /** Troca a lista de lugar com a vizinha (−1 = esquerda, +1 = direita). */
  const shiftList = useCallback(
    async (id: ID, dir: -1 | 1) => {
      const ls = [...ref.current.lists].sort((a, b) => a.position - b.position)
      const i = ls.findIndex((l) => l.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= ls.length) return
      const a = ls[i]
      const b = ls[j]
      setLists((cur) =>
        cur.map((l) => (l.id === a.id ? { ...l, position: b.position } : l.id === b.id ? { ...l, position: a.position } : l)).sort((x, y) => x.position - y.position),
      )
      await run(() => Promise.all([boardListRepository.update(a.id, { position: b.position }), boardListRepository.update(b.id, { position: a.position })]))
    },
    [run],
  )
  const deleteList = useCallback(
    async (id: ID) => {
      setLists((ls) => ls.filter((l) => l.id !== id))
      setCards((cs) => cs.filter((c) => c.listId !== id))
      return (await run(() => boardListRepository.remove(id).then(() => true))) ?? false
    },
    [run],
  )

  // ---------- Etiquetas ----------
  const createLabel = useCallback(
    async (input: Pick<BoardLabel, 'name' | 'color'>) => {
      const created = await run(() => boardLabelRepository.create({ boardId, ...input, position: ref.current.labels.length }))
      if (created) setLabels((ls) => [...ls, created])
      return created
    },
    [boardId, run],
  )
  const updateLabel = useCallback(
    async (id: ID, patch: Partial<BoardLabel>) => {
      setLabels((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
      return !!(await run(() => boardLabelRepository.update(id, patch)))
    },
    [run],
  )
  const deleteLabel = useCallback(
    async (id: ID) => {
      setLabels((ls) => ls.filter((l) => l.id !== id))
      setCards((cs) => cs.map((c) => ({ ...c, labelIds: c.labelIds.filter((x) => x !== id) })))
      return (await run(() => boardLabelRepository.remove(id).then(() => true))) ?? false
    },
    [run],
  )

  // ---------- Quadro ----------
  const updateBoard = useCallback(
    async (patch: Partial<Board>) => {
      setBoard((b) => (b ? { ...b, ...patch } : b))
      return !!(await run(() => boardRepository.update(boardId, patch)))
    },
    [boardId, run],
  )

  const bumpComments = useCallback((cardId: ID, delta: number) => setComments((m) => new Map(m).set(cardId, Math.max(0, (m.get(cardId) ?? 0) + delta))), [])

  return {
    status,
    board,
    lists,
    labels,
    cards,
    comments,
    reload: load,
    createCard,
    updateCard,
    updateFields,
    moveCard,
    deleteCard,
    createList,
    updateList,
    shiftList,
    deleteList,
    createLabel,
    updateLabel,
    deleteLabel,
    updateBoard,
    bumpComments,
  }
}

export type BoardApi = ReturnType<typeof useBoard>
