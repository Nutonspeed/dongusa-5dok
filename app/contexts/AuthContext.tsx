"use client"
import { logger } from '@/lib/logger';

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/entities"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: "customer" | "admin" | "staff"
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
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
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const initializeAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))

      try {
        if (isSupabaseConfigured) {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            logger.error("Error getting session:", error)
            setIsLoading(false)
            return
          }

          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchProfile(session.user.id)
          }
        } else {
          try {
            const userData = typeof window !== "undefined" ? localStorage.getItem("user_data") : null
            const adminToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null

            if (userData) {
              const parsedUser = JSON.parse(userData)
              setUser(parsedUser)
              setProfile({
                id: parsedUser.id,
                email: parsedUser.email,
                full_name: parsedUser.full_name || null,
                phone: null,
                role: parsedUser.role || "customer",
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            } else if (adminToken) {
              const mockAdmin = {
                id: "admin-id",
                email: "admin@sofacover.com",
                full_name: "Admin User",
                phone: null,
                role: "admin" as const,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              setUser(mockAdmin as any)
              setProfile(mockAdmin)
            }
          } catch (error) {
            logger.error("Error accessing localStorage:", error)
          }
        }
      } catch (error) {
        logger.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
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
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from<Profile>("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (error && error.code !== "PGRST116") {
          logger.error("Error fetching profile:", error)
          return
        }

        if (data) {
          setProfile(data as UserProfile)
        }
      }
    } catch (error) {
      logger.error("Error fetching profile:", error)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true }
      } else {
        const validCredentials = [
          { email: "user@sofacover.com", password: "user123", role: "customer" },
          { email: "admin@sofacover.com", password: "admin123", role: "admin" },
        ]

        const credential = validCredentials.find((c) => c.email === email && c.password === password)

        if (credential) {
          const mockUser = {
            id: credential.role === "admin" ? "admin-id" : "user-id",
            email: credential.email,
            full_name: credential.role === "admin" ? "Admin User" : "Regular User",
            role: credential.role,
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("user_data", JSON.stringify(mockUser))
            if (credential.role === "admin") {
              localStorage.setItem("admin_token", "demo_token")
            }
          }

          setUser(mockUser as any)
          setProfile({
            id: mockUser.id,
            email: mockUser.email,
            full_name: mockUser.full_name,
            phone: null,
            role: mockUser.role as "customer" | "admin",
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          return { success: true }
        } else {
          return { success: false, error: "Invalid email or password" }
        }
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
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
        const mockUser = {
          id: `user-${Date.now()}`,
          email,
          full_name: fullName || "",
          role: "customer",
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("user_data", JSON.stringify(mockUser))
        }

        setUser(mockUser as any)
        setProfile({
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
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
    if (isSupabaseConfigured) {
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
