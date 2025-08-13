export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
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
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      fabric_collections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_featured: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      fabrics: {
        Row: {
          id: string
          name: string
          collection_id: string | null
          material: string | null
          color: string | null
          pattern: string | null
          image_url: string | null
          price_per_meter: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          collection_id?: string | null
          material?: string | null
          color?: string | null
          pattern?: string | null
          image_url?: string | null
          price_per_meter?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          collection_id?: string | null
          material?: string | null
          color?: string | null
          pattern?: string | null
          image_url?: string | null
          price_per_meter?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sku: string | null
          price: number
          compare_at_price: number | null
          category_id: string | null
          stock_quantity: number
          images: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          sku?: string | null
          price: number
          compare_at_price?: number | null
          category_id?: string | null
          stock_quantity?: number
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          category_id?: string | null
          stock_quantity?: number
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_status: "pending" | "paid" | "failed" | "refunded"
          total_amount: number
          shipping_address: Json | null
          billing_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_status?: "pending" | "paid" | "failed" | "refunded"
          total_amount: number
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
          payment_status?: "pending" | "paid" | "failed" | "refunded"
          total_amount?: number
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          price?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
