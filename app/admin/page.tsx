"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, Users, ShoppingCart, DollarSign, Clock, CheckCircle, AlertTriangle, Truck } from "lucide-react"

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

const statsData = [
  {
    title: "ยอดขายวันนี้",
    value: "฿45,231",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "คำสั่งซื้อใหม่",
    value: "23",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "ลูกค้าใหม่",
    value: "8",
    change: "-2.3%",
    trend: "down",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "สินค้าคงเหลือ",
    value: "156",
    change: "-5.2%",
    trend: "down",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const recentOrdersData = [
  {
    id: "ORD-001",
    customer: "คุณสมชาย ใจดี",
    product: "ผ้าคลุมโซฟา 3 ที่นั่ง",
    amount: "฿2,890",
    status: "รอดำเนินการ",
    statusColor: "bg-yellow-100 text-yellow-800",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "คุณสมหญิง รักสวย",
    product: "ผ้าคลุมโซฟา L-Shape",
    amount: "฿3,590",
    status: "กำลังผลิต",
    statusColor: "bg-blue-100 text-blue-800",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "คุณวิชัย มั่งมี",
    product: "ผ้าคลุมโซฟากันน้ำ",
    amount: "฿3,290",
    status: "จัดส่งแล้ว",
    statusColor: "bg-green-100 text-green-800",
    date: "2024-01-14",
  },
  {
    id: "ORD-004",
    customer: "คุณนิดา สวยงาม",
    product: "ผ้าคลุมโซฟา 2 ที่นั่ง",
    amount: "฿2,390",
    status: "เสร็จสิ้น",
    statusColor: "bg-gray-100 text-gray-800",
    date: "2024-01-14",
  },
]

const topProductsData = [
  {
    name: "ผ้าคลุมโซฟา 3 ที่นั่ง - Classic",
    sales: 45,
    revenue: "฿130,050",
    image: "/classic-elegant-fabric-pattern-1.png",
  },
  {
    name: "ผ้าคลุมโซฟา L-Shape - Modern",
    sales: 32,
    revenue: "฿114,880",
    image: "/modern-minimalist-fabric-pattern-1.png",
  },
  {
    name: "ผ้าคลุมโซฟากันน้ำ - Pro",
    sales: 28,
    revenue: "฿92,120",
    image: "/modern-minimalist-fabric-pattern-2.png",
  },
]

const stats = [
  {
    title: "ยอดขายวันนี้",
    value: "฿45,231",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "คำสั่งซื้อใหม่",
    value: "23",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "ลูกค้าใหม่",
    value: "12",
    change: "-2.4%",
    trend: "down",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "สินค้าคงเหลือ",
    value: "1,234",
    change: "-5.1%",
    trend: "down",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "คุณสมใจ รักบ้าน",
    product: "ผ้าคลุมโซฟา Classic Elegant",
    amount: "฿2,890",
    status: "รอดำเนินการ",
    statusColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "ORD-002",
    customer: "คุณมาลี สวยงาม",
    product: "ผ้าคลุมโซฟา Modern Minimalist",
    amount: "฿3,290",
    status: "กำลังผลิต",
    statusColor: "bg-blue-100 text-blue-800",
  },
  {
    id: "ORD-003",
    customer: "คุณสมชาย ใจดี",
    product: "ผ้าคลุมโซฟา Bohemian Chic",
    amount: "฿3,590",
    status: "จัดส่งแล้ว",
    statusColor: "bg-green-100 text-green-800",
  },
]

const topProducts = [
  {
    name: "ผ้าคลุมโซฟา Classic Elegant",
    sales: 45,
    revenue: "฿130,050",
    progress: 85,
  },
  {
    name: "ผ้าคลุมโซฟา Modern Minimalist",
    sales: 32,
    revenue: "฿105,280",
    progress: 65,
  },
  {
    name: "ผ้าคลุมโซฟา Bohemian Chic",
    sales: 28,
    revenue: "฿100,520",
    progress: 55,
  },
]

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.replace("/admin/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังเปลี่ยนเส้นทางไปยังแดชบอร์ด...</p>
      </div>
    </div>
  )
}
