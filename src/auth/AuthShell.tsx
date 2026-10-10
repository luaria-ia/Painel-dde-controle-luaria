import type { ReactNode } from 'react'
import { APP_NAME } from '@/config/app'
import { LogoMark } from '@/components/layout/Logo'
import { useTheme } from '@/hooks/useTheme'

/** Moldura visual das telas públicas (login / redefinir senha). */
export function AuthShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  useTheme(readCachedTheme())
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="mb-4 h-10 w-10" />
          <p className="text-[13px] font-medium tracking-wide text-subtle uppercase">{APP_NAME}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">{children}</div>
      </div>
    </main>
  )
}

function readCachedTheme() {
  try {
    const t = localStorage.getItem('bos:theme')
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}
