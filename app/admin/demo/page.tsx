"use client"
import { logger } from '@/lib/logger';

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  Mail,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Activity,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface ServiceStats {
  database: {
    products: number
    customers: number
    orders: number
    totalRevenue: number
  }
  email: {
    totalSent: number
    totalFailed: number
    successRate: number
    recentEmails: number
  }
  upload: {
    totalFiles: number
    totalSize: string
    successfulUploads: number
    failedUploads: number
  }
}

export const dynamic = "force-dynamic"

export default function DemoControlPanel() {
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [dbStats, emailStats, uploadStats] = await Promise.all([
        getDatabaseStats(),
        getEmailStats(),
        getUploadStats(),
      ])

      setStats({
        database: dbStats,
        email: emailStats,
        upload: uploadStats,
      })
    } catch (error) {
      logger.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDatabaseStats = async () => {
    const { mockDatabaseService } = await import("@/lib/mock-database")
    const [products, customers, orders, analytics] = await Promise.all([
      mockDatabaseService.getProducts(),
      mockDatabaseService.getCustomers(),
      mockDatabaseService.getOrders(),
      mockDatabaseService.getAnalytics(),
    ])

    return {
      products: products.length,
      customers: customers.length,
      orders: orders.length,
      totalRevenue: analytics.totalRevenue,
    }
  }

  const getEmailStats = async () => {
    const { mockEmailService } = await import("@/lib/mock-email")
    const [stats, history] = await Promise.all([
      mockEmailService.getEmailStatistics(),
      mockEmailService.getEmailHistory(10),
    ])

    return {
      totalSent: stats.totalSent,
      totalFailed: stats.totalFailed,
      successRate: stats.successRate,
      recentEmails: history.length,
    }
  }

  const getUploadStats = async () => {
    const { mockUploadService } = await import("@/lib/mock-upload")
    const stats = await mockUploadService.getUploadStatistics()

    return {
      totalFiles: stats.totalFiles,
      totalSize: mockUploadService.formatFileSize(stats.totalSize),
      successfulUploads: stats.successfulUploads,
      failedUploads: stats.failedUploads,
    }
  }

  const handleAction = async (action: string, serviceAction: () => Promise<void>) => {
    setActionLoading(action)
    try {
      await serviceAction()
      await loadStats()
    } catch (error) {
      logger.error(`Failed to ${action}:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const resetDatabase = async () => {
    const { mockDatabaseService } = await import("@/lib/mock-database")
    await mockDatabaseService.clearAllData()
    await mockDatabaseService.seedSampleData()
  }

  const generateMockData = async () => {
    const { devUtils } = await import("@/lib/development-config")
    await devUtils.generateMockData()
  }

  const clearEmailHistory = async () => {
    const { mockEmailService } = await import("@/lib/mock-email")
    await mockEmailService.clearEmailHistory()
  }

  const clearUploadFiles = async () => {
    const { mockUploadService } = await import("@/lib/mock-upload")
    await mockUploadService.clearAllFiles()
  }

  const resetAllServices = async () => {
    const { devUtils } = await import("@/lib/development-config")
    await devUtils.resetDemoData()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demo Control Panel</h1>
          <p className="text-muted-foreground">จัดการและตรวจสอบสถานะ Mock Services</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="h-3 w-3 mr-1" />
            Demo Mode Active
          </Badge>
          <Button onClick={loadStats} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.database.products || 0}</div>
            <p className="text-xs text-muted-foreground">สินค้าในระบบ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.database.customers || 0}</div>
            <p className="text-xs text-muted-foreground">ลูกค้าทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.database.orders || 0}</div>
            <p className="text-xs text-muted-foreground">คำสั่งซื้อทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.database.totalRevenue?.toLocaleString("th-TH") || 0}</div>
            <p className="text-xs text-muted-foreground">บาท</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Management Tabs */}
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Settings className="h-4 w-4 mr-2" />
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Mock Database Service
              </CardTitle>
              <CardDescription>จัดการข้อมูลจำลองในฐานข้อมูล</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.database.products || 0}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.database.customers || 0}</div>
                  <div className="text-sm text-muted-foreground">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats?.database.orders || 0}</div>
                  <div className="text-sm text-muted-foreground">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ฿{stats?.database.totalRevenue?.toLocaleString("th-TH") || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleAction("reset-db", resetDatabase)}
                  disabled={actionLoading === "reset-db"}
                  variant="outline"
                  size="sm"
                >
                  {actionLoading === "reset-db" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  รีเซ็ตฐานข้อมูล
                </Button>
                <Button
                  onClick={() => handleAction("generate-data", generateMockData)}
                  disabled={actionLoading === "generate-data"}
                  variant="outline"
                  size="sm"
                >
                  {actionLoading === "generate-data" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  สร้างข้อมูลเพิ่ม
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Mock Email Service
              </CardTitle>
              <CardDescription>ตรวจสอบและจัดการระบบอีเมลจำลอง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.email.totalSent || 0}</div>
                  <div className="text-sm text-muted-foreground">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats?.email.totalFailed || 0}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(stats?.email.successRate || 0)}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats?.email.recentEmails || 0}</div>
                  <div className="text-sm text-muted-foreground">Recent</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Email service is running normally</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleAction("clear-email", clearEmailHistory)}
                  disabled={actionLoading === "clear-email"}
                  variant="outline"
                  size="sm"
                >
                  {actionLoading === "clear-email" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  ล้างประวัติอีเมล
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Mock Upload Service
              </CardTitle>
              <CardDescription>จัดการระบบอัปโหลดไฟล์จำลอง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.upload.totalFiles || 0}</div>
                  <div className="text-sm text-muted-foreground">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.upload.totalSize || "0 B"}</div>
                  <div className="text-sm text-muted-foreground">Total Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.upload.successfulUploads || 0}</div>
                  <div className="text-sm text-muted-foreground">Success</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats?.upload.failedUploads || 0}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Upload service is running normally</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleAction("clear-uploads", clearUploadFiles)}
                  disabled={actionLoading === "clear-uploads"}
                  variant="outline"
                  size="sm"
                >
                  {actionLoading === "clear-uploads" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  ล้างไฟล์ทั้งหมด
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>การดำเนินการด่วนสำหรับจัดการระบบ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">รีเซ็ตข้อมูลทั้งหมด</h4>
                    <p className="text-sm text-muted-foreground">ล้างข้อมูลทั้งหมดและสร้างข้อมูลตัวอย่างใหม่</p>
                  </div>
                  <Button
                    onClick={() => handleAction("reset-all", resetAllServices)}
                    disabled={actionLoading === "reset-all"}
                    variant="destructive"
                    size="sm"
                  >
                    {actionLoading === "reset-all" ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    รีเซ็ตทั้งหมด
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">สร้างข้อมูลจำลอง</h4>
                    <p className="text-sm text-muted-foreground">เพิ่มข้อมูลจำลองเพื่อการทดสอบ</p>
                  </div>
                  <Button
                    onClick={() => handleAction("generate-mock", generateMockData)}
                    disabled={actionLoading === "generate-mock"}
                    variant="outline"
                    size="sm"
                  >
                    {actionLoading === "generate-mock" ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    สร้างข้อมูล
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">รีเฟรชสถิติ</h4>
                    <p className="text-sm text-muted-foreground">อัปเดตข้อมูลสถิติทั้งหมด</p>
                  </div>
                  <Button onClick={loadStats} disabled={loading} variant="outline" size="sm">
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    รีเฟรช
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">หมายเหตุ</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      ระบบนี้ทำงานในโหมดสาธิต ข้อมูลทั้งหมดเป็นข้อมูลจำลองและจะถูกรีเซ็ตอัตโนมัติทุก 24 ชั่วโมง
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
