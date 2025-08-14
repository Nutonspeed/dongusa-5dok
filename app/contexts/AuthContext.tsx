"use client"
import { logger } from "@/lib/logger"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { USE_SUPABASE } from "@/lib/runtime"
import type { AppUser } from "@/types/user"
import type { Database } from "@/lib/supabase/types"
import { bruteForceProtection } from "@/lib/brute-force-protection"

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: AppUser | null
  profile: ProfileRow | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean
    error?: string
    requiresCaptcha?: boolean
    lockoutUntil?: number
    remainingAttempts?: number
  }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  checkAccountStatus: (email: string) => Promise<{
    attempts: number
    isLocked: boolean
    lockoutUntil?: number
    requiresCaptcha: boolean
  }>
}

const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  signIn: async () => ({ success: false, error: "Auth not initialized" }),
  signUp: async () => ({ success: false, error: "Auth not initialized" }),
  signOut: async () => {},
  refreshProfile: async () => {},
  checkAccountStatus: async () => ({ attempts: 0, isLocked: false, requiresCaptcha: false }),
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const QA_BYPASS_AUTH = process.env.QA_BYPASS_AUTH === "1"

  const getClientInfo = () => {
    if (typeof window === "undefined") return { ip: "unknown", userAgent: "unknown" }

    // In a real application, you'd get the IP from the server
    // For now, we'll use a placeholder
    const ip = "client-ip" // This would be passed from server-side
    const userAgent = navigator.userAgent

    return { ip, userAgent }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const initializeAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))

      try {
        if (USE_SUPABASE && !QA_BYPASS_AUTH) {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            logger.error("Error getting session:", error)
            setIsLoading(false)
            return
          }

          const mappedUser: AppUser | null = session?.user
            ? { ...session.user, full_name: session.user.user_metadata?.full_name }
            : null
          setUser(mappedUser)

          if (mappedUser) {
            await fetchProfile(mappedUser.id)
          }
        } else {
          const mockUser: AppUser = {
            id: "mock-user",
            email: "mock@local",
            full_name: "Mock User",
            app_metadata: {},
            user_metadata: {},
            aud: "",
            created_at: "",
            confirmed_at: undefined,
            email_confirmed_at: undefined,
            phone: "",
            role: "authenticated",
            last_sign_in_at: undefined,
            identities: [],
            factors: undefined,
          }
          setUser(mockUser)
          setProfile({
            id: mockUser.id,
            email: mockUser.email || "",
            full_name: mockUser.full_name || null,
            phone: null,
            role: "admin",
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        logger.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    if (USE_SUPABASE && !QA_BYPASS_AUTH) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        const mappedUser: AppUser | null = session?.user
          ? { ...session.user, full_name: session.user.user_metadata?.full_name }
          : null
        setUser(mappedUser)

        if (mappedUser) {
          await fetchProfile(mappedUser.id)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      })

      return () => subscription.unsubscribe()
    }
  }, [isMounted])

  const fetchProfile = async (userId: string) => {
    try {
      if (USE_SUPABASE && !QA_BYPASS_AUTH) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error && error.code !== "PGRST116") {
          logger.error("Error fetching profile:", error)
          return
        }

        if (data) {
          setProfile(data as ProfileRow)
        }
      }
    } catch (error) {
      logger.error("Error fetching profile:", error)
    }
  }

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{
    success: boolean
    error?: string
    requiresCaptcha?: boolean
    lockoutUntil?: number
    remainingAttempts?: number
  }> => {
    const { ip, userAgent } = getClientInfo()

    try {
      if (USE_SUPABASE && !QA_BYPASS_AUTH) {
        const preCheck = await bruteForceProtection.checkLoginAttempt(email, ip, userAgent, false)

        if (!preCheck.allowed) {
          return {
            success: false,
            error: preCheck.message,
            requiresCaptcha: preCheck.requiresCaptcha,
            lockoutUntil: preCheck.lockoutUntil,
            remainingAttempts: preCheck.remainingAttempts,
          }
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          await bruteForceProtection.checkLoginAttempt(email, ip, userAgent, false)

          return {
            success: false,
            error: error.message,
            requiresCaptcha: preCheck.requiresCaptcha,
            remainingAttempts: preCheck.remainingAttempts - 1,
          }
        }

        await bruteForceProtection.checkLoginAttempt(email, ip, userAgent, true)
        return { success: true }
      } else {
        const preCheck = await bruteForceProtection.checkLoginAttempt(email, ip, userAgent, false)

        if (!preCheck.allowed) {
          return {
            success: false,
            error: preCheck.message,
            requiresCaptcha: preCheck.requiresCaptcha,
            lockoutUntil: preCheck.lockoutUntil,
            remainingAttempts: preCheck.remainingAttempts,
          }
        }

        const validCredentials = [
          { email: "user@sofacover.com", password: "user123", role: "customer" },
          { email: "admin@sofacover.com", password: "admin123", role: "admin" },
        ]

        const credential = validCredentials.find((c) => c.email === email && c.password === password)

        if (credential) {
          await bruteForceProtection.checkLoginAttempt(email, ip, userAgent, true)

          const mockUser: AppUser = {
            id: credential.role === "admin" ? "admin-id" : "user-id",
            email: credential.email,
            full_name: credential.role === "admin" ? "Admin User" : "Regular User",
            app_metadata: {},
            user_metadata: {},
            aud: "",
            created_at: "",
            confirmed_at: undefined,
            email_confirmed_at: undefined,
            phone: "",
            role: "authenticated",
            last_sign_in_at: undefined,
            identities: [],
            factors: undefined,
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("user_data", JSON.stringify(mockUser))
            if (credential.role === "admin") {
              localStorage.setItem("admin_token", "demo_token")
            }
          }

          setUser(mockUser)
          setProfile({
            id: mockUser.id,
            email: mockUser.email || "",
            full_name: mockUser.full_name || null,
            phone: null,
            role: credential.role as "customer" | "admin",
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          return { success: true }
        } else {
          const result = await bruteForceProtection.checkLoginAttempt(email, ip, userAgent, false)

          return {
            success: false,
            error: result.message,
            requiresCaptcha: result.requiresCaptcha,
            lockoutUntil: result.lockoutUntil,
            remainingAttempts: result.remainingAttempts,
          }
        }
      }
    } catch (error) {
      await bruteForceProtection.checkLoginAttempt(email, ip, userAgent, false)

      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const checkAccountStatus = async (email: string) => {
    return await bruteForceProtection.getAccountStatus(email)
  }

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (USE_SUPABASE && !QA_BYPASS_AUTH) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || "",
            },
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              (typeof window !== "undefined" ? window.location.origin : ""),
          },
        })

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true }
      } else {
        const mockUser: AppUser = {
          id: `user-${Date.now()}`,
          email,
          full_name: fullName || "",
          role: "authenticated",
          app_metadata: {},
          user_metadata: {},
          aud: "",
          created_at: "",
          confirmed_at: undefined,
          email_confirmed_at: undefined,
          phone: "",
          last_sign_in_at: undefined,
          identities: [],
          factors: undefined,
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("user_data", JSON.stringify(mockUser))
        }

        setUser(mockUser)
        setProfile({
          id: mockUser.id,
          email: mockUser.email || "",
          full_name: mockUser.full_name || null,
          phone: null,
          role: "customer",
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        return { success: true }
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const signOut = async () => {
    if (USE_SUPABASE && !QA_BYPASS_AUTH) {
      await supabase.auth.signOut()
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_data")
        localStorage.removeItem("admin_token")
      }
      setUser(null)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const isAdmin = profile?.role === "admin"

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    checkAccountStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (typeof window === "undefined") {
    return defaultAuthContext
  }

  if (context === undefined) {
    return defaultAuthContext
  }

  return context
}
