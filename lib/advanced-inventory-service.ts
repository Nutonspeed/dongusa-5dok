import { createClient } from "@/lib/supabase/client"
import { DatabaseService } from "@/lib/database"
import { logger } from "@/lib/logger"
import { inventoryService } from "@/lib/inventory"

export interface InventoryForecast {
  product_id: string
  product_name: string
  current_stock: number
  predicted_demand: number
  recommended_order_quantity: number
  optimal_reorder_date: string
  confidence_score: number
  seasonal_factor: number
  trend_factor: number
}

export interface SupplierPerformance {
  supplier_id: string
  supplier_name: string
  on_time_delivery_rate: number
  quality_score: number
  cost_competitiveness: number
  lead_time_accuracy: number
  overall_rating: number
  total_orders: number
  last_evaluation_date: string
  recommendations: string[]
}

export interface BatchTracking {
  id: string
  inventory_id: string
  batch_number: string
  manufacturing_date: string
  expiration_date?: string
  quantity: number
  quality_grade: string
  supplier_batch_ref?: string
  storage_location: string
  status: "active" | "expired" | "recalled" | "quarantine"
  notes?: string
  created_at: string
}

export interface InventoryTurnoverReport {
  product_id: string
  product_name: string
  average_inventory: number
  cost_of_goods_sold: number
  turnover_ratio: number
  days_in_inventory: number
  category: "fast_moving" | "medium_moving" | "slow_moving" | "dead_stock"
  recommendation: string
}

export interface AutoReorderRule {
  id: string
  inventory_id: string
  enabled: boolean
  trigger_type: "stock_level" | "time_based" | "demand_forecast"
  trigger_value: number
  order_quantity: number
  supplier_id: string
  priority: "low" | "medium" | "high" | "critical"
  conditions: {
    min_stock_level?: number
    max_stock_level?: number
    seasonal_adjustment?: boolean
    demand_spike_threshold?: number
  }
  last_triggered?: string
  created_at: string
  updated_at: string
}

export class AdvancedInventoryService {
  private supabase = createClient()
  private db = new DatabaseService(this.supabase)

  // Inventory Forecasting
  async generateInventoryForecast(
    timeframe: "weekly" | "monthly" | "quarterly" = "monthly",
    productIds?: string[],
  ): Promise<InventoryForecast[]> {
    try {
      // Mock advanced forecasting algorithm
      const mockForecasts: InventoryForecast[] = [
        {
          product_id: "1",
          product_name: "ผ้าคลุมโซฟาลายดอก",
          current_stock: 25,
          predicted_demand: 45,
          recommended_order_quantity: 50,
          optimal_reorder_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          confidence_score: 0.85,
          seasonal_factor: 1.2,
          trend_factor: 1.1,
        },
        {
          product_id: "2",
          product_name: "ผ้าคลุมโซฟาสีน้ำเงิน",
          current_stock: 15,
          predicted_demand: 35,
          recommended_order_quantity: 40,
          optimal_reorder_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          confidence_score: 0.92,
          seasonal_factor: 0.9,
          trend_factor: 1.05,
        },
      ]

      // In production, implement actual ML-based forecasting
      return mockForecasts
    } catch (error) {
      logger.error("Error generating inventory forecast:", error)
      return []
    }
  }

  // Supplier Performance Tracking
  async evaluateSupplierPerformance(supplierId?: string): Promise<SupplierPerformance[]> {
    try {
      const { data: suppliers, error } = await this.supabase
        .from("suppliers")
        .select("*")
        .eq(supplierId ? "id" : "status", supplierId || "active")

      if (error) throw error

      const performanceData: SupplierPerformance[] = []

      for (const supplier of suppliers || []) {
        // Calculate performance metrics
        const performance = await this.calculateSupplierMetrics(supplier.id)
        performanceData.push({
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          on_time_delivery_rate: performance.onTimeRate,
          quality_score: performance.qualityScore,
          cost_competitiveness: performance.costScore,
          lead_time_accuracy: performance.leadTimeAccuracy,
          overall_rating: performance.overallRating,
          total_orders: performance.totalOrders,
          last_evaluation_date: new Date().toISOString(),
          recommendations: performance.recommendations,
        })
      }

      return performanceData
    } catch (error) {
      logger.error("Error evaluating supplier performance:", error)
      return []
    }
  }

  private async calculateSupplierMetrics(supplierId: string) {
    // Mock calculation - in production, analyze actual order data
    return {
      onTimeRate: 0.85 + Math.random() * 0.15,
      qualityScore: 0.8 + Math.random() * 0.2,
      costScore: 0.75 + Math.random() * 0.25,
      leadTimeAccuracy: 0.9 + Math.random() * 0.1,
      overallRating: 0.85 + Math.random() * 0.15,
      totalOrders: Math.floor(Math.random() * 50) + 10,
      recommendations: ["ปรับปรุงเวลาการส่งมอบ", "เพิ่มการสื่อสารเกี่ยวกับสถานะคำสั่งซื้อ", "พิจารณาส่วนลดสำหรับคำสั่งซื้อจำนวนมาก"],
    }
  }

  // Batch Tracking System
  async createBatch(batchData: Omit<BatchTracking, "id" | "created_at">): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from("inventory_batches")
        .insert({
          ...batchData,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      logger.error("Error creating batch:", error)
      throw new Error("Failed to create batch")
    }
  }

  async getBatches(filters?: {
    inventory_id?: string
    status?: string
    expiring_soon?: boolean
    limit?: number
  }): Promise<BatchTracking[]> {
    try {
      let query = this.supabase.from("inventory_batches").select("*").order("created_at", { ascending: false })

      if (filters?.inventory_id) {
        query = query.eq("inventory_id", filters.inventory_id)
      }

      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.expiring_soon) {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        query = query.lte("expiration_date", thirtyDaysFromNow)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching batches:", error)
      return []
    }
  }

  async updateBatchStatus(batchId: string, status: BatchTracking["status"], notes?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("inventory_batches")
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq("id", batchId)

      if (error) throw error
      return true
    } catch (error) {
      logger.error("Error updating batch status:", error)
      return false
    }
  }

  // Inventory Turnover Analysis
  async generateTurnoverReport(
    period: "monthly" | "quarterly" | "yearly" = "monthly",
  ): Promise<InventoryTurnoverReport[]> {
    try {
      // Mock turnover analysis - in production, calculate from actual sales data
      const mockReports: InventoryTurnoverReport[] = [
        {
          product_id: "1",
          product_name: "ผ้าคลุมโซฟาลายดอก",
          average_inventory: 30,
          cost_of_goods_sold: 45000,
          turnover_ratio: 12.5,
          days_in_inventory: 29,
          category: "fast_moving",
          recommendation: "เพิ่มสต็อกเพื่อรองรับความต้องการ",
        },
        {
          product_id: "2",
          product_name: "ผ้าคลุมโซฟาสีน้ำเงิน",
          average_inventory: 25,
          cost_of_goods_sold: 30000,
          turnover_ratio: 8.0,
          days_in_inventory: 46,
          category: "medium_moving",
          recommendation: "รักษาระดับสต็อกปัจจุบัน",
        },
        {
          product_id: "3",
          product_name: "ผ้าคลุมโซฟาลายทาง",
          average_inventory: 40,
          cost_of_goods_sold: 15000,
          turnover_ratio: 3.1,
          days_in_inventory: 118,
          category: "slow_moving",
          recommendation: "ลดสต็อกและพิจารณาโปรโมชั่น",
        },
      ]

      return mockReports
    } catch (error) {
      logger.error("Error generating turnover report:", error)
      return []
    }
  }

  // Auto-Reorder System
  async createAutoReorderRule(rule: Omit<AutoReorderRule, "id" | "created_at" | "updated_at">): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from("auto_reorder_rules")
        .insert({
          ...rule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      logger.error("Error creating auto-reorder rule:", error)
      throw new Error("Failed to create auto-reorder rule")
    }
  }

  async getAutoReorderRules(inventoryId?: string): Promise<AutoReorderRule[]> {
    try {
      let query = this.supabase.from("auto_reorder_rules").select("*").order("priority", { ascending: false })

      if (inventoryId) {
        query = query.eq("inventory_id", inventoryId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching auto-reorder rules:", error)
      return []
    }
  }

  async processAutoReorders(): Promise<{ triggered: number; orders_created: number }> {
    try {
      const rules = await this.getAutoReorderRules()
      let triggered = 0
      let ordersCreated = 0

      for (const rule of rules) {
        if (!rule.enabled) continue

        const shouldTrigger = await this.evaluateReorderRule(rule)
        if (shouldTrigger) {
          triggered++
          const orderCreated = await this.createAutomaticPurchaseOrder(rule)
          if (orderCreated) {
            ordersCreated++
            // Update last triggered timestamp
            await this.supabase
              .from("auto_reorder_rules")
              .update({ last_triggered: new Date().toISOString() })
              .eq("id", rule.id)
          }
        }
      }

      return { triggered, orders_created: ordersCreated }
    } catch (error) {
      logger.error("Error processing auto-reorders:", error)
      return { triggered: 0, orders_created: 0 }
    }
  }

  private async evaluateReorderRule(rule: AutoReorderRule): Promise<boolean> {
    try {
      const inventory = await inventoryService.getInventoryItem(rule.inventory_id)

      switch (rule.trigger_type) {
        case "stock_level":
          return inventory.quantity_available <= rule.trigger_value

        case "time_based":
          if (!rule.last_triggered) return true
          const daysSinceLastTrigger = (Date.now() - new Date(rule.last_triggered).getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceLastTrigger >= rule.trigger_value

        case "demand_forecast":
          const forecast = await this.generateInventoryForecast("monthly", [rule.inventory_id])
          if (forecast.length > 0) {
            return forecast[0].predicted_demand > inventory.quantity_available
          }
          return false

        default:
          return false
      }
    } catch (error) {
      logger.error("Error evaluating reorder rule:", error)
      return false
    }
  }

  private async createAutomaticPurchaseOrder(rule: AutoReorderRule): Promise<boolean> {
    try {
      // Mock purchase order creation - integrate with actual procurement system
      const purchaseOrder = {
        supplier_id: rule.supplier_id,
        inventory_id: rule.inventory_id,
        quantity: rule.order_quantity,
        priority: rule.priority,
        auto_generated: true,
        created_at: new Date().toISOString(),
      }

      logger.info("Auto-generated purchase order:", purchaseOrder)
      return true
    } catch (error) {
      logger.error("Error creating automatic purchase order:", error)
      return false
    }
  }

  // Advanced Analytics
  async getInventoryInsights(): Promise<{
    total_value: number
    turnover_rate: number
    stockout_risk_items: number
    overstock_items: number
    supplier_performance_avg: number
    cost_optimization_potential: number
  }> {
    try {
      // Mock advanced analytics - in production, calculate from real data
      return {
        total_value: 450000,
        turnover_rate: 8.5,
        stockout_risk_items: 12,
        overstock_items: 8,
        supplier_performance_avg: 0.87,
        cost_optimization_potential: 25000,
      }
    } catch (error) {
      logger.error("Error getting inventory insights:", error)
      return {
        total_value: 0,
        turnover_rate: 0,
        stockout_risk_items: 0,
        overstock_items: 0,
        supplier_performance_avg: 0,
        cost_optimization_potential: 0,
      }
    }
  }

  // Demand Planning
  async generateDemandPlan(
    productId: string,
    timeframe: "monthly" | "quarterly" = "monthly",
  ): Promise<{
    product_id: string
    periods: Array<{
      period: string
      predicted_demand: number
      confidence: number
      factors: string[]
    }>
    recommendations: string[]
  }> {
    try {
      // Mock demand planning - in production, use ML models
      const periods = []
      const currentDate = new Date()

      for (let i = 0; i < (timeframe === "monthly" ? 12 : 4); i++) {
        const periodDate = new Date(currentDate)
        if (timeframe === "monthly") {
          periodDate.setMonth(currentDate.getMonth() + i)
        } else {
          periodDate.setMonth(currentDate.getMonth() + i * 3)
        }

        periods.push({
          period: periodDate.toISOString().slice(0, 7),
          predicted_demand: Math.floor(20 + Math.random() * 30),
          confidence: 0.75 + Math.random() * 0.2,
          factors: ["seasonal_trend", "historical_sales", "market_conditions"],
        })
      }

      return {
        product_id: productId,
        periods,
        recommendations: ["เพิ่มสต็อกในช่วงฤดูกาลสูงสุด", "ปรับแผนการผลิตตามแนวโน้มความต้องการ", "พิจารณาโปรโมชั่นในช่วงความต้องการต่ำ"],
      }
    } catch (error) {
      logger.error("Error generating demand plan:", error)
      throw new Error("Failed to generate demand plan")
    }
  }

  // Cost Optimization
  async analyzeCostOptimization(): Promise<{
    current_total_cost: number
    potential_savings: number
    optimization_opportunities: Array<{
      category: string
      description: string
      potential_saving: number
      implementation_effort: "low" | "medium" | "high"
    }>
  }> {
    try {
      return {
        current_total_cost: 125000,
        potential_savings: 18500,
        optimization_opportunities: [
          {
            category: "supplier_negotiation",
            description: "เจรจาราคาใหม่กับซัพพลายเออร์หลัก",
            potential_saving: 8000,
            implementation_effort: "medium",
          },
          {
            category: "inventory_reduction",
            description: "ลดสต็อกสินค้าเคลื่อนไหวช้า",
            potential_saving: 6500,
            implementation_effort: "low",
          },
          {
            category: "bulk_purchasing",
            description: "สั่งซื้อในปริมาณมากเพื่อได้ส่วนลด",
            potential_saving: 4000,
            implementation_effort: "low",
          },
        ],
      }
    } catch (error) {
      logger.error("Error analyzing cost optimization:", error)
      throw new Error("Failed to analyze cost optimization")
    }
  }
}

export const advancedInventoryService = new AdvancedInventoryService()
