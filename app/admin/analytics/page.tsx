"use client"
import { logger } from "@/lib/logger"
import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  BarChart3,
  FileText,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { DatabaseService } from "@/lib/database"
import { useEffect } from "react"
import AdvancedAnalyticsDashboard from "@/components/analytics/AdvancedAnalyticsDashboard"

const productCategoryData = [
  { name: "ผ้าคลุมโซฟา", value: 65, color: "hsl(345, 85%, 35%)", revenue: 456780, growth: 12.5 },
  { name: "อุปกรณ์เสริม", value: 35, color: "hsl(345, 85%, 55%)", revenue: 234560, growth: 8.3 },
]

const dailySalesData = [
  { day: "จันทร์", sales: 12450, orders: 8, visitors: 245, conversion: 3.3 },
  { day: "อังคาร", sales: 15600, orders: 10, visitors: 289, conversion: 3.5 },
  { day: "พุธ", sales: 18900, orders: 12, visitors: 334, conversion: 3.6 },
  { day: "พฤหัส", sales: 22300, orders: 14, visitors: 378, conversion: 3.7 },
  { day: "ศุกร์", sales: 28700, orders: 18, visitors: 445, conversion: 4.0 },
  { day: "เสาร์", sales: 35200, orders: 22, visitors: 523, conversion: 4.2 },
  { day: "อาทิตย์", sales: 31800, orders: 20, visitors: 489, conversion: 4.1 },
]

const customerSegmentData = [
  { segment: "ลูกค้าใหม่", count: 45, percentage: 38.5, revenue: 89400, ltv: 1987 },
  { segment: "ลูกค้าประจำ", count: 38, percentage: 32.5, revenue: 156780, ltv: 4125 },
  { segment: "ลูกค้า VIP", count: 23, percentage: 19.7, revenue: 234560, ltv: 10198 },
  { segment: "ลูกค้าไม่ใช้งาน", count: 11, percentage: 9.4, revenue: 12340, ltv: 1122 },
]

const topProducts = [
  { name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม", category: "covers", sales: 45, revenue: 130050, growth: 12.5, margin: 40 },
  { name: "ผ้าคลุมโซฟากันน้ำ", category: "covers", sales: 38, revenue: 74100, growth: 8.3, margin: 35 },
  { name: "หมอนอิงลายเดียวกัน", category: "accessories", sales: 67, revenue: 23450, growth: -2.1, margin: 45 },
  { name: "ผ้าคลุมโซฟาเซ็กชั่นแนล", category: "covers", sales: 12, revenue: 50400, growth: 15.7, margin: 38 },
  { name: "น้ำยาทำความสะอาดผ้า", category: "accessories", sales: 89, revenue: 24920, growth: 5.2, margin: 60 },
]

const forecastData = [
  { month: "ม.ค. 25", predicted: 95000, confidence: 85, trend: "up" },
  { month: "ก.พ. 25", predicted: 102000, confidence: 82, trend: "up" },
  { month: "มี.ค. 25", predicted: 98000, confidence: 78, trend: "stable" },
  { month: "เม.ย. 25", predicted: 108000, confidence: 75, trend: "up" },
]

const timeRanges = [
  { id: "7d", name: "7 วันล่าสุด" },
  { id: "30d", name: "30 วันล่าสุด" },
  { id: "90d", name: "3 เดือนล่าสุด" },
  { id: "1y", name: "1 ปีล่าสุด" },
  { id: "custom", name: "กำหนดเอง" },
]

export const dynamic = "force-dynamic"

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [comparisonPeriod, setComparisonPeriod] = useState("previous_period")
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false)

  const [salesData, setSalesData] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        const db = new DatabaseService()

        const analyticsData = await db.getAnalytics()
        const salesHistory = await (db as any).getSalesData(selectedTimeRange)

        setSalesData(salesHistory)
        setAnalytics(analyticsData)
      } catch (err) {
        logger.error("Error loading analytics:", err)
        setError("ไม่สามารถโหลดข้อมูลการวิเคราะห์ได้")

        setSalesData([
          { month: "ม.ค.", revenue: 45230, orders: 23, customers: 18, profit: 18092, conversion: 3.2 },
          { month: "ก.พ.", revenue: 52100, orders: 28, customers: 22, profit: 20840, conversion: 3.8 },
          { month: "มี.ค.", revenue: 48900, orders: 25, customers: 20, profit: 19560, conversion: 3.5 },
          { month: "เม.ย.", revenue: 61200, orders: 32, customers: 26, profit: 24480, conversion: 4.1 },
          { month: "พ.ค.", revenue: 58700, orders: 30, customers: 24, profit: 23480, conversion: 3.9 },
          { month: "มิ.ย.", revenue: 67800, orders: 35, customers: 28, profit: 27120, conversion: 4.3 },
        ])
        setAnalytics({
          totalRevenue: 750000,
          totalOrders: 245,
          totalCustomers: 156,
          averageOrderValue: 3061,
          conversionRate: 4.2,
          profitMargin: 40.5,
        })
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [selectedTimeRange])

  const totalRevenue = analytics.totalRevenue || salesData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = analytics.totalOrders || salesData.reduce((sum, item) => sum + item.orders, 0)
  const totalCustomers = analytics.totalCustomers || salesData.reduce((sum, item) => sum + item.customers, 0)
  const averageOrderValue = analytics.averageOrderValue || totalRevenue / totalOrders
  const totalProfit = analytics.totalProfit || salesData.reduce((sum, item) => sum + item.profit, 0)
  const profitMargin = analytics.profitMargin || (totalProfit / totalRevenue) * 100
  const averageConversion =
    analytics.conversionRate || salesData.reduce((sum, item) => sum + item.conversion, 0) / salesData.length

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

  const tabs = [
    { id: "overview", name: "ภาพรวม", icon: BarChart3 },
    { id: "sales", name: "ยอดขาย", icon: DollarSign },
    { id: "products", name: "สินค้า", icon: Package },
    { id: "customers", name: "ลูกค้า", icon: Users },
    { id: "forecasting", name: "การพยากรณ์", icon: Target },
    { id: "reports", name: "รายงาน", icon: FileText },
  ]

  const handleExportReport = (format: string) => {
    logger.info(`Exporting report in ${format} format`)
    // Implementation for export functionality
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลการวิเคราะห์...</p>
        </div>
      </div>
    )
  }

  if (showAdvancedAnalytics) {
    return <AdvancedAnalyticsDashboard />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบวิเคราะห์ข้อมูลและรายงานธุรกิจ</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button
            onClick={() => setShowAdvancedAnalytics(true)}
            variant="outline"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
          </Button>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 วันล่าสุด</SelectItem>
              <SelectItem value="30d">30 วันล่าสุด</SelectItem>
              <SelectItem value="90d">90 วันล่าสุด</SelectItem>
              <SelectItem value="1y">1 ปีล่าสุด</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">+12.5%</span>
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
                    <p className="text-sm font-medium text-gray-600">กำไรรวม</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(totalProfit)}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium text-primary">{profitMargin.toFixed(1)}%</span>
                      <span className="text-sm text-gray-500 ml-1">อัตรากำไร</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">คำสั่งซื้อ</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalOrders)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-primary mr-1" />
                      <span className="text-sm font-medium text-primary">+8.2%</span>
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
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalCustomers)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                      <span className="text-sm font-medium text-purple-600">+15.3%</span>
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
                    <p className="text-sm font-medium text-gray-600">อัตราแปลง</p>
                    <p className="text-2xl font-bold text-gray-900">{averageConversion.toFixed(1)}%</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
                      <span className="text-sm font-medium text-orange-600">+0.8%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">รายได้และกำไรรายเดือน</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "revenue" || name === "profit" ? formatPrice(value) : value,
                        name === "revenue" ? "รายได้" : name === "profit" ? "กำไร" : "คำสั่งซื้อ",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(345, 85%, 35%)" name="รายได้" />
                    <Bar dataKey="profit" fill="hsl(345, 85%, 55%)" name="กำไร" />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="คำสั่งซื้อ" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">อัตราแปลงและผู้เยี่ยมชม</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="visitors" fill="#8884d8" name="ผู้เยี่ยมชม" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversion"
                      stroke="#ff7300"
                      name="อัตราแปลง (%)"
                      strokeWidth={2}
                    />
                  </ComposedChart>
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
                      <p className="font-medium">เว็บไซต์</p>
                      <p className="text-sm text-gray-600">การขายออนไลน์</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">฿345,600</p>
                      <p className="text-sm text-green-600">+12.5%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Facebook Messenger</p>
                      <p className="text-sm text-gray-600">แชทและสั่งซื้อ</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">฿111,180</p>
                      <p className="text-sm text-green-600">+18.3%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">ประเภทสินค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={productCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [formatPrice(value), "รายได้"]} />
                    <Bar dataKey="revenue" fill="hsl(345, 85%, 35%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle className="text-primary">สินค้าขายดี</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">สินค้า</th>
                      <th className="text-left py-3 px-4">ยอดขาย</th>
                      <th className="text-left py-3 px-4">รายได้</th>
                      <th className="text-left py-3 px-4">การเติบโต</th>
                      <th className="text-left py-3 px-4">อัตรากำไร</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{product.sales} ชิ้น</td>
                        <td className="py-3 px-4">{formatPrice(product.revenue)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-sm font-medium ${product.growth > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {product.growth > 0 ? "+" : ""}
                            {product.growth.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">{product.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle className="text-primary">กลุ่มลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customerSegmentData.map((segment, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900">{segment.segment}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">{segment.count}</p>
                    <p className="text-sm text-gray-600">{segment.percentage}% ของลูกค้าทั้งหมด</p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm">รายได้: {formatPrice(segment.revenue)}</p>
                      <p className="text-sm">LTV: {formatPrice(segment.ltv)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forecasting Tab */}
      {activeTab === "forecasting" && (
        <div className="space-y-6">
          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle className="text-primary">การพยากรณ์ยอดขาย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {forecastData.map((forecast, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900">{forecast.month}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">{formatPrice(forecast.predicted)}</p>
                    <p className="text-sm text-gray-600">ความมั่นใจ: {forecast.confidence}%</p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          forecast.trend === "up"
                            ? "bg-green-100 text-green-800"
                            : forecast.trend === "down"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {forecast.trend === "up" ? "↗ เติบโต" : forecast.trend === "down" ? "↘ ลดลง" : "→ คงที่"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle className="text-primary">รายงานและการส่งออก</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleExportReport("pdf")}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <FileText className="w-6 h-6" />
                  <span>รายงาน PDF</span>
                </Button>
                <Button
                  onClick={() => handleExportReport("excel")}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Download className="w-6 h-6" />
                  <span>ส่งออก Excel</span>
                </Button>
                <Button
                  onClick={() => handleExportReport("csv")}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>ข้อมูล CSV</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
