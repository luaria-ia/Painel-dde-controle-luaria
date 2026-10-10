import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  FileText,
  Layers,
  MessageSquare,
  Play,
  Sparkles,
} from 'lucide-react'
import { AgentDetailModal } from '@/components/agents/AgentDetailModal'
import { AgentExecutionModal } from '@/components/agents/AgentExecutionModal'
import { DepartmentDetailModal } from '@/components/agents/DepartmentDetailModal'
import { DepartmentOfficeMap } from '@/components/agents/DepartmentOfficeMap'
import { OllamaSettingsModal } from '@/components/agents/OllamaSettingsModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import {
  agentApprovalRepository,
  agentExecutionRepository,
  agentRepository,
} from '@/repositories/agents'
import { checkOllamaHealth } from '@/services/ai/ollamaService'
import type {
  AgentApproval,
  AgentDepartment,
  AgentExecution,
  AIAgent,
  DepartmentSlug,
  OllamaHealthStatus,
} from '@/types/agents'
import { cn } from '@/lib/utils'

export function AgentsPage() {
  const toast = useToast()

  // Dados reais
  const [departments, setDepartments] = useState<AgentDepartment[]>([])
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [recentExecutions, setRecentExecutions] = useState<AgentExecution[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<AgentApproval[]>([])

  // Status do Ollama Local no Mac M2
  const [ollamaStatus, setOllamaStatus] = useState<OllamaHealthStatus | null>(null)

  // Seleção e Modais
  const [selectedDeptSlug, setSelectedDeptSlug] = useState<DepartmentSlug | 'todos'>('todos')
  const [inspectingAgent, setInspectingAgent] = useState<AIAgent | null>(null)
  const [executingAgent, setExecutingAgent] = useState<AIAgent | null>(null)
  const [focusedDepartment, setFocusedDepartment] = useState<AgentDepartment | null>(null)
  const [isOllamaModalOpen, setIsOllamaModalOpen] = useState(false)
  const [resolvingApprovalId, setResolvingApprovalId] = useState<string | null>(null)

  // Modais de "Ver todas"
  const [showActivitiesModal, setShowActivitiesModal] = useState(false)
  const [showTasksModal, setShowTasksModal] = useState(false)
  const [showApprovalsModal, setShowApprovalsModal] = useState(false)
  const [showDirectoryModal, setShowDirectoryModal] = useState(false)

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      const [deptsData, agentsData, execsData, approvalsData] = await Promise.all([
        agentRepository.listDepartments(),
        agentRepository.listAgents(),
        agentExecutionRepository.listRecent(30),
        agentApprovalRepository.listPending(),
      ])

      setDepartments(deptsData)
      setAgents(agentsData)
      setRecentExecutions(execsData)
      setPendingApprovals(approvalsData)
    } catch (err) {
      console.error('Erro ao carregar dados dos agentes:', err)
      toast.error('Erro ao carregar dados dos agentes.')
    }
  }, [toast])

  // Checar saúde do Ollama Local no Mac M2
  const checkHealth = useCallback(async () => {
    try {
      const health = await checkOllamaHealth()
      setOllamaStatus(health)
    } catch {
      setOllamaStatus({ available: false, endpoint: '', models: [], activeModel: '' })
    }
  }, [])

  useEffect(() => {
    loadData()
    checkHealth()
  }, [loadData, checkHealth])

  // Contagem de tarefas executando por departamento
  const runningCountByDepartment = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const exec of recentExecutions) {
      if (exec.status === 'executando') {
        counts[exec.departmentSlug] = (counts[exec.departmentSlug] || 0) + 1
      }
    }
    return counts
  }, [recentExecutions])

  // Resolver aprovação (Aprovar / Rejeitar)
  const handleResolveApproval = async (id: string, resolution: 'aprovado' | 'rejeitado') => {
    setResolvingApprovalId(id)
    try {
      const ok = await agentApprovalRepository.resolve(id, resolution)
      if (ok) {
        toast.success(
          resolution === 'aprovado'
            ? 'Ação aprovada e executada com sucesso!'
            : 'Ação rejeitada com sucesso.',
        )
        await loadData()
      } else {
        toast.error('Não foi possível atualizar a aprovação.')
      }
    } catch {
      toast.error('Erro ao processar aprovação.')
    } finally {
      setResolvingApprovalId(null)
    }
  }

  // Agente atualizado
  const handleAgentUpdated = (updated: AIAgent) => {
    setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  // Execução finalizada
  const handleExecutionCompleted = (execution: AgentExecution) => {
    setRecentExecutions((prev) => [execution, ...prev])
    loadData()
  }

  // Ao clicar em uma sala da maquete 3D
  const handleSelectDepartment = (slug: DepartmentSlug | 'todos') => {
    setSelectedDeptSlug(slug)
    if (slug !== 'todos') {
      const dept = departments.find((d) => d.slug === slug)
      if (dept) setFocusedDepartment(dept)
    }
  }

  return (
    <div className="space-y-4 pb-12">
      {/* 1. CABEÇALHO SUPERIOR (TÍTULO À ESQUERDA + 6 STAT PILLS À DIREITA) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Central de Agentes de IA
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Uma equipe de agentes trabalhando em cada setor da sua empresa.
          </p>
        </div>

        {/* 6 Stat Pills + Status Ollama */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Agentes totais */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#121526]/90 px-3.5 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#252848] text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none text-white">24</span>
              <span className="text-[11px] text-zinc-400 leading-none mt-1">Agentes totais</span>
            </div>
          </div>

          {/* 2. Em operação */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#121526]/90 px-3.5 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#142e2b] text-emerald-400">
              <span className="flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none text-white">22</span>
              <span className="text-[11px] text-zinc-400 leading-none mt-1">Em operação</span>
            </div>
          </div>

          {/* 3. Executando */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#121526]/90 px-3.5 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#152a45] text-sky-400">
              <Play className="h-3.5 w-3.5 fill-sky-400 text-sky-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none text-white">8</span>
              <span className="text-[11px] text-zinc-400 leading-none mt-1">Executando</span>
            </div>
          </div>

          {/* 4. Tarefas concluídas */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#121526]/90 px-3.5 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#142e2b] text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none text-white">136</span>
              <span className="text-[11px] text-zinc-400 leading-none mt-1">Tarefas concluídas</span>
            </div>
          </div>

          {/* 5. Aguardando aprovação */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#121526]/90 px-3.5 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#332615] text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none text-white">
                {pendingApprovals.length > 0 ? pendingApprovals.length : 12}
              </span>
              <span className="text-[11px] text-zinc-400 leading-none mt-1">Aguardando aprovação</span>
            </div>
          </div>

          {/* 6. Com erro */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#121526]/90 px-3.5 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#381a20] text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none text-white">1</span>
              <span className="text-[11px] text-zinc-400 leading-none mt-1">Com erro</span>
            </div>
          </div>

          {/* Status do Ollama Local no Mac M2 */}
          <button
            type="button"
            onClick={() => setIsOllamaModalOpen(true)}
            title="Configurar motor de inferência local Ollama Mac M2"
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition shadow-lg backdrop-blur-sm',
              ollamaStatus?.available
                ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400',
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                ollamaStatus?.available ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
              )}
            />
            <Cpu className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-mono">
              {ollamaStatus?.available ? 'Mac M2 Ativo' : 'Ollama Offline'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. ÁREA CENTRAL: SEDE 3D ISOMÉTRICA DA EMPRESA DIGITAL */}
      <DepartmentOfficeMap
        departments={departments}
        agents={agents}
        selectedSlug={selectedDeptSlug}
        onSelectDepartment={handleSelectDepartment}
        onSelectAgent={(agent) => setInspectingAgent(agent)}
        runningCountByDepartment={runningCountByDepartment}
      />

      {/* 3. OS 4 WIDGETS EM GRID DE 4 COLUNAS (IDÊNTICO À SEGUNDA FOTO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* CARD 1: Atividades em tempo real */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121526]/90 p-4 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 mb-3">
              <h3 className="text-xs font-semibold text-white">Atividades em tempo real</h3>
              <button
                type="button"
                onClick={() => setShowActivitiesModal(true)}
                className="text-[11px] text-zinc-400 hover:text-white transition"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Item 1 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Agente de Pesquisa</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      Encontrou 12 novas empresas no radar
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 whitespace-nowrap">há 2 min</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0 mt-1" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Agente de Conteúdo</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      Gerou 5 ideias de posts para aprovação
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 whitespace-nowrap">há 4 min</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 mt-1" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Agente de CRM</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      Atualizou 8 oportunidades
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 whitespace-nowrap">há 7 min</span>
              </div>

              {/* Item 4 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-1" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Agente Financeiro</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      Gerou relatório de fluxo de caixa
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 whitespace-nowrap">há 12 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Tarefas em andamento */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121526]/90 p-4 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 mb-3">
              <h3 className="text-xs font-semibold text-white">Tarefas em andamento</h3>
              <button
                type="button"
                onClick={() => setShowTasksModal(true)}
                className="text-[11px] text-zinc-400 hover:text-white transition"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Tarefa 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 shrink-0 border border-indigo-500/30">
                      <Sparkles className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-white truncate">
                      Analisar 20 empresas do setor de moda
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pl-7">
                  <span>Agente de Pesquisa</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-[#1e2338] overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: '70%' }} />
                    </div>
                    <span className="font-mono text-[10px]">70%</span>
                  </div>
                </div>
              </div>

              {/* Tarefa 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 shrink-0 border border-pink-500/30">
                      <Sparkles className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-white truncate">
                      Criar roteiro de 3 vídeos para semana
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pl-7">
                  <span>Agente de Conteúdo</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-[#1e2338] overflow-hidden">
                      <div className="h-full rounded-full bg-pink-500" style={{ width: '40%' }} />
                    </div>
                    <span className="font-mono text-[10px]">40%</span>
                  </div>
                </div>
              </div>

              {/* Tarefa 3 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 shrink-0 border border-cyan-500/30">
                      <Sparkles className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-white truncate">
                      Preparar proposta para cliente potencial
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pl-7">
                  <span>Agente de Propostas</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-[#1e2338] overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: '20%' }} />
                    </div>
                    <span className="font-mono text-[10px]">20%</span>
                  </div>
                </div>
              </div>

              {/* Tarefa 4 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                      <Sparkles className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-white truncate">
                      Organizar tarefas da equipe
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pl-7">
                  <span>Agente de Operações</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-[#1e2338] overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '60%' }} />
                    </div>
                    <span className="font-mono text-[10px]">60%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Aguardando sua aprovação */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121526]/90 p-4 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 mb-3">
              <h3 className="text-xs font-semibold text-white">Aguardando sua aprovação</h3>
              <button
                type="button"
                onClick={() => setShowApprovalsModal(true)}
                className="text-[11px] text-zinc-400 hover:text-white transition"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Item 1: Instagram */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shrink-0 shadow-sm">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      Publicar post no Instagram
                    </p>
                    <p className="text-[11px] text-zinc-400">Agente de Conteúdo</p>
                    <span className="text-[10px] text-zinc-500">há 15 min</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => handleResolveApproval('appr-1', 'aprovado')}
                    disabled={resolvingApprovalId === 'appr-1'}
                    className="rounded bg-[#198754] hover:bg-[#157347] px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveApproval('appr-1', 'rejeitado')}
                    disabled={resolvingApprovalId === 'appr-1'}
                    className="rounded bg-[#7a1c22] hover:bg-[#8b232a] px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>

              {/* Item 2: Proposta Comercial */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#202538] border border-white/10 text-zinc-300 shrink-0 shadow-sm">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      Enviar proposta comercial
                    </p>
                    <p className="text-[11px] text-zinc-400">Agente de Propostas</p>
                    <span className="text-[10px] text-zinc-500">há 32 min</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => handleResolveApproval('appr-2', 'aprovado')}
                    disabled={resolvingApprovalId === 'appr-2'}
                    className="rounded bg-[#198754] hover:bg-[#157347] px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveApproval('appr-2', 'rejeitado')}
                    disabled={resolvingApprovalId === 'appr-2'}
                    className="rounded bg-[#7a1c22] hover:bg-[#8b232a] px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>

              {/* Item 3: Resposta cliente */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#142645] border border-sky-500/20 text-sky-400 shrink-0 shadow-sm">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      Resposta para cliente
                    </p>
                    <p className="text-[11px] text-zinc-400">Agente de Atendimento</p>
                    <span className="text-[10px] text-zinc-500">há 1 h</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => handleResolveApproval('appr-3', 'aprovado')}
                    disabled={resolvingApprovalId === 'appr-3'}
                    className="rounded bg-[#198754] hover:bg-[#157347] px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveApproval('appr-3', 'rejeitado')}
                    disabled={resolvingApprovalId === 'appr-3'}
                    className="rounded bg-[#7a1c22] hover:bg-[#8b232a] px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Desempenho dos agentes */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121526]/90 p-4 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 mb-2.5">
              <h3 className="text-xs font-semibold text-white">Desempenho dos agentes</h3>
              <div className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                <span>Últimos 7 dias</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              {/* Conteúdo */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">Conteúdo</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-pink-500" style={{ width: '98%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  98%
                </span>
              </div>

              {/* Pesquisa */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">Pesquisa</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: '92%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  92%
                </span>
              </div>

              {/* CRM */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">CRM</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: '87%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  87%
                </span>
              </div>

              {/* Financeiro */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">Financeiro</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '85%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  85%
                </span>
              </div>

              {/* Operações */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">Operações</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: '90%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  90%
                </span>
              </div>

              {/* Projetos */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">Projetos</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: '88%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  88%
                </span>
              </div>

              {/* Tecnologia */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">Tecnologia</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: '83%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  83%
                </span>
              </div>

              {/* Estudos */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
                  <span className="text-zinc-300 font-medium text-[11px]">Estudos</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-[#1e2338] overflow-hidden">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: '91%' }} />
                </div>
                <span className="font-mono text-[11px] text-zinc-400 w-7 text-right shrink-0">
                  91%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Diretório Geral para Acessar Todos os 27 Agentes */}
      <div className="flex items-center justify-between pt-2 px-1">
        <span className="text-xs text-zinc-500">
          Clique em qualquer setor da empresa acima para gerenciar seus agentes.
        </span>
        <button
          type="button"
          onClick={() => setShowDirectoryModal(true)}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
        >
          <Layers className="h-3.5 w-3.5" />
          Ver diretório completo ({agents.length} agentes)
        </button>
      </div>

      {/* MODAL DO DEPARTAMENTO FOCADO AO CLICAR EM UMA SALA */}
      <DepartmentDetailModal
        open={!!focusedDepartment}
        onClose={() => setFocusedDepartment(null)}
        department={focusedDepartment}
        agents={agents}
        onExecuteAgent={(ag) => {
          setFocusedDepartment(null)
          setExecutingAgent(ag)
        }}
        onInspectAgent={(ag) => {
          setFocusedDepartment(null)
          setInspectingAgent(ag)
        }}
      />

      {/* MODAL DE EXECUÇÃO DE AGENTE (COM OLLAMA LOCAL MAC M2) */}
      <AgentExecutionModal
        open={!!executingAgent}
        onClose={() => setExecutingAgent(null)}
        agent={executingAgent}
        onExecutionCompleted={handleExecutionCompleted}
      />

      {/* MODAL DE CONFIGURAÇÃO DO AGENTE */}
      <AgentDetailModal
        open={!!inspectingAgent}
        onClose={() => setInspectingAgent(null)}
        agent={inspectingAgent}
        department={departments.find((d) => d.slug === inspectingAgent?.departmentSlug)}
        onExecute={(a) => {
          setInspectingAgent(null)
          setExecutingAgent(a)
        }}
        onUpdated={handleAgentUpdated}
      />

      {/* MODAL DE CONFIGURAÇÃO DO MOTOR OLLAMA NO MAC M2 */}
      <OllamaSettingsModal
        open={isOllamaModalOpen}
        onClose={() => setIsOllamaModalOpen(false)}
        onConfigChanged={checkHealth}
      />

      {/* MODAL: VER TODAS AS ATIVIDADES */}
      <Modal
        open={showActivitiesModal}
        onClose={() => setShowActivitiesModal(false)}
        title="Histórico de Atividades dos Agentes"
        size="lg"
      >
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted">
            Registro de todas as ações executadas pelos agentes de IA na plataforma.
          </p>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {recentExecutions.map((exec) => (
              <div
                key={exec.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{exec.agentName}</span>
                    <Badge tone="accent">{exec.departmentSlug}</Badge>
                    <span className="text-[10px] text-muted font-mono">
                      {Math.round(exec.durationMs / 1000)}s · {exec.tokensCount} tok
                    </span>
                  </div>
                  <p className="text-foreground/90 font-medium">{exec.taskTitle}</p>
                  <p className="text-muted line-clamp-2">{exec.output}</p>
                </div>
                <Badge
                  tone={
                    exec.status === 'concluido'
                      ? 'success'
                      : exec.status === 'aguardando_aprovacao'
                        ? 'warning'
                        : 'accent'
                  }
                >
                  {exec.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL: VER TODAS AS TAREFAS */}
      <Modal
        open={showTasksModal}
        onClose={() => setShowTasksModal(false)}
        title="Tarefas e Filas de Trabalho"
        size="md"
      >
        <div className="space-y-3 pt-2 text-xs">
          <p className="text-muted">
            Visão consolidada de todas as tarefas ativas distribuídas entre os agentes.
          </p>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            <div className="rounded-lg border border-line p-3 space-y-1">
              <span className="font-semibold text-foreground">Analisar 20 empresas do setor de moda</span>
              <p className="text-muted">Agente de Pesquisa • Progresso 70%</p>
            </div>
            <div className="rounded-lg border border-line p-3 space-y-1">
              <span className="font-semibold text-foreground">Criar roteiro de 3 vídeos para semana</span>
              <p className="text-muted">Agente de Conteúdo • Progresso 40%</p>
            </div>
            <div className="rounded-lg border border-line p-3 space-y-1">
              <span className="font-semibold text-foreground">Preparar proposta para cliente potencial</span>
              <p className="text-muted">Agente de Propostas • Progresso 20%</p>
            </div>
            <div className="rounded-lg border border-line p-3 space-y-1">
              <span className="font-semibold text-foreground">Organizar tarefas da equipe</span>
              <p className="text-muted">Agente de Operações • Progresso 60%</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: VER TODAS AS APROVAÇÕES */}
      <Modal
        open={showApprovalsModal}
        onClose={() => setShowApprovalsModal(false)}
        title="Fila Completa de Aprovações de IA"
        size="lg"
      >
        <div className="space-y-3 pt-2 text-xs">
          <p className="text-muted">
            Ações sensíveis preparadas pelos agentes que necessitam de autorização humana prévia.
          </p>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="rounded-xl border border-line bg-surface p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{appr.title}</span>
                  <Badge tone="warning">{appr.actionType}</Badge>
                </div>
                <p className="text-muted text-[11px] font-mono bg-surface-muted/50 p-2 rounded border border-line/40">
                  {appr.contentToApprove}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResolveApproval(appr.id, 'rejeitado')}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleResolveApproval(appr.id, 'aprovado')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Aprovar Ação
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL: DIRETÓRIO COMPLETO DOS 27 AGENTES */}
      <Modal
        open={showDirectoryModal}
        onClose={() => setShowDirectoryModal(false)}
        title={`Diretório Geral de Agentes (${agents.length})`}
        size="xl"
      >
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted">
            Consulte todos os agentes cadastrados em cada departamento da sua empresa digital.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-1">
            {agents.map((ag) => {
              const dept = departments.find((d) => d.slug === ag.departmentSlug)
              return (
                <div
                  key={ag.id}
                  className="rounded-xl border border-line bg-surface p-3 space-y-2 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-foreground truncate">{ag.name}</span>
                      <Badge tone={ag.status === 'ativo' ? 'success' : 'neutral'}>
                        {ag.status === 'ativo' ? 'Ativo' : ag.status}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted font-mono">{ag.role}</span>
                    <p className="text-muted text-[11px] line-clamp-2 italic">
                      "{ag.primaryGoal}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-line/40 pt-2">
                    <span className="text-[10px] font-mono" style={{ color: dept?.color }}>
                      {dept?.name}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setShowDirectoryModal(false)
                        setExecutingAgent(ag)
                      }}
                      className="text-[11px] h-6 px-2"
                    >
                      Executar
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AgentsPage
