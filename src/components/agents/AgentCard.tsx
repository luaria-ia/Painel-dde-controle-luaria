import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle,
  CheckSquare,
  Clock,
  Code2,
  Compass,
  FileCheck2,
  Filter,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Layers,
  MessageCircle,
  PenTool,
  PieChart,
  Play,
  Receipt,
  Search,
  Settings,
  ShieldAlert,
  Sliders,
  Terminal,
  TrendingUp,
  Users2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { AgentDepartment, AIAgent } from '@/types/agents'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Layers,
  BarChart3,
  Search,
  CalendarDays,
  PenTool,
  CheckCircle,
  Filter,
  Sliders,
  Building2,
  FileCheck2,
  Clock,
  Receipt,
  TrendingUp,
  PieChart,
  Calendar,
  CheckSquare,
  ShieldAlert,
  MessageCircle,
  Users2,
  HeartHandshake,
  GraduationCap,
  BookOpen,
  Brain: BookOpen,
  Code2,
  Terminal,
  FlaskConical,
}

interface Props {
  agent: AIAgent
  department?: AgentDepartment
  onExecute: (agent: AIAgent) => void
  onInspect: (agent: AIAgent) => void
}

export function AgentCard({ agent, department, onExecute, onInspect }: Props) {
  const IconComponent = ICON_MAP[agent.avatarIcon] || Compass
  const color = department?.color || '#6366f1'

  const statusConfig = {
    ativo: { label: 'Ativo', tone: 'success' as const, dotClass: 'bg-emerald-400' },
    executando: { label: 'Executando', tone: 'accent' as const, dotClass: 'bg-sky-400 animate-pulse' },
    pausado: { label: 'Pausado', tone: 'warning' as const, dotClass: 'bg-amber-400' },
    desabilitado: { label: 'Inativo', tone: 'neutral' as const, dotClass: 'bg-zinc-500' },
  }[agent.status]

  return (
    <Card className="group relative flex flex-col justify-between p-4 transition-all duration-200 hover:border-border hover:shadow-lg">
      <div className="space-y-3">
        {/* Topo do Card com Ícone, Status e Nome */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-sm"
              style={{
                backgroundColor: `${color}18`,
                color,
              }}
            >
              <IconComponent className="h-5 w-5" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {agent.name}
              </h4>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>

          <Badge tone={statusConfig.tone} className="flex items-center gap-1.5 py-0.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotClass)} />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Descrição e Objetivo */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {agent.description}
        </p>

        {/* Modelo e Ferramentas */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-muted-foreground border border-border/40">
            {agent.model}
          </span>
          <span className="text-[11px] text-muted-foreground">
            • {agent.authorizedTools.length} {agent.authorizedTools.length === 1 ? 'ferramenta' : 'ferramentas'}
          </span>
        </div>
      </div>

      {/* Estatísticas e Ações */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{agent.executionCount}</span> execuções •{' '}
          <span className="text-emerald-500 font-medium">{agent.successRate}%</span> sucesso
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            className="p-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => onInspect(agent)}
            title="Configurações e histórico do agente"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="text-xs px-2.5 h-8 gap-1.5"
            disabled={agent.status === 'desabilitado'}
            onClick={() => onExecute(agent)}
          >
            <Play className="h-3 w-3 fill-current" />
            Executar
          </Button>
        </div>
      </div>
    </Card>
  )
}
