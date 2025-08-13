"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Truck, Clock, CheckCircle, XCircle, MessageSquare, Printer, Copy } from "lucide-react"
import {
  type Order,
  OrderStatus,
  getOrderById,
  updateOrderStatus,
} from "@/lib/mock-orders"
import { statusLabelTH, channelLabelTH } from "@/lib/i18n/status"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
  type MoneyLineItem,
} from "@/lib/money"

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.PENDING_PAYMENT]: "bg-orange-100 text-orange-800",
  [OrderStatus.PAID]: "bg-green-100 text-green-800",
  [OrderStatus.IN_PRODUCTION]: "bg-blue-100 text-blue-800",
  [OrderStatus.READY_TO_SHIP]: "bg-purple-100 text-purple-800",
  [OrderStatus.SHIPPED]: "bg-indigo-100 text-indigo-800",
  [OrderStatus.DONE]: "bg-gray-100 text-gray-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
}

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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
const [order, setOrder] = useState<Order | null>(null)
const [loading, setLoading] = useState(true)
const [updating, setUpdating] = useState(false)
const [newStatus, setNewStatus] = useState<OrderStatus | "">("")
const [statusNotes, setStatusNotes] = useState("")

  const lineItems: MoneyLineItem[] =
    order?.items.map((item) => ({
      quantity: item.quantity ?? 0,
      price: item.unitPrice ?? 0,
    })) ?? []
  const subtotal = calculateSubtotal(lineItems)
  const tax = calculateTax(subtotal, (order as any)?.taxRate ?? 0)
  const total = calculateTotal(subtotal, tax)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(params.id as string)
      setOrder(orderData)
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลออร์เดอร์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return

    setUpdating(true)
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus, statusNotes)
      if (updatedOrder) {
        setOrder(updatedOrder)
        setNewStatus("")
        setStatusNotes("")
        toast({
          title: "อัปเดตสถานะสำเร็จ",
          description: `เปลี่ยนสถานะเป็น ${statusLabelTH[newStatus]} แล้ว`,
        })
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const copyBillLink = () => {
    const billLink = `${window.location.origin}/bill/view/${order?.id}`
    navigator.clipboard.writeText(billLink)
    toast({
      title: "คัดลอกลิงก์สำเร็จ",
      description: "ลิงก์บิลถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
    })
  }

  const sendPresetMessage = (type: "payment" | "confirm_address" | "shipped") => {
    const messages = {
      payment: `สวัสดีครับ/ค่ะ คุณ${order?.customerName}\n\nขอบคุณสำหรับการสั่งซื้อ ออร์เดอร์ ${order?.id}\nยอดรวม ${formatCurrency(total)}\n\nกรุณาชำระเงินและแจ้งโอนกลับมาด้วยนะครับ/ค่ะ\n\nดูรายละเอียดบิล: ${window.location.origin}/bill/view/${order?.id}`,
      confirm_address: `สวัสดีครับ/ค่ะ คุณ${order?.customerName}\n\nออร์เดอร์ ${order?.id} กำลังเตรียมจัดส่ง\nกรุณายืนยันที่อยู่จัดส่ง:\n\n${order?.customerAddress}\n\nหากต้องการแก้ไขที่อยู่ กรุณาแจ้งกลับมาด้วยครับ/ค่ะ`,
      shipped: `สวัสดีครับ/ค่ะ คุณ${order?.customerName}\n\nออร์เดอร์ ${order?.id} จัดส่งแล้ว\nเลขพัสดุ: ${order?.shippingInfo?.trackingNumber || "รอระบบออกเลข"}\n\nติดตามสถานะ: ${window.location.origin}/bill/timeline/${order?.id}`,
    }

    navigator.clipboard.writeText(messages[type])
    toast({
      title: "คัดลอกข้อความสำเร็จ",
      description: "ข้อความถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบออร์เดอร์</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับ
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ออร์เดอร์ {order.id}</h1>
            <p className="text-gray-600 mt-1">
              สร้างเมื่อ{" "}
              {order.createdAt.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusIcon className="w-5 h-5" />
            <Badge className={statusColors[order.status]}>{statusLabelTH[order.status]}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ชื่อลูกค้า</label>
                <p className="text-lg font-semibold">{order.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</label>
                <p>{order.customerPhone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ที่อยู่จัดส่ง</label>
                <p>{order.customerAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ช่องทางการสั่งซื้อ</label>
                <p>{channelLabelTH[order.channel]}</p>
              </div>
              {order.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">หมายเหตุ</label>
                  <p>{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>รายการสินค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.productName}</h4>
                      <p className="text-gray-600">{item.fabricPattern}</p>
                      {item.customizations && (
                        <p className="text-sm text-blue-600 mt-1">ปรับแต่ง: {item.customizations}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        จำนวน: {item.quantity} ชิ้น × {formatCurrency(item.unitPrice ?? 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(
                          calculateSubtotal([
                            { quantity: item.quantity, price: item.unitPrice ?? 0 },
                          ])
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center text-xl font-bold">
                <span>ยอดรวมทั้งสิ้น</span>
                <span className="text-burgundy-600">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการดำเนินงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((event, index) => {
                  const EventIcon = statusIcons[event.status]
                  return (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${statusColors[event.status]}`}>
                        <EventIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{statusLabelTH[event.status]}</span>
                          <span className="text-sm text-gray-500">
                            {event.timestamp.toLocaleDateString("th-TH", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {event.notes && <p className="text-gray-600 text-sm mt-1">{event.notes}</p>}
                        <p className="text-xs text-gray-400 mt-1">โดย {event.updatedBy}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={copyBillLink} className="w-full justify-start bg-transparent" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                คัดลอกลิงก์บิล
              </Button>

              <Button onClick={() => window.print()} className="w-full justify-start" variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์บิล
              </Button>
            </CardContent>
          </Card>

          {/* Preset Messages */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อความสำเร็จรูป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => sendPresetMessage("payment")}
                className="w-full justify-start text-sm"
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                แจ้งชำระเงิน
              </Button>

              <Button
                onClick={() => sendPresetMessage("confirm_address")}
                className="w-full justify-start text-sm"
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                ยืนยันที่อยู่
              </Button>

              <Button
                onClick={() => sendPresetMessage("shipped")}
                className="w-full justify-start text-sm"
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                แจ้งจัดส่ง
              </Button>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>อัปเดตสถานะ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">สถานะใหม่</label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrderStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabelTH[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">หมายเหตุ (ไม่บังคับ)</label>
                <Textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="เพิ่มหมายเหตุ..."
                  rows={3}
                />
              </div>

              <Button onClick={handleStatusUpdate} disabled={!newStatus || updating} className="w-full">
                {updating ? "กำลังอัปเดต..." : "อัปเดตสถานะ"}
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {order.shippingInfo && (
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลการจัดส่ง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">บริษัทขนส่ง</label>
                  <p>{order.shippingInfo.provider}</p>
                </div>

                {order.shippingInfo.trackingNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">เลขพัสดุ</label>
                    <p className="font-mono">{order.shippingInfo.trackingNumber}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">ค่าจัดส่ง</label>
                  <p>{formatCurrency(order.shippingInfo.shippingCost ?? 0)}</p>
                </div>

                {order.shippingInfo.estimatedDelivery && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">กำหนดส่ง</label>
                    <p>{order.shippingInfo.estimatedDelivery.toLocaleDateString("th-TH")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
