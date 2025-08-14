export interface EmailTemplate {
  id: string
  name: string
  category: "welcome" | "promotional" | "transactional" | "retention" | "seasonal"
  subject: string
  preheader?: string
  html: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmailCampaign {
  id: string
  name: string
  type: "one-time" | "drip" | "triggered" | "recurring"
  status: "draft" | "scheduled" | "active" | "paused" | "completed"
  templateId: string
  targetSegment: string[]
  schedule?: {
    sendAt?: string
    timezone: string
    frequency?: "daily" | "weekly" | "monthly"
    daysOfWeek?: number[]
    timeOfDay?: string
  }
  abTest?: {
    enabled: boolean
    variants: Array<{
      id: string
      name: string
      templateId: string
      percentage: number
    }>
  }
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    unsubscribed: number
    bounced: number
    converted: number
    revenue: number
  }
  createdAt: string
  updatedAt: string
}

class EnhancedEmailTemplateService {
  private templates: EmailTemplate[] = []

  async getTemplates(): Promise<EmailTemplate[]> {
    if (this.templates.length === 0) {
      await this.initializeTemplates()
    }
    return this.templates
  }

  private async initializeTemplates(): Promise<void> {
    const defaultTemplates: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">[] = [
      {
        name: "welcome_series_1",
        category: "welcome",
        subject: "🎉 ยินดีต้อนรับสู่ครอบครัว {{brand_name}} คุณ{{customer_name}}!",
        preheader: "เริ่มต้นการเดินทางกับผ้าคลุมโซฟาคุณภาพสูง",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">🎉 ยินดีต้อนรับ!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">ขอบคุณที่เข้าร่วมครอบครัว {{brand_name}}</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background: #f8fafc;">
              <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; text-align: center;">สวัสดีคุณ{{customer_name}}! 👋</h2>
                
                <p style="color: #4a5568; line-height: 1.8; font-size: 16px; text-align: center; margin-bottom: 30px;">
                  เราดีใจมากที่คุณได้เข้าร่วมกับเรา ที่นี่คุณจะพบกับผ้าคลุมโซฟาคุณภาพสูง 
                  ที่ออกแบบมาเพื่อปกป้องและเพิ่มความสวยงามให้กับโซฟาของคุณ
                </p>
                
                <!-- Welcome Gift -->
                <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                  <h3 style="color: #744210; margin: 0 0 15px 0; font-size: 20px;">🎁 ของขวัญต้อนรับพิเศษ</h3>
                  <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #744210;">ส่วนลด {{discount_percentage}}%</p>
                    <p style="margin: 10px 0 0 0; color: #744210; font-size: 16px;">โค้ด: <strong>{{discount_code}}</strong></p>
                    <p style="margin: 5px 0 0 0; color: #744210; font-size: 14px;">ใช้ได้ถึง {{discount_expiry}}</p>
                  </div>
                </div>
                
                <!-- Features -->
                <div style="margin: 30px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 20px 0; text-align: center; font-size: 20px;">✨ ทำไมต้องเลือกเรา?</h3>
                  <div style="display: grid; gap: 15px;">
                    <div style="display: flex; align-items: center; padding: 15px; background: #f7fafc; border-radius: 8px;">
                      <div style="background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 18px;">🛡️</div>
                      <div>
                        <h4 style="margin: 0; color: #2d3748; font-size: 16px;">ปกป้องโซฟาอย่างสมบูรณ์</h4>
                        <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">กันน้ำ กันสิ่งสกปรก และรอยขีดข่วน</p>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 15px; background: #f7fafc; border-radius: 8px;">
                      <div style="background: #48bb78; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 18px;">🎨</div>
                      <div>
                        <h4 style="margin: 0; color: #2d3748; font-size: 16px;">ดีไซน์สวยงาม</h4>
                        <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">เข้ากับทุกสไตล์การตกแต่ง</p>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 15px; background: #f7fafc; border-radius: 8px;">
                      <div style="background: #ed8936; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 18px;">🚚</div>
                      <div>
                        <h4 style="margin: 0; color: #2d3748; font-size: 16px;">จัดส่งฟรีทั่วไทย</h4>
                        <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">สำหรับคำสั่งซื้อตั้งแต่ 1,000 บาท</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0 20px 0;">
                  <a href="{{shop_url}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                    เริ่มช้อปปิ้งเลย 🛍️
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2d3748; color: white; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">{{brand_name}}</p>
              <p style="margin: 0 0 15px 0; color: #a0aec0; font-size: 14px;">ผ้าคลุมโซฟาคุณภาพสูง เพื่อบ้านที่สวยงาม</p>
              <div style="margin: 20px 0;">
                <a href="{{social_facebook}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Facebook</a>
                <a href="{{social_line}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Line</a>
                <a href="{{social_instagram}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Instagram</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #718096; font-size: 12px;">
                โทร: {{phone_number}} | อีเมล: {{support_email}}
              </p>
            </div>
          </div>
        `,
        variables: [
          "customer_name",
          "brand_name",
          "discount_percentage",
          "discount_code",
          "discount_expiry",
          "shop_url",
          "social_facebook",
          "social_line",
          "social_instagram",
          "phone_number",
          "support_email",
        ],
        isActive: true,
      },
      {
        name: "abandoned_cart_1",
        category: "retention",
        subject: "🛒 คุณ{{customer_name}} ลืมสินค้าไว้ในตะกร้า - กลับมาซื้อเลย!",
        preheader: "สินค้าที่คุณสนใจยังรออยู่ พร้อมส่วนลดพิเศษ",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🛒 อย่าลืมสินค้าในตะกร้า!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">สินค้าที่คุณสนใจยังรออยู่</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 30px 20px; background: #f8fafc;">
              <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 22px; text-align: center;">สวัสดีคุณ{{customer_name}}! 👋</h2>
                
                <p style="color: #4a5568; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 25px;">
                  เราสังเกตเห็นว่าคุณมีสินค้าที่น่าสนใจอยู่ในตะกร้า แต่ยังไม่ได้ทำการสั่งซื้อ
                  อย่าพลาดโอกาสดีๆ นี้นะคะ!
                </p>
                
                <!-- Cart Items -->
                <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; text-align: center;">🛍️ สินค้าในตะกร้าของคุณ</h3>
                  {{#each cart_items}}
                  <div style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 8px; margin-bottom: 10px;">
                    <img src="{{image}}" alt="{{name}}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div style="flex: 1;">
                      <h4 style="margin: 0 0 5px 0; color: #2d3748; font-size: 16px;">{{name}}</h4>
                      <p style="margin: 0; color: #718096; font-size: 14px;">จำนวน: {{quantity}}</p>
                    </div>
                    <div style="text-align: right;">
                      <p style="margin: 0; color: #f093fb; font-weight: bold; font-size: 16px;">{{price}} บาท</p>
                    </div>
                  </div>
                  {{/each}}
                  <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
                    <p style="margin: 0; color: #2d3748; font-size: 18px; font-weight: bold;">รวม: {{total_amount}} บาท</p>
                  </div>
                </div>
                
                <!-- Special Offer -->
                <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
                  <h3 style="color: #744210; margin: 0 0 10px 0; font-size: 18px;">⏰ ข้อเสนอพิเศษ!</h3>
                  <p style="color: #744210; margin: 0 0 15px 0; font-size: 16px;">ซื้อตอนนี้รับส่วนลดเพิ่ม {{discount_percentage}}%</p>
                  <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 20px; font-weight: bold; color: #744210;">โค้ด: {{discount_code}}</p>
                    <p style="margin: 5px 0 0 0; color: #744210; font-size: 14px;">หมดอายุใน {{expiry_hours}} ชั่วโมง</p>
                  </div>
                </div>
                
                <!-- CTA Buttons -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{checkout_url}}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 16px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 16px; margin-right: 15px; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);">
                    ซื้อเลย 🛒
                  </a>
                  <a href="{{shop_url}}" style="background: transparent; color: #f093fb; padding: 16px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 16px; border: 2px solid #f093fb;">
                    ดูสินค้าอื่น
                  </a>
                </div>
                
                <!-- Urgency -->
                <div style="background: #fed7d7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <p style="margin: 0; color: #c53030; font-size: 14px;">
                    ⚠️ สินค้าในตะกร้าจะถูกลบออกใน {{cart_expiry_hours}} ชั่วโมง
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2d3748; color: white; padding: 25px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #a0aec0;">
                หากคุณไม่ต้องการรับอีเมลนี้อีก 
                <a href="{{unsubscribe_url}}" style="color: #f093fb; text-decoration: none;">คลิกที่นี่</a>
              </p>
              <p style="margin: 0; color: #718096; font-size: 12px;">
                {{brand_name}} | โทร: {{phone_number}} | อีเมล: {{support_email}}
              </p>
            </div>
          </div>
        `,
        variables: [
          "customer_name",
          "cart_items",
          "total_amount",
          "discount_percentage",
          "discount_code",
          "expiry_hours",
          "checkout_url",
          "shop_url",
          "cart_expiry_hours",
          "unsubscribe_url",
          "brand_name",
          "phone_number",
          "support_email",
        ],
        isActive: true,
      },
      {
        name: "seasonal_promotion",
        category: "promotional",
        subject: "🌸 {{season_name}} Sale - ส่วนลดสูงสุด {{max_discount}}% เฉพาะ {{days_left}} วันเท่านั้น!",
        preheader: "โปรโมชันพิเศษประจำฤดูกาล อย่าพลาดโอกาสดีๆ นี้",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, {{primary_color}} 0%, {{secondary_color}} 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 700;">{{season_emoji}} {{season_name}} SALE</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 20px; font-weight: 600;">ส่วนลดสูงสุด {{max_discount}}%</p>
            </div>
            
            <!-- Countdown Timer -->
            <div style="background: #1a202c; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #a0aec0;">⏰ เหลือเวลาอีก</p>
              <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                <div style="background: {{primary_color}}; padding: 15px; border-radius: 8px; min-width: 60px;">
                  <div style="font-size: 24px; font-weight: bold;">{{days_left}}</div>
                  <div style="font-size: 12px; opacity: 0.8;">วัน</div>
                </div>
                <div style="background: {{primary_color}}; padding: 15px; border-radius: 8px; min-width: 60px;">
                  <div style="font-size: 24px; font-weight: bold;">{{hours_left}}</div>
                  <div style="font-size: 12px; opacity: 0.8;">ชั่วโมง</div>
                </div>
                <div style="background: {{primary_color}}; padding: 15px; border-radius: 8px; min-width: 60px;">
                  <div style="font-size: 24px; font-weight: bold;">{{minutes_left}}</div>
                  <div style="font-size: 12px; opacity: 0.8;">นาที</div>
                </div>
              </div>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background: #f8fafc;">
              <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; text-align: center;">สวัสดีคุณ{{customer_name}}! 🎉</h2>
                
                <p style="color: #4a5568; line-height: 1.8; font-size: 16px; text-align: center; margin-bottom: 30px;">
                  {{season_description}} เราจึงจัดโปรโมชันพิเศษให้คุณ 
                  ส่วนลดสูงสุด {{max_discount}}% สำหรับผ้าคลุมโซฟาคุณภาพสูง
                </p>
                
                <!-- Featured Products -->
                <div style="margin: 30px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 20px 0; text-align: center; font-size: 20px;">🔥 สินค้าแนะนำในโปรโมชัน</h3>
                  <div style="display: grid; gap: 20px;">
                    {{#each featured_products}}
                    <div style="background: #f7fafc; padding: 20px; border-radius: 12px; display: flex; align-items: center;">
                      <img src="{{image}}" alt="{{name}}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; margin-right: 20px;">
                      <div style="flex: 1;">
                        <h4 style="margin: 0 0 8px 0; color: #2d3748; font-size: 18px;">{{name}}</h4>
                        <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">{{description}}</p>
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <span style="color: #e53e3e; text-decoration: line-through; font-size: 16px;">{{original_price}} บาท</span>
                          <span style="color: {{primary_color}}; font-weight: bold; font-size: 20px;">{{sale_price}} บาท</span>
                          <span style="background: #e53e3e; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">-{{discount}}%</span>
                        </div>
                      </div>
                    </div>
                    {{/each}}
                  </div>
                </div>
                
                <!-- Discount Tiers -->
                <div style="background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
                  <h3 style="color: #234e52; margin: 0 0 20px 0; text-align: center; font-size: 18px;">💎 ยิ่งซื้อมาก ยิ่งลดมาก</h3>
                  <div style="display: grid; gap: 10px;">
                    {{#each discount_tiers}}
                    <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; display: flex; justify-content: between; align-items: center;">
                      <span style="color: #234e52; font-weight: 600;">ซื้อครบ {{min_amount}} บาท</span>
                      <span style="color: #38a169; font-weight: bold; font-size: 16px;">ลด {{discount}}%</span>
                    </div>
                    {{/each}}
                  </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0 20px 0;">
                  <a href="{{shop_url}}" style="background: linear-gradient(135deg, {{primary_color}} 0%, {{secondary_color}} 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 700; font-size: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); text-transform: uppercase; letter-spacing: 1px;">
                    ช้อปเลย {{season_emoji}}
                  </a>
                </div>
                
                <!-- Terms -->
                <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #718096; font-size: 12px; text-align: center; line-height: 1.5;">
                    * เงื่อนไข: {{terms_and_conditions}}
                    <br>* ไม่สามารถใช้ร่วมกับโปรโมชันอื่นได้
                    <br>* สงวนสิทธิ์ในการเปลี่ยนแปลงโดยไม่แจ้งให้ทราบล่วงหน้า
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #2d3748; color: white; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">{{brand_name}}</p>
              <div style="margin: 20px 0;">
                <a href="{{social_facebook}}" style="color: #a0aec0; text-decoration: none; margin: 0 15px; font-size: 14px;">Facebook</a>
                <a href="{{social_line}}" style="color: #a0aec0; text-decoration: none; margin: 0 15px; font-size: 14px;">Line</a>
                <a href="{{social_instagram}}" style="color: #a0aec0; text-decoration: none; margin: 0 15px; font-size: 14px;">Instagram</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #718096; font-size: 12px;">
                โทร: {{phone_number}} | อีเมล: {{support_email}}
                <br><a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none;">ยกเลิกการรับอีเมล</a>
              </p>
            </div>
          </div>
        `,
        variables: [
          "customer_name",
          "season_name",
          "season_emoji",
          "season_description",
          "max_discount",
          "days_left",
          "hours_left",
          "minutes_left",
          "primary_color",
          "secondary_color",
          "featured_products",
          "discount_tiers",
          "terms_and_conditions",
          "shop_url",
          "brand_name",
          "social_facebook",
          "social_line",
          "social_instagram",
          "phone_number",
          "support_email",
          "unsubscribe_url",
        ],
        isActive: true,
      },
    ]

    this.templates = defaultTemplates.map((template, index) => ({
      ...template,
      id: `template_${Date.now()}_${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  }

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    const templates = await this.getTemplates()
    return templates.find((t) => t.id === id) || null
  }

  async createTemplate(template: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.templates.push(newTemplate)
    return newTemplate
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const templateIndex = this.templates.findIndex((t) => t.id === id)
    if (templateIndex === -1) return null

    this.templates[templateIndex] = {
      ...this.templates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return this.templates[templateIndex]
  }

  processTemplate(html: string, variables: Record<string, any>): string {
    let processed = html

    // Handle simple variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g")
      processed = processed.replace(regex, String(value || ""))
    })

    // Handle array iterations {{#each array}}...{{/each}}
    const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g
    processed = processed.replace(eachRegex, (match, arrayName, template) => {
      const array = variables[arrayName]
      if (!Array.isArray(array)) return ""

      return array
        .map((item) => {
          let itemTemplate = template
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g")
            itemTemplate = itemTemplate.replace(regex, String(value || ""))
          })
          return itemTemplate
        })
        .join("")
    })

    return processed
  }
}

export const enhancedEmailTemplates = new EnhancedEmailTemplateService()
