"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Play,
  Pause,
  Square,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Zap,
  GitBranch,
  Timer,
  Users,
  Mail,
  MessageSquare,
  Database,
  Webhook,
} from "lucide-react"
// Placeholder workflow types until API integration is available
interface Workflow { id: string; name: string; status: string }
interface WorkflowExecution { id: string; status: string; started_at: string; completed_at?: string }

const COLORS = ["#ec4899", "#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

export default function WorkflowAutomationDashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="w-4 h-4 text-green-600" />
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-600" />
      case "draft":
        return <Edit className="w-4 h-4 text-gray-600" />
      case "archived":
        return <Square className="w-4 h-4 text-gray-400" />
      default:
        return <Settings className="w-4 h-4 text-gray-600" />
    }
  }

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "running":
        return <Activity className="w-4 h-4 text-blue-600" />
      case "waiting_approval":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "cancelled":
        return <Square className="w-4 h-4 text-gray-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case "trigger":
        return <Zap className="w-4 h-4 text-purple-600" />
      case "condition":
        return <GitBranch className="w-4 h-4 text-blue-600" />
      case "action":
        return <Activity className="w-4 h-4 text-green-600" />
      case "approval":
        return <Users className="w-4 h-4 text-orange-600" />
      case "delay":
        return <Timer className="w-4 h-4 text-gray-600" />
      case "email":
        return <Mail className="w-4 h-4 text-red-600" />
      case "sms":
        return <MessageSquare className="w-4 h-4 text-green-600" />
      case "webhook":
        return <Webhook className="w-4 h-4 text-indigo-600" />
      case "database":
        return <Database className="w-4 h-4 text-blue-600" />
      default:
        return <Settings className="w-4 h-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sales: "bg-green-100 text-green-800",
      marketing: "bg-purple-100 text-purple-800",
      inventory: "bg-blue-100 text-blue-800",
      customer_service: "bg-orange-100 text-orange-800",
      finance: "bg-red-100 text-red-800",
      operations: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
    return `${(ms / 3600000).toFixed(1)}h`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Automation Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบจัดการ workflow และ automation ครบวงจร</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button onClick={loadWorkflowData} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            สร้าง Workflow
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
                <div className="flex items-center mt-1">
                  <Play className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {workflows.filter((w) => w.status === "active").length} ใช้งาน
                  </span>
                </div>
              </div>
              <GitBranch className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">การรันทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{executions.length}</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {executions.filter((e) => e.status === "completed").length} สำเร็จ
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">อัตราความสำเร็จ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executions.length > 0
                    ? ((executions.filter((e) => e.status === "completed").length / executions.length) * 100).toFixed(1)
                    : 0}
                  %
                </p>
                <div className="flex items-center mt-1">
                  <XCircle className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-red-600">
                    {executions.filter((e) => e.status === "failed").length} ล้มเหลว
                  </span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">เวลาเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executions.length > 0
                    ? formatDuration(executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length)
                    : "0s"}
                </p>
                <div className="flex items-center mt-1">
                  <Timer className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-blue-600">ต่อการรัน</span>
                </div>
              </div>
              <Timer className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">การรัน</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Workflow Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Workflows ตามหมวดหมู่
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {["sales", "marketing", "inventory", "customer_service", "finance", "operations"].map((category) => {
                  const categoryWorkflows = workflows.filter((w) => w.category === category)
                  const activeCount = categoryWorkflows.filter((w) => w.status === "active").length

                  return (
                    <Card key={category} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold capitalize">{category.replace("_", " ")}</h4>
                          <Badge className={getCategoryColor(category)}>{categoryWorkflows.length}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {activeCount} ใช้งาน, {categoryWorkflows.length - activeCount} ไม่ใช้งาน
                        </p>
                        <Progress value={(activeCount / Math.max(categoryWorkflows.length, 1)) * 100} className="h-2" />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Executions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                การรันล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.slice(0, 10).map((execution) => {
                  const workflow = workflows.find((w) => w.id === execution.workflow_id)
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getExecutionStatusIcon(execution.status)}
                        <div>
                          <p className="font-medium">{workflow?.name || "Unknown Workflow"}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(execution.started_at).toLocaleString("th-TH")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            execution.status === "completed"
                              ? "default"
                              : execution.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {execution.status}
                        </Badge>
                        {execution.duration && (
                          <p className="text-sm text-gray-600 mt-1">{formatDuration(execution.duration)}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(workflow.category)}>{workflow.category}</Badge>
                      <Badge variant="outline">v{workflow.version}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{workflow.nodes.length}</div>
                      <div className="text-sm text-blue-700">Nodes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {workflow.execution_stats.total_executions}
                      </div>
                      <div className="text-sm text-green-700">การรันทั้งหมด</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {workflow.execution_stats.total_executions > 0
                          ? (
                              (workflow.execution_stats.successful_executions /
                                workflow.execution_stats.total_executions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-purple-700">อัตราสำเร็จ</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {formatDuration(workflow.execution_stats.average_duration)}
                      </div>
                      <div className="text-sm text-orange-700">เวลาเฉลี่ย</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                      <Eye className="w-4 h-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      แก้ไข
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      รันทดสอบ
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                      <Trash2 className="w-4 h-4 mr-2" />
                      ลบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการรัน Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => {
                  const workflow = workflows.find((w) => w.id === execution.workflow_id)
                  return (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getExecutionStatusIcon(execution.status)}
                          <div>
                            <h4 className="font-semibold">{workflow?.name || "Unknown Workflow"}</h4>
                            <p className="text-sm text-gray-600">ID: {execution.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              execution.status === "completed"
                                ? "default"
                                : execution.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {execution.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(execution.started_at).toLocaleString("th-TH")}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">เริ่มต้น:</p>
                          <p className="font-medium">{new Date(execution.started_at).toLocaleString("th-TH")}</p>
                        </div>
                        {execution.completed_at && (
                          <div>
                            <p className="text-sm text-gray-600">เสร็จสิ้น:</p>
                            <p className="font-medium">{new Date(execution.completed_at).toLocaleString("th-TH")}</p>
                          </div>
                        )}
                        {execution.duration && (
                          <div>
                            <p className="text-sm text-gray-600">ระยะเวลา:</p>
                            <p className="font-medium">{formatDuration(execution.duration)}</p>
                          </div>
                        )}
                      </div>

                      {execution.error_message && (
                        <Alert className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{execution.error_message}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          ดู Log
                        </Button>
                        {execution.status === "running" && (
                          <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                            <Square className="w-4 h-4 mr-2" />
                            ยกเลิก
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>แนวโน้มการรัน Workflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.execution_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#ec4899" name="ทั้งหมด" />
                      <Line type="monotone" dataKey="successful" stroke="#10b981" name="สำเร็จ" />
                      <Line type="monotone" dataKey="failed" stroke="#ef4444" name="ล้มเหลว" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ประสิทธิภาพ Nodes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.node_performance.map((node: any) => (
                      <div key={node.node_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getNodeTypeIcon(node.node_type)}
                            <h4 className="font-semibold">{node.node_name}</h4>
                            <Badge variant="outline">{node.node_type}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{node.success_rate.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600">อัตราสำเร็จ</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">การรัน:</p>
                            <p className="font-medium">{node.executions}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">สำเร็จ:</p>
                            <p className="font-medium text-green-600">{node.successful}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">ล้มเหลว:</p>
                            <p className="font-medium text-red-600">{node.failed}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">เวลาเฉลี่ย:</p>
                            <p className="font-medium">{formatDuration(node.average_duration)}</p>
                          </div>
                        </div>
                        <Progress value={node.success_rate} className="h-2 mt-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Workflow Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Workflow Builder</h3>
                <p className="text-gray-600 mb-6">สร้างและแก้ไข workflow ด้วย drag-and-drop interface</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  เริ่มสร้าง Workflow ใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
