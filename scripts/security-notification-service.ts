#!/usr/bin/env node

import { readFileSync, existsSync } from "fs"

interface SecurityNotificationConfig {
  slack?: {
    webhookUrl: string
    channel: string
    mention: string[]
  }
  email?: {
    apiKey: string
    from: string
    to: string[]
  }
  github?: {
    token: string
    owner: string
    repo: string
  }
  teams?: {
    webhookUrl: string
  }
}

interface SecurityAlert {
  scanId: string
  timestamp: string
  repository: string
  branch: string
  securityScore: number
  criticalVulns: number
  highVulns: number
  moderateVulns: number
  lowVulns: number
  totalVulns: number
  failedThresholds: string[]
  recommendations: string[]
  reportUrl?: string
  scanUrl?: string
}

class SecurityNotificationService {
  private config: SecurityNotificationConfig

  constructor(config: SecurityNotificationConfig) {
    this.config = config
  }

  async sendSecurityAlert(alert: SecurityAlert): Promise<void> {
    console.log(`📢 Sending security alert for scan ${alert.scanId}...`)

    const notifications: Promise<void>[] = []

    // Send Slack notification
    if (this.config.slack?.webhookUrl) {
      notifications.push(this.sendSlackNotification(alert))
    }

    // Send email notification
    if (this.config.email?.apiKey) {
      notifications.push(this.sendEmailNotification(alert))
    }

    // Create GitHub issue
    if (this.config.github?.token) {
      notifications.push(this.createGitHubIssue(alert))
    }

    // Send Teams notification
    if (this.config.teams?.webhookUrl) {
      notifications.push(this.sendTeamsNotification(alert))
    }

    try {
      await Promise.allSettled(notifications)
      console.log("✅ Security notifications sent successfully")
    } catch (error) {
      console.error("❌ Error sending security notifications:", error)
      throw error
    }
  }

  private async sendSlackNotification(alert: SecurityAlert): Promise<void> {
    if (!this.config.slack?.webhookUrl) return

    const color = alert.criticalVulns > 0 ? "danger" : alert.highVulns > 5 ? "warning" : "good"
    const emoji = alert.criticalVulns > 0 ? "🚨" : alert.highVulns > 5 ? "⚠️" : "📋"

    const payload = {
      channel: this.config.slack.channel || "#security",
      username: "Security Bot",
      icon_emoji: ":shield:",
      attachments: [
        {
          color: color,
          title: `${emoji} Security Scan Alert - ${alert.repository}`,
          fields: [
            {
              title: "Security Score",
              value: `${alert.securityScore}/100`,
              short: true,
            },
            {
              title: "Critical Vulnerabilities",
              value: alert.criticalVulns.toString(),
              short: true,
            },
            {
              title: "High Vulnerabilities",
              value: alert.highVulns.toString(),
              short: true,
            },
            {
              title: "Total Vulnerabilities",
              value: alert.totalVulns.toString(),
              short: true,
            },
            {
              title: "Branch",
              value: alert.branch,
              short: true,
            },
            {
              title: "Scan ID",
              value: alert.scanId,
              short: true,
            },
          ],
          text: alert.failedThresholds.length > 0 
            ? `*Failed Thresholds:* ${alert.failedThresholds.join(", ")}`
            : "All security thresholds passed",
          footer: "Security Vulnerability Scanner",
          ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
        },
      ],
    }

    if (alert.criticalVulns > 0 && this.config.slack.mention) {
      payload.attachments[0].text = `${this.config.slack.mention.map(user => `<@${user}>`).join(" ")} - ${payload.attachments[0].text}`
    }

    if (alert.scanUrl) {
      payload.attachments[0].title_link = alert.scanUrl
    }

    try {
      const response = await fetch(this.config.slack.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`)
      }

      console.log("✅ Slack notification sent")
    } catch (error) {
      console.error("❌ Failed to send Slack notification:", error)
      throw error
    }
  }

  private async sendEmailNotification(alert: SecurityAlert): Promise<void> {
    console.log("📧 Email notification would be sent here")
    // Implement email sending logic using your preferred email service
    // This is a placeholder implementation
  }

  private async createGitHubIssue(alert: SecurityAlert): Promise<void> {
    if (!this.config.github?.token) return

    const { owner, repo, token } = this.config.github

    const title = alert.criticalVulns > 0 
      ? `🚨 Critical Security Alert: ${alert.criticalVulns} critical vulnerabilities found`
      : `⚠️ Security Alert: ${alert.totalVulns} vulnerabilities found`

    const body = `## Security Vulnerability Report

**Scan ID**: ${alert.scanId}
**Timestamp**: ${alert.timestamp}
**Branch**: ${alert.branch}
**Security Score**: ${alert.securityScore}/100

### Vulnerability Summary
- 🚨 **Critical**: ${alert.criticalVulns}
- ⚠️ **High**: ${alert.highVulns}
- 📋 **Moderate**: ${alert.moderateVulns}
- 📝 **Low**: ${alert.lowVulns}
- **Total**: ${alert.totalVulns}

### Failed Security Thresholds
${alert.failedThresholds.length > 0 
  ? alert.failedThresholds.map(t => `- ${t}`).join("\n")
  : "✅ All thresholds passed"
}

### Recommendations
${alert.recommendations.map(r => `- ${r}`).join("\n")}

### Actions Required
${alert.criticalVulns > 0 ? `
#### 🚨 IMMEDIATE ACTION REQUIRED
- **Priority**: P0 - Critical
- **Deadline**: Fix within 24 hours
- Run \`npm audit fix\` to apply automatic fixes
- Manually update vulnerable dependencies if needed
` : ""}

${alert.highVulns > 5 ? `
#### ⚠️ HIGH PRIORITY
- Review and update high-severity vulnerabilities
- Consider updating dependency management practices
` : ""}

### Resources
${alert.scanUrl ? `- [View Scan Results](${alert.scanUrl})` : ""}
${alert.reportUrl ? `- [Detailed Report](${alert.reportUrl})` : ""}
- [Security Best Practices](https://docs.github.com/en/code-security)
- [NPM Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

**Auto-generated by Security Notification Service**`

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: "POST",
        headers: {
          "Authorization": `token ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          title,
          body,
          labels: ["security", "vulnerability", alert.criticalVulns > 0 ? "P0" : "P1", "automated"],
        }),
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const issue = await response.json()
      console.log(`✅ GitHub issue created: #${issue.number}`)
    } catch (error) {
      console.error("❌ Failed to create GitHub issue:", error)
      throw error
    }
  }

  private async sendTeamsNotification(alert: SecurityAlert): Promise<void> {
    if (!this.config.teams?.webhookUrl) return

    const color = alert.criticalVulns > 0 ? "Attention" : alert.highVulns > 5 ? "Warning" : "Good"
    const emoji = alert.criticalVulns > 0 ? "🚨" : alert.highVulns > 5 ? "⚠️" : "📋"

    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: alert.criticalVulns > 0 ? "FF0000" : alert.highVulns > 5 ? "FFA500" : "00FF00",
      summary: `Security Alert for ${alert.repository}`,
      sections: [
        {
          activityTitle: `${emoji} Security Scan Alert`,
          activitySubtitle: `Repository: ${alert.repository} | Branch: ${alert.branch}`,
          facts: [
            {
              name: "Security Score",
              value: `${alert.securityScore}/100`,
            },
            {
              name: "Critical Vulnerabilities",
              value: alert.criticalVulns.toString(),
            },
            {
              name: "High Vulnerabilities",
              value: alert.highVulns.toString(),
            },
            {
              name: "Total Vulnerabilities",
              value: alert.totalVulns.toString(),
            },
            {
              name: "Scan ID",
              value: alert.scanId,
            },
          ],
          markdown: true,
        },
      ],
    }

    if (alert.scanUrl) {
      payload.sections[0].potentialAction = [
        {
          "@type": "OpenUri",
          name: "View Scan Results",
          targets: [
            {
              os: "default",
              uri: alert.scanUrl,
            },
          ],
        },
      ]
    }

    try {
      const response = await fetch(this.config.teams.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Teams API error: ${response.status} ${response.statusText}`)
      }

      console.log("✅ Teams notification sent")
    } catch (error) {
      console.error("❌ Failed to send Teams notification:", error)
      throw error
    }
  }

  static createFromEnvironment(): SecurityNotificationService {
    const config: SecurityNotificationConfig = {}

    // Slack configuration
    if (process.env.SLACK_WEBHOOK_URL) {
      config.slack = {
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: process.env.SLACK_CHANNEL || "#security",
        mention: process.env.SLACK_MENTIONS?.split(",") || [],
      }
    }

    // Email configuration
    if (process.env.EMAIL_API_KEY) {
      config.email = {
        apiKey: process.env.EMAIL_API_KEY,
        from: process.env.EMAIL_FROM || "security@example.com",
        to: process.env.EMAIL_TO?.split(",") || [],
      }
    }

    // GitHub configuration
    if (process.env.GITHUB_TOKEN) {
      config.github = {
        token: process.env.GITHUB_TOKEN,
        owner: process.env.GITHUB_REPOSITORY?.split("/")[0] || "",
        repo: process.env.GITHUB_REPOSITORY?.split("/")[1] || "",
      }
    }

    // Teams configuration
    if (process.env.TEAMS_WEBHOOK_URL) {
      config.teams = {
        webhookUrl: process.env.TEAMS_WEBHOOK_URL,
      }
    }

    return new SecurityNotificationService(config)
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log("Usage: security-notification-service.ts [scan-results-file]")
    process.exit(1)
  }

  const resultsFile = args[0]
  
  if (!existsSync(resultsFile)) {
    console.error(`❌ Results file not found: ${resultsFile}`)
    process.exit(1)
  }

  try {
    const scanResults = JSON.parse(readFileSync(resultsFile, "utf-8"))
    
    const alert: SecurityAlert = {
      scanId: scanResults.scanId || "unknown",
      timestamp: scanResults.timestamp || new Date().toISOString(),
      repository: process.env.GITHUB_REPOSITORY || "unknown",
      branch: process.env.GITHUB_REF_NAME || "unknown",
      securityScore: scanResults.securityScore || 0,
      criticalVulns: scanResults.summary?.critical || 0,
      highVulns: scanResults.summary?.high || 0,
      moderateVulns: scanResults.summary?.medium || 0,
      lowVulns: scanResults.summary?.low || 0,
      totalVulns: scanResults.summary?.totalVulnerabilities || 0,
      failedThresholds: [],
      recommendations: scanResults.recommendations || [],
      scanUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : undefined,
    }

    // Determine failed thresholds
    if (alert.criticalVulns > 0) {
      alert.failedThresholds.push("Critical vulnerabilities found")
    }
    if (alert.highVulns > 5) {
      alert.failedThresholds.push("High vulnerabilities exceed threshold (5)")
    }
    if (alert.securityScore < 70) {
      alert.failedThresholds.push("Security score below threshold (70)")
    }

    const notificationService = SecurityNotificationService.createFromEnvironment()
    await notificationService.sendSecurityAlert(alert)

    console.log("✅ Security notification process completed")
  } catch (error) {
    console.error("❌ Security notification failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { SecurityNotificationService, type SecurityAlert, type SecurityNotificationConfig }