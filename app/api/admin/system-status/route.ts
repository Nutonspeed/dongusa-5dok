import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check database connection
    let databaseStatus = "disconnected"
    try {
      const { error } = await supabase.from("profiles").select("count").limit(1)
      databaseStatus = error ? "error" : "connected"
    } catch {
      databaseStatus = "error"
    }

    // Check email configuration
    const emailStatus = process.env.SMTP_HOST || process.env.SENDGRID_API_KEY ? "connected" : "mock"

    // Check payment configuration
    const paymentStatus = process.env.STRIPE_SECRET_KEY ? "connected" : "mock"

    // Check shipping configuration
    const shippingStatus =
      process.env.THAILAND_POST_API_KEY || process.env.KERRY_API_KEY || process.env.FLASH_API_KEY ? "connected" : "mock"

    // Check storage configuration
    const storageStatus = process.env.BLOB_READ_WRITE_TOKEN ? "connected" : "disconnected"

    return NextResponse.json({
      database: databaseStatus,
      email: emailStatus,
      payment: paymentStatus,
      shipping: shippingStatus,
      storage: storageStatus,
    })
  } catch (error) {
    console.error("System status check failed:", error)
    return NextResponse.json({ error: "Failed to check system status" }, { status: 500 })
  }
}
