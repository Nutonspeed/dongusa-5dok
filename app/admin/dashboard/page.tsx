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
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  Tag,
  RefreshCw,
  X,
  Save,
  Filter,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Types
interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  completedOrders: number
  monthlyGrowth: number
  averageOrderValue: number
  lowStockProducts: number
  pendingPayments: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  items: Array<{
    id: string
    name: string
    description: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: "pending" | "confirmed" | "cutting" | "sewing" | "packing" | "shipped" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "confirmed" | "refunded"
  createdAt: string
  updatedAt: string
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
    url: string
  }>
  notes: string
  estimatedDelivery?: string
}

interface Product {
  id: string
  name: string
  nameEn: string
  description: string
  category: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  status: "active" | "inactive" | "out_of_stock" | "discontinued"
  images: string[]
  createdAt: string
  updatedAt: string
  soldCount: number
  rating: number
  reviewCount: number
  sku: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderAt: string
  firstOrderAt: string
  status: "active" | "inactive" | "vip" | "blocked"
  tags: string[]
  notes: string
  preferredPayment: string
  communicationPreference: "phone" | "email" | "line" | "facebook"
}

// Status configurations
const statusConfig = {
  pending: { label: "รอยืนยัน", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  cutting: { label: "กำลังตัด", color: "bg-orange-100 text-orange-800", icon: Package },
  sewing: { label: "กำลังเย็บ", color: "bg-purple-100 text-purple-800", icon: Package },
  packing: { label: "กำลังแพ็ค", color: "bg-indigo-100 text-indigo-800", icon: Package },
  shipped: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800", icon: Truck },
  completed: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800", icon: X },
}

const paymentStatusConfig = {
  pending: { label: "รอชำระ", color: "bg-red-100 text-red-800" },
  paid: { label: "ชำระแล้ว", color: "bg-green-100 text-green-800" },
  confirmed: { label: "ยืนยันการชำระ", color: "bg-blue-100 text-blue-800" },
  refunded: { label: "คืนเงินแล้ว", color: "bg-gray-100 text-gray-800" },
}

// Mock Database Service
class MockDashboardService {
  private stats: DashboardStats
  private invoices: Invoice[]
  private products: Product[]
  private customers: Customer[]

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Initialize stats
    this.stats = {
      totalRevenue: 1245680,
      totalOrders: 89,
      totalCustomers: 156,
      totalProducts: 25,
      pendingOrders: 8,
      completedOrders: 67,
      monthlyGrowth: 15.2,
      averageOrderValue: 2847,
      lowStockProducts: 3,
      pendingPayments: 5,
    }

    // Initialize invoices
    this.invoices = [
      {
        id: "inv-001",
        invoiceNumber: "INV-2024-001",
        customerName: "คุณสมชาย ใจดี",
        customerPhone: "081-234-5678",
        customerEmail: "somchai@email.com",
        customerAddress: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
        items: [
          {
            id: "item-001",
            name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
            description: "โซฟา 3 ที่นั่ง สีน้ำเงินเข้ม ลาย Arctic White",
            quantity: 1,
            price: 2890,
            total: 2890,
          },
          {
            id: "item-002",
            name: "หมอนอิงเซ็ต",
            description: "หมอนอิงลายเดียวกัน ขนาด 45x45 ซม. จำนวน 2 ใบ",
            quantity: 2,
            price: 350,
            total: 700,
          },
        ],
        subtotal: 3590,
        shipping: 150,
        tax: 0,
        total: 3740,
        status: "cutting",
        paymentStatus: "confirmed",
        createdAt: "2024-01-25T10:30:00",
        updatedAt: "2024-01-25T14:20:00",
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
            url: "/receipts/receipt-001.pdf",
          },
        ],
        notes: "ลูกค้าขอให้รีบ เพราะมีงานเลี้ยงที่บ้าน",
        estimatedDelivery: "2024-02-05",
      },
      {
        id: "inv-002",
        invoiceNumber: "INV-2024-002",
        customerName: "คุณสมหญิง รักสวย",
        customerPhone: "082-345-6789",
        customerEmail: "somying@email.com",
        customerAddress: "456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        items: [
          {
            id: "item-003",
            name: "ผ้าคลุมโซฟากันน้ำ",
            description: "โซฟา 2 ที่นั่ง สีเทา กันน้ำ กันคราบ",
            quantity: 1,
            price: 1950,
            total: 1950,
          },
        ],
        subtotal: 1950,
        shipping: 150,
        tax: 0,
        total: 2100,
        status: "shipped",
        paymentStatus: "confirmed",
        createdAt: "2024-01-24T14:15:00",
        updatedAt: "2024-01-26T09:30:00",
        dueDate: "2024-01-26T23:59:59",
        tags: ["ลูกค้าประจำ"],
        externalOrders: {
          lazada: "LZ240124001",
        },
        costReceipts: [],
        notes: "",
        estimatedDelivery: "2024-01-28",
      },
      {
        id: "inv-003",
        invoiceNumber: "INV-2024-003",
        customerName: "คุณสมศักดิ์ มีเงิน",
        customerPhone: "083-456-7890",
        customerEmail: "somsak@email.com",
        customerAddress: "789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
        items: [
          {
            id: "item-004",
            name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
            description: "โซฟา L-Shape สีครีม ผ้าลินิน",
            quantity: 1,
            price: 4200,
            total: 4200,
          },
        ],
        subtotal: 4200,
        shipping: 0,
        tax: 0,
        total: 4200,
        status: "pending",
        paymentStatus: "pending",
        createdAt: "2024-01-26T16:45:00",
        updatedAt: "2024-01-26T16:45:00",
        dueDate: "2024-01-28T23:59:59",
        tags: ["ลูกค้าใหม่"],
        externalOrders: {},
        costReceipts: [],
        notes: "ลูกค้าสอบถามเรื่องการรับประกัน",
      },
    ]

    // Initialize products
    this.products = [
      {
        id: "prod-001",
        name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
        nameEn: "Premium Velvet Sofa Cover",
        description: "ผ้าคลุมโซฟากำมะหยี่คุณภาพสูง นุ่มสบาย ทนทาน มีให้เลือกหลายสี",
        category: "premium",
        price: 2890,
        costPrice: 1200,
        stock: 25,
        minStock: 5,
        status: "active",
        images: ["/placeholder.svg?height=300&width=300&text=Velvet+Cover"],
        createdAt: "2024-01-20T10:00:00",
        updatedAt: "2024-01-25T14:30:00",
        soldCount: 89,
        rating: 4.8,
        reviewCount: 124,
        sku: "VEL-PREM-001",
        weight: 1.2,
        dimensions: { length: 200, width: 150, height: 5 },
      },
      {
        id: "prod-002",
        name: "ผ้าคลุมโซฟากันน้ำ",
        nameEn: "Waterproof Sofa Cover",
        description: "ผ้าคลุมโซฟากันน้ำ เหมาะสำหรับบ้านที่มีเด็กเล็กหรือสัตว์เลี้ยง",
        category: "functional",
        price: 1950,
        costPrice: 800,
        stock: 15,
        minStock: 10,
        status: "active",
        images: ["/placeholder.svg?height=300&width=300&text=Waterproof+Cover"],
        createdAt: "2024-01-20T10:00:00",
        updatedAt: "2024-01-24T16:20:00",
        soldCount: 67,
        rating: 4.6,
        reviewCount: 89,
        sku: "WP-FUNC-002",
        weight: 0.8,
        dimensions: { length: 180, width: 120, height: 3 },
      },
      {
        id: "prod-003",
        name: "หมอนอิงเซ็ต",
        nameEn: "Matching Throw Pillows Set",
        description: "หมอนอิงที่เข้าชุดกับผ้าคลุมโซฟา ขนาด 45x45 ซม. จำนวน 2 ใบ",
        category: "accessories",
        price: 350,
        costPrice: 120,
        stock: 5,
        minStock: 15,
        status: "active",
        images: ["/placeholder.svg?height=300&width=300&text=Pillow+Set"],
        createdAt: "2024-01-20T10:00:00",
        updatedAt: "2024-01-25T11:15:00",
        soldCount: 156,
        rating: 4.4,
        reviewCount: 203,
        sku: "PIL-SET-003",
        weight: 0.6,
        dimensions: { length: 45, width: 45, height: 15 },
      },
      {
        id: "prod-004",
        name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
        nameEn: "Sectional Sofa Cover",
        description: "ผ้าคลุมโซฟาสำหรับโซฟา L-Shape และโซฟาเซ็กชั่นแนล",
        category: "sectional",
        price: 4200,
        costPrice: 1800,
        stock: 8,
        minStock: 3,
        status: "active",
        images: ["/placeholder.svg?height=300&width=300&text=Sectional+Cover"],
        createdAt: "2024-01-20T10:00:00",
        updatedAt: "2024-01-26T10:45:00",
        soldCount: 34,
        rating: 4.7,
        reviewCount: 45,
        sku: "SEC-COV-004",
        weight: 2.1,
        dimensions: { length: 300, width: 200, height: 8 },
      },
      {
        id: "prod-005",
        name: "น้ำยาทำความสะอาดผ้า",
        nameEn: "Fabric Cleaner",
        description: "น้ำยาทำความสะอาดผ้าเฉพาะ ปลอดภัย ไม่ทำลายเนื้อผ้า",
        category: "care",
        price: 280,
        costPrice: 95,
        stock: 42,
        minStock: 20,
        status: "active",
        images: ["/placeholder.svg?height=300&width=300&text=Fabric+Cleaner"],
        createdAt: "2024-01-15T10:00:00",
        updatedAt: "2024-01-22T14:20:00",
        soldCount: 78,
        rating: 4.3,
        reviewCount: 92,
        sku: "CLEAN-005",
        weight: 0.5,
        dimensions: { length: 20, width: 8, height: 25 },
      },
    ]

    // Initialize customers
    this.customers = [
      {
        id: "cust-001",
        name: "คุณสมชาย ใจดี",
        email: "somchai@email.com",
        phone: "081-234-5678",
        address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
        totalOrders: 5,
        totalSpent: 15450,
        averageOrderValue: 3090,
        lastOrderAt: "2024-01-25T10:30:00",
        firstOrderAt: "2023-08-15T14:20:00",
        status: "vip",
        tags: ["VIP", "ลูกค้าประจำ", "ชอบสีเข้ม"],
        notes: "ลูกค้า VIP ชอบสั่งผ้าคลุมโซฟาพรีเมียม มักจะรีบด่วน",
        preferredPayment: "bank_transfer",
        communicationPreference: "phone",
      },
      {
        id: "cust-002",
        name: "คุณสมหญิง รักสวย",
        email: "somying@email.com",
        phone: "082-345-6789",
        address: "456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        totalOrders: 3,
        totalSpent: 8900,
        averageOrderValue: 2967,
        lastOrderAt: "2024-01-24T14:15:00",
        firstOrderAt: "2023-11-20T16:30:00",
        status: "active",
        tags: ["ลูกค้าประจำ", "ชอบสีอ่อน"],
        notes: "ชอบผ้าที่ดูแลง่าย กันน้ำ",
        preferredPayment: "credit_card",
        communicationPreference: "line",
      },
      {
        id: "cust-003",
        name: "คุณสมศักดิ์ มีเงิน",
        email: "somsak@email.com",
        phone: "083-456-7890",
        address: "789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
        totalOrders: 1,
        totalSpent: 4200,
        averageOrderValue: 4200,
        lastOrderAt: "2024-01-26T16:45:00",
        firstOrderAt: "2024-01-26T16:45:00",
        status: "active",
        tags: ["ลูกค้าใหม่", "งบสูง"],
        notes: "ลูกค้าใหม่ สนใจสินค้าราคาสูง คุณภาพดี",
        preferredPayment: "bank_transfer",
        communicationPreference: "email",
      },
    ]
  }

  // API Methods
  async getStats(): Promise<DashboardStats> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.stats), 500)
    })
  }

  async getInvoices(filters?: any): Promise<Invoice[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...this.invoices]

        if (filters?.status && filters.status !== "all") {
          filtered = filtered.filter((inv) => inv.status === filters.status)
        }

        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(
            (inv) =>
              inv.invoiceNumber.toLowerCase().includes(search) ||
              inv.customerName.toLowerCase().includes(search) ||
              inv.customerPhone.includes(search),
          )
        }

        resolve(filtered)
      }, 300)
    })
  }

  async getProducts(filters?: any): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...this.products]

        if (filters?.category && filters.category !== "all") {
          filtered = filtered.filter((prod) => prod.category === filters.category)
        }

        if (filters?.status && filters.status !== "all") {
          filtered = filtered.filter((prod) => prod.status === filters.status)
        }

        resolve(filtered)
      }, 300)
    })
  }

  async getCustomers(filters?: any): Promise<Customer[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.customers), 300)
    })
  }

  async updateInvoiceStatus(id: string, status: string): Promise<Invoice | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoice = this.invoices.find((inv) => inv.id === id)
        if (invoice) {
          invoice.status = status as any
          invoice.updatedAt = new Date().toISOString()
        }
        resolve(invoice || null)
      }, 200)
    })
  }

  async addTagToInvoice(id: string, tag: string): Promise<Invoice | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoice = this.invoices.find((inv) => inv.id === id)
        if (invoice && !invoice.tags.includes(tag)) {
          invoice.tags.push(tag)
          invoice.updatedAt = new Date().toISOString()
        }
        resolve(invoice || null)
      }, 200)
    })
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: `INV-2024-${String(this.invoices.length + 1).padStart(3, "0")}`,
          customerName: data.customerName || "",
          customerPhone: data.customerPhone || "",
          customerEmail: data.customerEmail || "",
          customerAddress: data.customerAddress || "",
          items: data.items || [],
          subtotal: data.subtotal || 0,
          shipping: data.shipping || 0,
          tax: data.tax || 0,
          total: data.total || 0,
          status: "pending",
          paymentStatus: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: data.dueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          tags: data.tags || [],
          externalOrders: data.externalOrders || {},
          costReceipts: data.costReceipts || [],
          notes: data.notes || "",
        }

        this.invoices.unshift(newInvoice)
        this.stats.totalOrders += 1
        this.stats.totalRevenue += newInvoice.total

        resolve(newInvoice)
      }, 500)
    })
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct: Product = {
          id: `prod-${Date.now()}`,
          name: data.name || "",
          nameEn: data.nameEn || "",
          description: data.description || "",
          category: data.category || "general",
          price: data.price || 0,
          costPrice: data.costPrice || 0,
          stock: data.stock || 0,
          minStock: data.minStock || 5,
          status: "active",
          images: data.images || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          soldCount: 0,
          rating: 0,
          reviewCount: 0,
          sku: data.sku || `SKU-${Date.now()}`,
          weight: data.weight || 0,
          dimensions: data.dimensions || { length: 0, width: 0, height: 0 },
        }

        this.products.unshift(newProduct)
        this.stats.totalProducts += 1

        resolve(newProduct)
      }, 500)
    })
  }
}

// Initialize mock service
const mockService = new MockDashboardService()

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Modal states
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [showCreateProduct, setShowCreateProduct] = useState(false)
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTag, setNewTag] = useState("")

  // AI Assistant States
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [chatAnalysis, setChatAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiInput, setAiInput] = useState("")

  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    shipping: 150,
    notes: "",
  })

  const [productForm, setProductForm] = useState({
    name: "",
    nameEn: "",
    description: "",
    category: "general",
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    weight: 0,
    sku: "",
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsData, invoicesData, productsData, customersData] = await Promise.all([
        mockService.getStats(),
        mockService.getInvoices({ status: statusFilter, search: searchTerm }),
        mockService.getProducts({ category: categoryFilter }),
        mockService.getCustomers(),
      ])

      setStats(statsData)
      setInvoices(invoicesData)
      setProducts(productsData)
      setCustomers(customersData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล")
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

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      await mockService.updateInvoiceStatus(invoiceId, newStatus)
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: newStatus as any, updatedAt: new Date().toISOString() } : inv,
        ),
      )
      toast.success("อัปเดตสถานะเรียบร้อยแล้ว")
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    }
  }

  const addTagToInvoice = async (invoiceId: string, tag: string) => {
    try {
      await mockService.addTagToInvoice(invoiceId, tag)
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                tags: [...inv.tags, tag].filter((t, i, arr) => arr.indexOf(t) === i),
                updatedAt: new Date().toISOString(),
              }
            : inv,
        ),
      )
      setNewTag("")
      setShowAddTag(false)
      toast.success("เพิ่มแท็กเรียบร้อยแล้ว")
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มแท็ก")
    }
  }

  const createInvoice = async () => {
    try {
      const items = invoiceForm.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name,
        description: "",
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      }))

      const subtotal = items.reduce((sum, item) => sum + item.total, 0)
      const total = subtotal + invoiceForm.shipping

      const newInvoice = await mockService.createInvoice({
        ...invoiceForm,
        items,
        subtotal,
        total,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      })

      setInvoices([newInvoice, ...invoices])
      setShowCreateInvoice(false)
      setInvoiceForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        customerAddress: "",
        items: [{ name: "", quantity: 1, price: 0 }],
        shipping: 150,
        notes: "",
      })

      if (stats) {
        setStats({
          ...stats,
          totalOrders: stats.totalOrders + 1,
          totalRevenue: stats.totalRevenue + total,
        })
      }

      toast.success("สร้างใบแจ้งหนี้เรียบร้อยแล้ว")
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้างใบแจ้งหนี้")
    }
  }

  const createProduct = async () => {
    try {
      const newProduct = await mockService.createProduct({
        ...productForm,
        images: ["/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(productForm.name)],
        dimensions: { length: 0, width: 0, height: 0 },
      })

      setProducts([newProduct, ...products])
      setShowCreateProduct(false)
      setProductForm({
        name: "",
        nameEn: "",
        description: "",
        category: "general",
        price: 0,
        costPrice: 0,
        stock: 0,
        minStock: 5,
        weight: 0,
        sku: "",
      })

      if (stats) {
        setStats({
          ...stats,
          totalProducts: stats.totalProducts + 1,
        })
      }

      toast.success("เพิ่มสินค้าเรียบร้อยแล้ว")
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า")
    }
  }

  // AI Functions
  const generateCollectionName = async () => {
    setIsAnalyzing(true)
    try {
      // Mock AI response
      setTimeout(() => {
        const suggestions = [
          "Elegant Harmony Collection - คอลเลกชันแห่งความงามที่ลงตัว",
          "Modern Comfort Series - ซีรีส์ความสบายสไตล์โมเดิร์น",
          "Luxury Living Collection - คอลเลกชันการใช้ชีวิตระดับพรีเมียม",
          "Cozy Home Essentials - ของจำเป็นสำหรับบ้านอบอุ่น",
          "Premium Lifestyle Series - ซีรีส์ไลฟ์สไตล์ระดับพรีเมียม",
        ]
        setAiSuggestions(suggestions)
        setIsAnalyzing(false)
      }, 2000)
    } catch (error) {
      setIsAnalyzing(false)
      toast.error("เกิดข้อผิดพลาดในการสร้างชื่อคอลเลกชัน")
    }
  }

  const generateProductDescription = async (productName: string) => {
    setIsAnalyzing(true)
    try {
      setTimeout(() => {
        const description = `${productName} - ผลิตจากวัสดุคุณภาพสูง ออกแบบเพื่อความทนทานและความสวยงาม เหมาะสำหรับการใช้งานในบ้านที่ต้องการความสะดวกสบายและสไตล์ที่ทันสมัย ดูแลง่าย ทำความสะอาดได้ ใช้งานได้ยาวนาน พร้อมการรับประกันคุณภาพ`
        setAiSuggestions([description])
        setIsAnalyzing(false)
      }, 1500)
    } catch (error) {
      setIsAnalyzing(false)
      toast.error("เกิดข้อผิดพลาดในการสร้างคำอธิบายสินค้า")
    }
  }

  const analyzeChatContent = async (chatText: string) => {
    setIsAnalyzing(true)
    try {
      setTimeout(() => {
        const analysis = `
📊 การวิเคราะห์แชทลูกค้า:

🎯 ความต้องการที่ระบุ:
- ผ้าคลุมโซฟา 3 ที่นั่ง
- สีเข้ม ทนทาน
- งบประมาณ 2,000-3,000 บาท

💡 สินค้าที่แนะนำ:
1. ผ้าคลุมโซฟากำมะหยี่พรีเมียม (฿2,890)
2. ผ้าคลุมโซฟาผ้าลินิน (฿2,590)

⚡ ความเร่งด่วน: ปานกลาง
🏷️ แท็กที่แนะนำ: "ลูกค้าใหม่", "งบ 3K"

📝 ข้อเสนอแนะ:
- ส่งรูปตัวอย่างสินค้า
- สอบถามขนาดโซฟาที่แน่นอน
- เสนอบริการวัดหน้างาน
        `
        setChatAnalysis(analysis)
        setIsAnalyzing(false)
      }, 1500)
    } catch (error) {
      setIsAnalyzing(false)
      toast.error("เกิดข้อผิดพลาดในการวิเคราะห์แชท")
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerPhone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesCategory
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบจัดการธุรกิจผ้าคลุมโซฟาแบบครบวงจร</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
          <Button
            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            onClick={() => setShowCreateInvoice(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            สร้างใบแจ้งหนี้
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  <p className="text-xs text-red-500">สต็อกต่ำ: {stats.lowStockProducts}</p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">รอชำระเงิน</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingPayments}</p>
                  <p className="text-xs text-gray-500">เสร็จสิ้น: {stats.completedOrders}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
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
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <div>
                        <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                        <p className="text-sm text-gray-600">{invoice.customerName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={statusConfig[invoice.status].color}>
                            {statusConfig[invoice.status].label}
                          </Badge>
                          {invoice.tags.slice(0, 2).map((tag) => (
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
                    <div
                      key={product.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการด่วน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  onClick={() => setShowCreateInvoice(true)}
                >
                  <Plus className="w-6 h-6 mb-2" />
                  สร้างใบแจ้งหนี้
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  onClick={() => setShowCreateProduct(true)}
                >
                  <Package className="w-6 h-6 mb-2" />
                  เพิ่มสินค้า
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  onClick={() => setActiveTab("reports")}
                >
                  <BarChart3 className="w-6 h-6 mb-2" />
                  ดูรายงาน
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => setActiveTab("ai")}>
                  <Bot className="w-6 h-6 mb-2" />
                  AI ผู้ช่วย
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">จัดการใบแจ้งหนี้</h2>
            <Button
              className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600"
              onClick={() => setShowCreateInvoice(true)}
            >
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
                    <SelectItem value="cutting">กำลังตัด</SelectItem>
                    <SelectItem value="sewing">กำลังเย็บ</SelectItem>
                    <SelectItem value="packing">กำลังแพ็ค</SelectItem>
                    <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={loadDashboardData}>
                  <Filter className="w-4 h-4 mr-2" />
                  กรอง
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  พบ {filteredInvoices.length} รายการจากทั้งหมด {invoices.length} รายการ
                </p>
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
                        <Badge className={paymentStatusConfig[invoice.paymentStatus].color}>
                          {paymentStatusConfig[invoice.paymentStatus].label}
                        </Badge>
                        {invoice.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">ลูกค้า</p>
                          <p className="font-semibold">{invoice.customerName}</p>
                          <p className="text-sm text-gray-500">{invoice.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ยอดรวม</p>
                          <p className="text-2xl font-bold text-pink-600">{formatPrice(invoice.total)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">วันที่สร้าง</p>
                          <p className="font-semibold">{formatDate(invoice.createdAt)}</p>
                          {invoice.estimatedDelivery && (
                            <p className="text-sm text-gray-500">ส่งมอบ: {formatDate(invoice.estimatedDelivery)}</p>
                          )}
                        </div>
                      </div>

                      {/* External Orders */}
                      {Object.keys(invoice.externalOrders).length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">เลขออเดอร์:</p>
                          <div className="flex flex-wrap gap-2">
                            {invoice.externalOrders.shopee && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Shopee: {invoice.externalOrders.shopee}
                              </Badge>
                            )}
                            {invoice.externalOrders.lazada && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Lazada: {invoice.externalOrders.lazada}
                              </Badge>
                            )}
                            {invoice.externalOrders.alibaba && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                <ExternalLink className="w-3 h-3 mr-1" />
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
                          <SelectItem value="cutting">กำลังตัด</SelectItem>
                          <SelectItem value="sewing">กำลังเย็บ</SelectItem>
                          <SelectItem value="packing">กำลังแพ็ค</SelectItem>
                          <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                          <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                          <SelectItem value="cancelled">ยกเลิก</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setShowAddTag(true)
                        }}
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        เพิ่มแท็ก
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบใบแจ้งหนี้</h3>
                <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                  variant="outline"
                >
                  ล้างตัวกรอง
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h2>
            <Button
              className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600"
              onClick={() => setShowCreateProduct(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มสินค้าใหม่
            </Button>
          </div>

          {/* Product Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="หมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                    <SelectItem value="premium">พรีเมียม</SelectItem>
                    <SelectItem value="functional">ฟังก์ชันนัล</SelectItem>
                    <SelectItem value="accessories">อุปกรณ์เสริม</SelectItem>
                    <SelectItem value="sectional">เซ็กชั่นแนล</SelectItem>
                    <SelectItem value="care">ดูแลรักษา</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={loadDashboardData}>
                  <Filter className="w-4 h-4 mr-2" />
                  กรอง
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-pink-600">{formatPrice(product.price)}</span>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">คงเหลือ: {product.stock}</span>
                      <span className="text-gray-600">ขายแล้ว: {product.soldCount}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">SKU: {product.sku}</span>
                      <span className="text-gray-600">
                        ⭐ {product.rating} ({product.reviewCount})
                      </span>
                    </div>

                    {product.stock <= product.minStock && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        สต็อกต่ำ
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      ดู
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      แก้ไข
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
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
                        <Badge variant={customer.status === "vip" ? "default" : "outline"}>
                          {customer.status === "vip" ? "VIP" : customer.status}
                        </Badge>
                        {customer.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
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
                        <div>
                          <p className="text-sm text-gray-600">ค่าเฉลี่ย/คำสั่ง</p>
                          <p className="text-xl font-bold text-purple-600">{formatPrice(customer.averageOrderValue)}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">ลูกค้าตั้งแต่</p>
                          <p className="text-sm">{formatDate(customer.firstOrderAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ซื้อล่าสุด</p>
                          <p className="text-sm">{formatDate(customer.lastOrderAt)}</p>
                        </div>
                      </div>

                      {customer.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">หมายเหตุ:</p>
                          <p className="text-sm bg-blue-50 p-2 rounded">{customer.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-6 mt-4 lg:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto bg-transparent"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        ดูรายละเอียด
                      </Button>
                      <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        ดูประวัติแชท
                      </Button>
                      <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                        <Edit className="w-4 h-4 mr-2" />
                        แก้ไขข้อมูล
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
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">กราฟยอดขายรายเดือน</p>
                    <p className="text-sm text-gray-400">ข้อมูลจำลอง</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สินค้ายอดนิยม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.soldCount} ขาย</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600">{formatPrice(product.price)}</p>
                        <p className="text-sm text-gray-500">⭐ {product.rating}</p>
                      </div>
                    </div>
                  ))}
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
                <CardTitle>ลูกค้าประจำ TOP 5</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.totalOrders} คำสั่งซื้อ</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatPrice(customer.totalSpent)}</p>
                        <p className="text-sm text-gray-500">เฉลี่ย {formatPrice(customer.averageOrderValue)}</p>
                      </div>
                    </div>
                  ))}
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

      {/* Create Invoice Modal */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>สร้างใบแจ้งหนี้ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name">ชื่อลูกค้า</Label>
                <Input
                  id="customer-name"
                  value={invoiceForm.customerName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="customer-phone"
                  value={invoiceForm.customerPhone}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })}
                  placeholder="081-234-5678"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-email">อีเมล</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={invoiceForm.customerEmail}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <Label htmlFor="shipping">ค่าจัดส่ง</Label>
                <Input
                  id="shipping"
                  type="number"
                  value={invoiceForm.shipping}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, shipping: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer-address">ที่อยู่</Label>
              <Textarea
                id="customer-address"
                value={invoiceForm.customerAddress}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerAddress: e.target.value })}
                placeholder="ที่อยู่สำหรับจัดส่ง"
                rows={3}
              />
            </div>

            <div>
              <Label>รายการสินค้า</Label>
              <div className="space-y-4">
                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <Input
                        placeholder="ชื่อสินค้า"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...invoiceForm.items]
                          newItems[index].name = e.target.value
                          setInvoiceForm({ ...invoiceForm, items: newItems })
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="จำนวน"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...invoiceForm.items]
                          newItems[index].quantity = Number(e.target.value)
                          setInvoiceForm({ ...invoiceForm, items: newItems })
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="ราคา"
                        value={item.price}
                        onChange={(e) => {
                          const newItems = [...invoiceForm.items]
                          newItems[index].price = Number(e.target.value)
                          setInvoiceForm({ ...invoiceForm, items: newItems })
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = invoiceForm.items.filter((_, i) => i !== index)
                          setInvoiceForm({ ...invoiceForm, items: newItems })
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setInvoiceForm({
                      ...invoiceForm,
                      items: [...invoiceForm.items, { name: "", quantity: 1, price: 0 }],
                    })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มรายการ
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                placeholder="หมายเหตุเพิ่มเติม"
                rows={3}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">ยอดรวมทั้งสิ้น:</span>
                <span className="text-2xl font-bold text-pink-600">
                  {formatPrice(
                    invoiceForm.items.reduce((sum, item) => sum + item.quantity * item.price, 0) + invoiceForm.shipping,
                  )}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>
              ยกเลิก
            </Button>
            <Button onClick={createInvoice} className="bg-gradient-to-r from-pink-500 to-rose-600">
              <Save className="w-4 h-4 mr-2" />
              สร้างใบแจ้งหนี้
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Product Modal */}
      <Dialog open={showCreateProduct} onOpenChange={setShowCreateProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-name">ชื่อสินค้า (ไทย)</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="ผ้าคลุมโซฟากำมะหยี่พรีเมียม"
                />
              </div>
              <div>
                <Label htmlFor="product-name-en">ชื่อสินค้า (อังกฤษ)</Label>
                <Input
                  id="product-name-en"
                  value={productForm.nameEn}
                  onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                  placeholder="Premium Velvet Sofa Cover"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="product-description">คำอธิบายสินค้า</Label>
              <Textarea
                id="product-description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="คำอธิบายรายละเอียดสินค้า"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-category">หมวดหมู่</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">พรีเมียม</SelectItem>
                    <SelectItem value="functional">ฟังก์ชันนัล</SelectItem>
                    <SelectItem value="accessories">อุปกรณ์เสริม</SelectItem>
                    <SelectItem value="sectional">เซ็กชั่นแนล</SelectItem>
                    <SelectItem value="care">ดูแลรักษา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="SKU-001"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="product-price">ราคาขาย</Label>
                <Input
                  id="product-price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  placeholder="2890"
                />
              </div>
              <div>
                <Label htmlFor="product-cost">ราคาต้นทุน</Label>
                <Input
                  id="product-cost"
                  type="number"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                  placeholder="1200"
                />
              </div>
              <div>
                <Label htmlFor="product-weight">น้ำหนัก (กก.)</Label>
                <Input
                  id="product-weight"
                  type="number"
                  step="0.1"
                  value={productForm.weight}
                  onChange={(e) => setProductForm({ ...productForm, weight: Number(e.target.value) })}
                  placeholder="1.2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-stock">จำนวนสต็อก</Label>
                <Input
                  id="product-stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="product-min-stock">สต็อกขั้นต่ำ</Label>
                <Input
                  id="product-min-stock"
                  type="number"
                  value={productForm.minStock}
                  onChange={(e) => setProductForm({ ...productForm, minStock: Number(e.target.value) })}
                  placeholder="5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateProduct(false)}>
              ยกเลิก
            </Button>
            <Button onClick={createProduct} className="bg-gradient-to-r from-pink-500 to-rose-600">
              <Save className="w-4 h-4 mr-2" />
              เพิ่มสินค้า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Modal */}
      <Dialog open={showAddTag} onOpenChange={setShowAddTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มแท็ก</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-tag">แท็กใหม่</Label>
              <Input
                id="new-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="เช่น VIP, รีบด่วน, ลูกค้าประจำ"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">แท็กที่แนะนำ:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["VIP", "รีบด่วน", "ลูกค้าประจำ", "ลูกค้าใหม่", "งบสูง", "งบต่ำ"].map((tag) => (
                  <Button key={tag} variant="outline" size="sm" onClick={() => setNewTag(tag)}>
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTag(false)}>
              ยกเลิก
            </Button>
            <Button onClick={() => selectedInvoice && addTagToInvoice(selectedInvoice.id, newTag)} disabled={!newTag}>
              <Tag className="w-4 h-4 mr-2" />
              เพิ่มแท็ก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <p>
                      <span className="font-medium">ที่อยู่:</span> {selectedInvoice.customerAddress}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">สถานะและวันที่</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={statusConfig[selectedInvoice.status].color}>
                        {statusConfig[selectedInvoice.status].label}
                      </Badge>
                      <Badge className={paymentStatusConfig[selectedInvoice.paymentStatus].color}>
                        {paymentStatusConfig[selectedInvoice.paymentStatus].label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedInvoice.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">สร้าง:</span> {formatDate(selectedInvoice.createdAt)}
                      </p>
                      <p>
                        <span className="font-medium">อัปเดต:</span> {formatDate(selectedInvoice.updatedAt)}
                      </p>
                      <p>
                        <span className="font-medium">กำหนดชำระ:</span> {formatDate(selectedInvoice.dueDate)}
                      </p>
                      {selectedInvoice.estimatedDelivery && (
                        <p>
                          <span className="font-medium">ส่งมอบ:</span> {formatDate(selectedInvoice.estimatedDelivery)}
                        </p>
                      )}
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
                          <td className="p-3 text-sm">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.description && <p className="text-gray-500 text-xs">{item.description}</p>}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-center">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">{formatPrice(item.price)}</td>
                          <td className="p-3 text-sm text-right font-semibold">{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-gray-50">
                        <td colSpan={3} className="p-3 text-sm text-right">
                          ยอดรวมสินค้า:
                        </td>
                        <td className="p-3 text-sm text-right font-semibold">
                          {formatPrice(selectedInvoice.subtotal)}
                        </td>
                      </tr>
                      {selectedInvoice.shipping > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="p-3 text-sm text-right">
                            ค่าจัดส่ง:
                          </td>
                          <td className="p-3 text-sm text-right font-semibold">
                            {formatPrice(selectedInvoice.shipping)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t bg-gray-100">
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
                          <span className="text-sm flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Shopee:
                          </span>
                          <span className="text-sm font-mono">{selectedInvoice.externalOrders.shopee}</span>
                        </div>
                      )}
                      {selectedInvoice.externalOrders.lazada && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Lazada:
                          </span>
                          <span className="text-sm font-mono">{selectedInvoice.externalOrders.lazada}</span>
                        </div>
                      )}
                      {selectedInvoice.externalOrders.alibaba && (
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-sm flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            1688:
                          </span>
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
                <Button variant="outline" onClick={() => setShowAddTag(true)}>
                  <Tag className="w-4 h-4 mr-2" />
                  เพิ่มแท็ก
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด PDF
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไข
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>รายละเอียดสินค้า</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                <p className="text-gray-600">{selectedProduct.nameEn}</p>
                <p className="text-sm text-gray-500 mt-2">{selectedProduct.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ราคาขาย</p>
                  <p className="text-2xl font-bold text-pink-600">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ราคาต้นทุน</p>
                  <p className="text-xl font-bold text-green-600">{formatPrice(selectedProduct.costPrice)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">สต็อก</p>
                  <p className="font-bold">{selectedProduct.stock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ขายแล้ว</p>
                  <p className="font-bold">{selectedProduct.soldCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">คะแนน</p>
                  <p className="font-bold">
                    ⭐ {selectedProduct.rating} ({selectedProduct.reviewCount})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">SKU</p>
                  <p className="font-mono">{selectedProduct.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">น้ำหนัก</p>
                  <p>{selectedProduct.weight} กก.</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">หมวดหมู่</p>
                <Badge>{selectedProduct.category}</Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">สถานะ</p>
                <Badge variant={selectedProduct.status === "active" ? "default" : "secondary"}>
                  {selectedProduct.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </Badge>
              </div>

              {selectedProduct.stock <= selectedProduct.minStock && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">สต็อกต่ำ - ควรเติมสต็อก</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                ปิด
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                แก้ไขสินค้า
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>รายละเอียดลูกค้า</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={selectedCustomer.status === "vip" ? "default" : "outline"}>
                    {selectedCustomer.status === "vip" ? "VIP" : selectedCustomer.status}
                  </Badge>
                  {selectedCustomer.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
                  <p className="font-semibold">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">อีเมล</p>
                  <p className="font-semibold">{selectedCustomer.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">ที่อยู่</p>
                <p>{selectedCustomer.address}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">คำสั่งซื้อ</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ยอดซื้อรวม</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(selectedCustomer.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ค่าเฉลี่ย/คำสั่ง</p>
                  <p className="text-xl font-bold text-purple-600">{formatPrice(selectedCustomer.averageOrderValue)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ลูกค้าตั้งแต่</p>
                  <p>{formatDate(selectedCustomer.firstOrderAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ซื้อล่าสุด</p>
                  <p>{formatDate(selectedCustomer.lastOrderAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">การชำระเงินที่ชอบ</p>
                  <p>{selectedCustomer.preferredPayment === "bank_transfer" ? "โอนเงิน" : "บัตรเครดิต"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ช่องทางติดต่อ</p>
                  <p>
                    {selectedCustomer.communicationPreference === "phone"
                      ? "โทรศัพท์"
                      : selectedCustomer.communicationPreference === "line"
                        ? "Line"
                        : "อีเมล"}
                  </p>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div>
                  <p className="text-sm text-gray-600">หมายเหตุ</p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                ปิด
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                ดูประวัติแชท
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                แก้ไขข้อมูล
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
