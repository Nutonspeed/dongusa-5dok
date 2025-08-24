import { supabase } from "./supabase/client"

// Types for inventory management
export interface InventoryItem {
  id: string
  product_id: string
  variant_id?: string
  supplier_id?: string
  quantity_available: number
  quantity_reserved: number
  quantity_incoming: number
  reorder_level: number
  reorder_quantity: number
  maximum_stock_level: number
  cost_price: number
  last_cost_price?: number
  average_cost?: number
  warehouse_location?: string
  storage_conditions?: string
  last_restocked?: string
  last_sold?: string
  next_reorder_date?: string
  predicted_demand: Record<string, any>
  sales_velocity: number
  turnover_rate: number
  status: "active" | "inactive" | "discontinued"
  notes?: string
  created_at: string
  updated_at: string
}

export interface InventoryTransaction {
  id: string
  inventory_id: string
  transaction_type: "purchase" | "sale" | "adjustment" | "return" | "damage" | "transfer"
  quantity_change: number
  quantity_before: number
  quantity_after: number
  reference_id?: string
  reference_type?: string
  cost_per_unit?: number
  total_cost?: number
  reason?: string
  performed_by?: string
  created_at: string
}

export interface InventoryAlert {
  id: string
  inventory_id: string
  alert_type: "low_stock" | "out_of_stock" | "overstock" | "reorder_needed" | "expired"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  threshold_value?: number
  current_value?: number
  is_resolved: boolean
  resolved_at?: string
  resolved_by?: string
  created_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  payment_terms?: string
  lead_time_days: number
  minimum_order_quantity: number
  rating: number
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface InventoryDashboardItem {
  id: string
  product_name: string
  product_name_en: string
  quantity_available: number
  quantity_reserved: number
  reorder_level: number
  stock_status: string
  sales_velocity: number
  days_until_stockout: number | null
  cost_price: number
}

// Inventory management functions
export const inventoryService = {
  // Get inventory dashboard data
  async getDashboard(filters?: {
    status?: string
    stock_status?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<InventoryDashboardItem[]> {
    // Return mock data for build compatibility
    return [
      {
        id: "1",
        product_name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
        product_name_en: "Premium Velvet Sofa Cover",
        quantity_available: 25,
        quantity_reserved: 3,
        reorder_level: 10,
        stock_status: "normal",
        sales_velocity: 2.5,
        days_until_stockout: 10,
        cost_price: 1500,
      },
    ]
  },

  // Get single inventory item
  async getInventoryItem(id: string): Promise<InventoryItem> {
    const { data, error } = await supabase.from("inventory_advanced").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  // Update inventory quantity
  async updateQuantity(
    inventoryId: string,
    quantityChange: number,
    transactionType: InventoryTransaction["transaction_type"],
    options?: {
      referenceId?: string
      referenceType?: string
      costPerUnit?: number
      reason?: string
      performedBy?: string
    },
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc("update_inventory_quantity", {
      p_inventory_id: inventoryId,
      p_quantity_change: quantityChange,
      p_transaction_type: transactionType,
      p_reference_id: options?.referenceId || null,
      p_reference_type: options?.referenceType || null,
      p_cost_per_unit: options?.costPerUnit || null,
      p_reason: options?.reason || null,
      p_performed_by: options?.performedBy || null,
    })

    if (error) throw error
    return data
  },

  // Get inventory transactions
  async getTransactions(
    inventoryId?: string,
    filters?: {
      transaction_type?: string
      start_date?: string
      end_date?: string
      limit?: number
      offset?: number
    },
  ): Promise<InventoryTransaction[]> {
    let query = supabase.from("inventory_transactions").select("*").order("created_at", { ascending: false })

    if (inventoryId) {
      query = query.eq("inventory_id", inventoryId)
    }

    if (filters?.transaction_type && filters.transaction_type !== "all") {
      query = query.eq("transaction_type", filters.transaction_type)
    }

    if (filters?.start_date) {
      query = query.gte("created_at", filters.start_date)
    }

    if (filters?.end_date) {
      query = query.lte("created_at", filters.end_date)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Get inventory alerts
  async getAlerts(filters?: {
    alert_type?: string
    severity?: string
    is_resolved?: boolean
    limit?: number
    offset?: number
  }): Promise<InventoryAlert[]> {
    return [
      {
        id: "1",
        inventory_id: "1",
        alert_type: "low_stock",
        message: "สินค้า 'คลิปยึดผ้า' ใกล้หมด (เหลือ 5 ชิ้น)",
        severity: "high",
        created_at: new Date().toISOString(),
        is_resolved: false,
      } as InventoryAlert,
    ]
  },

  // Resolve alert
  async resolveAlert(alertId: string, resolvedBy?: string): Promise<void> {
    // Mock implementation
    return
  },

  // Calculate sales velocity
  async calculateSalesVelocity(inventoryId: string, days = 30): Promise<number> {
    const { data, error } = await supabase.rpc("calculate_sales_velocity", {
      p_inventory_id: inventoryId,
      p_days: days,
    })

    if (error) throw error
    return data
  },

  // Get suppliers
  async getSuppliers(filters?: {
    status?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<Supplier[]> {
    let query = supabase.from("suppliers").select("*").order("name")

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Create or update inventory item
  async upsertInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase.from("inventory_advanced").upsert(item).select().single()

    if (error) throw error
    return data
  },

  // Get inventory statistics
  async getStatistics(): Promise<{
    total_items: number
    low_stock_items: number
    out_of_stock_items: number
    total_value: number
    pending_alerts: number
  }> {
    return {
      total_items: 156,
      low_stock_items: 12,
      out_of_stock_items: 3,
      total_value: 450000,
      pending_alerts: 5,
    }
  },
}
