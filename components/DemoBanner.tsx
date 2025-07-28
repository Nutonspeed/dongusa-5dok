"use client"

import React, { useState, useCallback, useMemo } from "react"
import { X, Info, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const DemoBanner = React.memo(() => {
  const [isVisible, setIsVisible] = useState(true)
  const [showControls, setShowControls] = useState(false)

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev)
  }, [])

  const resetDemo = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.clear()
      window.location.reload()
    }
  }, [])

  // Memoize the banner content
  const bannerContent = useMemo(
    () => (
      <div className="bg-blue-600 text-white py-2 px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <Badge variant="secondary" className="bg-blue-500 text-white border-blue-400">
                DEMO
              </Badge>
            </div>
            <span className="text-sm font-medium">นี่คือเว็บไซต์สาธิต บริการทั้งหมดจำลองขึ้นเพื่อการแสดง</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleControls}
              className="text-white hover:bg-blue-500 p-1"
              aria-label="ควบคุมการสาธิต"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-blue-500 p-1"
              aria-label="ปิด"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Demo Controls */}
        {showControls && (
          <div className="border-t border-blue-500 mt-2 pt-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-sm text-blue-100">ควบคุมการสาธิต:</div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetDemo}
                  className="text-white hover:bg-blue-500 text-xs px-3 py-1"
                >
                  รีเซ็ตข้อมูล
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    [showControls, toggleControls, handleClose, resetDemo],
  )

  if (!isVisible) {
    return null
  }

  return bannerContent
})

DemoBanner.displayName = "DemoBanner"

export default DemoBanner
