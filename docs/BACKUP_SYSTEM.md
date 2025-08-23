# 🔄 Backup and Restore System

This document describes the automated backup and restore system for the dongusa-5dok project, designed to protect source code and build artifacts using secure cloud storage.

## 📋 Overview

The backup system provides:
- **Automated daily backups** of source code and build artifacts
- **Multiple cloud storage providers** (AWS S3, Google Cloud Storage)
- **Flexible backup types** (full, source-only, artifacts-only)
- **Integrity verification** with checksums
- **Automated restoration** via GitHub Actions
- **Retention policy management** with automatic cleanup
- **CLI tools** for manual operations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Source Code   │    │ Build Artifacts │    │    Metadata     │
│     (.tar.gz)   │    │     (.tar.gz)   │    │     (.json)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Cloud Storage  │
                    │   (S3 or GCS)   │
                    └─────────────────┘
```

## ⚙️ Configuration

### Environment Variables

Add these variables to your environment:

```bash
# Backup Configuration
BACKUP_ENABLED=true
BACKUP_CLOUD_PROVIDER=aws-s3  # or 'gcs'
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION_ENABLED=false
BACKUP_NOTIFICATION_WEBHOOK=https://hooks.slack.com/...

# AWS S3 Configuration (if using aws-s3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BACKUP_BUCKET=your-backup-bucket

# Google Cloud Storage Configuration (if using gcs)
GCP_PROJECT_ID=your-project-id
GCP_SERVICE_ACCOUNT_KEY=your-service-account-key
GCS_BACKUP_BUCKET=your-backup-bucket
```

### GitHub Secrets

Configure these secrets in your repository settings:

**For AWS S3:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BACKUP_BUCKET`

**For Google Cloud Storage:**
- `GCP_PROJECT_ID`
- `GCP_SERVICE_ACCOUNT_KEY`
- `GCS_BACKUP_BUCKET`

**Optional:**
- `BACKUP_RETENTION_DAYS` (default: 30)
- `BACKUP_NOTIFICATION_WEBHOOK`

## 🚀 Usage

### Automated Backups

Backups run automatically every day at 2 AM UTC. You can also trigger manual backups:

1. Go to **Actions** tab in your repository
2. Select **Backup Workflow**
3. Click **Run workflow**
4. Choose your options:
   - **Backup Type**: full, source-only, or artifacts-only
   - **Cloud Provider**: aws-s3 or gcs

### Manual Backup Operations

Use the CLI tools for manual operations:

```bash
# Validate backup configuration
pnpm backup:validate

# Show backup statistics
pnpm backup:stats

# List available backups
pnpm backup:list

# Verify backup integrity
pnpm backup:verify path/to/metadata.json

# Clean up old backups
pnpm backup:cleanup

# Send test notification
pnpm backup:notify "Test message" --success
```

### Restoring from Backup

To restore from a backup:

1. Go to **Actions** tab in your repository
2. Select **Restore from Backup**
3. Click **Run workflow**
4. Provide:
   - **Backup ID**: timestamp (e.g., `2023-12-01_02-00-15`)
   - **Restore Type**: full, source-only, or artifacts-only
   - **Cloud Provider**: where the backup is stored
   - **Target Branch**: branch name for restoration
   - **Verify Integrity**: whether to verify before restore

The restore process will:
1. Download the backup from cloud storage
2. Verify integrity (if enabled)
3. Create a new branch
4. Extract and restore files
5. Test the build
6. Create a pull request

## 📦 Backup Types

### Full Backup (`full`)
- Source code (excluding git, node_modules, build artifacts)
- Build artifacts (.next directory and configs)
- Metadata with checksums

### Source Only (`source-only`)
- Source code only
- Metadata with checksums

### Artifacts Only (`artifacts-only`)
- Build artifacts only
- Metadata with checksums

## 🔐 Security

### Access Control
- Use IAM roles with minimal required permissions
- Rotate access keys regularly
- Store credentials as GitHub secrets

### Encryption
- Enable encryption at rest in cloud storage
- Use HTTPS for all transfers
- Consider enabling client-side encryption

### Example AWS S3 IAM Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-backup-bucket",
                "arn:aws:s3:::your-backup-bucket/*"
            ]
        }
    ]
}
```

## 📊 Monitoring

### Backup Status
Monitor backup status through:
- GitHub Actions logs
- Webhook notifications (Slack, Discord, etc.)
- CLI statistics command

### Metrics
Track these metrics:
- Backup success rate
- Backup size trends
- Storage usage
- Restore test results

### Alerting
Set up alerts for:
- Failed backups
- Storage quota exceeded
- Old backups not cleaned up
- Integrity verification failures

## 🔧 Maintenance

### Regular Tasks

**Weekly:**
- Review backup success rate
- Check storage usage
- Test restore process

**Monthly:**
- Rotate access keys
- Review retention policy
- Update documentation

**Quarterly:**
- Disaster recovery drill
- Performance optimization
- Security audit

### Troubleshooting

**Backup Failures:**
1. Check GitHub Actions logs
2. Verify cloud storage credentials
3. Check storage quota and permissions
4. Test network connectivity

**Restore Issues:**
1. Verify backup integrity
2. Check file permissions
3. Ensure sufficient disk space
4. Validate metadata format

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Access denied | Check IAM permissions |
| Quota exceeded | Clean up old backups or increase quota |
| Network timeout | Retry with smaller chunks |
| Integrity failure | Re-create backup |

## 📈 Best Practices

### Backup Strategy
- Use the 3-2-1 rule: 3 copies, 2 different media, 1 offsite
- Test restores regularly
- Monitor backup metrics
- Document recovery procedures

### Storage Management
- Use lifecycle policies for cost optimization
- Enable versioning for extra protection
- Configure cross-region replication
- Set up access logging

### Automation
- Automate backup verification
- Set up monitoring dashboards
- Use infrastructure as code
- Implement chaos engineering

## 🔄 Disaster Recovery

### Recovery Time Objectives (RTO)
- **Critical**: < 1 hour
- **High**: < 4 hours
- **Medium**: < 24 hours
- **Low**: < 72 hours

### Recovery Point Objectives (RPO)
- **Daily backups**: 24 hours data loss maximum
- **On-demand backups**: Near-zero data loss for planned changes

### Recovery Procedures

1. **Assess the situation**
   - Determine scope of data loss
   - Identify latest viable backup

2. **Initialize recovery**
   - Run restore workflow
   - Monitor progress

3. **Verify restoration**
   - Test application functionality
   - Validate data integrity
   - Perform smoke tests

4. **Resume operations**
   - Update DNS if needed
   - Notify stakeholders
   - Document incident

## 📚 API Reference

### BackupManager Class

```typescript
// Create backup manager instance
const manager = new BackupManager({
  enabled: true,
  cloud_provider: 'aws-s3',
  retention_days: 30
})

// Validate configuration
await manager.validateConfig()

// Generate metadata
const metadata = await manager.generateBackupMetadata('full', files)

// Verify backup
const result = await manager.verifyBackup('metadata.json')

// List backups
const backups = await manager.listBackups()

// Restore backup
await manager.restoreBackup({
  backup_id: '2023-12-01_02-00-15',
  restore_type: 'full'
})
```

### CLI Commands

```bash
# Configuration
pnpm backup:validate

# Operations
pnpm backup:list
pnpm backup:stats
pnpm backup:cleanup

# Verification
pnpm backup:verify <metadata-path>

# Notifications
pnpm backup:notify <message> [--success]

# Restoration
pnpm backup:restore -i <backup-id> -t <type> [-d <directory>]
```

## 🤝 Contributing

To improve the backup system:

1. Test changes thoroughly
2. Update documentation
3. Add appropriate tests
4. Follow security best practices
5. Consider backwards compatibility

## 📄 License

This backup system is part of the dongusa-5dok project and follows the same license terms.