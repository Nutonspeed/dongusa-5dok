"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Building2, CreditCard, Hash } from "lucide-react"
import { toast } from "sonner"
import { useBankTransfer } from "@/hooks/use-payment"
import { formatCurrency } from "@/lib/money"

interface BankTransferInfoProps {
  amount: number
  orderId: string
  onPaymentComplete?: () => void
}

export default function BankTransferInfo({ amount, orderId, onPaymentComplete }: BankTransferInfoProps) {
  const { bankInfo, loading, getBankInfo } = useBankTransfer()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    getBankInfo(orderId)
  }, [orderId])

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(`คัดลอก${field}แล้ว`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error("ไม่สามารถคัดลอกได้")
    }
  }

  if (loading || !bankInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          โอนเงินผ่านธนาคาร
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Amount */}
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">ยอดที่ต้องชำระ</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(amount)}</p>
          </div>

          {/* Bank Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-600">ธนาคาร</label>
              </div>
              <p className="font-semibold text-gray-900">{bankInfo.bank_name}</p>
              <p className="text-sm text-gray-600">{bankInfo.branch}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  เลขที่บัญชี
                </label>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(bankInfo.account_number, "เลขที่บัญชี")}>
                  {copiedField === "เลขที่บัญชี" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="font-mono text-lg font-bold text-gray-900">{bankInfo.account_number}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-600">ชื่อบัญชี</label>
              </div>
              <p className="font-semibold text-gray-900">{bankInfo.account_holder}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-yellow-800 flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  หมายเลขอ้างอิง (สำคัญ)
                </label>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(bankInfo.reference_number, "หมายเลขอ้างอิง")}>
                  {copiedField === "หมายเลขอ้างอิง" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="font-mono text-lg font-bold text-yellow-900">{bankInfo.reference_number}</p>
              <p className="text-xs text-yellow-700 mt-1">
                กรุณาระบุหมายเลขอ้างอิงนี้เมื่อโอนเงิน เพื่อให้เราสามารถตรวจสอบการชำระเงินได้
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">วิธีการโอนเงิน:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  1
                </span>
                เปิดแอป Mobile Banking หรือไปที่ตู้ ATM
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  2
                </span>
                เลือกเมนู "โอนเงิน" หรือ "Transfer"
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  3
                </span>
                กรอกเลขที่บัญชีปลายทาง: {bankInfo.account_number}
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  4
                </span>
                กรอกจำนวนเงิน: {formatCurrency(amount)}
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  5
                </span>
                <strong>กรอกหมายเลขอ้างอิง: {bankInfo.reference_number}</strong>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  6
                </span>
                ตรวจสอบข้อมูลและกดยืนยันการโอน
              </li>
            </ol>
          </div>

          {/* Actions */}
          {onPaymentComplete && (
            <Button onClick={onPaymentComplete} className="w-full">
              โอนเงินแล้ว
            </Button>
          )}

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            <p>การโอนเงินจะใช้เวลา 1-2 ชั่วโมงในการตรวจสอบ</p>
            <p>หากมีปัญหา กรุณาติดต่อ 02-123-4567</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
