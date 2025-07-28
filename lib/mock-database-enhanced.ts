// Enhanced mock database with realistic data simulation and performance characteristics

import { performanceMonitor } from "./performance-monitor"
import { dataFlowManager } from "./data-flow-optimizer"

interface DatabaseConfig {
  latencySimulation: boolean
  errorSimulation: boolean
  consistencyChecks: boolean
  transactionSupport: boolean
}

interface TransactionContext {
  id: string
  operations: Array<{ type: string; table: string; data: any }>
  rollbackData: Map<string, any>
}

export class EnhancedMockDatabase {
  private config: DatabaseConfig
  private tables = new Map<string, Map<string, any>>()
  private indexes = new Map<string, Map<string, Set<string>>>()
  private transactions = new Map<string, TransactionContext>()
  private connectionPool = { active: 0, max: 10 }

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      latencySimulation: true,
      errorSimulation: false,
      consistencyChecks: true,
      transactionSupport: true,
      ...config,
    }

    this.initializeTables()
    this.setupPeriodicMaintenance()
  }

  private initializeTables(): void {
    // Initialize core tables
    this.tables.set("bills", new Map())
    this.tables.set("customers", new Map())
    this.tables.set("products", new Map())
    this.tables.set("orders", new Map())

    // Create indexes for common queries
    this.createIndex("bills", "customerId")
    this.createIndex("bills", "status")
    this.createIndex("bills", "dueDate")
    this.createIndex("customers", "email")
    this.createIndex("orders", "customerId")
  }

  private createIndex(tableName: string, field: string): void {
    const indexKey = `${tableName}.${field}`
    this.indexes.set(indexKey, new Map())
  }

  private updateIndex(tableName: string, field: string, value: any, recordId: string): void {
    const indexKey = `${tableName}.${field}`
    const index = this.indexes.get(indexKey)

    if (index) {
      const valueKey = String(value)
      if (!index.has(valueKey)) {
        index.set(valueKey, new Set())
      }
      index.get(valueKey)!.add(recordId)
    }
  }

  private removeFromIndex(tableName: string, field: string, value: any, recordId: string): void {
    const indexKey = `${tableName}.${field}`
    const index = this.indexes.get(indexKey)

    if (index) {
      const valueKey = String(value)
      const valueSet = index.get(valueKey)
      if (valueSet) {
        valueSet.delete(recordId)
        if (valueSet.size === 0) {
          index.delete(valueKey)
        }
      }
    }
  }

  // Simulate realistic database latency
  private async simulateLatency(operation: string): Promise<void> {
    if (!this.config.latencySimulation) return

    const latencies = {
      select: { min: 10, max: 100 },
      insert: { min: 20, max: 150 },
      update: { min: 15, max: 120 },
      delete: { min: 25, max: 200 },
      transaction: { min: 50, max: 300 },
    }

    const range = latencies[operation as keyof typeof latencies] || { min: 10, max: 100 }
    const delay = Math.random() * (range.max - range.min) + range.min

    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Simulate connection pool management
  private async acquireConnection(): Promise<void> {
    if (this.connectionPool.active >= this.connectionPool.max) {
      // Wait for available connection
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))
    }
    this.connectionPool.active++
  }

  private releaseConnection(): void {
    this.connectionPool.active = Math.max(0, this.connectionPool.active - 1)
  }

  // Enhanced CRUD operations with performance monitoring
  async select<T>(
    tableName: string,
    filter?: (record: T) => boolean,
    options?: { limit?: number; offset?: number; orderBy?: string; orderDirection?: "asc" | "desc" },
  ): Promise<T[]> {
    const stopTimer = performanceMonitor.startTimer(`db-select-${tableName}`)

    try {
      await this.acquireConnection()
      await this.simulateLatency("select")

      const table = this.tables.get(tableName)
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`)
      }

      let records = Array.from(table.values()) as T[]

      // Apply filter
      if (filter) {
        records = records.filter(filter)
      }

      // Apply ordering
      if (options?.orderBy) {
        records.sort((a, b) => {
          const aVal = (a as any)[options.orderBy!]
          const bVal = (b as any)[options.orderBy!]
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          return options.orderDirection === "desc" ? -comparison : comparison
        })
      }

      // Apply pagination
      if (options?.offset || options?.limit) {
        const start = options.offset || 0
        const end = options.limit ? start + options.limit : undefined
        records = records.slice(start, end)
      }

      // Cache results
      const cacheKey = `${tableName}-${JSON.stringify({ filter: filter?.toString(), options })}`
      dataFlowManager.set(cacheKey, records, 60000) // 1 minute cache

      return records
    } finally {
      this.releaseConnection()
      stopTimer()
    }
  }

  async selectById<T>(tableName: string, id: string): Promise<T | null> {
    const stopTimer = performanceMonitor.startTimer(`db-select-by-id-${tableName}`)

    try {
      await this.acquireConnection()
      await this.simulateLatency("select")

      const table = this.tables.get(tableName)
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`)
      }

      const record = table.get(id) || null

      // Cache individual record
      if (record) {
        dataFlowManager.set(`${tableName}-${id}`, record, 300000) // 5 minutes
      }

      return record
    } finally {
      this.releaseConnection()
      stopTimer()
    }
  }

  async insert<T extends { id: string }>(tableName: string, record: T): Promise<T> {
    const stopTimer = performanceMonitor.startTimer(`db-insert-${tableName}`)

    try {
      await this.acquireConnection()
      await this.simulateLatency("insert")

      const table = this.tables.get(tableName)
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`)
      }

      // Check for duplicate ID
      if (table.has(record.id)) {
        throw new Error(`Record with ID ${record.id} already exists`)
      }

      // Add timestamps
      const timestampedRecord = {
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      table.set(record.id, timestampedRecord)

      // Update indexes
      Object.entries(timestampedRecord).forEach(([field, value]) => {
        this.updateIndex(tableName, field, value, record.id)
      })

      // Invalidate related caches
      this.invalidateTableCache(tableName)

      // Notify subscribers
      dataFlowManager.notify(`${tableName}-${record.id}`, timestampedRecord)
      dataFlowManager.notify(`${tableName}-list`, await this.select(tableName))

      return timestampedRecord as T
    } finally {
      this.releaseConnection()
      stopTimer()
    }
  }

  async update<T extends { id: string }>(tableName: string, id: string, updates: Partial<T>): Promise<T | null> {
    const stopTimer = performanceMonitor.startTimer(`db-update-${tableName}`)

    try {
      await this.acquireConnection()
      await this.simulateLatency("update")

      const table = this.tables.get(tableName)
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`)
      }

      const existingRecord = table.get(id)
      if (!existingRecord) {
        return null
      }

      // Remove old index entries
      Object.entries(existingRecord).forEach(([field, value]) => {
        this.removeFromIndex(tableName, field, value, id)
      })

      const updatedRecord = {
        ...existingRecord,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      table.set(id, updatedRecord)

      // Add new index entries
      Object.entries(updatedRecord).forEach(([field, value]) => {
        this.updateIndex(tableName, field, value, id)
      })

      // Invalidate caches
      this.invalidateTableCache(tableName)
      dataFlowManager.set(`${tableName}-${id}`, null) // Invalidate specific record cache

      // Notify subscribers
      dataFlowManager.notify(`${tableName}-${id}`, updatedRecord)
      dataFlowManager.notify(`${tableName}-list`, await this.select(tableName))

      return updatedRecord as T
    } finally {
      this.releaseConnection()
      stopTimer()
    }
  }

  async delete(tableName: string, id: string): Promise<boolean> {
    const stopTimer = performanceMonitor.startTimer(`db-delete-${tableName}`)

    try {
      await this.acquireConnection()
      await this.simulateLatency("delete")

      const table = this.tables.get(tableName)
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`)
      }

      const existingRecord = table.get(id)
      if (!existingRecord) {
        return false
      }

      // Remove from indexes
      Object.entries(existingRecord).forEach(([field, value]) => {
        this.removeFromIndex(tableName, field, value, id)
      })

      table.delete(id)

      // Invalidate caches
      this.invalidateTableCache(tableName)
      dataFlowManager.set(`${tableName}-${id}`, null)

      // Notify subscribers
      dataFlowManager.notify(`${tableName}-${id}`, null)
      dataFlowManager.notify(`${tableName}-list`, await this.select(tableName))

      return true
    } finally {
      this.releaseConnection()
      stopTimer()
    }
  }

  // Transaction support
  async beginTransaction(): Promise<string> {
    if (!this.config.transactionSupport) {
      throw new Error("Transactions not supported")
    }

    const transactionId = crypto.randomUUID()
    this.transactions.set(transactionId, {
      id: transactionId,
      operations: [],
      rollbackData: new Map(),
    })

    return transactionId
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }

    // Transaction is automatically committed since we're using in-memory storage
    this.transactions.delete(transactionId)
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }

    // Restore rollback data
    for (const [key, data] of transaction.rollbackData.entries()) {
      const [tableName, recordId] = key.split(":")
      const table = this.tables.get(tableName)
      if (table) {
        if (data === null) {
          table.delete(recordId)
        } else {
          table.set(recordId, data)
        }
      }
    }

    this.transactions.delete(transactionId)
  }

  // Cache management
  private invalidateTableCache(tableName: string): void {
    // This would be more sophisticated in a real implementation
    dataFlowManager.cleanup()
  }

  // Maintenance operations
  private setupPeriodicMaintenance(): void {
    setInterval(() => {
      this.performMaintenance()
    }, 300000) // Every 5 minutes
  }

  private performMaintenance(): void {
    // Cleanup expired caches
    dataFlowManager.cleanup()

    // Log performance metrics
    const metrics = dataFlowManager.getQueryMetrics()
    console.log("Database Performance Metrics:", metrics)

    // Optimize indexes (placeholder for real optimization)
    this.optimizeIndexes()
  }

  private optimizeIndexes(): void {
    // In a real database, this would reorganize indexes for better performance
    // For our mock, we'll just clean up empty index entries
    for (const [indexKey, index] of this.indexes.entries()) {
      for (const [value, recordSet] of index.entries()) {
        if (recordSet.size === 0) {
          index.delete(value)
        }
      }
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; metrics: any }> {
    const startTime = performance.now()

    try {
      // Test basic operations
      await this.select("bills", undefined, { limit: 1 })

      const responseTime = performance.now() - startTime

      return {
        status: "healthy",
        metrics: {
          responseTime,
          activeConnections: this.connectionPool.active,
          maxConnections: this.connectionPool.max,
          tableCount: this.tables.size,
          indexCount: this.indexes.size,
          cacheHitRate: this.calculateCacheHitRate(),
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        metrics: {
          error: error.message,
          activeConnections: this.connectionPool.active,
        },
      }
    }
  }

  private calculateCacheHitRate(): number {
    // Simplified cache hit rate calculation
    const metrics = dataFlowManager.getQueryMetrics()
    const totalQueries = Object.values(metrics).reduce((sum, m) => sum + m.queryCount, 0)
    const avgResponseTime =
      Object.values(metrics).reduce((sum, m) => sum + m.averageTime, 0) / Object.keys(metrics).length

    // Assume faster queries indicate cache hits
    return avgResponseTime < 50 ? 0.8 : 0.3
  }
}

// Global enhanced database instance
export const enhancedMockDatabase = new EnhancedMockDatabase({
  latencySimulation: process.env.NODE_ENV === "development",
  errorSimulation: false,
  consistencyChecks: true,
  transactionSupport: true,
})
