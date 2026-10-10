import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Briefcase, FolderKanban, Library, PencilLine, Plus, Target, UserPlus, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HoursChart, HoursList } from '@/components/studies/Hours'
import { LogHoursModal } from '@/components/studies/LogHoursModal'
import { StudyStatsGrid } from '@/components/studies/StudyUI'
import { TrackCard } from '@/components/studies/TrackCard'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card, CardHeader } from '@/components/ui/Card'
import { ACTIVE_TRACKS, PLANNED_TRACKS } from '@/data/studies'
import { formatMinutes, overallStats, studyPaths, trackStats, minutesInLastDays } from '@/lib/studies'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import { useStudies } from '@/store/studiesContext'

function FlowStep({ icon: Icon, label, value, hint, to }: { icon: LucideIcon; label: string; value: ReactNode; hint: string; to?: string }) {
  const body = (
    <>
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-subtle uppercase">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="tabular mt-1.5 text-lg font-semibold">{value}</p>
      <p className="text-[12px] text-subtle">{hint}</p>
    </>
  )
  const cls = 'block bg-surface px-4 py-3.5'
  return to ? (
    <Link to={to} className={cn(cls, 'transition-colors hover:bg-surface-2')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export function StudiesPage() {
  const { progress, progressMap, hours } = useStudies()
  const { clients, projects } = useData()
  const [logging, setLogging] = useState(false)
  const overall = overallStats(ACTIVE_TRACKS, progressMap, hours, progress)

  return (
    <div>
      <PageHeader
        title="Estudos"
        description="Desenvolva habilidades, pratique e transforme conhecimento em projetos reais."
        actions={
          <>
            <ButtonLink to={studyPaths.library} icon={Library}>
              Biblioteca
            </ButtonLink>
            <Button variant="primary" icon={Plus} onClick={() => setLogging(true)}>
              Registrar horas
            </Button>
          </>
        }
      />

      <StudyStatsGrid stats={overall} scope="overall" />

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Do estudo ao cliente</h2>
          <span className="text-[13px] text-subtle">como o aprendizado vira negócio</span>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-card sm:grid-cols-3 lg:grid-cols-6">
          <FlowStep icon={BookOpen} label="Aprender" value={overall.lessonsDone} hint="aulas concluídas" />
          <FlowStep icon={PencilLine} label="Praticar" value={overall.exercisesDone} hint="exercícios feitos" />
          <FlowStep icon={Target} label="Criar projeto" value={overall.stepsDone} hint="etapas de projeto" to={studyPaths.projects} />
          <FlowStep icon={Briefcase} label="Portfólio" value={overall.projectsDone} hint="cases prontos" to={studyPaths.projects} />
          <FlowStep icon={UserPlus} label="Conseguir cliente" value={clients.length} hint="clientes cadastrados" to="/clientes" />
          <FlowStep icon={FolderKanban} label="Gerenciar" value={projects.filter((p) => p.status === 'ativo').length} hint="projetos ativos" to="/projetos" />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Minhas trilhas</h2>
          <span className="text-[13px] text-subtle">{ACTIVE_TRACKS.length} ativas</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ACTIVE_TRACKS.map((t) => (
            <TrackCard key={t.id} track={t} stats={trackStats(t, progressMap, hours, progress)} progressMap={progressMap} />
          ))}
        </div>
        {PLANNED_TRACKS.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-subtle">
            <span>Próximas trilhas:</span>
            {PLANNED_TRACKS.map((t) => (
              <span key={t.id} className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-2.5 text-muted">
                <t.icon className="h-3.5 w-3.5 text-subtle" />
                {t.title}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Horas estudadas" description={`Últimos 14 dias · ${formatMinutes(minutesInLastDays(hours, 14))} no período`} />
          <div className="px-4 pb-4 sm:px-5">
            <HoursChart hours={hours} />
          </div>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader
            title="Registros recentes"
            action={
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setLogging(true)}>
                Registrar
              </Button>
            }
          />
          <HoursList hours={hours} />
        </Card>
      </div>

      <LogHoursModal open={logging} onClose={() => setLogging(false)} />
    </div>
  )
}
