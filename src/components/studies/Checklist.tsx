import { cn } from '@/lib/utils'

/** Checklist marcável; `checked` guarda as posições marcadas. */
export function Checklist({ items, checked, onChange }: { items: string[]; checked: number[]; onChange: (next: number[]) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((label, i) => {
        const on = checked.includes(i)
        return (
          <label key={i} className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 text-[14px] leading-snug transition-colors hover:bg-surface-2">
            <input
              type="checkbox"
              checked={on}
              onChange={(e) => onChange(e.target.checked ? [...new Set([...checked, i])].sort((a, b) => a - b) : checked.filter((x) => x !== i))}
              className="mt-0.5 h-[15px] w-[15px] shrink-0 cursor-pointer accent-[var(--accent)]"
            />
            <span className={cn(on && 'text-subtle line-through')}>{label}</span>
          </label>
        )
      })}
    </div>
  )
}
