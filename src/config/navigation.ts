import {
  BarChart3,
  Compass,
  GraduationCap,
  Library,
  Target,
  Bot,
  Brain,
  Zap,
  CalendarDays,
  FileSignature,
  FolderKanban,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Exibir direto na barra inferior do celular (os demais ficam em "Mais"). */
  mobile?: boolean
  /** Contador exibido ao lado do item (calculado na Sidebar). */
  badge?: NavBadge
}

export type NavBadge = 'pendingTasks'

export interface NavGroup {
  /** Chave estável (usada para lembrar se a seção está aberta). */
  id: string
  label: string
  items: NavItem[]
  /** Seção começa aberta enquanto o usuário não abrir/fechar manualmente. */
  defaultOpen?: boolean
}

/** Seção recolhível da sidebar: itens fixos ou vindos dos dados (`source`). */
export interface NavSection {
  id: string
  title: string
  /** Opcional — reservado para um futuro modo compacto da sidebar. */
  icon?: LucideIcon
  defaultOpen?: boolean
  items?: NavItem[]
  source?: 'activeProjects'
}

/**
 * Navegação principal, agrupada. Para adicionar um módulo (ex.: V3 — IA, Automações),
 * inclua o item no grupo certo e registre a rota em src/App.tsx.
 */
export const NAV_GROUPS: NavGroup[] = [
  { id: 'visao-geral', label: 'Visão geral', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, mobile: true }] },
  {
    id: 'comercial',
    label: 'Comercial & CRM',
    defaultOpen: true,
    items: [
      { to: '/radar', label: 'Radar de Prospecção', icon: Compass, mobile: true },
      { to: '/clientes', label: 'CRM & Clientes', icon: Users },
      { to: '/contratos', label: 'Contratos', icon: FileSignature },
    ],
  },
  {
    id: 'gestao',
    label: 'Operação & Projetos',
    defaultOpen: true,
    items: [
      { to: '/projetos', label: 'Projetos', icon: FolderKanban, mobile: true },
      { to: '/tarefas', label: 'Tarefas', icon: ListChecks, mobile: true, badge: 'pendingTasks' },
      { to: '/calendario', label: 'Calendário', icon: CalendarDays, mobile: true },
    ],
  },
  {
    id: 'conteudo',
    label: 'Conteúdo',
    items: [
      { to: '/conteudo', label: 'Conteúdo', icon: Megaphone },
      { to: '/arquivos', label: 'Arquivos', icon: FolderOpen },
    ],
  },
  {
    id: 'agentes-ia',
    label: 'Agentes de IA',
    defaultOpen: true,
    items: [{ to: '/agentes', label: 'Agentes de IA', icon: Bot, mobile: true }],
  },
  {
    id: 'inteligencia',
    label: 'Inteligência',
    items: [
      { to: '/assistente', label: 'Assistente', icon: Bot },
      { to: '/conhecimento', label: 'Conhecimento', icon: Brain },
      { to: '/automacoes', label: 'Automações', icon: Zap },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    items: [
      { to: '/financeiro', label: 'Financeiro', icon: Wallet },
      { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    ],
  },
  {
    id: 'aprendizado',
    label: 'Aprendizado',
    defaultOpen: true,
    items: [
      { to: '/estudos', label: 'Estudos', icon: GraduationCap },
      { to: '/biblioteca', label: 'Biblioteca', icon: Library },
      { to: '/projetos-de-estudo', label: 'Projetos de estudo', icon: Target },
      { to: '/ferramentas-ia', label: 'Ferramentas de IA', icon: Sparkles },
    ],
  },
]

export const MAIN_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

export const SECONDARY_NAV: NavItem[] = [{ to: '/configuracoes', label: 'Configurações', icon: Settings }]

/** Item fixo no topo da sidebar (fora das seções). */
export const NAV_TOP: NavItem = NAV_GROUPS[0].items[0]

/**
 * Seções recolhíveis da sidebar (desktop), na ordem de exibição.
 * Nova categoria (ex.: Aprendizado) = um objeto a mais aqui; a Sidebar não muda.
 */
export const NAV_SECTIONS: NavSection[] = [
  ...NAV_GROUPS.slice(1).map((g) => ({ id: g.id, title: g.label, defaultOpen: g.defaultOpen, items: g.items })),
  { id: 'projetos-ativos', title: 'Projetos ativos', defaultOpen: true, source: 'activeProjects' },
  { id: 'sistema', title: 'Sistema', items: SECONDARY_NAV },
]
