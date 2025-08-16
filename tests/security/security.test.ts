import { describe, it, expect } from "vitest"
import { validateInput } from "@/lib/validation"
import { AuthService } from "@/lib/auth-service"

describe("Security Tests", () => {
  describe("Input Validation", () => {
    it("should prevent SQL injection attempts", () => {
      const maliciousInput = "'; DROP TABLE users; --"
      const result = validateInput(maliciousInput, "text")
      expect(result.isValid).toBe(false)
      expect(result.error).toContain("Invalid characters")
    })

    it("should prevent XSS attacks", () => {
      const xssInput = "<script>alert('xss')</script>"
      const result = validateInput(xssInput, "text")
      expect(result.isValid).toBe(false)
      expect(result.sanitized).not.toContain("<script>")
    })

    it("should validate email formats properly", () => {
      const validEmail = "user@example.com"
      const invalidEmail = "invalid-email"

      expect(validateInput(validEmail, "email").isValid).toBe(true)
      expect(validateInput(invalidEmail, "email").isValid).toBe(false)
    })
  })

  describe("Authentication Security", () => {
    it("should enforce password strength requirements", async () => {
      const weakPassword = "123"
      const result = await AuthService.signUp("test@example.com", weakPassword)
      expect(result.success).toBe(false)
      expect(result.error).toContain("Password too weak")
    })

    it("should implement rate limiting", async () => {
      // Simulate multiple failed login attempts
      const promises = Array(10)
        .fill(null)
        .map(() => AuthService.signIn("test@example.com", "wrongpassword"))

      const results = await Promise.all(promises)
      const lastResult = results[results.length - 1]
      expect(lastResult.error).toContain("Too many attempts")
    })
  })
})
