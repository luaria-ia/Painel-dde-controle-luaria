import { GraduationCap } from 'lucide-react'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { studyPaths } from '@/lib/studies'

export function StudyNotFound({ what = 'Conteúdo' }: { what?: string }) {
  return (
    <Card>
      <EmptyState
        icon={GraduationCap}
        title={`${what} não encontrado`}
        description="O link pode estar desatualizado."
        action={
          <ButtonLink to={studyPaths.home} size="sm" variant="primary">
            Voltar para Estudos
          </ButtonLink>
        }
      />
    </Card>
  )
}
