import { useEffect } from 'react'
import { cacheTheme } from '@/lib/themeCache'
import type { ThemePreference } from '@/types'

/** Aplica a classe .dark no <html> conforme a preferência (e acompanha o sistema). */
export function useTheme(theme: ThemePreference) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e100f' : '#f6f5f1')
    }
    apply()
    cacheTheme(theme)
    if (theme !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}
