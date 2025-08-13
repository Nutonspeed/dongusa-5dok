import { DatabaseService } from "./database"
import { logger } from "./logger"

export interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria
  customerCount: number
  averageValue: number
  color: string
}

export interface SegmentCriteria {
  minSpent?: number
  maxSpent?: number
  minOrders?: number
  maxOrders?: number
  daysSinceLastOrder?: number
  loyaltyTier?: string[]
  tags?: string[]
  registrationDateRange?: {
    from: Date
    to: Date
  }
}

export interface CustomerProfile {
  id: string
  email: string
  name: string
  phone?: string
  totalSpent: number
  orderCount: number
  lastOrderDate: Date
  registrationDate: Date
  loyaltyTier: string
  loyaltyPoints: number
  segments: string[]
  tags: string[]
  riskScore: number
  lifetimeValue: number
  preferredCategories: string[]
  communicationHistory: CommunicationRecord[]
}

export interface CommunicationRecord {
  id: string
  type: "email" | "sms" | "call" | "chat"
  subject: string
  content: string
  sentAt: Date
  status: "sent" | "delivered" | "opened" | "clicked" | "replied"
  campaign?: string
}

export interface CustomerJourney {
  customerId: string
  stages: JourneyStage[]
  currentStage: string
  nextActions: string[]
}

export interface JourneyStage {
  id: string
  name: string
  enteredAt: Date
  exitedAt?: Date
  actions: string[]
  triggers: string[]
}

export class AdvancedCRMService {
  private db: DatabaseService

  constructor() {
    this.db = new DatabaseService()
  }

  async getCustomerSegments(): Promise<CustomerSegment[]> {
    try {
      const segments: CustomerSegment[] = [
        {
          id: "vip",
          name: "ลูกค้า VIP",
          description: "ลูกค้าที่ใช้จ่ายมากกว่า 50,000 บาท",
          criteria: { minSpent: 50000 },
          customerCount: 23,
          averageValue: 85000,
          color: "#8B5CF6",
        },
        {
          id: "high_value",
          name: "ลูกค้าคุณค่าสูง",
          description: "ลูกค้าที่ใช้จ่าย 20,000-49,999 บาท",
          criteria: { minSpent: 20000, maxSpent: 49999 },
          customerCount: 45,
          averageValue: 32000,
          color: "#10B981",
        },
        {
          id: "frequent_buyers",
          name: "ลูกค้าซื้อบ่อย",
          description: "ลูกค้าที่สั่งซื้อมากกว่า 5 ครั้ง",
          criteria: { minOrders: 5 },
          customerCount: 78,
          averageValue: 18500,
          color: "#3B82F6",
        },
        {
          id: "at_risk",
          name: "ลูกค้าเสี่ยงหาย",
          description: "ลูกค้าที่ไม่ได้สั่งซื้อมากกว่า 90 วัน",
          criteria: { daysSinceLastOrder: 90 },
          customerCount: 34,
          averageValue: 12000,
          color: "#EF4444",
        },
        {
          id: "new_customers",
          name: "ลูกค้าใหม่",
          description: "ลูกค้าที่สมัครสมาชิกภายใน 30 วัน",
          criteria: {
            registrationDateRange: {
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              to: new Date(),
            },
          },
          customerCount: 56,
          averageValue: 3500,
          color: "#F59E0B",
        },
      ]

      return segments
    } catch (error) {
      logger.error("Error getting customer segments:", error)
      throw error
    }
  }

  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    try {
      // Mock data - in real implementation, fetch from database
      const profile: CustomerProfile = {
        id: customerId,
        email: "customer@example.com",
        name: "สมชาย ใจดี",
        phone: "0812345678",
        totalSpent: 45000,
        orderCount: 8,
        lastOrderDate: new Date("2024-01-20"),
        registrationDate: new Date("2023-06-15"),
        loyaltyTier: "gold",
        loyaltyPoints: 1250,
        segments: ["high_value", "frequent_buyers"],
        tags: ["premium_customer", "sofa_lover"],
        riskScore: 15, // Low risk
        lifetimeValue: 67500,
        preferredCategories: ["sofa-covers", "premium-fabrics"],
        communicationHistory: [
          {
            id: "1",
            type: "email",
            subject: "ขอบคุณสำหรับการสั่งซื้อ",
            content: "ขอบคุณที่เลือกซื้อผ้าคลุมโซฟากับเรา",
            sentAt: new Date("2024-01-20T10:30:00"),
            status: "opened",
            campaign: "order_confirmation",
          },
        ],
      }

      return profile
    } catch (error) {
      logger.error("Error getting customer profile:", error)
      return null
    }
  }

  async getCustomerJourney(customerId: string): Promise<CustomerJourney | null> {
    try {
      const journey: CustomerJourney = {
        customerId,
        currentStage: "loyal_customer",
        stages: [
          {
            id: "awareness",
            name: "รับรู้แบรนด์",
            enteredAt: new Date("2023-06-01"),
            exitedAt: new Date("2023-06-10"),
            actions: ["visited_website", "viewed_products"],
            triggers: ["facebook_ad_click"],
          },
          {
            id: "consideration",
            name: "พิจารณาซื้อ",
            enteredAt: new Date("2023-06-10"),
            exitedAt: new Date("2023-06-15"),
            actions: ["added_to_cart", "compared_products"],
            triggers: ["email_campaign"],
          },
          {
            id: "first_purchase",
            name: "ซื้อครั้งแรก",
            enteredAt: new Date("2023-06-15"),
            exitedAt: new Date("2023-07-01"),
            actions: ["completed_purchase", "left_review"],
            triggers: ["discount_offer"],
          },
          {
            id: "loyal_customer",
            name: "ลูกค้าประจำ",
            enteredAt: new Date("2023-07-01"),
            actions: ["repeat_purchases", "referrals"],
            triggers: ["loyalty_program", "personalized_offers"],
          },
        ],
        nextActions: ["send_vip_upgrade_offer", "recommend_premium_products", "invite_to_exclusive_events"],
      }

      return journey
    } catch (error) {
      logger.error("Error getting customer journey:", error)
      return null
    }
  }

  async calculateCustomerLTV(customerId: string): Promise<number> {
    try {
      const profile = await this.getCustomerProfile(customerId)
      if (!profile) return 0

      // Simple LTV calculation: (Average Order Value × Purchase Frequency × Customer Lifespan)
      const averageOrderValue = profile.totalSpent / profile.orderCount
      const daysSinceRegistration = (Date.now() - profile.registrationDate.getTime()) / (1000 * 60 * 60 * 24)
      const purchaseFrequency = profile.orderCount / (daysSinceRegistration / 30) // Orders per month
      const estimatedLifespan = 24 // months

      const ltv = averageOrderValue * purchaseFrequency * estimatedLifespan

      return Math.round(ltv)
    } catch (error) {
      logger.error("Error calculating customer LTV:", error)
      return 0
    }
  }

  async updateCustomerTags(customerId: string): Promise<string[]> {
    try {
      const profile = await this.getCustomerProfile(customerId)
      if (!profile) return []

      const tags: string[] = []

      // Value-based tags
      if (profile.totalSpent > 50000) tags.push("vip_customer")
      else if (profile.totalSpent > 20000) tags.push("high_value_customer")
      else if (profile.totalSpent > 5000) tags.push("regular_customer")
      else tags.push("new_customer")

      // Behavior-based tags
      if (profile.orderCount > 10) tags.push("frequent_buyer")
      if (profile.orderCount === 1) tags.push("one_time_buyer")

      // Risk-based tags
      const daysSinceLastOrder = (Date.now() - profile.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastOrder > 90) tags.push("at_risk")
      else if (daysSinceLastOrder > 180) tags.push("churned")

      // Loyalty-based tags
      if (profile.loyaltyTier === "platinum") tags.push("platinum_member")
      else if (profile.loyaltyTier === "gold") tags.push("gold_member")

      // Category preference tags
      profile.preferredCategories.forEach((category) => {
        tags.push(`prefers_${category}`)
      })

      return tags
    } catch (error) {
      logger.error("Error updating customer tags:", error)
      return []
    }
  }

  async addCommunicationRecord(customerId: string, record: Omit<CommunicationRecord, "id">): Promise<void> {
    try {
      const communicationRecord: CommunicationRecord = {
        id: `comm_${Date.now()}`,
        ...record,
      }

      // In real implementation, save to database
      logger.info("Communication record added:", communicationRecord)
    } catch (error) {
      logger.error("Error adding communication record:", error)
      throw error
    }
  }

  async getSegmentAnalytics(): Promise<any> {
    try {
      const segments = await this.getCustomerSegments()

      const analytics = {
        totalCustomers: segments.reduce((sum, segment) => sum + segment.customerCount, 0),
        totalValue: segments.reduce((sum, segment) => sum + segment.customerCount * segment.averageValue, 0),
        segmentDistribution: segments.map((segment) => ({
          name: segment.name,
          count: segment.customerCount,
          percentage: 0, // Will be calculated
          value: segment.customerCount * segment.averageValue,
        })),
        riskAnalysis: {
          atRiskCustomers: segments.find((s) => s.id === "at_risk")?.customerCount || 0,
          highValueAtRisk: 8, // Mock data
          estimatedChurnValue: 156000, // Mock data
        },
      }

      // Calculate percentages
      analytics.segmentDistribution.forEach((segment) => {
        segment.percentage = (segment.count / analytics.totalCustomers) * 100
      })

      return analytics
    } catch (error) {
      logger.error("Error getting segment analytics:", error)
      throw error
    }
  }

  async calculateCustomerScore(customerId: string): Promise<{
    healthScore: number
    churnRisk: number
    upsellPotential: number
    recommendations: string[]
  }> {
    try {
      const profile = await this.getCustomerProfile(customerId)
      if (!profile) {
        return {
          healthScore: 0,
          churnRisk: 100,
          upsellPotential: 0,
          recommendations: [],
        }
      }

      // Health Score (0-100)
      let healthScore = 50
      if (profile.orderCount > 5) healthScore += 20
      if (profile.totalSpent > 20000) healthScore += 15
      if (profile.loyaltyPoints > 1000) healthScore += 10
      const daysSinceLastOrder = (Date.now() - profile.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastOrder < 30) healthScore += 5

      // Churn Risk (0-100, lower is better)
      let churnRisk = 20
      if (daysSinceLastOrder > 90) churnRisk += 40
      if (daysSinceLastOrder > 180) churnRisk += 30
      if (profile.orderCount === 1) churnRisk += 20

      // Upsell Potential (0-100)
      let upsellPotential = 30
      if (profile.loyaltyTier === "gold" || profile.loyaltyTier === "platinum") upsellPotential += 25
      if (profile.orderCount > 3) upsellPotential += 20
      if (profile.totalSpent > 10000) upsellPotential += 15

      // Recommendations
      const recommendations: string[] = []
      if (churnRisk > 60) recommendations.push("send_winback_campaign")
      if (upsellPotential > 70) recommendations.push("offer_premium_upgrade")
      if (healthScore > 80) recommendations.push("invite_to_vip_program")
      if (daysSinceLastOrder > 60) recommendations.push("send_personalized_offer")

      return {
        healthScore: Math.min(100, Math.max(0, healthScore)),
        churnRisk: Math.min(100, Math.max(0, churnRisk)),
        upsellPotential: Math.min(100, Math.max(0, upsellPotential)),
        recommendations,
      }
    } catch (error) {
      logger.error("Error calculating customer score:", error)
      return {
        healthScore: 0,
        churnRisk: 100,
        upsellPotential: 0,
        recommendations: [],
      }
    }
  }
}

export const advancedCRMService = new AdvancedCRMService()
