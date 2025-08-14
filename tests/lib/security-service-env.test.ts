import { describe, it, expect } from "vitest"
import { SecurityService } from "../../lib/security-service"

describe("SecurityService env fallback", () => {
  it("should not crash when env vars are missing", async () => {
    const original = { ...process.env }
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    const service = new SecurityService()
    const result = await service.checkLoginAttempt("127.0.0.1", false)
    expect(result.allowed).toBe(true)

    process.env = original
  })
})
