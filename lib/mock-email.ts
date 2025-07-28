import { developmentConfig } from "./development-config"

// Email types
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  variables: string[]
}

export interface EmailHistoryItem {
  id: string
  to: string
  subject: string
  status: "sent" | "failed"
  sentAt: string
}

export interface EmailStats {
  totalSent: number
  totalFailed: number
  successRate: number
}

// In-memory storage
let emailTemplates: EmailTemplate[] = []

// Utility functions
const generateId = () => Math.random().toString(36).substring(2, 15)

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
class MockEmailService {
  private emailHistory: EmailHistoryItem[] = []
  private stats: EmailStats = {
    totalSent: 0,
    totalFailed: 0,
    successRate: 100,
  }

  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    // Simulate email sending
    const success = Math.random() > 0.1 // 90% success rate

    const emailItem: EmailHistoryItem = {
      id: Date.now().toString(),
      to,
      subject,
      status: success ? "sent" : "failed",
      sentAt: new Date().toISOString(),
    }

    this.emailHistory.push(emailItem)

    if (success) {
      this.stats.totalSent++
    } else {
      this.stats.totalFailed++
    }

    this.stats.successRate = (this.stats.totalSent / (this.stats.totalSent + this.stats.totalFailed)) * 100

    return success
  }

  async getEmailStatistics(): Promise<EmailStats> {
    return this.stats
  }

  async getEmailHistory(limit = 10): Promise<EmailHistoryItem[]> {
    return this.emailHistory.slice(-limit).reverse()
  }

  async clearEmailHistory(): Promise<void> {
    this.emailHistory = []
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      successRate: 100,
    }
  }
}

export const mockEmailService = new MockEmailService()

// Auto-initialize templates
if (developmentConfig.services.email.useMock) {
  mockEmailService.initializeTemplates().catch(console.error)
}

// Method to initialize templates
MockEmailService.prototype.initializeTemplates = async (): Promise<void> => {
  if (emailTemplates.length === 0) {
    emailTemplates = defaultTemplates.map((template) => ({
      ...template,
      id: generateId(),
    }))
    console.log("📧 [MOCK EMAIL] Templates initialized")
  }
}

// Method to get templates
MockEmailService.prototype.getTemplates = async function (): Promise<EmailTemplate[]> {
  await this.initializeTemplates()
  return [...emailTemplates]
}

// Method to get template by name
MockEmailService.prototype.getTemplate = async function (name: string): Promise<EmailTemplate | null> {
  await this.initializeTemplates()
  return emailTemplates.find((t) => t.name === name) || null
}

// Method to send email using template
MockEmailService.prototype.sendTemplateEmail = async function (
  to: string,
  templateName: string,
  variables: Record<string, any>,
): Promise<EmailHistoryItem> {
  const template = await this.getTemplate(templateName)
  if (!template) {
    throw new Error(`Template '${templateName}' not found`)
  }

  const subject = processTemplate(template.subject, variables)
  const html = processTemplate(template.html, variables)

  const success = await this.sendEmail(to, subject, html)
  const emailRecord: EmailHistoryItem = {
    id: Date.now().toString(),
    to,
    subject,
    status: success ? "sent" : "failed",
    sentAt: new Date().toISOString(),
  }

  if (developmentConfig.services.email.logToConsole) {
    console.log(`📧 [MOCK EMAIL] ${success ? "✅ Sent" : "❌ Failed"}:`, {
      to,
      subject,
      template: templateName,
      variables,
    })
  }

  return emailRecord
}

// Convenience methods for common emails
MockEmailService.prototype.sendOrderConfirmation = async function (orderData: {
  customer_name: string
  customer_email: string
  order_id: string
  total: number
  status: string
}): Promise<EmailHistoryItem> {
  return this.sendTemplateEmail(orderData.customer_email, "order_confirmation", orderData)
}

MockEmailService.prototype.sendShippingNotification = async function (shippingData: {
  customer_name: string
  customer_email: string
  order_id: string
  tracking_number: string
  shipping_company: string
}): Promise<EmailHistoryItem> {
  return this.sendTemplateEmail(shippingData.customer_email, "shipping_notification", shippingData)
}

MockEmailService.prototype.sendWelcomeEmail = async function (customerData: {
  customer_name: string
  customer_email: string
}): Promise<EmailHistoryItem> {
  return this.sendTemplateEmail(customerData.customer_email, "welcome_email", customerData)
}

MockEmailService.prototype.sendCustomerMessageNotification = async function (messageData: {
  name: string
  email: string
  phone: string
  message: string
}): Promise<EmailHistoryItem> {
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
}
