"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { errorHandler } from "@/lib/error-handler"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    errorHandler.logError({
      message: error.message,
      stack: error.stack,
      type: "javascript",
      severity: "high",
      context: {
        digest: error.digest,
        component: "app/error.tsx",
      },
    })
  }, [error])

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">เกิดข้อผิดพลาด</CardTitle>
          <CardDescription>ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
              <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
              {error.digest && <p className="text-xs text-red-600 mt-1">Digest: {error.digest}</p>}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              ลองใหม่
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full bg-transparent">
              <Home className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
