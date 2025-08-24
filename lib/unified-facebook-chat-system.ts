import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/client"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { messengerService } from "@/lib/messenger-integration"

export interface UnifiedChatMessage {
  id: string
  conversation_id: string
  sender_type: "customer" | "agent" | "ai" | "system"
  sender_id: string
  sender_name: string
  content: string
  channel: "facebook" | "messenger" | "live_chat" | "whatsapp" | "email"
  message_type: "text" | "image" | "file" | "quick_reply" | "template"
  ai_analysis?: {
    sentiment: "positive" | "negative" | "neutral"
    intent: string
    confidence: number
    suggested_responses: string[]
  }
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FacebookPageIntegration {
  page_id: string
  page_name: string
  access_token: string
  webhook_verified: boolean
  auto_reply_enabled: boolean
  ai_assistance_level: "none" | "suggestions" | "auto_respond" | "full_automation"
  business_hours: {
    enabled: boolean
    timezone: string
    schedule: Record<string, { start: string; end: string }>
  }
  response_templates: {
    greeting: string
    away_message: string
    fallback_response: string
  }
}

export class UnifiedFacebookChatSystem {
  private supabase = createClient()
  private aiModel = xai("grok-beta")

  async processIncomingMessage(
    pageId: string,
    senderId: string,
    message: any,
    channel: "facebook" | "messenger" = "facebook",
  ): Promise<{ success: boolean; response?: string; escalated?: boolean }> {
    try {
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(pageId, senderId, channel)

      // Store message with unified format
      const unifiedMessage = await this.storeUnifiedMessage({
        conversation_id: conversation.id,
        sender_type: "customer",
        sender_id: senderId,
        sender_name: message.sender_name || "Facebook User",
        content: message.text || message.content,
        channel,
        message_type: "text",
        metadata: {
          facebook_message_id: message.mid,
          timestamp: message.timestamp,
          page_id: pageId,
        },
      })

      // AI Analysis with consolidated logic
      const analysis = await this.analyzeMessageWithAI(unifiedMessage)

      // Update message with AI insights
      await this.updateMessageAnalysis(unifiedMessage.id, analysis)

      // Determine response strategy
      const responseStrategy = await this.determineResponseStrategy(conversation, unifiedMessage, analysis)

  // Execute response based on strategy
  const execResult = await this.executeResponseStrategy(responseStrategy, conversation, unifiedMessage)
  return execResult as { success: boolean; response?: string; escalated?: boolean }
    } catch (error) {
      logger.error("[Unified Facebook Chat] Message processing failed:", error)
      return { success: false }
    }
  }

  private async analyzeMessageWithAI(message: UnifiedChatMessage) {
    try {
      // Get conversation context
      const context = await this.getConversationContext(message.conversation_id)

      const { text: analysisResult } = await generateText({
        model: this.aiModel,
        prompt: `Analyze this Facebook/Messenger conversation message:

Message: "${message.content}"
Channel: ${message.channel}
Previous Context: ${context.recentMessages.map((m) => `${m.sender_name}: ${m.content}`).join("\n")}

Customer Profile: ${JSON.stringify(context.customerProfile, null, 2)}

Provide comprehensive analysis in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "intent": "inquiry|complaint|purchase|support|compliment|pricing|fabric_selection",
  "confidence": 0-100,
  "urgency": "low|medium|high|critical",
  "topics": ["topic1", "topic2"],
  "customer_satisfaction_prediction": 0-100,
  "purchase_intent_score": 0-100,
  "suggested_responses": ["response1", "response2", "response3"],
  "escalation_needed": boolean,
  "auto_response_appropriate": boolean,
  "business_value": "low|medium|high",
  "next_best_action": "respond|escalate|offer_product|schedule_call|send_catalog"
}

Focus on SofaCover Pro business context - fabric selection, custom covers, pricing, delivery.`,
      })

      return JSON.parse(analysisResult)
    } catch (error) {
      logger.error("[Unified Facebook Chat] AI analysis failed:", error)
      return {
        sentiment: "neutral",
        intent: "inquiry",
        confidence: 50,
        urgency: "medium",
        topics: ["general"],
        suggested_responses: ["ขอบคุณสำหรับข้อความของคุณ เราจะตอบกลับในไม่ช้า"],
        escalation_needed: false,
        auto_response_appropriate: true,
      }
    }
  }

  private async determineResponseStrategy(conversation: any, message: UnifiedChatMessage, analysis: any) {
    const pageConfig = await this.getPageConfiguration(conversation.page_id)
    const customerInsight = await this.getCustomerInsight(conversation.customer_id)

    // Business hours check
    const isBusinessHours = this.isWithinBusinessHours(pageConfig.business_hours)

    // Determine strategy based on multiple factors
    if (analysis.escalation_needed || analysis.urgency === "critical") {
      return {
        type: "escalate",
        priority: "high",
        reason: "Critical issue or escalation needed",
      }
    }

    if (!isBusinessHours && pageConfig.business_hours.enabled) {
      return {
        type: "auto_away_message",
        template: pageConfig.response_templates.away_message,
        schedule_follow_up: true,
      }
    }

    if (analysis.auto_response_appropriate && pageConfig.ai_assistance_level !== "none" && analysis.confidence > 70) {
      return {
        type: "ai_auto_response",
        confidence: analysis.confidence,
        suggested_responses: analysis.suggested_responses,
        next_action: analysis.next_best_action,
      }
    }

    if (pageConfig.ai_assistance_level === "suggestions") {
      return {
        type: "agent_with_ai_suggestions",
        suggestions: analysis.suggested_responses,
        context: analysis,
      }
    }

    return {
      type: "manual_response",
      priority: analysis.urgency,
      context: analysis,
    }
  }

  private async executeResponseStrategy(strategy: any, conversation: any, originalMessage: UnifiedChatMessage) {
    switch (strategy.type) {
      case "ai_auto_response":
        return await this.sendAIResponse(conversation, originalMessage, strategy)

      case "auto_away_message":
        return await this.sendAwayMessage(conversation, strategy)

      case "escalate":
        return await this.escalateToHuman(conversation, originalMessage, strategy)

      case "agent_with_ai_suggestions":
        return await this.notifyAgentWithSuggestions(conversation, originalMessage, strategy)

      default:
        return await this.queueForManualResponse(conversation, originalMessage, strategy)
    }
  }

  async getSmartFAQResponse(query: string, context: any): Promise<string | null> {
    try {
      const { text: faqResult } = await generateText({
        model: this.aiModel,
        prompt: `Find the best FAQ response for this customer query about SofaCover Pro:

Query: "${query}"
Customer Context: ${JSON.stringify(context, null, 2)}

Available FAQ Topics:
- Fabric types and materials
- Custom sizing and measurements  
- Pricing and payment options
- Delivery and installation
- Care and maintenance
- Returns and warranty
- Bulk orders for businesses

If you can provide a helpful answer based on these topics, return a comprehensive response in Thai.
If the query is too specific or outside these topics, return "ESCALATE" to indicate human assistance needed.

Response should be:
- Friendly and professional
- Specific to SofaCover Pro products
- Include relevant details (pricing ranges, timeframes, etc.)
- End with a call-to-action or next step`,
      })

      return faqResult === "ESCALATE" ? null : faqResult
    } catch (error) {
      logger.error("[Unified Facebook Chat] FAQ generation failed:", error)
      return null
    }
  }

  private async getConversationContext(conversationId: string) {
    const [messages, customer, orders, interactions] = await Promise.all([
      this.getRecentMessages(conversationId, 10),
      this.getCustomerProfile(conversationId),
      this.getCustomerOrders(conversationId),
      this.getCustomerInteractions(conversationId),
    ])

    return {
      recentMessages: messages,
      customerProfile: customer,
      orderHistory: orders,
      interactionHistory: interactions,
      totalInteractions: interactions.length,
      avgResponseTime: this.calculateAvgResponseTime(messages),
      customerLifetimeValue: this.calculateLTV(orders),
    }
  }

  async generateUnifiedPerformanceReport(startDate: string, endDate: string, pageIds?: string[]) {
    try {
      const { data: conversations } = await this.supabase
        .from("unified_conversations")
        .select(`
          *,
          messages:unified_messages(count),
          page_config:facebook_pages(page_name)
        `)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .in("page_id", pageIds || [])

      const metrics = {
        total_conversations: conversations?.length || 0,
        channels_breakdown: this.analyzeChannelPerformance(conversations),
        response_times: this.analyzeResponseTimes(conversations),
        ai_performance: await this.analyzeAIPerformance(conversations),
        customer_satisfaction: await this.analyzeSatisfactionScores(conversations),
        business_impact: await this.analyzeBusinessImpact(conversations),
        recommendations: await this.generateRecommendations(conversations),
      }

      return {
        period: { start: startDate, end: endDate },
        summary: metrics,
        detailed_insights: await this.generateDetailedInsights(metrics),
        action_items: await this.generateActionItems(metrics),
      }
    } catch (error) {
      logger.error("[Unified Facebook Chat] Report generation failed:", error)
      throw error
    }
  }

  // Helper methods for unified operations
  private async storeUnifiedMessage(messageData: Partial<UnifiedChatMessage>) {
    const { data, error } = await this.supabase
      .from("unified_messages")
      .insert({
        ...messageData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  private async getOrCreateConversation(pageId: string, customerId: string, channel: string) {
    let { data: conversation } = await this.supabase
      .from("unified_conversations")
      .select("*")
      .eq("page_id", pageId)
      .eq("customer_id", customerId)
      .eq("status", "active")
      .single()

    if (!conversation) {
      const { data: newConversation } = await this.supabase
        .from("unified_conversations")
        .insert({
          id: crypto.randomUUID(),
          page_id: pageId,
          customer_id: customerId,
          channel,
          status: "active",
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      conversation = newConversation
    }

    return conversation
  }

  private async sendAIResponse(conversation: any, originalMessage: UnifiedChatMessage, strategy: any) {
    try {
      // Generate personalized response
      const response = strategy.suggested_responses[0] || "ขอบคุณสำหรับข้อความของคุณ"

      // Send via appropriate channel
      if (originalMessage.channel === "facebook" || originalMessage.channel === "messenger") {
        await messengerService.sendDirectMessage(conversation.customer_id, response)
      }

      // Store response message
      await this.storeUnifiedMessage({
        conversation_id: conversation.id,
        sender_type: "ai",
        sender_id: "ai_system",
        sender_name: "AI Assistant",
        content: response,
        channel: originalMessage.channel,
        message_type: "text",
        metadata: {
          ai_confidence: strategy.confidence,
          original_message_id: originalMessage.id,
        },
      })

      return { success: true, response }
    } catch (error) {
      logger.error("[Unified Facebook Chat] AI response failed:", error)
      return { success: false }
    }
  }

  private isWithinBusinessHours(businessHours: any): boolean {
    if (!businessHours.enabled) return true

    const now = new Date()
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const currentTime = now.toTimeString().slice(0, 5)

    const todaySchedule = businessHours.schedule[dayOfWeek]
    if (!todaySchedule) return false

    return currentTime >= todaySchedule.start && currentTime <= todaySchedule.end
  }

  private async getPageConfiguration(pageId: string): Promise<FacebookPageIntegration> {
    const { data } = await this.supabase.from("facebook_pages").select("*").eq("page_id", pageId).single()

    return (
      data || {
        page_id: pageId,
        page_name: "Unknown Page",
        access_token: "",
        webhook_verified: false,
        auto_reply_enabled: true,
        ai_assistance_level: "suggestions",
        business_hours: { enabled: false, timezone: "Asia/Bangkok", schedule: {} },
        response_templates: {
          greeting: "สวัสดีครับ! ยินดีต้อนรับสู่ ELF SofaCover Pro",
          away_message: "ขอบคุณสำหรับข้อความของคุณ เราจะตอบกลับในเวลาทำการ",
          fallback_response: "ขออภัย เราไม่เข้าใจคำถามของคุณ กรุณาติดต่อเจ้าหน้าที่",
        },
      }
    )
  }

  // Additional helper methods would be implemented here...
  private async getCustomerInsight(customerId: string) {
    /* Implementation */
  }
  private async escalateToHuman(conversation: any, message: any, strategy: any) {
    /* Implementation */
  }
  private async notifyAgentWithSuggestions(conversation: any, message: any, strategy: any) {
    /* Implementation */
  }
  private async queueForManualResponse(conversation: any, message: any, strategy: any) {
    /* Implementation */
  }
  private async sendAwayMessage(conversation: any, strategy: any) {
    /* Implementation */
  }
  private async updateMessageAnalysis(messageId: string, analysis: any) {
    /* Implementation */
  }
  private async getRecentMessages(conversationId: string, limit: number): Promise<any[]> {
    // Minimal implementation for build-time: return empty array when no real DB
    return []
  }
  private async getCustomerProfile(conversationId: string): Promise<any> {
    return {}
  }
  private async getCustomerOrders(conversationId: string): Promise<any[]> {
    return []
  }
  private async getCustomerInteractions(conversationId: string): Promise<any[]> {
    return []
  }
  private calculateAvgResponseTime(messages: any[]) {
    return 0
  }
  private calculateLTV(orders: any[]) {
    return 0
  }
  private analyzeChannelPerformance(conversations: any) {
    return {}
  }
  private analyzeResponseTimes(conversations: any) {
    return {}
  }
  private async analyzeAIPerformance(conversations: any) {
    return {}
  }
  private async analyzeSatisfactionScores(conversations: any) {
    return {}
  }
  private async analyzeBusinessImpact(conversations: any) {
    return {}
  }
  private async generateRecommendations(conversations: any) {
    return []
  }
  private async generateDetailedInsights(metrics: any) {
    return {}
  }
  private async generateActionItems(metrics: any) {
    return []
  }
}

export const unifiedFacebookChat = new UnifiedFacebookChatSystem()
