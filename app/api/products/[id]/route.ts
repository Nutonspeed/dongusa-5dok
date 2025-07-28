import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing product ID",
        },
        { status: 400 },
      )
    }

    const product = await db.getProduct(id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching product:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing product ID",
        },
        { status: 400 },
      )
    }

    const product = await db.updateProduct(id, updates)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product updated successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating product:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing product ID",
        },
        { status: 400 },
      )
    }

    const success = await db.deleteProduct(id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error deleting product:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
