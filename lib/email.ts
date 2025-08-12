import { logger } from '@/lib/logger';
import nodemailer from "nodemailer"

export function createTransporter() {
  if (!process.env.SMTP_HOST) {
    return { sendMail: async () => ({ messageId: "mock" }) }
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

// Email configuration
const transporter = createTransporter()

// Email templates
export const emailTemplates = {
  newOrder: {
    subject: (orderNumber: string) => `คำสั่งซื้อใหม่ #${orderNumber}`,
    html: (order: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">คำสั่งซื้อใหม่</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #1f2937;">รายละเอียดคำสั่งซื้อ #${order.id}</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #374151; margin-top: 0;">ข้อมูลลูกค้า</h3>
            <p><strong>ชื่อ:</strong> ${order.customer.name}</p>
            <p><strong>อีเมล:</strong> ${order.customer.email}</p>
            <p><strong>เบอร์โทร:</strong> ${order.customer.phone}</p>
            <p><strong>ที่อยู่:</strong> ${order.shipping_address}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #374151; margin-top: 0;">รายการสินค้า</h3>
            ${order.items
              .map(
                (item: any) => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <p><strong>${item.name}</strong></p>
                <p style="color: #6b7280; font-size: 14px;">${item.specifications}</p>
                <p>จำนวน: ${item.quantity} × ${item.price.toLocaleString("th-TH")} บาท</p>
              </div>
            `,
              )
              .join("")}
            
            <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ec4899;">
              <h3 style="color: #ec4899; margin: 0;">ยอดรวม: ${order.total.toLocaleString("th-TH")} บาท</h3>
            </div>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #374151; margin-top: 0;">สถานะการชำระเงิน</h3>
            <p><strong>วิธีการชำระ:</strong> ${getPaymentMethodText(order.payment_method)}</p>
            <p><strong>สถานะ:</strong> <span style="color: ${order.payment_status === "paid" ? "#10b981" : "#f59e0b"};">${getPaymentStatusText(order.payment_status)}</span></p>
          </div>
          
          ${
            order.notes
              ? `
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="color: #374151; margin-top: 0;">หมายเหตุ</h3>
              <p>${order.notes}</p>
            </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" 
               style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              ดูรายละเอียดในระบบ
            </a>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>อีเมลนี้ส่งโดยอัตโนมัติจากระบบจัดการคำสั่งซื้อ</p>
          <p>ร้านผ้าคลุมโซฟาพรีเมียม | โทร: 02-123-4567</p>
        </div>
      </div>
    `,
  },

  lowStock: {
    subject: (productName: string) => `แจ้งเตือน: สินค้าใกล้หมด - ${productName}`,
    html: (product: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ แจ้งเตือนสต็อกต่ำ</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h2 style="color: #1f2937; margin-top: 0;">สินค้าใกล้หมด</h2>
            
            <div style="display: flex; align-items: center; margin: 15px 0;">
              ${
                product.images && product.images[0]
                  ? `
                <img src="${product.images[0]}" alt="${product.name}" 
                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
              `
                  : ""
              }
              <div>
                <h3 style="margin: 0; color: #374151;">${product.name}</h3>
                <p style="margin: 5px 0; color: #6b7280;">${product.name_en}</p>
                <p style="margin: 5px 0;"><strong>คงเหลือ: <span style="color: #dc2626;">${product.stock} ชิ้น</span></strong></p>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ คำเตือน:</strong> สินค้านี้เหลือน้อยกว่า 10 ชิ้น กรุณาเติมสต็อกโดยเร็ว
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <p><strong>หมวดหมู่:</strong> ${product.category === "covers" ? "ผ้าคลุมโซฟา" : "อุปกรณ์เสริม"}</p>
              <p><strong>สถานะ:</strong> <span style="color: #f59e0b;">${getProductStatusText(product.status)}</span></p>
              <p><strong>ยอดขาย:</strong> ${product.sold_count} ชิ้น</p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/products" 
                 style="background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                จัดการสินค้า
              </a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/products/${product.id}" 
                 style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ดูรายละเอียด
              </a>
            </div>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>อีเมลนี้ส่งโดยอัตโนมัติจากระบบจัดการสต็อก</p>
          <p>ร้านผ้าคลุมโซฟาพรีเมียม | โทร: 02-123-4567</p>
        </div>
      </div>
    `,
  },

  customerMessage: {
    subject: (customerName: string) => `ข้อความใหม่จาก ${customerName}`,
    html: (message: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">💬 ข้อความใหม่จากลูกค้า</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">ข้อมูลผู้ส่ง</h2>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>ชื่อ:</strong> ${message.name}</p>
              <p><strong>อีเมล:</strong> ${message.email}</p>
              <p><strong>เบอร์โทร:</strong> ${message.phone}</p>
              ${message.subject ? `<p><strong>หัวข้อ:</strong> ${message.subject}</p>` : ""}
              ${message.sofaType ? `<p><strong>ประเภทโซฟา:</strong> ${message.sofaType}</p>` : ""}
              ${message.urgency ? `<p><strong>ความเร่งด่วน:</strong> ${getUrgencyText(message.urgency)}</p>` : ""}
            </div>
            
            <h3 style="color: #374151;">ข้อความ</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; line-height: 1.6;">${message.message.replace(/\n/g, "<br>")}</p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="mailto:${message.email}" 
                 style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                ตอบกลับทางอีเมล
              </a>
              <a href="tel:${message.phone}" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                โทรกลับ
              </a>
            </div>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>อีเมลนี้ส่งโดยอัตโนมัติจากแบบฟอร์มติดต่อ</p>
          <p>ร้านผ้าคลุมโซฟาพรีเมียม | โทร: 02-123-4567</p>
        </div>
      </div>
    `,
  },

  orderStatusUpdate: {
    subject: (orderNumber: string, status: string) =>
      `อัปเดตสถานะคำสั่งซื้อ #${orderNumber} - ${getOrderStatusText(status)}`,
    html: (order: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">📦 อัปเดตสถานะคำสั่งซื้อ</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">คำสั่งซื้อ #${order.id}</h2>
            
            <div style="text-align: center; margin: 20px 0;">
              <div style="background: ${getStatusColor(order.status)}; color: white; padding: 15px 25px; border-radius: 25px; display: inline-block; font-size: 18px; font-weight: bold;">
                ${getOrderStatusText(order.status)}
              </div>
            </div>
            
            ${
              order.status === "shipped" && order.tracking_number
                ? `
              <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>หมายเลขติดตาม:</strong> 
                  <span style="font-family: monospace; font-size: 16px;">${order.tracking_number}</span>
                </p>
              </div>
            `
                : ""
            }
            
            ${
              order.estimated_delivery
                ? `
              <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 0; color: #166534;">
                  <strong>📅 วันที่คาดว่าจะได้รับ:</strong> ${new Date(order.estimated_delivery).toLocaleDateString("th-TH")}
                </p>
              </div>
            `
                : ""
            }
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151;">รายการสินค้า</h3>
              ${order.items
                .map(
                  (item: any) => `
                <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                  <p style="margin: 5px 0;"><strong>${item.name}</strong></p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${item.specifications}</p>
                  <p style="margin: 5px 0;">จำนวน: ${item.quantity} × ${item.price.toLocaleString("th-TH")} บาท</p>
                </div>
              `,
                )
                .join("")}
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}" 
                 style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ดูรายละเอียดคำสั่งซื้อ
              </a>
            </div>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>ขอบคุณที่ไว้วางใจในสินค้าและบริการของเรา</p>
          <p>ร้านผ้าคลุมโซฟาพรีเมียม | โทร: 02-123-4567 | Line: @sofacover</p>
        </div>
      </div>
    `,
  },
}

// Helper functions
function getPaymentMethodText(method: string): string {
  const methods: Record<string, string> = {
    bank_transfer: "โอนเงินผ่านธนาคาร",
    promptpay: "พร้อมเพย์",
    cod: "เก็บเงินปลายทาง",
    credit_card: "บัตรเครดิต/เดบิต",
  }
  return methods[method] || method
}

function getPaymentStatusText(status: string): string {
  const statuses: Record<string, string> = {
    pending: "รอชำระเงิน",
    paid: "ชำระเงินแล้ว",
    refunded: "คืนเงินแล้ว",
  }
  return statuses[status] || status
}

function getOrderStatusText(status: string): string {
  const statuses: Record<string, string> = {
    pending: "รอดำเนินการ",
    production: "กำลังผลิต",
    shipped: "จัดส่งแล้ว",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  }
  return statuses[status] || status
}

function getProductStatusText(status: string): string {
  const statuses: Record<string, string> = {
    active: "เปิดขาย",
    draft: "แบบร่าง",
    low_stock: "สต็อกต่ำ",
    out_of_stock: "หมด",
  }
  return statuses[status] || status
}

function getUrgencyText(urgency: string): string {
  const urgencies: Record<string, string> = {
    normal: "ปกติ (7-14 วัน)",
    urgent: "เร่งด่วน (3-7 วัน)",
    express: "ด่วนพิเศษ (1-3 วัน)",
  }
  return urgencies[urgency] || urgency
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    production: "#3b82f6",
    shipped: "#8b5cf6",
    completed: "#10b981",
    cancelled: "#ef4444",
  }
  return colors[status] || "#6b7280"
}

// Email sending functions
export const emailService = {
  async sendNewOrderNotification(order: any) {
    try {
      const template = emailTemplates.newOrder

      await transporter.sendMail({
        from: `"ร้านผ้าคลุมโซฟาพรีเมียม" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || "admin@sofacover.com",
        subject: template.subject(order.id),
        html: template.html(order),
      })

      logger.info(`New order notification sent for order ${order.id}`)
    } catch (error) {
      logger.error("Failed to send new order notification:", error)
      throw error
    }
  },

  async sendLowStockAlert(product: any) {
    try {
      const template = emailTemplates.lowStock

      await transporter.sendMail({
        from: `"ระบบแจ้งเตือนสต็อก" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || "admin@sofacover.com",
        subject: template.subject(product.name),
        html: template.html(product),
      })

      logger.info(`Low stock alert sent for product ${product.id}`)
    } catch (error) {
      logger.error("Failed to send low stock alert:", error)
      throw error
    }
  },

  async sendCustomerMessageNotification(message: any) {
    try {
      const template = emailTemplates.customerMessage

      await transporter.sendMail({
        from: `"ข้อความจากลูกค้า" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || "admin@sofacover.com",
        subject: template.subject(message.name),
        html: template.html(message),
      })

      logger.info(`Customer message notification sent from ${message.email}`)
    } catch (error) {
      logger.error("Failed to send customer message notification:", error)
      throw error
    }
  },

  async sendOrderStatusUpdate(order: any, customerEmail: string) {
    try {
      const template = emailTemplates.orderStatusUpdate

      await transporter.sendMail({
        from: `"ร้านผ้าคลุมโซฟาพรีเมียม" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: template.subject(order.id, order.status),
        html: template.html(order),
      })

      logger.info(`Order status update sent to ${customerEmail} for order ${order.id}`)
    } catch (error) {
      logger.error("Failed to send order status update:", error)
      throw error
    }
  },

  async sendBulkEmail(recipients: string[], subject: string, htmlContent: string) {
    try {
      const promises = recipients.map((email) =>
        transporter.sendMail({
          from: `"ร้านผ้าคลุมโซฟาพรีเมียม" <${process.env.SMTP_USER}>`,
          to: email,
          subject,
          html: htmlContent,
        }),
      )

      await Promise.all(promises)
      logger.info(`Bulk email sent to ${recipients.length} recipients`)
    } catch (error) {
      logger.error("Failed to send bulk email:", error)
      throw error
    }
  },

  // Test email connection
  async testConnection() {
      try {
        if ("verify" in transporter && typeof transporter.verify === "function") {
          await (transporter as any).verify()
          logger.info("Email service connection verified successfully")
          return true
        }
        return true
      } catch (error) {
        logger.error("Email service connection failed:", error)
        return false
      }
    },
}

// Email automation triggers
export const emailAutomation = {
  // Trigger when new order is created
  async onNewOrder(order: any) {
    try {
      // Send notification to admin
      await emailService.sendNewOrderNotification(order)

      // Send confirmation to customer
      await emailService.sendOrderStatusUpdate(order, order.customer.email)

      logger.info(`Email automation triggered for new order ${order.id}`)
    } catch (error) {
      logger.error("Email automation failed for new order:", error)
    }
  },

  // Trigger when product stock is low
  async onLowStock(product: any) {
    try {
      await emailService.sendLowStockAlert(product)
      logger.info(`Email automation triggered for low stock product ${product.id}`)
    } catch (error) {
      logger.error("Email automation failed for low stock:", error)
    }
  },

  // Trigger when customer sends message
  async onCustomerMessage(message: any) {
    try {
      await emailService.sendCustomerMessageNotification(message)
      logger.info(`Email automation triggered for customer message from ${message.email}`)
    } catch (error) {
      logger.error("Email automation failed for customer message:", error)
    }
  },

  // Trigger when order status changes
  async onOrderStatusChange(order: any, previousStatus: string) {
    try {
      // Only send email for certain status changes
      const notifiableStatuses = ["production", "shipped", "completed", "cancelled"]

      if (notifiableStatuses.includes(order.status)) {
        await emailService.sendOrderStatusUpdate(order, order.customer.email)
        logger.info(
          `Email automation triggered for order status change ${order.id}: ${previousStatus} -> ${order.status}`,
        )
      }
    } catch (error) {
      logger.error("Email automation failed for order status change:", error)
    }
  },
}
