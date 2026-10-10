import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useToast } from '@/components/ui/toastContext'
import { runEvent, runScan, type AutomationEvent } from '@/services/automations/engine'
import {
  activityRepository,
  automationRepository,
  knowledgeRepository,
  notificationRepository,
  clientRepository,
  contentRepository,
  contractRepository,
  eventRepository,
  prospectRepository,
  radarRepository,
  settingsRepository,
  taskRepository,
  transactionRepository,
} from '@/repositories'
import { boardRepository, boardListRepository, boardCardRepository } from '@/repositories/boards'
import * as dataService from '@/services/dataService'
import type { Settings } from '@/types'
import { DataContext, type DataContextValue } from './DataContext'

const EMPTY_SETTINGS: Settings = {
  userName: '',
  theme: 'system',
  seeded: false,
  seedVersion: 0,
  aiProvider: 'auto',
  aiModel: 'gemini-flash-latest',
  aiInstructions: '',
  aiCascade: { strategy: 'auto', privacy: 'allow_free', layers: [] },
}

export function DataProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<dataService.Snapshot>(dataService.EMPTY_SNAPSHOT)
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS)

  // Referência sempre atualizada do estado (usada pelo motor de automações).
  const snapRef = useRef(snapshot)
  useEffect(() => {
    snapRef.current = snapshot
  }, [snapshot])

  const refresh = useCallback(async () => {
    const [snap, s] = await Promise.all([dataService.loadAll(), settingsRepository.get()])
    snapRef.current = snap
    setSnapshot(snap)
    setSettings(s)
  }, [])

  /** Varredura de gatilhos de estado (atrasos, vencimentos, aprovações). Silenciosa. */
  const scanning = useRef(false)
  const scan = useCallback(async () => {
    if (scanning.current) return 0
    scanning.current = true
    try {
      const n = await runScan(snapRef.current)
      if (n) await refresh()
      return n
    } catch (err) {
      console.warn('[automações] varredura falhou', err)
      return 0
    } finally {
      scanning.current = false
    }
  }, [refresh])

  /** Dispara gatilhos de evento após uma ação do usuário (não bloqueia a interface). */
  const emit = useCallback(
    (event: AutomationEvent) => {
      runEvent(snapRef.current, event)
        .then((n) => (n ? refresh() : undefined))
        .catch((err) => console.warn('[automações] evento falhou', err))
    },
    [refresh],
  )

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await dataService.ensureSeeded()
        await refresh()
        void scan()
      } catch (err) {
        if (alive) setLoadError(err instanceof Error ? err.message : 'Não foi possível carregar seus dados.')
      } finally {
        if (alive) setReady(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [refresh, scan])

  // Reavalia gatilhos de estado periodicamente e ao voltar para a aba (ex.: virou o dia).
  useEffect(() => {
    if (!ready) return
    const id = window.setInterval(() => void scan(), 10 * 60 * 1000)
    const onFocus = () => document.visibilityState === 'visible' && void scan()
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [ready, scan])

  /** Executa uma mutação, recarrega o estado e trata erros de forma uniforme. */
  const mutate = useCallback(
    async <R,>(fn: () => Promise<R>, fallback: R, refreshOnError = false): Promise<R> => {
      try {
        const result = await fn()
        await refresh()
        return result
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')
        if (refreshOnError) await refresh().catch(() => undefined)
        return fallback
      }
    },
    [refresh, toast],
  )

  const value = useMemo<DataContextValue>(() => {
    const { projects, tasks, clients } = snapshot
    return {
      ready,
      loadError,
      ...snapshot,
      settings,
      hasDemoData: (Object.values(snapshot) as Array<Array<{ isDemo?: boolean }>>).some((list) => list.some((i) => i.isDemo)),
      projectById: new Map(projects.map((p) => [p.id, p])),
      clientById: new Map(clients.map((c) => [c.id, c])),

      createProject: (input) => mutate(() => dataService.createProject(input), null),
      updateProject: (id, patch) => mutate(() => dataService.updateProject(id, patch, snapshot.projects.find((p) => p.id === id)?.type), null),
      deleteProject: (id) => mutate(() => dataService.deleteProject(id).then(() => true), false),

      createTask: (input) =>
        mutate(async () => {
          const t = await dataService.createTask(input)
          emit({ type: 'task_created', task: t })
          if (t.status === 'concluido') emit({ type: 'task_completed', task: t })
          return t
        }, null),
      updateTask: (id, patch) =>
        mutate(async () => {
          const prev = tasks.find((t) => t.id === id)
          const t = await dataService.updateTask(id, patch, prev)
          if (t.status === 'concluido' && prev?.status !== 'concluido') emit({ type: 'task_completed', task: t })
          return t
        }, null),
      setTaskStatus: async (id, status) => {
        const task = tasks.find((t) => t.id === id)
        if (!task) return null
        // Otimista: move o cartão na hora; se o servidor recusar, o refresh do mutate restaura.
        setSnapshot((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }))
        return mutate(
          async () => {
            const t = await dataService.setTaskStatus(task, status)
            if (status === 'concluido' && task.status !== 'concluido') emit({ type: 'task_completed', task: t })
            return t
          },
          null,
          true,
        )
      },
      deleteTask: (id) => mutate(() => taskRepository.remove(id).then(() => true), false),

      createClient: (input) => mutate(() => clientRepository.create(input), null),
      updateClient: (id, patch) => mutate(() => clientRepository.update(id, patch), null),
      deleteClient: (id) => mutate(() => dataService.deleteClient(id).then(() => true), false),

      createTransaction: (input) =>
        mutate(async () => {
          const t = await transactionRepository.create(input)
          emit({ type: t.type === 'receita' ? 'income_created' : 'expense_created', transaction: t })
          return t
        }, null),
      updateTransaction: (id, patch) => mutate(() => transactionRepository.update(id, patch), null),
      deleteTransaction: (id) => mutate(() => transactionRepository.remove(id).then(() => true), false),

      createEvent: (input) => mutate(() => eventRepository.create(input), null),
      updateEvent: (id, patch) => mutate(() => eventRepository.update(id, patch), null),
      deleteEvent: (id) => mutate(() => eventRepository.remove(id).then(() => true), false),

      createContract: (input) => mutate(() => contractRepository.create(input), null),
      updateContract: (id, patch) => mutate(() => contractRepository.update(id, patch), null),
      deleteContract: (id) => mutate(() => contractRepository.remove(id).then(() => true), false),

      createContent: (input) =>
        mutate(async () => {
          const c = await contentRepository.create(input)
          if (c.status === 'publicado') emit({ type: 'content_published', content: c })
          return c
        }, null),
      updateContent: (id, patch) =>
        mutate(async () => {
          const prev = snapshot.contents.find((c) => c.id === id)
          const c = await contentRepository.update(id, patch)
          if (c.status === 'publicado' && prev?.status !== 'publicado') emit({ type: 'content_published', content: c })
          return c
        }, null),
      setContentStatus: async (id, status) => {
        // Otimista, como no Kanban de tarefas.
        setSnapshot((s) => ({ ...s, contents: s.contents.map((c) => (c.id === id ? { ...c, status } : c)) }))
        const prev = snapshot.contents.find((c) => c.id === id)
        return mutate(
          async () => {
            const c = await dataService.setContentStatus(id, status)
            if (status === 'publicado' && prev?.status !== 'publicado') emit({ type: 'content_published', content: c })
            return c
          },
          null,
          true,
        )
      },
      deleteContent: (id) => mutate(() => contentRepository.remove(id).then(() => true), false),

      createFile: (input, file) => mutate(() => dataService.createFile(input, file), null),
      updateFile: (id, patch, file) => {
        const previous = snapshot.files.find((f) => f.id === id)
        return previous ? mutate(() => dataService.updateFile(previous, patch, file), null) : Promise.resolve(null)
      },
      deleteFile: (id) => {
        const item = snapshot.files.find((f) => f.id === id)
        return item ? mutate(() => dataService.deleteFile(item).then(() => true), false) : Promise.resolve(false)
      },

      createKnowledge: (input) => mutate(() => knowledgeRepository.create(input), null),
      updateKnowledge: (id, patch) => mutate(() => knowledgeRepository.update(id, patch), null),
      deleteKnowledge: (id) => mutate(() => knowledgeRepository.remove(id).then(() => true), false),

      createAutomation: (input) => mutate(() => automationRepository.create(input), null),
      updateAutomation: (id, patch) => mutate(() => automationRepository.update(id, patch), null),
      deleteAutomation: (id) => mutate(() => automationRepository.remove(id).then(() => true), false),
      runAutomations: () => mutate(() => runScan(snapRef.current), null),

      markNotificationsRead: async (ids) => {
        const now = new Date().toISOString()
        setSnapshot((s) => ({ ...s, notifications: s.notifications.map((n) => (ids.includes(n.id) ? { ...n, readAt: n.readAt ?? now } : n)) }))
        return mutate(() => notificationRepository.markRead(ids).then(() => true), false, true)
      },
      clearReadNotifications: () => mutate(() => notificationRepository.removeRead().then(() => true), false),

      listActivity: (filter) => activityRepository.list(filter),

      createProspect: (input) => mutate(() => prospectRepository.create(input), null),
      updateProspect: (id, patch) => mutate(() => prospectRepository.update(id, patch), null),
      deleteProspect: (id) => mutate(() => prospectRepository.remove(id).then(() => true), false),

      convertProspectToClient: (prospect) =>
        mutate(async () => {
          const client = await clientRepository.create({
            name: prospect.name,
            company: prospect.name,
            email: '',
            phone: prospect.channels?.whatsapp || '',
            whatsapp: prospect.channels?.whatsapp || '',
            status: 'negociacao',
            projectIds: [],
            notes: [
              prospect.segment ? `Segmento: ${prospect.segment}` : '',
              prospect.location ? `Localização: ${prospect.location}` : '',
              prospect.website ? `Website: ${prospect.website}` : '',
              prospect.channels?.instagram ? `Instagram: ${prospect.channels.instagram}` : '',
              prospect.channels?.linkedin ? `LinkedIn: ${prospect.channels.linkedin}` : '',
              prospect.opportunities ? `Oportunidades identificadas: ${prospect.opportunities}` : '',
              prospect.observations ? `Observações e hipóteses: ${prospect.observations}` : '',
            ]
              .filter(Boolean)
              .join('\n\n'),
          })
          await prospectRepository.update(prospect.id, {
            clientId: client.id,
            status: 'convertida',
          })
          return client
        }, null),

      convertProspectToCrmLead: (prospect, projectId) =>
        mutate(async () => {
          const targetProjectId = projectId || snapshot.projects[0]?.id
          if (!targetProjectId) {
            toast.error('Nenhum projeto encontrado para vincular o lead no CRM.')
            return false
          }

          const boards = await boardRepository.listBy([targetProjectId]).catch(() => [])
          if (!boards.length) {
            toast.error('Nenhum quadro encontrado para este projeto.')
            return false
          }

          const targetBoard = boards.find((b) => b.templateKey?.includes('crm')) || boards[0]
          const lists = await boardListRepository.listBy([targetBoard.id]).catch(() => [])
          if (!lists.length) {
            toast.error('Nenhuma lista ou etapa encontrada no quadro selecionado.')
            return false
          }

          const targetList = lists[0]
          const card = await boardCardRepository.create({
            boardId: targetBoard.id,
            listId: targetList.id,
            title: prospect.name,
            description: [
              prospect.segment ? `Segmento: ${prospect.segment}` : '',
              prospect.location ? `Localização: ${prospect.location}` : '',
              prospect.opportunities ? `Oportunidades: ${prospect.opportunities}` : '',
              prospect.observations ? `Observações e hipóteses: ${prospect.observations}` : '',
              prospect.sourcesConsulted?.length ? `Fontes consultadas: ${prospect.sourcesConsulted.join(', ')}` : '',
            ]
              .filter(Boolean)
              .join('\n\n'),
            position: 0,
            priority: null,
            dueDate: null,
            assignee: '',
            labelIds: [],
            checklist: [],
            fields: {
              empresa: prospect.name,
              segmento: prospect.segment || '',
              cidade: prospect.location || '',
              data: new Date().toISOString().slice(0, 10),
              proxima_acao_data: prospect.nextStep || '',
              ...(prospect.channels?.whatsapp ? { whatsapp: prospect.channels.whatsapp } : {}),
              ...(prospect.channels?.instagram ? { instagram: prospect.channels.instagram } : {}),
              ...(prospect.website ? { website: prospect.website } : {}),
            },
            completedAt: null,
            clientId: prospect.clientId || null,
          })

          await prospectRepository.update(prospect.id, {
            boardCardId: card.id,
            status: 'qualificada',
          })

          return true
        }, false),

      // Radar Luaria.IA (Módulo K)
      createRadarOpportunity: (input) => mutate(() => radarRepository.create(input), null),
      updateRadarOpportunity: (id, patch) => mutate(() => radarRepository.update(id, patch), null),
      deleteRadarOpportunity: (id) => mutate(() => radarRepository.remove(id).then(() => true), false),
      importRadarOpportunities: (items) =>
        mutate(async () => {
          let count = 0
          for (const item of items) {
            await radarRepository.create(item)
            count++
          }
          toast.success(`${count} oportunidade(s) importada(s) com sucesso!`)
          return count
        }, 0),

      sendRadarOpportunityToCrm: (opportunity, projectId) =>
        mutate(async () => {
          const targetProjectId =
            projectId ||
            snapshot.projects.find((p) => p.name.toLowerCase().includes('luaria') || p.type === 'luaria_ai')?.id ||
            snapshot.projects[0]?.id

          if (!targetProjectId) {
            toast.error('Nenhum projeto encontrado para vincular no CRM.')
            return false
          }

          const boards = await boardRepository.listBy([targetProjectId]).catch(() => [])
          if (!boards.length) {
            toast.error('Nenhum quadro comercial encontrado para este projeto.')
            return false
          }

          const targetBoard =
            boards.find((b) => b.templateKey?.includes('crm') || b.name?.toLowerCase().includes('crm')) || boards[0]
          const lists = await boardListRepository.listBy([targetBoard.id]).catch(() => [])
          if (!lists.length) {
            toast.error('Nenhuma etapa encontrada no quadro CRM selecionado.')
            return false
          }

          const targetList = lists[0]
          const existingCards = await boardCardRepository.listBy([targetBoard.id]).catch(() => [])

          // Prevenção de duplicidade
          const matchedCard = existingCards.find(
            (c) =>
              (opportunity.boardCardId && c.id === opportunity.boardCardId) ||
              (opportunity.clientName && c.fields?.empresa?.toLowerCase().trim() === opportunity.clientName.toLowerCase().trim()) ||
              (opportunity.title && c.title.toLowerCase().trim() === opportunity.title.toLowerCase().trim()),
          )

          const now = new Date().toISOString()
          const descriptionBody = [
            `Origem: ${opportunity.source.toUpperCase()}`,
            opportunity.originalUrl ? `Link original: ${opportunity.originalUrl}` : '',
            opportunity.requestedScope ? `Escopo solicitado:\n${opportunity.requestedScope}` : '',
            opportunity.identifiedNeeds ? `Necessidades:\n${opportunity.identifiedNeeds}` : '',
            opportunity.decisionRationale ? `Análise Luaria.IA:\n${opportunity.decisionRationale}` : '',
            opportunity.proposalText ? `Texto da proposta:\n${opportunity.proposalText}` : '',
          ]
            .filter(Boolean)
            .join('\n\n')

          if (matchedCard) {
            await boardCardRepository.update(matchedCard.id, {
              description: descriptionBody,
              fields: {
                ...matchedCard.fields,
                empresa: opportunity.clientName || matchedCard.fields?.empresa || '',
                segmento: opportunity.companySegment || matchedCard.fields?.segmento || '',
                cidade: opportunity.companyCity || matchedCard.fields?.cidade || '',
                proxima_acao_data: opportunity.nextActionDueDate || matchedCard.fields?.proxima_acao_data || '',
                ...(opportunity.companyWhatsapp ? { whatsapp: opportunity.companyWhatsapp } : {}),
                ...(opportunity.companyInstagram ? { instagram: opportunity.companyInstagram } : {}),
                origem: opportunity.source,
              },
            })

            await radarRepository.update(opportunity.id, {
              boardCardId: matchedCard.id,
              crmBoardId: targetBoard.id,
              crmSyncedAt: now,
              status: opportunity.status === 'nova' || opportunity.status === 'em_analise' ? 'aprovada' : opportunity.status,
            })

            toast.success(`Oportunidade sincronizada ao lead existente "${matchedCard.title}" no CRM sem duplicações!`)
            return true
          }

          const newCard = await boardCardRepository.create({
            boardId: targetBoard.id,
            listId: targetList.id,
            title: opportunity.title,
            description: descriptionBody,
            position: 0,
            priority: opportunity.priority === 'urgente' ? 'urgente' : opportunity.priority === 'alta' ? 'alta' : null,
            dueDate: opportunity.nextActionDueDate || null,
            assignee: opportunity.responsibleName || '',
            labelIds: [],
            checklist: [],
            fields: {
              empresa: opportunity.clientName || opportunity.title,
              segmento: opportunity.companySegment || '',
              cidade: opportunity.companyCity || '',
              data: opportunity.identifiedDate || now.slice(0, 10),
              proxima_acao_data: opportunity.nextActionDueDate || '',
              ...(opportunity.companyWhatsapp ? { whatsapp: opportunity.companyWhatsapp } : {}),
              ...(opportunity.companyInstagram ? { instagram: opportunity.companyInstagram } : {}),
              origem: opportunity.source,
            },
            completedAt: null,
            clientId: null,
          })

          await radarRepository.update(opportunity.id, {
            boardCardId: newCard.id,
            crmBoardId: targetBoard.id,
            crmSyncedAt: now,
            status: 'aprovada',
          })

          toast.success(`"${opportunity.title}" enviada ao CRM com sucesso!`)
          return true
        }, false),

      updateSettings: async (patch) => {
        setSettings((s) => ({ ...s, ...patch })) // otimista (tema muda na hora)
        return mutate(() => settingsRepository.save(patch), null, true)
      },
      loadDemoData: () => mutate(() => dataService.loadDemoData().then(() => true), false),
      clearDemoData: () => mutate(() => dataService.clearDemoData(), null),
      resetToSeed: () => mutate(() => dataService.resetToSeed().then(() => true), false),
      exportAll: () => mutate(() => dataService.exportAll(), null),
    }
  }, [snapshot, settings, ready, loadError, mutate, emit])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
