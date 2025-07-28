"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Eye,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Truck,
  DollarSign,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Bill {
  id: string
  billNumber: string
  customerName: string
  customerPhone: string
  total: number
  status: "pending" | "confirmed" | "production" | "shipping" | "completed"
  paymentStatus: "pending" | "paid" | "confirmed"
  createdAt: string
  dueDate: string
}

const statusConfig = {
  pending: { label: "รอยืนยัน", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  production: { label: "กำลังผลิต", color: "bg-purple-100 text-purple-800", icon: Package },
  shipping: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800", icon: Truck },
  completed: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
}

const paymentStatusConfig = {
  pending: { label: "รอชำระ", color: "bg-red-100 text-red-800" },
  paid: { label: "ชำระแล้ว", color: "bg-green-100 text-green-800" },
  confirmed: { label: "ยืนยันการชำระ", color: "bg-blue-100 text-blue-800" },
}

export default function BillsManagement() {
  const [bills, setBills] = useState<Bill[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBills = async () => {
      try {
        // Mock data
        const mockBills: Bill[] = [
          {
            id: "abc123",
            billNumber: "BILL-ABC123",
            customerName: "คุณสมชาย ใจดี",
            customerPhone: "081-234-5678",
            total: 3740,
            status: "confirmed",
            paymentStatus: "pending",
            createdAt: "2024-01-25T10:30:00",
            dueDate: "2024-01-27T23:59:59",
          },
          {
            id: "def456",
            billNumber: "BILL-DEF456",
            customerName: "คุณสมหญิง รักสวย",
            customerPhone: "082-345-6789",
            total: 2350,
            status: "production",
            paymentStatus: "confirmed",
            createdAt: "2024-01-24T14:15:00",
            dueDate: "2024-01-26T23:59:59",
          },
          {
            id: "ghi789",
            billNumber: "BILL-GHI789",
            customerName: "คุณสมศักดิ์ มีเงิน",
            customerPhone: "083-456-7890",
            total: 4200,
            status: "shipping",
            paymentStatus: "confirmed",
            createdAt: "2024-01-23T16:45:00",
            dueDate: "2024-01-25T23:59:59",
          },
        ]
        setBills(mockBills)
      } catch (error) {
        console.error("Error loading bills:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBills()
  }, [])

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerPhone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || bill.status === statusFilter
    const matchesPayment = paymentFilter === "all" || bill.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const sendBillToCustomer = (billId: string) => {
    const billUrl = `${window.location.origin}/bill/view/${billId}`
    const message = `สวัสดีครับ! นี่คือใบเสนอราคาของคุณ กรุณาตรวจสอบรายละเอียดและดำเนินการชำระเงินครับ\n\n${billUrl}`

    // Copy to clipboard
    navigator.clipboard.writeText(message)
    alert("คัดลอกข้อความและลิงก์แล้ว กรุณานำไปส่งให้ลูกค้าครับ")
  }

  const updateBillStatus = async (billId: string, newStatus: string) => {
    try {
      setBills(bills.map((bill) => (bill.id === billId ? { ...bill, status: newStatus as any } : bill)))
      alert("อัปเดตสถานะเรียบร้อยแล้ว")
    } catch (error) {
      console.error("Error updating status:", error)
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    }
  }

  const stats = {
    total: bills.length,
    pending: bills.filter((b) => b.status === "pending").length,
    confirmed: bills.filter((b) => b.status === "confirmed").length,
    production: bills.filter((b) => b.status === "production").length,
    shipping: bills.filter((b) => b.status === "shipping").length,
    completed: bills.filter((b) => b.status === "completed").length,
    unpaid: bills.filter((b) => b.paymentStatus === "pending").length,
    totalAmount: bills.reduce((sum, bill) => sum + bill.total, 0),
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการใบเสนอราคา</h1>
          <p className="text-gray-600 mt-1">สร้าง ส่ง และติดตามใบเสนอราคาลูกค้า</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
          <Plus className="w-4 h-4 mr-2" />
          สร้างใบเสนอราคาใหม่
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ใบเสนอราคาทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รอชำระเงิน</p>
                <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กำลังผลิต</p>
                <p className="text-2xl font-bold text-purple-600">{stats.production}</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดรวมทั้งหมด</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalAmount)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="ค้นหาด้วยเลขที่บิล, ชื่อลูกค้า, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="สถานะงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอยืนยัน</SelectItem>
                <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                <SelectItem value="production">กำลังผลิต</SelectItem>
                <SelectItem value="shipping">จัดส่งแล้ว</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="สถานะการชำระ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอชำระ</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
                <SelectItem value="confirmed">ยืนยันการชำระ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการใบเสนอราคา</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">เลขที่บิล</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ลูกค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดรวม</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะงาน</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การชำระ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่สร้าง</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const StatusIcon = statusConfig[bill.status].icon
                  return (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">{bill.billNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{bill.customerName}</h4>
                          <p className="text-sm text-gray-500">{bill.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-pink-600">{formatPrice(bill.total)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusConfig[bill.status].color}>{statusConfig[bill.status].label}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={paymentStatusConfig[bill.paymentStatus].color}>
                          {paymentStatusConfig[bill.paymentStatus].label}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{formatDate(bill.createdAt)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/bill/view/${bill.id}`, "_blank")}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => sendBillToCustomer(bill.id)}>
                            <Send className="w-4 h-4" />
                          </Button>
                          <Select value={bill.status} onValueChange={(value) => updateBillStatus(bill.id, value)}>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">รอยืนยัน</SelectItem>
                              <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                              <SelectItem value="production">กำลังผลิต</SelectItem>
                              <SelectItem value="shipping">จัดส่งแล้ว</SelectItem>
                              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredBills.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบใบเสนอราคา</h3>
              <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setPaymentFilter("all")
                }}
                variant="outline"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
