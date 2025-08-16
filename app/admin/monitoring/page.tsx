"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface HealthStatus {
  status: string
  timestamp: string
  database: boolean
  api: boolean
  storage: boolean
  version: string
  environment: string
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealthStatus(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to fetch health status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "unhealthy":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getComponentStatus = (isHealthy: boolean) => {
    return isHealthy ? "ปกติ" : "มีปัญหา"
  }

  const getComponentBadge = (isHealthy: boolean) => {
    return isHealthy ? "default" : "destructive"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Monitoring Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString("th-TH")}</span>
          <Button onClick={fetchHealthStatus} variant="outline" size="sm">
            รีเฟรช
          </Button>
        </div>
      </div>

      {healthStatus && (
        <>
          {/* Overall Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(healthStatus.status)}`}></div>
                สถานะระบบโดยรวม
              </CardTitle>
              <CardDescription>
                Environment: {healthStatus.environment} | Version: {healthStatus.version}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthStatus.status === "healthy" ? "✅ ระบบทำงานปกติ" : "⚠️ ระบบมีปัญหา"}
              </div>
            </CardContent>
          </Card>

          {/* Component Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Database</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getComponentBadge(healthStatus.database)}>
                  {getComponentStatus(healthStatus.database)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getComponentBadge(healthStatus.api)}>{getComponentStatus(healthStatus.api)}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getComponentBadge(healthStatus.storage)}>
                  {getComponentStatus(healthStatus.storage)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการด่วน</CardTitle>
              <CardDescription>เครื่องมือสำหรับการจัดการระบบหลัง production launch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="w-full bg-transparent">
                  ดู Error Logs
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Performance Report
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  User Feedback
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  System Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
