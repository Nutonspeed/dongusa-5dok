"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Save, Send, User, Package, DollarSign, Calendar, Tag, X } from "lucide-react"
import type { Customer, BillItem, Bill } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, generateId } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function CreateBillPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<BillItem[]>([
    {
      id: generateId(),
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      category: "",
      sku: "",
    },
  ])
  const [billData, setBillData] = useState({
    dueDate: "",
    notes: "",
    tags: [] as string[],
    discount: 0,
    tax: 7, // Default 7% VAT
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [customersData, tagsData] = await Promise.all([billDatabase.getCustomers(), billDatabase.getCustomTags()])
      setCustomers(customersData)
      setAvailableTags(tagsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive",
      })
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: generateId(),
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        category: "",
        sku: "",
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const addTag = () => {
    if (newTag && !billData.tags.includes(newTag)) {
      setBillData({
        ...billData,
        tags: [...billData.tags, newTag],
      })
      if (!availableTags.includes(newTag)) {
        setAvailableTags([...availableTags, newTag])
        billDatabase.addCustomTag(newTag)
      }
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setBillData({
      ...billData,
      tags: billData.tags.filter((t) => t !== tag),
    })
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const discountAmount = (subtotal * billData.discount) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * billData.tax) / 100
    const total = taxableAmount + taxAmount

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    }
  }

  const handleSaveDraft = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      })
      return
    }

    const validItems = items.filter((item) => item.name && item.quantity > 0 && item.unitPrice > 0)
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid item",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const totals = calculateTotals()

      const newBill: Omit<Bill, "id" | "billNumber" | "createdAt" | "updatedAt"> = {
        customerId: selectedCustomer.id,
        customer: selectedCustomer,
        items: validItems,
        subtotal: totals.subtotal,
        tax: totals.taxAmount,
        discount: totals.discountAmount,
        total: totals.total,
        currency: "THB",
        status: "draft",
        dueDate: new Date(billData.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: [
          {
            status: "pending",
            timestamp: new Date(),
            notes: "Bill created as draft",
            updatedBy: "admin-001",
          },
        ],
        tags: billData.tags,
        purchaseOrders: [],
        supplierReceipts: [],
        notes: billData.notes,
        createdBy: "admin-001",
      }

      const createdBill = await billDatabase.createBill(newBill)

      toast({
        title: "Success",
        description: "Bill saved as draft successfully",
      })

      router.push(`/admin/bills/${createdBill.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendBill = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      })
      return
    }

    const validItems = items.filter((item) => item.name && item.quantity > 0 && item.unitPrice > 0)
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid item",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const totals = calculateTotals()

      const newBill: Omit<Bill, "id" | "billNumber" | "createdAt" | "updatedAt"> = {
        customerId: selectedCustomer.id,
        customer: selectedCustomer,
        items: validItems,
        subtotal: totals.subtotal,
        tax: totals.taxAmount,
        discount: totals.discountAmount,
        total: totals.total,
        currency: "THB",
        status: "sent",
        dueDate: new Date(billData.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: [
          {
            status: "pending",
            timestamp: new Date(),
            notes: "Bill created and sent to customer",
            updatedBy: "admin-001",
          },
        ],
        tags: billData.tags,
        purchaseOrders: [],
        supplierReceipts: [],
        paymentQrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        notes: billData.notes,
        createdBy: "admin-001",
      }

      const createdBill = await billDatabase.createBill(newBill)

      toast({
        title: "Success",
        description: "Bill created and sent to customer successfully",
      })

      router.push(`/admin/bills/${createdBill.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create and send bill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
        <p className="text-gray-600 mt-1">Create a new bill for your customer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select
                    value={selectedCustomer?.id || ""}
                    onValueChange={(value) => {
                      const customer = customers.find((c) => c.id === value)
                      setSelectedCustomer(customer || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center space-x-2">
                            <span>{customer.name}</span>
                            {customer.nickname && (
                              <Badge variant="secondary" className="text-xs">
                                {customer.nickname}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomer && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-gray-900">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <p className="text-gray-900">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-sm font-medium text-gray-700">Address</Label>
                      <p className="text-gray-900">
                        {selectedCustomer.address.street}, {selectedCustomer.address.city},{" "}
                        {selectedCustomer.address.province} {selectedCustomer.address.postalCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bill Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Bill Items
                </span>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`name-${item.id}`}>Item Name *</Label>
                        <Input
                          id={`name-${item.id}`}
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          placeholder="Enter item name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`category-${item.id}`}>Category</Label>
                        <Input
                          id={`category-${item.id}`}
                          value={item.category}
                          onChange={(e) => updateItem(item.id, "category", e.target.value)}
                          placeholder="Enter category"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`description-${item.id}`}>Description</Label>
                      <Textarea
                        id={`description-${item.id}`}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Enter item description"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`unitPrice-${item.id}`}>Unit Price *</Label>
                        <Input
                          id={`unitPrice-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`sku-${item.id}`}>SKU</Label>
                        <Input
                          id={`sku-${item.id}`}
                          value={item.sku}
                          onChange={(e) => updateItem(item.id, "sku", e.target.value)}
                          placeholder="SKU"
                        />
                      </div>
                      <div>
                        <Label>Total Price</Label>
                        <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={billData.dueDate}
                  onChange={(e) => setBillData({ ...billData, dueDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={billData.notes}
                  onChange={(e) => setBillData({ ...billData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {billData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Tag className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (!billData.tags.includes(tag)) {
                          setBillData({
                            ...billData,
                            tags: [...billData.tags, tag],
                          })
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Discount (%)</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={billData.discount}
                      onChange={(e) => setBillData({ ...billData, discount: Number.parseFloat(e.target.value) || 0 })}
                      className="w-20 h-6 text-xs"
                    />
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Discount Amount</span>
                      <span className="text-green-600">-{formatCurrency(totals.discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax (%)</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={billData.tax}
                      onChange={(e) => setBillData({ ...billData, tax: Number.parseFloat(e.target.value) || 0 })}
                      className="w-20 h-6 text-xs"
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Tax Amount</span>
                    <span>{formatCurrency(totals.taxAmount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button onClick={handleSendBill} className="w-full" disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  Create & Send Bill
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <User className="w-4 h-4 mr-2" />
                Create New Customer
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Import from Template
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Bill
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
