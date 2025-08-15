#!/usr/bin/env tsx

/**
 * Post-Deployment Validation Pipeline
 * Validates system functionality after deployment
 */

interface HealthCheck {
  name: string
  url: string
  expectedStatus: number
  timeout: number
}

class PostDeploymentValidator {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
  }

  private async checkEndpoint(check: HealthCheck): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), check.timeout)

      const response = await fetch(`${this.baseUrl}${check.url}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Deployment-Validator/1.0",
        },
      })

      clearTimeout(timeoutId)

      if (response.status === check.expectedStatus) {
        console.log(`✅ ${check.name}: OK (${response.status})`)
        return true
      } else {
        console.log(`❌ ${check.name}: Expected ${check.expectedStatus}, got ${response.status}`)
        return false
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${error}`)
      return false
    }
  }

  async validateDeployment() {
    console.log(`🔍 Validating deployment at: ${this.baseUrl}\n`)

    const healthChecks: HealthCheck[] = [
      {
        name: "Homepage",
        url: "/",
        expectedStatus: 200,
        timeout: 10000,
      },
      {
        name: "Health Check API",
        url: "/api/health",
        expectedStatus: 200,
        timeout: 5000,
      },
      {
        name: "Database Health",
        url: "/api/health/database",
        expectedStatus: 200,
        timeout: 10000,
      },
      {
        name: "Supabase Health",
        url: "/api/health/supabase",
        expectedStatus: 200,
        timeout: 10000,
      },
      {
        name: "Admin Login",
        url: "/admin/login",
        expectedStatus: 200,
        timeout: 5000,
      },
      {
        name: "Static Assets",
        url: "/_next/static/css",
        expectedStatus: 404, // Expected 404 for directory listing
        timeout: 5000,
      },
    ]

    const results = await Promise.all(healthChecks.map((check) => this.checkEndpoint(check)))

    const passed = results.filter(Boolean).length
    const total = results.length

    console.log(`\n📊 Post-deployment validation results: ${passed}/${total} passed`)

    if (passed === total) {
      console.log("🎉 All post-deployment checks passed!")
      console.log("✅ Deployment is healthy and ready for traffic")
      return true
    } else {
      console.log(`❌ ${total - passed} checks failed`)
      console.log("🚨 Deployment may have issues")
      return false
    }
  }
}

// Get deployment URL from environment or command line
const deploymentUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.argv[2] || "http://localhost:3000"

const validator = new PostDeploymentValidator(deploymentUrl)
validator.validateDeployment().then((success) => {
  process.exit(success ? 0 : 1)
})
