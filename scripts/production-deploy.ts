import "server-only"
import { execSync } from "child_process"

interface DeploymentConfig {
  environment: "staging" | "production"
  branch: string
  domain?: string
  environmentVariables: Record<string, string>
}

class ProductionDeployment {
  private config: DeploymentConfig

  constructor(config: DeploymentConfig) {
    this.config = config
  }

  async deploy() {
    console.log(`🚀 Starting ${this.config.environment} deployment...`)

    try {
      // Pre-deployment checks
      await this.runPreDeploymentChecks()

      // Build application
      await this.buildApplication()

      // Run tests
      await this.runTests()

      // Deploy to Vercel
      await this.deployToVercel()

      // Post-deployment verification
      await this.runPostDeploymentChecks()

      console.log(`✅ ${this.config.environment} deployment completed successfully!`)
    } catch (error) {
      console.error(`❌ Deployment failed:`, error)
      await this.rollback()
      process.exit(1)
    }
  }

  private async runPreDeploymentChecks() {
    console.log("🔍 Running pre-deployment checks...")

    // Check environment variables
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`)
      }
    }

    // Check database connectivity
    try {
      execSync("npm run qa:supabase", { stdio: "inherit" })
    } catch (error) {
      throw new Error("Database connectivity check failed")
    }

    // Validate configuration
    try {
      execSync("npm run test:env", { stdio: "inherit" })
    } catch (error) {
      throw new Error("Environment validation failed")
    }

    console.log("✅ Pre-deployment checks passed")
  }

  private async buildApplication() {
    console.log("🏗️ Building application...")

    try {
      execSync("npm run build", { stdio: "inherit" })
    } catch (error) {
      throw new Error("Application build failed")
    }

    console.log("✅ Application built successfully")
  }

  private async runTests() {
    console.log("🧪 Running tests...")

    try {
      // Run unit tests
      execSync("npm run test", { stdio: "inherit" })

      // Run integration tests
      execSync("npm run test:integration", {
        stdio: "inherit",
        env: { ...process.env, QA_BYPASS_AUTH: "1", ENABLE_MOCK_SERVICES: "true" },
      })

      // Run smoke tests
      execSync("npm run qa:smoke", {
        stdio: "inherit",
        env: { ...process.env, QA_BYPASS_AUTH: "1" },
      })
    } catch (error) {
      throw new Error("Tests failed")
    }

    console.log("✅ All tests passed")
  }

  private async deployToVercel() {
    console.log("🚀 Deploying to Vercel...")

    const deployCommand = this.config.environment === "production" ? "vercel --prod" : "vercel"

    try {
      execSync(deployCommand, { stdio: "inherit" })
    } catch (error) {
      throw new Error("Vercel deployment failed")
    }

    console.log("✅ Deployed to Vercel successfully")
  }

  private async runPostDeploymentChecks() {
    console.log("🔍 Running post-deployment checks...")

    if (this.config.domain) {
      // Wait for deployment to be ready
      await new Promise((resolve) => setTimeout(resolve, 30000))

      try {
        // Check health endpoint
        const healthCheck = await fetch(`https://${this.config.domain}/health`)
        if (!healthCheck.ok) {
          throw new Error(`Health check failed: ${healthCheck.status}`)
        }

        // Check main pages
        const pages = ["/", "/products", "/about"]
        for (const page of pages) {
          const response = await fetch(`https://${this.config.domain}${page}`)
          if (!response.ok) {
            throw new Error(`Page check failed for ${page}: ${response.status}`)
          }
        }
      } catch (error) {
        throw new Error(`Post-deployment checks failed: ${error}`)
      }
    }

    console.log("✅ Post-deployment checks passed")
  }

  private async rollback() {
    console.log("🔄 Initiating rollback...")

    try {
      // Rollback to previous deployment
      execSync("vercel rollback", { stdio: "inherit" })
      console.log("✅ Rollback completed")
    } catch (error) {
      console.error("❌ Rollback failed:", error)
    }
  }

  private async sendNotification(success: boolean, message: string) {
    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `${success ? "✅" : "❌"} ${this.config.environment} deployment: ${message}`,
          }),
        })
      } catch (error) {
        console.error("Failed to send Slack notification:", error)
      }
    }
  }
}

// CLI usage
if (require.main === module) {
  const environment = (process.argv[2] as "staging" | "production") || "staging"
  const branch = process.argv[3] || "main"

  const config: DeploymentConfig = {
    environment,
    branch,
    domain: environment === "production" ? process.env.PRODUCTION_DOMAIN : process.env.STAGING_DOMAIN,
    environmentVariables: {
      NODE_ENV: "production",
      NEXT_PUBLIC_BUILD_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || "manual-deploy",
    },
  }

  const deployment = new ProductionDeployment(config)
  deployment.deploy()
}

export { ProductionDeployment }
