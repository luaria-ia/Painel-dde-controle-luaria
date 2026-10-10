import type { Settings } from '@/types'
import { buildMessages, buildSystemPrompt, TASK_EFFORT } from './promptBuilder'
import { demoProvider } from './providers/demoProvider'
import { edgeProvider } from './providers/edgeProvider'
import { AIError, type AIProvider, type AIRequest, type AIResult } from './types'

/**
 * Ponto único de entrada da IA: UI → AIService → (PromptBuilder + ContextBuilder) → Provider.
 *
 * Escolha do provedor (Configurações → IA):
 * - 'auto' / 'gemini' → cascata no servidor (Gemini Free #1 → #2 → #3 → Paid; ver supabase/functions/ai/cascade.ts).
 *                      'auto' sem nenhuma chave → demonstração (avisando).
 * - 'anthropic' → Claude como provedor único (alternativo).
 * - 'demo'      → sempre demonstração.
 *
 * Novos provedores entram implementando AIProvider aqui e um bloco na Edge Function.
 */
const PROVIDERS: Record<string, AIProvider> = { server: edgeProvider, demo: demoProvider }

export async function runAI(req: AIRequest, settings: Pick<Settings, 'aiProvider' | 'aiModel' | 'aiInstructions' | 'aiCascade'>): Promise<AIResult> {
  const providerReq = {
    task: req.task,
    provider: settings.aiProvider === 'demo' ? ('auto' as const) : settings.aiProvider,
    cascade: settings.aiCascade,
    sensitivity: req.context.sensitivity,
    model: settings.aiModel,
    system: buildSystemPrompt(settings.aiInstructions),
    messages: buildMessages(req),
    effort: TASK_EFFORT[req.task],
    jsonSchema: req.jsonSchema,
  }
  if (settings.aiProvider === 'demo') return PROVIDERS.demo.run(providerReq, req)
  try {
    return await PROVIDERS.server.run(providerReq, req)
  } catch (err) {
    if (err instanceof AIError && err.code === 'not_configured') {
      if (settings.aiProvider === 'auto') {
        const demo = await PROVIDERS.demo.run(providerReq, req)
        return { ...demo, notice: 'IA não configurada no servidor — exibindo resposta de demonstração (gerada por regras, não por IA).' }
      }
      throw new AIError('not_configured', 'IA não configurada para este provedor. Adicione a chave (GEMINI_API_KEY ou ANTHROPIC_API_KEY) nos segredos da Edge Function.')
    }
    throw err
  }
}

export { AIError } from './types'
export type { AIContext, AIRequest, AIResult, AITask } from './types'
