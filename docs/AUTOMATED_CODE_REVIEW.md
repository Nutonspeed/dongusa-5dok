# Automated Code Review System

This document describes the automated code review workflow implemented for the SofaCover Pro project. The system provides comprehensive static analysis and team notifications to ensure code quality and security.

## Overview

The automated code review system consists of:

1. **GitHub Actions Workflow** - Comprehensive CI/CD pipeline with multiple analysis stages
2. **Static Analysis Tools** - ESLint, TypeScript checker, and SonarCloud integration  
3. **Security Analysis** - npm audit and CodeQL security scanning
4. **Team Notifications** - Slack, Discord, and Teams integration for alerts
5. **Quality Gates** - Deployment blockers based on code quality metrics

## Workflow Components

### 1. Code Quality Analysis Job

**Purpose**: Runs ESLint, TypeScript checking, and custom code quality analysis

**Triggers**: 
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches

**Tools Used**:
- ESLint with JSON output for detailed reporting
- TypeScript compiler for type checking  
- Custom code quality analyzer (`scripts/code-quality-analysis.ts`)
- GitHub Super Linter for additional validation

**Outputs**:
- `eslint-report.json` - Detailed ESLint results
- `typescript-report.txt` - TypeScript compilation results
- `quality-report.json` - Comprehensive code quality metrics

### 2. SonarCloud Analysis Job

**Purpose**: Advanced static analysis with SonarCloud for code quality and security

**Configuration**: `sonar-project.properties`

**Metrics Tracked**:
- Code coverage
- Code duplication
- Security vulnerabilities  
- Code smells
- Maintainability rating

**Integration**: Results are available in SonarCloud dashboard and GitHub PRs

### 3. Security Analysis Job

**Purpose**: Security vulnerability detection and code analysis

**Tools Used**:
- npm audit for dependency vulnerabilities
- GitHub CodeQL for security and quality analysis

**Outputs**:
- `security-audit.json` - npm audit results
- CodeQL SARIF results uploaded to GitHub Security tab

### 4. Code Review Notification Job

**Purpose**: Generate comprehensive reports and notify teams

**Features**:
- Aggregates results from all analysis jobs
- Generates markdown summary for PR comments
- Sends team notifications via webhooks
- Creates deployment quality gates

## Team Notifications

### Supported Platforms

- **Slack** - Rich message formatting with attachments
- **Discord** - Webhook integration with embeds
- **Microsoft Teams** - Card-based notifications
- **Custom Webhooks** - JSON payload support

### Notification Triggers

**Severity Levels**:
- `critical` - TypeScript errors, critical security vulnerabilities, quality gate failures
- `high` - Many ESLint errors (>10), high security vulnerabilities
- `medium` - Some ESLint errors, security vulnerabilities
- `low` - Warnings only

**Channel Filters**:
- Branch-based filtering (main, develop, feature branches)
- Event-based filtering (push, pull_request)
- Severity-based filtering

### Configuration

Create `.github/notifications.json` based on the template:

```json
{
  "channels": [
    {
      "name": "dev-team-slack",
      "webhook": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
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

### Environment Variables

Set these secrets in your GitHub repository:

```bash
# Required for SonarCloud
SONAR_TOKEN=your_sonarcloud_token

# Optional team webhooks
DEV_TEAM_WEBHOOK=https://hooks.slack.com/services/...
QA_TEAM_WEBHOOK=https://discord.com/api/webhooks/...
SECURITY_TEAM_WEBHOOK=https://your-org.webhook.office.com/...
```

## Quality Gates

### Deployment Blockers

The system will block deployments if:

- **TypeScript Errors**: Any compilation errors found
- **Critical ESLint Errors**: More than 10 ESLint errors
- **Critical Security Vulnerabilities**: Any critical severity vulnerabilities
- **High Security Vulnerabilities**: More than 2 high severity vulnerabilities

### Warning Conditions

Warnings will be issued for:

- **ESLint Warnings**: More than 50 warnings
- **Security Vulnerabilities**: Any vulnerabilities found
- **Code Quality Issues**: High complexity, duplication, or unused code

## Usage

### Running Locally

```bash
# Run code quality analysis
npm run code-quality

# Generate code review report
npm run code-review

# Send team notifications
npm run notify-team

# Test notifications
npm run notify-test
```

### Manual Script Execution

```bash
# Comprehensive code quality analysis
node scripts/code-quality-analysis.ts

# Generate and send code review notifications
node scripts/code-review-notification.ts

# Send team notifications
node scripts/team-notification.ts send

# Test webhook configuration
node scripts/team-notification.ts test dev-team-slack
```

## Workflow Files

### Main Workflow
- `.github/workflows/code-review-automation.yml` - Complete automated code review pipeline

### Configuration Files
- `sonar-project.properties` - SonarCloud configuration
- `.github/notifications.json` - Team notification settings (create from template)
- `.eslintrc.json` - ESLint configuration (existing)

### Scripts
- `scripts/code-quality-analysis.ts` - Comprehensive code analysis (enhanced)
- `scripts/code-review-notification.ts` - Report generation and notifications
- `scripts/team-notification.ts` - Webhook-based team alerts

## Integration with Existing System

The automated code review system integrates with:

- **Existing ESLint Configuration** - Uses current `.eslintrc.json` settings
- **Notification Service** - Leverages `lib/real-time-notification-service.ts`
- **Code Quality Tools** - Enhances existing `scripts/code-quality-analysis.ts`
- **CI/CD Pipeline** - Extends current GitHub Actions workflow

## Customization

### Adding New Analysis Tools

1. Add tool execution to the `code-quality-analysis` job
2. Parse results in `scripts/code-review-notification.ts`
3. Update quality gate rules in the notification script
4. Add new metrics to the report format

### Custom Notification Channels

1. Add channel configuration to `.github/notifications.json`
2. Implement webhook format in `scripts/team-notification.ts`
3. Set up environment variables for webhook URLs
4. Test with `npm run notify-test channel-name`

### Quality Gate Rules

Modify quality gate logic in `scripts/code-review-notification.ts`:

```typescript
private evaluateQualityGate(): CodeReviewReport['qualityGate'] {
  const blockers: string[] = []
  
  // Add your custom rules here
  if (this.report.analysis.eslint.errors > YOUR_THRESHOLD) {
    blockers.push(`Too many ESLint errors: ${this.report.analysis.eslint.errors}`)
  }
  
  return {
    passed: blockers.length === 0,
    blockers,
    warnings
  }
}
```

## Monitoring and Maintenance

### Viewing Results

- **GitHub Actions Tab**: Complete workflow execution logs
- **Pull Request Comments**: Automated summary comments
- **SonarCloud Dashboard**: Advanced metrics and trends
- **GitHub Security Tab**: Security vulnerabilities and CodeQL results

### Troubleshooting

1. **Workflow Failures**: Check GitHub Actions logs for specific error messages
2. **Missing Notifications**: Verify webhook URLs and environment variables
3. **SonarCloud Issues**: Check `SONAR_TOKEN` secret and project configuration
4. **Quality Gate Failures**: Review specific metrics in the generated reports

### Maintenance Tasks

- **Weekly**: Review SonarCloud trends and address declining metrics
- **Monthly**: Update dependency versions and security patches
- **Quarterly**: Review and adjust quality gate thresholds
- **As Needed**: Update team notification channels and webhooks