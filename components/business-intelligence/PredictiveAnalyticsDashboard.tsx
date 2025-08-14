"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Brain, TrendingUp, Target, Eye, Download, RefreshCw, AlertTriangle, Activity, BarChart3 } from "lucide-react"
import { enhancedBI, type DataInsight, type BusinessMetric } from "@/lib/enhanced-business-intelligence"

const COLORS = ["#ec4899", "#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

export default function PredictiveAnalyticsDashboard() {
  const [insights, setInsights] = useState<DataInsight[]>([])
  const [metrics, setMetrics] = useState<BusinessMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("insights")

  useEffect(() => {
    loadPredictiveData()
  }, [])

  const loadPredictiveData = async () => {
    try {
      setLoading(true)
      const [insightsData, metricsData] = await Promise.all([
        enhancedBI.generateAdvancedInsights(),
        enhancedBI.getBusinessMetrics(),
      ])
      setInsights(insightsData)
      setMetrics(metricsData)
    } catch (error) {
      console.error("Error loading predictive data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case "anomaly":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "correlation":
        return <Activity className="w-5 h-5 text-purple-600" />
      case "prediction":
        return <Brain className="w-5 h-5 text-green-600" />
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800"
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const renderVisualization = (insight: DataInsight) => {
    const { visualization_type, data_points } = insight

    switch (visualization_type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data_points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#ec4899" name="จริง" />
              <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeDasharray="5 5" name="พยากรณ์" />
            </LineChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data_points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#ec4899" name="ยอดขาย" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart data={data_points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="churn_risk" name="ความเสี่ยง" />
              <YAxis dataKey="clv" name="CLV" />
              <Tooltip />
              <Scatter fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data_points}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="potential"
                label={({ category, potential }) => `${category}: ${potential.toLocaleString()}`}
              >
                {data_points.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="text-center text-gray-500">ไม่สามารถแสดงกราฟได้</div>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบวิเคราะห์เชิงพยากรณ์และ Business Intelligence ขั้นสูง</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button onClick={loadPredictiveData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.slice(0, 4).map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value.toFixed(1)}
                    {metric.unit}
                  </p>
                  <div className="flex items-center mt-1">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-600 mr-1 rotate-180" />
                    )}
                    <span
                      className={`text-sm font-medium ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
                    >
                      {metric.change_percentage > 0 ? "+" : ""}
                      {metric.change_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  เป้าหมาย: {metric.target}
                  {metric.unit}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">การพยากรณ์</TabsTrigger>
          <TabsTrigger value="models">โมเดล ML</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <Badge className={getConfidenceColor(insight.confidence)}>ความมั่นใจ {insight.confidence}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{insight.description}</p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{insight.impact_score}/10</div>
                      <div className="text-sm text-blue-700">Impact Score</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{insight.confidence}%</div>
                      <div className="text-sm text-green-700">ความมั่นใจ</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{insight.type}</div>
                      <div className="text-sm text-purple-700">ประเภทการวิเคราะห์</div>
                    </div>
                  </div>

                  {/* Visualization */}
                  <div className="mb-4">{renderVisualization(insight)}</div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      ส่งออกข้อมูล
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>ระบบการพยากรณ์ใช้ Machine Learning เพื่อวิเคราะห์แนวโน้มและคาดการณ์ผลลัพธ์ทางธุรกิจ</AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  การพยากรณ์รายได้ 6 เดือนข้างหน้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { month: "ม.ค.", predicted: 95000, confidence_upper: 105000, confidence_lower: 85000 },
                      { month: "ก.พ.", predicted: 102000, confidence_upper: 115000, confidence_lower: 89000 },
                      { month: "มี.ค.", predicted: 98000, confidence_upper: 110000, confidence_lower: 86000 },
                      { month: "เม.ย.", predicted: 108000, confidence_upper: 125000, confidence_lower: 91000 },
                      { month: "พ.ค.", predicted: 115000, confidence_upper: 135000, confidence_lower: 95000 },
                      { month: "มิ.ย.", predicted: 122000, confidence_upper: 145000, confidence_lower: 99000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="predicted" stroke="#ec4899" strokeWidth={3} name="พยากรณ์" />
                    <Line
                      type="monotone"
                      dataKey="confidence_upper"
                      stroke="#f43f5e"
                      strokeDasharray="5 5"
                      name="ขอบเขตบน"
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence_lower"
                      stroke="#f43f5e"
                      strokeDasharray="5 5"
                      name="ขอบเขตล่าง"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  การพยากรณ์ลูกค้าใหม่
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">47</div>
                  <div className="text-sm text-gray-600">ลูกค้าใหม่เดือนหน้า (คาดการณ์)</div>
                  <div className="text-sm text-green-600 mt-1">ความมั่นใจ 82%</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ช่วงที่น่าจะเป็น:</span>
                    <span className="font-medium">35-59 คน</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>แหล่งที่มาหลัก:</span>
                    <span className="font-medium">Facebook (65%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                โมเดล Machine Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Revenue Forecasting", type: "Time Series", accuracy: 87, status: "active" },
                  { name: "Customer Churn Prediction", type: "Classification", accuracy: 82, status: "active" },
                  { name: "Product Recommendation", type: "Collaborative Filtering", accuracy: 79, status: "training" },
                  { name: "Inventory Optimization", type: "Regression", accuracy: 85, status: "active" },
                  { name: "Price Optimization", type: "Reinforcement Learning", accuracy: 73, status: "testing" },
                  { name: "Market Segmentation", type: "Clustering", accuracy: 91, status: "active" },
                ].map((model, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{model.name}</h4>
                        <Badge variant={model.status === "active" ? "default" : "secondary"}>{model.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{model.type}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>ความแม่นยำ:</span>
                          <span className="font-medium">{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-1" />
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent">
                        <Eye className="w-3 h-3 mr-2" />
                        ดูรายละเอียด
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
