import { ENV } from "@/lib/config/env";

interface SMSConfig {
  provider: "twilio" | "nexmo" | "aws_sns" | "thai_bulk_sms"
  apiKey: string
  apiSecret?: string
  senderId: string
}

interface SMSMessage {
  id: string
  to: string
  message: string
  status: "pending" | "sent" | "delivered" | "failed"
  provider: string
  cost?: number
  sent_at?: string
  delivered_at?: string
  error_message?: string
}

class SMSService {
  private config: SMSConfig
  private messages: SMSMessage[] = []

  constructor(config: SMSConfig) {
    this.config = config
  }

  async sendSMS(to: string, message: string, options?: { priority?: "normal" | "high" }): Promise<SMSMessage> {
    const smsMessage: SMSMessage = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: this.formatPhoneNumber(to),
      message,
      status: "pending",
      provider: this.config.provider,
    }

    try {
      // Mock implementation - replace with actual SMS provider
      if (process.env.NODE_ENV === "development") {
        console.log(`📱 SMS to ${smsMessage.to}: ${message}`)
        smsMessage.status = "sent"
        smsMessage.sent_at = new Date().toISOString()
      } else {
        // Actual SMS sending logic would go here
        await this.sendViaThaiBulkSMS(smsMessage)
      }

      this.messages.push(smsMessage)
      return smsMessage
    } catch (error) {
      smsMessage.status = "failed"
      smsMessage.error_message = error instanceof Error ? error.message : "Unknown error"
      this.messages.push(smsMessage)
      throw error
    }
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<SMSMessage[]> {
    const promises = recipients.map((phone) => this.sendSMS(phone, message))
    return Promise.all(promises)
  }

  // SMS Templates for Marketing
  async sendWelcomeSMS(customerName: string, phone: string) {
    const message = `สวัสดี${customerName}! ยินดีต้อนรับสู่ร้านผ้าคลุมโซฟาพรีเมียม 🛋️ รับส่วนลด 15% ใช้โค้ด WELCOME15 📱 Line: @sofacover`
    return this.sendSMS(phone, message)
  }

  async sendOrderConfirmationSMS(customerName: string, phone: string, orderId: string) {
    const message = `${customerName} ขอบคุณสำหรับคำสั่งซื้อ #${orderId} 🛍️ เราจะแจ้งสถานะการจัดส่งให้ทราบ ติดตาม: ${ENV.BASE_URL}/orders/${orderId}`
    return this.sendSMS(phone, message)
  }

  async sendShippingNotificationSMS(customerName: string, phone: string, trackingNumber: string) {
    const message = `${customerName} สินค้าของคุณจัดส่งแล้ว! 📦 หมายเลขติดตาม: ${trackingNumber} คาดว่าจะได้รับภายใน 2-3 วัน`
    return this.sendSMS(phone, message)
  }

  async sendPromotionSMS(customerName: string, phone: string, discount: number, code: string) {
    const message = `${customerName} โปรโมชันพิเศษ! 🎉 รับส่วนลด ${discount}% ใช้โค้ด ${code} วันนี้-พรุ่งนี้เท่านั้น! 🛋️ สั่งเลย: ${ENV.BASE_URL}`
    return this.sendSMS(phone, message)
  }

  async sendWinBackSMS(customerName: string, phone: string, discount: number) {
    const message = `${customerName} เราคิดถึงคุณ! 💜 กลับมาพร้อมส่วนลด ${discount}% สำหรับผ้าคลุมโซฟาใหม่ๆ 🛋️ ดูเลย: ${ENV.BASE_URL}`
    return this.sendSMS(phone, message)
  }

  // SMS Analytics
  getSMSStats(dateRange?: { start: string; end: string }) {
    let messages = this.messages

    if (dateRange) {
      messages = messages.filter((m) => {
        if (!m.sent_at) return false
        return m.sent_at >= dateRange.start && m.sent_at <= dateRange.end
      })
    }

    const totalSent = messages.filter((m) => m.status === "sent" || m.status === "delivered").length
    const totalDelivered = messages.filter((m) => m.status === "delivered").length
    const totalFailed = messages.filter((m) => m.status === "failed").length
    const totalCost = messages.reduce((sum, m) => sum + (m.cost || 0), 0)

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      totalCost,
      averageCostPerSMS: totalSent > 0 ? totalCost / totalSent : 0,
    }
  }

  // Helper methods
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "")

    // Add Thailand country code if not present
    if (cleaned.startsWith("0")) {
      return "+66" + cleaned.substring(1)
    } else if (cleaned.startsWith("66")) {
      return "+" + cleaned
    } else if (cleaned.startsWith("+66")) {
      return cleaned
    }

    return "+66" + cleaned
  }

  private async sendViaThaiBulkSMS(message: SMSMessage): Promise<void> {
    // Mock implementation for Thai Bulk SMS provider
    // Replace with actual API integration

    const payload = {
      msisdn: message.to,
      message: message.message,
      sender: this.config.senderId,
      username: this.config.apiKey,
      password: this.config.apiSecret,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    message.status = "sent"
    message.sent_at = new Date().toISOString()
    message.cost = 2.5 // 2.5 baht per SMS
  }

  // Get message history
  getMessages(limit?: number): SMSMessage[] {
    const sorted = this.messages.sort(
      (a, b) => new Date(b.sent_at || b.id).getTime() - new Date(a.sent_at || a.id).getTime(),
    )
    return limit ? sorted.slice(0, limit) : sorted
  }

  // Get message by ID
  getMessage(id: string): SMSMessage | undefined {
    return this.messages.find((m) => m.id === id)
  }
}

// Create SMS service instance
const smsConfig: SMSConfig = {
  provider: "thai_bulk_sms",
  apiKey: process.env.SMS_API_KEY || "demo_key",
  apiSecret: process.env.SMS_API_SECRET || "demo_secret",
  senderId: process.env.SMS_SENDER_ID || "SofaCover",
}

export const smsService = new SMSService(smsConfig)

// Export types
export type { SMSConfig, SMSMessage }
