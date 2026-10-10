import { useState } from 'react'
import { Download, ExternalLink, File, FileImage, FileSpreadsheet, FileText, FileVideo, FolderOpen, Link2, Pencil, Trash2, type LucideIcon } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Menu, type MenuItem } from '@/components/ui/Menu'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { useToast } from '@/components/ui/toastContext'
import { FILE_CATEGORY } from '@/config/labels'
import { useRemove } from '@/hooks/useRemove'
import { formatDateTime } from '@/lib/format'
import { formatBytes, getFileUrl } from '@/services/fileStorage'
import { useData } from '@/store/useData'
import type { FileCategory, FileItem } from '@/types'
import { FileFormModal } from './FileFormModal'

const icons: Record<FileCategory, LucideIcon> = {
  documento: FileText,
  briefing: FileText,
  imagem: FileImage,
  video: FileVideo,
  planilha: FileSpreadsheet,
  outro: File,
}

function FileIcon({ f }: { f: FileItem }) {
  const Icon = f.url ? Link2 : icons[f.category]
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted ring-1 ring-line">
      <Icon className="h-4 w-4" />
    </span>
  )
}

function sourceLabel(f: FileItem) {
  if (f.url) return 'Link externo'
  if (f.storagePath) return formatBytes(f.sizeBytes)
  return 'Sem anexo'
}

/** Abrir/baixar: links assinados de curta duração (arquivo privado). */
function useOpenFile() {
  const toast = useToast()
  return async (f: FileItem, download = false) => {
    if (f.url) return void window.open(f.url, '_blank', 'noopener,noreferrer')
    if (!f.storagePath) return toast.info('Este registro não tem arquivo anexado. Edite para enviar um.')
    // Abre a aba antes do await (evita bloqueio de pop-up) e só então define o endereço.
    const tab = download ? null : window.open('about:blank', '_blank')
    try {
      const url = await getFileUrl(f.storagePath, download)
      if (tab) {
        tab.opener = null
        tab.location.href = url
      } else {
        window.location.href = url
      }
    } catch (err) {
      tab?.close()
      toast.error(err instanceof Error ? err.message : 'Não foi possível abrir o arquivo.')
    }
  }
}

export function FileList({ files, showProject = true, emptyAction }: { files: FileItem[]; showProject?: boolean; emptyAction?: React.ReactNode }) {
  const { deleteFile } = useData()
  const remove = useRemove()
  const openFile = useOpenFile()
  const [editing, setEditing] = useState<FileItem | null>(null)

  if (files.length === 0) {
    return <EmptyState compact icon={FolderOpen} title="Nenhum arquivo" description="Envie documentos, briefings e materiais do projeto." action={emptyAction} />
  }

  const menu = (f: FileItem) => {
    const items: MenuItem[] = [
      { label: f.url ? 'Abrir link' : 'Abrir', icon: ExternalLink, onSelect: () => openFile(f) },
      ...(f.storagePath ? [{ label: 'Baixar', icon: Download, onSelect: () => openFile(f, true) }] : []),
      { label: 'Editar', icon: Pencil, onSelect: () => setEditing(f) },
      {
        label: 'Excluir',
        icon: Trash2,
        danger: true,
        onSelect: () =>
          remove({
            what: 'arquivo',
            name: f.name,
            action: () => deleteFile(f.id),
            message: f.storagePath ? `"${f.name}" e o arquivo enviado serão excluídos permanentemente.` : undefined,
          }),
      },
    ]
    return <Menu items={items} />
  }

  return (
    <div className="@container">
      <div className="hidden @3xl:block">
        <Table>
          <THead>
            <tr>
              <Th>Arquivo</Th>
              <Th className="w-28">Categoria</Th>
              {showProject && <Th className="w-36">Projeto</Th>}
              <Th className="w-36">Cliente</Th>
              <Th className="w-28">Tamanho</Th>
              <Th className="w-32">Criado em</Th>
              <Th className="w-10" aria-label="Ações" />
            </tr>
          </THead>
          <TBody>
            {files.map((f) => (
              <Tr key={f.id} className="cursor-pointer" onClick={() => openFile(f)}>
                <Td>
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon f={f} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium" title={f.name}>
                          {f.name}
                        </span>
                        {f.isDemo && <DemoBadge />}
                      </div>
                      {f.description && <p className="truncate text-[12px] text-subtle">{f.description}</p>}
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge tone={FILE_CATEGORY[f.category].tone}>{FILE_CATEGORY[f.category].label}</Badge>
                </Td>
                {showProject && (
                  <Td className="max-w-36">
                    <ProjectLink id={f.projectId} />
                  </Td>
                )}
                <Td className="max-w-36">
                  <ClientLink id={f.clientId} />
                </Td>
                <Td className="text-[13px] text-muted">{sourceLabel(f)}</Td>
                <Td className="text-[13px] whitespace-nowrap text-muted">{formatDateTime(f.createdAt)}</Td>
                <Td onClick={(e) => e.stopPropagation()}>{menu(f)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
      <ul className="divide-y divide-line border-t border-line @3xl:hidden">
        {files.map((f) => (
          <li key={f.id} className="flex cursor-pointer items-center gap-3 px-4 py-3" onClick={() => openFile(f)}>
            <FileIcon f={f} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{f.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-subtle">
                <Badge tone={FILE_CATEGORY[f.category].tone}>{FILE_CATEGORY[f.category].label}</Badge>
                <span>{sourceLabel(f)}</span>
                {showProject && f.projectId && <ProjectLink id={f.projectId} className="text-[12px]" />}
                {f.isDemo && <DemoBadge />}
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>{menu(f)}</div>
          </li>
        ))}
      </ul>
      <FileFormModal open={!!editing} file={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
