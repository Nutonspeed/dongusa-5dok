// Database adapter that switches between mock and Supabase
import { createClient as createSupabaseClient, isSupabaseConfigured } from "./supabase/server"
import type { Product, Order } from "@/types/entities"

// Mock database for development
const mockDatabase = {
  products: [
    {
      id: "1",
      name: "Premium Cotton Sofa Cover",
      name_th: "ผ้าคลุมโซฟาฝ้ายพรีเมียม",
      slug: "premium-cotton-sofa-cover",
      description: "Soft and breathable cotton sofa cover",
      base_price: 1299,
      sale_price: 999,
      is_active: true,
      stock_quantity: 50,
      images: ["/placeholder.svg?height=400&width=400"],
      fabric_type: "cotton" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Luxury Velvet Chair Cover",
      name_th: "ผ้าคลุมเก้าอี้กำมะหยี่หรู",
      slug: "luxury-velvet-chair-cover",
      description: "Rich velvet texture chair cover",
      base_price: 899,
      is_active: true,
      stock_quantity: 30,
      images: ["/placeholder.svg?height=400&width=400"],
      fabric_type: "velvet" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  orders: [],
  users: [],
}

export class DatabaseAdapter {
  private supabase: any
  private useMock: boolean

  constructor() {
    this.useMock = !isSupabaseConfigured
    if (!this.useMock) {
      this.supabase = createSupabaseClient()
    }
  }

  async getProducts() {
    if (this.useMock) {
      return { data: mockDatabase.products, error: null }
    }

    return await this.supabase
      .from<Product>("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
  }

  async getProduct(id: string) {
    if (this.useMock) {
      const product = mockDatabase.products.find((p) => p.id === id)
      return { data: product || null, error: product ? null : "Product not found" }
    }

    return await this.supabase.from<Product>("products").select("*").eq("id", id).single()
  }

  async createOrder(orderData: any) {
    if (this.useMock) {
      const newOrder = {
        id: Date.now().toString(),
        order_number: `SC${Date.now()}`,
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockDatabase.orders.push(newOrder)
      return { data: newOrder, error: null }
    }

    return await this.supabase.from<Order>("orders").insert(orderData).select().single()
  }

  async getOrders(userId?: string) {
    if (this.useMock) {
      let orders = mockDatabase.orders
      if (userId) {
        orders = orders.filter((order: any) => order.user_id === userId)
      }
      return { data: orders, error: null }
    }

    let query = this.supabase.from<Order>("orders").select("*")
    if (userId) {
      query = query.eq("user_id", userId)
    }
    return await query.order("created_at", { ascending: false })
  }
}

// Export singleton instance
export const db = new DatabaseAdapter()
