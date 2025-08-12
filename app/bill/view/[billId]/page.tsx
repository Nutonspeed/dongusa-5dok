"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Calendar, Package, Eye, Copy, Check, Save, CreditCard } from 'lucide-react'
import { type Order, getOrderById, statusLabelTH, channelLabelTH } from "@/lib/mock-orders"
import { toast } from "sonner"
import Link from "next/link"

export default function BillViewPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState("")
  const [savingAddress, setSavingAddress] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [params.billId])

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(params.billId as string)
      setOrder(orderData)
      setNewAddress(orderData?.customerAddress || "")
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  // <CHANGE> Added copy bill link functionality
  const handleCopyBillLink = async () => {
    try {
      const billUrl = `${window.location.origin}/bill/view/${params.billId}`
      await navigator.clipboard.writeText(billUrl)
      setLinkCopied(true)
      toast.success("คัดลอกลิงก์บิลแล้ว")
      
      setTimeout(() => {
        setLinkCopied(false)
      }, 2000)
    } catch (error) {
      toast.error("ไม่สามารถคัดลอกลิงก์ได้")
    }
  }

  // <CHANGE> Added address saving functionality with mock PUT request
  const handleSaveAddress = async () => {
    if (!order || !newAddress.trim()) {
      toast.error("กรุณากรอกที่อยู่")
      return
    }

    setSavingAddress(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/address`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddress.trim() }),
      })

      if (!response.ok) throw new Error("Address update failed")

      // <CHANGE> Update only the address block, not full page reload
      setOrder(prev => prev ? { ...prev, customerAddress: newAddress.trim() } : null)
      setEditingAddress(false)
      toast.success("บันทึกที่อยู่สำเร็จ")
    } catch (error) {
      toast.error("บันทึกที่อยู่ไม่สำเร็จ")
    } finally {
      setSavingAddress(false)
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
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-burgundy-100 text-burgundy-800">
                  {statusLabelTH[order.status]}
                </Badge>
                <Button size="sm" variant="outline" onClick={handleCopyBillLink}>
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      คัดลอกแล้ว
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      คัดลอกลิงก์บิล
                    </>
                  )}
                </Button>
              </div>
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
                <p>
                  <span className="font-medium">ช่องทาง:</span> {channelLabelTH[order.channel]}
                </p>
              </div>
            </div>

            {/* Address Section with Edit Capability */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                ที่อยู่จัดส่ง
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {editingAddress ? (
                  <div className="space-y-3">
                    <Label htmlFor="address">แก้ไขที่อยู่</Label>
                    <Input
                      id="address"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="กรอกที่อยู่จัดส่ง"
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveAddress} 
                        disabled={savingAddress}
                        className="bg-burgundy-600 hover:bg-burgundy-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {savingAddress ? "กำลังบันทึก..." : "บันทึก"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingAddress(false)
                          setNewAddress(order.customerAddress || "")
                        }}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-700">{order.customerAddress}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingAddress(true)}
                      className="text-burgundy-600 hover:text-burgundy-700"
                    >
                      แก้ไข
                    </Button>
                  </div>
                )}
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

            {/* Items with Enhanced Display */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                รายการผ้า
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {/* Small fabric image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image || `/placeholder.svg?height=64&width=64&query=${item.fabricPattern} fabric`}
                          alt={item.fabricPattern}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono text-sm text-gray-600">{item.fabricCode || `FB${String(index + 1).padStart(3, '0')}`}</p>
                            <h4 className="font-medium text-gray-900">{item.fabricPattern}</h4>
                            <p className="text-sm text-gray-600">{item.productName}</p>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Enhanced Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>ค่าของ</span>
                <span>{(order.totalAmount - (order.shippingCost || 0) + (order.discount || 0)).toLocaleString()} บาท</span>
              </div>
              
              {order.shippingCost && (
                <div className="flex justify-between text-gray-700">
                  <span>ค่าขนส่ง</span>
                  <span>{order.shippingCost.toLocaleString()} บาท</span>
                </div>
              )}
              
              {order.discount && (
                <div className="flex justify-between text-green-600">
                  <span>ส่วนลด</span>
                  <span>-{order.discount.toLocaleString()} บาท</span>
                </div>
              )}
              
              <Separator />
              
              <div className="bg-burgundy-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-xl font-bold text-burgundy-800">
                  <span>ยอดสุทธิ</span>
                  <span>{order.totalAmount.toLocaleString()} บาท</span>
                </div>
              </div>
            </div>

            {/* QR Payment with Instructions */}
            <div className="text-center py-6 border-2 border-dashed border-burgundy-300 rounded-lg bg-burgundy-50">
              <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center mb-4 border-2 border-burgundy-200">
                <img
                  src="/placeholder.svg?key=oulmw"
                  alt="QR Code สำหรับชำระเงิน"
                  className="w-28 h-28"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-burgundy-800">
                  <CreditCard className="w-5 h-5" />
                  <p className="font-semibold">สแกน QR Code เพื่อชำระเงิน</p>
                </div>
                <p className="text-sm text-burgundy-600">ยอดชำระ: {order.totalAmount.toLocaleString()} บาท</p>
                <div className="text-xs text-burgundy-500 space-y-1 mt-3">
                  <p className="font-medium">วิธีการชำระเงิน:</p>
                  <p>1. สแกน QR Code ด้วยแอปธนาคาร</p>
                  <p>2. ตรวจสอบยอดเงินให้ถูกต้อง</p>
                  <p>3. กดยืนยันการโอนเงิน</p>
                  <p>4. แจ้งการโอนเงินผ่าน Line: @sofacover</p>
                </div>
              </div>
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
