import { NextResponse } from "next/server"

export async function GET() {
  try {
    const testResults = {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      canExecuteScripts: true,
      timestamp: new Date().toISOString(),
    }

  // Script execution test disabled for security
  testResults.canExecuteScripts = false

    return NextResponse.json({
      success: true,
      results: testResults,
      message: "Script execution environment test completed",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Script execution test failed",
      },
      { status: 500 },
    )
  }
}
