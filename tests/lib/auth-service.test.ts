import { describe, it, expect, beforeEach, vi } from "vitest"
import { AuthService } from "@/lib/auth-service"

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  },
}))

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("signIn", () => {
    it("should sign in user with valid credentials", async () => {
      const mockResponse = {
        data: { user: { id: "1", email: "test@example.com" } },
        error: null,
      }

      const { supabase } = await import("@/lib/supabase/client")
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse)

      const result = await AuthService.signIn("test@example.com", "password")

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockResponse.data.user)
    })

    it("should return error for invalid credentials", async () => {
      const mockResponse = {
        data: { user: null },
        error: { message: "Invalid credentials" },
      }

      const { supabase } = await import("@/lib/supabase/client")
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse)

      const result = await AuthService.signIn("test@example.com", "wrongpassword")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid credentials")
    })
  })
})
