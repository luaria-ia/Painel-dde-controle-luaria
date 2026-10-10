import { useState } from 'react'
import { Copy, ExternalLink, Library, Pencil, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { LibraryItemModal } from '@/components/studies/LibraryItemModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { useToast } from '@/components/ui/toastContext'
import { LIBRARY_TYPES } from '@/config/library'
import { ACTIVE_TRACKS, findTrack } from '@/data/studies'
import { LIBRARY_STARTERS } from '@/data/studies/libraryStarters'
import { normalize } from '@/lib/utils'
import { useStudies } from '@/store/studiesContext'
import type { LibraryItem, LibraryItemType } from '@/types/studies'

/** Só abre links http(s) — o banco também valida. */
const safeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : null)

export function LibraryPage() {
  const { library, createLibraryItem } = useStudies()
  const [seeding, setSeeding] = useState(false)
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<LibraryItemType | ''>('')
  const [trackId, setTrackId] = useState('')
  const [editing, setEditing] = useState<LibraryItem | null>(null)
  const [creating, setCreating] = useState(false)

  const q = normalize(query.trim())
  const byTrack = library.filter((i) => !trackId || (trackId === 'geral' ? !i.trackId : i.trackId === trackId))
  const filtered = byTrack.filter((i) => (!type || i.type === type) && (!q || normalize(`${i.title} ${i.content} ${i.url} ${i.tags.join(' ')}`).includes(q)))

  const copy = async (item: LibraryItem) => {
    try {
      await navigator.clipboard.writeText(item.content || item.url)
      toast.success('Copiado para a área de transferência')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const addStarters = async () => {
    setSeeding(true)
    let added = 0
    for (const item of LIBRARY_STARTERS) if (await createLibraryItem(item)) added++
    setSeeding(false)
    if (added) toast.success(`${added} itens adicionados`)
  }

  return (
    <div>
      <PageHeader
        title="Biblioteca"
        description="Prompts, templates, referências e materiais — disponíveis para todas as trilhas."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
            Novo item
          </Button>
        }
      />
      <div className="mb-3 grid grid-cols-1 gap-2 sm:flex sm:items-center">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input
            aria-label="Pesquisar"
            type="search"
            className="h-8 pl-9 text-[13px]"
            placeholder="Pesquisar na biblioteca…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          compact
          aria-label="Trilha"
          value={trackId}
          placeholder="Todas as trilhas"
          options={[{ value: 'geral', label: 'Geral (sem trilha)' }, ...ACTIVE_TRACKS.map((t) => ({ value: t.id, label: t.title }))]}
          onChange={(e) => setTrackId(e.target.value)}
        />
      </div>
      <Segmented
        className="mb-4"
        ariaLabel="Filtrar por tipo"
        value={type}
        onChange={setType}
        options={[
          { value: '' as const, label: 'Todos', count: byTrack.length },
          ...(Object.entries(LIBRARY_TYPES) as [LibraryItemType, (typeof LIBRARY_TYPES)[LibraryItemType]][]).map(([value, t]) => ({
            value,
            label: t.plural,
            count: byTrack.filter((i) => i.type === value).length,
          })),
        ]}
      />

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const t = LIBRARY_TYPES[item.type]
            const track = item.trackId ? findTrack(item.trackId) : null
            const url = safeUrl(item.url)
            return (
              <Card key={item.id} className="flex min-h-[176px] flex-col gap-2.5 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted">
                    <t.icon className="h-3.5 w-3.5 text-accent" />
                    {t.label}
                  </span>
                  <span className="flex-1" />
                  {track && <Badge>{track.title}</Badge>}
                </div>
                <h3 className="text-[14px] font-semibold">{item.title}</h3>
                <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed whitespace-pre-wrap text-muted">{item.content || item.url}</p>
                <div className="flex items-center gap-1">
                  <div className="flex min-w-0 flex-1 flex-wrap gap-x-2 text-[12px] text-subtle">
                    {item.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir link"
                      title="Abrir link"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Button variant="ghost" size="icon" icon={Copy} aria-label="Copiar" title="Copiar" onClick={() => void copy(item)} />
                  <Button variant="ghost" size="icon" icon={Pencil} aria-label="Editar" title="Editar ou excluir" onClick={() => setEditing(item)} />
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Library}
            title={library.length ? 'Nada encontrado com esses filtros' : 'Sua biblioteca está vazia'}
            description={library.length ? undefined : 'Guarde prompts, templates, referências e materiais para reutilizar.'}
            action={
              !library.length && (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                    Adicionar primeiro item
                  </Button>
                  <Button size="sm" loading={seeding} onClick={addStarters}>
                    Adicionar {LIBRARY_STARTERS.length} modelos iniciais
                  </Button>
                </div>
              )
            }
          />
        </Card>
      )}

      <LibraryItemModal
        open={creating}
        onClose={() => setCreating(false)}
        defaults={{
          trackId: trackId && trackId !== 'geral' ? trackId : null,
          type: type || undefined,
        }}
      />
      <LibraryItemModal open={!!editing} item={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
