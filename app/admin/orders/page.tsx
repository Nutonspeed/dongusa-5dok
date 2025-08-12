"use client"

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
import { useToast } from "@/hooks/use-toast"
import { type Order, OrderStatus, OrderChannel, getOrders, statusLabelTH, channelLabelTH } from "@/lib/mock-orders"
import { toast } from "sonner"
import Link from "next/link"

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
  newStatus: OrderStatus
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

export default function OrdersManagement() {
  const { toast: legacyToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all")
  const [selectedChannel, setSelectedChannel] = useState<OrderChannel | "all">("all")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING)
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [selectedStatus, selectedChannel, searchTerm, dateFrom, dateTo])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (selectedStatus !== "all") filters.status = selectedStatus
      if (selectedChannel !== "all") filters.channel = selectedChannel
      if (searchTerm) filters.search = searchTerm
      if (dateFrom) filters.dateFrom = new Date(dateFrom)
      if (dateTo) filters.dateTo = new Date(dateTo)

      const ordersData = await getOrders(filters)
      setOrders(ordersData)
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลออร์เดอร์ได้")
    } finally {
      setLoading(false)
    }
  }

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
            `"${order.customerName}"`,
            order.customerPhone,
            order.totalAmount,
            `"${statusLabelTH[order.status]}"`,
            `"${channelLabelTH[order.channel]}"`,
            order.createdAt.toLocaleDateString("th-TH"),
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
      const response = await fetch("/api/admin/orders/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders, newStatus }),
      })

      if (!response.ok) throw new Error("Status change failed")

      // Update only affected orders in state (no full page reload)
      setOrders((prevOrders) =>
        prevOrders.map((order) => (selectedOrders.includes(order.id) ? { ...order, status: newStatus } : order)),
      )

      toast.success(`อัพเดทสถานะ ${selectedOrders.length} รายการเป็น "${statusLabelTH[newStatus]}" สำเร็จ`)
      setSelectedOrders([])
      setIsStatusModalOpen(false)
    } catch (error) {
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
                <h2>ใบสั่งซื้อ #${order.id}</h2>
              </div>
              <div class="details">
                <p><strong>ลูกค้า:</strong> ${order.customerName}</p>
                <p><strong>เบอร์โทร:</strong> ${order.customerPhone}</p>
                <p><strong>ยอดรวม:</strong> ${order.totalAmount.toLocaleString()} บาท</p>
                <p><strong>สถานะ:</strong> ${statusLabelTH[order.status]}</p>
                <p><strong>ช่องทาง:</strong> ${channelLabelTH[order.channel]}</p>
                <p><strong>วันที่:</strong> ${order.createdAt.toLocaleDateString("th-TH")}</p>
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
    setSelectedOrders(selectedOrders.length === orders.length ? [] : orders.map((order) => order.id))
  }

  const getStatusBadge = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
      [OrderStatus.PENDING_PAYMENT]: "bg-orange-100 text-orange-800",
      [OrderStatus.PAID]: "bg-green-100 text-green-800",
      [OrderStatus.IN_PRODUCTION]: "bg-blue-100 text-blue-800",
      [OrderStatus.READY_TO_SHIP]: "bg-purple-100 text-purple-800",
      [OrderStatus.SHIPPED]: "bg-indigo-100 text-indigo-800",
      [OrderStatus.DONE]: "bg-gray-100 text-gray-800",
      [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[status]}>{statusLabelTH[status]}</Badge>
  }

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      [OrderStatus.PENDING]: Clock,
      [OrderStatus.PENDING_PAYMENT]: Clock,
      [OrderStatus.PAID]: CheckCircle,
      [OrderStatus.IN_PRODUCTION]: Package,
      [OrderStatus.READY_TO_SHIP]: Package,
      [OrderStatus.SHIPPED]: Truck,
      [OrderStatus.DONE]: CheckCircle,
      [OrderStatus.CANCELLED]: AlertCircle,
    }
    const Icon = icons[status]
    return <Icon className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-burgundy-800">จัดการออร์เดอร์</h1>
          <p className="text-gray-600 mt-1">ติดตามและจัดการออร์เดอร์ทั้งหมด</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รอดำเนินการ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter((o) => o.status === OrderStatus.PENDING).length}
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
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter((o) => o.status === OrderStatus.IN_PRODUCTION).length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === OrderStatus.DONE).length}
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

              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabelTH[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedChannel} onValueChange={(value) => setSelectedChannel(value as OrderChannel)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกช่องทาง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกช่องทาง</SelectItem>
                  {Object.values(OrderChannel).map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channelLabelTH[channel]}
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
          <CardTitle>รายการออร์เดอร์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <Checkbox checked={selectedOrders.length === orders.length} onCheckedChange={toggleAllOrders} />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">รหัส</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ลูกค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดรวม</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ช่องทาง</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-gray-900">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{order.customerName}</h4>
                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-burgundy-600">{order.totalAmount.toLocaleString()} บาท</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary">{channelLabelTH[order.channel]}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {order.createdAt.toLocaleDateString("th-TH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
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
                              <Printer className="w-4 h-4 mr-2" />
                              พิมพ์
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

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบออร์เดอร์</h3>
              <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะออร์เดอร์</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">เปลี่ยนสถานะสำหรับ {selectedOrders.length} รายการที่เลือก</p>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะใหม่" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabelTH[status]}
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
