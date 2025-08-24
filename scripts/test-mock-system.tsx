import { mockDatabaseService } from "@/lib/mock-database"
import { mockEmailService } from "@/lib/mock-email"
import { mockUploadService } from "@/lib/mock-upload"

async function testMockSystem() {
  console.log("🧪 Testing Mock System...")

  try {
    // Test database operations
    console.log("📊 Testing database operations...")
    const products = await mockDatabaseService.getProducts()
    const customers = await mockDatabaseService.getCustomers()
    const orders = await mockDatabaseService.getOrders()
    const analytics = await mockDatabaseService.getAnalytics()

    console.log("✅ Database test passed:", {
      products: products.length,
      customers: customers.length,
      orders: orders.length,
      totalRevenue: analytics.totalRevenue,
    })

    // Test email service
    console.log("📧 Testing email service...")
    const emailResult = await mockEmailService.sendEmail({
      to: "test@example.com",
      subject: "Test Email",
      html: "<h1>Test Email Content</h1>",
    })

    const templates = await mockEmailService.getTemplates()
    console.log("✅ Email test passed:", {
      emailSent: emailResult.success,
      templates: templates.length,
    })

    // Test upload service
    console.log("📁 Testing upload service...")
    const uploadStats = await mockUploadService.getUploadStatistics()
    const uploadedFiles = await mockUploadService.getUploadedFiles()

    console.log("✅ Upload test passed:", {
      totalFiles: uploadStats.totalFiles,
      successfulUploads: uploadStats.successfulUploads,
      files: uploadedFiles.length,
    })

    console.log("🎉 All mock system tests passed!")

    // Test API endpoints
    console.log("🌐 Testing API endpoints...")

    const healthResponse = await fetch("http://localhost:3000/api/health")
    const healthData = await healthResponse.json()
    console.log("✅ Health API:", healthData.mode)

    const statusResponse = await fetch("http://localhost:3000/api/admin/system-status")
    const statusData = await statusResponse.json()
    console.log("✅ System Status API:", statusData.mode)
  } catch (error) {
    console.error("❌ Mock system test failed:", error)
    throw error
  }
}

// Run tests
testMockSystem().catch(console.error)
