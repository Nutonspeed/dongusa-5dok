"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Calendar,
  Target,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react"
import { useInventoryForecast, useInventoryInsights } from "@/hooks/use-advanced-inventory"
import { formatCurrency } from "@/lib/money"

export default function InventoryForecastDashboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "quarterly">("monthly")
  const { forecasts, loading: forecastLoading, error: forecastError } = useInventoryForecast(timeframe)
  const { insights, loading: insightsLoading } = useInventoryInsights()

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50"
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getUrgencyBadge = (days: number) => {
    if (days <= 3) return <Badge variant="destructive">เร่งด่วน</Badge>
    if (days <= 7) return <Badge variant="default">สำคัญ</Badge>
    return <Badge variant="secondary">ปกติ</Badge>
  }

  if (forecastLoading || insightsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Forecasting Dashboard</h1>
          <p className="text-gray-600 mt-1">การพยากรณ์และวิเคราะห์คลังสินค้าขั้นสูง</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            ตั้งค่า
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            อัปเดต
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">มูลค่าคลังสินค้า</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.total_value)}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">อัตราการหมุนเวียน</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.turnover_rate}x</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">เสี่ยงสต็อกหมด</p>
                  <p className="text-2xl font-bold text-red-600">{insights.stockout_risk_items}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ประหยัดได้</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(insights.cost_optimization_potential)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forecast Alerts */}
      {forecasts.some((f) => new Date(f.optimal_reorder_date).getTime() - Date.now() <= 3 * 24 * 60 * 60 * 1000) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>แจ้งเตือนเร่งด่วน:</strong> มีสินค้า{" "}
            {
              forecasts.filter(
                (f) => new Date(f.optimal_reorder_date).getTime() - Date.now() <= 3 * 24 * 60 * 60 * 1000,
              ).length
            }{" "}
            รายการที่ต้องสั่งซื้อภายใน 3 วัน
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">รายสัปดาห์</TabsTrigger>
          <TabsTrigger value="monthly">รายเดือน</TabsTrigger>
          <TabsTrigger value="quarterly">รายไตรมาส</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-6">
          {/* Forecast Cards */}
          <div className="grid gap-6">
            {forecasts.map((forecast) => {
              const daysUntilReorder = Math.ceil(
                (new Date(forecast.optimal_reorder_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              )

              return (
                <Card key={forecast.product_id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{forecast.product_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getUrgencyBadge(daysUntilReorder)}
                        <Badge className={getConfidenceColor(forecast.confidence_score)}>
                          ความมั่นใจ {Math.round(forecast.confidence_score * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                      {/* Current Status */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">สถานะปัจจุบัน</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>สต็อกปัจจุบัน:</span>
                            <span className="font-medium">{forecast.current_stock} ชิ้น</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>ความต้องการคาด:</span>
                            <span className="font-medium">{forecast.predicted_demand} ชิ้น</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">คำแนะนำ</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>ควรสั่งซื้อ:</span>
                            <span className="font-medium text-blue-600">{forecast.recommended_order_quantity} ชิ้น</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>วันที่ควรสั่ง:</span>
                            <span className="font-medium text-orange-600">
                              {new Date(forecast.optimal_reorder_date).toLocaleDateString("th-TH")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trend Factors */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">ปัจจัยแนวโน้ม</h4>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>ฤดูกาล:</span>
                            <div className="flex items-center">
                              {forecast.seasonal_factor > 1 ? (
                                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                              )}
                              <span className="font-medium">{(forecast.seasonal_factor * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>แนวโน้ม:</span>
                            <div className="flex items-center">
                              {forecast.trend_factor > 1 ? (
                                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                              )}
                              <span className="font-medium">{(forecast.trend_factor * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">การดำเนินการ</h4>
                        <div className="space-y-2">
                          <Button size="sm" className="w-full">
                            <Package className="w-4 h-4 mr-2" />
                            สั่งซื้อเลย
                          </Button>
                          <Button size="sm" variant="outline" className="w-full bg-transparent">
                            <Calendar className="w-4 h-4 mr-2" />
                            ตั้งเตือน
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>ความต้องการเทียบกับสต็อก</span>
                        <span>
                          {Math.round((forecast.predicted_demand / forecast.current_stock) * 100)}% ของสต็อกปัจจุบัน
                        </span>
                      </div>
                      <Progress
                        value={Math.min((forecast.predicted_demand / forecast.current_stock) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {forecasts.length === 0 && !forecastLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีข้อมูลการพยากรณ์</h3>
                <p className="text-gray-600">ยังไม่มีข้อมูลเพียงพอสำหรับการพยากรณ์คลังสินค้า</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
