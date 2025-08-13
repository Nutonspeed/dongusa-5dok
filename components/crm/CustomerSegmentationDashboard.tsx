"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, AlertTriangle, Target, Star, Mail, MessageSquare, BarChart3, Activity } from "lucide-react"
import { advancedCRMService, type CustomerSegment } from "@/lib/advanced-crm-service"

export default function CustomerSegmentationDashboard() {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null)
  const [segmentAnalytics, setSegmentAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSegmentData()
  }, [])

  const loadSegmentData = async () => {
    try {
      setLoading(true)
      const [segmentsData, analyticsData] = await Promise.all([
        advancedCRMService.getCustomerSegments(),
        advancedCRMService.getSegmentAnalytics(),
      ])

      setSegments(segmentsData)
      setSegmentAnalytics(analyticsData)
      setSelectedSegment(segmentsData[0])
    } catch (error) {
      console.error("Error loading segment data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
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
          <h1 className="text-3xl font-bold text-primary">Customer Segmentation</h1>
          <p className="text-gray-600 mt-1">ระบบแบ่งกลุ่มลูกค้าและ CRM ขั้นสูง</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            สร้างแคมเปญ
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{segmentAnalytics?.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">มูลค่ารวม</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(segmentAnalytics?.totalValue || 0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ลูกค้าเสี่ยงหาย</p>
                <p className="text-2xl font-bold text-gray-900">{segmentAnalytics?.riskAnalysis.atRiskCustomers}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">กลุ่มลูกค้า</p>
                <p className="text-2xl font-bold text-gray-900">{segments.length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="segments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="segments">กลุ่มลูกค้า</TabsTrigger>
          <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
          <TabsTrigger value="journey">Customer Journey</TabsTrigger>
          <TabsTrigger value="campaigns">แคมเปญ</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Segment List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>กลุ่มลูกค้า</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {segments.map((segment) => (
                      <div
                        key={segment.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSegment?.id === segment.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedSegment(segment)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{segment.name}</h3>
                          <Badge style={{ backgroundColor: segment.color }}>{segment.customerCount}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                        <p className="text-sm font-medium text-primary">ค่าเฉลี่ย: {formatPrice(segment.averageValue)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Segment Details */}
            <div className="lg:col-span-2">
              {selectedSegment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedSegment.color }} />
                      {selectedSegment.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedSegment.customerCount}</div>
                        <div className="text-sm text-blue-700">จำนวนลูกค้า</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(selectedSegment.averageValue)}
                        </div>
                        <div className="text-sm text-green-700">มูลค่าเฉลี่ย</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPrice(selectedSegment.customerCount * selectedSegment.averageValue)}
                        </div>
                        <div className="text-sm text-purple-700">มูลค่ารวม</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">เกณฑ์การแบ่งกลุ่ม</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedSegment.criteria.minSpent && (
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span>ยอดใช้จ่ายขั้นต่ำ</span>
                            <span className="font-medium">{formatPrice(selectedSegment.criteria.minSpent)}</span>
                          </div>
                        )}
                        {selectedSegment.criteria.maxSpent && (
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span>ยอดใช้จ่ายสูงสุด</span>
                            <span className="font-medium">{formatPrice(selectedSegment.criteria.maxSpent)}</span>
                          </div>
                        )}
                        {selectedSegment.criteria.minOrders && (
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span>จำนวนออเดอร์ขั้นต่ำ</span>
                            <span className="font-medium">{selectedSegment.criteria.minOrders}</span>
                          </div>
                        )}
                        {selectedSegment.criteria.daysSinceLastOrder && (
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span>วันนับจากออเดอร์ล่าสุด</span>
                            <span className="font-medium">{selectedSegment.criteria.daysSinceLastOrder} วัน</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button>
                        <Mail className="w-4 h-4 mr-2" />
                        ส่งอีเมล
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        ส่ง SMS
                      </Button>
                      <Button variant="outline">
                        <Target className="w-4 h-4 mr-2" />
                        สร้างแคมเปญ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>การกระจายลูกค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentAnalytics?.segmentDistribution.map((segment: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{segment.name}</span>
                        <span className="text-sm text-gray-600">
                          {segment.count} ({segment.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={segment.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>การวิเคราะห์ความเสี่ยง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800">ลูกค้าเสี่ยงหาย</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {segmentAnalytics?.riskAnalysis.atRiskCustomers}
                    </div>
                    <div className="text-sm text-red-700">
                      มูลค่าเสี่ยง: {formatPrice(segmentAnalytics?.riskAnalysis.estimatedChurnValue || 0)}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">ลูกค้าคุณค่าสูงเสี่ยง</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {segmentAnalytics?.riskAnalysis.highValueAtRisk}
                    </div>
                    <div className="text-sm text-yellow-700">ต้องการความสนใจเร่งด่วน</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4" />
                <p>Customer Journey Mapping จะแสดงที่นี่</p>
                <p className="text-sm">ติดตามเส้นทางการเป็นลูกค้าตั้งแต่เริ่มต้นจนถึงปัจจุบัน</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>แคมเปญการตลาด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4" />
                <p>แคมเปญการตลาดจะแสดงที่นี่</p>
                <p className="text-sm">สร้างและจัดการแคมเปญสำหรับกลุ่มลูกค้าต่างๆ</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
