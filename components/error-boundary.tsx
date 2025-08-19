"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error)
    console.error("[v0] Component stack:", errorInfo.componentStack)
    console.error("[v0] Error stack:", error.stack)

    this.setState({
      error,
      errorInfo,
    })

    // Log error to monitoring service
    this.logError(error, errorInfo)
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "unknown",
      }

      console.error("[v0] Full error data:", errorData)

      // Store in localStorage for debugging
      if (typeof window !== "undefined") {
        const existingErrors = JSON.parse(localStorage.getItem("app_errors") || "[]")
        existingErrors.push(errorData)
        // Keep only last 10 errors
        if (existingErrors.length > 10) {
          existingErrors.shift()
        }
        localStorage.setItem("app_errors", JSON.stringify(existingErrors))
      }
    } catch (loggingError) {
      console.error("[v0] Failed to log error:", loggingError)
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} reset={this.handleReset} />
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-primary">เกิดข้อผิดพลาด</CardTitle>
              <CardDescription>ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-primary mb-2">Error Details:</p>
                  <p className="text-xs text-primary/80 font-mono break-all">{this.state.error.message}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full burgundy-gradient">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ลองใหม่
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
                >
                  <Home className="w-4 h-4 mr-2" />
                  กลับหน้าแรก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
