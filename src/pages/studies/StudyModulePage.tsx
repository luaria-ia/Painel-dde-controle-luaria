import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DoneMark, ItemStatusBadge, ProgressBar, StudyStatusBadge } from '@/components/studies/StudyUI'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { findTrack } from '@/data/studies'
import { isDone, itemStatus, moduleStats, studyPaths, trackStyle } from '@/lib/studies'
import { useStudies } from '@/store/studiesContext'
import { StudyNotFound } from './StudyNotFound'

const pad = (n: number) => String(n).padStart(2, '0')

export function StudyModulePage() {
  const { trackId, moduleKey } = useParams()
  const { progressMap } = useStudies()
  const track = findTrack(trackId)
  const m = track?.modules.find((x) => x.key === moduleKey)
  if (!track || !m) return <StudyNotFound what="Módulo" />

  const ms = moduleStats(m, progressMap)
  const prev = track.modules[m.number - 2]
  const next = track.modules[m.number]
  const ex = progressMap.get(m.exercise.id)

  return (
    <div style={trackStyle(track)}>
      <PageHeader
        breadcrumb={[{ label: 'Estudos', to: studyPaths.home }, { label: track.title, to: studyPaths.track(track.id) }, { label: `Módulo ${pad(m.number)}` }]}
        title={m.title}
        meta={<StudyStatusBadge progress={ms.progress} />}
        description={`Módulo ${pad(m.number)} de ${track.modules.length} · Dia${m.days.length > 1 ? 's' : ''} ${m.days.join('–')}`}
        actions={
          <>
            {prev && (
              <ButtonLink to={studyPaths.module(track.id, prev.key)} icon={ArrowLeft}>
                Anterior
              </ButtonLink>
            )}
            {next && (
              <ButtonLink to={studyPaths.module(track.id, next.key)}>
                Próximo <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
          </>
        }
      />

      <Card className="flex flex-wrap items-center gap-6 p-5">
        <div className="min-w-60 flex-1">
          <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">Objetivo do módulo</p>
          <p className="leading-relaxed">{m.description}</p>
        </div>
        <div className="w-full sm:w-64">
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="text-muted">Progresso</span>
            <span className="tabular font-semibold">{ms.progress}%</span>
          </div>
          <ProgressBar value={ms.progress} label="Progresso do módulo" />
          <p className="tabular mt-1.5 text-[12px] text-subtle">
            {ms.lessonsDone}/{m.lessons.length} aulas · exercício {ms.exerciseDone ? 'concluído' : 'pendente'}
          </p>
        </div>
      </Card>

      <div className="mt-8 mb-3 flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold">Aulas</h2>
        <span className="text-[13px] text-subtle">{m.lessons.length} aulas</span>
      </div>
      <Card className="divide-y divide-line overflow-hidden">
        {m.lessons.map((l, i) => (
          <Link key={l.id} to={studyPaths.lesson(track.id, m.key, l.key)} className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-surface-2/50 sm:px-5">
            <DoneMark done={isDone(progressMap, l.id)} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">
                {i + 1}. {l.title}
              </p>
              <p className="mt-0.5 text-[13px] text-muted">{l.objective}</p>
            </div>
            <span className="hidden text-[12px] text-subtle sm:inline">Dia {l.day}</span>
            <ItemStatusBadge status={itemStatus(progressMap, l.id)} feminine className="hidden sm:inline-flex" />
            <ChevronRight className="h-4 w-4 shrink-0 text-subtle" />
          </Link>
        ))}
      </Card>

      <h2 className="mt-8 mb-3 text-[15px] font-semibold">Exercício do módulo</h2>
      <Link
        to={studyPaths.exercise(track.id, m.key)}
        className="flex flex-wrap items-center gap-3.5 rounded-xl border border-line bg-surface px-4 py-4 shadow-card transition-colors hover:border-line-strong sm:flex-nowrap sm:px-5"
      >
        <DoneMark done={!!ex?.done} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">{m.exercise.title}</p>
          <p className="mt-0.5 text-[13px] text-muted">{m.exercise.objective}</p>
        </div>
        {ex?.answer && !ex.done && <Badge tone="warning">Rascunho salvo</Badge>}
        <span className="text-[13px] font-medium text-accent">{ex?.done ? 'Revisar' : 'Fazer exercício'} →</span>
      </Link>
    </div>
  )
}
