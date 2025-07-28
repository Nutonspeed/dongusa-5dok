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
  RefreshCw,
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
import { useAuth } from "../contexts/AuthContext"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  completedOrders: number
  monthlyGrowth: number
  averageOrderValue: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  total: number
  status: "pending" | "confirmed" | "production" | "shipped" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "confirmed"
  createdAt: string
  dueDate: string
  tags: string[]
  externalOrders: {
    shopee?: string
    lazada?: string
    alibaba?: string
  }
  costReceipts: Array<{
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
  price: number
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  images: string[]
  createdAt: string
  soldCount: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrderAt: string
  status: "active" | "inactive"
  tags: string[]
}

const statusConfig = {
  pending: { label: "รอยืนยัน", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  production: { label: "กำลังผลิต", color: "bg-purple-100 text-purple-800", icon: Package },
  shipped: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800", icon: Truck },
  completed: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800", icon: AlertTriangle },
}

export default function AdminDashboard() {
  const { user, hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // AI Assistant States
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [chatAnalysis, setChatAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiInput, setAiInput] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockStats: DashboardStats = {
        totalRevenue: 1245680,
        totalOrders: 89,
        totalCustomers: 156,
        totalProducts: 25,
        pendingOrders: 8,
        completedOrders: 67,
        monthlyGrowth: 15.2,
        averageOrderValue: 2847,
      }

      const mockInvoices: Invoice[] = [
        {
          id: "inv-001",
          invoiceNumber: "INV-2024-001",
          customerName: "คุณสมชาย ใจดี",
          customerPhone: "081-234-5678",
          customerEmail: "somchai@email.com",
          items: [
            { name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม", quantity: 1, price: 2890, total: 2890 },
            { name: "หมอนอิงเซ็ต", quantity: 2, price: 350, total: 700 },
          ],
          total: 3590,
          status: "production",
          paymentStatus: "confirmed",
          createdAt: "2024-01-25T10:30:00",
          dueDate: "2024-01-27T23:59:59",
          tags: ["VIP", "รีบด่วน"],
          externalOrders: {
            shopee: "SP240125001",
            alibaba: "1688-ABC123",
          },
          costReceipts: [
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
          id: "inv-002",
          invoiceNumber: "INV-2024-002",
          customerName: "คุณสมหญิง รักสวย",
          customerPhone: "082-345-6789",
          customerEmail: "somying@email.com",
          items: [{ name: "ผ้าคลุมโซฟากันน้ำ", quantity: 1, price: 1950, total: 1950 }],
          total: 1950,
          status: "shipped",
          paymentStatus: "confirmed",
          createdAt: "2024-01-24T14:15:00",
          dueDate: "2024-01-26T23:59:59",
          tags: ["ลูกค้าประจำ"],
          externalOrders: {
            lazada: "LZ240124001",
          },
          costReceipts: [],
          notes: "",
        },
      ]

      const mockProducts: Product[] = [
        {
          id: "prod-001",
          name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
          description: "ผ้าคลุมโซฟากำมะหยี่คุณภาพสูง นุ่มสบาย ทนทาน",
          category: "premium",
          price: 2890,
          stock: 25,
          status: "active",
          images: ["/placeholder.svg"],
          createdAt: "2024-01-20T10:00:00",
          soldCount: 89,
        },
        {
          id: "prod-002",
          name: "ผ้าคลุมโซฟากันน้ำ",
          description: "ผ้าคลุมโซฟากันน้ำ เหมาะสำหรับบ้านที่มีเด็กเล็ก",
          category: "functional",
          price: 1950,
          stock: 15,
          status: "active",
          images: ["/placeholder.svg"],
          createdAt: "2024-01-20T10:00:00",
          soldCount: 67,
        },
      ]

      const mockCustomers: Customer[] = [
        {
          id: "cust-001",
          name: "คุณสมชาย ใจดี",
          email: "somchai@email.com",
          phone: "081-234-5678",
          totalOrders: 5,
          totalSpent: 15450,
          lastOrderAt: "2024-01-25T10:30:00",
          status: "active",
          tags: ["VIP", "ลูกค้าประจำ"],
        },
        {
          id: "cust-002",
          name: "คุณสมหญิง รักสวย",
          email: "somying@email.com",
          phone: "082-345-6789",
          totalOrders: 3,
          totalSpent: 8900,
          lastOrderAt: "2024-01-24T14:15:00",
          status: "active",
          tags: ["ลูกค้าประจำ"],
        },
      ]

      setStats(mockStats)
      setInvoices(mockInvoices)
      setProducts(mockProducts)
      setCustomers(mockCustomers)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
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

  // AI Functions
  const generateCollectionName = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "collection-names" }),
      })
      const data = await response.json()
      if (data.success) {
        setAiSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error("Error generating collection names:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateProductDescription = async (productName: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "product-description", input: productName }),
      })
      const data = await response.json()
      if (data.success) {
        setAiSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error("Error generating product description:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeChatContent = async (chatText: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "chat-analysis", input: chatText }),
      })
      const data = await response.json()
      if (data.success) {
        setChatAnalysis(data.suggestions[0])
      }
    } catch (error) {
      console.error("Error analyzing chat:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateAutoReport = async (reportType: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "auto-report", input: reportType }),
      })
      const data = await response.json()
      if (data.success) {
        setAiSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateInvoiceStatus = (invoiceId: string, newStatus: string) => {
    setInvoices(invoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus as any } : inv)))
  }

  const addTagToInvoice = (invoiceId: string, tag: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, tags: [...inv.tags, tag].filter((t, i, arr) => arr.indexOf(t) === i) } : inv,
      ),
    )
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerPhone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            ยินดีต้อนรับ, {user?.name} | บทบาท: {user?.role}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
            <Plus className="w-4 h-4 mr-2" />
            สร้างใบแจ้งหนี้
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ยอดขายรวม</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                  <p className="text-xs text-green-600">+{stats.monthlyGrowth}% จากเดือนก่อน</p>
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
                  <p className="text-xs text-gray-500">รอดำเนินการ: {stats.pendingOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</p>
                  <p className="text-xs text-gray-500">ค่าเฉลี่ย: {formatPrice(stats.averageOrderValue)}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">สินค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalProducts}</p>
                  <p className="text-xs text-gray-500">เสร็จสิ้น: {stats.completedOrders}</p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">ภาพรวม</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">ใบแจ้งหนี้</span>
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
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>ใบแจ้งหนี้ล่าสุด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                        <p className="text-sm text-gray-600">{invoice.customerName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={statusConfig[invoice.status].color}>
                            {statusConfig[invoice.status].label}
                          </Badge>
                          {invoice.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600">{formatPrice(invoice.total)}</p>
                        <p className="text-xs text-gray-500">{formatDate(invoice.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>สินค้ายอดนิยม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-sm font-bold text-pink-600">{formatPrice(product.price)}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{product.soldCount} ขาย</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">จัดการใบแจ้งหนี้</h2>
            <Button className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              สร้างใบแจ้งหนี้ใหม่
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="ค้นหาใบแจ้งหนี้..."
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
                    <SelectItem value="production">กำลังผลิต</SelectItem>
                    <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <div className="grid gap-6">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                        <Badge className={statusConfig[invoice.status].color}>
                          {statusConfig[invoice.status].label}
                        </Badge>
                        {invoice.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">ลูกค้า</p>
                          <p className="font-semibold">{invoice.customerName}</p>
                          <p className="text-sm text-gray-500">{invoice.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ยอดรวม</p>
                          <p className="text-2xl font-bold text-pink-600">{formatPrice(invoice.total)}</p>
                        </div>
                      </div>

                      {/* External Orders */}
                      {Object.keys(invoice.externalOrders).length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">เลขออเดอร์:</p>
                          <div className="flex flex-wrap gap-2">
                            {invoice.externalOrders.shopee && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                Shopee: {invoice.externalOrders.shopee}
                              </Badge>
                            )}
                            {invoice.externalOrders.lazada && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Lazada: {invoice.externalOrders.lazada}
                              </Badge>
                            )}
                            {invoice.externalOrders.alibaba && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                1688: {invoice.externalOrders.alibaba}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cost Receipts */}
                      {invoice.costReceipts.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">ใบเสร็จต้นทุน:</p>
                          <div className="space-y-2">
                            {invoice.costReceipts.map((receipt) => (
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

                      {invoice.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">หมายเหตุ:</p>
                          <p className="text-sm bg-yellow-50 p-2 rounded">{invoice.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                        className="w-full lg:w-auto"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        ดูรายละเอียด
                      </Button>
                      <Select value={invoice.status} onValueChange={(value) => updateInvoiceStatus(invoice.id, value)}>
                        <SelectTrigger className="w-full lg:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">รอยืนยัน</SelectItem>
                          <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                          <SelectItem value="production">กำลังผลิต</SelectItem>
                          <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                          <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                          <SelectItem value="cancelled">ยกเลิก</SelectItem>
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
                    <span className="text-lg font-bold text-pink-600">{formatPrice(product.price)}</span>
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                      {product.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">คงเหลือ: {product.stock}</span>
                    <span className="text-sm text-gray-600">ขายแล้ว: {product.soldCount}</span>
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
                <CardTitle>สถานะคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const count = invoices.filter((inv) => inv.status === status).length
                    const percentage = invoices.length > 0 ? (count / invoices.length) * 100 : 0
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

            <Card>
              <CardHeader>
                <CardTitle>รายงานอัตโนมัติ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => generateAutoReport("daily")}
                    disabled={isAnalyzing}
                  >
                    <Calendar className="w-6 h-6 mb-2" />
                    รายวัน
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => generateAutoReport("weekly")}
                    disabled={isAnalyzing}
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    รายสัปดาห์
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => generateAutoReport("monthly")}
                    disabled={isAnalyzing}
                  >
                    <TrendingUp className="w-6 h-6 mb-2" />
                    รายเดือน
                  </Button>
                </div>
                {aiSuggestions.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">{aiSuggestions[0]}</pre>
                  </div>
                )}
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
                  <Input
                    id="product-name"
                    placeholder="เช่น ผ้าคลุมโซฟากำมะหยี่พรีเมียม"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => generateProductDescription(aiInput)}
                  disabled={isAnalyzing || !aiInput}
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
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => analyzeChatContent(aiInput)}
                  disabled={isAnalyzing || !aiInput}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>รายละเอียดใบแจ้งหนี้ {selectedInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">ข้อมูลลูกค้า</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">ชื่อ:</span> {selectedInvoice.customerName}
                    </p>
                    <p>
                      <span className="font-medium">เบอร์:</span> {selectedInvoice.customerPhone}
                    </p>
                    <p>
                      <span className="font-medium">อีเมล:</span> {selectedInvoice.customerEmail}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">สถานะ</h4>
                  <div className="space-y-2">
                    <Badge className={statusConfig[selectedInvoice.status].color}>
                      {statusConfig[selectedInvoice.status].label}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {selectedInvoice.tags.map((tag) => (
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
                      {selectedInvoice.items.map((item, index) => (
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
                          {formatPrice(selectedInvoice.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* External Orders & Cost Receipts */}
              <div className="grid md:grid-cols-2 gap-6">
                {Object.keys(selectedInvoice.externalOrders).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">เลขออเดอร์</h4>
                    <div className="space-y-2">
                      {selectedInvoice.externalOrders.shopee && (
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm">Shopee:</span>
                          <span className="text-sm font-mono">{selectedInvoice.externalOrders.shopee}</span>
                        </div>
                      )}
                      {selectedInvoice.externalOrders.lazada && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">Lazada:</span>
                          <span className="text-sm font-mono">{selectedInvoice.externalOrders.lazada}</span>
                        </div>
                      )}
                      {selectedInvoice.externalOrders.alibaba && (
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-sm">1688:</span>
                          <span className="text-sm font-mono">{selectedInvoice.externalOrders.alibaba}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedInvoice.costReceipts.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">ใบเสร็จต้นทุน</h4>
                    <div className="space-y-2">
                      {selectedInvoice.costReceipts.map((receipt) => (
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
              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-semibold mb-2">หมายเหตุ</h4>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm">{selectedInvoice.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button className="bg-blue-600 hover:bg-blue-700">
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
  )
}
