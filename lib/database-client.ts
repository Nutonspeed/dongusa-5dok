import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"
import { DATABASE_CONFIG, USE_SUPABASE } from "@/lib/runtime"
import type { Database } from "@/types/database"

interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded"
  timestamp: string
  details: {
    database: string
    latency?: number
    error?: string
  }
}

class DatabaseClient {
  private supabase: SupabaseClient<Database> | null = null
  private connectionAttempts = 0
  private lastHealthCheck: HealthCheckResult | null = null

  constructor() {
    if (USE_SUPABASE) {
      this.initializeSupabase()
    } else {
      logger.info("🔧 Using mock database for development")
    }
  }

  private initializeSupabase() {
    try {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase credentials")
      }

      this.supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
        db: {
          schema: "public",
        },
        global: {
          headers: {
            "x-application-name": "sofa-cover-website",
          },
        },
      })

      logger.info("✅ Supabase client initialized")
    } catch (error) {
      logger.error("❌ Failed to initialize Supabase:", error)
      throw error
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      if (!USE_SUPABASE) {
        // Mock database health check
        return {
          status: "healthy",
          timestamp: new Date().toISOString(),
          details: {
            database: "mock",
            latency: 1,
          },
        }
      }

      if (!this.supabase) {
        throw new Error("Supabase client not initialized")
      }

      // Simple query to test connection
      const { error } = await this.supabase.from("customers").select("id").limit(1)

      const latency = Date.now() - startTime

      if (error) {
        throw error
      }

      this.lastHealthCheck = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        details: {
          database: "supabase",
          latency,
        },
      }

      return this.lastHealthCheck
    } catch (error) {
      const latency = Date.now() - startTime

      this.lastHealthCheck = {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        details: {
          database: USE_SUPABASE ? "supabase" : "mock",
          latency,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }

      logger.error("❌ Database health check failed:", error)
      return this.lastHealthCheck
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const health = await this.healthCheck()
      return health.status === "healthy"
    } catch {
      return false
    }
  }

  getClient(): SupabaseClient<Database> | null {
    return this.supabase
  }

  isConnected(): boolean {
    return this.lastHealthCheck?.status === "healthy" || !USE_SUPABASE
  }

  async retryConnection(maxAttempts = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      logger.info(`🔄 Database connection attempt ${attempt}/${maxAttempts}`)

      try {
        const isHealthy = await this.testConnection()
        if (isHealthy) {
          logger.info("✅ Database connection restored")
          this.connectionAttempts = 0
          return true
        }
      } catch (error) {
        logger.warn(`⚠️ Connection attempt ${attempt} failed:`, error)
      }

      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    this.connectionAttempts++
    logger.error(`❌ Failed to establish database connection after ${maxAttempts} attempts`)
    return false
    }

  // Mock helpers used by client pages
  async getProducts() {
    return { data: [], error: null }
  }

  async getCategories() {
    return { data: [], error: null }
  }

  async updateProfile(..._args: any[]) {
    return { data: null, error: null }
  }

  getConnectionStats() {
    return {
      isConnected: this.isConnected(),
      useSupabase: USE_SUPABASE,
      connectionAttempts: this.connectionAttempts,
      lastHealthCheck: this.lastHealthCheck,
      config: {
        timeout: DATABASE_CONFIG.connectionTimeout,
        maxConnections: DATABASE_CONFIG.maxConnections,
        retryAttempts: DATABASE_CONFIG.retryAttempts,
      },
    }
  }
}

// Create singleton instance
export const databaseClient = new DatabaseClient()

// Export for use in other modules
export default databaseClient

// Health check endpoint helper
export async function getDatabaseHealth(): Promise<HealthCheckResult> {
  return await databaseClient.healthCheck()
}

// Connection test helper
export async function testDatabaseConnection(): Promise<boolean> {
  return await databaseClient.testConnection()
}
