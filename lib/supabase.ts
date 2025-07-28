import { createClient } from "@supabase/supabase-js"

// ใช้ environment variables จริง หรือ fallback สำหรับ development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// สร้าง Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Product {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  category: "covers" | "accessories"
  type: "custom" | "fixed"
  price?: number
  price_range_min?: number
  price_range_max?: number
  images: string[]
  colors: Array<{
    name: string
    name_en: string
    value: string
  }>
  sizes?: Array<{
    name: string
    name_en: string
    price: number
  }>
  features: {
    th: string[]
    en: string[]
  }
  specifications: {
    material: { th: string; en: string }
    care: { th: string; en: string }
    origin: { th: string; en: string }
    warranty: { th: string; en: string }
  }
  stock: number
  status: "active" | "draft" | "low_stock" | "out_of_stock"
  rating: number
  reviews_count: number
  sold_count: number
  bestseller: boolean
  discount: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  total_orders: number
  total_spent: number
  average_order_value: number
  last_order_date: string
  join_date: string
  status: "active" | "inactive"
  customer_type: "new" | "regular" | "frequent" | "premium" | "vip"
  favorite_category: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  customer: Customer
  items: Array<{
    product_id: string
    name: string
    quantity: number
    price: number
    specifications: string
  }>
  total: number
  status: "pending" | "production" | "shipped" | "completed" | "cancelled"
  payment_status: "pending" | "paid" | "refunded"
  payment_method: "bank_transfer" | "promptpay" | "cod" | "credit_card"
  shipping_address: string
  tracking_number?: string
  estimated_delivery: string
  delivered_at?: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  date: string
  revenue: number
  orders_count: number
  customers_count: number
  new_customers: number
  product_sales: Record<string, number>
  category_sales: Record<string, number>
  payment_methods: Record<string, number>
  shipping_areas: Record<string, number>
  created_at: string
}

// ตรวจสอบว่าเชื่อมต่อ Supabase ได้หรือไม่
const isSupabaseConnected = supabaseUrl !== "https://placeholder.supabase.co" && supabaseAnonKey !== "placeholder-key"

// Database Functions
export const db = {
  // ตรวจสอบการเชื่อมต่อ
  async testConnection() {
    if (!isSupabaseConnected) {
      console.log("🔧 Using mock database (Supabase not configured)")
      return { connected: false, using: "mock" }
    }

    try {
      const { data, error } = await supabase.from("products").select("count").limit(1)
      if (error) throw error
      console.log("✅ Supabase connected successfully")
      return { connected: true, using: "supabase" }
    } catch (error) {
      console.error("❌ Supabase connection failed:", error)
      return { connected: false, using: "mock", error }
    }
  },

  // Products
  async getProducts(filters?: {
    category?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    if (!isSupabaseConnected) {
      // ใช้ mock data
      return this.getMockProducts(filters)
    }

    try {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false })

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category)
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%`)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Product[]
    } catch (error) {
      console.error("Error fetching products:", error)
      return this.getMockProducts(filters)
    }
  },

  async getProduct(id: string) {
    if (!isSupabaseConnected) {
      return this.getMockProduct(id)
    }

    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error) throw error
      return data as Product
    } catch (error) {
      console.error("Error fetching product:", error)
      return this.getMockProduct(id)
    }
  },

  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
    if (!isSupabaseConnected) {
      return this.createMockProduct(product)
    }

    try {
      const { data, error } = await supabase.from("products").insert([product]).select().single()

      if (error) throw error
      return data as Product
    } catch (error) {
      console.error("Error creating product:", error)
      return this.createMockProduct(product)
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    if (!isSupabaseConnected) {
      return this.updateMockProduct(id, updates)
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as Product
    } catch (error) {
      console.error("Error updating product:", error)
      return this.updateMockProduct(id, updates)
    }
  },

  async deleteProduct(id: string) {
    if (!isSupabaseConnected) {
      return this.deleteMockProduct(id)
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      return this.deleteMockProduct(id)
    }
  },

  // Mock functions สำหรับ development
  getMockProducts(filters?: any): Product[] {
    const mockProducts: Product[] = [
      {
        id: "prod-001",
        name: "ผ้าคลุมโซฟา 3 ที่นั่ง - คลาสสิค",
        name_en: "3-Seater Sofa Cover - Classic",
        description: "ผ้าคลุมโซฟาคุณภาพสูง ทำจากผ้าคอตตอน 100%",
        description_en: "High-quality sofa cover made from 100% cotton",
        category: "covers",
        type: "custom",
        price_range_min: 1290,
        price_range_max: 2490,
        images: ["/placeholder.svg?height=400&width=400&text=Sofa+Cover"],
        colors: [
          { name: "เบจ", name_en: "Beige", value: "#F5F5DC" },
          { name: "เทา", name_en: "Gray", value: "#808080" },
          { name: "น้ำเงิน", name_en: "Navy", value: "#000080" },
        ],
        features: {
          th: ["กันน้ำ", "ซักได้", "ป้องกันขนสัตว์", "ติดตั้งง่าย"],
          en: ["Waterproof", "Washable", "Pet-friendly", "Easy installation"],
        },
        specifications: {
          material: { th: "ผ้าคอตตอน 100%", en: "100% Cotton" },
          care: { th: "ซักเครื่องได้", en: "Machine washable" },
          origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
          warranty: { th: "รับประกัน 1 ปี", en: "1 Year warranty" },
        },
        stock: 25,
        status: "active",
        rating: 4.8,
        reviews_count: 156,
        sold_count: 89,
        bestseller: true,
        discount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "prod-002",
        name: "ผ้าคลุมโซฟา 2 ที่นั่ง - โมเดิร์น",
        name_en: "2-Seater Sofa Cover - Modern",
        description: "ผ้าคลุมโซฟาสไตล์โมเดิร์น เหมาะกับบ้านสมัยใหม่",
        description_en: "Modern style sofa cover perfect for contemporary homes",
        category: "covers",
        type: "custom",
        price_range_min: 990,
        price_range_max: 1890,
        images: ["/placeholder.svg?height=400&width=400&text=Modern+Cover"],
        colors: [
          { name: "ขาว", name_en: "White", value: "#FFFFFF" },
          { name: "ดำ", name_en: "Black", value: "#000000" },
          { name: "เทาอ่อน", name_en: "Light Gray", value: "#D3D3D3" },
        ],
        features: {
          th: ["ยืดหยุ่น", "ระบายอากาศดี", "ต้านคราบ", "แห้งเร็ว"],
          en: ["Stretchable", "Breathable", "Stain resistant", "Quick dry"],
        },
        specifications: {
          material: { th: "ผ้าโพลีเอสเตอร์", en: "Polyester blend" },
          care: { th: "ซักเครื่องได้ 30°C", en: "Machine wash 30°C" },
          origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
          warranty: { th: "รับประกัน 6 เดือน", en: "6 Months warranty" },
        },
        stock: 15,
        status: "active",
        rating: 4.6,
        reviews_count: 89,
        sold_count: 67,
        bestseller: false,
        discount: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    // Apply filters
    let filtered = mockProducts

    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category)
    }

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(search) || p.name_en.toLowerCase().includes(search),
      )
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  },

  getMockProduct(id: string): Product | null {
    const products = this.getMockProducts()
    return products.find((p) => p.id === id) || null
  },

  createMockProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    console.log("Created mock product:", newProduct.id)
    return newProduct
  },

  updateMockProduct(id: string, updates: Partial<Product>): Product | null {
    const product = this.getMockProduct(id)
    if (!product) return null

    const updated = {
      ...product,
      ...updates,
      updated_at: new Date().toISOString(),
    }
    console.log("Updated mock product:", id)
    return updated
  },

  deleteMockProduct(id: string): boolean {
    console.log("Deleted mock product:", id)
    return true
  },

  // Dashboard Stats
  async getDashboardStats() {
    if (!isSupabaseConnected) {
      return {
        products: { total: 25, active: 23, lowStock: 3, outOfStock: 0 },
        customers: { total: 156, active: 142, vip: 12, totalRevenue: 245600 },
        orders: { total: 89, pending: 8, monthlyRevenue: 67800, averageOrderValue: 1890 },
        analytics: [],
      }
    }

    try {
      const [{ data: products }, { data: customers }, { data: orders }, { data: analytics }] = await Promise.all([
        supabase.from("products").select("id, status, stock"),
        supabase.from("customers").select("id, status, customer_type, total_spent"),
        supabase
          .from("orders")
          .select("id, status, total, created_at")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from("analytics")
          .select("*")
          .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      const totalProducts = products?.length || 0
      const activeProducts = products?.filter((p) => p.status === "active").length || 0
      const lowStockProducts = products?.filter((p) => p.stock <= 10).length || 0
      const outOfStockProducts = products?.filter((p) => p.stock === 0).length || 0

      const totalCustomers = customers?.length || 0
      const activeCustomers = customers?.filter((c) => c.status === "active").length || 0
      const vipCustomers = customers?.filter((c) => c.customer_type === "vip").length || 0
      const totalRevenue = customers?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0

      const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0
      const monthlyRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
      const averageOrderValue = totalOrders > 0 ? monthlyRevenue / totalOrders : 0

      return {
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
        },
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          vip: vipCustomers,
          totalRevenue,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          monthlyRevenue,
          averageOrderValue,
        },
        analytics: analytics || [],
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Return mock data on error
      return {
        products: { total: 25, active: 23, lowStock: 3, outOfStock: 0 },
        customers: { total: 156, active: 142, vip: 12, totalRevenue: 245600 },
        orders: { total: 89, pending: 8, monthlyRevenue: 67800, averageOrderValue: 1890 },
        analytics: [],
      }
    }
  },
}
