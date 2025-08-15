import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

const MOCK_RATES = [
  { from: "THB", to: "USD", rate: 0.028, spread: 0.0002, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "EUR", rate: 0.026, spread: 0.0002, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "SGD", rate: 0.038, spread: 0.0003, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "MYR", rate: 0.13, spread: 0.001, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "GBP", rate: 0.022, spread: 0.0002, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "AUD", rate: 0.042, spread: 0.0003, lastUpdated: new Date().toISOString() },
  { from: "THB", to: "JPY", rate: 4.2, spread: 0.05, lastUpdated: new Date().toISOString() },
  { from: "USD", to: "THB", rate: 35.5, spread: 0.2, lastUpdated: new Date().toISOString() },
  { from: "EUR", to: "THB", rate: 38.2, spread: 0.3, lastUpdated: new Date().toISOString() },
  { from: "SGD", to: "THB", rate: 26.3, spread: 0.2, lastUpdated: new Date().toISOString() },
  { from: "MYR", to: "THB", rate: 7.7, spread: 0.1, lastUpdated: new Date().toISOString() },
  { from: "GBP", to: "THB", rate: 45.2, spread: 0.4, lastUpdated: new Date().toISOString() },
  { from: "AUD", to: "THB", rate: 23.8, spread: 0.2, lastUpdated: new Date().toISOString() },
  { from: "JPY", to: "THB", rate: 0.24, spread: 0.002, lastUpdated: new Date().toISOString() },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const amount = Number.parseFloat(searchParams.get("amount") || "1")

    let rates = MOCK_RATES

    if (from && to) {
      rates = rates.filter((rate) => rate.from === from && rate.to === to)
    } else if (from) {
      rates = rates.filter((rate) => rate.from === from)
    } else if (to) {
      rates = rates.filter((rate) => rate.to === to)
    }

    // Calculate converted amounts if amount is specified
    const ratesWithConversion = rates.map((rate) => ({
      ...rate,
      convertedAmount: amount * rate.rate,
      buyRate: rate.rate - rate.spread,
      sellRate: rate.rate + rate.spread,
    }))

    return NextResponse.json({
      rates: ratesWithConversion,
      baseAmount: amount,
      lastUpdated: new Date().toISOString(),
      source: "mock", // In production: "xe.com", "fixer.io", etc.
      disclaimer: "Rates are for reference only. Actual rates may vary.",
    })
  } catch (error) {
    logger.error("Error fetching currency rates:", error)
    return NextResponse.json({ error: "Failed to fetch currency rates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    logger.info("💱 Currency rates update triggered", {
      source: body.source || "manual",
      currencies: body.currencies || "all",
    })

    // In production, this would call external APIs like:
    // - https://api.exchangerate-api.com/v4/latest/THB
    // - https://api.fixer.io/latest?base=THB
    // - https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/THB

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedRates = MOCK_RATES.map((rate) => ({
      ...rate,
      rate: rate.rate * (0.98 + Math.random() * 0.04), // Simulate small fluctuations
      lastUpdated: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      message: "Currency rates updated successfully",
      updatedCount: updatedRates.length,
      timestamp: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Next hour
    })
  } catch (error) {
    logger.error("Error updating currency rates:", error)
    return NextResponse.json({ error: "Failed to update currency rates" }, { status: 500 })
  }
}
