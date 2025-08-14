"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Target, Zap } from "lucide-react"
import {
  enhancedPredictiveAnalytics,
  type PredictionResult,
  type AnomalyDetection,
  type MarketTrend,
} from "@/lib/enhanced-predictive-analytics"

export function RealTimePredictionDashboard() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [recentPredictions, recentAnomalies, trends] = await Promise.all([
        Promise.resolve(enhancedPredictiveAnalytics.getRecentPredictions(20)),
        Promise.resolve(enhancedPredictiveAnalytics.getRecentAnomalies(10)),
        Promise.resolve(enhancedPredictiveAnalytics.getMarketTrends()),
      ])

      setPredictions(recentPredictions)
      setAnomalies(recentAnomalies)
      setMarketTrends(trends)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading prediction data:", error)
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const predictionChartData = predictions.slice(-10).map((pred, index) => ({
    time: new Date(pred.timestamp).toLocaleTimeString(),
    value: typeof pred.prediction === "number" ? pred.prediction : 0,
    confidence: pred.confidence * 100,
  }))

  const confidenceData = predictions.slice(-5).map((pred) => ({
    model: pred.modelId.replace("_", " "),
    confidence: pred.confidence * 100,
  }))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedPredictiveAnalytics.getModels().length}</div>
            <p className="text-xs text-muted-foreground">ML models running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions Today</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Real-time predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictions.length > 0
                ? Math.round((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Model accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Real-time Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Timeline</CardTitle>
                <CardDescription>Latest predictions from all models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Confidence</CardTitle>
                <CardDescription>Confidence levels by model</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="confidence" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>Latest predictions from all active models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.slice(-5).map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{prediction.modelId.replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">
                        Prediction:{" "}
                        {typeof prediction.prediction === "number"
                          ? prediction.prediction.toFixed(2)
                          : String(prediction.prediction)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Progress value={prediction.confidence * 100} className="w-20" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>System anomalies and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No anomalies detected</p>
                ) : (
                  anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(anomaly.severity) as any}>{anomaly.severity}</Badge>
                          <p className="font-medium">{anomaly.metric}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{anomaly.value.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Threshold: {anomaly.threshold}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketTrends.map((trend) => (
              <Card key={trend.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTrendIcon(trend.trend)}
                    {trend.category.replace("_", " ")}
                  </CardTitle>
                  <CardDescription>
                    {trend.trend} trend with {Math.round(trend.confidence * 100)}% confidence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{Math.round(trend.prediction.nextMonth)}%</p>
                        <p className="text-xs text-muted-foreground">Next Month</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{Math.round(trend.prediction.nextQuarter)}%</p>
                        <p className="text-xs text-muted-foreground">Next Quarter</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{Math.round(trend.prediction.nextYear)}%</p>
                        <p className="text-xs text-muted-foreground">Next Year</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Key Factors:</p>
                      <div className="flex flex-wrap gap-1">
                        {trend.factors.map((factor) => (
                          <Badge key={factor} variant="outline" className="text-xs">
                            {factor.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
              <CardDescription>Active ML models and their performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedPredictiveAnalytics.getModels().map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Type: {model.type} | Features: {model.features.length}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Progress value={model.accuracy * 100} className="w-20" />
                      <p className="text-xs text-muted-foreground">{Math.round(model.accuracy * 100)}% accuracy</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => enhancedPredictiveAnalytics.retrainModel(model.id)}
                      >
                        Retrain
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
