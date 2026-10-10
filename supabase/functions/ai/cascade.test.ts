import { describe, expect, it, vi } from 'vitest'
import {
  BREAKER_THRESHOLD,
  defaultConfig,
  layerKey,
  LayerError,
  mergeUserConfig,
  nextBreaker,
  planLayers,
  runCascade,
  type BreakerState,
  type CascadeConfig,
  type KeyRef,
  type LayerConfig,
  type Reason,
} from './cascade'

const ALL_KEYS: Partial<Record<KeyRef, string>> = { GEMINI_API_KEY: 'free', GEMINI_PAID_API_KEY: 'paid' }

/** Provedor simulado: para cada camada, uma fila de respostas ('ok' ou um motivo de erro). */
function fakeProvider(script: Record<string, Array<'ok' | Reason>>) {
  const calls: string[] = []
  const call = vi.fn(async (layer: LayerConfig) => {
    calls.push(layer.id)
    const next = script[layer.id]?.shift() ?? 'ok'
    if (next === 'ok') return { text: `resposta de ${layer.id}`, inputTokens: 100, outputTokens: 50 }
    throw new LayerError(next, next)
  })
  return { call, calls }
}

const run = (script: Record<string, Array<'ok' | Reason>>, config: CascadeConfig = defaultConfig(), breakers = new Map<string, BreakerState>()) => {
  const p = fakeProvider(script)
  const plan = planLayers(config, ALL_KEYS, 'internal')
  return runCascade({ plan, call: p.call, breakers, sleep: async () => {}, backoffMs: 1 }).then((outcome) => ({ outcome, calls: p.calls }))
}

describe('Cascata de IA — cenários pedidos', () => {
  it('TESTE 1: FREE #1 funciona → só FREE #1 é chamado', async () => {
    const { outcome, calls } = await run({})
    expect(calls).toEqual(['free1'])
    expect(outcome.ok && outcome.layer.id).toBe('free1')
    expect(outcome.attempts.map((a) => a.status)).toEqual(['success'])
  })

  it('TESTE 2: FREE #1 = 429, FREE #2 funciona → para no #2 (sem retry no 429)', async () => {
    const { outcome, calls } = await run({ free1: ['rate_limit'] })
    expect(calls).toEqual(['free1', 'free2'])
    expect(outcome.ok && outcome.layer.id).toBe('free2')
    expect(outcome.attempts.map((a) => `${a.layer}:${a.status}:${a.reason ?? ''}`)).toEqual(['free1:error:rate_limit', 'free2:success:'])
    expect(outcome.attempts[1].fallbackFrom).toBe('free1')
  })

  it('TESTE 3: FREE #1 e #2 falham, FREE #3 funciona → para no #3', async () => {
    const { outcome, calls } = await run({ free1: ['rate_limit'], free2: ['quota_exceeded'] })
    expect(calls).toEqual(['free1', 'free2', 'free3'])
    expect(outcome.ok && outcome.layer.id).toBe('free3')
  })

  it('TESTE 4: os 3 gratuitos falham → PAID responde', async () => {
    const { outcome, calls } = await run({ free1: ['rate_limit'], free2: ['quota_exceeded'], free3: ['timeout'] })
    expect(calls).toEqual(['free1', 'free2', 'free3', 'paid'])
    expect(outcome.ok && outcome.layer.tier).toBe('paid')
  })

  it('TESTE 5: todos falham → all_failed (mensagem amigável no gateway)', async () => {
    const { outcome, calls } = await run({ free1: ['rate_limit'], free2: ['quota_exceeded'], free3: ['timeout'], paid: ['timeout'] })
    expect(calls).toEqual(['free1', 'free2', 'free3', 'paid'])
    expect(outcome.ok).toBe(false)
    expect(!outcome.ok && outcome.code).toBe('all_failed')
  })

  it('TESTE 6: nenhuma chave → not_configured, nenhuma chamada', async () => {
    const p = fakeProvider({})
    const plan = planLayers(defaultConfig(), {}, 'internal')
    const outcome = await runCascade({ plan, call: p.call, breakers: new Map() })
    expect(p.calls).toEqual([])
    expect(!outcome.ok && outcome.code).toBe('not_configured')
  })
})

describe('Retry, erros permanentes e custo', () => {
  it('erro temporário (5xx) faz 1 retry na MESMA camada e depois segue para a próxima', async () => {
    const { outcome, calls } = await run({ free1: ['server_error', 'server_error'] })
    expect(calls).toEqual(['free1', 'free1', 'free2'])
    expect(outcome.attempts[0]).toMatchObject({ layer: 'free1', status: 'error', retries: 1 })
  })

  it('retry que funciona não chama a próxima camada', async () => {
    const { outcome, calls } = await run({ free1: ['unavailable', 'ok'] })
    expect(calls).toEqual(['free1', 'free1'])
    expect(outcome.ok && outcome.attempts[0].retries).toBe(1)
  })

  it('pedido inválido NÃO faz fallback (falharia em qualquer camada)', async () => {
    const { outcome, calls } = await run({ free1: ['bad_request'] })
    expect(calls).toEqual(['free1'])
    expect(!outcome.ok && outcome.code).toBe('bad_request')
  })

  it('bloqueio de segurança NÃO faz fallback', async () => {
    const { outcome, calls } = await run({ free1: ['refusal'] })
    expect(calls).toEqual(['free1'])
    expect(!outcome.ok && outcome.code).toBe('refusal')
  })

  it('chave gratuita inválida pula as outras camadas gratuitas e vai direto para a paga', async () => {
    const { outcome, calls } = await run({ free1: ['invalid_key'] })
    expect(calls).toEqual(['free1', 'paid'])
    expect(outcome.attempts.map((a) => `${a.layer}:${a.status}:${a.reason ?? ''}`)).toEqual([
      'free1:error:invalid_key',
      'free2:skipped:invalid_key',
      'free3:skipped:invalid_key',
      'paid:success:',
    ])
  })

  it('estratégia "Somente gratuito" nunca chama a camada paga', async () => {
    const config = mergeUserConfig(defaultConfig(), { strategy: 'free_only' })
    const { outcome, calls } = await run({ free1: ['rate_limit'], free2: ['rate_limit'], free3: ['rate_limit'] }, config)
    expect(calls).toEqual(['free1', 'free2', 'free3'])
    expect(!outcome.ok && outcome.code).toBe('all_failed')
  })

  it('camada desativada não é chamada', async () => {
    const config = mergeUserConfig(defaultConfig(), { layers: [{ id: 'free2', enabled: false }] })
    const { calls } = await run({ free1: ['rate_limit'] }, config)
    expect(calls).toEqual(['free1', 'free3'])
  })

  it('privacidade: dados sensíveis pulam camadas gratuitas quando a política exige', async () => {
    const config = mergeUserConfig(defaultConfig(), { privacy: 'paid_for_sensitive' })
    const p = fakeProvider({})
    const plan = planLayers(config, ALL_KEYS, 'sensitive')
    const outcome = await runCascade({ plan, call: p.call, breakers: new Map() })
    expect(p.calls).toEqual(['paid'])
    expect(outcome.attempts.filter((a) => a.status === 'skipped').map((a) => a.reason)).toEqual(['sensitive_data', 'sensitive_data', 'sensitive_data'])
  })

  it('valida modelos vindos do usuário (ignora valores fora do padrão)', () => {
    const config = mergeUserConfig(defaultConfig(), { layers: [{ id: 'free1', model: 'gemini-2.5-flash-lite' }, { id: 'free2', model: '../hack' }] })
    expect(config.layers[0].model).toBe('gemini-2.5-flash-lite')
    expect(config.layers[1].model).toBe('gemini-flash-lite-latest')
  })
})

describe('Circuit breaker', () => {
  it('cota diária esgotada abre o circuito: próximas requisições pulam a camada sem chamá-la', async () => {
    const first = await run({ free1: ['quota_exceeded'] })
    const breakers = first.outcome.breakers
    const free1 = defaultConfig().layers[0]
    expect(breakers.get(layerKey(free1))?.openUntil).toBeGreaterThan(Date.now())

    const second = await run({}, defaultConfig(), breakers)
    expect(second.calls).toEqual(['free2']) // free1 nem foi chamado
    expect(second.outcome.attempts[0]).toMatchObject({ layer: 'free1', status: 'skipped', reason: 'circuit_open' })
  })

  it(`${BREAKER_THRESHOLD} falhas temporárias seguidas abrem o circuito; sucesso zera`, () => {
    const now = 1_000
    let s: BreakerState | undefined
    for (let i = 0; i < BREAKER_THRESHOLD - 1; i++) s = nextBreaker(s, { ok: false, reason: 'server_error' }, now)
    expect(s!.openUntil).toBeNull()
    s = nextBreaker(s, { ok: false, reason: 'server_error' }, now)
    expect(s.openUntil).toBeGreaterThan(now)
    expect(nextBreaker(s, { ok: true }, now)).toEqual({ failures: 0, openUntil: null })
  })
})
