#!/usr/bin/env tsx

/**
 * Build with Fallback Strategy
 * Attempts multiple build configurations if the primary build fails
 */

import { execSync } from "child_process"
import { existsSync, copyFileSync, renameSync } from "fs"

const configs = [
  { name: "default", file: "next.config.mjs" },
  { name: "production", file: "next.config.production.mjs" },
  { name: "fallback", file: "next.config.fallback.mjs" },
]

async function buildWithFallback() {
  console.log("🚀 Starting build with fallback strategy...")

  // Backup original config
  const originalConfig = "next.config.mjs"
  const backupConfig = "next.config.mjs.backup"

  if (existsSync(originalConfig)) {
    copyFileSync(originalConfig, backupConfig)
    console.log("📋 Backed up original config")
  }

  for (const config of configs) {
    try {
      console.log(`\n🔧 Attempting build with ${config.name} configuration...`)

      // Copy the config file
      if (config.file !== originalConfig && existsSync(config.file)) {
        copyFileSync(config.file, originalConfig)
        console.log(`✅ Using ${config.name} configuration`)
      }

      // Run the build
      execSync("pnpm run build", {
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_ENV: "production",
          CI: "true",
        },
      })

      console.log(`✅ Build successful with ${config.name} configuration!`)
      break
    } catch (error) {
      console.error(`❌ Build failed with ${config.name} configuration:`, error)

      if (config === configs[configs.length - 1]) {
        console.error("💥 All build configurations failed!")

        // Restore original config
        if (existsSync(backupConfig)) {
          renameSync(backupConfig, originalConfig)
          console.log("🔄 Restored original configuration")
        }

        process.exit(1)
      }

      console.log("🔄 Trying next configuration...")
    }
  }

  // Clean up backup
  if (existsSync(backupConfig)) {
    renameSync(backupConfig, originalConfig)
    console.log("🔄 Restored original configuration")
  }

  console.log("🎉 Build completed successfully!")
}

// Run the build
buildWithFallback()
