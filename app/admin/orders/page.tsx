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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { type Order, OrderStatus, OrderChannel, getOrders, statusLabelTH, channelLabelTH } from "@/lib/mock-orders"
import Link from "next/link"

export default function OrdersManagement() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all")
  const [selectedChannel, setSelectedChannel] = useState<OrderChannel | "all">("all")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลออร์เดอร์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "กรุณาเลือกออร์เดอร์",
        description: "เลือกออร์เดอร์อย่างน้อย 1 รายการ",
        variant: "destructive",
      })
      return
    }

    switch (action) {
      case "export":
        exportToCSV()
        break
      case "status":
        // Open status change modal
        break
      case "message":
        sendBulkMessage()
        break
      case "print":
        printSelected()
        break
      case "tracking":
        generateTrackingNumbers()
        break
    }
  }

  const exportToCSV = () => {
    const selectedOrdersData = orders.filter((order) => selectedOrders.includes(order.id))
    const csvContent = [
      ["รหัสออร์เดอร์", "ลูกค้า", "เบอร์โทร", "ยอดรวม", "สถานะ", "ช่องทาง", "วันที่สร้าง"].join(","),
      ...selectedOrdersData.map((order) =>
        [
          order.id,
          order.customerName,
          order.customerPhone,
          order.totalAmount,
          statusLabelTH[order.status],
          channelLabelTH[order.channel],
          order.createdAt.toLocaleDateString("th-TH"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast({
      title: "ส่งออกสำเร็จ",
      description: `ส่งออกข้อมูล ${selectedOrders.length} รายการแล้ว`,
    })
  }

  const sendBulkMessage = () => {
    const message = `สวัสดีครับ/ค่ะ\n\nขอแจ้งสถานะออร์เดอร์ของคุณ:\n${selectedOrders.join(", ")}\n\nขอบคุณครับ/ค่ะ`
    navigator.clipboard.writeText(message)
    toast({
      title: "คัดลอกข้อความสำเร็จ",
      description: "ข้อความถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
    })
  }

  const printSelected = () => {
    window.print()
    toast({
      title: "เตรียมพิมพ์",
      description: `เตรียมพิมพ์ ${selectedOrders.length} รายการ`,
    })
  }

  const generateTrackingNumbers = () => {
    toast({
      title: "สร้างเลขพัสดุ",
      description: `สร้างเลขพัสดุสำหรับ ${selectedOrders.length} รายการ`,
    })
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

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500"
              >
                <option value="all">ทุกสถานะ</option>
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>
                    {statusLabelTH[status]}
                  </option>
                ))}
              </select>

              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as OrderChannel | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500"
              >
                <option value="all">ทุกช่องทาง</option>
                {Object.values(OrderChannel).map((channel) => (
                  <option key={channel} value={channel}>
                    {channelLabelTH[channel]}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500"
              />
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-burgundy-50 rounded-lg">
                <span className="text-sm font-medium text-burgundy-800">เลือกแล้ว {selectedOrders.length} รายการ</span>
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("export")}>
                    <Download className="w-4 h-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("message")}>
                    <MessageSquare className="w-4 h-4 mr-1" />
                    ส่งข้อความ
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("print")}>
                    <Printer className="w-4 h-4 mr-1" />
                    พิมพ์
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("tracking")}>
                    <Truck className="w-4 h-4 mr-1" />
                    สร้างเลขพัสดุ
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
    </div>
  )
}
