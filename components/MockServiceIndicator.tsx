"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Database, Mail, Upload, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ServiceStatus {
  name: string
  status: "connected" | "mock" | "error"
  icon: React.ElementType
  description: string
}

export function MockServiceIndicator() {
  const [isVisible, setIsVisible] = useState(false)
  const [services, _setServices] = useState<ServiceStatus[]>([
    {
      name: "Database",
      status: "mock",
      icon: Database,
      description: "Using mock data for demonstration",
    },
    {
      name: "Email Service",
      status: "mock",
      icon: Mail,
      description: "Email notifications simulated",
    },
    {
      name: "File Upload",
      status: "mock",
      icon: Upload,
      description: "File uploads simulated locally",
    },
  ])

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setIsVisible(!isVisible)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isVisible])

  // Auto-show in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Show service status (Ctrl+Shift+D)"
        >
          <AlertCircle className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-gray-900 text-white border-gray-700 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Service Status</h3>
            <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white transition-colors">
              ×
            </button>
          </div>

          <div className="space-y-2">
            {services.map((service) => (
              <div key={service.name} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {service.status === "connected" ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : service.status === "mock" ? (
                    <service.icon className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{service.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        service.status === "connected"
                          ? "border-green-400 text-green-400"
                          : service.status === "mock"
                            ? "border-yellow-400 text-yellow-400"
                            : "border-red-400 text-red-400"
                      }`}
                    >
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              Press <kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+D</kbd> to toggle
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
