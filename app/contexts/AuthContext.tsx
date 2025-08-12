"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  joinDate: string
  totalOrders: number
  totalSpent: number
  role: "user" | "admin"
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("user_token")
      const userData = localStorage.getItem("user_data")

      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
      localStorage.removeItem("user_token")
      localStorage.removeItem("user_data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock authentication - in real app, this would be API call
      if (email === "user@sofacover.com" && password === "user123") {
        const mockUser: User = {
          id: "user_1",
          firstName: "สมชาย",
          lastName: "ใจดี",
          email: "user@sofacover.com",
          phone: "081-234-5678",
          address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน",
          city: "กรุงเทพฯ",
          postalCode: "10110",
          joinDate: "2024-01-15",
          totalOrders: 12,
          totalSpent: 45680,
          role: "user",
          permissions: ["view_orders", "create_orders", "view_profile", "edit_profile"],
        }

        localStorage.setItem("user_token", "demo_user_token")
        localStorage.setItem("user_data", JSON.stringify(mockUser))
        setUser(mockUser)
        return { success: true }
      } else if (email === "admin@sofacover.com" && password === "admin123") {
        const mockAdmin: User = {
          id: "admin_1",
          firstName: "ผู้ดูแล",
          lastName: "ระบบ",
          email: "admin@sofacover.com",
          phone: "081-999-9999",
          joinDate: "2023-01-01",
          totalOrders: 0,
          totalSpent: 0,
          role: "admin",
          permissions: [
            "view_orders",
            "create_orders",
            "edit_orders",
            "delete_orders",
            "view_customers",
            "edit_customers",
            "delete_customers",
            "view_products",
            "create_products",
            "edit_products",
            "delete_products",
            "view_analytics",
            "view_settings",
            "edit_settings",
            "manage_fabric_gallery",
            "manage_bills",
            "manage_shipping",
          ],
        }

        localStorage.setItem("user_token", "demo_admin_token")
        localStorage.setItem("user_data", JSON.stringify(mockAdmin))
        setUser(mockAdmin)
        return { success: true }
      } else {
        return { success: false, error: "Invalid email or password" }
      }
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock registration - in real app, this would be API call
      const mockUser: User = {
        id: `user_${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        joinDate: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        role: "user",
      }

      localStorage.setItem("user_token", "demo_user_token")
      localStorage.setItem("user_data", JSON.stringify(mockUser))
      setUser(mockUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Registration failed. Please try again." }
    }
  }

  const logout = () => {
    localStorage.removeItem("user_token")
    localStorage.removeItem("user_data")
    localStorage.removeItem("admin_token")
    setUser(null)
  }

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: "User not authenticated" }
      }

      const updatedUser = { ...user, ...userData }
      localStorage.setItem("user_data", JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Profile update failed. Please try again." }
    }
  }

  const refreshUser = () => {
    try {
      const userData = localStorage.getItem("user_data")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const isAdmin = user?.role === "admin"

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === "admin") return true // Admins have all permissions
    return user.permissions?.includes(permission) || false
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    hasPermission,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
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
