// NOTE: No UI restructure. Types/boundary only.
import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  channel: "email" | "sms" | "facebook" | "line" | "live_chat" | "whatsapp"
  sender_id: string
  sender_name: string
  sender_email?: string
  sender_phone?: string
  recipient_id: string
  content: string
  message_type: "text" | "image" | "file" | "audio" | "video"
  status: "sent" | "delivered" | "read" | "failed"
  priority: "low" | "normal" | "high" | "urgent"
  tags: string[]
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface Conversation {
  id: string
  customer_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  channel: Message["channel"]
  status: "open" | "pending" | "resolved" | "closed"
  priority: Message["priority"]
  assigned_to?: string
  assigned_team?: string
  subject?: string
  last_message_at: string
  message_count: number
  response_time?: number
  satisfaction_rating?: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  name: string
  email: string
  role: "agent" | "supervisor" | "admin"
  status: "online" | "away" | "busy" | "offline"
  channels: Message["channel"][]
  max_conversations: number
  current_conversations: number
  skills: string[]
  languages: string[]
  performance_metrics: {
    response_time_avg: number
    resolution_rate: number
    satisfaction_score: number
    conversations_handled: number
  }
}

export interface Template {
  id: string
  name: string
  category: string
  channel: Message["channel"][]
  content: string
  variables: string[]
  usage_count: number
  created_by: string
  created_at: string
}

export class UnifiedCommunicationHub {
  private supabase = createClient()

  // Message Management
  async sendMessage(
    conversationId: string,
    content: string,
    channel: Message["channel"],
    options: {
      sender_id: string
      message_type?: Message["message_type"]
      priority?: Message["priority"]
      template_id?: string
      attachments?: any[]
    },
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    try {
      logger.info(`[Communication] Sending message via ${channel} for conversation: ${conversationId}`)

      // Process template if provided
      let processedContent = content
      if (options.template_id) {
        const template = await this.getTemplate(options.template_id)
        if (template) {
          processedContent = await this.processTemplate(template, content)
        }
      }

      // Create message record
      const message: Partial<Message> = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel,
        sender_id: options.sender_id,
        content: processedContent,
        message_type: options.message_type || "text",
        status: "sent",
        priority: options.priority || "normal",
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          conversation_id: conversationId,
          attachments: options.attachments || [],
        },
      }

      // Send via appropriate channel
      const sendResult = await this.sendViaChannel(channel, message, conversationId)

      if (sendResult.success) {
        // Store message in database
        const { error } = await this.supabase.from("messages").insert(message)

        if (error) {
          logger.error("[Communication] Failed to store message:", error)
          return { success: false, error: "Failed to store message" }
        }

        // Update conversation
        await this.updateConversationActivity(conversationId)

        logger.info(`[Communication] Message sent successfully: ${message.id}`)
        return { success: true, message_id: message.id }
      } else {
        return { success: false, error: sendResult.error }
      }
    } catch (error) {
      logger.error("[Communication] Send message failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async receiveMessage(
    channel: Message["channel"],
    payload: any,
  ): Promise<{ success: boolean; conversation_id?: string; message_id?: string }> {
    try {
      logger.info(`[Communication] Receiving message from ${channel}`)

      // Parse message based on channel
      const parsedMessage = await this.parseChannelMessage(channel, payload)

      // Find or create conversation
      const conversation = await this.findOrCreateConversation(parsedMessage)

      // Store message
      const message: Partial<Message> = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel,
        sender_id: parsedMessage.sender_id,
        sender_name: parsedMessage.sender_name,
        sender_email: parsedMessage.sender_email,
        sender_phone: parsedMessage.sender_phone,
        recipient_id: "system",
        content: parsedMessage.content,
        message_type: parsedMessage.message_type || "text",
        status: "delivered",
        priority: "normal",
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          conversation_id: conversation.id,
          original_payload: payload,
        },
      }

      const { error } = await this.supabase.from("messages").insert(message)

      if (error) {
        logger.error("[Communication] Failed to store received message:", error)
        return { success: false }
      }

      // Auto-assign conversation if needed
      await this.autoAssignConversation(conversation.id)

      // Trigger auto-responses if configured
      await this.triggerAutoResponse(conversation.id, message)

      logger.info(`[Communication] Message received and processed: ${message.id}`)
      return { success: true, conversation_id: conversation.id, message_id: message.id }
    } catch (error) {
      logger.error("[Communication] Receive message failed:", error)
      return { success: false }
    }
  }

  // Conversation Management
  async getConversations(
    filters: {
      status?: Conversation["status"][]
      channel?: Message["channel"][]
      assigned_to?: string
      priority?: Message["priority"][]
      date_range?: { start: string; end: string }
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<{ conversations: Conversation[]; total: number; has_more: boolean }> {
    try {
      let query = this.supabase.from("conversations").select("*", { count: "exact" })

      // Apply filters
      if (filters.status?.length) {
        query = query.in("status", filters.status)
      }
      if (filters.channel?.length) {
        query = query.in("channel", filters.channel)
      }
      if (filters.assigned_to) {
        query = query.eq("assigned_to", filters.assigned_to)
      }
      if (filters.priority?.length) {
        query = query.in("priority", filters.priority)
      }
      if (filters.date_range) {
        query = query.gte("created_at", filters.date_range.start).lte("created_at", filters.date_range.end)
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1).order("last_message_at", { ascending: false })

      const { data, error, count } = await query

      if (error) {
        logger.error("[Communication] Failed to fetch conversations:", error)
        return { conversations: [], total: 0, has_more: false }
      }

      const total = count || 0
      const hasMore = offset + pagination.limit < total

      return {
        conversations: data || [],
        total,
        has_more: hasMore,
      }
    } catch (error) {
      logger.error("[Communication] Get conversations failed:", error)
      return { conversations: [], total: 0, has_more: false }
    }
  }

  async getConversationMessages(
    conversationId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 50 },
  ): Promise<{ messages: Message[]; total: number; has_more: boolean }> {
    try {
      const offset = (pagination.page - 1) * pagination.limit

      const { data, error, count } = await this.supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("metadata->>conversation_id", conversationId)
        .range(offset, offset + pagination.limit - 1)
        .order("created_at", { ascending: true })

      if (error) {
        logger.error("[Communication] Failed to fetch messages:", error)
        return { messages: [], total: 0, has_more: false }
      }

      const total = count || 0
      const hasMore = offset + pagination.limit < total

      return {
        messages: data || [],
        total,
        has_more: hasMore,
      }
    } catch (error) {
      logger.error("[Communication] Get messages failed:", error)
      return { messages: [], total: 0, has_more: false }
    }
  }

  async assignConversation(
    conversationId: string,
    agentId: string,
    assignedBy: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check agent availability
      const agent = await this.getAgent(agentId)
      if (!agent) {
        return { success: false, error: "Agent not found" }
      }

      if (agent.current_conversations >= agent.max_conversations) {
        return { success: false, error: "Agent at maximum capacity" }
      }

      // Update conversation
      const { error } = await this.supabase
        .from("conversations")
        .update({
          assigned_to: agentId,
          status: "open",
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)

      if (error) {
        logger.error("[Communication] Failed to assign conversation:", error)
        return { success: false, error: "Failed to assign conversation" }
      }

      // Update agent conversation count
      await this.updateAgentConversationCount(agentId, 1)

      // Log assignment
      await this.logConversationActivity(conversationId, "assigned", {
        agent_id: agentId,
        assigned_by: assignedBy,
      })

      logger.info(`[Communication] Conversation ${conversationId} assigned to agent ${agentId}`)
      return { success: true }
    } catch (error) {
      logger.error("[Communication] Assign conversation failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Agent Management
  async getAvailableAgents(
    channel?: Message["channel"],
    skills?: string[],
  ): Promise<{ agents: Agent[]; total_online: number }> {
    try {
      let query = this.supabase.from("agents").select("*").eq("status", "online")

      if (channel) {
        query = query.contains("channels", [channel])
      }

      const { data, error } = await query

      if (error) {
        logger.error("[Communication] Failed to fetch agents:", error)
        return { agents: [], total_online: 0 }
      }

      let agents = data || []

      // Filter by skills if provided
      if (skills?.length) {
        agents = agents.filter((agent) => skills.some((skill) => agent.skills.includes(skill)))
      }

      // Sort by availability (least busy first)
      agents.sort((a, b) => {
        const aLoad = a.current_conversations / a.max_conversations
        const bLoad = b.current_conversations / b.max_conversations
        return aLoad - bLoad
      })

      return {
        agents,
        total_online: agents.length,
      }
    } catch (error) {
      logger.error("[Communication] Get available agents failed:", error)
      return { agents: [], total_online: 0 }
    }
  }

  // Template Management
  async getTemplates(
    category?: string,
    channel?: Message["channel"],
  ): Promise<{ templates: Template[]; categories: string[] }> {
    try {
      let query = this.supabase.from("templates").select("*")

      if (category) {
        query = query.eq("category", category)
      }

      if (channel) {
        query = query.contains("channel", [channel])
      }

      const { data, error } = await query.order("usage_count", { ascending: false })

      if (error) {
        logger.error("[Communication] Failed to fetch templates:", error)
        return { templates: [], categories: [] }
      }

  // The query returns full template objects; cast to Template[] for TS
  const templates = (data ?? []) as Template[]
      const categories = [...new Set(templates.map((t) => t.category))]

      return { templates, categories }
    } catch (error) {
      logger.error("[Communication] Get templates failed:", error)
      return { templates: [], categories: [] }
    }
  }

  // Analytics
  async getCommunicationAnalytics(
    dateRange: { start: string; end: string },
    groupBy: "day" | "week" | "month" = "day",
  ): Promise<{
    message_volume: { date: string; count: number; channel: string }[]
    response_times: { avg: number; median: number; p95: number }
    resolution_rates: { resolved: number; total: number; rate: number }
    channel_performance: { channel: string; messages: number; avg_response_time: number }[]
    agent_performance: { agent_id: string; name: string; conversations: number; avg_rating: number }[]
  }> {
    try {
      // This would typically involve complex SQL queries
      // For now, returning mock data structure
      return {
        message_volume: [
          { date: "2024-01-01", count: 150, channel: "email" },
          { date: "2024-01-01", count: 89, channel: "live_chat" },
          { date: "2024-01-01", count: 45, channel: "facebook" },
        ],
        response_times: { avg: 1800, median: 900, p95: 3600 }, // seconds
        resolution_rates: { resolved: 85, total: 100, rate: 0.85 },
        channel_performance: [
          { channel: "live_chat", messages: 450, avg_response_time: 300 },
          { channel: "email", messages: 320, avg_response_time: 1800 },
          { channel: "facebook", messages: 180, avg_response_time: 600 },
        ],
        agent_performance: [
          { agent_id: "agent_1", name: "สมชาย ใจดี", conversations: 25, avg_rating: 4.8 },
          { agent_id: "agent_2", name: "สมหญิง รักงาน", conversations: 22, avg_rating: 4.6 },
        ],
      }
    } catch (error) {
      logger.error("[Communication] Get analytics failed:", error)
      throw error
    }
  }

  // Private helper methods
  private async sendViaChannel(
    channel: Message["channel"],
    message: Partial<Message>,
    conversationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (channel) {
        case "email":
          return await this.sendEmail(message, conversationId)
        case "sms":
          return await this.sendSMS(message, conversationId)
        case "facebook":
          return await this.sendFacebookMessage(message, conversationId)
        case "line":
          return await this.sendLineMessage(message, conversationId)
        case "live_chat":
          return await this.sendLiveChatMessage(message, conversationId)
        default:
          return { success: false, error: "Unsupported channel" }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Channel send failed" }
    }
  }

  private async sendEmail(
    message: Partial<Message>,
    conversationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Mock email sending
    logger.info(`[Email] Sending message: ${message.content?.substring(0, 50)}...`)
    return { success: true }
  }

  private async sendSMS(
    message: Partial<Message>,
    conversationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Mock SMS sending
    logger.info(`[SMS] Sending message: ${message.content?.substring(0, 50)}...`)
    return { success: true }
  }

  private async sendFacebookMessage(
    message: Partial<Message>,
    conversationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Mock Facebook Messenger API
    logger.info(`[Facebook] Sending message: ${message.content?.substring(0, 50)}...`)
    return { success: true }
  }

  private async sendLineMessage(
    message: Partial<Message>,
    conversationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Mock LINE API
    logger.info(`[LINE] Sending message: ${message.content?.substring(0, 50)}...`)
    return { success: true }
  }

  private async sendLiveChatMessage(
    message: Partial<Message>,
    conversationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Mock live chat (WebSocket or similar)
    logger.info(`[Live Chat] Sending message: ${message.content?.substring(0, 50)}...`)
    return { success: true }
  }

  private async parseChannelMessage(channel: Message["channel"], payload: any): Promise<any> {
    // Parse message based on channel format
    switch (channel) {
      case "facebook":
        return {
          sender_id: payload.sender?.id,
          sender_name: payload.sender?.name,
          content: payload.message?.text || "",
          message_type: payload.message?.attachments ? "image" : "text",
        }
      case "line":
        return {
          sender_id: payload.source?.userId,
          sender_name: payload.source?.displayName,
          content: payload.message?.text || "",
          message_type: payload.message?.type || "text",
        }
      default:
        return payload
    }
  }

  private async findOrCreateConversation(parsedMessage: any): Promise<Conversation> {
    // Try to find existing conversation
    const { data: existing } = await this.supabase
      .from("conversations")
      .select("*")
      .eq("customer_id", parsedMessage.sender_id)
      .eq("status", "open")
      .single()

    if (existing) {
      return existing
    }

    // Create new conversation
    const conversation: Partial<Conversation> = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer_id: parsedMessage.sender_id,
      customer_name: parsedMessage.sender_name,
      customer_email: parsedMessage.sender_email,
      customer_phone: parsedMessage.sender_phone,
      channel: parsedMessage.channel,
      status: "open",
      priority: "normal",
      last_message_at: new Date().toISOString(),
      message_count: 0,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.supabase.from("conversations").insert(conversation).select().single()

    if (error) {
      logger.error("[Communication] Failed to create conversation:", error)
      throw error
    }

    return data
  }

  private async updateConversationActivity(conversationId: string): Promise<void> {
    await this.supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
  }

  private async autoAssignConversation(conversationId: string): Promise<void> {
    // Get available agents
    const { agents } = await this.getAvailableAgents()

    if (agents.length > 0) {
      // Assign to least busy agent
      const agent = agents[0]
      await this.assignConversation(conversationId, agent.id, "system")
    }
  }

  private async triggerAutoResponse(conversationId: string, message: Partial<Message>): Promise<void> {
    // Check for auto-response rules
    // This could include FAQ matching, business hours, etc.

    // Mock auto-response for common queries
    if (message.content?.toLowerCase().includes("ราคา")) {
      await this.sendMessage(
        conversationId,
        "สวัสดีครับ! สำหรับข้อมูลราคาสินค้า กรุณารอสักครู่ ทีมงานจะตอบกลับในไม่ช้า",
        message.channel!,
        {
          sender_id: "system",
          message_type: "text",
          priority: "normal",
        },
      )
    }
  }

  private async getAgent(agentId: string): Promise<Agent | null> {
    const { data, error } = await this.supabase.from("agents").select("*").eq("id", agentId).single()

    if (error) {
      logger.error("[Communication] Failed to fetch agent:", error)
      return null
    }

    return data
  }

  private async updateAgentConversationCount(agentId: string, delta: number): Promise<void> {
    const { error } = await this.supabase.rpc("update_agent_conversation_count", {
      agent_id: agentId,
      delta,
    })

    if (error) {
      logger.error("[Communication] Failed to update agent conversation count:", error)
    }
  }

  private async logConversationActivity(
    conversationId: string,
    activity: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    await this.supabase.from("conversation_activities").insert({
      conversation_id: conversationId,
      activity,
      metadata,
      created_at: new Date().toISOString(),
    })
  }

  private async getTemplate(templateId: string): Promise<Template | null> {
    const { data, error } = await this.supabase.from("templates").select("*").eq("id", templateId).single()

    if (error) {
      logger.error("[Communication] Failed to fetch template:", error)
      return null
    }

    return data
  }

  private async processTemplate(template: Template, variables: string): Promise<string> {
    let content = template.content

    // Simple variable replacement
    // In production, this would be more sophisticated
    try {
      const vars = JSON.parse(variables)
      template.variables.forEach((variable) => {
        const placeholder = `{{${variable}}}`
        if (vars[variable]) {
          content = content.replace(new RegExp(placeholder, "g"), vars[variable])
        }
      })
    } catch (error) {
      logger.warn("[Communication] Failed to process template variables:", error)
    }

    return content
  }
}

export const communicationHub = new UnifiedCommunicationHub()
