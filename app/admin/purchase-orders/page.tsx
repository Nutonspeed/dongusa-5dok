"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  CalendarIcon,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  LinkIcon,
} from "lucide-react"
import type { PurchaseOrderReference, Bill } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderReference[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)

  // Create PO form
  const [newPO, setNewPO] = useState({
    platform: "" as "lazada" | "shopee" | "1688" | "other",
    orderId: "",
    url: "",
    amount: 0,
    currency: "THB",
    supplierName: "",
    supplierContact: "",
    supplierAddress: "",
    orderDate: new Date(),
    expectedDelivery: undefined as Date | undefined,
    notes: "",
  })

  // Edit PO form
  const [editingPO, setEditingPO] = useState<PurchaseOrderReference | null>(null)
  const [editPO, setEditPO] = useState({
    platform: "" as "lazada" | "shopee" | "1688" | "other",
    orderId: "",
    url: "",
    amount: 0,
    currency: "THB",
    supplierName: "",
    supplierContact: "",
    supplierAddress: "",
    orderDate: new Date(),
    expectedDelivery: undefined as Date | undefined,
    notes: "",
  })

  // Link PO to Bill
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderReference | null>(null)
  const [selectedBillId, setSelectedBillId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const billsData = await billDatabase.getBills()
      setBills(billsData)

      // Extract all purchase orders from bills
      const allPOs: PurchaseOrderReference[] = []
      billsData.forEach((bill) => {
        allPOs.push(...bill.purchaseOrders)
      })
      setPurchaseOrders(allPOs)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load purchase orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePO = async () => {
    if (!newPO.platform || !newPO.orderId || !newPO.supplierName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const poData: Omit<PurchaseOrderReference, "id"> = {
        platform: newPO.platform,
        orderId: newPO.orderId,
        url: newPO.url || undefined,
        amount: newPO.amount,
        currency: newPO.currency,
        attachments: [],
        supplierInfo: {
          name: newPO.supplierName,
          contact: newPO.supplierContact,
          address: newPO.supplierAddress,
        },
        orderDate: newPO.orderDate,
        expectedDelivery: newPO.expectedDelivery,
        notes: newPO.notes || undefined,
      }

      await billDatabase.createPurchaseOrder(poData)
      await loadData()

      // Reset form
      setNewPO({
        platform: "" as "lazada" | "shopee" | "1688" | "other",
        orderId: "",
        url: "",
        amount: 0,
        currency: "THB",
        supplierName: "",
        supplierContact: "",
        supplierAddress: "",
        orderDate: new Date(),
        expectedDelivery: undefined,
        notes: "",
      })
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Purchase order created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      })
    }
  }

  const handleEditPO = async () => {
    if (!editingPO || !editPO.platform || !editPO.orderId || !editPO.supplierName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const updates: Partial<PurchaseOrderReference> = {
        platform: editPO.platform,
        orderId: editPO.orderId,
        url: editPO.url || undefined,
        amount: editPO.amount,
        currency: editPO.currency,
        supplierInfo: {
          name: editPO.supplierName,
          contact: editPO.supplierContact,
          address: editPO.supplierAddress,
        },
        orderDate: editPO.orderDate,
        expectedDelivery: editPO.expectedDelivery,
        notes: editPO.notes || undefined,
      }

      await billDatabase.updatePurchaseOrder(editingPO.id, updates)
      await loadData()

      setEditingPO(null)
      setIsEditDialogOpen(false)

      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase order",
        variant: "destructive",
      })
    }
  }

  const handleLinkToBill = async () => {
    if (!selectedPO || !selectedBillId) {
      toast({
        title: "Error",
        description: "Please select a purchase order and bill",
        variant: "destructive",
      })
      return
    }

    try {
      await billDatabase.linkPurchaseOrderToBill(selectedBillId, selectedPO.id)
      await loadData()

      setSelectedPO(null)
      setSelectedBillId("")
      setIsLinkDialogOpen(false)

      toast({
        title: "Success",
        description: "Purchase order linked to bill successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to link purchase order to bill",
        variant: "destructive",
      })
    }
  }

  const handleDeletePO = async (po: PurchaseOrderReference) => {
    if (confirm(`Are you sure you want to delete purchase order ${po.orderId}?`)) {
      try {
        await billDatabase.deletePurchaseOrder(po.id)
        await loadData()
        toast({
          title: "Success",
          description: "Purchase order deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete purchase order",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (po: PurchaseOrderReference) => {
    setEditingPO(po)
    setEditPO({
      platform: po.platform,
      orderId: po.orderId,
      url: po.url || "",
      amount: po.amount,
      currency: po.currency,
      supplierName: po.supplierInfo?.name || "",
      supplierContact: po.supplierInfo?.contact || "",
      supplierAddress: po.supplierInfo?.address || "",
      orderDate: po.orderDate,
      expectedDelivery: po.expectedDelivery,
      notes: po.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "lazada":
        return "bg-orange-100 text-orange-800"
      case "shopee":
        return "bg-red-100 text-red-800"
      case "1688":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLinkedBills = (poId: string) => {
    return bills.filter((bill) => bill.purchaseOrders.some((po) => po.id === poId))
  }

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.platform.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage purchase orders from external platforms and link them to bills</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="w-4 h-4 mr-2" />
                Link to Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Purchase Order to Bill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Purchase Order</Label>
                  <Select
                    value={selectedPO?.id || ""}
                    onValueChange={(value) => {
                      const po = purchaseOrders.find((p) => p.id === value)
                      setSelectedPO(po || null)
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a purchase order..." />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseOrders.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPlatformColor(po.platform)}>{po.platform.toUpperCase()}</Badge>
                            <span>{po.orderId}</span>
                            <span className="text-gray-500">- {formatCurrency(po.amount)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select Bill</Label>
                  <Select value={selectedBillId} onValueChange={setSelectedBillId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a bill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bills.map((bill) => (
                        <SelectItem key={bill.id} value={bill.id}>
                          <div className="flex items-center space-x-2">
                            <span>{bill.billNumber}</span>
                            <span className="text-gray-500">- {bill.customer.name}</span>
                            <span className="text-gray-500">({formatCurrency(bill.total)})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLinkDialogOpen(false)
                      setSelectedPO(null)
                      setSelectedBillId("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleLinkToBill}>Link to Bill</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform *</Label>
                    <Select
                      value={newPO.platform}
                      onValueChange={(value: any) => setNewPO({ ...newPO, platform: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select platform..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lazada">Lazada</SelectItem>
                        <SelectItem value="shopee">Shopee</SelectItem>
                        <SelectItem value="1688">1688</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="orderId">Order ID *</Label>
                    <Input
                      id="orderId"
                      value={newPO.orderId}
                      onChange={(e) => setNewPO({ ...newPO, orderId: e.target.value })}
                      placeholder="Enter order ID..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="url">Order URL</Label>
                  <Input
                    id="url"
                    value={newPO.url}
                    onChange={(e) => setNewPO({ ...newPO, url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPO.amount}
                      onChange={(e) => setNewPO({ ...newPO, amount: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newPO.currency} onValueChange={(value) => setNewPO({ ...newPO, currency: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THB">THB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    value={newPO.supplierName}
                    onChange={(e) => setNewPO({ ...newPO, supplierName: e.target.value })}
                    placeholder="Enter supplier name..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierContact">Supplier Contact</Label>
                    <Input
                      id="supplierContact"
                      value={newPO.supplierContact}
                      onChange={(e) => setNewPO({ ...newPO, supplierContact: e.target.value })}
                      placeholder="Phone or email..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierAddress">Supplier Address</Label>
                    <Input
                      id="supplierAddress"
                      value={newPO.supplierAddress}
                      onChange={(e) => setNewPO({ ...newPO, supplierAddress: e.target.value })}
                      placeholder="Enter address..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDate(newPO.orderDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newPO.orderDate}
                          onSelect={(date) => date && setNewPO({ ...newPO, orderDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Expected Delivery</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPO.expectedDelivery ? formatDate(newPO.expectedDelivery) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newPO.expectedDelivery}
                          onSelect={(date) => setNewPO({ ...newPO, expectedDelivery: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newPO.notes}
                    onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      setNewPO({
                        platform: "" as "lazada" | "shopee" | "1688" | "other",
                        orderId: "",
                        url: "",
                        amount: 0,
                        currency: "THB",
                        supplierName: "",
                        supplierContact: "",
                        supplierAddress: "",
                        orderDate: new Date(),
                        expectedDelivery: undefined,
                        notes: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePO}>Create Purchase Order</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchase Orders</p>
                <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(purchaseOrders.reduce((sum, po) => sum + po.amount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Linked to Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {purchaseOrders.filter((po) => getLinkedBills(po.id).length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Delivery</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    purchaseOrders.filter((po) => po.expectedDelivery && new Date(po.expectedDelivery) > new Date())
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by order ID, supplier name, or platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            Purchase Orders ({filteredPOs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Linked Bills</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPOs.map((po) => {
                const linkedBills = getLinkedBills(po.id)
                const isOverdue = po.expectedDelivery && new Date(po.expectedDelivery) < new Date()

                return (
                  <TableRow key={po.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge className={getPlatformColor(po.platform)}>{po.platform.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{po.orderId}</span>
                        {po.url && (
                          <a
                            href={po.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{po.supplierInfo?.name}</p>
                        {po.supplierInfo?.contact && <p className="text-sm text-gray-600">{po.supplierInfo.contact}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(po.amount)} {po.currency !== "THB" && po.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{formatDate(po.orderDate)}</span>
                    </TableCell>
                    <TableCell>
                      {po.expectedDelivery ? (
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                            {formatDate(po.expectedDelivery)}
                          </span>
                          {isOverdue && <AlertCircle className="w-3 h-3 text-red-600" />}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {linkedBills.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Badge className="bg-green-100 text-green-800">
                            {linkedBills.length} bill{linkedBills.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          Not linked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(po)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Purchase Order
                          </DropdownMenuItem>
                          {po.url && (
                            <DropdownMenuItem asChild>
                              <a href={po.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View on Platform
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPO(po)
                              setIsLinkDialogOpen(true)
                            }}
                          >
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Link to Bill
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePO(po)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Purchase Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredPOs.length === 0 && (
            <div className="text-center py-12">
              <ExternalLink className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No purchase orders found" : "No purchase orders created yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search term."
                  : "Create your first purchase order to start tracking external orders."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Purchase Order
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Purchase Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPlatform">Platform *</Label>
                <Select
                  value={editPO.platform}
                  onValueChange={(value: any) => setEditPO({ ...editPO, platform: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select platform..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lazada">Lazada</SelectItem>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="1688">1688</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editOrderId">Order ID *</Label>
                <Input
                  id="editOrderId"
                  value={editPO.orderId}
                  onChange={(e) => setEditPO({ ...editPO, orderId: e.target.value })}
                  placeholder="Enter order ID..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editUrl">Order URL</Label>
              <Input
                id="editUrl"
                value={editPO.url}
                onChange={(e) => setEditPO({ ...editPO, url: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editAmount">Amount *</Label>
                <Input
                  id="editAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPO.amount}
                  onChange={(e) => setEditPO({ ...editPO, amount: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editCurrency">Currency</Label>
                <Select value={editPO.currency} onValueChange={(value) => setEditPO({ ...editPO, currency: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THB">THB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="editSupplierName">Supplier Name *</Label>
              <Input
                id="editSupplierName"
                value={editPO.supplierName}
                onChange={(e) => setEditPO({ ...editPO, supplierName: e.target.value })}
                placeholder="Enter supplier name..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editSupplierContact">Supplier Contact</Label>
                <Input
                  id="editSupplierContact"
                  value={editPO.supplierContact}
                  onChange={(e) => setEditPO({ ...editPO, supplierContact: e.target.value })}
                  placeholder="Phone or email..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editSupplierAddress">Supplier Address</Label>
                <Input
                  id="editSupplierAddress"
                  value={editPO.supplierAddress}
                  onChange={(e) => setEditPO({ ...editPO, supplierAddress: e.target.value })}
                  placeholder="Enter address..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(editPO.orderDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editPO.orderDate}
                      onSelect={(date) => date && setEditPO({ ...editPO, orderDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Expected Delivery</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editPO.expectedDelivery ? formatDate(editPO.expectedDelivery) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editPO.expectedDelivery}
                      onSelect={(date) => setEditPO({ ...editPO, expectedDelivery: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={editPO.notes}
                onChange={(e) => setEditPO({ ...editPO, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingPO(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditPO}>Update Purchase Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
