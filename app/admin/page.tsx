"use client"

import type React from "react"

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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Dashboard statistics interface
interface DashboardStats {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease"
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

// System status interface
interface SystemStatus {
  database: "online" | "offline" | "warning"
  api: "online" | "offline" | "warning"
  email: "online" | "offline" | "warning"
  storage: "online" | "offline" | "warning"
}

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "online",
    api: "online",
    email: "online",
    storage: "online",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("📊 Loading dashboard data...")

        // Check system status
        const statusResponse = await fetch("/api/system/status")
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setSystemStatus(statusData.services || systemStatus)
        }

        // Load dashboard stats
        const statsResponse = await fetch("/api/dashboard/stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setDashboardData(statsData)
        }

        console.log("✅ Dashboard data loaded successfully")
      } catch (error) {
        console.error("❌ Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "offline":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Mock data for dashboard stats
  const dashboardStats: DashboardStats[] = [
    {
      title: "ยอดขายวันนี้",
      value: "฿45,230",
      change: "+12.5%",
      changeType: "increase",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "คำสั่งซื้อใหม่",
      value: "23",
      change: "+8.2%",
      changeType: "increase",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "ลูกค้าใหม่",
      value: "12",
      change: "-2.1%",
      changeType: "decrease",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "สินค้าในสต็อก",
      value: "156",
      change: "+5.3%",
      changeType: "increase",
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-600 mt-1">ภาพรวมธุรกิจและข้อมูลสำคัญ</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            สถานะระบบ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">ฐานข้อมูล</p>
                <Badge className={getStatusColor(systemStatus.database)}>{systemStatus.database}</Badge>
              </div>
              {getStatusIcon(systemStatus.database)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">API</p>
                <Badge className={getStatusColor(systemStatus.api)}>{systemStatus.api}</Badge>
              </div>
              {getStatusIcon(systemStatus.api)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">อีเมล</p>
                <Badge className={getStatusColor(systemStatus.email)}>{systemStatus.email}</Badge>
              </div>
              {getStatusIcon(systemStatus.email)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">จัดเก็บข้อมูล</p>
                <Badge className={getStatusColor(systemStatus.storage)}>{systemStatus.storage}</Badge>
              </div>
              {getStatusIcon(systemStatus.storage)}
            </div>
          </div>
        </CardContent>
      </Card>

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
