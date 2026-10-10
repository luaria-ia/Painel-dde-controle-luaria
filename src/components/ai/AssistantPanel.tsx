import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUp, Bot, Eye, RotateCcw, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAIContext, type AIScopeRef } from '@/hooks/useAIContext'
import { cn } from '@/lib/utils'
import { AIError, runAI } from '@/services/ai/aiService'
import type { AIContext, AIMessage, AIResult, AITask } from '@/services/ai/types'
import { useData } from '@/store/useData'
import { AIErrorBox, AILoading, AISourceBadge } from './AIResultCard'
import { Markdown } from './Markdown'

interface Turn {
  question: string
  result?: AIResult
  error?: string
}

interface Props {
  scope: AIScopeRef
  /** Rótulo do escopo (ex.: "Social Media"). */
  scopeLabel: string
  suggestions: string[]
  /** Tarefa usada nas perguntas (chat padrão; finance_analysis no financeiro). */
  task?: AITask
  className?: string
  /** Altura do histórico em telas grandes. */
  tall?: boolean
}

/**
 * Assistente contextual: conversa sobre UM escopo (projeto, cliente, financeiro ou dia).
 * O contexto é montado só com os dados desse escopo e pode ser inspecionado pelo usuário.
 * O assistente nunca altera dados — apenas responde e sugere.
 */
export function AssistantPanel({ scope, scopeLabel, suggestions, task = 'chat', className, tall }: Props) {
  const { settings } = useData()
  const buildContext = useAIContext()
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [context, setContext] = useState<AIContext | null>(null)
  const [showContext, setShowContext] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const scopeKey = JSON.stringify(scope)

  // Trocar de escopo começa uma conversa nova (não mistura projetos).
  useEffect(() => {
    setTurns([])
    setContext(null)
  }, [scopeKey])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns, busy])

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || busy) return
    setInput('')
    setBusy(true)
    setTurns((t) => [...t, { question: q }])
    try {
      // Contexto montado na 1ª pergunta e reaproveitado na conversa (dados consistentes).
      const ctx = context ?? (await buildContext(scope))
      setContext(ctx)
      const history: AIMessage[] = turns.filter((t) => t.result).flatMap((t) => [
        { role: 'user' as const, content: t.question },
        { role: 'assistant' as const, content: t.result!.text },
      ])
      const result = await runAI({ task, context: ctx, input: q, history: history.length ? [...history] : undefined }, settings)
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, result } : x)))
    } catch (err) {
      const message = err instanceof AIError || err instanceof Error ? err.message : 'Não foi possível responder.'
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, error: message } : x)))
    } finally {
      setBusy(false)
    }
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ask(input)
    }
  }

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Bot className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Assistente</p>
            <p className="truncate text-[12px] text-subtle">
              Contexto: <span className="font-medium text-muted">{scopeLabel}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {context && (
            <Button size="sm" variant="ghost" icon={Eye} onClick={() => setShowContext(true)}>
              Ver contexto
            </Button>
          )}
          {turns.length > 0 && (
            <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => (setTurns([]), setContext(null))}>
              Nova conversa
            </Button>
          )}
        </div>
      </div>

      <div className={cn('scrollbar-thin flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5', tall ? 'min-h-72 lg:max-h-[60vh]' : 'max-h-[28rem] min-h-40')}>
        {turns.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] text-muted">
              Estou pronto para analisar <strong className="font-medium text-fg">{scopeLabel}</strong> com base nos seus dados. Experimente:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:border-accent/50 hover:text-fg"
                >
                  <Sparkles className="h-3 w-3 text-accent" /> {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="flex items-start justify-end gap-2">
              <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-accent px-3.5 py-2 text-[13.5px] whitespace-pre-wrap text-accent-fg">{t.question}</p>
              <User className="mt-1.5 hidden h-4 w-4 shrink-0 text-subtle sm:block" />
            </div>
            {t.result && (
              <div className="flex items-start gap-2">
                <Bot className="mt-1 hidden h-4 w-4 shrink-0 text-accent sm:block" />
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-line bg-surface-2/40 px-3.5 py-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <AISourceBadge result={t.result} />
                    {t.result.notice && <span className="text-[11.5px] text-subtle">{t.result.notice}</span>}
                  </div>
                  <Markdown text={t.result.text} />
                </div>
              </div>
            )}
            {t.error && <AIErrorBox message={t.error} onRetry={() => (setTurns((x) => x.slice(0, i)), ask(t.question))} />}
          </div>
        ))}
        {busy && <AILoading />}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          maxLength={4000}
          placeholder="Pergunte sobre este contexto…"
          aria-label="Pergunta para o assistente"
          className="max-h-32 min-h-9 flex-1 resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm placeholder:text-subtle focus:border-accent focus:ring-3 focus:ring-ring/40 focus:outline-none"
        />
        <Button type="submit" variant="primary" size="icon" icon={ArrowUp} aria-label="Enviar" disabled={!input.trim() || busy} className="h-9 w-9" />
      </form>

      <Modal open={showContext} onClose={() => setShowContext(false)} title="Contexto enviado à IA" description="Somente estes dados (deste escopo) são usados nas respostas." size="lg">
        <pre className="max-h-[60vh] overflow-auto rounded-lg bg-surface-2 p-3 text-[12px] leading-relaxed whitespace-pre-wrap text-muted">{context?.text}</pre>
      </Modal>
    </div>
  )
}
