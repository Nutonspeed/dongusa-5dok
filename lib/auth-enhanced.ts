// Enhanced Authentication Service
// Provides comprehensive authentication and authorization functionality

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { USE_SUPABASE } from "@/lib/runtime"
import { logger } from "@/lib/logger"

export type UserRole = "customer" | "admin" | "staff"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  role: UserRole
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthError {
  code: string
  message: string
  details?: any
}

export class AuthService {
  private supabase: any
  private mockUsers: Array<{ email: string; password: string; role: UserRole; full_name: string }> = [
    { email: "admin@sofacover.com", password: "admin123", role: "admin", full_name: "Admin User" },
    { email: "staff@sofacover.com", password: "staff123", role: "staff", full_name: "Staff User" },
    { email: "user@sofacover.com", password: "user123", role: "customer", full_name: "Customer User" },
  ]

  constructor() {
    if (USE_SUPABASE) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!
      this.supabase = createClient<Database>(url, anon)
    }
  }

  async signIn(email: string, password: string): Promise<{ user?: AuthUser; error?: AuthError }> {
    try {
      if (USE_SUPABASE && process.env.QA_BYPASS_AUTH !== "1") {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          return { error: { code: error.code || "auth_error", message: error.message } }
        }

        if (!data.user) {
          return { error: { code: "no_user", message: "No user returned from authentication" } }
        }

        // Fetch user profile with role
        const profile = await this.getUserProfile(data.user.id)
        if (!profile) {
          return { error: { code: "no_profile", message: "User profile not found" } }
        }

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          full_name: profile.full_name || data.user.user_metadata?.full_name,
          role: profile.role as UserRole,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        }

        return { user: authUser }
      } else {
        // Mock authentication
        const mockUser = this.mockUsers.find((u) => u.email === email && u.password === password)
        if (!mockUser) {
          return { error: { code: "invalid_credentials", message: "Invalid email or password" } }
        }

        const authUser: AuthUser = {
          id: `mock-${mockUser.role}-${Date.now()}`,
          email: mockUser.email,
          full_name: mockUser.full_name,
          role: mockUser.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Store in localStorage for mock mode
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(authUser))
          if (mockUser.role === "admin" || mockUser.role === "staff") {
            localStorage.setItem("admin_token", "mock_admin_token")
          }
        }

        return { user: authUser }
      }
    } catch (error) {
      logger.error("Sign in error:", error)
      return { error: { code: "unexpected_error", message: "An unexpected error occurred" } }
    }
  }

  async signUp(
    email: string,
    password: string,
    fullName?: string,
    role: UserRole = "customer",
  ): Promise<{ user?: AuthUser; error?: AuthError; needsVerification?: boolean }> {
    try {
      if (USE_SUPABASE && process.env.QA_BYPASS_AUTH !== "1") {
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || "",
              role: role,
            },
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              (typeof window !== "undefined" ? window.location.origin : ""),
          },
        })

        if (error) {
          return { error: { code: error.code || "signup_error", message: error.message } }
        }

        if (!data.user) {
          return { error: { code: "no_user", message: "No user returned from signup" } }
        }

        // If email confirmation is required
        if (!data.session) {
          return { needsVerification: true }
        }

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: role,
          created_at: data.user.created_at,
          updated_at: new Date().toISOString(),
        }

        return { user: authUser }
      } else {
        // Mock signup
        const authUser: AuthUser = {
          id: `mock-user-${Date.now()}`,
          email,
          full_name: fullName || "",
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(authUser))
        }

        return { user: authUser }
      }
    } catch (error) {
      logger.error("Sign up error:", error)
      return { error: { code: "unexpected_error", message: "An unexpected error occurred" } }
    }
  }

  async signOut(): Promise<{ error?: AuthError }> {
    try {
      if (USE_SUPABASE && process.env.QA_BYPASS_AUTH !== "1") {
        const { error } = await this.supabase.auth.signOut()
        if (error) {
          return { error: { code: error.code || "signout_error", message: error.message } }
        }
      } else {
        // Mock signout
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_user")
          localStorage.removeItem("admin_token")
        }
      }
      return {}
    } catch (error) {
      logger.error("Sign out error:", error)
      return { error: { code: "unexpected_error", message: "An unexpected error occurred" } }
    }
  }

  async getCurrentUser(): Promise<{ user?: AuthUser; error?: AuthError }> {
    try {
      if (USE_SUPABASE && process.env.QA_BYPASS_AUTH !== "1") {
        const { data, error } = await this.supabase.auth.getUser()

        if (error) {
          return { error: { code: error.code || "get_user_error", message: error.message } }
        }

        if (!data.user) {
          return {}
        }

        const profile = await this.getUserProfile(data.user.id)
        if (!profile) {
          return { error: { code: "no_profile", message: "User profile not found" } }
        }

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          full_name: profile.full_name || data.user.user_metadata?.full_name,
          role: profile.role as UserRole,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        }

        return { user: authUser }
      } else {
        // Mock mode
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("auth_user")
          if (stored) {
            const user = JSON.parse(stored) as AuthUser
            return { user }
          }
        }
        return {}
      }
    } catch (error) {
      logger.error("Get current user error:", error)
      return { error: { code: "unexpected_error", message: "An unexpected error occurred" } }
    }
  }

  async updateProfile(
    updates: Partial<Pick<AuthUser, "full_name" | "phone" | "avatar_url">>,
  ): Promise<{ user?: AuthUser; error?: AuthError }> {
    try {
      const { user: currentUser } = await this.getCurrentUser()
      if (!currentUser) {
        return { error: { code: "not_authenticated", message: "User not authenticated" } }
      }

      if (USE_SUPABASE && process.env.QA_BYPASS_AUTH !== "1") {
        const { data, error } = await this.supabase
          .from("profiles")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentUser.id)
          .select()
          .single()

        if (error) {
          return { error: { code: error.code || "update_error", message: error.message } }
        }

        const updatedUser: AuthUser = {
          ...currentUser,
          ...updates,
          updated_at: data.updated_at,
        }

        return { user: updatedUser }
      } else {
        // Mock update
        const updatedUser: AuthUser = {
          ...currentUser,
          ...updates,
          updated_at: new Date().toISOString(),
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(updatedUser))
        }

        return { user: updatedUser }
      }
    } catch (error) {
      logger.error("Update profile error:", error)
      return { error: { code: "unexpected_error", message: "An unexpected error occurred" } }
    }
  }

  hasRole(user: AuthUser | null, role: UserRole): boolean {
    if (!user) return false
    return user.role === role
  }

  isAdmin(user: AuthUser | null): boolean {
    return this.hasRole(user, "admin")
  }

  isStaff(user: AuthUser | null): boolean {
    return this.hasRole(user, "staff") || this.hasRole(user, "admin")
  }

  private async getUserProfile(userId: string) {
    if (!USE_SUPABASE) return null

    try {
      const { data, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        logger.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      logger.error("Error fetching profile:", error)
      return null
    }
  }

  async resetPassword(email: string): Promise<{ error?: AuthError; success?: boolean }> {
    try {
      if (USE_SUPABASE && process.env.QA_BYPASS_AUTH !== "1") {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            (typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : ""),
        })

        if (error) {
          return { error: { code: error.code || "reset_error", message: error.message } }
        }

        return { success: true }
      } else {
        // Mock reset password
        logger.info("Mock password reset for:", email)
        return { success: true }
      }
    } catch (error) {
      logger.error("Reset password error:", error)
      return { error: { code: "unexpected_error", message: "An unexpected error occurred" } }
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
