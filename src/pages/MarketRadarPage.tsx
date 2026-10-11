import { useMemo, useState } from 'react'
import {
  Bot,
  Building2,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Kanban as KanbanIcon,
  Plus,
  Table as TableIcon,
  Trash2,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { CofounderCommercialDashboard } from '@/components/radar/CofounderCommercialDashboard'
import { RadarAiAnalysisModal } from '@/components/radar/RadarAiAnalysisModal'
import { RadarImportModal } from '@/components/radar/RadarImportModal'
import { RadarKanbanBoard } from '@/components/radar/RadarKanbanBoard'
import { RadarOpportunityModal } from '@/components/radar/RadarOpportunityModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { formatCurrency } from '@/lib/format'
import {
  FIT_LUARIA_LABELS,
  RADAR_SOURCE_LABELS,
  RADAR_STATUS_COLORS,
  RADAR_STATUS_LABELS,
} from '@/lib/radarScore'
import { exportRadarToCsv, exportRadarToJson, INITIAL_RADAR_OPPORTUNITIES } from '@/repositories/radar'
import { useData } from '@/store/useData'
import type {
  FitLuaria,
  RadarOpportunity,
  RadarOpportunitySource,
  RadarOpportunityStatus,
} from '@/types/radar'

type ViewCategory = 'todas' | 'workana' | 'prospeccao' | 'dashboard'
type LayoutMode = 'tabela' | 'kanban'

export function MarketRadarPage() {
  const {
    radarOpportunities,
    createRadarOpportunity,
    updateRadarOpportunity,
    deleteRadarOpportunity,
    sendRadarOpportunityToCrm,
    importRadarOpportunities,
  } = useData()
  const toast = useToast()

  const today = new Date().toISOString().slice(0, 10)

  // Estados de navegação e filtros
  const [activeCategory, setActiveCategory] = useState<ViewCategory>('todas')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('tabela')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | RadarOpportunityStatus>('todos')
  const [sourceFilter, setSourceFilter] = useState<'todos' | RadarOpportunitySource>('todos')
  const [fitFilter, setFitFilter] = useState<'todos' | FitLuaria>('todos')
  const [onlyOverdue, setOnlyOverdue] = useState(false)
  const [onlyNoNextAction, setOnlyNoNextAction] = useState(false)

  // Modais
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<RadarOpportunity | null>(null)

  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [analyzingOpportunity, setAnalyzingOpportunity] = useState<RadarOpportunity | null>(null)

  const [importModalOpen, setImportModalOpen] = useState(false)

  // Filtragem inteligente das oportunidades
  const filteredOpportunities = useMemo(() => {
    return (radarOpportunities || []).filter((opp) => {
      // Filtro da aba selecionada
      if (activeCategory === 'workana' && opp.source !== 'workana') return false
      if (activeCategory === 'prospeccao' && opp.source !== 'prospeccao_direta') return false

      // Busca textual
      const q = search.trim().toLowerCase()
      if (q) {
        const matchesTitle = opp.title.toLowerCase().includes(q)
        const matchesClient = opp.clientName.toLowerCase().includes(q)
        const matchesDesc = (opp.description || '').toLowerCase().includes(q)
        const matchesScope = (opp.requestedScope || '').toLowerCase().includes(q)
        const matchesSegment = (opp.companySegment || '').toLowerCase().includes(q)
        if (!matchesTitle && !matchesClient && !matchesDesc && !matchesScope && !matchesSegment) {
          return false
        }
      }

      // Filtros específicos
      if (statusFilter !== 'todos' && opp.status !== statusFilter) return false
      if (sourceFilter !== 'todos' && opp.source !== sourceFilter) return false
      if (fitFilter !== 'todos' && opp.fitLuaria !== fitFilter) return false

      // Checkbox Follow-ups vencidos
      if (onlyOverdue) {
        if (!opp.nextActionDueDate || opp.nextActionDueDate >= today) return false
      }

      // Checkbox Sem próxima ação
      if (onlyNoNextAction) {
        if (opp.nextAction) return false
      }

      return true
    })
  }, [
    radarOpportunities,
    activeCategory,
    search,
    statusFilter,
    sourceFilter,
    fitFilter,
    onlyOverdue,
    onlyNoNextAction,
    today,
  ])

  // Contadores rápidos para o topo
  const counts = useMemo(() => {
    const list = radarOpportunities || []
    return {
      total: list.length,
      workana: list.filter((o) => o.source === 'workana').length,
      prospeccao: list.filter((o) => o.source === 'prospeccao_direta').length,
      prioritarias: list.filter((o) => o.status === 'prioritaria' || o.priority === 'urgente').length,
      propostasEnviadas: list.filter((o) => o.status === 'proposta_enviada' || o.status === 'aguardando_resposta').length,
      ganhas: list.filter((o) => o.status === 'ganha').length,
    }
  }, [radarOpportunities])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Deseja remover a oportunidade "${title}" do Radar?`)) return
    const ok = await deleteRadarOpportunity(id)
    if (ok) {
      toast.success('Oportunidade removida do Radar.')
    }
  }

  const handleCopyProposal = (text?: string) => {
    if (!text || !text.trim()) {
      toast.error('Nenhuma minuta ou proposta preenchida nesta oportunidade.')
      return
    }
    navigator.clipboard.writeText(text)
    toast.success('Texto da proposta copiado para a área de transferência!')
  }

  const handleSendToCrm = async (opp: RadarOpportunity) => {
    await sendRadarOpportunityToCrm(opp)
  }

  const handleExportJson = () => {
    const content = exportRadarToJson(radarOpportunities || [])
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `radar-prospeccao-luaria-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Arquivo JSON do Radar exportado!')
  }

  const handleExportCsv = () => {
    const content = exportRadarToCsv(radarOpportunities || [])
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `radar-prospeccao-luaria-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Arquivo CSV do Radar exportado!')
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <PageHeader
        title="Radar de Prospecção Luaria.IA"
        description="Central comercial de identificação, priorização inteligente e acompanhamento de oportunidades de automação com inteligência artificial."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={() => setImportModalOpen(true)}
            >
              Importar
            </Button>
            <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                title="Exportar CSV"
              >
                CSV
              </button>
              <span className="text-line">|</span>
              <button
                type="button"
                onClick={handleExportJson}
                className="px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                title="Exportar JSON"
              >
                JSON
              </button>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setSelectedOpportunity(null)
                setOpportunityModalOpen(true)
              }}
            >
              Nova Oportunidade
            </Button>
          </div>
        }
      />

      {/* Navegação por Categorias do Radar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('todas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'todas'
                ? 'bg-accent text-accent-contrast shadow-sm font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-line'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Todas ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('workana')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'workana'
                ? 'bg-accent text-accent-contrast shadow-sm font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-line'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Workana & Freelance ({counts.workana})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('prospeccao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'prospeccao'
                ? 'bg-accent text-accent-contrast shadow-sm font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-line'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Prospecção Direta ({counts.prospeccao})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'dashboard'
                ? 'bg-accent text-accent-contrast shadow-sm font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-line'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Painel do Cofundador (Comercial)
          </button>
        </div>

        {/* Chaveador de Visualização (Tabela vs. Kanban) */}
        {activeCategory !== 'dashboard' && (
          <div className="flex items-center rounded-lg border border-line bg-surface p-1 gap-1">
            <button
              type="button"
              onClick={() => setLayoutMode('tabela')}
              className={`p-1.5 rounded flex items-center gap-1 text-xs font-medium transition-colors ${
                layoutMode === 'tabela'
                  ? 'bg-surface-muted text-foreground font-semibold shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('kanban')}
              className={`p-1.5 rounded flex items-center gap-1 text-xs font-medium transition-colors ${
                layoutMode === 'kanban'
                  ? 'bg-surface-muted text-foreground font-semibold shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <KanbanIcon className="h-3.5 w-3.5" />
              Kanban
            </button>
          </div>
        )}
      </div>

      {/* Renderização Condicional: Dashboard do Cofundador Comercial */}
      {activeCategory === 'dashboard' ? (
        <CofounderCommercialDashboard
          opportunities={radarOpportunities || []}
          onSelectOpportunity={(opp) => {
            setSelectedOpportunity(opp)
            setOpportunityModalOpen(true)
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar por título, empresa, segmento, dor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
              >
                <option value="todos">Status: Todos</option>
                {Object.entries(RADAR_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
              >
                <option value="todos">Origem: Todas</option>
                {Object.entries(RADAR_SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={fitFilter}
                onChange={(e) => setFitFilter(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
              >
                <option value="todos">Fit: Todos</option>
                {Object.entries(FIT_LUARIA_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOverdue}
                  onChange={(e) => setOnlyOverdue(e.target.checked)}
                  className="rounded border-line text-accent focus:ring-accent"
                />
                <span>Follow-ups Vencidos</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={onlyNoNextAction}
                  onChange={(e) => setOnlyNoNextAction(e.target.checked)}
                  className="rounded border-line text-accent focus:ring-accent"
                />
                <span>Sem Próxima Ação</span>
              </label>
            </div>
          </div>

          {/* VISUALIZAÇÃO EM KANBAN */}
          {layoutMode === 'kanban' ? (
            radarOpportunities.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-12 text-center flex flex-col items-center justify-center gap-2 shadow-card">
                <p className="text-sm font-semibold text-foreground">Nenhuma oportunidade no Radar de Prospecção</p>
                <p className="text-xs text-muted max-w-sm">
                  Todas as oportunidades foram excluídas. Você pode cadastrar uma nova oportunidade ou restaurar os exemplos iniciais da Luaria.IA.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 text-xs"
                  onClick={() => importRadarOpportunities(INITIAL_RADAR_OPPORTUNITIES)}
                >
                  Restaurar oportunidades de exemplo
                </Button>
              </div>
            ) : (
              <RadarKanbanBoard
                opportunities={filteredOpportunities}
                onSelectOpportunity={(opp) => {
                  setSelectedOpportunity(opp)
                  setOpportunityModalOpen(true)
                }}
                onAnalyzeAi={(opp) => {
                  setAnalyzingOpportunity(opp)
                  setAiModalOpen(true)
                }}
                onSendToCrm={handleSendToCrm}
                onChangeStatus={(id, newStatus) => updateRadarOpportunity(id, { status: newStatus })}
              />
            )
          ) : (
            /* VISUALIZAÇÃO EM TABELA */
            <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted/50 border-b border-line text-muted uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Score / Prioridade</th>
                      <th className="py-3 px-4">Oportunidade & Cliente</th>
                      <th className="py-3 px-4">Origem</th>
                      <th className="py-3 px-4">Adequação Luaria</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Preço Sugerido / Orçamento</th>
                      <th className="py-3 px-4">Próxima Ação</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredOpportunities.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {radarOpportunities.length === 0
                                ? 'Nenhuma oportunidade no Radar de Prospecção'
                                : 'Nenhuma oportunidade encontrada com os filtros selecionados'}
                            </p>
                            <p className="text-xs text-muted max-w-sm">
                              {radarOpportunities.length === 0
                                ? 'Todas as oportunidades foram excluídas. Você pode cadastrar uma nova oportunidade ou restaurar os exemplos iniciais.'
                                : 'Tente alterar os termos de busca ou remover os filtros aplicados.'}
                            </p>
                            {radarOpportunities.length === 0 && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="mt-2 text-xs"
                                onClick={() => importRadarOpportunities(INITIAL_RADAR_OPPORTUNITIES)}
                              >
                                Restaurar oportunidades de exemplo
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOpportunities.map((opp) => {
                        const valor = opp.suggestedPriceCents || opp.clientBudgetCents || 0
                        const isOverdue = opp.nextActionDueDate && opp.nextActionDueDate < today

                        return (
                          <tr
                            key={opp.id}
                            className="hover:bg-surface-muted/40 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedOpportunity(opp)
                              setOpportunityModalOpen(true)
                            }}
                          >
                            {/* Score & Prioridade */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`tabular text-xs font-bold px-2 py-0.5 rounded-full ${
                                    opp.priorityScore >= 70
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : opp.priorityScore >= 50
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-rose-500/20 text-rose-400'
                                  }`}
                                >
                                  {opp.priorityScore}
                                </span>
                                <span className="text-[11px] text-muted uppercase font-medium">
                                  {opp.priority}
                                </span>
                              </div>
                            </td>

                            {/* Oportunidade & Cliente */}
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-semibold text-foreground truncate">{opp.title}</div>
                              <div className="text-[11px] text-muted flex items-center gap-1.5 truncate mt-0.5">
                                <span>{opp.clientName}</span>
                                {opp.originalUrl && (
                                  <a
                                    href={opp.originalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-muted hover:text-accent"
                                    title="Abrir link original"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Origem */}
                            <td className="py-3 px-4 whitespace-nowrap text-muted">
                              <span className="bg-surface-muted px-2 py-0.5 rounded border border-line text-[11px]">
                                {RADAR_SOURCE_LABELS[opp.source]}
                              </span>
                            </td>

                            {/* Adequação Luaria */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                  opp.fitLuaria === 'alto'
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                    : opp.fitLuaria === 'fora_de_escopo'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                                }`}
                              >
                                {opp.fitLuaria === 'alto'
                                  ? 'IA & Automação'
                                  : opp.fitLuaria === 'fora_de_escopo'
                                  ? 'Fora de Escopo'
                                  : 'Média Aderência'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                                  RADAR_STATUS_COLORS[opp.status]?.bg || 'bg-surface-muted'
                                } ${RADAR_STATUS_COLORS[opp.status]?.text || 'text-muted'} ${
                                  RADAR_STATUS_COLORS[opp.status]?.border || 'border-line'
                                }`}
                              >
                                {RADAR_STATUS_LABELS[opp.status]}
                              </span>
                            </td>

                            {/* Preço / Orçamento */}
                            <td className="py-3 px-4 whitespace-nowrap tabular font-medium">
                              {valor > 0 ? (
                                <span className="text-foreground">{formatCurrency(valor)}</span>
                              ) : (
                                <span className="text-subtle">A combinar</span>
                              )}
                            </td>

                            {/* Próxima Ação */}
                            <td className="py-3 px-4 max-w-xs">
                              {opp.nextAction ? (
                                <div
                                  className={`truncate text-[11px] ${
                                    isOverdue ? 'text-rose-400 font-semibold' : 'text-muted'
                                  }`}
                                >
                                  {opp.nextAction}
                                  {opp.nextActionDueDate && (
                                    <span className="tabular ml-1 font-normal opacity-80">
                                      ({new Date(`${opp.nextActionDueDate}T12:00:00`).toLocaleDateString('pt-BR')})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-subtle italic text-[11px]">Sem próxima ação</span>
                              )}
                            </td>

                            {/* Ações */}
                            <td
                              className="py-3 px-4 text-right whitespace-nowrap space-x-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Bot}
                                title="Analisar com IA"
                                onClick={() => {
                                  setAnalyzingOpportunity(opp)
                                  setAiModalOpen(true)
                                }}
                              />

                              {opp.proposalText && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  icon={Copy}
                                  title="Copiar Proposta"
                                  onClick={() => handleCopyProposal(opp.proposalText)}
                                />
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Flame}
                                title="Enviar ao CRM"
                                onClick={() => handleSendToCrm(opp)}
                              />

                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Trash2}
                                title="Excluir"
                                onClick={() => handleDelete(opp.id, opp.title)}
                              />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação / Edição de Oportunidade */}
      <RadarOpportunityModal
        open={opportunityModalOpen}
        opportunity={selectedOpportunity}
        onClose={() => setOpportunityModalOpen(false)}
        onSave={async (data) => {
          if (selectedOpportunity) {
            await updateRadarOpportunity(selectedOpportunity.id, data)
          } else {
            await createRadarOpportunity(data)
          }
        }}
        onSendToCrm={handleSendToCrm}
      />

      {/* Modal do Assistente de IA Comercial */}
      <RadarAiAnalysisModal
        open={aiModalOpen}
        opportunity={analyzingOpportunity}
        onClose={() => setAiModalOpen(false)}
        onApplyProposalDraft={async (id, draft) => {
          await updateRadarOpportunity(id, { proposalText: draft })
        }}
        onSendToCrm={handleSendToCrm}
      />

      {/* Modal de Importação em Lote */}
      <RadarImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={async (items) => {
          await importRadarOpportunities(items)
        }}
      />
    </div>
  )
}
