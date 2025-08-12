"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Eye,
  Edit,
  Phone,
  Mail,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Target,
  Send,
  Plus,
  BarChart3,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { DatabaseService } from "@/lib/database"
import { formatPrice } from "@/utils/formatPrice" // Import formatPrice function

export const dynamic = "force-dynamic"

const customerSegments = [
  {
    id: "high_value",
    name: "ลูกค้าคุณค่าสูง",
    description: "ลูกค้าที่ซื้อมากกว่า 10,000 บาท",
    criteria: { total_spent: { min: 10000 } },
    customer_count: 45,
    color: "purple",
  },
  {
    id: "frequent_buyers",
    name: "ลูกค้าซื้อบ่อย",
    description: "ลูกค้าที่ซื้อมากกว่า 5 ครั้ง",
    criteria: { total_orders: { min: 5 } },
    customer_count: 78,
    color: "blue",
  },
  {
    id: "at_risk",
    name: "ลูกค้าเสี่ยงหาย",
    description: "ไม่ซื้อมากกว่า 90 วัน",
    criteria: { days_since_last_order: { min: 90 } },
    customer_count: 23,
    color: "red",
  },
]

const loyaltyPrograms = {
  "CUST-001": {
    customer_id: "CUST-001",
    points_balance: 1245,
    tier_level: "gold",
    lifetime_points: 3450,
    points_to_next_tier: 755,
    tier_benefits: ["ส่วนลด 15%", "ส่งฟรีทุกคำสั่ง", "สินค้าใหม่ก่อนใคร"],
    expiring_points: 200,
    expiring_date: "2024-03-15",
  },
}

const automatedCampaigns = [
  {
    id: "welcome_series",
    name: "ต้อนรับลูกค้าใหม่",
    type: "welcome",
    trigger_conditions: { event: "customer_registered" },
    message_template: "ยินดีต้อนรับสู่ครอบครัว! รับส่วนลด 10% สำหรับการสั่งซื้อแรก",
    is_active: true,
    success_rate: 85,
    last_sent: "2024-01-25T08:00:00Z",
  },
  {
    id: "birthday_campaign",
    name: "ส่วนลดวันเกิด",
    type: "birthday",
    trigger_conditions: { event: "customer_birthday" },
    message_template: "สุขสันต์วันเกิด! รับส่วนลดพิเศษ 20% เฉพาะวันนี้",
    is_active: true,
    success_rate: 92,
    last_sent: "2024-01-23T10:00:00Z",
  },
]

const customerTypes = [
  { id: "all", name: "ทุกประเภท" },
  { id: "vip", name: "VIP" },
  { id: "new", name: "ลูกค้าใหม่" },
]

const statusOptions = [
  { id: "all", name: "ทุกสถานะ" },
  { id: "open", name: "เปิด" },
  { id: "in_progress", name: "กำลังดำเนินการ" },
  { id: "resolved", name: "แก้ไขแล้ว" },
  { id: "closed", name: "ปิด" },
]

export default function CustomersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false)
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<string>("all")

  const [customersData, setCustomersData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    averageOrderValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true)
        const db = new DatabaseService()

        const customers = await db.getCustomers()
        const analytics = await db.getAnalytics()

        setCustomersData(customers)
        setStats({
          totalCustomers: customers.length,
          activeCustomers: customers.filter((c) => c.status === "active").length,
          vipCustomers: customers.filter((c) => c.customerType === "vip").length,
          averageOrderValue: analytics.averageOrderValue || 0,
        })
      } catch (err) {
        console.error("Error loading customer data:", err)
        setError("ไม่สามารถโหลดข้อมูลลูกค้าได้")

        setCustomersData([
          {
            id: "CUST-001",
            name: "คุณสมชาย ใจดี",
            email: "somchai.jaidee@example.com",
            phone: "0812345678",
            address: "123 ถนนสมชาย, แขวงใจดี, เขตบางกอกใหญ่, กรุงเทพมหานคร",
            totalOrders: 10,
            totalSpent: 32000,
            averageOrderValue: 3200,
            lastOrderDate: "2024-01-20",
            status: "active",
            customerType: "vip",
          },
          {
            id: "CUST-002",
            name: "คุณสมหญิง รักสวย",
            email: "somying.raksue@example.com",
            phone: "0887654321",
            address: "456 ถนนสมหญิง, แขวงรักสวย, เขตบางกอกใหญ่, กรุงเทพมหานคร",
            totalOrders: 5,
            totalSpent: 16000,
            averageOrderValue: 3200,
            lastOrderDate: "2024-01-15",
            status: "active",
            customerType: "new",
          },
        ])
        setStats({
          totalCustomers: 100,
          activeCustomers: 80,
          vipCustomers: 20,
          averageOrderValue: 3200,
        })
      } finally {
        setLoading(false)
      }
    }

    loadCustomerData()
  }, [])

  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch =
      searchTerm === "" ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === "all" || customer.customerType === selectedType
    const matchesStatus = selectedStatus === "all" || customer.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลลูกค้า...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  const getCustomerTypeBadge = (type: string) => {
    const badgeColors = {
      vip: "bg-blue-100 text-blue-800",
      new: "bg-green-100 text-green-800",
      all: "bg-gray-100 text-gray-800",
    }
    return <Badge className={badgeColors[type] || badgeColors.all}>{type.toUpperCase()}</Badge>
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString("th-TH")

  const getStatusBadge = (status: string) => {
    const badgeColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      all: "bg-gray-100 text-gray-800",
    }
    return <Badge className={badgeColors[status] || badgeColors.all}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ระบบ CRM ขั้นสูง</h1>
          <p className="text-gray-600 mt-1">จัดการความสัมพันธ์ลูกค้าแบบครบวงจร</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ticket ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>สร้าง Support Ticket ใหม่</DialogTitle>
              </DialogHeader>
              <NewTicketForm onClose={() => setIsNewTicketDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isNewCampaignDialogOpen} onOpenChange={setIsNewCampaignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                แคมเปญใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>สร้างแคมเปญการตลาดใหม่</DialogTitle>
              </DialogHeader>
              <NewCampaignForm onClose={() => setIsNewCampaignDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            ลูกค้าใหม่
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ใช้งานอยู่</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tickets เปิด</p>
                <p className="text-2xl font-bold text-orange-600">
                  {customersData.filter((c) => c.status !== "closed").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">แคมเปญใช้งาน</p>
                <p className="text-2xl font-bold text-blue-600">
                  {automatedCampaigns.filter((c) => c.is_active).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ลูกค้า VIP</p>
                <p className="text-2xl font-bold text-purple-600">{stats.vipCustomers}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CLV เฉลี่ย</p>
                <p className="text-xl font-bold text-pink-600">{formatPrice(stats.averageOrderValue * 3.2)}</p>
              </div>
              <Target className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            กลุ่มลูกค้า (Customer Segments)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {customerSegments.map((segment) => (
              <div key={segment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{segment.name}</h4>
                  <Badge className={`bg-${segment.color}-100 text-${segment.color}-800`}>
                    {segment.customer_count} คน
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  ดูรายชื่อ
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="customers">ลูกค้า</TabsTrigger>
          <TabsTrigger value="communications">การสื่อสาร</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="loyalty">โปรแกรมสะสมแต้ม</TabsTrigger>
          <TabsTrigger value="campaigns">แคมเปญ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Customer Lifetime Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">ลูกค้า VIP</span>
                    <span className="font-bold text-green-600">{formatPrice(15420)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">ลูกค้าพรีเมียม</span>
                    <span className="font-bold text-blue-600">{formatPrice(8750)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">ลูกค้าทั่วไป</span>
                    <span className="font-bold text-gray-600">{formatPrice(4200)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Customer Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">ลูกค้าสุขภาพดี</span>
                      <span className="text-sm font-bold text-green-600">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">ลูกค้าเสี่ยง</span>
                      <span className="text-sm font-bold text-yellow-600">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">ลูกค้าเสี่ยงสูง</span>
                      <span className="text-sm font-bold text-red-600">7%</span>
                    </div>
                    <Progress value={7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                แคมเปญอัตโนมัติ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automatedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${campaign.is_active ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.message_template}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.is_active ? "default" : "secondary"}>
                          {campaign.is_active ? "ใช้งาน" : "ปิด"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{campaign.success_rate}%</div>
                        <div className="text-sm text-green-700">อัตราสำเร็จ</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{campaign.type}</div>
                        <div className="text-sm text-blue-700">ประเภท</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {new Date(campaign.last_sent).toLocaleDateString("th-TH")}
                        </div>
                        <div className="text-sm text-purple-700">ส่งล่าสุด</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ, อีเมล, เบอร์โทร, หรือรหัสลูกค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="กลุ่มลูกค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกกลุ่ม</SelectItem>
                    {customerSegments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {customerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {statusOptions.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  พบ {filteredCustomers.length} รายการจากทั้งหมด {customersData.length} รายการ
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>รายการลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">รหัสลูกค้า</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ข้อมูลลูกค้า</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ประเภท</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">คำสั่งซื้อ</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดซื้อรวม</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ซื้อล่าสุด</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900">{customer.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {customer.phone}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getCustomerTypeBadge(customer.customerType)}</td>
                        <td className="py-4 px-4">
                          <div className="text-center">
                            <span className="font-bold text-blue-600">{customer.totalOrders}</span>
                            <p className="text-xs text-gray-500">คำสั่งซื้อ</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-bold text-pink-600">{formatPrice(customer.totalSpent)}</span>
                            <p className="text-xs text-gray-500">เฉลี่ย {formatPrice(customer.averageOrderValue)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{formatDate(customer.lastOrderDate)}</span>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(customer.status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบลูกค้า</h3>
                  <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedType("all")
                      setSelectedStatus("all")
                    }}
                    variant="outline"
                  >
                    ล้างตัวกรอง
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                ประวัติการสื่อสาร
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">{/* Placeholder for communication history */}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">{/* Placeholder for customer tickets */}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                โปรแกรมสะสมแต้ม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">ระดับสมาชิก</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="font-medium">Bronze</span>
                      <span className="text-sm text-gray-600">0 - 999 แต้ม</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Silver</span>
                      <span className="text-sm text-gray-600">1,000 - 2,999 แต้ม</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Gold</span>
                      <span className="text-sm text-gray-600">3,000 - 9,999 แต้ม</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Platinum</span>
                      <span className="text-sm text-gray-600">10,000+ แต้ม</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">สถิติโปรแกรม</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">สมาชิกทั้งหมด:</span>
                      <span className="font-bold">156 คน</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">แต้มที่แจกไปแล้ว:</span>
                      <span className="font-bold">45,230 แต้ม</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">แต้มที่ใช้ไปแล้ว:</span>
                      <span className="font-bold">12,450 แต้ม</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">อัตราการใช้แต้ม:</span>
                      <span className="font-bold">27.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                แคมเปญการตลาด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automatedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${campaign.is_active ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.message_template}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.is_active ? "default" : "secondary"}>
                          {campaign.is_active ? "ใช้งาน" : "ปิด"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{campaign.success_rate}%</div>
                        <div className="text-sm text-green-700">อัตราสำเร็จ</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{campaign.type}</div>
                        <div className="text-sm text-blue-700">ประเภท</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {new Date(campaign.last_sent).toLocaleDateString("th-TH")}
                        </div>
                        <div className="text-sm text-purple-700">ส่งล่าสุด</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          loyaltyProgram={loyaltyPrograms[selectedCustomer.id]}
          communicationHistory={[]} // Placeholder for communication history
        />
      )}
    </div>
  )
}

function NewTicketForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="customer">ลูกค้า</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="เลือกลูกค้า" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUST-001">คุณสมชาย ใจดี</SelectItem>
            <SelectItem value="CUST-002">คุณสมหญิง รักสวย</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subject">หัวข้อ</Label>
        <Input id="subject" placeholder="หัวข้อปัญหา" />
      </div>

      <div>
        <Label htmlFor="priority">ความสำคัญ</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="เลือกความสำคัญ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">ต่ำ</SelectItem>
            <SelectItem value="medium">กลาง</SelectItem>
            <SelectItem value="high">สูง</SelectItem>
            <SelectItem value="urgent">เร่งด่วน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">รายละเอียด</Label>
        <Textarea id="description" placeholder="อธิบายปัญหาหรือคำถาม" rows={4} />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button onClick={onClose}>สร้าง Ticket</Button>
      </div>
    </div>
  )
}

function NewCampaignForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="campaign-name">ชื่อแคมเปญ</Label>
        <Input id="campaign-name" placeholder="ชื่อแคมเปญ" />
      </div>

      <div>
        <Label htmlFor="campaign-type">ประเภทแคมเปญ</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="เลือกประเภท" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="welcome">ต้อนรับลูกค้าใหม่</SelectItem>
            <SelectItem value="birthday">วันเกิด</SelectItem>
            <SelectItem value="win_back">ดึงลูกค้ากลับ</SelectItem>
            <SelectItem value="upsell">เพิ่มยอดขาย</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="target-segment">กลุ่มเป้าหมาย</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="เลือกกลุ่มลูกค้า" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ลูกค้าทั้งหมด</SelectItem>
            <SelectItem value="vip">ลูกค้า VIP</SelectItem>
            <SelectItem value="new">ลูกค้าใหม่</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message">ข้อความ</Label>
        <Textarea id="message" placeholder="เนื้อหาข้อความที่จะส่ง" rows={4} />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button onClick={onClose}>สร้างแคมเปญ</Button>
      </div>
    </div>
  )
}

function CustomerDetailModal({
  customer,
  onClose,
  loyaltyProgram,
  communicationHistory,
}: {
  customer: any
  onClose: () => void
  loyaltyProgram?: any
  communicationHistory: any[]
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">ข้อมูลลูกค้า {customer.id}</h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
              <TabsTrigger value="orders">ประวัติการสั่งซื้อ</TabsTrigger>
              <TabsTrigger value="communications">การสื่อสาร</TabsTrigger>
              <TabsTrigger value="loyalty">สะสมแต้ม</TabsTrigger>
              <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      ข้อมูลส่วนตัว
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</label>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">อีเมล</label>
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">เบอร์โทรศัพท์</label>
                      <p className="text-gray-900">{customer.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ที่อยู่</label>
                      <p className="text-gray-900">{customer.address}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      สถิติการซื้อ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">จำนวนคำสั่งซื้อ:</span>
                      <span className="font-bold text-blue-600">{customer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ยอดซื้อรวม:</span>
                      <span className="font-bold text-pink-600">{formatPrice(customer.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ค่าเฉลี่ยต่อคำสั่งซื้อ:</span>
                      <span className="font-bold text-pink-600">{formatPrice(customer.averageOrderValue)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
