#!/usr/bin/env tsx

/**
 * Build with Fallback Strategy
 * Attempts multiple build configurations using environment variables
 */

import { execSync } from "child_process"

const buildModes = [
  { name: "default", mode: "default" },
  { name: "production", mode: "production" },
  { name: "fallback", mode: "fallback" },
]

async function buildWithFallback() {
  console.log("🚀 Starting build with fallback strategy...")

  for (const config of buildModes) {
    try {
      console.log(`\n🔧 Attempting build with ${config.name} configuration...`)

      // Run the build with specific configuration mode
      execSync("pnpm run build", {
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_ENV: "production",
          CI: "true",
          BUILD_MODE: config.mode,
        },
      })

      console.log(`✅ Build successful with ${config.name} configuration!`)
      break
    } catch (error) {
      console.error(`❌ Build failed with ${config.name} configuration:`, error)

      if (config === buildModes[buildModes.length - 1]) {
        console.error("💥 All build configurations failed!")
        process.exit(1)
      }

      console.log("🔄 Trying next configuration...")
    }
  }

  console.log("🎉 Build completed successfully!")
}

// Run the build
buildWithFallback()
