"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Edit3, Save, X, Download, Phone, Mail, Calendar, CreditCard, Package } from "lucide-react"
import type { Bill, Customer } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, formatDate } from "@/lib/utils"
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
    try {
      // In a real app, this would send a notification to the admin
      setPaymentNotified(true)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bill.billNumber}</h1>
              <p className="text-gray-600 mt-1">Bill Details & Payment Information</p>
            </div>
            <Badge className={getStatusColor(bill.status)}>{bill.status.toUpperCase()}</Badge>
          </div>
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
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>Qty: {item.quantity}</span>
                          <span className="mx-2">•</span>
                          <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
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
                    <p className="mt-1 text-gray-900">{bill.customer.name}</p>
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
                  <Label className="text-sm font-medium text-gray-700">Amount Due</Label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(bill.total)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">{formatDate(bill.dueDate)}</span>
                  </div>
                </div>

                {bill.paymentQrCode && (
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-700">Scan to Pay</Label>
                    <div className="mt-2 p-4 bg-white border rounded-lg">
                      <img
                        src={bill.paymentQrCode || "/placeholder.svg"}
                        alt="Payment QR Code"
                        className="w-32 h-32 mx-auto"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Scan with your banking app to pay</p>
                  </div>
                )}

                {bill.status === "sent" && (
                  <Button onClick={handlePaymentNotification} disabled={paymentNotified} className="w-full">
                    {paymentNotified ? "Payment Notified" : "I Have Paid"}
                  </Button>
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
                  <p className="text-gray-900 mt-1">{bill.billNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                  <p className="text-gray-900 mt-1">{formatDate(bill.createdAt)}</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}
