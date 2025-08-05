"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallbackPath?: string
  requireAuth?: boolean
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  fallbackPath = "/login",
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // If authentication is required but user is not logged in
      if (requireAuth && !user) {
        const currentPath = window.location.pathname
        router.push(`${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      // If user is logged in but doesn't have required role
      if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized")
        return
      }

      // If we reach here, user is authorized
      setIsAuthorized(true)
      setIsChecking(false)
    }
  }, [user, isLoading, router, allowedRoles, fallbackPath, requireAuth])

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r bg-gray-50 p-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="border-b p-4">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error if not authorized
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{!user ? "กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ..." : "คุณไม่มีสิทธิ์เข้าถึงหน้านี้"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
