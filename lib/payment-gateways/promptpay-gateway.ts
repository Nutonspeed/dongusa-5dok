import { logger } from "@/lib/logger"

export class PromptPayGateway {
  private promptPayId: string
  private merchantName: string

  constructor() {
    this.promptPayId = process.env.PROMPTPAY_ID || ""
    this.merchantName = process.env.PROMPTPAY_MERCHANT_NAME || "ELF SofaCover Pro"

    if (!this.promptPayId) {
      logger.warn("PROMPTPAY_ID is not configured - PromptPay functionality will be disabled")
    }
  }

  generateQRCode(amount: number, reference: string): string {
    try {
      // Generate EMV QR Code for PromptPay
      const payload = this.buildEMVPayload(amount, reference)
      const crc = this.calculateCRC16(payload)
      const qrString = payload + crc

      // In production, use a proper QR code library like 'qrcode'
      return this.generateQRSVG(qrString)
    } catch (error) {
      logger.error("PromptPay QR generation failed:", error)
      throw new Error("Failed to generate PromptPay QR")
    }
  }

  private buildEMVPayload(amount: number, reference: string): string {
    // EMV QR Code format for PromptPay
    const formatIndicator = "000201"
    const pointOfInitiation = "010212"

    // PromptPay merchant account
    const merchantAccount = this.buildTLV(
      "29",
      this.buildTLV("0016", "A000000677010111") + this.buildTLV("01", this.promptPayId.padStart(13, "0")),
    )

    const merchantCategory = "52040000"
    const transactionCurrency = "5303764" // THB
    const transactionAmount = this.buildTLV("54", amount.toFixed(2))
    const countryCode = "5802TH"
    const merchantName = this.buildTLV("59", this.merchantName)
    const additionalData = this.buildTLV("62", this.buildTLV("05", reference))

    return (
      formatIndicator +
      pointOfInitiation +
      merchantAccount +
      merchantCategory +
      transactionCurrency +
      transactionAmount +
      countryCode +
      merchantName +
      additionalData +
      "6304"
    )
  }

  private buildTLV(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, "0")
    return tag + length + value
  }

  private calculateCRC16(data: string): string {
    // CRC-16-CCITT calculation for EMV QR
    let crc = 0xffff
    const polynomial = 0x1021

    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial
        } else {
          crc <<= 1
        }
        crc &= 0xffff
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0")
  }

  private generateQRSVG(data: string): string {
    // In production, use a proper QR library like 'qrcode'
    // This is a simplified version for demonstration
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="30" y="30" width="140" height="140" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-size="8" fill="black">PromptPay QR</text>
        <text x="100" y="120" text-anchor="middle" font-size="6" fill="black">${data.slice(0, 20)}...</text>
      </svg>
    `).toString("base64")}`
  }

  async verifyPayment(reference: string, amount: number): Promise<boolean> {
    try {
      // In production, integrate with bank API to verify payment
      // This is a mock implementation
      logger.info(`Verifying PromptPay payment: ${reference}, amount: ${amount}`)

      // Mock verification - replace with actual bank API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate 80% success rate for demo
          resolve(Math.random() > 0.2)
        }, 2000)
      })
    } catch (error) {
      logger.error("PromptPay verification failed:", error)
      return false
    }
  }
}
