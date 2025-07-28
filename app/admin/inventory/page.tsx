"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { inventoryService, type InventoryDashboardItem, type InventoryAlert } from "@/lib/inventory"
import { formatCurrency } from "@/lib/utils"

export default function InventoryManagementPage() {
  const [dashboardData, setDashboardData] = useState<InventoryDashboardItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
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
    } catch (error) {
      console.error("Error loading inventory data:", error)
    } finally {
      setLoading(false)
    }
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

  const handleResolveAlert = async (alertId: string) => {
    try {
      await inventoryService.resolveAlert(alertId)
      loadData() // Reload data
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
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
          <h1 className="text-3xl font-bold">จัดการสต็อกสินค้า</h1>
          <p className="text-muted-foreground">ระบบจัดการสต็อกแบบเรียลไทม์</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
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

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">สต็อกสินค้า</TabsTrigger>
          <TabsTrigger value="alerts">แจ้งเตือน ({statistics.pending_alerts})</TabsTrigger>
          <TabsTrigger value="transactions">ประวัติการเคลื่อนไหว</TabsTrigger>
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
                              แก้ไข
                            </Button>
                            <Button size="sm" variant="outline">
                              ประวัติ
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

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการเคลื่อนไหวสต็อก</CardTitle>
              <CardDescription>ประวัติการเปลี่ยนแปลงสต็อกทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2" />
                <p>ฟีเจอร์นี้จะพัฒนาในขั้นตอนถัดไป</p>
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
                <Package className="w-12 h-12 mx-auto mb-2" />
                <p>ฟีเจอร์นี้จะพัฒนาในขั้นตอนถัดไป</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
