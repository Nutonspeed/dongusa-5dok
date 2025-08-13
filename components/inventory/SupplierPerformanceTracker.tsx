"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Award,
  Target,
} from "lucide-react"
import { useSupplierPerformance } from "@/hooks/use-advanced-inventory"

export default function SupplierPerformanceTracker() {
  const { performance, loading, error, refreshPerformance } = useSupplierPerformance()
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  const getRatingColor = (rating: number) => {
    if (rating >= 0.9) return "text-green-600"
    if (rating >= 0.8) return "text-blue-600"
    if (rating >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  const getRatingBadge = (rating: number) => {
    if (rating >= 0.9) return <Badge className="bg-green-100 text-green-800">ยอดเยี่ยม</Badge>
    if (rating >= 0.8) return <Badge className="bg-blue-100 text-blue-800">ดี</Badge>
    if (rating >= 0.7) return <Badge className="bg-yellow-100 text-yellow-800">ปานกลาง</Badge>
    return <Badge className="bg-red-100 text-red-800">ต้องปรับปรุง</Badge>
  }

  const getPerformanceIcon = (value: number, threshold = 0.8) => {
    return value >= threshold ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshPerformance}>
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Performance Tracker</h1>
          <p className="text-gray-600 mt-1">ติดตามและประเมินประสิทธิภาพซัพพลายเออร์</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button onClick={refreshPerformance} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            อัปเดตข้อมูล
          </Button>
          <Button>
            <Award className="w-4 h-4 mr-2" />
            สร้างรายงาน
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ซัพพลายเออร์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{performance.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.length > 0
                    ? ((performance.reduce((sum, p) => sum + p.overall_rating, 0) / performance.length) * 100).toFixed(
                        1,
                      )
                    : 0}
                  %
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ส่งตรงเวลา</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.length > 0
                    ? (
                        (performance.reduce((sum, p) => sum + p.on_time_delivery_rate, 0) / performance.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">คุณภาพเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.length > 0
                    ? ((performance.reduce((sum, p) => sum + p.quality_score, 0) / performance.length) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance Cards */}
      <div className="grid gap-6">
        {performance.map((supplier) => (
          <Card key={supplier.supplier_id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{supplier.supplier_name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    ประเมินล่าสุด: {new Date(supplier.last_evaluation_date).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getRatingBadge(supplier.overall_rating)}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRatingColor(supplier.overall_rating)}`}>
                      {(supplier.overall_rating * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">คะแนนรวม</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="metrics">ตัวชี้วัด</TabsTrigger>
                  <TabsTrigger value="details">รายละเอียด</TabsTrigger>
                  <TabsTrigger value="recommendations">คำแนะนำ</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">การส่งมอบตรงเวลา</span>
                          <div className="flex items-center gap-1">
                            {getPerformanceIcon(supplier.on_time_delivery_rate)}
                            <span className="font-semibold">{(supplier.on_time_delivery_rate * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <Progress value={supplier.on_time_delivery_rate * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">คุณภาพสินค้า</span>
                          <div className="flex items-center gap-1">
                            {getPerformanceIcon(supplier.quality_score)}
                            <span className="font-semibold">{(supplier.quality_score * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <Progress value={supplier.quality_score * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ความสามารถในการแข่งขันด้านราคา</span>
                          <div className="flex items-center gap-1">
                            {getPerformanceIcon(supplier.cost_competitiveness)}
                            <span className="font-semibold">{(supplier.cost_competitiveness * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <Progress value={supplier.cost_competitiveness * 100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ความแม่นยำของ Lead Time</span>
                          <div className="flex items-center gap-1">
                            {getPerformanceIcon(supplier.lead_time_accuracy)}
                            <span className="font-semibold">{(supplier.lead_time_accuracy * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <Progress value={supplier.lead_time_accuracy * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{supplier.total_orders}</div>
                      <div className="text-sm text-blue-700">คำสั่งซื้อทั้งหมด</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(supplier.on_time_delivery_rate * supplier.total_orders)}
                      </div>
                      <div className="text-sm text-green-700">ส่งตรงเวลา</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(supplier.quality_score * supplier.total_orders)}
                      </div>
                      <div className="text-sm text-purple-700">คุณภาพดี</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-3">
                    {supplier.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Button size="sm" className="mr-2">
                      <Eye className="w-4 h-4 mr-2" />
                      ดูรายละเอียดเพิ่มเติม
                    </Button>
                    <Button size="sm" variant="outline">
                      ติดต่อซัพพลายเออร์
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {performance.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีข้อมูลซัพพลายเออร์</h3>
            <p className="text-gray-600">ยังไม่มีข้อมูลประสิทธิภาพของซัพพลายเออร์</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
