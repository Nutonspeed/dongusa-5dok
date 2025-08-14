"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  OrderStatus,
  statusBadgeVariant,
  statusToTH,
  statusFromString,
} from "@/lib/i18n/status"

type TimelineEvent = {
  id: string
  status: string
  timestamp: string
  notes?: string
}

type Bill = {
  id: string
  code?: string
  customer_name: string
  status: string
  updated_at: string
  history?: TimelineEvent[]
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  production: Package,
  ready: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const productionSubSteps = [
  { id: "cutting", name: "กำลังตัดผ้า", icon: "✂️", completed: true },
  { id: "sewing", name: "กำลังเย็บ", icon: "🧵", completed: true },
  { id: "qc", name: "ตรวจสอบคุณภาพ", icon: "🔍", completed: false },
  { id: "packing", name: "พร้อมแพ็ก", icon: "📦", completed: false },
]

export default function BillTimelinePage() {
  const { billId } = useParams() as { billId: string }
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function loadBill() {
      try {
        setLoading(true)
        const res = await fetch(`/api/bills/${billId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load bill")
        const data = await res.json()
        if (alive) setBill(data)
      } catch (error) {
        console.error("Error loading bill:", error)
        toast.error("โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadBill()
    return () => {
      alive = false
    }
  }, [billId])

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

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูล</h1>
          <p className="text-gray-600">ไม่สามารถค้นหาออร์เดอร์ที่ระบุได้</p>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[bill.status] || Clock
  const timeline = bill.history || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={`/bill/view/${bill.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปดูบิล
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-burgundy-800 mb-2">ติดตามสถานะออร์เดอร์</h1>
          <p className="text-gray-600">ออร์เดอร์ {bill.code || bill.id}</p>

          <div className="flex items-center justify-center gap-2 mt-4">
            {(() => {
              const statusEnum =
                statusFromString(bill.status) ?? OrderStatus.PENDING_PAYMENT
              return (
                <>
                  <StatusIcon className="w-5 h-5" />
                  <Badge variant={statusBadgeVariant(statusEnum)}>
                    {statusToTH(statusEnum)}
                  </Badge>
                </>
              )
            })()}
          </div>
        </div>

        {/* Current Status Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-burgundy-50">
            <CardTitle className="text-burgundy-800 text-center">สถานะปัจจุบัน</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 bg-burgundy-100 text-burgundy-800 border-burgundy-200">
                <StatusIcon className="w-6 h-6" />
                {(() => {
                  const statusEnum =
                    statusFromString(bill.status) ?? OrderStatus.PENDING_PAYMENT
                  return (
                    <span className="font-semibold text-lg">{statusToTH(statusEnum)}</span>
                  )
                })()}
              </div>

              {bill.status === "production" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">ขั้นตอนการผลิต</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {productionSubSteps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-2 p-2 rounded ${
                          step.completed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className="text-lg">{step.icon}</span>
                        <span className="text-sm font-medium">{step.name}</span>
                        {step.completed && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-600 mt-4">
                อัปเดตล่าสุด:{" "}
                {new Date(bill.updated_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="shadow-lg">
          <CardHeader className="bg-burgundy-50">
            <CardTitle className="text-burgundy-800">ประวัติการดำเนินงาน</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {timeline.length > 0 ? (
              <div className="space-y-6">
                {timeline.map((event, index) => {
                  const EventIcon = statusIcons[event.status] || Clock
                  const isLatest = index === 0

                  return (
                    <div key={event.id} className="relative">
                      {/* Timeline line */}
                      {index < timeline.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-300"></div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-full border-2 ${
                            isLatest
                              ? "bg-burgundy-100 text-burgundy-800 border-burgundy-200"
                              : "bg-gray-100 text-gray-500 border-gray-300"
                          }`}
                        >
                          <EventIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${isLatest ? "text-burgundy-800" : "text-gray-700"}`}>
                              {(() => {
                                const statusEnum = statusFromString(event.status)
                                return statusEnum
                                  ? statusToTH(statusEnum)
                                  : event.status
                              })()}
                            </h3>
                            {isLatest && (
                              <Badge variant="secondary" className="text-xs">
                                ล่าสุด
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(event.timestamp).toLocaleDateString("th-TH", {
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
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีประวัติการดำเนินงาน</h3>
                <p className="text-gray-600">ประวัติจะแสดงเมื่อมีการอัปเดตสถานะ</p>
              </div>
            )}
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
