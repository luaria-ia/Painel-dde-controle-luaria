import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkOllamaHealth,
  executeOllama,
  getOllamaConfig,
  saveOllamaConfig,
} from './ollamaService'

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

describe('ollamaService', () => {
  beforeEach(() => {
    mockStorage.clear()
    vi.restoreAllMocks()
  })

  it('retorna configuração padrão e permite salvar nova configuração', () => {
    const config = getOllamaConfig()
    expect(config.endpoint).toBe('http://localhost:11434')
    expect(config.activeModel).toBe('llama3.2:latest')

    saveOllamaConfig({ endpoint: 'http://127.0.0.1:11434', activeModel: 'mistral' })
    const updated = getOllamaConfig()
    expect(updated.endpoint).toBe('http://127.0.0.1:11434')
    expect(updated.activeModel).toBe('mistral')
  })

  it('reporta indisponibilidade graciosamente quando o Ollama está offline sem lançar exceções não tratadas', async () => {
    // Mock fetch offline/network failure
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Failed to fetch'))

    const health = await checkOllamaHealth()
    expect(health.available).toBe(false)
  })

  it('identifica modelos disponíveis quando o Ollama responde com sucesso', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo | URL) => {
      const u = url.toString()
      if (u.includes('/api/tags')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              models: [
                { name: 'llama3.2:latest', size: 2000000000, modified_at: '2026-10-09' },
                { name: 'mistral:latest', size: 4000000000, modified_at: '2026-10-09' },
              ],
            }),
        } as Response)
      }
      return Promise.reject(new Error('Unknown url'))
    })

    const health = await checkOllamaHealth()
    expect(health.available).toBe(true)
    expect(health.models?.length).toBe(2)
    expect(health.models).toContain('llama3.2:latest')
  })

  it('executa inferência chamando o endpoint do Ollama e medindo duração', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          response: 'Estratégia comercial elaborada com sucesso pelo Llama 3.2.',
          prompt_eval_count: 45,
          eval_count: 82,
        }),
    } as Response)

    const res = await executeOllama('Crie um plano comercial', { model: 'llama3.2' })
    expect(res.text).toBe('Estratégia comercial elaborada com sucesso pelo Llama 3.2.')
    expect(res.evalCount).toBe(82)
    expect(res.durationMs).toBeGreaterThanOrEqual(0)
  })
})
