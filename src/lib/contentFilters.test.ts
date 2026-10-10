import { describe, expect, it } from 'vitest'
import { withContentProject, withContentView } from './contentFilters'

describe('content URL filters', () => {
  it('preserves the project filter when switching views', () => {
    const params = withContentView(new URLSearchParams('projeto=project-1'), 'lista')
    expect(params.get('projeto')).toBe('project-1')
    expect(params.get('view')).toBe('lista')
  })

  it('removes only the view parameter when returning to the kanban', () => {
    const params = withContentView(new URLSearchParams('projeto=project-1&view=lista'), 'kanban')
    expect(params.get('projeto')).toBe('project-1')
    expect(params.has('view')).toBe(false)
  })

  it('updates or clears the project filter without discarding other parameters', () => {
    const initial = new URLSearchParams('view=lista')
    expect(withContentProject(initial, 'project-2').toString()).toBe('view=lista&projeto=project-2')
    expect(withContentProject(new URLSearchParams('view=lista&projeto=project-2'), '').toString()).toBe('view=lista')
  })
})
