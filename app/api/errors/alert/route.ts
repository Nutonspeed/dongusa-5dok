import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const errorReport = await request.json()

    // Validate critical error
    if (errorReport.severity !== "critical") {
      return NextResponse.json(
        { success: false, error: "Only critical errors trigger immediate alerts" },
        { status: 400 },
      )
    }

    // Send immediate notifications
    await Promise.all([sendSlackAlert(errorReport), sendEmailAlert(errorReport), createPagerDutyIncident(errorReport)])

    return NextResponse.json({
      success: true,
      message: "Critical alert sent successfully",
    })
  } catch (error) {
    console.error("Failed to send critical alert:", error)

    return NextResponse.json({ success: false, error: "Failed to send alert" }, { status: 500 })
  }
}

async function sendSlackAlert(errorReport: any): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const payload = {
    text: "🚨 CRITICAL ERROR DETECTED",
    attachments: [
      {
        color: "danger",
        title: "Critical Application Error",
        fields: [
          {
            title: "Error Message",
            value: errorReport.message,
            short: false,
          },
          {
            title: "Error Type",
            value: errorReport.type,
            short: true,
          },
          {
            title: "URL",
            value: errorReport.context.url,
            short: true,
          },
          {
            title: "User ID",
            value: errorReport.context.userId || "Anonymous",
            short: true,
          },
          {
            title: "Session ID",
            value: errorReport.context.sessionId,
            short: true,
          },
          {
            title: "Error ID",
            value: errorReport.id,
            short: true,
          },
          {
            title: "Timestamp",
            value: errorReport.context.timestamp,
            short: true,
          },
        ],
        footer: "Error Tracking System",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error("Failed to send Slack alert:", error)
  }
}

async function sendEmailAlert(errorReport: any): Promise<void> {
  // Mock email sending - integrate with your email service
  console.log("📧 Sending email alert for critical error:", errorReport.id)

  // Example with SendGrid:
  /*
  const msg = {
    to: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
    from: process.env.FROM_EMAIL,
    subject: `🚨 Critical Error: ${errorReport.message}`,
    html: `
      <h2>Critical Application Error Detected</h2>
      <p><strong>Error:</strong> ${errorReport.message}</p>
      <p><strong>Type:</strong> ${errorReport.type}</p>
      <p><strong>URL:</strong> ${errorReport.context.url}</p>
      <p><strong>User:</strong> ${errorReport.context.userId || 'Anonymous'}</p>
      <p><strong>Error ID:</strong> ${errorReport.id}</p>
      <p><strong>Timestamp:</strong> ${errorReport.context.timestamp}</p>
      
      ${errorReport.stack ? `
        <h3>Stack Trace:</h3>
        <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto;">
          ${errorReport.stack}
        </pre>
      ` : ''}
      
      <p>Please investigate this issue immediately.</p>
    `
  }
  
  await sgMail.send(msg)
  */
}

async function createPagerDutyIncident(errorReport: any): Promise<void> {
  const integrationKey = process.env.PAGERDUTY_INTEGRATION_KEY
  if (!integrationKey) return

  const payload = {
    routing_key: integrationKey,
    event_action: "trigger",
    dedup_key: errorReport.fingerprint,
    payload: {
      summary: `Critical Error: ${errorReport.message}`,
      source: errorReport.context.url,
      severity: "critical",
      component: "web-application",
      group: "frontend",
      class: errorReport.type,
      custom_details: {
        error_id: errorReport.id,
        user_id: errorReport.context.userId,
        session_id: errorReport.context.sessionId,
        user_agent: errorReport.context.userAgent,
        stack_trace: errorReport.stack,
      },
    },
  }

  try {
    await fetch("https://events.pagerduty.com/v2/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error("Failed to create PagerDuty incident:", error)
  }
}
