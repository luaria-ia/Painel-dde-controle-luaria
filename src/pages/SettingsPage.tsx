import { useEffect, useState } from 'react'
import { Download, FlaskConical, Monitor, Moon, RotateCcw, Sun } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AccountSection } from '@/components/settings/AccountSection'
import { AISettingsSection } from '@/components/settings/AISettingsSection'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useConfirm } from '@/components/ui/confirmContext'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { APP_NAME, APP_VERSION } from '@/config/app'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ThemePreference } from '@/types'

const themes: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-20 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
        </div>
        <div className="md:col-span-2">{children}</div>
      </div>
    </Card>
  )
}

export function SettingsPage() {
  const data = useData()
  const { settings, updateSettings, hasDemoData, clearDemoData, loadDemoData, resetToSeed, exportAll } = data
  const [loadingDemo, setLoadingDemo] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const [name, setName] = useState(settings.userName)
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const saveName = async () => {
    const value = name.trim()
    if (!value) return setNameError('O nome não pode ficar vazio.')
    if (value === settings.userName) return
    if (await updateSettings({ userName: value })) toast.success('Nome atualizado')
  }

  const setTheme = async (theme: ThemePreference) => {
    await updateSettings({ theme })
  }

  const onClearDemo = async () => {
    const ok = await confirm({
      title: 'Remover dados de exemplo?',
      message: 'Tarefas, clientes e lançamentos marcados como “Exemplo” serão apagados. Os projetos Luaria, Med Resumos e Social Media e tudo que você criou serão mantidos.',
      confirmLabel: 'Remover exemplos',
    })
    if (!ok) return
    const count = await clearDemoData()
    if (count !== null) toast.success(`${count} registro${count === 1 ? '' : 's'} de exemplo removido${count === 1 ? '' : 's'}`)
  }

  const onReset = async () => {
    const ok = await confirm({
      title: 'Restaurar dados iniciais?',
      message: 'TODOS os seus projetos, tarefas, clientes e lançamentos serão APAGADOS e substituídos pelos dados iniciais de demonstração. Use só para testes. Exporte um backup antes.',
      confirmLabel: 'Restaurar',
    })
    if (ok && (await resetToSeed())) toast.success('Dados iniciais restaurados')
  }

  const onExport = async () => {
    const json = await exportAll()
    if (!json) return
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `business-os-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup exportado')
  }

  return (
    <div>
      <PageHeader title="Configurações" description="Preferências do seu espaço de trabalho." />

      <div className="flex flex-col gap-4">
        <Section title="Conta" description="Acesso protegido por e-mail e senha.">
          <AccountSection />
        </Section>

        <Section title="Perfil" description="Como você é chamado no sistema.">
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-start"
            onSubmit={(e) => {
              e.preventDefault()
              saveName()
            }}
          >
            <Field label="Nome do usuário" error={nameError} className="flex-1">
              {(id) => (
                <Input
                  id={id}
                  value={name}
                  invalid={!!nameError}
                  maxLength={40}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError(null)
                  }}
                  onBlur={saveName}
                />
              )}
            </Field>
            <Button type="submit" className="sm:mt-[26px]" disabled={name.trim() === settings.userName}>
              Salvar
            </Button>
          </form>
        </Section>

        <Section id="ia" title="Inteligência artificial" description="Provedor, modelo e preferências do assistente. Sem chave configurada, o sistema funciona em modo demonstração.">
          <AISettingsSection />
        </Section>

        <Section title="Aparência" description="Tema da interface.">
          <div className="grid grid-cols-3 gap-2 sm:max-w-md" role="radiogroup" aria-label="Tema">
            {themes.map(({ value, label, icon: Icon }) => {
              const active = settings.theme === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-3 py-4 text-[13px] font-medium transition-colors',
                    active ? 'border-accent bg-accent-soft text-fg ring-1 ring-accent/40' : 'border-line text-muted hover:border-line-strong hover:text-fg',
                  )}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-accent' : 'text-subtle')} />
                  {label}
                </button>
              )
            })}
          </div>
        </Section>

        <Section id="dados" title="Dados" description="Seus dados ficam no banco de dados em nuvem, protegidos e acessíveis de qualquer dispositivo.">
          <div className="flex flex-col gap-4">
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
              {(
                [
                  [data.projects.length, 'projetos'],
                  [data.tasks.length, 'tarefas'],
                  [data.clients.length, 'clientes'],
                  [data.transactions.length, 'lançamentos'],
                  [data.events.length, 'eventos'],
                  [data.contracts.length, 'contratos'],
                  [data.contents.length, 'conteúdos'],
                  [data.files.length, 'arquivos'],
                ] as const
              ).map(([n, label]) => (
                <span key={label}>
                  <span className="tabular font-medium text-fg">{n}</span> {label}
                </span>
              ))}
            </p>
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line-strong p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                <div>
                  <p className="text-[13px] font-medium">Dados de exemplo</p>
                  <p className="text-[12.5px] text-muted">
                    {hasDemoData
                      ? 'Existem registros marcados como “Exemplo”.'
                      : 'Carregue exemplos fictícios de todos os módulos para explorar o sistema. Nada do que você criou é apagado.'}
                  </p>
                </div>
              </div>
              {hasDemoData ? (
                <Button size="sm" variant="primary" onClick={onClearDemo}>
                  Remover exemplos
                </Button>
              ) : (
                <Button
                  size="sm"
                  loading={loadingDemo}
                  onClick={async () => {
                    setLoadingDemo(true)
                    if (await loadDemoData()) toast.success('Dados de exemplo carregados')
                    setLoadingDemo(false)
                  }}
                >
                  Carregar exemplos
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" icon={Download} onClick={onExport}>
                Exportar backup (JSON)
              </Button>
              <Button size="sm" variant="ghost" icon={RotateCcw} onClick={onReset}>
                Restaurar dados iniciais
              </Button>
            </div>
          </div>
        </Section>

        <p className="px-1 text-[12px] text-subtle">
          {APP_NAME} {APP_VERSION} · inteligência, automações e analytics.
        </p>
      </div>
    </div>
  )
}
