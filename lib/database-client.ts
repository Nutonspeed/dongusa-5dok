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
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

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

  async getProducts() {
    if (!USE_SUPABASE) {
      // Return mock data that matches the seeded database structure
      return {
        data: [
          {
            id: "prod-001",
            name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
            description: "ผ้าคลุมโซฟาคุณภาพสูง ทำจากกำมะหยี่นุ่ม กันน้ำ กันคราบ เหมาะสำหรับโซฟา 2-3 ที่นั่ง",
            price: 2890,
            compare_at_price: 3490,
            sku: "SFC-PV-001",
            category_id: "cat-001",
            stock_quantity: 25,
            images: ["/premium-velvet-burgundy-sofa-cover.png"],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.8,
            reviews: 127,
            tags: ["premium", "velvet", "waterproof"],
            type: "fixed" as const,
            bestseller: true,
          },
          {
            id: "prod-002",
            name: "ผ้าคลุมโซฟากันน้ำ",
            description: "ผ้าคลุมโซฟากันน้ำ 100% เหมาะสำหรับครอบครัวที่มีเด็กเล็ก ทำความสะอาดง่าย",
            price: 1950,
            sku: "SFC-WP-002",
            category_id: "cat-001",
            stock_quantity: 40,
            images: ["/waterproof-charcoal-sofa-cover.png"],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.6,
            reviews: 89,
            tags: ["waterproof", "family-friendly"],
            type: "fixed" as const,
          },
          {
            id: "prod-003",
            name: "หมอนอิงลายเดียวกัน",
            description: "หมอนอิงที่เข้าชุดกับผ้าคลุมโซฟา ขนาด 45x45 ซม. ผ้าคุณภาพเดียวกัน",
            price: 350,
            sku: "PIL-MAT-003",
            category_id: "cat-002",
            stock_quantity: 60,
            images: ["/burgundy-throw-pillows.png"],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.4,
            reviews: 156,
            tags: ["pillow", "matching"],
            type: "fixed" as const,
          },
          {
            id: "prod-004",
            name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
            description: "ผ้าคลุมโซฟาสำหรับโซฟาเซ็กชั่นแนล ขนาดใหญ่ ครอบคลุมได้ดี มีสายรัดกันเลื่อน",
            price: 4200,
            compare_at_price: 4890,
            sku: "SFC-SEC-004",
            category_id: "cat-001",
            stock_quantity: 15,
            images: ["/sectional-navy-sofa-cover.png"],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.7,
            reviews: 73,
            tags: ["sectional", "large"],
            type: "fixed" as const,
            discount: 14,
          },
          {
            id: "prod-005",
            name: "ผ้าคลุมโซฟาสไตล์ญี่ปุ่น",
            description: "ผ้าคลุมโซฟาสไตล์ญี่ปุ่น ลายไผ่ สีเบจ เรียบง่าย สงบ เหมาะกับการตกแต่งแบบมินิมอล",
            price: 2450,
            sku: "SFC-JZ-005",
            category_id: "cat-001",
            stock_quantity: 30,
            images: ["/placeholder-f98iw.png"],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.5,
            reviews: 92,
            tags: ["japanese", "zen", "minimalist"],
            type: "fixed" as const,
          },
          {
            id: "prod-006",
            name: "หมอนอิงกำมะหยี่",
            description: "หมอนอิงกำมะหยี่หรูหรา ขนาด 50x50 ซม. สีแดงเบอร์กันดี เข้าชุดกับผ้าคลุมโซฟา",
            price: 450,
            compare_at_price: 550,
            sku: "PIL-VEL-006",
            category_id: "cat-002",
            stock_quantity: 45,
            images: ["/burgundy-velvet-pillow.png"],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.6,
            reviews: 64,
            tags: ["velvet", "luxury", "pillow"],
            type: "fixed" as const,
          },
        ],
        error: null,
      }
    }

    try {
      if (!this.supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data, error } = await this.supabase
        .from("products")
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      logger.error("Error fetching products:", error)
      return { data: [], error }
    }
  }

  async getCategories() {
    if (!USE_SUPABASE) {
      // Return mock categories that match the seeded database
      return {
        data: [
          {
            id: "cat-001",
            name: "ผ้าคลุมโซฟา",
            slug: "sofa-covers",
            description: "ผ้าคลุมโซฟาคุณภาพสูง ทนทาน กันน้ำ",
            image_url: "/images/categories/sofa-covers.jpg",
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: "cat-002",
            name: "หมอนอิง",
            slug: "pillows",
            description: "หมอนอิงสวยงาม เข้าชุดกับผ้าคลุมโซฟา",
            image_url: "/images/categories/pillows.jpg",
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: "cat-003",
            name: "ผ้าคลุมเก้าอี้",
            slug: "chair-covers",
            description: "ผ้าคลุมเก้าอี้ ป้องกันความเสียหาย",
            image_url: "/images/categories/chair-covers.jpg",
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: "cat-004",
            name: "อุปกรณ์เสริม",
            slug: "accessories",
            description: "อุปกรณ์เสริมสำหรับการดูแลเฟอร์นิเจอร์",
            image_url: "/images/categories/accessories.jpg",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      }
    }

    try {
      if (!this.supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data, error } = await this.supabase.from("categories").select("*").eq("is_active", true).order("name")

      return { data: data || [], error }
    } catch (error) {
      logger.error("Error fetching categories:", error)
      return { data: [], error }
    }
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
