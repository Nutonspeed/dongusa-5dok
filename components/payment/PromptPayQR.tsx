"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, RefreshCw, Clock, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { usePromptPayQR } from "@/hooks/use-payment"
import { formatCurrency } from "@/lib/money"

interface PromptPayQRProps {
  amount: number
  orderId: string
  onPaymentComplete?: () => void
}

export default function PromptPayQR({ amount, orderId, onPaymentComplete }: PromptPayQRProps) {
  const { qrCode, loading, error, generateQR, clearQR } = usePromptPayQR()
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    generateQR(amount, orderId)
    return () => clearQR()
  }, [amount, orderId])

  useEffect(() => {
    if (qrCode) {
      const expiresAt = new Date(qrCode.expires_at).getTime()
      const updateTimer = () => {
        const now = Date.now()
        const remaining = Math.max(0, expiresAt - now)
        setTimeLeft(remaining)

        if (remaining === 0) {
          toast.error("QR Code หมดอายุแล้ว กรุณาสร้างใหม่")
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [qrCode])

  const handleCopyReference = async () => {
    if (!qrCode) return

    try {
      await navigator.clipboard.writeText(qrCode.reference)
      setCopied(true)
      toast.success("คัดลอกหมายเลขอ้างอิงแล้ว")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("ไม่สามารถคัดลอกได้")
    }
  }

  const handleRefreshQR = () => {
    generateQR(amount, orderId)
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังสร้าง QR Code...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !qrCode) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "ไม่สามารถสร้าง QR Code ได้"}</p>
            <Button onClick={handleRefreshQR} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              ลองใหม่
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            ชำระเงินผ่าน PromptPay
          </div>
          {timeLeft > 0 && (
            <Badge variant="outline" className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
              <img
                src={qrCode.qr_code || "/placeholder.svg"}
                alt="PromptPay QR Code"
                className="w-48 h-48 mx-auto"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          {/* Amount */}
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">ยอดที่ต้องชำระ</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(amount)}</p>
          </div>

          {/* Reference Number */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">หมายเลขอ้างอิง</p>
            <div className="flex items-center justify-center space-x-2">
              <code className="text-lg font-mono font-bold text-gray-900">{qrCode.reference}</code>
              <Button size="sm" variant="ghost" onClick={handleCopyReference}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-left space-y-3 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900">วิธีการชำระเงิน:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  1
                </span>
                เปิดแอปธนาคารหรือแอป Mobile Banking
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  2
                </span>
                เลือกเมนู "สแกน QR" หรือ "PromptPay"
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  3
                </span>
                สแกน QR Code ด้านบน
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  4
                </span>
                ตรวจสอบยอดเงินและหมายเลขอ้างอิง
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  5
                </span>
                กดยืนยันการโอนเงิน
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button onClick={handleRefreshQR} variant="outline" className="flex-1 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              สร้าง QR ใหม่
            </Button>
            {onPaymentComplete && (
              <Button onClick={onPaymentComplete} className="flex-1">
                ชำระเงินแล้ว
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 pt-4 border-t">
            <p>QR Code นี้จะหมดอายุใน 30 นาที</p>
            <p>หากมีปัญหาการชำระเงิน กรุณาติดต่อ 02-123-4567</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
