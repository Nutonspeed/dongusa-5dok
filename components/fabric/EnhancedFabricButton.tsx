"use client"

import { useState } from "react"
import { ExternalLink, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { messengerService } from "@/lib/messenger-integration"
import { conversionTracker, ConversionTrackingService } from "@/lib/conversion-tracking"

interface FabricPattern {
  id: string
  name: string
  collectionName: string
  image: string
  price: string
  texture: string
}

interface EnhancedFabricButtonProps {
  fabric: FabricPattern
  onFavorite?: (fabricId: string) => void
  isFavorite?: boolean
  className?: string
}

export default function EnhancedFabricButton({
  fabric,
  onFavorite,
  isFavorite = false,
  className = "",
}: EnhancedFabricButtonProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const sessionId = ConversionTrackingService.generateSessionId()

  const handleFabricSelect = async () => {
    setIsLoading(true)

    try {
      // Track conversion event
      await conversionTracker.trackEvent({
        eventType: "fabric_select",
        userId: ConversionTrackingService.getUserId(),
        sessionId,
        timestamp: new Date(),
        data: {
          fabricId: fabric.id,
          fabricName: fabric.name,
          collectionName: fabric.collectionName,
          source: "gallery",
        },
      })

      // Send to messenger
      const messengerUrl = await messengerService.sendFabricSelection({
        fabricId: fabric.id,
        fabricName: fabric.name,
        collectionName: fabric.collectionName,
        imageUrl: fabric.image,
        price: fabric.price,
        customerMessage: `สนใจลายผ้า "${fabric.name}" จากคอลเลกชัน ${fabric.collectionName} ครับ/ค่ะ`,
      })

      // Open messenger
      window.open(messengerUrl, "_blank")

      toast({
        title: "ส่งข้อความสำเร็จ",
        description: `ส่งลายผ้า "${fabric.name}" ไปยัง Messenger แล้ว`,
      })
    } catch (error) {
      console.error("Error sending fabric selection:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFabricView = async () => {
    // Track fabric view event
    await conversionTracker.trackEvent({
      eventType: "fabric_view",
      userId: ConversionTrackingService.getUserId(),
      sessionId,
      timestamp: new Date(),
      data: {
        fabricId: fabric.id,
        fabricName: fabric.name,
        collectionName: fabric.collectionName,
        source: "gallery",
      },
    })
  }

  const handleShare = async () => {
    const shareData = {
      title: `${fabric.name} - ${fabric.collectionName}`,
      text: `ดูลายผ้าสวยๆ "${fabric.name}" จากคอลเลกชัน ${fabric.collectionName}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast({
          title: "แชร์สำเร็จ",
          description: "แชร์ลายผ้าเรียบร้อยแล้ว",
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      toast({
        title: "คัดลอกลิงก์สำเร็จ",
        description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      })
    }
  }

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(fabric.id)
      toast({
        title: isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด",
        description: `${fabric.name} ${isFavorite ? "ถูกลบออกจาก" : "ถูกเพิ่มใน"}รายการโปรดแล้ว`,
      })
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Action Button */}
      <Button
        onClick={handleFabricSelect}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
        onMouseEnter={handleFabricView}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            กำลังส่ง...
          </div>
        ) : (
          <>
            ส่งไปยัง Messenger
            <ExternalLink className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFavorite}
          className={`flex-1 ${isFavorite ? "text-red-500 border-red-200" : ""}`}
        >
          <Heart className={`w-4 h-4 mr-1 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "ลบโปรด" : "ถูกใจ"}
        </Button>

        <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 bg-transparent">
          <Share2 className="w-4 h-4 mr-1" />
          แชร์
        </Button>
      </div>

      {/* Fabric Info */}
      <div className="text-xs text-gray-500 text-center">
        <p className="font-medium text-gray-700">{fabric.name}</p>
        <p>
          {fabric.collectionName} • {fabric.texture}
        </p>
        <p className="font-semibold text-green-600">{fabric.price}</p>
      </div>
    </div>
  )
}
