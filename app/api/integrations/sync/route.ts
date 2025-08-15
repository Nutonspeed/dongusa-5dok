import { type NextRequest, NextResponse } from "next/server"
import { thirdPartyHub } from "@/lib/third-party-integration-hub"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { platform, action, sellerId, orderId, provider } = await request.json()

    switch (action) {
      case "sync_products":
        if (platform === "shopee") {
          const result = await thirdPartyHub.syncShopeeProducts(sellerId)
          return NextResponse.json(result)
        } else if (platform === "lazada") {
          const result = await thirdPartyHub.syncLazadaProducts(sellerId)
          return NextResponse.json(result)
        }
        break

      case "create_shipping_label":
        const result = await thirdPartyHub.createShippingLabel(orderId, provider)
        return NextResponse.json(result)

      case "process_payment":
        // Handle payment processing
        return NextResponse.json({ success: true, message: "Payment processing initiated" })

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  } catch (error) {
    logger.error("[Integration API] Request failed:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "status":
        return NextResponse.json({
          integrations: {
            shopee: !!process.env.SHOPEE_PARTNER_ID,
            lazada: !!process.env.LAZADA_APP_KEY,
            stripe: !!process.env.STRIPE_SECRET_KEY,
            thailand_post: !!process.env.THAILAND_POST_API_KEY,
            kerry: !!process.env.KERRY_API_KEY,
            flash: !!process.env.FLASH_API_KEY,
            facebook: !!process.env.FACEBOOK_ACCESS_TOKEN,
            instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
          },
        })

      default:
        return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }
  } catch (error) {
    logger.error("[Integration API] GET request failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
