import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgressBar, StudyStatusBadge, TrackIcon } from '@/components/studies/StudyUI'
import { Card } from '@/components/ui/Card'
import { ACTIVE_TRACKS } from '@/data/studies'
import { projectStepsDone, studyPaths, trackStyle } from '@/lib/studies'
import { useStudies } from '@/store/studiesContext'

export function StudyProjectsPage() {
  const { progressMap } = useStudies()
  const tracks = ACTIVE_TRACKS.filter((t) => t.project)
  return (
    <div>
      <PageHeader title="Projetos de estudo" description="Projetos práticos das trilhas — cada um termina como um case para o seu portfólio." />
      <Card className="divide-y divide-line overflow-hidden">
        {tracks.map((t) => {
          const done = projectStepsDone(t, progressMap)
          const pct = Math.round((done / t.project!.stages.length) * 100)
          return (
            <Link
              key={t.id}
              to={studyPaths.project(t.id)}
              style={trackStyle(t)}
              className="flex flex-wrap items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-2/50 sm:flex-nowrap sm:px-5"
            >
              <TrackIcon icon={t.icon} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium">{t.project!.title.replace(/^Projeto Final — /, '')}</p>
                <p className="mt-0.5 text-[13px] text-muted">{t.title}</p>
              </div>
              <div className="flex w-full flex-col gap-1 sm:w-32">
                <span className="tabular text-[12px] text-subtle sm:text-right">
                  {done}/{t.project!.stages.length} etapas
                </span>
                <ProgressBar value={pct} label={`Progresso do projeto de ${t.title}`} />
              </div>
              <StudyStatusBadge progress={pct} />
            </Link>
          )
        })}
      </Card>
      <p className="mt-3 text-[13px] text-subtle">Em breve: projetos livres (fora das trilhas) e ligação com Clientes e Projetos.</p>
    </div>
  )
}
