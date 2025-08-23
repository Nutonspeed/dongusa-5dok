#!/usr/bin/env tsx

/**
 * Backup CLI Tool
 * Command-line interface for backup operations
 */

import { BackupCLI, backupManager } from '@/lib/backup-manager'
import { Command } from 'commander'

const program = new Command()

program
  .name('backup-cli')
  .description('CLI tool for backup operations')
  .version('1.0.0')

program
  .command('validate')
  .description('Validate backup configuration')
  .action(async () => {
    try {
      await BackupCLI.validateConfiguration()
    } catch (error) {
      console.error('Validation failed:', error)
      process.exit(1)
    }
  })

program
  .command('verify')
  .description('Verify backup integrity')
  .argument('<metadata-path>', 'Path to backup metadata file')
  .action(async (metadataPath: string) => {
    try {
      await BackupCLI.verifyBackup(metadataPath)
    } catch (error) {
      console.error('Verification failed:', error)
      process.exit(1)
    }
  })

program
  .command('stats')
  .description('Show backup statistics')
  .action(async () => {
    try {
      await BackupCLI.showStats()
    } catch (error) {
      console.error('Failed to retrieve stats:', error)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('List available backups')
  .action(async () => {
    try {
      const backups = await backupManager.listBackups()
      
      if (backups.length === 0) {
        console.log('No backups found')
        return
      }

      console.log('📦 Available Backups:')
      console.log('━'.repeat(80))
      
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.timestamp}`)
        console.log(`   Type: ${backup.backup_type}`)
        console.log(`   Branch: ${backup.branch}`)
        console.log(`   Commit: ${backup.commit_sha.substring(0, 8)}`)
        console.log(`   Provider: ${backup.cloud_provider}`)
        console.log(`   Files: ${backup.files.length}`)
        console.log('')
      })
    } catch (error) {
      console.error('Failed to list backups:', error)
      process.exit(1)
    }
  })

program
  .command('restore')
  .description('Restore from backup')
  .requiredOption('-i, --backup-id <id>', 'Backup ID to restore')
  .option('-t, --type <type>', 'Restore type (source|artifacts|full)', 'full')
  .option('-d, --directory <dir>', 'Target directory for restoration')
  .option('--no-verify', 'Skip integrity verification')
  .option('--overwrite', 'Overwrite existing files')
  .action(async (options) => {
    try {
      const result = await backupManager.restoreBackup({
        backup_id: options.backupId,
        restore_type: options.type,
        target_directory: options.directory,
        verify_integrity: options.verify !== false,
        overwrite_existing: options.overwrite === true,
      })

      if (result.success) {
        console.log('✅', result.message)
      } else {
        console.error('❌', result.message)
        process.exit(1)
      }
    } catch (error) {
      console.error('Restore failed:', error)
      process.exit(1)
    }
  })

program
  .command('cleanup')
  .description('Clean up old backups based on retention policy')
  .action(async () => {
    try {
      console.log('Starting backup cleanup...')
      const result = await backupManager.cleanupOldBackups()
      
      console.log(`✅ Cleanup completed: ${result.deleted} backups deleted`)
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Cleanup errors:')
        result.errors.forEach(error => console.warn(`  - ${error}`))
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
      process.exit(1)
    }
  })

program
  .command('notify')
  .description('Send test notification')
  .argument('<message>', 'Message to send')
  .option('--success', 'Mark as success notification')
  .action(async (message: string, options) => {
    try {
      await backupManager.sendNotification(message, options.success === true)
      console.log('✅ Notification sent')
    } catch (error) {
      console.error('Failed to send notification:', error)
      process.exit(1)
    }
  })

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Parse command line arguments
program.parse()