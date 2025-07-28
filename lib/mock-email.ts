import { developmentConfig } from "./development-config"

// Email types
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  variables: string[]
}

export interface EmailHistory {
  id: string
  to: string
  subject: string
  template_id?: string
  variables?: Record<string, any>
  status: "sent" | "failed" | "pending"
  error_message?: string
  sent_at: string
}

export interface EmailStatistics {
  totalSent: number
  totalFailed: number
  successRate: number
  byTemplate: Record<string, number>
  byStatus: Record<string, number>
  recentEmails: EmailHistory[]
}

// In-memory storage
let emailHistory: EmailHistory[] = []
let emailTemplates: EmailTemplate[] = []

// Utility functions
const generateId = () => Math.random().toString(36).substring(2, 15)

const simulateLatency = async () => {
  const delay = Math.random() * 1000 + 500 // 0.5-1.5 seconds
  await new Promise((resolve) => setTimeout(resolve, delay))
}

const simulateEmailSending = (): boolean => {
  return Math.random() < developmentConfig.services.email.successRate
}

const processTemplate = (template: string, variables: Record<string, any>): string => {
  let processed = template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g")
    processed = processed.replace(regex, String(value))
  })
  return processed
}

// Email templates
const defaultTemplates: Omit<EmailTemplate, "id">[] = [
  {
    name: "order_confirmation",
    subject: "ยืนยันการสั่งซื้อ #{{order_id}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">ยืนยันการสั่งซื้อ</h2>
        <p>เรียน คุณ{{customer_name}}</p>
        <p>ขอบคุณที่สั่งซื้อสินค้ากับเรา รายละเอียดการสั่งซื้อของคุณ:</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>หมายเลขคำสั่งซื้อ: #{{order_id}}</h3>
          <p><strong>ยอดรวม:</strong> {{total}} บาท</p>
          <p><strong>สถานะ:</strong> {{status}}</p>
        </div>
        
        <p>เราจะดำเนินการจัดส่งสินค้าให้คุณโดยเร็วที่สุด</p>
        <p>ขอบคุณครับ</p>
      </div>
    `,
    variables: ["customer_name", "order_id", "total", "status"],
  },
  {
    name: "shipping_notification",
    subject: "สินค้าของคุณถูกจัดส่งแล้ว #{{order_id}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">แจ้งการจัดส่งสินค้า</h2>
        <p>เรียน คุณ{{customer_name}}</p>
        <p>สินค้าของคุณได้ถูกจัดส่งแล้ว!</p>
        
        <div style="background: #e8f5e8; padding: 20px; margin: 20px 0;">
          <h3>หมายเลขคำสั่งซื้อ: #{{order_id}}</h3>
          <p><strong>หมายเลขพัสดุ:</strong> {{tracking_number}}</p>
          <p><strong>บริษัทขนส่ง:</strong> {{shipping_company}}</p>
        </div>
        
        <p>คุณสามารถติดตามสถานะพัสดุได้ที่เว็บไซต์ของบริษัทขนส่ง</p>
        <p>ขอบคุณครับ</p>
      </div>
    `,
    variables: ["customer_name", "order_id", "tracking_number", "shipping_company"],
  },
  {
    name: "welcome_email",
    subject: "ยินดีต้อนรับสู่ร้านผ้าคลุมโซฟา",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">ยินดีต้อนรับ!</h2>
        <p>เรียน คุณ{{customer_name}}</p>
        <p>ยินดีต้อนรับสู่ร้านผ้าคลุมโซฟาของเรา!</p>
        
        <div style="background: #f0f8ff; padding: 20px; margin: 20px 0;">
          <h3>สิทธิพิเศษสำหรับสมาชิกใหม่</h3>
          <p>🎉 รับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก</p>
          <p>📦 จัดส่งฟรีสำหรับคำสั่งซื้อตั้งแต่ 1,000 บาท</p>
          <p>💬 บริการปรึกษาฟรีจากผู้เชี่ยวชาญ</p>
        </div>
        
        <p>เราหวังว่าคุณจะพอใจกับสินค้าและบริการของเรา</p>
        <p>ขอบคุณครับ</p>
      </div>
    `,
    variables: ["customer_name"],
  },
  {
    name: "customer_message_notification",
    subject: "ได้รับข้อความจากลูกค้า - {{customer_name}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">ข้อความจากลูกค้า</h2>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <p><strong>ชื่อ:</strong> {{customer_name}}</p>
          <p><strong>อีเมล:</strong> {{customer_email}}</p>
          <p><strong>เบอร์โทร:</strong> {{customer_phone}}</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h4>ข้อความ:</h4>
          <p>{{message}}</p>
        </div>
        
        <p>กรุณาติดต่อกลับลูกค้าโดยเร็วที่สุด</p>
      </div>
    `,
    variables: ["customer_name", "customer_email", "customer_phone", "message"],
  },
]

// Mock Email Service
export const mockEmailService = {
  // Initialize templates
  async initializeTemplates(): Promise<void> {
    if (emailTemplates.length === 0) {
      emailTemplates = defaultTemplates.map((template) => ({
        ...template,
        id: generateId(),
      }))
      console.log("📧 [MOCK EMAIL] Templates initialized")
    }
  },

  // Get templates
  async getTemplates(): Promise<EmailTemplate[]> {
    await this.initializeTemplates()
    return [...emailTemplates]
  },

  // Get template by name
  async getTemplate(name: string): Promise<EmailTemplate | null> {
    await this.initializeTemplates()
    return emailTemplates.find((t) => t.name === name) || null
  },

  // Send email using template
  async sendTemplateEmail(to: string, templateName: string, variables: Record<string, any>): Promise<EmailHistory> {
    await simulateLatency()

    const template = await this.getTemplate(templateName)
    if (!template) {
      throw new Error(`Template '${templateName}' not found`)
    }

    const success = simulateEmailSending()
    const emailRecord: EmailHistory = {
      id: generateId(),
      to,
      subject: processTemplate(template.subject, variables),
      template_id: template.id,
      variables,
      status: success ? "sent" : "failed",
      error_message: success ? undefined : "Simulated email sending failure",
      sent_at: new Date().toISOString(),
    }

    emailHistory.push(emailRecord)

    if (developmentConfig.services.email.logToConsole) {
      console.log(`📧 [MOCK EMAIL] ${success ? "✅ Sent" : "❌ Failed"}:`, {
        to,
        subject: emailRecord.subject,
        template: templateName,
        variables,
      })
    }

    return emailRecord
  },

  // Send plain email
  async sendEmail(to: string, subject: string, html: string): Promise<EmailHistory> {
    await simulateLatency()

    const success = simulateEmailSending()
    const emailRecord: EmailHistory = {
      id: generateId(),
      to,
      subject,
      status: success ? "sent" : "failed",
      error_message: success ? undefined : "Simulated email sending failure",
      sent_at: new Date().toISOString(),
    }

    emailHistory.push(emailRecord)

    if (developmentConfig.services.email.logToConsole) {
      console.log(`📧 [MOCK EMAIL] ${success ? "✅ Sent" : "❌ Failed"}:`, {
        to,
        subject,
      })
    }

    return emailRecord
  },

  // Convenience methods for common emails
  async sendOrderConfirmation(orderData: {
    customer_name: string
    customer_email: string
    order_id: string
    total: number
    status: string
  }): Promise<EmailHistory> {
    return this.sendTemplateEmail(orderData.customer_email, "order_confirmation", orderData)
  },

  async sendShippingNotification(shippingData: {
    customer_name: string
    customer_email: string
    order_id: string
    tracking_number: string
    shipping_company: string
  }): Promise<EmailHistory> {
    return this.sendTemplateEmail(shippingData.customer_email, "shipping_notification", shippingData)
  },

  async sendWelcomeEmail(customerData: {
    customer_name: string
    customer_email: string
  }): Promise<EmailHistory> {
    return this.sendTemplateEmail(customerData.customer_email, "welcome_email", customerData)
  },

  async sendCustomerMessageNotification(messageData: {
    name: string
    email: string
    phone: string
    message: string
  }): Promise<EmailHistory> {
    return this.sendTemplateEmail(
      "admin@sofacover.com", // Send to admin
      "customer_message_notification",
      {
        customer_name: messageData.name,
        customer_email: messageData.email,
        customer_phone: messageData.phone,
        message: messageData.message,
      },
    )
  },

  // Email history and statistics
  async getEmailHistory(limit = 50): Promise<EmailHistory[]> {
    return emailHistory.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()).slice(0, limit)
  },

  async getEmailStatistics(): Promise<EmailStatistics> {
    const totalSent = emailHistory.filter((e) => e.status === "sent").length
    const totalFailed = emailHistory.filter((e) => e.status === "failed").length
    const successRate = emailHistory.length > 0 ? (totalSent / emailHistory.length) * 100 : 0

    // Group by template
    const byTemplate: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    emailHistory.forEach((email) => {
      // By template
      if (email.template_id) {
        const template = emailTemplates.find((t) => t.id === email.template_id)
        const templateName = template?.name || "unknown"
        byTemplate[templateName] = (byTemplate[templateName] || 0) + 1
      }

      // By status
      byStatus[email.status] = (byStatus[email.status] || 0) + 1
    })

    const recentEmails = await this.getEmailHistory(10)

    return {
      totalSent,
      totalFailed,
      successRate,
      byTemplate,
      byStatus,
      recentEmails,
    }
  },

  // Clear email history
  async clearEmailHistory(): Promise<void> {
    emailHistory = []
    console.log("🗑️ [MOCK EMAIL] Email history cleared")
  },

  // Get email stats for demo panel
  async getEmailStats() {
    const stats = await this.getEmailStatistics()
    return {
      total: emailHistory.length,
      sent: stats.totalSent,
      failed: stats.totalFailed,
      successRate: Math.round(stats.successRate),
      byType: stats.byTemplate,
      byStatus: stats.byStatus,
      recent: stats.recentEmails.slice(0, 5).map((email) => ({
        id: email.id,
        subject: email.subject,
        to: email.to,
        type: emailTemplates.find((t) => t.id === email.template_id)?.name || "custom",
        sent_at: email.sent_at,
      })),
    }
  },
}

// Auto-initialize
if (developmentConfig.services.email.useMock) {
  mockEmailService.initializeTemplates().catch(console.error)
}
