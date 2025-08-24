import { mockDatabaseService } from "@/lib/mock-database"
import { mockEmailService } from "@/lib/mock-email"
import { mockUploadService } from "@/lib/mock-upload"
import { featureFlags } from "@/utils/featureFlags"

async function initializeMockSystem() {
  console.log("🚀 Initializing Mock System...")

  if (!featureFlags.ENABLE_MOCK_SERVICES) {
    console.log("❌ Mock services not enabled")
    return
  }

  try {
    // Initialize mock database with sample data
    console.log("📊 Initializing mock database...")
    await mockDatabaseService.seedSampleData()

    // Initialize email templates
    console.log("📧 Initializing email templates...")
    await mockEmailService.initializeTemplates()

    // Initialize upload service
    console.log("📁 Initializing upload service...")
    await mockUploadService.initialize()

    // Get system status
    const analytics = await mockDatabaseService.getAnalytics()
    const emailStats = await mockEmailService.getEmailStatistics()
    const uploadStats = await mockUploadService.getUploadStatistics()

    console.log("✅ Mock System Initialized Successfully!")
    console.log("📊 Database:", {
      products: (await mockDatabaseService.getProducts()).length,
      customers: (await mockDatabaseService.getCustomers()).length,
      orders: (await mockDatabaseService.getOrders()).length,
      revenue: analytics.totalRevenue,
    })
    console.log("📧 Email:", emailStats)
    console.log("📁 Upload:", uploadStats)
  } catch (error) {
    console.error("❌ Failed to initialize mock system:", error)
    throw error
  }
}

// Run initialization
initializeMockSystem().catch(console.error)
