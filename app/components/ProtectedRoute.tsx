"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireRole?: "user" | "admin"
}

export default function ProtectedRoute({ children, redirectTo = "/login", requireRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const currentPath = window.location.pathname
        router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      if (requireRole && user?.role !== requireRole) {
        router.push("/unauthorized")
        return
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, requireRole])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireRole && user?.role !== requireRole) {
    return null
  }

  return <>{children}</>
}
