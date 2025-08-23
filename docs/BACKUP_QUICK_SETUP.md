# 🚀 Quick Setup Guide for Backup System

This guide will help you quickly set up the automated backup system for your repository.

## 📋 Prerequisites

- GitHub repository with Actions enabled
- Cloud storage account (AWS S3 or Google Cloud Storage)
- Admin access to repository settings

## ⚡ Quick Setup Steps

### 1. Choose Your Cloud Provider

#### Option A: AWS S3 Setup

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://your-backup-bucket-name
   ```

2. **Create IAM User with S3 permissions:**
   - Create user: `backup-user`
   - Attach policy with S3 access to your bucket
   - Save Access Key ID and Secret Access Key

3. **Add GitHub Secrets:**
   Go to Repository Settings → Secrets and variables → Actions → New repository secret:
   - `AWS_ACCESS_KEY_ID` = your-access-key-id
   - `AWS_SECRET_ACCESS_KEY` = your-secret-access-key
   - `AWS_REGION` = us-east-1 (or your preferred region)
   - `AWS_S3_BACKUP_BUCKET` = your-backup-bucket-name

#### Option B: Google Cloud Storage Setup

1. **Create GCS Bucket:**
   ```bash
   gsutil mb gs://your-backup-bucket-name
   ```

2. **Create Service Account:**
   - Go to Google Cloud Console → IAM & Admin → Service Accounts
   - Create new service account with Storage Admin role
   - Download JSON key file

3. **Add GitHub Secrets:**
   - `GCP_PROJECT_ID` = your-project-id
   - `GCP_SERVICE_ACCOUNT_KEY` = entire-json-key-content
   - `GCS_BACKUP_BUCKET` = your-backup-bucket-name

### 2. Enable Backup System

Add to your `.env` file or environment variables:
```bash
BACKUP_ENABLED=true
BACKUP_CLOUD_PROVIDER=aws-s3  # or 'gcs'
BACKUP_RETENTION_DAYS=30
```

### 3. Test Configuration

Run validation to ensure everything is configured correctly:
```bash
pnpm backup:validate
```

### 4. Run First Backup

#### Manual Trigger:
1. Go to **Actions** tab in your repository
2. Select **Backup Workflow**
3. Click **Run workflow**
4. Choose "full" backup type
5. Select your cloud provider

#### Automatic Schedule:
Backups will run automatically every day at 2 AM UTC.

### 5. Verify Backup

Check that your backup was created successfully:
```bash
pnpm backup:list
pnpm backup:stats
```

## 🔧 Optional Configuration

### Webhook Notifications

To receive notifications (Slack, Discord, etc.):
```bash
BACKUP_NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/...
```

### Custom Retention Policy

To change how long backups are kept:
```bash
BACKUP_RETENTION_DAYS=60  # Keep for 60 days instead of 30
```

### Encryption

To enable additional encryption:
```bash
BACKUP_ENCRYPTION_ENABLED=true
```

## 📊 Monitoring Your Backups

### View Backup Status
```bash
# Show statistics
pnpm backup:stats

# List all backups
pnpm backup:list

# Verify specific backup
pnpm backup:verify path/to/metadata.json
```

### GitHub Actions
- Monitor workflow runs in the **Actions** tab
- Check logs for any errors or warnings
- Review backup artifacts in cloud storage

## 🚨 Testing Restore

**Important:** Test your restore process regularly!

1. Go to **Actions** → **Restore from Backup**
2. Enter a backup ID (timestamp from backup list)
3. Choose restore type and target branch
4. Review the created pull request

## 📞 Support

If you encounter issues:

1. **Check the logs** in GitHub Actions
2. **Validate configuration** with `pnpm backup:validate`
3. **Review documentation** in `docs/BACKUP_SYSTEM.md`
4. **Test cloud storage access** manually

## 🎯 Success Checklist

- [ ] Cloud storage bucket created
- [ ] GitHub secrets configured
- [ ] `BACKUP_ENABLED=true` set
- [ ] Validation passes: `pnpm backup:validate`
- [ ] First backup completed successfully
- [ ] Backup appears in cloud storage
- [ ] Restore process tested

## ⚠️ Important Notes

- **Backup frequency:** Daily at 2 AM UTC (configurable)
- **Retention period:** 30 days by default (configurable)
- **Backup types:** Full (source + artifacts), source-only, artifacts-only
- **Storage:** Compressed tar.gz files with metadata
- **Security:** Use IAM roles with minimal permissions

---

🎉 **Congratulations!** Your backup system is now configured and protecting your code and build artifacts automatically.