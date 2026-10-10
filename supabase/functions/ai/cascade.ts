// =============================================================================
// Cascata de IA — núcleo puro (sem rede, sem Deno.env): planeja, executa com
// retry/fallback/circuit breaker e registra cada tentativa. Testado em cascade.test.ts.
//
//   FREE #1 ──falha técnica──▶ FREE #2 ──▶ FREE #3 ──▶ PAID
//      └─ sucesso: devolve e PARA (nenhuma outra camada é chamada)
// =============================================================================

export type Provider = "gemini" | "anthropic";
export type Tier = "free" | "paid";
export type KeyRef = "GEMINI_API_KEY" | "GEMINI_PAID_API_KEY" | "ANTHROPIC_API_KEY";
export type Strategy = "auto" | "free_only" | "paid_only";
export type Privacy = "allow_free" | "paid_for_sensitive";
export type Sensitivity = "public" | "internal" | "sensitive";

export type Reason =
  | "rate_limit" // 429 por minuto
  | "quota_exceeded" // cota diária/projeto esgotada
  | "timeout"
  | "unavailable" // 503 / sobrecarga
  | "server_error" // 5xx
  | "network"
  | "model_not_found" // modelo inexistente/indisponível (configuração)
  | "invalid_key" // chave inválida/sem permissão (configuração)
  | "bad_request" // pedido inválido — falharia em qualquer camada
  | "refusal" // bloqueio de segurança do modelo
  | "bad_output" // resposta vazia/fora do formato
  | "circuit_open"
  | "sensitive_data"
  | "deadline";

/** O que fazer com cada tipo de erro. */
export const REASON_POLICY: Record<Reason, { retry: boolean; fallback: boolean; breakerMinutes?: number; config?: boolean }> = {
  rate_limit: { retry: false, fallback: true, breakerMinutes: 1 },
  quota_exceeded: { retry: false, fallback: true, breakerMinutes: 60 },
  timeout: { retry: false, fallback: true },
  unavailable: { retry: true, fallback: true },
  server_error: { retry: true, fallback: true },
  network: { retry: true, fallback: true },
  model_not_found: { retry: false, fallback: true, breakerMinutes: 30, config: true },
  invalid_key: { retry: false, fallback: true, config: true }, // pula as camadas da MESMA chave
  bad_request: { retry: false, fallback: false },
  refusal: { retry: false, fallback: false },
  bad_output: { retry: false, fallback: true },
  circuit_open: { retry: false, fallback: true },
  sensitive_data: { retry: false, fallback: true },
  deadline: { retry: false, fallback: false },
};

export class LayerError extends Error {
  constructor(public reason: Reason, message: string) {
    super(message);
  }
}

export interface LayerConfig {
  id: string; // "free1" | "free2" | "free3" | "paid" (ou outros no futuro)
  label: string;
  provider: Provider;
  model: string;
  tier: Tier;
  enabled: boolean;
  priority: number; // menor = primeiro
  timeoutMs: number;
  maxRetries: number; // retries extras, só para erros temporários
  keyRef: KeyRef;
}

export interface CascadeConfig {
  strategy: Strategy;
  privacy: Privacy;
  layers: LayerConfig[];
}

export interface Attempt {
  layer: string;
  label: string;
  provider: Provider;
  model: string;
  tier: Tier;
  status: "success" | "error" | "skipped";
  reason?: Reason;
  durationMs: number;
  retries: number;
  inputTokens?: number;
  outputTokens?: number;
  fallbackFrom?: string;
}

export interface CallResult {
  inputTokens?: number;
  outputTokens?: number;
}

// ---------- Configuração ----------

export const GEMINI_MODEL_RE = /^gemini-[a-z0-9.-]{1,60}$/;
export const ANTHROPIC_MODELS = new Set(["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-4-5"]);

/** Padrões do servidor (podem ser sobrescritos por variáveis de ambiente). */
export function defaultConfig(env: (k: string) => string | undefined = () => undefined): CascadeConfig {
  const num = (k: string, d: number) => {
    const v = Number(env(k));
    return Number.isFinite(v) && v > 0 ? v : d;
  };
  const layer = (n: number, id: string, label: string, tier: Tier, model: string): LayerConfig => {
    const provider = (env(`AI_CASCADE_${n}_PROVIDER`) === "anthropic" ? "anthropic" : "gemini") as Provider;
    return {
      id,
      label,
      provider,
      model: env(`AI_CASCADE_${n}_MODEL`) ?? model,
      tier: (env(`AI_CASCADE_${n}_TIER`) as Tier) ?? tier,
      enabled: env(`AI_CASCADE_${n}_ENABLED`) !== "false",
      priority: n,
      timeoutMs: num(`AI_CASCADE_${n}_TIMEOUT_MS`, tier === "free" ? 30_000 : 45_000),
      maxRetries: Math.min(2, num(`AI_CASCADE_${n}_RETRIES`, 1)),
      keyRef: keyFor(provider, (env(`AI_CASCADE_${n}_TIER`) as Tier) ?? tier),
    };
  };
  return {
    strategy: "auto",
    privacy: "allow_free",
    layers: [
      layer(1, "free1", "Gemini Free #1", "free", "gemini-flash-latest"),
      layer(2, "free2", "Gemini Free #2", "free", "gemini-flash-lite-latest"),
      layer(3, "free3", "Gemini Free #3", "free", "gemini-2.5-flash"),
      layer(4, "paid", "Gemini Paid", "paid", "gemini-flash-latest"),
    ],
  };
}

export function keyFor(provider: Provider, tier: Tier): KeyRef {
  if (provider === "anthropic") return "ANTHROPIC_API_KEY";
  return tier === "paid" ? "GEMINI_PAID_API_KEY" : "GEMINI_API_KEY";
}

/**
 * Aplica as preferências do usuário (modelo, ativo, estratégia, privacidade) sobre os padrões.
 * Tudo é validado: valores fora do permitido são ignorados. Timeouts/retries não vêm do cliente.
 */
export function mergeUserConfig(base: CascadeConfig, user: unknown): CascadeConfig {
  const u = (user && typeof user === "object" ? user : {}) as Record<string, unknown>;
  const strategy = ["auto", "free_only", "paid_only"].includes(u.strategy as string) ? (u.strategy as Strategy) : base.strategy;
  const privacy = ["allow_free", "paid_for_sensitive"].includes(u.privacy as string) ? (u.privacy as Privacy) : base.privacy;
  const overrides = Array.isArray(u.layers) ? (u.layers as Array<Record<string, unknown>>) : [];
  const layers = base.layers.map((l) => {
    const o = overrides.find((x) => x && x.id === l.id);
    if (!o) return l;
    const model =
      typeof o.model === "string" && (l.provider === "gemini" ? GEMINI_MODEL_RE.test(o.model) : ANTHROPIC_MODELS.has(o.model)) ? o.model : l.model;
    return { ...l, model, enabled: typeof o.enabled === "boolean" ? o.enabled : l.enabled };
  });
  return { strategy, privacy, layers };
}

// ---------- Planejamento ----------

export interface Plan {
  layers: LayerConfig[];
  skipped: Attempt[];
  /** Motivo quando não há nenhuma camada executável. */
  empty?: "not_configured" | "no_layers";
}

const skip = (l: LayerConfig, reason: Reason): Attempt => ({
  layer: l.id,
  label: l.label,
  provider: l.provider,
  model: l.model,
  tier: l.tier,
  status: "skipped",
  reason,
  durationMs: 0,
  retries: 0,
});

/** Decide quais camadas podem rodar, na ordem de prioridade. */
export function planLayers(config: CascadeConfig, keys: Partial<Record<KeyRef, string>>, sensitivity: Sensitivity): Plan {
  const skipped: Attempt[] = [];
  const ordered = [...config.layers].sort((a, b) => a.priority - b.priority);
  const layers: LayerConfig[] = [];
  for (const l of ordered) {
    if (!l.enabled) continue;
    if (config.strategy === "free_only" && l.tier === "paid") continue;
    if (config.strategy === "paid_only" && l.tier === "free") continue;
    if (!keys[l.keyRef]) continue; // sem chave: camada indisponível (não conta como tentativa)
    // Dados sensíveis não vão para camadas gratuitas (que podem ser usadas para treino) se a política exigir.
    if (l.tier === "free" && sensitivity === "sensitive" && config.privacy === "paid_for_sensitive") {
      skipped.push(skip(l, "sensitive_data"));
      continue;
    }
    layers.push(l);
  }
  const usedKeys = new Set(ordered.map((l) => l.keyRef));
  const hasKeyForCascade = [...usedKeys].some((k) => !!keys[k]);
  // not_configured: nenhuma chave das camadas existe → o app cai no modo demonstração.
  // no_layers: há chave, mas a estratégia/privacidade/ativação deixou a cascata vazia.
  return { layers, skipped, empty: layers.length ? undefined : hasKeyForCascade ? "no_layers" : "not_configured" };
}

// ---------- Circuit breaker ----------

export interface BreakerState {
  failures: number;
  openUntil: number | null; // epoch ms
  lastReason?: Reason;
}

export const BREAKER_THRESHOLD = 3; // falhas temporárias seguidas
export const BREAKER_OPEN_MINUTES = 5;

export const layerKey = (l: Pick<LayerConfig, "provider" | "tier" | "model">) => `${l.provider}:${l.tier}:${l.model}`;

export function isOpen(state: BreakerState | undefined, now: number) {
  return !!state?.openUntil && state.openUntil > now;
}

/** Próximo estado do breaker após uma tentativa (sucesso zera; falhas acumulam). */
export function nextBreaker(prev: BreakerState | undefined, outcome: { ok: true } | { ok: false; reason: Reason }, now: number): BreakerState {
  if (outcome.ok) return { failures: 0, openUntil: null };
  const policy = REASON_POLICY[outcome.reason];
  if (policy.breakerMinutes) return { failures: 0, openUntil: now + policy.breakerMinutes * 60_000, lastReason: outcome.reason };
  if (!policy.retry) return { failures: prev?.failures ?? 0, openUntil: prev?.openUntil ?? null, lastReason: outcome.reason };
  const failures = (prev?.failures ?? 0) + 1;
  if (failures >= BREAKER_THRESHOLD) return { failures: 0, openUntil: now + BREAKER_OPEN_MINUTES * 60_000, lastReason: outcome.reason };
  return { failures, openUntil: null, lastReason: outcome.reason };
}

// ---------- Execução ----------

export interface RunOptions<T extends CallResult> {
  plan: Plan;
  call: (layer: LayerConfig) => Promise<T>;
  breakers: Map<string, BreakerState>;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  /** Tempo total máximo da cascata (a função do servidor tem limite de execução). */
  deadlineMs?: number;
  backoffMs?: number;
}

export type CascadeOutcome<T> =
  | { ok: true; value: T; layer: LayerConfig; attempts: Attempt[]; breakers: Map<string, BreakerState> }
  | { ok: false; code: "all_failed" | "bad_request" | "refusal" | "not_configured" | "no_layers"; attempts: Attempt[]; breakers: Map<string, BreakerState> };

export async function runCascade<T extends CallResult>(opts: RunOptions<T>): Promise<CascadeOutcome<T>> {
  const now = opts.now ?? Date.now;
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const deadline = now() + (opts.deadlineMs ?? 110_000);
  const backoff = opts.backoffMs ?? 600;
  const breakers = new Map(opts.breakers);
  const attempts: Attempt[] = [...opts.plan.skipped];
  const deadKeys = new Set<KeyRef>(); // chaves que se mostraram inválidas nesta execução

  if (!opts.plan.layers.length) return { ok: false, code: opts.plan.empty ?? "not_configured", attempts, breakers };

  let lastFailedLayer: string | undefined;
  for (const layer of opts.plan.layers) {
    const key = layerKey(layer);
    if (deadKeys.has(layer.keyRef)) {
      attempts.push({ ...skip(layer, "invalid_key"), fallbackFrom: lastFailedLayer });
      continue;
    }
    if (isOpen(breakers.get(key), now())) {
      attempts.push({ ...skip(layer, "circuit_open"), fallbackFrom: lastFailedLayer });
      continue;
    }
    if (now() >= deadline) {
      attempts.push({ ...skip(layer, "deadline"), fallbackFrom: lastFailedLayer });
      break;
    }

    let retries = 0;
    const started = now();
    // Tentativa + retries limitados (só para erros temporários, com backoff exponencial).
    for (;;) {
      try {
        const value = await opts.call(layer);
        breakers.set(key, nextBreaker(breakers.get(key), { ok: true }, now()));
        attempts.push({
          layer: layer.id,
          label: layer.label,
          provider: layer.provider,
          model: layer.model,
          tier: layer.tier,
          status: "success",
          durationMs: now() - started,
          retries,
          inputTokens: value.inputTokens,
          outputTokens: value.outputTokens,
          fallbackFrom: lastFailedLayer,
        });
        return { ok: true, value, layer, attempts, breakers }; // SUCESSO → para imediatamente
      } catch (err) {
        const reason: Reason = err instanceof LayerError ? err.reason : "server_error";
        const policy = REASON_POLICY[reason];
        if (policy.retry && retries < layer.maxRetries && now() + backoff * 2 ** retries < deadline) {
          await sleep(backoff * 2 ** retries);
          retries++;
          continue;
        }
        breakers.set(key, nextBreaker(breakers.get(key), { ok: false, reason }, now()));
        attempts.push({
          layer: layer.id,
          label: layer.label,
          provider: layer.provider,
          model: layer.model,
          tier: layer.tier,
          status: "error",
          reason,
          durationMs: now() - started,
          retries,
          fallbackFrom: lastFailedLayer,
        });
        if (reason === "invalid_key") deadKeys.add(layer.keyRef);
        if (!policy.fallback) {
          return { ok: false, code: reason === "refusal" ? "refusal" : "bad_request", attempts, breakers };
        }
        lastFailedLayer = layer.id;
        break; // FALLBACK → próxima camada
      }
    }
  }
  return { ok: false, code: "all_failed", attempts, breakers };
}

// ---------- Custo ----------

/** Custo estimado em USD (camadas gratuitas = 0; pagas usam preços configurados por ambiente, se houver). */
export function estimateCostUsd(
  a: Pick<Attempt, "tier" | "model" | "inputTokens" | "outputTokens">,
  price: (model: string) => { in: number; out: number } | null,
): number | null {
  if (a.tier === "free") return 0;
  const p = price(a.model);
  if (!p || a.inputTokens == null || a.outputTokens == null) return null;
  return Math.round(((a.inputTokens * p.in + a.outputTokens * p.out) / 1_000_000) * 1e6) / 1e6;
}
