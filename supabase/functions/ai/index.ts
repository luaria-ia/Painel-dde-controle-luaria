// Business OS — AI Gateway (Supabase Edge Function, Deno).
//
// Chaves SOMENTE como segredos do projeto Supabase (Edge Functions → Secrets):
//   GEMINI_API_KEY        → projeto Google SEM faturamento (camadas gratuitas)
//   GEMINI_PAID_API_KEY   → projeto Google COM faturamento (camada paga, opcional)
//   ANTHROPIC_API_KEY     → Claude (provedor alternativo, opcional)
// Ajustes opcionais por ambiente: AI_CASCADE_{1..4}_MODEL / _ENABLED / _TIMEOUT_MS / _RETRIES / _PROVIDER / _TIER
// Preço para custo estimado (USD por 1M tokens): AI_PRICE_<MODELO> = "entrada,saída"  (ex.: AI_PRICE_GEMINI_FLASH_LATEST="0.30,2.50")
//
// Ações:
//   { action: "status" } → chaves configuradas, padrões da cascata e modelos disponíveis
//   { action: "run", task, provider, model?, cascade?, sensitivity?, system, messages, effort?, json_schema? }
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  defaultConfig,
  estimateCostUsd,
  layerKey,
  LayerError,
  mergeUserConfig,
  planLayers,
  runCascade,
  ANTHROPIC_MODELS,
  type BreakerState,
  type CascadeConfig,
  type KeyRef,
  type Reason,
  type Sensitivity,
} from "./cascade.ts";
import { listGeminiModels, PROVIDER_RUNNERS, type Msg, type ProviderOutput } from "./providers.ts";
import { cors } from "./cors.ts";

const EFFORTS = new Set(["low", "medium", "high"]);
const MAX_SYSTEM_CHARS = 20_000;
const MAX_TOTAL_CHARS = 150_000;
const MAX_MESSAGES = 40;

const FRIENDLY: Record<string, { status: number; message: string }> = {
  all_failed: { status: 503, message: "Não foi possível processar sua solicitação no momento. Tente novamente em alguns instantes." },
  not_configured: { status: 503, message: "IA não configurada." },
  no_layers: { status: 503, message: "Nenhuma camada de IA disponível com a configuração atual. Revise a Cascata de IA nas Configurações." },
  bad_request: { status: 400, message: "Não foi possível processar este pedido. Tente reformular." },
  refusal: { status: 422, message: "A IA não pôde responder a este pedido." },
};

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

function validMessages(value: unknown): value is Msg[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return false;
  return value.every((m, i) => m && typeof m.content === "string" && m.content.length > 0 && m.role === (i % 2 === 0 ? "user" : "assistant"));
}

function priceFor(model: string): { in: number; out: number } | null {
  const raw = Deno.env.get(`AI_PRICE_${model.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`);
  if (!raw) return null;
  const [i, o] = raw.split(",").map(Number);
  return Number.isFinite(i) && Number.isFinite(o) ? { in: i, out: o } : null;
}

Deno.serve(async (req) => {
  const configuredOrigins = (Deno.env.get("AI_ALLOWED_ORIGINS") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const headers = cors(req.headers.get("Origin"), configuredOrigins);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ code: "method_not_allowed" }, 405, headers);

  // Cliente com o JWT do usuário: RLS garante que logs/breakers sejam só dele.
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return json({ code: "unauthorized" }, 401, headers);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ code: "bad_request", message: "JSON inválido." }, 400, headers);
  }

  const keys: Partial<Record<KeyRef, string>> = {
    GEMINI_API_KEY: Deno.env.get("GEMINI_API_KEY") || undefined,
    GEMINI_PAID_API_KEY: Deno.env.get("GEMINI_PAID_API_KEY") || undefined,
    ANTHROPIC_API_KEY: Deno.env.get("ANTHROPIC_API_KEY") || undefined,
  };
  const env = (k: string) => Deno.env.get(k) || undefined;

  // ------------------------------------------------------------------ status
  if (body.action === "status") {
    const discoveryKey = keys.GEMINI_API_KEY ?? keys.GEMINI_PAID_API_KEY;
    const models = discoveryKey ? await listGeminiModels(discoveryKey).catch(() => []) : [];
    const defaults = defaultConfig(env);
    return json(
      {
        configured: !!(keys.GEMINI_API_KEY || keys.GEMINI_PAID_API_KEY || keys.ANTHROPIC_API_KEY),
        providers: { gemini: !!keys.GEMINI_API_KEY, geminiPaid: !!keys.GEMINI_PAID_API_KEY, anthropic: !!keys.ANTHROPIC_API_KEY },
        cascadeDefaults: defaults.layers.map(({ id, label, provider, model, tier, enabled, priority, timeoutMs, maxRetries }) => ({ id, label, provider, model, tier, enabled, priority, timeoutMs, maxRetries })),
        geminiModels: models,
      },
      200,
      headers,
    );
  }
  if (body.action !== "run") return json({ code: "bad_request", message: "Ação desconhecida." }, 400, headers);

  // ------------------------------------------------------------------ validação
  const task = typeof body.task === "string" ? body.task.slice(0, 40) : "chat";
  const effort = typeof body.effort === "string" && EFFORTS.has(body.effort) ? body.effort : "medium";
  const system = typeof body.system === "string" ? body.system : "";
  const messages = body.messages;
  const sensitivity: Sensitivity = body.sensitivity === "sensitive" || body.sensitivity === "public" ? body.sensitivity : "internal";
  if (!system || system.length > MAX_SYSTEM_CHARS) return json({ code: "bad_request", message: "Instruções inválidas." }, 400, headers);
  if (!validMessages(messages)) return json({ code: "bad_request", message: "Mensagens inválidas." }, 400, headers);
  const total = system.length + messages.reduce((n, m) => n + m.content.length, 0);
  if (total > MAX_TOTAL_CHARS) return json({ code: "too_large", message: "Contexto grande demais." }, 413, headers);
  const schema = body.json_schema && typeof body.json_schema === "object" ? (body.json_schema as Record<string, unknown>) : null;

  // ------------------------------------------------------------------ configuração
  // Claude como provedor único (alternativo). Gemini/auto → cascata.
  const claudeOnly = (): CascadeConfig => {
    const model = typeof body.model === "string" && ANTHROPIC_MODELS.has(body.model) ? body.model : "claude-haiku-4-5";
    return {
      strategy: "auto",
      privacy: "allow_free",
      layers: [{ id: "claude", label: "Claude", provider: "anthropic", model, tier: "paid", enabled: true, priority: 1, timeoutMs: 60_000, maxRetries: 1, keyRef: "ANTHROPIC_API_KEY" }],
    };
  };
  let config = body.provider === "anthropic" ? claudeOnly() : mergeUserConfig(defaultConfig(env), body.cascade);
  let plan = planLayers(config, keys, sensitivity);
  if (body.provider !== "gemini" && body.provider !== "anthropic" && plan.empty === "not_configured" && keys.ANTHROPIC_API_KEY) {
    config = claudeOnly(); // automático sem Gemini, mas com Claude
    plan = planLayers(config, keys, sensitivity);
  }

  // ------------------------------------------------------------------ circuit breaker (estado persistido)
  const layerKeys = plan.layers.map(layerKey);
  const breakers = new Map<string, BreakerState>();
  if (layerKeys.length) {
    const { data: rows } = await supabase.from("ai_circuit_state").select("layer_key, failures, open_until, last_reason").in("layer_key", layerKeys);
    for (const r of rows ?? []) {
      breakers.set(r.layer_key, { failures: r.failures, openUntil: r.open_until ? new Date(r.open_until).getTime() : null, lastReason: r.last_reason ?? undefined });
    }
  }

  // ------------------------------------------------------------------ execução
  const started = Date.now();
  const outcome = await runCascade<ProviderOutput & { data?: unknown }>({
    plan,
    breakers,
    call: async (layer) => {
      const out = await PROVIDER_RUNNERS[layer.provider](keys[layer.keyRef]!, layer, { system, messages, effort, schema });
      if (!schema) return out;
      try {
        return { ...out, data: JSON.parse(out.text.replace(/^```(?:json)?\s*|\s*```$/g, "")) };
      } catch {
        throw new LayerError("bad_output", "JSON inválido"); // tenta a próxima camada
      }
    },
  });

  // ------------------------------------------------------------------ persistência (breakers + log de custo)
  const changed = [...outcome.breakers.entries()].filter(([k, v]) => {
    const prev = breakers.get(k);
    return !prev || prev.failures !== v.failures || prev.openUntil !== v.openUntil;
  });
  const requestId = crypto.randomUUID();
  const logRows = outcome.attempts.map((a) => ({
    request_id: requestId,
    task,
    layer: a.layer,
    provider: a.provider,
    model: a.model,
    tier: a.tier,
    status: a.status,
    reason: a.reason ?? null,
    duration_ms: a.durationMs,
    retries: a.retries,
    input_tokens: a.inputTokens ?? null,
    output_tokens: a.outputTokens ?? null,
    estimated_cost_usd: a.status === "success" ? estimateCostUsd(a, priceFor) : a.tier === "free" ? 0 : null,
    fallback_from: a.fallbackFrom ?? null,
  }));
  await Promise.all([
    changed.length
      ? supabase.from("ai_circuit_state").upsert(
          changed.map(([k, v]) => ({
            layer_key: k,
            failures: v.failures,
            open_until: v.openUntil ? new Date(v.openUntil).toISOString() : null,
            last_reason: v.lastReason ?? null,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "user_id,layer_key" },
        )
      : null,
    logRows.length ? supabase.from("ai_usage_logs").insert(logRows) : null,
  ]).catch((err) => console.error("[ai] falha ao registrar uso", err));

  // Log técnico do servidor (sem conteúdo): ex. "free1→rate_limit | free2→success"
  console.log(`[ai] ${task} ${Date.now() - started}ms ${outcome.attempts.map((a) => `${a.layer}→${a.status === "success" ? "success" : a.reason}`).join(" | ") || "nenhuma camada"}`);

  // Resumo seguro das tentativas (sem mensagens técnicas) para o indicador da interface.
  const trail = outcome.attempts.map((a) => ({ label: a.label, tier: a.tier, status: a.status, reason: a.reason as Reason | undefined }));

  if (outcome.ok) {
    return json(
      {
        text: outcome.value.text,
        data: outcome.value.data,
        model: outcome.value.model,
        provider: outcome.layer.provider,
        tier: outcome.layer.tier,
        layer: outcome.layer.id,
        layerLabel: outcome.layer.label,
        truncated: outcome.value.truncated,
        attempts: trail,
      },
      200,
      headers,
    );
  }
  const f = FRIENDLY[outcome.code] ?? FRIENDLY.all_failed;
  return json({ code: outcome.code, message: f.message, attempts: trail }, f.status, headers);
});
