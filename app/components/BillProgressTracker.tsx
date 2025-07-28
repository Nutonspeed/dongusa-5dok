"use client"

import type { BillProgress } from "@/lib/types/bill"
import { formatDateTime } from "@/lib/utils"
import { CheckCircle, Clock, Package, Scissors, Truck, Home } from "lucide-react"

interface BillProgressTrackerProps {
  progress: BillProgress[]
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Order Received",
    labelTh: "รับคำสั่งซื้อ",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  confirmed: {
    icon: CheckCircle,
    label: "Order Confirmed",
    labelTh: "ยืนยันคำสั่งซื้อ",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  tailoring: {
    icon: Scissors,
    label: "Tailoring",
    labelTh: "กำลังตัดเย็บ",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  packing: {
    icon: Package,
    label: "Packing",
    labelTh: "กำลังแพ็ค",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    labelTh: "จัดส่งแล้ว",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  delivered: {
    icon: Home,
    label: "Delivered",
    labelTh: "ส่งถึงแล้ว",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    labelTh: "เสร็จสิ้น",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
}

export default function BillProgressTracker({ progress }: BillProgressTrackerProps) {
  const sortedProgress = [...progress].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const currentStatus = sortedProgress[sortedProgress.length - 1]?.status || "pending"
  const allStatuses = ["pending", "confirmed", "tailoring", "packing", "shipped", "delivered", "completed"]
  const currentIndex = allStatuses.indexOf(currentStatus)

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {allStatuses.map((status, index) => {
            const config = statusConfig[status as keyof typeof statusConfig]
            const Icon = config.icon
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex

            return (
              <div key={status} className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? `${config.bgColor} ${config.color} border-current`
                      : "bg-gray-100 text-gray-400 border-gray-300"
                  } ${isCurrent ? "ring-4 ring-opacity-20 ring-current" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                    {config.labelTh}
                  </p>
                </div>

                {/* Connection Line */}
                {index < allStatuses.length - 1 && (
                  <div
                    className={`absolute top-5 left-10 w-full h-0.5 ${
                      index < currentIndex ? "bg-green-400" : "bg-gray-300"
                    }`}
                    style={{ width: "calc(100vw / 7 - 2.5rem)" }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Details */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Progress History</h4>
        <div className="space-y-3">
          {sortedProgress.map((item, index) => {
            const config = statusConfig[item.status as keyof typeof statusConfig]
            const Icon = config.icon

            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{config.labelTh}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(item.timestamp)}</p>
                  </div>
                  {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
                  {item.updatedBy && <p className="text-xs text-gray-500 mt-1">Updated by: {item.updatedBy}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
