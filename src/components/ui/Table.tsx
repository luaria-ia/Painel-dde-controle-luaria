import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Tabela simples. Em telas pequenas as listas usam a variante em cartões
 * (ver componentes *List), então a tabela só aparece a partir de `md`.
 */
export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className={cn('w-full min-w-[720px] table-fixed border-collapse text-sm', className)} {...rest} />
    </div>
  )
}

export function THead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />
}

export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-line" {...props} />
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'border-y border-line bg-surface-2/60 px-4 py-2 text-left text-[11.5px] font-medium tracking-wide text-subtle uppercase first:pl-5 last:pr-5',
        className,
      )}
      {...rest}
    />
  )
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-2.5 align-middle first:pl-5 last:pr-5', className)} {...rest} />
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('group transition-colors hover:bg-surface-2/50', className)} {...rest} />
}
