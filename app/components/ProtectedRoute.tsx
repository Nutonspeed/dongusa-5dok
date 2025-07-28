"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requireBackendAccess?: boolean
  fallbackPath?: string
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  requireBackendAccess = false,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasAnyPermission, isBackendUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`${fallbackPath}?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      if (requireBackendAccess && !isBackendUser()) {
        router.push("/unauthorized")
        return
      }

      if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
        router.push("/unauthorized")
        return
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    router,
    requiredPermissions,
    requireBackendAccess,
    hasAnyPermission,
    isBackendUser,
    fallbackPath,
  ])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireBackendAccess && !isBackendUser()) {
    return null
  }

  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return null
  }

  return <>{children}</>
}
