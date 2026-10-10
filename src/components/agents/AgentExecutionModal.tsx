import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Copy,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { runAgentTask } from '@/services/ai/agentWorkflows'
import type { AIAgent, AgentExecution } from '@/types/agents'

interface Props {
  open: boolean
  onClose: () => void
  agent: AIAgent | null
  onExecutionCompleted?: (execution: AgentExecution) => void
}

export function AgentExecutionModal({
  open,
  onClose,
  agent,
  onExecutionCompleted,
}: Props) {
  const toast = useToast()
  const [taskTitle, setTaskTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<AgentExecution | null>(null)

  useEffect(() => {
    if (agent) {
      setTaskTitle('')
      setPrompt('')
      setRequiresApproval(false)
      setExecuting(false)
      setResult(null)
    }
  }, [agent])

  if (!agent) return null

  const handleRun = async () => {
    if (!taskTitle.trim() || !prompt.trim()) {
      toast.error('Informe o título da tarefa e as instruções para o agente.')
      return
    }

    setExecuting(true)
    setResult(null)
    try {
      const exec = await runAgentTask({
        agent,
        taskTitle: taskTitle.trim(),
        prompt: prompt.trim(),
        requiresApproval,
      })
      setResult(exec)
      toast.success(
        requiresApproval
          ? 'Tarefa concluída e enviada para sua fila de aprovação!'
          : 'Tarefa concluída com sucesso pelo agente!',
      )
      if (onExecutionCompleted) onExecutionCompleted(exec)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha na execução do agente.')
    } finally {
      setExecuting(false)
    }
  }

  const handleCopy = () => {
    if (!result?.output) return
    navigator.clipboard.writeText(result.output)
    toast.success('Resultado copiado para a área de transferência.')
  }

  const handleReset = () => {
    setResult(null)
    setTaskTitle('')
    setPrompt('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Executar Tarefa • ${agent.name}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {result ? (
            <Button type="button" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Nova Execução
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Execução processada localmente com modelo {agent.model}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button type="button" onClick={onClose} disabled={executing}>
              Fechar
            </Button>
            {!result && (
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleRun()}
                loading={executing}
                className="gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Iniciar Agente
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Identificação do Agente */}
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-3 text-xs">
          <div>
            <span className="font-semibold text-foreground">{agent.name}</span>
            <span className="text-muted-foreground ml-1.5">• {agent.role}</span>
          </div>
          <Badge tone="accent">{agent.model}</Badge>
        </div>

        {!result ? (
          <div className="space-y-3.5">
            <Field label="Título da Tarefa" required>
              {(id) => (
                <Input
                  id={id}
                  placeholder="Ex.: Análise de concorrência ou criação de roteiro"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                />
              )}
            </Field>

            <Field label="Instruções / Entrada de Dados para o Agente" required>
              {(id) => (
                <Textarea
                  id={id}
                  rows={4}
                  placeholder="Descreva o que o agente deve analisar ou produzir..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              )}
            </Field>

            <div className="rounded-lg border border-border/70 p-3 bg-muted/15 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground">Exigir Aprovação Humana</div>
                <div className="text-[11px] text-muted-foreground">
                  Se ativado, o resultado final será enviado para a fila de aprovação antes de qualquer ação externa.
                </div>
              </div>
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-foreground">
                  Resultado Produzido ({result.durationMs}ms • {result.tokensCount} tokens)
                </span>
              </div>
              <Button size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                <Copy className="h-3 w-3" />
                Copiar
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-[#0d101a] p-4 text-xs font-sans whitespace-pre-wrap text-zinc-200 leading-relaxed max-h-80 overflow-y-auto">
              {result.output}
            </div>

            {result.requiresApproval && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  Esta tarefa foi adicionada ao painel <strong>Aguardando sua aprovação</strong> para que você decida os próximos passos.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
