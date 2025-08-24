import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { enhancedPaymentService } from "@/lib/payment-service-enhanced"
import { logger } from "@/lib/logger"

function getStripeInstance(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
  // console.log("STRIPE_SECRET_KEY not configured - webhook functionality disabled")
    return null
  }
  return new Stripe(apiKey, {
    // See other payment routes: cast to any to satisfy the local Stripe type
    // definitions while keeping the runtime apiVersion.
    apiVersion: "2024-06-20" as any,
  })
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeInstance()
    if (!stripe) {
      return NextResponse.json({ error: "Payment service not configured" }, { status: 503 })
    }

    const body = await req.text()
    const signature = headers().get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(failedPayment)
        break
      default:
        logger.info(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const transactionId = paymentIntent.metadata?.transaction_id
    if (!transactionId) {
      logger.error("No transaction ID in payment intent metadata")
      return
    }

    await enhancedPaymentService.verifyPayment(transactionId, {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: "succeeded",
    })

    logger.info(`Payment succeeded for transaction: ${transactionId}`)
  } catch (error) {
    logger.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const transactionId = paymentIntent.metadata?.transaction_id
    if (!transactionId) {
      logger.error("No transaction ID in payment intent metadata")
      return
    }

    await enhancedPaymentService.verifyPayment(transactionId, {
      payment_intent_id: paymentIntent.id,
      status: "failed",
      error: paymentIntent.last_payment_error?.message,
    })

    logger.info(`Payment failed for transaction: ${transactionId}`)
  } catch (error) {
    logger.error("Error handling payment failure:", error)
  }
}
