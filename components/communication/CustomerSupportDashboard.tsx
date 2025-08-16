"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Facebook,
  BarChart3,
  Activity,
} from "lucide-react"
import { communicationHub, type Agent } from "@/lib/unified-communication-hub"

export function CustomerSupportDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7d")

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case "1d":
          startDate.setDate(endDate.getDate() - 1)
          break
        case "7d":
          startDate.setDate(endDate.getDate() - 7)
          break
        case "30d":
          startDate.setDate(endDate.getDate() - 30)
          break
        case "90d":
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      const [analyticsData, agentsData] = await Promise.all([
        communicationHub.getCommunicationAnalytics({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        }),
        communicationHub.getAvailableAgents(),
      ])

      setAnalytics(analyticsData)
      setAgents(agentsData.agents)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "sms":
        return <Phone className="w-4 h-4" />
      case "facebook":
        return <Facebook className="w-4 h-4" />
      case "live_chat":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} วินาที`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาที`
    return `${Math.floor(seconds / 3600)} ชั่วโมง ${Math.floor((seconds % 3600) / 60)} นาที`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800"
      case "away":
        return "bg-yellow-100 text-yellow-800"
      case "busy":
        return "bg-red-100 text-red-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Customer Support Dashboard
          </h1>
          <p className="text-gray-600 mt-1">ภาพรวมการให้บริการลูกค้าและประสิทธิภาพทีม</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">วันนี้</SelectItem>
              <SelectItem value="7d">7 วันที่แล้ว</SelectItem>
              <SelectItem value="30d">30 วันที่แล้ว</SelectItem>
              <SelectItem value="90d">90 วันที่แล้ว</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อความทั้งหมด</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.message_volume.reduce((sum: number, item: any) => sum + item.count, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% จากเมื่อวาน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เวลาตอบสนองเฉลี่ย</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(analytics.response_times.avg)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="w-3 h-3 inline mr-1 text-green-600" />
                -8% จากเมื่อวาน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการแก้ไข</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics.resolution_rates.rate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.resolution_rates.resolved}/{analytics.resolution_rates.total} เคส
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เจ้าหน้าที่ออนไลน์</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.filter((a) => a.status === "online").length}</div>
              <p className="text-xs text-muted-foreground">จากทั้งหมด {agents.length} คน</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="channels">ช่องทางการสื่อสาร</TabsTrigger>
          <TabsTrigger value="agents">ทีมงาน</TabsTrigger>
          <TabsTrigger value="performance">ประสิทธิภาพ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Message Volume Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    ปริมาณข้อความตามช่องทาง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.channel_performance.map((channel: any) => (
                      <div key={channel.channel} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getChannelIcon(channel.channel)}
                            <span className="capitalize">{channel.channel}</span>
                          </div>
                          <span className="font-medium">{channel.messages.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={(channel.messages / Math.max(...analytics.channel_performance.map((c: any) => c.messages))) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    การวิเคราะห์เวลาตอบสนอง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{formatTime(analytics.response_times.avg)}</div>
                        <div className="text-sm text-gray-600">เฉลี่ย</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{formatTime(analytics.response_times.median)}</div>
                        <div className="text-sm text-gray-600">มัธยฐาน</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{formatTime(analytics.response_times.p95)}</div>
                        <div className="text-sm text-gray-600">95th Percentile</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>เป้าหมาย: 30 นาที</span>
                        <span className="text-green-600">✓ บรรลุเป้าหมาย</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          {analytics && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {analytics.channel_performance.map((channel: any) => (
                <Card key={channel.channel}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getChannelIcon(channel.channel)}
                      <span className="capitalize">{channel.channel}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{channel.messages.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">ข้อความ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatTime(channel.avg_response_time)}</div>
                        <div className="text-sm text-gray-600">เวลาตอบสนอง</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>ประสิทธิภาพ</span>
                        <span>{((1 - channel.avg_response_time / 3600) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(1 - channel.avg_response_time / 3600) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6">
            {/* Agent Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  สถานะทีมงาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {["online", "away", "busy", "offline"].map((status) => (
                    <div key={status} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {agents.filter((agent) => agent.status === status).length}
                      </div>
                      <Badge className={getStatusColor(status)} variant="secondary">
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agent Performance */}
            <Card>
              <CardHeader>
                <CardTitle>ประสิทธิภาพเจ้าหน้าที่</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.agent_performance.map((agent: any) => (
                    <div key={agent.agent_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {agent.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.conversations} การสนทนา</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-yellow-600">{agent.avg_rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">/ 5.0</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`w-3 h-3 rounded-full ${
                                star <= agent.avg_rating ? "bg-yellow-400" : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  เมตริกประสิทธิภาพ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First Response Time</span>
                    <span className="font-medium">< 5 นาที</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resolution Rate</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="font-medium">4.6/5.0</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className=\"space-y-3\">\
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Agent Utilization</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* SLA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  SLA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <div className=\"text-sm text-gray-600\">Response SLA</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">89%</div>
                    <div className="text-sm text-gray-600">Resolution SLA</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">SLA Targets</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex justify-between">
                      <span>Email Response:</span>
                      <span className="text-green-600">< 2 ชั่วโมง ✓</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Live Chat Response:</span>
                      <span className="text-green-600\">< 2 นาที ✓</span>
                    </li>\
                    <li className="flex justify-between">
                      <span>Issue Resolution:</span>
                      <span className="text-yellow-600">< 24 ชั่วโมง ⚠</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )\
}
