"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Zap,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
} from "lucide-react"

interface SystemAlert {
  id: string
  type: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  timestamp: string
  resolved: boolean
  source: string
  severity: number
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  trend: "up" | "down" | "stable"
  status: "healthy" | "warning" | "critical"
  threshold: number
}

interface PerformanceData {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  network: number
  responseTime: number
  throughput: number
  errorRate: number
  activeUsers: number
}

export default function IntelligentAlertMonitoringSystem() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadSystemData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSystemData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    try {
      // Load alerts
      const alertsResponse = await fetch("/api/monitoring/alerts")
      const alertsData = await alertsResponse.json()
      setAlerts(alertsData.alerts || mockAlerts)

      // Load metrics
      const metricsResponse = await fetch("/api/monitoring/metrics")
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData.metrics || mockMetrics)

      // Load performance data
      const performanceResponse = await fetch("/api/monitoring/performance")
      const performanceData = await performanceResponse.json()
      setPerformanceData(performanceData.data || mockPerformanceData)

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load system data:", error)
      // Use mock data as fallback
      setAlerts(mockAlerts)
      setMetrics(mockMetrics)
      setPerformanceData(mockPerformanceData)
    } finally {
      setLoading(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "info":
        return <Bell className="w-5 h-5 text-blue-600" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getAlertBadgeClass = (type: string) => {
    switch (type) {
      case "critical":
        return "alert-critical"
      case "warning":
        return "alert-warning"
      case "info":
        return "alert-info"
      case "success":
        return "alert-success"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "cpu usage":
        return <Cpu className="w-6 h-6" />
      case "memory usage":
        return <MemoryStick className="w-6 h-6" />
      case "disk usage":
        return <HardDrive className="w-6 h-6" />
      case "network":
        return <Wifi className="w-6 h-6" />
      case "response time":
        return <Activity className="w-6 h-6" />
      case "active users":
        return <Users className="w-6 h-6" />
      case "database connections":
        return <Database className="w-6 h-6" />
      case "throughput":
        return <TrendingUp className="w-6 h-6" />
      default:
        return <Monitor className="w-6 h-6" />
    }
  }

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intelligent Alert & Monitoring</h1>
          <p className="text-gray-600 mt-1">ระบบแจ้งเตือนและติดตามประสิทธิภาพแบบอัจฉริยะ</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}</div>
          <Button onClick={loadSystemData} variant="outline" className="monitoring-glow bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button className="backend-gradient text-white">
            <Settings className="w-4 h-4 mr-2" />
            ตั้งค่า
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter((a) => a.type === "critical" && !a.resolved).length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong> มี {alerts.filter((a) => a.type === "critical" && !a.resolved).length}{" "}
            แจ้งเตือนสำคัญที่ต้องดำเนินการทันที
          </AlertDescription>
        </Alert>
      )}

      {/* System Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.slice(0, 8).map((metric, index) => (
          <Card key={index} className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                      {metric.value}
                      {metric.unit}
                    </p>
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                <div className={getMetricStatusColor(metric.status)}>{getMetricIcon(metric.name)}</div>
              </div>
              <Progress value={(metric.value / metric.threshold) * 100} className="h-2 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="backend-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                System Alerts
                <Badge variant="outline" className="realtime-pulse">
                  {alerts.filter((a) => !a.resolved).length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <Badge className={getAlertBadgeClass(alert.type)}>{alert.type}</Badge>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-600">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Source: {alert.source}</span>
                        <span>Severity: {alert.severity}/10</span>
                        <span>{new Date(alert.timestamp).toLocaleString("th-TH")}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dashboard-widget">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.slice(-1).map((data, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm text-gray-600">{data.cpu}%</span>
                      </div>
                      <Progress value={data.cpu} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm text-gray-600">{data.memory}%</span>
                      </div>
                      <Progress value={data.memory} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Disk Usage</span>
                        <span className="text-sm text-gray-600">{data.disk}%</span>
                      </div>
                      <Progress value={data.disk} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-widget">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Response Time & Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.slice(-1).map((data, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{data.responseTime}ms</div>
                        <div className="text-sm text-blue-700">Avg Response Time</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{data.throughput}</div>
                        <div className="text-sm text-green-700">Requests/sec</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{data.activeUsers}</div>
                        <div className="text-sm text-purple-700">Active Users</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{data.errorRate}%</div>
                        <div className="text-sm text-red-700">Error Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="dashboard-widget">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                System Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 mb-4">Comprehensive system analytics and performance insights</p>
                <Button className="backend-gradient text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="dashboard-widget">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Performance Optimization</h4>
                  <p className="text-sm text-blue-800">
                    CPU usage has increased by 15% over the past hour. Consider scaling resources or optimizing queries.
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">System Health</h4>
                  <p className="text-sm text-green-800">
                    All critical services are operating within normal parameters. System stability is excellent.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Capacity Planning</h4>
                  <p className="text-sm text-yellow-800">
                    Based on current growth trends, consider increasing storage capacity within the next 30 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock data for development
const mockAlerts: SystemAlert[] = [
  {
    id: "1",
    type: "critical",
    title: "High CPU Usage",
    message: "CPU usage has exceeded 90% for the past 5 minutes",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    resolved: false,
    source: "System Monitor",
    severity: 9,
  },
  {
    id: "2",
    type: "warning",
    title: "Low Disk Space",
    message: "Disk usage is at 85% capacity",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    resolved: false,
    source: "Storage Monitor",
    severity: 6,
  },
  {
    id: "3",
    type: "info",
    title: "Scheduled Maintenance",
    message: "System maintenance scheduled for tonight at 2:00 AM",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolved: false,
    source: "Maintenance Scheduler",
    severity: 3,
  },
]

const mockMetrics: SystemMetric[] = [
  { name: "CPU Usage", value: 75, unit: "%", trend: "up", status: "warning", threshold: 80 },
  { name: "Memory Usage", value: 68, unit: "%", trend: "stable", status: "healthy", threshold: 85 },
  { name: "Disk Usage", value: 45, unit: "%", trend: "up", status: "healthy", threshold: 90 },
  { name: "Network", value: 234, unit: "Mbps", trend: "down", status: "healthy", threshold: 1000 },
  { name: "Response Time", value: 145, unit: "ms", trend: "stable", status: "healthy", threshold: 500 },
  { name: "Active Users", value: 1247, unit: "", trend: "up", status: "healthy", threshold: 5000 },
  { name: "Database Connections", value: 23, unit: "", trend: "stable", status: "healthy", threshold: 100 },
  { name: "Throughput", value: 456, unit: "req/s", trend: "up", status: "healthy", threshold: 1000 },
]

const mockPerformanceData: PerformanceData[] = [
  {
    timestamp: new Date().toISOString(),
    cpu: 75,
    memory: 68,
    disk: 45,
    network: 234,
    responseTime: 145,
    throughput: 456,
    errorRate: 0.2,
    activeUsers: 1247,
  },
]
