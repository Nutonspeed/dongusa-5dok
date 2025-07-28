"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthService, type User, type AuthResponse } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (userData: {
    email: string
    password: string
    name: string
    role?: "customer"
  }) => Promise<AuthResponse>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  isBackendUser: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await AuthService.verifyToken(token)
      if (response.success && response.user) {
        setUser(response.user)
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      localStorage.removeItem("auth_token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const response = await AuthService.login(email, password)
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem("auth_token", response.token)
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    role?: "customer"
  }): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const response = await AuthService.register(userData)
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem("auth_token", response.token)
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
  }

  const hasPermission = (permission: string): boolean => {
    return user ? AuthService.hasPermission(user, permission) : false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return user ? AuthService.hasAnyPermission(user, permissions) : false
  }

  const isBackendUser = (): boolean => {
    return user ? AuthService.isBackendUser(user) : false
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    hasPermission,
    hasAnyPermission,
    isBackendUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
