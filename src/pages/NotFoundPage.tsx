import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Card>
      <EmptyState icon={Compass} title="Página não encontrada" description="O endereço acessado não existe." action={<Button onClick={() => navigate('/')}>Ir para o Dashboard</Button>} />
    </Card>
  )
}
