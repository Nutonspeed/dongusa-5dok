import { logger } from "@/lib/logger"
import { supabase as supabaseClient } from "@/lib/supabase/client"
// Removed AI SDK imports; using deterministic mocks instead to avoid build-time deps

export interface AIConversationAnalysis {
  sentiment: "positive" | "negative" | "neutral"
  intent: "inquiry" | "complaint" | "purchase" | "support" | "compliment"
  urgency: "low" | "medium" | "high" | "critical"
  topics: string[]
  suggested_responses: string[]
  customer_satisfaction_score: number
  escalation_needed: boolean
}

export interface CustomerInsight {
  customer_id: string
  behavior_pattern: "new" | "returning" | "vip" | "at_risk"
  purchase_history: any[]
  communication_preferences: {
    preferred_channel: string
    response_time_expectation: number
    language: string
    tone_preference: "formal" | "casual" | "friendly"
  }
  satisfaction_trend: number[]
  lifetime_value: number
  churn_risk: number
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  keywords: string[]
  usage_count: number
  effectiveness_score: number
  last_updated: string
}

export interface ConversationReport {
  period: { start: string; end: string }
  metrics: {
    total_conversations: number
    avg_response_time: number
    resolution_rate: number
    customer_satisfaction: number
    ai_automation_rate: number
  }
  channel_breakdown: { channel: string; count: number; satisfaction: number }[]
  topic_analysis: { topic: string; frequency: number; sentiment: number }[]
  agent_performance: { agent_id: string; efficiency_score: number; satisfaction: number }[]
  business_insights: {
    peak_hours: string[]
    common_issues: string[]
    improvement_suggestions: string[]
    revenue_impact: number
  }
}

export class AIEnhancedChatSystem {
  private supabase = supabaseClient
  // private aiModel removed; not needed for mocked implementation

  // AI-Powered Message Analysis
  async analyzeConversation(conversationId: string): Promise<AIConversationAnalysis> {
    try {
      // Get conversation messages
      const { data: messages } = await this.supabase
        .from("messages")
        .select("*")
        .eq("metadata->>conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (!messages?.length) {
        throw new Error("No messages found for conversation")
      }

      const conversationText = messages.map((m) => `${m.sender_name}: ${m.content}`).join("\n")
      // Simple heuristic mock analysis
      const lowered = conversationText.toLowerCase()
      const sentiment: AIConversationAnalysis["sentiment"] = lowered.includes("ขอบคุณ")
        ? "positive"
        : lowered.includes("แย่") || lowered.includes("โกรธ")
        ? "negative"
        : "neutral"
      const intent: AIConversationAnalysis["intent"] = lowered.includes("ราคา")
        ? "purchase"
        : lowered.includes("คืนเงิน") || lowered.includes("เคลม")
        ? "complaint"
        : "inquiry"
      const urgency: AIConversationAnalysis["urgency"] = lowered.includes("ด่วน") ? "high" : "medium"
      const topics = ["general"]
      const suggested_responses = [
        "ขอบคุณที่ติดต่อมา ทีมงานกำลังตรวจสอบและจะตอบกลับโดยเร็วครับ",
        "รบกวนขอรายละเอียดเพิ่มเติมเพื่อช่วยให้เราแก้ปัญหาได้ตรงจุดครับ",
        "หากสะดวก แจ้งหมายเลขคำสั่งซื้อเพื่อให้เราตรวจสอบได้ทันทีครับ",
      ]
      const customer_satisfaction_score = sentiment === "positive" ? 80 : sentiment === "negative" ? 40 : 60
      const escalation_needed = urgency === "high" && intent === "complaint"
      const analysis: AIConversationAnalysis = {
        sentiment,
        intent,
        urgency,
        topics,
        suggested_responses,
        customer_satisfaction_score,
        escalation_needed,
      }

      // Store analysis for future reference
      await this.supabase.from("conversation_analysis").upsert({
        conversation_id: conversationId,
        analysis: analysis,
        created_at: new Date().toISOString(),
      })

      return analysis
    } catch (error) {
      logger.error("[AI Chat] Conversation analysis failed:", error)
      // Return default analysis if AI fails
      return {
        sentiment: "neutral",
        intent: "inquiry",
        urgency: "medium",
        topics: ["general"],
        suggested_responses: ["ขอบคุณสำหรับข้อความของคุณ เราจะตอบกลับในไม่ช้า"],
        customer_satisfaction_score: 50,
        escalation_needed: false,
      }
    }
  }

  // Smart FAQ Management
  async findRelevantFAQ(query: string, limit = 5): Promise<FAQItem[]> {
    try {
      // Simple keyword extraction mock
      const relevantTopics = Array.from(
        new Set(
          query
            .toLowerCase()
            .split(/[^a-zA-Zก-๙0-9]+/)
            .filter((w) => w && w.length >= 3),
        ),
      ).slice(0, 5)

      // Search FAQ database with AI-suggested keywords
      const { data: faqs } = await this.supabase
        .from("faqs")
        .select("*")
        .or(relevantTopics.map((topic) => `keywords.cs.{${topic}}`).join(","))
        .order("effectiveness_score", { ascending: false })
        .limit(limit)

      return faqs || []
    } catch (error) {
      logger.error("[AI Chat] FAQ search failed:", error)
      return []
    }
  }

  // Personalized Response Generation
  async generatePersonalizedResponse(
    conversationId: string,
    customerInsight: CustomerInsight,
    context: string,
  ): Promise<string> {
    try {
      const analysis = await this.analyzeConversation(conversationId)
      const tone = customerInsight.communication_preferences.tone_preference || "friendly"
      const greeting = tone === "formal" ? "เรียนคุณลูกค้า" : "สวัสดีครับคุณลูกค้า"
      const urgency = analysis.urgency === "high" ? "เราจะเร่งดำเนินการให้ทันที" : "เราจะช่วยตรวจสอบอย่างรวดเร็ว"
      return `${greeting} ขอบคุณที่ติดต่อมาเกี่ยวกับเรื่อง: "${context}" จากข้อมูลของคุณ เรา${
        urgency
      } หากสะดวก รบกวนแจ้งรายละเอียดเพิ่มเติมเพื่อให้ทีมงานช่วยได้ตรงจุดครับ`
    } catch (error) {
      logger.error("[AI Chat] Response generation failed:", error)
      return "ขอบคุณสำหรับข้อความของคุณ ทีมงานจะตอบกลับในไม่ช้าครับ"
    }
  }

  // Customer Behavior Analysis
  async analyzeCustomerBehavior(customerId: string): Promise<CustomerInsight> {
    try {
      // Get customer data from multiple sources
      const [conversationData, orderData, profileData] = await Promise.all([
        this.supabase.from("conversations").select("*").eq("customer_id", customerId),
        this.supabase.from("orders").select("*").eq("customer_id", customerId),
        this.supabase.from("profiles").select("*").eq("id", customerId).single(),
      ])

      const behaviorData = {
        conversations: conversationData.data || [],
        orders: orderData.data || [],
        profile: profileData.data,
      }
      // Simple mock insight derived from existing data
      const orderCount = behaviorData.orders.length
      const behavior_pattern: CustomerInsight["behavior_pattern"] = orderCount >= 5 ? "vip" : orderCount >= 2 ? "returning" : "new"
      const lifetime_value = behaviorData.orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      const churn_risk = Math.max(5, 80 - orderCount * 10)
      return {
        customer_id: customerId,
        behavior_pattern,
        purchase_history: behaviorData.orders,
        communication_preferences: {
          preferred_channel: "live_chat",
          response_time_expectation: 300,
          language: "th",
          tone_preference: "friendly",
        },
        satisfaction_trend: [70, 72, 74, 76].slice(-Math.max(1, Math.min(4, orderCount || 1))),
        lifetime_value,
        churn_risk,
      }
    } catch (error) {
      logger.error("[AI Chat] Customer behavior analysis failed:", error)
      return {
        customer_id: customerId,
        behavior_pattern: "new",
        purchase_history: [],
        communication_preferences: {
          preferred_channel: "live_chat",
          response_time_expectation: 300,
          language: "th",
          tone_preference: "friendly",
        },
        satisfaction_trend: [50],
        lifetime_value: 0,
        churn_risk: 50,
      }
    }
  }

  // Automated Response System
  async processIncomingMessage(
    conversationId: string,
    message: string,
    channel: string,
    customerId: string,
  ): Promise<{ shouldAutoRespond: boolean; response?: string; escalate?: boolean }> {
    try {
      // Analyze message intent and urgency
      const analysis = await this.analyzeConversation(conversationId)

      // Get customer insights
      const customerInsight = await this.analyzeCustomerBehavior(customerId)

      // Check if auto-response is appropriate
      const shouldAutoRespond = this.shouldAutoRespond(analysis, customerInsight)

      if (shouldAutoRespond && !analysis.escalation_needed) {
        // Generate automated response
        const response = await this.generatePersonalizedResponse(conversationId, customerInsight, message)

        // Log auto-response for learning
        await this.logAutoResponse(conversationId, message, response, analysis)

        return { shouldAutoRespond: true, response }
      }

      return {
        shouldAutoRespond: false,
        escalate: analysis.escalation_needed || analysis.urgency === "critical",
      }
    } catch (error) {
      logger.error("[AI Chat] Auto-response processing failed:", error)
      return { shouldAutoRespond: false }
    }
  }

  // Business Intelligence Reports
  async generateConversationReport(
    startDate: string,
    endDate: string,
    channels?: string[],
  ): Promise<ConversationReport> {
    try {
      // Get actual data from database
      const conversationData = await this.getConversationData(startDate, endDate, channels)

      return {
        period: { start: startDate, end: endDate },
        metrics: conversationData.metrics,
        channel_breakdown: conversationData.channelBreakdown,
        topic_analysis: conversationData.topicAnalysis,
        agent_performance: conversationData.agentPerformance,
        business_insights: {
          peak_hours: ["13:00-15:00", "19:00-21:00"],
          common_issues: ["การเลือกขนาด", "ระยะเวลาจัดส่ง"],
          improvement_suggestions: ["เพิ่มคู่มือขนาดผ้า", "แจ้งสถานะการจัดส่งแบบเรียลไทม์"],
          revenue_impact: 0.12,
        },
      }
    } catch (error) {
      logger.error("[AI Chat] Report generation failed:", error)
      throw error
    }
  }

  // Smart FAQ Updates
  async updateFAQEffectiveness(): Promise<void> {
    try {
      const { data: faqs } = await this.supabase.from("faqs").select("*")

      for (const faq of faqs || []) {
        // Simple heuristic effectiveness score based on usage_count and presence of answer
        const base = faq.answer && faq.answer.length > 50 ? 60 : 40
        const effectiveness = Math.min(100, base + Math.floor((faq.usage_count || 0) / 5) * 5)

        await this.supabase
          .from("faqs")
          .update({
            effectiveness_score: effectiveness,
            last_updated: new Date().toISOString(),
          })
          .eq("id", faq.id)
      }
    } catch (error) {
      logger.error("[AI Chat] FAQ update failed:", error)
    }
  }

  // Private helper methods
  private shouldAutoRespond(analysis: AIConversationAnalysis, insight: CustomerInsight): boolean {
    // Auto-respond for simple inquiries from regular customers
    return (
      analysis.intent === "inquiry" &&
      analysis.urgency !== "critical" &&
      !analysis.escalation_needed &&
      insight.behavior_pattern !== "at_risk"
    )
  }

  private async logAutoResponse(
    conversationId: string,
    originalMessage: string,
    response: string,
    analysis: AIConversationAnalysis,
  ): Promise<void> {
    await this.supabase.from("auto_response_logs").insert({
      conversation_id: conversationId,
      original_message: originalMessage,
      generated_response: response,
      analysis: analysis,
      created_at: new Date().toISOString(),
    })
  }

  private async getConversationData(startDate: string, endDate: string, channels?: string[]) {
    // Mock implementation - in production, this would query actual data
    return {
      metrics: {
        total_conversations: 1250,
        avg_response_time: 180,
        resolution_rate: 0.89,
        customer_satisfaction: 4.6,
        ai_automation_rate: 0.65,
      },
      channelBreakdown: [
        { channel: "facebook", count: 450, satisfaction: 4.7 },
        { channel: "live_chat", count: 380, satisfaction: 4.8 },
        { channel: "email", count: 420, satisfaction: 4.4 },
      ],
      topicAnalysis: [
        { topic: "pricing", frequency: 35, sentiment: 0.7 },
        { topic: "fabric_selection", frequency: 28, sentiment: 0.8 },
        { topic: "delivery", frequency: 22, sentiment: 0.6 },
      ],
      agentPerformance: [
        { agent_id: "agent_1", efficiency_score: 92, satisfaction: 4.8 },
        { agent_id: "agent_2", efficiency_score: 88, satisfaction: 4.6 },
      ],
    }
  }
}

export const aiChatSystem = new AIEnhancedChatSystem()
