import { advancedAnalytics } from "./advanced-analytics-service"

interface PredictiveModel {
  id: string
  name: string
  type: "regression" | "classification" | "time_series" | "clustering"
  accuracy: number
  last_trained: string
  features: string[]
  predictions: any[]
}

interface DataInsight {
  id: string
  title: string
  description: string
  type: "trend" | "anomaly" | "correlation" | "prediction"
  confidence: number
  impact_score: number
  data_points: any[]
  visualization_type: "line" | "bar" | "scatter" | "heatmap" | "pie"
  created_at: string
}

interface BusinessMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: "up" | "down" | "stable"
  change_percentage: number
  benchmark: number
  category: "revenue" | "customer" | "operational" | "marketing"
}

class EnhancedBusinessIntelligence {
  private models: Map<string, PredictiveModel> = new Map()
  private insights: DataInsight[] = []
  private metrics: BusinessMetric[] = []

  async generateAdvancedInsights(): Promise<DataInsight[]> {
    const insights: DataInsight[] = []

    // Revenue trend analysis
    const revenueInsight = await this.analyzeRevenueTrends()
    if (revenueInsight) insights.push(revenueInsight)

    // Customer behavior patterns
    const customerInsight = await this.analyzeCustomerBehavior()
    if (customerInsight) insights.push(customerInsight)

    // Product performance correlation
    const productInsight = await this.analyzeProductPerformance()
    if (productInsight) insights.push(productInsight)

    // Market opportunity detection
    const marketInsight = await this.detectMarketOpportunities()
    if (marketInsight) insights.push(marketInsight)

    // Operational efficiency analysis
    const operationalInsight = await this.analyzeOperationalEfficiency()
    if (operationalInsight) insights.push(operationalInsight)

    this.insights = insights
    return insights
  }

  private async analyzeRevenueTrends(): Promise<DataInsight | null> {
    try {
      const dashboard = await advancedAnalytics.getRealTimeDashboard()
      const metrics = dashboard.metrics

      // Analyze revenue growth patterns
      const revenueGrowth = metrics.revenue.growth
      const seasonalFactor = this.calculateSeasonalFactor()

      return {
        id: `revenue_trend_${Date.now()}`,
        title: "แนวโน้มรายได้และการพยากรณ์",
        description: `รายได้เติบโต ${revenueGrowth.toFixed(1)}% พร้อมปัจจัยตามฤดูกาล ${seasonalFactor.toFixed(1)}%`,
        type: "trend",
        confidence: 85,
        impact_score: 9,
        data_points: [
          { period: "Q1", actual: metrics.revenue.current * 0.8, predicted: metrics.revenue.forecast * 0.85 },
          { period: "Q2", actual: metrics.revenue.current * 0.9, predicted: metrics.revenue.forecast * 0.92 },
          { period: "Q3", actual: metrics.revenue.current, predicted: metrics.revenue.forecast },
          { period: "Q4", actual: null, predicted: metrics.revenue.forecast * 1.15 },
        ],
        visualization_type: "line",
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error analyzing revenue trends:", error)
      return null
    }
  }

  private async analyzeCustomerBehavior(): Promise<DataInsight | null> {
    try {
      const dashboard = await advancedAnalytics.getRealTimeDashboard()
      const customers = dashboard.metrics.customers

      const churnRisk = customers.churn_rate
      const clvTrend = this.calculateCLVTrend(customers.lifetime_value)

      return {
        id: `customer_behavior_${Date.now()}`,
        title: "พฤติกรรมลูกค้าและความเสี่ยง",
        description: `อัตราการหายไป ${churnRisk}% พร้อม CLV แนวโน้ม ${clvTrend > 0 ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(clvTrend).toFixed(1)}%`,
        type: "correlation",
        confidence: 78,
        impact_score: 8,
        data_points: [
          { segment: "ลูกค้าใหม่", churn_risk: 15, clv: customers.lifetime_value * 0.6 },
          { segment: "ลูกค้าประจำ", churn_risk: 8, clv: customers.lifetime_value * 1.2 },
          { segment: "ลูกค้า VIP", churn_risk: 3, clv: customers.lifetime_value * 2.5 },
        ],
        visualization_type: "scatter",
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error analyzing customer behavior:", error)
      return null
    }
  }

  private async analyzeProductPerformance(): Promise<DataInsight | null> {
    try {
      const dashboard = await advancedAnalytics.getRealTimeDashboard()
      const products = dashboard.metrics.products

      return {
        id: `product_performance_${Date.now()}`,
        title: "ประสิทธิภาพสินค้าและโอกาส",
        description: `สินค้าขายดี ${products.top_performers.length} รายการ พร้อมสต็อกต่ำ ${products.low_stock_alerts.length} รายการ`,
        type: "correlation",
        confidence: 82,
        impact_score: 7,
        data_points: products.top_performers.map((product: any) => ({
          name: product.name,
          sales: product.sales,
          revenue: product.revenue,
          growth: product.growth,
          margin: product.margin || 35,
        })),
        visualization_type: "bar",
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error analyzing product performance:", error)
      return null
    }
  }

  private async detectMarketOpportunities(): Promise<DataInsight | null> {
    try {
      // Simulate market opportunity detection
      const opportunities = [
        { category: "ผ้าคลุมโซฟากันน้ำ", potential: 250000, confidence: 75 },
        { category: "ชุดผ้าคลุมสำหรับเด็ก", potential: 180000, confidence: 68 },
        { category: "ผ้าคลุมโซฟาอัจฉริยะ", potential: 420000, confidence: 85 },
      ]

      return {
        id: `market_opportunity_${Date.now()}`,
        title: "โอกาสทางการตลาดใหม่",
        description: `พบโอกาสตลาดใหม่ ${opportunities.length} ประเภท มูลค่ารวม ${opportunities.reduce((sum, opp) => sum + opp.potential, 0).toLocaleString()} บาท`,
        type: "prediction",
        confidence: 76,
        impact_score: 9,
        data_points: opportunities,
        visualization_type: "pie",
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error detecting market opportunities:", error)
      return null
    }
  }

  private async analyzeOperationalEfficiency(): Promise<DataInsight | null> {
    try {
      const dashboard = await advancedAnalytics.getRealTimeDashboard()
      const operations = dashboard.metrics.operations

      const efficiency = {
        order_processing: 92,
        inventory_turnover: 85,
        customer_service: 88,
        fulfillment: 94,
      }

      return {
        id: `operational_efficiency_${Date.now()}`,
        title: "ประสิทธิภาพการดำเนินงาน",
        description: `อัตราแปลง ${operations.conversion_rate}% พร้อมประสิทธิภาพโดยรวม ${Object.values(efficiency).reduce((sum, val) => sum + val, 0) / Object.values(efficiency).length}%`,
        type: "trend",
        confidence: 89,
        impact_score: 6,
        data_points: Object.entries(efficiency).map(([key, value]) => ({
          metric: key.replace(/_/g, " "),
          score: value,
          target: 95,
        })),
        visualization_type: "bar",
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error analyzing operational efficiency:", error)
      return null
    }
  }

  async createPredictiveModel(config: {
    name: string
    type: PredictiveModel["type"]
    features: string[]
    training_data: any[]
  }): Promise<PredictiveModel> {
    const model: PredictiveModel = {
      id: `model_${Date.now()}`,
      name: config.name,
      type: config.type,
      accuracy: this.simulateModelTraining(config.training_data),
      last_trained: new Date().toISOString(),
      features: config.features,
      predictions: [],
    }

    this.models.set(model.id, model)
    return model
  }

  async generatePredictions(modelId: string, input_data: any[]): Promise<any[]> {
    const model = this.models.get(modelId)
    if (!model) throw new Error("Model not found")

    // Simulate predictions based on model type
    const predictions = input_data.map((data) => {
      switch (model.type) {
        case "regression":
          return { input: data, predicted_value: this.simulateRegression(data), confidence: model.accuracy / 100 }
        case "classification":
          return { input: data, predicted_class: this.simulateClassification(data), confidence: model.accuracy / 100 }
        case "time_series":
          return { input: data, predicted_sequence: this.simulateTimeSeries(data), confidence: model.accuracy / 100 }
        case "clustering":
          return { input: data, cluster_id: this.simulateClustering(data), confidence: model.accuracy / 100 }
        default:
          return { input: data, prediction: "unknown", confidence: 0.5 }
      }
    })

    model.predictions = predictions
    return predictions
  }

  async getBusinessMetrics(): Promise<BusinessMetric[]> {
    try {
      const dashboard = await advancedAnalytics.getRealTimeDashboard()
      const metrics = dashboard.metrics

      const businessMetrics: BusinessMetric[] = [
        {
          id: "revenue_growth",
          name: "การเติบโตของรายได้",
          value: metrics.revenue.growth,
          target: 15,
          unit: "%",
          trend: metrics.revenue.growth > 0 ? "up" : "down",
          change_percentage: metrics.revenue.growth,
          benchmark: 12,
          category: "revenue",
        },
        {
          id: "customer_acquisition",
          name: "การได้รับลูกค้าใหม่",
          value: metrics.customers.new,
          target: 50,
          unit: "คน",
          trend: "up",
          change_percentage: 18.5,
          benchmark: 35,
          category: "customer",
        },
        {
          id: "conversion_rate",
          name: "อัตราการแปลง",
          value: metrics.operations.conversion_rate,
          target: 5.0,
          unit: "%",
          trend: "up",
          change_percentage: 8.2,
          benchmark: 3.8,
          category: "marketing",
        },
        {
          id: "inventory_turnover",
          name: "การหมุนเวียนสต็อก",
          value: 6.2,
          target: 8.0,
          unit: "ครั้ง/ปี",
          trend: "stable",
          change_percentage: 2.1,
          benchmark: 5.5,
          category: "operational",
        },
      ]

      this.metrics = businessMetrics
      return businessMetrics
    } catch (error) {
      console.error("Error getting business metrics:", error)
      return []
    }
  }

  // Helper methods
  private calculateSeasonalFactor(): number {
    const month = new Date().getMonth()
    const seasonalFactors = [0.8, 0.85, 0.9, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 1.2]
    return seasonalFactors[month] * 100 - 100
  }

  private calculateCLVTrend(currentCLV: number): number {
    // Simulate CLV trend calculation
    return Math.random() * 20 - 10 // -10% to +10%
  }

  private simulateModelTraining(trainingData: any[]): number {
    // Simulate model accuracy based on training data size and quality
    const baseAccuracy = 70
    const dataQualityBonus = Math.min(trainingData.length / 100, 1) * 20
    const randomFactor = Math.random() * 10
    return Math.min(baseAccuracy + dataQualityBonus + randomFactor, 95)
  }

  private simulateRegression(data: any): number {
    return Math.random() * 1000 + 500
  }

  private simulateClassification(data: any): string {
    const classes = ["high_value", "medium_value", "low_value"]
    return classes[Math.floor(Math.random() * classes.length)]
  }

  private simulateTimeSeries(data: any): number[] {
    return Array.from({ length: 12 }, () => Math.random() * 1000 + 500)
  }

  private simulateClustering(data: any): number {
    return Math.floor(Math.random() * 5) + 1
  }
}

export const enhancedBI = new EnhancedBusinessIntelligence()
export type { DataInsight, BusinessMetric, PredictiveModel }
