import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Segmented } from '@/components/ui/Segmented'
import { ACTIVE_TRACKS } from '@/data/studies'
import { toolItemId, trackStyle } from '@/lib/studies'
import { cn } from '@/lib/utils'
import { useStudies } from '@/store/studiesContext'
import type { StudyTool } from '@/types/studies'

const LEVELS = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Domínio']

export function StudyToolsPage() {
  const [trackId, setTrackId] = useState(ACTIVE_TRACKS[0].id)
  const track = ACTIVE_TRACKS.find((t) => t.id === trackId) ?? ACTIVE_TRACKS[0]
  return (
    <div>
      <PageHeader title="Ferramentas de IA" description="Para que serve cada uma, quando usar e o que aprender. Marque seu nível de domínio e atualize conforme evolui." />
      <Segmented
        className="mb-4"
        ariaLabel="Trilha"
        value={trackId}
        onChange={setTrackId}
        options={ACTIVE_TRACKS.map((t) => ({ value: t.id, label: t.title, count: t.tools.length }))}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" style={trackStyle(track)}>
        {track.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
      <p className="mt-3 text-[13px] text-subtle">O nível de uma ferramenta usada em mais de uma trilha (ex.: ChatGPT, Claude) é o mesmo nas duas.</p>
    </div>
  )
}

function ToolCard({ tool }: { tool: StudyTool }) {
  const { progressMap, saveProgress } = useStudies()
  const level = progressMap.get(toolItemId(tool.id))?.level ?? null
  // Clicar no nível atual volta um nível (permite zerar clicando no 1).
  const choose = (i: number) => void saveProgress(toolItemId(tool.id), 'tool', { level: level === i ? (i === 0 ? null : i - 1) : i })

  return (
    <Card className="flex flex-col gap-3.5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold">{tool.name}</h3>
          <Badge className="mt-1.5" tone={level === null ? 'neutral' : 'accent'}>
            {level === null ? 'Nível não definido' : LEVELS[level]}
          </Badge>
        </div>
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--tc)_12%,transparent)] text-[15px] font-semibold text-[var(--tc)]"
        >
          {tool.name.charAt(0)}
        </span>
      </div>
      <dl className="flex flex-col gap-2.5 text-[13.5px]">
        <div>
          <dt className="text-[11.5px] font-semibold tracking-wider text-accent uppercase">Para que serve</dt>
          <dd className="mt-0.5 text-muted">{tool.purpose}</dd>
        </div>
        <div>
          <dt className="text-[11.5px] font-semibold tracking-wider text-accent uppercase">Quando usar</dt>
          <dd className="mt-0.5 text-muted">{tool.when}</dd>
        </div>
        <div>
          <dt className="text-[11.5px] font-semibold tracking-wider text-accent uppercase">O que devo aprender</dt>
          <dd className="mt-0.5">
            <ul className="list-disc space-y-0.5 pl-4 text-muted">
              {tool.learn.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <div className="mt-auto">
        <p className="mb-1.5 text-[12px] font-medium text-subtle">Nível de domínio</p>
        <div className="flex gap-1" role="group" aria-label={`Nível de domínio em ${tool.name}`}>
          {LEVELS.map((name, i) => (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={name}
              aria-pressed={level !== null && i <= level}
              onClick={() => choose(i)}
              className={cn(
                'tabular h-8 flex-1 cursor-pointer rounded-md border text-[12px] font-semibold transition-colors',
                level !== null && i <= level ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface-2 text-subtle hover:border-line-strong',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
