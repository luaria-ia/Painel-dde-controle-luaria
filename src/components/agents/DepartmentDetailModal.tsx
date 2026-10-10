import {
  Building2,
  Code2,
  FolderKanban,
  GraduationCap,
  Headphones,
  Megaphone,
  Play,
  Settings,
  ShieldCheck,
  Target,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { AgentDepartment, AIAgent } from '@/types/agents'

interface Props {
  open: boolean
  onClose: () => void
  department: AgentDepartment | null
  agents: AIAgent[]
  onExecuteAgent: (agent: AIAgent) => void
  onInspectAgent: (agent: AIAgent) => void
}

const DEPARTMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  diretoria: ShieldCheck,
  marketing: Megaphone,
  comercial: Target,
  financeiro: Wallet,
  atendimento: Headphones,
  estudos: GraduationCap,
  projetos: FolderKanban,
  tecnologia: Code2,
}

export function DepartmentDetailModal({
  open,
  onClose,
  department,
  agents,
  onExecuteAgent,
  onInspectAgent,
}: Props) {
  if (!department) return null

  const deptAgents = agents.filter((a) => a.departmentSlug === department.slug)
  const Icon = DEPARTMENT_ICONS[department.slug] || Building2

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
            style={{ backgroundColor: `${department.color}25`, color: department.color }}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{department.name}</h3>
            <p className="text-xs text-muted font-normal">{department.description}</p>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between rounded-xl border border-line bg-surface-muted/40 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: department.color }}
            />
            <span className="font-semibold text-foreground">
              {deptAgents.length} Agentes Alocados no Setor
            </span>
          </div>
          <span className="font-mono text-muted text-[11px]">
            Inferência Local no Mac M2 (Ollama / Llama 3.2)
          </span>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {deptAgents.map((agent) => (
            <div
              key={agent.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-sm transition hover:border-line-strong"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {agent.name}
                  </h4>
                  <Badge tone={agent.status === 'ativo' ? 'success' : 'neutral'}>
                    {agent.status === 'ativo' ? 'No posto' : agent.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted line-clamp-1">{agent.role}</p>
                <p className="text-[11px] text-muted/80 line-clamp-2 italic">
                  "{agent.primaryGoal}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Settings}
                  onClick={() => {
                    onClose()
                    onInspectAgent(agent)
                  }}
                  className="text-xs"
                >
                  Configurar
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Play}
                  onClick={() => {
                    onClose()
                    onExecuteAgent(agent)
                  }}
                  className="text-xs"
                >
                  Executar Tarefa
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs text-muted">
            Cada agente executa prompts e tarefas específicas deste departamento.
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
