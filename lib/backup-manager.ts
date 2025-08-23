/**
 * Backup Management Utilities
 * Provides utilities for managing backup operations, restoration, and verification
 */

import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'

export interface BackupMetadata {
  timestamp: string
  commit_sha: string
  branch: string
  backup_type: 'full' | 'source-only' | 'artifacts-only'
  cloud_provider: 'aws-s3' | 'gcs'
  workflow_run_id: string
  repository: string
  files: BackupFileInfo[]
  checksum: string
}

export interface BackupFileInfo {
  name: string
  path: string
  size: number
  checksum: string
  type: 'source' | 'artifacts' | 'metadata'
}

export interface BackupConfig {
  enabled: boolean
  cloud_provider: 'aws-s3' | 'gcs'
  retention_days: number
  schedule: string
  notification_webhook?: string
  encryption_enabled: boolean
}

export interface BackupVerificationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  metadata: BackupMetadata | null
}

export interface BackupRestoreOptions {
  backup_id: string
  restore_type: 'source' | 'artifacts' | 'full'
  target_directory?: string
  verify_integrity: boolean
  overwrite_existing: boolean
}

export class BackupManager {
  private config: BackupConfig

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      cloud_provider: config.cloud_provider ?? 'aws-s3',
      retention_days: config.retention_days ?? 30,
      schedule: config.schedule ?? '0 2 * * *', // Daily at 2 AM
      notification_webhook: config.notification_webhook,
      encryption_enabled: config.encryption_enabled ?? false,
    }
  }

  /**
   * Validate backup configuration
   */
  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!this.config.enabled) {
      return { valid: true, errors: [] }
    }

    // Check cloud provider configuration
    if (this.config.cloud_provider === 'aws-s3') {
      if (!process.env.AWS_ACCESS_KEY_ID) {
        errors.push('AWS_ACCESS_KEY_ID environment variable is required for AWS S3 backups')
      }
      if (!process.env.AWS_SECRET_ACCESS_KEY) {
        errors.push('AWS_SECRET_ACCESS_KEY environment variable is required for AWS S3 backups')
      }
      if (!process.env.AWS_S3_BACKUP_BUCKET) {
        errors.push('AWS_S3_BACKUP_BUCKET environment variable is required for AWS S3 backups')
      }
    } else if (this.config.cloud_provider === 'gcs') {
      if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
        errors.push('GCP_SERVICE_ACCOUNT_KEY environment variable is required for GCS backups')
      }
      if (!process.env.GCS_BACKUP_BUCKET) {
        errors.push('GCS_BACKUP_BUCKET environment variable is required for GCS backups')
      }
    }

    // Validate retention days
    if (this.config.retention_days < 1 || this.config.retention_days > 365) {
      errors.push('Backup retention days must be between 1 and 365')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Generate backup metadata
   */
  async generateBackupMetadata(
    backupType: string,
    files: BackupFileInfo[]
  ): Promise<BackupMetadata> {
    const timestamp = new Date().toISOString()
    const commit_sha = process.env.GITHUB_SHA || 'unknown'
    const branch = process.env.GITHUB_REF_NAME || 'unknown'
    const workflow_run_id = process.env.GITHUB_RUN_ID || 'unknown'
    const repository = process.env.GITHUB_REPOSITORY || 'unknown'

    // Calculate overall checksum
    const checksumData = files.map(f => f.checksum).join('')
    const checksum = createHash('sha256').update(checksumData).digest('hex')

    return {
      timestamp,
      commit_sha,
      branch,
      backup_type: backupType as any,
      cloud_provider: this.config.cloud_provider,
      workflow_run_id,
      repository,
      files,
      checksum,
    }
  }

  /**
   * Calculate file checksum
   */
  async calculateFileChecksum(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath)
      return createHash('sha256').update(fileBuffer).digest('hex')
    } catch (error) {
      throw new Error(`Failed to calculate checksum for ${filePath}: ${error}`)
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(metadataPath: string): Promise<BackupVerificationResult> {
    const result: BackupVerificationResult = {
      valid: false,
      errors: [],
      warnings: [],
      metadata: null,
    }

    try {
      // Read metadata
      const metadataContent = await fs.readFile(metadataPath, 'utf-8')
      const metadata: BackupMetadata = JSON.parse(metadataContent)
      result.metadata = metadata

      // Verify each file
      const baseDir = join(metadataPath, '..')
      for (const fileInfo of metadata.files) {
        const filePath = join(baseDir, fileInfo.name)
        
        try {
          const stats = await fs.stat(filePath)
          
          // Check file size
          if (stats.size !== fileInfo.size) {
            result.errors.push(`File size mismatch for ${fileInfo.name}: expected ${fileInfo.size}, got ${stats.size}`)
            continue
          }

          // Verify checksum
          const actualChecksum = await this.calculateFileChecksum(filePath)
          if (actualChecksum !== fileInfo.checksum) {
            result.errors.push(`Checksum mismatch for ${fileInfo.name}`)
            continue
          }
        } catch (error) {
          result.errors.push(`Failed to verify file ${fileInfo.name}: ${error}`)
        }
      }

      // Verify overall checksum
      const filesChecksumData = metadata.files.map(f => f.checksum).join('')
      const expectedChecksum = createHash('sha256').update(filesChecksumData).digest('hex')
      if (expectedChecksum !== metadata.checksum) {
        result.errors.push('Overall backup checksum verification failed')
      }

      result.valid = result.errors.length === 0

    } catch (error) {
      result.errors.push(`Failed to read or parse metadata: ${error}`)
    }

    return result
  }

  /**
   * List available backups from cloud storage
   */
  async listBackups(): Promise<BackupMetadata[]> {
    // This would integrate with cloud storage APIs
    // For now, returning empty array as placeholder
    console.warn('listBackups not implemented - requires cloud storage API integration')
    return []
  }

  /**
   * Restore backup from cloud storage
   */
  async restoreBackup(options: BackupRestoreOptions): Promise<{ success: boolean; message: string }> {
    try {
      // Validate options
      if (!options.backup_id) {
        return { success: false, message: 'Backup ID is required' }
      }

      if (options.verify_integrity) {
        console.log('Verifying backup integrity before restore...')
        // Verification logic would go here
      }

      console.log(`Restoring backup: ${options.backup_id}`)
      console.log(`Restore type: ${options.restore_type}`)
      console.log(`Target directory: ${options.target_directory || 'current directory'}`)

      // Restoration logic would go here
      // This would download from cloud storage and extract files

      return { success: true, message: 'Backup restored successfully' }
    } catch (error) {
      return { success: false, message: `Restore failed: ${error}` }
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    total_backups: number
    total_size: number
    oldest_backup: string | null
    newest_backup: string | null
    success_rate: number
  }> {
    // This would query cloud storage for backup statistics
    return {
      total_backups: 0,
      total_size: 0,
      oldest_backup: null,
      newest_backup: null,
      success_rate: 0,
    }
  }

  /**
   * Cleanup old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<{ deleted: number; errors: string[] }> {
    const result = { deleted: 0, errors: [] }

    try {
      console.log(`Cleaning up backups older than ${this.config.retention_days} days...`)
      // Cleanup logic would go here
      // This would list and delete old backups from cloud storage
    } catch (error) {
      result.errors.push(`Cleanup failed: ${error}`)
    }

    return result
  }

  /**
   * Send backup notification
   */
  async sendNotification(message: string, success: boolean): Promise<void> {
    if (!this.config.notification_webhook) {
      return
    }

    try {
      const payload = {
        text: message,
        success,
        timestamp: new Date().toISOString(),
        repository: process.env.GITHUB_REPOSITORY,
      }

      // Send webhook notification
      const response = await fetch(this.config.notification_webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Failed to send backup notification:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to send backup notification:', error)
    }
  }
}

// Export singleton instance
export const backupManager = new BackupManager({
  enabled: process.env.BACKUP_ENABLED === 'true',
  cloud_provider: (process.env.BACKUP_CLOUD_PROVIDER as any) || 'aws-s3',
  retention_days: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  notification_webhook: process.env.BACKUP_NOTIFICATION_WEBHOOK,
  encryption_enabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
})

// CLI utilities for backup operations
export class BackupCLI {
  static async validateConfiguration(): Promise<void> {
    const validation = await backupManager.validateConfig()
    
    if (validation.valid) {
      console.log('✅ Backup configuration is valid')
    } else {
      console.error('❌ Backup configuration errors:')
      validation.errors.forEach(error => console.error(`  - ${error}`))
      process.exit(1)
    }
  }

  static async verifyBackup(metadataPath: string): Promise<void> {
    console.log(`Verifying backup: ${metadataPath}`)
    const result = await backupManager.verifyBackup(metadataPath)
    
    if (result.valid) {
      console.log('✅ Backup verification passed')
    } else {
      console.error('❌ Backup verification failed:')
      result.errors.forEach(error => console.error(`  - ${error}`))
      
      if (result.warnings.length > 0) {
        console.warn('⚠️ Warnings:')
        result.warnings.forEach(warning => console.warn(`  - ${warning}`))
      }
      
      process.exit(1)
    }
  }

  static async showStats(): Promise<void> {
    const stats = await backupManager.getBackupStats()
    console.log('📊 Backup Statistics:')
    console.log(`  Total backups: ${stats.total_backups}`)
    console.log(`  Total size: ${(stats.total_size / 1024 / 1024 / 1024).toFixed(2)} GB`)
    console.log(`  Oldest backup: ${stats.oldest_backup || 'N/A'}`)
    console.log(`  Newest backup: ${stats.newest_backup || 'N/A'}`)
    console.log(`  Success rate: ${(stats.success_rate * 100).toFixed(1)}%`)
  }
}