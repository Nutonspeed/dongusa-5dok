import { NextResponse } from "next/server"
import { integrationTestSuite } from "@/lib/integration-test-suite"

export async function POST() {
  try {
    const results = await integrationTestSuite.runAllTests()
    const report = integrationTestSuite.generateReport()

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Integration tests failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const report = integrationTestSuite.generateReport()
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get test results",
      },
      { status: 500 },
    )
  }
}
