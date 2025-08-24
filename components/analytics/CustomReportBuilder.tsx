"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Trash2,
  Play,
  Save,
  Download,
  BarChart3,
  PieChart,
  Table,
  Calendar,
  Filter,
  Settings,
} from "lucide-react"
import { customReportBuilder, type ReportFilter } from "@/lib/custom-report-builder"

export default function CustomReportBuilder() {
  const [reportName, setReportName] = useState("")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [filters, setFilters] = useState<ReportFilter[]>([])
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [visualizationType, setVisualizationType] = useState<"table" | "chart" | "dashboard">("table")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const availableMetrics = customReportBuilder.getAvailableMetrics()
  const availableFilters = customReportBuilder.getAvailableFilters()
  const reportTemplates = customReportBuilder.getReportTemplates()

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      {
        field: "",
        operator: "equals",
        value: "",
        label: "",
      },
    ])
  }

  const handleUpdateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilters(newFilters)
  }

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) => (prev.includes(metricId) ? prev.filter((id) => id !== metricId) : [...prev, metricId]))
  }

  const handleRunReport = async () => {
    if (selectedMetrics.length === 0) {
      alert("กรุณาเลือกตัวชี้วัดอย่างน้อย 1 รายการ")
      return
    }

    setLoading(true)
    try {
      const data = await customReportBuilder.buildReportQuery({
        metrics: selectedMetrics,
        filters,
        groupBy,
        dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
      })
      setReportData(data)
    } catch (error) {
      console.error("Error running report:", error)
      alert("เกิดข้อผิดพลาดในการสร้างรายงาน")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      alert("กรุณาใส่ชื่อรายงาน")
      return
    }

    try {
      // Build parameters object to match the CustomReport shape expected by the service
      const params = {
        date_range:
          dateRange.start && dateRange.end
            ? dateRange
            : { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() },
        metrics: selectedMetrics,
        filters: filters.reduce((acc, filter) => {
          acc[filter.field] = { operator: filter.operator, value: filter.value }
          return acc
        }, {} as any),
        grouping: (groupBy && groupBy.length > 0 ? (groupBy[0] as any) : "daily") as any,
      }

      await customReportBuilder.saveReport({
        name: reportName,
        type: "custom",
        parameters: params,
        format: "json",
      })
      alert("บันทึกรายงานเรียบร้อยแล้ว")
    } catch (error) {
      console.error("Error saving report:", error)
      alert("เกิดข้อผิดพลาดในการบันทึกรายงาน")
    }
  }

  const handleLoadTemplate = (templateId: string) => {
    const template = reportTemplates.find((t) => t.id === templateId)
    if (template && template.config) {
      setReportName(template.name)
      setSelectedMetrics(template.config.metrics || [])
      setVisualizationType(template.config.visualization || "table")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Report Builder</h1>
          <p className="text-gray-600 mt-1">สร้างรายงานแบบกำหนดเองตามความต้องการ</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button onClick={handleRunReport} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            {loading ? "กำลังสร้าง..." : "รันรายงาน"}
          </Button>
          <Button onClick={handleSaveReport} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                การตั้งค่ารายงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Name */}
              <div className="space-y-2">
                <Label htmlFor="reportName">ชื่อรายงาน</Label>
                <Input
                  id="reportName"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="ใส่ชื่อรายงาน"
                />
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <Label>เทมเพลตรายงาน</Label>
                <div className="grid grid-cols-2 gap-2">
                  {reportTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadTemplate(template.id)}
                      className="justify-start text-left h-auto p-3"
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Metrics Selection */}
              <div className="space-y-3">
                <Label>ตัวชี้วัด (Metrics)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <Label htmlFor={metric.id} className="text-sm font-normal">
                        {metric.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedMetrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMetrics.map((metricId) => {
                      const metric = availableMetrics.find((m) => m.id === metricId)
                      return (
                        <Badge key={metricId} variant="secondary">
                          {metric?.name}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>

              <Separator />

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  ช่วงเวลา
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm">
                      วันที่เริ่มต้น
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm">
                      วันที่สิ้นสุด
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    ตัวกรอง (Filters)
                  </Label>
                  <Button size="sm" variant="outline" onClick={handleAddFilter}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มตัวกรอง
                  </Button>
                </div>

                {filters.map((filter, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ตัวกรองที่ {index + 1}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveFilter(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Select
                        value={filter.field}
                        onValueChange={(value) => handleUpdateFilter(index, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกฟิลด์" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFilters.map((field) => (
                            <SelectItem key={field.field} value={field.field}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filter.operator}
                        onValueChange={(value) => handleUpdateFilter(index, { operator: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เงื่อนไข" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">เท่ากับ</SelectItem>
                          <SelectItem value="not_equals">ไม่เท่ากับ</SelectItem>
                          <SelectItem value="greater_than">มากกว่า</SelectItem>
                          <SelectItem value="less_than">น้อยกว่า</SelectItem>
                          <SelectItem value="contains">ประกอบด้วย</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={filter.value}
                        onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                        placeholder="ค่าที่ต้องการ"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Visualization Type */}
              <div className="space-y-3">
                <Label>รูปแบบการแสดงผล</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={visualizationType === "table" ? "default" : "outline"}
                    onClick={() => setVisualizationType("table")}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Table className="w-6 h-6 mb-2" />
                    <span className="text-sm">ตาราง</span>
                  </Button>
                  <Button
                    variant={visualizationType === "chart" ? "default" : "outline"}
                    onClick={() => setVisualizationType("chart")}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="text-sm">กราф</span>
                  </Button>
                  <Button
                    variant={visualizationType === "dashboard" ? "default" : "outline"}
                    onClick={() => setVisualizationType("dashboard")}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <PieChart className="w-6 h-6 mb-2" />
                    <span className="text-sm">แดชบอร์ด</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ตัวอย่างรายงาน</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">พบข้อมูล {reportData.summary?.total_records || 0} รายการ</div>

                  {reportData.metrics && (
                    <div className="space-y-2">
                      <h4 className="font-medium">ตัวชี้วัด</h4>
                      {Object.entries(reportData.metrics).map(([key, value]) => {
                        const metric = availableMetrics.find((m) => m.id === key)
                        return (
                          <div key={key} className="flex justify-between text-sm">
                            <span>{metric?.name}</span>
                            <span className="font-medium">
                              {metric?.format === "currency"
                                ? new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
                                    value as number,
                                  )
                                : metric?.format === "percentage"
                                  ? `${(value as number).toFixed(1)}%`
                                  : (value as number).toLocaleString("th-TH")}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      ส่งออกรายงาน
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>กรุณารันรายงานเพื่อดูผลลัพธ์</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
