import Stripe from "stripe"
import { logger } from "@/lib/logger"

export class StripeGateway {
  private stripe: Stripe

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      logger.warn("STRIPE_SECRET_KEY is not configured - Stripe functionality will be disabled")
      throw new Error("STRIPE_SECRET_KEY is required")
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-06-20" as any,
    })
  }

  async createPaymentIntent(amount: number, currency = "thb", metadata?: any) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
      }
    } catch (error) {
      logger.error("Stripe payment intent creation failed:", error)
      throw new Error("Failed to create payment intent")
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      }
    } catch (error) {
      logger.error("Stripe payment confirmation failed:", error)
      throw new Error("Failed to confirm payment")
    }
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      })

      return {
        refund_id: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
      }
    } catch (error) {
      logger.error("Stripe refund failed:", error)
      throw new Error("Failed to create refund")
    }
  }
}
