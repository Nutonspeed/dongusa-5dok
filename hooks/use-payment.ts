"use client"

import { useState, useEffect } from "react"
import {
  paymentService,
  type PaymentMethod,
  type PaymentTransaction,
  type PromptPayQR,
  type BankTransferInfo,
} from "@/lib/payment-service"
import { logger } from "@/lib/logger"

export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        setLoading(true)
        const data = await paymentService.getPaymentMethods()
        setMethods(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching payment methods:", err)
        setError("Failed to fetch payment methods")
      } finally {
        setLoading(false)
      }
    }

    fetchMethods()
  }, [])

  return { methods, loading, error }
}

export function usePromptPayQR() {
  const [qrCode, setQrCode] = useState<PromptPayQR | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQR = async (amount: number, orderId: string) => {
    try {
      setLoading(true)
      setError(null)
      const qr = await paymentService.generatePromptPayQR(amount, orderId)
      setQrCode(qr)
    } catch (err) {
      logger.error("Error generating QR code:", err)
      setError("Failed to generate QR code")
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

export function useBankTransfer() {
  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const getBankInfo = async (orderId: string) => {
    try {
      setLoading(true)
      const info = await paymentService.getBankTransferInfo(orderId)
      setBankInfo(info)
    } catch (err) {
      logger.error("Error fetching bank info:", err)
    } finally {
      setLoading(false)
    }
  }

  return { bankInfo, loading, getBankInfo }
}

export function usePaymentTransaction() {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTransaction = async (orderId: string, amount: number, method: string, paymentData?: any) => {
    try {
      setLoading(true)
      setError(null)
      const transactionId = await paymentService.createPaymentTransaction(orderId, amount, method, paymentData)
      const txn = await paymentService.getPaymentTransaction(transactionId)
      setTransaction(txn)
      return transactionId
    } catch (err) {
      logger.error("Error creating transaction:", err)
      setError("Failed to create payment transaction")
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (
    transactionId: string,
    status: PaymentTransaction["status"],
    transactionRef?: string,
    paymentData?: any,
  ) => {
    try {
      setLoading(true)
      const success = await paymentService.updatePaymentStatus(transactionId, status, transactionRef, paymentData)
      if (success && transaction) {
        setTransaction({ ...transaction, status, transaction_id: transactionRef })
      }
      return success
    } catch (err) {
      logger.error("Error updating transaction status:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (transactionId: string, verificationData: any) => {
    try {
      setLoading(true)
      const isValid = await paymentService.verifyPayment(transactionId, verificationData)
      if (isValid && transaction) {
        setTransaction({ ...transaction, status: "completed" })
      }
      return isValid
    } catch (err) {
      logger.error("Error verifying payment:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    transaction,
    loading,
    error,
    createTransaction,
    updateStatus,
    verifyPayment,
  }
}

export function useOrderPayments(orderId: string) {
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const data = await paymentService.getOrderPayments(orderId)
        setPayments(data)
      } catch (err) {
        logger.error("Error fetching order payments:", err)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchPayments()
    }
  }, [orderId])

  const refreshPayments = async () => {
    const data = await paymentService.getOrderPayments(orderId)
    setPayments(data)
  }

  return { payments, loading, refreshPayments }
}

export function usePaymentSummary(dateRange: { from: string; to: string }) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const data = await paymentService.getPaymentSummary(dateRange)
        setSummary(data)
      } catch (err) {
        logger.error("Error fetching payment summary:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [dateRange])

  return { summary, loading }
}
