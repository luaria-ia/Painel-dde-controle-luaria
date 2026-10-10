import { useState } from 'react'
import { Info, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import type { CreateInput } from '@/types'
import type { RadarOpportunity } from '@/types/radar'

interface RadarImportModalProps {
  open: boolean
  onClose: () => void
  onImport: (items: CreateInput<RadarOpportunity>[]) => Promise<unknown>
}

export function RadarImportModal({ open, onClose, onImport }: RadarImportModalProps) {
  const toast = useToast()
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    if (!rawText.trim()) {
      toast.error('Cole o conteúdo JSON das oportunidades a importar.')
      return
    }

    setLoading(true)
    try {
      let parsed: any
      try {
        parsed = JSON.parse(rawText.trim())
      } catch (err) {
        throw new Error('Formato JSON inválido. Verifique a sintaxe.')
      }

      const itemsArray = Array.isArray(parsed) ? parsed : [parsed]
      if (itemsArray.length === 0) {
        throw new Error('Nenhum item válido encontrado no JSON informado.')
      }

      // Validação básica e saneamento dos campos
      const today = new Date().toISOString().slice(0, 10)
      const validItems: CreateInput<RadarOpportunity>[] = itemsArray.map((item) => ({
        title: item.title || item.titulo || 'Oportunidade Importada',
        clientName: item.clientName || item.cliente || item.empresa || item.title || 'Cliente',
        source: item.source || item.origem || 'workana',
        originalUrl: item.originalUrl || item.url || item.link || undefined,
        identifiedDate: item.identifiedDate || item.data || today,
        description: item.description || item.descricao || '',
        clientProfile: item.clientProfile || item.perfilCliente || undefined,
        requestedScope: item.requestedScope || item.escopo || undefined,
        identifiedNeeds: item.identifiedNeeds || item.necessidades || undefined,
        fitLuaria: item.fitLuaria || 'alto',
        technicalDifficulty: item.technicalDifficulty || 'baixa',
        estimatedEffort: item.estimatedEffort || 'baixo',
        deadlineRequested: item.deadlineRequested || item.prazo || undefined,
        clientBudgetCents: item.clientBudgetCents || (item.orcamento ? Math.round(Number(item.orcamento) * 100) : null),
        suggestedPriceCents: item.suggestedPriceCents || (item.precoSugerido ? Math.round(Number(item.precoSugerido) * 100) : null),
        minimumPriceCents: item.minimumPriceCents || (item.precoMinimo ? Math.round(Number(item.precoMinimo) * 100) : null),
        priority: item.priority || 'media',
        priorityScore: item.priorityScore ?? 70,
        decisionRationale: item.decisionRationale || item.justificativa || 'Oportunidade importada para o Radar Luaria.IA.',
        status: item.status || 'nova',
        proposalText: item.proposalText || item.proposta || undefined,
        proposalSentDate: item.proposalSentDate || null,
        nextAction: item.nextAction || item.proximaAcao || undefined,
        nextActionDueDate: item.nextActionDueDate || null,
        responsibleName: item.responsibleName || 'Cofundador Comercial',
        history: [],
      }))

      await onImport(validItems)
      setRawText('')
      onClose()
    } catch (err) {
      toast.error('Erro na importação: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-accent" />
          <span>Importar Oportunidades em Lote</span>
        </div>
      }
      description="Cole abaixo o JSON com as propostas da Workana ou lista de oportunidades para carregar no Radar."
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted">Suporta lista JSON de propostas</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" loading={loading} onClick={handleImport}>
              Importar Oportunidades
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface-muted/40 p-3.5 space-y-1.5 text-xs text-muted">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Info className="h-3.5 w-3.5 text-accent" />
            Exemplo de Formato Aceito:
          </div>
          <pre className="p-2 rounded bg-surface border border-line/60 font-mono text-[11px] overflow-x-auto text-muted">
{`[
  {
    "title": "Automação WhatsApp e Agente de IA",
    "clientName": "Clínica Exemplo",
    "source": "workana",
    "originalUrl": "https://workana.com/job/...",
    "description": "Agente para responder pacientes...",
    "requestedScope": "WhatsApp API + IA",
    "clientBudgetCents": 300000,
    "suggestedPriceCents": 350000,
    "fitLuaria": "alto",
    "status": "nova"
  }
]`}
          </pre>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Conteúdo JSON para Importação</label>
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder="Cole aqui o array JSON de oportunidades..."
          />
        </div>
      </div>
    </Modal>
  )
}
