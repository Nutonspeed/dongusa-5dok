import { type NextRequest, NextResponse } from "next/server"
import { realTimeNotificationService } from "@/lib/real-time-notification-service"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { userId, templateId, data, options } = await request.json()

    if (!userId || !templateId) {
      return NextResponse.json({ error: "Missing required fields: userId, templateId" }, { status: 400 })
    }

    const notificationId = await realTimeNotificationService.sendPushNotification(userId, templateId, data, options)

    return NextResponse.json({
      success: true,
      notificationId,
      message: "Push notification sent successfully",
    })
  } catch (error) {
    logger.error("Error sending push notification:", error)
    return NextResponse.json({ error: "Failed to send push notification" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const notifications = realTimeNotificationService.getNotifications(userId || undefined, limit)

    return NextResponse.json({
      notifications,
      total: notifications.length,
    })
  } catch (error) {
    logger.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
