import type { OllamaHealthStatus } from '@/types/agents'

const CONFIG_KEY = 'business_os_ollama_config'
export const DEFAULT_OLLAMA_ENDPOINT = 'http://localhost:11434'
export const DEFAULT_OLLAMA_MODEL = 'llama3.2:latest'

export interface OllamaConfig {
  endpoint: string
  activeModel: string
  temperature: number
}

export function getOllamaConfig(): OllamaConfig {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CONFIG_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        endpoint: parsed.endpoint || DEFAULT_OLLAMA_ENDPOINT,
        activeModel: parsed.activeModel || DEFAULT_OLLAMA_MODEL,
        temperature: parsed.temperature ?? 0.7,
      }
    }
  } catch {
    /* fallback to defaults */
  }
  return {
    endpoint: DEFAULT_OLLAMA_ENDPOINT,
    activeModel: DEFAULT_OLLAMA_MODEL,
    temperature: 0.7,
  }
}

export function saveOllamaConfig(config: Partial<OllamaConfig>): OllamaConfig {
  const current = getOllamaConfig()
  const updated = { ...current, ...config }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(updated))
    }
  } catch {
    /* ignore storage errors */
  }
  return updated
}

/** Tenta o endpoint direto ou via proxy de desenvolvimento se houver falha de CORS */
function getEndpointUrls(customUrl?: string): string[] {
  const base = (customUrl || getOllamaConfig().endpoint).replace(/\/$/, '')
  return [base, '/ollama-local']
}

export async function checkOllamaHealth(customUrl?: string): Promise<OllamaHealthStatus> {
  const urls = getEndpointUrls(customUrl)
  const start = performance.now()

  let lastError: string | undefined
  for (const url of urls) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)

      const res = await fetch(`${url}/api/tags`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const models = Array.isArray(data.models) ? data.models.map((m: { name: string }) => m.name) : []
        const currentActive = getOllamaConfig().activeModel
        const activeModel = models.includes(currentActive)
          ? currentActive
          : models[0] || currentActive || DEFAULT_OLLAMA_MODEL

        return {
          available: true,
          endpoint: url.startsWith('/') ? DEFAULT_OLLAMA_ENDPOINT : url,
          models,
          activeModel,
          latencyMs: Math.round(performance.now() - start),
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Falha na conexão'
    }
  }

  return {
    available: false,
    endpoint: customUrl || getOllamaConfig().endpoint,
    models: [],
    activeModel: getOllamaConfig().activeModel,
    error: lastError || 'Ollama offline ou não instalado no MacBook',
  }
}

export interface OllamaExecuteOptions {
  model?: string
  systemPrompt?: string
  temperature?: number
}

export interface OllamaExecutionResponse {
  text: string
  durationMs: number
  evalCount?: number
  modelUsed: string
}

export async function executeOllama(
  prompt: string,
  options: OllamaExecuteOptions = {},
): Promise<OllamaExecutionResponse> {
  const config = getOllamaConfig()
  const model = options.model || config.activeModel || DEFAULT_OLLAMA_MODEL
  const urls = getEndpointUrls()

  const start = performance.now()
  let lastError = 'Ollama não respondeu'

  for (const url of urls) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000) // 90s timeout for local inference

      const res = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          prompt,
          system: options.systemPrompt || '',
          stream: false,
          options: {
            temperature: options.temperature ?? config.temperature ?? 0.7,
          },
        }),
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const durationMs = Math.round(performance.now() - start)
        return {
          text: data.response || '',
          durationMs: data.total_duration ? Math.round(data.total_duration / 1_000_000) : durationMs,
          evalCount: data.eval_count || undefined,
          modelUsed: model,
        }
      } else {
        const errText = await res.text().catch(() => '')
        lastError = `Ollama retornou status ${res.status}: ${errText}`
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Erro ao comunicar com Ollama'
    }
  }

  throw new Error(
    `Falha na execução local com Ollama: ${lastError}. Certifique-se de que o Ollama está aberto no seu Mac executando: ollama run ${model}`,
  )
}
