import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { OrderStatus } from "@/lib/i18n/status"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 20)
    const fields = searchParams.get("fields")
    const userId = searchParams.get("userId") // In real app, get from auth

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    // Build query with mobile-optimized fields
    let query = supabase
      .from("orders")
      .select(
        fields ||
          `
        id,
        status,
        total,
        created_at,
        updated_at,
        order_items!inner(
          id,
          quantity,
          price,
          products!inner(
            id,
            name,
            images
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)

    // Apply status filter
    if (status && status !== "all") {
      const normalized = status.trim().toUpperCase()
      const allow = new Set(Object.values(OrderStatus))
      if (!allow.has(normalized as OrderStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      query = query.eq("status", normalized)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    const { data: orders, error, count } = await query

    if (error) {
      throw error
    }

    // Mobile-optimized response
    const optimizedOrders = orders?.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items?.slice(0, 3).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.products.id,
          name: item.products.name,
          image: item.products.images?.[0],
        },
      })),
      itemCount: order.order_items?.length || 0,
    }))

    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      data: optimizedOrders,
      meta: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        cached: false,
        compressed: true,
        requestId: `orders_${Date.now()}`,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    logger.error("Mobile orders API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        data: [],
        meta: {
          version: "1.0",
          timestamp: new Date().toISOString(),
          cached: false,
          compressed: false,
          requestId: `orders_error_${Date.now()}`,
        },
      },
      { status: 500 },
    )
  }
}
