import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") // In real app, get from auth token

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    // Get user profile with mobile-optimized fields
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        phone,
        avatar_url,
        address,
        created_at,
        preferences,
        loyalty_points,
        total_orders,
        total_spent
      `,
      )
      .eq("id", userId)
      .single()

    if (error) {
      throw error
    }

    // Mobile-optimized profile data
    const optimizedProfile = {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      phone: profile.phone,
      avatar: profile.avatar_url,
      address: profile.address,
      memberSince: profile.created_at,
      stats: {
        loyaltyPoints: profile.loyalty_points || 0,
        totalOrders: profile.total_orders || 0,
        totalSpent: profile.total_spent || 0,
      },
      preferences: profile.preferences || {},
    }

    return NextResponse.json({
      data: optimizedProfile,
      meta: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        cached: false,
        compressed: true,
        requestId: `profile_${Date.now()}`,
      },
    })
  } catch (error) {
    logger.error("Mobile profile API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        data: null,
        meta: {
          version: "1.0",
          timestamp: new Date().toISOString(),
          cached: false,
          compressed: false,
          requestId: `profile_error_${Date.now()}`,
        },
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    const updates = await request.json()

    // Validate and sanitize updates
    const allowedFields = ["full_name", "phone", "address", "preferences"]
    const sanitizedUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = updates[key]
          return obj
        },
        {} as Record<string, any>,
      )

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      meta: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        cached: false,
        compressed: false,
        requestId: `profile_update_${Date.now()}`,
      },
    })
  } catch (error) {
    logger.error("Mobile profile update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update profile",
        meta: {
          version: "1.0",
          timestamp: new Date().toISOString(),
          cached: false,
          compressed: false,
          requestId: `profile_update_error_${Date.now()}`,
        },
      },
      { status: 500 },
    )
  }
}
