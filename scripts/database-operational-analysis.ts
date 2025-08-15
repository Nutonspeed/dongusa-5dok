#!/usr/bin/env tsx
// Database Operational Analysis Script
// วิเคราะห์โครงสร้างการดำเนินงานและการสลับใช้ฐานข้อมูลจริง

import { createClient } from "@supabase/supabase-js"
import { neon } from "@neondatabase/serverless"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const NEON_DATABASE_URL = process.env.sofa69_DATABASE_URL || process.env.DATABASE_URL

interface DatabaseAnalysis {
  connection: "supabase" | "neon" | "both"
  tables: string[]
  performance: {
    avgQueryTime: number
    connectionCount: number
    indexEfficiency: number
  }
  integrity: {
    orphanedRecords: number
    missingIndexes: string[]
    rlsPolicies: number
  }
  recommendations: string[]
}

async function analyzeSupabase(): Promise<Partial<DatabaseAnalysis>> {
  console.log("🔍 Analyzing Supabase database...")

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // Test connection and get table list
    const { data: tables, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (error) throw error

    const tableNames = tables?.map((t) => t.table_name) || []

    // Check RLS policies
    const { data: policies } = await supabase.from("pg_policies").select("*").eq("schemaname", "public")

    // Performance check - sample query timing
    const startTime = Date.now()
    await supabase.from("products").select("count").limit(1)
    const queryTime = Date.now() - startTime

    console.log(`✅ Supabase: ${tableNames.length} tables, ${policies?.length || 0} RLS policies`)

    return {
      connection: "supabase",
      tables: tableNames,
      performance: {
        avgQueryTime: queryTime,
        connectionCount: 1,
        indexEfficiency: 85, // Estimated
      },
      integrity: {
        orphanedRecords: 0,
        missingIndexes: [],
        rlsPolicies: policies?.length || 0,
      },
    }
  } catch (error) {
    console.error("❌ Supabase analysis failed:", error)
    return { connection: "supabase", tables: [], recommendations: ["Fix Supabase connection"] }
  }
}

async function analyzeNeon(): Promise<Partial<DatabaseAnalysis>> {
  console.log("🔍 Analyzing Neon database...")

  if (!NEON_DATABASE_URL) {
    console.log("⚠️ Neon DATABASE_URL not found")
    return {
      connection: "neon",
      tables: [],
      recommendations: ["Add DATABASE_URL environment variable for Neon"],
    }
  }

  try {
    const sql = neon(NEON_DATABASE_URL)

    // Test connection and get table list
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const tableNames = tables.map((t) => t.table_name)

    // Performance check
    const startTime = Date.now()
    await sql`SELECT 1`
    const queryTime = Date.now() - startTime

    console.log(`✅ Neon: ${tableNames.length} tables`)

    return {
      connection: "neon",
      tables: tableNames,
      performance: {
        avgQueryTime: queryTime,
        connectionCount: 1,
        indexEfficiency: 80, // Estimated
      },
    }
  } catch (error) {
    console.error("❌ Neon analysis failed:", error)
    return {
      connection: "neon",
      tables: [],
      recommendations: ["Fix Neon database connection"],
    }
  }
}

async function generateRecommendations(
  supabaseAnalysis: Partial<DatabaseAnalysis>,
  neonAnalysis: Partial<DatabaseAnalysis>,
): Promise<string[]> {
  const recommendations: string[] = []

  // Connection recommendations
  if (supabaseAnalysis.tables?.length && neonAnalysis.tables?.length) {
    recommendations.push("✅ Both databases available - implement dual-database strategy")
    recommendations.push("🔄 Set up data synchronization between Supabase and Neon")
    recommendations.push("⚖️ Implement load balancing for read/write operations")
  } else if (supabaseAnalysis.tables?.length) {
    recommendations.push("📊 Primary database: Supabase - ensure backup strategy")
    recommendations.push("🔧 Consider setting up Neon as secondary database")
  } else if (neonAnalysis.tables?.length) {
    recommendations.push("📊 Primary database: Neon - ensure RLS policies")
    recommendations.push("🔧 Consider setting up Supabase for real-time features")
  }

  // Performance recommendations
  const avgQueryTime = Math.max(
    supabaseAnalysis.performance?.avgQueryTime || 0,
    neonAnalysis.performance?.avgQueryTime || 0,
  )

  if (avgQueryTime > 100) {
    recommendations.push("⚡ Optimize slow queries - consider adding indexes")
    recommendations.push("🚀 Implement query caching strategy")
  }

  // Security recommendations
  if ((supabaseAnalysis.integrity?.rlsPolicies || 0) < 5) {
    recommendations.push("🔒 Implement comprehensive RLS policies")
    recommendations.push("👥 Set up proper user role management")
  }

  // Operational recommendations
  recommendations.push("📋 Run database integrity checks regularly")
  recommendations.push("💾 Implement automated backup strategy")
  recommendations.push("📊 Set up monitoring and alerting")
  recommendations.push("🧪 Create comprehensive test suite for database operations")

  return recommendations
}

async function createMigrationPlan(): Promise<void> {
  console.log("\n📋 Creating Database Migration Plan...")

  const migrationPlan = {
    phase1: {
      title: "Foundation Validation",
      duration: "1 day",
      tasks: [
        "Run database integrity checks",
        "Validate all table schemas",
        "Test all RLS policies",
        "Verify data consistency",
      ],
    },
    phase2: {
      title: "Performance Optimization",
      duration: "2 days",
      tasks: [
        "Add missing indexes",
        "Optimize slow queries",
        "Implement materialized views",
        "Set up query monitoring",
      ],
    },
    phase3: {
      title: "Dual Database Setup",
      duration: "3 days",
      tasks: [
        "Configure connection pooling",
        "Implement data synchronization",
        "Set up failover mechanisms",
        "Create rollback procedures",
      ],
    },
    phase4: {
      title: "Production Deployment",
      duration: "2 days",
      tasks: [
        "Deploy with zero downtime",
        "Monitor performance metrics",
        "Validate all operations",
        "Document procedures",
      ],
    },
  }

  console.log("\n🚀 Migration Plan:")
  Object.entries(migrationPlan).forEach(([phase, details]) => {
    console.log(`\n${phase.toUpperCase()}: ${details.title} (${details.duration})`)
    details.tasks.forEach((task) => console.log(`  • ${task}`))
  })
}

async function main() {
  console.log("🚀 Database Operational Analysis")
  console.log("=".repeat(50))

  // Analyze both databases
  const [supabaseAnalysis, neonAnalysis] = await Promise.all([analyzeSupabase(), analyzeNeon()])

  // Generate recommendations
  const recommendations = await generateRecommendations(supabaseAnalysis, neonAnalysis)

  // Create migration plan
  await createMigrationPlan()

  // Summary report
  console.log("\n📊 Analysis Summary:")
  console.log("=".repeat(30))
  console.log(`Supabase Tables: ${supabaseAnalysis.tables?.length || 0}`)
  console.log(`Neon Tables: ${neonAnalysis.tables?.length || 0}`)
  console.log(`RLS Policies: ${supabaseAnalysis.integrity?.rlsPolicies || 0}`)

  console.log("\n💡 Recommendations:")
  recommendations.forEach((rec) => console.log(`  ${rec}`))

  console.log("\n🎯 Next Steps:")
  console.log("  1. Run: pnpm exec tsx scripts/database-integrity-check.ts")
  console.log("  2. Run: pnpm exec tsx scripts/optimize-database-performance.sql")
  console.log("  3. Set up monitoring: pnpm exec tsx scripts/monitoring-daemon.ts")
  console.log("  4. Create backup strategy")

  console.log("\n✅ Analysis Complete!")
}

// Run analysis
main().catch(console.error)
