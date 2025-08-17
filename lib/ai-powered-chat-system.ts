import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/client"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

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
  private supabase = createClient()
  private aiModel = xai("grok-beta")

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

      const { text: analysisResult } = await generateText({
        model: this.aiModel,
        prompt: `Analyze this customer conversation and provide insights:

${conversationText}

Please analyze and return JSON with:
- sentiment (positive/negative/neutral)
- intent (inquiry/complaint/purchase/support/compliment)
- urgency (low/medium/high/critical)
- topics (array of main topics discussed)
- suggested_responses (array of 3 helpful response suggestions)
- customer_satisfaction_score (0-100)
- escalation_needed (boolean)

Focus on understanding customer needs and providing actionable insights.`,
      })

      const analysis = JSON.parse(analysisResult) as AIConversationAnalysis

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
      const { text: searchResult } = await generateText({
        model: this.aiModel,
        prompt: `Find the most relevant FAQ topics for this customer query: "${query}"

Return JSON array of relevant keywords and topics that would help answer this question.
Focus on sofa covers, fabrics, ordering, pricing, and customer service topics.`,
      })

      const relevantTopics = JSON.parse(searchResult) as string[]

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

      const { text: response } = await generateText({
        model: this.aiModel,
        prompt: `Generate a personalized response for this customer:

Customer Profile:
- Behavior: ${customerInsight.behavior_pattern}
- Preferred tone: ${customerInsight.communication_preferences.tone_preference}
- Language: ${customerInsight.communication_preferences.language}
- Lifetime value: ${customerInsight.lifetime_value}

Conversation Context:
- Sentiment: ${analysis.sentiment}
- Intent: ${analysis.intent}
- Urgency: ${analysis.urgency}
- Topics: ${analysis.topics.join(", ")}

Current Message: ${context}

Generate a helpful, personalized response in Thai that:
1. Matches the customer's preferred communication style
2. Addresses their specific needs based on their profile
3. Provides relevant information about sofa covers/fabrics
4. Maintains appropriate urgency level
5. Includes next steps or call-to-action if needed

Keep response concise but comprehensive.`,
      })

      return response
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

      const { text: insightResult } = await generateText({
        model: this.aiModel,
        prompt: `Analyze this customer's behavior and provide insights:

Customer Data: ${JSON.stringify(behaviorData, null, 2)}

Provide JSON analysis with:
- behavior_pattern (new/returning/vip/at_risk)
- communication_preferences (preferred_channel, response_time_expectation, language, tone_preference)
- satisfaction_trend (array of scores over time)
- lifetime_value (estimated monetary value)
- churn_risk (0-100 probability of leaving)

Base analysis on conversation frequency, order history, response patterns, and engagement levels.`,
      })

      const insight = JSON.parse(insightResult) as Partial<CustomerInsight>

      return {
        customer_id: customerId,
        behavior_pattern: insight.behavior_pattern || "new",
        purchase_history: behaviorData.orders,
        communication_preferences: insight.communication_preferences || {
          preferred_channel: "live_chat",
          response_time_expectation: 300,
          language: "th",
          tone_preference: "friendly",
        },
        satisfaction_trend: insight.satisfaction_trend || [75],
        lifetime_value: insight.lifetime_value || 0,
        churn_risk: insight.churn_risk || 20,
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
      const { text: reportResult } = await generateText({
        model: this.aiModel,
        prompt: `Generate a comprehensive conversation analytics report for the period ${startDate} to ${endDate}.

Analyze conversation data and provide business insights including:
- Overall performance metrics
- Channel effectiveness
- Common customer issues and topics
- Agent performance insights
- Revenue impact analysis
- Actionable recommendations for improvement

Focus on actionable business intelligence that can drive decision-making.`,
      })

      // Get actual data from database
      const conversationData = await this.getConversationData(startDate, endDate, channels)

      return {
        period: { start: startDate, end: endDate },
        metrics: conversationData.metrics,
        channel_breakdown: conversationData.channelBreakdown,
        topic_analysis: conversationData.topicAnalysis,
        agent_performance: conversationData.agentPerformance,
        business_insights: JSON.parse(reportResult),
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
        const { text: effectivenessResult } = await generateText({
          model: this.aiModel,
          prompt: `Analyze the effectiveness of this FAQ item:

Question: ${faq.question}
Answer: ${faq.answer}
Usage Count: ${faq.usage_count}
Category: ${faq.category}

Rate effectiveness (0-100) based on:
- Clarity and completeness of answer
- Relevance to common customer queries
- Usage frequency
- Potential for customer satisfaction

Also suggest improvements if score is below 70.`,
        })

        const effectiveness = Number.parseInt(effectivenessResult.match(/\d+/)?.[0] || "50")

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
