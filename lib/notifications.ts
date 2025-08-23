import { loadEnv } from "@/lib/config/env"
import { emailService } from "@/lib/email"
import { createSmsClient } from "@/lib/sms"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase"

function flags() {
  const env = loadEnv()
  return {
    emailOn: !!env.NOTIFICATIONS_EMAIL_ENABLED && !!env.SMTP_HOST,
    smsOn: !!env.NOTIFICATIONS_SMS_ENABLED,
    smsProvider: env.SMS_PROVIDER,
  }
}

async function logOutboxAndAttempt(params: {
  channel: "email" | "sms"
  to: string
  eventType: string
  template?: string
  payload?: Record<string, any>
  status: "pending" | "sent" | "failed" | "skipped"
  provider?: string
  response?: any
  error?: string
}) {
  try {
    if (!isSupabaseConfigured) return
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: notif, error: insErr } = await supabase
      .from("notifications")
      .insert({
        event_type: params.eventType,
        channel: params.channel,
        to_address: params.to,
        template: params.template || null,
        payload: params.payload || null,
        status: params.status,
        provider: params.provider || null,
        response: params.response || null,
        last_error: params.error || null,
      })
      .select("id, attempts")
      .single()

    if (insErr || !notif?.id) return

    await supabase.from("notification_attempts").insert({
      notification_id: notif.id,
      attempt_no: (notif.attempts || 0) + 1,
      success: params.status === "sent",
      provider: params.provider || null,
      error: params.error || null,
      response: params.response || null,
    })

    await supabase
      .from("notifications")
      .update({ status: params.status, attempts: (notif.attempts || 0) + 1, provider: params.provider || null, response: params.response || null, last_error: params.error || null })
      .eq("id", notif.id)
  } catch {
    // swallow errors to avoid impacting main flow
  }
}

export const notifications = {
  async sendEmail(to: string, subject: string, html: string) {
    const { emailOn } = flags()
    if (!emailOn) {
      await logOutboxAndAttempt({ channel: "email", to, eventType: "generic", template: subject, payload: { html }, status: "skipped" })
      return { success: false, skipped: true, channel: "email" as const }
    }
    try {
      await emailService.sendBulkEmail([to], subject, html)
      await logOutboxAndAttempt({ channel: "email", to, eventType: "generic", template: subject, payload: { html }, status: "sent" })
      return { success: true, skipped: false, channel: "email" as const }
    } catch (e: any) {
      await logOutboxAndAttempt({ channel: "email", to, eventType: "generic", template: subject, payload: { html }, status: "failed", error: e?.message || String(e) })
      return { success: false, skipped: false, channel: "email" as const }
    }
  },

  async sendSms(to: string, message: string) {
    const { smsOn, smsProvider } = flags()
    if (!smsOn) {
      await logOutboxAndAttempt({ channel: "sms", to, eventType: "generic", payload: { message }, status: "skipped" })
      return { success: false, skipped: true, channel: "sms" as const }
    }
    try {
      const client = createSmsClient(smsProvider as any)
      const res = await client.send(to, message)
      await logOutboxAndAttempt({ channel: "sms", to, eventType: "generic", payload: { message }, status: res.success ? "sent" : "failed", provider: res.provider, response: res.raw, error: res.success ? undefined : "sms_send_failed" })
      return { success: res.success, skipped: false, channel: "sms" as const, provider: res.provider, raw: res.raw }
    } catch (e: any) {
      await logOutboxAndAttempt({ channel: "sms", to, eventType: "generic", payload: { message }, status: "failed", error: e?.message || String(e) })
      return { success: false, skipped: false, channel: "sms" as const }
    }
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
