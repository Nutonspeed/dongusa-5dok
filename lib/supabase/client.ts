import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    try {
      if (isSupabaseConfigured) {
        supabaseInstance = createClientComponentClient<Database>()
      } else {
        // Create a mock client for development
        supabaseInstance = {
          auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
            signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          },
          from: () => ({
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
              }),
            }),
          }),
        } as any
      }
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      // Return mock client on error
      supabaseInstance = {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Client error" } }),
          signUp: () => Promise.resolve({ data: null, error: { message: "Client error" } }),
          signOut: () => Promise.resolve({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: "Client error" } }),
            }),
          }),
        }),
      } as any
    }
  }
  return supabaseInstance
})()

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: "customer" | "admin" | "staff"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: "customer" | "admin" | "staff"
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          role?: "customer" | "admin" | "staff"
          avatar_url?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          category_id: string | null
          images: string[]
          is_active: boolean
          stock_quantity: number
          sku: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          category_id?: string | null
          images?: string[]
          is_active?: boolean
          stock_quantity?: number
          sku?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          is_active?: boolean
          stock_quantity?: number
          images?: string[]
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          total_amount: number
          shipping_address: any
          billing_address: any
          payment_status: "pending" | "paid" | "failed" | "refunded"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          total_amount: number
          shipping_address: any
          billing_address?: any
          payment_status?: "pending" | "paid" | "failed" | "refunded"
          notes?: string | null
        }
        Update: {
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_status?: "pending" | "paid" | "failed" | "refunded"
          notes?: string | null
        }
      }
    }
  }
}
