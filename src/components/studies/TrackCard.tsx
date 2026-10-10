import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Layers, Play } from 'lucide-react'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { formatMinutes, nextStepPath, studyPaths, type ProgressMap, type TrackStats, trackStyle } from '@/lib/studies'
import type { StudyTrack } from '@/types/studies'
import { ProgressBar, StudyStatusBadge, TrackIcon } from './StudyUI'

export function TrackCard({ track, stats, progressMap }: { track: StudyTrack; stats: TrackStats; progressMap: ProgressMap }) {
  const started = stats.progress > 0
  return (
    <article
      style={trackStyle(track)}
      className="group relative flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-pop"
    >
      <div className="flex items-start justify-between gap-3">
        <TrackIcon icon={track.icon} />
        <StudyStatusBadge progress={stats.progress} />
      </div>
      <div>
        <h3 className="text-base font-semibold">
          {/* Link "esticado": o card inteiro abre a trilha */}
          <Link
            to={studyPaths.track(track.id)}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {track.title}
          </Link>
        </h3>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{track.description}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <ProgressBar value={stats.progress} className="flex-1" label={`Progresso em ${track.title}`} />
        <span className="tabular w-9 text-right text-[13px] font-semibold">{stats.progress}%</span>
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          {track.modules.length} módulos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          {stats.lessons} aulas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatMinutes(stats.minutes)}
        </span>
      </div>
      <div>
        <ButtonLink to={nextStepPath(track, progressMap)} size="sm" variant={started ? 'primary' : 'secondary'} icon={started ? Play : ArrowRight} className="relative z-10">
          {started ? 'Continuar estudando' : 'Começar trilha'}
        </ButtonLink>
      </div>
    </article>
  )
}
