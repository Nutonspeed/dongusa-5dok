interface MigrationConfig {
  source_database_url: string
  target_database_url: string
  batch_size: number
  parallel_workers: number
  validation_enabled: boolean
  backup_enabled: boolean
}

interface MigrationResult {
  table: string
  total_rows: number
  migrated_rows: number
  failed_rows: number
  duration: number
  errors: string[]
}

interface DataValidationResult {
  table: string
  source_count: number
  target_count: number
  data_integrity_check: boolean
  foreign_key_check: boolean
  constraint_check: boolean
  errors: string[]
}

class CRMDataMigration {
  private config: MigrationConfig
  private migrationResults: MigrationResult[] = []

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      source_database_url: config.source_database_url || process.env.SOURCE_DATABASE_URL || "",
      target_database_url: config.target_database_url || process.env.CRM_DATABASE_URL || "",
      batch_size: config.batch_size || 1000,
      parallel_workers: config.parallel_workers || 4,
      validation_enabled: config.validation_enabled ?? true,
      backup_enabled: config.backup_enabled ?? true,
    }
  }

  async executeMigration(): Promise<{
    success: boolean
    results: MigrationResult[]
    validation_results?: DataValidationResult[]
  }> {
    console.log("Starting CRM data migration...")

    try {
      // Step 1: Create backup if enabled
      if (this.config.backup_enabled) {
        await this.createBackup()
      }

      // Step 2: Prepare target database
      await this.prepareTargetDatabase()

      // Step 3: Migrate data tables in dependency order
      const migrationOrder = [
        "customers",
        "customer_profiles",
        "customer_segments",
        "customer_segment_mappings",
        "customer_interactions",
        "customer_journey_stages",
        "customer_tags",
        "communication_preferences",
      ]

      for (const table of migrationOrder) {
        const result = await this.migrateTable(table)
        this.migrationResults.push(result)

        if (result.failed_rows > 0) {
          console.warn(`Migration of ${table} completed with ${result.failed_rows} failed rows`)
        }
      }

      // Step 4: Validate migration if enabled
      let validationResults: DataValidationResult[] = []
      if (this.config.validation_enabled) {
        validationResults = await this.validateMigration()
      }

      // Step 5: Update sequences and indexes
      await this.updateSequencesAndIndexes()

      const totalFailed = this.migrationResults.reduce((sum, result) => sum + result.failed_rows, 0)
      const success = totalFailed === 0

      console.log(`Migration completed. Success: ${success}, Total failed rows: ${totalFailed}`)

      return {
        success,
        results: this.migrationResults,
        validation_results: validationResults,
      }
    } catch (error) {
      console.error("Migration failed:", error)
      throw error
    }
  }

  private async createBackup(): Promise<void> {
    console.log("Creating database backup...")

    // Simulate backup creation
    const backupTables = ["customers", "customer_profiles", "customer_interactions"]

    for (const table of backupTables) {
      console.log(`Backing up table: ${table}`)
      // In real implementation, use pg_dump or similar
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log("Backup completed")
  }

  private async prepareTargetDatabase(): Promise<void> {
    console.log("Preparing target database...")

    // Create tables with proper schema
    const createTableStatements = [
      `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS customer_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        total_spent DECIMAL(12,2) DEFAULT 0,
        order_count INTEGER DEFAULT 0,
        last_order_date TIMESTAMP WITH TIME ZONE,
        loyalty_tier VARCHAR(20) DEFAULT 'bronze',
        loyalty_points INTEGER DEFAULT 0,
        lifetime_value DECIMAL(12,2) DEFAULT 0,
        churn_risk_score DECIMAL(5,2) DEFAULT 0,
        preferred_categories JSONB,
        communication_preferences JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS customer_segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        criteria JSONB NOT NULL,
        color VARCHAR(7) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS customer_segment_mappings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        assigned_by UUID,
        UNIQUE(customer_id, segment_id)
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS customer_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        subject VARCHAR(255),
        content TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID
      );
      `,
    ]

    for (const statement of createTableStatements) {
      console.log("Executing table creation...")
      // In real implementation, execute SQL statements
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Create indexes
    const indexStatements = [
      "CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);",
      "CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);",
      "CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_id ON customer_profiles(customer_id);",
      "CREATE INDEX IF NOT EXISTS idx_customer_profiles_total_spent ON customer_profiles(total_spent);",
      "CREATE INDEX IF NOT EXISTS idx_customer_profiles_loyalty_tier ON customer_profiles(loyalty_tier);",
      "CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);",
      "CREATE INDEX IF NOT EXISTS idx_customer_interactions_type ON customer_interactions(type);",
      "CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_at ON customer_interactions(created_at);",
    ]

    for (const statement of indexStatements) {
      console.log("Creating index...")
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    console.log("Target database prepared")
  }

  private async migrateTable(tableName: string): Promise<MigrationResult> {
    console.log(`Migrating table: ${tableName}`)
    const startTime = Date.now()

    try {
      // Get total row count from source
      const totalRows = await this.getSourceRowCount(tableName)
      console.log(`Total rows to migrate for ${tableName}: ${totalRows}`)

      let migratedRows = 0
      let failedRows = 0
      const errors: string[] = []

      // Process in batches
      const totalBatches = Math.ceil(totalRows / this.config.batch_size)

      for (let batch = 0; batch < totalBatches; batch++) {
        const offset = batch * this.config.batch_size
        console.log(`Processing batch ${batch + 1}/${totalBatches} for ${tableName}`)

        try {
          const batchResult = await this.migrateBatch(tableName, offset, this.config.batch_size)
          migratedRows += batchResult.success_count
          failedRows += batchResult.failed_count
          errors.push(...batchResult.errors)
        } catch (error) {
          console.error(`Batch ${batch + 1} failed for ${tableName}:`, error)
          const errMsg = error instanceof Error ? error.message : String(error)
          errors.push(`Batch ${batch + 1}: ${errMsg}`)
          failedRows += this.config.batch_size
        }
      }

      const duration = Date.now() - startTime

      return {
        table: tableName,
        total_rows: totalRows,
        migrated_rows: migratedRows,
        failed_rows: failedRows,
        duration,
        errors,
      }
    } catch (error) {
      console.error(`Failed to migrate table ${tableName}:`, error)
      const errMsg = error instanceof Error ? error.message : String(error)
      return {
        table: tableName,
        total_rows: 0,
        migrated_rows: 0,
        failed_rows: 0,
        duration: Date.now() - startTime,
        errors: [errMsg],
      }
    }
  }

  private async getSourceRowCount(tableName: string): Promise<number> {
    // Simulate getting row count from source database
    const mockCounts: Record<string, number> = {
      customers: 1250,
      customer_profiles: 1250,
      customer_segments: 8,
      customer_segment_mappings: 3200,
      customer_interactions: 8500,
      customer_journey_stages: 4200,
      customer_tags: 2100,
      communication_preferences: 1100,
    }

    return mockCounts[tableName] || 0
  }

  private async migrateBatch(
    tableName: string,
    offset: number,
    limit: number,
  ): Promise<{ success_count: number; failed_count: number; errors: string[] }> {
    // Simulate batch migration
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    // Simulate some failures (5% failure rate)
    const failureRate = 0.05
    const actualBatchSize = Math.min(limit, (await this.getSourceRowCount(tableName)) - offset)
    const failedCount = Math.floor(actualBatchSize * failureRate)
    const successCount = actualBatchSize - failedCount

    const errors: string[] = []
    if (failedCount > 0) {
      errors.push(`${failedCount} rows failed validation in batch starting at offset ${offset}`)
    }

    return {
      success_count: successCount,
      failed_count: failedCount,
      errors,
    }
  }

  private async validateMigration(): Promise<DataValidationResult[]> {
    console.log("Validating migration...")

    const results: DataValidationResult[] = []
    const tables = ["customers", "customer_profiles", "customer_segments", "customer_interactions"]

    for (const table of tables) {
      console.log(`Validating table: ${table}`)

      const sourceCount = await this.getSourceRowCount(table)
      const targetCount = await this.getTargetRowCount(table)

      // Simulate validation checks
      const dataIntegrityCheck = sourceCount === targetCount
      const foreignKeyCheck = await this.validateForeignKeys(table)
      const constraintCheck = await this.validateConstraints(table)

      const errors: string[] = []
      if (!dataIntegrityCheck) {
        errors.push(`Row count mismatch: source=${sourceCount}, target=${targetCount}`)
      }
      if (!foreignKeyCheck) {
        errors.push("Foreign key constraint violations detected")
      }
      if (!constraintCheck) {
        errors.push("Data constraint violations detected")
      }

      results.push({
        table,
        source_count: sourceCount,
        target_count: targetCount,
        data_integrity_check: dataIntegrityCheck,
        foreign_key_check: foreignKeyCheck,
        constraint_check: constraintCheck,
        errors,
      })
    }

    return results
  }

  private async getTargetRowCount(tableName: string): Promise<number> {
    // Simulate getting row count from target database
    // In real implementation, this would query the target database
    const sourceCount = await this.getSourceRowCount(tableName)
    // Simulate 95% success rate
    return Math.floor(sourceCount * 0.95)
  }

  private async validateForeignKeys(tableName: string): Promise<boolean> {
    // Simulate foreign key validation
    await new Promise((resolve) => setTimeout(resolve, 300))
    return Math.random() > 0.1 // 90% success rate
  }

  private async validateConstraints(tableName: string): Promise<boolean> {
    // Simulate constraint validation
    await new Promise((resolve) => setTimeout(resolve, 200))
    return Math.random() > 0.05 // 95% success rate
  }

  private async updateSequencesAndIndexes(): Promise<void> {
    console.log("Updating sequences and rebuilding indexes...")

    // Update sequences to current max values
    const sequenceUpdates = [
      "SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));",
      "SELECT setval('customer_profiles_id_seq', (SELECT MAX(id) FROM customer_profiles));",
      "SELECT setval('customer_segments_id_seq', (SELECT MAX(id) FROM customer_segments));",
    ]

    for (const update of sequenceUpdates) {
      console.log("Updating sequence...")
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Rebuild indexes for optimal performance
    const indexRebuild = [
      "REINDEX TABLE customers;",
      "REINDEX TABLE customer_profiles;",
      "REINDEX TABLE customer_interactions;",
    ]

    for (const rebuild of indexRebuild) {
      console.log("Rebuilding index...")
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Update table statistics
    console.log("Updating table statistics...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Sequences and indexes updated")
  }

  // Rollback functionality
  async rollbackMigration(): Promise<void> {
    console.log("Rolling back migration...")

    try {
      // Drop migrated tables
      const dropStatements = [
        "DROP TABLE IF EXISTS customer_interactions CASCADE;",
        "DROP TABLE IF EXISTS customer_segment_mappings CASCADE;",
        "DROP TABLE IF EXISTS customer_segments CASCADE;",
        "DROP TABLE IF EXISTS customer_profiles CASCADE;",
        "DROP TABLE IF EXISTS customers CASCADE;",
      ]

      for (const statement of dropStatements) {
        console.log("Dropping table...")
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Restore from backup if available
      if (this.config.backup_enabled) {
        await this.restoreFromBackup()
      }

      console.log("Rollback completed")
    } catch (error) {
      console.error("Rollback failed:", error)
      throw error
    }
  }

  private async restoreFromBackup(): Promise<void> {
    console.log("Restoring from backup...")
    // Simulate backup restoration
    await new Promise((resolve) => setTimeout(resolve, 3000))
    console.log("Backup restored")
  }

  // Progress monitoring
  getMigrationProgress(): {
    completed_tables: number
    total_tables: number
    current_table?: string
    overall_progress: number
  } {
    const totalTables = 8 // Total number of tables to migrate
    const completedTables = this.migrationResults.length

    return {
      completed_tables: completedTables,
      total_tables: totalTables,
      current_table: completedTables < totalTables ? `Table ${completedTables + 1}` : undefined,
      overall_progress: (completedTables / totalTables) * 100,
    }
  }

  getMigrationResults(): MigrationResult[] {
    return [...this.migrationResults]
  }
}

export const crmDataMigration = new CRMDataMigration()
export { CRMDataMigration }
export type { MigrationConfig, MigrationResult, DataValidationResult }
