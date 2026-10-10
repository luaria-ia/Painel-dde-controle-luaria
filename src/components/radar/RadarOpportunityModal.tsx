import { useState, useEffect } from 'react'
import {
  Copy,
  Flame,
  History,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import {
  calculateRadarScore,
  DIFFICULTY_LABELS,
  EFFORT_LABELS,
  FIT_LUARIA_LABELS,
  RADAR_SOURCE_LABELS,
  RADAR_STATUS_LABELS,
} from '@/lib/radarScore'
import type { CreateInput } from '@/types'
import type {
  EffortLevel,
  FitLuaria,
  RadarOpportunity,
  RadarOpportunitySource,
  RadarOpportunityStatus,
  TechnicalDifficulty,
} from '@/types/radar'

interface RadarOpportunityModalProps {
  open: boolean
  opportunity?: RadarOpportunity | null
  onClose: () => void
  onSave: (data: CreateInput<RadarOpportunity>) => Promise<unknown>
  onSendToCrm?: (opportunity: RadarOpportunity) => Promise<unknown>
}

export function RadarOpportunityModal({
  open,
  opportunity,
  onClose,
  onSave,
  onSendToCrm,
}: RadarOpportunityModalProps) {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'geral' | 'proposta' | 'empresa' | 'historico'>('geral')
  const [saving, setSaving] = useState(false)
  const [sendingCrm, setSendingCrm] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [source, setSource] = useState<RadarOpportunitySource>('workana')
  const [originalUrl, setOriginalUrl] = useState('')
  const [identifiedDate, setIdentifiedDate] = useState('')
  const [description, setDescription] = useState('')
  const [clientProfile, setClientProfile] = useState('')
  const [requestedScope, setRequestedScope] = useState('')
  const [identifiedNeeds, setIdentifiedNeeds] = useState('')
  const [fitLuaria, setFitLuaria] = useState<FitLuaria>('alto')
  const [technicalDifficulty, setTechnicalDifficulty] = useState<TechnicalDifficulty>('baixa')
  const [estimatedEffort, setEstimatedEffort] = useState<EffortLevel>('baixo')
  const [deadlineRequested, setDeadlineRequested] = useState('')
  const [clientBudget, setClientBudget] = useState('')
  const [suggestedPrice, setSuggestedPrice] = useState('')
  const [minimumPrice, setMinimumPrice] = useState('')
  const [status, setStatus] = useState<RadarOpportunityStatus>('nova')
  const [proposalText, setProposalText] = useState('')
  const [proposalSentDate, setProposalSentDate] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [nextActionDueDate, setNextActionDueDate] = useState('')
  const [responsibleName, setResponsibleName] = useState('Cofundador Comercial')
  const [lostReason, setLostReason] = useState('')

  // Prospecção Direta
  const [companySegment, setCompanySegment] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyInstagram, setCompanyInstagram] = useState('')
  const [companyWhatsapp, setCompanyWhatsapp] = useState('')
  const [keyContactName, setKeyContactName] = useState('')
  const [perceivedProblem, setPerceivedProblem] = useState('')
  const [suggestedAutomation, setSuggestedAutomation] = useState('')

  useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title || '')
      setClientName(opportunity.clientName || '')
      setSource(opportunity.source || 'workana')
      setOriginalUrl(opportunity.originalUrl || '')
      setIdentifiedDate(opportunity.identifiedDate || '')
      setDescription(opportunity.description || '')
      setClientProfile(opportunity.clientProfile || '')
      setRequestedScope(opportunity.requestedScope || '')
      setIdentifiedNeeds(opportunity.identifiedNeeds || '')
      setFitLuaria(opportunity.fitLuaria || 'alto')
      setTechnicalDifficulty(opportunity.technicalDifficulty || 'baixa')
      setEstimatedEffort(opportunity.estimatedEffort || 'baixo')
      setDeadlineRequested(opportunity.deadlineRequested || '')
      setClientBudget(opportunity.clientBudgetCents ? (opportunity.clientBudgetCents / 100).toString() : '')
      setSuggestedPrice(opportunity.suggestedPriceCents ? (opportunity.suggestedPriceCents / 100).toString() : '')
      setMinimumPrice(opportunity.minimumPriceCents ? (opportunity.minimumPriceCents / 100).toString() : '')
      setStatus(opportunity.status || 'nova')
      setProposalText(opportunity.proposalText || '')
      setProposalSentDate(opportunity.proposalSentDate || '')
      setNextAction(opportunity.nextAction || '')
      setNextActionDueDate(opportunity.nextActionDueDate || '')
      setResponsibleName(opportunity.responsibleName || 'Cofundador Comercial')
      setLostReason(opportunity.lostReason || '')
      setCompanySegment(opportunity.companySegment || '')
      setCompanyCity(opportunity.companyCity || '')
      setCompanyWebsite(opportunity.companyWebsite || '')
      setCompanyInstagram(opportunity.companyInstagram || '')
      setCompanyWhatsapp(opportunity.companyWhatsapp || '')
      setKeyContactName(opportunity.keyContactName || '')
      setPerceivedProblem(opportunity.perceivedProblem || '')
      setSuggestedAutomation(opportunity.suggestedAutomation || '')
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setTitle('')
      setClientName('')
      setSource('workana')
      setOriginalUrl('')
      setIdentifiedDate(today)
      setDescription('')
      setClientProfile('')
      setRequestedScope('')
      setIdentifiedNeeds('')
      setFitLuaria('alto')
      setTechnicalDifficulty('baixa')
      setEstimatedEffort('baixo')
      setDeadlineRequested('15 dias')
      setClientBudget('')
      setSuggestedPrice('')
      setMinimumPrice('')
      setStatus('nova')
      setProposalText('')
      setProposalSentDate('')
      setNextAction('')
      setNextActionDueDate('')
      setResponsibleName('Cofundador Comercial')
      setLostReason('')
      setCompanySegment('')
      setCompanyCity('')
      setCompanyWebsite('')
      setCompanyInstagram('')
      setCompanyWhatsapp('')
      setKeyContactName('')
      setPerceivedProblem('')
      setSuggestedAutomation('')
    }
  }, [opportunity, open])

  const currentBudgetCents = clientBudget ? Math.round(parseFloat(clientBudget) * 100) : null
  const currentSuggestedCents = suggestedPrice ? Math.round(parseFloat(suggestedPrice) * 100) : null
  const currentMinCents = minimumPrice ? Math.round(parseFloat(minimumPrice) * 100) : null

  const liveCalculation = calculateRadarScore({
    fitLuaria,
    estimatedEffort,
    technicalDifficulty,
    suggestedPriceCents: currentSuggestedCents,
    clientBudgetCents: currentBudgetCents,
    requestedScope: requestedScope || description,
  })

  const handleCopyProposal = () => {
    if (!proposalText.trim()) {
      toast.error('Nenhum texto de proposta preenchido para copiar.')
      return
    }
    navigator.clipboard.writeText(proposalText)
    toast.success('Texto da proposta copiado para a área de transferência!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Informe o título do serviço ou oportunidade.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        clientName: clientName.trim() || title.trim(),
        source,
        originalUrl: originalUrl.trim() || undefined,
        identifiedDate: identifiedDate || new Date().toISOString().slice(0, 10),
        description: description.trim(),
        clientProfile: clientProfile.trim() || undefined,
        requestedScope: requestedScope.trim() || undefined,
        identifiedNeeds: identifiedNeeds.trim() || undefined,
        fitLuaria,
        technicalDifficulty,
        estimatedEffort,
        deadlineRequested: deadlineRequested.trim() || undefined,
        clientBudgetCents: currentBudgetCents,
        suggestedPriceCents: currentSuggestedCents,
        minimumPriceCents: currentMinCents,
        priority: liveCalculation.priority,
        priorityScore: liveCalculation.score,
        decisionRationale: liveCalculation.rationale,
        status,
        proposalText: proposalText.trim() || undefined,
        proposalSentDate: proposalSentDate || null,
        nextAction: nextAction.trim() || undefined,
        nextActionDueDate: nextActionDueDate || null,
        responsibleName: responsibleName.trim() || 'Cofundador Comercial',
        lostReason: lostReason.trim() || undefined,
        companySegment: companySegment.trim() || undefined,
        companyCity: companyCity.trim() || undefined,
        companyWebsite: companyWebsite.trim() || undefined,
        companyInstagram: companyInstagram.trim() || undefined,
        companyWhatsapp: companyWhatsapp.trim() || undefined,
        keyContactName: keyContactName.trim() || undefined,
        perceivedProblem: perceivedProblem.trim() || undefined,
        suggestedAutomation: suggestedAutomation.trim() || undefined,
      } as any)

      toast.success(opportunity ? 'Oportunidade atualizada no Radar!' : 'Nova oportunidade cadastrada no Radar!')
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar oportunidade: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleSendCrm = async () => {
    if (!opportunity || !onSendToCrm) return
    setSendingCrm(true)
    try {
      await onSendToCrm(opportunity)
    } finally {
      setSendingCrm(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-foreground">
              {opportunity ? 'Editar Oportunidade no Radar' : 'Nova Oportunidade no Radar'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Score Luaria:</span>
            <span
              className={`tabular px-2.5 py-0.5 rounded-full text-xs font-bold ${
                liveCalculation.score >= 70
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : liveCalculation.score >= 50
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {liveCalculation.score} / 100
            </span>
          </div>
        </div>
      }
      description="Central comercial: análise, estimativas e acompanhamento de oportunidades de automação com inteligência artificial."
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {opportunity && onSendToCrm && (
              <Button
                type="button"
                variant="secondary"
                icon={Flame}
                loading={sendingCrm}
                onClick={handleSendCrm}
              >
                {opportunity.boardCardId ? 'Atualizar no CRM' : 'Aprovar e Enviar ao CRM'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving} onClick={handleSubmit}>
              {opportunity ? 'Salvar Alterações' : 'Cadastrar no Radar'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner de Justificativa da Priorização Inteligente */}
        <div className="rounded-xl border border-line bg-surface-muted/50 p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Justificativa da Decisão Comercial:
            </span>
            <span className="text-[11px] text-muted">
              Prioridade: <strong className="text-foreground uppercase">{liveCalculation.priority}</strong>
            </span>
          </div>
          <p className="text-muted leading-relaxed">{liveCalculation.rationale}</p>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-line gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'geral'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Dados Principais & Escopo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('proposta')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'proposta'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Proposta & Valores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('empresa')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'empresa'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Dados da Empresa (Prospecção Direta)
          </button>
          {opportunity?.history && opportunity.history.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'historico'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              Histórico ({opportunity.history.length})
            </button>
          )}
        </div>

        {/* ABA 1: DADOS PRINCIPAIS & ESCOPO */}
        {activeTab === 'geral' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Título do Serviço / Oportunidade *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Automação de WhatsApp e qualificação de leads com IA"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Origem / Plataforma</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as RadarOpportunitySource)}
                  className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {Object.entries(RADAR_SOURCE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Empresa / Solicitante</label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Imobiliária Prime"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Link Original do Pedido / Perfil</label>
                <Input
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://www.workana.com/job/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Adequação Luaria.IA</label>
                <select
                  value={fitLuaria}
                  onChange={(e) => setFitLuaria(e.target.value as FitLuaria)}
                  className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {Object.entries(FIT_LUARIA_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status Atual</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RadarOpportunityStatus)}
                  className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {Object.entries(RADAR_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Esforço Estimado</label>
                <select
                  value={estimatedEffort}
                  onChange={(e) => setEstimatedEffort(e.target.value as EffortLevel)}
                  className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {Object.entries(EFFORT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Dificuldade Técnica</label>
                <select
                  value={technicalDifficulty}
                  onChange={(e) => setTechnicalDifficulty(e.target.value as TechnicalDifficulty)}
                  className="w-full h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Descrição do Pedido / Necessidade</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Cole aqui a descrição completa do anúncio ou a dor identificada na prospecção..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Escopo Solicitado / Entregáveis</label>
                <Textarea
                  value={requestedScope}
                  onChange={(e) => setRequestedScope(e.target.value)}
                  rows={2}
                  placeholder="Ex: Integração oficial WhatsApp + Fluxo de IA + Envio de leads para CRM"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Necessidades & Dores Centrais Identificadas</label>
                <Textarea
                  value={identifiedNeeds}
                  onChange={(e) => setIdentifiedNeeds(e.target.value)}
                  rows={2}
                  placeholder="Ex: Demora no primeiro contato; corretores sobrecarregados com curiosos"
                />
              </div>
            </div>

            {(status === 'descartada' || status === 'perdida') && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 space-y-1.5">
                <label className="text-xs font-semibold text-rose-400">Motivo do Descarte ou Perda</label>
                <Input
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  placeholder="Ex: Cliente optou por site básico tradicional sem IA; preço fora do padrão"
                />
              </div>
            )}
          </div>
        )}

        {/* ABA 2: PROPOSTA & VALORES */}
        {activeTab === 'proposta' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Orçamento Informado pelo Cliente (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Preço Sugerido Luaria.IA (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Preço Mínimo Recomendado (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={minimumPrice}
                  onChange={(e) => setMinimumPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Prazo Solicitado / Desejado</label>
                <Input
                  value={deadlineRequested}
                  onChange={(e) => setDeadlineRequested(e.target.value)}
                  placeholder="Ex: 10 a 15 dias"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Data de Envio da Proposta</label>
                <Input
                  type="date"
                  value={proposalSentDate}
                  onChange={(e) => setProposalSentDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Responsável Comercial</label>
                <Input
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Texto da Proposta ou Mensagem de Abordagem
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  icon={Copy}
                  onClick={handleCopyProposal}
                >
                  Copiar Proposta
                </Button>
              </div>
              <Textarea
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                rows={6}
                placeholder="Escreva ou gere com IA a abordagem comercial personalizada para esta oportunidade..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Próxima Ação Comercial</label>
                <Input
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="Ex: Acompanhar resposta no WhatsApp / enviar follow-up"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Data Limite para Próxima Ação</label>
                <Input
                  type="date"
                  value={nextActionDueDate}
                  onChange={(e) => setNextActionDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: DADOS DA EMPRESA (PROSPECÇÃO DIRETA) */}
        {activeTab === 'empresa' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Segmento de Atuação</label>
                <Input
                  value={companySegment}
                  onChange={(e) => setCompanySegment(e.target.value)}
                  placeholder="Ex: Imobiliário, Saúde, E-commerce, Educação"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cidade / Estado</label>
                <Input
                  value={companyCity}
                  onChange={(e) => setCompanyCity(e.target.value)}
                  placeholder="Ex: São Paulo - SP"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Website</label>
                <Input
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://exemplo.com.br"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Instagram Comercial</label>
                <Input
                  value={companyInstagram}
                  onChange={(e) => setCompanyInstagram(e.target.value)}
                  placeholder="@empresa"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">WhatsApp Comercial Legítimo</label>
                <Input
                  value={companyWhatsapp}
                  onChange={(e) => setCompanyWhatsapp(e.target.value)}
                  placeholder="11999998888"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nome do Decisor / Contato Profissional</label>
              <Input
                value={keyContactName}
                onChange={(e) => setKeyContactName(e.target.value)}
                placeholder="Ex: Dra. Camila ou Dr. Marcos (Sócio)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Problema Operacional Percebido</label>
                <Textarea
                  value={perceivedProblem}
                  onChange={(e) => setPerceivedProblem(e.target.value)}
                  rows={3}
                  placeholder="Ex: Demora no direct e WhatsApp, links lentos na bio, falta de agendamento online..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Automação Potencialmente Aplicável</label>
                <Textarea
                  value={suggestedAutomation}
                  onChange={(e) => setSuggestedAutomation(e.target.value)}
                  rows={3}
                  placeholder="Ex: Assistente 24/7 de triagem e agendamento + qualificação de orçamento no WhatsApp..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: HISTÓRICO DE MUDANÇAS */}
        {activeTab === 'historico' && opportunity?.history && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {opportunity.history.map((h) => (
              <div
                key={h.id}
                className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3 text-xs"
              >
                <div className="mt-0.5 rounded-full bg-accent/20 p-1 text-accent">
                  <History className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{h.action}</span>
                    <span className="text-[11px] text-muted">
                      {new Date(h.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(h.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-muted flex items-center gap-2">
                    <span>Responsável: <strong>{h.responsibleName}</strong></span>
                    {h.fromStatus && h.toStatus && (
                      <span className="text-[11px]">
                        ({RADAR_STATUS_LABELS[h.fromStatus]} → {RADAR_STATUS_LABELS[h.toStatus]})
                      </span>
                    )}
                  </div>
                  {h.notes && <p className="text-subtle italic">{h.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </Modal>
  )
}
