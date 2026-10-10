import { useCallback, useState } from 'react'
import { AIError, runAI, type AIRequest, type AIResult } from '@/services/ai/aiService'
import { useData } from '@/store/useData'

/** Estado de uma chamada de IA (carregando, resultado, erro). */
export function useAI() {
  const { settings } = useData()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (req: AIRequest): Promise<AIResult | null> => {
      setLoading(true)
      setError(null)
      try {
        const res = await runAI(req, settings)
        setResult(res)
        return res
      } catch (err) {
        setError(err instanceof AIError || err instanceof Error ? err.message : 'Não foi possível gerar a resposta.')
        return null
      } finally {
        setLoading(false)
      }
    },
    [settings],
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { run, loading, result, error, reset }
}
