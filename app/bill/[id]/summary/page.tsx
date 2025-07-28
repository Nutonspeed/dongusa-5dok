"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  CreditCard,
  Package,
  Phone,
  Mail,
  MessageCircle,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Bell,
  Copy,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import type { Bill } from "@/lib/types/bill"
import { apiClient, handleApiError } from "@/lib/api-client"
import {
  formatCurrency,
  formatDate,
  getBillStatusColor,
  calculateDaysUntilDue,
  getProgressPercentage,
  formatTimeAgo,
} from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { ErrorBoundary } from "@/components/ErrorBoundary"

// Notification service with fallback mechanisms
class NotificationService {
  private static instance: NotificationService
  private retryAttempts = new Map<string, number>()
  private readonly maxRetries = 3

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async notifyPayment(billId: string, message?: string): Promise<{ success: boolean; fallbackUsed: boolean }> {
    const attemptKey = `payment-${billId}`
    const attempts = this.retryAttempts.get(attemptKey) || 0

    try {
      // Primary notification method
      await apiClient.post(`/bills/${billId}/notify-payment`, {
        message: message?.trim(),
        timestamp: new Date().toISOString(),
        source: "customer_portal",
      })

      this.retryAttempts.delete(attemptKey)
      return { success: true, fallbackUsed: false }
    } catch (error) {
      console.error("Primary notification failed:", error)

      if (attempts < this.maxRetries) {
        this.retryAttempts.set(attemptKey, attempts + 1)

        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))

        return this.notifyPayment(billId, message)
      }

      // All retries failed, try fallback methods
      return this.tryFallbackNotification(billId, message)
    }
  }

  private async tryFallbackNotification(
    billId: string,
    message?: string,
  ): Promise<{ success: boolean; fallbackUsed: boolean }> {
    try {
      // Fallback 1: Store notification locally for later sync
      const notification = {
        billId,
        message,
        timestamp: new Date().toISOString(),
        type: "payment_notification",
        status: "pending_sync",
      }

      const existingNotifications = JSON.parse(localStorage.getItem("pending_notifications") || "[]")
      existingNotifications.push(notification)
      localStorage.setItem("pending_notifications", JSON.stringify(existingNotifications))

      // Fallback 2: Try alternative notification endpoint
      try {
        await fetch("/api/notifications/fallback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        })
      } catch {
        // Silently fail - local storage backup is sufficient
      }

      return { success: true, fallbackUsed: true }
    } catch {
      return { success: false, fallbackUsed: true }
    }
  }

  // Sync pending notifications when connection is restored
  async syncPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = JSON.parse(localStorage.getItem("pending_notifications") || "[]")

      if (pendingNotifications.length === 0) return

      const syncPromises = pendingNotifications.map(async (notification: any) => {
        try {
          await apiClient.post(`/bills/${notification.billId}/notify-payment`, notification)
          return notification
        } catch {
          return null
        }
      })

      const results = await Promise.allSettled(syncPromises)
      const synced = results
        .filter(
          (result): result is PromiseFulfilledResult<any> => result.status === "fulfilled" && result.value !== null,
        )
        .map((result) => result.value)

      // Remove synced notifications
      const remaining = pendingNotifications.filter(
        (notification: any) => !synced.some((synced: any) => synced.billId === notification.billId),
      )

      localStorage.setItem("pending_notifications", JSON.stringify(remaining))

      if (synced.length > 0) {
        toast({
          title: "Notifications Synced",
          description: `${synced.length} pending notification(s) have been sent.`,
        })
      }
    } catch (error) {
      console.error("Failed to sync pending notifications:", error)
    }
  }
}

export default function BillSummaryPage() {
  const params = useParams()
  const billId = params.id as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentNotified, setPaymentNotified] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [notifyingPayment, setNotifyingPayment] = useState(false)
  const [notificationFallbackUsed, setNotificationFallbackUsed] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  const notificationService = NotificationService.getInstance()

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Sync pending notifications when coming back online
      notificationService.syncPendingNotifications()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    loadBill()
  }, [billId, retryCount])

  const loadBill = async () => {
    try {
      setLoading(true)
      const billData = await apiClient.get<Bill>(`/bills/${billId}`)
      setBill(billData)
    } catch (error) {
      const errorMessage = handleApiError(error)
      toast({
        title: "Error Loading Bill",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentNotification = async () => {
    if (!bill) return

    // Client-side validation
    if (paymentMessage.length > 500) {
      toast({
        title: "Message Too Long",
        description: "Please keep your message under 500 characters.",
        variant: "destructive",
      })
      return
    }

    try {
      setNotifyingPayment(true)
      setNotificationFallbackUsed(false)

      const result = await notificationService.notifyPayment(bill.id, paymentMessage)

      if (result.success) {
        setPaymentNotified(true)
        setPaymentMessage("")
        setNotificationFallbackUsed(result.fallbackUsed)

        if (result.fallbackUsed) {
          toast({
            title: "Payment Notification Queued",
            description: "Your notification has been saved and will be sent when connection is restored.",
          })
        } else {
          toast({
            title: "Payment Notification Sent",
            description: "We've been notified of your payment. Thank you!",
          })
        }
      } else {
        throw new Error("All notification methods failed")
      }
    } catch (error) {
      const errorMessage = handleApiError(error)

      toast({
        title: "Notification Failed",
        description: `${errorMessage} Please contact us directly using the information below.`,
        variant: "destructive",
      })
    } finally {
      setNotifyingPayment(false)
    }
  }

  const copyBillNumber = async () => {
    if (bill) {
      try {
        await navigator.clipboard.writeText(bill.billNumber)
        toast({
          title: "Copied",
          description: "Bill number copied to clipboard",
        })
      } catch {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = bill.billNumber
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)

        toast({
          title: "Copied",
          description: "Bill number copied to clipboard",
        })
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto mt-2" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bill Not Found</h2>
            <p className="text-gray-600 mb-4">The bill summary you're looking for doesn't exist.</p>
            <div className="space-y-2">
              <Button onClick={() => setRetryCount((prev) => prev + 1)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysUntilDue = calculateDaysUntilDue(bill.dueDate)
  const isOverdue = daysUntilDue < 0
  const progressPercentage = getProgressPercentage(bill.progressStages || [])
  const latestProgress = bill.progressStages?.[bill.progressStages.length - 1]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Network Status Indicator */}
          {!isOnline && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You're currently offline. Some features may not work properly.
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bill Summary</h1>
            <p className="text-gray-600">Complete overview of your order and payment status</p>
          </div>

          {/* Status Alert */}
          {isOverdue && bill.remainingBalance > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Payment Overdue:</strong> This bill is overdue by {Math.abs(daysUntilDue)} days. Please make
                payment immediately to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}

          {bill.status === "paid" && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Payment Complete:</strong> Thank you for your payment! Your order is being processed.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bill Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Order Overview
                    </span>
                    <Badge className={getBillStatusColor(bill.status)}>{bill.status.toUpperCase()}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="text-2xl font-bold text-gray-900">{bill.billNumber}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyBillNumber}
                          className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600">Bill Number</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">{formatCurrency(bill.total)}</div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{bill.items.length}</div>
                      <div className="text-sm text-gray-600">Items</div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Payment Status */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Payment Status</h4>

                    {bill.paidAmount > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Paid Amount</span>
                          <span className="font-medium text-green-600">{formatCurrency(bill.paidAmount)}</span>
                        </div>

                        {bill.remainingBalance > 0 ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Remaining Balance</span>
                              <span className="font-medium text-red-600">{formatCurrency(bill.remainingBalance)}</span>
                            </div>
                            <Progress value={(bill.paidAmount / bill.total) * 100} className="h-2" />
                            <p className="text-xs text-gray-500">
                              {((bill.paidAmount / bill.total) * 100).toFixed(1)}% paid
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-800">Fully Paid</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-yellow-50 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-800">Payment Pending</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Order Progress */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Order Progress</h4>
                      <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
                    </div>

                    <Progress value={progressPercentage} className="h-3" />

                    {latestProgress && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Status:</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {latestProgress.stage.toUpperCase()}
                          </Badge>
                          <span className="text-gray-500">
                            {latestProgress.completedAt
                              ? formatTimeAgo(latestProgress.completedAt)
                              : latestProgress.startedAt
                                ? `Started ${formatTimeAgo(latestProgress.startedAt)}`
                                : "Pending"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bill.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="font-medium text-gray-900">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(bill.subtotal)}</span>
                    </div>
                    {bill.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-green-600">-{formatCurrency(bill.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatCurrency(bill.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(bill.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              {bill.progressStages && bill.progressStages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bill.progressStages
                        .slice(-3)
                        .reverse()
                        .map((progress, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Status updated to: {progress.stage.toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-600">
                                {progress.completedAt
                                  ? formatTimeAgo(progress.completedAt)
                                  : progress.startedAt
                                    ? formatTimeAgo(progress.startedAt)
                                    : "Recently"}
                              </p>
                              {progress.notes && <p className="text-xs text-gray-500 mt-1">{progress.notes}</p>}
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="mt-4">
                      <Link href={`/bill/${bill.id}`}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Package className="w-4 h-4 mr-2" />
                          View Full Order Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Action */}
              {bill.remainingBalance > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {formatCurrency(bill.remainingBalance)}
                      </div>
                      <div className="text-sm text-gray-600">Amount Due</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600">Due Date</div>
                      <div className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                        {formatDate(bill.dueDate)}
                      </div>
                      {isOverdue ? (
                        <div className="text-xs text-red-600 mt-1">Overdue by {Math.abs(daysUntilDue)} days</div>
                      ) : daysUntilDue <= 7 ? (
                        <div className="text-xs text-yellow-600 mt-1">Due in {daysUntilDue} days</div>
                      ) : null}
                    </div>

                    <Separator />

                    {/* Payment Notification Section */}
                    <div className="space-y-3">
                      <Label htmlFor="paymentMessage" className="text-sm font-medium text-gray-700">
                        Payment Message (Optional)
                      </Label>
                      <Textarea
                        id="paymentMessage"
                        value={paymentMessage}
                        onChange={(e) => setPaymentMessage(e.target.value)}
                        placeholder="Add a note about your payment..."
                        rows={3}
                        maxLength={500}
                        disabled={paymentNotified}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{paymentMessage.length}/500 characters</span>
                        {!isOnline && <span className="text-yellow-600">Offline mode</span>}
                      </div>
                    </div>

                    <Button
                      onClick={handlePaymentNotification}
                      disabled={paymentNotified || notifyingPayment}
                      className="w-full"
                      size="lg"
                    >
                      {notifyingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Notifying...
                        </>
                      ) : paymentNotified ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Payment Notified
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          Notify Payment
                        </>
                      )}
                    </Button>

                    {paymentNotified && (
                      <Alert
                        className={`${notificationFallbackUsed ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}`}
                      >
                        <CheckCircle
                          className={`h-4 w-4 ${notificationFallbackUsed ? "text-yellow-600" : "text-green-600"}`}
                        />
                        <AlertDescription className={notificationFallbackUsed ? "text-yellow-800" : "text-green-800"}>
                          {notificationFallbackUsed
                            ? "Payment notification queued. It will be sent when connection is restored."
                            : "Thank you! We'll verify your payment and update the status."}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Link href={`/bill/${bill.id}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Payment Options
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Order Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 mb-1">{Math.round(progressPercentage)}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                    <Progress value={progressPercentage} className="mt-2 h-2" />
                  </div>

                  {latestProgress && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900 mb-1">Current Status</div>
                      <Badge className={getBillStatusColor(latestProgress.status)}>
                        {latestProgress.stage.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-2">
                        Updated{" "}
                        {latestProgress.completedAt
                          ? formatTimeAgo(latestProgress.completedAt)
                          : latestProgress.startedAt
                            ? formatTimeAgo(latestProgress.startedAt)
                            : "recently"}
                      </div>
                    </div>
                  )}

                  <Link href={`/bill/${bill.id}`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Track Order Progress
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Customer Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Customer Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Need help with your order? Our support team is here to assist you.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">+66-2-123-4567</div>
                        <div className="text-gray-500">Mon-Fri 9AM-6PM</div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">support@sofacovers.com</div>
                        <div className="text-gray-500">24/7 Email Support</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Live Chat
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">{formatDate(bill.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer</span>
                    <span className="text-gray-900">{bill.customer.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Priority</span>
                    <Badge
                      className={`text-xs ${
                        bill.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : bill.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : bill.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                      }`}
                    >
                      {bill.priority.toUpperCase()}
                    </Badge>
                  </div>
                  {bill.tags && bill.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {bill.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {bill.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{bill.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
