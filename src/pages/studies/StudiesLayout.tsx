import { Outlet } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { StudiesProvider } from '@/store/StudiesProvider'
import { useStudies } from '@/store/studiesContext'

function Gate() {
  const { ready, loadError } = useStudies()
  if (!ready)
    return (
      <div className="animate-pulse" aria-busy="true" aria-label="Carregando">
        <div className="mb-8 h-7 w-48 rounded-lg bg-surface-2" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[104px] rounded-xl bg-surface-2/70" />
          ))}
        </div>
      </div>
    )
  if (loadError)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-700 dark:text-rose-300">
        <AlertCircle className="h-4 w-4" /> {loadError} Recarregue a página.
      </div>
    )
  return <Outlet />
}

/** Rotas de Aprendizado (Estudos, Biblioteca, Projetos de estudo) compartilham este estado. */
export function StudiesLayout() {
  return (
    <StudiesProvider>
      <Gate />
    </StudiesProvider>
  )
}
