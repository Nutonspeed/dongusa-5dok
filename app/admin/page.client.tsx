"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, Eye, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import loadable from "next/dynamic"

const AdminAnalytics = loadable(() => import("./analytics/page"), {
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg"></div>,
})

const AdminOrders = loadable(() => import("./orders/page"), {
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg"></div>,
})

const AdminCustomers = loadable(() => import("./customers/page"), {
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg"></div>,
})

const AdminInventory = loadable(() => import("./inventory/page"), {
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg"></div>,
})

function AdminDashboardClient({ summary }: { summary: { orders: number; revenue: number } }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [analytics, setAnalytics] = useState({
    totalOrders: {
      title: "คำสั่งซื้อทั้งหมด",
      value: String(summary.orders),
      change: "+12.5%",
      changeType: "increase",
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-accent",
    },
    totalRevenue: {
      title: "รายได้รวม",
      value: `฿${summary.revenue}`,
      change: "+8.2%",
      changeType: "increase",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    totalCustomers: {
      title: "ลูกค้าทั้งหมด",
      value: "156",
      change: "+15.3%",
      changeType: "increase",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    totalProducts: {
      title: "สินค้าทั้งหมด",
      value: "89",
      change: "+3.1%",
      changeType: "increase",
      icon: Package,
      color: "text-accent",
      bgColor: "bg-accent/30",
    },
  })

  const [recentOrders] = useState([
    {
      id: "ORD-001",
      customer: "คุณสมชาย ใจดี",
      product: "ผ้าคลุมโซฟากำมะหยี่",
      amount: "฿2,890",
      status: "รอจัดส่ง",
      statusColor: "bg-accent/20 text-accent-foreground",
      time: "2 นาทีที่แล้ว",
    },
    {
      id: "ORD-002",
      customer: "คุณมาลี สวยงาม",
      product: "ผ้าคลุมโซฟากันน้ำ",
      amount: "฿1,950",
      status: "จัดส่งแล้ว",
      statusColor: "bg-primary/20 text-primary",
      time: "15 นาทีที่แล้ว",
    },
    {
      id: "ORD-003",
      customer: "คุณสมศรี ดีใจ",
      product: "หมอนอิงลายเดียวกัน",
      amount: "฿350",
      status: "สำเร็จ",
      statusColor: "bg-accent text-accent-foreground",
      time: "1 ชั่วโมงที่แล้ว",
    },
  ])

  const [topProducts] = useState([
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
  ])

  const [activeComponent, setActiveComponent] = useState<string | null>(null)

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
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-sans">ภาพรวมธุรกิจและข้อมูลสำคัญ</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground font-sans">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        {Object.keys(analytics).map((key, index) => {
          const stat = (analytics as any)[key]
          return (
            <Card key={index} className="card-interactive border-border bg-card primary-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-sans">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-2 font-serif">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === "increase" ? (
                        <TrendingUp className="w-4 h-4 text-accent mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium font-sans ${
                          stat.changeType === "increase" ? "text-accent" : "text-destructive"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1 font-sans">จากเมื่อวาน</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card primary-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-foreground">คำสั่งซื้อล่าสุด</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-accent hover:text-accent-foreground font-serif font-semibold bg-transparent"
                onClick={() => setActiveComponent(activeComponent === "orders" ? null : "orders")}
              >
                <Eye className="w-4 h-4 mr-2" />
                ดูทั้งหมด
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-serif font-semibold text-foreground">{order.id}</h4>
                        <Badge className={order.statusColor}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 font-sans">{order.customer}</p>
                      <p className="text-sm text-muted-foreground font-sans">{order.product}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary font-serif">{order.amount}</span>
                        <span className="text-xs text-muted-foreground font-sans">{order.time}</span>
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
          <Card className="border-border bg-card primary-shadow">
            <CardHeader>
              <CardTitle className="font-serif text-foreground">กิจกรรมล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0`}>
                      <ShoppingCart className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-sans">
                        คำสั่งซื้อใหม่ {order.id} จาก {order.customer}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-sans">{order.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Products */}
      <Card className="border-border bg-card primary-shadow">
        <CardHeader>
          <CardTitle className="font-serif text-foreground">สินค้าขายดี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topProducts.map((product: any, index: number) => (
              <div key={index} className="p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif font-semibold text-foreground text-sm line-clamp-2">{product.name}</h4>
                  {product.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-accent flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive flex-shrink-0" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-sans">ขาย:</span>
                    <span className="font-medium font-sans">{product.sales} ชิ้น</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-sans">รายได้:</span>
                    <span className="font-bold text-primary font-serif">{product.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border bg-card primary-shadow">
        <CardHeader>
          <CardTitle className="font-serif text-foreground">การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-20 flex-col space-y-2 bg-primary hover:bg-primary/90 text-primary-foreground btn-enhanced font-serif font-semibold"
              onClick={() => setActiveComponent(activeComponent === "inventory" ? null : "inventory")}
            >
              <Package className="w-6 h-6" />
              <span>เพิ่มสินค้าใหม่</span>
            </Button>
            <Button
              className="h-20 flex-col space-y-2 bg-accent hover:bg-accent/90 text-accent-foreground btn-enhanced font-serif font-semibold"
              onClick={() => setActiveComponent(activeComponent === "orders" ? null : "orders")}
            >
              <ShoppingCart className="w-6 h-6" />
              <span>ดูคำสั่งซื้อ</span>
            </Button>
            <Button
              className="h-20 flex-col space-y-2 bg-primary/80 hover:bg-primary text-primary-foreground btn-enhanced font-serif font-semibold"
              onClick={() => setActiveComponent(activeComponent === "customers" ? null : "customers")}
            >
              <Users className="w-6 h-6" />
              <span>จัดการลูกค้า</span>
            </Button>
            <Button
              className="h-20 flex-col space-y-2 bg-accent/80 hover:bg-accent text-accent-foreground btn-enhanced font-serif font-semibold"
              onClick={() => setActiveComponent(activeComponent === "analytics" ? null : "analytics")}
            >
              <TrendingUp className="w-6 h-6" />
              <span>ดูรายงาน</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeComponent && (
        <Card className="border-border bg-card primary-shadow animate-scale-in">
          <CardContent className="p-6">
            {activeComponent === "analytics" && <AdminAnalytics />}
            {activeComponent === "orders" && <AdminOrders />}
            {activeComponent === "customers" && <AdminCustomers />}
            {activeComponent === "inventory" && <AdminInventory />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminDashboardClient
