import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Check, CheckCircle2, FilePlus2, Library, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AutosaveStatus } from '@/components/studies/AutosaveStatus'
import { Checklist } from '@/components/studies/Checklist'
import { Inline, RichBlocks } from '@/components/studies/Rich'
import { ItemStatusBadge } from '@/components/studies/StudyUI'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { useConfirm } from '@/components/ui/confirmContext'
import { Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'
import { findTrack } from '@/data/studies'
import { useAutosave } from '@/hooks/useAutosave'
import { formatDate, todayISO } from '@/lib/format'
import { itemStatus, studyPaths, trackStyle } from '@/lib/studies'
import { useStudies } from '@/store/studiesContext'
import type { StudyModule, StudyTrack } from '@/types/studies'
import { StudyNotFound } from './StudyNotFound'

const pad = (n: number) => String(n).padStart(2, '0')

export function StudyExercisePage() {
  const { trackId, moduleKey } = useParams()
  const track = findTrack(trackId)
  const m = track?.modules.find((x) => x.key === moduleKey)
  if (!track || !m) return <StudyNotFound what="Exercício" />
  return <ExerciseView key={m.exercise.id} track={track} module={m} />
}

function ExerciseView({ track, module: m }: { track: StudyTrack; module: StudyModule }) {
  const { progressMap, saveProgress, createLibraryItem } = useStudies()
  const toast = useToast()
  const confirm = useConfirm()
  const ex = m.exercise
  const st = progressMap.get(ex.id)
  const status = itemStatus(progressMap, ex.id)
  const answer = useAutosave(st?.answer ?? '', (v) => saveProgress(ex.id, 'exercise', { answer: v }))
  const ref = useRef<HTMLTextAreaElement>(null)
  const checksDone = (st?.checks ?? []).filter((i) => i < ex.checklist.length).length

  const insertTemplate = async () => {
    if (answer.value.trim() && !(await confirm({ title: 'Inserir modelo?', message: 'Já existe texto. O modelo será adicionado no final.', confirmLabel: 'Adicionar no final' })))
      return
    answer.onChange(answer.value.trim() ? `${answer.value.trimEnd()}\n\n${ex.template}` : ex.template)
    ref.current?.focus()
  }

  const setDone = async (done: boolean) => {
    if ((await saveProgress(ex.id, 'exercise', { done, doneAt: done ? todayISO() : null })) && done) toast.success('Exercício concluído!')
  }

  const saveToLibrary = async () => {
    if (!answer.value.trim()) return toast.info('Escreva a resposta primeiro.')
    const created = await createLibraryItem({
      type: 'material',
      title: `Exercício — ${ex.title}`,
      trackId: track.id,
      url: '',
      content: answer.value.slice(0, 20000),
      tags: ['exercício'],
    })
    if (created) toast.success('Resposta salva na Biblioteca')
  }

  return (
    <div style={trackStyle(track)}>
      <PageHeader
        breadcrumb={[
          { label: 'Estudos', to: studyPaths.home },
          { label: track.title, to: studyPaths.track(track.id) },
          { label: `Módulo ${pad(m.number)}`, to: studyPaths.module(track.id, m.key) },
          { label: 'Exercício' },
        ]}
        title={ex.title}
        meta={<ItemStatusBadge status={status} />}
        description={`Exercício do módulo ${pad(m.number)} · ${m.title}`}
        actions={<AutosaveStatus status={answer.status} savedAt={answer.savedAt} />}
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_272px]">
        <article className="flex min-w-0 flex-col gap-7 leading-relaxed">
          <div className="rounded-xl border border-accent/25 bg-accent-soft px-4 py-3.5">
            <p className="text-[11.5px] font-semibold tracking-wider text-accent uppercase">Objetivo</p>
            <p className="mt-1">{ex.objective}</p>
          </div>
          <section>
            <h2 className="mb-2.5 text-[11.5px] font-semibold tracking-wider text-accent uppercase">Instruções</h2>
            <ol className="list-decimal space-y-1.5 pl-5 text-[15px]">
              {ex.steps.map((s, i) => (
                <li key={i}>
                  <Inline text={s} />
                </li>
              ))}
            </ol>
          </section>
          {ex.data && (
            <section>
              <h2 className="mb-2.5 text-[11.5px] font-semibold tracking-wider text-accent uppercase">Dados</h2>
              <RichBlocks blocks={ex.data} className="flex flex-col gap-2.5 text-[14px]" />
            </section>
          )}
          <section>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h2 className="text-[11.5px] font-semibold tracking-wider text-accent uppercase">Minhas respostas</h2>
              <Button size="sm" icon={FilePlus2} onClick={insertTemplate}>
                Inserir modelo
              </Button>
            </div>
            <Textarea
              ref={ref}
              rows={16}
              maxLength={50000}
              aria-label="Minhas respostas"
              className="font-mono text-[13px]"
              placeholder="Escreva aqui. Use “Inserir modelo” para começar com uma estrutura pronta. Tudo é salvo automaticamente."
              value={answer.value}
              onChange={(e) => answer.onChange(e.target.value)}
            />
          </section>
          <section>
            <h2 className="mb-2.5 text-[11.5px] font-semibold tracking-wider text-accent uppercase">Checklist</h2>
            <Card className="p-2">
              <Checklist items={ex.checklist} checked={st?.checks ?? []} onChange={(checks) => void saveProgress(ex.id, 'exercise', { checks })} />
            </Card>
          </section>
        </article>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
          <Card className="p-4">
            <p className="text-[12.5px] text-muted">Checklist</p>
            <p className="tabular text-[22px] font-semibold tracking-tight">
              {checksDone}/{ex.checklist.length}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {status === 'done' ? (
                <>
                  <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Concluído em {formatDate(st?.doneAt)}
                  </p>
                  <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => void setDone(false)}>
                    Reabrir
                  </Button>
                </>
              ) : (
                <Button variant="primary" icon={Check} className="justify-center" onClick={() => void setDone(true)}>
                  Concluir exercício
                </Button>
              )}
              <Button icon={Library} className="justify-center" onClick={saveToLibrary}>
                Salvar na Biblioteca
              </Button>
              <ButtonLink size="sm" variant="ghost" icon={ArrowLeft} to={studyPaths.module(track.id, m.key)} className="justify-center">
                Voltar ao módulo
              </ButtonLink>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
