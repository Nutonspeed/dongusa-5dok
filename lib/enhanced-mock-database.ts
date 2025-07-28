import { developmentConfig, devUtils } from "./development-config"

// Enhanced Types with validation
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

// Enhanced validation schemas
const productSchema = {
  name: { required: true, type: "string", minLength: 1 },
  name_en: { required: true, type: "string", minLength: 1 },
  description: { required: true, type: "string", minLength: 10 },
  description_en: { required: true, type: "string", minLength: 10 },
  price: { required: true, type: "number", min: 0 },
  images: { required: true, type: "array", minLength: 1 },
  category: { required: true, type: "string", enum: ["covers", "accessories"] },
  stock: { required: true, type: "number", min: 0 },
  status: { required: true, type: "string", enum: ["active", "inactive", "out_of_stock"] },
}

const customerSchema = {
  name: { required: true, type: "string", minLength: 2 },
  email: { required: true, type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { required: true, type: "string", minLength: 10 },
  address: { required: true, type: "string", minLength: 10 },
}

// Enhanced in-memory storage with indexing
class EnhancedDataStore<T extends { id: string; created_at: string; updated_at: string }> {
  private data: Map<string, T> = new Map()
  private indexes: Map<string, Map<any, Set<string>>> = new Map()
  private changeLog: Array<{ action: string; id: string; timestamp: string; data?: Partial<T> }> = []

  constructor(
    private name: string,
    private schema?: any,
  ) {}

  // Validation
  private validate(data: Partial<T>): { valid: boolean; errors: string[] } {
    if (!this.schema) return { valid: true, errors: [] }

    const errors: string[] = []

    for (const [field, rules] of Object.entries(this.schema)) {
      const value = (data as any)[field]

      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`)
        continue
      }

      if (value !== undefined && value !== null) {
        if (rules.type === "string" && typeof value !== "string") {
          errors.push(`${field} must be a string`)
        }

        if (rules.type === "number" && typeof value !== "number") {
          errors.push(`${field} must be a number`)
        }

        if (rules.type === "array" && !Array.isArray(value)) {
          errors.push(`${field} must be an array`)
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters/items`)
        }

        if (rules.min && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`)
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(", ")}`)
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // CRUD operations with validation
  async create(data: Omit<T, "id" | "created_at" | "updated_at">): Promise<T> {
    const validation = this.validate(data)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
    }

    const id = this.generateId()
    const now = new Date().toISOString()
    const item: T = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    } as T

    this.data.set(id, item)
    this.updateIndexes(item)
    this.logChange("CREATE", id, item)

    console.log(`📝 [${this.name.toUpperCase()}] Created:`, id)
    return item
  }

  async findById(id: string): Promise<T | null> {
    return this.data.get(id) || null
  }

  async findAll(filters?: Record<string, any>): Promise<T[]> {
    let results = Array.from(this.data.values())

    if (filters) {
      results = results.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null) return true
          return (item as any)[key] === value
        })
      })
    }

    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.data.get(id)
    if (!existing) return null

    const validation = this.validate(updates)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
    }

    const updated: T = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    this.data.set(id, updated)
    this.updateIndexes(updated)
    this.logChange("UPDATE", id, updates)

    console.log(`📝 [${this.name.toUpperCase()}] Updated:`, id)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const item = this.data.get(id)
    if (!item) return false

    this.data.delete(id)
    this.removeFromIndexes(item)
    this.logChange("DELETE", id)

    console.log(`📝 [${this.name.toUpperCase()}] Deleted:`, id)
    return true
  }

  async clear(): Promise<void> {
    this.data.clear()
    this.indexes.clear()
    this.changeLog = []
    console.log(`🗑️ [${this.name.toUpperCase()}] Cleared all data`)
  }

  // Indexing for performance
  private updateIndexes(item: T): void {
    // Implementation would depend on specific indexing needs
  }

  private removeFromIndexes(item: T): void {
    // Implementation would depend on specific indexing needs
  }

  // Utilities
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private logChange(action: string, id: string, data?: Partial<T>): void {
    this.changeLog.push({
      action,
      id,
      timestamp: new Date().toISOString(),
      data,
    })

    // Keep only last 1000 changes
    if (this.changeLog.length > 1000) {
      this.changeLog = this.changeLog.slice(-1000)
    }
  }

  // Analytics and monitoring
  getStats() {
    return {
      totalRecords: this.data.size,
      totalChanges: this.changeLog.length,
      recentChanges: this.changeLog.slice(-10),
    }
  }

  // Testing utilities
  async seed(items: Array<Omit<T, "id" | "created_at" | "updated_at">>): Promise<T[]> {
    const results: T[] = []
    for (const item of items) {
      results.push(await this.create(item))
    }
    return results
  }

  // Backup and restore
  export(): { data: T[]; metadata: { exportedAt: string; count: number } } {
    return {
      data: Array.from(this.data.values()),
      metadata: {
        exportedAt: new Date().toISOString(),
        count: this.data.size,
      },
    }
  }

  async import(backup: { data: T[] }): Promise<void> {
    this.clear()
    for (const item of backup.data) {
      this.data.set(item.id, item)
    }
    console.log(`📥 [${this.name.toUpperCase()}] Imported ${backup.data.length} records`)
  }
}

// Enhanced Mock Database Service
export class EnhancedMockDatabaseService {
  private products = new EnhancedDataStore<Product>("products", productSchema)
  private customers = new EnhancedDataStore<Customer>("customers", customerSchema)
  private orders = new EnhancedDataStore<Order>("orders")

  private latencySimulation = true
  private errorSimulation = true
  private transactionLog: Array<{ operation: string; timestamp: string; duration: number }> = []

  constructor() {
    this.initialize()
  }

  // Latency and error simulation
  private async simulateLatency(): Promise<void> {
    if (!this.latencySimulation) return

    const { min, max } = developmentConfig.services.database.latency
    const delay = Math.random() * (max - min) + min
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  private simulateError(): void {
    if (!this.errorSimulation) return

    if (Math.random() < developmentConfig.services.database.errorRate) {
      throw new Error("Simulated database error")
    }
  }

  private logTransaction(operation: string, startTime: number): void {
    this.transactionLog.push({
      operation,
      timestamp: new Date().toISOString(),
      duration: performance.now() - startTime,
    })

    // Keep only last 1000 transactions
    if (this.transactionLog.length > 1000) {
      this.transactionLog = this.transactionLog.slice(-1000)
    }
  }

  // Product operations
  async getProducts(filters?: { category?: string; status?: string; search?: string }): Promise<Product[]> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    let products = await this.products.findAll()

    if (filters?.category) {
      products = products.filter((p) => p.category === filters.category)
    }

    if (filters?.status) {
      products = products.filter((p) => p.status === filters.status)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.name_en.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower),
      )
    }

    this.logTransaction("getProducts", startTime)
    return products
  }

  async getProduct(id: string): Promise<Product | null> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const product = await this.products.findById(id)
    this.logTransaction("getProduct", startTime)
    return product
  }

  async createProduct(productData: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const product = await this.products.create(productData)
    this.logTransaction("createProduct", startTime)
    return product
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const product = await this.products.update(id, updates)
    this.logTransaction("updateProduct", startTime)
    return product
  }

  async deleteProduct(id: string): Promise<boolean> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const result = await this.products.delete(id)
    this.logTransaction("deleteProduct", startTime)
    return result
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const customers = await this.customers.findAll()
    this.logTransaction("getCustomers", startTime)
    return customers
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const customer = await this.customers.findById(id)
    this.logTransaction("getCustomer", startTime)
    return customer
  }

  async createCustomer(customerData: Omit<Customer, "id" | "created_at" | "updated_at">): Promise<Customer> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const customer = await this.customers.create(customerData)
    this.logTransaction("createCustomer", startTime)
    return customer
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const customer = await this.customers.update(id, updates)
    this.logTransaction("updateCustomer", startTime)
    return customer
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const orders = await this.orders.findAll()
    this.logTransaction("getOrders", startTime)
    return orders
  }

  async getOrder(id: string): Promise<Order | null> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const order = await this.orders.findById(id)
    this.logTransaction("getOrder", startTime)
    return order
  }

  async createOrder(orderData: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const order = await this.orders.create(orderData)

    // Update customer stats
    const customer = await this.customers.findById(order.customer_id)
    if (customer) {
      await this.customers.update(customer.id, {
        total_orders: customer.total_orders + 1,
        total_spent: customer.total_spent + order.total,
      })
    }

    // Update product sold count
    for (const item of order.items) {
      const product = await this.products.findById(item.product_id)
      if (product) {
        await this.products.update(product.id, {
          sold_count: product.sold_count + item.quantity,
          stock: Math.max(0, product.stock - item.quantity),
        })
      }
    }

    this.logTransaction("createOrder", startTime)
    return order
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const order = await this.orders.update(id, updates)
    this.logTransaction("updateOrder", startTime)
    return order
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const startTime = performance.now()
    await this.simulateLatency()
    this.simulateError()

    const [products, customers, orders] = await Promise.all([
      this.products.findAll(),
      this.customers.findAll(),
      this.orders.findAll(),
    ])

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
    const recentOrders = orders
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

    const analytics = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      topProducts,
      recentOrders,
      monthlyRevenue,
    }

    this.logTransaction("getAnalytics", startTime)
    return analytics
  }

  // Data management
  async clearAllData(): Promise<void> {
    await Promise.all([this.products.clear(), this.customers.clear(), this.orders.clear()])
    this.transactionLog = []
    console.log("🗑️ [ENHANCED MOCK DB] Cleared all data")
  }

  // Enhanced seeding with better data generation
  async seedSampleData(): Promise<void> {
    console.log("🌱 [ENHANCED MOCK DB] Seeding sample data...")

    // Sample products with better variety
    const sampleProducts: Array<Omit<Product, "id" | "created_at" | "updated_at">> = [
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

    await this.products.seed(sampleProducts)

    // Generate customers
    const sampleCustomers: Array<Omit<Customer, "id" | "created_at" | "updated_at">> = []
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

    await this.customers.seed(sampleCustomers)

    // Generate orders
    const products = await this.products.findAll()
    const customers = await this.customers.findAll()
    const statuses: Array<Order["status"]> = ["pending", "production", "shipped", "completed", "cancelled"]

    const sampleOrders: Array<Omit<Order, "id" | "created_at" | "updated_at">> = []
    for (let i = 0; i < developmentConfig.sampleData.orders.count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      const itemTotal = product.price * quantity
      const shipping = 100
      const tax = Math.floor(itemTotal * 0.07)
      const total = itemTotal + shipping + tax

      sampleOrders.push({
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
        status: statuses[Math.floor(Math.random() * statuses.length)],
        shipping_address: customer.address,
        notes: Math.random() > 0.7 ? "หมายเหตุพิเศษจากลูกค้า" : undefined,
      })
    }

    await this.orders.seed(sampleOrders)

    console.log("✅ [ENHANCED MOCK DB] Sample data seeded successfully")
    console.log(`📦 Products: ${(await this.products.findAll()).length}`)
    console.log(`👤 Customers: ${(await this.customers.findAll()).length}`)
    console.log(`🛒 Orders: ${(await this.orders.findAll()).length}`)
  }

  // Testing utilities
  async runHealthCheck(): Promise<{ status: string; details: any }> {
    try {
      const [products, customers, orders] = await Promise.all([
        this.products.findAll(),
        this.customers.findAll(),
        this.orders.findAll(),
      ])

      return {
        status: "healthy",
        details: {
          products: this.products.getStats(),
          customers: this.customers.getStats(),
          orders: this.orders.getStats(),
          transactions: {
            total: this.transactionLog.length,
            recent: this.transactionLog.slice(-5),
          },
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        details: { error: error.message },
      }
    }
  }

  // Feature testing utilities
  async createTestScenario(scenario: string): Promise<void> {
    console.log(`🧪 [TEST SCENARIO] Setting up: ${scenario}`)

    switch (scenario) {
      case "low-stock":
        const products = await this.products.findAll()
        for (const product of products.slice(0, 3)) {
          await this.products.update(product.id, { stock: Math.floor(Math.random() * 5) })
        }
        break

      case "high-demand":
        const popularProducts = await this.products.findAll()
        for (const product of popularProducts.slice(0, 2)) {
          await this.products.update(product.id, {
            sold_count: product.sold_count + 100,
            rating: 4.8 + Math.random() * 0.2,
          })
        }
        break

      case "new-customers":
        for (let i = 0; i < 10; i++) {
          await this.customers.create({
            name: devUtils.generateRandomData.randomThaiName(),
            email: devUtils.generateRandomData.randomEmail(),
            phone: devUtils.generateRandomData.randomPhone(),
            address: devUtils.generateRandomData.randomAddress(),
            total_orders: 0,
            total_spent: 0,
            status: "active",
          })
        }
        break
    }

    console.log(`✅ [TEST SCENARIO] Completed: ${scenario}`)
  }

  // Configuration
  setLatencySimulation(enabled: boolean): void {
    this.latencySimulation = enabled
    console.log(`⚙️ [CONFIG] Latency simulation: ${enabled ? "enabled" : "disabled"}`)
  }

  setErrorSimulation(enabled: boolean): void {
    this.errorSimulation = enabled
    console.log(`⚙️ [CONFIG] Error simulation: ${enabled ? "enabled" : "disabled"}`)
  }

  // Backup and restore
  async exportData(): Promise<any> {
    return {
      products: this.products.export(),
      customers: this.customers.export(),
      orders: this.orders.export(),
      metadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
      },
    }
  }

  async importData(backup: any): Promise<void> {
    await this.products.import(backup.products)
    await this.customers.import(backup.customers)
    await this.orders.import(backup.orders)
    console.log("📥 [ENHANCED MOCK DB] Data imported successfully")
  }

  private async initialize(): Promise<void> {
    if (developmentConfig.services.database.autoSeed) {
      const products = await this.products.findAll()
      if (products.length === 0) {
        await this.seedSampleData()
      }
    }
  }
}

// Export singleton instance
export const enhancedMockDatabaseService = new EnhancedMockDatabaseService()

// Development testing utilities
export const testingUtils = {
  // Reset to clean state
  async resetToCleanState(): Promise<void> {
    await enhancedMockDatabaseService.clearAllData()
    await enhancedMockDatabaseService.seedSampleData()
  },

  // Create test data for specific features
  async setupFeatureTest(feature: string): Promise<void> {
    await enhancedMockDatabaseService.createTestScenario(feature)
  },

  // Validate data integrity
  async validateDataIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []

    try {
      const [products, customers, orders] = await Promise.all([
        enhancedMockDatabaseService.getProducts(),
        enhancedMockDatabaseService.getCustomers(),
        enhancedMockDatabaseService.getOrders(),
      ])

      // Check for orphaned orders
      for (const order of orders) {
        const customer = customers.find((c) => c.id === order.customer_id)
        if (!customer) {
          issues.push(`Order ${order.id} has invalid customer_id: ${order.customer_id}`)
        }

        for (const item of order.items) {
          const product = products.find((p) => p.id === item.product_id)
          if (!product) {
            issues.push(`Order ${order.id} has invalid product_id: ${item.product_id}`)
          }
        }
      }

      // Check for negative stock
      for (const product of products) {
        if (product.stock < 0) {
          issues.push(`Product ${product.id} has negative stock: ${product.stock}`)
        }
      }

      return { valid: issues.length === 0, issues }
    } catch (error) {
      return { valid: false, issues: [`Validation error: ${error.message}`] }
    }
  },

  // Performance testing
  async performanceTest(operations = 1000): Promise<{ averageTime: number; totalTime: number }> {
    const startTime = performance.now()

    for (let i = 0; i < operations; i++) {
      await enhancedMockDatabaseService.getProducts()
    }

    const totalTime = performance.now() - startTime
    const averageTime = totalTime / operations

    console.log(
      `🚀 [PERFORMANCE] ${operations} operations completed in ${totalTime.toFixed(2)}ms (avg: ${averageTime.toFixed(2)}ms)`,
    )

    return { averageTime, totalTime }
  },
}
