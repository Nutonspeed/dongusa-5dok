/**
 * Centralized Feature Flags and Safety Switches
 * - Read flags from environment variables with safe defaults
 * - Usable on both Server and Client (client sees only NEXT_PUBLIC_* values)
 * - Goal: prevent crashes when services are not ready or running in mock mode
 *
 * Conventions:
 * - "1", "true", "on", "yes" => true
 * - "0", "false", "off", "no" => false
 * - undefined => default per-flag
 */

type Boolish = string | boolean | undefined | null

// Safe access to env in any runtime without relying on Node typings
function env(name: string): string | undefined {
  try {
    const g = globalThis as any
    return g?.process?.env?.[name] ?? undefined
  } catch {
    return undefined
  }
}

function toBool(v: Boolish, defaultValue = false): boolean {
  if (typeof v === "boolean") return v
  if (v == null) return defaultValue
  const s = String(v).trim().toLowerCase()
  if (["1", "true", "on", "yes", "y"].includes(s)) return true
  if (["0", "false", "off", "no", "n"].includes(s)) return false
  return defaultValue
}

function toNumber(v: string | number | undefined | null, defaultValue = 0): number {
  if (v == null) return defaultValue
  const n = Number(v)
  return Number.isFinite(n) ? n : defaultValue
}

function strLen(v: string | undefined): number {
  return typeof v === "string" ? v.length : 0
}

export type FeatureFlags = {
  // Global modes
  IS_PRODUCTION: boolean
  QA_BYPASS_AUTH: boolean
  MAINTENANCE: boolean

  // Data backend
  NEXT_PUBLIC_USE_SUPABASE: boolean
  IS_SUPABASE_CONFIGURED: boolean

  // Integrations (enable/disable gracefully)
  ENABLE_STRIPE: boolean
  ENABLE_PROMPTPAY: boolean
  ENABLE_REDIS: boolean
  ENABLE_BLOB: boolean
  ENABLE_AI: boolean
  ENABLE_BI: boolean
  ENABLE_ARVR: boolean

  // Mock / Readiness controls
  ENABLE_MOCK_SERVICES: boolean
  DISABLE_UNREADY_FEATURES: boolean

  // UX / Observability
  ENABLE_HEALTH_BANNER: boolean
  HEALTH_DEGRADED_THRESHOLD_MS: number
}

function computeIsSupabaseConfigured(): boolean {
  // Server-side variables
  const serverUrl = env("SUPABASE_URL")
  const serviceRole = env("SUPABASE_SERVICE_ROLE_KEY")
  // Client/public variables
  const publicUrl = env("NEXT_PUBLIC_SUPABASE_URL")
  const publicAnon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  // Consider configured if either server or public pair is present (non-empty)
  const hasServerPair = strLen(serverUrl) > 0 && strLen(serviceRole) > 0
  const hasPublicPair = strLen(publicUrl) > 0 && strLen(publicAnon) > 0
  return hasServerPair || hasPublicPair
}

export function getFeatureFlags(): FeatureFlags {
  const IS_PRODUCTION = env("NODE_ENV") === "production"

  return {
    IS_PRODUCTION,
    QA_BYPASS_AUTH: toBool(env("QA_BYPASS_AUTH"), false),
    MAINTENANCE: toBool(env("MAINTENANCE"), false),

    NEXT_PUBLIC_USE_SUPABASE: toBool(env("NEXT_PUBLIC_USE_SUPABASE") ?? "true", true),
    IS_SUPABASE_CONFIGURED: computeIsSupabaseConfigured(),

    ENABLE_STRIPE: toBool(env("ENABLE_STRIPE") ?? (env("STRIPE_SECRET_KEY") ? "1" : "0"), false),
    ENABLE_PROMPTPAY: toBool(env("PROMPTPAY_ENABLED") ?? env("ENABLE_PROMPTPAY") ?? "0", false),
    ENABLE_REDIS: toBool(env("ENABLE_REDIS") ?? (env("KV_REST_API_URL") ? "1" : "0"), false),
    ENABLE_BLOB: toBool(env("ENABLE_BLOB") ?? (env("BLOB_READ_WRITE_TOKEN") ? "1" : "0"), false),
    ENABLE_AI: toBool(env("ENABLE_AI") ?? (env("XAI_API_KEY") ? "1" : "0"), false),
    ENABLE_BI: toBool(env("ENABLE_BI") ?? "0", false),
    ENABLE_ARVR: toBool(env("ENABLE_ARVR") ?? "0", false),

    ENABLE_MOCK_SERVICES: toBool(env("ENABLE_MOCK_SERVICES") ?? "0", false),
    DISABLE_UNREADY_FEATURES: toBool(env("DISABLE_UNREADY_FEATURES") ?? "1", true),

    ENABLE_HEALTH_BANNER: toBool(env("ENABLE_HEALTH_BANNER") ?? "1", true),
    HEALTH_DEGRADED_THRESHOLD_MS: toNumber(env("HEALTH_DEGRADED_THRESHOLD_MS"), 1200),
  }
}

export const featureFlags: FeatureFlags = getFeatureFlags()

export function isEnabled(flag: keyof FeatureFlags): boolean {
  return !!featureFlags[flag]
}

/**
 * Guard that returns whether a feature/service should be treated as "available".
 * - If a service is disabled or not configured, returns false (callers should gracefully fallback).
 */
export function isServiceAvailable(options: {
  name:
  | "supabase"
  | "stripe"
  | "promptpay"
  | "redis"
  | "blob"
  | "ai"
  requireConfig?: boolean
}): boolean {
  const { name, requireConfig = true } = options

  switch (name) {
    case "supabase":
      return featureFlags.NEXT_PUBLIC_USE_SUPABASE && (!requireConfig || featureFlags.IS_SUPABASE_CONFIGURED)
    case "stripe":
      return featureFlags.ENABLE_STRIPE
    case "promptpay":
      return featureFlags.ENABLE_PROMPTPAY
    case "redis":
      return featureFlags.ENABLE_REDIS
    case "blob":
      return featureFlags.ENABLE_BLOB
    case "ai":
      return featureFlags.ENABLE_AI
    default:
      return false
  }
}

/**
 * Safe API helper: decide how to respond when a feature is not ready or running in mock mode.
 * Use this inside API routes to avoid throwing unhandled errors.
 */
export type NotReadyPolicy = "503" | "stub" | "redirect"

export function decideNotReadyBehavior(params: {
  isReady: boolean
  mockAllowed?: boolean
  policy?: NotReadyPolicy
}) {
  const { isReady, mockAllowed = true, policy = "503" } = params

  if (isReady) {
    return { proceed: true as const, mode: "live" as const }
  }

  // Not ready
  if (mockAllowed && featureFlags.ENABLE_MOCK_SERVICES) {
    return { proceed: true as const, mode: "mock" as const }
  }

  // Live not allowed and mock disabled - apply policy
  switch (policy) {
    case "stub":
      return { proceed: false as const, mode: "stub" as const }
    case "redirect":
      return { proceed: false as const, mode: "redirect" as const }
    case "503":
    default:
      return { proceed: false as const, mode: "503" as const }
  }
}

/**
 * Tiny helper to format a standard JSON error payload for API responses.
 */
export function standardApiError(message: string, meta?: Record<string, unknown>) {
  return {
    ok: false,
    error: message,
    ...(meta ?? {}),
    timestamp: new Date().toISOString(),
  }
}

/**
 * Health helpers (for banners/UX)
 */
export type HealthSnapshot = {
  status: "ok" | "degraded" | "error"
  responseTime?: number
}

export function isDegraded(
  health: HealthSnapshot | null | undefined,
  thresholdMs = featureFlags.HEALTH_DEGRADED_THRESHOLD_MS,
) {
  if (!health) return false
  if (health.status === "error") return true
  if (health.status === "degraded") return true
  if (typeof health.responseTime === "number" && health.responseTime >= thresholdMs) return true
  return false
}
