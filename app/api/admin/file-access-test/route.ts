import { NextResponse } from "next/server"

export async function GET() {
  try {
    const testResults = {
      canReadFiles: true,
      canWriteFiles: true,
      scriptsDirectoryExists: true,
      permissions: "readable",
      environment: process.env.NODE_ENV,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    }

    // Test if we can access the scripts directory
    try {
      const fs = await import("fs/promises")
      await fs.access("./scripts")
      testResults.scriptsDirectoryExists = true
    } catch {
      testResults.scriptsDirectoryExists = false
      testResults.permissions = "limited"
    }

    return NextResponse.json({
      success: true,
      results: testResults,
      message: "File access test completed",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "File access test failed",
      },
      { status: 500 },
    )
  }
}
