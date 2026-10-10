import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { BookOpenCheck, Clock, Flame, Gauge, PencilLine, Target } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatMinutes, statusOf, type OverallStats, type StudyStatus, type TrackStats } from '@/lib/studies'
import { cn } from '@/lib/utils'

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progresso'}
      className={cn('h-1.5 overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${v}%` }} />
    </div>
  )
}

const STATUS = {
  not_started: { label: 'Não iniciado', tone: 'neutral' },
  in_progress: { label: 'Em andamento', tone: 'warning' },
  done: { label: 'Concluído', tone: 'success' },
} as const

export function StudyStatusBadge({ progress }: { progress: number }) {
  const s = STATUS[statusOf(progress)]
  return <Badge tone={s.tone}>{s.label}</Badge>
}

/** Status de aula (feminino) ou exercício/etapa (masculino). */
export function ItemStatusBadge({ status, feminine, className }: { status: StudyStatus; feminine?: boolean; className?: string }) {
  const s = STATUS[status]
  const label = feminine ? { not_started: 'Não iniciada', in_progress: 'Em andamento', done: 'Concluída' }[status] : s.label
  return (
    <Badge tone={s.tone} className={className}>
      {label}
    </Badge>
  )
}

export function TrackIcon({ icon: Icon, size = 'md', className }: { icon: LucideIcon; size?: 'md' | 'lg'; className?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center bg-[color-mix(in_srgb,var(--tc,var(--accent))_12%,transparent)] text-[var(--tc,var(--accent))]',
        size === 'lg' ? 'h-12 w-12 rounded-xl' : 'h-10 w-10 rounded-[10px]',
        className,
      )}
    >
      <Icon className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={1.9} />
    </span>
  )
}

function StatCard({ label, icon: Icon, children, hint }: { label: string; icon: LucideIcon; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
      </div>
      <p className="tabular mt-3 text-xl font-semibold tracking-tight sm:text-[22px]">{children}</p>
      {hint && <p className="mt-1 text-[12px] text-subtle">{hint}</p>}
    </div>
  )
}

const Of = ({ n }: { n: number }) => <span className="text-sm font-medium text-subtle">/{n}</span>

/** Os 6 indicadores (geral ou de uma trilha). */
export function StudyStatsGrid({ stats, scope }: { stats: TrackStats | OverallStats; scope: 'overall' | 'track' }) {
  const overall = 'projects' in stats
  return (
    <section aria-label="Indicadores de estudo" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Progresso geral" icon={Gauge} hint={scope === 'overall' ? 'Aulas 60% · Exerc. 25% · Proj. 15%' : 'desta trilha'}>
        {stats.progress}%
      </StatCard>
      <StatCard label="Horas estudadas" icon={Clock} hint="registradas">
        {formatMinutes(stats.minutes)}
      </StatCard>
      <StatCard label="Aulas concluídas" icon={BookOpenCheck}>
        {stats.lessonsDone}
        <Of n={stats.lessons} />
      </StatCard>
      <StatCard label="Exercícios" icon={PencilLine} hint="concluídos">
        {stats.exercisesDone}
        <Of n={stats.exercises} />
      </StatCard>
      {overall ? (
        <StatCard label="Projetos" icon={Target} hint="concluídos">
          {stats.projectsDone}
          <Of n={stats.projects} />
        </StatCard>
      ) : (
        <StatCard label="Projeto final" icon={Target} hint="etapas concluídas">
          {stats.stepsDone}
          <Of n={stats.steps} />
        </StatCard>
      )}
      <StatCard label="Sequência atual" icon={Flame} hint={stats.streak ? 'continue hoje!' : 'estude hoje para começar'}>
        {stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}
      </StatCard>
    </section>
  )
}

/** Linha "rótulo — barra — n/total" usada na explicação do cálculo. */
export function WeightRow({ label, ratio, done, total }: { label: string; ratio: number; done: number; total: number }) {
  return (
    <div className="grid grid-cols-[96px_1fr_56px] items-center gap-3 text-[13px]">
      <span>{label}</span>
      <ProgressBar value={ratio * 100} label={label} />
      <span className="tabular text-right text-muted">
        {done}/{total}
      </span>
    </div>
  )
}

/** Círculo de conclusão (aulas, exercícios, etapas). */
export function DoneMark({ done, className }: { done: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors',
        done ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500' : 'border-line-strong text-transparent',
        className,
      )}
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6.2 5 8.5l4.5-5" />
      </svg>
    </span>
  )
}
