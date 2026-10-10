import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { useData } from '@/store/useData'

/** Aviso exibido enquanto houver dados de demonstração no sistema. */
export function DemoBanner() {
  const { hasDemoData } = useData()
  if (!hasDemoData) return null
  return (
    <div className="mb-6 flex flex-col gap-2 rounded-xl border border-dashed border-line-strong bg-surface/60 px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5 text-muted">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
        <span>
          Você está vendo <strong className="font-medium text-fg">dados de exemplo</strong> (marcados com o selo “Exemplo”). Os projetos Luaria, Med Resumos e Social Media são mantidos.
        </span>
      </div>
      <Link to="/configuracoes#dados" className="shrink-0 pl-6.5 font-medium text-accent hover:underline sm:pl-0">
        Remover exemplos →
      </Link>
    </div>
  )
}
