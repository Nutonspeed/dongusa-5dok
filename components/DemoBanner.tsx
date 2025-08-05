"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Info } from "lucide-react"

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="text-blue-800">
          🚀 <strong>Demo Mode:</strong> นี่คือเว็บไซต์ทดลอง ข้อมูลทั้งหมดเป็นข้อมูลจำลอง |<strong> Admin:</strong>{" "}
          admin@sofacover.com / admin123
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
