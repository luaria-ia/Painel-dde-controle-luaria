import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runAgentTask, runRadarProspectPipeline } from './agentWorkflows'
import { agentRepository } from '@/repositories/agents'
import type { ProspectCompany } from '@/types'

vi.mock('./ollamaService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./ollamaService')>()
  return {
    ...actual,
    checkOllamaHealth: vi.fn().mockResolvedValue({ available: false }),
  }
})

const store = new Map<string, string>()
const mockStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, val: string) => store.set(key, val),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
})

describe('agentWorkflows', () => {
  beforeEach(() => {
    mockStorage.clear()
    vi.restoreAllMocks()
  })

  it('executa tarefa de agente e gera histórico com status concluido', async () => {
    const agents = await agentRepository.listAgents()
    const agent = agents[0]

    const exec = await runAgentTask({
      agent,
      taskTitle: 'Planejamento Q4',
      prompt: 'Definir metas prioritárias para o último trimestre',
      requiresApproval: false,
    })

    expect(exec.id).toBeDefined()
    expect(exec.agentId).toBe(agent.id)
    expect(exec.status).toBe('concluido')
    expect(exec.output.length).toBeGreaterThan(20)
    expect(exec.tokensCount).toBeGreaterThan(0)
  })

  it('cria pendência na fila de aprovação quando a tarefa requer validação humana', async () => {
    const agents = await agentRepository.listAgents()
    const agent = agents.find((a) => a.slug === 'agente-propostas-comerciais') || agents[0]

    const exec = await runAgentTask({
      agent,
      taskTitle: 'Minuta de Proposta Comercial',
      prompt: 'Elaborar proposta de marketing para nova clínica',
      requiresApproval: true,
      approvalActionType: 'proposta',
    })

    expect(exec.status).toBe('aguardando_aprovacao')
    expect(exec.approvalId).toBeDefined()
  })

  it('executa o pipeline completo do Radar de Prospecção encadeando análise e proposta', async () => {
    const dummyProspect: ProspectCompany = {
      id: 'test-prospect-1',
      name: 'Odonto Excellence Premium',
      segment: 'Saúde & Odontologia',
      location: 'Curitiba - PR',
      website: 'https://odontoexcellence.teste',
      channels: { instagram: '@odonto.excellence' },
      sourcesConsulted: ['Instagram'],
      lastVerifiedAt: '2026-10-09',
      opportunities: 'Sem automação de agendamento por WhatsApp.',
      observations: 'Perfil com 15k seguidores mas sem link direto de conversão.',
      confidenceLevel: 'alto',
      status: 'qualificada',
      nextStep: 'Apresentar proposta de fluxo de agendamento.',
      clientId: null,
      boardCardId: null,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await runRadarProspectPipeline(dummyProspect)

    expect(result.analiseOutput).toBeDefined()
    expect(result.analiseOutput.length).toBeGreaterThan(50)
    expect(result.propostaOutput).toBeDefined()
    expect(result.propostaOutput.length).toBeGreaterThan(50)
    expect(result.approvalId).toBeDefined()
  })
})
