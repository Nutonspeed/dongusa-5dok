"use client"

import { useState } from "react"
import {
  Search,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Phone,
  Mail,
  MapPin,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock orders data
const ordersData = [
  {
    id: "ORD-001",
    customer: {
      name: "คุณสมชาย ใจดี",
      phone: "081-234-5678",
      email: "somchai@email.com",
      address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
    },
    items: [
      {
        name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
        quantity: 1,
        price: 2890,
        specifications: "โซฟา 3 ที่นั่ง, สีน้ำเงินเข้ม",
      },
    ],
    total: 2890,
    status: "pending",
    paymentStatus: "paid",
    createdAt: "2024-01-25T10:30:00",
    updatedAt: "2024-01-25T10:30:00",
    estimatedDelivery: "2024-02-05",
    notes: "ลูกค้าขอให้รีบ เพราะมีงานเลี้ยงที่บ้าน",
  },
  {
    id: "ORD-002",
    customer: {
      name: "คุณสมหญิง รักสวย",
      phone: "082-345-6789",
      email: "somying@email.com",
      address: "456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    },
    items: [
      {
        name: "ผ้าคลุมโซฟากันน้ำ",
        quantity: 1,
        price: 1650,
        specifications: "โซฟา 2 ที่นั่ง, สีเทา",
      },
      {
        name: "หมอนอิงลายเดียวกัน",
        quantity: 2,
        price: 350,
        specifications: "ขนาด 45x45 ซม.",
      },
    ],
    total: 2350,
    status: "production",
    paymentStatus: "paid",
    createdAt: "2024-01-24T14:15:00",
    updatedAt: "2024-01-25T09:20:00",
    estimatedDelivery: "2024-02-08",
    notes: "",
  },
  {
    id: "ORD-003",
    customer: {
      name: "คุณสมศักดิ์ มีเงิน",
      phone: "083-456-7890",
      email: "somsak@email.com",
      address: "789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    },
    items: [
      {
        name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
        quantity: 1,
        price: 4200,
        specifications: "โซฟา L-Shape, สีครีม",
      },
    ],
    total: 4200,
    status: "shipped",
    paymentStatus: "paid",
    createdAt: "2024-01-23T16:45:00",
    updatedAt: "2024-01-25T08:30:00",
    estimatedDelivery: "2024-01-26",
    trackingNumber: "TH1234567890",
    notes: "",
  },
  {
    id: "ORD-004",
    customer: {
      name: "คุณสมปอง ชอบช้อป",
      phone: "084-567-8901",
      email: "sompong@email.com",
      address: "321 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
    },
    items: [
      {
        name: "น้ำยาทำความสะอาดผ้า",
        quantity: 2,
        price: 280,
        specifications: "ขนาด 500ml",
      },
    ],
    total: 560,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-01-22T11:20:00",
    updatedAt: "2024-01-24T15:45:00",
    estimatedDelivery: "2024-01-24",
    deliveredAt: "2024-01-24T15:45:00",
    notes: "",
  },
  {
    id: "ORD-005",
    customer: {
      name: "คุณสมใจ รอสินค้า",
      phone: "085-678-9012",
      email: "somjai@email.com",
      address: "654 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400",
    },
    items: [
      {
        name: "ผ้าคลุมโซฟาแบบยืดหยุ่น",
        quantity: 1,
        price: 1890,
        specifications: "โซฟา 3 ที่นั่ง, สีน้ำตาล",
      },
    ],
    total: 1890,
    status: "cancelled",
    paymentStatus: "refunded",
    createdAt: "2024-01-21T13:10:00",
    updatedAt: "2024-01-22T10:15:00",
    estimatedDelivery: "",
    notes: "ลูกค้ายกเลิกเพราะเปลี่ยนใจ",
  },
]

const statusOptions = [
  { id: "all", name: "ทุกสถานะ" },
  { id: "pending", name: "รอดำเนินการ" },
  { id: "production", name: "กำลังผลิต" },
  { id: "shipped", name: "จัดส่งแล้ว" },
  { id: "completed", name: "เสร็จสิ้น" },
  { id: "cancelled", name: "ยกเลิก" },
]

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">รอดำเนินการ</Badge>
      case "production":
        return <Badge className="bg-blue-100 text-blue-800">กำลังผลิต</Badge>
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-800">จัดส่งแล้ว</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">เสร็จสิ้น</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">ยกเลิก</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "production":
        return <Package className="w-4 h-4 text-blue-600" />
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">ชำระแล้ว</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">รอชำระ</Badge>
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">คืนเงินแล้ว</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการคำสั่งซื้อ</h1>
          <p className="text-gray-600 mt-1">ติดตามและจัดการคำสั่งซื้อทั้งหมด</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{ordersData.length}</p>
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
                  {ordersData.filter((o) => o.status === "pending").length}
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
                  {ordersData.filter((o) => o.status === "production").length}
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
                <p className="text-sm text-gray-600">จัดส่งแล้ว</p>
                <p className="text-2xl font-bold text-purple-600">
                  {ordersData.filter((o) => o.status === "shipped").length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-green-600">
                  {ordersData.filter((o) => o.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัสคำสั่งซื้อ, ชื่อลูกค้า, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              พบ {filteredOrders.length} รายการจากทั้งหมด {ordersData.length} รายการ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคำสั่งซื้อ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">รหัสคำสั่งซื้อ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ลูกค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สินค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดรวม</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การชำระเงิน</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่สั่ง</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-gray-900">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{order.customer.name}</h4>
                        <p className="text-sm text-gray-500">{order.customer.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.items[0].name}</p>
                        {order.items.length > 1 && (
                          <p className="text-sm text-gray-500">และอีก {order.items.length - 1} รายการ</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-pink-600">{formatPrice(order.total)}</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบคำสั่งซื้อ</h3>
              <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedStatus("all")
                }}
                variant="outline"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ {selectedOrder.id}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedOrder.status)}
                  {getStatusBadge(selectedOrder.status)}
                  {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">วันที่สั่ง</p>
                  <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    ข้อมูลลูกค้า
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedOrder.customer.email}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <span>{selectedOrder.customer.address}</span>
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
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-start p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.specifications}</p>
                          <p className="text-sm text-gray-500 mt-1">จำนวน: {item.quantity} ชิ้น</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">{formatPrice(item.price)} / ชิ้น</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">ยอดรวมทั้งสิ้น</span>
                      <span className="text-2xl font-bold text-pink-600">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              {selectedOrder.estimatedDelivery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      ข้อมูลการจัดส่ง
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">วันที่คาดว่าจะส่ง:</span>
                      <span className="font-semibold">
                        {new Date(selectedOrder.estimatedDelivery).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">หมายเลขติดตาม:</span>
                        <span className="font-semibold text-blue-600">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                    {selectedOrder.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">จัดส่งเมื่อ:</span>
                        <span className="font-semibold text-green-600">{formatDate(selectedOrder.deliveredAt)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>หมายเหตุ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  ปิด
                </Button>
                <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไขคำสั่งซื้อ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
