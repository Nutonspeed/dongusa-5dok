import { loadEnv } from "@/lib/config/env"
import { emailService } from "@/lib/email"
import { createSmsClient } from "@/lib/sms"

function flags() {
  const env = loadEnv()
  return {
    emailOn: !!env.NOTIFICATIONS_EMAIL_ENABLED && !!env.SMTP_HOST,
    smsOn: !!env.NOTIFICATIONS_SMS_ENABLED,
    smsProvider: env.SMS_PROVIDER,
  }
}

export const notifications = {
  async sendEmail(to: string, subject: string, html: string) {
    const { emailOn } = flags()
    if (!emailOn) return { success: false, skipped: true, channel: "email" as const }
    await emailService.sendBulkEmail([to], subject, html)
    return { success: true, skipped: false, channel: "email" as const }
  },

  async sendSms(to: string, message: string) {
    const { smsOn, smsProvider } = flags()
    if (!smsOn) return { success: false, skipped: true, channel: "sms" as const }
    const client = createSmsClient(smsProvider as any)
    const res = await client.send(to, message)
    return { success: res.success, skipped: false, channel: "sms" as const, provider: res.provider, raw: res.raw }
  },

  async notifyOrderStatus(opts: { email?: string; phone?: string; orderId: string | number; status: string; tracking?: string; note?: string }) {
    const results: any[] = []
    const details = [opts.tracking ? `เลขพัสดุ: ${opts.tracking}` : null, opts.note ? opts.note : null].filter(Boolean).join(" | ")
    const subject = `อัปเดตสถานะคำสั่งซื้อ #${opts.orderId}: ${opts.status}`
    const html = `<p>คำสั่งซื้อ #${opts.orderId}</p><p>สถานะล่าสุด: <b>${opts.status}</b></p>${details ? `<p>${details}</p>` : ''}`
    const smsBase = `ออเดอร์ #${opts.orderId} สถานะ: ${opts.status}`
    const sms = details ? `${smsBase} (${details})` : smsBase
    if (opts.email) results.push(await this.sendEmail(opts.email, subject, html))
    if (opts.phone) results.push(await this.sendSms(opts.phone, sms))
    return results
  },

  async notifyPaymentConfirmed(opts: { email?: string; phone?: string; orderId: string | number; amount?: number }) {
    const results: any[] = []
    const subject = `ยืนยันรับชำระเงินสำหรับออเดอร์ #${opts.orderId}`
    const html = `<p>ร้านได้รับชำระเงินสำหรับออเดอร์ #${opts.orderId}${opts.amount ? ` จำนวน ${opts.amount}` : ''}</p>`
    const sms = `รับชำระแล้วสำหรับออเดอร์ #${opts.orderId}${opts.amount ? ` ${opts.amount}` : ''}`
    if (opts.email) results.push(await this.sendEmail(opts.email, subject, html))
    if (opts.phone) results.push(await this.sendSms(opts.phone, sms))
    return results
  },
}
