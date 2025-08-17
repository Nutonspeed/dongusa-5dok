#!/usr/bin/env tsx

/**
 * Deployment Fix Script
 * Handles package management issues and ensures deployment compatibility
 */

import { execSync } from "child_process"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  engines?: Record<string, string>
}

async function fixDeployment() {
  console.log("🔧 Starting deployment fix...")

  try {
    // Check if package.json exists
    const packageJsonPath = join(process.cwd(), "package.json")
    if (!existsSync(packageJsonPath)) {
      throw new Error("package.json not found")
    }

    // Read current package.json
    const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))

    // Fix common dependency issues
    if (packageJson.dependencies) {
      // Remove built-in Node.js modules that shouldn't be in dependencies
      const builtInModules = ["fs", "path", "crypto", "util", "child_process", "node:child_process", "node:http"]
      builtInModules.forEach((module) => {
        if (packageJson.dependencies![module]) {
          console.log(`❌ Removing built-in module: ${module}`)
          delete packageJson.dependencies![module]
        }
      })
    }

    // Ensure compatible versions
    if (packageJson.dependencies) {
      // Use stable versions that work well together
      const stableVersions = {
        next: "^14.2.5",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        typescript: "^5.6.2",
      }

      Object.entries(stableVersions).forEach(([pkg, version]) => {
        if (packageJson.dependencies![pkg]) {
          packageJson.dependencies![pkg] = version
          console.log(`✅ Updated ${pkg} to ${version}`)
        }
      })
    }

    // Update devDependencies
    if (packageJson.devDependencies) {
      const stableDevVersions = {
        "@types/node": "^20.12.12",
        "@types/react": "^18.2.69",
        "@types/react-dom": "^18.2.23",
        "eslint-config-next": "^14.2.5",
      }

      Object.entries(stableDevVersions).forEach(([pkg, version]) => {
        if (packageJson.devDependencies![pkg]) {
          packageJson.devDependencies![pkg] = version
          console.log(`✅ Updated dev dependency ${pkg} to ${version}`)
        }
      })
    }

    // Write updated package.json
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log("✅ Updated package.json with compatible versions")

    // Check if lockfile exists and remove if problematic
    const lockfilePath = join(process.cwd(), "pnpm-lock.yaml")
    if (existsSync(lockfilePath)) {
      const lockfileContent = readFileSync(lockfilePath, "utf8")
      if (lockfileContent.includes("lockfileVersion: '6.0'") || lockfileContent.length < 100) {
        console.log("🗑️ Removing problematic lockfile")
        execSync("rm -f pnpm-lock.yaml")
      }
    }

    console.log("✅ Deployment fix completed successfully")
  } catch (error) {
    console.error("❌ Deployment fix failed:", error)
    process.exit(1)
  }
}

// Run the fix
fixDeployment()
