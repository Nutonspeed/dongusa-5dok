import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { AuthService } from "@/lib/auth-service"
import { supabase } from "@/lib/supabase/client"

describe("Authentication Flow Integration", () => {
  const testUser = {
    email: "test@example.com",
    password: "testpassword123",
  }

  beforeEach(async () => {
    // Clean up any existing sessions
    await supabase.auth.signOut()
  })

  afterEach(async () => {
    // Clean up test user if created
    await supabase.auth.signOut()
  })

  it("should complete full registration and login flow", async () => {
    // Test registration
    const signUpResult = await AuthService.signUp(testUser.email, testUser.password)
    expect(signUpResult.success).toBe(true)

    // Test login
    const signInResult = await AuthService.signIn(testUser.email, testUser.password)
    expect(signInResult.success).toBe(true)
    expect(signInResult.user?.email).toBe(testUser.email)

    // Test logout
    const signOutResult = await AuthService.signOut()
    expect(signOutResult.success).toBe(true)
  })

  it("should handle invalid credentials properly", async () => {
    const result = await AuthService.signIn("invalid@email.com", "wrongpassword")
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
})
