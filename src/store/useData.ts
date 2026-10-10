import { useContext } from 'react'
import { DataContext, type DataContextValue } from './DataContext'

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>.')
  return ctx
}
