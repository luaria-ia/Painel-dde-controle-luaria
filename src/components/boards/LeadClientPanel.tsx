import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderPlus, Link2, UserCheck, UserPlus } from 'lucide-react'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/toastContext'
import type { BoardApi } from '@/hooks/useBoard'
import { LEAD_STATUS_CLIENT } from '@/data/boards/projectTypes'
import { matchClients } from '@/lib/leads'
import { useData } from '@/store/useData'
import type { Client } from '@/types'
import type { BoardCard } from '@/types/boards'

/**
 * Lead → conversão → cliente → projeto. A oportunidade continua sendo o mesmo registro
 * (com todo o histórico de interações); só ganha o vínculo com o cliente.
 */
export function LeadClientPanel({ api, card }: { api: BoardApi; card: BoardCard }) {
  const { clients, clientById, createClient } = useData()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [newProject, setNewProject] = useState(false)
  const client = card.clientId ? clientById.get(card.clientId) : undefined

  const link = async (c: Client) => {
    // Mesmo registro: só ganha o vínculo com o cliente e o status “Cliente”.
    const hasClientStatus = api.board?.fields.some((x) => x.key === 'status' && x.options?.includes(LEAD_STATUS_CLIENT))
    const fields = hasClientStatus ? { ...card.fields, status: LEAD_STATUS_CLIENT } : card.fields
    if (await api.updateCard(card.id, { clientId: c.id, fields })) {
      toast.success(`Oportunidade vinculada a ${c.name}`)
      setOpen(false)
    }
  }

  const create = async () => {
    setBusy(true)
    const f = card.fields
    const notes = [
      `Cliente originado do CRM (${api.board?.name ?? 'Luaria.IA'}).`,
      f.segmento && `Segmento: ${f.segmento}.`,
      f.cidade && `Cidade: ${f.cidade}.`,
      f.origem && `Origem: ${f.origem}.`,
      f.interesse && `Interesse: ${f.interesse}.`,
      f.problema && `Problema percebido: ${f.problema}.`,
      f.instagram && `Instagram: ${f.instagram}.`,
      f.valor_potencial && `Valor potencial: R$ ${f.valor_potencial}.`,
      card.description && `Observações: ${card.description}`,
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 5000)
    const created = await createClient({
      name: card.title.slice(0, 120),
      company: (f.empresa ?? '').slice(0, 120),
      email: '',
      phone: '',
      whatsapp: (f.whatsapp ?? '').slice(0, 40),
      notes,
      status: 'ativo',
      projectIds: [],
    })
    if (created) await link(created)
    setBusy(false)
  }

  if (client)
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-700 dark:text-emerald-300">
          <UserCheck className="h-3.5 w-3.5" /> Convertido em cliente
        </p>
        <Link to={`/clientes/${client.id}`} className="text-[13.5px] font-semibold hover:underline">
          {client.name}
        </Link>
        <Button size="sm" icon={FolderPlus} onClick={() => setNewProject(true)}>
          Criar projeto para o cliente
        </Button>
        <ProjectFormModal open={newProject} onClose={() => setNewProject(false)} defaultClientId={client.id} />
      </div>
    )

  const candidates = matchClients(card, clients)
  return (
    <div className="flex flex-col gap-2">
      <Button icon={UserPlus} variant={card.completedAt ? 'primary' : 'secondary'} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Converter em cliente
      </Button>
      {open && (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-2/50 p-3 text-[12.5px]">
          {candidates.length > 0 && (
            <>
              <p className="text-muted">Já existe um cadastro parecido — vincule em vez de duplicar:</p>
              {candidates.map((c) => (
                <Button key={c.id} size="sm" icon={Link2} onClick={() => void link(c)}>
                  Vincular a {c.name}
                </Button>
              ))}
            </>
          )}
          <Button size="sm" variant={candidates.length ? 'ghost' : 'primary'} loading={busy} icon={UserPlus} onClick={() => void create()}>
            Criar novo cliente
          </Button>
          <p className="text-subtle">
            O cliente recebe nome do contato, empresa e WhatsApp desta oportunidade. O histórico comercial continua aqui e aparece na página do cliente.
          </p>
        </div>
      )}
    </div>
  )
}
