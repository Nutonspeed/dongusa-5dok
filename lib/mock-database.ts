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

// Mock database service for development and build compatibility
export interface MockProduct {
  id: string
  name: string
  name_en: string
  description: string
  category: string
  price: number
  stock: number
  status: string
  created_at: string
}

export interface MockCustomer {
  id: string
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  status: string
  created_at: string
}

export interface MockOrder {
  id: string
  customer_id: string
  total: number
  status: string
  created_at: string
}

export interface MockAnalytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  monthlyGrowth: number
}

class MockDatabaseService {
  private products: MockProduct[] = []
  private customers: MockCustomer[] = []
  private orders: MockOrder[] = []

  async getProducts(): Promise<MockProduct[]> {
    if (this.products.length === 0) {
      this.products = [
        {
          id: "1",
          name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
          name_en: "Premium Velvet Sofa Cover",
          description: "ผ้าคลุมโซฟาคุณภาพสูง",
          category: "covers",
          price: 2890,
          stock: 25,
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "หมอนอิงลายเดียวกัน",
          name_en: "Matching Throw Pillows",
          description: "หมอนอิงที่เข้าชุดกับผ้าคลุมโซฟา",
          category: "accessories",
          price: 350,
          stock: 5,
          status: "low_stock",
          created_at: new Date().toISOString(),
        },
      ]
    }
    return this.products
  }

  async getCustomers(): Promise<MockCustomer[]> {
    if (this.customers.length === 0) {
      this.customers = [
        {
          id: "1",
          name: "คุณสมชาย ใจดี",
          email: "somchai@email.com",
          phone: "081-234-5678",
          total_orders: 5,
          total_spent: 12450,
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "คุณสมหญิง รักสวย",
          email: "somying@email.com",
          phone: "082-345-6789",
          total_orders: 3,
          total_spent: 5670,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]
    }
    return this.customers
  }

  async getOrders(): Promise<MockOrder[]> {
    if (this.orders.length === 0) {
      this.orders = [
        {
          id: "ORD-001",
          customer_id: "1",
          total: 2890,
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "ORD-002",
          customer_id: "2",
          total: 1950,
          status: "completed",
          created_at: new Date().toISOString(),
        },
      ]
    }
    return this.orders
  }

  async getAnalytics(): Promise<MockAnalytics> {
    const orders = await this.getOrders()
    const customers = await this.getCustomers()

    return {
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalOrders: orders.length,
      totalCustomers: customers.length,
      monthlyGrowth: 12.5,
    }
  }

  async clearAllData(): Promise<void> {
    this.products = []
    this.customers = []
    this.orders = []
  }

  async seedSampleData(): Promise<void> {
    // Reset and populate with sample data
    await this.clearAllData()
    await this.getProducts()
    await this.getCustomers()
    await this.getOrders()
  }
}

export const mockDatabaseService = new MockDatabaseService()
