"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Zap, Clock, Download, AlertTriangle, CheckCircle, XCircle, Minus } from "lucide-react"
import { useWebVitals, type WebVitalMetric } from "@/lib/performance/web-vitals"
import { useResourceMonitor, type ResourceMetrics } from "@/lib/performance/resource-monitor"
import { useBundleAnalysis, type BundleAnalysis } from "@/lib/performance/bundle-analyzer"

export function PerformanceDashboard() {
  const { metrics: webVitals } = useWebVitals()
  const { metrics: resourceMetrics } = useResourceMonitor()
  const { analysis: bundleAnalysis, loading: bundleLoading, runAnalysis } = useBundleAnalysis()

  React.useEffect(() => {
    // Run bundle analysis on mount
    runAnalysis()
  }, [runAnalysis])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and optimize your application's performance</p>
        </div>
        <Button onClick={runAnalysis} disabled={bundleLoading}>
          {bundleLoading ? "Analyzing..." : "Refresh Analysis"}
        </Button>
      </div>

      <Tabs defaultValue="web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="bundles">Bundle Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals" className="space-y-4">
          <WebVitalsSection metrics={webVitals} />
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <ResourcesSection metrics={resourceMetrics} />
        </TabsContent>

        <TabsContent value="bundles" className="space-y-4">
          <BundleSection analysis={bundleAnalysis} loading={bundleLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function WebVitalsSection({ metrics }: { metrics: WebVitalMetric[] }) {
  const getMetricIcon = (rating: string) => {
    switch (rating) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "needs-improvement":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "poor":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "bg-green-500"
      case "needs-improvement":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getMetricDescription = (name: string) => {
    const descriptions = {
      CLS: "Cumulative Layout Shift - Visual stability",
      FID: "First Input Delay - Interactivity",
      FCP: "First Contentful Paint - Loading",
      LCP: "Largest Contentful Paint - Loading",
      TTFB: "Time to First Byte - Server response",
      INP: "Interaction to Next Paint - Responsiveness",
    }
    return descriptions[name as keyof typeof descriptions] || ""
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            {getMetricIcon(metric.rating)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metric.value.toFixed(metric.name === "CLS" ? 3 : 0)}
              {metric.name === "CLS" ? "" : "ms"}
            </div>
            <p className="text-xs text-muted-foreground">{getMetricDescription(metric.name)}</p>
            <div className="mt-2">
              <Badge
                variant={metric.rating === "good" ? "default" : "destructive"}
                className={`${getMetricColor(metric.rating)} text-white`}
              >
                {metric.rating.replace("-", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ResourcesSection({ metrics }: { metrics: ResourceMetrics | null }) {
  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading resource metrics...</p>
        </CardContent>
      </Card>
    )
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalResources}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(metrics.totalSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.totalDuration / 1000).toFixed(2)}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Blocking</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.renderBlockingResources.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resources by Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(metrics.resourcesByType).map(([type, resources]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{resources.length} files</span>
                  <span className="text-sm font-medium">
                    {formatBytes(resources.reduce((sum, r) => sum + r.size, 0))}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slowest Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.slowestResources.slice(0, 5).map((resource, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm truncate flex-1 mr-2">{resource.name.split("/").pop()}</span>
                <span className="text-sm font-medium">{resource.duration.toFixed(0)}ms</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BundleSection({
  analysis,
  loading,
}: {
  analysis: BundleAnalysis | null
  loading: boolean
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Analyzing bundles...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No bundle analysis available</p>
        </CardContent>
      </Card>
    )
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Bundle Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(analysis.totalSize)}</div>
            <p className="text-xs text-muted-foreground">{formatBytes(analysis.totalGzipSize)} gzipped</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chunks</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.chunks.length}</div>
            <p className="text-xs text-muted-foreground">{analysis.chunks.filter((c) => c.isAsync).length} async</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compression</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analysis.totalGzipSize / analysis.totalSize) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">compression ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <Alert key={index}>
                <AlertDescription>{recommendation}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chunk Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bundle Chunks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.chunks.map((chunk, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{chunk.name}</span>
                    {chunk.isEntry && <Badge variant="default">Entry</Badge>}
                    {chunk.isAsync && <Badge variant="secondary">Async</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatBytes(chunk.size)}
                    {chunk.gzipSize && ` (${formatBytes(chunk.gzipSize)} gzipped)`}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Modules: {chunk.modules.join(", ")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
