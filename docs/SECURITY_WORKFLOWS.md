# Security Workflows Documentation

This repository implements comprehensive security scanning and vulnerability management through automated workflows and tools.

## 🔒 Security Features

### 1. Automated Dependency Management (Dependabot)
- **Location**: `.github/dependabot.yml`
- **Schedule**: Daily dependency scans
- **Features**:
  - Automatic security updates
  - Grouped updates by severity
  - Pull request creation for vulnerable dependencies
  - Integration with GitHub Security Advisories

### 2. Static Code Analysis (CodeQL)
- **Location**: `.github/workflows/codeql.yml`
- **Schedule**: Weekly + on push/PR to main
- **Features**:
  - JavaScript/TypeScript static analysis
  - Security-focused query suite
  - SARIF report generation
  - Integration with GitHub Security tab

### 3. Comprehensive Security Scanning
- **Location**: `.github/workflows/security.yml`
- **Schedule**: Daily + on push/PR
- **Features**:
  - NPM audit integration
  - Custom security vulnerability scanning
  - Security score calculation
  - Automated issue creation for critical findings
  - Team notifications

### 4. Security Notification Service
- **Location**: `scripts/security-notification-service.ts`
- **Features**:
  - Multi-channel notifications (GitHub, Slack, Teams, Email)
  - Configurable alert thresholds
  - Rich notification formatting
  - Escalation policies

## 🚨 Security Thresholds

The security workflows use the following thresholds:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Critical Vulnerabilities | 0 | Block deployment, Create P0 issue |
| High Vulnerabilities | ≤ 5 | Warning, Create P1 issue |
| Security Score | ≥ 70/100 | Below threshold triggers alerts |
| Medium Vulnerabilities | ≤ 20 | Monitoring only |
| Low Vulnerabilities | ≤ 50 | Monitoring only |

## 📊 Security Score Calculation

The security score is calculated using the following formula:
```
Security Score = 100 - (Critical × 25) - (High × 10) - (Medium × 5) - (Low × 1)
```

Minimum score: 0/100, Maximum score: 100/100

## 🔧 Configuration

### Environment Variables

For enhanced notifications, configure these environment variables in GitHub Secrets:

```bash
# Slack notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_CHANNEL=#security
SLACK_MENTIONS=user1,user2

# Email notifications (optional)
EMAIL_API_KEY=your-email-service-api-key
EMAIL_FROM=security@yourcompany.com
EMAIL_TO=team@yourcompany.com,devops@yourcompany.com

# Teams notifications (optional)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...

# GitHub (automatically configured in Actions)
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
GITHUB_REPOSITORY=${{ github.repository }}
```

### Security Configuration

The security settings can be customized in `.github/security-config.json`:

- Scan schedules and thresholds
- Notification preferences
- Compliance requirements
- Monitoring settings

## 🛠️ Manual Security Commands

### Run Security Scan Locally
```bash
# Full comprehensive scan
npx ts-node scripts/security-vulnerability-scan.ts

# NPM audit only
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix
```

### Generate Security Report
```bash
# Run scan and generate JSON report
npx ts-node scripts/security-vulnerability-scan.ts
# Report saved to: security-vulnerability-report.json
```

### Send Security Notifications
```bash
# Send notifications based on scan results
npx ts-node scripts/security-notification-service.ts security-vulnerability-report.json
```

## 📈 Security Workflow Triggers

### Automatic Triggers
- **Daily**: Comprehensive security scan at 2 AM Bangkok time
- **Weekly**: CodeQL analysis on Sundays
- **On Push**: Quick security check on any branch
- **On PR**: Full security scan on PRs to main branch
- **Dependabot**: Daily dependency vulnerability checks

### Manual Triggers
- **Workflow Dispatch**: Run security scan manually from GitHub Actions
- **CLI**: Run security scripts locally during development

## 🚨 Security Alert Response

### Critical Vulnerabilities (P0)
1. **Immediate Action Required** (within 24 hours)
2. Automated GitHub issue created with P0 label
3. Team notifications sent via configured channels
4. Deployment blocking enabled
5. Security team automatically assigned

### High Vulnerabilities (P1)
1. **Priority Action** (within 1 week)
2. GitHub issue created with P1 label
3. Team notifications for threshold breaches
4. Security review recommended

### Medium/Low Vulnerabilities (P2/P3)
1. **Monitoring and Planning**
2. Include in next maintenance cycle
3. Track in security metrics

## 📋 Security Checklist

### For Developers
- [ ] Run `npm audit` before committing
- [ ] Review Dependabot PRs promptly
- [ ] Address security warnings in CI/CD
- [ ] Follow secure coding practices
- [ ] Test security fixes thoroughly

### For Security Team
- [ ] Review critical security alerts within 2 hours
- [ ] Validate automated security fixes
- [ ] Monitor security score trends
- [ ] Update security thresholds as needed
- [ ] Conduct periodic security reviews

### For DevOps/Maintainers
- [ ] Monitor security workflow health
- [ ] Update security tools and configurations
- [ ] Review and approve security-related PRs
- [ ] Maintain notification integrations
- [ ] Archive old security scan results

## 🔍 Security Monitoring

### Dashboard Views
- **GitHub Security Tab**: CodeQL findings and security advisories
- **Actions Tab**: Security workflow runs and results
- **Issues Tab**: Security-related issues and tracking
- **Pull Requests**: Dependabot and security fix PRs

### Key Metrics
- Security score trends over time
- Vulnerability discovery and fix rates
- Time to resolve critical/high vulnerabilities
- Dependency update frequency
- Security workflow success rates

## 🆘 Troubleshooting

### Common Issues

#### Security Scan Fails
1. Check Node.js version compatibility
2. Verify npm install completed successfully
3. Review scan logs in GitHub Actions
4. Check for breaking changes in dependencies

#### Notifications Not Working
1. Verify webhook URLs and API keys
2. Check environment variable configuration
3. Review notification service logs
4. Test webhook endpoints manually

#### False Positives
1. Review vulnerability details carefully
2. Check if vulnerability applies to your usage
3. Consider suppressing specific findings
4. Update security configuration if needed

#### Dependabot Issues
1. Check repository permissions
2. Review Dependabot configuration syntax
3. Verify branch protection rules
4. Check for conflicting PRs

### Getting Help

- **Security Issues**: Create issue with `security` label
- **Workflow Problems**: Create issue with `ci/cd` label
- **False Positives**: Create issue with `security-review` label
- **Documentation**: Create issue with `documentation` label

## 📚 Additional Resources

- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://docs.github.com/en/code-security/code-scanning)
- [NPM Audit Guide](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Database](https://cwe.mitre.org/)

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintained by**: Security & DevOps Team