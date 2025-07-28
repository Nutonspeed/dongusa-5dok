"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Edit3,
  Save,
  X,
  Download,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Package,
  QrCode,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
} from "lucide-react"
import type { Bill, Customer } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, formatDate, getBillStatusColor, calculateDaysUntilDue, generateQRCode } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import BillProgressTracker from "@/app/components/BillProgressTracker"

export default function CustomerBillView() {
  const params = useParams()
  const billId = params.id as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [editedAddress, setEditedAddress] = useState<Customer["address"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentNotified, setPaymentNotified] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)

  useEffect(() => {
    loadBill()
  }, [billId])

  const loadBill = async () => {
    try {
      const billData = await billDatabase.getBill(billId)
      if (billData) {
        setBill(billData)
        setEditedAddress(billData.customer.address)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bill information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAddress = async () => {
    if (!bill || !editedAddress) return

    try {
      const updatedCustomer = await billDatabase.updateCustomer(bill.customerId, {
        address: editedAddress,
      })

      if (updatedCustomer) {
        setBill({
          ...bill,
          customer: updatedCustomer,
        })
        setIsEditingAddress(false)
        toast({
          title: "Success",
          description: "Address updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      })
    }
  }

  const handlePaymentNotification = async () => {
    if (!bill) return

    try {
      await billDatabase.notifyPayment(bill.id, paymentMessage)
      setPaymentNotified(true)
      setPaymentMessage("")
      toast({
        title: "Payment Notification Sent",
        description: "We've been notified of your payment. We'll verify and update your order status soon.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send payment notification",
        variant: "destructive",
      })
    }
  }

  const copyBillNumber = () => {
    if (bill) {
      navigator.clipboard.writeText(bill.billNumber)
      toast({
        title: "Copied",
        description: "Bill number copied to clipboard",
      })
    }
  }

  const copyQRCode = () => {
    if (bill?.paymentQrCode) {
      navigator.clipboard.writeText(bill.paymentQrCode)
      toast({
        title: "Copied",
        description: "QR code data copied to clipboard",
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
            <p className="text-gray-600">The bill you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysUntilDue = calculateDaysUntilDue(bill.dueDate)
  const isOverdue = daysUntilDue < 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">{bill.billNumber}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyBillNumber}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-600 mt-1">Bill Details & Payment Information</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getBillStatusColor(bill.status)}>{bill.status.toUpperCase()}</Badge>
              {isOverdue && <Badge className="bg-red-100 text-red-800 border-red-200">OVERDUE</Badge>}
            </div>
          </div>

          {/* Status Alert */}
          {isOverdue && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This bill is overdue by {Math.abs(daysUntilDue)} days. Please make payment as soon as possible.
              </AlertDescription>
            </Alert>
          )}

          {bill.remainingBalance > 0 && bill.status === "partially_paid" && (
            <Alert className="mt-4 border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Partial payment received. Remaining balance: {formatCurrency(bill.remainingBalance)}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bill Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BillProgressTracker progress={bill.progress} />
              </CardContent>
            </Card>

            {/* Bill Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bill.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                        <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                          <span>Qty: {item.quantity}</span>
                          <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Bill Summary */}
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
                  {bill.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid Amount</span>
                        <span>{formatCurrency(bill.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-red-600">
                        <span>Remaining Balance</span>
                        <span>{formatCurrency(bill.remainingBalance)}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Information
                  </span>
                  {!isEditingAddress && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Address
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Customer Name</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-gray-900">{bill.customer.name}</p>
                      {bill.customer.nickname && (
                        <Badge variant="secondary" className="text-xs">
                          {bill.customer.nickname}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <div className="flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{bill.customer.email}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <div className="flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{bill.customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {isEditingAddress && editedAddress ? (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={editedAddress.street}
                          onChange={(e) =>
                            setEditedAddress({
                              ...editedAddress,
                              street: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={editedAddress.city}
                            onChange={(e) =>
                              setEditedAddress({
                                ...editedAddress,
                                city: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="province">Province</Label>
                          <Input
                            id="province"
                            value={editedAddress.province}
                            onChange={(e) =>
                              setEditedAddress({
                                ...editedAddress,
                                province: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            value={editedAddress.postalCode}
                            onChange={(e) =>
                              setEditedAddress({
                                ...editedAddress,
                                postalCode: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={editedAddress.country}
                            onChange={(e) =>
                              setEditedAddress({
                                ...editedAddress,
                                country: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveAddress} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingAddress(false)
                            setEditedAddress(bill.customer.address)
                          }}
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Delivery Address</Label>
                      <div className="mt-1 text-gray-900">
                        <p>{bill.customer.address.street}</p>
                        <p>
                          {bill.customer.address.city}, {bill.customer.address.province}{" "}
                          {bill.customer.address.postalCode}
                        </p>
                        <p>{bill.customer.address.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {bill.paymentRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bill.paymentRecords.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              payment.status === "confirmed" ? "bg-green-100" : "bg-yellow-100"
                            }`}
                          >
                            {payment.status === "confirmed" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-600">
                              {payment.method.replace("_", " ").toUpperCase()} • {formatDate(payment.date)}
                            </p>
                            {payment.notes && <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>}
                          </div>
                        </div>
                        <Badge
                          className={
                            payment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {bill.remainingBalance > 0 ? "Amount Due" : "Total Amount"}
                  </Label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(bill.remainingBalance > 0 ? bill.remainingBalance : bill.total)}
                  </p>
                  {bill.paidAmount > 0 && (
                    <p className="text-sm text-green-600 mt-1">Paid: {formatCurrency(bill.paidAmount)}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={`${isOverdue ? "text-red-600 font-medium" : "text-gray-900"}`}>
                      {formatDate(bill.dueDate)}
                    </span>
                  </div>
                  {!isOverdue && daysUntilDue <= 7 && (
                    <p className="text-sm text-yellow-600 mt-1">Due in {daysUntilDue} days</p>
                  )}
                </div>

                {/* QR Code Section */}
                {bill.paymentQrCode && bill.remainingBalance > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-700">Scan to Pay</Label>
                      <Button variant="ghost" size="sm" onClick={() => setShowQRCode(!showQRCode)}>
                        <QrCode className="w-4 h-4 mr-2" />
                        {showQRCode ? "Hide" : "Show"} QR
                      </Button>
                    </div>

                    {showQRCode && (
                      <div className="mt-2 p-4 bg-white border rounded-lg">
                        <img
                          src={generateQRCode(bill.id, bill.remainingBalance) || "/placeholder.svg"}
                          alt="Payment QR Code"
                          className="w-32 h-32 mx-auto"
                        />
                        <div className="flex items-center justify-center mt-2">
                          <Button variant="ghost" size="sm" onClick={copyQRCode} className="text-xs">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy QR Data
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Scan with your banking app to pay</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Notification */}
                {bill.remainingBalance > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Payment Notification</Label>
                      <Textarea
                        value={paymentMessage}
                        onChange={(e) => setPaymentMessage(e.target.value)}
                        placeholder="Add a message about your payment (optional)..."
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <Button onClick={handlePaymentNotification} disabled={paymentNotified} className="w-full">
                      <Bell className="w-4 h-4 mr-2" />
                      {paymentNotified ? "Payment Notified" : "I Have Paid"}
                    </Button>
                    {paymentNotified && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Payment notification sent successfully. We'll verify and update your order status.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            {/* Bill Information */}
            <Card>
              <CardHeader>
                <CardTitle>Bill Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bill Number</Label>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-900">{bill.billNumber}</p>
                    <Button variant="ghost" size="sm" onClick={copyBillNumber} className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                  <p className="text-gray-900 mt-1">{formatDate(bill.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Priority</Label>
                  <Badge
                    className={`mt-1 ${
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
                    <Label className="text-sm font-medium text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bill.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {bill.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Notes</Label>
                    <p className="text-gray-900 mt-1 text-sm">{bill.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  If you have any questions about your order or payment, please contact our support team.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">+66-2-123-4567</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">support@sofacovers.com</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
