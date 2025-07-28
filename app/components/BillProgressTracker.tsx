"use client"

import React from "react"

import type { BillProgress } from "@/lib/types/bill"
import { formatDateTime, formatTimeAgo } from "@/lib/utils"
import { CheckCircle, Clock, Package, Scissors, Truck, Home, User, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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
    description: "Your order has been received and is being processed",
  },
  confirmed: {
    icon: CheckCircle,
    label: "Order Confirmed",
    labelTh: "ยืนยันคำสั่งซื้อ",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Your order has been confirmed and approved",
  },
  tailoring: {
    icon: Scissors,
    label: "Tailoring",
    labelTh: "กำลังตัดเย็บ",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Your custom sofa cover is being tailored",
  },
  packing: {
    icon: Package,
    label: "Packing",
    labelTh: "กำลังแพ็ค",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Your order is being carefully packed for shipment",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    labelTh: "จัดส่งแล้ว",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    description: "Your order is on its way to you",
  },
  delivered: {
    icon: Home,
    label: "Delivered",
    labelTh: "ส่งถึงแล้ว",
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Your order has been delivered successfully",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    labelTh: "เสร็จสิ้น",
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Order completed successfully",
  },
}

export default function BillProgressTracker({ progress }: BillProgressTrackerProps) {
  const sortedProgress = [...progress].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const currentStatus = sortedProgress[sortedProgress.length - 1]?.status || "pending"
  const allStatuses = ["pending", "confirmed", "tailoring", "packing", "shipped", "delivered", "completed"]
  const currentIndex = allStatuses.indexOf(currentStatus)

  const progressPercentage = ((currentIndex + 1) / allStatuses.length) * 100

  const getEstimatedTime = (status: string, progressItem?: BillProgress) => {
    if (progressItem?.estimatedCompletion) {
      const now = new Date()
      const estimated = new Date(progressItem.estimatedCompletion)
      if (estimated > now) {
        const diffHours = Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60 * 60))
        if (diffHours < 24) {
          return `Est. ${diffHours}h remaining`
        } else {
          const diffDays = Math.ceil(diffHours / 24)
          return `Est. ${diffDays} days remaining`
        }
      }
    }
    return null
  }

  const isDelayed = (progressItem: BillProgress) => {
    if (progressItem.estimatedCompletion && !progressItem.actualCompletion) {
      return new Date() > new Date(progressItem.estimatedCompletion)
    }
    return false
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Overall Progress</h4>
          <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Status Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {allStatuses.map((status, index) => {
            const config = statusConfig[status as keyof typeof statusConfig]
            const Icon = config.icon
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex
            const progressItem = sortedProgress.find((p) => p.status === status)

            return (
              <div key={status} className="flex flex-col items-center relative flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? `${config.bgColor} ${config.color} border-current shadow-sm`
                      : "bg-gray-100 text-gray-400 border-gray-300"
                  } ${isCurrent ? "ring-4 ring-opacity-20 ring-current scale-110" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="mt-2 text-center max-w-20">
                  <p className={`text-xs font-medium ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                    {config.labelTh}
                  </p>
                  {progressItem && (
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(progressItem.timestamp)}</p>
                  )}
                </div>

                {/* Connection Line */}
                {index < allStatuses.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 h-0.5 transition-all duration-300 ${
                      index < currentIndex ? "bg-green-400" : "bg-gray-300"
                    }`}
                    style={{
                      width: "calc(100% - 2.5rem)",
                      marginLeft: "1.25rem",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Status Details */}
      {currentStatus && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig[currentStatus as keyof typeof statusConfig].bgColor}`}
            >
              {React.createElement(statusConfig[currentStatus as keyof typeof statusConfig].icon, {
                className: `w-4 h-4 ${statusConfig[currentStatus as keyof typeof statusConfig].color}`,
              })}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {statusConfig[currentStatus as keyof typeof statusConfig].labelTh}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {statusConfig[currentStatus as keyof typeof statusConfig].description}
              </p>

              {/* Estimated Time */}
              {(() => {
                const currentProgressItem = sortedProgress.find((p) => p.status === currentStatus)
                const estimatedTime = getEstimatedTime(currentStatus, currentProgressItem)
                const delayed = currentProgressItem && isDelayed(currentProgressItem)

                return (
                  <div className="flex items-center space-x-2 mt-2">
                    {estimatedTime && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {estimatedTime}
                      </Badge>
                    )}
                    {delayed && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Delayed
                      </Badge>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Progress History */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Progress History</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {sortedProgress.map((item, index) => {
            const config = statusConfig[item.status as keyof typeof statusConfig]
            const Icon = config.icon
            const delayed = isDelayed(item)

            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white border rounded-lg">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{config.labelTh}</p>
                    <div className="flex items-center space-x-2">
                      {delayed && <Badge className="bg-red-100 text-red-800 text-xs">Delayed</Badge>}
                      <p className="text-sm text-gray-500">{formatDateTime(item.timestamp)}</p>
                    </div>
                  </div>
                  {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}

                  {/* Timing Information */}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {item.estimatedCompletion && (
                      <span>Est. completion: {formatDateTime(item.estimatedCompletion)}</span>
                    )}
                    {item.actualCompletion && (
                      <span className="text-green-600">Completed: {formatDateTime(item.actualCompletion)}</span>
                    )}
                    {item.updatedBy && (
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>by {item.updatedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
