import { describe, expect, it, vi } from 'vitest'
import { AIError, type AIContext } from './types'

// Simula o servidor de IA (Edge Function) sem chamar a rede.
const serverRun = vi.fn()
vi.mock('./providers/edgeProvider', () => ({ edgeProvider: { id: 'server', run: (...args: unknown[]) => serverRun(...args) } }))

const { runAI } = await import('./aiService')

const context: AIContext = {
  scope: 'project',
  sensitivity: 'internal',
  label: 'Projeto: Teste',
  text: 'contexto',
  facts: { name: 'Teste', tasks: { total: 2, pending: 1, inProgress: 0, done: 1, overdue: [], today: [], next: [] } },
}
const settings = (aiProvider: 'auto' | 'gemini' | 'anthropic' | 'demo') => ({
  aiProvider,
  aiModel: 'gemini-flash-latest' as const,
  aiInstructions: '',
  aiCascade: { strategy: 'auto' as const, privacy: 'allow_free' as const, layers: [] },
})

describe('aiService (frontend → gateway)', () => {
  it('TESTE 6: sem chave no servidor + modo automático → demonstração, sem quebrar', async () => {
    serverRun.mockRejectedValueOnce(new AIError('not_configured', 'IA não configurada.'))
    const res = await runAI({ task: 'project_summary', context, input: 'resuma' }, settings('auto'))
    expect(res.source).toBe('demo')
    expect(res.notice).toMatch(/não configurada/i)
    expect(res.text.length).toBeGreaterThan(0)
  })

  it('modo Demonstração nunca chama o servidor', async () => {
    serverRun.mockClear()
    const res = await runAI({ task: 'daily_briefing', context, input: 'briefing' }, settings('demo'))
    expect(serverRun).not.toHaveBeenCalled()
    expect(res.source).toBe('demo')
  })

  it('envia ao gateway a tarefa, a cascata e a sensibilidade do contexto', async () => {
    serverRun.mockResolvedValueOnce({ text: 'ok', source: 'ai' })
    await runAI({ task: 'chat', context: { ...context, sensitivity: 'sensitive' }, input: 'oi' }, settings('gemini'))
    const req = serverRun.mock.calls.at(-1)![0]
    expect(req).toMatchObject({ task: 'chat', provider: 'gemini', sensitivity: 'sensitive', cascade: { strategy: 'auto' } })
  })

  it('quando todas as camadas falham, repassa a mensagem amigável (não cai em demonstração)', async () => {
    serverRun.mockRejectedValueOnce(new AIError('all_failed', 'Não foi possível processar sua solicitação no momento. Tente novamente em alguns instantes.'))
    await expect(runAI({ task: 'chat', context, input: 'oi' }, settings('auto'))).rejects.toThrow(/Tente novamente em alguns instantes/)
  })
})
