/**
 * Role-aware and safe redirect helpers.
 * Ensures post-auth navigation prioritizes role over returnUrl and prevents open redirects.
 */

export type AppRole = "admin" | "customer" | "staff" | null | undefined

const INTERNAL_PATH_REGEX = /^\/(?!\/)/ // must start with single "/"
const HAS_PROTOCOL_REGEX = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\// // e.g., http://, https://, javascript://
const FORBIDDEN_CHARS_REGEX = /[\x00-\x1F]/ // control chars

/**
 * Normalize a path by removing duplicate slashes and resolving simple dot segments.
 * This is conservative and does not resolve nested path traversal across boundaries (e.g., it keeps leading slash).
 */
export function normalizeInternalPath(path: string): string {
  if (!path) return "/"
  let p = path.trim()

  // Force internal path only
  if (!INTERNAL_PATH_REGEX.test(p)) return "/"

  // Drop query/hash only case like "?" or "#"
  if (p === "/" || p === "/.") return "/"

  // Remove duplicate slashes (but keep a single leading slash)
  p = "/" + p.replace(/^\/+/, "").replace(/\/{2,}/g, "/")

  // Resolve "./" and simple "/segment/../" patterns without escaping root
  const segments = p.split("/")
  const stack: string[] = []
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue
    if (seg === "..") {
      if (stack.length) stack.pop()
      continue
    }
    stack.push(seg)
  }
  return "/" + stack.join("/")
}

/**
 * Verify the given path is a safe internal path.
 * - Must start with "/"
 * - No protocol, no double leading slashes
 * - No control characters
 */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) return false
  if (typeof path !== "string") return false
  if (FORBIDDEN_CHARS_REGEX.test(path)) return false
  if (HAS_PROTOCOL_REGEX.test(path)) return false
  if (!INTERNAL_PATH_REGEX.test(path)) return false
  return true
}

/**
 * Check if a path is allowed for a specific role.
 * Rules:
 * - admin: allowed all internal paths
 * - staff: cannot access /admin by default unless business rule allows; default: deny /admin
 * - customer: cannot access /admin/*
 */
export function isAllowedForRole(role: AppRole, path: string): boolean {
  const p = normalizeInternalPath(path)
  if (role === "admin") return true
  if (p.startsWith("/admin")) return false
  return true
}

/**
 * Decide post-auth redirect based on role first, then optional safe/allowed returnUrl.
 * Defaults:
 *  - admin -> "/admin"
 *  - others -> "/"
 */
export function decidePostAuthRedirect(role: AppRole, returnUrl?: string | null): string {
  const defaultDest = role === "admin" ? "/admin" : "/"
  if (returnUrl && isSafeInternalPath(returnUrl)) {
    const normalized = normalizeInternalPath(returnUrl)
    if (isAllowedForRole(role, normalized)) {
      return normalized
    }
  }
  return defaultDest
}