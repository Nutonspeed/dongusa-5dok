import { logger } from "@/lib/logger"

interface TestResult {
  name: string
  status: "pass" | "fail" | "skip"
  message: string
  duration: number
  details?: any
}

interface TestSuite {
  name: string
  results: TestResult[]
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
}

class BackendFunctionalityTester {
  private baseUrl: string
  private testResults: TestSuite[] = []

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now()
    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      return {
        name,
        status: "pass",
        message: "Test passed successfully",
        duration,
        details: result,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      return {
        name,
        status: "fail",
        message: error instanceof Error ? error.message : "Unknown error",
        duration,
        details: error,
      }
    }
  }

  private async testFabricUploadAPI(): Promise<TestSuite> {
    logger.info("🧪 Testing Fabric Upload API...")
    const results: TestResult[] = []

    // Test 1: Health check for storage
    results.push(
      await this.runTest("Storage Health Check", async () => {
        const response = await fetch(`${this.baseUrl}/api/health/storage`)
        if (!response.ok) {
          throw new Error(`Storage health check failed: ${response.status}`)
        }
        const data = await response.json()
        if (data.status !== "ok") {
          throw new Error("Storage service not healthy")
        }
        return data
      }),
    )

    // Test 2: Test fabric list endpoint
    results.push(
      await this.runTest("Fabric List API", async () => {
        const response = await fetch(`${this.baseUrl}/api/fabric/list`)
        if (!response.ok) {
          throw new Error(`Fabric list failed: ${response.status}`)
        }
        const data = await response.json()
        return data
      }),
    )

    // Test 3: Test upload validation (without actual file)
    results.push(
      await this.runTest("Upload Validation", async () => {
        const formData = new FormData()
        // Intentionally empty to test validation
        const response = await fetch(`${this.baseUrl}/api/fabric/upload`, {
          method: "POST",
          body: formData,
        })
        if (response.status !== 400) {
          throw new Error("Upload validation should fail with 400 for empty request")
        }
        const data = await response.json()
        if (!data.error) {
          throw new Error("Error message should be present")
        }
        return data
      }),
    )

    const suite: TestSuite = {
      name: "Fabric Upload API Tests",
      results,
      totalTests: results.length,
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      skipped: results.filter((r) => r.status === "skip").length,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
    }

    this.testResults.push(suite)
    return suite
  }

  private async testAICollectionNaming(): Promise<TestSuite> {
    logger.info("🤖 Testing AI Collection Naming System...")
    const results: TestResult[] = []

    // Test 1: AI Collection Naming API
    results.push(
      await this.runTest("AI Collection Naming", async () => {
        const testData = {
          imageUrl: "https://example.com/test-fabric.jpg",
          fabricType: "cotton",
          style: "modern",
          colors: "blue, white",
          description: "Test fabric pattern",
        }

        const response = await fetch(`${this.baseUrl}/api/ai/collection-naming`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testData),
        })

        if (!response.ok) {
          throw new Error(`AI naming failed: ${response.status}`)
        }

        const data = await response.json()
        if (!data.suggestions) {
          throw new Error("AI suggestions should be present")
        }

        return data
      }),
    )

    // Test 2: AI Fabric Analysis API
    results.push(
      await this.runTest("AI Fabric Analysis", async () => {
        const testData = {
          imageUrl: "https://example.com/test-fabric.jpg",
          analysisType: "comprehensive",
        }

        const response = await fetch(`${this.baseUrl}/api/ai/fabric-analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testData),
        })

        if (!response.ok) {
          throw new Error(`AI analysis failed: ${response.status}`)
        }

        const data = await response.json()
        if (!data.analysis) {
          throw new Error("AI analysis should be present")
        }

        return data
      }),
    )

    // Test 3: Different analysis types
    const analysisTypes = ["pattern", "color", "style", "comprehensive"]
    for (const type of analysisTypes) {
      results.push(
        await this.runTest(`AI Analysis - ${type}`, async () => {
          const response = await fetch(`${this.baseUrl}/api/ai/fabric-analysis`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: "https://example.com/test-fabric.jpg",
              analysisType: type,
            }),
          })

          if (!response.ok) {
            throw new Error(`AI analysis (${type}) failed: ${response.status}`)
          }

          const data = await response.json()
          if (data.analysisType !== type) {
            throw new Error(`Analysis type mismatch: expected ${type}, got ${data.analysisType}`)
          }

          return data
        }),
      )
    }

    const suite: TestSuite = {
      name: "AI Collection Naming Tests",
      results,
      totalTests: results.length,
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      skipped: results.filter((r) => r.status === "skip").length,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
    }

    this.testResults.push(suite)
    return suite
  }

  private async testBackendAPIs(): Promise<TestSuite> {
    logger.info("🔧 Testing Backend API Systems...")
    const results: TestResult[] = []

    // Test health endpoints
    const healthEndpoints = ["/api/health", "/api/health/database", "/api/health/supabase", "/api/health/storage"]

    for (const endpoint of healthEndpoints) {
      results.push(
        await this.runTest(`Health Check - ${endpoint}`, async () => {
          const response = await fetch(`${this.baseUrl}${endpoint}`)
          if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`)
          }
          const data = await response.json()
          return data
        }),
      )
    }

    // Test analytics endpoints
    const analyticsEndpoints = [
      "/api/analytics/active-users",
      "/api/analytics/conversion",
      "/api/analytics/conversion-rate",
    ]

    for (const endpoint of analyticsEndpoints) {
      results.push(
        await this.runTest(`Analytics - ${endpoint}`, async () => {
          const response = await fetch(`${this.baseUrl}${endpoint}`)
          if (!response.ok) {
            throw new Error(`Analytics endpoint failed: ${response.status}`)
          }
          const data = await response.json()
          return data
        }),
      )
    }

    // Test bills API
    results.push(
      await this.runTest("Bills API", async () => {
        const response = await fetch(`${this.baseUrl}/api/bills`)
        if (!response.ok) {
          throw new Error(`Bills API failed: ${response.status}`)
        }
        const data = await response.json()
        return data
      }),
    )

    // Test currency rates API
    results.push(
      await this.runTest("Currency Rates API", async () => {
        const response = await fetch(`${this.baseUrl}/api/currency/rates`)
        if (!response.ok) {
          throw new Error(`Currency rates failed: ${response.status}`)
        }
        const data = await response.json()
        if (!data.rates) {
          throw new Error("Currency rates should be present")
        }
        return data
      }),
    )

    const suite: TestSuite = {
      name: "Backend API Tests",
      results,
      totalTests: results.length,
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      skipped: results.filter((r) => r.status === "skip").length,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
    }

    this.testResults.push(suite)
    return suite
  }

  private async testIntegratedWorkflow(): Promise<TestSuite> {
    logger.info("🔄 Testing Integrated Workflow...")
    const results: TestResult[] = []

    // Test 1: Complete workflow simulation
    results.push(
      await this.runTest("Integrated Workflow Simulation", async () => {
        // Simulate the complete workflow:
        // 1. Check storage health
        const storageResponse = await fetch(`${this.baseUrl}/api/health/storage`)
        if (!storageResponse.ok) {
          throw new Error("Storage not ready for workflow")
        }

        // 2. Test AI services availability
        const aiResponse = await fetch(`${this.baseUrl}/api/ai/fabric-analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: "https://example.com/test.jpg",
            analysisType: "comprehensive",
          }),
        })

        if (!aiResponse.ok) {
          throw new Error("AI services not ready for workflow")
        }

        // 3. Test naming service
        const namingResponse = await fetch(`${this.baseUrl}/api/ai/collection-naming`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: "https://example.com/test.jpg",
            fabricType: "cotton",
            style: "modern",
          }),
        })

        if (!namingResponse.ok) {
          throw new Error("Naming service not ready for workflow")
        }

        return {
          storage: "ready",
          ai: "ready",
          naming: "ready",
          workflow: "functional",
        }
      }),
    )

    // Test 2: Error handling
    results.push(
      await this.runTest("Error Handling", async () => {
        // Test invalid requests to ensure proper error handling
        const invalidRequests = [
          { endpoint: "/api/ai/fabric-analysis", body: {} },
          { endpoint: "/api/ai/collection-naming", body: {} },
          { endpoint: "/api/fabric/upload", method: "GET" },
        ]

        for (const req of invalidRequests) {
          const response = await fetch(`${this.baseUrl}${req.endpoint}`, {
            method: req.method || "POST",
            headers: { "Content-Type": "application/json" },
            body: req.body ? JSON.stringify(req.body) : undefined,
          })

          if (response.ok) {
            throw new Error(`Expected error for invalid request to ${req.endpoint}`)
          }
        }

        return { errorHandling: "working" }
      }),
    )

    const suite: TestSuite = {
      name: "Integrated Workflow Tests",
      results,
      totalTests: results.length,
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      skipped: results.filter((r) => r.status === "skip").length,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
    }

    this.testResults.push(suite)
    return suite
  }

  private generateReport(): void {
    logger.info("\n" + "=".repeat(80))
    logger.info("🧪 COMPLETE BACKEND FUNCTIONALITY TEST REPORT")
    logger.info("=".repeat(80))

    let totalTests = 0
    let totalPassed = 0
    let totalFailed = 0
    let totalSkipped = 0
    let totalDuration = 0

    for (const suite of this.testResults) {
      logger.info(`\n📋 ${suite.name}`)
      logger.info("-".repeat(50))
      logger.info(`Total Tests: ${suite.totalTests}`)
      logger.info(`✅ Passed: ${suite.passed}`)
      logger.info(`❌ Failed: ${suite.failed}`)
      logger.info(`⏭️  Skipped: ${suite.skipped}`)
      logger.info(`⏱️  Duration: ${suite.duration}ms`)

      // Show failed tests
      const failedTests = suite.results.filter((r) => r.status === "fail")
      if (failedTests.length > 0) {
        logger.info("\n❌ Failed Tests:")
        for (const test of failedTests) {
          logger.info(`  • ${test.name}: ${test.message}`)
        }
      }

      totalTests += suite.totalTests
      totalPassed += suite.passed
      totalFailed += suite.failed
      totalSkipped += suite.skipped
      totalDuration += suite.duration
    }

    logger.info("\n" + "=".repeat(80))
    logger.info("📊 OVERALL SUMMARY")
    logger.info("=".repeat(80))
    logger.info(`Total Tests: ${totalTests}`)
    logger.info(`✅ Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`)
    logger.info(`❌ Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`)
    logger.info(`⏭️  Skipped: ${totalSkipped} (${((totalSkipped / totalTests) * 100).toFixed(1)}%)`)
    logger.info(`⏱️  Total Duration: ${totalDuration}ms`)

    const successRate = (totalPassed / totalTests) * 100
    if (successRate >= 90) {
      logger.info("\n🎉 EXCELLENT! Backend functionality is working great!")
    } else if (successRate >= 75) {
      logger.info("\n✅ GOOD! Most backend functionality is working well.")
    } else if (successRate >= 50) {
      logger.info("\n⚠️  WARNING! Some backend functionality needs attention.")
    } else {
      logger.info("\n🚨 CRITICAL! Backend functionality has significant issues.")
    }

    logger.info("\n" + "=".repeat(80))
  }

  async runAllTests(): Promise<void> {
    logger.info("🚀 Starting Complete Backend Functionality Tests...")
    logger.info(`Base URL: ${this.baseUrl}`)

    const startTime = Date.now()

    try {
      // Run all test suites
      await this.testFabricUploadAPI()
      await this.testAICollectionNaming()
      await this.testBackendAPIs()
      await this.testIntegratedWorkflow()

      const totalDuration = Date.now() - startTime
      logger.info(`\n⏱️  Total test execution time: ${totalDuration}ms`)

      // Generate comprehensive report
      this.generateReport()
    } catch (error) {
      logger.error("🚨 Test execution failed:", error)
      throw error
    }
  }
}

// Main execution
async function main() {
  const tester = new BackendFunctionalityTester()
  await tester.runAllTests()
}

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error("Test execution failed:", error)
    process.exit(1)
  })
}

export { BackendFunctionalityTester }
