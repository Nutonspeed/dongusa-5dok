"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Edit,
  Send,
  Download,
  Trash2,
  Plus,
  Package,
  User,
  Calendar,
  DollarSign,
  Tag,
  ExternalLink,
  Upload,
  Eye,
  Clock,
} from "lucide-react"
import type { Bill, BillProgress } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import BillProgressTracker from "@/app/components/BillProgressTracker"

export default function BillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const billId = params.id as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNotes, setStatusNotes] = useState("")

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
        description: "Failed to load bill details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!bill || !newStatus) return

    try {
      const progress: BillProgress = {
        status: newStatus as any,
        timestamp: new Date(),
        notes: statusNotes,
        updatedBy: "admin-001",
      }

      await billDatabase.updateBillProgress(bill.id, progress)
      await loadBill()

      setIsEditingStatus(false)
      setNewStatus("")
      setStatusNotes("")

      toast({
        title: "Success",
        description: "Bill status updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBill = async () => {
    if (!bill) return

    if (confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
      try {
        await billDatabase.deleteBill(bill.id)
        toast({
          title: "Success",
          description: "Bill deleted successfully",
        })
        router.push("/admin/bills")
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete bill",
          variant: "destructive",
        })
      }
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
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="p-6">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Bill Not Found</h2>
          <p className="text-gray-600">The bill you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/admin/bills")} className="mt-4">
            Back to Bills
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">{bill.billNumber}</h1>
            <Badge className={getStatusColor(bill.status)}>{bill.status.toUpperCase()}</Badge>
          </div>
          <p className="text-gray-600 mt-1">
            Created on {formatDate(bill.createdAt)} • Due {formatDate(bill.dueDate)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Send className="w-4 h-4 mr-2" />
            Send to Customer
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Bill
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteBill}
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Bill Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Bill Items
                  </CardTitle>
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
                            <span>Unit: {formatCurrency(item.unitPrice)}</span>
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
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Customer Name</Label>
                      <p className="mt-1 text-gray-900">{bill.customer.name}</p>
                      {bill.customer.nickname && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {bill.customer.nickname}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Contact</Label>
                      <p className="mt-1 text-gray-900">{bill.customer.email}</p>
                      <p className="text-gray-900">{bill.customer.phone}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700">Delivery Address</Label>
                    <p className="mt-1 text-gray-900">
                      {bill.customer.address.street}
                      <br />
                      {bill.customer.address.city}, {bill.customer.address.province} {bill.customer.address.postalCode}
                      <br />
                      {bill.customer.address.country}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Order Progress
                    </span>
                    <Dialog open={isEditingStatus} onOpenChange={setIsEditingStatus}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Order Status</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="status">New Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="tailoring">Tailoring</SelectItem>
                                <SelectItem value="packing">Packing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={statusNotes}
                              onChange={(e) => setStatusNotes(e.target.value)}
                              placeholder="Add notes about this status update..."
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditingStatus(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleStatusUpdate}>Update Status</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BillProgressTracker progress={bill.progress} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Purchase Orders
                    </span>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Purchase Order
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bill.purchaseOrders.length > 0 ? (
                    <div className="space-y-4">
                      {bill.purchaseOrders.map((po) => (
                        <div key={po.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{po.platform.toUpperCase()}</Badge>
                                <span className="font-medium">{po.orderId}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Amount: {formatCurrency(po.amount)} {po.currency}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {po.url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={po.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Order
                                  </a>
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ExternalLink className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No purchase orders linked to this bill</p>
                      <Button className="mt-4" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Purchase Order
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receipts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Supplier Receipts
                    </span>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Receipt
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bill.supplierReceipts.length > 0 ? (
                    <div className="space-y-4">
                      {bill.supplierReceipts.map((receipt) => (
                        <div key={receipt.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{receipt.receiptNumber}</span>
                                <Badge variant="outline">{receipt.supplierName}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatCurrency(receipt.amount)} {receipt.currency} • {formatDate(receipt.date)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No supplier receipts attached to this bill</p>
                      <Button className="mt-4" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Receipt
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Total Amount</Label>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(bill.total)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Badge className={`${getStatusColor(bill.status)} mt-1`}>{bill.status.toUpperCase()}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                <p className="text-gray-900 mt-1">{formatDate(bill.dueDate)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Created By</Label>
                <p className="text-gray-900 mt-1">{bill.createdBy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {bill.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {bill.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {bill.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 text-sm">{bill.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Duplicate Bill
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
