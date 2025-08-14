import { enhancedEmailTemplates, type EmailTemplate, type EmailCampaign } from "./enhanced-email-templates"
import { emailService } from "./email"
import { supabase } from "./supabase"
import { USE_SUPABASE } from "./runtime"

interface CampaignAnalytics {
  campaignId: string
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  unsubscribed: number
  bounced: number
  converted: number
  revenue: number
  openRate: number
  clickRate: number
  conversionRate: number
  roi: number
  costPerConversion: number
}

interface SegmentationRule {
  id: string
  name: string
  conditions: Array<{
    field: string
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in" | "not_in"
    value: any
  }>
  logic: "AND" | "OR"
}

class AdvancedCampaignManager {
  private campaigns: EmailCampaign[] = []
  private segmentationRules: SegmentationRule[] = []

  // Campaign Management
  async createCampaign(
    campaign: Omit<EmailCampaign, "id" | "createdAt" | "updatedAt" | "metrics">,
  ): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: `campaign_${Date.now()}`,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        converted: 0,
        revenue: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.campaigns.push(newCampaign)

    if (USE_SUPABASE) {
      await supabase.from("email_campaigns").insert([newCampaign])
    }

    return newCampaign
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    if (USE_SUPABASE) {
      const { data } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false })
      return data || []
    }
    return this.campaigns
  }

  async getCampaign(id: string): Promise<EmailCampaign | null> {
    if (USE_SUPABASE) {
      const { data } = await supabase.from("email_campaigns").select("*").eq("id", id).single()
      return data
    }
    return this.campaigns.find((c) => c.id === id) || null
  }

  async updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    const updatedCampaign = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    if (USE_SUPABASE) {
      const { data } = await supabase.from("email_campaigns").update(updatedCampaign).eq("id", id).select().single()
      return data
    }

    const campaignIndex = this.campaigns.findIndex((c) => c.id === id)
    if (campaignIndex === -1) return null

    this.campaigns[campaignIndex] = {
      ...this.campaigns[campaignIndex],
      ...updatedCampaign,
    }

    return this.campaigns[campaignIndex]
  }

  // A/B Testing
  async createABTest(
    campaignId: string,
    variants: Array<{
      name: string
      templateId: string
      percentage: number
    }>,
  ): Promise<EmailCampaign | null> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign) return null

    // Ensure percentages add up to 100
    const totalPercentage = variants.reduce((sum, v) => sum + v.percentage, 0)
    if (totalPercentage !== 100) {
      throw new Error("Variant percentages must add up to 100%")
    }

    const abTestConfig = {
      enabled: true,
      variants: variants.map((variant, index) => ({
        id: `variant_${Date.now()}_${index}`,
        ...variant,
      })),
    }

    return await this.updateCampaign(campaignId, { abTest: abTestConfig })
  }

  // Customer Segmentation
  async createSegmentationRule(rule: Omit<SegmentationRule, "id">): Promise<SegmentationRule> {
    const newRule: SegmentationRule = {
      ...rule,
      id: `segment_${Date.now()}`,
    }

    this.segmentationRules.push(newRule)

    if (USE_SUPABASE) {
      await supabase.from("segmentation_rules").insert([newRule])
    }

    return newRule
  }

  async getCustomersBySegment(segmentId: string): Promise<any[]> {
    const rule = this.segmentationRules.find((r) => r.id === segmentId)
    if (!rule) return []

    // Mock implementation - in real app, this would query the database
    // based on the segmentation rules
    const mockCustomers = [
      {
        id: "1",
        name: "สมชาย ใจดี",
        email: "somchai@example.com",
        totalSpent: 15000,
        orderCount: 5,
        lastOrderDate: "2024-01-15",
        customerType: "regular",
      },
      {
        id: "2",
        name: "สมหญิง สวยงาม",
        email: "somying@example.com",
        totalSpent: 35000,
        orderCount: 12,
        lastOrderDate: "2024-01-20",
        customerType: "vip",
      },
    ]

    // Apply segmentation rules (simplified)
    return mockCustomers.filter((customer) => {
      return rule.conditions.every((condition) => {
        const fieldValue = (customer as any)[condition.field]

        switch (condition.operator) {
          case "equals":
            return fieldValue === condition.value
          case "greater_than":
            return fieldValue > condition.value
          case "less_than":
            return fieldValue < condition.value
          case "contains":
            return String(fieldValue).includes(condition.value)
          default:
            return true
        }
      })
    })
  }

  // Campaign Execution
  async executeCampaign(campaignId: string): Promise<{
    success: boolean
    sentCount: number
    errors: string[]
  }> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign) {
      return { success: false, sentCount: 0, errors: ["Campaign not found"] }
    }

    const template = await enhancedEmailTemplates.getTemplate(campaign.templateId)
    if (!template) {
      return { success: false, sentCount: 0, errors: ["Template not found"] }
    }

    // Get target customers
    let customers: any[] = []
    for (const segmentId of campaign.targetSegment) {
      const segmentCustomers = await this.getCustomersBySegment(segmentId)
      customers = [...customers, ...segmentCustomers]
    }

    // Remove duplicates
    customers = customers.filter((customer, index, self) => index === self.findIndex((c) => c.id === customer.id))

    const errors: string[] = []
    let sentCount = 0

    // Handle A/B testing
    if (campaign.abTest?.enabled && campaign.abTest.variants.length > 0) {
      const variantResults = await this.executeABTest(campaign, customers, template)
      sentCount = variantResults.sentCount
      errors.push(...variantResults.errors)
    } else {
      // Regular campaign execution
      for (const customer of customers) {
        try {
          const personalizedHtml = enhancedEmailTemplates.processTemplate(template.html, {
            customer_name: customer.name,
            brand_name: "SofaCover Pro",
            shop_url: process.env.NEXT_PUBLIC_SITE_URL + "/products",
            support_email: "support@sofacoverpro.com",
            phone_number: "02-123-4567",
            unsubscribe_url: process.env.NEXT_PUBLIC_SITE_URL + "/unsubscribe?email=" + customer.email,
          })

          const personalizedSubject = enhancedEmailTemplates.processTemplate(template.subject, {
            customer_name: customer.name,
            brand_name: "SofaCover Pro",
          })

          await emailService.sendBulkEmail([customer.email], personalizedSubject, personalizedHtml)
          sentCount++
        } catch (error) {
          errors.push(`Failed to send to ${customer.email}: ${error}`)
        }
      }
    }

    // Update campaign metrics
    await this.updateCampaign(campaignId, {
      metrics: {
        ...campaign.metrics,
        sent: campaign.metrics.sent + sentCount,
      },
    })

    return {
      success: errors.length === 0,
      sentCount,
      errors,
    }
  }

  private async executeABTest(
    campaign: EmailCampaign,
    customers: any[],
    defaultTemplate: EmailTemplate,
  ): Promise<{
    sentCount: number
    errors: string[]
  }> {
    const errors: string[] = []
    let sentCount = 0

    if (!campaign.abTest?.variants) return { sentCount: 0, errors: ["No A/B test variants found"] }

    // Distribute customers across variants
    const shuffledCustomers = [...customers].sort(() => Math.random() - 0.5)
    let customerIndex = 0

    for (const variant of campaign.abTest.variants) {
      const variantCustomerCount = Math.floor((customers.length * variant.percentage) / 100)
      const variantCustomers = shuffledCustomers.slice(customerIndex, customerIndex + variantCustomerCount)
      customerIndex += variantCustomerCount

      const template = (await enhancedEmailTemplates.getTemplate(variant.templateId)) || defaultTemplate

      for (const customer of variantCustomers) {
        try {
          const personalizedHtml = enhancedEmailTemplates.processTemplate(template.html, {
            customer_name: customer.name,
            brand_name: "SofaCover Pro",
            shop_url: process.env.NEXT_PUBLIC_SITE_URL + "/products",
            support_email: "support@sofacoverpro.com",
            phone_number: "02-123-4567",
            unsubscribe_url: process.env.NEXT_PUBLIC_SITE_URL + "/unsubscribe?email=" + customer.email,
          })

          const personalizedSubject = enhancedEmailTemplates.processTemplate(template.subject, {
            customer_name: customer.name,
            brand_name: "SofaCover Pro",
          })

          await emailService.sendBulkEmail([customer.email], personalizedSubject, personalizedHtml)
          sentCount++
        } catch (error) {
          errors.push(`Failed to send variant ${variant.name} to ${customer.email}: ${error}`)
        }
      }
    }

    return { sentCount, errors }
  }

  // Analytics
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign) return null

    const metrics = campaign.metrics
    const openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0
    const clickRate = metrics.sent > 0 ? (metrics.clicked / metrics.sent) * 100 : 0
    const conversionRate = metrics.sent > 0 ? (metrics.converted / metrics.sent) * 100 : 0
    const roi = metrics.revenue > 0 ? ((metrics.revenue - 1000) / 1000) * 100 : 0 // Assuming 1000 THB campaign cost
    const costPerConversion = metrics.converted > 0 ? 1000 / metrics.converted : 0

    return {
      campaignId,
      totalSent: metrics.sent,
      delivered: metrics.delivered,
      opened: metrics.opened,
      clicked: metrics.clicked,
      unsubscribed: metrics.unsubscribed,
      bounced: metrics.bounced,
      converted: metrics.converted,
      revenue: metrics.revenue,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      costPerConversion: Math.round(costPerConversion * 100) / 100,
    }
  }

  async getOverallAnalytics(dateRange?: { start: string; end: string }): Promise<{
    totalCampaigns: number
    totalEmailsSent: number
    averageOpenRate: number
    averageClickRate: number
    totalRevenue: number
    topPerformingCampaigns: Array<{ id: string; name: string; openRate: number; revenue: number }>
  }> {
    let campaigns = this.campaigns

    if (dateRange) {
      campaigns = campaigns.filter((c) => c.createdAt >= dateRange.start && c.createdAt <= dateRange.end)
    }

    const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.metrics.sent, 0)
    const totalOpened = campaigns.reduce((sum, c) => sum + c.metrics.opened, 0)
    const totalClicked = campaigns.reduce((sum, c) => sum + c.metrics.clicked, 0)
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0)

    const averageOpenRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0
    const averageClickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0

    const topPerformingCampaigns = campaigns
      .map((c) => ({
        id: c.id,
        name: c.name,
        openRate: c.metrics.sent > 0 ? (c.metrics.opened / c.metrics.sent) * 100 : 0,
        revenue: c.metrics.revenue,
      }))
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, 5)

    return {
      totalCampaigns: campaigns.length,
      totalEmailsSent,
      averageOpenRate: Math.round(averageOpenRate * 100) / 100,
      averageClickRate: Math.round(averageClickRate * 100) / 100,
      totalRevenue,
      topPerformingCampaigns,
    }
  }
}

export const advancedCampaignManager = new AdvancedCampaignManager()
export type { EmailCampaign, CampaignAnalytics, SegmentationRule }
