#!/usr/bin/env node

import { execSync } from "child_process"
import { readFileSync, writeFileSync, existsSync } from "fs"

interface CodeReviewReport {
  timestamp: string
  repository: string
  branch: string
  commit: string
  pullRequest?: {
    number: number
    title: string
    author: string
  }
  analysis: {
    eslint: {
      totalIssues: number
      errors: number
      warnings: number
      files: number
    }
    typescript: {
      errors: number
      files: number
    }
    security: {
      vulnerabilities: number
      high: number
      critical: number
    }
    sonarcloud?: {
      quality_gate: 'passed' | 'failed'
      bugs: number
      vulnerabilities: number
      code_smells: number
      coverage: number
      duplicated_lines: number
    }
  }
  qualityGate: {
    passed: boolean
    blockers: string[]
    warnings: string[]
  }
  recommendations: string[]
}

class CodeReviewNotificationService {
  private report: CodeReviewReport
  
  constructor() {
    this.report = {} as CodeReviewReport // Initialize empty
    this.report = this.generateReport() // Then populate
  }

  private generateReport(): CodeReviewReport {
    const timestamp = new Date().toISOString()
    const repository = process.env.GITHUB_REPOSITORY || 'unknown'
    const branch = process.env.GITHUB_REF_NAME || 'unknown'
    const commit = process.env.GITHUB_SHA || 'unknown'
    
    // Get PR info if available
    const pullRequest = process.env.GITHUB_EVENT_NAME === 'pull_request' ? {
      number: parseInt(process.env.GITHUB_PR_NUMBER || '0'),
      title: process.env.GITHUB_PR_TITLE || '',
      author: process.env.GITHUB_ACTOR || ''
    } : undefined

    const analysis = {
      eslint: this.parseESLintReport(),
      typescript: this.parseTypeScriptReport(),
      security: this.parseSecurityReport(),
      sonarcloud: this.parseSonarCloudReport()
    }

    // Create a temp report for quality gate evaluation
    const tempReport: CodeReviewReport = {
      timestamp,
      repository,
      branch,
      commit: commit.substring(0, 7),
      pullRequest,
      analysis,
      qualityGate: { passed: true, blockers: [], warnings: [] }, // temporary
      recommendations: []
    }

    // Now evaluate quality gate with proper data
    const qualityGate = this.evaluateQualityGateWithData(analysis)
    const recommendations = this.generateRecommendationsWithData(analysis)

    return {
      ...tempReport,
      qualityGate,
      recommendations
    }
  }

  private parseESLintReport(): CodeReviewReport['analysis']['eslint'] {
    try {
      if (existsSync('eslint-report.json')) {
        const data = JSON.parse(readFileSync('eslint-report.json', 'utf8'))
        const totalIssues = data.reduce((sum: number, file: any) => sum + file.messages.length, 0)
        const errors = data.reduce((sum: number, file: any) => 
          sum + file.messages.filter((m: any) => m.severity === 2).length, 0)
        const warnings = data.reduce((sum: number, file: any) => 
          sum + file.messages.filter((m: any) => m.severity === 1).length, 0)
        
        return {
          totalIssues,
          errors,
          warnings,
          files: data.length
        }
      }
    } catch (error) {
      console.warn('Failed to parse ESLint report:', error)
    }
    
    return { totalIssues: 0, errors: 0, warnings: 0, files: 0 }
  }

  private parseTypeScriptReport(): CodeReviewReport['analysis']['typescript'] {
    try {
      if (existsSync('typescript-report.txt')) {
        const data = readFileSync('typescript-report.txt', 'utf8')
        const errors = (data.match(/error TS/g) || []).length
        const files = (data.match(/\w+\.tsx?/g) || []).length
        
        return { errors, files }
      }
    } catch (error) {
      console.warn('Failed to parse TypeScript report:', error)
    }
    
    return { errors: 0, files: 0 }
  }

  private parseSecurityReport(): CodeReviewReport['analysis']['security'] {
    try {
      if (existsSync('security-audit.json')) {
        const data = JSON.parse(readFileSync('security-audit.json', 'utf8'))
        const metadata = data.metadata?.vulnerabilities || {}
        
        return {
          vulnerabilities: metadata.total || 0,
          high: metadata.high || 0,
          critical: metadata.critical || 0
        }
      }
    } catch (error) {
      console.warn('Failed to parse security report:', error)
    }
    
    return { vulnerabilities: 0, high: 0, critical: 0 }
  }

  private parseSonarCloudReport(): CodeReviewReport['analysis']['sonarcloud'] | undefined {
    // SonarCloud results would typically be available via API
    // For now, we'll return undefined as this would require API integration
    return undefined
  }

  private evaluateQualityGateWithData(analysis: CodeReviewReport['analysis']): CodeReviewReport['qualityGate'] {
    const blockers: string[] = []
    const warnings: string[] = []

    // Check for blockers
    if (analysis.eslint.errors > 10) {
      blockers.push(`Too many ESLint errors: ${analysis.eslint.errors}`)
    }

    if (analysis.typescript.errors > 0) {
      blockers.push(`TypeScript compilation errors: ${analysis.typescript.errors}`)
    }

    if (analysis.security.critical > 0) {
      blockers.push(`Critical security vulnerabilities: ${analysis.security.critical}`)
    }

    if (analysis.security.high > 2) {
      blockers.push(`High security vulnerabilities: ${analysis.security.high}`)
    }

    // Check for warnings
    if (analysis.eslint.warnings > 50) {
      warnings.push(`Many ESLint warnings: ${analysis.eslint.warnings}`)
    }

    if (analysis.security.vulnerabilities > 0) {
      warnings.push(`Security vulnerabilities found: ${analysis.security.vulnerabilities}`)
    }

    return {
      passed: blockers.length === 0,
      blockers,
      warnings
    }
  }

  private generateRecommendationsWithData(analysis: CodeReviewReport['analysis']): string[] {
    const recommendations: string[] = []

    if (analysis.eslint.errors > 0) {
      recommendations.push("Fix ESLint errors to improve code quality")
    }

    if (analysis.eslint.warnings > 20) {
      recommendations.push("Address ESLint warnings to maintain code standards")
    }

    if (analysis.typescript.errors > 0) {
      recommendations.push("Resolve TypeScript compilation errors")
    }

    if (analysis.security.vulnerabilities > 0) {
      recommendations.push("Update dependencies to fix security vulnerabilities")
    }

    if (recommendations.length === 0) {
      recommendations.push("Code quality looks good! Continue following best practices")
    }

    return recommendations
  }

  async sendNotifications(): Promise<void> {
    try {
      // Save the report
      writeFileSync('code-review-report.json', JSON.stringify(this.report, null, 2))
      
      console.log("📊 Code Review Report Generated")
      console.log("=" .repeat(50))
      console.log(`Repository: ${this.report.repository}`)
      console.log(`Branch: ${this.report.branch}`)
      console.log(`Commit: ${this.report.commit}`)
      
      if (this.report.pullRequest) {
        console.log(`PR #${this.report.pullRequest.number}: ${this.report.pullRequest.title}`)
        console.log(`Author: ${this.report.pullRequest.author}`)
      }
      
      console.log("\n🔍 Analysis Results:")
      console.log(`  ESLint: ${this.report.analysis.eslint.errors} errors, ${this.report.analysis.eslint.warnings} warnings`)
      console.log(`  TypeScript: ${this.report.analysis.typescript.errors} errors`)
      console.log(`  Security: ${this.report.analysis.security.vulnerabilities} vulnerabilities`)
      
      console.log(`\n🚦 Quality Gate: ${this.report.qualityGate.passed ? '✅ PASSED' : '❌ FAILED'}`)
      
      if (this.report.qualityGate.blockers.length > 0) {
        console.log("\n🚫 Blockers:")
        this.report.qualityGate.blockers.forEach(blocker => console.log(`  - ${blocker}`))
      }
      
      if (this.report.qualityGate.warnings.length > 0) {
        console.log("\n⚠️ Warnings:")
        this.report.qualityGate.warnings.forEach(warning => console.log(`  - ${warning}`))
      }
      
      console.log("\n💡 Recommendations:")
      this.report.recommendations.forEach(rec => console.log(`  - ${rec}`))

      // Send in-app notifications for serious issues
      if (!this.report.qualityGate.passed) {
        await this.sendTeamAlert()
      }

      // Send summary notification
      await this.sendSummaryNotification()

    } catch (error) {
      console.error("❌ Failed to send notifications:", error)
    }
  }

  private async sendTeamAlert(): Promise<void> {
    try {
      const message = `🚨 Code Review Alert: Quality gate failed for ${this.report.repository}`;
      const details = {
        repository: this.report.repository,
        branch: this.report.branch,
        commit: this.report.commit,
        blockers: this.report.qualityGate.blockers,
        pullRequest: this.report.pullRequest
      };

      // Simple console log instead of complex notification service
      console.log("📱 Team alert notification:", message);
      console.log("   Details:", JSON.stringify(details, null, 2));
      
    } catch (error) {
      console.warn("Failed to send team alert:", error);
    }
  }

  private async sendSummaryNotification(): Promise<void> {
    try {
      const status = this.report.qualityGate.passed ? 'passed' : 'failed';
      const emoji = this.report.qualityGate.passed ? '✅' : '❌';
      
      const message = `${emoji} Code Review ${status} for ${this.report.repository}`;
      const summary = {
        eslint: `${this.report.analysis.eslint.errors}E/${this.report.analysis.eslint.warnings}W`,
        typescript: `${this.report.analysis.typescript.errors} errors`,
        security: `${this.report.analysis.security.vulnerabilities} vulns`,
        status: status
      };

      // Simple console log instead of complex notification service
      console.log("📋 Summary notification:", message);
      console.log("   Summary:", JSON.stringify(summary, null, 2));

    } catch (error) {
      console.warn("Failed to send summary notification:", error);
    }
  }

  getReport(): CodeReviewReport {
    return this.report
  }
}

// CLI execution
async function main() {
  try {
    console.log("🚀 Starting code review notification service...")
    
    const notificationService = new CodeReviewNotificationService()
    await notificationService.sendNotifications()
    
    const report = notificationService.getReport()
    
    // Exit with appropriate code
    if (!report.qualityGate.passed) {
      console.log("\n❌ Code review failed - quality gate not passed")
      process.exit(1)
    } else {
      console.log("\n✅ Code review passed - all checks successful")
      process.exit(0)
    }
    
  } catch (error) {
    console.error("❌ Code review notification failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { CodeReviewNotificationService, type CodeReviewReport }