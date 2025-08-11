"use client"

import { useState } from "react"
import { X, Info, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-burgundy-gradient text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Info className="w-5 h-5 flex-shrink-0" />
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              DEMO
            </Badge>
            <span className="hidden sm:inline">
              This is a demonstration website. All services are simulated for showcase purposes.
            </span>
            <span className="sm:hidden">Demo website - simulated services</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/demo">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 text-xs px-3 py-1">
              <Settings className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Demo Controls</span>
              <span className="sm:hidden">Controls</span>
            </Button>
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
