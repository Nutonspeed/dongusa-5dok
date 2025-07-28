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
import { Skeleton } from "@/components/ui/skeleton"
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
  WifiOff,
} from "lucide-react"
import type { Bill, Customer } from "@/lib/types/bill"
import { apiClient, handleApiError } from "@/lib/api-client"
import { formatCurrency, formatDate, getBillStatusColor, calculateDaysUntilDue, generateQRCode } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import BillProgressTracker from "@/app/components/BillProgressTracker"

// Rate limiter for address updates
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private readonly maxAttempts = 5
  private readonly windowMs = 60000 // 1 minute

  canProceed(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < this.windowMs)

    if (validAttempts.length >= this.maxAttempts) {
      return false
    }

    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    return true
  }
}

const addressUpdateLimiter = new RateLimiter()

// Address validation schema
const validateAddress = (address: Customer["address"]): string[] => {
  const errors: string[] = []

  if (!address.street?.trim()) {
    errors.push("Street address is required")
  } else if (address.street.length > 200) {
    errors.push("Street address must be less than 200 characters")
  }

  if (!address.city?.trim()) {
    errors.push("City is required")
  } else if (address.city.length > 100) {
    errors.push("City must be less than 100 characters")
  }

  if (!address.state?.trim()) {
    errors.push("State/Province is required")
  } else if (address.state.length > 100) {
    errors.push("State/Province must be less than 100 characters")
  }

  if (!address.zipCode?.trim()) {
    errors.push("Postal code is required")
  } else if (!/^[A-Za-z0-9\s-]{3,20}$/.test(address.zipCode)) {
    errors.push("Invalid postal code format")
  }

  if (!address.country?.trim()) {
    errors.push("Country is required")
  }

  return errors
}

// QR Code component with fallback
function PaymentQRCode({
  billId,
  amount,
  onError,
}: { billId: string; amount: number; onError: (error: string) => void }) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate QR code generation with potential failure
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (Math.random() < 0.1) {
          // 10% chance of failure for demo
          throw new Error("QR code service temporarily unavailable")
        }

        const qrCodeData = generateQRCode(billId, amount)
        setQrCode(qrCodeData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate QR code"
        setError(errorMessage)
        onError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [billId, amount, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (error || !qrCode) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">QR Code Unavailable</span>
        </div>
        <p className="text-sm text-yellow-700 mb-3">{error || "Unable to generate QR code at this time"}</p>
        <div className="space-y-2 text-sm">
          <p className="font-medium text-gray-900">Alternative Payment Methods:</p>
          <div className="bg-white p-3 rounded border">
            <p>
              <strong>Bank Transfer:</strong>
            </p>
            <p>Account: 123-456-7890</p>
            <p>Bank: Example Bank</p>
            <p>Amount: {formatCurrency(amount)}</p>
            <p>Reference: {billId}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="mt-3 bg-transparent" onClick={() => window.location.reload()}>
          Retry QR Code
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <img
        src={qrCode || "/placeholder.svg"}
        alt="Payment QR Code"
        className="w-32 h-32 mx-auto border rounded"
        onError={() => setError("Failed to load QR code image")}
      />
      <p className="text-xs text-gray-500 mt-2">Scan with your banking app to pay</p>
    </div>
  )
}

export default function CustomerBillView() {
  const params = useParams()
  const billId = params.id as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [editedAddress, setEditedAddress] = useState<Customer["address"] | null>(null)
  const [addressErrors, setAddressErrors] = useState<string[]>([])
  const [savingAddress, setSavingAddress] = useState(false)
  const [paymentNotified, setPaymentNotified] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [notifyingPayment, setNotifyingPayment] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
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
      setEditedAddress(billData.customer.address)
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

  const handleSaveAddress = async () => {
    if (!bill || !editedAddress) return

    // Rate limiting check
    if (!addressUpdateLimiter.canProceed(`address-${billId}`)) {
      toast({
        title: "Rate Limit Exceeded",
        description: "Too many address update attempts. Please wait a minute before trying again.",
        variant: "destructive",
      })
      return
    }

    // Validate address
    const errors = validateAddress(editedAddress)
    setAddressErrors(errors)

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the address errors before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingAddress(true)

      const updatedCustomer = await apiClient.put<Customer>(`/customers/${bill.customer.id}`, {
        address: editedAddress,
      })

      setBill({
        ...bill,
        customer: updatedCustomer,
      })

      setIsEditingAddress(false)
      setAddressErrors([])

      toast({
        title: "Success",
        description: "Address updated successfully",
      })
    } catch (error) {
      const errorMessage = handleApiError(error)
      toast({
        title: "Error Updating Address",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSavingAddress(false)
    }
  }

  const handlePaymentNotification = async () => {
    if (!bill) return

    try {
      setNotifyingPayment(true)

      await apiClient.post(`/bills/${bill.id}/notify-payment`, {
        message: paymentMessage.trim() || undefined,
      })

      setPaymentNotified(true)
      setPaymentMessage("")

      toast({
        title: "Payment Notification Sent",
        description: "We've been notified of your payment. We'll verify and update your order status soon.",
      })
    } catch (error) {
      const errorMessage = handleApiError(error)

      // Fallback mechanism
      toast({
        title: "Notification Failed",
        description: `${errorMessage} Please contact us directly at +66-2-123-4567 or support@sofacovers.com`,
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
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
            <p className="text-gray-600 mb-4">The bill you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setRetryCount((prev) => prev + 1)}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysUntilDue = calculateDaysUntilDue(bill.dueDate)
  const isOverdue = daysUntilDue < 0

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* Status Alerts */}
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
              <ErrorBoundary
                fallback={
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Unable to load progress tracker</p>
                    </CardContent>
                  </Card>
                }
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Order Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BillProgressTracker progress={bill.progressStages || []} />
                  </CardContent>
                </Card>
              </ErrorBoundary>

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
                            {item.category && (
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(item.total)}</p>
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

              {/* Customer Information with Editable Address */}
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

                    {/* Address Section */}
                    {isEditingAddress && editedAddress ? (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-900">Edit Delivery Address</h4>

                        {addressErrors.length > 0 && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              <ul className="list-disc list-inside space-y-1">
                                {addressErrors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div>
                          <Label htmlFor="street">Street Address *</Label>
                          <Input
                            id="street"
                            value={editedAddress.street}
                            onChange={(e) =>
                              setEditedAddress({
                                ...editedAddress,
                                street: e.target.value,
                              })
                            }
                            className={addressErrors.some((e) => e.includes("Street")) ? "border-red-300" : ""}
                            maxLength={200}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={editedAddress.city}
                              onChange={(e) =>
                                setEditedAddress({
                                  ...editedAddress,
                                  city: e.target.value,
                                })
                              }
                              className={addressErrors.some((e) => e.includes("City")) ? "border-red-300" : ""}
                              maxLength={100}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State/Province *</Label>
                            <Input
                              id="state"
                              value={editedAddress.state}
                              onChange={(e) =>
                                setEditedAddress({
                                  ...editedAddress,
                                  state: e.target.value,
                                })
                              }
                              className={addressErrors.some((e) => e.includes("State")) ? "border-red-300" : ""}
                              maxLength={100}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="zipCode">Postal Code *</Label>
                            <Input
                              id="zipCode"
                              value={editedAddress.zipCode}
                              onChange={(e) =>
                                setEditedAddress({
                                  ...editedAddress,
                                  zipCode: e.target.value,
                                })
                              }
                              className={addressErrors.some((e) => e.includes("postal")) ? "border-red-300" : ""}
                              maxLength={20}
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country *</Label>
                            <Input
                              id="country"
                              value={editedAddress.country}
                              onChange={(e) =>
                                setEditedAddress({
                                  ...editedAddress,
                                  country: e.target.value,
                                })
                              }
                              className={addressErrors.some((e) => e.includes("Country")) ? "border-red-300" : ""}
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={handleSaveAddress} size="sm" disabled={savingAddress || !isOnline}>
                            {savingAddress ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditingAddress(false)
                              setEditedAddress(bill.customer.address)
                              setAddressErrors([])
                            }}
                            size="sm"
                            disabled={savingAddress}
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
                            {bill.customer.address.city}, {bill.customer.address.state} {bill.customer.address.zipCode}
                          </p>
                          <p>{bill.customer.address.country}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                  {bill.remainingBalance > 0 && (
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
                          <ErrorBoundary
                            fallback={
                              <div className="p-4 text-center text-gray-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p>QR Code unavailable</p>
                              </div>
                            }
                          >
                            <PaymentQRCode billId={bill.id} amount={bill.remainingBalance} onError={setQrError} />
                          </ErrorBoundary>
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
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">{paymentMessage.length}/500 characters</p>
                      </div>
                      <Button
                        onClick={handlePaymentNotification}
                        disabled={paymentNotified || notifyingPayment || !isOnline}
                        className="w-full"
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
                            <Bell className="w-4 h-4 mr-2" />I Have Paid
                          </>
                        )}
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
    </ErrorBoundary>
  )
}
