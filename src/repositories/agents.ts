import { supabase } from '@/lib/supabase'
import type {
  AgentApproval,
  AgentDepartment,
  AgentExecution,
  AIAgent,
  DepartmentSlug,
} from '@/types/agents'
import { fromRow } from './createSupabaseRepository'

export const INITIAL_DEPARTMENTS: AgentDepartment[] = [
  {
    id: 'dep-diretoria',
    slug: 'diretoria',
    name: 'Diretoria e Operações',
    description: 'Planejamento estratégico, governança de processos e análise executiva de resultados.',
    color: '#6366f1',
    accentGlow: 'rgba(99, 102, 241, 0.35)',
    iconName: 'ShieldCheck',
    agentCount: 3,
    activeCount: 3,
    position: 1,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'dep-marketing',
    slug: 'marketing',
    name: 'Marketing e Conteúdo',
    description: 'Pesquisa de mercado, arquitetura de conteúdo, roteiros e revisão de qualidade de mídia.',
    color: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.35)',
    iconName: 'Megaphone',
    agentCount: 4,
    activeCount: 4,
    position: 2,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'dep-comercial',
    slug: 'comercial',
    name: 'Comercial e Vendas',
    description: 'Prospecção ativa no radar, qualificação de leads, diagnóstico de empresas e propostas.',
    color: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    iconName: 'Target',
    agentCount: 5,
    activeCount: 5,
    position: 3,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'dep-financeiro',
    slug: 'financeiro',
    name: 'Financeiro',
    description: 'Organização de contas, fluxo de caixa, projeções de faturamento e relatórios fiscais.',
    color: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    iconName: 'Wallet',
    agentCount: 3,
    activeCount: 3,
    position: 4,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'dep-atendimento',
    slug: 'atendimento',
    name: 'Atendimento e CRM',
    description: 'Triagem de mensagens, relacionamento com clientes e manutenção da base comercial.',
    color: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.35)',
    iconName: 'Headphones',
    agentCount: 3,
    activeCount: 3,
    position: 5,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'dep-estudos',
    slug: 'estudos',
    name: 'Estudos e Conhecimento',
    description: 'Tutoria personalizada, resumos de aulas, curadoria de referências e mapas mentais.',
    color: '#eab308',
    accentGlow: 'rgba(234, 179, 8, 0.35)',
    iconName: 'GraduationCap',
    agentCount: 3,
    activeCount: 3,
    position: 6,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'dep-projetos',
    slug: 'projetos',
    name: 'Projetos e Produtividade',
    description: 'Gestão de cronogramas, quebra de tarefas, prazos e controle de entregáveis da equipe.',
    color: '#3b82f6',
    accentGlow: 'rgba(59, 130, 246, 0.35)',
    iconName: 'FolderKanban',
    agentCount: 3,
    activeCount: 3,
    position: 7,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'dep-tecnologia',
    slug: 'tecnologia',
    name: 'Tecnologia e Desenvolvimento',
    description: 'Engenharia de software, automação de processos, revisão de código e testes automatizados.',
    color: '#8b5cf6',
    accentGlow: 'rgba(139, 92, 246, 0.35)',
    iconName: 'Code',
    agentCount: 3,
    activeCount: 2,
    position: 8,
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
]

export const INITIAL_AGENTS: AIAgent[] = [
  // 1. Diretoria e Operações
  {
    id: 'agent-planejamento',
    slug: 'agente-planejamento',
    name: 'Agente de Planejamento',
    role: 'Estrategista Executivo',
    departmentSlug: 'diretoria',
    description: 'Elabora diretrizes de crescimento, metas operacionais e alinhamento de prioridades trimestrais.',
    primaryGoal: 'Manter a visão global da empresa organizada em objetivos claros e planos de ação práticos.',
    systemInstructions: 'Você é o Agente de Planejamento Executivo do Business OS. Forneça análises de alto nível, estruturação de planos OKR e diretrizes acionáveis sem jargões desnecessários.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.6,
    authorizedTools: ['projetos:leitura', 'financeiro:leitura', 'relatorios:geracao'],
    status: 'ativo',
    avatarIcon: 'Compass',
    executionCount: 14,
    successRate: 98,
    lastActiveAt: '2026-10-09T17:40:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-operacoes',
    slug: 'agente-operacoes',
    name: 'Agente de Operações',
    role: 'Coordenador Operacional',
    departmentSlug: 'diretoria',
    description: 'Audita fluxos de trabalho, identifica gargalos e sugere melhorias contínuas nos processos.',
    primaryGoal: 'Garantir que os processos de todas as áreas funcionem de maneira coordenada e sem atrito.',
    systemInstructions: 'Você é o Agente de Operações do Business OS. Avalie processos, eficiência de entregas e desenhe fluxos padronizados de trabalho.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.5,
    authorizedTools: ['tarefas:leitura', 'automacoes:leitura', 'processos:auditoria'],
    status: 'ativo',
    avatarIcon: 'Layers',
    executionCount: 22,
    successRate: 95,
    lastActiveAt: '2026-10-09T18:10:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-analise-resultados',
    slug: 'agente-analise-resultados',
    name: 'Agente de Análise de Resultados',
    role: 'Auditor de Indicadores',
    departmentSlug: 'diretoria',
    description: 'Sintetiza métricas de vendas, finanças e produtividade em relatórios claros com diagnósticos.',
    primaryGoal: 'Transformar dados brutos do sistema em diagnósticos executivos sobre a saúde da empresa.',
    systemInstructions: 'Você é o Agente de Análise de Resultados. Compare metas com números realizados, aponte discrepâncias e faça recomendações baseadas estritamente nos fatos disponíveis.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.4,
    authorizedTools: ['relatorios:leitura', 'financeiro:leitura', 'metricas:consolidacao'],
    status: 'ativo',
    avatarIcon: 'BarChart3',
    executionCount: 18,
    successRate: 100,
    lastActiveAt: '2026-10-09T16:30:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },

  // 2. Marketing e Conteúdo
  {
    id: 'agent-pesquisa-mercado',
    slug: 'agente-pesquisa-mercado',
    name: 'Agente de Pesquisa de Mercado',
    role: 'Analista de Tendências e Benchmarks',
    departmentSlug: 'marketing',
    description: 'Mapeia movimentos do setor, referências concorrentes e padrões de consumo no nicho.',
    primaryGoal: 'Identificar padrões de mercado e oportunidades de posicionamento para clientes e projetos.',
    systemInstructions: 'Você é o Agente de Pesquisa de Mercado. Analise nichos, comportamento de público e referências, sempre indicando fontes e níveis de confiança.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.7,
    authorizedTools: ['radar:leitura', 'benchmarks:analise'],
    status: 'ativo',
    avatarIcon: 'Search',
    executionCount: 31,
    successRate: 96,
    lastActiveAt: '2026-10-09T18:35:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-estrategia-conteudo',
    slug: 'agente-estrategia-conteudo',
    name: 'Agente de Estratégia de Conteúdo',
    role: 'Arquiteto de Linhas Editoriais',
    departmentSlug: 'marketing',
    description: 'Define pilares de conteúdo, calendários temáticos e funis de engajamento para redes sociais.',
    primaryGoal: 'Construir calendários editoriais e narrativas que convertam seguidores em clientes qualificados.',
    systemInstructions: 'Você é o Agente de Estratégia de Conteúdo do Business OS. Crie calendários mensais, distribua formatos (Reels, Carrossel, Stories) e alinhe cada post a um objetivo comercial.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.7,
    authorizedTools: ['conteudo:leitura', 'conteudo:escrita', 'calendario:planejamento'],
    status: 'ativo',
    avatarIcon: 'CalendarDays',
    executionCount: 45,
    successRate: 98,
    lastActiveAt: '2026-10-09T18:20:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-criacao-conteudo',
    slug: 'agente-criacao-conteudo',
    name: 'Agente de Criação de Conteúdo',
    role: 'Redator e Roteirista Criativo',
    departmentSlug: 'marketing',
    description: 'Redige roteiros de vídeos curtos, legendas magnéticas com copy persuasivo e ganchos de alta retenção.',
    primaryGoal: 'Produzir peças de conteúdo completas com gancho, desenvolvimento e chamada para ação (CTA).',
    systemInstructions: 'Você é o Agente de Criação de Conteúdo. Escreva roteiros dinâmicos e legendas persuasivas. Estruture sempre em: Gancho (0-3s), Retenção (corpo do post) e CTA claro.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.8,
    authorizedTools: ['conteudo:rascunho', 'copywriting:geracao'],
    status: 'ativo',
    avatarIcon: 'PenTool',
    executionCount: 68,
    successRate: 94,
    lastActiveAt: '2026-10-09T18:42:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-revisao-qualidade',
    slug: 'agente-revisao-qualidade',
    name: 'Agente de Revisão e Qualidade',
    role: 'Auditor de Copy e Aprovações',
    departmentSlug: 'marketing',
    description: 'Revisa ortografia, clareza, adequação à marca e conformidade antes do envio para aprovação do cliente.',
    primaryGoal: 'Evitar erros gramaticais e desalinhamentos de tom de voz antes da publicação.',
    systemInstructions: 'Você é o Agente de Revisão e Qualidade. Avalie rigorosamente gramática, coesão, clareza da proposta de valor e conformidade com as diretrizes da marca do cliente.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.3,
    authorizedTools: ['conteudo:revisao', 'aprovacoes:fila'],
    status: 'ativo',
    avatarIcon: 'CheckCircle',
    executionCount: 52,
    successRate: 100,
    lastActiveAt: '2026-10-09T18:15:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },

  // 3. Comercial e Vendas (Integrado ao Radar)
  {
    id: 'agent-prospeccao',
    slug: 'agente-prospeccao',
    name: 'Agente de Prospecção',
    role: 'Especialista em Mapeamento Ativo',
    departmentSlug: 'comercial',
    description: 'Identifica segmentos com alta demanda e organiza critérios de busca para novas contas no Radar.',
    primaryGoal: 'Alimentar o funil comercial com empresas de alto potencial de contratação.',
    systemInstructions: 'Você é o Agente de Prospecção. Ajude a estruturar critérios de busca por setor, região e dores comerciais para alimentar o Radar de Prospecção.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.6,
    authorizedTools: ['radar:leitura', 'radar:criacao'],
    status: 'ativo',
    avatarIcon: 'Filter',
    executionCount: 29,
    successRate: 93,
    lastActiveAt: '2026-10-09T18:38:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-qualificacao-leads',
    slug: 'agente-qualificacao-leads',
    name: 'Agente de Qualificação de Leads',
    role: 'SDR de Inteligência',
    departmentSlug: 'comercial',
    description: 'Classifica leads com base em maturidade digital, orçamento estimado e urgência da dor.',
    primaryGoal: 'Separar curiosos de tomadores de decisão com capacidade de investimento real.',
    systemInstructions: 'Você é o Agente de Qualificação de Leads. Aplique metodologias BANT/GPCT para avaliar maturidade e atribuir nível de confiança alto, médio ou baixo ao lead.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.5,
    authorizedTools: ['radar:leitura', 'crm:leitura', 'radar:atualizacao'],
    status: 'ativo',
    avatarIcon: 'Sliders',
    executionCount: 37,
    successRate: 95,
    lastActiveAt: '2026-10-09T18:25:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-analise-empresas',
    slug: 'agente-analise-empresas',
    name: 'Agente de Análise de Empresas',
    role: 'Auditor de Presença Comercial',
    departmentSlug: 'comercial',
    description: 'Diagnostica dados do Radar de Prospecção: canais, site, pontos fracos e oportunidades de serviço.',
    primaryGoal: 'Gerar raio-x comercial de uma empresa mapeada para embasar reuniões e abordagens cirúrgicas.',
    systemInstructions: 'Você é o Agente de Análise de Empresas. Com base nos dados fornecidos do Radar (segmento, canais, site, observações), aponte forças, fragilidades e 3 pontos de entrada comercial.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.6,
    authorizedTools: ['radar:analise', 'diagnostico:geracao'],
    status: 'ativo',
    avatarIcon: 'Building2',
    executionCount: 41,
    successRate: 97,
    lastActiveAt: '2026-10-09T18:45:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-propostas-comerciais',
    slug: 'agente-propostas-comerciais',
    name: 'Agente de Propostas Comerciais',
    role: 'Especialista em Fechamento',
    departmentSlug: 'comercial',
    description: 'Elabora escopos de serviço, cartas de proposta, precificação sugerida e mensagens de primeiro contato.',
    primaryGoal: 'Criar propostas irresistíveis adaptadas à dor e realidade financeira do cliente prospectado.',
    systemInstructions: 'Você é o Agente de Propostas Comerciais. Redija propostas de serviço bem estruturadas (problema identificado, solução proposta, entregáveis, cronograma e retorno esperado).',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.6,
    authorizedTools: ['propostas:geracao', 'crm:atualizacao'],
    status: 'ativo',
    avatarIcon: 'FileCheck2',
    executionCount: 26,
    successRate: 96,
    lastActiveAt: '2026-10-09T18:05:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-follow-up',
    slug: 'agente-follow-up',
    name: 'Agente de Follow-up',
    role: 'Cadência e Retomada',
    departmentSlug: 'comercial',
    description: 'Cria sequências de mensagens de acompanhamento sem ser invasivo, mantendo a negociação aquecida.',
    primaryGoal: 'Reativar contatos frios e manter cadência profissional com clientes em negociação.',
    systemInstructions: 'Você é o Agente de Follow-up. Elabore mensagens de acompanhamento gentis, com valor agregado (compartilhando insights ou ideias novas) e convite para conversa rápida.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.7,
    authorizedTools: ['crm:leitura', 'mensagens:redacao'],
    status: 'ativo',
    avatarIcon: 'Clock',
    executionCount: 33,
    successRate: 94,
    lastActiveAt: '2026-10-09T17:55:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },

  // 4. Financeiro
  {
    id: 'agent-organizacao-financeira',
    slug: 'agente-organizacao-financeira',
    name: 'Agente de Organização Financeira',
    role: 'Auditor Contábil',
    departmentSlug: 'financeiro',
    description: 'Categoriza lançamentos, detecta cobranças pendentes e valida consistência de entradas e saídas.',
    primaryGoal: 'Manter cada lançamento categorizado corretamente sem furos de conciliação.',
    systemInstructions: 'Você é o Agente de Organização Financeira. Ajude a estruturar categorias de despesas e receitas, conferir saldos e apontar pagamentos em atraso.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.3,
    authorizedTools: ['financeiro:leitura', 'transacoes:analise'],
    status: 'ativo',
    avatarIcon: 'Receipt',
    executionCount: 19,
    successRate: 100,
    lastActiveAt: '2026-10-09T16:15:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-fluxo-caixa',
    slug: 'agente-fluxo-caixa',
    name: 'Agente de Fluxo de Caixa',
    role: 'Projetor Financeiro',
    departmentSlug: 'financeiro',
    description: 'Calcula previsões de caixa para os próximos 30/60 dias e alerta sobre descasamento de datas.',
    primaryGoal: 'Prever momentos de aperto financeiro e sugerir medidas preventivas antes do vencimento.',
    systemInstructions: 'Você é o Agente de Fluxo de Caixa. Analise o contas a receber vs. contas a pagar e calcule o saldo projetado com margem de segurança.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.4,
    authorizedTools: ['financeiro:leitura', 'contratos:leitura', 'projecao:calculo'],
    status: 'ativo',
    avatarIcon: 'TrendingUp',
    executionCount: 16,
    successRate: 97,
    lastActiveAt: '2026-10-09T17:10:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-analise-financeira',
    slug: 'agente-analise-financeira',
    name: 'Agente de Análise Financeira',
    role: 'Consultor de Rentabilidade',
    departmentSlug: 'financeiro',
    description: 'Mapeia projetos mais lucrativos, margem de contribuição e oportunidades de corte de custos supérfluos.',
    primaryGoal: 'Maximizar a margem líquida e o retorno sobre o tempo investido em cada cliente.',
    systemInstructions: 'Você é o Agente de Análise Financeira. Avalie margem de lucro por projeto e aponte se o custo das entregas condiz com o valor cobrado.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.4,
    authorizedTools: ['financeiro:leitura', 'contratos:leitura', 'rentabilidade:diagnostico'],
    status: 'ativo',
    avatarIcon: 'PieChart',
    executionCount: 12,
    successRate: 100,
    lastActiveAt: '2026-10-09T15:00:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },

  // 5. Projetos e Produtividade
  {
    id: 'agent-gestao-projetos',
    slug: 'agente-gestao-projetos',
    name: 'Agente de Gestão de Projetos',
    role: 'Scrum Master & PM',
    departmentSlug: 'projetos',
    description: 'Estrutura etapas de projetos, marcos críticos, dependências entre entregas e alocação de escopo.',
    primaryGoal: 'Garantir que os projetos sejam entregues no prazo com escopo respeitado.',
    systemInstructions: 'Você é o Agente de Gestão de Projetos. Crie cronogramas acionáveis, identifique caminhos críticos e sugira marcos semanais de validação.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.5,
    authorizedTools: ['projetos:leitura', 'projetos:planejamento'],
    status: 'ativo',
    avatarIcon: 'Calendar',
    executionCount: 27,
    successRate: 96,
    lastActiveAt: '2026-10-09T18:12:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-organizacao-tarefas',
    slug: 'agente-organizacao-tarefas',
    name: 'Agente de Organização de Tarefas',
    role: 'Facilitador de Produtividade',
    departmentSlug: 'projetos',
    description: 'Transforma briefings em checklists de tarefas detalhadas com prioridades e prazos coerentes.',
    primaryGoal: 'Quebrar grandes demandas em tarefas pequenas, claras e fáceis de executar.',
    systemInstructions: 'Você é o Agente de Organização de Tarefas. Pegue briefings ou ideias e decomponha-os em listas de tarefas atômicas (Título, Prioridade, Prazo estimado).',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.5,
    authorizedTools: ['tarefas:leitura', 'tarefas:criacao'],
    status: 'ativo',
    avatarIcon: 'CheckSquare',
    executionCount: 49,
    successRate: 98,
    lastActiveAt: '2026-10-09T18:31:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-revisao-entregas',
    slug: 'agente-revisao-entregas',
    name: 'Agente de Revisão de Entregas',
    role: 'Auditor de Qualidade de Entrega',
    departmentSlug: 'projetos',
    description: 'Confere se todos os itens combinados com o cliente foram concluídos antes do encerramento do marco.',
    primaryGoal: 'Garantir padrão de excelência e evitar esquecimento de itens combinados.',
    systemInstructions: 'Você é o Agente de Revisão de Entregas. Verifique checklists de conclusão e aponte se ainda resta alguma pendência não finalizada.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.3,
    authorizedTools: ['tarefas:leitura', 'arquivos:leitura'],
    status: 'ativo',
    avatarIcon: 'ShieldAlert',
    executionCount: 20,
    successRate: 100,
    lastActiveAt: '2026-10-09T17:22:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },

  // 6. Atendimento e CRM
  {
    id: 'agent-atendimento',
    slug: 'agente-atendimento',
    name: 'Agente de Atendimento',
    role: 'Especialista em Suporte & CS',
    departmentSlug: 'atendimento',
    description: 'Esboça respostas profissionais e empáticas para dúvidas frequentes e solicitações de clientes.',
    primaryGoal: 'Responder dúvidas com agilidade mantendo a gentileza e o tom acolhedor da empresa.',
    systemInstructions: 'Você é o Agente de Atendimento do Business OS. Redija respostas claras, atenciosas e profissionais para mensagens de clientes, requerendo aprovação humana antes do envio.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.6,
    authorizedTools: ['clientes:leitura', 'mensagens:rascunho'],
    status: 'ativo',
    avatarIcon: 'MessageCircle',
    executionCount: 38,
    successRate: 95,
    lastActiveAt: '2026-10-09T18:18:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-organizacao-crm',
    slug: 'agente-organizacao-crm',
    name: 'Agente de Organização do CRM',
    role: 'Gestor da Base de Contatos',
    departmentSlug: 'atendimento',
    description: 'Mantém histórico de interações atualizado, preenche notas e evita contatos duplicados.',
    primaryGoal: 'Garantir que a base do CRM esteja limpa, atualizada e com contexto das conversas.',
    systemInstructions: 'Você é o Agente de Organização do CRM. Organize resumos de reuniões e adicione notas estruturadas nos cadastros dos clientes correspondentes.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.4,
    authorizedTools: ['clientes:leitura', 'clientes:atualizacao'],
    status: 'ativo',
    avatarIcon: 'Users2',
    executionCount: 25,
    successRate: 96,
    lastActiveAt: '2026-10-09T17:48:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-relacionamento',
    slug: 'agente-relacionamento',
    name: 'Agente de Relacionamento',
    role: 'Customer Success & Retenção',
    departmentSlug: 'atendimento',
    description: 'Monitora datas especiais, renovações de contrato e oportunidades de pós-venda para clientes ativos.',
    primaryGoal: 'Fidelizar clientes ativos e fomentar renovações antecipadas com valor perceptível.',
    systemInstructions: 'Você é o Agente de Relacionamento. Crie mensagens de alinhamento periódico, felicitações e pesquisas breves de satisfação.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.7,
    authorizedTools: ['contratos:leitura', 'clientes:leitura'],
    status: 'ativo',
    avatarIcon: 'HeartHandshake',
    executionCount: 17,
    successRate: 100,
    lastActiveAt: '2026-10-09T16:50:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },

  // 7. Estudos e Conhecimento
  {
    id: 'agent-tutor',
    slug: 'agente-tutor',
    name: 'Agente Tutor',
    role: 'Mentor de Aprendizado',
    departmentSlug: 'estudos',
    description: 'Esclarece conceitos de marketing, IA e gestão com base nas trilhas de estudo do sistema.',
    primaryGoal: 'Acelerar o domínio técnico dos conteúdos com exemplos didáticos e aplicações práticas.',
    systemInstructions: 'Você é o Agente Tutor do Business OS. Explique conceitos técnicos de forma clara e passo a passo, usando analogias práticas e exercícios curtos.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.6,
    authorizedTools: ['estudos:leitura', 'conhecimento:leitura'],
    status: 'ativo',
    avatarIcon: 'GraduationCap',
    executionCount: 34,
    successRate: 97,
    lastActiveAt: '2026-10-09T18:02:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-resumos',
    slug: 'agente-resumos',
    name: 'Agente de Resumos',
    role: 'Sintetizador de Conteúdos',
    departmentSlug: 'estudos',
    description: 'Condensa artigos, livros e aulas em resumos estruturados com pontos-chave e insights aplicáveis.',
    primaryGoal: 'Poupar tempo transformando leituras densas em resumos executivos de 3 minutos.',
    systemInstructions: 'Você é o Agente de Resumos. Sintetize textos em: 1) Ideia central, 2) Três insights práticos, 3) Próxima ação recomendada.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.5,
    authorizedTools: ['conhecimento:escrita', 'arquivos:leitura'],
    status: 'ativo',
    avatarIcon: 'BookOpen',
    executionCount: 42,
    successRate: 98,
    lastActiveAt: '2026-10-09T18:28:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-pesquisa-conhecimento',
    slug: 'agente-pesquisa-conhecimento',
    name: 'Agente de Pesquisa e Conhecimento',
    role: 'Curador de Base Interna',
    departmentSlug: 'estudos',
    description: 'Organiza a base de conhecimento (wikis, anotações e SOPs) facilitando consultas rápidas.',
    primaryGoal: 'Garantir que o conhecimento interno da equipe esteja indexado e fácil de consultar.',
    systemInstructions: 'Você é o Agente de Pesquisa e Conhecimento. Ajude a estruturar notas, wikis e guias de processo interno no módulo de Conhecimento.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.5,
    authorizedTools: ['conhecimento:leitura', 'conhecimento:organizacao'],
    status: 'ativo',
    avatarIcon: 'Brain',
    executionCount: 23,
    successRate: 95,
    lastActiveAt: '2026-10-09T17:15:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },

  // 8. Tecnologia e Desenvolvimento
  {
    id: 'agent-desenvolvedor',
    slug: 'agente-desenvolvedor',
    name: 'Agente Desenvolvedor',
    role: 'Engenheiro de Soluções',
    departmentSlug: 'tecnologia',
    description: 'Implementa scripts, integrações de APIs, componentes e funções para automação da empresa.',
    primaryGoal: 'Escrever código limpo, modular e tipado em TypeScript/React ou automações em Edge Functions.',
    systemInstructions: 'Você é o Agente Desenvolvedor. Escreva código TypeScript de alta qualidade, respeitando os padrões de arquitetura e design system do Business OS.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.4,
    authorizedTools: ['codigo:geracao', 'automacoes:criacao'],
    status: 'ativo',
    avatarIcon: 'Code2',
    executionCount: 30,
    successRate: 93,
    lastActiveAt: '2026-10-09T18:40:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-revisao-codigo',
    slug: 'agente-revisao-codigo',
    name: 'Agente de Revisão de Código',
    role: 'Code Reviewer & Seguranca',
    departmentSlug: 'tecnologia',
    description: 'Audita código quanto a segurança, boas práticas de RLS, tipagem e prevenção de regressões.',
    primaryGoal: 'Garantir que nenhum vazamento de dados ou quebra de build chegue em produção.',
    systemInstructions: 'Você é o Agente de Revisão de Código. Aponte vulnerabilidades, problemas de RLS, tipagens imprecisas e oportunidades de otimização de performance.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.2,
    authorizedTools: ['codigo:auditoria', 'seguranca:validacao'],
    status: 'ativo',
    avatarIcon: 'Terminal',
    executionCount: 28,
    successRate: 96,
    lastActiveAt: '2026-10-09T18:22:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
  {
    id: 'agent-testes',
    slug: 'agente-testes',
    name: 'Agente de Testes',
    role: 'QA & Automação de Testes',
    departmentSlug: 'tecnologia',
    description: 'Desenvolve suites de testes unitários e de integração (Vitest) para garantir estabilidade contínua.',
    primaryGoal: 'Assegurar cobertura de testes para regras de negócio e fluxos de dados críticos.',
    systemInstructions: 'Você é o Agente de Testes. Crie testes automatizados claros com Vitest para validar repositórios, serviços e componentes.',
    model: 'llama3.2:latest',
    provider: 'ollama',
    temperature: 0.3,
    authorizedTools: ['testes:geracao', 'testes:execucao'],
    status: 'pausado',
    avatarIcon: 'FlaskConical',
    executionCount: 15,
    successRate: 100,
    lastActiveAt: '2026-10-09T15:40:00.000Z',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
]

export const SEED_EXECUTIONS: AgentExecution[] = [
  {
    id: 'exec-1',
    agentId: 'agent-pesquisa-mercado',
    agentName: 'Agente de Pesquisa de Mercado',
    departmentSlug: 'marketing',
    taskTitle: 'Pesquisa de mercado: clínicas de estética na Grande Vitória',
    prompt: 'Mapear canais digitais e oportunidades para prospecção no setor de saúde e estética.',
    output: 'Identificadas 12 empresas com presença ativa no Instagram mas sem funil de agendamento automatizado no WhatsApp. Oportunidade clara para oferta de gestão de tráfego + automação de atendimento.',
    durationMs: 3420,
    tokensCount: 412,
    status: 'concluido',
    sourceModule: 'radar',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-2',
    agentId: 'agent-criacao-conteudo',
    agentName: 'Agente de Criação de Conteúdo',
    departmentSlug: 'marketing',
    taskTitle: 'Roteiro de 3 vídeos curtos sobre gestão financeira',
    prompt: 'Escreva 3 roteiros dinâmicos (gancho + corpo + CTA) para atrair empreendedores locais.',
    output: 'Vídeo 1: "O erro silencioso que drena seu lucro antes do dia 15"\nVídeo 2: "Planilha vs. Sistema: quando vale a pena migrar?"\nVídeo 3: "3 indicadores que todo dono de negócio precisa checar toda segunda-feira."',
    durationMs: 4100,
    tokensCount: 520,
    status: 'aguardando_aprovacao',
    requiresApproval: true,
    approvalId: 'appr-1',
    sourceModule: 'conteudo',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-3',
    agentId: 'agent-analise-empresas',
    agentName: 'Agente de Análise de Empresas',
    departmentSlug: 'comercial',
    taskTitle: 'Diagnóstico comercial da Clínica Lumina Estética',
    prompt: 'Analisar presença digital e formular recomendação de serviço para abordagem.',
    output: 'A empresa tem excelente reputação no Google (4.8), porém perde cerca de 40% dos cliques devido ao tempo de carregamento do link da bio e falta de botão de contato direto. Recomendação: Pacote de Reestruturação de Presença e Funil.',
    durationMs: 2980,
    tokensCount: 380,
    status: 'concluido',
    sourceModule: 'radar',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-4',
    agentId: 'agent-propostas-comerciais',
    agentName: 'Agente de Propostas Comerciais',
    departmentSlug: 'comercial',
    taskTitle: 'Proposta comercial de Social Media & Automação',
    prompt: 'Gerar mensagem personalizada de apresentação e proposta inicial de 3 meses.',
    output: 'Proposta estruturada: Diagnóstico inicial incluso, criação de 12 posts/mês, automação de primeiro atendimento no WhatsApp e dashboard de métricas quinzenal.',
    durationMs: 3850,
    tokensCount: 460,
    status: 'aguardando_aprovacao',
    requiresApproval: true,
    approvalId: 'appr-2',
    sourceModule: 'radar',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-5',
    agentId: 'agent-atendimento',
    agentName: 'Agente de Atendimento',
    departmentSlug: 'atendimento',
    taskTitle: 'Resposta de alinhamento para cliente potencial',
    prompt: 'Redigir resposta para cliente perguntando sobre prazos de entrega do projeto.',
    output: 'Olá! Nosso cronograma padrão de entrega para a etapa inicial é de 7 dias úteis após o envio dos materiais, com acompanhamento direto pelo nosso portal. Podemos agendar uma chamada rápida amanhã para alinhar os detalhes?',
    durationMs: 2200,
    tokensCount: 290,
    status: 'aguardando_aprovacao',
    requiresApproval: true,
    approvalId: 'appr-3',
    sourceModule: 'crm',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
]

export const SEED_APPROVALS: AgentApproval[] = [
  {
    id: 'appr-1',
    executionId: 'exec-2',
    agentId: 'agent-criacao-conteudo',
    agentName: 'Agente de Criação de Conteúdo',
    departmentSlug: 'marketing',
    title: 'Publicar post no Instagram',
    description: 'Aprovação de roteiro de vídeo curto e copy para agendamento no módulo de Conteúdo.',
    actionType: 'publicacao',
    contentToApprove: 'Vídeo 1: "O erro silencioso que drena seu lucro antes do dia 15"\nGancho: Pare de aceitar clientes que custam mais caro do que pagam.\nCTA: Comente "LUCRO" para receber o diagnóstico gratuito.',
    status: 'pendente',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'appr-2',
    executionId: 'exec-4',
    agentId: 'agent-propostas-comerciais',
    agentName: 'Agente de Propostas Comerciais',
    departmentSlug: 'comercial',
    title: 'Enviar proposta comercial',
    description: 'Proposta comercial preparada para envio ao contato comercial de empresa do Radar.',
    actionType: 'proposta',
    contentToApprove: 'Proposta de Reestruturação de Presença & Automação Comercial para Clínica Lumina Estética.',
    status: 'pendente',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'appr-3',
    executionId: 'exec-5',
    agentId: 'agent-atendimento',
    agentName: 'Agente de Atendimento',
    departmentSlug: 'atendimento',
    title: 'Resposta para cliente via WhatsApp',
    description: 'Mensagem de alinhamento de prazos preparada para envio a lead em negociação.',
    actionType: 'mensagem_cliente',
    contentToApprove: 'Olá! Nosso cronograma padrão de entrega para a etapa inicial é de 7 dias úteis após o envio dos materiais...',
    status: 'pendente',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
]

// Armazenamento local com fallback
const AGENTS_STORAGE_KEY = 'business_os_ai_agents'
const DEPARTMENTS_STORAGE_KEY = 'business_os_ai_departments'
const EXECUTIONS_STORAGE_KEY = 'business_os_ai_executions'
const APPROVALS_STORAGE_KEY = 'business_os_ai_approvals'

function readStorage<T>(key: string, defaultValue: T): T {
  if (typeof localStorage === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    const parsed = JSON.parse(raw)
    return parsed ?? defaultValue
  } catch {
    return defaultValue
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore storage quota errors */
  }
}

export const agentRepository = {
  async listDepartments(): Promise<AgentDepartment[]> {
    try {
      const { data, error } = await supabase.from('ai_departments' as any).select('*').order('position', { ascending: true })
      if (!error && data && data.length > 0) {
        return data.map((r: any) => fromRow<AgentDepartment>(r))
      }
    } catch {
      /* fallback to local storage */
    }
    const local = readStorage<AgentDepartment[]>(DEPARTMENTS_STORAGE_KEY, INITIAL_DEPARTMENTS)
    return local
  },

  async listAgents(): Promise<AIAgent[]> {
    try {
      const { data, error } = await supabase.from('ai_agents' as any).select('*').order('created_at', { ascending: true })
      if (!error && data && data.length > 0) {
        return data.map((r: any) => fromRow<AIAgent>(r))
      }
    } catch {
      /* fallback to local storage */
    }
    const local = readStorage<AIAgent[]>(AGENTS_STORAGE_KEY, INITIAL_AGENTS)
    return local
  },

  async getAgent(id: string): Promise<AIAgent | null> {
    const list = await this.listAgents()
    return list.find((a) => a.id === id) || null
  },

  async getAgentById(id: string): Promise<AIAgent | null> {
    return this.getAgent(id)
  },

  async listAgentsByDepartment(slug: DepartmentSlug): Promise<AIAgent[]> {
    const list = await this.listAgents()
    return list.filter((a) => a.departmentSlug === slug)
  },

  async updateAgent(id: string, patch: Partial<AIAgent>): Promise<AIAgent | null> {
    const list = await this.listAgents()
    const index = list.findIndex((a) => a.id === id)
    if (index === -1) return null

    const updated: AIAgent = {
      ...list[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    list[index] = updated
    writeStorage(AGENTS_STORAGE_KEY, list)

    try {
      await supabase.from('ai_agents' as any).update(updated as any).eq('id', id)
    } catch {
      /* local updated */
    }

    return updated
  },

  async createAgent(input: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successRate'>): Promise<AIAgent> {
    const list = await this.listAgents()
    const now = new Date().toISOString()
    const newAgent: AIAgent = {
      ...input,
      id: `agent-${Date.now().toString(36)}`,
      executionCount: 0,
      successRate: 100,
      createdAt: now,
      updatedAt: now,
    }
    list.push(newAgent)
    writeStorage(AGENTS_STORAGE_KEY, list)

    try {
      await supabase.from('ai_agents' as any).insert(newAgent as any)
    } catch {
      /* local stored */
    }

    return newAgent
  },

  async deleteAgent(id: string): Promise<boolean> {
    const list = await this.listAgents()
    const filtered = list.filter((a) => a.id !== id)
    writeStorage(AGENTS_STORAGE_KEY, filtered)

    try {
      await supabase.from('ai_agents' as any).delete().eq('id', id)
    } catch {
      /* local deleted */
    }
    return true
  },
}

export const agentExecutionRepository = {
  async list(): Promise<AgentExecution[]> {
    try {
      const { data, error } = await supabase.from('ai_agent_executions' as any).select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data.map((r: any) => fromRow<AgentExecution>(r))
      }
    } catch {
      /* fallback */
    }
    return readStorage<AgentExecution[]>(EXECUTIONS_STORAGE_KEY, SEED_EXECUTIONS)
  },

  async listRecent(limit = 50): Promise<AgentExecution[]> {
    const all = await this.list()
    return all.slice(0, limit)
  },

  async record(input: Omit<AgentExecution, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentExecution> {
    const list = await this.list()
    const now = new Date().toISOString()
    const item: AgentExecution = {
      ...input,
      id: `exec-${Date.now().toString(36)}`,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [item, ...list].slice(0, 100)
    writeStorage(EXECUTIONS_STORAGE_KEY, updated)

    try {
      await supabase.from('ai_agent_executions' as any).insert(item as any)
    } catch {
      /* stored locally */
    }

    // Atualiza contadores do agente
    const agent = await agentRepository.getAgent(input.agentId)
    if (agent) {
      await agentRepository.updateAgent(agent.id, {
        executionCount: agent.executionCount + 1,
        lastActiveAt: now,
      })
    }

    return item
  },
}

export const agentApprovalRepository = {
  async list(): Promise<AgentApproval[]> {
    try {
      const { data, error } = await supabase.from('ai_agent_approvals' as any).select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data.map((r: any) => fromRow<AgentApproval>(r))
      }
    } catch {
      /* fallback */
    }
    return readStorage<AgentApproval[]>(APPROVALS_STORAGE_KEY, SEED_APPROVALS)
  },

  async listPending(): Promise<AgentApproval[]> {
    const all = await this.list()
    return all.filter((a) => a.status === 'pendente')
  },

  async create(input: Omit<AgentApproval, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<AgentApproval> {
    const list = await this.list()
    const now = new Date().toISOString()
    const item: AgentApproval = {
      ...input,
      id: `appr-${Date.now().toString(36)}`,
      status: 'pendente',
      createdAt: now,
      updatedAt: now,
    }
    const updated = [item, ...list]
    writeStorage(APPROVALS_STORAGE_KEY, updated)

    try {
      await supabase.from('ai_agent_approvals' as any).insert(item as any)
    } catch {
      /* stored locally */
    }
    return item
  },

  async resolve(id: string, status: 'aprovado' | 'rejeitado', note?: string): Promise<AgentApproval | null> {
    const list = await this.list()
    const index = list.findIndex((a) => a.id === id)
    if (index === -1) return null

    const now = new Date().toISOString()
    const updated: AgentApproval = {
      ...list[index],
      status,
      resolvedAt: now,
      feedbackNote: note,
      updatedAt: now,
    }
    list[index] = updated
    writeStorage(APPROVALS_STORAGE_KEY, list)

    try {
      await supabase.from('ai_agent_approvals' as any).update(updated as any).eq('id', id)
    } catch {
      /* local updated */
    }
    return updated
  },
}
