"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Line,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  AlertTriangle,
  Target,
  Brain,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react"
import { advancedAnalytics, type AdvancedMetrics, type BusinessIntelligence } from "@/lib/advanced-analytics-service"

const COLORS = ["#ec4899", "#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

export default function AdvancedAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null)
  const [intelligence, setIntelligence] = useState<BusinessIntelligence | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const dashboardData = await advancedAnalytics.getRealTimeDashboard()
      setMetrics(dashboardData.metrics)
      setIntelligence(dashboardData.intelligence)
      setLastUpdated(new Date(dashboardData.last_updated))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadDashboardData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount)
  }

  const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "trend":
        return <Activity className="w-5 h-5 text-blue-600" />
      case "anomaly":
        return <Zap className="w-5 h-5 text-purple-600" />
      default:
        return <Brain className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบวิเคราะห์ข้อมูลขั้นสูงและ Business Intelligence</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>
      </div>

          {/* Critical Alerts */}
          {(intelligence?.kpi_alerts ?? []).filter((alert) => alert.status === "critical").length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>แจ้งเตือนเร่งด่วน:</strong>{" "}
                {(intelligence?.kpi_alerts ?? []).find((alert) => alert.status === "critical")?.message}
              </AlertDescription>
            </Alert>
          )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รายได้</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.revenue.current)}</p>
                  <div className="flex items-center mt-1">
                    {metrics.revenue.growth > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        metrics.revenue.growth > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercent(metrics.revenue.growth)}
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4">
                <Progress value={(metrics.revenue.current / metrics.revenue.forecast) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">เป้าหมาย: {formatCurrency(metrics.revenue.forecast)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ลูกค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.customers.total}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-600">+{metrics.customers.new} ใหม่</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500">
                  <div>CLV: {formatCurrency(metrics.customers.lifetime_value)}</div>
                  <div>Churn Rate: {metrics.customers.churn_rate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">สินค้าขายได้</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.products.total_sold}</p>
                  <div className="flex items-center mt-1">
                    <Package className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium text-purple-600">
                      {metrics.products.low_stock_alerts.length} แจ้งเตือน
                    </span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">อัตราแปลง</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.operations.conversion_rate}%</p>
                  <div className="flex items-center mt-1">
                    <BarChart3 className="w-4 h-4 text-orange-600 mr-1" />
                    <span className="text-sm font-medium text-orange-600">
                      AOV: {formatCurrency(metrics.operations.average_order_value)}
                    </span>
                  </div>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">การพยากรณ์</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="abtests">A/B Testing</TabsTrigger>
          <TabsTrigger value="reports">รายงาน</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue & Performance Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  แนวโน้มรายได้และกำไร
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
                    data={[
                      { month: "ม.ค.", revenue: 125000, profit: 50000, orders: 89 },
                      { month: "ก.พ.", revenue: 142000, profit: 56800, orders: 95 },
                      { month: "มี.ค.", revenue: 138000, profit: 55200, orders: 92 },
                      { month: "เม.ย.", revenue: 156000, profit: 62400, orders: 104 },
                      { month: "พ.ค.", revenue: 148000, profit: 59200, orders: 98 },
                      { month: "มิ.ย.", revenue: 167000, profit: 66800, orders: 112 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any, name: string) => [formatCurrency(value), name]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#ec4899" name="รายได้" />
                    <Bar dataKey="profit" fill="#f43f5e" name="กำไร" />
                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="คำสั่งซื้อ" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  การกระจายลูกค้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "ลูกค้าใหม่", value: 45, color: "#ec4899" },
                        { name: "ลูกค้าเก่า", value: 189, color: "#3b82f6" },
                        { name: "VIP", value: 28, color: "#10b981" },
                        { name: "ไม่ใช้งาน", value: 15, color: "#6b7280" },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "ลูกค้าใหม่", value: 45, color: "#ec4899" },
                        { name: "ลูกค้าเก่า", value: 189, color: "#3b82f6" },
                        { name: "VIP", value: 28, color: "#10b981" },
                        { name: "ไม่ใช้งาน", value: 15, color: "#6b7280" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Products Performance */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>สินค้าขายดี</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.products.top_performers.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-pink-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.sales} ชิ้น</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-pink-600">{formatCurrency(product.revenue)}</div>
                        <div className="flex items-center text-sm">
                          {product.growth > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                          )}
                          <span className={product.growth > 0 ? "text-green-600" : "text-red-600"}>
                            {formatPercent(product.growth)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {intelligence && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Powered Business Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intelligence.insights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getInsightIcon(insight.type)}
                          <div>
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority === "high" ? "สูง" : insight.priority === "medium" ? "กลาง" : "ต่ำ"}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{insight.impact_score}/10</div>
                          <div className="text-sm text-blue-700">Impact Score</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{insight.confidence}%</div>
                          <div className="text-sm text-green-700">ความมั่นใจ</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {new Date(insight.created_at).toLocaleDateString("th-TH")}
                          </div>
                          <div className="text-sm text-purple-700">วันที่ตรวจพบ</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">การดำเนินการที่แนะนำ:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {insight.recommended_actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button size="sm" className="mr-2">
                          <Eye className="w-4 h-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                        <Button size="sm" variant="outline">
                          ดำเนินการ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {intelligence && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    การพยากรณ์รายได้
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(intelligence.predictions.next_month_revenue.amount)}
                    </div>
                    <div className="text-sm text-gray-600">รายได้เดือนหน้า (คาดการณ์)</div>
                    <div className="text-sm text-green-600 mt-1">
                      ความมั่นใจ {intelligence.predictions.next_month_revenue.confidence}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">ปัจจัยที่มีผลต่อการพยากรณ์:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {intelligence.predictions.next_month_revenue.factors.map((factor, index) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {intelligence.predictions.customer_churn.high_risk_count}
                      </div>
                      <div className="text-sm text-red-700">เสี่ยงสูง</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {intelligence.predictions.customer_churn.medium_risk_count}
                      </div>
                      <div className="text-sm text-yellow-700">เสี่ยงกลาง</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">กลยุทธ์ป้องกัน:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {intelligence.predictions.customer_churn.prevention_strategies.map((strategy, index) => (
                        <li key={index}>• {strategy}</li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full mt-4">
                    <Target className="w-4 h-4 mr-2" />
                    สร้างแคมเปญ Win-back
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {intelligence && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  การพยากรณ์สต็อก
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intelligence.predictions.inventory_needs.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">จะหมดภายใน {item.days_until_stockout} วัน</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">แนะนำสั่ง: {item.recommended_order_quantity} ชิ้น</div>
                        <Button size="sm" className="mt-2">
                          สั่งซื้อเลย
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Analysis - การวิเคราะห์กลุ่มลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cohort Analysis</h3>
                <p className="text-gray-600">การวิเคราะห์พฤติกรรมลูกค้าตามช่วงเวลาที่สมัครสมาชิก</p>
                <Button className="mt-4">
                  <Eye className="w-4 h-4 mr-2" />
                  ดูรายละเอียด
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">A/B Testing</h3>
                <p className="text-gray-600">ผลการทดสอบและเปรียบเทียบประสิทธิภาพ</p>
                <Button className="mt-4">
                  <Eye className="w-4 h-4 mr-2" />
                  ดูผลการทดสอบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "รายงานยอดขายรายวัน", icon: BarChart3, color: "blue", period: "รายวัน" },
              { title: "รายงานลูกค้า", icon: Users, color: "green", period: "รายเดือน" },
              { title: "รายงานสินค้า", icon: Package, color: "purple", period: "รายเดือน" },
              { title: "รายงานการเงิน", icon: DollarSign, color: "orange", period: "รายไตรมาส" },
              { title: "รายงานประจำปี", icon: Target, color: "red", period: "รายปี" },
              { title: "รายงานกำหนดเอง", icon: Activity, color: "gray", period: "ตามต้องการ" },
            ].map((report, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <report.icon className={`w-8 h-8 text-${report.color}-600`} />
                    <Badge className={`bg-${report.color}-100 text-${report.color}-800`}>{report.period}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">สรุปข้อมูลและการวิเคราะห์</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    ดาวน์โหลด
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
