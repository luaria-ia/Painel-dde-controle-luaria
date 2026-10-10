import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { CommandPalette } from '@/components/search/CommandPalette'
import { useTheme } from '@/hooks/useTheme'
import { useData } from '@/store/useData'
import { MobileBottomNav, MobileTopBar } from './MobileNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const { ready, loadError, settings } = useData()
  const { pathname } = useLocation()
  const [searching, setSearching] = useState(false)
  useTheme(settings.theme)

  // Atalho global da busca: Cmd/Ctrl + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearching((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-dvh">
      <Sidebar onSearch={() => setSearching(true)} />
      <MobileTopBar onSearch={() => setSearching(true)} />
      <main className="pb-24 lg:pb-10 lg:pl-60">
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-6">
          {!ready ? (
            <LoadingSkeleton />
          ) : loadError ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4" /> {loadError} Recarregue a página.
            </div>
          ) : (
            <Suspense fallback={<LoadingSkeleton />}>
              <Outlet />
            </Suspense>
          )}
        </div>
      </main>
      <MobileBottomNav />
      {ready && !loadError && <CommandPalette open={searching} onClose={() => setSearching(false)} />}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Carregando">
      <div className="mb-8 h-7 w-48 rounded-lg bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-surface-2" />
        ))}
      </div>
      <div className="mt-6 h-64 rounded-xl bg-surface-2" />
    </div>
  )
}
