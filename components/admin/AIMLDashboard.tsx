"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  Eye,
  MessageSquare,
  TrendingUp,
  Zap,
  Target,
  Settings,
  RefreshCw,
  Upload,
  Camera,
  BarChart3,
} from "lucide-react"
import {
  advancedAIML,
  type RecommendationResult,
  type NLPAnalysis,
  type ComputerVisionResult,
} from "@/lib/advanced-ai-ml-engine"

export function AIMLDashboard() {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [nlpAnalysis, setNlpAnalysis] = useState<NLPAnalysis | null>(null)
  const [visionResult, setVisionResult] = useState<ComputerVisionResult | null>(null)
  const [customerPrediction, setCustomerPrediction] = useState<any>(null)
  const [pricingOptimization, setPricingOptimization] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [textInput, setTextInput] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [userId, setUserId] = useState("user_123")
  const [productId, setProductId] = useState("product_1")

  const handleGenerateRecommendations = async () => {
    setLoading(true)
    try {
      const results = await advancedAIML.generateProductRecommendations(userId, {
        category: "sofa-covers",
        price_range: [1000, 5000],
      })
      setRecommendations(results)
    } catch (error) {
      console.error("Error generating recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) return
    setLoading(true)
    try {
      const analysis = await advancedAIML.analyzeText(textInput, {
        detect_intent: true,
        extract_entities: true,
      })
      setNlpAnalysis(analysis)
    } catch (error) {
      console.error("Error analyzing text:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeImage = async () => {
    if (!imageUrl.trim()) return
    setLoading(true)
    try {
      const result = await advancedAIML.analyzeImage(imageUrl, {
        find_similar: true,
        quality_check: true,
      })
      setVisionResult(result)
    } catch (error) {
      console.error("Error analyzing image:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePredictCustomerBehavior = async (predictionType: string) => {
    setLoading(true)
    try {
      const prediction = await advancedAIML.predictCustomerBehavior(userId, predictionType as any)
      setCustomerPrediction({ type: predictionType, ...prediction })
    } catch (error) {
      console.error("Error predicting customer behavior:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOptimizePricing = async () => {
    setLoading(true)
    try {
      const optimization = await advancedAIML.optimizePricing(productId, {
        competitor_prices: [2200, 2800, 2600],
        demand_forecast: 120,
        inventory_level: 50,
        seasonal_factor: 1.1,
      })
      setPricingOptimization(optimization)
    } catch (error) {
      console.error("Error optimizing pricing:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Brain className="w-8 h-8" />
            AI & Machine Learning Dashboard
          </h1>
          <p className="text-gray-600 mt-1">ระบบ AI ขั้นสูงสำหรับการวิเคราะห์และพยากรณ์</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            ตั้งค่า AI Models
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            อัปเดตโมเดล
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recommendations">Product Recommendations</TabsTrigger>
          <TabsTrigger value="nlp">Natural Language Processing</TabsTrigger>
          <TabsTrigger value="vision">Computer Vision</TabsTrigger>
          <TabsTrigger value="predictions">Customer Predictions</TabsTrigger>
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AI Product Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-48"
                />
                <Button onClick={handleGenerateRecommendations} disabled={loading}>
                  <Brain className="w-4 h-4 mr-2" />
                  {loading ? "กำลังวิเคราะห์..." : "สร้างคำแนะนำ"}
                </Button>
              </div>

              {recommendations.length > 0 && (
                <div className="grid gap-4">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">Product {rec.product_id}</h4>
                            <p className="text-sm text-gray-600">{rec.reason}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-2">
                              {rec.category}
                            </Badge>
                            <div className="text-sm">
                              <span className="font-medium">Score: </span>
                              <span className={getConfidenceColor(rec.score)}>{(rec.score * 100).toFixed(1)}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Confidence: </span>
                              <span className={getConfidenceColor(rec.confidence)}>
                                {(rec.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nlp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Natural Language Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="พิมพ์ข้อความที่ต้องการวิเคราะห์..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleAnalyzeText} disabled={loading || !textInput.trim()}>
                  <Brain className="w-4 h-4 mr-2" />
                  {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์ข้อความ"}
                </Button>
              </div>

              {nlpAnalysis && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Sentiment Analysis</h4>
                        <Badge className={getSentimentColor(nlpAnalysis.sentiment)}>
                          {nlpAnalysis.sentiment} ({(nlpAnalysis.sentiment_score * 100).toFixed(1)}%)
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Language</h4>
                        <Badge variant="outline">{nlpAnalysis.language === "th" ? "ไทย" : "English"}</Badge>
                      </div>
                    </div>

                    {nlpAnalysis.keywords.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {nlpAnalysis.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {nlpAnalysis.entities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Entities</h4>
                        <div className="space-y-2">
                          {nlpAnalysis.entities.map((entity, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                              <span>{entity.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{entity.type}</Badge>
                                <span className="text-sm text-gray-600">{(entity.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nlpAnalysis.intent && (
                      <div>
                        <h4 className="font-semibold mb-2">Intent</h4>
                        <Badge className="bg-purple-100 text-purple-800">{nlpAnalysis.intent}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Computer Vision Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button onClick={handleAnalyzeImage} disabled={loading || !imageUrl.trim()}>
                  <Camera className="w-4 h-4 mr-2" />
                  {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์รูปภาพ"}
                </Button>
              </div>

              {visionResult && (
                <div className="space-y-4">
                  {imageUrl && (
                    <div className="text-center">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt="Analysis"
                        className="max-w-md mx-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  <Card className="bg-gray-50">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Objects Detected</h4>
                          <div className="space-y-2">
                            {visionResult.objects.map((obj, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                                <span className="capitalize">{obj.name}</span>
                                <span className="text-sm text-gray-600">{(obj.confidence * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Color Analysis</h4>
                          <div className="space-y-2">
                            {visionResult.colors.map((color, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.hex }}></div>
                                  <span>{color.name}</span>
                                </div>
                                <span className="text-sm text-gray-600">{color.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Quality Score</h4>
                        <div className="flex items-center gap-4">
                          <Progress value={visionResult.quality_score * 100} className="flex-1" />
                          <span className="font-medium">{(visionResult.quality_score * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Auto Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {visionResult.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Customer Behavior Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-48"
                />
                <Select onValueChange={handlePredictCustomerBehavior}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="เลือกประเภทการพยากรณ์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="churn">Churn Risk</SelectItem>
                    <SelectItem value="lifetime_value">Lifetime Value</SelectItem>
                    <SelectItem value="next_purchase">Next Purchase</SelectItem>
                    <SelectItem value="price_sensitivity">Price Sensitivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customerPrediction && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold capitalize">
                        {customerPrediction.type.replace("_", " ")} Prediction
                      </h4>
                      <Badge className={getConfidenceColor(customerPrediction.confidence)}>
                        {(customerPrediction.confidence * 100).toFixed(1)}% Confidence
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Prediction Result</h5>
                        <div className="p-3 bg-white rounded">
                          <pre className="text-sm">{JSON.stringify(customerPrediction.prediction, null, 2)}</pre>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Contributing Factors</h5>
                        <div className="space-y-2">
                          {customerPrediction.factors.map((factor: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                              <span className="text-sm">{factor.factor}</span>
                              <span className="text-sm font-medium">{(factor.importance * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {customerPrediction.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">AI Recommendations</h5>
                        <ul className="space-y-1">
                          {customerPrediction.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dynamic Pricing Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Product ID"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-48"
                />
                <Button onClick={handleOptimizePricing} disabled={loading}>
                  <Zap className="w-4 h-4 mr-2" />
                  {loading ? "กำลังคำนวณ..." : "ปรับปรุงราคา"}
                </Button>
              </div>

              {pricingOptimization && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded">
                        <div className="text-2xl font-bold text-green-600">
                          ฿{pricingOptimization.recommended_price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">ราคาที่แนะนำ</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {(pricingOptimization.revenue_impact * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">ผลกระทบต่อรายได้</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {(pricingOptimization.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">ความมั่นใจ</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Analysis Details</h5>
                      <ul className="space-y-1">
                        {pricingOptimization.reasoning.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
