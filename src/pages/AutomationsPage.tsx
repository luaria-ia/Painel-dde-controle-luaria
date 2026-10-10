import { useEffect, useState } from 'react'
import { Play, Plus, ShieldCheck, Zap } from 'lucide-react'
import { AutomationFormModal } from '@/components/automations/AutomationFormModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/toastContext'
import { AUTOMATION_ACTION, AUTOMATION_TRIGGER } from '@/config/labels'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { automationRunRepository } from '@/repositories'
import { useData } from '@/store/useData'
import type { Automation, AutomationRun } from '@/types'

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!on)
      }}
      className={cn('relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors', on ? 'bg-accent' : 'bg-line-strong')}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} />
    </button>
  )
}

export function AutomationsPage() {
  const { automations, updateAutomation, runAutomations, projectById } = useData()
  const toast = useToast()
  const [editing, setEditing] = useState<Automation | null>(null)
  const [creating, setCreating] = useState(false)
  const [running, setRunning] = useState(false)
  const [runs, setRuns] = useState<AutomationRun[]>([])

  const loadRuns = () => automationRunRepository.list(20).then(setRuns).catch(() => undefined)
  useEffect(() => {
    loadRuns()
  }, [automations])

  const runNow = async () => {
    setRunning(true)
    const n = await runAutomations()
    setRunning(false)
    if (n !== null) toast.success(n ? `${n} ação(ões) executada(s)` : 'Nada novo para executar')
    loadRuns()
  }

  return (
    <div>
      <PageHeader
        title="Automações"
        description="Regras simples: quando algo acontece → se as condições baterem → o sistema age."
        actions={
          <>
            <Button icon={Play} loading={running} onClick={runNow}>
              Verificar agora
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              Nova regra
            </Button>
          </>
        }
      />

      <Card className="mb-4 flex items-start gap-3 p-4 text-[13px] text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          As automações são previsíveis e seguras: só criam alertas, tarefas ou registros, ou preenchem um campo vazio — <strong className="font-medium text-fg">nunca apagam nem alteram dados importantes</strong>. Cada regra roda uma única vez por item.
        </p>
      </Card>

      <Card className="overflow-hidden">
        {automations.length === 0 ? (
          <EmptyState icon={Zap} title="Nenhuma regra" action={<Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>Criar regra</Button>} />
        ) : (
          <ul className="divide-y divide-line">
            {automations.map((a) => (
              <li key={a.id}>
                <div role="button" tabIndex={0} onClick={() => setEditing(a)} onKeyDown={(e) => e.key === 'Enter' && setEditing(a)} className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2/50 sm:items-center sm:px-5">
                  <Zap className={cn('mt-0.5 h-4 w-4 shrink-0 sm:mt-0', a.enabled ? 'text-amber-500' : 'text-subtle')} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn('text-[13.5px] font-medium', !a.enabled && 'text-subtle')}>{a.name}</p>
                      {a.isSystem && <Badge tone="neutral">Padrão</Badge>}
                    </div>
                    <p className="mt-0.5 text-[12px] text-subtle">
                      Quando <span className="text-muted">{AUTOMATION_TRIGGER[a.trigger].label.toLowerCase()}</span>
                      {a.conditions.projectId && <> em <span className="text-muted">{projectById.get(a.conditions.projectId)?.name ?? 'projeto removido'}</span></>}
                      {a.trigger === 'contract_due' && <> ({a.conditions.days ?? 30} dias antes)</>} → <span className="text-muted">{AUTOMATION_ACTION[a.action.type].label.toLowerCase()}</span>
                    </p>
                    {a.lastRunAt && <p className="text-[11.5px] text-subtle">Última execução: {formatDateTime(a.lastRunAt)}</p>}
                  </div>
                  <Toggle on={a.enabled} label={a.enabled ? 'Desligar regra' : 'Ligar regra'} onChange={(v) => updateAutomation(a.id, { enabled: v }).then((r) => r && toast.success(v ? 'Regra ligada' : 'Regra desligada'))} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Execuções recentes" description="Cada linha é uma ação executada por uma regra" />
        {runs.length === 0 ? (
          <p className="border-t border-line px-5 py-6 text-center text-[13px] text-subtle">Nenhuma execução ainda.</p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {runs.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2 text-[12.5px] sm:px-5">
                <span className="min-w-0 truncate text-muted">{automations.find((a) => a.id === r.automationId)?.name ?? 'Regra removida'}</span>
                <span className="shrink-0 text-subtle">{formatDateTime(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AutomationFormModal open={creating || !!editing} automation={editing} onClose={() => (setCreating(false), setEditing(null))} />
    </div>
  )
}
