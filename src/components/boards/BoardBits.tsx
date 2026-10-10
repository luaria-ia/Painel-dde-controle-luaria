import { cn, initials } from '@/lib/utils'
import { LABEL_COLORS } from '@/lib/boards'
import type { BoardLabel } from '@/types/boards'

const AVATAR_TONES = [
  'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/18 text-amber-800 dark:text-amber-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-teal-500/15 text-teal-700 dark:text-teal-300',
]

/** Avatar com iniciais (cor estável por nome). */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const tone = AVATAR_TONES[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % AVATAR_TONES.length]
  return (
    <span title={name} aria-label={name} className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold', tone, className)}>
      {initials(name)}
    </span>
  )
}

export function LabelChip({ label, className }: { label: Pick<BoardLabel, 'name' | 'color'>; className?: string }) {
  return (
    <span
      className={cn('inline-flex max-w-full items-center truncate rounded px-1.5 py-px text-[10.5px] font-semibold ring-1 ring-inset', LABEL_COLORS[label.color].chip, className)}
    >
      {label.name}
    </span>
  )
}
