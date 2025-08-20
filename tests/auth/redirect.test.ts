import { describe, it, expect } from "vitest"
import {
  decidePostAuthRedirect,
  isSafeInternalPath,
  isAllowedForRole,
  normalizeInternalPath,
  type AppRole,
} from "@/lib/auth/redirect"

describe("auth redirect helpers", () => {
  describe("normalizeInternalPath()", () => {
    it("keeps single leading slash and removes duplicates", () => {
      expect(normalizeInternalPath("/admin//dashboard")).toBe("/admin/dashboard")
      expect(normalizeInternalPath("///admin///")).toBe("/admin")
    })

    it("resolves dot segments", () => {
      expect(normalizeInternalPath("/a/b/./c")).toBe("/a/b/c")
      expect(normalizeInternalPath("/a/b/../c")).toBe("/a/c")
      expect(normalizeInternalPath("/")).toBe("/")
      expect(normalizeInternalPath("/.")).toBe("/")
    })

    it("rejects non-internal paths", () => {
      expect(normalizeInternalPath("")).toBe("/")
      expect(normalizeInternalPath("http://evil.com")).toBe("/")
      expect(normalizeInternalPath("//evil")).toBe("/")
    })
  })

  describe("isSafeInternalPath()", () => {
    it("accepts safe internal paths", () => {
      expect(isSafeInternalPath("/")).toBe(true)
      expect(isSafeInternalPath("/dashboard")).toBe(true)
      expect(isSafeInternalPath("/orders/123?tab=items#top")).toBe(true)
    })

    it("rejects external, scheme or protocol-like, or double-slash", () => {
      expect(isSafeInternalPath("https://evil.com")).toBe(false)
      expect(isSafeInternalPath("javascript:alert(1)")).toBe(false)
      expect(isSafeInternalPath("//evil")).toBe(false)
      expect(isSafeInternalPath("../etc/passwd")).toBe(false)
      expect(isSafeInternalPath("")).toBe(false)
      expect(isSafeInternalPath(undefined)).toBe(false)
    })
  })

  describe("isAllowedForRole()", () => {
    it("admin allowed everywhere", () => {
      expect(isAllowedForRole("admin", "/")).toBe(true)
      expect(isAllowedForRole("admin", "/admin")).toBe(true)
      expect(isAllowedForRole("admin", "/admin/settings")).toBe(true)
    })

    it("customer cannot access admin namespace", () => {
      expect(isAllowedForRole("customer", "/")).toBe(true)
      expect(isAllowedForRole("customer", "/dashboard")).toBe(true)
      expect(isAllowedForRole("customer", "/admin")).toBe(false)
      expect(isAllowedForRole("customer", "/admin/analytics")).toBe(false)
    })

    it("staff default denies /admin (can be adapted by business rule)", () => {
      expect(isAllowedForRole("staff", "/admin")).toBe(false)
      expect(isAllowedForRole("staff", "/")).toBe(true)
    })
  })

  describe("decidePostAuthRedirect()", () => {
    const cases: Array<{ role: AppRole; returnUrl?: string | null; expected: string; note?: string }> = [
      { role: "admin", returnUrl: undefined, expected: "/admin", note: "admin default to admin dashboard" },
      { role: "admin", returnUrl: "/", expected: "/", note: "admin respects safe internal returnUrl" },
      { role: "admin", returnUrl: "/dashboard", expected: "/dashboard" },
      { role: "admin", returnUrl: "https://evil.com", expected: "/admin", note: "ignore external returnUrl" },
      { role: "customer", returnUrl: undefined, expected: "/", note: "user default to home" },
      { role: "customer", returnUrl: "/dashboard", expected: "/dashboard" },
      { role: "customer", returnUrl: "/admin", expected: "/", note: "user not allowed to admin" },
      { role: "customer", returnUrl: "http://evil.com", expected: "/", note: "ignore external" },
      { role: null, returnUrl: "/admin", expected: "/", note: "unknown role treated as non-admin" },
      { role: "staff", returnUrl: "/admin", expected: "/", note: "staff default deny /admin by helper" },
      { role: "staff", returnUrl: "/reports", expected: "/reports" },
      { role: undefined, returnUrl: "/dashboard", expected: "/dashboard" },
    ]

    it.each(cases.map((c) => [c.role, c.returnUrl, c.expected, c.note]))(
      "role=%s returnUrl=%s -> %s (%s)",
      (role, returnUrl, expected) => {
        expect(decidePostAuthRedirect(role as AppRole, (returnUrl as string) ?? undefined)).toBe(expected as string)
      },
    )
  })
})