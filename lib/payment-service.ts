import { createClient } from "@/lib/supabase/client"
import { DatabaseService } from "@/lib/database"
import { logger } from "@/lib/logger"
import { PAYMENT_CONFIG } from "@/lib/config"

export interface PaymentMethod {
  id: string
  name: string
  type: "promptpay" | "bank_transfer" | "credit_card" | "cod"
  enabled: boolean
  config: any
}

export interface PaymentTransaction {
  id: string
  order_id: string
  amount: number
  method: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  transaction_id?: string
  reference_number?: string
  payment_data?: any
  created_at: string
  updated_at: string
}

export interface PromptPayQR {
  qr_code: string
  amount: number
  reference: string
  expires_at: string
}

export interface BankTransferInfo {
  account_number: string
  bank_name: string
  branch: string
  account_holder: string
  reference_number: string
}

export class PaymentService {
  private supabase = createClient()
  private db = new DatabaseService(this.supabase)

  // Payment Methods Management
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await this.supabase
        .from("payment_methods")
        .select("*")
        .eq("enabled", true)
        .order("display_order")

      if (error) throw error

      // Fallback to default methods if none configured
      if (!data || data.length === 0) {
        return [
          {
            id: "promptpay",
            name: "PromptPay",
            type: "promptpay",
            enabled: true,
            config: PAYMENT_CONFIG.promptpay,
          },
          {
            id: "bank_transfer",
            name: "Bank Transfer",
            type: "bank_transfer",
            enabled: true,
            config: PAYMENT_CONFIG.bankTransfer,
          },
          {
            id: "credit_card",
            name: "Credit/Debit Card",
            type: "credit_card",
            enabled: true,
            config: {},
          },
          {
            id: "cod",
            name: "Cash on Delivery",
            type: "cod",
            enabled: true,
            config: {},
          },
        ]
      }

      return data
    } catch (error) {
      logger.error("Error fetching payment methods:", error)
      return []
    }
  }

  // PromptPay QR Code Generation
  async generatePromptPayQR(amount: number, orderId: string): Promise<PromptPayQR> {
    try {
      const reference = `ORD${orderId.slice(-8)}`
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

      // Generate QR code data (simplified - in production use proper PromptPay library)
      const qrData = this.generatePromptPayQRData(PAYMENT_CONFIG.promptpay.id, amount, reference)

      // Store QR code info
      const { error } = await this.supabase.from("payment_qr_codes").insert({
        order_id: orderId,
        qr_code: qrData,
        amount,
        reference,
        expires_at: expiresAt.toISOString(),
        status: "active",
      })

      if (error) throw error

      return {
        qr_code: qrData,
        amount,
        reference,
        expires_at: expiresAt.toISOString(),
      }
    } catch (error) {
      logger.error("Error generating PromptPay QR:", error)
      throw new Error("Failed to generate QR code")
    }
  }

  private generatePromptPayQRData(promptPayId: string, amount: number, reference: string): string {
    // Simplified QR generation - in production use proper PromptPay QR library
    // This is a mock implementation
    const qrString = `00020101021129370016A000000677010111${promptPayId.padStart(13, "0")}5204000053037645802TH5925${PAYMENT_CONFIG.promptpay.merchantName}6304`

    // In production, use proper QR code generation library
    return `data:image/svg+xml;base64,${Buffer.from(this.generateQRSVG(qrString)).toString("base64")}`
  }

  private generateQRSVG(data: string): string {
    // Mock QR SVG generation - replace with actual QR library
    return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="8">${data.slice(0, 20)}...</text>
      <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="12">QR Code</text>
      <text x="100" y="140" text-anchor="middle" font-family="Arial" font-size="10">Amount: ฿${data.includes("amount") ? "0.00" : "0.00"}</text>
    </svg>`
  }

  // Bank Transfer Information
  async getBankTransferInfo(orderId: string): Promise<BankTransferInfo> {
    const reference = `TRF${orderId.slice(-8)}`

    return {
      account_number: PAYMENT_CONFIG.bankTransfer.accountNumber,
      bank_name: PAYMENT_CONFIG.bankTransfer.bankName,
      branch: PAYMENT_CONFIG.bankTransfer.branch,
      account_holder: PAYMENT_CONFIG.bankTransfer.accountHolder,
      reference_number: reference,
    }
  }

  // Payment Transaction Management
  async createPaymentTransaction(orderId: string, amount: number, method: string, paymentData?: any): Promise<string> {
    try {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { error } = await this.supabase.from("payment_transactions").insert({
        id: transactionId,
        order_id: orderId,
        amount,
        method,
        status: "pending",
        payment_data: paymentData,
      })

      if (error) throw error
      return transactionId
    } catch (error) {
      logger.error("Error creating payment transaction:", error)
      throw new Error("Failed to create payment transaction")
    }
  }

  async updatePaymentStatus(
    transactionId: string,
    status: PaymentTransaction["status"],
    transactionRef?: string,
    paymentData?: any,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("payment_transactions")
        .update({
          status,
          transaction_id: transactionRef,
          payment_data: paymentData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)

      if (error) throw error

      // Update order status if payment completed
      if (status === "completed") {
        const { data: transaction } = await this.supabase
          .from("payment_transactions")
          .select("order_id")
          .eq("id", transactionId)
          .single()

        if (transaction) {
          await this.supabase
            .from("orders")
            .update({ status: "paid", updated_at: new Date().toISOString() })
            .eq("id", transaction.order_id)
        }
      }

      return true
    } catch (error) {
      logger.error("Error updating payment status:", error)
      return false
    }
  }

  async getPaymentTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const { data, error } = await this.supabase
        .from("payment_transactions")
        .select("*")
        .eq("id", transactionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error("Error fetching payment transaction:", error)
      return null
    }
  }

  async getOrderPayments(orderId: string): Promise<PaymentTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from("payment_transactions")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error("Error fetching order payments:", error)
      return []
    }
  }

  // Payment Verification
  async verifyPayment(transactionId: string, verificationData: any): Promise<boolean> {
    try {
      const transaction = await this.getPaymentTransaction(transactionId)
      if (!transaction) return false

      // Mock verification logic - in production integrate with actual payment providers
      const isValid = this.mockPaymentVerification(transaction, verificationData)

      if (isValid) {
        await this.updatePaymentStatus(transactionId, "completed", verificationData.ref)
        return true
      }

      await this.updatePaymentStatus(transactionId, "failed")
      return false
    } catch (error) {
      logger.error("Error verifying payment:", error)
      return false
    }
  }

  private mockPaymentVerification(transaction: PaymentTransaction, verificationData: any): boolean {
    // Mock verification - replace with actual payment provider verification
    return verificationData.amount === transaction.amount && verificationData.reference && verificationData.timestamp
  }

  // Payment Notifications
  async sendPaymentNotification(orderId: string, type: "confirmation" | "reminder" | "failed"): Promise<boolean> {
    try {
      const { data: order } = await this.supabase
        .from("orders")
        .select("customer_email, customer_name, total_amount")
        .eq("id", orderId)
        .single()

      if (!order) return false

      // Send email notification (integrate with email service)
      const emailData = {
        to: order.customer_email,
        subject: this.getEmailSubject(type),
        template: this.getEmailTemplate(type),
        data: {
          customerName: order.customer_name,
          orderId,
          amount: order.total_amount,
        },
      }

      // Mock email sending - replace with actual email service
      logger.info("Payment notification sent:", emailData)
      return true
    } catch (error) {
      logger.error("Error sending payment notification:", error)
      return false
    }
  }

  private getEmailSubject(type: string): string {
    switch (type) {
      case "confirmation":
        return "Payment Confirmation - Order #{orderId}"
      case "reminder":
        return "Payment Reminder - Order #{orderId}"
      case "failed":
        return "Payment Failed - Order #{orderId}"
      default:
        return "Payment Update - Order #{orderId}"
    }
  }

  private getEmailTemplate(type: string): string {
    // Return appropriate email template based on type
    return `payment_${type}`
  }

  // Financial Reports
  async getPaymentSummary(dateRange: { from: string; to: string }) {
    try {
      const { data, error } = await this.supabase
        .from("payment_transactions")
        .select("amount, method, status, created_at")
        .gte("created_at", dateRange.from)
        .lte("created_at", dateRange.to)

      if (error) throw error

      const transactions = data || []
      const summary = {
        total_amount: 0,
        completed_amount: 0,
        pending_amount: 0,
        failed_amount: 0,
        transaction_count: transactions.length,
        methods: {} as Record<string, number>,
      }

      transactions.forEach((txn) => {
        summary.total_amount += txn.amount
        summary.methods[txn.method] = (summary.methods[txn.method] || 0) + txn.amount

        switch (txn.status) {
          case "completed":
            summary.completed_amount += txn.amount
            break
          case "pending":
            summary.pending_amount += txn.amount
            break
          case "failed":
            summary.failed_amount += txn.amount
            break
        }
      })

      return summary
    } catch (error) {
      logger.error("Error fetching payment summary:", error)
      return null
    }
  }
}

export const paymentService = new PaymentService()
