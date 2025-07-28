import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined,
    }

    const products = await db.getProducts(filters)

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      filters,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching products:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    // Validate required fields
    if (!productData.name || !productData.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Product name and category are required",
        },
        { status: 400 },
      )
    }

    const product = await db.createProduct(productData)

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product created successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating product:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
