import type { CreateInput } from '@/types'
import type { LibraryItem } from '@/types/studies'

/** Itens iniciais oferecidos quando a Biblioteca está vazia. */
export const LIBRARY_STARTERS: Array<CreateInput<LibraryItem>> = [
  {
    type: 'prompt',
    title: 'Prompt de ideias de atração',
    trackId: 'social-media',
    url: '',
    tags: ['ideias', 'atração'],
    content:
      'Você é um estrategista de conteúdo para [NICHO].\nContexto: [MARCA] vende [PRODUTO] para [PERSONA + DOR].\nTarefa: 20 ideias de posts de atração que respondam a dores reais.\nFormato: tabela com ideia, formato e hook.\nRestrições: sem frases motivacionais genéricas.',
  },
  {
    type: 'prompt',
    title: 'Prompt de revisão crítica',
    trackId: null,
    url: '',
    tags: ['revisão', 'ia'],
    content:
      'Revise o texto abaixo como um editor exigente. Aponte: (1) trechos genéricos que serviriam para qualquer marca, (2) afirmações que precisam de checagem, (3) clichês, (4) se o CTA é único e claro. Depois reescreva só os trechos problemáticos, mantendo o tom: [TOM].\n\nTexto: [COLAR]',
  },
  {
    type: 'template',
    title: 'Estrutura de relatório mensal',
    trackId: 'social-media',
    url: '',
    tags: ['cliente', 'relatório'],
    content: '1. Resumo do mês (3 linhas)\n2. Números principais × mês anterior\n3. Top 3 conteúdos e por quê\n4. Aprendizados\n5. Próximos passos',
  },
  {
    type: 'template',
    title: 'Colunas do calendário editorial',
    trackId: 'social-media',
    url: '',
    tags: ['calendário'],
    content: 'Data | Formato | Pilar | Tipo (atração/autoridade/relacionamento/conversão) | Tema | Hook | Status | Link da peça',
  },
  {
    type: 'prompt',
    title: 'Prompt de estrutura de landing page',
    trackId: 'design-sites',
    url: '',
    tags: ['landing page', 'estrutura'],
    content:
      'Você é um especialista em landing pages para [NICHO].\nContexto: [NEGÓCIO], público [PERSONA], origem do tráfego [ORIGEM], objetivo [AÇÃO].\nObjeções: [LISTA].\nTarefa: proponha a ordem das seções e diga qual objeção cada uma responde.\nRestrições: sem promessas exageradas, sem jargão.',
  },
  {
    type: 'checklist',
    title: 'Checklist antes de publicar um site',
    trackId: 'design-sites',
    url: '',
    tags: ['publicação', 'qualidade'],
    content:
      '- Ação principal visível sem rolar (celular)\n- Formulário testado e chegando\n- WhatsApp com mensagem pronta\n- Contraste mínimo 4,5:1\n- Imagens otimizadas (WebP) e PageSpeed revisado\n- Título, descrição e H1 em cada página\n- Cadeado (HTTPS) ativo\n- Política de privacidade\n- Ferramenta de análise e eventos configurados',
  },
  {
    type: 'template',
    title: 'Estrutura de case de portfólio',
    trackId: null,
    url: '',
    tags: ['portfólio'],
    content:
      '1. Cliente e contexto (fictício ou real)\n2. Problema\n3. Objetivo e métrica\n4. Processo (decisões e por quê)\n5. Solução (prints)\n6. Resultado ou resultado esperado\n7. O que eu faria diferente',
  },
]
