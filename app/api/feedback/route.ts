import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface UserFeedback {
  id: string
  user_id?: string
  email?: string
  page_url: string
  feedback_type: "bug_report" | "feature_request" | "general" | "performance" | "usability"
  rating: number // 1-5 stars
  title: string
  description: string
  browser_info?: string
  device_info?: string
  screenshot_url?: string
  created_at: string
  status: "new" | "reviewed" | "in_progress" | "resolved" | "closed"
  admin_response?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      page_url,
      feedback_type = "general",
      rating,
      title,
      description,
      browser_info,
      device_info,
      screenshot_url,
    } = body

    // Validate required fields
    if (!page_url || !title || !description || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: page_url, title, description, rating" },
        { status: 400 },
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

  const supabase = createClient()

    // Create feedback entry
    const feedbackData: Partial<UserFeedback> = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      page_url,
      feedback_type,
      rating,
      title,
      description,
      browser_info,
      device_info,
      screenshot_url,
      status: "new",
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("user_feedback").insert(feedbackData).select().single()

    if (error) {
  // console.error("Failed to create feedback:", error)
      return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 })
    }

    // Send notification for critical feedback
    if (rating <= 2 || feedback_type === "bug_report") {
      await notifyTeamOfCriticalFeedback(data)
    }

    return NextResponse.json({
      success: true,
      feedback: data,
      message: "Feedback submitted successfully",
    })
  } catch (error) {
  // console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const feedback_type = searchParams.get("feedback_type")
    const status = searchParams.get("status")
    const rating = searchParams.get("rating")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

  const supabase = createClient()

    let query = supabase.from("user_feedback").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (feedback_type) {
      query = query.eq("feedback_type", feedback_type)
    }
    if (status) {
      query = query.eq("status", status)
    }
    if (rating) {
      query = query.eq("rating", Number.parseInt(rating))
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
  // console.error("Failed to fetch feedback:", error)
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
    }

    // Calculate feedback statistics
    const stats = await calculateFeedbackStats(supabase)

    return NextResponse.json({
      success: true,
      feedback: data,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
  // console.error("Feedback fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function calculateFeedbackStats(supabase: any) {
  try {
    const { data: allFeedback } = await supabase.from("user_feedback").select("rating, feedback_type, created_at")

    if (!allFeedback || allFeedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: {},
        typeDistribution: {},
        recentTrend: "stable",
      }
    }

    const totalFeedback = allFeedback.length
    const averageRating = allFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / totalFeedback

    const ratingDistribution = allFeedback.reduce((acc: any, f: any) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1
      return acc
    }, {})

    const typeDistribution = allFeedback.reduce((acc: any, f: any) => {
      acc[f.feedback_type] = (acc[f.feedback_type] || 0) + 1
      return acc
    }, {})

    // Calculate recent trend (last 7 days vs previous 7 days)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentFeedback = allFeedback.filter((f: any) => new Date(f.created_at) >= sevenDaysAgo)
    const previousFeedback = allFeedback.filter(
      (f: any) => new Date(f.created_at) >= fourteenDaysAgo && new Date(f.created_at) < sevenDaysAgo,
    )

    const recentAvg =
      recentFeedback.length > 0
        ? recentFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / recentFeedback.length
        : 0
    const previousAvg =
      previousFeedback.length > 0
        ? previousFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / previousFeedback.length
        : 0

    let recentTrend = "stable"
    if (recentAvg > previousAvg + 0.2) recentTrend = "improving"
    else if (recentAvg < previousAvg - 0.2) recentTrend = "declining"

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      typeDistribution,
      recentTrend,
    }
  } catch (error) {
  // console.error("Failed to calculate feedback stats:", error)
    return {
      totalFeedback: 0,
      averageRating: 0,
      ratingDistribution: {},
      typeDistribution: {},
      recentTrend: "unknown",
    }
  }
}

async function notifyTeamOfCriticalFeedback(feedback: UserFeedback): Promise<void> {
  // In a real implementation, this would send notifications via:
  // - Slack
  // - Email
  // - Support ticket system

  // console.log(`🚨 Critical feedback received: ${feedback.title} (Rating: ${feedback.rating}/5)`)
}
