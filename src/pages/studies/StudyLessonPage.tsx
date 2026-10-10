import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Play, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AutosaveStatus } from '@/components/studies/AutosaveStatus'
import { Checklist } from '@/components/studies/Checklist'
import { LogHoursModal } from '@/components/studies/LogHoursModal'
import { Inline, RichBlocks } from '@/components/studies/Rich'
import { DoneMark, ItemStatusBadge, ProgressBar } from '@/components/studies/StudyUI'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { findTrack } from '@/data/studies'
import { useAutosave } from '@/hooks/useAutosave'
import { formatDate, todayISO } from '@/lib/format'
import { isDone, itemStatus, moduleStats, studyPaths, trackStyle } from '@/lib/studies'
import { cn } from '@/lib/utils'
import { useStudies } from '@/store/studiesContext'
import type { StudyLesson, StudyModule, StudyTrack } from '@/types/studies'
import { StudyNotFound } from './StudyNotFound'

const pad = (n: number) => String(n).padStart(2, '0')

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-[11.5px] font-semibold tracking-wider text-accent uppercase">{title}</h2>
      {children}
    </section>
  )
}

export function StudyLessonPage() {
  const { trackId, moduleKey, lessonKey } = useParams()
  const track = findTrack(trackId)
  const m = track?.modules.find((x) => x.key === moduleKey)
  const lesson = m?.lessons.find((l) => l.key === lessonKey)
  if (!track || !m || !lesson) return <StudyNotFound what="Aula" />
  // key: trocar de aula reinicia os campos com salvamento automático
  return <LessonView key={lesson.id} track={track} module={m} lesson={lesson} />
}

function LessonView({ track, module: m, lesson }: { track: StudyTrack; module: StudyModule; lesson: StudyLesson }) {
  const { progressMap, saveProgress } = useStudies()
  const navigate = useNavigate()
  const toast = useToast()
  const [logging, setLogging] = useState(false)
  const st = progressMap.get(lesson.id)
  const status = itemStatus(progressMap, lesson.id)
  const answer = useAutosave(st?.answer ?? '', (v) => saveProgress(lesson.id, 'lesson', { answer: v }))
  const notes = useAutosave(st?.notes ?? '', (v) => saveProgress(lesson.id, 'lesson', { notes: v }))
  const saving = [answer, notes].filter((a) => a.status !== 'idle').sort((a, b) => (b.savedAt?.getTime() ?? Infinity) - (a.savedAt?.getTime() ?? Infinity))[0]

  // Navegação na ordem da trilha inteira
  const all = track.modules.flatMap((mod) => mod.lessons.map((l) => ({ mod, l })))
  const index = all.findIndex((x) => x.l.id === lesson.id)
  const prev = all[index - 1]
  const next = all[index + 1]
  const ms = moduleStats(m, progressMap)
  const checksDone = (st?.checks ?? []).filter((i) => i < lesson.checklist.length).length

  const complete = async () => {
    if (!(await saveProgress(lesson.id, 'lesson', { done: true, doneAt: todayISO() }))) return
    toast.success('Aula concluída! Progresso atualizado.')
    const nextInModule = m.lessons[m.lessons.indexOf(lesson) + 1]
    navigate(nextInModule ? studyPaths.lesson(track.id, m.key, nextInModule.key) : studyPaths.exercise(track.id, m.key))
  }

  return (
    <div style={trackStyle(track)}>
      <PageHeader
        breadcrumb={[
          { label: 'Estudos', to: studyPaths.home },
          { label: track.title, to: studyPaths.track(track.id) },
          { label: `Módulo ${pad(m.number)}`, to: studyPaths.module(track.id, m.key) },
          { label: `Dia ${lesson.day}` },
        ]}
        title={lesson.title}
        meta={<ItemStatusBadge status={status} feminine />}
        description={`Módulo ${pad(m.number)} · ${m.title} · Dia ${lesson.day} de ${track.days}`}
        actions={saving && <AutosaveStatus status={saving.status} savedAt={saving.savedAt} />}
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_272px]">
        <article className="flex min-w-0 flex-col gap-7 leading-relaxed">
          <div className="rounded-xl border border-accent/25 bg-accent-soft px-4 py-3.5">
            <p className="text-[11.5px] font-semibold tracking-wider text-accent uppercase">Objetivo da aula</p>
            <p className="mt-1">{lesson.objective}</p>
          </div>

          <Section title="Explicação">
            <RichBlocks blocks={lesson.content} className="flex max-w-[74ch] flex-col gap-3 text-[15px] text-fg/90" />
          </Section>

          <Section title="Conceitos principais">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {lesson.concepts.map(([term, def]) => (
                <div key={term} className="rounded-xl border border-line bg-surface p-3.5 shadow-card">
                  <p className="text-[14px] font-semibold">{term}</p>
                  <p className="mt-0.5 text-[13.5px] text-muted">{def}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Exemplo prático">
            <div className="rounded-r-xl border-l-[3px] border-[var(--tc)] bg-surface px-4 py-3.5 shadow-card">
              <RichBlocks blocks={lesson.example} className="flex flex-col gap-2.5 text-[14.5px]" />
            </div>
          </Section>

          <Section title="Aplicando na prática">
            <p className="max-w-[74ch] text-[15px]">
              <Inline text={lesson.practice} />
            </p>
          </Section>

          <Section title="Exercício da aula">
            <div className="rounded-xl border border-dashed border-line-strong px-4 py-3.5 text-[14.5px]">
              <Inline text={lesson.task} />
            </div>
            <Textarea
              rows={5}
              className="mt-2.5"
              aria-label="Resposta do exercício da aula"
              maxLength={50000}
              placeholder="Sua resposta…"
              value={answer.value}
              onChange={(e) => answer.onChange(e.target.value)}
            />
          </Section>

          <Section title="Checklist">
            <Card className="p-2">
              <Checklist items={lesson.checklist} checked={st?.checks ?? []} onChange={(checks) => void saveProgress(lesson.id, 'lesson', { checks })} />
            </Card>
          </Section>

          <Section title="Minhas anotações">
            <Textarea
              rows={5}
              aria-label="Anotações da aula"
              maxLength={50000}
              placeholder="Ideias, dúvidas, o que quero aplicar…"
              value={notes.value}
              onChange={(e) => notes.onChange(e.target.value)}
            />
          </Section>

          <nav className="flex flex-wrap justify-between gap-3 border-t border-line pt-5" aria-label="Aulas">
            {prev ? (
              <ButtonLink variant="ghost" icon={ArrowLeft} to={studyPaths.lesson(track.id, prev.mod.key, prev.l.key)} className="max-w-full">
                <span className="truncate">{prev.l.title}</span>
              </ButtonLink>
            ) : (
              <span />
            )}
            {next ? (
              <ButtonLink variant="ghost" to={studyPaths.lesson(track.id, next.mod.key, next.l.key)} className="max-w-full">
                <span className="truncate">{next.l.title}</span> <ArrowRight className="h-4 w-4 shrink-0" />
              </ButtonLink>
            ) : (
              <ButtonLink variant="ghost" to={studyPaths.project(track.id)}>
                Projeto final <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
          </nav>
        </article>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
          <Card className="p-4">
            <div className="mb-1.5 flex justify-between text-[12.5px] text-muted">
              <span>Módulo {pad(m.number)}</span>
              <span className="tabular">{ms.progress}%</span>
            </div>
            <ProgressBar value={ms.progress} label="Progresso do módulo" />
            <p className="tabular mt-3 text-[13px] text-muted">
              Checklist: <span className="font-semibold text-fg">{checksDone}</span>/{lesson.checklist.length}
            </p>
            <div className="mt-3.5 flex flex-col gap-2">
              {status === 'done' ? (
                <>
                  <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Concluída em {formatDate(st?.doneAt)}
                  </p>
                  <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => void saveProgress(lesson.id, 'lesson', { done: false, doneAt: null })}>
                    Reabrir aula
                  </Button>
                </>
              ) : (
                <>
                  {status === 'not_started' && (
                    <Button icon={Play} className="justify-center" onClick={() => void saveProgress(lesson.id, 'lesson', {})}>
                      Começar aula
                    </Button>
                  )}
                  <Button variant="primary" icon={Check} className="justify-center" onClick={complete}>
                    Concluir aula
                  </Button>
                </>
              )}
            </div>
          </Card>
          <Card className="p-2">
            <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">Aulas do módulo</p>
            {m.lessons.map((l, i) => (
              <Link
                key={l.id}
                to={studyPaths.lesson(track.id, m.key, l.key)}
                aria-current={l.id === lesson.id ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors',
                  l.id === lesson.id ? 'bg-surface-2 font-medium text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
                )}
              >
                <DoneMark done={isDone(progressMap, l.id)} className="h-4 w-4" />
                <span className="min-w-0 flex-1">
                  {i + 1}. {l.title}
                </span>
              </Link>
            ))}
            <Link
              to={studyPaths.exercise(track.id, m.key)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <DoneMark done={isDone(progressMap, m.exercise.id)} className="h-4 w-4" />
              <span className="min-w-0 flex-1">Exercício: {m.exercise.title}</span>
            </Link>
          </Card>
          <Button icon={Clock} className="justify-center" onClick={() => setLogging(true)}>
            Registrar horas
          </Button>
        </aside>
      </div>
      <LogHoursModal open={logging} onClose={() => setLogging(false)} trackId={track.id} />
    </div>
  )
}
