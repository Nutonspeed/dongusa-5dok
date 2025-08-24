import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { featureFlags } from "@/utils/featureFlags"
import { mockDatabaseService } from "@/lib/mock-database"
import { mockEmailService } from "@/lib/mock-email"
import { mockUploadService } from "@/lib/mock-upload"

export async function GET() {
  try {
    if (featureFlags.ENABLE_MOCK_SERVICES) {
      return NextResponse.json({
        database: "mock",
        email: "mock",
        payment: "mock",
        shipping: "mock",
        storage: "mock",
        mockServices: {
          database: {
            status: "active",
            products: (await mockDatabaseService.getProducts()).length,
            customers: (await mockDatabaseService.getCustomers()).length,
            orders: (await mockDatabaseService.getOrders()).length,
          },
          email: {
            status: "active",
            stats: await mockEmailService.getEmailStatistics(),
          },
          upload: {
            status: "active",
            stats: await mockUploadService.getUploadStatistics(),
          },
        },
        mode: "development",
        timestamp: new Date().toISOString(),
      })
    }

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
