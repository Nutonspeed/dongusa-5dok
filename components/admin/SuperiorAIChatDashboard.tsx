"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  MessageSquare,
  Brain,
  TrendingUp,
  Users,
  Clock,
  Star,
  BarChart3,
  Zap,
  Target,
  Heart,
  MessageCircle,
  Bot,
  UserCheck,
  Activity,
} from "lucide-react"

interface ConversationMetrics {
  totalConversations: number
  activeConversations: number
  avgResponseTime: number
  customerSatisfaction: number
  resolutionRate: number
  aiAccuracy: number
}

interface SentimentData {
  positive: number
  negative: number
  neutral: number
}

interface CustomerInsight {
  id: string
  name: string
  lastMessage: string
  sentiment: "positive" | "negative" | "neutral"
  purchaseIntent: number
  engagementLevel: "high" | "medium" | "low"
  responseTime: number
}

export default function SuperiorAIChatDashboard() {
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalConversations: 1247,
    activeConversations: 23,
    avgResponseTime: 12,
    customerSatisfaction: 4.8,
    resolutionRate: 94,
    aiAccuracy: 89,
  })

  const [sentimentData, setSentimentData] = useState<SentimentData>({
    positive: 68,
    negative: 12,
    neutral: 20,
  })

  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([
    {
      id: "1",
      name: "สมชาย ใจดี",
      lastMessage: "ต้องการผ้าคลุมโซฟาสีน้ำเงิน",
      sentiment: "positive",
      purchaseIntent: 85,
      engagementLevel: "high",
      responseTime: 8,
    },
    {
      id: "2",
      name: "วิภา สวยงาม",
      lastMessage: "สินค้าที่สั่งมาไม่ตรงตามที่ต้องการ",
      sentiment: "negative",
      purchaseIntent: 25,
      engagementLevel: "medium",
      responseTime: 15,
    },
  ])

  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">AI Chat System</h1>
          <p className="text-muted-foreground">ระบบแชท AI ขั้นสูงที่เหนือกว่า 365 เพจ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Real-time Monitor
          </Button>
          <Button className="ai-chat-gradient">
            <Brain className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="ai-analytics-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การสนทนาทั้งหมด</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="ai-analytics-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาตอบสนองเฉลี่ย</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-23%</span> เร็วขึ้นจากเดิม
            </p>
          </CardContent>
        </Card>

        <Card className="ai-analytics-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ความพึงพอใจลูกค้า</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.customerSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3</span> คะแนนจากเดิม
            </p>
          </CardContent>
        </Card>

        <Card className="ai-analytics-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ความแม่นยำ AI</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.aiAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> ปรับปรุงจากเดิม
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="conversations">การสนทนา</TabsTrigger>
          <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
          <TabsTrigger value="customers">ลูกค้า</TabsTrigger>
          <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Analysis */}
            <Card className="ai-feature-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  การวิเคราะห์อารมณ์ลูกค้า
                </CardTitle>
                <CardDescription>การวิเคราะห์ความรู้สึกจากการสนทนาแบบ Real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ความรู้สึกดี</span>
                    <span className="text-sm font-medium">{sentimentData.positive}%</span>
                  </div>
                  <Progress value={sentimentData.positive} className="ai-sentiment-positive" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">เป็นกลาง</span>
                    <span className="text-sm font-medium">{sentimentData.neutral}%</span>
                  </div>
                  <Progress value={sentimentData.neutral} className="ai-sentiment-neutral" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ความรู้สึกไม่ดี</span>
                    <span className="text-sm font-medium">{sentimentData.negative}%</span>
                  </div>
                  <Progress value={sentimentData.negative} className="ai-sentiment-negative" />
                </div>
              </CardContent>
            </Card>

            {/* AI Performance */}
            <Card className="ai-feature-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  ประสิทธิภาพ AI
                </CardTitle>
                <CardDescription>การติดตามประสิทธิภาพของระบบ AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics.resolutionRate}%</div>
                    <div className="text-sm text-green-700">อัตราการแก้ไขปัญหา</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics.activeConversations}</div>
                    <div className="text-sm text-blue-700">การสนทนาที่ใช้งานอยู่</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ความแม่นยำในการตอบ</span>
                    <span className="text-sm font-medium">{metrics.aiAccuracy}%</span>
                  </div>
                  <Progress value={metrics.aiAccuracy} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Insights */}
          <Card className="ai-feature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                ข้อมูลเชิงลึกลูกค้า
              </CardTitle>
              <CardDescription>การวิเคราะห์พฤติกรรมและความต้องการของลูกค้า</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerInsights.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.lastMessage}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          customer.sentiment === "positive"
                            ? "default"
                            : customer.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {customer.sentiment === "positive"
                          ? "ดี"
                          : customer.sentiment === "negative"
                            ? "ไม่ดี"
                            : "เป็นกลาง"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ความต้องการซื้อ: {customer.purchaseIntent}%
                      </Badge>
                      <div className="text-sm text-muted-foreground">{customer.responseTime}s</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card className="ai-feature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                การจัดการการสนทนา
              </CardTitle>
              <CardDescription>ระบบจัดการการสนทนาแบบ Real-time พร้อม AI Assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p>ระบบการสนทนาขั้นสูงกำลังพัฒนา...</p>
                <p className="text-sm">จะรองรับการสนทนาแบบ Multi-channel และ AI Automation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="ai-feature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                การวิเคราะห์ขั้นสูง
              </CardTitle>
              <CardDescription>รายงานและการวิเคราะห์เชิงลึกสำหรับการตัดสินใจทางธุรกิจ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p>ระบบการวิเคราะห์ขั้นสูงกำลังพัฒนา...</p>
                <p className="text-sm">จะรองรับ Predictive Analytics และ Business Intelligence</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="ai-feature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                การจัดการลูกค้า
              </CardTitle>
              <CardDescription>ระบบจัดการข้อมูลลูกค้าและการปรับแต่งประสบการณ์</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p>ระบบจัดการลูกค้าขั้นสูงกำลังพัฒนา...</p>
                <p className="text-sm">จะรองรับ Customer Segmentation และ Personalization</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="ai-feature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                การตั้งค่า AI
              </CardTitle>
              <CardDescription>การปรับแต่งพารามิเตอร์และการเรียนรู้ของระบบ AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p>ระบบการตั้งค่า AI ขั้นสูงกำลังพัฒนา...</p>
                <p className="text-sm">จะรองรับ Model Training และ Fine-tuning</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
