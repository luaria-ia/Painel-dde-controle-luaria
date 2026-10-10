import { describe, expect, it } from 'vitest'
import { calculateRadarScore } from '@/lib/radarScore'
import { exportRadarToCsv, exportRadarToJson, INITIAL_RADAR_OPPORTUNITIES, radarRepository } from './radar'

describe('Módulo K - Radar de Prospecção Luaria.IA', () => {
  it('calcula score de prioridade alta para demandas de IA e automação', () => {
    const calc = calculateRadarScore({
      fitLuaria: 'alto',
      estimatedEffort: 'baixo',
      technicalDifficulty: 'baixa',
      suggestedPriceCents: 350000,
      clientBudgetCents: 300000,
      requestedScope: 'Agente de atendimento 24/7 no WhatsApp com qualificação de leads e integração com CRM',
    })

    expect(calc.score).toBeGreaterThanOrEqual(80)
    expect(calc.priority).toBe('urgente')
    expect(calc.rationale).toContain('Forte alinhamento com soluções de automação e agentes de IA')
  })

  it('penaliza demandas fora de escopo (ex: site simples sem IA)', () => {
    const calc = calculateRadarScore({
      fitLuaria: 'fora_de_escopo',
      estimatedEffort: 'baixo',
      technicalDifficulty: 'baixa',
      suggestedPriceCents: 50000,
      requestedScope: 'Site simples em WordPress institucional sem automação',
    })

    expect(calc.score).toBeLessThan(60)
    expect(calc.rationale).toContain('Demanda fora do escopo estratégico de IA')
  })

  it('lista oportunidades iniciais no repositório com dados persistidos', async () => {
    const list = await radarRepository.list()
    expect(list.length).toBeGreaterThanOrEqual(4)
    expect(list.some((o) => o.source === 'workana')).toBe(true)
    expect(list.some((o) => o.source === 'prospeccao_direta')).toBe(true)
  })

  it('exporta oportunidades em formato JSON e CSV corretamente', () => {
    const json = exportRadarToJson(INITIAL_RADAR_OPPORTUNITIES)
    expect(json).toContain('Automação de Atendimento WhatsApp')
    const parsed = JSON.parse(json)
    expect(Array.isArray(parsed)).toBe(true)

    const csv = exportRadarToCsv(INITIAL_RADAR_OPPORTUNITIES)
    expect(csv).toContain('Título,Cliente/Empresa,Origem')
    expect(csv).toContain('workana')
  })
})
