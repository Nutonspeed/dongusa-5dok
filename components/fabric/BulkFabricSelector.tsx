"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageCircle, ShoppingCart, X } from "lucide-react"
import { toast } from "sonner"
import { conversionTracker } from "@/lib/conversion-tracking"

interface FabricItem {
  id: string
  name: string
  collectionName: string
  imageUrl?: string
  price?: string
}

interface BulkFabricSelectorProps {
  fabrics: FabricItem[]
  onSelectionChange: (selectedIds: string[]) => void
  className?: string
}

export default function BulkFabricSelector({ fabrics, onSelectionChange, className = "" }: BulkFabricSelectorProps) {
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFabricToggle = (fabricId: string) => {
    const newSelection = selectedFabrics.includes(fabricId)
      ? selectedFabrics.filter((id) => id !== fabricId)
      : [...selectedFabrics, fabricId]

    setSelectedFabrics(newSelection)
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedFabrics.length === fabrics.length) {
      setSelectedFabrics([])
      onSelectionChange([])
    } else {
      const allIds = fabrics.map((f) => f.id)
      setSelectedFabrics(allIds)
      onSelectionChange(allIds)
    }
  }

  const handleSendBulkToMessenger = async () => {
    if (selectedFabrics.length === 0) {
      toast.error("กรุณาเลือกลายผ้าอย่างน้อย 1 ลาย")
      return
    }

    setIsLoading(true)

    try {
      const sessionId = conversionTracker.constructor.generateSessionId()
      const selectedFabricData = fabrics.filter((f) => selectedFabrics.includes(f.id))

      // Track bulk selection
      await conversionTracker.trackEvent({
        eventType: "fabric_select" as any,
        userId: conversionTracker.constructor.getUserId(),
        sessionId,
        timestamp: new Date(),
        data: {
          bulk_selection: true,
          fabric_count: selectedFabrics.length,
          fabric_ids: selectedFabrics,
          fabric_names: selectedFabricData.map((f) => f.name),
          source: "bulk_selector",
        },
      })

      // Send to messenger API
      const response = await fetch("/api/messenger/bulk-fabric-select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fabrics: selectedFabricData,
          sessionId,
          customerMessage: `สนใจลายผ้า ${selectedFabrics.length} ลาย กรุณาแจ้งราคาและรายละเอียดครับ/ค่ะ`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        window.open(data.messengerUrl, "_blank")
        toast.success(`ส่งลายผ้า ${selectedFabrics.length} ลายไปยัง Messenger แล้ว!`)

        // Clear selection
        setSelectedFabrics([])
        onSelectionChange([])
      } else {
        throw new Error(data.error || "Failed to send fabrics")
      }
    } catch (error) {
      console.error("Error sending bulk fabrics:", error)
      toast.error("ไม่สามารถส่งลายผ้าได้ กรุณาลองใหม่")
    } finally {
      setIsLoading(false)
    }
  }

  if (fabrics.length === 0) return null

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={selectedFabrics.length === fabrics.length}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-blue-600"
          />
          <span className="text-sm font-medium">
            เลือกทั้งหมด ({selectedFabrics.length}/{fabrics.length})
          </span>
        </div>

        {selectedFabrics.length > 0 && (
          <Button
            onClick={() => {
              setSelectedFabrics([])
              onSelectionChange([])
            }}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            ล้างการเลือก
          </Button>
        )}
      </div>

      {/* Selected Fabrics Preview */}
      {selectedFabrics.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-2">ลายผ้าที่เลือก ({selectedFabrics.length} ลาย):</div>
          <div className="flex flex-wrap gap-2">
            {selectedFabrics.slice(0, 5).map((fabricId) => {
              const fabric = fabrics.find((f) => f.id === fabricId)
              return fabric ? (
                <span
                  key={fabricId}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {fabric.name}
                  <button onClick={() => handleFabricToggle(fabricId)} className="ml-1 hover:text-blue-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null
            })}
            {selectedFabrics.length > 5 && (
              <span className="text-xs text-blue-600">และอีก {selectedFabrics.length - 5} ลาย...</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          onClick={handleSendBulkToMessenger}
          disabled={selectedFabrics.length === 0 || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              กำลังส่ง...
            </div>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 mr-2" />
              ส่งไปยัง Messenger ({selectedFabrics.length})
            </>
          )}
        </Button>

        <Button
          variant="outline"
          disabled={selectedFabrics.length === 0}
          className="flex-1 bg-transparent"
          onClick={() => {
            // Add to cart functionality (future feature)
            toast.info("ฟีเจอร์เพิ่มลงตะกร้าจะเปิดใช้งานเร็วๆ นี้")
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          เพิ่มลงตะกร้า
        </Button>
      </div>

      {/* Fabric List with Checkboxes */}
      <div className="mt-4 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {fabrics.map((fabric) => (
            <div key={fabric.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <Checkbox
                checked={selectedFabrics.includes(fabric.id)}
                onCheckedChange={() => handleFabricToggle(fabric.id)}
                className="data-[state=checked]:bg-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{fabric.name}</div>
                <div className="text-xs text-gray-500">
                  {fabric.collectionName} • {fabric.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
