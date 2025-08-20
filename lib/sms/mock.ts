import { SmsClient } from "./types"

export const mockSmsClient: SmsClient = {
  async send(to: string, message: string) {
    // No external call; just simulate success
    return { success: true, provider: "mock", raw: { to, message } }
  },
}
