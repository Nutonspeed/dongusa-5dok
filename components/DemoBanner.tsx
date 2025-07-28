"use client"

import { useState } from "react"
import { X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { developmentConfig } from "@/lib/development-config"

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(developmentConfig.demo.showBanner)

  if (!isVisible || !developmentConfig.demo.enabled) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4" />
          <span className="text-sm font-medium">
            🚀 Demo Mode: This is a demonstration website with mock data for testing purposes
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="text-white hover:bg-white/20">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
