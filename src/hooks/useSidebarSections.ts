import { useCallback, useState } from 'react'
import type { NavSection } from '@/config/navigation'

const STORAGE_KEY = 'bos.sidebar.sections'

function load(): Record<string, boolean> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

/**
 * Quais seções da sidebar estão abertas (várias ao mesmo tempo).
 * Guarda só o que o usuário mudou; seções novas seguem o `defaultOpen`.
 */
export function useSidebarSections() {
  const [saved, setSaved] = useState(load)

  const isOpen = useCallback((s: NavSection) => saved[s.id] ?? !!s.defaultOpen, [saved])

  const toggle = useCallback((s: NavSection) => {
    setSaved((prev) => {
      const next = { ...prev, [s.id]: !(prev[s.id] ?? !!s.defaultOpen) }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* armazenamento indisponível: vale só nesta sessão */
      }
      return next
    })
  }, [])

  return { isOpen, toggle }
}
