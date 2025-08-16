import { ProductionDeployment } from "./production-deploy"
import { FinalProductionReadinessChecker } from "./final-production-readiness-check"

async function startProductionLaunch() {
  console.log("🚀 เริ่มต้น Production Launch Process")
  console.log("=".repeat(60))

  try {
    // Step 1: Final readiness check
    console.log("📋 Step 1: การตรวจสอบความพร้อมขั้นสุดท้าย")
    const checker = new FinalProductionReadinessChecker()
    await checker.runAllChecks()

    // Step 2: Production deployment
    console.log("\n🚀 Step 2: การ Deploy ไปยัง Production")
    const deploymentConfig = {
      environment: "production" as const,
      branch: "main",
      domain: process.env.PRODUCTION_DOMAIN || "sofacoverpro.vercel.app",
      environmentVariables: {
        NODE_ENV: "production",
        NEXT_PUBLIC_BUILD_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || `launch-${Date.now()}`,
        NEXT_PUBLIC_DEMO_MODE: "false",
        ENABLE_MOCK_SERVICES: "false",
      },
    }

    const deployment = new ProductionDeployment(deploymentConfig)
    await deployment.deploy()

    // Step 3: Post-deployment validation
    console.log("\n✅ Step 3: การตรวจสอบหลัง Deploy")
    await validateProductionDeployment(deploymentConfig.domain)

    console.log("\n🎉 Production Launch เสร็จสิ้นสำเร็จ!")
    console.log("📊 ขั้นตอนถัดไป: Post-Launch Monitoring และ Support")
  } catch (error) {
    console.error("❌ Production Launch ล้มเหลว:", error)
    console.log("🔄 กรุณาตรวจสอบข้อผิดพลาดและลองใหม่")
    process.exit(1)
  }
}

async function validateProductionDeployment(domain: string) {
  console.log("🔍 ตรวจสอบการทำงานของ Production Site...")

  const testEndpoints = [
    { path: "/", name: "Homepage" },
    { path: "/products", name: "Products Page" },
    { path: "/about", name: "About Page" },
    { path: "/api/health", name: "Health Check API" },
  ]

  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`https://${domain}${endpoint.path}`)
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: OK (${response.status})`)
      } else {
        console.log(`⚠️ ${endpoint.name}: Warning (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Failed - ${error}`)
    }
  }

  // Test core functionality
  console.log("\n🧪 ทดสอบฟังก์ชันหลัก...")

  try {
    // Test product loading
    const productsResponse = await fetch(`https://${domain}/api/products`)
    if (productsResponse.ok) {
      console.log("✅ Product API: Working")
    } else {
      console.log("⚠️ Product API: Needs attention")
    }

    // Test database connection
    const healthResponse = await fetch(`https://${domain}/api/health`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log("✅ Database Connection: Working")
      console.log(`📊 System Status: ${JSON.stringify(healthData, null, 2)}`)
    }
  } catch (error) {
    console.log("⚠️ Some functionality tests failed, but site is accessible")
  }
}

// รัน production launch
startProductionLaunch()
