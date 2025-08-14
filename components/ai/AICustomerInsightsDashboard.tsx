"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  User,
  TrendingUp,
  TrendingDown,
  Heart,
  AlertTriangle,
  MessageSquare,
  Eye,
  Target,
  Zap,
} from "lucide-react"
import { advancedAI, type CustomerInsight, type NLPAnalysis } from "@/lib/advanced-ai-features"

export default function AICustomerInsightsDashboard() {
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInsight | null>(null)
  const [textAnalysis, setTextAnalysis] = useState<NLPAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomerInsights()
  }, [])

  const loadCustomerInsights = async () => {
    try {
      setLoading(true)
      const customerIds = ["cust_001", "cust_002", "cust_003", "cust_004", "cust_005"]

      const insights = await Promise.all(customerIds.map((id) => advancedAI.generateCustomerInsights(id)))

      setCustomerInsights(insights)
      if (insights.length > 0) {
        setSelectedCustomer(insights[0])
      }
    } catch (error) {
      console.error("Error loading customer insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeCustomerFeedback = async (text: string) => {
    try {
      const analysis = await advancedAI.analyzeText(text)
      setTextAnalysis(analysis)
    } catch (error) {
      console.error("Error analyzing text:", error)
    }
  }

  const getSegmentColor = (segment: CustomerInsight["segment"]) => {
    const colors = {
      high_value: "bg-purple-100 text-purple-800 border-purple-200",
      loyal: "bg-green-100 text-green-800 border-green-200",
      at_risk: "bg-red-100 text-red-800 border-red-200",
      new: "bg-blue-100 text-blue-800 border-blue-200",
      dormant: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[segment]
  }

  const getSegmentIcon = (segment: CustomerInsight["segment"]) => {
    const icons = {
      high_value: <Target className="w-4 h-4" />,
      loyal: <Heart className="w-4 h-4" />,
      at_risk: <AlertTriangle className="w-4 h-4" />,
      new: <User className="w-4 h-4" />,
      dormant: <Eye className="w-4 h-4" />,
    }
    return icons[segment]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังวิเคราะห์ข้อมูลลูกค้าด้วย AI...</p>
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
            <Brain className="w-8 h-8" />
            AI Customer Insights
          </h1>
          <p className="text-gray-600 mt-1">ข้อมูลเชิงลึกลูกค้าด้วย Artificial Intelligence</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            วิเคราะห์ข้อความ
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            สร้าง Insights
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ลูกค้าทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customerInsights.map((customer) => (
                <div
                  key={customer.customer_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCustomer?.customer_id === customer.customer_id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Customer {customer.customer_id.slice(-3)}</span>
                    <Badge className={getSegmentColor(customer.segment)}>
                      {getSegmentIcon(customer.segment)}
                      <span className="ml-1 capitalize">{customer.segment.replace("_", " ")}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>CLV: ฿{customer.lifetime_value.toLocaleString()}</div>
                    <div>Engagement: {customer.engagement_score}%</div>
                  </div>
                  <div className="mt-2">
                    <Progress value={customer.engagement_score} className="h-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-2">
          {selectedCustomer && (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                <TabsTrigger value="behavior">พฤติกรรม</TabsTrigger>
                <TabsTrigger value="predictions">การพยากรณ์</TabsTrigger>
                <TabsTrigger value="recommendations">คำแนะนำ</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        ข้อมูลลูกค้า
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>กลุ่มลูกค้า</span>
                        <Badge className={getSegmentColor(selectedCustomer.segment)}>
                          {getSegmentIcon(selectedCustomer.segment)}
                          <span className="ml-1 capitalize">{selectedCustomer.segment.replace("_", " ")}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Customer Lifetime Value</span>
                        <span className="font-bold text-green-600">
                          ฿{selectedCustomer.lifetime_value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Engagement Score</span>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedCustomer.engagement_score} className="w-20 h-2" />
                          <span className="font-medium">{selectedCustomer.engagement_score}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ความเสี่ยงการหายไป</span>
                        <div className="flex items-center gap-2">
                          {selectedCustomer.churn_probability > 0.5 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          )}
                          <span
                            className={`font-medium ${
                              selectedCustomer.churn_probability > 0.5 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {Math.round(selectedCustomer.churn_probability * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        การพยากรณ์การซื้อครั้งถัดไป
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedCustomer.next_purchase_prediction.days} วัน
                        </div>
                        <div className="text-sm text-blue-700">คาดว่าจะซื้อครั้งถัดไป</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">ความมั่นใจ</span>
                          <span className="text-sm font-medium">
                            {Math.round(selectedCustomer.next_purchase_prediction.confidence * 100)}%
                          </span>
                        </div>
                        <Progress value={selectedCustomer.next_purchase_prediction.confidence * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">สินค้าที่น่าจะสนใจ</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedCustomer.next_purchase_prediction.likely_products.map((product, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>รูปแบบพฤติกรรม</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">หมวดหมู่ที่ชื่นชอบ</h4>
                        <div className="space-y-2">
                          {selectedCustomer.behavioral_patterns.preferred_categories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="capitalize">{category}</span>
                              <Badge variant="outline">{Math.round((1 - index * 0.2) * 100)}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">ลักษณะการซื้อ</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>ความถี่ในการซื้อ</span>
                            <Badge
                              className={
                                selectedCustomer.behavioral_patterns.shopping_frequency === "high"
                                  ? "bg-green-100 text-green-800"
                                  : selectedCustomer.behavioral_patterns.shopping_frequency === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {selectedCustomer.behavioral_patterns.shopping_frequency}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>ความไวต่อราคา</span>
                            <Badge
                              className={
                                selectedCustomer.behavioral_patterns.price_sensitivity === "low"
                                  ? "bg-green-100 text-green-800"
                                  : selectedCustomer.behavioral_patterns.price_sensitivity === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {selectedCustomer.behavioral_patterns.price_sensitivity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="predictions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>การพยากรณ์ด้วย AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4" />
                      <p>การพยากรณ์ขั้นสูงจะแสดงที่นี่</p>
                      <p className="text-sm">รวมถึงการวิเคราะห์แนวโน้มและความเสี่ยง</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid gap-4">
                  {selectedCustomer.recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{rec.product_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              {Math.round(rec.confidence_score * 100)}% มั่นใจ
                            </Badge>
                            <span className="font-bold text-green-600">฿{rec.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <div className="flex flex-wrap gap-1">
                            {rec.reasoning.map((reason, idx) => (
                              <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium">ประวัติ</div>
                            <div>{Math.round(rec.personalization_factors.purchase_history * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">พฤติกรรม</div>
                            <div>{Math.round(rec.personalization_factors.browsing_behavior * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">กลุ่ม</div>
                            <div>{Math.round(rec.personalization_factors.demographic * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">ฤดูกาล</div>
                            <div>{Math.round(rec.personalization_factors.seasonal * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">ยอดนิยม</div>
                            <div>{Math.round(rec.personalization_factors.trending * 100)}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
