import { developmentConfig, devUtils } from "./development-config"

// Types
export interface Product {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  price: number
  images: string[]
  category: string
  specifications: {
    material: string
    dimensions: string
    colors: string[]
    care_instructions: string
  }
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  sold_count: number
  rating: number
  reviews_count: number
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
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  items: {
    product_id: string
    product_name: string
    quantity: number
    price: number
    total: number
  }[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: "pending" | "production" | "shipped" | "completed" | "cancelled"
  shipping_address: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  averageOrderValue: number
  topProducts: {
    id: string
    name: string
    sold_count: number
    revenue: number
  }[]
  recentOrders: Order[]
  monthlyRevenue: {
    month: string
    revenue: number
    orders: number
  }[]
}

// In-memory storage
let products: Product[] = []
let customers: Customer[] = []
let orders: Order[] = []

// Utility functions
const generateId = () => Math.random().toString(36).substring(2, 15)

const simulateLatency = async () => {
  if (developmentConfig.services.database.simulateLatency) {
    const { min, max } = developmentConfig.services.database.latency
    const delay = Math.random() * (max - min) + min
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

const simulateError = () => {
  if (Math.random() < developmentConfig.services.database.errorRate) {
    throw new Error("Simulated database error")
  }
}

// Mock Database Service
export const mockDatabaseService = {
  // Products
  async getProducts(): Promise<Product[]> {
    await simulateLatency()
    simulateError()
    return [...products]
  },

  async getProduct(id: string): Promise<Product | null> {
    await simulateLatency()
    simulateError()
    return products.find((p) => p.id === id) || null
  },

  async createProduct(productData: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
    await simulateLatency()
    simulateError()

    const product: Product = {
      ...productData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    products.push(product)
    console.log("📦 [MOCK DB] Created product:", product.name)
    return product
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await simulateLatency()
    simulateError()

    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return null

    products[index] = {
      ...products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    console.log("📦 [MOCK DB] Updated product:", products[index].name)
    return products[index]
  },

  async deleteProduct(id: string): Promise<boolean> {
    await simulateLatency()
    simulateError()

    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return false

    const product = products[index]
    products.splice(index, 1)
    console.log("📦 [MOCK DB] Deleted product:", product.name)
    return true
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    await simulateLatency()
    simulateError()
    return [...customers]
  },

  async getCustomer(id: string): Promise<Customer | null> {
    await simulateLatency()
    simulateError()
    return customers.find((c) => c.id === id) || null
  },

  async createCustomer(customerData: Omit<Customer, "id" | "created_at" | "updated_at">): Promise<Customer> {
    await simulateLatency()
    simulateError()

    const customer: Customer = {
      ...customerData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    customers.push(customer)
    console.log("👤 [MOCK DB] Created customer:", customer.name)
    return customer
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    await simulateLatency()
    simulateError()

    const index = customers.findIndex((c) => c.id === id)
    if (index === -1) return null

    customers[index] = {
      ...customers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    console.log("👤 [MOCK DB] Updated customer:", customers[index].name)
    return customers[index]
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    await simulateLatency()
    simulateError()
    return [...orders]
  },

  async getOrder(id: string): Promise<Order | null> {
    await simulateLatency()
    simulateError()
    return orders.find((o) => o.id === id) || null
  },

  async createOrder(orderData: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
    await simulateLatency()
    simulateError()

    const order: Order = {
      ...orderData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    orders.push(order)

    // Update customer stats
    const customer = customers.find((c) => c.id === order.customer_id)
    if (customer) {
      customer.total_orders += 1
      customer.total_spent += order.total
      customer.updated_at = new Date().toISOString()
    }

    // Update product sold count
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.product_id)
      if (product) {
        product.sold_count += item.quantity
        product.updated_at = new Date().toISOString()
      }
    })

    console.log("🛒 [MOCK DB] Created order:", order.id)
    return order
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    await simulateLatency()
    simulateError()

    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) return null

    orders[index] = {
      ...orders[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    console.log("🛒 [MOCK DB] Updated order:", orders[index].id)
    return orders[index]
  },

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    await simulateLatency()
    simulateError()

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalCustomers = customers.length
    const totalProducts = products.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Top products by revenue
    const productRevenue = new Map<string, { name: string; sold_count: number; revenue: number }>()

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productRevenue.get(item.product_id) || {
          name: item.product_name,
          sold_count: 0,
          revenue: 0,
        }
        existing.sold_count += item.quantity
        existing.revenue += item.total
        productRevenue.set(item.product_id, existing)
      })
    })

    const topProducts = Array.from(productRevenue.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    // Monthly revenue (last 6 months)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().substring(0, 7) // YYYY-MM

      const monthOrders = orders.filter((order) => order.created_at.substring(0, 7) === monthKey)

      monthlyRevenue.push({
        month: date.toLocaleDateString("th-TH", { year: "numeric", month: "short" }),
        revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orders: monthOrders.length,
      })
    }

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      topProducts,
      recentOrders,
      monthlyRevenue,
    }
  },

  // Data management
  async clearAllData(): Promise<void> {
    products = []
    customers = []
    orders = []
    console.log("🗑️ [MOCK DB] Cleared all data")
  },

  async seedSampleData(): Promise<void> {
    console.log("🌱 [MOCK DB] Seeding sample data...")

    // Sample products
    const sampleProducts: Omit<Product, "id" | "created_at" | "updated_at">[] = [
      {
        name: "ผ้าคลุมโซฟา 3 ที่นั่ง สีเบจ",
        name_en: "3-Seater Sofa Cover Beige",
        description: "ผ้าคลุมโซฟาคุณภาพสูง ผลิตจากผ้าคอตตอน 100% นุ่มสบาย ทนทาน",
        description_en: "High-quality sofa cover made from 100% cotton, soft and durable",
        price: 1290,
        images: ["/placeholder.svg?height=400&width=600&text=Beige+Sofa+Cover"],
        category: "covers",
        specifications: {
          material: "ผ้าคอตตอน 100%",
          dimensions: "190-230 ซม.",
          colors: ["เบจ", "ครีม", "น้ำตาล"],
          care_instructions: "ซักเครื่องน้ำเย็น ไม่ควรใช้น้ำยาฟอกขาว",
        },
        stock: 25,
        status: "active",
        sold_count: 45,
        rating: 4.5,
        reviews_count: 23,
      },
      {
        name: "ผ้าคลุมโซฟา 2 ที่นั่ง ลายดอกไม้",
        name_en: "2-Seater Sofa Cover Floral Pattern",
        description: "ผ้าคลุมโซฟาลายดอกไม้สวยงาม เหมาะสำหรับตั้งแต่งบ้าน",
        description_en: "Beautiful floral pattern sofa cover perfect for home decoration",
        price: 990,
        images: ["/placeholder.svg?height=400&width=600&text=Floral+Sofa+Cover"],
        category: "covers",
        specifications: {
          material: "ผ้าโพลีเอสเตอร์",
          dimensions: "145-185 ซม.",
          colors: ["ชมพู", "ฟ้า", "เขียว"],
          care_instructions: "ซักเครื่องน้ำอุ่น อบแห้งได้",
        },
        stock: 18,
        status: "active",
        sold_count: 32,
        rating: 4.2,
        reviews_count: 18,
      },
      {
        name: "เบาะรองนั่งโซฟา กันลื่น",
        name_en: "Non-Slip Sofa Cushion Pad",
        description: "เบาะรองนั่งกันลื่น ช่วยให้ผ้าคลุมโซฟาไม่เลื่อนหลุด",
        description_en: "Non-slip cushion pad to keep sofa covers in place",
        price: 290,
        images: ["/placeholder.svg?height=400&width=600&text=Cushion+Pad"],
        category: "accessories",
        specifications: {
          material: "ยางธรรมชาติ",
          dimensions: "60x60 ซม.",
          colors: ["ใส"],
          care_instructions: "เช็ดทำความสะอาดด้วยผ้าชื้น",
        },
        stock: 50,
        status: "active",
        sold_count: 78,
        rating: 4.8,
        reviews_count: 41,
      },
    ]

    for (const productData of sampleProducts) {
      await this.createProduct(productData)
    }

    // Sample customers
    const sampleCustomers: Omit<Customer, "id" | "created_at" | "updated_at">[] = []
    for (let i = 0; i < developmentConfig.sampleData.customers.count; i++) {
      sampleCustomers.push({
        name: devUtils.generateRandomData.randomThaiName(),
        email: devUtils.generateRandomData.randomEmail(),
        phone: devUtils.generateRandomData.randomPhone(),
        address: devUtils.generateRandomData.randomAddress(),
        total_orders: 0,
        total_spent: 0,
        status: "active",
      })
    }

    for (const customerData of sampleCustomers) {
      await this.createCustomer(customerData)
    }

    // Sample orders
    const statuses: (keyof typeof developmentConfig.sampleData.orders.statusDistribution)[] = [
      "pending",
      "production",
      "shipped",
      "completed",
      "cancelled",
    ]

    for (let i = 0; i < developmentConfig.sampleData.orders.count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      const itemTotal = product.price * quantity
      const shipping = 100
      const tax = Math.floor(itemTotal * 0.07)
      const total = itemTotal + shipping + tax

      // Select status based on distribution
      let selectedStatus = "pending"
      const rand = Math.random()
      let cumulative = 0
      for (const status of statuses) {
        cumulative += developmentConfig.sampleData.orders.statusDistribution[status]
        if (rand <= cumulative) {
          selectedStatus = status
          break
        }
      }

      await this.createOrder({
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            price: product.price,
            total: itemTotal,
          },
        ],
        subtotal: itemTotal,
        shipping,
        tax,
        total,
        status: selectedStatus as Order["status"],
        shipping_address: customer.address,
        notes: Math.random() > 0.7 ? "หมายเหตุพิเศษจากลูกค้า" : undefined,
      })
    }

    console.log("✅ [MOCK DB] Sample data seeded successfully")
    console.log(`📦 Products: ${products.length}`)
    console.log(`👤 Customers: ${customers.length}`)
    console.log(`🛒 Orders: ${orders.length}`)
  },

  // Initialize with sample data if auto-seed is enabled
  async initialize(): Promise<void> {
    if (developmentConfig.services.database.autoSeed && products.length === 0) {
      await this.seedSampleData()
    }
  },
}

// Auto-initialize
if (developmentConfig.services.database.useMock) {
  mockDatabaseService.initialize().catch(console.error)
}
