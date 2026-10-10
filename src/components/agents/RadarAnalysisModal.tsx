import { useState } from 'react'
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { runRadarProspectPipeline } from '@/services/ai/agentWorkflows'
import { useData } from '@/store/useData'
import type { ProspectCompany } from '@/types'

interface RadarAnalysisModalProps {
  prospect: ProspectCompany | null
  open: boolean
  onClose: () => void
}

export function RadarAnalysisModal({ prospect, open, onClose }: RadarAnalysisModalProps) {
  const toast = useToast()
  const { convertProspectToCrmLead } = useData()

  const [loading, setLoading] = useState(false)
  const [pipelineResult, setPipelineResult] = useState<{
    analiseOutput: string
    propostaOutput: string
    approvalId?: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'analise' | 'proposta'>('analise')
  const [convertingToCrm, setConvertingToCrm] = useState(false)

  if (!prospect) return null

  const handleRunPipeline = async () => {
    setLoading(true)
    try {
      const result = await runRadarProspectPipeline(prospect)
      setPipelineResult(result)
      toast.success('Análise concluída e proposta enviada para aprovação!')
    } catch (err) {
      toast.error('Erro ao executar análise com agentes: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendToCrm = async () => {
    setConvertingToCrm(true)
    try {
      const ok = await convertProspectToCrmLead(prospect)
      if (ok) {
        toast.success(`"${prospect.name}" convertida em oportunidade no CRM!`)
      }
    } catch {
      toast.error('Não foi possível converter em oportunidade CRM.')
    } finally {
      setConvertingToCrm(false)
    }
  }

  const handleCopy = (text: string, title: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${title} copiada para a área de transferência!`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-400" />
          <span>Análise com Agentes — {prospect.name}</span>
        </div>
      }
      description="Pipeline de inteligência comercial: diagnóstico de presença e minuta de proposta gerada por agentes de IA."
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-xs text-muted">
            {pipelineResult?.approvalId ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Registrado na Fila de Aprovação
              </span>
            ) : (
              'Pipeline de 2 agentes especializados'
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            {pipelineResult && (
              <Button
                variant="primary"
                icon={TrendingUp}
                loading={convertingToCrm}
                onClick={handleSendToCrm}
              >
                Enviar ao CRM
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info Card do Prospect */}
        <div className="rounded-xl border border-line bg-surface-muted/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Empresa</span>
              <h4 className="text-base font-semibold text-foreground">{prospect.name}</h4>
            </div>
            <Badge tone="info">{prospect.segment}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted pt-2 border-t border-line/60">
            <div>
              <span className="text-subtle">Local:</span> {prospect.location || 'Não informado'}
            </div>
            <div>
              <span className="text-subtle">Canais:</span>{' '}
              {[prospect.channels?.instagram, prospect.channels?.whatsapp].filter(Boolean).join(' · ') || 'Nenhum'}
            </div>
          </div>
        </div>

        {/* Status do Pipeline / Ação Inicial */}
        {!pipelineResult && !loading && (
          <div className="rounded-xl border border-dashed border-line bg-surface p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-foreground">Disparar Pipeline Comercial de IA</h5>
              <p className="text-xs text-muted max-w-md mx-auto">
                O <strong>Agente de Análise de Empresas</strong> avaliará os pontos fortes e fragilidades.
                Em seguida, o <strong>Agente de Propostas Comerciais</strong> formulará uma abordagem de vendas que será adicionada à fila de aprovação.
              </p>
            </div>
            <Button
              variant="primary"
              icon={Sparkles}
              onClick={handleRunPipeline}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Executar Análise com Agentes
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-line bg-surface p-8 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Processando inteligência de mercado...</p>
              <p className="text-xs text-muted">
                Executando agentes no motor local (Ollama Mac M2 ou fallback determinístico inteligente).
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {pipelineResult && (
          <div className="space-y-3">
            {/* Abas */}
            <div className="flex gap-2 border-b border-line pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('analise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'analise'
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                Diagnóstico Comercial
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('proposta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'proposta'
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Minuta de Proposta & Abordagem
              </button>
            </div>

            {/* Conteúdo da Aba */}
            {activeTab === 'analise' ? (
              <div className="relative rounded-xl border border-line bg-surface-muted/30 p-4">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Copy}
                  onClick={() => handleCopy(pipelineResult.analiseOutput, 'Análise')}
                  className="absolute top-3 right-3 text-xs"
                >
                  Copiar
                </Button>
                <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans text-xs text-foreground/90 leading-relaxed pr-16">
                  {pipelineResult.analiseOutput}
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl border border-line bg-surface-muted/30 p-4">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Copy}
                  onClick={() => handleCopy(pipelineResult.propostaOutput, 'Proposta')}
                  className="absolute top-3 right-3 text-xs"
                >
                  Copiar
                </Button>
                <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans text-xs text-foreground/90 leading-relaxed pr-16">
                  {pipelineResult.propostaOutput}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
