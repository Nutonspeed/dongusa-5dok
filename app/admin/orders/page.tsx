"use client"
import { logger } from "@/lib/logger"

import { useState, useEffect } from "react"
import {
  Search,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Download,
  MessageSquare,
  Printer,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { DatabaseService } from "@/lib/database"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/money"
import { statusBadgeVariant, toStatusLabelTH, toChannelLabelTH } from "@/lib/i18n/status"

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  total_amount: number
  status: string
  channel: string
  created_at: string
  notes?: string
  items?: any[]
}

const ORDERS_CSV_HEADERS = [
  "รหัสออร์เดอร์",
  "ลูกค้า",
  "เบอร์โทร",
  "ยอดรวม",
  "สถานะ",
  "ช่องทาง",
  "วันที่สร้าง",
  "หมายเหตุ",
  "คอลเลกชัน",
]

interface BulkStatusChangeData {
  orderIds: string[]
  newStatus: string
}

interface MessagePreset {
  id: string
  name: string
  template: string
}

const MESSAGE_PRESETS: MessagePreset[] = [
  {
    id: "payment_reminder",
    name: "แจ้งเตือนชำระเงิน",
    template: "สวัสดีครับ/ค่ะ กรุณาชำระเงินสำหรับออร์เดอร์ {orderId} ยอด {amount} บาท ภายใน 24 ชั่วโมง ขอบคุณครับ/ค่ะ",
  },
  {
    id: "production_update",
    name: "อัพเดทการผลิต",
    template: "สวัสดีครับ/ค่ะ ออร์เดอร์ {orderId} ของคุณอยู่ระหว่างการผลิต คาดว่าจะเสร็จภายใน 3-5 วันทำการ ขอบคุณครับ/ค่ะ",
  },
  {
    id: "ready_to_ship",
    name: "พร้อมจัดส่ง",
    template: "สวัสดีครับ/ค่ะ ออร์เดอร์ {orderId} ของคุณพร้อมจัดส่งแล้ว เลขพัสดุ: {trackingNumber} ขอบคุณครับ/ค่ะ",
  },
]

export const dynamic = "force-dynamic"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("pending")
  const [selectedPreset, setSelectedPreset] = useState("")

  const supabase = createClient()
  const db = new DatabaseService(supabase)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const ordersData = await (db as any).getOrders(undefined, 100)
        setOrders(ordersData || [])
      } catch (error) {
        logger.error("Failed to load orders:", error)
        toast.error("ไม่สามารถโหลดข้อมูลออร์เดอร์ได้")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesChannel = channelFilter === "all" || order.channel === channelFilter

    let matchesDate = true
    if (dateFrom) {
      matchesDate = matchesDate && new Date(order.created_at) >= new Date(dateFrom)
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(order.created_at) <= new Date(dateTo)
    }

    return matchesSearch && matchesStatus && matchesChannel && matchesDate
  })

  const handleBulkExport = async () => {
    if (selectedOrders.length === 0) {
      toast.error("กรุณาเลือกออร์เดอร์อย่างน้อย 1 รายการ")
      return
    }

    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/admin/orders/bulk-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders }),
      })

      if (!response.ok) throw new Error("Export failed")

      const selectedOrdersData = orders.filter((order) => selectedOrders.includes(order.id))

      // Create CSV with BOM for proper Thai character encoding
      const csvContent = [
        ORDERS_CSV_HEADERS.join(","),
        ...selectedOrdersData.map((order) =>
          [
            order.id,
            `"${order.customer_name}"`,
            order.customer_phone,
            order.total_amount,
            `"${toStatusLabelTH(order.status)}"`,
            `"${toChannelLabelTH(order.channel)}"`,
            new Date(order.created_at).toLocaleDateString("th-TH"),
            `"${order.notes || ""}"`,
            `"${order.items?.[0]?.collection || ""}"`,
          ].join(","),
        ),
      ].join("\n")

      // Add BOM for UTF-8
      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `orders_export_${new Date().toISOString().split("T")[0]}.csv`
      link.click()

      toast.success(`ส่งออกข้อมูล ${selectedOrders.length} รายการสำเร็จ`)
      setSelectedOrders([])
    } catch (error) {
      toast.error("ส่งออกข้อมูลไม่สำเร็จ")
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkStatusChange = async () => {
    if (selectedOrders.length === 0) {
      toast.error("กรุณาเลือกออร์เดอร์อย่างน้อย 1 รายการ")
      return
    }

    setBulkActionLoading(true)
    try {
      await (db as any).updateOrdersStatus(selectedOrders, newStatus)

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (selectedOrders.includes(order.id) ? { ...order, status: newStatus } : order)),
      )

      toast.success(`อัพเดทสถานะ ${selectedOrders.length} รายการเป็น "${toStatusLabelTH(newStatus)}" สำเร็จ`)
      setSelectedOrders([])
      setIsStatusModalOpen(false)
    } catch (error) {
      logger.error("Bulk status update failed:", error)
      toast.error("อัพเดทสถานะไม่สำเร็จ")
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkMessage = async () => {
    if (selectedOrders.length === 0 || !selectedPreset) {
      toast.error("กรุณาเลือกออร์เดอร์และเทมเพลตข้อความ")
      return
    }

    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/admin/orders/messages/bulk-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders, presetId: selectedPreset }),
      })

      if (!response.ok) throw new Error("Message sending failed")

      const preset = MESSAGE_PRESETS.find((p) => p.id === selectedPreset)
      toast.success(`ส่งข้อความ "${preset?.name}" ไปยัง ${selectedOrders.length} รายการสำเร็จ`)
      setSelectedOrders([])
      setIsMessageModalOpen(false)
    } catch (error) {
      toast.error("ส่งข้อความไม่สำเร็จ")
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkPrint = () => {
    if (selectedOrders.length === 0) {
      toast.error("กรุณาเลือกออร์เดอร์อย่างน้อย 1 รายการ")
      return
    }

    const selectedOrdersData = orders.filter((order) => selectedOrders.includes(order.id))
    const printContent = `
      <html>
        <head>
          <title>พิมพ์ออร์เดอร์</title>
          <style>
            body { font-family: 'Sarabun', sans-serif; }
            .order { page-break-after: always; margin-bottom: 20px; padding: 20px; border: 1px solid #ccc; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          ${selectedOrdersData
            .map(
              (order) => `
            <div class="order">
              <div class="header">
                <h2>ใบสั่งซื้อ #${order.id.slice(-8)}</h2>
              </div>
              <div class="details">
                <p><strong>ลูกค้า:</strong> ${order.customer_name}</p>
                <p><strong>เบอร์โทร:</strong> ${order.customer_phone}</p>
                <p><strong>ยอดรวม:</strong> ${formatCurrency(order.total_amount ?? 0)}</p>
                <p><strong>สถานะ:</strong> ${toStatusLabelTH(order.status)}</p>
                <p><strong>ช่องทาง:</strong> ${toChannelLabelTH(order.channel)}</p>
                <p><strong>วันที่:</strong> ${new Date(order.created_at).toLocaleDateString("th-TH", {
                  month: "short",
                  day: "numeric",
                })}
                      </p>
                    </div>
                  </div>
                `,
            )
            .join("")}
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }

    toast.success(`เตรียมพิมพ์ ${selectedOrders.length} รายการ`)
  }

  const handleBulkShipping = async () => {
    if (selectedOrders.length === 0) {
      toast.error("กรุณาเลือกออร์เดอร์อย่างน้อย 1 รายการ")
      return
    }

    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/admin/orders/shipping/create-labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders }),
      })

      if (!response.ok) throw new Error("Label creation failed")

      const result = await response.json()
      toast.success(`สร้างเลเบลจัดส่งสำหรับ ${selectedOrders.length} รายการสำเร็จ`)
      setSelectedOrders([])
    } catch (error) {
      toast.error("สร้างเลเบลจัดส่งไม่สำเร็จ")
    } finally {
      setBulkActionLoading(false)
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const toggleAllOrders = () => {
    setSelectedOrders(selectedOrders.length === filteredOrders.length ? [] : filteredOrders.map((order) => order.id))
  }

  const getStatusBadge = (status: string) => {
    return <Badge variant={statusBadgeVariant(status)}>{toStatusLabelTH(status)}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>กำลังโหลดข้อมูลออร์เดอร์...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการออร์เดอร์</h1>
          <p className="text-gray-600 mt-1">จัดการคำสั่งซื้อและติดตามสถานะ</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ออร์เดอร์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รอดำเนินการ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กำลังผลิต</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter((o) => o.status === "production").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  {Object.keys(statusBadgeVariant()).map((status) => (
                    <SelectItem key={status} value={status}>
                      {toStatusLabelTH(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกช่องทาง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกช่องทาง</SelectItem>
                  {Object.keys(toChannelLabelTH()).map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {toChannelLabelTH(channel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500"
              />
            </div>

            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-burgundy-50 rounded-lg">
                <span className="text-sm font-medium text-burgundy-800">เลือกแล้ว {selectedOrders.length} รายการ</span>
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" variant="outline" onClick={handleBulkExport} disabled={bulkActionLoading}>
                    <Download className="w-4 h-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsStatusModalOpen(true)}
                    disabled={bulkActionLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    เปลี่ยนสถานะ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsMessageModalOpen(true)}
                    disabled={bulkActionLoading}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    ส่งข้อความ
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkPrint} disabled={bulkActionLoading}>
                    <Printer className="w-4 h-4 mr-1" />
                    พิมพ์
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkShipping} disabled={bulkActionLoading}>
                    <Truck className="w-4 h-4 mr-1" />
                    สร้างเลเบล
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการออร์เดอร์ ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleAllOrders}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ออร์เดอร์</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ลูกค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดรวม</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ช่องทาง</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">#{order.id.slice(-8)}</h4>
                        <p className="text-xs text-gray-500">{order.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{order.customer_name}</h4>
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-burgundy-600">{formatCurrency(order.total_amount ?? 0)}</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{toChannelLabelTH(order.channel)}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString("th-TH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              ส่งข้อความ
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="w-4 h-4 mr-2" />
                              จัดส่ง
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบออร์เดอร์</h3>
              <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setChannelFilter("all")
                  setDateFrom("")
                  setDateTo("")
                }}
                variant="outline"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะออร์เดอร์</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">เปลี่ยนสถานะสำหรับ {selectedOrders.length} รายการที่เลือก</p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะใหม่" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statusBadgeVariant()).map((status) => (
                  <SelectItem key={status} value={status}>
                    {toStatusLabelTH(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleBulkStatusChange} disabled={bulkActionLoading}>
                {bulkActionLoading ? "กำลังอัพเดท..." : "อัพเดทสถานะ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ส่งข้อความหลายรายการ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">ส่งข้อความไปยัง {selectedOrders.length} รายการที่เลือก</p>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกเทมเพลตข้อความ" />
              </SelectTrigger>
              <SelectContent>
                {MESSAGE_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPreset && (
              <div className="p-3 bg-gray-50 rounded text-sm">
                <strong>ตัวอย่างข้อความ:</strong>
                <p className="mt-1">{MESSAGE_PRESETS.find((p) => p.id === selectedPreset)?.template}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleBulkMessage} disabled={bulkActionLoading || !selectedPreset}>
                {bulkActionLoading ? "กำลังส่ง..." : "ส่งข้อความ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
