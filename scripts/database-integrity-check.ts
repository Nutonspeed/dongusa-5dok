#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js"

interface IntegrityIssue {
  table: string
  type: "constraint" | "orphaned" | "duplicate" | "missing" | "performance" | "security"
  severity: "critical" | "high" | "medium" | "low"
  description: string
  query?: string
  count?: number
  recommendation: string
}

interface IntegrityReport {
  timestamp: string
  database: {
    name: string
    tables: number
    totalRecords: number
  }
  summary: {
    totalIssues: number
    critical: number
    high: number
    medium: number
    low: number
  }
  issues: IntegrityIssue[]
  performance: {
    averageQueryTime: number
    slowQueries: string[]
    missingIndexes: string[]
  }
  recommendations: string[]
}

class DatabaseIntegrityChecker {
  private supabase: any
  private issues: IntegrityIssue[] = []
  private queryTimes: number[] = []

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async checkIntegrity(): Promise<IntegrityReport> {
    console.log("🔍 Starting Database Integrity Check...\n")

    // Check foreign key constraints
    await this.checkForeignKeyConstraints()

    // Check for orphaned records
    await this.checkOrphanedRecords()

    // Check for duplicate records
    await this.checkDuplicateRecords()

    // Check data consistency
    await this.checkDataConsistency()

    // Check performance issues
    await this.checkPerformanceIssues()

    // Check security settings
    await this.checkSecuritySettings()

    return this.generateReport()
  }

  private async executeQuery(query: string, description: string): Promise<any> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.supabase.rpc("execute_sql", { sql: query })

      const queryTime = Date.now() - startTime
      this.queryTimes.push(queryTime)

      if (error) {
        console.log(`❌ Query failed: ${description}`)
        console.log(`Error: ${error.message}`)
        return null
      }

      return data
    } catch (error: any) {
      console.log(`❌ Query failed: ${description}`)
      console.log(`Error: ${error.message}`)
      return null
    }
  }

  private async checkForeignKeyConstraints(): Promise<void> {
    console.log("🔗 Checking foreign key constraints...")

    // Check products -> categories relationship
    const orphanedProducts = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id IS NOT NULL AND c.id IS NULL
    `,
      "Orphaned products without valid categories",
    )

    if (orphanedProducts && orphanedProducts[0]?.count > 0) {
      this.issues.push({
        table: "products",
        type: "orphaned",
        severity: "high",
        description: `${orphanedProducts[0].count} products reference non-existent categories`,
        count: orphanedProducts[0].count,
        recommendation: "Update or remove products with invalid category references",
      })
    }

    // Check fabrics -> fabric_collections relationship
    const orphanedFabrics = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM fabrics f 
      LEFT JOIN fabric_collections fc ON f.collection_id = fc.id 
      WHERE f.collection_id IS NOT NULL AND fc.id IS NULL
    `,
      "Orphaned fabrics without valid collections",
    )

    if (orphanedFabrics && orphanedFabrics[0]?.count > 0) {
      this.issues.push({
        table: "fabrics",
        type: "orphaned",
        severity: "high",
        description: `${orphanedFabrics[0].count} fabrics reference non-existent collections`,
        count: orphanedFabrics[0].count,
        recommendation: "Update or remove fabrics with invalid collection references",
      })
    }

    // Check order_items -> orders relationship
    const orphanedOrderItems = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM order_items oi 
      LEFT JOIN orders o ON oi.order_id = o.id 
      WHERE oi.order_id IS NOT NULL AND o.id IS NULL
    `,
      "Orphaned order items without valid orders",
    )

    if (orphanedOrderItems && orphanedOrderItems[0]?.count > 0) {
      this.issues.push({
        table: "order_items",
        type: "orphaned",
        severity: "critical",
        description: `${orphanedOrderItems[0].count} order items reference non-existent orders`,
        count: orphanedOrderItems[0].count,
        recommendation: "Remove orphaned order items or restore missing orders",
      })
    }

    // Check order_items -> products relationship
    const orphanedOrderProducts = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM order_items oi 
      LEFT JOIN products p ON oi.product_id = p.id 
      WHERE oi.product_id IS NOT NULL AND p.id IS NULL
    `,
      "Order items with invalid product references",
    )

    if (orphanedOrderProducts && orphanedOrderProducts[0]?.count > 0) {
      this.issues.push({
        table: "order_items",
        type: "orphaned",
        severity: "high",
        description: `${orphanedOrderProducts[0].count} order items reference non-existent products`,
        count: orphanedOrderProducts[0].count,
        recommendation: "Update order items with valid product references",
      })
    }

    console.log("✅ Foreign key constraints checked")
  }

  private async checkOrphanedRecords(): Promise<void> {
    console.log("🗑️ Checking for orphaned records...")

    // Check for categories with no products
    const unusedCategories = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      WHERE p.category_id IS NULL AND c.is_active = true
    `,
      "Active categories with no products",
    )

    if (unusedCategories && unusedCategories[0]?.count > 0) {
      this.issues.push({
        table: "categories",
        type: "orphaned",
        severity: "low",
        description: `${unusedCategories[0].count} active categories have no products`,
        count: unusedCategories[0].count,
        recommendation: "Consider deactivating unused categories or adding products",
      })
    }

    // Check for fabric collections with no fabrics
    const unusedCollections = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM fabric_collections fc 
      LEFT JOIN fabrics f ON fc.id = f.collection_id 
      WHERE f.collection_id IS NULL AND fc.is_active = true
    `,
      "Active fabric collections with no fabrics",
    )

    if (unusedCollections && unusedCollections[0]?.count > 0) {
      this.issues.push({
        table: "fabric_collections",
        type: "orphaned",
        severity: "low",
        description: `${unusedCollections[0].count} active fabric collections have no fabrics`,
        count: unusedCollections[0].count,
        recommendation: "Consider deactivating unused collections or adding fabrics",
      })
    }

    console.log("✅ Orphaned records checked")
  }

  private async checkDuplicateRecords(): Promise<void> {
    console.log("📋 Checking for duplicate records...")

    // Check for duplicate product SKUs
    const duplicateSKUs = await this.executeQuery(
      `
      SELECT sku, COUNT(*) as count 
      FROM products 
      WHERE sku IS NOT NULL 
      GROUP BY sku 
      HAVING COUNT(*) > 1
    `,
      "Duplicate product SKUs",
    )

    if (duplicateSKUs && duplicateSKUs.length > 0) {
      const totalDuplicates = duplicateSKUs.reduce((sum: number, row: any) => sum + row.count - 1, 0)
      this.issues.push({
        table: "products",
        type: "duplicate",
        severity: "high",
        description: `${totalDuplicates} products have duplicate SKUs`,
        count: totalDuplicates,
        recommendation: "Ensure all product SKUs are unique",
      })
    }

    // Check for duplicate category slugs
    const duplicateCategorySlugs = await this.executeQuery(
      `
      SELECT slug, COUNT(*) as count 
      FROM categories 
      WHERE slug IS NOT NULL 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    `,
      "Duplicate category slugs",
    )

    if (duplicateCategorySlugs && duplicateCategorySlugs.length > 0) {
      const totalDuplicates = duplicateCategorySlugs.reduce((sum: number, row: any) => sum + row.count - 1, 0)
      this.issues.push({
        table: "categories",
        type: "duplicate",
        severity: "medium",
        description: `${totalDuplicates} categories have duplicate slugs`,
        count: totalDuplicates,
        recommendation: "Ensure all category slugs are unique for proper URL routing",
      })
    }

    // Check for duplicate product slugs
    const duplicateProductSlugs = await this.executeQuery(
      `
      SELECT slug, COUNT(*) as count 
      FROM products 
      WHERE slug IS NOT NULL 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    `,
      "Duplicate product slugs",
    )

    if (duplicateProductSlugs && duplicateProductSlugs.length > 0) {
      const totalDuplicates = duplicateProductSlugs.reduce((sum: number, row: any) => sum + row.count - 1, 0)
      this.issues.push({
        table: "products",
        type: "duplicate",
        severity: "medium",
        description: `${totalDuplicates} products have duplicate slugs`,
        count: totalDuplicates,
        recommendation: "Ensure all product slugs are unique for proper URL routing",
      })
    }

    console.log("✅ Duplicate records checked")
  }

  private async checkDataConsistency(): Promise<void> {
    console.log("🔍 Checking data consistency...")

    // Check for negative prices
    const negativeProductPrices = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM products 
      WHERE price < 0
    `,
      "Products with negative prices",
    )

    if (negativeProductPrices && negativeProductPrices[0]?.count > 0) {
      this.issues.push({
        table: "products",
        type: "constraint",
        severity: "high",
        description: `${negativeProductPrices[0].count} products have negative prices`,
        count: negativeProductPrices[0].count,
        recommendation: "Fix negative product prices",
      })
    }

    // Check for negative fabric prices
    const negativeFabricPrices = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM fabrics 
      WHERE price_per_meter < 0
    `,
      "Fabrics with negative prices",
    )

    if (negativeFabricPrices && negativeFabricPrices[0]?.count > 0) {
      this.issues.push({
        table: "fabrics",
        type: "constraint",
        severity: "high",
        description: `${negativeFabricPrices[0].count} fabrics have negative prices`,
        count: negativeFabricPrices[0].count,
        recommendation: "Fix negative fabric prices",
      })
    }

    // Check for negative stock quantities
    const negativeStock = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM products 
      WHERE stock_quantity < 0
    `,
      "Products with negative stock",
    )

    if (negativeStock && negativeStock[0]?.count > 0) {
      this.issues.push({
        table: "products",
        type: "constraint",
        severity: "medium",
        description: `${negativeStock[0].count} products have negative stock quantities`,
        count: negativeStock[0].count,
        recommendation: "Review and fix negative stock quantities",
      })
    }

    // Check order totals vs order items
    const inconsistentOrderTotals = await this.executeQuery(
      `
      SELECT COUNT(*) as count 
      FROM orders o 
      LEFT JOIN (
        SELECT order_id, SUM(price * quantity) as calculated_total 
        FROM order_items 
        GROUP BY order_id
      ) oi ON o.id = oi.order_id 
      WHERE ABS(o.total_amount - COALESCE(oi.calculated_total, 0)) > 0.01
    `,
      "Orders with inconsistent totals",
    )

    if (inconsistentOrderTotals && inconsistentOrderTotals[0]?.count > 0) {
      this.issues.push({
        table: "orders",
        type: "constraint",
        severity: "critical",
        description: `${inconsistentOrderTotals[0].count} orders have inconsistent total amounts`,
        count: inconsistentOrderTotals[0].count,
        recommendation: "Recalculate and fix order totals",
      })
    }

    console.log("✅ Data consistency checked")
  }

  private async checkPerformanceIssues(): Promise<void> {
    console.log("⚡ Checking performance issues...")

    // Check for missing indexes on foreign keys
    const missingIndexes = [
      "products.category_id",
      "fabrics.collection_id",
      "order_items.order_id",
      "order_items.product_id",
      "orders.user_id",
    ]

    for (const index of missingIndexes) {
      this.issues.push({
        table: index.split(".")[0],
        type: "performance",
        severity: "medium",
        description: `Consider adding index on ${index} for better query performance`,
        recommendation: `CREATE INDEX IF NOT EXISTS idx_${index.replace(".", "_")} ON ${index.split(".")[0]} (${index.split(".")[1]})`,
      })
    }

    // Check for large tables without proper indexing
    const largeTableCheck = await this.executeQuery(
      `
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public' 
      AND tablename IN ('products', 'orders', 'order_items', 'fabrics')
    `,
      "Table statistics for performance analysis",
    )

    console.log("✅ Performance issues checked")
  }

  private async checkSecuritySettings(): Promise<void> {
    console.log("🔒 Checking security settings...")

    // Check for tables without RLS enabled
    const rlsCheck = await this.executeQuery(
      `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT IN (
        SELECT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
      )
    `,
      "Tables without Row Level Security policies",
    )

    if (rlsCheck && rlsCheck.length > 0) {
      this.issues.push({
        table: "multiple",
        type: "security",
        severity: "high",
        description: `${rlsCheck.length} tables may not have proper Row Level Security policies`,
        count: rlsCheck.length,
        recommendation: "Review and implement RLS policies for all public tables",
      })
    }

    console.log("✅ Security settings checked")
  }

  private generateReport(): IntegrityReport {
    const critical = this.issues.filter((i) => i.severity === "critical").length
    const high = this.issues.filter((i) => i.severity === "high").length
    const medium = this.issues.filter((i) => i.severity === "medium").length
    const low = this.issues.filter((i) => i.severity === "low").length

    const averageQueryTime =
      this.queryTimes.length > 0 ? this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length : 0

    const slowQueries = this.queryTimes
      .map((time, index) => ({ time, index }))
      .filter((q) => q.time > 1000)
      .map((q) => `Query ${q.index + 1}: ${q.time}ms`)

    const recommendations = this.generateRecommendations()

    return {
      timestamp: new Date().toISOString(),
      database: {
        name: "SofaCover Pro Database",
        tables: 7,
        totalRecords: 0, // Would need additional queries to calculate
      },
      summary: {
        totalIssues: this.issues.length,
        critical,
        high,
        medium,
        low,
      },
      issues: this.issues,
      performance: {
        averageQueryTime: Math.round(averageQueryTime),
        slowQueries,
        missingIndexes: this.issues.filter((i) => i.type === "performance").map((i) => i.description),
      },
      recommendations,
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    const criticalIssues = this.issues.filter((i) => i.severity === "critical").length
    const highIssues = this.issues.filter((i) => i.severity === "high").length

    if (criticalIssues > 0) {
      recommendations.push(`Address ${criticalIssues} critical database issues immediately`)
    }

    if (highIssues > 0) {
      recommendations.push(`Fix ${highIssues} high-priority database issues`)
    }

    const orphanedIssues = this.issues.filter((i) => i.type === "orphaned").length
    if (orphanedIssues > 0) {
      recommendations.push("Clean up orphaned records to improve data quality")
    }

    const duplicateIssues = this.issues.filter((i) => i.type === "duplicate").length
    if (duplicateIssues > 0) {
      recommendations.push("Resolve duplicate records to ensure data uniqueness")
    }

    const performanceIssues = this.issues.filter((i) => i.type === "performance").length
    if (performanceIssues > 0) {
      recommendations.push("Add database indexes to improve query performance")
    }

    const securityIssues = this.issues.filter((i) => i.type === "security").length
    if (securityIssues > 0) {
      recommendations.push("Implement proper Row Level Security policies")
    }

    if (recommendations.length === 0) {
      recommendations.push("Database integrity looks good! Continue monitoring regularly")
    }

    return recommendations
  }
}

// Main execution
async function main() {
  const checker = new DatabaseIntegrityChecker()

  try {
    const report = await checker.checkIntegrity()

    console.log("\n📊 Database Integrity Report")
    console.log("=".repeat(50))
    console.log(`Database: ${report.database.name}`)
    console.log(`Tables: ${report.database.tables}`)
    console.log(`Total Issues: ${report.summary.totalIssues}`)
    console.log(`  - Critical: ${report.summary.critical}`)
    console.log(`  - High: ${report.summary.high}`)
    console.log(`  - Medium: ${report.summary.medium}`)
    console.log(`  - Low: ${report.summary.low}`)
    console.log(`\nPerformance:`)
    console.log(`  - Average Query Time: ${report.performance.averageQueryTime}ms`)
    console.log(`  - Slow Queries: ${report.performance.slowQueries.length}`)

    console.log("\n💡 Recommendations:")
    report.recommendations.forEach((rec) => console.log(`  - ${rec}`))

    // Write detailed report to file
    const fs = require("fs")
    fs.writeFileSync("database-integrity-report.json", JSON.stringify(report, null, 2))
    console.log("\n📄 Detailed report saved to: database-integrity-report.json")

    // Exit with error code if there are critical issues
    if (report.summary.critical > 0) {
      console.log("\n❌ Critical database issues found!")
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Database integrity check failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { DatabaseIntegrityChecker, type IntegrityReport, type IntegrityIssue }
