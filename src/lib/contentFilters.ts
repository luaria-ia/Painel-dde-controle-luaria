export type ContentView = 'kanban' | 'lista'

export function withContentView(params: URLSearchParams, view: ContentView): URLSearchParams {
  const next = new URLSearchParams(params)
  if (view === 'lista') next.set('view', 'lista')
  else next.delete('view')
  return next
}

export function withContentProject(params: URLSearchParams, projectId: string): URLSearchParams {
  const next = new URLSearchParams(params)
  if (projectId) next.set('projeto', projectId)
  else next.delete('projeto')
  return next
}
