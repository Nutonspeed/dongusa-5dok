"use client"

import { useState } from "react"
import { Search, Eye, Edit, Phone, Mail, ShoppingCart, Star, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock customers data
const customersData = [
  {
    id: "CUST-001",
    name: "คุณสมชาย ใจดี",
    email: "somchai@email.com",
    phone: "081-234-5678",
    address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
    totalOrders: 5,
    totalSpent: 12450,
    averageOrderValue: 2490,
    lastOrderDate: "2024-01-25",
    joinDate: "2023-08-15",
    status: "active",
    customerType: "vip",
    favoriteCategory: "covers",
    notes: "ลูกค้า VIP ชอบสั่งผ้าคลุมโซฟาพรีเมียม",
  },
  {
    id: "CUST-002",
    name: "คุณสมหญิง รักสวย",
    email: "somying@email.com",
    phone: "082-345-6789",
    address: "456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    totalOrders: 3,
    totalSpent: 5670,
    averageOrderValue: 1890,
    lastOrderDate: "2024-01-24",
    joinDate: "2023-11-20",
    status: "active",
    customerType: "regular",
    favoriteCategory: "accessories",
    notes: "",
  },
  {
    id: "CUST-003",
    name: "คุณสมศักดิ์ มีเงิน",
    email: "somsak@email.com",
    phone: "083-456-7890",
    address: "789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    totalOrders: 2,
    totalSpent: 8400,
    averageOrderValue: 4200,
    lastOrderDate: "2024-01-23",
    joinDate: "2023-12-10",
    status: "active",
    customerType: "premium",
    favoriteCategory: "covers",
    notes: "ชอบสินค้าราคาสูง คุณภาพดี",
  },
  {
    id: "CUST-004",
    name: "คุณสมปอง ชอบช้อป",
    email: "sompong@email.com",
    phone: "084-567-8901",
    address: "321 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
    totalOrders: 8,
    totalSpent: 3240,
    averageOrderValue: 405,
    lastOrderDate: "2024-01-22",
    joinDate: "2023-06-05",
    status: "active",
    customerType: "frequent",
    favoriteCategory: "accessories",
    notes: "ชอบซื้อของเสริมเล็กๆ บ่อยๆ",
  },
  {
    id: "CUST-005",
    name: "คุณสมใจ รอสินค้า",
    email: "somjai@email.com",
    phone: "085-678-9012",
    address: "654 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400",
    totalOrders: 1,
    totalSpent: 1890,
    averageOrderValue: 1890,
    lastOrderDate: "2024-01-21",
    joinDate: "2024-01-21",
    status: "inactive",
    customerType: "new",
    favoriteCategory: "covers",
    notes: "ลูกค้าใหม่ ยกเลิกคำสั่งซื้อแรก",
  },
  {
    id: "CUST-006",
    name: "คุณสมศรี ซื้อเยอะ",
    email: "somsri@email.com",
    phone: "086-789-0123",
    address: "987 ถนนลาดพร้าว แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ 10230",
    totalOrders: 12,
    totalSpent: 18900,
    averageOrderValue: 1575,
    lastOrderDate: "2024-01-20",
    joinDate: "2023-03-12",
    status: "active",
    customerType: "vip",
    favoriteCategory: "covers",
    notes: "ลูกค้าประจำ ซื้อเป็นประจำทุกเดือน",
  },
]

const customerTypes = [
  { id: "all", name: "ทุกประเภท" },
  { id: "new", name: "ลูกค้าใหม่" },
  { id: "regular", name: "ลูกค้าทั่วไป" },
  { id: "frequent", name: "ลูกค้าประจำ" },
  { id: "premium", name: "ลูกค้าพรีเมียม" },
  { id: "vip", name: "ลูกค้า VIP" },
]

const statusOptions = [
  { id: "all", name: "ทุกสถานะ" },
  { id: "active", name: "ใช้งานอยู่" },
  { id: "inactive", name: "ไม่ใช้งาน" },
]

export default function CustomersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || customer.customerType === selectedType
    const matchesStatus = selectedStatus === "all" || customer.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case "vip":
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
      case "premium":
        return <Badge className="bg-pink-100 text-pink-800">พรีเมียม</Badge>
      case "frequent":
        return <Badge className="bg-blue-100 text-blue-800">ประจำ</Badge>
      case "regular":
        return <Badge className="bg-green-100 text-green-800">ทั่วไป</Badge>
      case "new":
        return <Badge className="bg-yellow-100 text-yellow-800">ใหม่</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">ใช้งานอยู่</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">ไม่ใช้งาน</Badge>
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
    })
  }

  const calculateCustomerStats = () => {
    const totalCustomers = customersData.length
    const activeCustomers = customersData.filter((c) => c.status === "active").length
    const vipCustomers = customersData.filter((c) => c.customerType === "vip").length
    const totalRevenue = customersData.reduce((sum, c) => sum + c.totalSpent, 0)
    const averageOrderValue = customersData.reduce((sum, c) => sum + c.averageOrderValue, 0) / totalCustomers

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      totalRevenue,
      averageOrderValue,
    }
  }

  const stats = calculateCustomerStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการลูกค้า</h1>
          <p className="text-gray-600 mt-1">ข้อมูลและประวัติลูกค้าทั้งหมด</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ใช้งานอยู่</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ลูกค้า VIP</p>
                <p className="text-2xl font-bold text-purple-600">{stats.vipCustomers}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รายได้รวม</p>
                <p className="text-xl font-bold text-pink-600">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ค่าเฉลี่ย/คำสั่ง</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(stats.averageOrderValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
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
                placeholder="ค้นหาด้วยชื่อ, อีเมล, เบอร์โทร, หรือรหัสลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {customerTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

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
              พบ {filteredCustomers.length} รายการจากทั้งหมด {customersData.length} รายการ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการลูกค้า</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">รหัสลูกค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ข้อมูลลูกค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ประเภท</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">คำสั่งซื้อ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดซื้อรวม</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ซื้อล่าสุด</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">{customer.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {customer.phone}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getCustomerTypeBadge(customer.customerType)}</td>
                    <td className="py-4 px-4">
                      <div className="text-center">
                        <span className="font-bold text-blue-600">{customer.totalOrders}</span>
                        <p className="text-xs text-gray-500">คำสั่งซื้อ</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-pink-600">{formatPrice(customer.totalSpent)}</span>
                        <p className="text-xs text-gray-500">เฉลี่ย {formatPrice(customer.averageOrderValue)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(customer.lastOrderDate)}</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(customer.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer)}>
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

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบลูกค้า</h3>
              <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("all")
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

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">ข้อมูลลูกค้า {selectedCustomer.id}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      ข้อมูลส่วนตัว
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</label>
                      <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">อีเมล</label>
                      <p className="text-gray-900">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">เบอร์โทรศัพท์</label>
                      <p className="text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ที่อยู่</label>
                      <p className="text-gray-900">{selectedCustomer.address}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      สถิติการซื้อ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">จำนวนคำสั่งซื้อ:</span>
                      <span className="font-bold text-blue-600">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ยอดซื้อรวม:</span>
                      <span className="font-bold text-pink-600">{formatPrice(selectedCustomer.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ค่าเฉลี่ยต่อคำสั่ง:</span>
                      <span className="font-bold text-green-600">
                        {formatPrice(selectedCustomer.averageOrderValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">หมวดหมู่ที่ชอบ:</span>
                      <span className="font-semibold">
                        {selectedCustomer.favoriteCategory === "covers" ? "ผ้าคลุมโซฟา" : "อุปกรณ์เสริม"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Status */}
              <Card>
                <CardHeader>
                  <CardTitle>สถานะและประเภทลูกค้า</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    {getCustomerTypeBadge(selectedCustomer.customerType)}
                    {getStatusBadge(selectedCustomer.status)}
                  </div>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">วันที่เข้าร่วม</label>
                      <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.joinDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ซื้อล่าสุด</label>
                      <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.lastOrderDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedCustomer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>หมายเหตุ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedCustomer.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  ปิด
                </Button>
                <Button variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  โทรหาลูกค้า
                </Button>
                <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไขข้อมูล
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
