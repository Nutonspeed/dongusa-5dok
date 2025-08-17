"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  MousePointer,
  Brain,
  BarChart3,
  Play,
  Pause,
  Download,
  Zap,
  Plus,
  Edit,
  Star,
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "completed"
  budget: number
  spent: number
  reach: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  roas: number
  startDate: string
  endDate: string
  targetAudience: string[]
  adSets: number
  performance: "high" | "medium" | "low"
}

interface AudienceInsight {
  id: string
  name: string
  size: number
  demographics: {
    ageGroups: { range: string; percentage: number }[]
    gender: { male: number; female: number }
    locations: { country: string; percentage: number }[]
    interests: string[]
  }
  engagement: {
    avgTimeSpent: number
    interactionRate: number
    conversionProbability: number
  }
  aiRecommendations: string[]
}

interface AIRecommendation {
  id: string
  type: "audience" | "budget" | "creative" | "timing"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  confidence: number
  estimatedImprovement: string
}

export default function AdvancedFacebookAdvertisingDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([])
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data - in real app, this would fetch from Facebook Graph API
      const mockCampaigns: Campaign[] = [
        {
          id: "camp_001",
          name: "ผ้าคลุมโซฟาคอลเลกชันใหม่",
          status: "active",
          budget: 50000,
          spent: 32500,
          reach: 125000,
          impressions: 450000,
          clicks: 8900,
          conversions: 234,
          ctr: 1.98,
          cpc: 3.65,
          roas: 4.2,
          startDate: "2025-01-01",
          endDate: "2025-01-31",
          targetAudience: ["homeowners", "interior-design", "furniture"],
          adSets: 3,
          performance: "high",
        },
        {
          id: "camp_002",
          name: "ส่วนลดพิเศษ 30%",
          status: "active",
          budget: 30000,
          spent: 28900,
          reach: 89000,
          impressions: 320000,
          clicks: 5600,
          conversions: 156,
          ctr: 1.75,
          cpc: 5.16,
          roas: 2.8,
          startDate: "2025-01-10",
          endDate: "2025-01-25",
          targetAudience: ["bargain-hunters", "home-decor"],
          adSets: 2,
          performance: "medium",
        },
      ]

      const mockAudienceInsights: AudienceInsight[] = [
        {
          id: "aud_001",
          name: "เจ้าของบ้านที่รักการตัดแต่ง",
          size: 2500000,
          demographics: {
            ageGroups: [
              { range: "25-34", percentage: 35 },
              { range: "35-44", percentage: 40 },
              { range: "45-54", percentage: 25 },
            ],
            gender: { male: 35, female: 65 },
            locations: [
              { country: "กรุงเทพฯ", percentage: 45 },
              { country: "เชียงใหม่", percentage: 15 },
              { country: "ภูเก็ต", percentage: 12 },
            ],
            interests: ["การตัดแต่งบ้าน", "เฟอร์นิเจอร์", "ไลฟ์สไตล์"],
          },
          engagement: {
            avgTimeSpent: 4.2,
            interactionRate: 3.8,
            conversionProbability: 12.5,
          },
          aiRecommendations: ["เพิ่มงบโฆษณาในช่วงสุดสัปดาห์", "ใช้ภาพก่อน-หลังการใช้งาน", "เน้นข้อความเกี่ยวกับความทนทาน"],
        },
      ]

      const mockAIRecommendations: AIRecommendation[] = [
        {
          id: "rec_001",
          type: "audience",
          title: "ขยายกลุ่มเป้าหมายไปยัง Lookalike Audience",
          description: "สร้าง Lookalike Audience จากลูกค้าที่มีมูลค่าสูงเพื่อเพิ่มการเข้าถึง",
          impact: "high",
          confidence: 87,
          estimatedImprovement: "+25% conversions",
        },
        {
          id: "rec_002",
          type: "budget",
          title: "เพิ่มงบโฆษณาในช่วง 18:00-22:00",
          description: "ข้อมูลแสดงว่าผู้ใช้มีการ engage สูงสุดในช่วงเวลานี้",
          impact: "medium",
          confidence: 92,
          estimatedImprovement: "+15% CTR",
        },
        {
          id: "rec_003",
          type: "creative",
          title: "ทดสอบวิดีโอโฆษณาแทนรูปภาพ",
          description: "วิดีโอมีอัตราการมีส่วนร่วมสูงกว่ารูปภาพ 3.2 เท่า",
          impact: "high",
          confidence: 78,
          estimatedImprovement: "+40% engagement",
        },
      ]

      setCampaigns(mockCampaigns)
      setAudienceInsights(mockAudienceInsights)
      setAIRecommendations(mockAIRecommendations)
      setSelectedCampaign(mockCampaigns[0])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("th-TH").format(num)
  }

  const getPerformanceBadge = (performance: string) => {
    const colors = {
      high: "campaign-performance-high text-white",
      medium: "campaign-performance-medium text-white",
      low: "campaign-performance-low text-white",
    }
    return colors[performance as keyof typeof colors] || colors.medium
  }

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "text-green-600 bg-green-50",
      medium: "text-yellow-600 bg-yellow-50",
      low: "text-gray-600 bg-gray-50",
    }
    return colors[impact as keyof typeof colors] || colors.medium
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
          <h1 className="text-3xl font-bold text-primary">Facebook Advertising</h1>
          <p className="text-gray-600 mt-1">ระบบจัดการโฆษณา Facebook ขั้นสูงด้วย AI</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            สร้างแคมเปญใหม่
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="fb-ads-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">งบรวมทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(campaigns.reduce((sum, c) => sum + c.budget, 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="fb-ads-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">การเข้าถึงรวม</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(campaigns.reduce((sum, c) => sum + c.reach, 0))}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="fb-ads-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">คลิกรวม</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(campaigns.reduce((sum, c) => sum + c.clicks, 0))}
                </p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="fb-ads-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROAS เฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length).toFixed(1)}x
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="campaigns">แคมเปญ</TabsTrigger>
          <TabsTrigger value="audiences">กลุ่มเป้าหมาย</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Campaign Performance */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>ประสิทธิภาพแคมเปญ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge className={getPerformanceBadge(campaign.performance)}>
                              {campaign.performance === "high"
                                ? "สูง"
                                : campaign.performance === "medium"
                                  ? "ปานกลาง"
                                  : "ต่ำ"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              {campaign.status === "active" ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">งบประมาณ</p>
                            <p className="font-medium">{formatCurrency(campaign.budget)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">การเข้าถึง</p>
                            <p className="font-medium">{formatNumber(campaign.reach)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">CTR</p>
                            <p className="font-medium">{campaign.ctr}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">ROAS</p>
                            <p className="font-medium text-green-600">{campaign.roas}x</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>งบที่ใช้ไป</span>
                            <span>{((campaign.spent / campaign.budget) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    คำแนะนำจาก AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiRecommendations.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="p-3 border rounded-lg audience-targeting-glow">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getImpactColor(rec.impact)}>
                            {rec.impact === "high" ? "ผลกระทบสูง" : rec.impact === "medium" ? "ปานกลาง" : "ต่ำ"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">{rec.confidence}%</span>
                          </div>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 font-medium">{rec.estimatedImprovement}</span>
                          <Button size="sm" variant="outline" className="text-xs h-6 bg-transparent">
                            ใช้งาน
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการแคมเปญ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4" />
                <p>รายละเอียดการจัดการแคมเปญจะแสดงที่นี่</p>
                <p className="text-sm">สร้าง แก้ไข และติดตามแคมเปญโฆษณา Facebook</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>การวิเคราะห์กลุ่มเป้าหมาย</CardTitle>
            </CardHeader>
            <CardContent>
              {audienceInsights.map((audience) => (
                <div key={audience.id} className="audience-insight-card p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{audience.name}</h3>
                    <Badge variant="outline">{formatNumber(audience.size)} คน</Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">กลุ่มอายุ</h4>
                      <div className="space-y-2">
                        {audience.demographics.ageGroups.map((group, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{group.range} ปี</span>
                            <div className="flex items-center gap-2">
                              <Progress value={group.percentage} className="w-16 h-2" />
                              <span className="text-sm text-gray-600">{group.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">เพศ</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">หญิง</span>
                          <div className="flex items-center gap-2">
                            <Progress value={audience.demographics.gender.female} className="w-16 h-2" />
                            <span className="text-sm text-gray-600">{audience.demographics.gender.female}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">ชาย</span>
                          <div className="flex items-center gap-2">
                            <Progress value={audience.demographics.gender.male} className="w-16 h-2" />
                            <span className="text-sm text-gray-600">{audience.demographics.gender.male}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">ความสนใจ</h4>
                      <div className="flex flex-wrap gap-2">
                        {audience.demographics.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-3">คำแนะนำจาก AI</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {audience.aiRecommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-sm text-primary">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className="audience-insight-card p-6 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(rec.impact)}>
                          {rec.impact === "high" ? "ผลกระทบสูง" : rec.impact === "medium" ? "ปานกลาง" : "ต่ำ"}
                        </Badge>
                        <Badge variant="outline">{rec.type}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{rec.confidence}%</span>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2">{rec.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{rec.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">{rec.estimatedImprovement}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          ดูรายละเอียด
                        </Button>
                        <Button size="sm">ใช้งาน</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>การวิเคราะห์ประสิทธิภาพ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p>กราฟและการวิเคราะห์ประสิทธิภาพจะแสดงที่นี่</p>
                <p className="text-sm">ติดตามผลลัพธ์และ ROI ของแคมเปญโฆษณา</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
