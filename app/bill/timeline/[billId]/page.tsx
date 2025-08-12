"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react"
import { type Order, OrderStatus, getOrderById, statusLabelTH } from "@/lib/mock-orders"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const statusIcons: Record<OrderStatus, any> = {
  [OrderStatus.PENDING]: Clock,
  [OrderStatus.PENDING_PAYMENT]: Clock,
  [OrderStatus.PAID]: CheckCircle,
  [OrderStatus.IN_PRODUCTION]: Package,
  [OrderStatus.READY_TO_SHIP]: Package,
  [OrderStatus.SHIPPED]: Truck,
  [OrderStatus.DONE]: CheckCircle,
  [OrderStatus.CANCELLED]: XCircle,
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [OrderStatus.PENDING_PAYMENT]: "bg-orange-100 text-orange-800 border-orange-200",
  [OrderStatus.PAID]: "bg-green-100 text-green-800 border-green-200",
  [OrderStatus.IN_PRODUCTION]: "bg-blue-100 text-blue-800 border-blue-200",
  [OrderStatus.READY_TO_SHIP]: "bg-purple-100 text-purple-800 border-purple-200",
  [OrderStatus.SHIPPED]: "bg-indigo-100 text-indigo-800 border-indigo-200",
  [OrderStatus.DONE]: "bg-gray-100 text-gray-800 border-gray-200",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
}

export default function BillTimelinePage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [params.billId])

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(params.billId as string)
      setOrder(orderData)
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูล</h1>
          <p className="text-gray-600">ไม่สามารถค้นหาออร์เดอร์ที่ระบุได้</p>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={`/bill/view/${order.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปดูบิล
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-burgundy-800 mb-2">ติดตามสถานะออร์เดอร์</h1>
          <p className="text-gray-600">ออร์เดอร์ {order.id}</p>

          <div className="flex items-center justify-center gap-2 mt-4">
            <StatusIcon className="w-5 h-5" />
            <Badge className={statusColors[order.status]}>{statusLabelTH[order.status]}</Badge>
          </div>
        </div>

        {/* Current Status Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-burgundy-50">
            <CardTitle className="text-burgundy-800 text-center">สถานะปัจจุบัน</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusColors[order.status]}`}
              >
                <StatusIcon className="w-6 h-6" />
                <span className="font-semibold text-lg">{statusLabelTH[order.status]}</span>
              </div>

              <p className="text-gray-600 mt-4">
                อัปเดตล่าสุด:{" "}
                {order.updatedAt.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {order.shippingInfo?.trackingNumber && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">เลขพัสดุ</p>
                  <p className="font-mono text-lg text-blue-900">{order.shippingInfo.trackingNumber}</p>
                  <p className="text-sm text-blue-600 mt-1">ขนส่งโดย {order.shippingInfo.provider}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="shadow-lg">
          <CardHeader className="bg-burgundy-50">
            <CardTitle className="text-burgundy-800">ประวัติการดำเนินงาน</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {order.timeline.map((event, index) => {
                const EventIcon = statusIcons[event.status]
                const isLatest = index === 0

                return (
                  <div key={event.id} className="relative">
                    {/* Timeline line */}
                    {index < order.timeline.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-300"></div>
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-full border-2 ${
                          isLatest ? statusColors[event.status] : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        <EventIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${isLatest ? "text-burgundy-800" : "text-gray-700"}`}>
                            {statusLabelTH[event.status]}
                          </h3>
                          {isLatest && (
                            <Badge variant="secondary" className="text-xs">
                              ล่าสุด
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {event.timestamp.toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {event.notes && (
                          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="shadow-lg mt-6">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">ต้องการสอบถามเพิ่มเติม?</h3>
            <p className="text-gray-600 text-sm mb-4">ติดต่อเราได้ตลอด 24 ชั่วโมง</p>
            <div className="flex justify-center gap-4 text-sm">
              <span>📞 02-123-4567</span>
              <span>📱 Line: @sofacover</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
