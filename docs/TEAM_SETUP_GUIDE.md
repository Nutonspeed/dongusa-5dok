# Automated Code Review Setup Guide

This guide helps you set up and configure the automated code review system for your development team.

## Quick Start

### 1. Environment Setup

The automated code review system is already configured in this repository. To enable all features, you need to set up the following GitHub repository secrets:

#### Required Secrets

Go to **Settings > Secrets and variables > Actions** in your GitHub repository and add:

```
SONAR_TOKEN=your_sonarcloud_token_here
```

#### Optional Team Notification Secrets

```
DEV_TEAM_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
QA_TEAM_WEBHOOK=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK  
SECURITY_TEAM_WEBHOOK=https://your-org.webhook.office.com/YOUR/TEAMS/WEBHOOK
TEAM_WEBHOOK_URL=https://your-general-webhook-url
```

### 2. SonarCloud Setup

1. **Create SonarCloud Account**: Visit [sonarcloud.io](https://sonarcloud.io) and sign up
2. **Import Repository**: Import your GitHub repository
3. **Get Token**: Go to My Account > Security > Generate Token
4. **Add Secret**: Add the token as `SONAR_TOKEN` in GitHub repository secrets

### 3. Team Notification Setup

#### Slack Integration

1. **Create Slack App**: Go to [api.slack.com](https://api.slack.com/apps)
2. **Enable Webhooks**: Add Incoming Webhooks feature
3. **Create Webhook**: Generate webhook URL for your channel
4. **Add Secret**: Add as `DEV_TEAM_WEBHOOK` in GitHub secrets

#### Discord Integration

1. **Server Settings**: Go to your Discord server settings
2. **Integrations**: Navigate to Integrations > Webhooks
3. **Create Webhook**: Set up webhook for your channel
4. **Add Secret**: Add as `QA_TEAM_WEBHOOK` in GitHub secrets

#### Microsoft Teams Integration

1. **Teams Channel**: Go to your Teams channel
2. **Connectors**: Click on "..." > Connectors
3. **Incoming Webhook**: Add and configure Incoming Webhook
4. **Add Secret**: Add as `SECURITY_TEAM_WEBHOOK` in GitHub secrets

## Configuration

### Custom Notification Settings

Create `.github/notifications.json` (copy from `.github/notifications.json.template`):

```json
{
  "channels": [
    {
      "name": "dev-team-slack",
      "webhook": "WEBHOOK_URL_HERE",
      "enabled": true,
      "filters": {
        "branches": ["main", "develop"],
        "events": ["pull_request", "push"],
        "severity": ["high", "critical"]
      }
    }
  ]
}
```

### Quality Gate Customization

Edit `scripts/code-review-notification.ts` to adjust quality gate rules:

```typescript
// Adjust these thresholds as needed
if (analysis.eslint.errors > 10) {  // Change from 10 to your preferred limit
  blockers.push(`Too many ESLint errors: ${analysis.eslint.errors}`)
}
```

## Usage

### Automated Workflow

The code review system runs automatically on:
- **Pull Requests**: To `main` or `develop` branches
- **Pushes**: To `main` or `develop` branches

### Manual Testing

Test the system locally:

```bash
# Run code quality analysis
npm run code-quality

# Generate code review report  
npm run code-review

# Test team notifications
npm run notify-test

# Send notifications to specific channel
npm run notify-test dev-team-slack
```

### Viewing Results

- **GitHub Actions**: Check the Actions tab for detailed logs
- **Pull Requests**: Automated comments with summaries
- **SonarCloud**: Visit your SonarCloud dashboard
- **Team Channels**: Receive notifications in configured channels

## Workflow Stages

### 1. Code Quality Analysis
- ESLint with detailed JSON reporting
- TypeScript compilation checking
- Custom code quality metrics
- GitHub Super Linter validation

### 2. SonarCloud Analysis
- Advanced static analysis
- Security vulnerability detection
- Code coverage analysis
- Technical debt measurement

### 3. Security Analysis
- npm audit for dependency vulnerabilities
- GitHub CodeQL security scanning
- SARIF results uploaded to GitHub Security tab

### 4. Team Notifications
- Comprehensive report generation
- PR comment summaries
- Webhook notifications to team channels
- Quality gate enforcement

## Quality Gates

### Deployment Blockers

Deployments are blocked when:
- TypeScript compilation errors exist
- More than 10 ESLint errors
- Critical security vulnerabilities found
- More than 2 high-severity security vulnerabilities

### Warning Conditions

Warnings are issued for:
- More than 50 ESLint warnings
- Any security vulnerabilities
- High code complexity or duplication

## Troubleshooting

### Common Issues

#### 1. SonarCloud Analysis Fails
```bash
# Check if SONAR_TOKEN is correctly set
echo $SONAR_TOKEN

# Verify sonar-project.properties configuration
cat sonar-project.properties
```

#### 2. Notifications Not Received
```bash
# Test webhook URLs
npm run notify-test

# Check GitHub repository secrets
# Verify webhook URLs are correct
```

#### 3. Build Failures
```bash
# Run prebuild guard to identify issues
bash scripts/prebuild-guard.sh

# Check TypeScript errors
npm run typecheck:soft

# Review ESLint issues
npm run lint:soft
```

### Log Analysis

Review GitHub Actions logs for detailed error information:

1. Go to **Actions** tab in GitHub
2. Click on failed workflow run
3. Expand failing job for detailed logs
4. Check specific step outputs

## Advanced Configuration

### Custom Analysis Tools

Add new tools to the workflow by editing `.github/workflows/code-review-automation.yml`:

```yaml
- name: Run Custom Tool
  run: |
    your-custom-tool --config config.json
    # Parse results and add to reports
```

### Webhook Formats

Different platforms require different webhook formats. The system supports:

- **Slack**: Rich attachments with fields and colors
- **Discord**: Embedded messages with formatting
- **Teams**: Adaptive cards with structured data
- **Generic**: Simple JSON payload

### Environment Variables

Available environment variables in the workflow:

```bash
GITHUB_REPOSITORY    # Repository name
GITHUB_REF_NAME      # Branch name  
GITHUB_SHA           # Commit hash
GITHUB_EVENT_NAME    # Event type (push, pull_request)
GITHUB_ACTOR         # User who triggered the workflow
GITHUB_RUN_ID        # Workflow run ID
```

## Best Practices

### For Development Teams

1. **Review Reports Regularly**: Check SonarCloud trends weekly
2. **Address Critical Issues**: Fix TypeScript errors and critical vulnerabilities immediately  
3. **Maintain Standards**: Keep ESLint error count low
4. **Update Dependencies**: Run `npm audit` and update packages regularly

### For DevOps Teams

1. **Monitor Workflow Performance**: Track execution times and failure rates
2. **Update Quality Gates**: Adjust thresholds based on team maturity
3. **Backup Configurations**: Version control all configuration files
4. **Test Changes**: Use feature branches to test workflow modifications

### For Security Teams

1. **Review Security Reports**: Monitor GitHub Security tab regularly
2. **Update Security Rules**: Keep CodeQL queries current
3. **Validate Webhooks**: Ensure notification channels are secure
4. **Audit Dependencies**: Regular security audits of npm packages

## Support

### Getting Help

1. **Documentation**: Check `docs/AUTOMATED_CODE_REVIEW.md`
2. **Logs**: Review GitHub Actions workflow logs
3. **Issues**: Create GitHub issues for bugs or feature requests
4. **Team Chat**: Use configured notification channels for quick questions

### Maintenance

#### Weekly Tasks
- Review SonarCloud quality gate trends
- Check for failed notifications
- Update dependencies if security vulnerabilities exist

#### Monthly Tasks  
- Review and adjust quality gate thresholds
- Update team notification preferences
- Archive old workflow artifacts

#### Quarterly Tasks
- Review overall code quality metrics
- Update documentation
- Evaluate new static analysis tools