import { useCallback } from 'react'
import { buildClientContext, buildFinancialContext, buildOverviewContext, buildProjectContext } from '@/services/ai/contextBuilder'
import type { AIContext } from '@/services/ai/types'
import { useData } from '@/store/useData'
import type { ID } from '@/types'

export type AIScopeRef =
  | { type: 'project'; id: ID }
  | { type: 'client'; id: ID }
  | { type: 'finance'; projectId?: ID | null }
  | { type: 'overview' }

/** Monta o contexto do escopo escolhido (com o histórico recente quando fizer sentido). */
export function useAIContext() {
  const data = useData()
  return useCallback(
    async (scope: AIScopeRef): Promise<AIContext> => {
      switch (scope.type) {
        case 'project':
          return buildProjectContext(data, scope.id, await data.listActivity({ projectId: scope.id, limit: 15 }).catch(() => []))
        case 'client':
          return buildClientContext(data, scope.id, await data.listActivity({ clientId: scope.id, limit: 15 }).catch(() => []))
        case 'finance':
          return buildFinancialContext(data, { projectId: scope.projectId })
        default:
          return buildOverviewContext(data)
      }
    },
    [data],
  )
}
