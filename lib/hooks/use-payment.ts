"use client"

import { useState } from "react"
import { toast } from "sonner"

interface BankInfo {
  bank_name: string
  branch: string
  account_number: string
  account_holder: string
  reference_number: string
}

interface QRCodeInfo {
  qr_code: string
  reference: string
  expires_at: string
}

export function useBankTransfer() {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const getBankInfo = async (orderId: string) => {
    setLoading(true)
    try {
      // Mock bank transfer info - in real app, this would be API call
      const mockBankInfo: BankInfo = {
        bank_name: "ธนาคารกสิกรไทย",
        branch: "สาขาสยามสแควร์",
        account_number: "123-4-56789-0",
        account_holder: "บริษัท โซฟาคัฟเวอร์ โปร จำกัด",
        reference_number: `REF${orderId.slice(-6)}${Date.now().toString().slice(-4)}`,
      }

      setBankInfo(mockBankInfo)
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลธนาคารได้")
    } finally {
      setLoading(false)
    }
  }

  return { bankInfo, loading, getBankInfo }
}

export function usePromptPayQR() {
  const [qrCode, setQrCode] = useState<QRCodeInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQR = async (amount: number, orderId: string) => {
    setLoading(true)
    setError(null)
    try {
      // Mock QR code generation - in real app, this would be API call
      const mockQRInfo: QRCodeInfo = {
        qr_code: `/placeholder.svg?height=200&width=200&text=QR+Code+${amount}`,
        reference: `PP${orderId.slice(-6)}${Date.now().toString().slice(-4)}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      }

      setQrCode(mockQRInfo)
    } catch (err) {
      setError("ไม่สามารถสร้าง QR Code ได้")
    } finally {
      setLoading(false)
    }
  }

  const clearQR = () => {
    setQrCode(null)
    setError(null)
  }

  return { qrCode, loading, error, generateQR, clearQR }
}
