import { emailService } from "@/lib/email"
import { supabase } from "@/lib/supabase"
import { USE_SUPABASE } from "@/lib/runtime"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  customer_type: "new" | "regular" | "frequent" | "premium" | "vip"
  total_spent: number
  total_orders: number
  last_order_date: string
  created_at: string
  status: "active" | "inactive"
}

interface Campaign {
  id: string
  name: string
  type: "welcome" | "birthday" | "win_back" | "upsell" | "newsletter" | "promotion"
  status: "draft" | "active" | "paused" | "completed"
  target_segment: string[]
  email_template: string
  sms_template?: string
  trigger_conditions: any
  schedule?: {
    start_date: string
    end_date?: string
    frequency: "once" | "daily" | "weekly" | "monthly"
  }
  metrics: {
    sent: number
    opened: number
    clicked: number
    converted: number
  }
  created_at: string
}

interface MarketingEvent {
  id: string
  customer_id: string
  event_type: "email_sent" | "email_opened" | "email_clicked" | "sms_sent" | "purchase" | "signup"
  campaign_id?: string
  metadata: any
  timestamp: string
}

class MarketingAutomationService {
  private campaigns: Campaign[] = []
  private events: MarketingEvent[] = []

  // Customer Journey Automation
  async triggerWelcomeSeries(customer: Customer) {
    try {
      // Welcome email immediately
      await this.sendWelcomeEmail(customer)

      // Schedule follow-up emails
      setTimeout(() => this.sendProductRecommendations(customer), 24 * 60 * 60 * 1000) // 1 day
      setTimeout(() => this.sendFirstPurchaseIncentive(customer), 3 * 24 * 60 * 60 * 1000) // 3 days
      setTimeout(() => this.sendCustomerSurvey(customer), 7 * 24 * 60 * 60 * 1000) // 7 days

      await this.trackEvent({
        customer_id: customer.id,
        event_type: "email_sent",
        metadata: { campaign_type: "welcome_series", step: "initiated" },
      })
    } catch (error) {
      console.error("Failed to trigger welcome series:", error)
    }
  }

  async triggerWinBackCampaign(inactiveCustomers: Customer[]) {
    for (const customer of inactiveCustomers) {
      try {
        const daysSinceLastOrder = Math.floor(
          (Date.now() - new Date(customer.last_order_date).getTime()) / (1000 * 60 * 60 * 24),
        )

        let template = "win_back_30_days"
        let discount = 10

        if (daysSinceLastOrder > 90) {
          template = "win_back_90_days"
          discount = 20
        } else if (daysSinceLastOrder > 180) {
          template = "win_back_180_days"
          discount = 25
        }

        await this.sendWinBackEmail(customer, template, discount)

        await this.trackEvent({
          customer_id: customer.id,
          event_type: "email_sent",
          metadata: { campaign_type: "win_back", days_inactive: daysSinceLastOrder, discount },
        })
      } catch (error) {
        console.error(`Failed to send win-back email to ${customer.email}:`, error)
      }
    }
  }

  async triggerUpsellCampaign(customer: Customer, recentOrder: any) {
    try {
      // Analyze recent purchase to suggest complementary products
      const recommendations = await this.getUpsellRecommendations(recentOrder)

      if (recommendations.length > 0) {
        await this.sendUpsellEmail(customer, recommendations)

        await this.trackEvent({
          customer_id: customer.id,
          event_type: "email_sent",
          metadata: {
            campaign_type: "upsell",
            order_id: recentOrder.id,
            recommendations: recommendations.map((r) => r.id),
          },
        })
      }
    } catch (error) {
      console.error("Failed to trigger upsell campaign:", error)
    }
  }

  // Email Templates for Marketing Campaigns
  private async sendWelcomeEmail(customer: Customer) {
    const template = {
      subject: `ยินดีต้อนรับสู่ร้านผ้าคลุมโซฟาพรีเมียม คุณ${customer.name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ยินดีต้อนรับ!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">ขอบคุณที่เข้าร่วมครอบครัวผ้าคลุมโซฟาพรีเมียม</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; text-align: center;">สวัสดีคุณ${customer.name}!</h2>
            
            <p style="color: #374151; line-height: 1.6; text-align: center;">
              เราดีใจมากที่คุณได้เข้าร่วมกับเรา ที่นี่คุณจะพบกับผ้าคลุมโซฟาคุณภาพสูง 
              ที่ออกแบบมาเพื่อปกป้องและเพิ่มความสวยงามให้กับโซฟาของคุณ
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
              <h3 style="color: #ec4899; margin-top: 0;">🎁 ของขวัญพิเศษสำหรับคุณ</h3>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #92400e;">
                  รับส่วนลด 15% สำหรับการสั่งซื้อครั้งแรก
                </p>
                <p style="margin: 5px 0 0 0; color: #92400e;">ใช้โค้ด: <strong>WELCOME15</strong></p>
              </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0;">
              <h3 style="color: #374151; margin-top: 0; text-align: center;">✨ ทำไมต้องเลือกเรา?</h3>
              <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
                <li>ผ้าคุณภาพสูง ทนทาน ใช้งานได้นาน</li>
                <li>ออกแบบสวยงาม เข้ากับทุกสไตล์การตัดแต่ง</li>
                <li>ปกป้องโซฟาจากสิ่งสกปรก รอยขีดข่วน</li>
                <li>ซักทำความสะอาดง่าย</li>
                <li>บริการจัดส่งฟรีทั่วประเทศ</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" 
                 style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                เริ่มช้อปปิ้งเลย
              </a>
            </div>
          </div>
          
          <div style="background: #374151; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">ติดตามเราได้ที่ Line: @sofacover | โทร: 02-123-4567</p>
          </div>
        </div>
      `,
    }

    await emailService.sendBulkEmail([customer.email], template.subject, template.html)
  }

  private async sendProductRecommendations(customer: Customer) {
    const recommendations = await this.getPersonalizedRecommendations(customer)

    const template = {
      subject: `สินค้าแนะนำพิเศษสำหรับคุณ${customer.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0;">🛋️ สินค้าแนะนำสำหรับคุณ</h1>
          </div>
          
          <div style="padding: 25px; background: #f9fafb;">
            <h2 style="color: #1f2937; text-align: center;">สวัสดีคุณ${customer.name}</h2>
            <p style="color: #374151; text-align: center; line-height: 1.6;">
              เราได้คัดสรรสินค้าที่เหมาะสมกับคุณมาแล้ว ลองดูสิ!
            </p>
            
            <div style="display: grid; gap: 20px; margin: 25px 0;">
              ${recommendations
                .slice(0, 3)
                .map(
                  (product) => `
                <div style="background: white; padding: 20px; border-radius: 12px; display: flex; align-items: center;">
                  <img src="${product.images?.[0] || "/placeholder.svg"}" alt="${product.name}" 
                       style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                  <div style="flex: 1;">
                    <h3 style="margin: 0 0 5px 0; color: #374151;">${product.name}</h3>
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">${product.description?.substring(0, 100)}...</p>
                    <p style="margin: 0; color: #ec4899; font-weight: bold;">
                      ${product.price ? `${product.price.toLocaleString("th-TH")} บาท` : "ราคาพิเศษ"}
                    </p>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" 
                 style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                ดูสินค้าทั้งหมด
              </a>
            </div>
          </div>
        </div>
      `,
    }

    await emailService.sendBulkEmail([customer.email], template.subject, template.html)
  }

  private async sendFirstPurchaseIncentive(customer: Customer) {
    const template = {
      subject: `⏰ ส่วนลดพิเศษหมดอายุเร็วๆ นี้ คุณ${customer.name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0;">⏰ เหลือเวลาอีกไม่นาน!</h1>
          </div>
          
          <div style="padding: 25px; background: #f9fafb;">
            <h2 style="color: #1f2937; text-align: center;">คุณ${customer.name} ยังไม่ได้ใช้ส่วนลดเลย!</h2>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
              <h3 style="color: #92400e; margin-top: 0;">🎁 ส่วนลด 15% ยังใช้ได้อยู่!</h3>
              <p style="color: #92400e; font-size: 18px; margin: 10px 0;">
                โค้ด: <strong style="font-size: 24px;">WELCOME15</strong>
              </p>
              <p style="color: #92400e; margin: 0;">⏰ หมดอายุใน 3 วัน!</p>
            </div>
            
            <p style="color: #374151; text-align: center; line-height: 1.6;">
              อย่าพลาดโอกาสดีๆ นี้! เริ่มปกป้องโซฟาของคุณด้วยผ้าคลุมคุณภาพสูง
              พร้อมรับส่วนลดพิเศษ 15%
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" 
                 style="background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                ใช้ส่วนลดตอนนี้
              </a>
            </div>
          </div>
        </div>
      `,
    }

    await emailService.sendBulkEmail([customer.email], template.subject, template.html)
  }

  private async sendWinBackEmail(customer: Customer, template: string, discount: number) {
    const emailTemplate = {
      subject: `เราคิดถึงคุณ${customer.name} - กลับมาพร้อมส่วนลด ${discount}%!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0;">💜 เราคิดถึงคุณ!</h1>
          </div>
          
          <div style="padding: 25px; background: #f9fafb;">
            <h2 style="color: #1f2937; text-align: center;">สวัสดีคุณ${customer.name}</h2>
            <p style="color: #374151; text-align: center; line-height: 1.6;">
              เราสังเกตเห็นว่าคุณไม่ได้มาเยี่ยมชมเราสักพักแล้ว 
              เราอยากให้คุณกลับมาพร้อมกับข้อเสนอพิเศษนี้!
            </p>
            
            <div style="background: #ddd6fe; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0;">
              <h3 style="color: #5b21b6; margin-top: 0;">🎉 ส่วนลดพิเศษ ${discount}%</h3>
              <p style="color: #5b21b6; font-size: 18px; margin: 10px 0;">
                สำหรับการกลับมาของคุณ
              </p>
              <p style="color: #5b21b6; margin: 0;">ใช้ได้กับทุกสินค้า ไม่มีขั้นต่ำ!</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h3 style="color: #374151; margin-top: 0; text-align: center;">🆕 สินค้าใหม่ที่คุณอาจสนใจ</h3>
              <p style="color: #6b7280; text-align: center;">
                เรามีผ้าคลุมโซฟาแบบใหม่ๆ มากมาย พร้อมลวดลายที่สวยงาม
                และคุณภาพที่ดีขึ้นกว่าเดิม
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" 
                 style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                กลับมาช้อปปิ้งเลย
              </a>
            </div>
          </div>
        </div>
      `,
    }

    await emailService.sendBulkEmail([customer.email], emailTemplate.subject, emailTemplate.html)
  }

  private async sendUpsellEmail(customer: Customer, recommendations: any[]) {
    const template = {
      subject: `สินค้าเสริมที่เข้ากันกับการซื้อล่าสุดของคุณ${customer.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0;">🛍️ สินค้าเสริมสำหรับคุณ</h1>
          </div>
          
          <div style="padding: 25px; background: #f9fafb;">
            <h2 style="color: #1f2937; text-align: center;">ขอบคุณสำหรับการสั่งซื้อล่าสุด!</h2>
            <p style="color: #374151; text-align: center; line-height: 1.6;">
              เราคิดว่าสินค้าเหล่านี้จะเข้ากันดีกับการซื้อของคุณ
            </p>
            
            <div style="display: grid; gap: 20px; margin: 25px 0;">
              ${recommendations
                .map(
                  (product) => `
                <div style="background: white; padding: 20px; border-radius: 12px;">
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <img src="${product.images?.[0] || "/placeholder.svg"}" alt="${product.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div>
                      <h3 style="margin: 0 0 5px 0; color: #374151;">${product.name}</h3>
                      <p style="margin: 0; color: #10b981; font-weight: bold;">
                        ${product.price ? `${product.price.toLocaleString("th-TH")} บาท` : "ราคาพิเศษ"}
                      </p>
                    </div>
                  </div>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">${product.description?.substring(0, 150)}...</p>
                </div>
              `,
                )
                .join("")}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" 
                 style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                ดูสินค้าเสริม
              </a>
            </div>
          </div>
        </div>
      `,
    }

    await emailService.sendBulkEmail([customer.email], template.subject, template.html)
  }

  // SMS Marketing
  async sendSMS(phone: string, message: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_FROM_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio credentials are not set")
      return { success: false, error: "Missing Twilio credentials" }
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
      const body = new URLSearchParams({
        From: fromNumber,
        To: phone,
        Body: message,
      })

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to send SMS:", response.status, errorText)
        return { success: false, error: `Twilio error: ${response.statusText}` }
      }

      const data = await response.json()
      return { success: true, messageId: data.sid }
    } catch (error) {
      console.error("Failed to send SMS:", error)
      return { success: false, error: "SMS sending failed" }
    }
  }

  // Campaign Management
  async createCampaign(campaign: Omit<Campaign, "id" | "created_at" | "metrics">) {
    const newCampaign: Campaign = {
      ...campaign,
      id: `campaign_${Date.now()}`,
      created_at: new Date().toISOString(),
      metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    }

    this.campaigns.push(newCampaign)

    if (USE_SUPABASE) {
      // Save to database
      await supabase.from("marketing_campaigns").insert([newCampaign])
    }

    return newCampaign
  }

  async getCampaigns() {
    if (USE_SUPABASE) {
      const { data } = await supabase.from("marketing_campaigns").select("*").order("created_at", { ascending: false })
      return data || []
    }
    return this.campaigns
  }

  // Analytics and Tracking
  private async trackEvent(event: Omit<MarketingEvent, "id" | "timestamp">) {
    const newEvent: MarketingEvent = {
      ...event,
      id: `event_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    this.events.push(newEvent)

    if (USE_SUPABASE) {
      await supabase.from("marketing_events").insert([newEvent])
    }
  }

  async getMarketingMetrics(dateRange?: { start: string; end: string }) {
    let events = this.events

    if (dateRange) {
      events = events.filter((e) => e.timestamp >= dateRange.start && e.timestamp <= dateRange.end)
    }

    const emailsSent = events.filter((e) => e.event_type === "email_sent").length
    const emailsOpened = events.filter((e) => e.event_type === "email_opened").length
    const emailsClicked = events.filter((e) => e.event_type === "email_clicked").length
    const smsSent = events.filter((e) => e.event_type === "sms_sent").length

    return {
      emailsSent,
      emailsOpened,
      emailsClicked,
      smsSent,
      openRate: emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0,
      clickRate: emailsSent > 0 ? (emailsClicked / emailsSent) * 100 : 0,
    }
  }

  // Helper methods
  private async getPersonalizedRecommendations(customer: Customer) {
    // Mock implementation - in real app, this would use ML/AI
    if (USE_SUPABASE) {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .limit(6)
        .order("rating", { ascending: false })
      return data || []
    }
    return []
  }

  private async getUpsellRecommendations(order: any) {
    // Mock implementation - analyze order and suggest complementary products
    if (USE_SUPABASE) {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .neq("category", order.items[0]?.category)
        .limit(3)
      return data || []
    }
    return []
  }

  private async sendCustomerSurvey(customer: Customer) {
    const template = {
      subject: `ช่วยเราปรับปรุงบริการให้ดีขึ้น คุณ${customer.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0;">📝 ความคิดเห็นของคุณสำคัญ</h1>
          </div>
          
          <div style="padding: 25px; background: #f9fafb;">
            <h2 style="color: #1f2937; text-align: center;">สวัสดีคุณ${customer.name}</h2>
            <p style="color: #374151; text-align: center; line-height: 1.6;">
              เราอยากทราบความคิดเห็นของคุณเพื่อนำมาปรับปรุงสินค้าและบริการให้ดีขึ้น
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/survey" 
                 style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                ตอบแบบสำรวจ (ใช้เวลา 2 นาที)
              </a>
            </div>
            
            <p style="color: #6b7280; text-align: center; font-size: 14px;">
              🎁 ผู้ที่ตอบแบบสำรวจจะได้รับคูปองส่วนลด 10% สำหรับการซื้อครั้งถัดไป
            </p>
          </div>
        </div>
      `,
    }

    await emailService.sendBulkEmail([customer.email], template.subject, template.html)
  }
}

// Export singleton instance
export const marketingAutomation = new MarketingAutomationService()

// Export types
export type { Customer, Campaign, MarketingEvent }
