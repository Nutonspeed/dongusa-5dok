"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Brain,
  Target,
  Zap,
  Settings,
  BarChart3,
  Calendar,
  Truck,
  Eye,
  Edit,
  History,
} from "lucide-react"
import { inventoryService, type InventoryDashboardItem, type InventoryAlert } from "@/lib/inventory"
import { formatCurrency } from "@/lib/utils"

interface OptimizationRecommendation {
  id: string
  type: "reorder" | "reduce_stock" | "price_adjustment" | "supplier_change"
  product_id: string
  product_name: string
  priority: "high" | "medium" | "low"
  impact: number
  description: string
  action_required: string
  estimated_savings: number
  confidence: number
}

interface PredictiveAlert {
  id: string
  type: "stockout_prediction" | "demand_spike" | "seasonal_trend" | "supplier_delay"
  product_id: string
  product_name: string
  predicted_date: string
  confidence: number
  impact_level: "critical" | "high" | "medium" | "low"
  description: string
  recommended_action: string
}

interface AutomationRule {
  id: string
  name: string
  trigger_type: "low_stock" | "high_demand" | "seasonal" | "supplier_delay"
  conditions: Record<string, any>
  actions: string[]
  is_active: boolean
  last_triggered: string | null
  success_rate: number
}

export default function InventoryManagementPage() {
  const [dashboardData, setDashboardData] = useState<InventoryDashboardItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [statistics, setStatistics] = useState({
    total_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    total_value: 0,
    pending_alerts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockStatusFilter, setStockStatusFilter] = useState("all")
  const [isOptimizationDialogOpen, setIsOptimizationDialogOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<OptimizationRecommendation | null>(null)

  useEffect(() => {
    loadData()
  }, [searchTerm, statusFilter, stockStatusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [dashboardResult, alertsResult, statsResult] = await Promise.all([
        inventoryService.getDashboard({
          search: searchTerm || undefined,
          stock_status: stockStatusFilter !== "all" ? stockStatusFilter : undefined,
          limit: 50,
        }),
        inventoryService.getAlerts({ is_resolved: false, limit: 20 }),
        inventoryService.getStatistics(),
      ])

      setDashboardData(dashboardResult)
      setAlerts(alertsResult)
      setStatistics(statsResult)

      loadOptimizationData()
    } catch (error) {
      console.error("Error loading inventory data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadOptimizationData = async () => {
    // Mock data for optimization features
    setRecommendations([
      {
        id: "1",
        type: "reorder",
        product_id: "1",
        product_name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
        priority: "high",
        impact: 85,
        description: "สินค้านี้จะหมดสต็อกใน 5 วัน ควรสั่งซื้อเพิ่ม 50 ชิ้น",
        action_required: "สั่งซื้อสินค้าเพิ่ม",
        estimated_savings: 12500,
        confidence: 92,
      },
      {
        id: "2",
        type: "reduce_stock",
        product_id: "3",
        product_name: "หมอนอิงลายเดียวกัน",
        priority: "medium",
        impact: 65,
        description: "สินค้านี้มีสต็อกเกินความต้องการ ควรลดการสั่งซื้อ",
        action_required: "ลดการสั่งซื้อ 30%",
        estimated_savings: 8900,
        confidence: 78,
      },
      {
        id: "3",
        type: "price_adjustment",
        product_id: "5",
        product_name: "น้ำยาทำความสะอาดผ้า",
        priority: "low",
        impact: 45,
        description: "ควรปรับราคาขายเพื่อเพิ่มอัตรากำไร",
        action_required: "เพิ่มราคา 15%",
        estimated_savings: 5600,
        confidence: 68,
      },
    ])

    setPredictiveAlerts([
      {
        id: "1",
        type: "stockout_prediction",
        product_id: "1",
        product_name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
        predicted_date: "2024-02-15",
        confidence: 89,
        impact_level: "critical",
        description: "คาดการณ์ว่าจะหมดสต็อกในวันที่ 15 ก.พ. 2024",
        recommended_action: "สั่งซื้อสินค้าเพิ่ม 75 ชิ้นภายใน 3 วัน",
      },
      {
        id: "2",
        type: "demand_spike",
        product_id: "2",
        product_name: "ผ้าคลุมโซฟากันน้ำ",
        predicted_date: "2024-02-20",
        confidence: 76,
        impact_level: "high",
        description: "คาดการณ์ความต้องการจะเพิ่มขึ้น 40% ในช่วงสุดสัปดาห์",
        recommended_action: "เตรียมสต็อกเพิ่ม 30 ชิ้น",
      },
    ])

    setAutomationRules([
      {
        id: "1",
        name: "Auto Reorder - Low Stock",
        trigger_type: "low_stock",
        conditions: { threshold: 10, product_categories: ["covers"] },
        actions: ["create_purchase_order", "notify_supplier", "alert_admin"],
        is_active: true,
        last_triggered: "2024-01-28T10:30:00Z",
        success_rate: 94,
      },
      {
        id: "2",
        name: "Seasonal Adjustment",
        trigger_type: "seasonal",
        conditions: { season: "winter", adjustment_percentage: 25 },
        actions: ["adjust_reorder_levels", "update_forecasts"],
        is_active: true,
        last_triggered: "2024-01-15T08:00:00Z",
        success_rate: 87,
      },
    ])
  }

  const getStockStatusBadge = (status: string, quantity: number) => {
    switch (status) {
      case "out_of_stock":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            หมดสต็อก
          </Badge>
        )
      case "low_stock":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3" />
            สต็อกต่ำ
          </Badge>
        )
      case "overstock":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
            <TrendingUp className="w-3 h-3" />
            สต็อกเกิน
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            ปกติ
          </Badge>
        )
    }
  }

  const getAlertSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">วิกฤต</Badge>
      case "high":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            สูง
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            กลาง
          </Badge>
        )
      default:
        return <Badge variant="outline">ต่ำ</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">สูง</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">กลาง</Badge>
      default:
        return <Badge variant="outline">ต่ำ</Badge>
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      await inventoryService.resolveAlert(alertId)
      loadData()
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
  }

  const applyRecommendation = async (recommendation: OptimizationRecommendation) => {
    console.log("Applying recommendation:", recommendation)
    // Implementation would integrate with inventory management system
    setIsOptimizationDialogOpen(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>กำลังโหลดข้อมูลสต็อก...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการสต็อกอัจฉริยะ</h1>
          <p className="text-muted-foreground">ระบบจัดการสต็อกแบบเรียลไทม์พร้อม AI และการพยากรณ์</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Dialog open={isOptimizationDialogOpen} onOpenChange={setIsOptimizationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                AI Insights
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ข้อเสนอแนะจาก AI</DialogTitle>
              </DialogHeader>
              <AIInsightsDialog recommendations={recommendations} onApplyRecommendation={applyRecommendation} />
            </DialogContent>
          </Dialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสินค้า
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_items}</div>
            <p className="text-xs text-muted-foreground">รายการสินค้าที่ใช้งาน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สต็อกต่ำ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.low_stock_items}</div>
            <p className="text-xs text-muted-foreground">ต้องสั่งซื้อเพิ่ม</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">หมดสต็อก</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.out_of_stock_items}</div>
            <p className="text-xs text-muted-foreground">ไม่มีสินค้าในสต็อก</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าสต็อก</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics.total_value)}</div>
            <p className="text-xs text-muted-foreground">มูลค่าสต็อกทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">แจ้งเตือน</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.pending_alerts}</div>
            <p className="text-xs text-muted-foreground">แจ้งเตือนที่รอดำเนินการ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="w-5 h-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">{recommendations.length}</div>
            <p className="text-sm text-blue-700 mb-3">ข้อเสนะแนะที่รอดำเนินการ</p>
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 bg-transparent">
              <Eye className="w-4 h-4 mr-2" />
              ดูรายละเอียด
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Target className="w-5 h-5" />
              Predictive Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">{predictiveAlerts.length}</div>
            <p className="text-sm text-purple-700 mb-3">การพยากรณ์ล่วงหน้า</p>
            <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 bg-transparent">
              <Calendar className="w-4 h-4 mr-2" />
              ดูการพยากรณ์
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="w-5 h-5" />
              Automation Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {automationRules.filter((r) => r.is_active).length}
            </div>
            <p className="text-sm text-green-700 mb-3">กฎอัตโนมัติที่ใช้งาน</p>
            <Button size="sm" variant="outline" className="border-green-300 text-green-700 bg-transparent">
              <Settings className="w-4 h-4 mr-2" />
              จัดการกฎ
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inventory">สต็อกสินค้า</TabsTrigger>
          <TabsTrigger value="alerts">แจ้งเตือน ({statistics.pending_alerts})</TabsTrigger>
          <TabsTrigger value="optimization">การปรับปรุง</TabsTrigger>
          <TabsTrigger value="predictions">การพยากรณ์</TabsTrigger>
          <TabsTrigger value="automation">ระบบอัตโนมัติ</TabsTrigger>
          <TabsTrigger value="suppliers">ผู้จำหน่าย</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ค้นหาและกรองข้อมูล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาชื่อสินค้า..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="สถานะสต็อก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="normal">ปกติ</SelectItem>
                    <SelectItem value="low_stock">สต็อกต่ำ</SelectItem>
                    <SelectItem value="out_of_stock">หมดสต็อก</SelectItem>
                    <SelectItem value="overstock">สต็อกเกิน</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  ส่งออก
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>รายการสต็อกสินค้า</CardTitle>
              <CardDescription>แสดงข้อมูลสต็อกสินค้าทั้งหมด พร้อมสถานะและการแจ้งเตือน</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">สินค้า</th>
                      <th className="text-left p-2">จำนวนคงเหลือ</th>
                      <th className="text-left p-2">จำนวนจอง</th>
                      <th className="text-left p-2">ระดับสั่งซื้อ</th>
                      <th className="text-left p-2">สถานะ</th>
                      <th className="text-left p-2">ความเร็วการขาย</th>
                      <th className="text-left p-2">วันที่หมด</th>
                      <th className="text-left p-2">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-muted-foreground">{item.product_name_en}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium">{item.quantity_available}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.quantity_available * item.cost_price)}
                          </div>
                        </td>
                        <td className="p-2">{item.quantity_reserved}</td>
                        <td className="p-2">{item.reorder_level}</td>
                        <td className="p-2">{getStockStatusBadge(item.stock_status, item.quantity_available)}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {item.sales_velocity > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-gray-400" />
                            )}
                            {item.sales_velocity.toFixed(1)}/วัน
                          </div>
                        </td>
                        <td className="p-2">
                          {item.days_until_stockout ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-orange-600" />
                              {Math.round(item.days_until_stockout)} วัน
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <History className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แจ้งเตือนสต็อก</CardTitle>
              <CardDescription>แจ้งเตือนเกี่ยวกับสถานะสต็อกที่ต้องดำเนินการ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString("th-TH")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAlertSeverityBadge(alert.severity)}
                      <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)}>
                        แก้ไขแล้ว
                      </Button>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p>ไม่มีแจ้งเตือนที่รอดำเนินการ</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                ข้อเสนอแนะการปรับปรุง
              </CardTitle>
              <CardDescription>AI วิเคราะห์และแนะนำการปรับปรุงประสิทธิภาพสต็อก</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{rec.product_name}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(rec.priority)}
                        <Badge variant="outline">ความมั่นใจ {rec.confidence}%</Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(rec.estimated_savings)}</div>
                        <div className="text-sm text-green-700">ประหยัดได้</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{rec.impact}%</div>
                        <div className="text-sm text-blue-700">ผลกระทบ</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{rec.confidence}%</div>
                        <div className="text-sm text-purple-700">ความแม่นยำ</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">การดำเนินการ: {rec.action_required}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          ดูรายละเอียด
                        </Button>
                        <Button size="sm" onClick={() => applyRecommendation(rec)}>
                          ดำเนินการ
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                การพยากรณ์และแนวโน้ม
              </CardTitle>
              <CardDescription>การพยากรณ์ความต้องการและสถานะสต็อกในอนาคต</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <h4 className="font-semibold">{alert.product_name}</h4>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getAlertSeverityBadge(alert.impact_level)}
                        <Badge variant="outline">{new Date(alert.predicted_date).toLocaleDateString("th-TH")}</Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">ความมั่นใจในการพยากรณ์</span>
                        <span className="text-sm font-bold">{alert.confidence}%</span>
                      </div>
                      <Progress value={alert.confidence} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">แนะนำ: {alert.recommended_action}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          ดูกราฟ
                        </Button>
                        <Button size="sm">ดำเนินการ</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                กฎการทำงานอัตโนมัติ
              </CardTitle>
              <CardDescription>จัดการกฎและเงื่อนไขสำหรับการทำงานอัตโนมัติ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-semibold">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ทริกเกอร์: {rule.trigger_type} | การดำเนินการ: {rule.actions.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.is_active} />
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "ใช้งาน" : "ปิด"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{rule.success_rate}%</div>
                        <div className="text-sm text-green-700">อัตราความสำเร็จ</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {rule.last_triggered ? new Date(rule.last_triggered).toLocaleDateString("th-TH") : "ไม่เคย"}
                        </div>
                        <div className="text-sm text-blue-700">ทำงานครั้งล่าสุด</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH")}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          แก้ไข
                        </Button>
                        <Button size="sm" variant="outline">
                          <History className="w-4 h-4 mr-2" />
                          ประวัติ
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>จัดการผู้จำหน่าย</CardTitle>
              <CardDescription>ข้อมูลผู้จำหน่ายและซัพพลายเออร์</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-2" />
                <p>ฟีเจอร์นี้จะพัฒนาในขั้นตอนถัดไป</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AIInsightsDialog({
  recommendations,
  onApplyRecommendation,
}: {
  recommendations: OptimizationRecommendation[]
  onApplyRecommendation: (rec: OptimizationRecommendation) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Brain className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
            <div className="text-sm text-muted-foreground">ข้อเสนอแนะ</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(recommendations.reduce((sum, r) => sum + r.estimated_savings, 0))}
            </div>
            <div className="text-sm text-muted-foreground">ประหยัดได้รวม</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)}%
            </div>
            <div className="text-sm text-muted-foreground">ความแม่นยำเฉลี่ย</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">รายละเอียดข้อเสนอแนะ</h3>
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{rec.product_name}</h4>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <Badge
                  variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "outline"}
                >
                  {rec.priority === "high" ? "สูง" : rec.priority === "medium" ? "กลาง" : "ต่ำ"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(rec.estimated_savings)}</div>
                  <div className="text-xs text-muted-foreground">ประหยัดได้</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{rec.impact}%</div>
                  <div className="text-xs text-muted-foreground">ผลกระทบ</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{rec.confidence}%</div>
                  <div className="text-xs text-muted-foreground">ความมั่นใจ</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">การดำเนินการ: {rec.action_required}</div>
                <Button size="sm" onClick={() => onApplyRecommendation(rec)}>
                  ดำเนินการ
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
