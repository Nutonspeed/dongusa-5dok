import { SmsClient, SmsProvider } from "./types"
import { mockSmsClient } from "./mock"
import { thaiBulkSmsClient } from "./thaibulksms"

export function createSmsClient(provider?: SmsProvider): SmsClient {
  const name = (provider || process.env.SMS_PROVIDER || "mock").toString().toLowerCase()
  switch (name) {
    case "thaibulksms":
      return thaiBulkSmsClient
    default:
      return mockSmsClient
  }
}
