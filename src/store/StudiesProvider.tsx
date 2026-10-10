import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useToast } from '@/components/ui/toastContext'
import { libraryRepository, studyHoursRepository, studyProgressRepository } from '@/repositories/studies'
import type { CreateInput, ID, UpdateInput } from '@/types'
import type { LibraryItem, StudyHourLog, StudyItemKind, StudyProgress, StudyProgressPatch } from '@/types/studies'
import { StudiesContext, type StudiesContextValue } from './studiesContext'

const message = (err: unknown) => (err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')

/** Estado da área de Estudos. Carregado só quando alguma página de Estudos é aberta. */
export function StudiesProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [progress, setProgress] = useState<StudyProgress[]>([])
  const [hours, setHours] = useState<StudyHourLog[]>([])
  const [library, setLibrary] = useState<LibraryItem[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([studyProgressRepository.list(), studyHoursRepository.list(), libraryRepository.list()])
      .then(([p, h, l]) => {
        if (!alive) return
        setProgress(p)
        setHours(h)
        setLibrary(l)
      })
      .catch((err) => alive && setLoadError(message(err)))
      .finally(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  const progressMap = useMemo(() => new Map(progress.map((p) => [p.itemId, p])), [progress])
  const progressRef = useRef(progress)
  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  const saveProgress = useCallback(
    async (itemId: string, kind: StudyItemKind, patch: StudyProgressPatch) => {
      const previous = progressRef.current.find((p) => p.itemId === itemId)
      setProgress((list) => {
        const current = list.find((p) => p.itemId === itemId)
        const now = new Date().toISOString()
        const next = (
          current
            ? { ...current, ...patch }
            : {
                id: `tmp-${itemId}`,
                itemId,
                kind,
                done: false,
                doneAt: null,
                answer: '',
                notes: '',
                checks: [],
                level: null,
                createdAt: now,
                updatedAt: now,
                ...patch,
              }
        ) as StudyProgress
        return current ? list.map((p) => (p.itemId === itemId ? next : p)) : [...list, next]
      })
      try {
        const saved = await studyProgressRepository.upsert(itemId, kind, patch)
        // Mantém o que foi digitado depois do envio (só atualiza metadados do servidor).
        setProgress((list) =>
          list.map((p) =>
            p.itemId === itemId
              ? {
                  ...p,
                  id: saved.id,
                  createdAt: saved.createdAt,
                  updatedAt: saved.updatedAt,
                }
              : p,
          ),
        )
        return true
      } catch (err) {
        // Desfaz só os campos deste envio (preserva alterações feitas em paralelo).
        setProgress((list) =>
          previous
            ? list.map((p) =>
                p.itemId === itemId
                  ? {
                      ...p,
                      ...Object.fromEntries(Object.keys(patch).map((k) => [k, previous[k as keyof StudyProgress]])),
                    }
                  : p,
              )
            : list.filter((p) => p.itemId !== itemId),
        )
        toast.error(message(err))
        return false
      }
    },
    [toast],
  )

  const logHours = useCallback(
    async (input: CreateInput<StudyHourLog>) => {
      try {
        const created = await studyHoursRepository.create(input)
        setHours((list) => [created, ...list].sort((a, b) => b.date.localeCompare(a.date)))
        return created
      } catch (err) {
        toast.error(message(err))
        return null
      }
    },
    [toast],
  )

  const deleteHours = useCallback(
    async (id: ID) => {
      try {
        await studyHoursRepository.remove(id)
        setHours((list) => list.filter((h) => h.id !== id))
        return true
      } catch (err) {
        toast.error(message(err))
        return false
      }
    },
    [toast],
  )

  const createLibraryItem = useCallback(
    async (input: CreateInput<LibraryItem>) => {
      try {
        const created = await libraryRepository.create(input)
        setLibrary((list) => [created, ...list])
        return created
      } catch (err) {
        toast.error(message(err))
        return null
      }
    },
    [toast],
  )

  const updateLibraryItem = useCallback(
    async (id: ID, patch: UpdateInput<LibraryItem>) => {
      try {
        const updated = await libraryRepository.update(id, patch)
        setLibrary((list) => [updated, ...list.filter((i) => i.id !== id)])
        return updated
      } catch (err) {
        toast.error(message(err))
        return null
      }
    },
    [toast],
  )

  const deleteLibraryItem = useCallback(
    async (id: ID) => {
      try {
        await libraryRepository.remove(id)
        setLibrary((list) => list.filter((i) => i.id !== id))
        return true
      } catch (err) {
        toast.error(message(err))
        return false
      }
    },
    [toast],
  )

  const value: StudiesContextValue = {
    ready,
    loadError,
    progress,
    progressMap,
    hours,
    library,
    saveProgress,
    logHours,
    deleteHours,
    createLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
  }
  return <StudiesContext.Provider value={value}>{children}</StudiesContext.Provider>
}
