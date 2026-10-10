import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AIError, type AIProvider, type AIResult } from '../types'

/**
 * Provedor real: chama a Edge Function "ai" no Supabase, que guarda as chaves como segredos
 * do servidor e fala com o Google Gemini ou a Anthropic. O navegador nunca vê as chaves.
 */
async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('ai', { body })
  if (!error) return data as T
  if (error instanceof FunctionsHttpError) {
    let payload: { code?: string; message?: string } = {}
    try {
      payload = await error.context.json()
    } catch {
      /* corpo não-JSON */
    }
    throw new AIError(payload.code ?? 'error', payload.message ?? 'Falha ao consultar a IA.')
  }
  throw new AIError('network', 'Não foi possível falar com o servidor de IA.')
}

export const edgeProvider: AIProvider = {
  id: 'server',
  async run(req) {
    const res = await invoke<{
      text: string
      data?: unknown
      model: string
      provider: string
      tier: 'free' | 'paid'
      layerLabel: string
      truncated?: boolean
      attempts?: Array<{ status: string }>
    }>({
      action: 'run',
      task: req.task,
      provider: req.provider,
      cascade: req.cascade,
      sensitivity: req.sensitivity,
      model: req.model,
      system: req.system,
      messages: req.messages,
      effort: req.effort,
      json_schema: req.jsonSchema,
    })
    const result: AIResult = {
      text: res.text,
      data: res.data,
      source: 'ai',
      model: res.model,
      servedBy: {
        label: res.layerLabel,
        tier: res.tier,
        provider: res.provider,
        fallback: (res.attempts ?? []).some((a) => a.status !== 'success'),
      },
    }
    if (res.truncated) result.notice = 'A resposta foi interrompida por tamanho.'
    return result
  },
}

export interface AIServerStatus {
  configured: boolean
  providers: { gemini: boolean; geminiPaid: boolean; anthropic: boolean }
  cascadeDefaults: Array<{ id: string; label: string; provider: string; model: string; tier: 'free' | 'paid'; enabled: boolean; priority: number; timeoutMs: number; maxRetries: number }>
  geminiModels: string[]
}

export async function fetchAIStatus(): Promise<AIServerStatus> {
  return invoke({ action: 'status' })
}
