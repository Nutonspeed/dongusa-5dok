import { type NextRequest, NextResponse } from "next/server"
import { enhancedPredictiveAnalytics } from "@/lib/enhanced-predictive-analytics"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get("modelId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const type = searchParams.get("type") // predictions, anomalies, trends, models

    switch (type) {
      case "anomalies":
        const anomalies = enhancedPredictiveAnalytics.getRecentAnomalies(limit)
        return NextResponse.json({ anomalies })

      case "trends":
        const trends = enhancedPredictiveAnalytics.getMarketTrends()
        return NextResponse.json({ trends })

      case "models":
        const models = enhancedPredictiveAnalytics.getModels()
        return NextResponse.json({ models })

      case "predictions":
      default:
        const predictions = enhancedPredictiveAnalytics.getRecentPredictions(limit)
        const filteredPredictions = modelId ? predictions.filter((p) => p.modelId === modelId) : predictions

        return NextResponse.json({ predictions: filteredPredictions })
    }
  } catch (error) {
    logger.error("Error fetching predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { modelId, inputData, action } = await request.json()

    if (action === "retrain") {
      if (!modelId) {
        return NextResponse.json({ error: "Model ID is required for retraining" }, { status: 400 })
      }

      const success = await enhancedPredictiveAnalytics.retrainModel(modelId)

      if (success) {
        return NextResponse.json({
          success: true,
          message: `Model ${modelId} retrained successfully`,
        })
      } else {
        return NextResponse.json({ error: "Failed to retrain model" }, { status: 400 })
      }
    }

    if (action === "predict") {
      if (!modelId) {
        return NextResponse.json({ error: "Model ID is required for prediction" }, { status: 400 })
      }

      const prediction = await enhancedPredictiveAnalytics.generatePrediction(modelId, inputData)

      if (prediction) {
        return NextResponse.json({ prediction })
      } else {
        return NextResponse.json({ error: "Failed to generate prediction" }, { status: 400 })
      }
    }

    if (action === "customer_behavior") {
      const { customerId } = await request.json()

      if (!customerId) {
        return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
      }

      const behavior = await enhancedPredictiveAnalytics.predictCustomerBehavior(customerId)
      return NextResponse.json({ behavior })
    }

    if (action === "business_forecast") {
      const { timeframe } = await request.json()

      if (!timeframe || !["week", "month", "quarter", "year"].includes(timeframe)) {
        return NextResponse.json({ error: "Valid timeframe is required" }, { status: 400 })
      }

      const forecast = await enhancedPredictiveAnalytics.generateBusinessForecast(timeframe)
      return NextResponse.json({ forecast })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    logger.error("Error processing prediction request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
