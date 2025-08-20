import { SmsClient } from "./types"

function getAuthHeader() {
  const key = process.env.SMS_API_KEY || ""
  const secret = process.env.SMS_API_SECRET || ""
  const token = Buffer.from(`${key}:${secret}`).toString("base64")
  return `Basic ${token}`
}

export const thaiBulkSmsClient: SmsClient = {
  async send(to: string, message: string) {
    const sender = process.env.SMS_SENDER_ID || "SENDER"
    const resp = await fetch("https://api.thaibulksms.com/sms/v3/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        messages: [
          {
            to,
            text: message,
            from: sender,
          },
        ],
      }),
    })

    const data = await resp.json().catch(() => null)
    const ok = resp.ok && !!data
    return { success: ok, provider: "thaibulksms", raw: data }
  },
}
