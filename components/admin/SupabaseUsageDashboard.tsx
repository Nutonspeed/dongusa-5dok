"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Database,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
} from "lucide-react"

interface UsageMetrics {
  storage: {
    used: number
    percentage: number
    trend: "increasing" | "decreasing" | "stable"
  }
  bandwidth: {
    used: number
    percentage: number
    dailyAverage: number
    projectedMonthly: number
  }
  apiRequests: {
    hourly: number
    daily: number
    trend: "increasing" | "decreasing" | "stable"
  }
  alerts: any[]
  lastUpdated: string
}

export function SupabaseUsageDashboard() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMetrics()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/supabase/usage")
      const data = await response.json()
      if (data.success) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error("Failed to fetch usage metrics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMetrics()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 80) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">Critical</Badge>
    if (percentage >= 80)
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Warning
        </Badge>
      )
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Normal
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Supabase Usage Monitor</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load usage metrics. Please try refreshing the page.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supabase Free Plan Usage</h2>
          <p className="text-muted-foreground">Monitor your Supabase resource usage and limits</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
          </span>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {metrics.alerts.filter((alert) => alert.severity === "critical").length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Usage Alert:</strong> You have{" "}
            {metrics.alerts.filter((alert) => alert.severity === "critical").length} critical usage warnings that
            require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Storage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.storage.used} MB</span>
                {getStatusBadge(metrics.storage.percentage)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Used</span>
                  <span className={getStatusColor(metrics.storage.percentage)}>{metrics.storage.percentage}%</span>
                </div>
                <Progress value={metrics.storage.percentage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{metrics.storage.used} MB / 500 MB</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metrics.storage.trend)}
                    <span>{metrics.storage.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bandwidth Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth (Monthly)</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.bandwidth.projectedMonthly} MB</span>
                {getStatusBadge(metrics.bandwidth.percentage)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Projected</span>
                  <span className={getStatusColor(metrics.bandwidth.percentage)}>{metrics.bandwidth.percentage}%</span>
                </div>
                <Progress value={metrics.bandwidth.percentage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{metrics.bandwidth.projectedMonthly} MB / 5000 MB</span>
                  <span>Daily: {metrics.bandwidth.dailyAverage} MB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.apiRequests.hourly}</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Unlimited
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Per Hour</span>
                  <span className="text-blue-600">{metrics.apiRequests.hourly}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Daily: {metrics.apiRequests.daily}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metrics.apiRequests.trend)}
                    <span>{metrics.apiRequests.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Usage Alerts ({metrics.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.severity === "critical" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {alert.severity === "critical" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="font-medium text-sm">{alert.message}</span>
                    </div>
                    <Badge
                      variant={alert.severity === "critical" ? "destructive" : "secondary"}
                      className={alert.severity === "warning" ? "bg-yellow-100 text-yellow-800" : ""}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{new Date(alert.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {metrics.storage.percentage > 80 && (
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                Consider implementing data cleanup and archiving procedures
              </div>
            )}
            {metrics.bandwidth.percentage > 80 && (
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                Implement image optimization and caching to reduce bandwidth usage
              </div>
            )}
            {metrics.apiRequests.hourly > 500 && (
              <div className="flex items-center gap-2 text-blue-700">
                <Activity className="h-4 w-4" />
                Consider implementing request batching and caching for API optimization
              </div>
            )}
            {(metrics.storage.percentage > 70 || metrics.bandwidth.percentage > 70) && (
              <div className="flex items-center gap-2 text-purple-700">
                <TrendingUp className="h-4 w-4" />
                Plan for Supabase Pro upgrade when approaching limits ($25/month)
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
