import { marketingAutomation } from "./marketing-automation"
import { advancedCRMService } from "./advanced-crm-service"
import { analytics } from "./analytics-service"
import { logger } from "./logger"

interface BehavioralTrigger {
  id: string
  name: string
  event: string
  conditions: TriggerCondition[]
  actions: AutomatedAction[]
  cooldownPeriod: number // minutes
  isActive: boolean
}

interface TriggerCondition {
  field: string
  operator: "equals" | "greater_than" | "less_than" | "contains" | "not_equals"
  value: any
}

interface AutomatedAction {
  type: "email" | "sms" | "tag_customer" | "update_segment" | "create_task" | "webhook"
  template?: string
  data: Record<string, any>
  delay?: number // minutes
}

interface PersonalizationRule {
  id: string
  name: string
  segment: string[]
  content: PersonalizedContent
  priority: number
}

interface PersonalizedContent {
  emailSubject?: string
  emailTemplate?: string
  productRecommendations?: string[]
  discountOffer?: {
    type: "percentage" | "fixed"
    value: number
    minOrder?: number
  }
}

export class CustomerJourneyAutomationService {
  private triggers: BehavioralTrigger[] = []
  private personalizationRules: PersonalizationRule[] = []
  private triggerHistory: Map<string, number> = new Map()

  constructor() {
    this.initializeDefaultTriggers()
    this.initializePersonalizationRules()
  }

  private initializeDefaultTriggers() {
    this.triggers = [
      {
        id: "cart_abandonment",
        name: "Cart Abandonment",
        event: "cart_abandoned",
        conditions: [
          { field: "cart_value", operator: "greater_than", value: 500 },
          { field: "minutes_since_abandon", operator: "greater_than", value: 30 },
        ],
        actions: [
          {
            type: "email",
            template: "cart_abandonment_1",
            data: { discount: 10 },
            delay: 0,
          },
          {
            type: "email",
            template: "cart_abandonment_2",
            data: { discount: 15 },
            delay: 1440, // 24 hours
          },
        ],
        cooldownPeriod: 4320, // 3 days
        isActive: true,
      },
      {
        id: "first_purchase_celebration",
        name: "First Purchase Celebration",
        event: "first_purchase_completed",
        conditions: [{ field: "order_count", operator: "equals", value: 1 }],
        actions: [
          {
            type: "email",
            template: "first_purchase_thank_you",
            data: { loyalty_points: 100 },
            delay: 60, // 1 hour
          },
          {
            type: "tag_customer",
            data: { tags: ["first_time_buyer", "engaged"] },
          },
        ],
        cooldownPeriod: 0,
        isActive: true,
      },
      {
        id: "vip_upgrade_trigger",
        name: "VIP Upgrade Trigger",
        event: "spending_threshold_reached",
        conditions: [
          { field: "total_spent", operator: "greater_than", value: 50000 },
          { field: "loyalty_tier", operator: "not_equals", value: "vip" },
        ],
        actions: [
          {
            type: "email",
            template: "vip_upgrade_invitation",
            data: { new_tier: "vip" },
          },
          {
            type: "update_segment",
            data: { segment: "vip", action: "add" },
          },
        ],
        cooldownPeriod: 0,
        isActive: true,
      },
      {
        id: "win_back_inactive",
        name: "Win Back Inactive Customers",
        event: "customer_inactive",
        conditions: [
          { field: "days_since_last_order", operator: "greater_than", value: 90 },
          { field: "total_orders", operator: "greater_than", value: 1 },
        ],
        actions: [
          {
            type: "email",
            template: "win_back_campaign",
            data: { discount: 20 },
          },
          {
            type: "tag_customer",
            data: { tags: ["at_risk", "win_back_target"] },
          },
        ],
        cooldownPeriod: 2160, // 1.5 days
        isActive: true,
      },
      {
        id: "product_view_follow_up",
        name: "Product View Follow-up",
        event: "product_viewed_multiple_times",
        conditions: [
          { field: "view_count", operator: "greater_than", value: 3 },
          { field: "hours_since_first_view", operator: "greater_than", value: 24 },
        ],
        actions: [
          {
            type: "email",
            template: "product_interest_follow_up",
            data: { discount: 5 },
          },
        ],
        cooldownPeriod: 1440, // 1 day
        isActive: true,
      },
    ]
  }

  private initializePersonalizationRules() {
    this.personalizationRules = [
      {
        id: "vip_personalization",
        name: "VIP Customer Personalization",
        segment: ["vip"],
        content: {
          emailSubject: "🌟 ข้อเสนอพิเศษสำหรับคุณ VIP",
          discountOffer: { type: "percentage", value: 25, minOrder: 2000 },
          productRecommendations: ["premium_collection"],
        },
        priority: 1,
      },
      {
        id: "frequent_buyer_personalization",
        name: "Frequent Buyer Personalization",
        segment: ["frequent_buyers"],
        content: {
          emailSubject: "🛍️ สินค้าใหม่สำหรับลูกค้าประจำ",
          discountOffer: { type: "percentage", value: 15 },
          productRecommendations: ["new_arrivals", "bestsellers"],
        },
        priority: 2,
      },
      {
        id: "new_customer_personalization",
        name: "New Customer Personalization",
        segment: ["new_customers"],
        content: {
          emailSubject: "🎉 ยินดีต้อนรับสู่ครอบครัวของเรา",
          discountOffer: { type: "percentage", value: 15 },
          productRecommendations: ["starter_collection", "popular_items"],
        },
        priority: 3,
      },
    ]
  }

  // Main trigger processing
  async processBehavioralTrigger(customerId: string, event: string, eventData: Record<string, any>) {
    try {
      const applicableTriggers = this.triggers.filter((trigger) => trigger.event === event && trigger.isActive)

      for (const trigger of applicableTriggers) {
        if (await this.shouldExecuteTrigger(customerId, trigger, eventData)) {
          await this.executeTrigger(customerId, trigger, eventData)
          this.recordTriggerExecution(customerId, trigger.id)
        }
      }
    } catch (error) {
      logger.error("Error processing behavioral trigger:", error)
    }
  }

  private async shouldExecuteTrigger(
    customerId: string,
    trigger: BehavioralTrigger,
    eventData: Record<string, any>,
  ): Promise<boolean> {
    // Check cooldown period
    const lastExecution = this.triggerHistory.get(`${customerId}_${trigger.id}`)
    if (lastExecution) {
      const minutesSinceLastExecution = (Date.now() - lastExecution) / (1000 * 60)
      if (minutesSinceLastExecution < trigger.cooldownPeriod) {
        return false
      }
    }

    // Check conditions
    for (const condition of trigger.conditions) {
      if (!this.evaluateCondition(condition, eventData)) {
        return false
      }
    }

    return true
  }

  private evaluateCondition(condition: TriggerCondition, data: Record<string, any>): boolean {
    const fieldValue = data[condition.field]

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value
      case "not_equals":
        return fieldValue !== condition.value
      case "greater_than":
        return Number(fieldValue) > Number(condition.value)
      case "less_than":
        return Number(fieldValue) < Number(condition.value)
      case "contains":
        return String(fieldValue).includes(String(condition.value))
      default:
        return false
    }
  }

  private async executeTrigger(customerId: string, trigger: BehavioralTrigger, eventData: Record<string, any>) {
    logger.info(`Executing trigger ${trigger.name} for customer ${customerId}`)

    for (const action of trigger.actions) {
      if (action.delay && action.delay > 0) {
        // Schedule delayed action
        setTimeout(
          () => {
            this.executeAction(customerId, action, eventData)
          },
          action.delay * 60 * 1000,
        )
      } else {
        await this.executeAction(customerId, action, eventData)
      }
    }

    // Track trigger execution
    analytics.trackEvent("trigger_executed", "automation", trigger.name, 1, {
      customerId,
      triggerType: trigger.event,
      actionsCount: trigger.actions.length,
    })
  }

  private async executeAction(customerId: string, action: AutomatedAction, eventData: Record<string, any>) {
    try {
      switch (action.type) {
        case "email":
          await this.sendPersonalizedEmail(customerId, action.template!, action.data, eventData)
          break
        case "sms":
          await this.sendPersonalizedSMS(customerId, action.data)
          break
        case "tag_customer":
          await this.tagCustomer(customerId, action.data.tags)
          break
        case "update_segment":
          await this.updateCustomerSegment(customerId, action.data)
          break
        case "create_task":
          await this.createFollowUpTask(customerId, action.data)
          break
        case "webhook":
          await this.callWebhook(action.data.url, { customerId, ...eventData })
          break
      }
    } catch (error) {
      logger.error(`Error executing action ${action.type}:`, error)
    }
  }

  // Personalization engine
  async getPersonalizedContent(customerId: string, contentType: string): Promise<PersonalizedContent | null> {
    try {
      const customerProfile = await advancedCRMService.getCustomerProfile(customerId)
      if (!customerProfile) return null

      // Find applicable personalization rules
      const applicableRules = this.personalizationRules
        .filter((rule) => rule.segment.some((segment) => customerProfile.segments.includes(segment)))
        .sort((a, b) => a.priority - b.priority)

      if (applicableRules.length === 0) return null

      // Use the highest priority rule
      const selectedRule = applicableRules[0]

      // Enhance content with dynamic data
      const personalizedContent = { ...selectedRule.content }

      // Add customer-specific product recommendations
      if (personalizedContent.productRecommendations) {
        personalizedContent.productRecommendations = await this.getPersonalizedProductRecommendations(
          customerId,
          personalizedContent.productRecommendations,
        )
      }

      return personalizedContent
    } catch (error) {
      logger.error("Error getting personalized content:", error)
      return null
    }
  }

  private async sendPersonalizedEmail(
    customerId: string,
    template: string,
    actionData: Record<string, any>,
    eventData: Record<string, any>,
  ) {
    const personalizedContent = await this.getPersonalizedContent(customerId, "email")
    const customerProfile = await advancedCRMService.getCustomerProfile(customerId)

    if (!customerProfile) return

    // Merge personalization with action data
    const emailData = {
      ...actionData,
      ...personalizedContent,
      customerName: customerProfile.name,
      loyaltyPoints: customerProfile.loyaltyPoints,
      ...eventData,
    }

    // Send email through marketing automation
    await marketingAutomation.sendPersonalizedEmail(customerProfile, template, emailData)

    // Track email sent
    analytics.trackEvent("personalized_email_sent", "automation", template, 1, {
      customerId,
      template,
      personalized: !!personalizedContent,
    })
  }

  private async sendPersonalizedSMS(customerId: string, data: Record<string, any>) {
    const customerProfile = await advancedCRMService.getCustomerProfile(customerId)
    if (!customerProfile?.phone) return

    const personalizedContent = await this.getPersonalizedContent(customerId, "sms")
    const message = this.generatePersonalizedSMSMessage(customerProfile, data, personalizedContent)

    await marketingAutomation.sendSMS(customerProfile.phone, message)
  }

  private generatePersonalizedSMSMessage(
    customer: any,
    data: Record<string, any>,
    personalization?: PersonalizedContent | null,
  ): string {
    let message = `สวัสดี คุณ${customer.name}! `

    if (personalization?.discountOffer) {
      const discount = personalization.discountOffer
      message += `รับส่วนลด ${discount.value}${discount.type === "percentage" ? "%" : " บาท"} `
      if (discount.minOrder) {
        message += `เมื่อสั่งซื้อขั้นต่ำ ${discount.minOrder} บาท `
      }
    }

    message += `เยี่ยมชมร้านค้าของเราได้ที่ ${process.env.NEXT_PUBLIC_SITE_URL}`

    return message
  }

  private async tagCustomer(customerId: string, tags: string[]) {
    // In real implementation, update customer tags in database
    logger.info(`Adding tags to customer ${customerId}:`, tags)

    analytics.trackEvent("customer_tagged", "automation", "tag_added", tags.length, {
      customerId,
      tags,
    })
  }

  private async updateCustomerSegment(customerId: string, data: Record<string, any>) {
    // In real implementation, update customer segment in database
    logger.info(`Updating customer ${customerId} segment:`, data)

    analytics.trackEvent("segment_updated", "automation", data.segment, 1, {
      customerId,
      action: data.action,
    })
  }

  private async createFollowUpTask(customerId: string, data: Record<string, any>) {
    // In real implementation, create task in CRM system
    logger.info(`Creating follow-up task for customer ${customerId}:`, data)

    analytics.trackEvent("task_created", "automation", data.taskType, 1, {
      customerId,
      priority: data.priority,
    })
  }

  private async callWebhook(url: string, data: Record<string, any>) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } catch (error) {
      logger.error("Webhook call failed:", error)
    }
  }

  private async getPersonalizedProductRecommendations(customerId: string, categories: string[]): Promise<string[]> {
    // Mock implementation - in real app, use ML/AI recommendations
    return categories.slice(0, 3)
  }

  private recordTriggerExecution(customerId: string, triggerId: string) {
    this.triggerHistory.set(`${customerId}_${triggerId}`, Date.now())
  }

  // Management methods
  async createTrigger(trigger: Omit<BehavioralTrigger, "id">): Promise<BehavioralTrigger> {
    const newTrigger: BehavioralTrigger = {
      ...trigger,
      id: `trigger_${Date.now()}`,
    }

    this.triggers.push(newTrigger)
    return newTrigger
  }

  async updateTrigger(triggerId: string, updates: Partial<BehavioralTrigger>): Promise<boolean> {
    const index = this.triggers.findIndex((t) => t.id === triggerId)
    if (index === -1) return false

    this.triggers[index] = { ...this.triggers[index], ...updates }
    return true
  }

  async getTriggers(): Promise<BehavioralTrigger[]> {
    return this.triggers
  }

  async getPersonalizationRules(): Promise<PersonalizationRule[]> {
    return this.personalizationRules
  }

  // Analytics and reporting
  async getTriggerAnalytics(dateRange?: { start: string; end: string }) {
    const triggerExecutions = Array.from(this.triggerHistory.entries())

    let filteredExecutions = triggerExecutions
    if (dateRange) {
      const startTime = new Date(dateRange.start).getTime()
      const endTime = new Date(dateRange.end).getTime()
      filteredExecutions = triggerExecutions.filter(([_, timestamp]) => timestamp >= startTime && timestamp <= endTime)
    }

    const triggerCounts = new Map<string, number>()
    filteredExecutions.forEach(([key]) => {
      const triggerId = key.split("_").slice(1).join("_")
      triggerCounts.set(triggerId, (triggerCounts.get(triggerId) || 0) + 1)
    })

    return {
      totalExecutions: filteredExecutions.length,
      triggerBreakdown: Array.from(triggerCounts.entries()).map(([triggerId, count]) => ({
        triggerId,
        triggerName: this.triggers.find((t) => t.id === triggerId)?.name || triggerId,
        executions: count,
      })),
      activeTriggersCount: this.triggers.filter((t) => t.isActive).length,
      totalTriggersCount: this.triggers.length,
    }
  }
}

export const customerJourneyAutomation = new CustomerJourneyAutomationService()
export type { BehavioralTrigger, AutomatedAction, PersonalizationRule }
