import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface GuestUser {
  id: string
  session_id: string
  email?: string
  full_name?: string
  phone?: string
  shipping_address?: any
  billing_address?: any
  created_at: string
  updated_at: string
  last_activity: string
  status: "active" | "converted" | "expired"
  notes?: string
}

export interface GuestOrder {
  id: string
  guest_user_id: string
  order_number: string
  status: string
  total_amount: number
  items: any[]
  shipping_address: any
  billing_address: any
  payment_status: string
  payment_method?: string
  notes?: string
  created_at: string
}

export interface GuestCartItem {
  id: string
  guest_user_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  size?: string
  color?: string
  fabric_pattern?: string
  customizations?: string
  image_url?: string
}

export class GuestUserManager {
  private supabase = createClient()

  // Generate unique session ID for guest users
  generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create or get guest user by session ID
  async getOrCreateGuestUser(sessionId: string): Promise<GuestUser | null> {
    try {
      // First try to get existing guest user
      const { data: existingUser, error: fetchError } = await this.supabase
        .from("guest_users")
        .select("*")
        .eq("session_id", sessionId)
        .eq("status", "active")
        .single()

      if (existingUser && !fetchError) {
        // Update last activity
        await this.updateLastActivity(existingUser.id)
        return existingUser
      }

      // Create new guest user
      const { data: newUser, error: createError } = await this.supabase
        .from("guest_users")
        .insert({
          session_id: sessionId,
          status: "active",
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating guest user:", createError)
        return null
      }

      return newUser
    } catch (error) {
      console.error("Error in getOrCreateGuestUser:", error)
      return null
    }
  }

  // Update guest user information
  async updateGuestUser(guestUserId: string, updates: Partial<GuestUser>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("guest_users")
        .update({
          ...updates,
          last_activity: new Date().toISOString(),
        })
        .eq("id", guestUserId)

      return !error
    } catch (error) {
      console.error("Error updating guest user:", error)
      return false
    }
  }

  // Update last activity timestamp
  async updateLastActivity(guestUserId: string): Promise<void> {
    try {
      await this.supabase.from("guest_users").update({ last_activity: new Date().toISOString() }).eq("id", guestUserId)
    } catch (error) {
      console.error("Error updating last activity:", error)
    }
  }

  // Add item to guest cart
  async addToGuestCart(
    guestUserId: string,
    item: Omit<GuestCartItem, "id" | "guest_user_id" | "created_at" | "updated_at">,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("guest_cart_items").insert({
        guest_user_id: guestUserId,
        ...item,
      })

      await this.updateLastActivity(guestUserId)
      return !error
    } catch (error) {
      console.error("Error adding to guest cart:", error)
      return false
    }
  }

  // Get guest cart items
  async getGuestCart(guestUserId: string): Promise<GuestCartItem[]> {
    try {
      const { data, error } = await this.supabase
        .from("guest_cart_items")
        .select("*")
        .eq("guest_user_id", guestUserId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching guest cart:", error)
        return []
      }

      await this.updateLastActivity(guestUserId)
      return data || []
    } catch (error) {
      console.error("Error in getGuestCart:", error)
      return []
    }
  }

  // Create guest order
  async createGuestOrder(
    guestUserId: string,
    orderData: Omit<GuestOrder, "id" | "guest_user_id" | "created_at" | "updated_at">,
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("guest_orders")
        .insert({
          guest_user_id: guestUserId,
          ...orderData,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error creating guest order:", error)
        return null
      }

      await this.updateLastActivity(guestUserId)
      return data.id
    } catch (error) {
      console.error("Error in createGuestOrder:", error)
      return null
    }
  }

  // Convert guest user to registered user
  async convertGuestToUser(guestUserId: string, userId: string): Promise<boolean> {
    try {
      // Start transaction-like operations
      const { error: updateError } = await this.supabase
        .from("guest_users")
        .update({
          converted_to_user_id: userId,
          conversion_date: new Date().toISOString(),
          status: "converted",
        })
        .eq("id", guestUserId)

      if (updateError) {
        console.error("Error converting guest user:", updateError)
        return false
      }

      // Move cart items to user cart
      const { data: cartItems } = await this.supabase
        .from("guest_cart_items")
        .select("*")
        .eq("guest_user_id", guestUserId)

      if (cartItems && cartItems.length > 0) {
        const userCartItems = cartItems.map((item) => ({
          user_id: userId,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
          fabric_pattern: item.fabric_pattern,
          customizations: item.customizations,
          image_url: item.image_url,
        }))

        await this.supabase.from("cart_items").insert(userCartItems)
      }

      return true
    } catch (error) {
      console.error("Error in convertGuestToUser:", error)
      return false
    }
  }

  // Validate guest user data
  validateGuestData(data: Partial<GuestUser>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("รูปแบบอีเมลไม่ถูกต้อง")
    }

    if (data.phone && !/^[0-9+\-\s()]{8,15}$/.test(data.phone)) {
      errors.push("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง")
    }

    if (data.full_name && data.full_name.length < 2) {
      errors.push("ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// Server-side version for API routes
export class ServerGuestUserManager {
  private supabase = createServerClient()

  async getAllGuestUsers(page = 1, limit = 50): Promise<{ users: GuestUser[]; total: number }> {
    try {
      const offset = (page - 1) * limit

      const [{ data: users, error: usersError }, { count, error: countError }] = await Promise.all([
        this.supabase
          .from("guest_users")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1),
        this.supabase.from("guest_users").select("*", { count: "exact", head: true }),
      ])

      if (usersError || countError) {
        console.error("Error fetching guest users:", usersError || countError)
        return { users: [], total: 0 }
      }

      return { users: users || [], total: count || 0 }
    } catch (error) {
      console.error("Error in getAllGuestUsers:", error)
      return { users: [], total: 0 }
    }
  }

  async getGuestOrders(guestUserId?: string): Promise<GuestOrder[]> {
    try {
      let query = this.supabase.from("guest_orders").select("*").order("created_at", { ascending: false })

      if (guestUserId) {
        query = query.eq("guest_user_id", guestUserId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching guest orders:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getGuestOrders:", error)
      return []
    }
  }

  async cleanupExpiredGuests(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc("cleanup_expired_guest_users")

      if (error) {
        console.error("Error cleaning up expired guests:", error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error("Error in cleanupExpiredGuests:", error)
      return 0
    }
  }
}

export const guestUserManager = new GuestUserManager()
export const serverGuestUserManager = new ServerGuestUserManager()
