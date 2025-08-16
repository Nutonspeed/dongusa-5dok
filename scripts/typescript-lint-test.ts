#!/usr/bin/env tsx

/**
 * TypeScript and Linting Test Script
 * ทดสอบ TypeScript compilation และ code quality
 */

import { execSync } from "child_process"
import { existsSync, readFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

interface LintResult {
  file: string
  errors: number
  warnings: number
  issues: string[]
}

interface TypeCheckResult {
  file: string
  errors: string[]
}

class TypeScriptLintTester {
  private tsErrors: TypeCheckResult[] = []
  private lintResults: LintResult[] = []
  private startTime = Date.now()

  private log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      reset: "\x1b[0m",
    }

    console.log(`${colors[type]}[TS-LINT-TEST] ${message}${colors.reset}`)
  }

  private async runTypeCheck(): Promise<boolean> {
    this.log("Running TypeScript compilation check...", "info")

    try {
      const output = execSync("npx tsc --noEmit --pretty", {
        encoding: "utf8",
        stdio: "pipe",
      })

      this.log("✓ TypeScript compilation successful", "success")
      return true
    } catch (error: any) {
      this.log("✗ TypeScript compilation failed", "error")

      // Parse TypeScript errors
      const errorLines = error.stdout?.split("\n") || []
      let currentFile = ""
      let currentErrors: string[] = []

      errorLines.forEach((line: string) => {
        if (line.includes(".ts(") || line.includes(".tsx(")) {
          if (currentFile && currentErrors.length > 0) {
            this.tsErrors.push({
              file: currentFile,
              errors: [...currentErrors],
            })
          }
          currentFile = line.split("(")[0]
          currentErrors = [line]
        } else if (line.trim() && currentFile) {
          currentErrors.push(line)
        }
      })

      if (currentFile && currentErrors.length > 0) {
        this.tsErrors.push({
          file: currentFile,
          errors: currentErrors,
        })
      }

      return false
    }
  }

  private async runLinting(): Promise<boolean> {
    this.log("Running ESLint check...", "info")

    try {
      const output = execSync("npx eslint . --ext .ts,.tsx,.js,.jsx --format json", {
        encoding: "utf8",
        stdio: "pipe",
      })

      const results = JSON.parse(output)
      let hasErrors = false

      results.forEach((result: any) => {
        if (result.messages.length > 0) {
          const errors = result.messages.filter((msg: any) => msg.severity === 2).length
          const warnings = result.messages.filter((msg: any) => msg.severity === 1).length

          this.lintResults.push({
            file: result.filePath,
            errors,
            warnings,
            issues: result.messages.map((msg: any) => `Line ${msg.line}: ${msg.message} (${msg.ruleId})`),
          })

          if (errors > 0) hasErrors = true
        }
      })

      if (!hasErrors) {
        this.log("✓ ESLint check passed", "success")
      } else {
        this.log("✗ ESLint found errors", "error")
      }

      return !hasErrors
    } catch (error: any) {
      this.log(`✗ ESLint failed: ${error.message}`, "error")
      return false
    }
  }

  private checkTSConfigFiles(): boolean {
    this.log("Checking TypeScript configuration files...", "info")

    const configFiles = ["tsconfig.json", "next.config.mjs", ".eslintrc.json"]

    let allValid = true

    configFiles.forEach((file) => {
      if (!existsSync(file)) {
        this.log(`✗ Missing config file: ${file}`, "error")
        allValid = false
        return
      }

      try {
        if (file.endsWith(".json")) {
          JSON.parse(readFileSync(file, "utf8"))
        }
        this.log(`✓ ${file} is valid`, "success")
      } catch (error) {
        this.log(`✗ Invalid ${file}: ${error}`, "error")
        allValid = false
      }
    })

    return allValid
  }

  private scanForCommonIssues(): void {
    this.log("Scanning for common TypeScript issues...", "info")

    const scanDirectory = (dir: string) => {
      const entries = readdirSync(dir)

      entries.forEach((entry) => {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !entry.startsWith(".") && entry !== "node_modules") {
          scanDirectory(fullPath)
        } else if (stat.isFile() && [".ts", ".tsx"].includes(extname(entry))) {
          this.checkFileForIssues(fullPath)
        }
      })
    }

    scanDirectory(".")
  }

  private checkFileForIssues(filePath: string): void {
    try {
      const content = readFileSync(filePath, "utf8")
      const issues: string[] = []

      // Check for common issues
      if (content.includes("any")) {
        issues.push("Contains 'any' type - consider using specific types")
      }

      if (content.includes("// @ts-ignore")) {
        issues.push("Contains @ts-ignore - consider fixing the underlying issue")
      }

      if (content.includes("console.log") && !content.includes("[v0]")) {
        issues.push("Contains console.log statements - consider removing for production")
      }

      if (content.includes("TODO") || content.includes("FIXME")) {
        issues.push("Contains TODO/FIXME comments")
      }

      if (issues.length > 0) {
        this.log(`⚠ ${filePath}: ${issues.join(", ")}`, "warning")
      }
    } catch (error) {
      // Ignore files that can't be read
    }
  }

  private generateReport(): void {
    const totalTime = Date.now() - this.startTime

    this.log("=".repeat(60), "info")
    this.log("TYPESCRIPT & LINTING REPORT", "info")
    this.log("=".repeat(60), "info")

    // TypeScript errors
    if (this.tsErrors.length > 0) {
      this.log("TypeScript Errors:", "error")
      this.tsErrors.forEach((result) => {
        this.log(`  ${result.file}:`, "error")
        result.errors.forEach((error) => {
          this.log(`    ${error}`, "error")
        })
      })
    } else {
      this.log("✓ No TypeScript errors found", "success")
    }

    // Linting results
    if (this.lintResults.length > 0) {
      this.log("Linting Issues:", "warning")
      this.lintResults.forEach((result) => {
        if (result.errors > 0 || result.warnings > 0) {
          this.log(
            `  ${result.file}: ${result.errors} errors, ${result.warnings} warnings`,
            result.errors > 0 ? "error" : "warning",
          )
          result.issues.forEach((issue) => {
            this.log(`    ${issue}`, result.errors > 0 ? "error" : "warning")
          })
        }
      })
    } else {
      this.log("✓ No linting issues found", "success")
    }

    this.log("=".repeat(60), "info")
    this.log(`Total Time: ${totalTime}ms`, "info")

    const hasErrors = this.tsErrors.length > 0 || this.lintResults.some((r) => r.errors > 0)

    if (!hasErrors) {
      this.log("🎉 TYPESCRIPT & LINTING TEST PASSED!", "success")
    } else {
      this.log("❌ TYPESCRIPT & LINTING TEST FAILED!", "error")
    }
  }

  async runAllTests(): Promise<boolean> {
    this.log("Starting TypeScript and Linting tests...", "info")

    // 1. Check config files
    const configValid = this.checkTSConfigFiles()

    // 2. Run TypeScript compilation
    const tsValid = await this.runTypeCheck()

    // 3. Run linting
    const lintValid = await this.runLinting()

    // 4. Scan for common issues
    this.scanForCommonIssues()

    // 5. Generate report
    this.generateReport()

    return configValid && tsValid && lintValid
  }
}

// Run the test
const tester = new TypeScriptLintTester()
tester
  .runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("TypeScript/Lint test failed with error:", error)
    process.exit(1)
  })
