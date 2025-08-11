"use client"
import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  BarChart3,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock analytics data
const salesData = [
  { month: "ม.ค.", revenue: 45230, orders: 23, customers: 18 },
  { month: "ก.พ.", revenue: 52100, orders: 28, customers: 22 },
  { month: "มี.ค.", revenue: 48900, orders: 25, customers: 20 },
  { month: "เม.ย.", revenue: 61200, orders: 32, customers: 26 },
  { month: "พ.ค.", revenue: 58700, orders: 30, customers: 24 },
  { month: "มิ.ย.", revenue: 67800, orders: 35, customers: 28 },
  { month: "ก.ค.", revenue: 72500, orders: 38, customers: 31 },
  { month: "ส.ค.", revenue: 69300, orders: 36, customers: 29 },
  { month: "ก.ย.", revenue: 75600, orders: 40, customers: 33 },
  { month: "ต.ค.", revenue: 81200, orders: 42, customers: 35 },
  { month: "พ.ย.", revenue: 78900, orders: 41, customers: 34 },
  { month: "ธ.ค.", revenue: 89400, orders: 47, customers: 38 },
]

const productCategoryData = [
  { name: "ผ้าคลุมโซฟา", value: 65, color: "hsl(345, 85%, 35%)" },
  { name: "อุปกรณ์เสริม", value: 25, color: "hsl(345, 75%, 45%)" },
  { name: "น้ำยาทำความสะอาด", value: 10, color: "hsl(345, 65%, 55%)" },
]

const customerSegmentData = [
  { segment: "ลูกค้าใหม่", count: 45, percentage: 35, revenue: 89500 },
  { segment: "ลูกค้าประจำ", count: 38, percentage: 30, revenue: 156800 },
  { segment: "ลูกค้าพรีเมียม", count: 28, percentage: 22, revenue: 234600 },
  { segment: "ลูกค้า VIP", count: 17, percentage: 13, revenue: 345200 },
]

const topProducts = [
  {
    name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    sales: 89,
    revenue: 258100,
    growth: 15.2,
    category: "covers",
  },
  {
    name: "ผ้าคลุมโซฟากันน้ำ",
    sales: 67,
    revenue: 134000,
    growth: 8.7,
    category: "covers",
  },
  {
    name: "หมอนอิงลายเดียวกัน",
    sales: 156,
    revenue: 54600,
    growth: -2.1,
    category: "accessories",
  },
  {
    name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
    sales: 34,
    revenue: 142800,
    growth: 22.5,
    category: "covers",
  },
  {
    name: "คลิปยึดผ้าคลุมโซฟา",
    sales: 234,
    revenue: 28080,
    growth: 5.3,
    category: "accessories",
  },
]

const dailySalesData = [
  { day: "จ.", sales: 12500, orders: 8 },
  { day: "อ.", sales: 15200, orders: 10 },
  { day: "พ.", sales: 18900, orders: 12 },
  { day: "พฤ.", sales: 16700, orders: 11 },
  { day: "ศ.", sales: 21300, orders: 14 },
  { day: "ส.", sales: 28400, orders: 18 },
  { day: "อา.", sales: 25600, orders: 16 },
]

const timeRanges = [
  { id: "7d", name: "7 วันล่าสุด" },
  { id: "30d", name: "30 วันล่าสุด" },
  { id: "3m", name: "3 เดือนล่าสุด" },
  { id: "6m", name: "6 เดือนล่าสุด" },
  { id: "1y", name: "1 ปีล่าสุด" },
]

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("th-TH").format(num)
  }

  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
  }

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0)
  const totalCustomers = salesData.reduce((sum, item) => sum + item.customers, 0)
  const averageOrderValue = totalRevenue / totalOrders

  const tabs = [
    { id: "overview", name: "ภาพรวม", icon: BarChart3 },
    { id: "sales", name: "ยอดขาย", icon: DollarSign },
    { id: "products", name: "สินค้า", icon: Package },
    { id: "customers", name: "ลูกค้า", icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงานและสถิติ</h1>
          <p className="text-gray-600 mt-1">วิเคราะห์ข้อมูลธุรกิจและประสิทธิภาพการขาย</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {timeRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.name}
              </option>
            ))}
          </select>
          <Button variant="outline" className="border-primary text-primary hover:bg-accent bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">+12.5%</span>
                      <span className="text-sm text-gray-500 ml-1">จากเดือนที่แล้ว</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">คำสั่งซื้อ</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(totalOrders)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-primary mr-1" />
                      <span className="text-sm font-medium text-primary">+8.2%</span>
                      <span className="text-sm text-gray-500 ml-1">จากเดือนที่แล้ว</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ลูกค้า</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(totalCustomers)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                      <span className="text-sm font-medium text-purple-600">+15.3%</span>
                      <span className="text-sm text-gray-500 ml-1">จากเดือนที่แล้ว</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ค่าเฉลี่ยต่อคำสั่ง</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(averageOrderValue)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
                      <span className="text-sm font-medium text-orange-600">+3.7%</span>
                      <span className="text-sm text-gray-500 ml-1">จากเดือนที่แล้ว</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">รายได้รายเดือน</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "revenue" ? formatPrice(value) : value,
                        name === "revenue" ? "รายได้" : "คำสั่งซื้อ",
                      ]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(345, 85%, 35%)" name="รายได้" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="คำสั่งซื้อ" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Product Categories */}
            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">สัดส่วนหมวดหมู่สินค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Sales */}
          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle>ยอดขายรายวัน (7 วันล่าสุด)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "sales" ? formatPrice(value) : value,
                      name === "sales" ? "ยอดขาย" : "คำสั่งซื้อ",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="ยอดขาย" />
                  <Bar dataKey="orders" fill="#82ca9d" name="คำสั่งซื้อ" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Sales Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ยอดขายวันนี้</p>
                    <p className="text-2xl font-bold text-gray-900">฿28,450</p>
                    <p className="text-sm text-green-600 mt-1">+15.2% จากเมื่อวาน</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ยอดขายเดือนนี้</p>
                    <p className="text-2xl font-bold text-gray-900">฿456,780</p>
                    <p className="text-sm text-primary mt-1">67% ของเป้าหมาย</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">เป้าหมายเดือนนี้</p>
                    <p className="text-2xl font-bold text-gray-900">฿680,000</p>
                    <p className="text-sm text-orange-600 mt-1">เหลือ ฿223,220</p>
                  </div>
                  <Package className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart */}
          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle className="text-primary">แนวโน้มยอดขาย</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatPrice(value), "รายได้"]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(345, 85%, 35%)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales by Channel */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">ช่องทางการขาย</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">เว็บไซต์</h4>
                      <p className="text-sm text-gray-600">ขายผ่านเว็บไซต์หลัก</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">฿345,600</p>
                      <p className="text-sm text-gray-500">75.6%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Facebook</h4>
                      <p className="text-sm text-gray-600">ขายผ่าน Facebook Page</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">฿89,200</p>
                      <p className="text-sm text-gray-500">19.5%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">LINE</h4>
                      <p className="text-sm text-gray-600">ขายผ่าน LINE Official</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">฿22,400</p>
                      <p className="text-sm text-gray-500">4.9%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">วิธีการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">โอนเงิน</h4>
                      <p className="text-sm text-gray-600">โอนผ่านธนาคาร</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">234 คำสั่ง</p>
                      <p className="text-sm text-gray-500">68.2%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">พร้อมเพย์</h4>
                      <p className="text-sm text-gray-600">ชำระผ่าน QR Code</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">89 คำสั่ง</p>
                      <p className="text-sm text-gray-500">25.9%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">เก็บเงินปลายทาง</h4>
                      <p className="text-sm text-gray-600">ชำระเมื่อได้รับสินค้า</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">20 คำสั่ง</p>
                      <p className="text-sm text-gray-500">5.9%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Product Performance */}
          <Card>
            <CardHeader>
              <CardTitle>สินค้าขายดี</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">สินค้า</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">หมวดหมู่</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดขาย</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">รายได้</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">การเติบโต</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-500">อันดับ {index + 1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{product.category === "covers" ? "ผ้าคลุมโซฟา" : "อุปกรณ์เสริม"}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900">{product.sales}</span>
                          <span className="text-sm text-gray-500 ml-1">ชิ้น</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-pink-600">{formatPrice(product.revenue)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {product.growth > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                            )}
                            <span className={`font-medium ${product.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                              {product.growth > 0 ? "+" : ""}
                              {product.growth.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Product Categories Performance */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ประสิทธิภาพหมวดหมู่</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สินค้าที่ต้องเติมสต็อก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-semibold text-gray-900">คลิปยึดผ้าคลุมโซฟา</h4>
                      <p className="text-sm text-red-600">เหลือ 3 ชิ้น</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">เร่งด่วน</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <h4 className="font-semibold text-gray-900">หมอนอิงลายเดียวกัน</h4>
                      <p className="text-sm text-yellow-600">เหลือ 8 ชิ้น</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">ต่ำ</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <h4 className="font-semibold text-gray-900">น้ำยาทำความสะอาดผ้า</h4>
                      <p className="text-sm text-orange-600">เหลือ 12 ชิ้น</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">ปานกลาง</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>กลุ่มลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customerSegmentData.map((segment, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{segment.segment}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">จำนวน:</span>
                        <span className="font-medium">{segment.count} คน</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">สัดส่วน:</span>
                        <span className="font-medium">{segment.percentage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">รายได้:</span>
                        <span className="font-bold text-pink-600">{formatPrice(segment.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Acquisition */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>การได้มาของลูกค้าใหม่</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Google Search</h4>
                      <p className="text-sm text-gray-600">ค้นหาผ่าน Google</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">45 คน</p>
                      <p className="text-sm text-gray-500">38.5%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Facebook Ads</h4>
                      <p className="text-sm text-gray-600">โฆษณาใน Facebook</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">32 คน</p>
                      <p className="text-sm text-gray-500">27.4%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">แนะนำจากเพื่อน</h4>
                      <p className="text-sm text-gray-600">Word of mouth</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">28 คน</p>
                      <p className="text-sm text-gray-500">23.9%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">อื่นๆ</h4>
                      <p className="text-sm text-gray-600">ช่องทางอื่น</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">12 คน</p>
                      <p className="text-sm text-gray-500">10.2%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ความพึงพอใจลูกค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-pink-600 mb-2">4.8</div>
                    <div className="flex justify-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-6 h-6 ${star <= 4.8 ? "text-yellow-400" : "text-gray-300"} fill-current`}
                        >
                          ⭐
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">จาก 234 รีวิว</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-8">5⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">78%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-8">4⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">15%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-8">3⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "5%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">5%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-8">2⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "1%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">1%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm w-8">1⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "1%" }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
