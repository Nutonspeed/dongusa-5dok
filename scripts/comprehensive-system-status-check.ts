import { createClient } from "@supabase/supabase-js"
import { EMAIL_CONFIG, UPLOAD_CONFIG, PAYMENT_CONFIG, USE_SUPABASE } from "@/lib/runtime"

interface SystemStatus {
  service: string
  status: "LIVE" | "MOCK" | "ERROR" | "MISSING"
  details: string
  readyForProduction: boolean
  requiredActions?: string[]
}

export async function checkSystemStatus(): Promise<SystemStatus[]> {
  const results: SystemStatus[] = []

  try {
    if (USE_SUPABASE) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      results.push({
        service: "Database (Supabase)",
        status: error ? "ERROR" : "LIVE",
        details: error ? `Connection failed: ${error.message}` : "Connected successfully with live data",
        readyForProduction: !error,
        requiredActions: error ? ["Fix Supabase connection", "Verify environment variables"] : undefined,
      })
    } else {
      results.push({
        service: "Database",
        status: "MOCK",
        details: "Using mock database - not suitable for production",
        readyForProduction: false,
        requiredActions: ["Configure Supabase connection", "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"],
      })
    }
  } catch (error) {
    results.push({
      service: "Database",
      status: "ERROR",
      details: `Database check failed: ${error}`,
      readyForProduction: false,
      requiredActions: ["Fix database configuration"],
    })
  }

  const emailActions: string[] = []
  if (!process.env.SMTP_HOST) emailActions.push("Set SMTP_HOST")
  if (!process.env.SMTP_USER) emailActions.push("Set SMTP_USER")
  if (!process.env.SMTP_PASS) emailActions.push("Set SMTP_PASS")

  results.push({
    service: "Email Service",
    status: EMAIL_CONFIG.useMock ? "MOCK" : "LIVE",
    details: EMAIL_CONFIG.useMock
      ? "Using mock email service - emails are simulated"
      : `SMTP configured: ${process.env.SMTP_HOST}`,
    readyForProduction: !EMAIL_CONFIG.useMock,
    requiredActions: emailActions.length > 0 ? emailActions : undefined,
  })

  results.push({
    service: "File Upload",
    status: UPLOAD_CONFIG.useMock ? "MOCK" : "LIVE",
    details: UPLOAD_CONFIG.useMock
      ? "Using mock upload service - files stored locally"
      : "Vercel Blob storage configured",
    readyForProduction: !UPLOAD_CONFIG.useMock,
    requiredActions: UPLOAD_CONFIG.useMock ? ["Configure Vercel Blob storage"] : undefined,
  })

  const paymentActions: string[] = []
  if (!process.env.STRIPE_SECRET_KEY) paymentActions.push("Set STRIPE_SECRET_KEY")
  if (!process.env.PROMPTPAY_ID) paymentActions.push("Set PROMPTPAY_ID")

  results.push({
    service: "Payment System",
    status: PAYMENT_CONFIG.useMock ? "MOCK" : "LIVE",
    details: PAYMENT_CONFIG.useMock
      ? "Using mock payment system - transactions are simulated"
      : "Live payment processing configured",
    readyForProduction: !PAYMENT_CONFIG.useMock,
    requiredActions: paymentActions.length > 0 ? paymentActions : undefined,
  })

  const shippingActions: string[] = []
  if (!process.env.THAILAND_POST_API_KEY) shippingActions.push("Set THAILAND_POST_API_KEY")
  if (!process.env.KERRY_API_KEY) shippingActions.push("Set KERRY_API_KEY")
  if (!process.env.FLASH_API_KEY) shippingActions.push("Set FLASH_API_KEY")

  const hasAnyShippingProvider = !!(
    process.env.THAILAND_POST_API_KEY ||
    process.env.KERRY_API_KEY ||
    process.env.FLASH_API_KEY
  )

  results.push({
    service: "Shipping Providers",
    status: hasAnyShippingProvider ? "LIVE" : "MOCK",
    details: hasAnyShippingProvider
      ? "At least one shipping provider configured"
      : "No shipping providers configured - using mock rates",
    readyForProduction: hasAnyShippingProvider,
    requiredActions: shippingActions.length > 0 ? shippingActions : undefined,
  })

  try {
    const response = await fetch("/api/health/redis", { method: "GET" })
    const redisHealthy = response.ok

    results.push({
      service: "Redis Cache",
      status: redisHealthy ? "LIVE" : "ERROR",
      details: redisHealthy ? "Upstash Redis connected" : "Redis connection failed",
      readyForProduction: redisHealthy,
      requiredActions: redisHealthy ? undefined : ["Check Redis configuration"],
    })
  } catch (error) {
    results.push({
      service: "Redis Cache",
      status: "ERROR",
      details: `Redis check failed: ${error}`,
      readyForProduction: false,
      requiredActions: ["Fix Redis connection"],
    })
  }

  return results
}

export async function generateSystemReport() {
  console.log("🔍 กำลังตรวจสอบสถานะระบบทั้งหมด...\n")

  const statuses = await checkSystemStatus()

  const liveServices = statuses.filter((s) => s.status === "LIVE")
  const mockServices = statuses.filter((s) => s.status === "MOCK")
  const errorServices = statuses.filter((s) => s.status === "ERROR")

  console.log("📊 สรุปสถานะระบบ:")
  console.log(`✅ ระบบที่พร้อมใช้งาน: ${liveServices.length}`)
  console.log(`🟡 ระบบที่ใช้ Mock: ${mockServices.length}`)
  console.log(`❌ ระบบที่มีปัญหา: ${errorServices.length}`)
  console.log("")

  if (liveServices.length > 0) {
    console.log("✅ ระบบที่พร้อมใช้งานจริง:")
    liveServices.forEach((service) => {
      console.log(`   • ${service.service}: ${service.details}`)
    })
    console.log("")
  }

  if (mockServices.length > 0) {
    console.log("🟡 ระบบที่ยังใช้ Mock Services:")
    mockServices.forEach((service) => {
      console.log(`   • ${service.service}: ${service.details}`)
      if (service.requiredActions) {
        console.log(`     แผนแก้ไข: ${service.requiredActions.join(", ")}`)
      }
    })
    console.log("")
  }

  if (errorServices.length > 0) {
    console.log("❌ ระบบที่มีปัญหา:")
    errorServices.forEach((service) => {
      console.log(`   • ${service.service}: ${service.details}`)
      if (service.requiredActions) {
        console.log(`     ต้องแก้ไข: ${service.requiredActions.join(", ")}`)
      }
    })
    console.log("")
  }

  const productionReady = statuses.filter((s) => s.readyForProduction).length
  const totalServices = statuses.length
  const readinessPercentage = Math.round((productionReady / totalServices) * 100)

  console.log(`🎯 ความพร้อมสำหรับ Production: ${readinessPercentage}% (${productionReady}/${totalServices})`)

  if (readinessPercentage === 100) {
    console.log("🚀 ระบบพร้อมสำหรับ Production แล้ว!")
  } else {
    console.log("⚠️  ยังมีระบบที่ต้องแก้ไขก่อน Production")
  }

  return {
    statuses,
    summary: {
      live: liveServices.length,
      mock: mockServices.length,
      error: errorServices.length,
      readinessPercentage,
      productionReady: readinessPercentage === 100,
    },
  }
}

// Run if called directly
if (require.main === module) {
  generateSystemReport().catch(console.error)
}
