// Adaptadores de provedores para a cascata. Cada um:
//  - faz UMA chamada (sem retries próprios — quem decide retry/fallback é a cascata);
//  - respeita o timeout da camada;
//  - converte erros em LayerError com um motivo padronizado (REASON_POLICY).
// Para um novo provedor (ex.: OpenAI): criar runX(...) aqui e mapear em PROVIDER_RUNNERS.
import Anthropic from "npm:@anthropic-ai/sdk";
import { LayerError, type LayerConfig, type Provider, type Reason } from "./cascade.ts";

export type Msg = { role: "user" | "assistant"; content: string };
export interface ProviderInput {
  system: string;
  messages: Msg[];
  effort: string;
  schema: Record<string, unknown> | null;
}
export interface ProviderOutput {
  text: string;
  model: string;
  truncated: boolean;
  inputTokens?: number;
  outputTokens?: number;
}

const MAX_OUTPUT_TOKENS = 8192;

// ---------------------------------------------------------------------------
// Google Gemini (REST generateContent)
// ---------------------------------------------------------------------------

function classifyGemini(status: number, body: unknown): Reason {
  const text = JSON.stringify(body ?? {});
  if (status === 429) return /PerDay|per day|daily/i.test(text) ? "quota_exceeded" : "rate_limit";
  if (status === 404) return "model_not_found";
  if (status === 401 || status === 403 || /API_KEY_INVALID|API key not valid|API_KEY_SERVICE_BLOCKED/i.test(text)) return "invalid_key";
  if (status === 400 && /FAILED_PRECONDITION|billing|location is not supported/i.test(text)) return "invalid_key"; // configuração da conta
  if (status === 400 && /model.*(not found|not supported)|unsupported model/i.test(text)) return "model_not_found";
  if (status === 400) return "bad_request";
  if (status === 503) return "unavailable";
  if (status === 504) return "timeout";
  return "server_error";
}

export async function runGemini(apiKey: string, layer: LayerConfig, input: ProviderInput): Promise<ProviderOutput> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(layer.model)}:generateContent`;
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: input.system }] },
    contents: input.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      ...(input.schema ? { responseMimeType: "application/json", responseJsonSchema: input.schema } : {}),
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), layer.timeoutMs);
  const call = (payload: Record<string, unknown>) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

  try {
    let res = await call(body);
    // Se o modelo não aceitar o esquema JSON nativo, refaz UMA vez pedindo JSON por instrução
    // (mesma camada; não é retry por falha técnica).
    if (res.status === 400 && input.schema) {
      const errBody = await res.clone().json().catch(() => ({}));
      if (classifyGemini(400, errBody) === "bad_request") {
        const fallback = structuredClone(body);
        delete (fallback.generationConfig as Record<string, unknown>).responseJsonSchema;
        fallback.systemInstruction = { parts: [{ text: `${input.system}\n\nResponda SOMENTE com JSON válido seguindo este esquema:\n${JSON.stringify(input.schema)}` }] };
        res = await call(fallback);
      }
    }
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const reason = classifyGemini(res.status, errBody);
      console.warn(`[ai] gemini ${layer.model} → ${res.status} ${reason}`);
      throw new LayerError(reason, `Gemini ${res.status}`);
    }
    const data = await res.json();
    if (data?.promptFeedback?.blockReason) throw new LayerError("refusal", "bloqueado");
    const cand = data?.candidates?.[0];
    if (!cand) throw new LayerError("bad_output", "sem candidatos");
    if (cand.finishReason === "SAFETY" || cand.finishReason === "PROHIBITED_CONTENT") throw new LayerError("refusal", "bloqueado");
    const text = (cand.content?.parts ?? [])
      .filter((p: { thought?: boolean; text?: string }) => !p.thought && typeof p.text === "string")
      .map((p: { text: string }) => p.text)
      .join("")
      .trim();
    if (!text) throw new LayerError("bad_output", "resposta vazia");
    const usage = data.usageMetadata ?? {};
    return {
      text,
      model: data.modelVersion ?? layer.model,
      truncated: cand.finishReason === "MAX_TOKENS",
      inputTokens: usage.promptTokenCount,
      outputTokens: (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0) || undefined,
    };
  } catch (err) {
    if (err instanceof LayerError) throw err;
    if ((err as Error)?.name === "AbortError") throw new LayerError("timeout", "tempo esgotado");
    throw new LayerError("network", (err as Error)?.message ?? "falha de rede");
  } finally {
    clearTimeout(timer);
  }
}

/** Modelos Gemini disponíveis para a chave (para a tela de configurações). */
export async function listGeminiModels(apiKey: string): Promise<string[]> {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": apiKey } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.models ?? [])
    .filter((m: { name: string; supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes("generateContent") && /^models\/gemini-/.test(m.name))
    .map((m: { name: string }) => m.name.replace(/^models\//, ""))
    .filter((id: string) => !/embedding|tts|image|audio|live|vision/i.test(id))
    .sort();
}

// ---------------------------------------------------------------------------
// Anthropic Claude (SDK oficial) — provedor alternativo
// ---------------------------------------------------------------------------

export async function runAnthropic(apiKey: string, layer: LayerConfig, input: ProviderInput): Promise<ProviderOutput> {
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: layer.timeoutMs });
  const isHaiku = layer.model === "claude-haiku-4-5";
  const outputConfig: Record<string, unknown> = {};
  if (!isHaiku) outputConfig.effort = input.effort; // Haiku 4.5 não aceita effort
  if (input.schema) outputConfig.format = { type: "json_schema", schema: input.schema };
  const params = {
    model: layer.model,
    max_tokens: 16000,
    system: input.system,
    messages: input.messages,
    ...(Object.keys(outputConfig).length ? { output_config: outputConfig } : {}),
  };
  try {
    // Opus/Sonnet 5.5: recusa por política → o servidor da Anthropic tenta o modelo recomendado.
    const res = isHaiku
      ? await client.messages.create(params as Anthropic.MessageCreateParamsNonStreaming)
      : await client.beta.messages.create({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } as Anthropic.Beta.MessageCreateParamsNonStreaming);
    if (res.stop_reason === "refusal") throw new LayerError("refusal", "recusado");
    const text = res.content
      .filter((b): b is { type: "text"; text: string } => (b as { type: string }).type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new LayerError("bad_output", "resposta vazia");
    return { text, model: res.model, truncated: res.stop_reason === "max_tokens", inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens };
  } catch (error) {
    if (error instanceof LayerError) throw error;
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) throw new LayerError("invalid_key", "chave inválida");
    if (error instanceof Anthropic.RateLimitError) throw new LayerError("rate_limit", "limite");
    if (error instanceof Anthropic.NotFoundError) throw new LayerError("model_not_found", "modelo");
    if (error instanceof Anthropic.BadRequestError) throw new LayerError("bad_request", error.message);
    if (error instanceof Anthropic.APIConnectionTimeoutError) throw new LayerError("timeout", "tempo esgotado");
    if (error instanceof Anthropic.APIConnectionError) throw new LayerError("network", "rede");
    if (error instanceof Anthropic.APIError) throw new LayerError(error.status === 529 || error.status === 503 ? "unavailable" : "server_error", `status ${error.status}`);
    throw new LayerError("server_error", "erro inesperado");
  }
}

export const PROVIDER_RUNNERS: Record<Provider, (apiKey: string, layer: LayerConfig, input: ProviderInput) => Promise<ProviderOutput>> = {
  gemini: runGemini,
  anthropic: runAnthropic,
};
