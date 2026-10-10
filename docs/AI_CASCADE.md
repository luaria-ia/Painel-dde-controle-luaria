# Cascata de IA (Gemini Free → Free → Free → Paid)

## Como funciona

```
Interface ──▶ aiService (src/services/ai) ──▶ Edge Function "ai" (AI Gateway)
                                                 │
                                                 ├─ planLayers()   decide quais camadas podem rodar
                                                 ├─ runCascade()   executa em ordem, com retry/fallback/circuit breaker
                                                 └─ providers.ts   Gemini (REST) · Claude (SDK)
```

1. A interface nunca escolhe modelo: só envia a tarefa, o contexto e as preferências (Configurações → IA → Cascata).
2. O gateway tenta **Gemini Free #1**. Se responder, **para** — nenhuma outra camada é chamada.
3. Só em falha técnica tenta **Free #2**, depois **Free #3**, e por último **Gemini Paid**.
4. Se todas falharem, o usuário vê: *"Não foi possível processar sua solicitação no momento. Tente novamente em alguns instantes."*
5. Sem nenhuma chave configurada, o app usa o **modo Demonstração** (respostas por regras, identificadas como tal).

Código: `supabase/functions/ai/cascade.ts` (núcleo puro, testado), `providers.ts`, `index.ts`.
Testes: `npm test` (`cascade.test.ts` e `src/services/ai/aiService.test.ts`).

## Modelos configurados (padrão)

| Camada | Provedor | Modelo | Tier | Chave |
|---|---|---|---|---|
| 1 | Gemini | `gemini-flash-latest` | free | `GEMINI_API_KEY` |
| 2 | Gemini | `gemini-flash-lite-latest` | free | `GEMINI_API_KEY` |
| 3 | Gemini | `gemini-2.5-flash` | free | `GEMINI_API_KEY` |
| 4 | Gemini | `gemini-flash-latest` | paid | `GEMINI_PAID_API_KEY` |

Timeout: 30 s (grátis) / 45 s (pago). Retry: 1 (somente erros temporários). Tempo total máximo: 110 s.

## Trocar modelos / ativar ou desativar camadas

- **Pela interface:** Configurações → Inteligência artificial → Cascata de IA. Cada camada tem seletor de modelo (lista vinda da sua chave) e liga/desliga. Também há **Estratégia** (Automática · Somente gratuito · Somente pago) e a política para **dados sensíveis**.
- **Pelo servidor (padrões):** segredos `AI_CASCADE_{1..4}_MODEL`, `_ENABLED` (`false` desliga), `_TIMEOUT_MS`, `_RETRIES` (máx. 2), `_PROVIDER` (`gemini`/`anthropic`), `_TIER`.

## Onde ficam as chaves

Somente em **Supabase → projeto business-os → Edge Functions → Secrets**. Nunca no frontend/bundle.

- `GEMINI_API_KEY` — chave de um projeto Google **sem faturamento** (plano gratuito).
- `GEMINI_PAID_API_KEY` — chave de um projeto Google **com faturamento ativo** (camada paga).
- `ANTHROPIC_API_KEY` — opcional (Claude como provedor alternativo).

> O Google define gratuito/pago **por projeto** (faturamento ligado ou não), não por modelo. Por isso a camada paga usa uma chave de outro projeto. Isso é uso legítimo do plano pago — **não** é rotação de chaves para contornar cotas (o sistema não faz isso).

### Configurar o Gemini pago
1. No Google Cloud/AI Studio, crie (ou use) um projeto **com faturamento** e gere uma chave.
2. Adicione-a como `GEMINI_PAID_API_KEY` nos Secrets.
3. (Opcional) defina um limite de gasto/orçamento no Google Cloud Billing.
4. (Opcional) para estimar custo: `AI_PRICE_GEMINI_FLASH_LATEST="<entrada>,<saída>"` em USD por 1M tokens, conforme a tabela de preços do Google.

## Quais erros ativam fallback

| Situação | Retry na mesma camada | Fallback | Circuit breaker |
|---|---|---|---|
| 429 limite por minuto | não | sim | pausa 1 min |
| 429 cota diária | não | sim | pausa 60 min |
| 5xx / 503 / rede | 1 vez (backoff 0,6 s) | sim | abre após 3 falhas seguidas (5 min) |
| Timeout | não | sim | — |
| Modelo inexistente | não | sim (registrado como erro de configuração) | pausa 30 min |
| Chave inválida | não | pula as camadas da **mesma chave** (ex.: vai direto ao pago) | — |
| Resposta vazia / JSON inválido | não | sim | — |
| Pedido inválido | não | **não** (falharia em qualquer camada) | — |
| Bloqueio de segurança | não | **não** | — |

## Registro de custo

Tabela `ai_usage_logs` (uma linha por tentativa, por usuário, com RLS): provedor, modelo, tier, status, motivo, duração, retries, tokens de entrada/saída, custo estimado, camada de origem do fallback. **Não** grava prompts nem respostas. Resumo do mês em Configurações → IA → "Uso neste mês". O log técnico do servidor mostra só a trilha (ex.: `free1→rate_limit | free2→success`).

## Adicionar um provedor no futuro (ex.: OpenAI)

1. Em `providers.ts`: criar `runOpenAI(apiKey, layer, input)` que lança `LayerError` com os motivos padronizados e registrar em `PROVIDER_RUNNERS`.
2. Em `cascade.ts`: incluir o provedor no tipo `Provider` e a chave em `keyFor()`/`KeyRef`.
3. Configurar uma camada com `AI_CASCADE_n_PROVIDER`. O gateway e a interface não precisam ser reescritos.
