"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  FileText,
  Package,
  Users,
  TrendingUp,
  ShoppingCart,
  MessageSquare,
  Bot,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  Tag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Bill {
  id: string
  billNumber: string
  customerName: string
  customerPhone: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  total: number
  status: "pending" | "confirmed" | "cutting" | "sewing" | "packing" | "shipped" | "completed"
  paymentStatus: "pending" | "paid" | "confirmed"
  createdAt: string
  tags: string[]
  orderNumbers: {
    shopee?: string
    lazada?: string
    alibaba?: string
  }
  supplierReceipts: Array<{
    id: string
    filename: string
    amount: number
    uploadedAt: string
  }>
  notes: string
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  images: string[]
  isActive: boolean
  createdAt: string
}

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrderAt: string
  tags: string[]
}

const statusConfig = {
  pending: { label: "รอยืนยัน", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  cutting: { label: "กำลังตัด", color: "bg-orange-100 text-orange-800", icon: Package },
  sewing: { label: "กำลังเย็บ", color: "bg-purple-100 text-purple-800", icon: Package },
  packing: { label: "กำลังแพ็ค", color: "bg-indigo-100 text-indigo-800", icon: Package },
  shipped: { label: "ส่งแล้ว", color: "bg-green-100 text-green-800", icon: Truck },
  completed: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [bills, setBills] = useState<Bill[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // AI Assistant States
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [chatAnalysis, setChatAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Mock data
      const mockBills: Bill[] = [
        {
          id: "bill-001",
          billNumber: "BILL-2024-001",
          customerName: "คุณสมชาย ใจดี",
          customerPhone: "081-234-5678",
          items: [
            { name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม", quantity: 1, price: 2890, total: 2890 },
            { name: "หมอนอิงเซ็ต", quantity: 2, price: 350, total: 700 },
          ],
          total: 3590,
          status: "cutting",
          paymentStatus: "confirmed",
          createdAt: "2024-01-25T10:30:00",
          tags: ["VIP", "รีบด่วน"],
          orderNumbers: {
            shopee: "SP240125001",
            alibaba: "1688-ABC123",
          },
          supplierReceipts: [
            {
              id: "receipt-001",
              filename: "ใบเสร็จผ้ากำมะหยี่.pdf",
              amount: 1200,
              uploadedAt: "2024-01-25T11:00:00",
            },
          ],
          notes: "ลูกค้าขอให้รีบ เพราะมีงานเลี้ยงที่บ้าน",
        },
        {
          id: "bill-002",
          billNumber: "BILL-2024-002",
          customerName: "คุณสมหญิง รักสวย",
          customerPhone: "082-345-6789",
          items: [{ name: "ผ้าคลุมโซฟากันน้ำ", quantity: 1, price: 1950, total: 1950 }],
          total: 1950,
          status: "sewing",
          paymentStatus: "confirmed",
          createdAt: "2024-01-24T14:15:00",
          tags: ["ลูกค้าประจำ"],
          orderNumbers: {
            lazada: "LZ240124001",
          },
          supplierReceipts: [],
          notes: "",
        },
      ]

      const mockProducts: Product[] = [
        {
          id: "prod-001",
          name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
          description: "ผ้าคลุมโซฟากำมะหยี่คุณภาพสูง นุ่มสบาย ทนทาน",
          category: "premium",
          basePrice: 2890,
          images: ["/placeholder.svg"],
          isActive: true,
          createdAt: "2024-01-20T10:00:00",
        },
        {
          id: "prod-002",
          name: "ผ้าคลุมโซฟากันน้ำ",
          description: "ผ้าคลุมโซฟากันน้ำ เหมาะสำหรับบ้านที่มีเด็กเล็ก",
          category: "functional",
          basePrice: 1950,
          images: ["/placeholder.svg"],
          isActive: true,
          createdAt: "2024-01-20T10:00:00",
        },
      ]

      const mockCustomers: Customer[] = [
        {
          id: "cust-001",
          name: "คุณสมชาย ใจดี",
          phone: "081-234-5678",
          email: "somchai@email.com",
          totalOrders: 5,
          totalSpent: 15450,
          lastOrderAt: "2024-01-25T10:30:00",
          tags: ["VIP", "ลูกค้าประจำ"],
        },
        {
          id: "cust-002",
          name: "คุณสมหญิง รักสวย",
          phone: "082-345-6789",
          email: "somying@email.com",
          totalOrders: 3,
          totalSpent: 8900,
          lastOrderAt: "2024-01-24T14:15:00",
          tags: ["ลูกค้าประจำ"],
        },
      ]

      setBills(mockBills)
      setProducts(mockProducts)
      setCustomers(mockCustomers)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const updateBillStatus = (billId: string, newStatus: string) => {
    setBills(bills.map((bill) => (bill.id === billId ? { ...bill, status: newStatus as any } : bill)))
  }

  const addTag = (billId: string, tag: string) => {
    setBills(
      bills.map((bill) =>
        bill.id === billId ? { ...bill, tags: [...bill.tags, tag].filter((t, i, arr) => arr.indexOf(t) === i) } : bill,
      ),
    )
  }

  // AI Functions
  const generateCollectionName = async () => {
    setIsAnalyzing(true)
    // Mock AI response
    setTimeout(() => {
      const suggestions = [
        "Elegant Harmony Collection",
        "Modern Comfort Series",
        "Luxury Living Collection",
        "Cozy Home Essentials",
        "Premium Lifestyle Series",
      ]
      setAiSuggestions(suggestions)
      setIsAnalyzing(false)
    }, 2000)
  }

  const analyzeCustomerChat = async (chatText: string) => {
    setIsAnalyzing(true)
    // Mock AI analysis
    setTimeout(() => {
      const analysis = `
📊 การวิเคราะห์แชทลูกค้า:

🎯 ความต้องการ:
- ผ้าคลุมโซฟา 3 ที่นั่ง
- สีเข้ม ทนทาน
- งบประมาณ 2,000-3,000 บาท

💡 สินค้าที่แนะนำ:
1. ผ้าคลุมโซฟากำมะหยี่พรีเมียม (฿2,890)
2. ผ้าคลุมโซฟาผ้าลินิน (฿2,590)

⚡ ความเร่งด่วน: ปานกลาง
🏷️ แท็กที่แนะนำ: "ลูกค้าใหม่", "งบ 3K"
      `
      setChatAnalysis(analysis)
      setIsAnalyzing(false)
    }, 1500)
  }

  const generateProductDescription = async (productName: string) => {
    setIsAnalyzing(true)
    // Mock AI response
    setTimeout(() => {
      const description = `${productName} - ผลิตจากวัสดุคุณภาพสูง ออกแบบเพื่อความทนทานและความสวยงาม เหมาะสำหรับการใช้งานในบ้านที่ต้องการความสะดวกสบายและสไตล์ที่ทันสมัย ดูแลง่าย ทำความสะอาดได้ ใช้งานได้ยาวนาน`
      setAiSuggestions([description])
      setIsAnalyzing(false)
    }, 1500)
  }

  // Stats calculation
  const stats = {
    totalRevenue: bills.reduce((sum, bill) => sum + bill.total, 0),
    totalOrders: bills.length,
    pendingPayments: bills.filter((b) => b.paymentStatus === "pending").length,
    activeCustomers: customers.length,
    topProducts: products.slice(0, 3),
    recentOrders: bills.slice(0, 5),
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard ระบบจัดการ</h1>
          <p className="text-gray-600 mt-2">จัดการธุรกิจผ้าคลุมโซฟาแบบครบวงจร พร้อม AI ผู้ช่วย</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">ภาพรวม</span>
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">บิล</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">สินค้า</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">ลูกค้า</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">รายงาน</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI ผู้ช่วย</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">ยอดขายรวม</p>
                      <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">คำสั่งซื้อทั้งหมด</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">รอชำระเงิน</p>
                      <p className="text-2xl font-bold text-red-600">{stats.pendingPayments}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.activeCustomers}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentOrders.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{bill.billNumber}</h4>
                          <p className="text-sm text-gray-600">{bill.customerName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={statusConfig[bill.status].color}>{statusConfig[bill.status].label}</Badge>
                            {bill.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">{formatPrice(bill.total)}</p>
                          <p className="text-xs text-gray-500">{formatDate(bill.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>สินค้ายอดนิยม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-sm font-bold text-pink-600">{formatPrice(product.basePrice)}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">จัดการบิล</h2>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                สร้างบิลใหม่
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="ค้นหาบิล..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="pending">รอยืนยัน</SelectItem>
                      <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                      <SelectItem value="cutting">กำลังตัด</SelectItem>
                      <SelectItem value="sewing">กำลังเย็บ</SelectItem>
                      <SelectItem value="packing">กำลังแพ็ค</SelectItem>
                      <SelectItem value="shipped">ส่งแล้ว</SelectItem>
                      <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bills List */}
            <div className="grid gap-6">
              {filteredBills.map((bill) => (
                <Card key={bill.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{bill.billNumber}</h3>
                          <Badge className={statusConfig[bill.status].color}>{statusConfig[bill.status].label}</Badge>
                          {bill.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">ลูกค้า</p>
                            <p className="font-semibold">{bill.customerName}</p>
                            <p className="text-sm text-gray-500">{bill.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">ยอดรวม</p>
                            <p className="text-2xl font-bold text-pink-600">{formatPrice(bill.total)}</p>
                          </div>
                        </div>

                        {/* Order Numbers */}
                        {Object.keys(bill.orderNumbers).length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">เลขออเดอร์:</p>
                            <div className="flex flex-wrap gap-2">
                              {bill.orderNumbers.shopee && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  Shopee: {bill.orderNumbers.shopee}
                                </Badge>
                              )}
                              {bill.orderNumbers.lazada && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  Lazada: {bill.orderNumbers.lazada}
                                </Badge>
                              )}
                              {bill.orderNumbers.alibaba && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                  1688: {bill.orderNumbers.alibaba}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Supplier Receipts */}
                        {bill.supplierReceipts.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">ใบเสร็จต้นทุน:</p>
                            <div className="space-y-2">
                              {bill.supplierReceipts.map((receipt) => (
                                <div
                                  key={receipt.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <span className="text-sm">{receipt.filename}</span>
                                  <span className="text-sm font-semibold text-green-600">
                                    {formatPrice(receipt.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {bill.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">หมายเหตุ:</p>
                            <p className="text-sm bg-yellow-50 p-2 rounded">{bill.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 lg:ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                          className="w-full lg:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                        <Select value={bill.status} onValueChange={(value) => updateBillStatus(bill.id, value)}>
                          <SelectTrigger className="w-full lg:w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">รอยืนยัน</SelectItem>
                            <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                            <SelectItem value="cutting">กำลังตัด</SelectItem>
                            <SelectItem value="sewing">กำลังเย็บ</SelectItem>
                            <SelectItem value="packing">กำลังแพ็ค</SelectItem>
                            <SelectItem value="shipped">ส่งแล้ว</SelectItem>
                            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h2>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มสินค้าใหม่
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-pink-600">{formatPrice(product.basePrice)}</span>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-4 h-4 mr-2" />
                        แก้ไข
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">จัดการลูกค้า</h2>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลูกค้าใหม่
              </Button>
            </div>

            <div className="grid gap-6">
              {customers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
                          {customer.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">ติดต่อ</p>
                            <p className="font-semibold">{customer.phone}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">คำสั่งซื้อ</p>
                            <p className="text-2xl font-bold text-blue-600">{customer.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">ยอดซื้อรวม</p>
                            <p className="text-2xl font-bold text-green-600">{formatPrice(customer.totalSpent)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 lg:ml-6 mt-4 lg:mt-0">
                        <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          ดูประวัติแชท
                        </Button>
                        <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">รายงานและสถิติ</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ยอดขายรายเดือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">กราฟยอดขายรายเดือน</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>สินค้ายอดนิยม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">กราฟสินค้ายอดนิยม</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ลูกค้าใหม่ vs ลูกค้าเก่า</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">กราฟลูกค้าใหม่ vs เก่า</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>สถานะคำสั่งซื้อ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const count = bills.filter((b) => b.status === status).length
                      const percentage = bills.length > 0 ? (count / bills.length) * 100 : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <config.icon className="w-4 h-4" />
                            <span className="text-sm">{config.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">🤖 AI ผู้ช่วย</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Collection Name Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    ตั้งชื่อคอลเลกชันผ้า
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">ให้ AI ช่วยคิดชื่อคอลเลกชันผ้าที่น่าสนใจ</p>
                  <Button onClick={generateCollectionName} disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? "กำลังคิด..." : "สร้างชื่อคอลเลกชัน"}
                  </Button>
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">ชื่อที่แนะนำ:</p>
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Description Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    สร้างคำอธิบายสินค้า
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="product-name">ชื่อสินค้า</Label>
                    <Input id="product-name" placeholder="เช่น ผ้าคลุมโซฟากำมะหยี่พรีเมียม" />
                  </div>
                  <Button
                    onClick={() => generateProductDescription("ผ้าคลุมโซฟากำมะหยี่พรีเมียม")}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? "กำลังสร้าง..." : "สร้างคำอธิบาย"}
                  </Button>
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">คำอธิบายที่แนะนำ:</p>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm">{aiSuggestions[0]}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chat Analysis */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    วิเคราะห์แชทลูกค้า
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chat-text">ข้อความแชทลูกค้า</Label>
                    <Textarea
                      id="chat-text"
                      placeholder="วางข้อความแชทลูกค้าที่นี่..."
                      rows={4}
                      defaultValue="สวัสดีครับ ผมต้องการผ้าคลุมโซฟา 3 ที่นั่ง สีเข้มๆ ทนทาน งบประมาณประมาณ 2-3 พันบาท มีแนะนำไหมครับ"
                    />
                  </div>
                  <Button
                    onClick={() =>
                      analyzeCustomerChat(
                        "สวัสดีครับ ผมต้องการผ้าคลุมโซฟา 3 ที่นั่ง สีเข้มๆ ทนทาน งบประมาณประมาณ 2-3 พันบาท มีแนะนำไหมครับ",
                      )
                    }
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? "กำลังวิเคราะห์..." : "วิเคราะห์แชท"}
                  </Button>
                  {chatAnalysis && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">{chatAnalysis}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Auto Report */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    รายงานอัตโนมัติ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">สรุปรายงานธุรกิจแบบอัตโนมัติ</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <Calendar className="w-6 h-6 mb-2" />
                      รายงานรายวัน
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <BarChart3 className="w-6 h-6 mb-2" />
                      รายงานรายสัปดาห์
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <TrendingUp className="w-6 h-6 mb-2" />
                      รายงานรายเดือน
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">📊 สรุปวันนี้ (AI Generated)</h4>
                    <ul className="text-sm space-y-1">
                      <li>• ยอดขาย: {formatPrice(stats.totalRevenue)} (+15% จากเมื่อวาน)</li>
                      <li>• คำสั่งซื้อใหม่: {stats.totalOrders} รายการ</li>
                      <li>• สินค้ายอดนิยม: ผ้าคลุมโซฟากำมะหยี่พรีเมียม</li>
                      <li>• ลูกค้าใหม่: 3 ราย</li>
                      <li>• แนะนำ: ควรเพิ่มสต็อกสินค้ายอดนิยม</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bill Detail Modal */}
        {selectedBill && (
          <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>รายละเอียดบิล {selectedBill.billNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">ข้อมูลลูกค้า</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">ชื่อ:</span> {selectedBill.customerName}
                      </p>
                      <p>
                        <span className="font-medium">เบอร์:</span> {selectedBill.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">สถานะ</h4>
                    <div className="space-y-2">
                      <Badge className={statusConfig[selectedBill.status].color}>
                        {statusConfig[selectedBill.status].label}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {selectedBill.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-2">รายการสินค้า</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">สินค้า</th>
                          <th className="text-center p-3 text-sm font-medium">จำนวน</th>
                          <th className="text-right p-3 text-sm font-medium">ราคา</th>
                          <th className="text-right p-3 text-sm font-medium">รวม</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm">{item.name}</td>
                            <td className="p-3 text-sm text-center">{item.quantity}</td>
                            <td className="p-3 text-sm text-right">{formatPrice(item.price)}</td>
                            <td className="p-3 text-sm text-right font-semibold">{formatPrice(item.total)}</td>
                          </tr>
                        ))}
                        <tr className="border-t bg-gray-50">
                          <td colSpan={3} className="p-3 text-sm font-semibold text-right">
                            ยอดรวมทั้งสิ้น:
                          </td>
                          <td className="p-3 text-sm font-bold text-right text-pink-600">
                            {formatPrice(selectedBill.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Numbers & Receipts */}
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.keys(selectedBill.orderNumbers).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">เลขออเดอร์</h4>
                      <div className="space-y-2">
                        {selectedBill.orderNumbers.shopee && (
                          <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                            <span className="text-sm">Shopee:</span>
                            <span className="text-sm font-mono">{selectedBill.orderNumbers.shopee}</span>
                          </div>
                        )}
                        {selectedBill.orderNumbers.lazada && (
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span className="text-sm">Lazada:</span>
                            <span className="text-sm font-mono">{selectedBill.orderNumbers.lazada}</span>
                          </div>
                        )}
                        {selectedBill.orderNumbers.alibaba && (
                          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                            <span className="text-sm">1688:</span>
                            <span className="text-sm font-mono">{selectedBill.orderNumbers.alibaba}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedBill.supplierReceipts.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">ใบเสร็จต้นทุน</h4>
                      <div className="space-y-2">
                        {selectedBill.supplierReceipts.map((receipt) => (
                          <div key={receipt.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm">{receipt.filename}</span>
                            <span className="text-sm font-semibold">{formatPrice(receipt.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedBill.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">หมายเหตุ</h4>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm">{selectedBill.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    onClick={() => window.open(`/bill/view/${selectedBill.id}`, "_blank")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    ดูหน้าลูกค้า
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    อัปโหลดใบเสร็จ
                  </Button>
                  <Button variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    เพิ่มแท็ก
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    ดาวน์โหลด PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
