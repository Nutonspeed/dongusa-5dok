"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  MessageCircle,
  Star,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for dashboard
const dashboardStats = [
  {
    title: "ยอดขายวันนี้",
    value: "฿45,230",
    change: "+12.5%",
    changeType: "increase" as const,
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "คำสั่งซื้อใหม่",
    value: "23",
    change: "+8.2%",
    changeType: "increase" as const,
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "ลูกค้าใหม่",
    value: "12",
    change: "-2.1%",
    changeType: "decrease" as const,
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "สินค้าในสต็อก",
    value: "156",
    change: "+5.3%",
    changeType: "increase" as const,
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "คุณสมชาย ใจดี",
    product: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    amount: "฿2,890",
    status: "รอดำเนินการ",
    statusColor: "bg-yellow-100 text-yellow-800",
    time: "10 นาทีที่แล้ว",
  },
  {
    id: "ORD-002",
    customer: "คุณสมหญิง รักสวย",
    product: "ผ้าคลุมโซฟากันน้ำ + หมอนอิง",
    amount: "฿1,950",
    status: "กำลังผลิต",
    statusColor: "bg-blue-100 text-blue-800",
    time: "25 นาทีที่แล้ว",
  },
  {
    id: "ORD-003",
    customer: "คุณสมศักดิ์ มีเงิน",
    product: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
    amount: "฿4,200",
    status: "จัดส่งแล้ว",
    statusColor: "bg-green-100 text-green-800",
    time: "1 ชั่วโมงที่แล้ว",
  },
  {
    id: "ORD-004",
    customer: "คุณสมปอง ชอบช้อป",
    product: "น้ำยาทำความสะอาดผ้า",
    amount: "฿280",
    status: "เสร็จสิ้น",
    statusColor: "bg-gray-100 text-gray-800",
    time: "2 ชั่วโมงที่แล้ว",
  },
]

const topProducts = [
  {
    name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    sales: 45,
    revenue: "฿130,050",
    trend: "up",
  },
  {
    name: "ผ้าคลุมโซฟากันน้ำ",
    sales: 38,
    revenue: "฿74,100",
    trend: "up",
  },
  {
    name: "หมอนอิงลายเดียวกัน",
    sales: 67,
    revenue: "฿23,450",
    trend: "down",
  },
  {
    name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
    sales: 12,
    revenue: "฿50,400",
    trend: "up",
  },
]

const recentActivities = [
  {
    type: "order",
    message: "คำสั่งซื้อใหม่ #ORD-001 จากคุณสมชาย",
    time: "5 นาทีที่แล้ว",
    icon: ShoppingCart,
    color: "text-blue-600",
  },
  {
    type: "review",
    message: "รีวิว 5 ดาวจากคุณสมหญิง",
    time: "15 นาทีที่แล้ว",
    icon: Star,
    color: "text-yellow-600",
  },
  {
    type: "inquiry",
    message: "คำถามใหม่เกี่ยวกับผ้าคลุมโซฟาลินิน",
    time: "30 นาทีที่แล้ว",
    icon: MessageCircle,
    color: "text-green-600",
  },
  {
    type: "stock",
    message: "สินค้า 'คลิปยึดผ้า' ใกล้หมด (เหลือ 5 ชิ้น)",
    time: "1 ชั่วโมงที่แล้ว",
    icon: Package,
    color: "text-red-600",
  },
]

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดshboard</h1>
          <p className="text-gray-600 mt-1">ภาพรวมธุรกิจและข้อมูลสำคัญ</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === "increase" ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">จากเมื่อวาน</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                ดูทั้งหมด
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{order.id}</h4>
                        <Badge className={order.statusColor}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.product}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-pink-600">{order.amount}</span>
                        <span className="text-xs text-gray-400">{order.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>กิจกรรมล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>สินค้าขายดี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topProducts.map((product, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h4>
                  {product.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ขาย:</span>
                    <span className="font-medium">{product.sales} ชิ้น</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">รายได้:</span>
                    <span className="font-bold text-pink-600">{product.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Package className="w-6 h-6" />
              <span>เพิ่มสินค้าใหม่</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <ShoppingCart className="w-6 h-6" />
              <span>ดูคำสั่งซื้อ</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <Users className="w-6 h-6" />
              <span>จัดการลูกค้า</span>
            </Button>
            <Button className="h-20 flex-col space-y-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              <TrendingUp className="w-6 h-6" />
              <span>ดูรายงาน</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
