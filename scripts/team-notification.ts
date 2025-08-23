#!/usr/bin/env node

import { readFileSync, existsSync } from "fs"

interface WebhookPayload {
  text: string
  attachments?: Array<{
    color: string
    title: string
    text: string
    fields: Array<{
      title: string
      value: string
      short: boolean
    }>
    footer: string
    ts: number
  }>
}

interface NotificationChannel {
  name: string
  webhook: string
  enabled: boolean
  filters: {
    branches: string[]
    events: string[]
    severity: string[]
  }
}

class TeamNotificationService {
  private channels: NotificationChannel[] = []
  private report: any = null

  constructor() {
    this.loadConfiguration()
    this.loadReport()
  }

  private loadConfiguration(): void {
    // Default configuration
    this.channels = [
      {
        name: "development-team",
        webhook: process.env.DEV_TEAM_WEBHOOK || "",
        enabled: !!process.env.DEV_TEAM_WEBHOOK,
        filters: {
          branches: ["main", "develop"],
          events: ["pull_request", "push"],
          severity: ["high", "critical"]
        }
      },
      {
        name: "qa-team", 
        webhook: process.env.QA_TEAM_WEBHOOK || "",
        enabled: !!process.env.QA_TEAM_WEBHOOK,
        filters: {
          branches: ["main"],
          events: ["push"],
          severity: ["medium", "high", "critical"]
        }
      },
      {
        name: "security-team",
        webhook: process.env.SECURITY_TEAM_WEBHOOK || "",
        enabled: !!process.env.SECURITY_TEAM_WEBHOOK,
        filters: {
          branches: ["main", "develop"],
          events: ["pull_request", "push"], 
          severity: ["critical"]
        }
      }
    ]

    // Load custom configuration if exists
    if (existsSync('.github/notifications.json')) {
      try {
        const config = JSON.parse(readFileSync('.github/notifications.json', 'utf8'))
        this.channels = [...this.channels, ...config.channels]
      } catch (error) {
        console.warn("Failed to load notification configuration:", error)
      }
    }
  }

  private loadReport(): void {
    try {
      if (existsSync('code-review-report.json')) {
        this.report = JSON.parse(readFileSync('code-review-report.json', 'utf8'))
      }
    } catch (error) {
      console.warn("Failed to load code review report:", error)
    }
  }

  private shouldNotifyChannel(channel: NotificationChannel): boolean {
    if (!channel.enabled || !this.report) return false

    const branch = process.env.GITHUB_REF_NAME || 'unknown'
    const event = process.env.GITHUB_EVENT_NAME || 'unknown'
    
    // Check branch filter
    if (channel.filters.branches.length > 0 && 
        !channel.filters.branches.includes(branch)) {
      return false
    }

    // Check event filter
    if (channel.filters.events.length > 0 && 
        !channel.filters.events.includes(event)) {
      return false
    }

    // Check severity filter
    const severity = this.determineSeverity()
    if (channel.filters.severity.length > 0 && 
        !channel.filters.severity.includes(severity)) {
      return false
    }

    return true
  }

  private determineSeverity(): string {
    if (!this.report) return 'low'

    const { analysis, qualityGate } = this.report

    // Critical: TypeScript errors, critical security vulns, quality gate failed
    if (analysis.typescript.errors > 0 || 
        analysis.security.critical > 0 || 
        !qualityGate.passed) {
      return 'critical'
    }

    // High: Many ESLint errors, high security vulns
    if (analysis.eslint.errors > 10 || 
        analysis.security.high > 0) {
      return 'high'
    }

    // Medium: Some ESLint errors, security vulnerabilities
    if (analysis.eslint.errors > 0 || 
        analysis.security.vulnerabilities > 0) {
      return 'medium'
    }

    return 'low'
  }

  private createWebhookPayload(channel: NotificationChannel): WebhookPayload {
    if (!this.report) {
      return {
        text: "❌ Code review report not available"
      }
    }

    const { repository, branch, commit, pullRequest, analysis, qualityGate } = this.report
    const severity = this.determineSeverity()
    const status = qualityGate.passed ? "✅ PASSED" : "❌ FAILED"
    const color = qualityGate.passed ? "good" : severity === "critical" ? "danger" : "warning"

    const payload: WebhookPayload = {
      text: `🔍 Code Review ${status}: ${repository}`,
      attachments: [{
        color,
        title: `Code Review Results - ${repository}`,
        text: pullRequest 
          ? `PR #${pullRequest.number}: ${pullRequest.title} by ${pullRequest.author}`
          : `Push to ${branch} (${commit})`,
        fields: [
          {
            title: "ESLint",
            value: `${analysis.eslint.errors} errors, ${analysis.eslint.warnings} warnings`,
            short: true
          },
          {
            title: "TypeScript", 
            value: `${analysis.typescript.errors} errors`,
            short: true
          },
          {
            title: "Security",
            value: `${analysis.security.vulnerabilities} vulnerabilities (${analysis.security.critical} critical, ${analysis.security.high} high)`,
            short: false
          },
          {
            title: "Quality Gate",
            value: qualityGate.passed ? "✅ Passed" : `❌ Failed (${qualityGate.blockers.length} blockers)`,
            short: true
          },
          {
            title: "Severity",
            value: severity.toUpperCase(),
            short: true
          }
        ],
        footer: "Automated Code Review System",
        ts: Math.floor(Date.now() / 1000)
      }]
    }

    // Add blockers if quality gate failed
    if (!qualityGate.passed && qualityGate.blockers.length > 0) {
      payload.attachments![0].fields.push({
        title: "🚫 Blockers",
        value: qualityGate.blockers.join('\n'),
        short: false
      })
    }

    // Add GitHub Actions link
    if (process.env.GITHUB_RUN_ID) {
      const actionsUrl = `https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`
      payload.attachments![0].fields.push({
        title: "📊 Full Report", 
        value: `<${actionsUrl}|View in GitHub Actions>`,
        short: false
      })
    }

    return payload
  }

  async sendNotifications(): Promise<void> {
    console.log("📢 Sending team notifications...")

    let notificationsSent = 0
    
    for (const channel of this.channels) {
      if (!this.shouldNotifyChannel(channel)) {
        console.log(`⏭️ Skipping ${channel.name} (filtered out)`)
        continue
      }

      try {
        const payload = this.createWebhookPayload(channel)
        await this.sendWebhook(channel.webhook, payload)
        console.log(`✅ Notification sent to ${channel.name}`)
        notificationsSent++
      } catch (error) {
        console.error(`❌ Failed to send notification to ${channel.name}:`, error)
      }
    }

    console.log(`📱 Notifications complete: ${notificationsSent}/${this.channels.filter(c => c.enabled).length} sent`)
  }

  private async sendWebhook(webhookUrl: string, payload: WebhookPayload): Promise<void> {
    if (!webhookUrl) {
      throw new Error("Webhook URL not configured")
    }

    const https = require('https')
    const { URL } = require('url')

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload)
      const url = new URL(webhookUrl)
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }

      const req = https.request(options, (res: any) => {
        let responseData = ''
        
        res.on('data', (chunk: string) => {
          responseData += chunk
        })
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve()
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`))
          }
        })
      })

      req.on('error', (error: Error) => {
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      req.setTimeout(10000) // 10 second timeout
      req.write(data)
      req.end()
    })
  }

  async sendTestNotification(channelName?: string): Promise<void> {
    console.log("🧪 Sending test notification...")

    const testPayload: WebhookPayload = {
      text: "🧪 Test notification from Automated Code Review System",
      attachments: [{
        color: "good",
        title: "Test Notification",
        text: "This is a test to verify webhook integration is working correctly.",
        fields: [
          {
            title: "Status",
            value: "✅ System Operational",
            short: true
          },
          {
            title: "Timestamp",
            value: new Date().toISOString(),
            short: true
          }
        ],
        footer: "Automated Code Review System",
        ts: Math.floor(Date.now() / 1000)
      }]
    }

    const channelsToTest = channelName 
      ? this.channels.filter(c => c.name === channelName)
      : this.channels.filter(c => c.enabled)

    for (const channel of channelsToTest) {
      try {
        await this.sendWebhook(channel.webhook, testPayload)
        console.log(`✅ Test notification sent to ${channel.name}`)
      } catch (error) {
        console.error(`❌ Failed to send test notification to ${channel.name}:`, error)
      }
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const service = new TeamNotificationService()

  try {
    switch (command) {
      case 'test':
        const channelName = args[1]
        await service.sendTestNotification(channelName)
        break
      
      case 'send':
      default:
        await service.sendNotifications()
        break
    }
  } catch (error) {
    console.error("❌ Team notification failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { TeamNotificationService }