"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Download,
  Play,
  Clock,
  FileText,
  BarChart3,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
} from "lucide-react"
import { advancedReportingService, type ReportTemplate, type ReportExecution } from "@/lib/advanced-reporting-service"
import CustomReportBuilder from "./CustomReportBuilder"

export default function ReportDashboard() {
  const [activeTab, setActiveTab] = useState("templates")
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [executions, setExecutions] = useState<ReportExecution[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [templatesData, executionsData, analyticsData] = await Promise.all([
        advancedReportingService.getTemplates(),
        advancedReportingService.getExecutions(),
        advancedReportingService.getReportingAnalytics(),
      ])

      setTemplates(templatesData)
      setExecutions(executionsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const executeReport = async (templateId: string) => {
    try {
      // For demo, use default parameters
      const template = templates.find((t) => t.id === templateId)
      if (!template) return

      const parameters: Record<string, any> = {}
      template.parameters.forEach((param) => {
        parameters[param.name] = param.defaultValue || getDefaultValueForType(param.type)
      })

      const execution = await advancedReportingService.executeReport(templateId, parameters)

      // Refresh executions
      const updatedExecutions = await advancedReportingService.getExecutions()
      setExecutions(updatedExecutions)

      alert("รายงานถูกสร้างเรียบร้อยแล้ว")
    } catch (error) {
      console.error("Error executing report:", error)
      alert("เกิดข้อผิดพลาดในการสร้างรายงาน")
    }
  }

  const getDefaultValueForType = (type: string) => {
    switch (type) {
      case "date":
        return new Date().toISOString().split("T")[0]
      case "dateRange":
        return {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
        }
      case "number":
        return 10
      case "boolean":
        return true
      default:
        return "all"
    }
  }

  const exportReport = async (executionId: string, format: "pdf" | "excel" | "csv") => {
    try {
      const result = await advancedReportingService.exportReport(executionId, {
        format,
        includeCharts: true,
        includeMetadata: true,
      })

      if (result.success && result.downloadUrl) {
        // In a real app, this would trigger a download
        alert(`รายงานถูกส่งออกเป็น ${format.toUpperCase()} เรียบร้อยแล้ว`)
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      alert("เกิดข้อผิดพลาดในการส่งออกรายงาน")
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sales":
        return <DollarSign className="w-5 h-5" />
      case "inventory":
        return <Package className="w-5 h-5" />
      case "customers":
        return <Users className="w-5 h-5" />
      case "financial":
        return <TrendingUp className="w-5 h-5" />
      case "marketing":
        return <BarChart3 className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sales: "ยอดขาย",
      inventory: "สต็อก",
      customers: "ลูกค้า",
      financial: "การเงิน",
      marketing: "การตลาด",
      operations: "การดำเนินงาน",
    }
    return labels[category] || category
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: "เสร็จสิ้น",
      running: "กำลังดำเนินการ",
      failed: "ล้มเหลว",
      pending: "รอดำเนินการ",
    }
    return labels[status] || status
  }

  if (showReportBuilder) {
    return (
      <CustomReportBuilder
        templateId={editingTemplate || undefined}
        onSave={(template) => {
          setTemplates((prev) => [...prev, template])
          setShowReportBuilder(false)
          setEditingTemplate(null)
        }}
        onCancel={() => {
          setShowReportBuilder(false)
          setEditingTemplate(null)
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reporting System</h1>
          <p className="text-gray-600 mt-1">ระบบรายงานขั้นสูงและการส่งออกข้อมูล</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button
            onClick={() => setShowReportBuilder(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            สร้างรายงานใหม่
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รายงานทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalReports}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">การรันรายงาน</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalExecutions}</p>
                </div>
                <Play className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">เวลาเฉลี่ย</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgExecutionTime.toFixed(0)}ms</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รายงานยอดนิยม</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.popularTemplates.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">เทมเพลตรายงาน</TabsTrigger>
          <TabsTrigger value="executions">ประวัติการรัน</TabsTrigger>
          <TabsTrigger value="scheduled">รายงานตามกำหนด</TabsTrigger>
          <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหารายงาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                <SelectItem value="sales">ยอดขาย</SelectItem>
                <SelectItem value="inventory">สต็อก</SelectItem>
                <SelectItem value="customers">ลูกค้า</SelectItem>
                <SelectItem value="financial">การเงิน</SelectItem>
                <SelectItem value="marketing">การตลาด</SelectItem>
                <SelectItem value="operations">การดำเนินงาน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className="mt-1">{getCategoryLabel(template.category)}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                  <div className="text-xs text-gray-500 mb-4">
                    <div>พารามิเตอร์: {template.parameters.length} รายการ</div>
                    <div>ประเภท: {template.type === "standard" ? "มาตรฐาน" : "กำหนดเอง"}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => executeReport(template.id)} className="flex-1">
                      <Play className="w-4 h-4 mr-1" />
                      รัน
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTemplate(template.id)
                        setShowReportBuilder(true)
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการรันรายงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.slice(0, 10).map((execution) => {
                  const template = templates.find((t) => t.id === execution.templateId)
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{template?.name || "Unknown Template"}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(execution.createdAt).toLocaleString("th-TH")}
                          </div>
                        </div>
                        <Badge className={getStatusColor(execution.status)}>{getStatusLabel(execution.status)}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {execution.status === "completed" && (
                          <>
                            <div className="text-sm text-gray-600 mr-4">
                              {execution.metadata?.totalRows} แถว | {execution.metadata?.executionTime}ms
                            </div>
                            <Button size="sm" variant="outline" onClick={() => exportReport(execution.id, "excel")}>
                              <Download className="w-4 h-4 mr-1" />
                              Excel
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => exportReport(execution.id, "pdf")}>
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                รายงานตามกำหนดเวลา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีรายงานตามกำหนด</h3>
                <p className="text-gray-600 mb-4">ตั้งค่าให้ส่งรายงานไปยังอีเมลตามกำหนดเวลา</p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มกำหนดการใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>รายงานยอดนิยม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.popularTemplates.map((item: any, index: number) => (
                    <div key={item.templateId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.executionCount} ครั้ง</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>กิจกรรมล่าสุด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{activity.templateName}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(activity.executedAt).toLocaleString("th-TH")}
                        </div>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>{getStatusLabel(activity.status)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
