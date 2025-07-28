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
} from "lucide-react"
import type { Bill } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import {
  formatCurrency,
  formatDate,
  getBillStatusColor,
  calculateDaysUntilDue,
  getProgressPercentage,
  formatTimeAgo,
} from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function BillSummaryPage() {
  const params = useParams()
  const billId = params.id as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentNotified, setPaymentNotified] = useState(false)

  useEffect(() => {
    loadBill()
  }, [billId])

  const loadBill = async () => {
    try {
      const billData = await billDatabase.getBill(billId)
      setBill(billData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bill summary",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentNotification = async () => {
    if (!bill) return

    try {
      await billDatabase.notifyPayment(bill.id, "Customer confirmed payment via summary page")
      setPaymentNotified(true)
      toast({
        title: "Payment Notification Sent",
        description: "We've been notified of your payment. Thank you!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send payment notification",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bill Not Found</h2>
            <p className="text-gray-600">The bill summary you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysUntilDue = calculateDaysUntilDue(bill.dueDate)
  const isOverdue = daysUntilDue < 0
  const progressPercentage = getProgressPercentage(bill.progress)
  const latestProgress = bill.progress[bill.progress.length - 1]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="text-2xl font-bold text-gray-900">{bill.billNumber}</div>
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
                          {latestProgress.status.toUpperCase()}
                        </Badge>
                        <span className="text-gray-500">{formatTimeAgo(latestProgress.timestamp)}</span>
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
                      <div className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</div>
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
            {bill.progress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bill.progress
                      .slice(-3)
                      .reverse()
                      .map((progress, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Status updated to: {progress.status.toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-600">{formatTimeAgo(progress.timestamp)}</p>
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
                    <div className="text-2xl font-bold text-red-600 mb-1">{formatCurrency(bill.remainingBalance)}</div>
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

                  <Button onClick={handlePaymentNotification} disabled={paymentNotified} className="w-full" size="lg">
                    <Bell className="w-4 h-4 mr-2" />
                    {paymentNotified ? "Payment Notified" : "Notify Payment"}
                  </Button>

                  {paymentNotified && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 text-sm">
                        Thank you! We'll verify your payment and update the status.
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
                      {latestProgress.status.toUpperCase()}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-2">Updated {formatTimeAgo(latestProgress.timestamp)}</div>
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
                {bill.tags.length > 0 && (
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
  )
}
