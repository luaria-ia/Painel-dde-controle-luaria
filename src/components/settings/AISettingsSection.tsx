import { useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, KeyRound, RefreshCw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { AI_DEFAULT_MODEL, AI_MODELS } from '@/config/labels'
import { fetchAIStatus, type AIServerStatus } from '@/services/ai/providers/edgeProvider'
import { AICascadeSection } from './AICascadeSection'
import { useData } from '@/store/useData'
import type { AIModel, AIProviderPreference } from '@/types'

type Status = { state: 'checking' } | { state: 'error' } | ({ state: 'ok'; gemini: boolean; geminiPaid: boolean; anthropic: boolean } & { raw: AIServerStatus })

/** Configurações → IA. As chaves NÃO são configuradas aqui (ficam no servidor). */
export function AISettingsSection() {
  const { settings, updateSettings } = useData()
  const toast = useToast()
  const [status, setStatus] = useState<Status>({ state: 'checking' })
  const [instructions, setInstructions] = useState(settings.aiInstructions)

  const check = () => {
    setStatus({ state: 'checking' })
    fetchAIStatus()
      .then((s) => setStatus({ state: 'ok', ...s.providers, raw: s }))
      .catch(() => setStatus({ state: 'error' }))
  }
  useEffect(check, [])

  const save = async (patch: Parameters<typeof updateSettings>[0], msg = 'Preferência salva') => {
    if (await updateSettings(patch)) toast.success(msg)
  }

  // Provedor efetivo (para filtrar os modelos): no automático, o que tiver chave (Gemini primeiro).
  const effective =
    settings.aiProvider === 'gemini' || settings.aiProvider === 'anthropic'
      ? settings.aiProvider
      : status.state === 'ok' && !status.gemini && status.anthropic
        ? 'anthropic'
        : 'gemini'
  const models = AI_MODELS.filter((m) => m.provider === effective)

  const changeProvider = (p: AIProviderPreference) => {
    const target = p === 'anthropic' ? 'anthropic' : 'gemini'
    const model = AI_MODELS.some((m) => m.value === settings.aiModel && m.provider === target) ? settings.aiModel : AI_DEFAULT_MODEL[target]
    save({ aiProvider: p, aiModel: model as AIModel })
  }

  const configured = status.state === 'ok' && (status.gemini || status.geminiPaid || status.anthropic)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-xl border border-line p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 text-[13px]">
          {status.state === 'checking' ? (
            <RefreshCw className="mt-0.5 h-4 w-4 animate-spin text-subtle" />
          ) : configured ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 text-amber-500" />
          )}
          <div>
            <p className="font-medium">
              {status.state === 'checking' ? 'Verificando…' : status.state === 'error' ? 'Não foi possível verificar' : configured ? 'IA configurada no servidor' : 'IA não configurada'}
            </p>
            {status.state === 'ok' && (
              <p className="text-[12.5px] text-muted">
                Gemini grátis: {status.gemini ? '✓' : '— sem chave'} · Gemini pago: {status.geminiPaid ? '✓' : '— sem chave'} · Claude: {status.anthropic ? '✓' : '— sem chave'}
                {!configured && ' · usando respostas de demonstração (identificadas como tal).'}
              </p>
            )}
          </div>
        </div>
        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={check}>
          Verificar
        </Button>
      </div>

      {status.state === 'ok' && !status.gemini && (
        <div className="flex items-start gap-2.5 rounded-xl bg-surface-2 p-3.5 text-[12.5px] leading-relaxed text-muted">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
          <div>
            <p className="font-medium text-fg">Ativar o Gemini (grátis)</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4">
              <li>
                Acesse <strong className="text-fg">aistudio.google.com</strong> → <strong className="text-fg">Get API key</strong> → crie uma chave.
              </li>
              <li>
                No painel do Supabase (projeto <strong className="text-fg">business-os</strong>) → <strong className="text-fg">Edge Functions → Secrets</strong> → adicione{' '}
                <code className="rounded bg-surface px-1">GEMINI_API_KEY</code> com a chave.
              </li>
              <li>Volte aqui e clique em “Verificar”. Não é preciso publicar o site de novo.</li>
            </ol>
          </div>
        </div>
      )}

      {effective === 'gemini' && settings.aiProvider !== 'demo' && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-[12.5px] leading-relaxed text-muted">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>
            <strong className="text-fg">Privacidade no plano grátis do Gemini:</strong> o Google pode usar o conteúdo enviado para melhorar os produtos dele. O Business OS envia só o
            contexto do escopo escolhido e nunca e-mails/telefones de clientes, mas evite colocar informações sensíveis na base de conhecimento. Para dados mais sensíveis, use o Claude
            (pago) ou ative o faturamento no Google.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Provedor" hint="Automático: cascata Gemini se houver chave; senão Claude; senão demonstração">
          {(id) => (
            <Select
              id={id}
              value={settings.aiProvider}
              options={[
                { value: 'auto', label: 'Automático' },
                { value: 'gemini', label: 'Google Gemini (cascata grátis → pago)' },
                { value: 'anthropic', label: 'Anthropic Claude (pago)' },
                { value: 'demo', label: 'Demonstração (sem IA)' },
              ]}
              onChange={(e) => changeProvider(e.target.value as AIProviderPreference)}
            />
          )}
        </Field>
        {settings.aiProvider === 'anthropic' && (
        <Field label="Modelo (Claude)" hint={AI_MODELS.find((m) => m.value === settings.aiModel)?.hint}>
          {(id) => (
            <Select
              id={id}
              value={models.some((m) => m.value === settings.aiModel) ? settings.aiModel : models[0].value}
              disabled={settings.aiProvider === 'demo'}
              options={models.map((m) => ({ value: m.value, label: m.label }))}
              onChange={(e) => save({ aiModel: e.target.value as AIModel })}
            />
          )}
        </Field>
        )}
      </div>

      {(settings.aiProvider === 'auto' || settings.aiProvider === 'gemini') && <AICascadeSection status={status.state === 'ok' ? status.raw : null} />}
      <Field label="Preferências de comportamento" hint="Ex.: respostas curtas; sempre terminar com 3 próximos passos; tratar-me por você.">
        {(id) => (
          <Textarea
            id={id}
            rows={3}
            maxLength={2000}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onBlur={() => instructions !== settings.aiInstructions && save({ aiInstructions: instructions.trim() }, 'Preferências da IA salvas')}
          />
        )}
      </Field>
    </div>
  )
}
