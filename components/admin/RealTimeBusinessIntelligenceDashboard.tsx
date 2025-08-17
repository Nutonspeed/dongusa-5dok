"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
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
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Target,
  Brain,
  Zap,
  Activity,
  Eye,
} from "lucide-react"

interface MetricData {
  label: string
  value: string | number
  change: number
  trend: "up" | "down" | "stable"
  icon: React.ReactNode
}

interface ChartData {
  name: string
  value: number
  revenue?: number
  orders?: number
  customers?: number
  conversion?: number
}

const RealTimeBusinessIntelligenceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const realTimeMetrics: MetricData[] = [
    {
      label: "รายได้วันนี้",
      value: "฿45,280",
      change: 12.5,
      trend: "up",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "คำสั่งซื้อใหม่",
      value: 127,
      change: 8.2,
      trend: "up",
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      label: "ลูกค้าออนไลน์",
      value: 1234,
      change: -2.1,
      trend: "down",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "อัตราการแปลง",
      value: "3.8%",
      change: 15.3,
      trend: "up",
      icon: <Target className="h-4 w-4" />,
    },
  ]

  const salesData: ChartData[] = [
    { name: "จ", revenue: 12000, orders: 45, customers: 120, conversion: 3.2 },
    { name: "อ", revenue: 15000, orders: 52, customers: 135, conversion: 3.5 },
    { name: "พ", revenue: 18000, orders: 61, customers: 148, conversion: 3.8 },
    { name: "พฤ", revenue: 22000, orders: 68, customers: 162, conversion: 4.1 },
    { name: "ศ", revenue: 25000, orders: 75, customers: 178, conversion: 4.3 },
    { name: "ส", revenue: 28000, orders: 82, customers: 195, conversion: 4.5 },
    { name: "อา", revenue: 32000, orders: 89, customers: 210, conversion: 4.8 },
  ]

  const productData: ChartData[] = [
    { name: "ผ้าคลุมโซฟา", value: 45 },
    { name: "ผ้าคลุมเก้าอี้", value: 32 },
    { name: "ผ้าคลุมโต๊ะ", value: 28 },
    { name: "ผ้าคลุมเตียง", value: 18 },
    { name: "อื่นๆ", value: 12 },
  ]

  const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"]

  const aiInsights = [
    {
      type: "opportunity",
      title: "โอกาสเพิ่มยอดขาย",
      description: "ลูกค้าที่ซื้อผ้าคลุมโซฟามักซื้อผ้าคลุมเก้าอี้ด้วย แนะนำให้สร้าง bundle promotion",
      confidence: 87,
      impact: "สูง",
    },
    {
      type: "warning",
      title: "สต็อกใกล้หมด",
      description: "ผ้าคลุมโซฟาสีน้ำเงินเหลือ 15 ชิ้น คาดว่าจะหมดใน 3 วัน",
      confidence: 95,
      impact: "กลาง",
    },
    {
      type: "trend",
      title: "เทรนด์ที่เพิ่มขึ้น",
      description: 'การค้นหา "ผ้าคลุมกันน้ำ" เพิ่มขึ้น 45% ในสัปดาห์นี้',
      confidence: 78,
      impact: "กลาง",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-1">อัพเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}</p>
        </div>
        <Button onClick={refreshData} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
          {isLoading ? <Activity className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {realTimeMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
              <div className="text-purple-600">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="flex items-center mt-2">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : metric.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <Activity className="h-4 w-4 text-gray-500 mr-1" />
                )}
                <span
                  className={`text-sm ${
                    metric.trend === "up"
                      ? "text-green-600"
                      : metric.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">จากเมื่อวาน</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="sales">ยอดขาย</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="forecasting">พยากรณ์</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  รายได้รายวัน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`฿${value?.toLocaleString()}`, "รายได้"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  สัดส่วนสินค้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ประสิทธิภาพการขาย</CardTitle>
              <CardDescription>การวิเคราะห์ยอดขาย คำสั่งซื้อ และลูกค้า</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#8b5cf6" name="คำสั่งซื้อ" />
                  <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#f59e0b" name="อัตราการแปลง (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {aiInsights.map((insight, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      {insight.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.impact === "สูง" ? "destructive" : "secondary"}>{insight.impact}</Badge>
                      <Badge variant="outline">{insight.confidence}% แม่นยำ</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{insight.description}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>ความเชื่อมั่น</span>
                      <span>{insight.confidence}%</span>
                    </div>
                    <Progress value={insight.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                การพยากรณ์รายได้
              </CardTitle>
              <CardDescription>การคาดการณ์รายได้ 30 วันข้างหน้าโดยใช้ AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">฿1.2M</div>
                  <div className="text-sm text-gray-600">คาดการณ์รายได้เดือนนี้</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+18%</div>
                  <div className="text-sm text-gray-600">เติบโตจากเดือนที่แล้ว</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-gray-600">ความแม่นยำของโมเดล</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`฿${value?.toLocaleString()}`, "รายได้"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RealTimeBusinessIntelligenceDashboard
