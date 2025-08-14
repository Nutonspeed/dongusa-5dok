import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface BatchRequest {
  id: string
  method: string
  endpoint: string
  params?: Record<string, any>
  body?: any
}

export async function POST(request: NextRequest) {
  try {
    const { requests }: { requests: BatchRequest[] } = await request.json()

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({ error: "Invalid requests array" }, { status: 400 })
    }

    if (requests.length > 10) {
      return NextResponse.json({ error: "Too many requests in batch (max 10)" }, { status: 400 })
    }

    const results: Record<string, any> = {}
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Process requests in parallel
    const promises = requests.map(async (req) => {
      try {
        let url = `${baseURL}${req.endpoint}`

        // Add query parameters for GET requests
        if (req.method === "GET" && req.params) {
          const searchParams = new URLSearchParams()
          Object.entries(req.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value))
            }
          })
          const queryString = searchParams.toString()
          if (queryString) {
            url += `?${queryString}`
          }
        }

        const fetchOptions: RequestInit = {
          method: req.method,
          headers: {
            "Content-Type": "application/json",
            "X-Batch-Request": "true",
          },
        }

        if (req.body && req.method !== "GET") {
          fetchOptions.body = JSON.stringify(req.body)
        }

        const response = await fetch(url, fetchOptions)
        const data = await response.json()

        results[req.id] = {
          data,
          meta: {
            version: "1.0",
            timestamp: new Date().toISOString(),
            cached: false,
            compressed: false,
            requestId: req.id,
            status: response.status,
          },
        }
      } catch (error) {
        logger.error(`Batch request failed for ${req.id}:`, error)
        results[req.id] = {
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
          meta: {
            version: "1.0",
            timestamp: new Date().toISOString(),
            cached: false,
            compressed: false,
            requestId: req.id,
            status: 500,
          },
        }
      }
    })

    await Promise.all(promises)

    return NextResponse.json({
      results,
      meta: {
        batchSize: requests.length,
        processedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    logger.error("Batch API error:", error)
    return NextResponse.json({ error: "Batch processing failed" }, { status: 500 })
  }
}
