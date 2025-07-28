"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Database, Mail, Upload, Activity, ChevronDown, ChevronUp } from "lucide-react"

interface ServiceStatus {
  database: "mock" | "real"
  email: "mock" | "real"
  upload: "mock" | "real"
}

const MockServiceIndicator = React.memo(() => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    database: "mock",
    email: "mock",
    upload: "mock",
  })
  const [isLoading, setIsLoading] = useState(false)

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const checkServiceStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/system/status")
      if (response.ok) {
        const data = await response.json()
        setServiceStatus(data.services || serviceStatus)
      }
    } catch (error) {
      console.error("Failed to check service status:", error)
    } finally {
      setIsLoading(false)
    }
  }, [serviceStatus])

  // Check service status on mount
  useEffect(() => {
    checkServiceStatus()
  }, [checkServiceStatus])

  // Memoize service indicators
  const serviceIndicators = useMemo(
    () => [
      {
        name: "ฐานข้อมูล",
        icon: Database,
        status: serviceStatus.database,
        color: serviceStatus.database === "mock" ? "bg-yellow-500" : "bg-green-500",
      },
      {
        name: "อีเมล",
        icon: Mail,
        status: serviceStatus.email,
        color: serviceStatus.email === "mock" ? "bg-yellow-500" : "bg-green-500",
      },
      {
        name: "อัปโหลด",
        icon: Upload,
        status: serviceStatus.upload,
        color: serviceStatus.upload === "mock" ? "bg-yellow-500" : "bg-green-500",
      },
    ],
    [serviceStatus],
  )

  // Don't show in production
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="shadow-lg border-2 border-gray-200 bg-white">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">สถานะระบบ</span>
              <Badge variant="outline" className="text-xs">
                DEV
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleExpanded} className="p-1 h-6 w-6" disabled={isLoading}>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-3 space-y-2 border-t pt-3">
              {serviceIndicators.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <service.icon className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{service.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${service.color}`} />
                    <span className="text-xs text-gray-500">{service.status === "mock" ? "จำลอง" : "จริง"}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkServiceStatus}
                  disabled={isLoading}
                  className="w-full text-xs h-6 bg-transparent"
                >
                  {isLoading ? "กำลังตรวจสอบ..." : "รีเฟรช"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})

MockServiceIndicator.displayName = "MockServiceIndicator"

export default MockServiceIndicator
