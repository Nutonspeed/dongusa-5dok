import { DatabaseService } from "./database"
import { logger } from "./logger"

export interface PredictionModel {
  id: string
  name: string
  type: "linear_regression" | "arima" | "neural_network" | "ensemble"
  accuracy: number
  lastTrained: Date
  parameters: Record<string, any>
}

export interface SeasonalPattern {
  product_id: string
  month: number
  seasonal_index: number
  confidence: number
  historical_data_points: number
}

export interface DemandPrediction {
  product_id: string
  product_name: string
  prediction_date: string
  predicted_demand: number
  confidence_interval: {
    lower: number
    upper: number
  }
  confidence_score: number
  contributing_factors: {
    seasonal: number
    trend: number
    promotional: number
    external: number
  }
  model_used: string
}

export interface InventoryOptimization {
  product_id: string
  current_stock: number
  optimal_stock_level: number
  reorder_point: number
  economic_order_quantity: number
  safety_stock: number
  carrying_cost_reduction: number
  stockout_risk_reduction: number
}

export class AIInventoryPredictionService {
  private db: DatabaseService

  constructor() {
    this.db = new DatabaseService()
  }

  async predictDemand(
    productIds: string[],
    forecastHorizon = 30,
    modelType: PredictionModel["type"] = "ensemble",
  ): Promise<DemandPrediction[]> {
    try {
      const predictions: DemandPrediction[] = []

      for (const productId of productIds) {
        // Get historical sales data
        const historicalData = await this.getHistoricalSalesData(productId, 365)

        // Apply different prediction models
        const prediction = await this.applyPredictionModel(productId, historicalData, forecastHorizon, modelType)

        predictions.push(prediction)
      }

      return predictions
    } catch (error) {
      logger.error("Error predicting demand:", error)
      return []
    }
  }

  async analyzeSeasonalPatterns(productId: string): Promise<SeasonalPattern[]> {
    try {
      const historicalData = await this.getHistoricalSalesData(productId, 730) // 2 years
      const patterns: SeasonalPattern[] = []

      // Calculate seasonal indices for each month
      for (let month = 1; month <= 12; month++) {
        const monthlyData = historicalData.filter((d) => new Date(d.date).getMonth() + 1 === month)
        const averageMonthly = monthlyData.reduce((sum, d) => sum + d.quantity, 0) / monthlyData.length
        const overallAverage = historicalData.reduce((sum, d) => sum + d.quantity, 0) / historicalData.length

        const seasonalIndex = averageMonthly / overallAverage
        const confidence = this.calculateSeasonalConfidence(monthlyData)

        patterns.push({
          product_id: productId,
          month,
          seasonal_index: seasonalIndex,
          confidence,
          historical_data_points: monthlyData.length,
        })
      }

      return patterns
    } catch (error) {
      logger.error("Error analyzing seasonal patterns:", error)
      return []
    }
  }

  async optimizeInventoryLevels(productIds: string[]): Promise<InventoryOptimization[]> {
    try {
      const optimizations: InventoryOptimization[] = []

      for (const productId of productIds) {
        const currentInventory = await this.getCurrentInventoryLevel(productId)
        const demandPrediction = await this.predictDemand([productId], 30)
        const seasonalPatterns = await this.analyzeSeasonalPatterns(productId)

        // Calculate optimal parameters using AI optimization
        const optimization = await this.calculateOptimalLevels(
          productId,
          currentInventory,
          demandPrediction[0],
          seasonalPatterns,
        )

        optimizations.push(optimization)
      }

      return optimizations
    } catch (error) {
      logger.error("Error optimizing inventory levels:", error)
      return []
    }
  }

  async calculateDynamicReorderPoints(
    productId: string,
    serviceLevel = 0.95,
  ): Promise<{
    reorder_point: number
    safety_stock: number
    lead_time_demand: number
    demand_variability: number
    risk_assessment: {
      stockout_probability: number
      excess_inventory_risk: number
      optimal_service_level: number
    }
  }> {
    try {
      const historicalData = await this.getHistoricalSalesData(productId, 180)
      const leadTime = await this.getAverageLeadTime(productId)

      // Calculate demand statistics
      const dailyDemands = this.aggregateDailyDemand(historicalData)
      const avgDailyDemand = dailyDemands.reduce((sum, d) => sum + d, 0) / dailyDemands.length
      const demandStdDev = this.calculateStandardDeviation(dailyDemands)

      // Lead time demand
      const leadTimeDemand = avgDailyDemand * leadTime

      // Safety stock calculation with service level
      const zScore = this.getZScoreForServiceLevel(serviceLevel)
      const safetyStock = zScore * demandStdDev * Math.sqrt(leadTime)

      // Dynamic reorder point
      const reorderPoint = leadTimeDemand + safetyStock

      // Risk assessment
      const riskAssessment = await this.assessInventoryRisks(
        productId,
        reorderPoint,
        safetyStock,
        avgDailyDemand,
        demandStdDev,
      )

      return {
        reorder_point: Math.ceil(reorderPoint),
        safety_stock: Math.ceil(safetyStock),
        lead_time_demand: Math.ceil(leadTimeDemand),
        demand_variability: demandStdDev,
        risk_assessment: riskAssessment,
      }
    } catch (error) {
      logger.error("Error calculating dynamic reorder points:", error)
      throw error
    }
  }

  async performAdvancedABCAnalysis(): Promise<{
    categories: {
      A: { products: string[]; revenue_contribution: number; management_strategy: string }
      B: { products: string[]; revenue_contribution: number; management_strategy: string }
      C: { products: string[]; revenue_contribution: number; management_strategy: string }
    }
    insights: string[]
    recommendations: string[]
  }> {
    try {
      // Get all products with sales data
      const products = await this.getAllProductsWithSalesData()

      // Calculate revenue contribution for each product
      const productAnalysis = products.map((product) => ({
        product_id: product.id,
        revenue: product.total_revenue,
        volume: product.total_volume,
        profit_margin: product.profit_margin,
        frequency: product.order_frequency,
      }))

      // Sort by revenue and calculate cumulative percentages
      productAnalysis.sort((a, b) => b.revenue - a.revenue)
      const totalRevenue = productAnalysis.reduce((sum, p) => sum + p.revenue, 0)

      let cumulativeRevenue = 0
      const categorizedProducts = {
        A: { products: [] as string[], revenue_contribution: 0, management_strategy: "" },
        B: { products: [] as string[], revenue_contribution: 0, management_strategy: "" },
        C: { products: [] as string[], revenue_contribution: 0, management_strategy: "" },
      }

      productAnalysis.forEach((product) => {
        cumulativeRevenue += product.revenue
        const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100

        if (cumulativePercentage <= 80) {
          categorizedProducts.A.products.push(product.product_id)
          categorizedProducts.A.revenue_contribution += product.revenue
        } else if (cumulativePercentage <= 95) {
          categorizedProducts.B.products.push(product.product_id)
          categorizedProducts.B.revenue_contribution += product.revenue
        } else {
          categorizedProducts.C.products.push(product.product_id)
          categorizedProducts.C.revenue_contribution += product.revenue
        }
      })

      // Calculate percentages and strategies
      categorizedProducts.A.revenue_contribution = (categorizedProducts.A.revenue_contribution / totalRevenue) * 100
      categorizedProducts.B.revenue_contribution = (categorizedProducts.B.revenue_contribution / totalRevenue) * 100
      categorizedProducts.C.revenue_contribution = (categorizedProducts.C.revenue_contribution / totalRevenue) * 100

      categorizedProducts.A.management_strategy = "ติดตามอย่างใกล้ชิด, สต็อกสูง, ผู้จำหน่ายหลายราย"
      categorizedProducts.B.management_strategy = "ติดตามปกติ, สต็อกปานกลาง, ระบบ reorder อัตโนมัติ"
      categorizedProducts.C.management_strategy = "ติดตามน้อย, สต็อกต่ำ, สั่งซื้อตามความต้องการ"

      return {
        categories: categorizedProducts,
        insights: [
          `สินค้ากลุ่ม A (${categorizedProducts.A.products.length} รายการ) สร้างรายได้ ${categorizedProducts.A.revenue_contribution.toFixed(1)}%`,
          `สินค้ากลุ่ม B (${categorizedProducts.B.products.length} รายการ) สร้างรายได้ ${categorizedProducts.B.revenue_contribution.toFixed(1)}%`,
          `สินค้ากลุ่ม C (${categorizedProducts.C.products.length} รายการ) สร้างรายได้ ${categorizedProducts.C.revenue_contribution.toFixed(1)}%`,
        ],
        recommendations: [
          "เพิ่มการลงทุนในการตลาดสำหรับสินค้ากลุ่ม A",
          "ปรับปรุงประสิทธิภาพการจัดการสต็อกสินค้ากลุ่ม B",
          "พิจารณาลดสินค้ากลุ่ม C ที่ไม่มีกำไร",
        ],
      }
    } catch (error) {
      logger.error("Error performing ABC analysis:", error)
      throw error
    }
  }

  // Private helper methods
  private async getHistoricalSalesData(productId: string, days: number) {
    // Mock implementation - in production, fetch from database
    const data = []
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString(),
        quantity: Math.floor(Math.random() * 10) + 1,
        revenue: (Math.floor(Math.random() * 10) + 1) * 1500,
      })
    }

    return data
  }

  private async applyPredictionModel(
    productId: string,
    historicalData: any[],
    forecastHorizon: number,
    modelType: PredictionModel["type"],
  ): Promise<DemandPrediction> {
    // Mock ML prediction - in production, use actual ML models
    const avgDemand = historicalData.reduce((sum, d) => sum + d.quantity, 0) / historicalData.length
    const seasonalFactor = 1 + (Math.random() - 0.5) * 0.4
    const trendFactor = 1 + (Math.random() - 0.5) * 0.2

    const predictedDemand = Math.round(avgDemand * seasonalFactor * trendFactor)
    const confidence = 0.75 + Math.random() * 0.2

    return {
      product_id: productId,
      product_name: `Product ${productId}`,
      prediction_date: new Date(Date.now() + forecastHorizon * 24 * 60 * 60 * 1000).toISOString(),
      predicted_demand: predictedDemand,
      confidence_interval: {
        lower: Math.round(predictedDemand * 0.8),
        upper: Math.round(predictedDemand * 1.2),
      },
      confidence_score: confidence,
      contributing_factors: {
        seasonal: seasonalFactor - 1,
        trend: trendFactor - 1,
        promotional: Math.random() * 0.1,
        external: Math.random() * 0.05,
      },
      model_used: modelType,
    }
  }

  private calculateSeasonalConfidence(monthlyData: any[]): number {
    if (monthlyData.length < 3) return 0.3
    if (monthlyData.length < 6) return 0.6
    return 0.9
  }

  private async getCurrentInventoryLevel(productId: string): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 100) + 20
  }

  private async calculateOptimalLevels(
    productId: string,
    currentInventory: number,
    demandPrediction: DemandPrediction,
    seasonalPatterns: SeasonalPattern[],
  ): Promise<InventoryOptimization> {
    const avgSeasonalIndex = seasonalPatterns.reduce((sum, p) => sum + p.seasonal_index, 0) / seasonalPatterns.length
    const optimalStock = Math.round(demandPrediction.predicted_demand * avgSeasonalIndex * 1.2)

    return {
      product_id: productId,
      current_stock: currentInventory,
      optimal_stock_level: optimalStock,
      reorder_point: Math.round(optimalStock * 0.3),
      economic_order_quantity: Math.round(demandPrediction.predicted_demand * 0.5),
      safety_stock: Math.round(demandPrediction.predicted_demand * 0.2),
      carrying_cost_reduction: Math.max(0, (currentInventory - optimalStock) * 50),
      stockout_risk_reduction: demandPrediction.confidence_score * 100,
    }
  }

  private async getAverageLeadTime(productId: string): Promise<number> {
    // Mock implementation - in production, calculate from supplier data
    return 7 + Math.floor(Math.random() * 7) // 7-14 days
  }

  private aggregateDailyDemand(historicalData: any[]): number[] {
    const dailyDemands: { [key: string]: number } = {}

    historicalData.forEach((record) => {
      const date = record.date.split("T")[0]
      dailyDemands[date] = (dailyDemands[date] || 0) + record.quantity
    })

    return Object.values(dailyDemands)
  }

  private calculateStandardDeviation(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map((val) => Math.pow(val - avg, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length
    return Math.sqrt(avgSquaredDiff)
  }

  private getZScoreForServiceLevel(serviceLevel: number): number {
    // Simplified Z-score lookup
    const zScores: { [key: number]: number } = {
      0.9: 1.28,
      0.95: 1.65,
      0.99: 2.33,
    }
    return zScores[serviceLevel] || 1.65
  }

  private async assessInventoryRisks(
    productId: string,
    reorderPoint: number,
    safetyStock: number,
    avgDailyDemand: number,
    demandStdDev: number,
  ) {
    return {
      stockout_probability: Math.max(0, (avgDailyDemand - reorderPoint) / (demandStdDev * 10)),
      excess_inventory_risk: Math.max(0, (safetyStock - avgDailyDemand * 3) / safetyStock),
      optimal_service_level: 0.95,
    }
  }

  private async getAllProductsWithSalesData() {
    // Mock implementation
    return [
      { id: "1", total_revenue: 150000, total_volume: 100, profit_margin: 0.4, order_frequency: 25 },
      { id: "2", total_revenue: 120000, total_volume: 80, profit_margin: 0.35, order_frequency: 20 },
      { id: "3", total_revenue: 80000, total_volume: 60, profit_margin: 0.3, order_frequency: 15 },
    ]
  }
}

export const aiInventoryPrediction = new AIInventoryPredictionService()
