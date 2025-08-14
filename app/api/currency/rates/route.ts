import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// Mock currency rates - in production, integrate with real currency API
const MOCK_RATES = [
  { from: "THB", to: "USD", rate: 0.028, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "SGD", rate: 0.038, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "MYR", rate: 0.13, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "GBP", rate: 0.022, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "AUD", rate: 0.042, lastUpdated: new Date().toISOString() },
  { from: "USD", to: "THB", rate: 35.5, lastUpdated: new Date().toISOString() },
  { from: "SGD", to: "THB", rate: 26.3, lastUpdated: new Date().toISOString() },
  { from: "MYR", to: "THB", rate: 7.7, lastUpdated: new Date().toISOString() },
  { from: "GBP", to: "THB", rate: 45.2, lastUpdated: new Date().toISOString() },
  { from: "AUD", to: "THB", rate: 23.8, lastUpdated: new Date().toISOString() },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let rates = MOCK_RATES

    // Filter by currency pair if specified
    if (from && to) {
      rates = rates.filter((rate) => rate.from === from && rate.to === to)
    } else if (from) {
      rates = rates.filter((rate) => rate.from === from)
    } else if (to) {
      rates = rates.filter((rate) => rate.to === to)
    }

    return NextResponse.json({
      rates,
      lastUpdated: new Date().toISOString(),
      source: "mock", // In production: "xe.com", "fixer.io", etc.
    })
  } catch (error) {
    logger.error("Error fetching currency rates:", error)
    return NextResponse.json({ error: "Failed to fetch currency rates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // In production, this would trigger a currency rate update
    // from external API (xe.com, fixer.io, etc.)

    logger.info("Currency rates update triggered")

    return NextResponse.json({
      success: true,
      message: "Currency rates update initiated",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Error updating currency rates:", error)
    return NextResponse.json({ error: "Failed to update currency rates" }, { status: 500 })
  }
}
