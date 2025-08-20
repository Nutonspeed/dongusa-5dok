import { NextResponse } from "next/server"
import { loadEnv } from "@/lib/config/env"
import { notifications } from "@/lib/notifications"

export async function GET() {
  const env = loadEnv()
  const results: any = {
    email: { enabled: env.NOTIFICATIONS_EMAIL_ENABLED && !!env.SMTP_HOST, to: process.env.ADMIN_EMAIL || null },
    sms: { enabled: env.NOTIFICATIONS_SMS_ENABLED, to: env.SMS_TEST_PHONE || null, provider: env.SMS_PROVIDER || "mock" },
  }
  try {
    if (results.email.enabled && results.email.to) {
      results.email.result = await notifications.sendEmail(
        results.email.to,
        "[Test] ระบบแจ้งเตือนอีเมลทำงาน",
        `<p>การทดสอบการส่งอีเมลสำเร็จ</p>`,
      )
    } else {
      results.email.result = { skipped: true }
    }

    if (results.sms.enabled && results.sms.to) {
      results.sms.result = await notifications.sendSms(results.sms.to, "[Test] ระบบแจ้งเตือน SMS ทำงาน")
    } else {
      results.sms.result = { skipped: true }
    }

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "test_failed", results })
  }
}
