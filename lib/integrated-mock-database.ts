import { type Order, OrderStatus, OrderChannel } from "./mock-orders"
import type { Product } from "./mock-products"

// Unified Customer interface
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive"
  registeredAt: Date
  lastOrderAt?: Date
  notes?: string
  preferredChannel: OrderChannel
}

// Fabric Collection and Pattern interfaces
export interface FabricCollection {
  id: string
  name: string
  slug: string
  description: string
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
  fabricCount: number
}

export interface FabricPattern {
  id: string
  name: string
  collectionId: string
  collectionName: string
  imageUrl: string
  description: string
  price: number
  sku: string
  isVisible: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Bill interface
export interface Bill {
  id: string
  orderId?: string
  customerId: string
  customerName: string
  customerPhone: string
  items: BillItem[]
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue"
  createdAt: Date
  dueDate: Date
  paidAt?: Date
  notes?: string
  paymentMethod?: string
}

export interface BillItem {
  id: string
  productName: string
  fabricPattern: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Analytics interface
export interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  averageOrderValue: number
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    id: string
    name: string
    soldCount: number
    revenue: number
  }>
  recentOrders: Order[]
  ordersByStatus: Record<OrderStatus, number>
  ordersByChannel: Record<OrderChannel, number>
}

// Comprehensive Mock Database Service
class IntegratedMockDatabase {
  private customers: Customer[] = []
  private orders: Order[] = []
  private products: Product[] = []
  private fabricCollections: FabricCollection[] = []
  private fabricPatterns: FabricPattern[] = []
  private bills: Bill[] = []
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    await this.seedSampleData()
    this.initialized = true
    console.log("🗄️ [INTEGRATED DB] Database initialized with sample data")
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    await this.initialize()
    return [...this.customers].sort((a, b) => b.lastOrderAt?.getTime() || 0 - (a.lastOrderAt?.getTime() || 0))
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await this.initialize()
    return this.customers.find((c) => c.id === id) || null
  }

  async createCustomer(
    customerData: Omit<Customer, "id" | "registeredAt" | "totalOrders" | "totalSpent">,
  ): Promise<Customer> {
    const customer: Customer = {
      ...customerData,
      id: `CUST-${String(this.customers.length + 1).padStart(3, "0")}`,
      registeredAt: new Date(),
      totalOrders: 0,
      totalSpent: 0,
    }
    this.customers.push(customer)
    return customer
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const index = this.customers.findIndex((c) => c.id === id)
    if (index === -1) return null

    this.customers[index] = { ...this.customers[index], ...updates }
    return this.customers[index]
  }

  // Order operations
  async getOrders(filters?: {
    status?: OrderStatus
    channel?: OrderChannel
    customerId?: string
    dateFrom?: Date
    dateTo?: Date
    search?: string
  }): Promise<Order[]> {
    await this.initialize()
    let filteredOrders = [...this.orders]

    if (filters?.status) {
      filteredOrders = filteredOrders.filter((order) => order.status === filters.status)
    }
    if (filters?.channel) {
      filteredOrders = filteredOrders.filter((order) => order.channel === filters.channel)
    }
    if (filters?.customerId) {
      filteredOrders = filteredOrders.filter((order) => order.customerId === filters.customerId)
    }
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm) ||
          order.customerPhone.includes(searchTerm) ||
          order.id.toLowerCase().includes(searchTerm),
      )
    }
    if (filters?.dateFrom) {
      filteredOrders = filteredOrders.filter((order) => order.createdAt >= filters.dateFrom!)
    }
    if (filters?.dateTo) {
      filteredOrders = filteredOrders.filter((order) => order.createdAt <= filters.dateTo!)
    }

    return filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getOrderById(id: string): Promise<Order | null> {
    await this.initialize()
    return this.orders.find((order) => order.id === id) || null
  }

  async createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "timeline">): Promise<Order> {
    const order: Order = {
      ...orderData,
      id: `ORD-${String(this.orders.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      timeline: [
        {
          id: `TL-${Date.now()}`,
          status: orderData.status,
          timestamp: new Date(),
          notes: "สร้างออร์เดอร์",
          updatedBy: "system",
        },
      ],
    }

    this.orders.push(order)
    await this.updateCustomerStats(order.customerId, order.totalAmount)
    return order
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId)
    if (!order) return null

    order.status = status
    order.updatedAt = new Date()
    order.timeline.push({
      id: `TL-${Date.now()}`,
      status,
      timestamp: new Date(),
      notes,
      updatedBy: "admin",
    })

    return order
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    await this.initialize()
    return [...this.products]
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.initialize()
    return this.products.find((p) => p.id === id) || null
  }

  // Fabric operations
  async getFabricCollections(): Promise<FabricCollection[]> {
    await this.initialize()
    return [...this.fabricCollections]
  }

  async getFabricPatterns(collectionId?: string): Promise<FabricPattern[]> {
    await this.initialize()
    if (collectionId) {
      return this.fabricPatterns.filter((p) => p.collectionId === collectionId)
    }
    return [...this.fabricPatterns]
  }

  async createFabricCollection(
    data: Omit<FabricCollection, "id" | "createdAt" | "updatedAt" | "fabricCount">,
  ): Promise<FabricCollection> {
    const collection: FabricCollection = {
      ...data,
      id: `COL-${String(this.fabricCollections.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      fabricCount: 0,
    }
    this.fabricCollections.push(collection)
    return collection
  }

  async createFabricPattern(
    data: Omit<FabricPattern, "id" | "createdAt" | "updatedAt" | "collectionName">,
  ): Promise<FabricPattern> {
    const collection = this.fabricCollections.find((c) => c.id === data.collectionId)
    const pattern: FabricPattern = {
      ...data,
      id: `FAB-${String(this.fabricPatterns.length + 1).padStart(3, "0")}`,
      collectionName: collection?.name || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.fabricPatterns.push(pattern)

    // Update collection fabric count
    if (collection) {
      collection.fabricCount++
    }

    return pattern
  }

  // Bill operations
  async getBills(): Promise<Bill[]> {
    await this.initialize()
    return [...this.bills].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getBillById(id: string): Promise<Bill | null> {
    await this.initialize()
    return this.bills.find((b) => b.id === id) || null
  }

  async createBill(billData: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    const bill: Bill = {
      ...billData,
      id: `BILL-${String(this.bills.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
    }
    this.bills.push(bill)
    return bill
  }

  async updateBillStatus(id: string, status: Bill["status"], paidAt?: Date): Promise<Bill | null> {
    const bill = this.bills.find((b) => b.id === id)
    if (!bill) return null

    bill.status = status
    if (paidAt) bill.paidAt = paidAt
    return bill
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    await this.initialize()

    const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalOrders = this.orders.length
    const totalCustomers = this.customers.length
    const totalProducts = this.products.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Monthly revenue calculation
    const monthlyRevenue = this.calculateMonthlyRevenue()

    // Top products
    const productSales = new Map<string, { name: string; soldCount: number; revenue: number }>()
    this.orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.productName) || { name: item.productName, soldCount: 0, revenue: 0 }
        existing.soldCount += item.quantity
        existing.revenue += item.totalPrice
        productSales.set(item.productName, existing)
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Recent orders
    const recentOrders = this.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)

    // Orders by status
    const ordersByStatus = Object.values(OrderStatus).reduce(
      (acc, status) => {
        acc[status] = this.orders.filter((order) => order.status === status).length
        return acc
      },
      {} as Record<OrderStatus, number>,
    )

    // Orders by channel
    const ordersByChannel = Object.values(OrderChannel).reduce(
      (acc, channel) => {
        acc[channel] = this.orders.filter((order) => order.channel === channel).length
        return acc
      },
      {} as Record<OrderChannel, number>,
    )

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      monthlyRevenue,
      topProducts,
      recentOrders,
      ordersByStatus,
      ordersByChannel,
    }
  }

  // Helper methods
  private async updateCustomerStats(customerId: string, orderAmount: number): Promise<void> {
    const customer = this.customers.find((c) => c.id === customerId)
    if (customer) {
      customer.totalOrders++
      customer.totalSpent += orderAmount
      customer.lastOrderAt = new Date()
    }
  }

  private calculateMonthlyRevenue(): Array<{ month: string; revenue: number; orders: number }> {
    const monthlyData = new Map<string, { revenue: number; orders: number }>()

    this.orders.forEach((order) => {
      const monthKey = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
      const existing = monthlyData.get(monthKey) || { revenue: 0, orders: 0 }
      existing.revenue += order.totalAmount
      existing.orders++
      monthlyData.set(monthKey, existing)
    })

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Seed sample data
  private async seedSampleData(): Promise<void> {
    // Sample customers
    this.customers = [
      {
        id: "CUST-001",
        name: "สมชาย ใจดี",
        email: "somchai@email.com",
        phone: "081-234-5678",
        address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        totalOrders: 3,
        totalSpent: 7890,
        status: "active",
        registeredAt: new Date("2024-01-01"),
        lastOrderAt: new Date("2024-01-15"),
        preferredChannel: OrderChannel.WEBSITE,
        notes: "ลูกค้าประจำ ชอบสินค้าคุณภาพดี",
      },
      {
        id: "CUST-002",
        name: "สมหญิง รักสวย",
        email: "somying@email.com",
        phone: "082-345-6789",
        address: "456 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
        totalOrders: 2,
        totalSpent: 5350,
        status: "active",
        registeredAt: new Date("2024-01-05"),
        lastOrderAt: new Date("2024-01-14"),
        preferredChannel: OrderChannel.FACEBOOK,
      },
      {
        id: "CUST-003",
        name: "สมศักดิ์ มีเงิน",
        email: "somsak@email.com",
        phone: "083-456-7890",
        address: "789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
        totalOrders: 1,
        totalSpent: 4200,
        status: "active",
        registeredAt: new Date("2024-01-10"),
        lastOrderAt: new Date("2024-01-23"),
        preferredChannel: OrderChannel.LINE,
      },
    ]

    // Sample fabric collections
    this.fabricCollections = [
      {
        id: "COL-001",
        name: "คอลเลกชั่นพรีเมียม",
        slug: "premium-collection",
        description: "ผ้าคุณภาพสูงสำหรับลูกค้าพิเศษ",
        isVisible: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        fabricCount: 3,
      },
      {
        id: "COL-002",
        name: "คอลเลกชั่นคลาสสิก",
        slug: "classic-collection",
        description: "ลายผ้าคลาสสิกที่เป็นที่นิยม",
        isVisible: true,
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-20"),
        fabricCount: 2,
      },
    ]

    // Sample fabric patterns
    this.fabricPatterns = [
      {
        id: "FAB-001",
        name: "ลายดอกไม้สีฟ้า",
        collectionId: "COL-001",
        collectionName: "คอลเลกชั่นพรีเมียม",
        imageUrl: "/blue-floral-fabric.png",
        description: "ลายดอกไม้สีฟ้าอ่อน เหมาะสำหรับห้องนั่งเล่น",
        price: 2500,
        sku: "PREM-001",
        isVisible: true,
        tags: ["ดอกไม้", "สีฟ้า", "พรีเมียม"],
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "FAB-002",
        name: "ลายทางสีเทา",
        collectionId: "COL-002",
        collectionName: "คอลเลกชั่นคลาสสิก",
        imageUrl: "/gray-stripe-fabric.png",
        description: "ลายทางสีเทาสไตล์โมเดิร์น",
        price: 1800,
        sku: "CLAS-001",
        isVisible: true,
        tags: ["ทาง", "สีเทา", "โมเดิร์น"],
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-18"),
      },
    ]

    // Sample orders (using existing mock orders structure)
    this.orders = [
      {
        id: "ORD-001",
        customerId: "CUST-001",
        customerName: "สมชาย ใจดี",
        customerPhone: "081-234-5678",
        customerAddress: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        items: [
          {
            id: "ITEM-001",
            productId: "PROD-001",
            productName: "ผ้าคลุมโซฟา 3 ที่นั่ง",
            fabricPattern: "ลายดอกไม้สีฟ้า",
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500,
            customizations: "เพิ่มกระเป๋าข้าง",
          },
        ],
        totalAmount: 2500,
        status: OrderStatus.PAID,
        channel: OrderChannel.WEBSITE,
        notes: "ลูกค้าต้องการรับเร็ว",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-16"),
        shippingInfo: {
          provider: "Kerry Express",
          shippingCost: 50,
          estimatedDelivery: new Date("2024-01-20"),
        },
        timeline: [
          {
            id: "TL-001",
            status: OrderStatus.PENDING,
            timestamp: new Date("2024-01-15T10:00:00"),
            notes: "รับออร์เดอร์",
            updatedBy: "admin",
          },
          {
            id: "TL-002",
            status: OrderStatus.PAID,
            timestamp: new Date("2024-01-16T14:30:00"),
            notes: "ลูกค้าโอนเงินแล้ว",
            updatedBy: "admin",
          },
        ],
      },
      {
        id: "ORD-002",
        customerId: "CUST-002",
        customerName: "สมหญิง รักสวย",
        customerPhone: "082-345-6789",
        customerAddress: "456 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
        items: [
          {
            id: "ITEM-002",
            productId: "PROD-002",
            productName: "ผ้าคลุมโซฟา L-Shape",
            fabricPattern: "ลายทางสีเทา",
            quantity: 1,
            unitPrice: 3500,
            totalPrice: 3500,
          },
        ],
        totalAmount: 3500,
        status: OrderStatus.IN_PRODUCTION,
        channel: OrderChannel.FACEBOOK,
        notes: "",
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-17"),
        timeline: [
          {
            id: "TL-003",
            status: OrderStatus.PENDING,
            timestamp: new Date("2024-01-14T09:15:00"),
            notes: "รับออร์เดอร์จาก Facebook",
            updatedBy: "admin",
          },
          {
            id: "TL-004",
            status: OrderStatus.PAID,
            timestamp: new Date("2024-01-15T11:00:00"),
            notes: "ชำระผ่านพร้อมเพย์",
            updatedBy: "admin",
          },
          {
            id: "TL-005",
            status: OrderStatus.IN_PRODUCTION,
            timestamp: new Date("2024-01-17T08:00:00"),
            notes: "เริ่มตัดผ้า",
            updatedBy: "production",
          },
        ],
      },
    ]

    // Sample bills
    this.bills = [
      {
        id: "BILL-001",
        orderId: "ORD-001",
        customerId: "CUST-001",
        customerName: "สมชาย ใจดี",
        customerPhone: "081-234-5678",
        items: [
          {
            id: "1",
            productName: "ผ้าคลุมโซฟา 3 ที่นั่ง",
            fabricPattern: "ลายดอกไม้สีฟ้า",
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500,
          },
        ],
        totalAmount: 2500,
        status: "paid",
        createdAt: new Date("2024-01-15"),
        dueDate: new Date("2024-01-22"),
        paidAt: new Date("2024-01-16"),
        paymentMethod: "bank_transfer",
      },
    ]

    console.log("🌱 [INTEGRATED DB] Sample data seeded successfully")
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    this.customers = []
    this.orders = []
    this.products = []
    this.fabricCollections = []
    this.fabricPatterns = []
    this.bills = []
    this.initialized = false
    console.log("🗑️ [INTEGRATED DB] All data cleared")
  }
}

// Export singleton instance
export const integratedMockDatabase = new IntegratedMockDatabase()

// Export convenience functions
export const getCustomers = () => integratedMockDatabase.getCustomers()
export const getCustomerById = (id: string) => integratedMockDatabase.getCustomerById(id)
export const createCustomer = (data: Omit<Customer, "id" | "registeredAt" | "totalOrders" | "totalSpent">) =>
  integratedMockDatabase.createCustomer(data)

export const getOrders = (filters?: Parameters<typeof integratedMockDatabase.getOrders>[0]) =>
  integratedMockDatabase.getOrders(filters)
export const getOrderById = (id: string) => integratedMockDatabase.getOrderById(id)
export const createOrder = (data: Parameters<typeof integratedMockDatabase.createOrder>[0]) =>
  integratedMockDatabase.createOrder(data)
export const updateOrderStatus = (orderId: string, status: OrderStatus, notes?: string) =>
  integratedMockDatabase.updateOrderStatus(orderId, status, notes)

export const getFabricCollections = () => integratedMockDatabase.getFabricCollections()
export const getFabricPatterns = (collectionId?: string) => integratedMockDatabase.getFabricPatterns(collectionId)
export const createFabricCollection = (data: Parameters<typeof integratedMockDatabase.createFabricCollection>[0]) =>
  integratedMockDatabase.createFabricCollection(data)
export const createFabricPattern = (data: Parameters<typeof integratedMockDatabase.createFabricPattern>[0]) =>
  integratedMockDatabase.createFabricPattern(data)

export const getBills = () => integratedMockDatabase.getBills()
export const getBillById = (id: string) => integratedMockDatabase.getBillById(id)
export const createBill = (data: Parameters<typeof integratedMockDatabase.createBill>[0]) =>
  integratedMockDatabase.createBill(data)

export const getAnalytics = () => integratedMockDatabase.getAnalytics()
