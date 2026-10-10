import { Fragment, type ReactNode } from 'react'

/**
 * Renderizador mínimo e SEGURO de markdown para respostas da IA.
 * Gera elementos React (nunca HTML bruto) — não há risco de injeção de scripts.
 * Suporta: títulos (#, ##, ###), listas (-, *, 1.), **negrito**, *itálico*, `código` e parágrafos.
 */
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) parts.push(<strong key={i++} className="font-semibold text-fg">{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) parts.push(<code key={i++} className="rounded bg-surface-2 px-1 text-[0.92em]">{tok.slice(1, -1)}</code>)
    else parts.push(<em key={i++}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let para: string[] = []

  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{inline(para.join(' '))}</p>)
    para = []
  }
  const flushList = () => {
    if (!list) return
    const Tag = list.ordered ? 'ol' : 'ul'
    blocks.push(
      <Tag key={blocks.length} className={list.ordered ? 'list-decimal space-y-1 pl-5' : 'list-disc space-y-1 pl-5'}>
        {list.items.map((it, j) => (
          <li key={j}>{inline(it)}</li>
        ))}
      </Tag>,
    )
    list = null
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const h = /^(#{1,3})\s+(.*)$/.exec(line)
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line)
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (!line.trim()) {
      flushPara()
      flushList()
    } else if (h) {
      flushPara()
      flushList()
      blocks.push(
        <p key={blocks.length} className={h[1].length === 1 ? 'pt-1 text-base font-semibold text-fg' : 'pt-1 text-[13.5px] font-semibold text-fg'}>
          {inline(h[2])}
        </p>,
      )
    } else if (ul || ol) {
      flushPara()
      const ordered = !!ol
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { ordered, items: [] }
      }
      list.items.push((ul ?? ol)![1])
    } else {
      flushList()
      para.push(line.trim())
    }
  }
  flushPara()
  flushList()
  return <div className={className ?? 'flex flex-col gap-2 text-[13.5px] leading-relaxed text-muted'}>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>
}
