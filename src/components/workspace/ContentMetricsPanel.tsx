import { CalendarCheck, CheckCircle2, Clock, Eye, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { CONTENT_STATUS, CONTENT_STATUS_ORDER, CONTENT_TYPE } from '@/config/labels'
import { contentStats } from '@/lib/contentStats'
import type { Content } from '@/types'

export function Stat({ label, value, icon: Icon, hint }: { label: string; value: number | string; icon: LucideIcon; hint?: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
      </div>
      <p className="tabular mt-3 text-xl font-semibold tracking-tight sm:text-[22px]">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-subtle">{hint}</p>}
    </div>
  )
}

function Breakdown({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <Card>
      <CardHeader title={title} />
      <div className="flex flex-col gap-2.5 px-4 pb-5 sm:px-5">
        {rows.every((r) => r[1] === 0) && <p className="text-[13px] text-subtle">Sem conteúdos ainda.</p>}
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[100px_1fr_32px] items-center gap-3 text-[13px]">
            <span className="truncate">{k}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(v / max) * 100}%` }} />
            </div>
            <span className="tabular text-right text-muted">{v}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

/** Indicadores de conteúdo (de um cliente ou da operação inteira). */
export function ContentMetricsPanel({ contents }: { contents: Content[] }) {
  const s = contentStats(contents)
  const types = Object.entries(CONTENT_TYPE)
    .map(([k, t]) => [t.label, contents.filter((c) => c.type === k).length] as [string, number])
    .filter((r) => r[1] > 0)
  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Indicadores de conteúdo" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Publicados no mês" value={s.publishedMonth} icon={CheckCircle2} hint={`${s.published} no total`} />
        <Stat label="Agendados" value={s.scheduled} icon={CalendarCheck} />
        <Stat label="Em aprovação" value={s.approval} icon={Eye} hint="aguardando o cliente" />
        <Stat label="Em produção" value={s.production} icon={Layers} hint="roteiro e produção" />
        <Stat label="Atrasados" value={s.late} icon={Clock} hint="data passou sem publicar" />
      </section>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Breakdown title="Por etapa" rows={CONTENT_STATUS_ORDER.map((st) => [CONTENT_STATUS[st].label, contents.filter((c) => c.status === st).length])} />
        <Breakdown title="Por formato" rows={types.length ? types : [['—', 0]]} />
      </div>
      <p className="text-[12.5px] text-subtle">Métricas de alcance e engajamento do Instagram poderão ser ligadas aqui numa próxima versão.</p>
    </div>
  )
}
