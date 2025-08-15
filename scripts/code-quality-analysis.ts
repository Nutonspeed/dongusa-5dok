#!/usr/bin/env node

import { execSync } from "child_process"
import { readFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

interface QualityIssue {
  file: string
  line?: number
  column?: number
  severity: "error" | "warning" | "info"
  rule: string
  message: string
  category: "typescript" | "eslint" | "complexity" | "duplication" | "unused" | "imports"
}

interface QualityReport {
  timestamp: string
  summary: {
    totalFiles: number
    totalIssues: number
    errors: number
    warnings: number
    info: number
  }
  issues: QualityIssue[]
  metrics: {
    codeComplexity: number
    duplicatedLines: number
    unusedExports: number
    circularDependencies: string[]
  }
  recommendations: string[]
}

class CodeQualityAnalyzer {
  private projectRoot: string
  private issues: QualityIssue[] = []
  private metrics = {
    codeComplexity: 0,
    duplicatedLines: 0,
    unusedExports: 0,
    circularDependencies: [] as string[],
  }

  constructor() {
    this.projectRoot = process.cwd()
  }

  async analyze(): Promise<QualityReport> {
    console.log("🔍 Starting Code Quality Analysis...\n")

    // Run TypeScript check
    await this.checkTypeScript()

    // Run ESLint analysis
    await this.runESLintAnalysis()

    // Analyze code complexity
    await this.analyzeComplexity()

    // Check for unused code
    await this.checkUnusedCode()

    // Check for circular dependencies
    await this.checkCircularDependencies()

    // Analyze code duplication
    await this.analyzeDuplication()

    return this.generateReport()
  }

  private async checkTypeScript(): Promise<void> {
    console.log("📝 Checking TypeScript...")

    try {
      execSync("npx tsc --noEmit --skipLibCheck", {
        stdio: "pipe",
        cwd: this.projectRoot,
      })
      console.log("✅ TypeScript check passed")
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || ""
      this.parseTypeScriptErrors(output)
      console.log(`❌ Found ${this.issues.filter((i) => i.category === "typescript").length} TypeScript issues`)
    }
  }

  private parseTypeScriptErrors(output: string): void {
    const lines = output.split("\n")

    for (const line of lines) {
      const match = line.match(/^(.+?)$$(\d+),(\d+)$$: (error|warning) TS(\d+): (.+)$/)
      if (match) {
        const [, file, lineNum, column, severity, code, message] = match

        this.issues.push({
          file: file.replace(this.projectRoot + "/", ""),
          line: Number.parseInt(lineNum),
          column: Number.parseInt(column),
          severity: severity as "error" | "warning",
          rule: `TS${code}`,
          message,
          category: "typescript",
        })
      }
    }
  }

  private async runESLintAnalysis(): Promise<void> {
    console.log("🔧 Running ESLint analysis...")

    try {
      const output = execSync("npx eslint . --ext .ts,.tsx,.js,.jsx --format json", {
        stdio: "pipe",
        cwd: this.projectRoot,
      }).toString()

      const results = JSON.parse(output)
      this.parseESLintResults(results)
      console.log(
        `✅ ESLint analysis completed - ${this.issues.filter((i) => i.category === "eslint").length} issues found`,
      )
    } catch (error: any) {
      if (error.stdout) {
        try {
          const results = JSON.parse(error.stdout.toString())
          this.parseESLintResults(results)
        } catch {
          console.log("⚠️ ESLint analysis failed")
        }
      }
    }
  }

  private parseESLintResults(results: any[]): void {
    for (const result of results) {
      for (const message of result.messages) {
        this.issues.push({
          file: result.filePath.replace(this.projectRoot + "/", ""),
          line: message.line,
          column: message.column,
          severity: message.severity === 2 ? "error" : "warning",
          rule: message.ruleId || "unknown",
          message: message.message,
          category: "eslint",
        })
      }
    }
  }

  private async analyzeComplexity(): Promise<void> {
    console.log("📊 Analyzing code complexity...")

    const files = this.getSourceFiles()
    let totalComplexity = 0
    let fileCount = 0

    for (const file of files) {
      try {
        const content = readFileSync(file, "utf-8")
        const complexity = this.calculateCyclomaticComplexity(content)
        totalComplexity += complexity
        fileCount++

        if (complexity > 10) {
          this.issues.push({
            file: file.replace(this.projectRoot + "/", ""),
            severity: complexity > 20 ? "error" : "warning",
            rule: "complexity",
            message: `High cyclomatic complexity: ${complexity}`,
            category: "complexity",
          })
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    this.metrics.codeComplexity = fileCount > 0 ? Math.round(totalComplexity / fileCount) : 0
    console.log(`✅ Average complexity: ${this.metrics.codeComplexity}`)
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Simple cyclomatic complexity calculation
    const complexityKeywords = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b\?\b/g,
      /\b&&\b/g,
      /\b\|\|\b/g,
    ]

    let complexity = 1 // Base complexity

    for (const pattern of complexityKeywords) {
      const matches = code.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    }

    return complexity
  }

  private async checkUnusedCode(): Promise<void> {
    console.log("🗑️ Checking for unused code...")

    try {
      // Check for unused exports using ts-unused-exports
      const output = execSync("npx ts-unused-exports tsconfig.json --excludePathsFromReport=node_modules", {
        stdio: "pipe",
        cwd: this.projectRoot,
      }).toString()

      const unusedExports = output.split("\n").filter((line) => line.trim())
      this.metrics.unusedExports = unusedExports.length

      for (const unused of unusedExports.slice(0, 10)) {
        // Limit to first 10
        if (unused.trim()) {
          this.issues.push({
            file: unused.split(":")[0] || "unknown",
            severity: "info",
            rule: "unused-export",
            message: `Unused export: ${unused}`,
            category: "unused",
          })
        }
      }

      console.log(`✅ Found ${this.metrics.unusedExports} unused exports`)
    } catch (error) {
      console.log("⚠️ Unused code check skipped (ts-unused-exports not available)")
    }
  }

  private async checkCircularDependencies(): Promise<void> {
    console.log("🔄 Checking for circular dependencies...")

    try {
      const output = execSync("npx madge --circular --extensions ts,tsx,js,jsx .", {
        stdio: "pipe",
        cwd: this.projectRoot,
      }).toString()

      if (output.includes("✖")) {
        const lines = output.split("\n")
        for (const line of lines) {
          if (line.includes("->")) {
            this.metrics.circularDependencies.push(line.trim())

            this.issues.push({
              file: "multiple",
              severity: "warning",
              rule: "circular-dependency",
              message: `Circular dependency: ${line.trim()}`,
              category: "imports",
            })
          }
        }
      }

      console.log(`✅ Found ${this.metrics.circularDependencies.length} circular dependencies`)
    } catch (error) {
      console.log("⚠️ Circular dependency check skipped (madge not available)")
    }
  }

  private async analyzeDuplication(): Promise<void> {
    console.log("📋 Analyzing code duplication...")

    const files = this.getSourceFiles()
    const codeBlocks = new Map<string, string[]>()

    for (const file of files) {
      try {
        const content = readFileSync(file, "utf-8")
        const lines = content.split("\n")

        // Check for duplicated blocks of 5+ lines
        for (let i = 0; i <= lines.length - 5; i++) {
          const block = lines
            .slice(i, i + 5)
            .join("\n")
            .trim()
          if (block.length > 50) {
            // Ignore very short blocks
            if (!codeBlocks.has(block)) {
              codeBlocks.set(block, [])
            }
            codeBlocks.get(block)!.push(`${file}:${i + 1}`)
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    let duplicatedLines = 0
    for (const [block, locations] of codeBlocks) {
      if (locations.length > 1) {
        duplicatedLines += 5 * (locations.length - 1)

        this.issues.push({
          file: locations[0].split(":")[0].replace(this.projectRoot + "/", ""),
          line: Number.parseInt(locations[0].split(":")[1]),
          severity: "info",
          rule: "code-duplication",
          message: `Duplicated code block found in ${locations.length} locations`,
          category: "duplication",
        })
      }
    }

    this.metrics.duplicatedLines = duplicatedLines
    console.log(`✅ Found ${duplicatedLines} duplicated lines`)
  }

  private getSourceFiles(): string[] {
    const files: string[] = []
    const extensions = [".ts", ".tsx", ".js", ".jsx"]
    const excludeDirs = ["node_modules", ".next", "dist", "build", ".git"]

    const scanDir = (dir: string): void => {
      try {
        const entries = readdirSync(dir)

        for (const entry of entries) {
          const fullPath = join(dir, entry)
          const stat = statSync(fullPath)

          if (stat.isDirectory() && !excludeDirs.includes(entry)) {
            scanDir(fullPath)
          } else if (stat.isFile() && extensions.includes(extname(entry))) {
            files.push(fullPath)
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    }

    scanDir(this.projectRoot)
    return files
  }

  private generateReport(): QualityReport {
    const errors = this.issues.filter((i) => i.severity === "error").length
    const warnings = this.issues.filter((i) => i.severity === "warning").length
    const info = this.issues.filter((i) => i.severity === "info").length

    const recommendations = this.generateRecommendations()

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.getSourceFiles().length,
        totalIssues: this.issues.length,
        errors,
        warnings,
        info,
      },
      issues: this.issues,
      metrics: this.metrics,
      recommendations,
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.issues.filter((i) => i.category === "typescript").length > 0) {
      recommendations.push("Fix TypeScript errors to improve type safety")
    }

    if (this.issues.filter((i) => i.category === "eslint" && i.severity === "error").length > 0) {
      recommendations.push("Address ESLint errors to maintain code quality standards")
    }

    if (this.metrics.codeComplexity > 8) {
      recommendations.push("Consider refactoring complex functions to improve maintainability")
    }

    if (this.metrics.unusedExports > 10) {
      recommendations.push("Remove unused exports to reduce bundle size")
    }

    if (this.metrics.circularDependencies.length > 0) {
      recommendations.push("Resolve circular dependencies to improve module structure")
    }

    if (this.metrics.duplicatedLines > 50) {
      recommendations.push("Extract common code into reusable functions or components")
    }

    if (recommendations.length === 0) {
      recommendations.push("Code quality looks good! Continue following best practices")
    }

    return recommendations
  }
}

// Main execution
async function main() {
  const analyzer = new CodeQualityAnalyzer()

  try {
    const report = await analyzer.analyze()

    console.log("\n📊 Code Quality Report")
    console.log("=".repeat(50))
    console.log(`Total Files: ${report.summary.totalFiles}`)
    console.log(`Total Issues: ${report.summary.totalIssues}`)
    console.log(`  - Errors: ${report.summary.errors}`)
    console.log(`  - Warnings: ${report.summary.warnings}`)
    console.log(`  - Info: ${report.summary.info}`)
    console.log(`\nMetrics:`)
    console.log(`  - Average Complexity: ${report.metrics.codeComplexity}`)
    console.log(`  - Duplicated Lines: ${report.metrics.duplicatedLines}`)
    console.log(`  - Unused Exports: ${report.metrics.unusedExports}`)
    console.log(`  - Circular Dependencies: ${report.metrics.circularDependencies.length}`)

    console.log("\n💡 Recommendations:")
    report.recommendations.forEach((rec) => console.log(`  - ${rec}`))

    // Write detailed report to file
    const fs = require("fs")
    fs.writeFileSync("code-quality-report.json", JSON.stringify(report, null, 2))
    console.log("\n📄 Detailed report saved to: code-quality-report.json")

    // Exit with error code if there are critical issues
    if (report.summary.errors > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Code quality analysis failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { CodeQualityAnalyzer, type QualityReport, type QualityIssue }
