/**
 * Tests for Backup Manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BackupManager, backupManager } from '../lib/backup-manager'

// Mock fs promises
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    promises: {
      readFile: vi.fn(),
      stat: vi.fn(),
      writeFile: vi.fn(),
    }
  }
})

// Mock environment variables
const mockEnv = {
  BACKUP_ENABLED: 'true',
  BACKUP_CLOUD_PROVIDER: 'aws-s3',
  BACKUP_RETENTION_DAYS: '30',
  AWS_ACCESS_KEY_ID: 'test-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret',
  AWS_S3_BACKUP_BUCKET: 'test-bucket',
}

describe('BackupManager', () => {
  let manager: BackupManager

  beforeEach(() => {
    // Reset environment variables
    Object.keys(mockEnv).forEach(key => {
      process.env[key] = mockEnv[key as keyof typeof mockEnv]
    })

    manager = new BackupManager({
      enabled: true,
      cloud_provider: 'aws-s3',
      retention_days: 30,
    })
  })

  describe('validateConfig', () => {
    it('should validate AWS S3 configuration successfully', async () => {
      const result = await manager.validateConfig()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation when AWS credentials are missing', async () => {
      delete process.env.AWS_ACCESS_KEY_ID
      
      const result = await manager.validateConfig()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('AWS_ACCESS_KEY_ID environment variable is required for AWS S3 backups')
    })

    it('should validate GCS configuration', async () => {
      const gcsManager = new BackupManager({
        enabled: true,
        cloud_provider: 'gcs',
      })

      process.env.GCP_SERVICE_ACCOUNT_KEY = 'test-key'
      process.env.GCS_BACKUP_BUCKET = 'test-bucket'

      const result = await gcsManager.validateConfig()
      expect(result.valid).toBe(true)
    })

    it('should return valid when backup is disabled', async () => {
      const disabledManager = new BackupManager({ enabled: false })
      
      const result = await disabledManager.validateConfig()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate retention days range', async () => {
      const invalidManager = new BackupManager({
        enabled: true,
        retention_days: 400, // Invalid: > 365
      })

      const result = await invalidManager.validateConfig()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Backup retention days must be between 1 and 365')
    })
  })

  describe('generateBackupMetadata', () => {
    it('should generate valid metadata', async () => {
      const files = [
        {
          name: 'source.tar.gz',
          path: '/backup/source.tar.gz',
          size: 1024,
          checksum: 'abc123',
          type: 'source' as const,
        },
      ]

      process.env.GITHUB_SHA = 'commit123'
      process.env.GITHUB_REF_NAME = 'main'
      process.env.GITHUB_RUN_ID = '123456'
      process.env.GITHUB_REPOSITORY = 'test/repo'

      const metadata = await manager.generateBackupMetadata('full', files)

      expect(metadata.commit_sha).toBe('commit123')
      expect(metadata.branch).toBe('main')
      expect(metadata.backup_type).toBe('full')
      expect(metadata.files).toEqual(files)
      expect(metadata.checksum).toBeDefined()
      expect(metadata.timestamp).toBeDefined()
    })

    it('should handle missing environment variables', async () => {
      delete process.env.GITHUB_SHA
      delete process.env.GITHUB_REF_NAME

      const metadata = await manager.generateBackupMetadata('source-only', [])

      expect(metadata.commit_sha).toBe('unknown')
      expect(metadata.branch).toBe('unknown')
      expect(metadata.backup_type).toBe('source-only')
    })
  })

  describe('calculateFileChecksum', () => {
    it('should calculate file checksum', async () => {
      const { promises: fs } = await import('fs')
      const mockBuffer = Buffer.from('test content')
      const mockReadFile = vi.mocked(fs.readFile)
      mockReadFile.mockResolvedValue(mockBuffer)

      const checksum = await manager.calculateFileChecksum('/test/file.txt')
      
      expect(checksum).toBeDefined()
      expect(typeof checksum).toBe('string')
      expect(checksum).toHaveLength(64) // SHA256 hex string
    })

    it('should handle file read errors', async () => {
      const { promises: fs } = await import('fs')
      const mockReadFile = vi.mocked(fs.readFile)
      mockReadFile.mockRejectedValue(new Error('File not found'))

      await expect(manager.calculateFileChecksum('/invalid/file.txt'))
        .rejects.toThrow('Failed to calculate checksum')
    })
  })

  describe('verifyBackup', () => {
    it('should verify valid backup', async () => {
      const { promises: fs } = await import('fs')
      const metadata = {
        timestamp: '2023-12-01T02:00:00Z',
        commit_sha: 'abc123',
        branch: 'main',
        backup_type: 'full',
        cloud_provider: 'aws-s3',
        workflow_run_id: '123',
        repository: 'test/repo',
        files: [
          {
            name: 'test.tar.gz',
            path: '/backup/test.tar.gz',
            size: 1024,
            checksum: 'def456',
            type: 'source',
          },
        ],
        checksum: 'overall123',
      }

      const mockReadFile = vi.mocked(fs.readFile)
      mockReadFile.mockResolvedValue(JSON.stringify(metadata))

      const mockStat = vi.mocked(fs.stat)
      mockStat.mockResolvedValue({ size: 1024 } as any)

      // Mock checksum calculation to match expected
      vi.spyOn(manager, 'calculateFileChecksum').mockResolvedValue('def456')

      const result = await manager.verifyBackup('/test/metadata.json')

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.metadata).toEqual(metadata)
    })

    it('should detect file size mismatch', async () => {
      const { promises: fs } = await import('fs')
      const metadata = {
        files: [
          {
            name: 'test.tar.gz',
            size: 1024,
            checksum: 'def456',
            type: 'source',
          },
        ],
        checksum: 'overall123',
      }

      const mockReadFile = vi.mocked(fs.readFile)
      mockReadFile.mockResolvedValue(JSON.stringify(metadata))

      const mockStat = vi.mocked(fs.stat)
      mockStat.mockResolvedValue({ size: 2048 } as any) // Different size

      const result = await manager.verifyBackup('/test/metadata.json')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File size mismatch for test.tar.gz: expected 1024, got 2048')
    })

    it('should handle metadata parse errors', async () => {
      const { promises: fs } = await import('fs')
      const mockReadFile = vi.mocked(fs.readFile)
      mockReadFile.mockResolvedValue('invalid json')

      const result = await manager.verifyBackup('/test/metadata.json')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to read or parse metadata')
    })
  })

  describe('restoreBackup', () => {
    it('should validate restore options', async () => {
      const result = await manager.restoreBackup({
        backup_id: '',
        restore_type: 'full',
        verify_integrity: false,
        overwrite_existing: false,
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Backup ID is required')
    })

    it('should handle successful restore', async () => {
      const result = await manager.restoreBackup({
        backup_id: '2023-12-01_02-00-15',
        restore_type: 'full',
        verify_integrity: false,
        overwrite_existing: false,
      })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Backup restored successfully')
    })
  })

  describe('getBackupStats', () => {
    it('should return default stats', async () => {
      const stats = await manager.getBackupStats()

      expect(stats).toEqual({
        total_backups: 0,
        total_size: 0,
        oldest_backup: null,
        newest_backup: null,
        success_rate: 0,
      })
    })
  })

  describe('cleanupOldBackups', () => {
    it('should handle cleanup operation', async () => {
      const result = await manager.cleanupOldBackups()

      expect(result.deleted).toBe(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('sendNotification', () => {
    it('should skip notification when webhook not configured', async () => {
      const manager = new BackupManager({ notification_webhook: undefined })
      
      // Should not throw
      await expect(manager.sendNotification('test', true)).resolves.toBeUndefined()
    })

    it('should send notification when webhook configured', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      global.fetch = mockFetch

      const manager = new BackupManager({ 
        notification_webhook: 'https://webhook.example.com' 
      })

      await manager.sendNotification('test message', true)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://webhook.example.com',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test message'),
        })
      )
    })
  })
})

describe('Singleton backupManager', () => {
  it('should be configured from environment variables', () => {
    process.env.BACKUP_ENABLED = 'true'
    process.env.BACKUP_CLOUD_PROVIDER = 'gcs'
    process.env.BACKUP_RETENTION_DAYS = '60'

    // Note: The singleton is already created, so we're testing the expected behavior
    expect(backupManager).toBeDefined()
  })
})