import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Terminal,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import {
  checkOllamaHealth,
  getOllamaConfig,
  saveOllamaConfig,
} from '@/services/ai/ollamaService'
import type { OllamaHealthStatus } from '@/types/agents'

interface Props {
  open: boolean
  onClose: () => void
  onConfigChanged?: () => void
}

export function OllamaSettingsModal({ open, onClose, onConfigChanged }: Props) {
  const toast = useToast()
  const [config, setConfig] = useState(getOllamaConfig())
  const [endpoint, setEndpoint] = useState(config.endpoint)
  const [activeModel, setActiveModel] = useState(config.activeModel)
  const [health, setHealth] = useState<OllamaHealthStatus | null>(null)
  const [testing, setTesting] = useState(false)

  const runTest = async (urlToTest?: string) => {
    setTesting(true)
    try {
      const res = await checkOllamaHealth(urlToTest || endpoint)
      setHealth(res)
      if (res.available) {
        toast.success(`Ollama detectado e operacional! (${res.models.length} modelos locais)`)
        if (res.models.length && !res.models.includes(activeModel)) {
          setActiveModel(res.models[0])
        }
      } else {
        toast.error('Ollama não respondeu no endereço especificado.')
      }
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    if (open) {
      const current = getOllamaConfig()
      setConfig(current)
      setEndpoint(current.endpoint)
      setActiveModel(current.activeModel)
      void runTest(current.endpoint)
    }
  }, [open])

  const handleSave = () => {
    saveOllamaConfig({
      endpoint,
      activeModel,
    })
    toast.success('Configurações do Ollama salvas com sucesso!')
    if (onConfigChanged) onConfigChanged()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configuração de IA Local • Ollama (Mac M2)"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            onClick={() => void runTest()}
            loading={testing}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Testar Conexão
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleSave}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner de Status de Conexão */}
        <div
          className={`rounded-xl border p-4 flex items-start gap-3 transition-colors ${
            health?.available
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}
        >
          {health?.available ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                {health?.available ? 'Ollama Conectado Localmente' : 'Ollama Offline ou Não Iniciado'}
              </span>
              <Badge tone={health?.available ? 'success' : 'warning'}>
                {health?.available ? `${health.latencyMs}ms` : 'Desconectado'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.available
                ? `Inference engine pronta no seu Mac. ${health.models.length} modelos instalados localmente.`
                : 'O serviço local não está respondendo em http://localhost:11434. Siga as instruções abaixo para ativar.'}
            </p>
          </div>
        </div>

        {/* Inputs de Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Field label="Endpoint Local">
            {(id) => (
              <Input
                id={id}
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
              />
            )}
          </Field>

          <Field label="Modelo Padrão em Uso">
            {(id) =>
              health?.models && health.models.length > 0 ? (
                <Select
                  id={id}
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  options={health.models.map((m) => ({ value: m, label: m }))}
                />
              ) : (
                <Input
                  id={id}
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  placeholder="llama3.2:latest"
                />
              )
            }
          </Field>
        </div>

        {/* Guia Prático para Instalar / Iniciar no Mac M2 */}
        <div className="rounded-xl border border-border bg-[#0a0d16] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Terminal className="h-4 w-4 text-primary" />
              Como Rodar Grátis no seu MacBook (Apple Silicon M2 / 16GB)
            </div>
            <a
              href="https://ollama.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              ollama.com <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                1
              </span>
              <p>
                Abra o <strong>Terminal</strong> do Mac e instale com o Homebrew (ou baixe o instalador no site oficial):
              </p>
            </div>
            <pre className="rounded-lg bg-black/50 p-2 font-mono text-[11px] text-emerald-400 border border-white/5">
              brew install ollama
            </pre>

            <div className="flex items-start gap-2 pt-1">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                2
              </span>
              <p>
                Inicie o modelo recomendado para o Mac M2 (ótima velocidade e 0 custo de API):
              </p>
            </div>
            <pre className="rounded-lg bg-black/50 p-2 font-mono text-[11px] text-emerald-400 border border-white/5">
              ollama run llama3.2
            </pre>

            <div className="flex items-start gap-2 pt-1">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                3
              </span>
              <p>
                Após abrir o Ollama no Mac, clique em <strong>Testar Conexão</strong> acima. Os 24 agentes começarão a responder com inferência real no seu hardware!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
