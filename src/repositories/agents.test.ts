import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  agentApprovalRepository,
  agentExecutionRepository,
  agentRepository,
} from './agents'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: null, error: { message: 'offline' } }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'offline' } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'offline' } }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: { message: 'offline' } }),
      }),
    }),
  },
}))

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

describe('agentRepository', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('lista os 8 departamentos empresariais com cores e metadados', async () => {
    const depts = await agentRepository.listDepartments()
    expect(depts.length).toBe(8)
    const slugs = depts.map((d) => d.slug)
    expect(slugs).toContain('diretoria')
    expect(slugs).toContain('marketing')
    expect(slugs).toContain('comercial')
    expect(slugs).toContain('financeiro')
    expect(slugs).toContain('projetos')
    expect(slugs).toContain('atendimento')
    expect(slugs).toContain('estudos')
    expect(slugs).toContain('tecnologia')
  })

  it('lista todos os 27 agentes iniciais pré-configurados', async () => {
    const agents = await agentRepository.listAgents()
    expect(agents.length).toBe(27)
    expect(agents[0]).toHaveProperty('name')
    expect(agents[0]).toHaveProperty('role')
    expect(agents[0]).toHaveProperty('departmentSlug')
    expect(agents[0]).toHaveProperty('systemInstructions')
    expect(agents[0]).toHaveProperty('model')
    expect(agents[0]).toHaveProperty('authorizedTools')
  })

  it('permite filtrar agentes por departamento', async () => {
    const comercialAgents = await agentRepository.listAgentsByDepartment('comercial')
    expect(comercialAgents.length).toBe(5)
    comercialAgents.forEach((a) => {
      expect(a.departmentSlug).toBe('comercial')
    })
  })

  it('permite atualizar a identidade e comportamento de um agente', async () => {
    const agents = await agentRepository.listAgents()
    const target = agents[0]

    const updated = await agentRepository.updateAgent(target.id, {
      name: 'Agente Estratégico Atualizado',
      temperature: 0.2,
      primaryGoal: 'Meta operacional refinada',
    })

    expect(updated).not.toBeNull()
    expect(updated?.name).toBe('Agente Estratégico Atualizado')
    expect(updated?.temperature).toBe(0.2)
    expect(updated?.primaryGoal).toBe('Meta operacional refinada')

    const reloaded = await agentRepository.getAgentById(target.id)
    expect(reloaded?.name).toBe('Agente Estratégico Atualizado')
  })
})

describe('agentExecutionRepository', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('registra e lista execuções recentes com tokens e duração reais', async () => {
    const exec = await agentExecutionRepository.record({
      agentId: 'agente-test-1',
      agentName: 'Agente de Teste',
      departmentSlug: 'tecnologia',
      taskTitle: 'Validação de compilação',
      prompt: 'Execute linting e testes',
      output: 'Sucesso: 0 erros encontrados.',
      durationMs: 450,
      tokensCount: 30,
      status: 'concluido',
      sourceModule: 'manual',
    })

    expect(exec.id).toBeDefined()
    expect(exec.taskTitle).toBe('Validação de compilação')
    expect(exec.status).toBe('concluido')

    const recent = await agentExecutionRepository.listRecent()
    expect(recent.some((e) => e.id === exec.id)).toBe(true)
  })
})

describe('agentApprovalRepository', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('cria item na fila de aprovação e permite aprovar ou rejeitar', async () => {
    const approval = await agentApprovalRepository.create({
      executionId: 'exec-123',
      agentId: 'agente-comercial-1',
      agentName: 'Agente de Propostas Comerciais',
      departmentSlug: 'comercial',
      title: 'Proposta Comercial para Clínica Lumina',
      description: 'Envio de proposta revisada por IA',
      actionType: 'proposta',
      contentToApprove: 'Proposta de R$ 4.500/mês para serviços de mídia.',
    })

    expect(approval.status).toBe('pendente')

    const pending = await agentApprovalRepository.listPending()
    expect(pending.some((p) => p.id === approval.id)).toBe(true)

    const resolved = await agentApprovalRepository.resolve(approval.id, 'aprovado', 'Validado pelo gestor')
    expect(resolved).not.toBeNull()
    expect(resolved?.status).toBe('aprovado')

    const pendingAfter = await agentApprovalRepository.listPending()
    expect(pendingAfter.some((p) => p.id === approval.id)).toBe(false)
  })
})
