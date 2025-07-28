"use client"

import React from "react"
import { ErrorBoundaryReporter } from "@/lib/monitoring/error-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    errorInfo: React.ErrorInfo
    resetError: () => void
    errorId: string | null
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
  level?: "page" | "component" | "section"
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report error to tracking system
    ErrorBoundaryReporter.captureError(error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Generate error ID for user reference
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`

    this.setState({
      errorInfo,
      errorId,
    })

    // Auto-retry for component-level errors after 5 seconds
    if (this.props.level === "component") {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleReset()
      }, 5000)
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state
    const subject = encodeURIComponent(`Bug Report - ${errorId}`)
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:

    `)

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props

      if (Fallback) {
        return (
          <Fallback
            error={this.state.error!}
            errorInfo={this.state.errorInfo!}
            resetError={this.handleReset}
            errorId={this.state.errorId}
          />
        )
      }

      return (
        <ErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          errorId={this.state.errorId}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          onReportBug={this.handleReportBug}
          showDetails={this.props.showDetails}
          level={this.props.level}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: React.ErrorInfo
  errorId: string | null
  onReset: () => void
  onReload: () => void
  onGoHome: () => void
  onReportBug: () => void
  showDetails?: boolean
  level?: "page" | "component" | "section"
}

function ErrorFallback({
  error,
  errorInfo,
  errorId,
  onReset,
  onReload,
  onGoHome,
  onReportBug,
  showDetails = false,
  level = "page",
}: ErrorFallbackProps) {
  const [showFullError, setShowFullError] = React.useState(false)

  const getErrorTitle = () => {
    switch (level) {
      case "component":
        return "Component Error"
      case "section":
        return "Section Error"
      default:
        return "Something went wrong"
    }
  }

  const getErrorDescription = () => {
    switch (level) {
      case "component":
        return "A component on this page encountered an error. This will be automatically retried in a few seconds."
      case "section":
        return "A section of this page encountered an error. You can try refreshing or continue using other parts of the application."
      default:
        return "An unexpected error occurred. Our team has been notified and is working on a fix."
    }
  }

  const getActions = () => {
    const actions = []

    if (level === "component" || level === "section") {
      actions.push(
        <Button key="reset" onClick={onReset} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>,
      )
    }

    if (level === "page") {
      actions.push(
        <Button key="reload" onClick={onReload} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload Page
        </Button>,
      )

      actions.push(
        <Button key="home" onClick={onGoHome} variant="outline">
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>,
      )
    }

    actions.push(
      <Button key="report" onClick={onReportBug} variant="outline">
        <Bug className="w-4 h-4 mr-2" />
        Report Bug
      </Button>,
    )

    return actions
  }

  return (
    <div className={`flex items-center justify-center p-4 ${level === "page" ? "min-h-screen" : "min-h-[200px]"}`}>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">{getErrorTitle()}</CardTitle>
          <CardDescription className="text-gray-600">{getErrorDescription()}</CardDescription>
          {errorId && (
            <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              Error ID: {errorId}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">{getActions()}</div>

          {showDetails && (
            <div className="space-y-2">
              <Button variant="ghost" size="sm" onClick={() => setShowFullError(!showFullError)} className="w-full">
                {showFullError ? "Hide" : "Show"} Technical Details
              </Button>

              {showFullError && (
                <div className="space-y-2 text-xs">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="font-semibold mb-1">Error Message:</div>
                    <div className="text-red-600 font-mono">{error.message}</div>
                  </div>

                  {error.stack && (
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="font-semibold mb-1">Stack Trace:</div>
                      <pre className="text-red-600 font-mono whitespace-pre-wrap overflow-x-auto">{error.stack}</pre>
                    </div>
                  )}

                  {errorInfo.componentStack && (
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="font-semibold mb-1">Component Stack:</div>
                      <pre className="text-red-600 font-mono whitespace-pre-wrap overflow-x-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized error boundaries for different use cases
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === "development"}>
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary level="component">{children}</ErrorBoundary>
}

export function SectionErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary level="section">{children}</ErrorBoundary>
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
