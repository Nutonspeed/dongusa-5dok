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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
        }
      }
      fabric_collections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
        }
      }
      fabrics: {
        Row: {
          id: string
          name: string
          collection_id: string
          material: string | null
          color: string | null
          pattern: string | null
          price_per_meter: number
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          name: string
          collection_id: string
          material?: string | null
          color?: string | null
          pattern?: string | null
          price_per_meter: number
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          material?: string | null
          color?: string | null
          pattern?: string | null
          price_per_meter?: number
          image_url?: string | null
          is_active?: boolean
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
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          quantity?: number
          price?: number
        }
      }
    }
  }
}
