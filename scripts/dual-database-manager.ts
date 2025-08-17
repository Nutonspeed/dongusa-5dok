#!/usr/bin/env tsx
// Dual Database Manager - จัดการการสลับระหว่าง Supabase และ Neon

import { createClient } from "@supabase/supabase-js"
import { neon } from "@neondatabase/serverless"

type DatabaseProvider = "supabase" | "neon" | "auto"

interface DatabaseConfig {
  provider: DatabaseProvider
  supabase?: {
    url: string
    serviceKey: string
    anonKey: string
  }
  neon?: {
    databaseUrl: string
  }
}

class DualDatabaseManager {
  private config: DatabaseConfig
  private supabaseClient?: any
  private neonClient?: any

  constructor(config: DatabaseConfig) {
    this.config = config
    this.initializeClients()
  }

  private initializeClients() {
    // Initialize Supabase client
    if (this.config.supabase) {
      this.supabaseClient = createClient(this.config.supabase.url, this.config.supabase.serviceKey)
    }

    // Initialize Neon client
    if (this.config.neon) {
      this.neonClient = neon(this.config.neon.databaseUrl)
    }
  }

  async getActiveDatabase(): Promise<"supabase" | "neon"> {
    if (this.config.provider !== "auto") {
      return this.config.provider as "supabase" | "neon"
    }

    // Auto-detect best database based on performance
    const [supabaseHealth, neonHealth] = await Promise.allSettled([this.checkSupabaseHealth(), this.checkNeonHealth()])

    if (supabaseHealth.status === "fulfilled" && supabaseHealth.value) {
      return "supabase"
    } else if (neonHealth.status === "fulfilled" && neonHealth.value) {
      return "neon"
    }

    throw new Error("No healthy database connection available")
  }

  private async checkSupabaseHealth(): Promise<boolean> {
    if (!this.supabaseClient) return false

    try {
      const startTime = Date.now()
      const { error } = await this.supabaseClient.from("profiles").select("count").limit(1)

      const responseTime = Date.now() - startTime
      return !error && responseTime < 1000 // Healthy if < 1s response
    } catch {
      return false
    }
  }

  private async checkNeonHealth(): Promise<boolean> {
    if (!this.neonClient) return false

    try {
      const startTime = Date.now()
      await this.neonClient`SELECT 1`
      const responseTime = Date.now() - startTime
      return responseTime < 1000 // Healthy if < 1s response
    } catch {
      return false
    }
  }

  async executeQuery(query: string, params?: any[]): Promise<any> {
    const activeDb = await this.getActiveDatabase()

    if (activeDb === "supabase") {
      return this.executeSupabaseQuery(query, params)
    } else {
      return this.executeNeonQuery(query, params)
    }
  }

  private async executeSupabaseQuery(query: string, params?: any[]): Promise<any> {
    try {
      // Convert SQL query to Supabase format if needed
      console.log(`[v0] Executing Supabase query: ${query}`)
      return await this.supabaseClient.rpc("exec_sql", { sql: query })
    } catch (error) {
      console.error("[v0] Supabase query failed:", error)
      throw error
    }
  }

  private async executeNeonQuery(query: string, params?: any[]): Promise<any> {
    try {
      console.log(`[v0] Executing Neon query: ${query}`)
      return await this.neonClient(query, params)
    } catch (error) {
      console.error("[v0] Neon query failed:", error)
      throw error
    }
  }

  async syncData(fromDb: "supabase" | "neon", toDb: "supabase" | "neon"): Promise<void> {
    console.log(`🔄 Syncing data from ${fromDb} to ${toDb}...`)

    const tables = ["profiles", "products", "orders", "categories"]

    for (const table of tables) {
      try {
        console.log(`  Syncing table: ${table}`)

        // Get data from source
        let sourceData: any[]
        if (fromDb === "supabase") {
          const { data } = await this.supabaseClient.from(table).select("*")
          sourceData = data || []
        } else {
          sourceData = await this.neonClient`SELECT * FROM ${table}`
        }

        // Insert/update data in target
        if (toDb === "supabase") {
          await this.supabaseClient.from(table).upsert(sourceData)
        } else {
          // Implement Neon upsert logic
          for (const row of sourceData) {
            const columns = Object.keys(row).join(", ")
            const values = Object.values(row)
            const placeholders = values.map((_, i) => `$${i + 1}`).join(", ")

            await this.neonClient`
              INSERT INTO ${table} (${columns}) 
              VALUES (${placeholders})
              ON CONFLICT (id) DO UPDATE SET
              ${Object.keys(row)
                .map((col) => `${col} = EXCLUDED.${col}`)
                .join(", ")}
            `
          }
        }

        console.log(`  ✅ Synced ${sourceData.length} records from ${table}`)
      } catch (error) {
        console.error(`  ❌ Failed to sync ${table}:`, error)
      }
    }

    console.log("✅ Data synchronization complete")
  }
}

// Export singleton instance
const dbConfig: DatabaseConfig = {
  provider: (process.env.DATABASE_PROVIDER as DatabaseProvider) || "auto",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  neon: {
    databaseUrl: process.env.sofa69_DATABASE_URL || process.env.DATABASE_URL!,
  },
}

export const dualDbManager = new DualDatabaseManager(dbConfig)

// CLI usage
if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case "health":
      dualDbManager
        .getActiveDatabase()
        .then((db) => console.log(`✅ Active database: ${db}`))
        .catch((err) => console.error("❌ Database health check failed:", err))
      break

    case "sync":
      const from = process.argv[3] as "supabase" | "neon"
      const to = process.argv[4] as "supabase" | "neon"

      if (!from || !to) {
        console.error("Usage: tsx dual-database-manager.ts sync <from> <to>")
        process.exit(1)
      }

      dualDbManager
        .syncData(from, to)
        .then(() => console.log("✅ Sync completed"))
        .catch((err) => console.error("❌ Sync failed:", err))
      break

    default:
      console.log("Available commands:")
      console.log("  health - Check database health")
      console.log("  sync <from> <to> - Sync data between databases")
  }
}
