import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from "@/lib/logger"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: NextRequest) {
  try {
    const { customer_id } = await req.json()

    const setupIntent = await stripe.setupIntents.create({
      customer: customer_id,
      payment_method_types: ["card"],
      usage: "off_session",
    })

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id,
    })
  } catch (error) {
    logger.error("Setup intent creation failed:", error)
    return NextResponse.json({ error: "Failed to create setup intent" }, { status: 500 })
  }
}
