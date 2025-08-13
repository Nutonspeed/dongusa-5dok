"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  BarChart3,
  Zap,
  Settings,
  RefreshCw,
  Activity,
} from "lucide-react"
import { aiInventoryPrediction, type DemandPrediction, type InventoryOptimization } from "@/lib/ai-inventory-prediction"

export default function AIForecastingDashboard() {
  const [predictions, setPredictions] = useState<DemandPrediction[]>([])
  const [optimizations, setOptimizations] = useState<InventoryOptimization[]>([])
  const [abcAnalysis, setAbcAnalysis] = useState<any>(null)
  const [selectedModel, setSelectedModel] = useState<"linear_regression" | "arima" | "neural_network" | "ensemble">(
    "ensemble",
  )
  const [forecastHorizon, setForecastHorizon] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAIForecasts()
  }, [selectedModel, forecastHorizon])

  const loadAIForecasts = async () => {
    try {
      setLoading(true)
      const productIds = ["1", "2", "3", "4", "5"] // Mock product IDs

      const [predictionsData, optimizationsData, abcData] = await Promise.all([
        aiInventoryPrediction.predictDemand(productIds, forecastHorizon, selectedModel),
        aiInventoryPrediction.optimizeInventoryLevels(productIds),
        aiInventoryPrediction.performAdvancedABCAnalysis(),
      ])

      setPredictions(predictionsData)
      setOptimizations(optimizationsData)
      setAbcAnalysis(abcData)
    } catch (error) {
      console.error("Error loading AI forecasts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getModelAccuracy = (modelType: string) => {
    const accuracies = {
      linear_regression: 78,
      arima: 82,
      neural_network: 89,
      ensemble: 94,
    }
    return accuracies[modelType as keyof typeof accuracies] || 85
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50 border-green-200"
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังประมวลผล AI Forecasting...</p>
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
            AI Inventory Forecasting
          </h1>
          <p className="text-gray-600 mt-1">ระบบพยากรณ์คลังสินค้าด้วย Machine Learning ขั้นสูง</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select value={selectedModel} onValueChange={(value: any) => setSelectedModel(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ensemble">Ensemble Model (แนะนำ)</SelectItem>
              <SelectItem value="neural_network">Neural Network</SelectItem>
              <SelectItem value="arima">ARIMA</SelectItem>
              <SelectItem value="linear_regression">Linear Regression</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            ตั้งค่า AI
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            อัปเดตโมเดล
          </Button>
        </div>
      </div>

      {/* Model Performance */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ประสิทธิภาพโมเดล AI</h3>
              <p className="text-gray-600">โมเดลปัจจุบัน: {selectedModel.replace("_", " ").toUpperCase()}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{getModelAccuracy(selectedModel)}%</div>
              <div className="text-sm text-gray-600">ความแม่นยำ</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={getModelAccuracy(selectedModel)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">การพยากรณ์</TabsTrigger>
          <TabsTrigger value="optimization">การปรับปรุง</TabsTrigger>
          <TabsTrigger value="abc-analysis">ABC Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          {/* High Priority Alerts */}
          {predictions.some((p) => p.confidence_score < 0.6) && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>คำเตือน:</strong> มีการพยากรณ์ {predictions.filter((p) => p.confidence_score < 0.6).length}{" "}
                รายการที่มีความมั่นใจต่ำ ควรตรวจสอบข้อมูลเพิ่มเติม
              </AlertDescription>
            </Alert>
          )}

          {/* Prediction Cards */}
          <div className="grid gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.product_id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prediction.product_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceColor(prediction.confidence_score)}>
                        <Brain className="w-3 h-3 mr-1" />
                        {Math.round(prediction.confidence_score * 100)}% มั่นใจ
                      </Badge>
                      <Badge variant="outline">{prediction.model_used.replace("_", " ").toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    {/* Prediction Results */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        การพยากรณ์
                      </h4>
                      <div className="space-y-2">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{prediction.predicted_demand}</div>
                          <div className="text-sm text-blue-700">ความต้องการคาด</div>
                        </div>
                        <div className="text-xs text-gray-600 text-center">
                          ช่วง: {prediction.confidence_interval.lower} - {prediction.confidence_interval.upper}
                        </div>
                      </div>
                    </div>

                    {/* Contributing Factors */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        ปัจจัยที่มีผล
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">ฤดูกาล</span>
                          <div className="flex items-center">
                            {prediction.contributing_factors.seasonal > 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                            )}
                            <span className="text-sm font-medium">
                              {(prediction.contributing_factors.seasonal * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">แนวโน้ม</span>
                          <div className="flex items-center">
                            {prediction.contributing_factors.trend > 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                            )}
                            <span className="text-sm font-medium">
                              {(prediction.contributing_factors.trend * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">โปรโมชั่น</span>
                          <span className="text-sm font-medium">
                            +{(prediction.contributing_factors.promotional * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Model Insights */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        AI Insights
                      </h4>
                      <div className="space-y-2 text-sm">
                        {prediction.confidence_score > 0.8 && (
                          <div className="p-2 bg-green-50 text-green-800 rounded">
                            ความมั่นใจสูง - แนะนำให้ดำเนินการตามการพยากรณ์
                          </div>
                        )}
                        {prediction.contributing_factors.seasonal > 0.1 && (
                          <div className="p-2 bg-blue-50 text-blue-800 rounded">มีผลกระทบจากฤดูกาลสูง - เตรียมสต็อกเพิ่ม</div>
                        )}
                        {prediction.contributing_factors.promotional > 0.05 && (
                          <div className="p-2 bg-purple-50 text-purple-800 rounded">โปรโมชั่นมีผลต่อความต้องการ</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700">การดำเนินการ</h4>
                      <div className="space-y-2">
                        <Button size="sm" className="w-full">
                          <Target className="w-4 h-4 mr-2" />
                          ปรับแผนสต็อก
                        </Button>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6">
            {optimizations.map((opt) => (
              <Card key={opt.product_id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    การปรับปรุงสต็อก - Product {opt.product_id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{opt.current_stock}</div>
                      <div className="text-sm text-gray-600">สต็อกปัจจุบัน</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-blue-50">
                      <div className="text-lg font-bold text-blue-600">{opt.optimal_stock_level}</div>
                      <div className="text-sm text-blue-700">สต็อกที่เหมาะสม</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-orange-50">
                      <div className="text-lg font-bold text-orange-600">{opt.reorder_point}</div>
                      <div className="text-sm text-orange-700">จุดสั่งซื้อ</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-green-50">
                      <div className="text-lg font-bold text-green-600">{opt.safety_stock}</div>
                      <div className="text-sm text-green-700">สต็อกสำรอง</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-purple-50">
                      <div className="text-lg font-bold text-purple-600">
                        ฿{opt.carrying_cost_reduction.toLocaleString()}
                      </div>
                      <div className="text-sm text-purple-700">ประหยัดได้</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={Math.min((opt.current_stock / opt.optimal_stock_level) * 100, 100)}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-600 mt-1 text-center">ระดับสต็อกปัจจุบันเทียบกับที่เหมาะสม</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="abc-analysis" className="space-y-6">
          {abcAnalysis && (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      กลุ่ม A (สำคัญมาก)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-red-600">
                        {abcAnalysis.categories.A.products.length} รายการ
                      </div>
                      <div className="text-sm text-gray-600">
                        สร้างรายได้ {abcAnalysis.categories.A.revenue_contribution.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        {abcAnalysis.categories.A.management_strategy}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-yellow-700 flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      กลุ่ม B (สำคัญปานกลาง)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-yellow-600">
                        {abcAnalysis.categories.B.products.length} รายการ
                      </div>
                      <div className="text-sm text-gray-600">
                        สร้างรายได้ {abcAnalysis.categories.B.revenue_contribution.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        {abcAnalysis.categories.B.management_strategy}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      กลุ่ม C (สำคัญน้อย)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-green-600">
                        {abcAnalysis.categories.C.products.length} รายการ
                      </div>
                      <div className="text-sm text-gray-600">
                        สร้างรายได้ {abcAnalysis.categories.C.revenue_contribution.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        {abcAnalysis.categories.C.management_strategy}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>ข้อเสนอแนะจาก AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">ข้อมูลเชิงลึก</h4>
                      <ul className="space-y-1">
                        {abcAnalysis.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">คำแนะนำ</h4>
                      <ul className="space-y-1">
                        {abcAnalysis.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Insights Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4" />
                <p>AI Insights จะแสดงที่นี่</p>
                <p className="text-sm">ข้อมูลเชิงลึกและคำแนะนำจาก Machine Learning</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
