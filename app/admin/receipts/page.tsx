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
  Upload,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  CalendarIcon,
  FileText,
  Building,
  DollarSign,
  Eye,
  Download,
  Paperclip,
} from "lucide-react"
import type { SupplierReceipt, Bill } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<SupplierReceipt[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false)

  // Create receipt form
  const [newReceipt, setNewReceipt] = useState({
    supplierId: "",
    supplierName: "",
    receiptNumber: "",
    amount: 0,
    currency: "THB",
    date: new Date(),
    category: "",
    notes: "",
    attachments: [] as string[],
  })

  // Edit receipt form
  const [editingReceipt, setEditingReceipt] = useState<SupplierReceipt | null>(null)
  const [editReceipt, setEditReceipt] = useState({
    supplierId: "",
    supplierName: "",
    receiptNumber: "",
    amount: 0,
    currency: "THB",
    date: new Date(),
    category: "",
    notes: "",
    attachments: [] as string[],
  })

  // Attach receipt to bill
  const [selectedReceipt, setSelectedReceipt] = useState<SupplierReceipt | null>(null)
  const [selectedBillId, setSelectedBillId] = useState("")

  const categories = ["Raw Materials", "Shipping", "Equipment", "Services", "Utilities", "Office Supplies", "Other"]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const billsData = await billDatabase.getBills()
      setBills(billsData)

      // Extract all receipts from bills
      const allReceipts: SupplierReceipt[] = []
      billsData.forEach((bill) => {
        allReceipts.push(...bill.supplierReceipts)
      })
      setReceipts(allReceipts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load supplier receipts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReceipt = async () => {
    if (!newReceipt.supplierName || !newReceipt.receiptNumber || !newReceipt.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const receiptData: Omit<SupplierReceipt, "id"> = {
        supplierId: newReceipt.supplierId || `supplier-${Date.now()}`,
        supplierName: newReceipt.supplierName,
        receiptNumber: newReceipt.receiptNumber,
        amount: newReceipt.amount,
        currency: newReceipt.currency,
        date: newReceipt.date,
        category: newReceipt.category,
        notes: newReceipt.notes || undefined,
        attachments: newReceipt.attachments,
      }

      await billDatabase.createSupplierReceipt(receiptData)
      await loadData()

      // Reset form
      setNewReceipt({
        supplierId: "",
        supplierName: "",
        receiptNumber: "",
        amount: 0,
        currency: "THB",
        date: new Date(),
        category: "",
        notes: "",
        attachments: [],
      })
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Supplier receipt created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create supplier receipt",
        variant: "destructive",
      })
    }
  }

  const handleEditReceipt = async () => {
    if (!editingReceipt || !editReceipt.supplierName || !editReceipt.receiptNumber || !editReceipt.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const updates: Partial<SupplierReceipt> = {
        supplierId: editReceipt.supplierId || editingReceipt.supplierId,
        supplierName: editReceipt.supplierName,
        receiptNumber: editReceipt.receiptNumber,
        amount: editReceipt.amount,
        currency: editReceipt.currency,
        date: editReceipt.date,
        category: editReceipt.category,
        notes: editReceipt.notes || undefined,
        attachments: editReceipt.attachments,
      }

      await billDatabase.updateSupplierReceipt(editingReceipt.id, updates)
      await loadData()

      setEditingReceipt(null)
      setIsEditDialogOpen(false)

      toast({
        title: "Success",
        description: "Supplier receipt updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update supplier receipt",
        variant: "destructive",
      })
    }
  }

  const handleAttachToBill = async () => {
    if (!selectedReceipt || !selectedBillId) {
      toast({
        title: "Error",
        description: "Please select a receipt and bill",
        variant: "destructive",
      })
      return
    }

    try {
      await billDatabase.attachReceiptToBill(selectedBillId, selectedReceipt.id)
      await loadData()

      setSelectedReceipt(null)
      setSelectedBillId("")
      setIsAttachDialogOpen(false)

      toast({
        title: "Success",
        description: "Receipt attached to bill successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to attach receipt to bill",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReceipt = async (receipt: SupplierReceipt) => {
    if (confirm(`Are you sure you want to delete receipt ${receipt.receiptNumber}?`)) {
      try {
        await billDatabase.deleteSupplierReceipt(receipt.id)
        await loadData()
        toast({
          title: "Success",
          description: "Supplier receipt deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete supplier receipt",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (receipt: SupplierReceipt) => {
    setEditingReceipt(receipt)
    setEditReceipt({
      supplierId: receipt.supplierId,
      supplierName: receipt.supplierName,
      receiptNumber: receipt.receiptNumber,
      amount: receipt.amount,
      currency: receipt.currency,
      date: receipt.date,
      category: receipt.category,
      notes: receipt.notes || "",
      attachments: receipt.attachments,
    })
    setIsEditDialogOpen(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Raw Materials":
        return "bg-blue-100 text-blue-800"
      case "Shipping":
        return "bg-green-100 text-green-800"
      case "Equipment":
        return "bg-purple-100 text-purple-800"
      case "Services":
        return "bg-yellow-100 text-yellow-800"
      case "Utilities":
        return "bg-orange-100 text-orange-800"
      case "Office Supplies":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAttachedBills = (receiptId: string) => {
    return bills.filter((bill) => bill.supplierReceipts.some((receipt) => receipt.id === receiptId))
  }

  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Mock file upload handler
  const handleFileUpload = (files: FileList | null, isEdit = false) => {
    if (!files) return

    const fileNames = Array.from(files).map((file) => file.name)

    if (isEdit) {
      setEditReceipt((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames],
      }))
    } else {
      setNewReceipt((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames],
      }))
    }

    toast({
      title: "Files uploaded",
      description: `${fileNames.length} file(s) uploaded successfully`,
    })
  }

  const removeAttachment = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditReceipt((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }))
    } else {
      setNewReceipt((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }))
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Supplier Receipts</h1>
          <p className="text-gray-600 mt-1">Manage supplier receipts and attach them to bills for expense tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isAttachDialogOpen} onOpenChange={setIsAttachDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach to Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Attach Receipt to Bill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Receipt</Label>
                  <Select
                    value={selectedReceipt?.id || ""}
                    onValueChange={(value) => {
                      const receipt = receipts.find((r) => r.id === value)
                      setSelectedReceipt(receipt || null)
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a receipt..." />
                    </SelectTrigger>
                    <SelectContent>
                      {receipts.map((receipt) => (
                        <SelectItem key={receipt.id} value={receipt.id}>
                          <div className="flex items-center space-x-2">
                            <span>{receipt.receiptNumber}</span>
                            <Badge className={getCategoryColor(receipt.category)}>{receipt.category}</Badge>
                            <span className="text-gray-500">- {formatCurrency(receipt.amount)}</span>
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
                      setIsAttachDialogOpen(false)
                      setSelectedReceipt(null)
                      setSelectedBillId("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAttachToBill}>Attach to Bill</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Supplier Receipt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input
                      id="supplierName"
                      value={newReceipt.supplierName}
                      onChange={(e) => setNewReceipt({ ...newReceipt, supplierName: e.target.value })}
                      placeholder="Enter supplier name..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiptNumber">Receipt Number *</Label>
                    <Input
                      id="receiptNumber"
                      value={newReceipt.receiptNumber}
                      onChange={(e) => setNewReceipt({ ...newReceipt, receiptNumber: e.target.value })}
                      placeholder="Enter receipt number..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newReceipt.amount}
                      onChange={(e) => setNewReceipt({ ...newReceipt, amount: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newReceipt.currency}
                      onValueChange={(value) => setNewReceipt({ ...newReceipt, currency: value })}
                    >
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newReceipt.category}
                      onValueChange={(value) => setNewReceipt({ ...newReceipt, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Receipt Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDate(newReceipt.date)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReceipt.date}
                          onSelect={(date) => date && setNewReceipt({ ...newReceipt, date })}
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
                    value={newReceipt.notes}
                    onChange={(e) => setNewReceipt({ ...newReceipt, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Attachments</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    {newReceipt.attachments.length > 0 && (
                      <div className="space-y-1">
                        {newReceipt.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">{file}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      setNewReceipt({
                        supplierId: "",
                        supplierName: "",
                        receiptNumber: "",
                        amount: 0,
                        currency: "THB",
                        date: new Date(),
                        category: "",
                        notes: "",
                        attachments: [],
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReceipt}>Create Receipt</Button>
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
                <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
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
                  {formatCurrency(receipts.reduce((sum, receipt) => sum + receipt.amount, 0))}
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
                <p className="text-sm font-medium text-gray-600">Attached to Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receipts.filter((receipt) => getAttachedBills(receipt.id).length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(receipts.map((r) => r.supplierName)).size}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-yellow-600" />
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
                placeholder="Search by receipt number, supplier name, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Supplier Receipts ({filteredReceipts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead>Attached Bills</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => {
                const attachedBills = getAttachedBills(receipt.id)

                return (
                  <TableRow key={receipt.id} className="hover:bg-gray-50">
                    <TableCell>
                      <span className="font-medium text-gray-900">{receipt.receiptNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{receipt.supplierName}</p>
                        <p className="text-sm text-gray-600">ID: {receipt.supplierId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(receipt.category)}>{receipt.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(receipt.amount)} {receipt.currency !== "THB" && receipt.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{formatDate(receipt.date)}</span>
                    </TableCell>
                    <TableCell>
                      {receipt.attachments.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {receipt.attachments.length} file{receipt.attachments.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No files</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {attachedBills.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Badge className="bg-green-100 text-green-800">
                            {attachedBills.length} bill{attachedBills.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          Not attached
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
                          <DropdownMenuItem onClick={() => openEditDialog(receipt)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Receipt
                          </DropdownMenuItem>
                          {receipt.attachments.length > 0 && (
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Attachments
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReceipt(receipt)
                              setIsAttachDialogOpen(true)
                            }}
                          >
                            <Paperclip className="mr-2 h-4 w-4" />
                            Attach to Bill
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteReceipt(receipt)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredReceipts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No receipts found" : "No supplier receipts created yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search term."
                  : "Create your first supplier receipt to start tracking expenses."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Receipt
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Receipt Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editSupplierName">Supplier Name *</Label>
                <Input
                  id="editSupplierName"
                  value={editReceipt.supplierName}
                  onChange={(e) => setEditReceipt({ ...editReceipt, supplierName: e.target.value })}
                  placeholder="Enter supplier name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editReceiptNumber">Receipt Number *</Label>
                <Input
                  id="editReceiptNumber"
                  value={editReceipt.receiptNumber}
                  onChange={(e) => setEditReceipt({ ...editReceipt, receiptNumber: e.target.value })}
                  placeholder="Enter receipt number..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editAmount">Amount *</Label>
                <Input
                  id="editAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editReceipt.amount}
                  onChange={(e) => setEditReceipt({ ...editReceipt, amount: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editCurrency">Currency</Label>
                <Select
                  value={editReceipt.currency}
                  onValueChange={(value) => setEditReceipt({ ...editReceipt, currency: value })}
                >
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCategory">Category *</Label>
                <Select
                  value={editReceipt.category}
                  onValueChange={(value) => setEditReceipt({ ...editReceipt, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Receipt Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(editReceipt.date)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editReceipt.date}
                      onSelect={(date) => date && setEditReceipt({ ...editReceipt, date })}
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
                value={editReceipt.notes}
                onChange={(e) => setEditReceipt({ ...editReceipt, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Attachments</Label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files, true)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {editReceipt.attachments.length > 0 && (
                  <div className="space-y-1">
                    {editReceipt.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{file}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index, true)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingReceipt(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditReceipt}>Update Receipt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
