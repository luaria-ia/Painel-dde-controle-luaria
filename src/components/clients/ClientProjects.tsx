import { useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { Avatar } from '@/components/boards/BoardBits'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { PROJECT_STATUS } from '@/config/labels'
import { projectType } from '@/data/boards/projectTypes'
import { formatDateTime } from '@/lib/format'
import { useData } from '@/store/useData'
import type { Client } from '@/types'

/** Seção “Projetos” do cliente: cada projeto real, com tipo, status, responsáveis, workflow e atualização. */
export function ClientProjects({ client }: { client: Client }) {
  const { projectById } = useData()
  const [creating, setCreating] = useState(false)
  const projects = client.projectIds
    .map((id) => projectById.get(id))
    .filter((p) => !!p)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Projetos</h2>
        <Button size="sm" icon={Plus} onClick={() => setCreating(true)}>
          Novo projeto
        </Button>
      </div>
      {projects.length === 0 ? (
        <Card className="p-4">
          <p className="text-[13px] text-subtle">Nenhum projeto. Crie um projeto — o tipo dele define as áreas e workflows.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {projects.map((p) => {
            const t = projectType(p.type)
            const status = PROJECT_STATUS[p.status]
            return (
              <Card key={p.id} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-lg" aria-hidden="true">
                    {t.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{p.name}</p>
                    <p className="text-[12.5px] text-muted">
                      Tipo: {t.label} · Status: <Badge tone={status.tone}>{status.label}</Badge>
                    </p>
                  </div>
                  {p.owners.length > 0 && (
                    <span className="flex -space-x-1.5" aria-label={`Responsáveis: ${p.owners.join(', ')}`}>
                      {p.owners.slice(0, 3).map((o) => (
                        <Avatar key={o} name={o} className="ring-2 ring-surface" />
                      ))}
                    </span>
                  )}
                </div>
                {(t.clientWorkspace?.areas ?? t.areas).length > 0 && <p className="text-[12px] text-subtle">Áreas: {(t.clientWorkspace?.areas ?? t.areas).map((a) => `${a.icon} ${a.label}`).join(' · ')}</p>}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] text-subtle">Atualizado {formatDateTime(p.updatedAt)}</span>
                  <ButtonLink to={t.clientWorkspace ? `/projetos/${p.id}/clientes/${client.id}` : `/projetos/${p.id}`} size="sm">
                    Abrir projeto <ArrowRight className="h-3.5 w-3.5" />
                  </ButtonLink>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <ProjectFormModal open={creating} onClose={() => setCreating(false)} defaultClientId={client.id} />
    </section>
  )
}
