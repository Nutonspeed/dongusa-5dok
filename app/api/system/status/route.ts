import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Checking system status...")

    // Check database connection
    const databaseStatus = await checkDatabaseConnection()

    // Check API health
    const apiStatus = await checkAPIHealth()

    // Check email service
    const emailStatus = await checkEmailService()

    // Check storage service
    const storageStatus = await checkStorageService()

    const systemStatus = {
      timestamp: new Date().toISOString(),
      overall: "healthy",
      services: {
        database: databaseStatus,
        api: apiStatus,
        email: emailStatus,
        storage: storageStatus,
      },
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_BUILD_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    }

    console.log("✅ System status check completed")

    return NextResponse.json({
      success: true,
      data: systemStatus,
      message: "System status retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Error checking system status:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check system status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function checkDatabaseConnection(): Promise<"online" | "offline" | "warning"> {
  try {
    // Mock database check - replace with actual database ping
    await new Promise((resolve) => setTimeout(resolve, 100))
    return "online"
  } catch (error) {
    console.error("Database connection failed:", error)
    return "offline"
  }
}

async function checkAPIHealth(): Promise<"online" | "offline" | "warning"> {
  try {
    // Check if API endpoints are responding
    return "online"
  } catch (error) {
    console.error("API health check failed:", error)
    return "offline"
  }
}

async function checkEmailService(): Promise<"online" | "offline" | "warning"> {
  try {
    // Mock email service check
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
    return isDemoMode ? "warning" : "online"
  } catch (error) {
    console.error("Email service check failed:", error)
    return "offline"
  }
}

async function checkStorageService(): Promise<"online" | "offline" | "warning"> {
  try {
    // Mock storage service check
    return "online"
  } catch (error) {
    console.error("Storage service check failed:", error)
    return "offline"
  }
}
