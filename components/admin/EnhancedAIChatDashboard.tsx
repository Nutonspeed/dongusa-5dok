"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react"

interface ConversationMetrics {
  totalConversations: number
  aiAutomationRate: number
  avgResponseTime: number
  customerSatisfaction: number
  resolutionRate: number
}

interface AIInsight {
  type: "trend" | "alert" | "opportunity"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  actionRequired: boolean
}

export default function EnhancedAIChatDashboard() {
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalConversations: 1250,
    aiAutomationRate: 65,
    avgResponseTime: 180,
    customerSatisfaction: 4.6,
    resolutionRate: 89,
  })

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      type: "trend",
      title: "เพิ่มขึ้น 23% ในคำถามเกี่ยวกับราคา",
      description: "ลูกค้าสนใจข้อมูลราคามากขึ้น แนะนำให้เพิ่ม FAQ ราคา",
      impact: "high",
      actionRequired: true,
    },
    {
      type: "opportunity",
      title: "ช่วงเวลา 14:00-16:00 มีการสนทนาสูงสุด",
      description: "ควรเพิ่มเจ้าหน้าที่ในช่วงเวลานี้",
      impact: "medium",
      actionRequired: false,
    },
    {
      type: "alert",
      title: "ลูกค้า VIP มีความพึงพอใจลดลง",
      description: "ต้องติดตามและปรับปรุงการบริการ",
      impact: "high",
      actionRequired: true,
    },
  ])

  const [activeConversations, setActiveConversations] = useState([
    {
      id: "conv_001",
      customer: "คุณสมชาย",
      channel: "facebook",
      sentiment: "positive",
      urgency: "medium",
      aiSuggestion: "แนะนำผ้าคอลเลกชันใหม่",
      lastMessage: "สนใจผ้าลายดอกไม้ครับ",
    },
    {
      id: "conv_002",
      customer: "คุณมาลี",
      channel: "live_chat",
      sentiment: "neutral",
      urgency: "high",
      aiSuggestion: "ตรวจสอบสถานะการจัดส่ง",
      lastMessage: "สินค้าส่งมาแล้วหรือยังคะ",
    },
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Chat System</h1>
          <p className="text-gray-600">ระบบแชทอัจฉริยะที่เหนือกว่า 365 เพจ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            ตั้งค่า AI
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Brain className="w-4 h-4 mr-2" />
            เทรน AI Model
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">การสนทนาทั้งหมด</p>
                <p className="text-2xl font-bold text-emerald-600">{metrics.totalConversations.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Automation</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.aiAutomationRate}%</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เวลาตอบกลับเฉลี่ย</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.avgResponseTime}s</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ความพึงพอใจ</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.customerSatisfaction}/5</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">อัตราแก้ไขปัญหา</p>
                <p className="text-2xl font-bold text-green-600">{metrics.resolutionRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="conversations">การสนทนาสด</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="faq">FAQ Management</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-600" />
                  AI Insights & Recommendations
                </CardTitle>
                <CardDescription>ข้อมูลเชิงลึกและคำแนะนำจาก AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {insight.type === "trend" && <TrendingUp className="w-4 h-4 text-blue-500" />}
                        {insight.type === "alert" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {insight.type === "opportunity" && <Zap className="w-4 h-4 text-green-500" />}
                        <Badge
                          variant={
                            insight.impact === "high"
                              ? "destructive"
                              : insight.impact === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {insight.impact}
                        </Badge>
                      </div>
                      {insight.actionRequired && (
                        <Button size="sm" variant="outline">
                          ดำเนินการ
                        </Button>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>ประสิทธิภาพ AI</CardTitle>
                <CardDescription>การวัดผลการทำงานของระบบ AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">AI Response Accuracy</span>
                    <span className="text-sm text-gray-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction with AI</span>
                    <span className="text-sm text-gray-600">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Escalation Rate</span>
                    <span className="text-sm text-gray-600">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Learning Progress</span>
                    <span className="text-sm text-gray-600">76%</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>การสนทนาที่กำลังดำเนินอยู่</CardTitle>
              <CardDescription>การสนทนาสดพร้อมคำแนะนำจาก AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeConversations.map((conv) => (
                  <div key={conv.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{conv.customer}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {conv.channel}
                            </Badge>
                            <Badge
                              variant={
                                conv.sentiment === "positive"
                                  ? "default"
                                  : conv.sentiment === "negative"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {conv.sentiment}
                            </Badge>
                            <Badge
                              variant={
                                conv.urgency === "high"
                                  ? "destructive"
                                  : conv.urgency === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {conv.urgency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        เข้าร่วมแชท
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 mb-2">ข้อความล่าสุด:</p>
                      <p className="text-sm font-medium">"{conv.lastMessage}"</p>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">AI แนะนำ:</span>
                      </div>
                      <p className="text-sm text-emerald-700">{conv.aiSuggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { channel: "Facebook Messenger", messages: 450, satisfaction: 4.7, color: "bg-blue-500" },
                    { channel: "Live Chat", messages: 380, satisfaction: 4.8, color: "bg-green-500" },
                    { channel: "Email", messages: 420, satisfaction: 4.4, color: "bg-purple-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium">{item.channel}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.messages} ข้อความ</p>
                        <p className="text-sm text-gray-600">⭐ {item.satisfaction}/5</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topic Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { topic: "ราคาสินค้า", frequency: 35, sentiment: 0.7 },
                    { topic: "การเลือกผ้า", frequency: 28, sentiment: 0.8 },
                    { topic: "การจัดส่ง", frequency: 22, sentiment: 0.6 },
                    { topic: "การติดตั้ง", frequency: 15, sentiment: 0.9 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.topic}</span>
                        <span className="text-sm text-gray-600">{item.frequency}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.frequency} className="flex-1 h-2" />
                        <Badge
                          variant={
                            item.sentiment > 0.7 ? "default" : item.sentiment > 0.5 ? "secondary" : "destructive"
                          }
                        >
                          {(item.sentiment * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered FAQ Management</CardTitle>
              <CardDescription>จัดการคำถามที่พบบ่อยด้วย AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">FAQ Effectiveness Score</h4>
                    <p className="text-sm text-gray-600">AI วิเคราะห์ประสิทธิภาพของ FAQ</p>
                  </div>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Brain className="w-4 h-4 mr-2" />
                    อัพเดท AI
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { question: "ราคาผ้าคลุมโซฟาเท่าไหร่?", effectiveness: 92, usage: 156 },
                    { question: "ใช้เวลาจัดส่งนานแค่ไหน?", effectiveness: 88, usage: 134 },
                    { question: "มีผ้าลายไหนบ้าง?", effectiveness: 76, usage: 98 },
                    { question: "วิธีการสั่งซื้อ?", effectiveness: 94, usage: 87 },
                  ].map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">{faq.question}</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Effectiveness</span>
                          <span className="font-medium">{faq.effectiveness}%</span>
                        </div>
                        <Progress value={faq.effectiveness} className="h-2" />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Usage: {faq.usage} times</span>
                          <Button size="sm" variant="ghost">
                            แก้ไข
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
