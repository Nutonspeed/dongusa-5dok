"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Database,
  Mail,
  CreditCard,
  HardDrive,
  RefreshCw,
  Play,
  Monitor,
  Cpu,
  MemoryStick,
} from "lucide-react"
import type { SystemHealth } from "@/lib/system-health-monitor"
import type { TestSuite } from "@/lib/integration-test-suite"

export default function SystemHealthDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [runningTests, setRunningTests] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadSystemHealth()
    loadTestResults()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSystemHealth()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadSystemHealth = async () => {
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setSystemHealth(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load system health:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTestResults = async () => {
    try {
      const response = await fetch("/api/test/integration")
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error("Failed to load test results:", error)
    }
  }

  const runIntegrationTests = async () => {
    setRunningTests(true)
    try {
      const response = await fetch("/api/test/integration", { method: "POST" })
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error("Failed to run integration tests:", error)
    } finally {
      setRunningTests(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "unhealthy":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "degraded":
        return "bg-yellow-100 text-yellow-800"
      case "unhealthy":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "database":
        return <Database className="w-5 h-5" />
      case "email":
        return <Mail className="w-5 h-5" />
      case "payment":
        return <CreditCard className="w-5 h-5" />
      case "storage":
        return <HardDrive className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบ monitoring และ integration testing ครบวงจร</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}</div>
          <Button onClick={loadSystemHealth} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button onClick={runIntegrationTests} disabled={runningTests}>
            <Play className="w-4 h-4 mr-2" />
            {runningTests ? "กำลังทดสอบ..." : "รัน Tests"}
          </Button>
        </div>
      </div>

      {/* Overall Status Alert */}
      {systemHealth && systemHealth.overall !== "healthy" && (
        <Alert
          className={
            systemHealth.overall === "unhealthy" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
          }
        >
          <AlertTriangle
            className={`h-4 w-4 ${systemHealth.overall === "unhealthy" ? "text-red-600" : "text-yellow-600"}`}
          />
          <AlertDescription className={systemHealth.overall === "unhealthy" ? "text-red-800" : "text-yellow-800"}>
            <strong>System Status: {systemHealth.overall.toUpperCase()}</strong>
            {systemHealth.overall === "unhealthy" && " - Some services are down"}
            {systemHealth.overall === "degraded" && " - Some services are experiencing issues"}
          </AlertDescription>
        </Alert>
      )}

      {/* System Metrics */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(systemHealth.overall)}
                    <Badge className={getStatusColor(systemHealth.overall)}>{systemHealth.overall}</Badge>
                  </div>
                </div>
                <Monitor className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{systemHealth.metrics.cpu.toFixed(1)}%</p>
                </div>
                <Cpu className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={systemHealth.metrics.cpu} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{systemHealth.metrics.memory.toFixed(1)}%</p>
                </div>
                <MemoryStick className="w-8 h-8 text-purple-600" />
              </div>
              <Progress value={systemHealth.metrics.memory} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(systemHealth.uptime / 3600)}h</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="tests">Integration Tests</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* Service Status */}
          {systemHealth && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {systemHealth.services.map((service) => (
                    <div key={service.service} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getServiceIcon(service.service)}
                          <div>
                            <h4 className="font-semibold capitalize">{service.service}</h4>
                            <p className="text-sm text-gray-600">Response: {service.responseTime}ms</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                      </div>

                      {service.details && (
                        <div className="text-sm text-gray-600">
                          {Object.entries(service.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {service.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {service.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          {/* Integration Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Integration Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.report && (
                  <>
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{testResults.report.summary.totalSuites}</div>
                        <div className="text-sm text-blue-700">Test Suites</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {testResults.report.summary.passedTests}
                        </div>
                        <div className="text-sm text-green-700">Passed</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{testResults.report.summary.failedTests}</div>
                        <div className="text-sm text-red-700">Failed</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {testResults.report.summary.overallCoverage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-700">Coverage</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {testResults.report.suites.map((suite: TestSuite) => (
                        <div key={suite.name} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{suite.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {suite.passedTests}/{suite.totalTests}
                              </Badge>
                              <Badge
                                className={
                                  suite.failedTests > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                }
                              >
                                {suite.failedTests > 0 ? "Failed" : "Passed"}
                              </Badge>
                            </div>
                          </div>
                          <Progress value={(suite.passedTests / suite.totalTests) * 100} className="h-2 mb-2" />
                          <div className="text-sm text-gray-600">
                            Duration: {suite.duration}ms | Coverage: {suite.coverage?.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Testing</h3>
                <p className="text-gray-600 mb-4">
                  Run performance tests to analyze system throughput and response times
                </p>
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Run Performance Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
