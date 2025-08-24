import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from "@/lib/logger"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  logger.warn("STRIPE_SECRET_KEY not configured - payment functionality disabled")
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      // The Stripe TypeScript defs in this workspace type apiVersion as a
      // narrow literal union. Cast to any to keep the runtime value while
      // satisfying the compiler.
      apiVersion: "2024-06-20" as any,
    })
  : null

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      logger.error("Stripe not configured - missing STRIPE_SECRET_KEY")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 503 })
    }

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
