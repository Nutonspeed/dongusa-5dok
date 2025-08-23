import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

interface SupportTicket {
  id: string
  user_id?: string
  email: string
  subject: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved" | "closed"
  category: "technical" | "billing" | "general" | "bug_report" | "feature_request"
  created_at: string
  updated_at: string
  assigned_to?: string
  resolution?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, subject, description, priority = "medium", category = "general" } = body

    // Validate required fields
    if (!email || !subject || !description) {
      return NextResponse.json({ error: "Missing required fields: email, subject, description" }, { status: 400 })
    }

  const supabase = await createServerClient()

    // Create support ticket
    const ticketData: Partial<SupportTicket> = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      subject,
      description,
      priority,
      category,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("support_tickets").insert(ticketData).select().single()

    if (error) {
  // console.error("Failed to create support ticket:", error)
      return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 })
    }

    // Send confirmation email (in a real implementation)
    await sendTicketConfirmation(email, data.id, subject)

    // Notify support team for high/critical priority tickets
    if (priority === "high" || priority === "critical") {
      await notifySupportTeam(data)
    }

    return NextResponse.json({
      success: true,
      ticket: data,
      message: "Support ticket created successfully",
    })
  } catch (error) {
  // console.error("Support ticket creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const category = searchParams.get("category")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

  const supabase = createClient()

    let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }
    if (priority) {
      query = query.eq("priority", priority)
    }
    if (category) {
      query = query.eq("category", category)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
  // console.error("Failed to fetch support tickets:", error)
      return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tickets: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
  // console.error("Support tickets fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendTicketConfirmation(email: string, ticketId: string, subject: string): Promise<void> {
  // In a real implementation, this would send an email
  // console.log(`📧 Sending ticket confirmation to ${email} for ticket ${ticketId}`)
}

async function notifySupportTeam(ticket: SupportTicket): Promise<void> {
  // In a real implementation, this would notify the support team via:
  // - Slack
  // - Email
  // - SMS
  // - Support dashboard notifications

  // console.log(`🚨 Notifying support team of ${ticket.priority} priority ticket: ${ticket.subject}`)
}
