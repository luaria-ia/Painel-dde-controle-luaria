import type {
  EffortLevel,
  FitLuaria,
  RadarOpportunitySource,
  RadarOpportunityStatus,
  RadarPriority,
  TechnicalDifficulty,
} from '@/types/radar'

export const RADAR_STATUS_LABELS: Record<RadarOpportunityStatus, string> = {
  nova: 'Nova Oportunidade',
  em_analise: 'Em Análise',
  prioritaria: 'Prioritária',
  aprovada: 'Aprovada para Abordagem',
  proposta_em_preparacao: 'Proposta em Preparação',
  proposta_enviada: 'Proposta Enviada',
  em_negociacao: 'Em Negociação',
  aguardando_resposta: 'Aguardando Resposta',
  ganha: 'Ganha / Contrato Fechado',
  perdida: 'Perdida',
  descartada: 'Descartada',
}

export const RADAR_STATUS_COLORS: Record<RadarOpportunityStatus, { bg: string; text: string; border: string }> = {
  nova: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  em_analise: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  prioritaria: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  aprovada: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  proposta_em_preparacao: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  proposta_enviada: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  em_negociacao: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  aguardando_resposta: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  ganha: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  perdida: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  descartada: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
}

export const RADAR_SOURCE_LABELS: Record<RadarOpportunitySource, string> = {
  workana: 'Workana / Freelancers',
  prospeccao_direta: 'Prospecção Direta',
  pesquisa: 'Pesquisa Ativa',
  indicacao: 'Indicação Comercial',
  instagram: 'Instagram / Redes',
  comunidade: 'Grupos & Comunidades',
  site: 'Formulário do Site',
  outro: 'Outras Fontes',
}

export const FIT_LUARIA_LABELS: Record<FitLuaria, string> = {
  alto: 'Alta Aderência (IA & Automação)',
  medio: 'Média Aderência (Integrações / Processos)',
  baixo: 'Baixa Aderência (Escopo Parcial)',
  fora_de_escopo: 'Fora do Escopo Empresarial',
}

export const EFFORT_LABELS: Record<EffortLevel, string> = {
  baixo: 'Baixo Esforço',
  medio: 'Médio Esforço',
  alto: 'Alto Esforço',
}

export const DIFFICULTY_LABELS: Record<TechnicalDifficulty, string> = {
  baixa: 'Baixa Dificuldade',
  media: 'Média Dificuldade',
  alta: 'Alta Dificuldade',
}

export const RADAR_PRIORITY_ORDER: RadarOpportunityStatus[] = [
  'nova',
  'em_analise',
  'prioritaria',
  'aprovada',
  'proposta_em_preparacao',
  'proposta_enviada',
  'em_negociacao',
  'aguardando_resposta',
  'ganha',
  'perdida',
  'descartada',
]

/**
 * Cálculo transparente do Score de Prioridade Inteligente (0 a 100)
 * Pesa equilíbrio entre chance de contratação, remuneração, esforço e aderência ao posicionamento Luaria.IA.
 */
export function calculateRadarScore(params: {
  fitLuaria: FitLuaria
  estimatedEffort: EffortLevel
  technicalDifficulty: TechnicalDifficulty
  suggestedPriceCents?: number | null
  clientBudgetCents?: number | null
  requestedScope?: string
}): { score: number; rationale: string; priority: RadarPriority } {
  let score = 0
  const reasons: string[] = []

  // 1. Aderência ao foco Luaria.IA (0 a 35 pontos)
  switch (params.fitLuaria) {
    case 'alto':
      score += 35
      reasons.push('Forte alinhamento com soluções de automação e agentes de IA da Luaria.IA')
      break
    case 'medio':
      score += 22
      reasons.push('Aderência intermediária (potencial de evolução para automação)')
      break
    case 'baixo':
      score += 10
      reasons.push('Baixa aderência ao posicionamento principal')
      break
    case 'fora_de_escopo':
      score += 0
      reasons.push('Demanda fora do escopo estratégico de IA (ex: desenvolvimento web tradicional)')
      break
  }

  // 2. Retorno financeiro vs. Esforço de entrega (0 a 30 pontos)
  const price = params.suggestedPriceCents || params.clientBudgetCents || 0
  if (params.estimatedEffort === 'baixo') {
    score += 25
    reasons.push('Rápida execução e entrega inicial viável')
    if (price >= 150000) {
      score += 5
      reasons.push('Excelente relação retorno/esforço')
    }
  } else if (params.estimatedEffort === 'medio') {
    score += 18
    reasons.push('Esforço balanceado com entrega controlada')
  } else {
    // Alto esforço
    if (price < 200000) {
      score += 5
      reasons.push('Atenção: exige alto esforço com remuneração modesta')
    } else {
      score += 12
      reasons.push('Contrato de maior porte mas com esforço considerável')
    }
  }

  // 3. Viabilidade Técnica e Menor Risco Operacional (0 a 20 pontos)
  switch (params.technicalDifficulty) {
    case 'baixa':
      score += 20
      reasons.push('Baixo risco técnico e alta previsibilidade')
      break
    case 'media':
      score += 14
      reasons.push('Complexidade técnica moderada com entregáveis bem definidos')
      break
    case 'alta':
      score += 6
      reasons.push('Alta complexidade técnica que pode alongar o ciclo de entrega')
      break
  }

  // 4. Clareza de escopo (0 a 15 pontos)
  const scopeLength = params.requestedScope?.trim().length || 0
  if (scopeLength > 50) {
    score += 15
    reasons.push('Escopo bem estruturado favorecendo fechamento rápido')
  } else {
    score += 7
    reasons.push('Escopo preliminar ou amplo (recomenda-se qualificação antes de ofertar)')
  }

  // Normalização do score (0 a 100)
  let finalScore = Math.max(0, Math.min(100, Math.round(score)))
  if (params.fitLuaria === 'fora_de_escopo') {
    finalScore = Math.min(30, Math.round(finalScore * 0.4))
  }

  // Classificação da Prioridade
  let priority: RadarPriority = 'baixa'
  if (finalScore >= 75) {
    priority = 'urgente'
  } else if (finalScore >= 60) {
    priority = 'alta'
  } else if (finalScore >= 40) {
    priority = 'media'
  } else {
    priority = 'baixa'
  }

  const rationale = reasons.join('. ') + '.'

  return {
    score: finalScore,
    rationale,
    priority,
  }
}
