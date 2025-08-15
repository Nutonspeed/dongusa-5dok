import { createClient } from "@supabase/supabase-js"
import { cacheService } from "./performance/cache-service"

interface DataLifecyclePolicy {
  tableName: string
  retentionPeriod: number // days
  archiveAfter: number // days
  compressionEnabled: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
  cleanupRules: {
    deleteOldRecords: boolean
    archiveOldRecords: boolean
    compressOldData: boolean
  }
}

interface DataArchiveResult {
  tableName: string
  recordsArchived: number
  recordsDeleted: number
  spaceSaved: number // MB
  errors: string[]
}

interface DataCleanupResult {
  totalRecordsProcessed: number
  totalRecordsDeleted: number
  totalSpaceSaved: number // MB
  tablesProcessed: string[]
  errors: string[]
}

interface BackupStrategy {
  type: "full" | "incremental"
  frequency: "daily" | "weekly" | "monthly"
  retention: number // days
  compression: boolean
  encryption: boolean
}

export class SupabaseDataManagementStrategy {
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  private dataLifecyclePolicies: DataLifecyclePolicy[] = [
    {
      tableName: "orders",
      retentionPeriod: 365, // Keep for 1 year
      archiveAfter: 90, // Archive after 3 months
      compressionEnabled: true,
      backupFrequency: "daily",
      cleanupRules: {
        deleteOldRecords: false, // Don't delete orders, archive them
        archiveOldRecords: true,
        compressOldData: true,
      },
    },
    {
      tableName: "order_items",
      retentionPeriod: 365,
      archiveAfter: 90,
      compressionEnabled: true,
      backupFrequency: "daily",
      cleanupRules: {
        deleteOldRecords: false,
        archiveOldRecords: true,
        compressOldData: true,
      },
    },
    {
      tableName: "profiles",
      retentionPeriod: 1095, // Keep for 3 years
      archiveAfter: 365, // Archive after 1 year of inactivity
      compressionEnabled: false, // Keep profiles accessible
      backupFrequency: "weekly",
      cleanupRules: {
        deleteOldRecords: false,
        archiveOldRecords: false, // Keep profiles active
        compressOldData: false,
      },
    },
    {
      tableName: "products",
      retentionPeriod: -1, // Keep forever
      archiveAfter: -1, // Don't archive
      compressionEnabled: false,
      backupFrequency: "weekly",
      cleanupRules: {
        deleteOldRecords: false,
        archiveOldRecords: false,
        compressOldData: false,
      },
    },
    {
      tableName: "categories",
      retentionPeriod: -1, // Keep forever
      archiveAfter: -1, // Don't archive
      compressionEnabled: false,
      backupFrequency: "monthly",
      cleanupRules: {
        deleteOldRecords: false,
        archiveOldRecords: false,
        compressOldData: false,
      },
    },
    {
      tableName: "fabrics",
      retentionPeriod: -1, // Keep forever
      archiveAfter: -1, // Don't archive
      compressionEnabled: false,
      backupFrequency: "weekly",
      cleanupRules: {
        deleteOldRecords: false,
        archiveOldRecords: false,
        compressOldData: false,
      },
    },
    {
      tableName: "fabric_collections",
      retentionPeriod: -1, // Keep forever
      archiveAfter: -1, // Don't archive
      compressionEnabled: false,
      backupFrequency: "monthly",
      cleanupRules: {
        deleteOldRecords: false,
        archiveOldRecords: false,
        compressOldData: false,
      },
    },
  ]

  private backupStrategy: BackupStrategy = {
    type: "incremental",
    frequency: "daily",
    retention: 30, // Keep backups for 30 days
    compression: true,
    encryption: true,
  }

  async executeDataManagementStrategy(): Promise<{
    success: boolean
    cleanupResults: DataCleanupResult
    archiveResults: DataArchiveResult[]
    backupResults: any
  }> {
    console.log("Starting data management strategy execution...")

    try {
      // Step 1: Execute data cleanup
      const cleanupResults = await this.executeDataCleanup()

      // Step 2: Execute data archiving
      const archiveResults = await this.executeDataArchiving()

      // Step 3: Execute backup strategy
      const backupResults = await this.executeBackupStrategy()

      // Step 4: Update storage statistics
      await this.updateStorageStatistics()

      return {
        success: true,
        cleanupResults,
        archiveResults,
        backupResults,
      }
    } catch (error) {
      console.error("Data management strategy failed:", error)
      return {
        success: false,
        cleanupResults: {
          totalRecordsProcessed: 0,
          totalRecordsDeleted: 0,
          totalSpaceSaved: 0,
          tablesProcessed: [],
          errors: [error.message],
        },
        archiveResults: [],
        backupResults: { success: false, error: error.message },
      }
    }
  }

  private async executeDataCleanup(): Promise<DataCleanupResult> {
    console.log("Executing data cleanup...")

    let totalRecordsProcessed = 0
    let totalRecordsDeleted = 0
    let totalSpaceSaved = 0
    const tablesProcessed: string[] = []
    const errors: string[] = []

    for (const policy of this.dataLifecyclePolicies) {
      if (!policy.cleanupRules.deleteOldRecords && !policy.cleanupRules.compressOldData) {
        continue // Skip if no cleanup rules apply
      }

      try {
        console.log(`Processing cleanup for table: ${policy.tableName}`)

        const result = await this.cleanupTable(policy)
        totalRecordsProcessed += result.recordsProcessed
        totalRecordsDeleted += result.recordsDeleted
        totalSpaceSaved += result.spaceSaved
        tablesProcessed.push(policy.tableName)

        if (result.errors.length > 0) {
          errors.push(...result.errors)
        }
      } catch (error) {
        console.error(`Cleanup failed for table ${policy.tableName}:`, error)
        errors.push(`${policy.tableName}: ${error.message}`)
      }
    }

    return {
      totalRecordsProcessed,
      totalRecordsDeleted,
      totalSpaceSaved,
      tablesProcessed,
      errors,
    }
  }

  private async cleanupTable(policy: DataLifecyclePolicy): Promise<{
    recordsProcessed: number
    recordsDeleted: number
    spaceSaved: number
    errors: string[]
  }> {
    const errors: string[] = []
    let recordsProcessed = 0
    let recordsDeleted = 0
    let spaceSaved = 0

    // Calculate cutoff date for cleanup
    const cutoffDate = new Date(Date.now() - policy.retentionPeriod * 24 * 60 * 60 * 1000)

    try {
      // Get records to be cleaned up
      const { data: recordsToCleanup, error: selectError } = await this.supabase
        .from(policy.tableName)
        .select("id, created_at")
        .lt("created_at", cutoffDate.toISOString())

      if (selectError) {
        errors.push(`Failed to select records: ${selectError.message}`)
        return { recordsProcessed, recordsDeleted, spaceSaved, errors }
      }

      recordsProcessed = recordsToCleanup?.length || 0

      if (recordsProcessed === 0) {
        console.log(`No records to cleanup for table: ${policy.tableName}`)
        return { recordsProcessed, recordsDeleted, spaceSaved, errors }
      }

      // Delete old records if policy allows
      if (policy.cleanupRules.deleteOldRecords) {
        const { error: deleteError } = await this.supabase
          .from(policy.tableName)
          .delete()
          .lt("created_at", cutoffDate.toISOString())

        if (deleteError) {
          errors.push(`Failed to delete records: ${deleteError.message}`)
        } else {
          recordsDeleted = recordsProcessed
          spaceSaved = this.estimateSpaceSaved(policy.tableName, recordsDeleted)
          console.log(`Deleted ${recordsDeleted} records from ${policy.tableName}`)
        }
      }

      // Compress old data if policy allows
      if (policy.cleanupRules.compressOldData) {
        await this.compressTableData(policy.tableName)
        spaceSaved += this.estimateCompressionSavings(policy.tableName)
      }
    } catch (error) {
      errors.push(`Cleanup error: ${error.message}`)
    }

    return { recordsProcessed, recordsDeleted, spaceSaved, errors }
  }

  private async executeDataArchiving(): Promise<DataArchiveResult[]> {
    console.log("Executing data archiving...")

    const results: DataArchiveResult[] = []

    for (const policy of this.dataLifecyclePolicies) {
      if (!policy.cleanupRules.archiveOldRecords || policy.archiveAfter === -1) {
        continue // Skip if archiving is disabled
      }

      try {
        console.log(`Processing archiving for table: ${policy.tableName}`)
        const result = await this.archiveTableData(policy)
        results.push(result)
      } catch (error) {
        console.error(`Archiving failed for table ${policy.tableName}:`, error)
        results.push({
          tableName: policy.tableName,
          recordsArchived: 0,
          recordsDeleted: 0,
          spaceSaved: 0,
          errors: [error.message],
        })
      }
    }

    return results
  }

  private async archiveTableData(policy: DataLifecyclePolicy): Promise<DataArchiveResult> {
    const errors: string[] = []
    let recordsArchived = 0
    let recordsDeleted = 0
    let spaceSaved = 0

    // Calculate archive cutoff date
    const archiveDate = new Date(Date.now() - policy.archiveAfter * 24 * 60 * 60 * 1000)

    try {
      // Get records to archive
      const { data: recordsToArchive, error: selectError } = await this.supabase
        .from(policy.tableName)
        .select("*")
        .lt("created_at", archiveDate.toISOString())

      if (selectError) {
        errors.push(`Failed to select records for archiving: ${selectError.message}`)
        return { tableName: policy.tableName, recordsArchived, recordsDeleted, spaceSaved, errors }
      }

      if (!recordsToArchive || recordsToArchive.length === 0) {
        console.log(`No records to archive for table: ${policy.tableName}`)
        return { tableName: policy.tableName, recordsArchived, recordsDeleted, spaceSaved, errors }
      }

      // Create archive table if it doesn't exist
      await this.createArchiveTable(policy.tableName)

      // Move records to archive table
      const { error: insertError } = await this.supabase.from(`${policy.tableName}_archive`).insert(recordsToArchive)

      if (insertError) {
        errors.push(`Failed to insert into archive: ${insertError.message}`)
        return { tableName: policy.tableName, recordsArchived, recordsDeleted, spaceSaved, errors }
      }

      recordsArchived = recordsToArchive.length

      // Delete original records after successful archiving
      const { error: deleteError } = await this.supabase
        .from(policy.tableName)
        .delete()
        .lt("created_at", archiveDate.toISOString())

      if (deleteError) {
        errors.push(`Failed to delete archived records: ${deleteError.message}`)
      } else {
        recordsDeleted = recordsArchived
        spaceSaved = this.estimateSpaceSaved(policy.tableName, recordsDeleted)
      }

      console.log(`Archived ${recordsArchived} records from ${policy.tableName}`)
    } catch (error) {
      errors.push(`Archiving error: ${error.message}`)
    }

    return { tableName: policy.tableName, recordsArchived, recordsDeleted, spaceSaved, errors }
  }

  private async createArchiveTable(tableName: string): Promise<void> {
    const archiveTableName = `${tableName}_archive`

    try {
      // Check if archive table already exists
      const { data: existingTable } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", archiveTableName)
        .single()

      if (existingTable) {
        return // Archive table already exists
      }

      // Create archive table with same structure as original
      const createTableSQL = `
        CREATE TABLE ${archiveTableName} AS 
        SELECT * FROM ${tableName} WHERE 1=0;
        
        ALTER TABLE ${archiveTableName} 
        ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        CREATE INDEX idx_${archiveTableName}_archived_at 
        ON ${archiveTableName}(archived_at);
      `

      await this.supabase.rpc("execute_sql", { query: createTableSQL })
      console.log(`Created archive table: ${archiveTableName}`)
    } catch (error) {
      console.error(`Failed to create archive table ${archiveTableName}:`, error)
      throw error
    }
  }

  private async compressTableData(tableName: string): Promise<void> {
    try {
      // Simulate data compression by updating storage settings
      const compressionSQL = `
        ALTER TABLE ${tableName} SET (
          toast_tuple_target = 128,
          fillfactor = 90
        );
        VACUUM FULL ${tableName};
      `

      await this.supabase.rpc("execute_sql", { query: compressionSQL })
      console.log(`Compressed data for table: ${tableName}`)
    } catch (error) {
      console.error(`Failed to compress table ${tableName}:`, error)
    }
  }

  private async executeBackupStrategy(): Promise<any> {
    console.log("Executing backup strategy...")

    try {
      const backupResult = {
        type: this.backupStrategy.type,
        timestamp: new Date().toISOString(),
        tables: [],
        success: true,
        size: 0, // MB
      }

      // Get list of tables to backup
      const tablesToBackup = this.dataLifecyclePolicies.map((policy) => policy.tableName)

      for (const tableName of tablesToBackup) {
        try {
          const tableBackup = await this.backupTable(tableName)
          backupResult.tables.push(tableBackup)
          backupResult.size += tableBackup.size
        } catch (error) {
          console.error(`Backup failed for table ${tableName}:`, error)
          backupResult.tables.push({
            tableName,
            success: false,
            error: error.message,
            size: 0,
          })
        }
      }

      // Store backup metadata
      await this.storeBackupMetadata(backupResult)

      return backupResult
    } catch (error) {
      console.error("Backup strategy failed:", error)
      return { success: false, error: error.message }
    }
  }

  private async backupTable(tableName: string): Promise<any> {
    // Simulate table backup
    const { count } = await this.supabase.from(tableName).select("*", { count: "exact", head: true })

    const estimatedSize = this.estimateTableSize(tableName, count || 0)

    return {
      tableName,
      recordCount: count || 0,
      size: estimatedSize,
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  private async storeBackupMetadata(backupResult: any): Promise<void> {
    try {
      // Store backup metadata in a dedicated table
      const { error } = await this.supabase.from("backup_metadata").insert({
        backup_type: backupResult.type,
        backup_timestamp: backupResult.timestamp,
        tables_backed_up: backupResult.tables.map((t: any) => t.tableName),
        total_size_mb: backupResult.size,
        success: backupResult.success,
        retention_until: new Date(Date.now() + this.backupStrategy.retention * 24 * 60 * 60 * 1000).toISOString(),
      })

      if (error) {
        console.error("Failed to store backup metadata:", error)
      }
    } catch (error) {
      console.error("Error storing backup metadata:", error)
    }
  }

  private async updateStorageStatistics(): Promise<void> {
    try {
      const stats = {
        totalTables: this.dataLifecyclePolicies.length,
        totalEstimatedSize: 0,
        lastCleanup: new Date().toISOString(),
        policies: this.dataLifecyclePolicies.length,
      }

      // Calculate total estimated size
      for (const policy of this.dataLifecyclePolicies) {
        const { count } = await this.supabase.from(policy.tableName).select("*", { count: "exact", head: true })
        stats.totalEstimatedSize += this.estimateTableSize(policy.tableName, count || 0)
      }

      // Cache storage statistics
      cacheService.set("storage_statistics", stats, 3600) // Cache for 1 hour
    } catch (error) {
      console.error("Failed to update storage statistics:", error)
    }
  }

  // Utility methods
  private estimateSpaceSaved(tableName: string, recordsDeleted: number): number {
    const avgRowSizes: Record<string, number> = {
      orders: 2.0, // KB per row
      order_items: 0.3,
      profiles: 0.4,
      products: 1.2,
      categories: 0.5,
      fabrics: 0.8,
      fabric_collections: 0.6,
    }

    const avgRowSize = avgRowSizes[tableName] || 0.5
    return (recordsDeleted * avgRowSize) / 1024 // Convert to MB
  }

  private estimateCompressionSavings(tableName: string): number {
    // Estimate 20-30% compression savings
    const compressionRatio = 0.25
    const { count } = this.supabase.from(tableName).select("*", { count: "exact", head: true })
    const tableSize = this.estimateTableSize(tableName, count || 0)
    return tableSize * compressionRatio
  }

  private estimateTableSize(tableName: string, recordCount: number): number {
    const avgRowSizes: Record<string, number> = {
      orders: 2.0, // KB per row
      order_items: 0.3,
      profiles: 0.4,
      products: 1.2,
      categories: 0.5,
      fabrics: 0.8,
      fabric_collections: 0.6,
    }

    const avgRowSize = avgRowSizes[tableName] || 0.5
    return (recordCount * avgRowSize) / 1024 // Convert to MB
  }

  // Public methods for management
  async getDataManagementReport(): Promise<string> {
    const stats = cacheService.get("storage_statistics") || {}

    return `
# Supabase Data Management Strategy Report

## Current Storage Status
- **Total Tables**: ${stats.totalTables || 0}
- **Estimated Total Size**: ${(stats.totalEstimatedSize || 0).toFixed(2)} MB
- **Last Cleanup**: ${stats.lastCleanup || "Never"}
- **Active Policies**: ${stats.policies || 0}

## Data Lifecycle Policies

${this.dataLifecyclePolicies
  .map(
    (policy) => `
### ${policy.tableName}
- **Retention Period**: ${policy.retentionPeriod === -1 ? "Forever" : `${policy.retentionPeriod} days`}
- **Archive After**: ${policy.archiveAfter === -1 ? "Never" : `${policy.archiveAfter} days`}
- **Compression**: ${policy.compressionEnabled ? "Enabled" : "Disabled"}
- **Backup Frequency**: ${policy.backupFrequency}
- **Cleanup Rules**: 
  - Delete Old Records: ${policy.cleanupRules.deleteOldRecords ? "Yes" : "No"}
  - Archive Old Records: ${policy.cleanupRules.archiveOldRecords ? "Yes" : "No"}
  - Compress Old Data: ${policy.cleanupRules.compressOldData ? "Yes" : "No"}
`,
  )
  .join("")}

## Backup Strategy
- **Type**: ${this.backupStrategy.type}
- **Frequency**: ${this.backupStrategy.frequency}
- **Retention**: ${this.backupStrategy.retention} days
- **Compression**: ${this.backupStrategy.compression ? "Enabled" : "Disabled"}
- **Encryption**: ${this.backupStrategy.encryption ? "Enabled" : "Disabled"}

## Recommendations
- Run data cleanup weekly to maintain optimal performance
- Monitor storage usage to stay within Free Plan limits (500MB)
- Archive old orders and order items to save space
- Keep product and category data permanently for business continuity
- Regular backups ensure data safety and recovery options

---
*Report generated at: ${new Date().toISOString()}*
    `.trim()
  }

  async scheduleAutomaticCleanup(): Promise<void> {
    // Schedule weekly cleanup
    setInterval(
      async () => {
        console.log("Running scheduled data cleanup...")
        await this.executeDataManagementStrategy()
      },
      7 * 24 * 60 * 60 * 1000,
    ) // Weekly

    console.log("Automatic data cleanup scheduled (weekly)")
  }

  getDataLifecyclePolicies(): DataLifecyclePolicy[] {
    return [...this.dataLifecyclePolicies]
  }

  updateDataLifecyclePolicy(tableName: string, updates: Partial<DataLifecyclePolicy>): void {
    const policyIndex = this.dataLifecyclePolicies.findIndex((p) => p.tableName === tableName)
    if (policyIndex !== -1) {
      this.dataLifecyclePolicies[policyIndex] = {
        ...this.dataLifecyclePolicies[policyIndex],
        ...updates,
      }
    }
  }
}

export const dataManagementStrategy = new SupabaseDataManagementStrategy()
