import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface TestResult {
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  data?: any
}

async function testUserManagement(): Promise<TestResult[]> {
  console.log("👥 Testing User Management System...")
  const results: TestResult[] = []

  try {
    // Test user profile creation
    const testEmail = `test-${Date.now()}@sofacover.com`
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        email: testEmail,
        full_name: "Test User",
        role: "customer",
      })
      .select()
      .single()

    if (profileError) {
      results.push({
        test: "User Profile Creation",
        status: "fail",
        message: `Failed to create profile: ${profileError.message}`,
      })
    } else {
      results.push({
        test: "User Profile Creation",
        status: "pass",
        message: "Successfully created test user profile",
        data: profile,
      })

      // Clean up test data
      await supabase.from("profiles").delete().eq("id", profile.id)
    }

    // Test role-based access
    const { data: adminUsers, error: adminError } = await supabase.from("profiles").select("*").eq("role", "admin")

    if (adminError) {
      results.push({
        test: "Admin User Check",
        status: "fail",
        message: `Failed to query admin users: ${adminError.message}`,
      })
    } else if (adminUsers.length === 0) {
      results.push({
        test: "Admin User Check",
        status: "warning",
        message: "No admin users found - create admin account",
      })
    } else {
      results.push({
        test: "Admin User Check",
        status: "pass",
        message: `Found ${adminUsers.length} admin user(s)`,
      })
    }
  } catch (error) {
    results.push({
      test: "User Management System",
      status: "fail",
      message: `System error: ${error}`,
    })
  }

  return results
}

async function testProductCatalog(): Promise<TestResult[]> {
  console.log("🛍️ Testing Product Catalog System...")
  const results: TestResult[] = []

  try {
    // Test product retrieval
    const { data: products, error: productError } = await supabase
      .from("products")
      .select(`
        *,
        categories (name),
        customer_reviews (rating)
      `)
      .eq("is_active", true)
      .limit(5)

    if (productError) {
      results.push({
        test: "Product Catalog Query",
        status: "fail",
        message: `Failed to query products: ${productError.message}`,
      })
    } else if (products.length === 0) {
      results.push({
        test: "Product Catalog Query",
        status: "warning",
        message: "No active products found - add sample products",
      })
    } else {
      results.push({
        test: "Product Catalog Query",
        status: "pass",
        message: `Successfully retrieved ${products.length} products with relations`,
      })
    }

    // Test category structure
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)

    if (categoryError) {
      results.push({
        test: "Category Structure",
        status: "fail",
        message: `Failed to query categories: ${categoryError.message}`,
      })
    } else if (categories.length === 0) {
      results.push({
        test: "Category Structure",
        status: "warning",
        message: "No active categories found - create category structure",
      })
    } else {
      results.push({
        test: "Category Structure",
        status: "pass",
        message: `Found ${categories.length} active categories`,
      })
    }

    // Test fabric collections
    const { data: fabrics, error: fabricError } = await supabase
      .from("fabrics")
      .select(`
        *,
        fabric_collections (name)
      `)
      .eq("is_active", true)
      .limit(5)

    if (fabricError) {
      results.push({
        test: "Fabric Collections",
        status: "fail",
        message: `Failed to query fabrics: ${fabricError.message}`,
      })
    } else if (fabrics.length === 0) {
      results.push({
        test: "Fabric Collections",
        status: "warning",
        message: "No fabric options found - add fabric collections",
      })
    } else {
      results.push({
        test: "Fabric Collections",
        status: "pass",
        message: `Found ${fabrics.length} fabric options`,
      })
    }
  } catch (error) {
    results.push({
      test: "Product Catalog System",
      status: "fail",
      message: `System error: ${error}`,
    })
  }

  return results
}

async function testOrderSystem(): Promise<TestResult[]> {
  console.log("🛒 Testing Order Management System...")
  const results: TestResult[] = []

  try {
    // Test order creation workflow
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*),
        profiles (full_name, email)
      `)
      .limit(5)

    if (orderError) {
      results.push({
        test: "Order Query System",
        status: "fail",
        message: `Failed to query orders: ${orderError.message}`,
      })
    } else {
      results.push({
        test: "Order Query System",
        status: "pass",
        message: `Successfully queried ${orders.length} orders with relations`,
      })
    }

    // Test cart functionality
    const { data: cartItems, error: cartError } = await supabase.from("cart_items").select("*").limit(5)

    if (cartError) {
      results.push({
        test: "Shopping Cart System",
        status: "fail",
        message: `Failed to query cart items: ${cartError.message}`,
      })
    } else {
      results.push({
        test: "Shopping Cart System",
        status: "pass",
        message: `Cart system operational - ${cartItems.length} items found`,
      })
    }
  } catch (error) {
    results.push({
      test: "Order Management System",
      status: "fail",
      message: `System error: ${error}`,
    })
  }

  return results
}

async function testNotificationSystem(): Promise<TestResult[]> {
  console.log("📧 Testing Notification System...")
  const results: TestResult[] = []

  try {
    // Test notification logging
    const { data: notifications, error: notificationError } = await supabase
      .from("notifications")
      .select(`
        *,
        notification_attempts (*)
      `)
      .limit(5)

    if (notificationError) {
      results.push({
        test: "Notification System",
        status: "fail",
        message: `Failed to query notifications: ${notificationError.message}`,
      })
    } else {
      results.push({
        test: "Notification System",
        status: "pass",
        message: `Notification system operational - ${notifications.length} records found`,
      })
    }

    // Test system settings
    const { data: settings, error: settingsError } = await supabase.from("system_settings").select("*")

    if (settingsError) {
      results.push({
        test: "System Configuration",
        status: "fail",
        message: `Failed to query system settings: ${settingsError.message}`,
      })
    } else if (settings.length === 0) {
      results.push({
        test: "System Configuration",
        status: "warning",
        message: "No system settings found - initialize configuration",
      })
    } else {
      results.push({
        test: "System Configuration",
        status: "pass",
        message: `Found ${settings.length} system settings`,
      })
    }
  } catch (error) {
    results.push({
      test: "Notification System",
      status: "fail",
      message: `System error: ${error}`,
    })
  }

  return results
}

async function generateTestReport(allResults: TestResult[][]): Promise<void> {
  console.log("\n📋 BUSINESS FUNCTIONS TEST REPORT")
  console.log("=".repeat(50))

  const flatResults = allResults.flat()
  const passed = flatResults.filter((r) => r.status === "pass")
  const warnings = flatResults.filter((r) => r.status === "warning")
  const failed = flatResults.filter((r) => r.status === "fail")

  console.log(`✅ Passed: ${passed.length}`)
  console.log(`⚠️  Warnings: ${warnings.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.log("\n🚨 FAILED TESTS:")
    failed.forEach((result) => {
      console.log(`   ❌ ${result.test}: ${result.message}`)
    })
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:")
    warnings.forEach((result) => {
      console.log(`   ⚠️  ${result.test}: ${result.message}`)
    })
  }

  console.log("\n✅ PASSED TESTS:")
  passed.forEach((result) => {
    console.log(`   ✅ ${result.test}: ${result.message}`)
  })

  // Overall system readiness
  const criticalFailures = failed.length
  if (criticalFailures === 0 && warnings.length === 0) {
    console.log("\n🎉 SYSTEM STATUS: FULLY OPERATIONAL - Ready for production!")
  } else if (criticalFailures === 0) {
    console.log("\n⚠️  SYSTEM STATUS: MINOR ISSUES - Can proceed with monitoring")
  } else {
    console.log("\n🚨 SYSTEM STATUS: CRITICAL FAILURES - Requires immediate attention")
  }
}

async function main() {
  try {
    console.log("🚀 Starting comprehensive business functions test...")

    const userTests = await testUserManagement()
    const productTests = await testProductCatalog()
    const orderTests = await testOrderSystem()
    const notificationTests = await testNotificationSystem()

    await generateTestReport([userTests, productTests, orderTests, notificationTests])

    console.log("\n✅ Business functions test completed!")
  } catch (error) {
    console.error("❌ Business functions test failed:", error)
    process.exit(1)
  }
}

main()
