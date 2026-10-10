import {
  Bot,
  TrendingUp,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { RADAR_SOURCE_LABELS, RADAR_STATUS_LABELS } from '@/lib/radarScore'
import type { RadarOpportunity, RadarOpportunityStatus } from '@/types/radar'

interface RadarKanbanBoardProps {
  opportunities: RadarOpportunity[]
  onSelectOpportunity: (opportunity: RadarOpportunity) => void
  onAnalyzeAi: (opportunity: RadarOpportunity) => void
  onSendToCrm: (opportunity: RadarOpportunity) => void
  onChangeStatus: (opportunityId: string, newStatus: RadarOpportunityStatus) => void
}

const KANBAN_COLUMNS: { id: string; statuses: RadarOpportunityStatus[]; label: string; tone: string }[] = [
  { id: 'novas', statuses: ['nova'], label: 'Novas', tone: 'text-sky-400' },
  { id: 'analise', statuses: ['em_analise'], label: 'Em Análise', tone: 'text-indigo-400' },
  { id: 'prioritarias', statuses: ['prioritaria'], label: 'Prioritárias', tone: 'text-amber-400' },
  { id: 'aprovadas', statuses: ['aprovada'], label: 'Aprovadas p/ Abordagem', tone: 'text-teal-400' },
  { id: 'preparacao', statuses: ['proposta_em_preparacao'], label: 'Proposta em Preparação', tone: 'text-violet-400' },
  { id: 'enviadas', statuses: ['proposta_enviada'], label: 'Proposta Enviada', tone: 'text-blue-400' },
  { id: 'negociacao', statuses: ['em_negociacao', 'aguardando_resposta'], label: 'Em Negociação', tone: 'text-purple-400' },
  { id: 'ganhas', statuses: ['ganha'], label: 'Ganhas (Contratos)', tone: 'text-emerald-400' },
  { id: 'descarte', statuses: ['perdida', 'descartada'], label: 'Perdidas / Descartadas', tone: 'text-zinc-400' },
]

export function RadarKanbanBoard({
  opportunities,
  onSelectOpportunity,
  onAnalyzeAi,
  onSendToCrm,
  onChangeStatus,
}: RadarKanbanBoardProps) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {KANBAN_COLUMNS.map((col) => {
        const colItems = opportunities.filter((o) => col.statuses.includes(o.status))

        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 rounded-2xl border border-line bg-surface flex flex-col max-h-[calc(100vh-220px)] shadow-card"
          >
            {/* Header da Coluna */}
            <div className="p-3.5 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.tone.replace('text', 'bg')}`} />
                <h4 className="text-xs font-semibold text-foreground">{col.label}</h4>
              </div>
              <span className="text-xs font-bold tabular text-muted bg-surface-muted px-2 py-0.5 rounded-full border border-line">
                {colItems.length}
              </span>
            </div>

            {/* Lista de Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted border border-dashed border-line/60 rounded-xl">
                  Nenhuma oportunidade nesta etapa
                </div>
              ) : (
                colItems.map((opp) => {
                  const valor = opp.suggestedPriceCents || opp.clientBudgetCents || 0
                  const isOverdue = opp.nextActionDueDate && opp.nextActionDueDate < today

                  return (
                    <div
                      key={opp.id}
                      className="rounded-xl border border-line bg-surface p-3.5 shadow-sm hover:border-accent/50 transition-all space-y-2.5 cursor-pointer"
                      onClick={() => onSelectOpportunity(opp)}
                    >
                      {/* Top: Score e Origem */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted bg-surface-muted px-2 py-0.5 rounded border border-line">
                          {RADAR_SOURCE_LABELS[opp.source]}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`tabular text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              opp.priorityScore >= 70
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : opp.priorityScore >= 50
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            Score {opp.priorityScore}
                          </span>
                        </div>
                      </div>

                      {/* Título & Cliente */}
                      <div>
                        <h5 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                          {opp.title}
                        </h5>
                        <p className="text-[11px] text-muted truncate mt-0.5">{opp.clientName}</p>
                      </div>

                      {/* Badge Fit Luaria */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            opp.fitLuaria === 'alto'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                              : opp.fitLuaria === 'fora_de_escopo'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                          }`}
                        >
                          {opp.fitLuaria === 'alto' ? 'IA & Automação' : opp.fitLuaria === 'fora_de_escopo' ? 'Fora de Escopo' : 'Integrações'}
                        </span>
                        {valor > 0 && (
                          <span className="text-[11px] font-bold text-foreground tabular ml-auto">
                            {formatCurrency(valor)}
                          </span>
                        )}
                      </div>

                      {/* Próxima Ação */}
                      {opp.nextAction && (
                        <div
                          className={`text-[11px] rounded p-1.5 border flex items-center justify-between gap-1.5 ${
                            isOverdue
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-surface-muted border-line text-muted'
                          }`}
                        >
                          <span className="truncate">{opp.nextAction}</span>
                          {opp.nextActionDueDate && (
                            <span className="shrink-0 tabular font-semibold text-[10px]">
                              {new Date(`${opp.nextActionDueDate}T12:00:00`).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Ações Rápidas no Card */}
                      <div className="flex items-center justify-between pt-1 border-t border-line/60 gap-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onAnalyzeAi(opp)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                          >
                            <Bot className="h-3 w-3" /> IA
                          </button>

                          <button
                            type="button"
                            onClick={() => onSendToCrm(opp)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                          >
                            <TrendingUp className="h-3 w-3" /> CRM
                          </button>
                        </div>

                        <select
                          value={opp.status}
                          onChange={(e) => onChangeStatus(opp.id, e.target.value as RadarOpportunityStatus)}
                          className="h-6 text-[10px] bg-surface border border-line rounded px-1 text-muted"
                          title="Mudar status"
                        >
                          {Object.entries(RADAR_STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
