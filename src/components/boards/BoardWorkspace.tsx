import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownUp, Columns3, Filter, LayoutGrid, Search, Settings2, Table2, Tag, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input, Select } from '@/components/ui/Field'
import { findBoardTemplate } from '@/data/boards/projectTypes'
import { useBoard } from '@/hooks/useBoard'
import { activeFilterCount, EMPTY_FILTERS, LABEL_COLORS, matchesFilters, sortCards, type BoardFilters, type BoardSort } from '@/lib/boards'
import { CRM_FIELD, crmFilterCount, distinctValues, EMPTY_CRM_FILTERS, matchesCrm, type CrmFilters } from '@/lib/crm'
import { cn } from '@/lib/utils'
import { Segmented } from '@/components/ui/Segmented'
import { useData } from '@/store/useData'
import type { ID, Project } from '@/types'
import { BoardColumns } from './BoardColumns'
import { BoardSettingsModal, type SettingsTab } from './BoardSettingsModal'
import { CardModal } from './CardModal'
import { CrmTable } from './CrmTable'

const SORTS: Record<BoardSort, string> = { manual: 'Ordem manual', due: 'Prazo', priority: 'Prioridade', recent: 'Mais recentes' }

/**
 * Kanban de uma área do projeto (CRM, Marketing, Conteúdo…). Não é uma página: vive dentro da aba da área.
 * Busca, filtros, ordenação, arrastar-e-soltar e detalhes do cartão (?cartao=…).
 */
export function BoardWorkspace({ project, boardId }: { project: Project; boardId: ID }) {
  const { files } = useData()
  const api = useBoard(boardId)
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState<BoardFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<BoardSort>('manual')
  const [showFilters, setShowFilters] = useState(false)
  const [settings, setSettings] = useState<SettingsTab | null>(null)
  const [crmFilters, setCrmFilters] = useState<CrmFilters>(EMPTY_CRM_FILTERS)
  const openCard = params.get('cartao')
  // Visualização do CRM (?modo=tabela). As duas usam exatamente os mesmos cartões.
  const view = params.get('modo') === 'tabela' ? 'tabela' : 'kanban'
  const setView = (v: 'kanban' | 'tabela') =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (v === 'tabela') next.set('modo', 'tabela')
        else next.delete('modo')
        return next
      },
      { replace: true },
    )
  // Mantém a aba atual (?aba=) ao abrir/fechar um cartão.
  const setOpenCard = (id: ID | null) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (id) next.set('cartao', id)
        else next.delete('cartao')
        return next
      },
      { replace: !id },
    )

  const attachments = useMemo(() => {
    const m = new Map<ID, number>()
    for (const f of files) if (f.boardCardId) m.set(f.boardCardId, (m.get(f.boardCardId) ?? 0) + 1)
    return m
  }, [files])
  const people = useMemo(() => [...new Set([...project.owners, ...api.cards.map((c) => c.assignee)].filter(Boolean))].sort(), [project.owners, api.cards])

  if (api.status === 'loading') return <div className="h-96 animate-pulse rounded-xl bg-surface-2/60" aria-busy="true" aria-label="Carregando quadro" />
  // Quadro de outro projeto (ou inexistente) nunca aparece aqui.
  if (api.status !== 'ready' || !api.board || api.board.projectId !== project.id) {
    return (
      <Card>
        <EmptyState icon={LayoutGrid} title="Não foi possível carregar esta área" description="Recarregue a página." />
      </Card>
    )
  }

  const board = api.board
  const crm = findBoardTemplate(board.templateKey)?.role === 'crm'
  const tableView = crm && view === 'tabela'
  const filterCount = activeFilterCount(filters) + (crm ? crmFilterCount(crmFilters) : 0)
  const filtered = filterCount > 0
  const exactDrop = sort === 'manual' && !filtered
  /** Mesmo critério de busca/filtros nas duas visualizações. */
  const matches = (c: (typeof api.cards)[number]) => matchesFilters(c, filters) && (!crm || matchesCrm(c, crmFilters))
  const visible = (listId: ID) =>
    sortCards(
      api.cards.filter((c) => c.listId === listId && matches(c)),
      sort,
    )
  const assignees = [...new Set(api.cards.map((c) => c.assignee).filter(Boolean))].sort()
  const matching = api.cards.filter(matches)
  const shown = matching.length
  const segments = crm ? distinctValues(api.cards, CRM_FIELD.segment) : []
  const cities = crm ? distinctValues(api.cards, CRM_FIELD.city) : []

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {crm && (
          <Segmented
            ariaLabel="Visualização do CRM"
            value={view}
            onChange={setView}
            options={[
              { value: 'kanban', label: 'Kanban', icon: Columns3 },
              { value: 'tabela', label: 'Tabela', icon: Table2 },
            ]}
          />
        )}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input
            type="search"
            aria-label={crm ? 'Pesquisar leads' : 'Pesquisar cartões'}
            placeholder={crm ? 'Pesquisar leads (nome, empresa, segmento, cidade…)' : 'Pesquisar cartões…'}
            className="h-8 pl-9 text-[13px]"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          />
        </div>
        <Button size="sm" icon={Filter} variant={filtered ? 'primary' : 'secondary'} aria-expanded={showFilters} onClick={() => setShowFilters((s) => !s)}>
          Filtros{filtered ? ` (${filterCount})` : ''}
        </Button>
        <div className={cn('flex items-center gap-1.5', tableView && 'hidden')}>
          <ArrowDownUp className="h-4 w-4 text-subtle" aria-hidden="true" />
          <Select
            compact
            aria-label="Ordenar cartões"
            value={sort}
            options={Object.entries(SORTS).map(([value, label]) => ({ value, label }))}
            onChange={(e) => setSort(e.target.value as BoardSort)}
          />
        </div>
        {filtered && (
          <>
            <span className="text-[12.5px] text-subtle">
              {shown} de {api.cards.length} cartões
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={X}
              onClick={() => {
                setFilters(EMPTY_FILTERS)
                setCrmFilters(EMPTY_CRM_FILTERS)
              }}
            >
              Limpar
            </Button>
          </>
        )}
        {!exactDrop && !tableView && <span className="text-[12px] text-subtle">Com filtros ou ordenação, arrastar move o cartão para o fim da lista.</span>}
        <span className="flex-1" />
        <span className="text-[12.5px] text-subtle">
          {api.cards.length} {crm ? (api.cards.length === 1 ? 'oportunidade' : 'oportunidades') : api.cards.length === 1 ? 'cartão' : 'cartões'}
        </span>
        <Button size="sm" variant="ghost" icon={Tag} onClick={() => setSettings('etiquetas')}>
          Etiquetas
        </Button>
        <Button size="sm" variant="ghost" icon={Settings2} onClick={() => setSettings('campos')}>
          Campos
        </Button>
        <Button size="sm" variant="ghost" icon={Zap} onClick={() => setSettings('automacoes')}>
          Automações
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-4 flex flex-col gap-3 p-4">
          {crm && (
            <>
              <div>
                <p className="mb-1.5 text-[12px] font-medium text-subtle">Etapa</p>
                <div className="flex flex-wrap gap-1.5">
                  {api.lists.map((l) => {
                    const on = crmFilters.listIds.includes(l.id)
                    return (
                      <button
                        key={l.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setCrmFilters((f) => ({ ...f, listIds: on ? f.listIds.filter((x) => x !== l.id) : [...f.listIds, l.id] }))}
                        className={cn(
                          'cursor-pointer rounded-md border px-2 py-1 text-[12px] font-medium transition-colors',
                          on ? 'border-accent/50 bg-accent-soft text-fg' : 'border-line text-muted hover:border-line-strong hover:text-fg',
                        )}
                      >
                        {`${l.icon} ${l.name}`.trim()}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  compact
                  aria-label="Status do lead"
                  value={crmFilters.status}
                  placeholder="Todos os status"
                  options={(board.fields.find((x) => x.key === CRM_FIELD.status)?.options ?? []).map((v) => ({ value: v, label: v }))}
                  onChange={(e) => setCrmFilters((f) => ({ ...f, status: e.target.value }))}
                />
                <Select compact aria-label="Segmento" value={crmFilters.segment} placeholder="Todos os segmentos" options={segments.map((v) => ({ value: v, label: v }))} onChange={(e) => setCrmFilters((f) => ({ ...f, segment: e.target.value }))} />
                <Select compact aria-label="Cidade" value={crmFilters.city} placeholder="Todas as cidades" options={cities.map((v) => ({ value: v, label: v }))} onChange={(e) => setCrmFilters((f) => ({ ...f, city: e.target.value }))} />
                <Select
                  compact
                  aria-label="Próximo follow-up"
                  value={crmFilters.followUp}
                  placeholder="Qualquer follow-up"
                  options={[
                    { value: 'overdue', label: 'Follow-up atrasado' },
                    { value: 'today', label: 'Follow-up hoje' },
                    { value: 'week', label: 'Follow-up em 7 dias' },
                    { value: 'none', label: 'Sem follow-up' },
                  ]}
                  onChange={(e) => setCrmFilters((f) => ({ ...f, followUp: e.target.value as CrmFilters['followUp'] }))}
                />
                <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
                  Primeiro contato
                  <Input type="date" aria-label="Primeiro contato a partir de" className="h-8 w-[140px] text-[13px]" value={crmFilters.from} onChange={(e) => setCrmFilters((f) => ({ ...f, from: e.target.value }))} />
                  até
                  <Input type="date" aria-label="Primeiro contato até" className="h-8 w-[140px] text-[13px]" value={crmFilters.to} onChange={(e) => setCrmFilters((f) => ({ ...f, to: e.target.value }))} />
                </span>
              </div>
            </>
          )}
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-subtle">Etiquetas</p>
            <div className="flex flex-wrap gap-1.5">
              {api.labels.map((l) => {
                const on = filters.labelIds.includes(l.id)
                return (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFilters((f) => ({ ...f, labelIds: on ? f.labelIds.filter((x) => x !== l.id) : [...f.labelIds, l.id] }))}
                    className={cn(
                      'cursor-pointer rounded px-2 py-1 text-[12px] font-semibold ring-1 ring-inset',
                      LABEL_COLORS[l.color].chip,
                      on ? 'ring-2' : 'opacity-60 hover:opacity-100',
                    )}
                  >
                    {l.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              compact
              aria-label="Responsável"
              value={filters.assignee}
              placeholder="Todos os responsáveis"
              options={assignees.map((a) => ({ value: a, label: a }))}
              onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
            />
            <Select
              compact
              aria-label="Prazo"
              value={filters.due}
              placeholder="Qualquer prazo"
              options={[
                { value: 'overdue', label: 'Atrasados' },
                { value: 'week', label: 'Próximos 7 dias' },
                { value: 'none', label: 'Sem prazo' },
              ]}
              onChange={(e) => setFilters((f) => ({ ...f, due: e.target.value as BoardFilters['due'] }))}
            />
            <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-muted">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={filters.showCompleted}
                onChange={(e) => setFilters((f) => ({ ...f, showCompleted: e.target.checked }))}
              />
              Mostrar concluídos
            </label>
          </div>
        </Card>
      )}

      {tableView ? <CrmTable api={api} cards={matching} onOpenCard={setOpenCard} /> : <BoardColumns api={api} visible={visible} exactDrop={exactDrop} attachments={attachments} onOpenCard={setOpenCard} />}

      <CardModal api={api} cardId={openCard} people={people} project={project} onClose={() => setOpenCard(null)} />
      <BoardSettingsModal api={api} tab={settings} onTab={setSettings} onClose={() => setSettings(null)} />
    </div>
  )
}
