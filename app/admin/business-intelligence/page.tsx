"use client"

import { useState } from "react"
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Brain,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data for Business Intelligence
const realTimeMetrics = {
  revenue: {
    current: 125000,
    previous: 118000,
    target: 130000,
    trend: "up",
    change: 5.9,
  },
  orders: {
    current: 89,
    previous: 76,
    target: 95,
    trend: "up",
    change: 17.1,
  },
  customers: {
    current: 234,
    previous: 221,
    target: 250,
    trend: "up",
    change: 5.9,
  },
  inventory: {
    current: 1250,
    previous: 1180,
    target: 1300,
    trend: "up",
    change: 5.9,
  },
}

const automatedInsights = [
  {
    id: "1",
    type: "opportunity",
    priority: "high",
    title: "ลูกค้า VIP เพิ่มขึ้น 25%",
    description: "ลูกค้า VIP เพิ่มขึ้นอย่างมีนัยสำคัญในเดือนนี้ ควรเพิ่มโปรโมชั่นพิเศษสำหรับกลุ่มนี้",
    impact: "revenue_increase",
    estimated_value: 15000,
    confidence: 92,
    action_required: true,
    created_at: "2024-01-25T10:30:00Z",
  },
  {
    id: "2",
    type: "warning",
    priority: "medium",
    title: "สต็อกผ้าสีน้ำเงินใกล้หมด",
    description: "ผ้าคลุมโซฟาสีน้ำเงินเหลือเพียง 15 ชิ้น คาดว่าจะหมดภายใน 7 วัน",
    impact: "stock_shortage",
    estimated_value: -8000,
    confidence: 88,
    action_required: true,
    created_at: "2024-01-25T09:15:00Z",
  },
  {
    id: "3",
    type: "trend",
    priority: "low",
    title: "แนวโน้มการขายผ้าลายดอกเพิ่มขึ้น",
    description: "ผ้าลายดอกมีแนวโน้มการขายเพิ่มขึ้น 35% เมื่อเทียบกับเดือนที่แล้ว",
    impact: "trend_positive",
    estimated_value: 5000,
    confidence: 76,
    action_required: false,
    created_at: "2024-01-25T08:45:00Z",
  },
]

const predictiveAnalytics = {
  next_month_revenue: {
    predicted: 142000,
    confidence: 85,
    factors: ["seasonal_trend", "customer_growth", "promotion_impact"],
  },
  customer_churn_risk: {
    high_risk: 12,
    medium_risk: 28,
    low_risk: 194,
    total_customers: 234,
  },
  inventory_forecast: {
    reorder_needed: [
      { product: "ผ้าคลุมโซฟาสีน้ำเงิน", days_until_stockout: 7, recommended_order: 50 },
      { product: "ผ้าคลุมโซฟาลายดอก", days_until_stockout: 14, recommended_order: 30 },
    ],
  },
}

const performanceAlerts = [
  {
    id: "alert_1",
    type: "critical",
    title: "ยอดขายต่ำกว่าเป้าหมาย",
    message: "ยอดขายสัปดาห์นี้ต่ำกว่าเป้าหมาย 15% ต้องการการดำเนินการเร่งด่วน",
    timestamp: "2024-01-25T11:00:00Z",
    status: "active",
  },
  {
    id: "alert_2",
    type: "warning",
    title: "ลูกค้าใหม่ลดลง",
    message: "จำนวนลูกค้าใหม่ลดลง 8% เมื่อเทียบกับสัปดาห์ที่แล้ว",
    timestamp: "2024-01-25T10:30:00Z",
    status: "active",
  },
  {
    id: "alert_3",
    type: "info",
    title: "โปรโมชั่นมีประสิทธิภาพดี",
    message: "โปรโมชั่นส่วนลด 20% มีอัตราการแปลงสูงถึง 12%",
    timestamp: "2024-01-25T09:45:00Z",
    status: "resolved",
  },
]

const executiveSummary = {
  period: "มกราคม 2024",
  highlights: [
    "รายได้เพิ่มขึ้น 5.9% เมื่อเทียบกับเดือนที่แล้ว",
    "ลูกค้าใหม่เพิ่มขึ้น 17.1% จากแคมเปญการตลาดออนไลน์",
    "ผลิตภัณฑ์ขายดี: ผ้าคลุมโซฟาลายดอก (+35%)",
    "ความพึงพอใจลูกค้าอยู่ที่ 4.8/5.0",
  ],
  concerns: ["สต็อกผ้าสีน้ำเงินใกล้หมด ต้องสั่งเพิ่ม", "ลูกค้าเสี่ยงหาย 12 ราย ต้องติดตามเร่งด่วน", "ต้นทุนการจัดส่งเพิ่มขึ้น 3.2%"],
  recommendations: [
    "เพิ่มสต็อกผ้าสีน้ำเงินและลายดอก",
    "สร้างแคมเปญ Win-back สำหรับลูกค้าเสี่ยงหาย",
    "ปรับปรุงกระบวนการจัดส่งเพื่อลดต้นทุน",
    "ขยายโปรโมชั่นที่มีประสิทธิภาพดี",
  ],
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(price)

const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`

const getInsightIcon = (type: string) => {
  switch (type) {
    case "opportunity":
      return <TrendingUp className="w-5 h-5 text-green-600" />
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    case "trend":
      return <Activity className="w-5 h-5 text-blue-600" />
    default:
      return <Brain className="w-5 h-5 text-gray-600" />
  }
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case "critical":
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    case "info":
      return <Activity className="w-5 h-5 text-blue-600" />
    default:
      return <Activity className="w-5 h-5 text-gray-600" />
  }
}

export default function BusinessIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบวิเคราะห์ธุรกิจอัตโนมัติและการพยากรณ์</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}</div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {performanceAlerts.filter((alert) => alert.type === "critical" && alert.status === "active").length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>แจ้งเตือนเร่งด่วน:</strong>{" "}
            {performanceAlerts.find((alert) => alert.type === "critical" && alert.status === "active")?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">รายได้</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(realTimeMetrics.revenue.current)}</p>
                <div className="flex items-center mt-1">
                  {realTimeMetrics.revenue.trend === "up" ? (
                    <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      realTimeMetrics.revenue.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatPercent(realTimeMetrics.revenue.change)}
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress
                value={(realTimeMetrics.revenue.current / realTimeMetrics.revenue.target) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">เป้าหมาย: {formatPrice(realTimeMetrics.revenue.target)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">คำสั่งซื้อ</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.orders.current}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {formatPercent(realTimeMetrics.orders.change)}
                  </span>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress
                value={(realTimeMetrics.orders.current / realTimeMetrics.orders.target) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">เป้าหมาย: {realTimeMetrics.orders.target}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ลูกค้า</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.customers.current}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {formatPercent(realTimeMetrics.customers.change)}
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Progress
                value={(realTimeMetrics.customers.current / realTimeMetrics.customers.target) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">เป้าหมาย: {realTimeMetrics.customers.target}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">สต็อก</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.inventory.current}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {formatPercent(realTimeMetrics.inventory.change)}
                  </span>
                </div>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Progress
                value={(realTimeMetrics.inventory.current / realTimeMetrics.inventory.target) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">เป้าหมาย: {realTimeMetrics.inventory.target}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">การพยากรณ์</TabsTrigger>
          <TabsTrigger value="alerts">แจ้งเตือน</TabsTrigger>
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  ประสิทธิภาพธุรกิจ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium">รายได้เพิ่มขึ้น</span>
                    </div>
                    <span className="font-bold text-green-600">+5.9%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">ลูกค้าใหม่เพิ่มขึ้น</span>
                    </div>
                    <span className="font-bold text-blue-600">+17.1%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">เป้าหมายรายได้</span>
                    </div>
                    <span className="font-bold text-purple-600">96.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  การกระจายรายได้
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ผ้าคลุมโซฟาลายดอก</span>
                    <span className="font-bold text-pink-600">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ผ้าคลุมโซฟาสีพื้น</span>
                    <span className="font-bold text-blue-600">28%</span>
                  </div>
                  <Progress value={28} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ผ้าคลุมโซฟาลายทาง</span>
                    <span className="font-bold text-green-600">22%</span>
                  </div>
                  <Progress value={22} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">อื่นๆ</span>
                    <span className="font-bold text-gray-600">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                แนวโน้มรายสัปดาห์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-7 gap-4 text-center">
                {["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"].map((day, index) => (
                  <div key={day} className="p-3 border rounded-lg">
                    <div className="text-sm font-medium text-gray-600">{day}</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {formatPrice(15000 + Math.random() * 10000)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">+{(Math.random() * 10).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Insights อัตโนมัติ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automatedInsights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            insight.priority === "high"
                              ? "destructive"
                              : insight.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {insight.priority === "high" ? "สูง" : insight.priority === "medium" ? "กลาง" : "ต่ำ"}
                        </Badge>
                        {insight.action_required && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                            ต้องดำเนินการ
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {insight.estimated_value > 0 ? "+" : ""}
                          {formatPrice(insight.estimated_value)}
                        </div>
                        <div className="text-sm text-blue-700">ผลกระทบประมาณ</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{insight.confidence}%</div>
                        <div className="text-sm text-green-700">ความมั่นใจ</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {new Date(insight.created_at).toLocaleDateString("th-TH")}
                        </div>
                        <div className="text-sm text-purple-700">วันที่ตรวจพบ</div>
                      </div>
                    </div>
                    {insight.action_required && (
                      <div className="mt-4 pt-4 border-t">
                        <Button size="sm" className="mr-2">
                          <Eye className="w-4 h-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                        <Button size="sm" variant="outline">
                          ดำเนินการ
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  การพยากรณ์รายได้
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(predictiveAnalytics.next_month_revenue.predicted)}
                    </div>
                    <div className="text-sm text-gray-600">รายได้เดือนหน้า (คาดการณ์)</div>
                    <div className="text-sm text-green-600 mt-1">
                      ความมั่นใจ {predictiveAnalytics.next_month_revenue.confidence}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">ปัจจัยที่มีผลต่อการพยากรณ์:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• แนวโน้มตามฤดูกาล</li>
                      <li>• การเติบโตของลูกค้า</li>
                      <li>• ผลกระทบจากโปรโมชั่น</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ความเสี่ยงลูกค้าหาย
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {predictiveAnalytics.customer_churn_risk.high_risk}
                      </div>
                      <div className="text-sm text-red-700">เสี่ยงสูง</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {predictiveAnalytics.customer_churn_risk.medium_risk}
                      </div>
                      <div className="text-sm text-yellow-700">เสี่ยงกลาง</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {predictiveAnalytics.customer_churn_risk.low_risk}
                      </div>
                      <div className="text-sm text-green-700">เสี่ยงต่ำ</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button size="sm" className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      สร้างแคมเปญ Win-back
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                การพยากรณ์สต็อก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveAnalytics.inventory_forecast.reorder_needed.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{item.product}</h4>
                      <p className="text-sm text-gray-600">จะหมดภายใน {item.days_until_stockout} วัน</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">แนะนำสั่ง: {item.recommended_order} ชิ้น</div>
                      <Button size="sm" className="mt-2">
                        สั่งซื้อเลย
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                แจ้งเตือนประสิทธิภาพ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.status === "active" ? "destructive" : "secondary"}>
                            {alert.status === "active" ? "ใช้งาน" : "แก้ไขแล้ว"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString("th-TH")}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{alert.message}</p>
                      {alert.status === "active" && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline">
                            ดำเนินการ
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Executive Summary - {executiveSummary.period}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-green-700">จุดเด่น</h3>
                  <ul className="space-y-2">
                    {executiveSummary.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4 text-yellow-700">ข้อกังวล</h3>
                  <ul className="space-y-2">
                    {executiveSummary.concerns.map((concern, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4 text-blue-700">คำแนะนำ</h3>
                  <ul className="space-y-2">
                    {executiveSummary.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>KPI สำคัญ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Revenue Growth</span>
                    <span className="font-bold text-green-600">+5.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Customer Acquisition</span>
                    <span className="font-bold text-blue-600">+17.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Customer Satisfaction</span>
                    <span className="font-bold text-purple-600">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Inventory Turnover</span>
                    <span className="font-bold text-orange-600">2.3x</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>การดำเนินการที่แนะนำ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    สั่งซื้อสต็อกเร่งด่วน
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    สร้างแคมเปญ Win-back
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    ขยายโปรโมชั่นที่ดี
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    ปรับปรุงกระบวนการจัดส่ง
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
