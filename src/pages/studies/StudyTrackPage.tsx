import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, ChevronRight, Clock, Play, Sparkles, Target } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HoursChart } from '@/components/studies/Hours'
import { LogHoursModal } from '@/components/studies/LogHoursModal'
import { ProgressBar, StudyStatsGrid, StudyStatusBadge, TrackIcon, WeightRow } from '@/components/studies/StudyUI'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { findTrack } from '@/data/studies'
import { dayStats, moduleStats, nextStepPath, studyPaths, trackStats, trackStyle } from '@/lib/studies'
import { useStudies } from '@/store/studiesContext'
import { StudyNotFound } from './StudyNotFound'

export function StudyTrackPage() {
  const { trackId } = useParams()
  const track = findTrack(trackId)
  const { progress, progressMap, hours } = useStudies()
  const [logging, setLogging] = useState(false)
  if (!track) return <StudyNotFound what="Trilha" />

  const s = trackStats(track, progressMap, hours, progress)
  const trackHours = hours.filter((h) => h.trackId === track.id)

  return (
    <div style={trackStyle(track)}>
      <PageHeader
        breadcrumb={[{ label: 'Estudos', to: studyPaths.home }, { label: track.title }]}
        title={
          <span className="flex items-center gap-3">
            <TrackIcon icon={track.icon} />
            {track.title}
          </span>
        }
        meta={<StudyStatusBadge progress={s.progress} />}
        description={track.description}
        actions={
          <>
            <Button icon={Clock} onClick={() => setLogging(true)}>
              Registrar horas
            </Button>
            <ButtonLink to={nextStepPath(track, progressMap)} variant="primary" icon={Play}>
              {s.progress ? 'Continuar' : 'Começar'}
            </ButtonLink>
          </>
        }
      />

      <Card className="mb-4 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">Trilha de {track.days} dias</h2>
            <p className="text-[13px] text-muted">Cada bloco é um dia e enche conforme você conclui as aulas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink size="sm" icon={CalendarDays} to={studyPaths.schedule(track.id)}>
              Cronograma
            </ButtonLink>
            <ButtonLink size="sm" icon={Sparkles} to={studyPaths.tools}>
              Ferramentas de IA
            </ButtonLink>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
          {Array.from({ length: track.days }, (_, i) => i + 1).map((day) => {
            const d = dayStats(track, progressMap, day)
            return (
              <Link
                key={day}
                to={`${studyPaths.schedule(track.id)}#dia-${day}`}
                title={`Dia ${day}: ${d.done}/${d.lessons.length} aulas`}
                aria-label={`Dia ${day}: ${d.progress}% concluído`}
                className="relative h-14 overflow-hidden rounded-lg border border-line bg-surface-2 transition-colors hover:border-[var(--tc)]"
              >
                <span
                  className="absolute inset-x-0 bottom-0 bg-[color-mix(in_srgb,var(--tc)_55%,transparent)] transition-[height] duration-500"
                  style={{ height: `${d.progress}%` }}
                />
                <span className={cn('tabular absolute top-1.5 left-2 text-[11.5px] font-semibold', d.progress === 100 ? 'text-fg' : 'text-subtle')}>{day}</span>
              </Link>
            )
          })}
        </div>
      </Card>

      <StudyStatsGrid stats={s} scope="track" />

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Como o progresso é calculado" description="Aulas valem 60%, exercícios 25% e o projeto final 15%." />
          <div className="flex flex-col gap-3 px-4 pb-5 sm:px-5">
            <WeightRow label="Aulas" ratio={s.lessonsRatio} done={s.lessonsDone} total={s.lessons} />
            <WeightRow label="Exercícios" ratio={s.exercisesRatio} done={s.exercisesDone} total={s.exercises} />
            <WeightRow label="Projeto final" ratio={s.projectRatio} done={s.stepsDone} total={s.steps} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Horas nesta trilha" description="Últimos 14 dias" />
          <div className="px-4 pb-4 sm:px-5">
            <HoursChart hours={trackHours} />
          </div>
        </Card>
      </div>

      <div className="mt-8 mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold">Módulos</h2>
        <span className="text-[13px] text-subtle">
          {track.modules.length} módulos · {s.lessons} aulas
        </span>
      </div>
      <Card className="divide-y divide-line overflow-hidden">
        {track.modules.map((m) => {
          const ms = moduleStats(m, progressMap)
          return (
            <Link
              key={m.id}
              to={studyPaths.module(track.id, m.key)}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 transition-colors hover:bg-surface-2/50 sm:flex-nowrap sm:px-5"
            >
              <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                <p className="text-[11px] font-semibold tracking-wider text-subtle uppercase">Módulo {String(m.number).padStart(2, '0')}</p>
                <p className="text-[14px] font-medium">{m.title}</p>
                <p className="mt-0.5 text-[13px] text-muted">{m.description}</p>
              </div>
              <div className="flex w-full flex-col gap-1 sm:w-32">
                <span className="tabular text-[12px] text-subtle sm:text-right">
                  {ms.lessonsDone}/{m.lessons.length} aulas · exercício {ms.exerciseDone ? '✓' : 'pendente'}
                </span>
                <ProgressBar value={ms.progress} label={`Progresso do módulo ${m.number}`} />
              </div>
              <StudyStatusBadge progress={ms.progress} />
              <ChevronRight className="hidden h-4 w-4 text-subtle sm:block" />
            </Link>
          )
        })}
      </Card>

      {track.project && (
        <>
          <h2 className="mt-8 mb-3 text-[15px] font-semibold">Projeto final</h2>
          <Link
            to={studyPaths.project(track.id)}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface px-4 py-4 shadow-card transition-colors hover:border-line-strong sm:flex-nowrap sm:px-5"
          >
            <span style={trackStyle({ color: 'var(--accent)' })}>
              <TrackIcon icon={Target} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{track.project.title}</p>
              <p className="mt-0.5 text-[13px] text-muted">{track.project.description}</p>
            </div>
            <div className="flex w-full flex-col gap-1 sm:w-32">
              <span className="tabular text-[12px] text-subtle sm:text-right">
                {s.stepsDone}/{s.steps} etapas
              </span>
              <ProgressBar value={s.projectRatio * 100} label="Progresso do projeto final" />
            </div>
          </Link>
        </>
      )}

      <LogHoursModal open={logging} onClose={() => setLogging(false)} trackId={track.id} />
    </div>
  )
}
