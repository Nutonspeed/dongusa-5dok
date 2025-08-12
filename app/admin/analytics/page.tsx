"use client"
import { logger } from '@/lib/logger';
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
  AreaChart,
  Area,
  ComposedChart,
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
  FileText,
  Target,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { DatabaseService } from "@/lib/database"
import { useEffect } from "react"

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
        const salesHistory = await db.getSalesData(selectedTimeRange)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงานและสถิติขั้นสูง</h1>
          <p className="text-gray-600 mt-1">วิเคราะห์ข้อมูลธุรกิจแบบละเอียดและการพยากรณ์</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous_period">เปรียบเทียบช่วงก่อน</SelectItem>
              <SelectItem value="previous_year">เปรียบเทียบปีก่อน</SelectItem>
              <SelectItem value="no_comparison">ไม่เปรียบเทียบ</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => handleExportReport("pdf")}>
            <Download className="w-4 h-4 mr-2" />
            ส่งออก PDF
          </Button>

          <Button variant="outline" onClick={() => handleExportReport("excel")}>
            <Download className="w-4 h-4 mr-2" />
            ส่งออก Excel
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

      {activeTab === "forecasting" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">พยากรณ์เดือนหน้า</p>
                    <p className="text-2xl font-bold text-gray-900">฿95,000</p>
                    <p className="text-sm text-green-600 mt-1">ความมั่นใจ 85%</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">แนวโน้มการเติบโต</p>
                    <p className="text-2xl font-bold text-green-600">+12.3%</p>
                    <p className="text-sm text-gray-500 mt-1">เฉลี่ย 3 เดือน</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ความเสี่ยง</p>
                    <p className="text-2xl font-bold text-yellow-600">ปานกลาง</p>
                    <p className="text-sm text-gray-500 mt-1">ตามฤดูกาล</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle className="text-primary">การพยากรณ์รายได้ 4 เดือนข้างหน้า</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={[...salesData.slice(-6), ...forecastData]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatPrice(value), "รายได้"]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(345, 85%, 35%)"
                    fill="hsl(345, 85%, 35%)"
                    fillOpacity={0.6}
                    name="รายได้จริง"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ff7300"
                    fill="#ff7300"
                    fillOpacity={0.3}
                    strokeDasharray="5 5"
                    name="รายได้พยากรณ์"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">ปัจจัยที่มีผลต่อการพยากรณ์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium">ฤดูกาล</span>
                    <Badge className="bg-green-100 text-green-800">ผลบวก</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium">แนวโน้มตลาด</span>
                    <Badge className="bg-blue-100 text-blue-800">เสถียร</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium">การแข่งขัน</span>
                    <Badge className="bg-yellow-100 text-yellow-800">ปานกลาง</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium">โปรโมชั่น</span>
                    <Badge className="bg-green-100 text-green-800">ผลบวก</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow">
              <CardHeader>
                <CardTitle className="text-primary">คำแนะนำเชิงกลยุทธ์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">เพิ่มสต็อกสินค้า</h4>
                    <p className="text-sm text-green-700">เตรียมสต็อกสินค้าขายดีเพิ่ม 20% สำหรับเดือนหน้า</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">ขยายการตลาด</h4>
                    <p className="text-sm text-blue-700">เพิ่มงบโฆษณาในช่วงที่คาดการณ์ว่าจะมีการเติบโต</p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">ปรับราคา</h4>
                    <p className="text-sm text-orange-700">พิจารณาปรับราคาสินค้าที่มีอัตรากำไรต่ำ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="burgundy-shadow cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <Badge className="bg-blue-100 text-blue-800">รายวัน</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">รายงานยอดขายรายวัน</h3>
                <p className="text-sm text-gray-600 mb-4">สรุปยอดขายและคำสั่งซื้อประจำวัน</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด
                </Button>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">รายเดือน</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">รายงานลูกค้า</h3>
                <p className="text-sm text-gray-600 mb-4">วิเคราะห์พฤติกรรมและกลุ่มลูกค้า</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด
                </Button>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-purple-600" />
                  <Badge className="bg-purple-100 text-purple-800">รายเดือน</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">รายงานสินค้า</h3>
                <p className="text-sm text-gray-600 mb-4">ประสิทธิภาพและสต็อกสินค้า</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด
                </Button>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-800">รายไตรมาส</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">รายงานการเงิน</h3>
                <p className="text-sm text-gray-600 mb-4">รายได้ กำไร และกระแสเงินสด</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด
                </Button>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">รายปี</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">รายงานประจำปี</h3>
                <p className="text-sm text-gray-600 mb-4">สรุปผลการดำเนินงานทั้งปี</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด
                </Button>
              </CardContent>
            </Card>

            <Card className="burgundy-shadow cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-indigo-600" />
                  <Badge className="bg-indigo-100 text-indigo-800">กำหนดเอง</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">รายงานกำหนดเอง</h3>
                <p className="text-sm text-gray-600 mb-4">สร้างรายงานตามความต้องการ</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  สร้างรายงาน
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="burgundy-shadow">
            <CardHeader>
              <CardTitle className="text-primary">รายงานที่สร้างล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-semibold text-gray-900">รายงานยอดขายเดือนมกราคม 2024</h4>
                      <p className="text-sm text-gray-500">สร้างเมื่อ 2 ชั่วโมงที่แล้ว</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">พร้อมใช้งาน</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-semibold text-gray-900">รายงานลูกค้า Q4 2023</h4>
                      <p className="text-sm text-gray-500">สร้างเมื่อ 1 วันที่แล้ว</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">พร้อมใช้งาน</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">รายงานสินค้าประจำเดือน</h4>
                      <p className="text-sm text-gray-500">กำลังสร้าง...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">กำลังประมวลผล</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ... existing code for other tabs ... */}
    </div>
  )
}
