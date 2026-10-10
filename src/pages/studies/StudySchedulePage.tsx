import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Target } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DoneMark, ItemStatusBadge, ProgressBar } from '@/components/studies/StudyUI'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { findTrack } from '@/data/studies'
import { dayStats, isDone, itemStatus, projectStepsDone, studyPaths, trackStyle } from '@/lib/studies'
import { useStudies } from '@/store/studiesContext'
import { StudyNotFound } from './StudyNotFound'

const row = 'flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 transition-colors hover:border-line-strong'

/** Trilha dia a dia: aulas de cada dia e o exercício no último dia do módulo. */
export function StudySchedulePage() {
  const { trackId } = useParams()
  const { progressMap } = useStudies()
  const { hash } = useLocation()
  const track = findTrack(trackId)
  // Abre no dia clicado na grade da trilha (#dia-N). Espera o layout rolar ao topo primeiro.
  useEffect(() => {
    if (!hash) return
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }), 60)
    return () => window.clearTimeout(t)
  }, [hash])
  if (!track) return <StudyNotFound what="Trilha" />
  const stepsDone = projectStepsDone(track, progressMap)

  return (
    <div style={trackStyle(track)}>
      <PageHeader
        breadcrumb={[{ label: 'Estudos', to: studyPaths.home }, { label: track.title, to: studyPaths.track(track.id) }, { label: 'Cronograma' }]}
        title="Cronograma"
        description={`${track.days} dias, em ordem. O exercício de cada módulo aparece no último dia dele.`}
      />
      <Card className="divide-y divide-line">
        {Array.from({ length: track.days }, (_, i) => i + 1).map((day) => {
          const d = dayStats(track, progressMap, day)
          const modules = track.modules.filter((m) => m.days.includes(day))
          const closing = modules.filter((m) => m.days.at(-1) === day)
          return (
            <section key={day} id={`dia-${day}`} className="grid scroll-mt-6 grid-cols-1 gap-3 p-4 sm:grid-cols-[96px_1fr] sm:gap-5 sm:p-5">
              <div>
                <p className="tabular text-[26px] leading-none font-semibold">{day}</p>
                <p className="mt-1 text-[12px] text-subtle">{d.progress === 100 ? 'Concluído' : `${d.progress}% do dia`}</p>
                <ProgressBar value={d.progress} className="mt-2 h-1" label={`Progresso do dia ${day}`} />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {modules.map((m) => (
                    <Badge key={m.id}>
                      Módulo {m.number} — {m.title}
                    </Badge>
                  ))}
                </div>
                {d.lessons.map((l) => {
                  const m = track.modules.find((x) => x.lessons.includes(l))!
                  return (
                    <Link key={l.id} to={studyPaths.lesson(track.id, m.key, l.key)} className={row}>
                      <DoneMark done={isDone(progressMap, l.id)} />
                      <span className="min-w-0 flex-1 text-[14px]">{l.title}</span>
                      <ItemStatusBadge status={itemStatus(progressMap, l.id)} feminine className="hidden sm:inline-flex" />
                    </Link>
                  )
                })}
                {closing.map((m) => (
                  <Link key={m.exercise.id} to={studyPaths.exercise(track.id, m.key)} className={`${row} border-dashed`}>
                    <DoneMark done={isDone(progressMap, m.exercise.id)} />
                    <span className="min-w-0 flex-1 text-[14px]">
                      Exercício: {m.exercise.title}
                      <span className="block text-[12px] text-subtle">Fecha o módulo {m.number}</span>
                    </span>
                    <ItemStatusBadge status={itemStatus(progressMap, m.exercise.id)} className="hidden sm:inline-flex" />
                  </Link>
                ))}
                {day === track.days && track.project && (
                  <Link to={studyPaths.project(track.id)} className={`${row} border-accent/40`}>
                    <Target className="h-5 w-5 text-accent" />
                    <span className="min-w-0 flex-1 text-[14px]">
                      Projeto final: seu primeiro case
                      <span className="block text-[12px] text-subtle">
                        {stepsDone}/{track.project.stages.length} etapas
                      </span>
                    </span>
                  </Link>
                )}
              </div>
            </section>
          )
        })}
      </Card>
    </div>
  )
}
