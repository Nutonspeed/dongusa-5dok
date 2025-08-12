"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Calendar, Package, Eye } from "lucide-react"
import { type Order, getOrderById, statusLabelTH } from "@/lib/mock-orders"
import Link from "next/link"

export default function BillViewPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบบิล</h1>
          <p className="text-gray-600">ไม่สามารถค้นหาบิลที่ระบุได้</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-burgundy-800 mb-2">ใบเสร็จรับเงิน</h1>
          <p className="text-gray-600">บิลเลขที่ {order.id}</p>
        </div>

        {/* Bill Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-burgundy-50 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-burgundy-800">ร้านผ้าคลุมโซฟา Premium</CardTitle>
                <p className="text-sm text-gray-600 mt-1">โทร: 02-123-4567 | Line: @sofacover</p>
              </div>
              <Badge variant="secondary" className="bg-burgundy-100 text-burgundy-800">
                {statusLabelTH[order.status]}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                ข้อมูลลูกค้า
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-medium">ชื่อ:</span> {order.customerName}
                </p>
                <p>
                  <span className="font-medium">เบอร์:</span> {order.customerPhone}
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <span className="font-medium">ที่อยู่จัดส่ง:</span>
                    <p className="text-sm text-gray-600 mt-1">{order.customerAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                ข้อมูลการสั่งซื้อ
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-medium">วันที่สั่ง:</span>{" "}
                  {order.createdAt.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">เวลา:</span>{" "}
                  {order.createdAt.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {order.notes && (
                  <p>
                    <span className="font-medium">หมายเหตุ:</span> {order.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                รายการสินค้า
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {index + 1}. {item.productName}
                        </h4>
                        <p className="text-sm text-gray-600">{item.fabricPattern}</p>
                        {item.customizations && (
                          <p className="text-sm text-burgundy-600 mt-1">ปรับแต่ง: {item.customizations}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.totalPrice.toLocaleString()} บาท</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>จำนวน: {item.quantity} ชิ้น</span>
                      <span>ราคาต่อชิ้น: {item.unitPrice.toLocaleString()} บาท</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="bg-burgundy-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-xl font-bold text-burgundy-800">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>{order.totalAmount.toLocaleString()} บาท</span>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-500 text-sm">QR Code</span>
              </div>
              <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงิน</p>
              <p className="text-xs text-gray-500 mt-1">(ระบบ QR Code จะเปิดใช้งานเร็วๆ นี้)</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href={`/bill/timeline/${order.id}`} className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  ติดตามสถานะ
                </Button>
              </Link>
              <Button onClick={() => window.print()} className="flex-1 bg-burgundy-600 hover:bg-burgundy-700">
                พิมพ์บิล
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>ขอบคุณที่ใช้บริการ | โทร 02-123-4567</p>
              <p>www.sofacover.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
