import type { ThemePreference } from '@/types'

/**
 * Cópia local do tema só para evitar o "piscar" de tema errado antes do login/carregamento.
 * A fonte da verdade continua sendo user_settings no banco. Lida por public/theme-init.js.
 */
const KEY = 'bos:theme'

export function cacheTheme(theme: ThemePreference) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* navegação privada: ignora */
  }
}
