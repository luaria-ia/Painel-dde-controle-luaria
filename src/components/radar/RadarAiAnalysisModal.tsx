import { useState, useEffect } from 'react'
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Copy,
  DollarSign,
  FileText,
  HelpCircle,
  Loader2,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { analyzeRadarOpportunityWithAI } from '@/services/ai/agentWorkflows'
import type { RadarOpportunity } from '@/types/radar'

interface RadarAiAnalysisModalProps {
  open: boolean
  opportunity: RadarOpportunity | null
  onClose: () => void
  onApplyProposalDraft?: (opportunityId: string, proposalDraft: string) => Promise<unknown>
  onSendToCrm?: (opportunity: RadarOpportunity) => Promise<unknown>
}

export function RadarAiAnalysisModal({
  open,
  opportunity,
  onClose,
  onApplyProposalDraft,
  onSendToCrm,
}: RadarAiAnalysisModalProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzeRadarOpportunityWithAI>> | null>(null)
  const [sendingCrm, setSendingCrm] = useState(false)
  const [applyingDraft, setApplyingDraft] = useState(false)

  useEffect(() => {
    if (open && opportunity) {
      handleRunAnalysis()
    } else {
      setAnalysis(null)
    }
  }, [open, opportunity?.id])

  if (!opportunity) return null

  const handleRunAnalysis = async () => {
    setLoading(true)
    try {
      const res = await analyzeRadarOpportunityWithAI(opportunity)
      setAnalysis(res)
      toast.success('Análise de inteligência comercial gerada com sucesso!')
    } catch (err) {
      toast.error('Erro ao gerar análise: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado para a área de transferência!`)
  }

  const handleApplyDraft = async () => {
    if (!analysis?.proposalDraft || !onApplyProposalDraft) return
    setApplyingDraft(true)
    try {
      await onApplyProposalDraft(opportunity.id, analysis.proposalDraft)
      toast.success('Rascunho de proposta salvo na oportunidade!')
    } finally {
      setApplyingDraft(false)
    }
  }

  const handleSendCrm = async () => {
    if (!onSendToCrm) return
    setSendingCrm(true)
    try {
      await onSendToCrm(opportunity)
    } finally {
      setSendingCrm(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-400" />
          <span className="font-semibold text-foreground">
            Assistente Comercial IA — {opportunity.title}
          </span>
        </div>
      }
      description="Auditoria automatizada em 10 critérios: diagnóstico de dor, aderência Luaria.IA, perguntas de qualificação, minuta de proposta e precificação."
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-xs text-muted flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>IA treinada com o posicionamento oficial da Luaria.IA</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            {analysis && (
              <>
                <Button
                  variant="secondary"
                  icon={FileText}
                  loading={applyingDraft}
                  onClick={handleApplyDraft}
                >
                  Salvar Minuta na Oportunidade
                </Button>
                {onSendToCrm && (
                  <Button
                    variant="primary"
                    icon={TrendingUp}
                    loading={sendingCrm}
                    onClick={handleSendCrm}
                  >
                    Enviar ao CRM
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Card do Resumo da Oportunidade */}
        <div className="rounded-xl border border-line bg-surface-muted/40 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider font-semibold">Cliente / Origem</div>
            <div className="text-sm font-semibold text-foreground">{opportunity.clientName} ({opportunity.source})</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted">Orçamento Estimado</div>
            <div className="text-sm font-semibold text-emerald-400">
              {opportunity.clientBudgetCents ? `R$ ${(opportunity.clientBudgetCents / 100).toFixed(2)}` : 'A combinar'}
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />
            <h4 className="text-sm font-semibold text-foreground">Avaliando oportunidade com Agentes de IA...</h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Cruzando o pedido com o posicionamento da Luaria.IA, analisando viabilidade técnica e calculando a melhor estratégia de abordagem.
            </p>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-4 text-xs">
            {/* 1. Diagnóstico do Problema & 2. Aderência Luaria.IA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface p-3.5 space-y-1.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  Problema Real do Cliente
                </span>
                <p className="text-muted leading-relaxed">{analysis.clientProblem}</p>
              </div>

              <div className="rounded-xl border border-line bg-surface p-3.5 space-y-1.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-indigo-400" />
                  Aderência à Luaria.IA
                </span>
                <p className="text-muted leading-relaxed">{analysis.luariaFitReason}</p>
              </div>
            </div>

            {/* 3. Perguntas de Qualificação & 4. Informações Ausentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                  Perguntas de Qualificação Comercial
                </span>
                <ul className="space-y-1.5 text-muted pl-4 list-disc">
                  {analysis.qualificationQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  Informações Ausentes / Riscos
                </span>
                <ul className="space-y-1.5 text-muted pl-4 list-disc">
                  {analysis.missingInformation.map((info, i) => (
                    <li key={i}>{info}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Mensagem de Abordagem Personalizada */}
            <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  Mensagem de Abordagem Sugerida (WhatsApp / Direct / Proposta)
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Copy}
                  onClick={() => handleCopyText(analysis.customApproach, 'Abordagem')}
                >
                  Copiar Abordagem
                </Button>
              </div>
              <div className="rounded-lg bg-surface-muted/60 p-3 text-foreground leading-relaxed font-mono text-[11.5px] border border-line/60">
                {analysis.customApproach}
              </div>
            </div>

            {/* 6. Minuta de Proposta Comercial */}
            <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-violet-400" />
                  Rascunho de Proposta Comercial
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Copy}
                  onClick={() => handleCopyText(analysis.proposalDraft, 'Minuta de proposta')}
                >
                  Copiar Minuta
                </Button>
              </div>
              <pre className="rounded-lg bg-surface-muted/60 p-3 text-foreground leading-relaxed whitespace-pre-wrap font-sans text-xs border border-line/60">
                {analysis.proposalDraft}
              </pre>
            </div>

            {/* 7. Faixa de Preço & 8. Próxima Ação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface p-3.5 space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Faixa de Preço Fundamentada
                </span>
                <div className="text-base font-bold text-emerald-400 tabular">{analysis.suggestedPriceRange}</div>
                <p className="text-[11px] text-muted">Estimativa fundamentada no escopo enxuto da Fase 1 e tempo de entrega.</p>
              </div>

              <div className="rounded-xl border border-line bg-surface p-3.5 space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                  Próxima Ação Comercial Recomendada
                </span>
                <p className="text-muted leading-relaxed font-medium">{analysis.recommendedNextStep}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
