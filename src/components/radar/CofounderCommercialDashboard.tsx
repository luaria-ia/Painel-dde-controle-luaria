import { useMemo } from 'react'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  PieChart,
  Send,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/format'
import { RADAR_SOURCE_LABELS } from '@/lib/radarScore'
import type { RadarOpportunity, RadarOpportunitySource } from '@/types/radar'

interface CofounderCommercialDashboardProps {
  opportunities: RadarOpportunity[]
  onSelectOpportunity?: (opportunity: RadarOpportunity) => void
}

export function CofounderCommercialDashboard({
  opportunities,
  onSelectOpportunity,
}: CofounderCommercialDashboardProps) {
  const today = new Date().toISOString().slice(0, 10)

  // Métricas calculadas
  const metrics = useMemo(() => {
    const total = opportunities.length
    const novas = opportunities.filter((o) => o.status === 'nova').length
    const prioritarias = opportunities.filter((o) => o.status === 'prioritaria' || o.priority === 'urgente').length
    const empresasProspectar = opportunities.filter((o) => o.source === 'prospeccao_direta' && o.status !== 'descartada').length
    const propostasPreparar = opportunities.filter((o) => o.status === 'proposta_em_preparacao').length
    const propostasEnviadas = opportunities.filter((o) => o.status === 'proposta_enviada' || o.status === 'aguardando_resposta').length
    const aguardandoResposta = opportunities.filter((o) => o.status === 'aguardando_resposta').length
    const ganhas = opportunities.filter((o) => o.status === 'ganha').length

    // Follow-ups vencidos
    const followUpsVencidos = opportunities.filter(
      (o) => o.nextActionDueDate && o.nextActionDueDate < today && o.status !== 'ganha' && o.status !== 'descartada' && o.status !== 'perdida',
    )

    // Oportunidades sem próxima ação
    const semProximaAcao = opportunities.filter(
      (o) => !o.nextAction && o.status !== 'ganha' && o.status !== 'descartada' && o.status !== 'perdida',
    )

    // Valores do Pipeline (Diferenciação clara)
    let valorPotencialTotalCents = 0
    let valorPropostasEnviadasCents = 0
    let valorContratosFechadosCents = 0

    for (const o of opportunities) {
      const valor = o.suggestedPriceCents || o.clientBudgetCents || 0
      if (o.status !== 'descartada' && o.status !== 'perdida') {
        valorPotencialTotalCents += valor
      }
      if (o.status === 'proposta_enviada' || o.status === 'em_negociacao' || o.status === 'aguardando_resposta') {
        valorPropostasEnviadasCents += valor
      }
      if (o.status === 'ganha') {
        valorContratosFechadosCents += valor
      }
    }

    // Taxa de conversão por fonte
    const sourcesCount: Record<RadarOpportunitySource, { total: number; ganhas: number }> = {
      workana: { total: 0, ganhas: 0 },
      prospeccao_direta: { total: 0, ganhas: 0 },
      pesquisa: { total: 0, ganhas: 0 },
      indicacao: { total: 0, ganhas: 0 },
      instagram: { total: 0, ganhas: 0 },
      comunidade: { total: 0, ganhas: 0 },
      site: { total: 0, ganhas: 0 },
      outro: { total: 0, ganhas: 0 },
    }

    for (const o of opportunities) {
      if (sourcesCount[o.source]) {
        sourcesCount[o.source].total += 1
        if (o.status === 'ganha') {
          sourcesCount[o.source].ganhas += 1
        }
      }
    }

    // Lista de próximas ações ordenada por urgência e prazo
    const actionList = opportunities
      .filter((o) => o.nextAction && o.status !== 'ganha' && o.status !== 'descartada' && o.status !== 'perdida')
      .sort((a, b) => {
        // Ordena primeiro por data de vencimento
        const da = a.nextActionDueDate || '9999-99-99'
        const db = b.nextActionDueDate || '9999-99-99'
        return da.localeCompare(db)
      })

    return {
      total,
      novas,
      prioritarias,
      empresasProspectar,
      propostasPreparar,
      propostasEnviadas,
      aguardandoResposta,
      ganhas,
      followUpsVencidos,
      semProximaAcao,
      valorPotencialTotalCents,
      valorPropostasEnviadasCents,
      valorContratosFechadosCents,
      sourcesCount,
      actionList,
    }
  }, [opportunities, today])

  return (
    <div className="space-y-6">
      {/* 1. Header de Alerta para o Cofundador */}
      {(metrics.followUpsVencidos.length > 0 || metrics.semProximaAcao.length > 0) && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Atenção Comercial Necessária Hoje</h4>
              <p className="text-xs text-muted">
                {metrics.followUpsVencidos.length > 0 && (
                  <span className="text-rose-400 font-semibold mr-3">
                    {metrics.followUpsVencidos.length} follow-up(s) com prazo vencido
                  </span>
                )}
                {metrics.semProximaAcao.length > 0 && (
                  <span className="text-amber-400">
                    {metrics.semProximaAcao.length} oportunidade(s) ativa(s) sem próxima ação definida
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. KPIs Comerciais Rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-line bg-surface p-3.5 shadow-card space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Novas & Em Análise
          </div>
          <div className="text-2xl font-bold tabular text-foreground">{metrics.novas}</div>
          <div className="text-[11px] text-subtle">{metrics.prioritarias} com prioridade alta</div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-3.5 shadow-card space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            Prospecção Direta
          </div>
          <div className="text-2xl font-bold tabular text-foreground">{metrics.empresasProspectar}</div>
          <div className="text-[11px] text-subtle">Empresas mapeadas</div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-3.5 shadow-card space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            A Preparar
          </div>
          <div className="text-2xl font-bold tabular text-foreground">{metrics.propostasPreparar}</div>
          <div className="text-[11px] text-subtle">Minutas pendentes</div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-3.5 shadow-card space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Send className="h-3.5 w-3.5 text-blue-400" />
            Propostas Enviadas
          </div>
          <div className="text-2xl font-bold tabular text-foreground">{metrics.propostasEnviadas}</div>
          <div className="text-[11px] text-subtle">{metrics.aguardandoResposta} aguardando resposta</div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-3.5 shadow-card space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Oportunidades Ganhas
          </div>
          <div className="text-2xl font-bold tabular text-emerald-400">{metrics.ganhas}</div>
          <div className="text-[11px] text-subtle">Contratos convertidos</div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-3.5 shadow-card space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            Follow-ups Vencidos
          </div>
          <div className="text-2xl font-bold tabular text-rose-400">{metrics.followUpsVencidos.length}</div>
          <div className="text-[11px] text-subtle">Ação requerida hoje</div>
        </div>
      </div>

      {/* 3. Pipeline Financeiro Estruturado (Diferenciação clara exigida na regra 10) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-line bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Pipeline Potencial Total</span>
            <Badge tone="info">Estimativa</Badge>
          </div>
          <div className="text-2xl font-extrabold text-foreground tabular">
            {formatCurrency(metrics.valorPotencialTotalCents)}
          </div>
          <p className="text-xs text-subtle">
            Soma de todas as oportunidades ativas identificadas no Radar (Workana + Prospecção).
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Propostas Enviadas / Na Mesa</span>
            <Badge tone="info">Em Negociação</Badge>
          </div>
          <div className="text-2xl font-extrabold text-blue-400 tabular">
            {formatCurrency(metrics.valorPropostasEnviadasCents)}
          </div>
          <p className="text-xs text-subtle">
            Valor em negociação com proposta enviada aguardando fechamento.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Contratos Fechados (Convertidos)</span>
            <Badge tone="success">Ganhos</Badge>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tabular">
            {formatCurrency(metrics.valorContratosFechadosCents)}
          </div>
          <p className="text-xs text-subtle">
            Valor de contratos efetivamente conquistados a partir do Radar.
          </p>
        </div>
      </div>

      {/* 4. Lista de Próximas Ações & Taxa de Conversão por Fonte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Ações (2 Colunas) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Fila de Próximas Ações Comerciais
            </h4>
            <span className="text-xs text-muted">Ordenadas por prazo e urgência</span>
          </div>

          <div className="rounded-2xl border border-line bg-surface divide-y divide-line overflow-hidden shadow-card">
            {metrics.actionList.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                Nenhuma próxima ação pendente no momento.
              </div>
            ) : (
              metrics.actionList.slice(0, 7).map((opp) => {
                const isOverdue = opp.nextActionDueDate && opp.nextActionDueDate < today
                const isDueToday = opp.nextActionDueDate === today

                return (
                  <div
                    key={opp.id}
                    onClick={() => onSelectOpportunity?.(opp)}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-muted/60 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground truncate">{opp.clientName}</span>
                        <Badge tone={opp.priority === 'urgente' ? 'danger' : 'neutral'}>
                          {opp.priority}
                        </Badge>
                        <span className="text-[11px] text-muted truncate">({RADAR_SOURCE_LABELS[opp.source]})</span>
                      </div>
                      <p className="text-xs text-muted truncate">{opp.nextAction}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-xs font-semibold tabular ${
                            isOverdue
                              ? 'text-rose-400'
                              : isDueToday
                              ? 'text-amber-400'
                              : 'text-muted'
                          }`}
                        >
                          {opp.nextActionDueDate
                            ? new Date(`${opp.nextActionDueDate}T12:00:00`).toLocaleDateString('pt-BR')
                            : 'Sem prazo'}
                        </div>
                        <div className="text-[10px] text-subtle">
                          {isOverdue ? 'Vencido!' : isDueToday ? 'Hoje' : 'Agendado'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Taxa de Conversão por Fonte (1 Coluna) */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <PieChart className="h-4 w-4 text-indigo-400" />
            Performance por Origem
          </h4>

          <div className="rounded-2xl border border-line bg-surface p-4 space-y-3.5 shadow-card text-xs">
            {Object.entries(metrics.sourcesCount)
              .filter(([_, data]) => data.total > 0)
              .map(([key, data]) => {
                const perc = data.total > 0 ? Math.round((data.ganhas / data.total) * 100) : 0
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-muted">
                      <span className="font-medium text-foreground">
                        {RADAR_SOURCE_LABELS[key as RadarOpportunitySource]}
                      </span>
                      <span className="tabular">
                        {data.ganhas} ganha(s) de {data.total} ({perc}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${Math.max(5, perc)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
