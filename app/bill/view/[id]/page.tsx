"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Upload,
  MessageCircle,
  Edit,
  Save,
  X,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface BillData {
  id: string
  billNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  items: Array<{
    id: string
    name: string
    description: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  shipping: number
  total: number
  status: "confirmed" | "cutting" | "sewing" | "packing" | "shipped" | "completed"
  paymentStatus: "pending" | "paid" | "confirmed"
  createdAt: string
  dueDate: string
  estimatedDelivery: string
  notes: string
  qrCode: string
  trackingNumber?: string
  paymentProof?: {
    filename: string
    uploadedAt: string
  }
}

const statusConfig = {
  confirmed: { label: "ยืนยันคำสั่งซื้อ", color: "bg-blue-100 text-blue-800", icon: CheckCircle, progress: 20 },
  cutting: { label: "กำลังตัดผ้า", color: "bg-orange-100 text-orange-800", icon: Package, progress: 40 },
  sewing: { label: "กำลังเย็บ", color: "bg-purple-100 text-purple-800", icon: Package, progress: 60 },
  packing: { label: "กำลังแพ็คสินค้า", color: "bg-indigo-100 text-indigo-800", icon: Package, progress: 80 },
  shipped: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800", icon: Truck, progress: 90 },
  completed: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800", icon: CheckCircle, progress: 100 },
}

export default function BillViewPage() {
  const params = useParams()
  const billId = params.id as string

  const [billData, setBillData] = useState<BillData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [editedAddress, setEditedAddress] = useState("")
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [isUploadingProof, setIsUploadingProof] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  useEffect(() => {
    loadBillData()
  }, [billId])

  const loadBillData = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockBill: BillData = {
        id: billId,
        billNumber: "BILL-ABC123",
        customerName: "คุณสมชาย ใจดี",
        customerPhone: "081-234-5678",
        customerEmail: "somchai@email.com",
        customerAddress: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
        items: [
          {
            id: "1",
            name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
            description: "โซฟา 3 ที่นั่ง สีน้ำเงินเข้ม ลาย Arctic White",
            quantity: 1,
            price: 2890,
            total: 2890,
          },
          {
            id: "2",
            name: "หมอนอิงเซ็ต",
            description: "หมอนอิงลายเดียวกัน ขนาด 45x45 ซม. จำนวน 2 ใบ",
            quantity: 2,
            price: 350,
            total: 700,
          },
        ],
        subtotal: 3590,
        shipping: 150,
        total: 3740,
        status: "sewing",
        paymentStatus: "pending",
        createdAt: "2024-01-25T10:30:00",
        dueDate: "2024-01-27T23:59:59",
        estimatedDelivery: "2024-02-05",
        notes: "ลูกค้าขอให้รีบ เพราะมีงานเลี้ยงที่บ้าน",
        qrCode: "/placeholder.svg?height=200&width=200&text=QR+Code",
        trackingNumber: "TH1234567890",
      }

      setBillData(mockBill)
      setEditedAddress(mockBill.customerAddress)
    } catch (error) {
      console.error("Error loading bill:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const saveAddress = async () => {
    try {
      // In real app, send to API
      setBillData((prev) => (prev ? { ...prev, customerAddress: editedAddress } : null))
      setIsEditingAddress(false)
      alert("บันทึกที่อยู่เรียบร้อยแล้ว")
    } catch (error) {
      console.error("Error saving address:", error)
      alert("เกิดข้อผิดพลาดในการบันทึกที่อยู่")
    }
  }

  const uploadPaymentProof = async () => {
    if (!paymentProofFile) return

    setIsUploadingProof(true)
    try {
      // Mock upload - in real app, upload to server
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setBillData((prev) =>
        prev
          ? {
              ...prev,
              paymentProof: {
                filename: paymentProofFile.name,
                uploadedAt: new Date().toISOString(),
              },
            }
          : null,
      )

      setPaymentProofFile(null)
      setShowPaymentDialog(false)
      alert("อัปโหลดหลักฐานการชำระเงินเรียบร้อยแล้ว")
    } catch (error) {
      console.error("Error uploading payment proof:", error)
      alert("เกิดข้อผิดพลาดในการอัปโหลดหลักฐาน")
    } finally {
      setIsUploadingProof(false)
    }
  }

  const notifyPayment = async () => {
    try {
      // In real app, send notification to admin
      alert("แจ้งการชำระเงินเรียบร้อยแล้ว ทางร้านจะตรวจสอบและอัปเดตสถานะให้ค่ะ")
    } catch (error) {
      console.error("Error notifying payment:", error)
      alert("เกิดข้อผิดพลาดในการแจ้งการชำระเงิน")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!billData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบใบเสนอราคา</h1>
          <p className="text-gray-600">กรุณาตรวจสอบลิงก์อีกครั้ง</p>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[billData.status]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ใบเสนอราคา</h1>
          <p className="text-xl text-pink-600 font-semibold">{billData.billNumber}</p>
          <Badge className={`${currentStatus.color} mt-2`}>
            <currentStatus.icon className="w-4 h-4 mr-1" />
            {currentStatus.label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">สถานะการดำเนินงาน</h3>
                <span className="text-sm text-gray-600">{currentStatus.progress}% เสร็จสิ้น</span>
              </div>
              <Progress value={currentStatus.progress} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <div
                    key={status}
                    className={`text-center p-2 rounded ${
                      billData.status === status ? "bg-pink-100 text-pink-800" : "text-gray-500"
                    }`}
                  >
                    <config.icon className="w-4 h-4 mx-auto mb-1" />
                    <span>{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  ข้อมูลลูกค้า
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">ชื่อ-นามสกุล</Label>
                    <p className="font-semibold">{billData.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">เบอร์โทรศัพท์</Label>
                    <p className="font-semibold">{billData.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm text-gray-600">ที่อยู่จัดส่ง</Label>
                    {!isEditingAddress && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingAddress(true)}
                        className="text-pink-600 hover:text-pink-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        แก้ไข
                      </Button>
                    )}
                  </div>
                  {isEditingAddress ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveAddress} className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-1" />
                          บันทึก
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingAddress(false)
                            setEditedAddress(billData.customerAddress)
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{billData.customerAddress}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  รายการสินค้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billData.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">จำนวน: {item.quantity}</span>
                          <span className="font-bold text-pink-600">{formatPrice(item.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t mt-6 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ราคาสินค้า:</span>
                    <span>{formatPrice(billData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ค่าจัดส่ง:</span>
                    <span>{formatPrice(billData.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-pink-600 border-t pt-2">
                    <span>ยอดรวมทั้งสิ้น:</span>
                    <span>{formatPrice(billData.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {billData.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>หมายเหตุ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm">{billData.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tracking Information */}
            {billData.trackingNumber && billData.status === "shipped" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    ข้อมูลการจัดส่ง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">เลขพัสดุ:</span>
                      <span className="font-mono font-semibold">{billData.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">วันที่จัดส่ง:</span>
                      <span>{formatDate(billData.createdAt)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 bg-transparent"
                      onClick={() =>
                        window.open(
                          `https://track.thailandpost.co.th/?trackNumber=${billData.trackingNumber}`,
                          "_blank",
                        )
                      }
                    >
                      ติดตามพัสดุ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  การชำระเงิน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge
                    className={
                      billData.paymentStatus === "pending"
                        ? "bg-red-100 text-red-800"
                        : billData.paymentStatus === "paid"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }
                  >
                    {billData.paymentStatus === "pending"
                      ? "รอชำระเงิน"
                      : billData.paymentStatus === "paid"
                        ? "รอยืนยันการชำระ"
                        : "ชำระเงินแล้ว"}
                  </Badge>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600 mb-2">{formatPrice(billData.total)}</p>
                  <p className="text-sm text-gray-600">กำหนดชำระภายใน: {formatDate(billData.dueDate)}</p>
                </div>

                {billData.paymentStatus === "pending" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">สแกน QR Code เพื่อชำระเงิน</p>
                      <img
                        src={billData.qrCode || "/placeholder.svg"}
                        alt="QR Code สำหรับชำระเงิน"
                        className="w-48 h-48 mx-auto border rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">ข้อมูลการโอนเงิน:</p>
                      <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-lg">
                        <p>ธนาคาร: กสิกรไทย</p>
                        <p>เลขที่บัญชี: 123-4-56789-0</p>
                        <p>ชื่อบัญชี: บริษัท โซฟาคัฟเวอร์ จำกัด</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowPaymentDialog(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      แจ้งการชำระเงิน
                    </Button>
                  </div>
                )}

                {billData.paymentProof && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">อัปโหลดหลักฐานแล้ว</p>
                        <p className="text-xs text-green-600">{billData.paymentProof.filename}</p>
                        <p className="text-xs text-green-600">{formatDate(billData.paymentProof.uploadedAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  ไทม์ไลน์คำสั่งซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">สร้างใบเสนอราคา</p>
                      <p className="text-xs text-gray-500">{formatDate(billData.createdAt)}</p>
                    </div>
                  </div>

                  {billData.paymentStatus !== "pending" && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">ได้รับการชำระเงิน</p>
                        <p className="text-xs text-gray-500">ยืนยันการชำระแล้ว</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ["cutting", "sewing", "packing", "shipped", "completed"].includes(billData.status)
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Package
                        className={`w-4 h-4 ${
                          ["cutting", "sewing", "packing", "shipped", "completed"].includes(billData.status)
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">เริ่มผลิตสินค้า</p>
                      <p className="text-xs text-gray-500">
                        {["cutting", "sewing", "packing", "shipped", "completed"].includes(billData.status)
                          ? "กำลังดำเนินการ"
                          : "รอการชำระเงิน"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ["shipped", "completed"].includes(billData.status) ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <Truck
                        className={`w-4 h-4 ${
                          ["shipped", "completed"].includes(billData.status) ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">จัดส่งสินค้า</p>
                      <p className="text-xs text-gray-500">
                        {["shipped", "completed"].includes(billData.status)
                          ? "จัดส่งแล้ว"
                          : `กำหนดส่ง: ${formatDate(billData.estimatedDelivery)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  ติดต่อเรา
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">มีคำถามเกี่ยวกับคำสั่งซื้อ?</p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    const message = `สวัสดีครับ! ผมต้องการสอบถามเกี่ยวกับคำสั่งซื้อ ${billData.billNumber} ครับ`
                    const facebookUrl = `https://m.me/100063558196153?text=${encodeURIComponent(message)}`
                    window.open(facebookUrl, "_blank")
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  แชท Facebook
                </Button>
                <div className="text-center text-sm text-gray-500">
                  <p>หรือโทร: 02-123-4567</p>
                  <p>เวลา: 9:00-18:00 น.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Proof Upload Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>แจ้งการชำระเงิน</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-proof">อัปโหลดหลักฐานการชำระเงิน</Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</p>
              </div>

              <div className="text-sm bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-800 mb-1">ข้อมูลการโอน:</p>
                <p>ยอดเงิน: {formatPrice(billData.total)}</p>
                <p>เลขที่บิล: {billData.billNumber}</p>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={uploadPaymentProof}
                  disabled={!paymentProofFile || isUploadingProof}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUploadingProof ? "กำลังอัปโหลด..." : "แจ้งการชำระ"}
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  ยกเลิก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
