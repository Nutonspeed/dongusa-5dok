import { supabase } from "./supabase"

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
  product_id: string
  product_name: string
  product_name_en: string
  variant_id?: string
  quantity_available: number
  quantity_reserved: number
  quantity_incoming: number
  reorder_level: number
  reorder_quantity: number
  cost_price: number
  sales_velocity: number
  last_restocked?: string
  last_sold?: string
  supplier_name?: string
  lead_time_days?: number
  stock_status: "normal" | "low_stock" | "out_of_stock" | "overstock"
  days_until_stockout?: number
  suggested_reorder_date?: string
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
    let query = supabase.from("inventory_dashboard").select("*").order("product_name")

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters?.stock_status && filters.stock_status !== "all") {
      query = query.eq("stock_status", filters.stock_status)
    }

    if (filters?.search) {
      query = query.or(`product_name.ilike.%${filters.search}%,product_name_en.ilike.%${filters.search}%`)
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
    let query = supabase.from("inventory_alerts").select("*").order("created_at", { ascending: false })

    if (filters?.alert_type && filters.alert_type !== "all") {
      query = query.eq("alert_type", filters.alert_type)
    }

    if (filters?.severity && filters.severity !== "all") {
      query = query.eq("severity", filters.severity)
    }

    if (filters?.is_resolved !== undefined) {
      query = query.eq("is_resolved", filters.is_resolved)
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

  // Resolve alert
  async resolveAlert(alertId: string, resolvedBy?: string): Promise<void> {
    const { error } = await supabase
      .from("inventory_alerts")
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
      })
      .eq("id", alertId)

    if (error) throw error
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
    const [
      { data: totalItems },
      { data: lowStockItems },
      { data: outOfStockItems },
      { data: totalValue },
      { data: pendingAlerts },
    ] = await Promise.all([
      supabase.from("inventory_advanced").select("id", { count: "exact" }).eq("status", "active"),
      supabase.from("inventory_dashboard").select("id", { count: "exact" }).eq("stock_status", "low_stock"),
      supabase.from("inventory_dashboard").select("id", { count: "exact" }).eq("stock_status", "out_of_stock"),
      supabase.from("inventory_advanced").select("quantity_available, cost_price").eq("status", "active"),
      supabase.from("inventory_alerts").select("id", { count: "exact" }).eq("is_resolved", false),
    ])

    const calculatedTotalValue =
      totalValue?.reduce((sum, item) => sum + item.quantity_available * item.cost_price, 0) || 0

    return {
      total_items: totalItems?.length || 0,
      low_stock_items: lowStockItems?.length || 0,
      out_of_stock_items: outOfStockItems?.length || 0,
      total_value: calculatedTotalValue,
      pending_alerts: pendingAlerts?.length || 0,
    }
  },
}
