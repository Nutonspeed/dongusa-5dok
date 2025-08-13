"use client"

// Enhanced Authentication Hook
// Provides comprehensive authentication state management

import { useState, useEffect, useCallback } from "react"
import { authService, type AuthUser, type AuthError } from "@/lib/auth-enhanced"
import { logger } from "@/lib/logger"

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isStaff: boolean
  error: AuthError | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ success: boolean; needsVerification?: boolean }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Pick<AuthUser, "full_name" | "phone" | "avatar_url">>) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  clearError: () => void
  refreshUser: () => Promise<void>
}

export function useAuthEnhanced(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const { user: currentUser, error } = await authService.getCurrentUser()

      if (error) {
        setError(error)
        setUser(null)
      } else {
        setUser(currentUser || null)
        setError(null)
      }
    } catch (err) {
      logger.error("Auth initialization error:", err)
      setError({ code: "init_error", message: "Failed to initialize authentication" })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const { user: authUser, error } = await authService.signIn(email, password)

      if (error) {
        setError(error)
        return false
      }

      if (authUser) {
        setUser(authUser)
        return true
      }

      return false
    } catch (err) {
      logger.error("Sign in error:", err)
      setError({ code: "signin_error", message: "Failed to sign in" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName?: string,
    ): Promise<{ success: boolean; needsVerification?: boolean }> => {
      try {
        setIsLoading(true)
        setError(null)

        const { user: authUser, error, needsVerification } = await authService.signUp(email, password, fullName)

        if (error) {
          setError(error)
          return { success: false }
        }

        if (needsVerification) {
          return { success: true, needsVerification: true }
        }

        if (authUser) {
          setUser(authUser)
          return { success: true }
        }

        return { success: false }
      } catch (err) {
        logger.error("Sign up error:", err)
        setError({ code: "signup_error", message: "Failed to sign up" })
        return { success: false }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      const { error } = await authService.signOut()

      if (error) {
        setError(error)
      } else {
        setUser(null)
        setError(null)
      }
    } catch (err) {
      logger.error("Sign out error:", err)
      setError({ code: "signout_error", message: "Failed to sign out" })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<Pick<AuthUser, "full_name" | "phone" | "avatar_url">>): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        const { user: updatedUser, error } = await authService.updateProfile(updates)

        if (error) {
          setError(error)
          return false
        }

        if (updatedUser) {
          setUser(updatedUser)
          return true
        }

        return false
      } catch (err) {
        logger.error("Update profile error:", err)
        setError({ code: "update_error", message: "Failed to update profile" })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setError(null)
      const { error, success } = await authService.resetPassword(email)

      if (error) {
        setError(error)
        return false
      }

      return success || false
    } catch (err) {
      logger.error("Reset password error:", err)
      setError({ code: "reset_error", message: "Failed to reset password" })
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshUser = useCallback(async (): Promise<void> => {
    await initializeAuth()
  }, [initializeAuth])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: authService.isAdmin(user),
    isStaff: authService.isStaff(user),
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
    refreshUser,
  }
}
