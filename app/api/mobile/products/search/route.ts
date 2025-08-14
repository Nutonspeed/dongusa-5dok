import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const priceMin = searchParams.get("priceMin")
    const priceMax = searchParams.get("priceMax")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 50)
    const fields = searchParams.get("fields")

    // Build query
    let query = supabase
      .from("products")
      .select(fields || "id, name, name_en, price, sale_price, images, rating, availability, category, created_at")

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%, name_en.ilike.%${search}%, description.ilike.%${search}%`)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (priceMin) {
      query = query.gte("price", Number.parseFloat(priceMin))
    }

    if (priceMax) {
      query = query.lte("price", Number.parseFloat(priceMax))
    }

    // Only show active products
    query = query.eq("status", "active")

    // Apply sorting
    const sortOrder = sortBy.startsWith("-") ? { ascending: false } : { ascending: true }
    const sortField = sortBy.replace("-", "")
    query = query.order(sortField, sortOrder)

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      throw error
    }

    // Mobile-optimized response
    const optimizedProducts = products?.map((product) => ({
      ...product,
      // Optimize images for mobile
      images: product.images?.slice(0, 3).map((img: string) => ({
        url: img,
        thumbnail: img.replace(/\.(jpg|jpeg|png|webp)$/i, "_thumb.$1"),
      })),
      // Truncate description for mobile
      description: product.description?.substring(0, 100) + (product.description?.length > 100 ? "..." : ""),
    }))

    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      data: optimizedProducts,
      meta: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        cached: false,
        compressed: true,
        requestId: `search_${Date.now()}`,
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
    logger.error("Mobile product search error:", error)
    return NextResponse.json(
      {
        error: "Product search failed",
        data: [],
        meta: {
          version: "1.0",
          timestamp: new Date().toISOString(),
          cached: false,
          compressed: false,
          requestId: `search_error_${Date.now()}`,
        },
      },
      { status: 500 },
    )
  }
}
