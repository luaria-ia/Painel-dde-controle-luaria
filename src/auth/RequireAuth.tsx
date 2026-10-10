import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LogoMark } from '@/components/layout/Logo'
import { useAuth } from './authContext'

/** Bloqueia o app inteiro para quem não está logado. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true" aria-label="Carregando">
        <LogoMark className="h-9 w-9 animate-pulse" />
      </div>
    )
  }
  if (!session) {
    const from = location.pathname + location.search
    return <Navigate to="/entrar" replace state={from !== '/' ? { from } : undefined} />
  }
  return <>{children}</>
}
