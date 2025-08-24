import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { supabase } from "@/lib/supabase/client"
import type { Product, Order, Profile, Fabric } from "@/types/entities"

export class DatabaseService {
  constructor(private client: SupabaseClient<Database> = supabase) {}
  private getClient() {
    return this.client
  }

  // Products
  async getProducts(filters?: { category?: string; active?: boolean }) {
    const supabase = this.getClient()
    let query = supabase.from("products").select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)

    if (filters?.category) {
      query = query.eq("category_id", filters.category)
    }

    if (filters?.active !== undefined) {
      query = query.eq("is_active", filters.active)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getProduct(id: string) {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  }

  // Fabric Collections
  async getFabricCollections(featured?: boolean) {
    const supabase = this.getClient()
    let query = supabase.from("fabric_collections").select("*").eq("is_active", true)

    if (featured) {
      query = query.eq("is_featured", true)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getFabricsByCollection(collectionId: string) {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("fabrics")
      .select("*")
      .eq("collection_id", collectionId)
      .eq("is_active", true)
      .order("name")

    if (error) throw error
    return data || []
  }

  // Orders
  async createOrder(orderData: Database["public"]["Tables"]["orders"]["Insert"]) {
    const supabase = this.getClient()
  // Cast to any to work around strict generated Supabase types during build-time checks.
  const { data, error } = await supabase.from("orders").insert(orderData as any).select().single()

    if (error) throw error
    return data
  }

  async getOrders(userId?: string, limit = 50) {
    const supabase = this.getClient()
    let query = supabase.from("orders").select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            images
          )
        ),
        profiles (
          id,
          full_name,
          email
        )
      `)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)

    if (error) throw error
    return data || []
  }

  async updateOrderStatus(orderId: string, status: Database["public"]["Tables"]["orders"]["Row"]["status"]) {
    const supabase = this.getClient()
    // Cast the query helper to any to bypass strict generated Supabase typings during build.
    const { data, error } = await (supabase as any)
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Profiles
  async getProfile(userId: string) {
    const supabase = this.getClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  }

  async updateProfile(userId: string, updates: Database["public"]["Tables"]["profiles"]["Update"]) {
    const supabase = this.getClient()
    // Cast the query helper to any to bypass strict generated Supabase typings during build.
    const { data, error } = await (supabase as any)
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Analytics
  async getAnalytics() {
    const supabase = this.getClient()

    const [ordersResult, profilesResult, revenueResult] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact" }),
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("role", "customer"),
      supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
    ])

  // revenueResult is typed from generated types; cast to any[] for build-time computation.
  const totalRevenue = (revenueResult.data as any[] | undefined)?.reduce((sum, order: any) => sum + (order.total_amount || 0), 0) || 0

    return {
      totalOrders: ordersResult.count || 0,
      totalCustomers: profilesResult.count || 0,
      totalRevenue,
      recentOrders: await this.getOrders(undefined, 10),
    }
  }
}

export const db = new DatabaseService()
