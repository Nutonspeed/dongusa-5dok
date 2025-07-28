"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  MemoryStickIcon as Memory,
  Zap,
  TrendingUp,
  RefreshCw,
  Play,
  Square,
  BarChart3,
  Settings,
  Cpu,
  HardDrive,
  Network,
  Eye,
} from "lucide-react"

interface PerformanceData {
  health: any
  stats: any
  optimizations: any
  recommendations: any
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [monitoring, setMonitoring] = useState(false)
  const [testRunning, setTestRunning] = useState(false)

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    setLoading(true)
    try {
      // Simulate loading performance data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data - in real implementation, this would come from the performance monitor
      const mockData = {
        health: {
          overall: "healthy",
          database: {
            status: "healthy",
            responseTime: 245,
            errorRate: 1.2,
            throughput: 45.8,
          },
          memory: {
            used: 156 * 1024 * 1024,
            available: 1024 * 1024 * 1024,
            percentage: 15.2,
          },
          performance: {
            averageResponseTime: 189,
            slowestOperations: [
              { operation: "getAnalytics", duration: 456, timestamp: new Date().toISOString() },
              { operation: "createOrder", duration: 234, timestamp: new Date().toISOString() },
            ],
            fastestOperations: [
              { operation: "getProducts", duration: 89, timestamp: new Date().toISOString() },
              { operation: "getCustomers", duration: 67, timestamp: new Date().toISOString() },
            ],
          },
          recommendations: [
            "Consider implementing caching for analytics queries",
            "Monitor memory usage during peak hours",
          ],
        },
        stats: {
          totalOperations: 1247,
          uniqueOperations: 12,
          averageResponseTime: 189,
          errorRate: 1.2,
          operationBreakdown: [
            { operation: "getProducts", count: 456, averageTime: 89, errorRate: 0.5, totalTime: 40584 },
            { operation: "getOrders", count: 234, averageTime: 156, errorRate: 1.2, totalTime: 36504 },
            { operation: "getAnalytics", count: 89, averageTime: 456, errorRate: 2.1, totalTime: 40584 },
          ],
        },
        optimizations: [
          {
            id: "query_cache",
            name: "Query Result Caching",
            status: "available",
            estimatedImpact: "50-70% response time reduction",
            priority: "high",
          },
          {
            id: "memory_pool",
            name: "Object Pooling",
            status: "applied",
            estimatedImpact: "20-30% memory reduction",
            priority: "medium",
          },
        ],
        recommendations: {
          immediate: [
            { name: "Implement Query Caching", priority: "high", estimatedImpact: "50-70% improvement" },
            { name: "Optimize Slow Queries", priority: "high", estimatedImpact: "40-60% improvement" },
          ],
          planned: [
            { name: "Memory Optimization", priority: "medium", estimatedImpact: "20-30% improvement" },
            { name: "Request Batching", priority: "medium", estimatedImpact: "30-40% improvement" },
          ],
          monitoring: ["Database response time", "Memory usage patterns", "Error rates and types"],
        },
      }

      setData(mockData)
    } catch (error) {
      console.error("Failed to load performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const runPerformanceTest = async () => {
    setTestRunning(true)
    try {
      // Simulate running performance test
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await loadPerformanceData()
    } finally {
      setTestRunning(false)
    }
  }

  const toggleMonitoring = () => {
    setMonitoring(!monitoring)
    // In real implementation, this would start/stop the performance monitor
  }

  const applyOptimization = async (optimizationId: string) => {
    try {
      // Simulate applying optimization
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await loadPerformanceData()
    } catch (error) {
      console.error("Failed to apply optimization:", error)
    }
  }

  const getHealthColor = (status: string) => {
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

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading performance data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load performance data. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and optimize system performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={monitoring ? "default" : "outline"} className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {monitoring ? "Monitoring Active" : "Monitoring Inactive"}
          </Badge>
          <Button onClick={toggleMonitoring} variant="outline" size="sm">
            {monitoring ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {monitoring ? "Stop" : "Start"} Monitoring
          </Button>
          <Button onClick={loadPerformanceData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            {getHealthIcon(data.health.overall)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(data.health.overall)}`}>
              {data.health.overall.charAt(0).toUpperCase() + data.health.overall.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">System status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.health.performance.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.health.memory.percentage.toFixed(1)}%</div>
            <Progress value={data.health.memory.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {(data.health.memory.used / 1024 / 1024).toFixed(0)}MB used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(data.health.database.status)}`}>
              {data.health.database.status.charAt(0).toUpperCase() + data.health.database.status.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.health.database.responseTime}ms avg, {data.health.database.errorRate}% errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Alert */}
      {data.health.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Performance Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {data.health.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="operations">
            <Activity className="h-4 w-4 mr-2" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="optimizations">
            <Zap className="h-4 w-4 mr-2" />
            Optimizations
          </TabsTrigger>
          <TabsTrigger value="testing">
            <Play className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Eye className="h-4 w-4 mr-2" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Operations</span>
                  <span className="font-bold">{data.stats.totalOperations.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <span className="font-bold">{data.stats.averageResponseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="font-bold">{data.stats.errorRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Throughput</span>
                  <span className="font-bold">{data.health.database.throughput} ops/min</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      CPU Usage
                    </span>
                    <span className="font-bold">12%</span>
                  </div>
                  <Progress value={12} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Memory className="h-4 w-4" />
                      Memory Usage
                    </span>
                    <span className="font-bold">{data.health.memory.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.health.memory.percentage} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Storage Usage
                    </span>
                    <span className="font-bold">34%</span>
                  </div>
                  <Progress value={34} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Network Usage
                    </span>
                    <span className="font-bold">8%</span>
                  </div>
                  <Progress value={8} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Slowest Operations</CardTitle>
                <CardDescription>Operations that need optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.health.performance.slowestOperations.map((op, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{op.operation}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(op.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{op.duration}ms</Badge>
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operation Breakdown</CardTitle>
                <CardDescription>Performance by operation type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.stats.operationBreakdown.map((op, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{op.operation}</span>
                        <span className="text-sm text-muted-foreground">{op.count} calls</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Avg: {op.averageTime}ms</span>
                        <span className={op.errorRate > 2 ? "text-red-600" : "text-green-600"}>
                          {op.errorRate}% errors
                        </span>
                      </div>
                      <Progress value={(op.averageTime / 500) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Optimizations</CardTitle>
                <CardDescription>Recommended performance improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.optimizations.map((opt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{opt.name}</div>
                        <div className="text-sm text-muted-foreground">{opt.estimatedImpact}</div>
                        <Badge variant={opt.priority === "high" ? "destructive" : "secondary"} className="mt-1">
                          {opt.priority} priority
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {opt.status === "applied" ? (
                          <Badge variant="default">Applied</Badge>
                        ) : (
                          <Button onClick={() => applyOptimization(opt.id)} size="sm" variant="outline">
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Plan</CardTitle>
                <CardDescription>Recommended implementation order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Immediate Actions</h4>
                    <div className="space-y-2">
                      {data.recommendations.immediate.map((rec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>{rec.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {rec.estimatedImpact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Planned Improvements</h4>
                    <div className="space-y-2">
                      {data.recommendations.planned.map((rec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>{rec.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {rec.estimatedImpact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Continuous Monitoring</h4>
                    <div className="space-y-2">
                      {data.recommendations.monitoring.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Testing</CardTitle>
              <CardDescription>Run comprehensive performance tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={runPerformanceTest}
                  disabled={testRunning}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  {testRunning ? (
                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                  ) : (
                    <Play className="h-6 w-6 mb-2" />
                  )}
                  <span>Run Performance Test</span>
                </Button>

                <Button
                  variant="outline"
                  disabled={testRunning}
                  className="h-20 flex flex-col items-center justify-center bg-transparent"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Load Test</span>
                </Button>

                <Button
                  variant="outline"
                  disabled={testRunning}
                  className="h-20 flex flex-col items-center justify-center bg-transparent"
                >
                  <Memory className="h-6 w-6 mb-2" />
                  <span>Memory Leak Test</span>
                </Button>
              </div>

              {testRunning && (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertTitle>Test Running</AlertTitle>
                  <AlertDescription>
                    Performance test is in progress. This may take a few minutes to complete.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Last Test Run</span>
                        <span className="text-sm font-medium">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Operations Tested</span>
                        <span className="text-sm font-medium">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Response</span>
                        <span className="text-sm font-medium">189ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="text-sm font-medium text-green-600">98.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Benchmarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Database Queries</span>
                        <Badge variant="default">Good</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Memory Usage</span>
                        <Badge variant="default">Good</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Response Time</span>
                        <Badge variant="secondary">Fair</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Error Handling</span>
                        <Badge variant="default">Good</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>Live system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monitoring Status</span>
                    <Badge variant={monitoring ? "default" : "secondary"}>{monitoring ? "Active" : "Inactive"}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>12%</span>
                      </div>
                      <Progress value={12} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{data.health.memory.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={data.health.memory.percentage} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Load</span>
                        <span>23%</span>
                      </div>
                      <Progress value={23} />
                    </div>
                  </div>

                  <Button onClick={toggleMonitoring} className="w-full">
                    {monitoring ? "Stop Monitoring" : "Start Monitoring"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts & Notifications</CardTitle>
                <CardDescription>System alerts and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">System Healthy</div>
                      <div className="text-xs text-muted-foreground">All systems operating normally</div>
                      <div className="text-xs text-muted-foreground">2 minutes ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Slow Query Detected</div>
                      <div className="text-xs text-muted-foreground">Analytics query took 456ms</div>
                      <div className="text-xs text-muted-foreground">15 minutes ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Optimization Applied</div>
                      <div className="text-xs text-muted-foreground">Object pooling optimization enabled</div>
                      <div className="text-xs text-muted-foreground">1 hour ago</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
