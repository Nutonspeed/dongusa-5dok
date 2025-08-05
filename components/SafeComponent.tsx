"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface SafeComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function SafeComponent({ children, fallback }: SafeComponentProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      fallback || (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      )
    )
  }

  return <>{children}</>
}
