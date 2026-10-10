import type { ReactNode } from 'react'
import type { RichBlock } from '@/types/studies'

/** **negrito** e *itálico* → elementos React (nunca HTML bruto). */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const tok = m[0]
    parts.push(
      tok.startsWith('**') ? (
        <strong key={m.index} className="font-semibold text-fg">
          {tok.slice(2, -2)}
        </strong>
      ) : (
        <em key={m.index}>{tok.slice(1, -1)}</em>
      ),
    )
    last = m.index + tok.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

function Block({ block }: { block: RichBlock }) {
  if (typeof block === 'string')
    return (
      <p className="whitespace-pre-line">
        <Inline text={block} />
      </p>
    )
  if ('prompt' in block)
    return <pre className="overflow-x-auto rounded-lg border border-line bg-surface-2 px-3.5 py-3 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">{block.prompt}</pre>
  if ('list' in block)
    return (
      <ul className="list-disc space-y-1 pl-5">
        {block.list.map((item, i) => (
          <li key={i}>
            <Inline text={item} />
          </li>
        ))}
      </ul>
    )
  const [head, ...rows] = block.table
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[480px] border-collapse text-left text-[13px]">
        <thead className="bg-surface-2 text-[12px] text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  <Inline text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Conteúdo de aula/exercício: parágrafos, tabelas, prompts e listas. */
export function RichBlocks({ blocks, className }: { blocks: RichBlock[]; className?: string }) {
  return (
    <div className={className ?? 'flex flex-col gap-3'}>
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  )
}
