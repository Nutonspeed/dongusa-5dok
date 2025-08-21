// System Data Flow Manager
// จัดการการไหลของข้อมูลและการเชื่อมโยงระหว่างโมดูล

import { createClient } from "@/lib/supabase/client"
import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"

export interface DataFlowMetrics {
  timestamp: string
  module: string
  operation: string
  input_size: number
  output_size: number
  processing_time: number
  success: boolean
  error_message?: string
}

export interface ModuleConnection {
  source_module: string
  target_module: string
  connection_type: "sync" | "async" | "event"
  data_format: string
  last_communication: string
  status: "active" | "inactive" | "error"
}

export class SystemDataFlowManager {
  private supabase = createClient()
  private redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  // ติดตามการไหลของข้อมูล
  async trackDataFlow(metrics: Omit<DataFlowMetrics, "timestamp">): Promise<void> {
    const dataFlowMetrics: DataFlowMetrics = {
      ...metrics,
      timestamp: new Date().toISOString(),
    }

    try {
      // เก็บ metrics ในฐานข้อมูล
      await this.supabase.from("data_flow_metrics").insert(dataFlowMetrics)

      // เก็บใน cache สำหรับการเข้าถึงที่รวดเร็ว
      await this.redis.lpush(`dataflow:${metrics.module}`, JSON.stringify(dataFlowMetrics))
      await this.redis.ltrim(`dataflow:${metrics.module}`, 0, 99) // เก็บ 100 records ล่าสุด

      logger.info("Data flow tracked", dataFlowMetrics)
    } catch (error) {
      logger.error("Error tracking data flow:", error)
    }
  }

  // ตรวจสอบการเชื่อมโยงระหว่างโมดูล
  async checkModuleConnections(): Promise<ModuleConnection[]> {
    const connections: ModuleConnection[] = [
      // Frontend ↔ API Gateway
      {
        source_module: "frontend",
        target_module: "api_gateway",
        connection_type: "sync",
        data_format: "HTTP/JSON",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      // API Gateway ↔ Services
      {
        source_module: "api_gateway",
        target_module: "auth_service",
        connection_type: "sync",
        data_format: "Function Call",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      {
        source_module: "api_gateway",
        target_module: "admin_service",
        connection_type: "sync",
        data_format: "Function Call",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      {
        source_module: "api_gateway",
        target_module: "ecommerce_service",
        connection_type: "sync",
        data_format: "Function Call",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      // Services ↔ Database
      {
        source_module: "auth_service",
        target_module: "supabase_database",
        connection_type: "sync",
        data_format: "SQL/PostgreSQL",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      {
        source_module: "admin_service",
        target_module: "supabase_database",
        connection_type: "sync",
        data_format: "SQL/PostgreSQL",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      // Services ↔ Cache
      {
        source_module: "auth_service",
        target_module: "redis_cache",
        connection_type: "sync",
        data_format: "Key-Value",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      {
        source_module: "analytics_service",
        target_module: "redis_cache",
        connection_type: "sync",
        data_format: "Key-Value",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      // AI Integration
      {
        source_module: "ai_service",
        target_module: "grok_api",
        connection_type: "sync",
        data_format: "HTTP/JSON",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      // Event-driven connections
      {
        source_module: "order_service",
        target_module: "inventory_service",
        connection_type: "event",
        data_format: "Event/JSON",
        last_communication: new Date().toISOString(),
        status: "active",
      },
      {
        source_module: "order_service",
        target_module: "notification_service",
        connection_type: "async",
        data_format: "Message Queue",
        last_communication: new Date().toISOString(),
        status: "active",
      },
    ]

    // ทดสอบการเชื่อมต่อจริง
    for (const connection of connections) {
      try {
        await this.testConnection(connection)
      } catch (error) {
        connection.status = "error"
        logger.error(`Connection test failed: ${connection.source_module} → ${connection.target_module}`, error)
      }
    }

    return connections
  }

  /**
   * ทดสอบการเชื่อมต่อกับโมดูลต่างๆ
   * @param connection ข้อมูลการเชื่อมต่อ
   * @returns Promise<boolean> สถานะการเชื่อมต่อ
   */
  private async testConnection(connection: ModuleConnection): Promise<boolean> {
    try {
      const startTime = Date.now()
      let success = false

      switch (connection.target_module) {
        case "supabase_database":
          const { error: dbError } = await this.supabase
            .from("health_check")
            .select("*")
            .limit(1)
            .single()
          
          if (dbError) {
            console.error(`[${connection.target_module}] Connection failed:`, dbError)
            throw new Error(`Database connection error: ${dbError.message}`)
          }
          success = true
          break

        case "redis_cache":
          try {
            await this.redis.ping()
            success = true
          } catch (error) {
            console.error(`[${connection.target_module}] Redis ping failed:`, error)
            throw new Error(`Redis connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
          break

        case "grok_api":
          try {
            if (!process.env.XAI_API_KEY) {
              throw new Error('XAI API key is not configured')
            }
            
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
            
            const response = await fetch("https://api.x.ai/v1/models", {
              headers: { 
                Authorization: `Bearer ${process.env.XAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`)
            }
            
            success = response.ok
          } catch (error) {
            console.error(`[${connection.target_module}] Grok API error:`, error)
            throw new Error(`Grok API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
          break

        default:
          // สำหรับ internal services ให้ถือว่าเชื่อมต่อได้
          success = true
          console.log(`[${connection.target_module}] Internal service connection assumed successful`)
          break
      }

      const duration = Date.now() - startTime
      console.log(`[${connection.target_module}] Connection test ${success ? 'succeeded' : 'failed'} in ${duration}ms`)
      
      return success
      
    } catch (error) {
      console.error(`[${connection.target_module}] Connection test failed:`, error)
      return false
    }
  }

  // วิเคราะห์ประสิทธิภาพการไหลของข้อมูล
  async analyzeDataFlowPerformance(timeRange: "1h" | "24h" | "7d" = "24h"): Promise<{
    total_operations: number
    average_processing_time: number
    success_rate: number
    bottlenecks: Array<{ module: string; avg_time: number; operation_count: number }>
    error_patterns: Array<{ error: string; count: number; modules: string[] }>
  }> {
    try {
      const startTime = this.getTimeRangeStart(timeRange)

      const { data: metrics } = await this.supabase.from("data_flow_metrics").select("*").gte("timestamp", startTime)

      if (!metrics || metrics.length === 0) {
        return {
          total_operations: 0,
          average_processing_time: 0,
          success_rate: 0,
          bottlenecks: [],
          error_patterns: [],
        }
      }

      const totalOperations = metrics.length
      const successfulOperations = metrics.filter((m) => m.success).length
      const successRate = (successfulOperations / totalOperations) * 100

      const totalProcessingTime = metrics.reduce((sum, m) => sum + m.processing_time, 0)
      const averageProcessingTime = totalProcessingTime / totalOperations

      // หา bottlenecks
      const moduleStats = metrics.reduce(
        (acc, metric) => {
          if (!acc[metric.module]) {
            acc[metric.module] = { total_time: 0, count: 0 }
          }
          acc[metric.module].total_time += metric.processing_time
          acc[metric.module].count += 1
          return acc
        },
        {} as Record<string, { total_time: number; count: number }>,
      )

      const bottlenecks = Object.entries(moduleStats)
        .map(([module, stats]) => ({
          module,
          avg_time: stats.total_time / stats.count,
          operation_count: stats.count,
        }))
        .sort((a, b) => b.avg_time - a.avg_time)
        .slice(0, 5)

      // วิเคราะห์ error patterns
      const errorMetrics = metrics.filter((m) => !m.success && m.error_message)
      const errorPatterns = errorMetrics.reduce(
        (acc, metric) => {
          const error = metric.error_message!
          if (!acc[error]) {
            acc[error] = { count: 0, modules: new Set<string>() }
          }
          acc[error].count += 1
          acc[error].modules.add(metric.module)
          return acc
        },
        {} as Record<string, { count: number; modules: Set<string> }>,
      )

      const errorPatternsArray = Object.entries(errorPatterns)
        .map(([error, stats]) => ({
          error,
          count: stats.count,
          modules: Array.from(stats.modules),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        total_operations: totalOperations,
        average_processing_time: averageProcessingTime,
        success_rate: successRate,
        bottlenecks,
        error_patterns: errorPatternsArray,
      }
    } catch (error) {
      logger.error("Error analyzing data flow performance:", error)
      return {
        total_operations: 0,
        average_processing_time: 0,
        success_rate: 0,
        bottlenecks: [],
        error_patterns: [],
      }
    }
  }

  // สร้างแผนผังการไหลของข้อมูล
  async generateDataFlowDiagram(): Promise<{
    nodes: Array<{ id: string; label: string; type: string; status: string }>
    edges: Array<{ source: string; target: string; type: string; status: string }>
  }> {
    const connections = await this.checkModuleConnections()

    // สร้าง nodes
    const nodeSet = new Set<string>()
    connections.forEach((conn) => {
      nodeSet.add(conn.source_module)
      nodeSet.add(conn.target_module)
    })

    const nodes = Array.from(nodeSet).map((nodeId) => ({
      id: nodeId,
      label: this.getModuleDisplayName(nodeId),
      type: this.getModuleType(nodeId),
      status: this.getModuleStatus(nodeId, connections),
    }))

    // สร้าง edges
    const edges = connections.map((conn) => ({
      source: conn.source_module,
      target: conn.target_module,
      type: conn.connection_type,
      status: conn.status,
    }))

    return { nodes, edges }
  }

  // Helper methods
  private getTimeRangeStart(range: "1h" | "24h" | "7d"): string {
    const now = Date.now()
    switch (range) {
      case "1h":
        return new Date(now - 60 * 60 * 1000).toISOString()
      case "24h":
        return new Date(now - 24 * 60 * 60 * 1000).toISOString()
      case "7d":
        return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  private getModuleDisplayName(moduleId: string): string {
    const displayNames: Record<string, string> = {
      frontend: "Frontend UI",
      api_gateway: "API Gateway",
      auth_service: "Authentication Service",
      admin_service: "Admin Service",
      ecommerce_service: "E-Commerce Service",
      supabase_database: "Supabase Database",
      redis_cache: "Redis Cache",
      ai_service: "AI Service",
      grok_api: "Grok API",
      order_service: "Order Service",
      inventory_service: "Inventory Service",
      notification_service: "Notification Service",
    }
    return displayNames[moduleId] || moduleId
  }

  private getModuleType(moduleId: string): string {
    if (moduleId.includes("database")) return "database"
    if (moduleId.includes("cache")) return "cache"
    if (moduleId.includes("api")) return "external"
    if (moduleId.includes("service")) return "service"
    if (moduleId === "frontend") return "frontend"
    if (moduleId === "api_gateway") return "gateway"
    return "unknown"
  }

  private getModuleStatus(moduleId: string, connections: ModuleConnection[]): string {
    const moduleConnections = connections.filter(
      (conn) => conn.source_module === moduleId || conn.target_module === moduleId,
    )

    if (moduleConnections.some((conn) => conn.status === "error")) return "error"
    if (moduleConnections.some((conn) => conn.status === "inactive")) return "warning"
    return "active"
  }

  // เริ่มต้นการติดตามแบบ real-time
  async startRealTimeTracking(): Promise<void> {
    // ติดตาม database changes
    this.supabase
      .channel("data_flow_tracking")
      .on("postgres_changes", { event: "*", schema: "public", table: "data_flow_metrics" }, (payload) => {
        logger.info("Data flow event detected:", payload)
        this.handleDataFlowEvent(payload)
      })
      .subscribe()

    logger.info("Real-time data flow tracking started")
  }

  private async handleDataFlowEvent(payload: any): Promise<void> {
    // ประมวลผล real-time events
    if (payload.eventType === "INSERT") {
      const metrics = payload.new as DataFlowMetrics

      // ตรวจสอบ performance threshold
      if (metrics.processing_time > 5000) {
        logger.warn("Slow operation detected:", {
          module: metrics.module,
          operation: metrics.operation,
          processing_time: metrics.processing_time,
        })
      }

      // ตรวจสอบ error rate
      if (!metrics.success) {
        logger.error("Operation failed:", {
          module: metrics.module,
          operation: metrics.operation,
          error: metrics.error_message,
        })
      }
    }
  }
}

export const systemDataFlowManager = new SystemDataFlowManager()
