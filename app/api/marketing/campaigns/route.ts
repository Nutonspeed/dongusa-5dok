import { type NextRequest, NextResponse } from "next/server"
import { marketingAutomation } from "@/lib/marketing-automation"

export async function GET(request: NextRequest) {
  try {
    const campaigns = await marketingAutomation.getCampaigns()
    return NextResponse.json({ success: true, data: campaigns })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const campaignData = await request.json()

    const campaign = await marketingAutomation.createCampaign({
      name: campaignData.name,
      type: campaignData.type,
      status: "draft",
      target_segment: campaignData.target_segment || [],
      email_template: campaignData.email_template,
      sms_template: campaignData.sms_template,
      trigger_conditions: campaignData.trigger_conditions || {},
      schedule: campaignData.schedule,
    })

    return NextResponse.json({ success: true, data: campaign })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ success: false, error: "Failed to create campaign" }, { status: 500 })
  }
}
