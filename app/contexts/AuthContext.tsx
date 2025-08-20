"use client"
// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.
import { logger } from "@/lib/logger"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { USE_SUPABASE } from "@/lib/runtime"
import type { AppUser } from "@/types/user"
import type { Database } from "@/lib/supabase/types"
import { bruteForceProtection } from "@/lib/brute-force-client"
import { decidePostAuthRedirect, type AppRole } from "@/lib/auth/redirect"

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
      console.log("[v0] Initializing auth, USE_SUPABASE:", USE_SUPABASE, "QA_BYPASS_AUTH:", QA_BYPASS_AUTH)

      try {
        if (USE_SUPABASE && !QA_BYPASS_AUTH) {
          console.log("[v0] Using Supabase auth")
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            logger.error("Error getting session:", error)
            console.log("[v0] Supabase session error, setting loading to false")
            setIsLoading(false)
            return
          }

          const mappedUser: AppUser | null = session?.user
            ? { ...session.user, full_name: session.user.user_metadata?.full_name }
            : null
          setUser(mappedUser)
          console.log("[v0] Supabase user set:", mappedUser ? "logged in" : "not logged in")

          if (mappedUser) {
            await fetchProfile(mappedUser.id)
          }
        } else {
          console.log("[v0] Using fallback auth (localStorage)")
          const storedUser = typeof window !== "undefined" ? localStorage.getItem("user_data") : null
          const adminToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            console.log("[v0] Restored user from localStorage:", parsedUser.email)

            // Set appropriate profile based on stored data
            const isAdminUser = adminToken === "demo_token" || parsedUser.email === "admin@sofacover.com"
            setProfile({
              id: parsedUser.id,
              email: parsedUser.email || "",
              full_name: parsedUser.full_name || null,
              phone: null,
              role: isAdminUser ? "admin" : "customer",
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          } else {
            console.log("[v0] No stored user found")
          }
        }
      } catch (error) {
        logger.error("Error initializing auth:", error)
        console.log("[v0] Auth initialization error:", error)
      } finally {
        console.log("[v0] Auth initialization complete, setting loading to false")
        setIsLoading(false)
      }
    }

    initializeAuth()

    if (USE_SUPABASE && !QA_BYPASS_AUTH) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        console.log("[v0] Auth state change:", event, session ? "has session" : "no session")
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
        } else {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              email: user?.email || "",
              full_name: user?.full_name || null,
              role: "customer", // Default role
            })
            .select()
            .single()

          if (!createError && newProfile) {
            setProfile(newProfile as ProfileRow)
          }
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

        if (typeof window !== "undefined") {
          setTimeout(async () => {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession()
              if (session) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("role")
                  .eq("id", session.user.id)
                  .single()

                const role = (profile?.role as AppRole) ?? null
                const params = new URLSearchParams(window.location.search)
                const returnUrl = params.get("redirect")
                const dest = decidePostAuthRedirect(role, returnUrl)
                window.location.href = dest
              }
            } catch (error) {
              console.error("[Auth] Post-login redirect error:", error)
              window.location.href = "/"
            }
          }, 300)
        }

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
          { email: "nuttapong161@gmail.com", password: "admin123", role: "admin" },
          { email: "nuttapong161@gmail.com", password: "127995803", role: "admin" },
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

          if (credential.role === "admin" && typeof window !== "undefined") {
            setTimeout(() => {
              const params = new URLSearchParams(window.location.search)
              const returnUrl = params.get("redirect")
              const dest = decidePostAuthRedirect("admin", returnUrl)
              window.location.href = dest
            }, 100)
          }

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
    isLoading: !isMounted || isLoading,
    isAuthenticated: isMounted && !!user,
    isAdmin: isMounted && profile?.role === "admin",
    signIn,
    signUp,
    signOut,
    refreshProfile,
    checkAccountStatus: async (email: string) => {
      return await bruteForceProtection.getAccountStatus(email)
    },
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
