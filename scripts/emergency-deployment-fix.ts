#!/usr/bin/env tsx

/**
 * Emergency Deployment Fix Script
 * แก้ไขปัญหาการ deploy เร่งด่วน
 */

import { execSync } from "child_process"
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs"
import { join } from "path"

interface FixResult {
  step: string
  status: "success" | "error" | "skipped"
  message: string
}

class EmergencyDeploymentFixer {
  private results: FixResult[] = []
  private projectRoot: string

  constructor() {
    this.projectRoot = process.cwd()
  }

  private log(step: string, status: "success" | "error" | "skipped", message: string) {
    const icon = status === "success" ? "✅" : status === "error" ? "❌" : "⏭️"
    console.log(`${icon} ${step}: ${message}`)
    this.results.push({ step, status, message })
  }

  private fixFileExtensions(): void {
    const problematicFiles = ["app/admin/layout.client", "app/admin/page.client", "app/admin/loading.client"]

    problematicFiles.forEach((file) => {
      const filePath = join(this.projectRoot, file)
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath)
          this.log("File Extension Fix", "success", `Removed ${file}`)
        } catch (error) {
          this.log("File Extension Fix", "error", `Failed to remove ${file}: ${error}`)
        }
      } else {
        this.log("File Extension Fix", "skipped", `${file} already removed`)
      }
    })
  }

  private fixPackageDependencies(): void {
    const packagePath = join(this.projectRoot, "package.json")

    try {
      const packageContent = readFileSync(packagePath, "utf8")
      const packageJson = JSON.parse(packageContent)

      // Remove built-in Node.js modules
      const builtInModules = ["crypto", "fs", "path", "util", "child_process"]
      let removed = 0

      builtInModules.forEach((module) => {
        if (packageJson.dependencies?.[module]) {
          delete packageJson.dependencies[module]
          removed++
        }
      })

      // Fix version compatibility
      if (packageJson.dependencies) {
        packageJson.dependencies.next = "^14.2.5"
        packageJson.dependencies.react = "^18.2.0"
        packageJson.dependencies["react-dom"] = "^18.2.0"
      }

      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
      this.log("Package Dependencies", "success", `Removed ${removed} built-in modules, fixed versions`)
    } catch (error) {
      this.log("Package Dependencies", "error", `Failed to fix package.json: ${error}`)
    }
  }

  private fixNextConfig(): void {
    const configPath = join(this.projectRoot, "next.config.mjs")

    try {
      let configContent = readFileSync(configPath, "utf8")

      // Remove deprecated options
      configContent = configContent.replace(/missingSuspenseWithCSRBailout:\s*true,?\s*\n?/g, "")
      configContent = configContent.replace(/swcMinify:\s*true,?\s*\n?/g, "")

      // Clean up empty lines and trailing commas
      configContent = configContent.replace(/,(\s*\n\s*})/g, "$1")
      configContent = configContent.replace(/\n\s*\n\s*\n/g, "\n\n")

      writeFileSync(configPath, configContent)
      this.log("Next.js Config", "success", "Removed deprecated options")
    } catch (error) {
      this.log("Next.js Config", "error", `Failed to fix next.config.mjs: ${error}`)
    }
  }

  private fixVercelConfig(): void {
    const vercelPath = join(this.projectRoot, "vercel.json")

    const vercelConfig = {
      buildCommand: "pnpm install --no-frozen-lockfile && pnpm run build",
      installCommand: "pnpm install --no-frozen-lockfile --prefer-offline",
      framework: "nextjs",
      regions: ["iad1"],
      functions: {
        "app/api/**/*.ts": {
          maxDuration: 30,
        },
      },
      headers: [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "X-XSS-Protection",
              value: "1; mode=block",
            },
          ],
        },
      ],
    }

    try {
      writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2))
      this.log("Vercel Config", "success", "Updated deployment configuration")
    } catch (error) {
      this.log("Vercel Config", "error", `Failed to update vercel.json: ${error}`)
    }
  }

  private validateTypeScript(): void {
    try {
      execSync("npx tsc --noEmit --skipLibCheck", {
        cwd: this.projectRoot,
        stdio: "pipe",
      })
      this.log("TypeScript Validation", "success", "No TypeScript errors found")
    } catch (error) {
      this.log("TypeScript Validation", "error", "TypeScript errors detected - manual review needed")
    }
  }

  public async run(): Promise<void> {
    console.log("🚨 Emergency Deployment Fix - Starting...\n")

    this.fixFileExtensions()
    this.fixPackageDependencies()
    this.fixNextConfig()
    this.fixVercelConfig()
    this.validateTypeScript()

    console.log("\n📊 Fix Summary:")
    const successful = this.results.filter((r) => r.status === "success").length
    const failed = this.results.filter((r) => r.status === "error").length
    const skipped = this.results.filter((r) => r.status === "skipped").length

    console.log(`✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏭️ Skipped: ${skipped}`)

    if (failed === 0) {
      console.log("\n🎉 All critical issues fixed! Ready for deployment.")
      console.log("\n📋 Next steps:")
      console.log("1. Commit these changes")
      console.log("2. Push to trigger new deployment")
      console.log("3. Monitor deployment status")
    } else {
      console.log("\n⚠️ Some issues require manual attention.")
      console.log("Please review the failed items above.")
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new EmergencyDeploymentFixer()
  fixer.run().catch(console.error)
}

export default EmergencyDeploymentFixer
