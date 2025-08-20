import { NextResponse } from "next/server"
import { emailService } from "@/lib/email"

export async function GET() {
  try {
    const ok = await emailService.testConnection()
    // If SMTP configured, send a quick test mail to ADMIN_EMAIL
    const hasSMTP = !!process.env.SMTP_HOST
    if (ok && hasSMTP && process.env.ADMIN_EMAIL) {
      await emailService.sendBulkEmail([
        process.env.ADMIN_EMAIL,
      ], "[Test] SMTP Connected", `<p>SMTP พร้อมใช้งานบน ${process.env.NEXT_PUBLIC_SITE_URL || "local"}</p>`)
    }
    return NextResponse.json({ success: ok, sentTest: !!(ok && hasSMTP && process.env.ADMIN_EMAIL) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "smtp_error" }, { status: 500 })
  }
}
