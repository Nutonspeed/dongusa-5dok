"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ExternalLink, Check } from "lucide-react"
import { toast } from "sonner"
import { conversionTracker } from "@/lib/conversion-tracking"

interface FabricMessengerButtonProps {
  fabricId: string
  fabricName: string
  collectionName: string
  imageUrl?: string
  price?: string
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
}

export default function FabricMessengerButton({
  fabricId,
  fabricName,
  collectionName,
  imageUrl,
  price,
  className = "",
  size = "md",
  variant = "default",
}: FabricMessengerButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSendToMessenger = async () => {
    setIsLoading(true)

    try {
      // สร้าง session ID สำหรับติดตาม
      const sessionId = conversionTracker.constructor.generateSessionId()

      // ติดตามการดูลายผ้า
      await conversionTracker.trackFabricView(fabricId, fabricName, collectionName, sessionId)

      // ส่งข้อมูลไปยัง API
      const response = await fetch("/api/messenger/fabric-select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fabricId,
          fabricName,
          collectionName,
          imageUrl,
          price,
          customerMessage: `สนใจลายผ้า "${fabricName}" จากคอลเลกชัน "${collectionName}" ครับ/ค่ะ`,
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // เปิด Messenger ในแท็บใหม่
        window.open(data.messengerUrl, "_blank")

        setIsSent(true)
        toast.success("ส่งลายผ้าไปยัง Messenger แล้ว!")

        // รีเซ็ตสถานะหลัง 3 วินาที
        setTimeout(() => setIsSent(false), 3000)
      } else {
        throw new Error(data.error || "Failed to send fabric")
      }
    } catch (error) {
      console.error("Error sending fabric to Messenger:", error)
      toast.error("ไม่สามารถส่งลายผ้าได้ กรุณาลองใหม่")
    } finally {
      setIsLoading(false)
    }
  }

  const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <Button
      onClick={handleSendToMessenger}
      disabled={isLoading}
      variant={variant}
      className={`${buttonSizes[size]} ${className} transition-all duration-200`}
    >
      {isLoading ? (
        <>
          <div
            className={`${iconSizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent mr-2`}
          />
          กำลังส่ง...
        </>
      ) : isSent ? (
        <>
          <Check className={`${iconSizes[size]} mr-2`} />
          ส่งแล้ว!
        </>
      ) : (
        <>
          <MessageCircle className={`${iconSizes[size]} mr-2`} />
          ส่งไปยัง Messenger
          <ExternalLink className={`${iconSizes[size]} ml-1 opacity-70`} />
        </>
      )}
    </Button>
  )
}
