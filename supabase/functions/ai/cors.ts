const DEFAULT_ALLOWED_ORIGINS = [
  'https://business-os-a5w.pages.dev',
  'http://localhost:5173',
  'http://localhost:5174',
]

/** CORS allowlist for deployed app origins; authorization is still enforced by the user JWT. */
export function cors(origin: string | null, configuredOrigins: string[] = []) {
  const allowed =
    origin &&
    ([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins].includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.business-os-a5w\.pages\.dev$/.test(origin))

  return {
    'Access-Control-Allow-Origin': allowed ? origin : DEFAULT_ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}
