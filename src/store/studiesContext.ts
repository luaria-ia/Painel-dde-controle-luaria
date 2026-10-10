import { createContext, useContext } from 'react'
import type { ID } from '@/types'
import type { LibraryItem, StudyHourLog, StudyItemKind, StudyProgress, StudyProgressPatch } from '@/types/studies'
import type { CreateInput, UpdateInput } from '@/types'
import type { ProgressMap } from '@/lib/studies'

export interface StudiesContextValue {
  ready: boolean
  loadError: string | null
  progress: StudyProgress[]
  progressMap: ProgressMap
  hours: StudyHourLog[]
  library: LibraryItem[]

  /** Atualiza (otimista) e grava. Resolve false se falhar (erro já notificado). */
  saveProgress(itemId: string, kind: StudyItemKind, patch: StudyProgressPatch): Promise<boolean>
  logHours(input: CreateInput<StudyHourLog>): Promise<StudyHourLog | null>
  deleteHours(id: ID): Promise<boolean>
  createLibraryItem(input: CreateInput<LibraryItem>): Promise<LibraryItem | null>
  updateLibraryItem(id: ID, patch: UpdateInput<LibraryItem>): Promise<LibraryItem | null>
  deleteLibraryItem(id: ID): Promise<boolean>
}

export const StudiesContext = createContext<StudiesContextValue | null>(null)

export function useStudies(): StudiesContextValue {
  const ctx = useContext(StudiesContext)
  if (!ctx) throw new Error('useStudies deve ser usado dentro de <StudiesProvider>.')
  return ctx
}
