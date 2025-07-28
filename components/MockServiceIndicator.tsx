"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { developmentConfig, devUtils } from "@/lib/development-config"
import { Database, Mail, Upload, Settings, X } from "lucide-react"

export default function MockServiceIndicator() {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!developmentConfig.demo.showIndicators) {
    return null
  }

  const serviceStatus = devUtils.getServiceStatus()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-1" />
          Mock Services
        </Button>
      ) : (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Service Status</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span className="text-sm">Database</span>
              </div>
              <Badge variant={serviceStatus.database === "mock" ? "secondary" : "default"}>
                {serviceStatus.database}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <Badge variant={serviceStatus.email === "mock" ? "secondary" : "default"}>{serviceStatus.email}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload</span>
              </div>
              <Badge variant={serviceStatus.upload === "mock" ? "secondary" : "default"}>{serviceStatus.upload}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
