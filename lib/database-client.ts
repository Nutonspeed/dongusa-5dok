import { logger } from "@/lib/logger"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { createClient } from "@/lib/supabase/client"
import { DATABASE_CONFIG } from "@/lib/runtime"

export class DatabaseClient {
  private client: SupabaseClient<Database> | null = null
  private connectionAttempts = 0
  private isConnected = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    if (!DATABASE_CONFIG.useSupabase) {
      logger.info("Using mock database")
      return
    }

    try {
      this.client = createClient()
      await this.testConnection()
      this.isConnected = true
      logger.info("Database connected successfully")
    } catch (error) {
      logger.error("Database connection failed:", error)
      this.handleConnectionError(error)
    }
  }

  private async testConnection() {
    if (!this.client) throw new Error("No database client")

    const { data, error } = await this.client.from("profiles").select("id").limit(1)

    if (error && error.code !== "PGRST116") {
      // PGRST116 = table not found (acceptable)
      throw error
    }
  }

  private handleConnectionError(error: any) {
    this.connectionAttempts++

    if (this.connectionAttempts < DATABASE_CONFIG.retryAttempts) {
      logger.warn(`Retrying database connection (${this.connectionAttempts}/${DATABASE_CONFIG.retryAttempts})`)
      setTimeout(() => this.initialize(), 2000 * this.connectionAttempts)
    } else {
      logger.error("Database connection failed permanently, falling back to mock")
      this.client = null
      this.isConnected = false
    }
  }

  async query<T>(
    table: string,
    operation: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>,
  ): Promise<{ data: T | null; error: any }> {
    // Use mock database if not connected or configured
    if (!this.client || !this.isConnected || !DATABASE_CONFIG.useSupabase) {
      logger.warn(`Using mock database for ${table} query`)
      const { mockDatabaseService } = await import("@/lib/mock-database")

      // Convert Supabase query to mock query (simplified)
      try {
        const mockData = await this.getMockData(table)
        return { data: mockData as T, error: null }
      } catch (error) {
        return { data: null, error }
      }
    }

    try {
      const result = await Promise.race([
        operation(this.client),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout")), DATABASE_CONFIG.connectionTimeout),
        ),
      ])

      return result
    } catch (error) {
      logger.error(`Database query failed for ${table}:`, error)

      // Fallback to mock data
      try {
        const mockData = await this.getMockData(table)
        logger.warn(`Falling back to mock data for ${table}`)
        return { data: mockData as T, error: null }
      } catch (mockError) {
        return { data: null, error }
      }
    }
  }

  private async getMockData(table: string): Promise<any> {
    const { mockDatabaseService } = await import("@/lib/mock-database")

    switch (table) {
      case "products":
        return await mockDatabaseService.getProducts()
      case "orders":
        return await mockDatabaseService.getOrders()
      case "profiles":
        return await mockDatabaseService.getCustomers()
      default:
        return []
    }
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    if (!DATABASE_CONFIG.useSupabase) {
      return {
        status: "healthy",
        details: { type: "mock", message: "Mock database is always available" },
      }
    }

    if (!this.client) {
      return {
        status: "unhealthy",
        details: { error: "No database client available" },
      }
    }

    try {
      await this.testConnection()
      return {
        status: "healthy",
        details: {
          type: "supabase",
          connected: this.isConnected,
          attempts: this.connectionAttempts,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        details: { error: error instanceof Error ? error.message : "Unknown error" },
      }
    }
  }

  getClient(): SupabaseClient<Database> | null {
    return this.client
  }

  isHealthy(): boolean {
    return DATABASE_CONFIG.useSupabase ? this.isConnected : true
  }
}

// Singleton instance
export const databaseClient = new DatabaseClient()
