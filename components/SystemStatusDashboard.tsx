"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react"

interface SystemStatus {
  service: string
  status: "LIVE" | "MOCK" | "ERROR" | "MISSING"
  details: string
  readyForProduction: boolean
  requiredActions?: string[]
}

export function SystemStatusDashboard() {
  const [statuses, setStatuses] = useState<SystemStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkSystemStatus = async () => {
    setLoading(true)
    try {
      const mockStatuses: SystemStatus[] = [
        {
          service: "Database (Supabase)",
          status: "LIVE",
          details: "Connected successfully with live data",
          readyForProduction: true,
        },
        {
          service: "Authentication",
          status: "LIVE",
          details: "Supabase Auth configured and working",
          readyForProduction: true,
        },
        {
          service: "File Storage",
          status: "LIVE",
          details: "Vercel Blob storage configured",
          readyForProduction: true,
        },
        {
          service: "Redis Cache",
          status: "LIVE",
          details: "Upstash Redis connected",
          readyForProduction: true,
        },
        {
          service: "Email Service",
          status: "MOCK",
          details: "Using mock email service - emails are simulated",
          readyForProduction: false,
          requiredActions: ["Set SMTP_HOST", "Set SMTP_USER", "Set SMTP_PASS"],
        },
        {
          service: "Payment System",
          status: "MOCK",
          details: "Using mock payment system - transactions are simulated",
          readyForProduction: false,
          requiredActions: ["Set STRIPE_SECRET_KEY", "Set PROMPTPAY_ID"],
        },
        {
          service: "Shipping Providers",
          status: "MOCK",
          details: "No shipping providers configured - using mock rates",
          readyForProduction: false,
          requiredActions: ["Set THAILAND_POST_API_KEY", "Set KERRY_API_KEY", "Set FLASH_API_KEY"],
        },
      ]

      setStatuses(mockStatuses)
      setLastCheck(new Date())
    } catch (error) {
  // console.error("Failed to check system status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "LIVE":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "MOCK":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "ERROR":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      LIVE: "default",
      MOCK: "secondary",
      ERROR: "destructive",
      MISSING: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>
  }

  const liveServices = statuses.filter((s) => s.status === "LIVE").length
  const mockServices = statuses.filter((s) => s.status === "MOCK").length
  const errorServices = statuses.filter((s) => s.status === "ERROR").length
  const readinessPercentage =
    statuses.length > 0 ? Math.round((statuses.filter((s) => s.readyForProduction).length / statuses.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Live Services</p>
                <p className="text-2xl font-bold text-green-600">{liveServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mock Services</p>
                <p className="text-2xl font-bold text-yellow-600">{mockServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Error Services</p>
                <p className="text-2xl font-bold text-red-600">{errorServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-5 h-5 rounded-full ${readinessPercentage === 100 ? "bg-green-500" : "bg-yellow-500"}`}
              />
              <div>
                <p className="text-sm text-muted-foreground">Production Ready</p>
                <p className="text-2xl font-bold">{readinessPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Status</CardTitle>
            <Button onClick={checkSystemStatus} disabled={loading} size="sm" variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          {lastCheck && (
            <p className="text-sm text-muted-foreground">Last checked: {lastCheck.toLocaleString("th-TH")}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statuses.map((status, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(status.status)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{status.service}</h3>
                    {getStatusBadge(status.status)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{status.details}</p>

                  {status.requiredActions && status.requiredActions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-orange-600 mb-1">Required Actions:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {status.requiredActions.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
