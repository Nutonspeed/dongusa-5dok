import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type { Product, Fabric, Order, Profile } from "@/types/entities"

export class ClientDatabaseService {
  private supabase = createClient()

  // Products
  async getProducts(filters?: { category?: string; active?: boolean }) {
    let query = this.supabase.from<Product>("products").select(`
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

    return { data: data || [], error }
  }

  async getProduct(id: string) {
    const { data, error } = await this.supabase
      .from<Product>("products")
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

    return { data, error }
  }

  // Categories
  async getCategories() {
    const { data, error } = await this.supabase.from("categories").select("*").eq("is_active", true).order("name")

    return { data: data || [], error }
  }

  // Fabric Collections
  async getFabricCollections(featured?: boolean) {
    let query = this.supabase.from("fabric_collections").select("*").eq("is_active", true)

    if (featured) {
      query = query.eq("is_featured", true)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    return { data: data || [], error }
  }

  async getFabricsByCollection(collectionId: string) {
    const { data, error } = await this.supabase
      .from<Fabric>("fabrics")
      .select("*")
      .eq("collection_id", collectionId)
      .eq("is_active", true)
      .order("name")

    return { data: data || [], error }
  }

  // Orders (for authenticated users)
  async getOrders(userId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from<Order>("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            images
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    return { data: data || [], error }
  }

  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await this.supabase.from<Profile>("profiles").select("*").eq("id", userId).single()

    return { data, error }
  }

  async updateProfile(userId: string, updates: Database["public"]["Tables"]["profiles"]["Update"]) {
    const { data, error } = await this.supabase
      .from<Profile>("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    return { data, error }
  }
}

export const clientDb = new ClientDatabaseService()
