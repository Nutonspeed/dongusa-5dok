"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Trash2,
  Play,
  Save,
  Calendar,
  Settings,
  Database,
  BarChart3,
  Table,
  PieChart,
  AlertCircle,
} from "lucide-react"
import { advancedReportingService, type ReportTemplate, type ReportParameter } from "@/lib/advanced-reporting-service"

interface CustomReportBuilderProps {
  templateId?: string
  onSave?: (template: ReportTemplate) => void
  onCancel?: () => void
}

export default function CustomReportBuilder({ templateId, onSave, onCancel }: CustomReportBuilderProps) {
  const [template, setTemplate] = useState<Partial<ReportTemplate>>({
    name: "",
    description: "",
    category: "sales",
    type: "custom",
    parameters: [],
    query: "",
    visualization: {
      type: "table",
      columns: [],
    },
    isActive: true,
    createdBy: "user",
  })

  const [currentParameter, setCurrentParameter] = useState<Partial<ReportParameter>>({
    name: "",
    label: "",
    type: "text",
    required: false,
  })

  const [currentColumn, setCurrentColumn] = useState({
    key: "",
    label: "",
    type: "text" as const,
    format: "",
  })

  const [testResults, setTestResults] = useState<any>(null)
  const [isTestingQuery, setIsTestingQuery] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId)
    }
  }, [templateId])

  const loadTemplate = async (id: string) => {
    try {
      const existingTemplate = await advancedReportingService.getTemplate(id)
      if (existingTemplate) {
        setTemplate(existingTemplate)
      }
    } catch (error) {
      console.error("Error loading template:", error)
    }
  }

  const addParameter = () => {
    if (!currentParameter.name || !currentParameter.label) return

    const newParameter: ReportParameter = {
      id: `param_${Date.now()}`,
      name: currentParameter.name,
      label: currentParameter.label,
      type: currentParameter.type || "text",
      required: currentParameter.required || false,
      defaultValue: currentParameter.defaultValue,
      options: currentParameter.options,
      validation: currentParameter.validation,
    }

    setTemplate((prev) => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParameter],
    }))

    setCurrentParameter({
      name: "",
      label: "",
      type: "text",
      required: false,
    })
  }

  const removeParameter = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      parameters: prev.parameters?.filter((_, i) => i !== index) || [],
    }))
  }

  const addColumn = () => {
    if (!currentColumn.key || !currentColumn.label) return

    const newColumn = {
      key: currentColumn.key,
      label: currentColumn.label,
      type: currentColumn.type,
      format: currentColumn.format || undefined,
    }

    setTemplate((prev) => ({
      ...prev,
      visualization: {
        ...prev.visualization!,
        columns: [...(prev.visualization?.columns || []), newColumn],
      },
    }))

    setCurrentColumn({
      key: "",
      label: "",
      type: "text",
      format: "",
    })
  }

  const removeColumn = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      visualization: {
        ...prev.visualization!,
        columns: prev.visualization?.columns?.filter((_, i) => i !== index) || [],
      },
    }))
  }

  const testQuery = async () => {
    if (!template.query) return

    setIsTestingQuery(true)
    setQueryError(null)

    try {
      // Create test parameters
      const testParams: Record<string, any> = {}
      template.parameters?.forEach((param) => {
        testParams[param.name] = param.defaultValue || getDefaultValueForType(param.type)
      })

      const execution = await advancedReportingService.executeReport("test", testParams)
      setTestResults(execution.data?.slice(0, 5)) // Show first 5 rows
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : "Query test failed")
    } finally {
      setIsTestingQuery(false)
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
        return 0
      case "boolean":
        return false
      default:
        return ""
    }
  }

  const saveTemplate = async () => {
    try {
      if (!template.name || !template.query) {
        alert("กรุณากรอกชื่อรายงานและ SQL Query")
        return
      }

      const savedTemplate = await advancedReportingService.createTemplate(template as any)
      onSave?.(savedTemplate)
    } catch (error) {
      console.error("Error saving template:", error)
      alert("เกิดข้อผิดพลาดในการบันทึก")
    }
  }

  const parameterTypes = [
    { value: "text", label: "ข้อความ" },
    { value: "number", label: "ตัวเลข" },
    { value: "date", label: "วันที่" },
    { value: "dateRange", label: "ช่วงวันที่" },
    { value: "select", label: "เลือกหนึ่งตัวเลือก" },
    { value: "multiSelect", label: "เลือกหลายตัวเลือก" },
    { value: "boolean", label: "ใช่/ไม่ใช่" },
  ]

  const columnTypes = [
    { value: "text", label: "ข้อความ" },
    { value: "number", label: "ตัวเลข" },
    { value: "currency", label: "เงิน" },
    { value: "percentage", label: "เปอร์เซ็นต์" },
    { value: "date", label: "วันที่" },
  ]

  const visualizationTypes = [
    { value: "table", label: "ตาราง", icon: Table },
    { value: "chart", label: "กราฟ", icon: BarChart3 },
    { value: "dashboard", label: "แดชบอร์ด", icon: PieChart },
  ]

  const chartTypes = [
    { value: "bar", label: "แท่ง" },
    { value: "line", label: "เส้น" },
    { value: "pie", label: "วงกลม" },
    { value: "area", label: "พื้นที่" },
    { value: "combo", label: "ผสม" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{templateId ? "แก้ไขรายงาน" : "สร้างรายงานใหม่"}</h2>
          <p className="text-gray-600">สร้างรายงานแบบกำหนดเองตามความต้องการ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={saveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
          <TabsTrigger value="parameters">พารามิเตอร์</TabsTrigger>
          <TabsTrigger value="query">SQL Query</TabsTrigger>
          <TabsTrigger value="visualization">การแสดงผล</TabsTrigger>
          <TabsTrigger value="schedule">กำหนดการ</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อรายงาน *</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="เช่น รายงานยอดขายรายวัน"
                  />
                </div>
                <div>
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Select
                    value={template.category}
                    onValueChange={(value) => setTemplate((prev) => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">ยอดขาย</SelectItem>
                      <SelectItem value="inventory">สต็อก</SelectItem>
                      <SelectItem value="customers">ลูกค้า</SelectItem>
                      <SelectItem value="financial">การเงิน</SelectItem>
                      <SelectItem value="marketing">การตลาด</SelectItem>
                      <SelectItem value="operations">การดำเนินงาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="อธิบายรายงานนี้ว่าแสดงข้อมูลอะไร"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parameters */}
        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>พารามิเตอร์รายงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Parameter Form */}
              <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium mb-3">เพิ่มพารามิเตอร์ใหม่</h4>
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <Label>ชื่อตัวแปร</Label>
                    <Input
                      value={currentParameter.name}
                      onChange={(e) => setCurrentParameter((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="dateRange"
                    />
                  </div>
                  <div>
                    <Label>ป้ายกำกับ</Label>
                    <Input
                      value={currentParameter.label}
                      onChange={(e) => setCurrentParameter((prev) => ({ ...prev, label: e.target.value }))}
                      placeholder="ช่วงวันที่"
                    />
                  </div>
                  <div>
                    <Label>ประเภท</Label>
                    <Select
                      value={currentParameter.type}
                      onValueChange={(value) => setCurrentParameter((prev) => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {parameterTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addParameter} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      เพิ่ม
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={currentParameter.required}
                    onCheckedChange={(checked) =>
                      setCurrentParameter((prev) => ({ ...prev, required: checked as boolean }))
                    }
                  />
                  <Label htmlFor="required">จำเป็นต้องกรอก</Label>
                </div>
              </div>

              {/* Parameters List */}
              <div className="space-y-2">
                {template.parameters?.map((param, index) => (
                  <div key={param.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{param.label}</div>
                      <div className="text-sm text-gray-600">
                        {param.name} ({param.type}){param.required && <Badge className="ml-2">จำเป็น</Badge>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeParameter(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SQL Query */}
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                SQL Query
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="query">SQL Query *</Label>
                <Textarea
                  id="query"
                  value={template.query}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, query: e.target.value }))}
                  placeholder="SELECT * FROM orders WHERE created_at BETWEEN $1 AND $2"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-600 mt-1">ใช้ $1, $2, $3 เป็นตัวแทนพารามิเตอร์ตามลำดับ</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={testQuery} disabled={isTestingQuery} variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  {isTestingQuery ? "กำลังทดสอบ..." : "ทดสอบ Query"}
                </Button>
              </div>

              {queryError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{queryError}</AlertDescription>
                </Alert>
              )}

              {testResults && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">ผลการทดสอบ (5 แถวแรก)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(testResults[0] || {}).map((key) => (
                            <th key={key} className="text-left p-2">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.map((row: any, index: number) => (
                          <tr key={index} className="border-b">
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td key={cellIndex} className="p-2">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visualization */}
        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>การแสดงผล</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visualization Type */}
              <div>
                <Label>ประเภทการแสดงผล</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {visualizationTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        template.visualization?.type === type.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setTemplate((prev) => ({
                          ...prev,
                          visualization: { ...prev.visualization!, type: type.value as any },
                        }))
                      }
                    >
                      <type.icon className="w-6 h-6 mb-2" />
                      <div className="font-medium">{type.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Type (if chart is selected) */}
              {template.visualization?.type === "chart" && (
                <div>
                  <Label>ประเภทกราฟ</Label>
                  <Select
                    value={template.visualization.chartType}
                    onValueChange={(value) =>
                      setTemplate((prev) => ({
                        ...prev,
                        visualization: { ...prev.visualization!, chartType: value as any },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Columns Configuration */}
              <div>
                <Label>คอลัมน์ที่แสดง</Label>

                {/* Add Column Form */}
                <div className="p-4 border border-dashed border-gray-300 rounded-lg mt-2">
                  <h4 className="font-medium mb-3">เพิ่มคอลัมน์ใหม่</h4>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div>
                      <Label>Key</Label>
                      <Input
                        value={currentColumn.key}
                        onChange={(e) => setCurrentColumn((prev) => ({ ...prev, key: e.target.value }))}
                        placeholder="total_revenue"
                      />
                    </div>
                    <div>
                      <Label>ป้ายกำกับ</Label>
                      <Input
                        value={currentColumn.label}
                        onChange={(e) => setCurrentColumn((prev) => ({ ...prev, label: e.target.value }))}
                        placeholder="รายได้รวม"
                      />
                    </div>
                    <div>
                      <Label>ประเภท</Label>
                      <Select
                        value={currentColumn.type}
                        onValueChange={(value) => setCurrentColumn((prev) => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columnTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addColumn} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        เพิ่ม
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Columns List */}
                <div className="space-y-2 mt-4">
                  {template.visualization?.columns?.map((column, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{column.label}</div>
                        <div className="text-sm text-gray-600">
                          {column.key} ({column.type})
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeColumn(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                กำหนดการส่งรายงานอัตโนมัติ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">กำหนดการส่งอัตโนมัติ</h3>
                <p className="text-gray-600 mb-4">ตั้งค่าให้ส่งรายงานไปยังอีเมลตามกำหนดเวลา</p>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  ตั้งค่ากำหนดการ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
