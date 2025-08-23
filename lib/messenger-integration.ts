export interface MessengerConfig {
  pageId: string
  accessToken?: string
  webhookVerifyToken?: string
  apiVersion: string
}

export interface FabricSelection {
  fabricId: string
  fabricName: string
  collectionName: string
  imageUrl: string
  price: string
  customerMessage?: string
}

export interface BillShare {
  billId: string
  customerName: string
  totalAmount: number
  billUrl: string
  customMessage?: string
}

export class MessengerIntegrationService {
  private config: MessengerConfig

  constructor(config: MessengerConfig) {
    this.config = config
  }

  // ส่งลายผ้ากลับไปยัง Messenger
  async sendFabricSelection(selection: FabricSelection, recipientId?: string): Promise<string> {
    const message = this.formatFabricMessage(selection)

    if (recipientId && this.config.accessToken) {
      // ส่งผ่าน Facebook API (เมื่อมี access token)
      return await this.sendDirectMessage(recipientId, message, selection.imageUrl)
    } else {
      // สร้าง URL สำหรับเปิด Messenger พร้อมข้อความ
      return this.createMessengerUrl(message)
    }
  }

  // ส่งบิลผ่าน Messenger
  async sendBillToMessenger(bill: BillShare, recipientId?: string): Promise<string> {
    const message = this.formatBillMessage(bill)

    if (recipientId && this.config.accessToken) {
      return await this.sendDirectMessage(recipientId, message)
    } else {
      return this.createMessengerUrl(message)
    }
  }

  // สร้างข้อความสำหรับลายผ้า
  private formatFabricMessage(selection: FabricSelection): string {
    return `🎨 ลายผ้าที่เลือก: ${selection.fabricName}

📁 คอลเลกชัน: ${selection.collectionName}
💰 ราคา: ${selection.price}

${selection.customerMessage || "สนใจสั่งทำผ้าคลุมโซฟาลายนี้ครับ/ค่ะ"}

กรุณาแจ้งขนาดโซฟาและรายละเอียดเพิ่มเติมด้วยครับ/ค่ะ`
  }

  // สร้างข้อความสำหรับบิล
  private formatBillMessage(bill: BillShare): string {
    return `🧾 ใบเสร็จ/บิล

👤 ลูกค้า: ${bill.customerName}
💰 ยอดรวม: ${bill.totalAmount.toLocaleString()} บาท

🔗 ดูรายละเอียดบิล: ${bill.billUrl}

${bill.customMessage || "กรุณาตรวจสอบรายละเอียดและดำเนินการชำระเงินครับ/ค่ะ"}`
  }

  // สร้าง URL สำหรับเปิด Messenger
  public createMessengerUrl(message: string): string {
    const encodedMessage = encodeURIComponent(message)
    return `https://m.me/${this.config.pageId}?text=${encodedMessage}`
  }

  // ส่งข้อความโดยตรงผ่าน Facebook API (สำหรับอนาคต)
  private async sendDirectMessage(recipientId: string, message: string, imageUrl?: string): Promise<string> {
    if (!this.config.accessToken) {
      throw new Error("Access token required for direct messaging")
    }

    const payload: any = {
      recipient: { id: recipientId },
      message: { text: message },
    }

    if (imageUrl) {
      payload.message = {
        attachment: {
          type: "image",
          payload: { url: imageUrl },
        },
      }
      // ส่งข้อความแยกต่างหาก
      setTimeout(() => {
        this.sendDirectMessage(recipientId, message)
      }, 1000)
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v${this.config.apiVersion}/me/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`)
      }

      return "Message sent successfully"
    } catch (error) {
      console.error("Error sending message:", error)
      // Fallback to URL method
      return this.createMessengerUrl(message)
    }
  }

  // ตรวจสอบ webhook signature (สำหรับอนาคต)
  verifyWebhookSignature(signature: string, body: string): boolean {
    if (!this.config.webhookVerifyToken) return false

    const crypto = require("crypto")
    const expectedSignature = crypto.createHmac("sha256", this.config.webhookVerifyToken).update(body).digest("hex")

    return signature === `sha256=${expectedSignature}`
  }
}

// สร้าง instance สำหรับใช้งาน
export const messengerService = new MessengerIntegrationService({
  pageId: process.env.FACEBOOK_PAGE_ID || "your-facebook-page-id",
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  webhookVerifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
  apiVersion: "18.0",
})
