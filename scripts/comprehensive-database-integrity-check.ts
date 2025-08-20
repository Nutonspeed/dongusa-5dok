import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface DatabaseCheckResult {
  table: string
  status: "healthy" | "warning" | "critical"
  recordCount: number
  issues: string[]
  recommendations: string[]
}

async function checkDatabaseIntegrity(): Promise<DatabaseCheckResult[]> {
  console.log("🔍 Starting comprehensive database integrity check...")

  const results: DatabaseCheckResult[] = []

  // Core business tables to check
  const criticalTables = [
    "profiles",
    "products",
    "categories",
    "orders",
    "order_items",
    "cart_items",
    "fabrics",
    "fabric_collections",
    "notifications",
  ]

  const supportTables = [
    "customer_reviews",
    "wishlists",
    "loyalty_points",
    "system_settings",
    "unified_conversations",
    "unified_messages",
    "facebook_pages",
  ]

  const analyticsAndAuditTables = [
    "ai_chat_performance",
    "bug_reports",
    "user_feedback",
    "admin_role_change_attempts",
    "notification_attempts",
  ]

  // Check each table
  for (const table of [...criticalTables, ...supportTables, ...analyticsAndAuditTables]) {
    console.log(`📊 Checking table: ${table}`)

    try {
      const { data, error, count } = await supabase.from(table).select("*", { count: "exact", head: true })

      if (error) {
        results.push({
          table,
          status: "critical",
          recordCount: 0,
          issues: [`Database error: ${error.message}`],
          recommendations: ["Check table permissions and structure"],
        })
        continue
      }

      const recordCount = count || 0
      const issues: string[] = []
      const recommendations: string[] = []

      // Business logic checks
      if (criticalTables.includes(table)) {
        if (table === "profiles" && recordCount === 0) {
          issues.push("No user profiles found")
          recommendations.push("Create admin user and test accounts")
        }

        if (table === "products" && recordCount === 0) {
          issues.push("No products in catalog")
          recommendations.push("Add sample products for testing")
        }

        if (table === "categories" && recordCount === 0) {
          issues.push("No product categories defined")
          recommendations.push("Create product categories structure")
        }

        if (table === "fabrics" && recordCount === 0) {
          issues.push("No fabric options available")
          recommendations.push("Add fabric collections and options")
        }

        if (table === "system_settings" && recordCount === 0) {
          issues.push("No system configuration found")
          recommendations.push("Initialize system settings")
        }
      }

      // Determine status
      let status: "healthy" | "warning" | "critical" = "healthy"
      if (issues.length > 0) {
        status = criticalTables.includes(table) ? "critical" : "warning"
      }

      results.push({
        table,
        status,
        recordCount,
        issues,
        recommendations,
      })
    } catch (err) {
      results.push({
        table,
        status: "critical",
        recordCount: 0,
        issues: [`Unexpected error: ${err}`],
        recommendations: ["Check database connection and permissions"],
      })
    }
  }

  return results
}

async function checkRelationalIntegrity(): Promise<void> {
  console.log("🔗 Checking relational integrity...")

  // Check for orphaned records
  const checks = [
    {
      name: "Orders without users",
      query: `
        SELECT COUNT(*) as count 
        FROM orders o 
        LEFT JOIN profiles p ON o.user_id = p.id 
        WHERE p.id IS NULL
      `,
    },
    {
      name: "Order items without orders",
      query: `
        SELECT COUNT(*) as count 
        FROM order_items oi 
        LEFT JOIN orders o ON oi.order_id = o.id 
        WHERE o.id IS NULL
      `,
    },
    {
      name: "Cart items without users",
      query: `
        SELECT COUNT(*) as count 
        FROM cart_items ci 
        LEFT JOIN profiles p ON ci.user_id = p.id 
        WHERE p.id IS NULL
      `,
    },
    {
      name: "Products without categories",
      query: `
        SELECT COUNT(*) as count 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE c.id IS NULL AND p.category_id IS NOT NULL
      `,
    },
  ]

  for (const check of checks) {
    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        sql: check.query,
      })

      if (error) {
        console.log(`❌ ${check.name}: Error - ${error.message}`)
      } else {
        const count = data?.[0]?.count || 0
        if (count > 0) {
          console.log(`⚠️  ${check.name}: Found ${count} orphaned records`)
        } else {
          console.log(`✅ ${check.name}: No issues found`)
        }
      }
    } catch (err) {
      console.log(`❌ ${check.name}: ${err}`)
    }
  }
}

async function generateReport(results: DatabaseCheckResult[]): Promise<void> {
  console.log("\n📋 DATABASE INTEGRITY REPORT")
  console.log("=".repeat(50))

  const healthy = results.filter((r) => r.status === "healthy")
  const warnings = results.filter((r) => r.status === "warning")
  const critical = results.filter((r) => r.status === "critical")

  console.log(`✅ Healthy tables: ${healthy.length}`)
  console.log(`⚠️  Warning tables: ${warnings.length}`)
  console.log(`❌ Critical issues: ${critical.length}`)

  if (critical.length > 0) {
    console.log("\n🚨 CRITICAL ISSUES:")
    critical.forEach((result) => {
      console.log(`\n📊 ${result.table} (${result.recordCount} records)`)
      result.issues.forEach((issue) => console.log(`   ❌ ${issue}`))
      result.recommendations.forEach((rec) => console.log(`   💡 ${rec}`))
    })
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:")
    warnings.forEach((result) => {
      console.log(`\n📊 ${result.table} (${result.recordCount} records)`)
      result.issues.forEach((issue) => console.log(`   ⚠️  ${issue}`))
      result.recommendations.forEach((rec) => console.log(`   💡 ${rec}`))
    })
  }

  console.log("\n📈 RECORD COUNTS:")
  results
    .sort((a, b) => b.recordCount - a.recordCount)
    .forEach((result) => {
      const statusIcon = result.status === "healthy" ? "✅" : result.status === "warning" ? "⚠️" : "❌"
      console.log(`   ${statusIcon} ${result.table}: ${result.recordCount} records`)
    })

  // Overall system health
  const totalIssues = critical.length + warnings.length
  if (totalIssues === 0) {
    console.log("\n🎉 DATABASE STATUS: HEALTHY - Ready for production!")
  } else if (critical.length === 0) {
    console.log("\n⚠️  DATABASE STATUS: MINOR ISSUES - Can proceed with caution")
  } else {
    console.log("\n🚨 DATABASE STATUS: CRITICAL ISSUES - Requires attention before production")
  }
}

async function main() {
  try {
    console.log("🚀 Starting comprehensive database integrity check...")

    const results = await checkDatabaseIntegrity()
    await checkRelationalIntegrity()
    await generateReport(results)

    console.log("\n✅ Database integrity check completed!")
  } catch (error) {
    console.error("❌ Database check failed:", error)
    process.exit(1)
  }
}

main()
