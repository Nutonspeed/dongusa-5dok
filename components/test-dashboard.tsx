"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Database, Users, ShoppingCart } from "lucide-react"

interface TestResult {
  table: string
  status: "PASS" | "FAIL"
  message: string
  data?: any[]
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  timestamp: string
}

export default function TestDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)

  const runDataFlowTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/data-flow")
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setSummary(data.summary)
      } else {
        console.error("Test failed:", data.error)
      }
    } catch (error) {
      console.error("Failed to run tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (table: string) => {
    switch (table.toLowerCase()) {
      case "profiles":
        return <Users className="w-4 h-4" />
      case "orders":
        return <ShoppingCart className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database & Authentication Test Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDataFlowTest} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Data Flow Tests"
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          {results.map((result, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIcon(result.table)}
                    <div>
                      <div className="font-medium">{result.table}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                  </div>
                  <Badge variant={result.status === "PASS" ? "default" : "destructive"}>
                    {result.status === "PASS" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {result.status}
                  </Badge>
                </div>
                {result.data && result.data.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500">
                    Sample data: {JSON.stringify(result.data[0], null, 2).substring(0, 100)}...
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
