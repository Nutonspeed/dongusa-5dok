"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertTriangle, Database, Play, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  test: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
  timestamp: string
}

export default function SQLExecutionDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [customSQL, setCustomSQL] = useState("")
  const [sqlResult, setSqlResult] = useState<any>(null)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    const tests = [
      {
        name: "Database Connection",
        test: async () => {
          const response = await fetch("/api/health/database")
          const data = await response.json()
          return {
            success: response.ok,
            message: data.status === "ok" ? "Database connected successfully" : data.error,
            details: data,
          }
        },
      },
      {
        name: "Supabase Environment Variables",
        test: async () => {
          const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
          const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          return {
            success: hasUrl && hasKey,
            message: hasUrl && hasKey ? "Environment variables configured" : "Missing Supabase environment variables",
            details: { hasUrl, hasKey },
          }
        },
      },
      {
        name: "SQL Execution Permissions",
        test: async () => {
          try {
            const response = await fetch("/api/admin/test-sql", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sql: "SELECT 1 as test_value" }),
            })
            const data = await response.json()
            return {
              success: response.ok,
              message: response.ok ? "SQL execution working" : data.error || "SQL execution failed",
              details: data,
            }
          } catch (error) {
            return {
              success: false,
              message: "SQL execution endpoint not available",
              details: error instanceof Error ? error.message : "Unknown error",
            }
          }
        },
      },
      {
        name: "File System Access",
        test: async () => {
          try {
            const response = await fetch("/api/admin/file-access-test")
            const data = await response.json()
            return {
              success: response.ok,
              message: response.ok ? "File system accessible" : "File access issues detected",
              details: data,
            }
          } catch (error) {
            return {
              success: false,
              message: "File access test failed",
              details: error instanceof Error ? error.message : "Unknown error",
            }
          }
        },
      },
      {
        name: "Script Execution Environment",
        test: async () => {
          try {
            const response = await fetch("/api/admin/script-test")
            const data = await response.json()
            return {
              success: response.ok,
              message: response.ok ? "Script execution environment ready" : "Script execution issues",
              details: data,
            }
          } catch (error) {
            return {
              success: false,
              message: "Script execution test failed",
              details: error instanceof Error ? error.message : "Unknown error",
            }
          }
        },
      },
    ]

    for (const { name, test } of tests) {
      try {
        const result = await test()
        setResults((prev) => [
          ...prev,
          {
            test: name,
            status: result.success ? "success" : "error",
            message: result.message,
            details: result.details,
            timestamp: new Date().toISOString(),
          },
        ])
      } catch (error) {
        setResults((prev) => [
          ...prev,
          {
            test: name,
            status: "error",
            message: "Test execution failed",
            details: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          },
        ])
      }
    }

    setIsRunning(false)
  }

  const executeCustomSQL = async () => {
    if (!customSQL.trim()) return

    try {
      const response = await fetch("/api/admin/execute-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: customSQL }),
      })

      const data = await response.json()
      setSqlResult({
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setSqlResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Execution Diagnostic Tool
          </CardTitle>
          <CardDescription>Diagnose issues preventing SQL command execution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Diagnostic Results</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.test}</h4>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">View Details</summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom SQL Test</CardTitle>
          <CardDescription>Test SQL execution directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter SQL command to test..."
            value={customSQL}
            onChange={(e) => setCustomSQL(e.target.value)}
            rows={4}
          />
          <Button onClick={executeCustomSQL} disabled={!customSQL.trim()}>
            <Play className="h-4 w-4 mr-2" />
            Execute SQL
          </Button>

          {sqlResult && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {sqlResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {sqlResult.success ? "SQL executed successfully" : "SQL execution failed"}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(sqlResult.success ? sqlResult.data : sqlResult.error, null, 2)}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">Error: "Cannot open file: No active block available"</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Check if Supabase integration is properly configured</li>
                <li>Verify environment variables are set correctly</li>
                <li>Ensure database connection is active</li>
                <li>Try refreshing the page and running the script again</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Database Connection Issues</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Check Supabase project status</li>
                <li>Verify API keys and URLs</li>
                <li>Check network connectivity</li>
                <li>Review database permissions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">File Access Problems</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Check file permissions</li>
                <li>Verify script file exists</li>
                <li>Ensure proper file paths</li>
                <li>Check for file system locks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
