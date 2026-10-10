import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowDown } from 'lucide-react'
import { Field, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { cn } from '@/lib/utils'
import { aiUsageRepository } from '@/repositories'
import type { AIServerStatus } from '@/services/ai/providers/edgeProvider'
import { useData } from '@/store/useData'
import type { AICascadePrefs, AIUsageLog, CascadePrivacy, CascadeStrategy } from '@/types'

/** Motivos de fallback em linguagem simples (sem jargão técnico). */
export const REASON_LABEL: Record<string, string> = {
  rate_limit: 'limite por minuto',
  quota_exceeded: 'cota diária esgotada',
  timeout: 'demorou demais',
  unavailable: 'indisponível',
  server_error: 'erro no provedor',
  network: 'falha de conexão',
  model_not_found: 'modelo não encontrado',
  invalid_key: 'chave inválida',
  bad_request: 'pedido inválido',
  refusal: 'bloqueado por segurança',
  bad_output: 'resposta inválida',
  circuit_open: 'pausado (falhas recentes)',
  sensitive_data: 'dados sensíveis',
  deadline: 'tempo total esgotado',
}

const TASK_LABEL: Record<string, string> = {
  chat: 'Assistente',
  project_summary: 'Resumo do projeto',
  daily_briefing: 'Briefing do dia',
  finance_analysis: 'Financeiro',
  client_brief: 'Cliente',
  content_ideas: 'Ideias de conteúdo',
  content_assist: 'Texto de conteúdo',
  briefing_to_tasks: 'Briefing → tarefas',
}

function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn('relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50', on ? 'bg-accent' : 'bg-line-strong')}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} />
    </button>
  )
}

/** Configuração da cascata Gemini Free #1 → #2 → #3 → Paid (Configurações → IA). */
export function AICascadeSection({ status }: { status: AIServerStatus | null }) {
  const { settings, updateSettings } = useData()
  const toast = useToast()
  const prefs = settings.aiCascade
  const defaults = status?.cascadeDefaults ?? []

  const layers = defaults.map((d) => {
    const p = prefs.layers.find((l) => l.id === d.id)
    return { ...d, model: p?.model ?? d.model, enabled: p?.enabled ?? d.enabled }
  })
  const hasKey = (tier: 'free' | 'paid', provider: string) =>
    provider === 'anthropic' ? !!status?.providers.anthropic : tier === 'paid' ? !!status?.providers.geminiPaid : !!status?.providers.gemini

  const save = async (next: Partial<AICascadePrefs>, msg = 'Cascata atualizada') => {
    if (await updateSettings({ aiCascade: { ...prefs, ...next } })) toast.success(msg)
  }
  const setLayer = (id: string, patch: { model?: string; enabled?: boolean }) => {
    const others = prefs.layers.filter((l) => l.id !== id)
    const current = prefs.layers.find((l) => l.id === id) ?? { id }
    save({ layers: [...others, { ...current, ...patch }] })
  }

  // Opções de modelo: os disponíveis para a chave + os já configurados.
  const modelOptions = (current: string) => Array.from(new Set([current, ...defaults.map((d) => d.model), ...(status?.geminiModels ?? [])])).filter(Boolean)
  const freeModels = layers.filter((l) => l.tier === 'free' && l.enabled).map((l) => l.model)
  const duplicated = new Set(freeModels.filter((m, i) => freeModels.indexOf(m) !== i))

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line p-4">
      <div>
        <p className="text-sm font-semibold">Cascata de IA</p>
        <p className="mt-0.5 text-[12.5px] text-muted">
          O sistema utiliza primeiro as opções gratuitas e só utiliza a opção paga quando as anteriores não estiverem disponíveis. Se a primeira responder, nenhuma outra é chamada.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Estratégia">
          {(id) => (
            <Select
              id={id}
              value={prefs.strategy}
              options={[
                { value: 'auto', label: 'Automática (grátis → pago)' },
                { value: 'free_only', label: 'Somente gratuito (nunca pagar)' },
                { value: 'paid_only', label: 'Somente pago' },
              ]}
              onChange={(e) => save({ strategy: e.target.value as CascadeStrategy })}
            />
          )}
        </Field>
        <Field label="Dados sensíveis (clientes e financeiro)">
          {(id) => (
            <Select
              id={id}
              value={prefs.privacy}
              options={[
                { value: 'allow_free', label: 'Podem usar as camadas gratuitas' },
                { value: 'paid_for_sensitive', label: 'Só na camada paga (mais privacidade)' },
              ]}
              onChange={(e) => save({ privacy: e.target.value as CascadePrivacy })}
            />
          )}
        </Field>
      </div>

      {!defaults.length ? (
        <p className="text-[12.5px] text-subtle">Carregando a configuração do servidor…</p>
      ) : (
        <ol className="flex flex-col items-stretch">
          {layers.map((l, i) => {
            const keyOk = hasKey(l.tier, l.provider)
            const skippedByStrategy = (prefs.strategy === 'free_only' && l.tier === 'paid') || (prefs.strategy === 'paid_only' && l.tier === 'free')
            return (
              <li key={l.id} className="flex flex-col items-stretch">
                {i > 0 && <ArrowDown className="mx-auto my-1 h-3.5 w-3.5 text-subtle" />}
                <div className={cn('flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center', l.enabled && !skippedByStrategy ? 'border-line' : 'border-dashed border-line opacity-60')}>
                  <div className="flex min-w-0 items-center gap-2 sm:w-44">
                    <span aria-hidden>{l.tier === 'free' ? '🟢' : '🟡'}</span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium">
                        {l.priority}. {l.label}
                      </p>
                      <p className={cn('text-[11.5px]', keyOk ? 'text-subtle' : 'text-amber-700 dark:text-amber-400')}>
                        {keyOk ? `${l.tier === 'free' ? 'Gratuito' : 'Pago'} · ${Math.round(l.timeoutMs / 1000)}s · ${l.maxRetries} retry` : `Sem chave (${l.tier === 'paid' ? 'GEMINI_PAID_API_KEY' : 'GEMINI_API_KEY'})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center gap-3">
                    <Select
                      compact
                      className="min-w-0 flex-1"
                      aria-label={`Modelo da camada ${l.label}`}
                      value={l.model}
                      options={modelOptions(l.model).map((m) => ({ value: m, label: m }))}
                      onChange={(e) => setLayer(l.id, { model: e.target.value })}
                    />
                    <Switch on={l.enabled} label={`${l.enabled ? 'Desativar' : 'Ativar'} ${l.label}`} onChange={(v) => setLayer(l.id, { enabled: v })} />
                  </div>
                </div>
                {l.tier === 'free' && l.enabled && duplicated.has(l.model) && (
                  <p className="mt-1 flex items-center gap-1 text-[11.5px] text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" /> Mesmo modelo em outra camada gratuita — elas dividem a mesma cota.
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      )}
      {status && status.geminiModels.length > 0 && (
        <p className="text-[11.5px] text-subtle">{status.geminiModels.length} modelos Gemini disponíveis para a sua chave. Prefira modelos diferentes em cada camada gratuita.</p>
      )}

      <AIUsagePanel />
    </div>
  )
}

/** Uso e custo do mês (registrado pelo servidor, sem conteúdo das conversas). */
function AIUsagePanel() {
  const [logs, setLogs] = useState<AIUsageLog[] | null>(null)
  useEffect(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    aiUsageRepository
      .listSince(monthStart)
      .then(setLogs)
      .catch(() => setLogs([]))
  }, [])

  const summary = useMemo(() => {
    const l = logs ?? []
    const requests = new Set(l.map((x) => x.requestId)).size
    const ok = l.filter((x) => x.status === 'success')
    const paid = ok.filter((x) => x.tier === 'paid')
    const fallbacks = new Set(l.filter((x) => x.status !== 'success').map((x) => x.requestId)).size
    const cost = paid.reduce((a, x) => a + (x.estimatedCostUsd ?? 0), 0)
    const paidTokens = paid.reduce((a, x) => a + (x.inputTokens ?? 0) + (x.outputTokens ?? 0), 0)
    return { requests, free: ok.length - paid.length, paid: paid.length, fallbacks, cost, paidTokens, unknownCost: paid.some((x) => x.estimatedCostUsd == null) }
  }, [logs])

  if (!logs) return null
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <p className="text-[13px] font-semibold">Uso neste mês</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          ['Pedidos', summary.requests],
          ['Respondidos grátis', summary.free],
          ['Respondidos pagos', summary.paid],
          ['Com fallback', summary.fallbacks],
          ['Custo estimado', summary.paid ? `US$ ${summary.cost.toFixed(4)}${summary.unknownCost ? '*' : ''}` : 'US$ 0'],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg bg-surface-2/60 px-3 py-2">
            <p className="text-[11px] text-subtle">{label}</p>
            <p className="tabular text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
      {summary.unknownCost && <p className="text-[11px] text-subtle">* Para estimar o custo pago, configure o preço do modelo no servidor (AI_PRICE_…). Tokens pagos: {summary.paidTokens.toLocaleString('pt-BR')}.</p>}
      {logs.length > 0 && (
        <details className="text-[12px]">
          <summary className="cursor-pointer text-muted hover:text-fg">Últimas tentativas</summary>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
            {logs.slice(0, 15).map((x) => (
              <li key={x.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-1.5">
                <span className="tabular text-subtle">{new Date(x.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-muted">{TASK_LABEL[x.task] ?? x.task}</span>
                <span>{x.tier === 'free' ? '🟢' : '🟡'} {x.model}</span>
                <span className={cn(x.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-subtle')}>
                  {x.status === 'success' ? 'respondeu' : `${x.status === 'skipped' ? 'pulada' : 'falhou'}: ${REASON_LABEL[x.reason ?? ''] ?? x.reason}`}
                </span>
                {x.durationMs > 0 && <span className="ml-auto tabular text-subtle">{(x.durationMs / 1000).toFixed(1)}s</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
