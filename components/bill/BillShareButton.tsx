"use client"

import { useState } from "react"
import { Copy, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { messengerService } from "@/lib/messenger-integration"
import { conversionTracker, ConversionTrackingService } from "@/lib/conversion-tracking"

interface Bill {
  id: string
  customerName: string
  totalAmount: number
  status: string
}

interface BillShareButtonProps {
  bill: Bill
  className?: string
}

export default function BillShareButton({ bill, className = "" }: BillShareButtonProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const sessionId = ConversionTrackingService.generateSessionId()

  const handleShareToMessenger = async () => {
    setIsLoading(true)

    try {
      // Track conversion event
      await conversionTracker.trackEvent({
        eventType: "bill_share",
        userId: ConversionTrackingService.getUserId(),
        sessionId,
        timestamp: new Date(),
        data: {
          billId: bill.id,
          customerName: bill.customerName,
          amount: bill.totalAmount,
          source: "direct",
        },
      })

      // Create bill URL
      const billUrl = `${window.location.origin}/bill/view/${bill.id}`

      // Send to messenger
      const messengerUrl = await messengerService.sendBillToMessenger({
        billId: bill.id,
        customerName: bill.customerName,
        totalAmount: bill.totalAmount,
        billUrl,
        customMessage: `สวัสดีครับ/ค่ะ คุณ${bill.customerName} ขอส่งบิลสำหรับการสั่งซื้อครับ/ค่ะ`,
      })

      // Open messenger
      window.open(messengerUrl, "_blank")

      toast({
        title: "ส่งบิลสำเร็จ",
        description: `ส่งบิล ${bill.id} ไปยัง Messenger แล้ว`,
      })
    } catch (error) {
      console.error("Error sharing bill:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งบิลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    const billUrl = `${window.location.origin}/bill/view/${bill.id}`

    try {
      await navigator.clipboard.writeText(billUrl)
      toast({
        title: "คัดลอกลิงก์สำเร็จ",
        description: "ลิงก์บิลถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      })

      // Track link copy event
      await conversionTracker.trackEvent({
        eventType: "bill_view",
        userId: ConversionTrackingService.getUserId(),
        sessionId,
        timestamp: new Date(),
        data: {
          billId: bill.id,
          customerName: bill.customerName,
          amount: bill.totalAmount,
          source: "direct",
          action: "copy_link",
        },
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกลิงก์ได้",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button onClick={handleShareToMessenger} disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            กำลังส่ง...
          </div>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 mr-2" />
            ส่งไปยัง Messenger
          </>
        )}
      </Button>

      <Button variant="outline" onClick={handleCopyLink} className="flex-1 bg-transparent">
        <Copy className="w-4 h-4 mr-2" />
        คัดลอกลิงก์
      </Button>
    </div>
  )
}
