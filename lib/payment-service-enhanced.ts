import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import { StripeGateway } from "./payment-gateways/stripe-gateway"
import { PromptPayGateway } from "./payment-gateways/promptpay-gateway"

export class EnhancedPaymentService {
  private supabase = createClient()
  private stripeGateway: StripeGateway | null = null
  private promptPayGateway: PromptPayGateway | null = null

  constructor() {
    // Initialize gateways if configured
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        this.stripeGateway = new StripeGateway()
      }
      if (process.env.PROMPTPAY_ID) {
        this.promptPayGateway = new PromptPayGateway()
      }
    } catch (error) {
      logger.error("Payment gateway initialization failed:", error)
    }
  }

  async processPayment(orderId: string, method: string, amount: number, paymentData?: any) {
    try {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create transaction record
      await this.supabase.from("payment_transactions").insert({
        id: transactionId,
        order_id: orderId,
        amount,
        method,
        status: "processing",
        payment_data: paymentData,
      })

      let result
      switch (method) {
        case "credit_card":
          result = await this.processCreditCard(transactionId, amount, paymentData)
          break
        case "promptpay":
          result = await this.processPromptPay(transactionId, amount, orderId)
          break
        case "bank_transfer":
          result = await this.processBankTransfer(transactionId, amount, orderId)
          break
        case "cod":
          result = await this.processCOD(transactionId, amount, orderId)
          break
        default:
          throw new Error(`Unsupported payment method: ${method}`)
      }

      return { transactionId, ...result }
    } catch (error) {
      logger.error("Payment processing failed:", error)
      throw error
    }
  }

  private async processCreditCard(transactionId: string, amount: number, paymentData: any) {
    if (!this.stripeGateway) {
      throw new Error("Stripe gateway not configured")
    }

    try {
      const paymentIntent = await this.stripeGateway.createPaymentIntent(amount, "thb", {
        transaction_id: transactionId,
      })

      await this.updateTransactionStatus(transactionId, "pending", paymentIntent.payment_intent_id)

      return {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.payment_intent_id,
        status: "pending",
      }
    } catch (error) {
      await this.updateTransactionStatus(transactionId, "failed")
      throw error
    }
  }

  private async processPromptPay(transactionId: string, amount: number, orderId: string) {
    if (!this.promptPayGateway) {
      // Fallback to mock for development
      return this.processMockPromptPay(transactionId, amount, orderId)
    }

    try {
      const reference = `PP${orderId.slice(-6)}${Date.now().toString().slice(-4)}`
      const qrCode = this.promptPayGateway.generateQRCode(amount, reference)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

      // Store QR info
      await this.supabase.from("payment_qr_codes").insert({
        transaction_id: transactionId,
        order_id: orderId,
        qr_code: qrCode,
        amount,
        reference,
        expires_at: expiresAt.toISOString(),
        status: "active",
      })

      await this.updateTransactionStatus(transactionId, "pending", reference)

      return {
        qr_code: qrCode,
        reference,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      }
    } catch (error) {
      await this.updateTransactionStatus(transactionId, "failed")
      throw error
    }
  }

  private async processMockPromptPay(transactionId: string, amount: number, orderId: string) {
    // Mock implementation for development
    const reference = `PP${orderId.slice(-6)}${Date.now().toString().slice(-4)}`
    const qrCode = `/placeholder.svg?height=200&width=200&text=QR+${amount}`
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await this.updateTransactionStatus(transactionId, "pending", reference)

    return {
      qr_code: qrCode,
      reference,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    }
  }

  private async processBankTransfer(transactionId: string, amount: number, orderId: string) {
    const reference = `TRF${orderId.slice(-6)}${Date.now().toString().slice(-4)}`

    const bankInfo = {
      account_number: process.env.BANK_ACCOUNT_NUMBER || "123-4-56789-0",
      bank_name: process.env.BANK_NAME || "ธนาคารกสิกรไทย",
      branch: process.env.BANK_BRANCH || "สาขาสยามสแควร์",
      account_holder: process.env.ACCOUNT_HOLDER_NAME || "บริษัท ELF โซฟาคัฟเวอร์ โปร จำกัด",
      reference_number: reference,
    }

    await this.updateTransactionStatus(transactionId, "pending", reference)

    return {
      bank_info: bankInfo,
      reference,
      status: "pending",
    }
  }

  private async processCOD(transactionId: string, amount: number, orderId: string) {
    await this.updateTransactionStatus(transactionId, "pending")

    return {
      message: "Cash on Delivery confirmed",
      amount,
      status: "pending",
    }
  }

  private async updateTransactionStatus(transactionId: string, status: string, reference?: string) {
    await this.supabase
      .from("payment_transactions")
      .update({
        status,
        transaction_id: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
  }

  async verifyPayment(transactionId: string, verificationData: any): Promise<boolean> {
    try {
      const { data: transaction } = await this.supabase
        .from("payment_transactions")
        .select("*")
        .eq("id", transactionId)
        .single()

      if (!transaction) return false

      let isValid = false
      switch (transaction.method) {
        case "credit_card":
          isValid = await this.verifyCreditCard(transaction, verificationData)
          break
        case "promptpay":
          isValid = await this.verifyPromptPay(transaction, verificationData)
          break
        case "bank_transfer":
          isValid = await this.verifyBankTransfer(transaction, verificationData)
          break
        case "cod":
          isValid = true // COD verified on delivery
          break
      }

      if (isValid) {
        await this.updateTransactionStatus(transactionId, "completed", verificationData.ref)
        await this.updateOrderStatus(transaction.order_id, "paid")
      } else {
        await this.updateTransactionStatus(transactionId, "failed")
      }

      return isValid
    } catch (error) {
      logger.error("Payment verification failed:", error)
      return false
    }
  }

  private async verifyCreditCard(transaction: any, verificationData: any): Promise<boolean> {
    if (!this.stripeGateway) return false

    try {
      const result = await this.stripeGateway.confirmPayment(transaction.transaction_id)
      return result.status === "succeeded"
    } catch (error) {
      return false
    }
  }

  private async verifyPromptPay(transaction: any, verificationData: any): Promise<boolean> {
    if (this.promptPayGateway) {
      return await this.promptPayGateway.verifyPayment(transaction.transaction_id, transaction.amount)
    }

    // Mock verification for development
    return verificationData.amount === transaction.amount && verificationData.reference === transaction.transaction_id
  }

  private async verifyBankTransfer(transaction: any, verificationData: any): Promise<boolean> {
    // In production, integrate with bank API
    // Mock verification for now
    return verificationData.amount === transaction.amount && verificationData.reference === transaction.transaction_id
  }

  private async updateOrderStatus(orderId: string, status: string) {
    await this.supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
  }
}

export const enhancedPaymentService = new EnhancedPaymentService()
