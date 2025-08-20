export interface SmsClient {
  send(to: string, message: string): Promise<{ success: boolean; provider: string; raw?: any }>
}

export type SmsProvider = 'mock' | 'thaibulksms' | 'smsmkt' | string
