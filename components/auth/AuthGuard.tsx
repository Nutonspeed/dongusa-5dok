// Authentication Guard Component
// Provides client-side route protection and role-based access control

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthEnhanced } from "@/hooks/use-auth-enhanced"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: "admin" | "staff" | "customer"
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireRole,
  fallback,
  redirectTo = "/login",
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, isAdmin, isStaff, error } = useAuthEnhanced()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // If authentication is not required, render children
    if (!requireAuth && !requireRole) {
      setShouldRender(true)
      return
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
      return
    }

    // Check role requirement
    if (requireRole && user) {
      let hasRequiredRole = false

      switch (requireRole) {
        case "admin":
          hasRequiredRole = isAdmin
          break
        case "staff":
          hasRequiredRole = isStaff
          break
        case "customer":
          hasRequiredRole = isAuthenticated
          break
      }

      if (!hasRequiredRole) {
        router.push("/")
        return
      }
    }

    setShouldRender(true)
  }, [isLoading, isAuthenticated, user, requireAuth, requireRole, router, pathname, redirectTo, isAdmin, isStaff])

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Authentication Error: {error.message}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        </div>
      </div>
    )
  }

  // Show access denied for role-based restrictions
  if (requireRole && user && !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  // Show authentication required
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this area.</p>
          <Button onClick={() => router.push(redirectTo)}>Go to Login</Button>
        </div>
      </div>
    )
  }

  // Render children if all checks pass
  return shouldRender ? <>{children}</> : null
}
