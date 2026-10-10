import { useEffect, useState } from 'react'
import {
  Clock,
  Play,
  Shield,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { agentRepository } from '@/repositories/agents'
import type { AgentDepartment, AgentOperationalStatus, AIAgent } from '@/types/agents'

interface Props {
  open: boolean
  onClose: () => void
  agent: AIAgent | null
  department?: AgentDepartment
  onExecute: (agent: AIAgent) => void
  onUpdated: (agent: AIAgent) => void
}

export function AgentDetailModal({
  open,
  onClose,
  agent,
  department,
  onExecute,
  onUpdated,
}: Props) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<AgentOperationalStatus>('ativo')
  const [primaryGoal, setPrimaryGoal] = useState('')
  const [systemInstructions, setSystemInstructions] = useState('')
  const [model, setModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'config' | 'permissoes'>('config')

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setRole(agent.role)
      setStatus(agent.status)
      setPrimaryGoal(agent.primaryGoal)
      setSystemInstructions(agent.systemInstructions)
      setModel(agent.model)
    }
  }, [agent])

  if (!agent) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await agentRepository.updateAgent(agent.id, {
        name,
        role,
        status,
        primaryGoal,
        systemInstructions,
        model,
      })
      if (updated) {
        toast.success(`Agente "${updated.name}" atualizado com sucesso.`)
        onUpdated(updated)
        onClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar agente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={agent.name}
      size="lg"
      onSubmit={() => void handleSave()}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              onClose()
              onExecute(agent)
            }}
            disabled={status === 'desabilitado'}
            className="gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Executar Agora
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleSave()} loading={saving}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cabeçalho do Agente */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-base">{agent.name}</span>
              <Badge tone="accent">{department?.name || agent.departmentSlug}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{agent.description}</p>
          </div>

          <div className="text-right text-xs text-muted-foreground shrink-0">
            <div>
              Execuções: <strong className="text-foreground">{agent.executionCount}</strong>
            </div>
            <div>
              Taxa de Sucesso: <strong className="text-emerald-500">{agent.successRate}%</strong>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('config')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              tab === 'config'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Configuração e Prompt
          </button>
          <button
            type="button"
            onClick={() => setTab('permissoes')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              tab === 'permissoes'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Ferramentas e Permissões
          </button>
        </div>

        {tab === 'config' ? (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Nome do Agente" required>
                {(id) => (
                  <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />
                )}
              </Field>

              <Field label="Cargo / Função" required>
                {(id) => (
                  <Input id={id} value={role} onChange={(e) => setRole(e.target.value)} />
                )}
              </Field>

              <Field label="Estado Operacional">
                {(id) => (
                  <Select
                    id={id}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AgentOperationalStatus)}
                    options={[
                      { value: 'ativo', label: '🟢 Ativo' },
                      { value: 'pausado', label: '🟡 Pausado' },
                      { value: 'desabilitado', label: '⚪ Desabilitado' },
                    ]}
                  />
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Modelo de IA (Ollama Local / Cloud)">
                {(id) => (
                  <Input
                    id={id}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="llama3.2:latest"
                  />
                )}
              </Field>

              <Field label="Objetivo Principal">
                {(id) => (
                  <Input
                    id={id}
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                  />
                )}
              </Field>
            </div>

            <Field
              label="Instruções de Comportamento (System Prompt)"
              hint="Diretrizes específicas de tom de voz, regras de formatação e limites de atuação do agente."
            >
              {(id) => (
                <Textarea
                  id={id}
                  rows={4}
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                />
              )}
            </Field>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Ferramentas e acessos autorizados para este agente dentro do ecossistema Business OS:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agent.authorizedTools.map((tool) => (
                <div
                  key={tool}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/70 bg-muted/30 text-xs text-foreground"
                >
                  <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-mono">{tool}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground flex gap-2.5 mt-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Aprovação Humana Obrigatória:</strong> Todas as ações sensíveis (como publicação direta, envio de mensagens e alterações em propostas) serão enviadas para a fila de aprovação antes de terem efeito prático.
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
