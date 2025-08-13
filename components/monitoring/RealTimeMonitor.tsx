"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  Users,
  Zap,
  RefreshCw,
} from "lucide-react"

interface SystemStatus {
  service: string
  status: "healthy" | "warning" | "critical"
  responseTime: number
  uptime: number
  lastCheck: string
}

interface RealTimeMetrics {
  activeUsers: number
  requestsPerMinute: number
  errorRate: number
  averageResponseTime: number
  databaseConnections: number
  memoryUsage: number
  cpuUsage: number
}

export function RealTimeMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
    {
      service: "Web Application",
      status: "healthy",
      responseTime: 245,
      uptime: 99.9,
      lastCheck: new Date().toISOString(),
    },
    {
      service: "Database",
      status: "healthy",
      responseTime: 12,
      uptime: 99.8,
      lastCheck: new Date().toISOString(),
    },
    {
      service: "Payment Gateway",
      status: "warning",
      responseTime: 890,
      uptime: 98.5,
      lastCheck: new Date().toISOString(),
    },
    {
      service: "Email Service",
      status: "healthy",
      responseTime: 156,
      uptime: 99.7,
      lastCheck: new Date().toISOString(),
    },
  ])

  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeUsers: 23,
    requestsPerMinute: 145,
    errorRate: 0.2,
    averageResponseTime: 234,
    databaseConnections: 8,
    memoryUsage: 67,
    cpuUsage: 23,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        requestsPerMinute: prev.requestsPerMinute + Math.floor(Math.random() * 20 - 10),
        errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.1),
        averageResponseTime: prev.averageResponseTime + Math.floor(Math.random() * 50 - 25),
        databaseConnections: Math.max(1, prev.databaseConnections + Math.floor(Math.random() * 4 - 2)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 10 - 5))),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + Math.floor(Math.random() * 10 - 5))),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time System Monitor</h2>
          <p className="text-muted-foreground">Live system health and performance metrics</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStatus.map((service) => (
          <Card key={service.service}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {service.service === "Web Application" && <Globe className="h-4 w-4" />}
                  {service.service === "Database" && <Database className="h-4 w-4" />}
                  {service.service === "Payment Gateway" && <Zap className="h-4 w-4" />}
                  {service.service === "Email Service" && <Server className="h-4 w-4" />}
                  <span className="font-medium text-sm">{service.service}</span>
                </div>
                {getStatusIcon(service.status)}
              </div>
              <div className="space-y-2">
                <Badge className={getStatusColor(service.status)} variant="secondary">
                  {service.status === "healthy" ? "Healthy" : service.status === "warning" ? "Warning" : "Critical"}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  <div>Response: {service.responseTime}ms</div>
                  <div>Uptime: {service.uptime}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Active Users</span>
            </div>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <div className="text-xs text-muted-foreground">Currently online</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Requests/min</span>
            </div>
            <div className="text-2xl font-bold">{metrics.requestsPerMinute}</div>
            <div className="text-xs text-muted-foreground">API requests per minute</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-sm">Error Rate</span>
            </div>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground">Error percentage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Avg Response</span>
            </div>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <div className="text-xs text-muted-foreground">Average response time</div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{metrics.memoryUsage}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.memoryUsage > 80 ? "High usage detected" : "Normal usage"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{metrics.cpuUsage}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.cpuUsage > 70 ? "High CPU usage" : "Normal usage"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Database Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active</span>
                <span>{metrics.databaseConnections}/20</span>
              </div>
              <Progress value={(metrics.databaseConnections / 20) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.databaseConnections > 15 ? "High connection usage" : "Normal usage"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
