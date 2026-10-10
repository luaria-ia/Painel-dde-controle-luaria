import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { AgentDepartment, AIAgent, DepartmentSlug } from '@/types/agents'
import { cn } from '@/lib/utils'

interface Props {
  departments: AgentDepartment[]
  agents?: AIAgent[]
  selectedSlug: DepartmentSlug | 'todos'
  onSelectDepartment: (slug: DepartmentSlug | 'todos') => void
  onSelectAgent?: (agent: AIAgent) => void
  runningCountByDepartment: Record<string, number>
}

interface RoomHotspot {
  slug: DepartmentSlug
  name: string
  subtitle: string
  color: string
  top: string
  left: string
  width: string
  height: string
}

const ROOM_HOTSPOTS: RoomHotspot[] = [
  {
    slug: 'diretoria',
    name: 'Diretoria e Operações',
    subtitle: 'Sala Executiva & Estratégia',
    color: '#6366f1',
    top: '1%',
    left: '7.5%',
    width: '23%',
    height: '35%',
  },
  {
    slug: 'marketing',
    name: 'Marketing e Conteúdo',
    subtitle: 'Estúdio de Criação & Mídia',
    color: '#ec4899',
    top: '1%',
    left: '31.5%',
    width: '23%',
    height: '35%',
  },
  {
    slug: 'comercial',
    name: 'Comercial e Vendas',
    subtitle: 'Mesa de Vendas & Negócios',
    color: '#10b981',
    top: '1%',
    left: '55.5%',
    width: '22%',
    height: '35%',
  },
  {
    slug: 'financeiro',
    name: 'Financeiro',
    subtitle: 'Controladoria & Tesouraria',
    color: '#f59e0b',
    top: '1%',
    left: '78.5%',
    width: '21%',
    height: '35%',
  },
  {
    slug: 'atendimento',
    name: 'Atendimento e CRM',
    subtitle: 'Central de Sucesso & CRM',
    color: '#06b6d4',
    top: '36%',
    left: '6.5%',
    width: '28%',
    height: '34%',
  },
  {
    slug: 'projetos',
    name: 'Projetos e Produtividade',
    subtitle: 'Squad de Projetos & Prazos',
    color: '#3b82f6',
    top: '36%',
    left: '66%',
    width: '28%',
    height: '34%',
  },
  {
    slug: 'estudos',
    name: 'Estudos e Conhecimento',
    subtitle: 'Laboratório de Conhecimento',
    color: '#eab308',
    top: '64%',
    left: '5%',
    width: '34%',
    height: '35%',
  },
  {
    slug: 'tecnologia',
    name: 'Tecnologia e Desenvolvimento',
    subtitle: 'Hub de Engenharia & Dev',
    color: '#8b5cf6',
    top: '64%',
    left: '62%',
    width: '34%',
    height: '35%',
  },
]

interface RobotStation {
  id: string
  departmentSlug: DepartmentSlug
  left: string
  top: string
  color: string
  delay: string
  activeLabel?: string
}

const ROBOT_STATIONS: RobotStation[] = [
  // Diretoria
  { id: 'dir-1', departmentSlug: 'diretoria', left: '15.2%', top: '22.5%', color: '#818cf8', delay: '0s', activeLabel: 'Planejamento' },
  { id: 'dir-2', departmentSlug: 'diretoria', left: '18.5%', top: '19.5%', color: '#818cf8', delay: '0.9s' },
  { id: 'dir-3', departmentSlug: 'diretoria', left: '26.4%', top: '20.5%', color: '#818cf8', delay: '1.6s' },

  // Marketing
  { id: 'mkt-1', departmentSlug: 'marketing', left: '37.2%', top: '20.8%', color: '#f472b6', delay: '0.4s' },
  { id: 'mkt-2', departmentSlug: 'marketing', left: '43.8%', top: '21.5%', color: '#f472b6', delay: '1.2s', activeLabel: 'Criando post' },
  { id: 'mkt-3', departmentSlug: 'marketing', left: '46.5%', top: '19.8%', color: '#f472b6', delay: '1.9s' },

  // Comercial
  { id: 'com-1', departmentSlug: 'comercial', left: '60.2%', top: '21.5%', color: '#34d399', delay: '0.5s', activeLabel: 'Radar ativo' },
  { id: 'com-2', departmentSlug: 'comercial', left: '63.5%', top: '23.5%', color: '#34d399', delay: '1.3s' },
  { id: 'com-3', departmentSlug: 'comercial', left: '66.8%', top: '19.5%', color: '#34d399', delay: '0.8s' },
  { id: 'com-4', departmentSlug: 'comercial', left: '71.2%', top: '21.5%', color: '#34d399', delay: '1.7s' },

  // Financeiro
  { id: 'fin-1', departmentSlug: 'financeiro', left: '81.2%', top: '24.5%', color: '#fbbf24', delay: '0.3s' },
  { id: 'fin-2', departmentSlug: 'financeiro', left: '84.6%', top: '25.8%', color: '#fbbf24', delay: '1.4s', activeLabel: 'Fluxo de caixa' },
  { id: 'fin-3', departmentSlug: 'financeiro', left: '92.1%', top: '26.5%', color: '#fbbf24', delay: '0.7s' },

  // Atendimento / CRM
  { id: 'crm-1', departmentSlug: 'atendimento', left: '13.2%', top: '53.5%', color: '#22d3ee', delay: '0.4s', activeLabel: 'Atendimento' },
  { id: 'crm-2', departmentSlug: 'atendimento', left: '21.5%', top: '53.8%', color: '#22d3ee', delay: '1.1s' },
  { id: 'crm-3', departmentSlug: 'atendimento', left: '30.1%', top: '49.5%', color: '#22d3ee', delay: '1.8s' },

  // Projetos
  { id: 'prj-1', departmentSlug: 'projetos', left: '70.2%', top: '52.5%', color: '#60a5fa', delay: '0.2s' },
  { id: 'prj-2', departmentSlug: 'projetos', left: '73.5%', top: '50.5%', color: '#60a5fa', delay: '1.0s', activeLabel: 'Sprint board' },
  { id: 'prj-3', departmentSlug: 'projetos', left: '76.8%', top: '52.8%', color: '#60a5fa', delay: '1.5s' },
  { id: 'prj-4', departmentSlug: 'projetos', left: '84.5%', top: '51.5%', color: '#60a5fa', delay: '0.8s' },

  // Estudos
  { id: 'est-1', departmentSlug: 'estudos', left: '7.1%', top: '82.5%', color: '#facc15', delay: '0.3s' },
  { id: 'est-2', departmentSlug: 'estudos', left: '15.4%', top: '80.5%', color: '#facc15', delay: '1.2s' },
  { id: 'est-3', departmentSlug: 'estudos', left: '22.0%', top: '80.5%', color: '#facc15', delay: '0.7s', activeLabel: 'Pesquisando' },
  { id: 'est-4', departmentSlug: 'estudos', left: '29.1%', top: '81.5%', color: '#facc15', delay: '1.5s' },

  // Tecnologia
  { id: 'tec-1', departmentSlug: 'tecnologia', left: '80.2%', top: '82.5%', color: '#c084fc', delay: '0.2s', activeLabel: 'Compilando' },
  { id: 'tec-2', departmentSlug: 'tecnologia', left: '86.3%', top: '80.5%', color: '#c084fc', delay: '1.4s' },
]

export function DepartmentOfficeMap({
  departments,
  agents = [],
  selectedSlug,
  onSelectDepartment,
  onSelectAgent,
  runningCountByDepartment,
}: Props) {
  const [hoveredRoom, setHoveredRoom] = useState<DepartmentSlug | null>(null)
  const [animated, setAnimated] = useState(true)

  const getDept = (slug: DepartmentSlug) => departments.find((d) => d.slug === slug)
  const getDeptAgents = (slug: DepartmentSlug) =>
    agents.filter((a) => a.departmentSlug === slug)

  const activeHoverDept = hoveredRoom ? getDept(hoveredRoom) : null
  const activeHoverAgents = hoveredRoom ? getDeptAgents(hoveredRoom) : []

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#080a12] shadow-2xl overflow-hidden group select-none transition-all duration-300">
      {/* Botão de Controle da Animação Viva da Empresa */}
      <div className="absolute top-3 right-3 z-30">
        <button
          type="button"
          onClick={() => setAnimated((v) => !v)}
          title="Ativar ou pausar a movimentação em tempo real dos robôs"
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 hover:bg-black/80 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md shadow-lg transition cursor-pointer"
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              animated ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500',
            )}
          />
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>{animated ? 'Agentes Ativos' : 'Pausado'}</span>
        </button>
      </div>

      {/* Imagem de Alta Resolução da Sede Corporativa com Paredes de Vidro e Robôs */}
      <div className="relative w-full aspect-[910/388] overflow-hidden">
        <img
          src="/agents/digital-enterprise-building.jpg"
          alt="Sede Operacional Digital - Business OS"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.005]"
          loading="eager"
        />

        {/* Efeitos de vinheta escura nas bordas para integração com tema escuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a12]/70 via-transparent to-[#080a12]/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a12]/30 via-transparent to-[#080a12]/30 pointer-events-none" />

        {/* CAMADA VIVA DE ANIMAÇÃO DOS ROBÔS E POSTOS DE TRABALHO */}
        {animated && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* 1. Anel Central de Energia Pulsante do Business OS na Recepção */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: '47.7%', top: '51.5%' }}
            >
              {/* Pulso de aura circular */}
              <div
                className="h-16 w-16 rounded-full animate-ring-pulse opacity-75"
                style={{
                  background:
                    'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 75%)',
                  boxShadow:
                    '0 0 30px rgba(168, 85, 247, 0.8), inset 0 0 15px rgba(99, 102, 241, 0.6)',
                }}
              />
              {/* Halo giratório suave */}
              <div className="absolute inset-0 rounded-full border border-purple-400/50 animate-ring-spin border-t-indigo-400 border-r-transparent" />
            </div>

            {/* 2. Redes e Feixes de Dados Viajando Entre Corredores */}
            <svg className="absolute inset-0 w-full h-full opacity-40">
              <defs>
                <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* Linha de dados: Corredor superior */}
              <line
                x1="18%"
                y1="34%"
                x2="88%"
                y2="34%"
                stroke="url(#streamGrad1)"
                strokeWidth="1.5"
                strokeDasharray="6 12"
                className="animate-[dash_8s_linear_infinite]"
              />
              {/* Linha de dados: Corredor central */}
              <line
                x1="22%"
                y1="64%"
                x2="78%"
                y2="64%"
                stroke="url(#streamGrad1)"
                strokeWidth="1.5"
                strokeDasharray="6 12"
                className="animate-[dash_6s_linear_infinite]"
              />
            </svg>

            {/* 3. Robôs em Movimento (Respiração, Varredura de Cabeça, Digitação e Balões) */}
            {ROBOT_STATIONS.map((station) => (
              <div
                key={station.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: station.left, top: station.top }}
              >
                {/* Aura de respiração do robô (move o corpo para cima e para baixo) */}
                <div
                  className="relative flex items-center justify-center animate-robot-breathe"
                  style={{ animationDelay: station.delay }}
                >
                  {/* Luz de escaneamento da cabeça / olhos (move de um lado para o outro) */}
                  <div
                    className="absolute -top-3 flex items-center justify-center animate-robot-scan"
                    style={{ animationDelay: station.delay }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: station.color,
                        boxShadow: `0 0 10px ${station.color}, 0 0 16px ${station.color}`,
                      }}
                    />
                  </div>

                  {/* Efeito de digitação cintilante no teclado da mesa */}
                  <div
                    className="absolute top-1.5 h-1 w-3 rounded-full animate-typing-flicker"
                    style={{
                      animationDelay: station.delay,
                      backgroundColor: `${station.color}b0`,
                      boxShadow: `0 0 8px ${station.color}`,
                    }}
                  />

                  {/* Micro balãozinho holográfico flutuando acima dos robôs ativos */}
                  {station.activeLabel && (
                    <div
                      className="absolute -top-7 whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-1.5 py-0.2 text-[9px] font-semibold text-white/90 shadow-md backdrop-blur-sm animate-floating-bubble"
                      style={{
                        animationDelay: station.delay,
                        borderColor: `${station.color}60`,
                        boxShadow: `0 0 12px ${station.color}40`,
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <span
                          className="h-1 w-1 rounded-full animate-ping"
                          style={{ backgroundColor: station.color }}
                        />
                        {station.activeLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hotspots Interativos Sobrepostos em Cada Sala */}
        {ROOM_HOTSPOTS.map((room) => {
          const running = runningCountByDepartment[room.slug] || 0
          const isSelected = selectedSlug === room.slug
          const isHovered = hoveredRoom === room.slug

          return (
            <div
              key={room.slug}
              style={{
                top: room.top,
                left: room.left,
                width: room.width,
                height: room.height,
              }}
              onMouseEnter={() => setHoveredRoom(room.slug)}
              onMouseLeave={() => setHoveredRoom(null)}
              onClick={() => onSelectDepartment(room.slug)}
              className={cn(
                'absolute cursor-pointer transition-all duration-300 rounded-xl',
                'hover:z-30',
                isSelected && 'z-20',
              )}
            >
              {/* Iluminação de Vidro e Aura Neon quando passa o mouse ou está selecionado */}
              <div
                className={cn(
                  'absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none',
                  isSelected
                    ? 'opacity-100 ring-2'
                    : isHovered
                      ? 'opacity-85 ring-1'
                      : 'opacity-0',
                )}
                style={{
                  backgroundColor: `${room.color}15`,
                  borderColor: room.color,
                  boxShadow:
                    isSelected || isHovered
                      ? `0 0 25px ${room.color}80, inset 0 0 15px ${room.color}40`
                      : undefined,
                }}
              />

              {/* Indicador de pulso se houver tarefa executando nesta sala */}
              {running > 0 && (
                <div
                  className="absolute inset-0 rounded-xl animate-pulse pointer-events-none"
                  style={{
                    backgroundColor: `${room.color}25`,
                    boxShadow: `0 0 20px ${room.color}`,
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Cartão Flutuante (HUD) Interativo com Agentes da Sala quando passa o mouse */}
        {activeHoverDept && (
          <div
            className="absolute bottom-3 left-3 z-40 max-w-xs sm:max-w-sm rounded-xl border border-white/20 bg-[#0d101d]/95 p-3.5 backdrop-blur-xl shadow-2xl animate-fade-in pointer-events-auto"
            style={{
              borderColor: `${activeHoverDept.color}60`,
              boxShadow: `0 0 30px ${activeHoverDept.color}35`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: activeHoverDept.color }}
                />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {activeHoverDept.name}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                🟢 {activeHoverAgents.length} Postos Ativos
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 mb-2.5 line-clamp-2">
              {activeHoverDept.description}
            </p>

            {/* Agentes na Sala */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                Agentes no setor:
              </span>
              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto pr-1">
                {activeHoverAgents.map((ag) => (
                  <div
                    key={ag.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onSelectAgent) onSelectAgent(ag)
                    }}
                    className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/15 px-2 py-1 text-xs text-white/90 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="truncate font-medium">{ag.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0 ml-2 font-mono">
                      {ag.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Clique para abrir setor</span>
              <button
                type="button"
                onClick={() => onSelectDepartment(activeHoverDept.slug)}
                className="font-semibold hover:underline"
                style={{ color: activeHoverDept.color }}
              >
                Abrir departamento →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
