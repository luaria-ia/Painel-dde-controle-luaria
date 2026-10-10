import { useParams } from 'react-router-dom'
import { Briefcase, Download, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AutosaveStatus } from '@/components/studies/AutosaveStatus'
import { ProgressBar, StudyStatusBadge, TrackIcon } from '@/components/studies/StudyUI'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { findTrack } from '@/data/studies'
import { useAutosave } from '@/hooks/useAutosave'
import { todayISO } from '@/lib/format'
import { itemStatus, projectMarkdown, projectStepsDone, stageItemId, studyPaths, trackStyle } from '@/lib/studies'
import { cn } from '@/lib/utils'
import { useStudies } from '@/store/studiesContext'
import type { ProjectStage, StudyProject, StudyTrack } from '@/types/studies'
import { StudyNotFound } from './StudyNotFound'

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'case'

export function StudyProjectPage() {
  const { trackId } = useParams()
  const track = findTrack(trackId)
  if (!track?.project) return <StudyNotFound what="Projeto" />
  return <ProjectView key={track.id} track={track} project={track.project} />
}

function ProjectView({ track, project }: { track: StudyTrack; project: StudyProject }) {
  const { progressMap, saveProgress } = useStudies()
  const company = useAutosave(progressMap.get(project.id)?.answer ?? '', (v) => saveProgress(project.id, 'project', { answer: v }))
  const done = projectStepsDone(track, progressMap)
  const pct = Math.round((done / project.stages.length) * 100)
  const firstOpen = project.stages.find((st) => !progressMap.get(stageItemId(project, st.key))?.done)?.key

  return (
    <div style={trackStyle(track)}>
      <PageHeader
        breadcrumb={[{ label: 'Estudos', to: studyPaths.home }, { label: track.title, to: studyPaths.track(track.id) }, { label: 'Projeto final' }]}
        title={project.title.replace(/^Projeto Final — /, '')}
        meta={<StudyStatusBadge progress={pct} />}
        description={project.description}
        actions={
          <Button icon={Download} onClick={() => download(`projeto-final-${slug(company.value)}.md`, projectMarkdown(track, progressMap))}>
            Exportar projeto (.md)
          </Button>
        }
      />
      <Card className="mb-5 grid grid-cols-1 items-end gap-4 p-5 sm:grid-cols-[2fr_1fr]">
        <Field label="Nome da empresa fictícia" hint={<AutosaveStatus status={company.status} savedAt={company.savedAt} />}>
          {(id) => <Input id={id} maxLength={120} placeholder="Ex.: Marmita da Lu" value={company.value} onChange={(e) => company.onChange(e.target.value)} />}
        </Field>
        <div className="pb-6">
          <div className="mb-2 flex justify-between text-[13px]">
            <span className="text-muted">
              {done}/{project.stages.length} etapas
            </span>
            <span className="tabular font-semibold">{pct}%</span>
          </div>
          <ProgressBar value={pct} label="Progresso do projeto final" />
        </div>
      </Card>

      <ol className="relative flex flex-col gap-2.5 pl-7 before:absolute before:top-3 before:bottom-3 before:left-[9px] before:w-0.5 before:bg-line">
        {project.stages.map((st, i) => (
          <StageItem key={st.key} project={project} stage={st} index={i} last={i === project.stages.length - 1} defaultOpen={st.key === firstOpen} />
        ))}
      </ol>

      {pct === 100 && (
        <Card className="mt-5 flex items-center gap-4 border-emerald-500/40 p-5" style={trackStyle({ color: '#059669' })}>
          <TrackIcon icon={Trophy} />
          <div>
            <p className="font-medium">Projeto concluído!</p>
            <p className="text-[13px] text-muted">Exporte o projeto em .md e transforme o relatório no seu primeiro case de portfólio.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

function StageItem({ project, stage, index, last, defaultOpen }: { project: StudyProject; stage: ProjectStage; index: number; last: boolean; defaultOpen: boolean }) {
  const { progressMap, saveProgress } = useStudies()
  const toast = useToast()
  const id = stageItemId(project, stage.key)
  const st = progressMap.get(id)
  const status = itemStatus(progressMap, id)
  const text = useAutosave(st?.answer ?? '', (v) => saveProgress(id, 'project', { answer: v }))

  const toggle = async (done: boolean) => {
    if ((await saveProgress(id, 'project', { done, doneAt: done ? todayISO() : null })) && done) toast.success('Etapa concluída')
  }

  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-[18px] -left-[25px] h-3 w-3 rounded-full border-2',
          status === 'done' ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500' : 'border-line-strong bg-bg',
        )}
      />
      <details open={defaultOpen} className="group rounded-xl border border-line bg-surface shadow-card">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="tabular w-6 text-[13px] font-semibold text-subtle">{String(index + 1).padStart(2, '0')}</span>
          <span className="flex-1 text-[14px] font-semibold">{stage.title}</span>
          {last && (
            <Badge className="hidden sm:inline-flex">
              <Briefcase className="h-3 w-3" /> peça principal do case
            </Badge>
          )}
          {status !== 'not_started' && <Badge tone={status === 'done' ? 'success' : 'warning'}>{status === 'done' ? 'Concluída' : 'Em andamento'}</Badge>}
        </summary>
        <div className="flex flex-col gap-2.5 px-4 pb-4">
          <p className="text-[13.5px] text-muted">{stage.hint}</p>
          <Textarea
            rows={5}
            maxLength={50000}
            aria-label={`Etapa ${index + 1}: ${stage.title}`}
            placeholder="Desenvolva esta etapa…"
            value={text.value}
            onChange={(e) => text.onChange(e.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[13.5px]">
              <input
                type="checkbox"
                className="h-[15px] w-[15px] cursor-pointer accent-[var(--accent)]"
                checked={status === 'done'}
                onChange={(e) => void toggle(e.target.checked)}
              />
              Etapa concluída
            </label>
            <AutosaveStatus status={text.status} savedAt={text.savedAt} />
          </div>
        </div>
      </details>
    </li>
  )
}
