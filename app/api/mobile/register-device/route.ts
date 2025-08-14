import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { token, platform, userId, deviceInfo } = await request.json()

    if (!token || !platform) {
      return NextResponse.json({ error: "Missing required fields: token, platform" }, { status: 400 })
    }

    // Register device token for push notifications
    const deviceData = {
      token,
      platform,
      user_id: userId,
      device_info: deviceInfo || {},
      registered_at: new Date().toISOString(),
      is_active: true,
    }

    const { data, error } = await supabase.from("device_tokens").upsert(deviceData, { onConflict: "token" }).select()

    if (error) {
      throw error
    }

    logger.info(`Device registered: ${platform} - ${token.substring(0, 10)}...`)

    return NextResponse.json({
      success: true,
      message: "Device registered successfully",
      deviceId: data?.[0]?.id,
    })
  } catch (error) {
    logger.error("Error registering device:", error)
    return NextResponse.json({ error: "Failed to register device" }, { status: 500 })
  }
}
