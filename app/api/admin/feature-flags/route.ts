import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Return current feature flags from environment or database
    const featureFlags = {
      customCovers: process.env.ENABLE_CUSTOM_COVERS !== "false",
      bulkOrders: process.env.ENABLE_BULK_ORDERS !== "false",
      loyaltyProgram: process.env.ENABLE_LOYALTY_PROGRAM === "true",
      reviews: process.env.ENABLE_REVIEWS !== "false",
      wishlist: process.env.ENABLE_WISHLIST !== "false",
      advancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS !== "false",
      bulkOperations: process.env.ENABLE_BULK_OPERATIONS !== "false",
      exportFeatures: process.env.ENABLE_EXPORT_FEATURES !== "false",
      previewMode: process.env.ENABLE_PREVIEW_MODE !== "false",
      arPreview: process.env.ENABLE_AR_PREVIEW !== "false",
      productPreview: process.env.ENABLE_PRODUCT_PREVIEW !== "false",
    }

    return NextResponse.json(featureFlags)
  } catch (error) {
    console.error("Failed to get feature flags:", error)
    return NextResponse.json({ error: "Failed to get feature flags" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    // Store feature flags in database for persistence
    const { error } = await supabase.from("system_settings").upsert(
      {
        key: "feature_flags",
        value: body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update feature flags:", error)
    return NextResponse.json({ error: "Failed to update feature flags" }, { status: 500 })
  }
}
