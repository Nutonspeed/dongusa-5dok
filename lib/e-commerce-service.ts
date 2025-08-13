import { createClient } from "@/lib/supabase/client"
import { DatabaseService } from "@/lib/database"
import { logger } from "@/lib/logger"

export interface Product {
  id: string
  name: string
  name_en?: string
  description: string
  price: number
  compare_at_price?: number
  images: string[]
  category_id: string
  category?: {
    name: string
    slug: string
  }
  is_featured: boolean
  is_new: boolean
  in_stock: boolean
  stock_quantity: number
  rating: number
  reviews_count: number
  colors?: string[]
  sizes?: ProductSize[]
  type: "fixed" | "custom"
  created_at: string
  updated_at: string
}

export interface ProductSize {
  name: string
  name_en: string
  price: number
  stock_quantity: number
}

export interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
  fabric_pattern?: string
  customizations?: string
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"
  items: CartItem[]
  total_amount: number
  shipping_info: ShippingInfo
  payment_info: PaymentInfo
  created_at: string
  updated_at: string
}

export interface ShippingInfo {
  first_name: string
  last_name: string
  phone: string
  email: string
  address: string
  city: string
  postal_code: string
  province: string
}

export interface PaymentInfo {
  method: "credit-card" | "bank-transfer" | "cod" | "promptpay"
  status: "pending" | "paid" | "failed"
  transaction_id?: string
}

export class ECommerceService {
  private supabase = createClient()
  private db = new DatabaseService(this.supabase)

  // Product Management
  async getProducts(filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    featured?: boolean
    limit?: number
    offset?: number
  }): Promise<{ data: Product[]; count: number }> {
    try {
      let query = this.supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq("in_stock", true)

      if (filters?.category) {
        query = query.eq("category_id", filters.category)
      }

      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice)
      }

      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.featured) {
        query = query.eq("is_featured", true)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      return { data: data || [], count: count || 0 }
    } catch (error) {
      logger.error("Error fetching products:", error)
      return { data: [], count: 0 }
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error("Error fetching product:", error)
      return null
    }
  }

  async getFeaturedProducts(limit = 4): Promise<{ data: Product[] }> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq("is_featured", true)
        .eq("in_stock", true)
        .limit(limit)

      if (error) throw error
      return { data: data || [] }
    } catch (error) {
      logger.error("Error fetching featured products:", error)
      return { data: [] }
    }
  }

  async getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq("category_id", categoryId)
        .neq("id", productId)
        .eq("in_stock", true)
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching related products:", error)
      return []
    }
  }

  // Cart Management
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await this.supabase.from("cart_items").select("*").eq("user_id", userId)

      if (error) throw error

      return (data || []).map((item) => ({
        id: `${item.product_id}-${item.size || ""}-${item.color || ""}`,
        product_id: item.product_id,
        name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url,
        size: item.size,
        color: item.color,
        fabric_pattern: item.fabric_pattern,
        customizations: item.customizations,
      }))
    } catch (error) {
      logger.error("Error fetching cart items:", error)
      return []
    }
  }

  async addToCart(userId: string, item: Omit<CartItem, "id">): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("cart_items").upsert({
        user_id: userId,
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image,
        size: item.size,
        color: item.color,
        fabric_pattern: item.fabric_pattern,
        customizations: item.customizations,
      })

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error adding to cart:", error)
      return false
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId)
      }

      const { error } = await this.supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", userId)
        .eq("product_id", productId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error updating cart item:", error)
      return false
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error removing from cart:", error)
      return false
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("cart_items").delete().eq("user_id", userId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error clearing cart:", error)
      return false
    }
  }

  // Order Management
  async createOrder(
    userId: string,
    orderData: {
      items: CartItem[]
      total_amount: number
      shipping_info: ShippingInfo
      payment_info: PaymentInfo
    },
  ): Promise<string | null> {
    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { error } = await this.supabase.from("orders").insert({
        id: orderId,
        user_id: userId,
        status: "pending",
        items: orderData.items,
        total_amount: orderData.total_amount,
        shipping_info: orderData.shipping_info,
        payment_info: orderData.payment_info,
      })

      if (error) throw error

      // Clear cart after successful order
      await this.clearCart(userId)

      return orderId
    } catch (error) {
      logger.error("Error creating order:", error)
      return null
    }
  }

  async getOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching orders:", error)
      return []
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase.from("orders").select("*").eq("id", orderId).single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error("Error fetching order:", error)
      return null
    }
  }

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error updating order status:", error)
      return false
    }
  }

  // Wishlist Management
  async getWishlist(userId: string): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from("wishlist")
        .select(`
          product:products(
            *,
            category:categories(name, slug)
          )
        `)
        .eq("user_id", userId)

      if (error) throw error
      return (data || []).map((item) => item.product).filter(Boolean)
    } catch (error) {
      logger.error("Error fetching wishlist:", error)
      return []
    }
  }

  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("wishlist").upsert({ user_id: userId, product_id: productId })

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error adding to wishlist:", error)
      return false
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("wishlist").delete().eq("user_id", userId).eq("product_id", productId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error removing from wishlist:", error)
      return false
    }
  }

  // Categories
  async getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
    try {
      const { data, error } = await this.supabase.from("categories").select("id, name, slug").order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching categories:", error)
      return []
    }
  }

  // Search
  async searchProducts(query: string, limit = 10): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("in_stock", true)
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error searching products:", error)
      return []
    }
  }
}

export const ecommerceService = new ECommerceService()
