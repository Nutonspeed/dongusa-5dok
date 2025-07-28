"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  AlertCircle,
  CheckCircle,
  User,
  Hash,
  LinkIcon,
} from "lucide-react"
import type { Customer, CustomerNameMapping } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function CustomerMappingsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [mappings, setMappings] = useState<CustomerNameMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Create mapping form
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [newNickname, setNewNickname] = useState("")

  // Edit mapping form
  const [editingMapping, setEditingMapping] = useState<CustomerNameMapping | null>(null)
  const [editNickname, setEditNickname] = useState("")
  const [editCustomerId, setEditCustomerId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [customersData, mappingsData] = await Promise.all([
        billDatabase.getCustomers(),
        billDatabase.getCustomerNameMappings(),
      ])
      setCustomers(customersData)
      setMappings(mappingsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer mappings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMapping = async () => {
    if (!selectedCustomerId || !newNickname.trim()) {
      toast({
        title: "Error",
        description: "Please select a customer and enter a nickname",
        variant: "destructive",
      })
      return
    }

    // Check if nickname already exists
    const existingMapping = mappings.find((m) => m.nickname.toLowerCase() === newNickname.trim().toLowerCase())
    if (existingMapping) {
      toast({
        title: "Error",
        description: "This nickname is already in use",
        variant: "destructive",
      })
      return
    }

    const customer = customers.find((c) => c.id === selectedCustomerId)
    if (!customer) {
      toast({
        title: "Error",
        description: "Selected customer not found",
        variant: "destructive",
      })
      return
    }

    try {
      await billDatabase.createCustomerNameMapping({
        customerId: selectedCustomerId,
        nickname: newNickname.trim(),
        fullName: customer.name,
      })

      await loadData()
      setSelectedCustomerId("")
      setNewNickname("")
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Customer name mapping created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer name mapping",
        variant: "destructive",
      })
    }
  }

  const handleEditMapping = async () => {
    if (!editingMapping || !editNickname.trim() || !editCustomerId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check if nickname already exists (excluding current mapping)
    const existingMapping = mappings.find(
      (m) => m.id !== editingMapping.id && m.nickname.toLowerCase() === editNickname.trim().toLowerCase(),
    )
    if (existingMapping) {
      toast({
        title: "Error",
        description: "This nickname is already in use",
        variant: "destructive",
      })
      return
    }

    const customer = customers.find((c) => c.id === editCustomerId)
    if (!customer) {
      toast({
        title: "Error",
        description: "Selected customer not found",
        variant: "destructive",
      })
      return
    }

    try {
      await billDatabase.updateCustomerNameMapping(editingMapping.nickname, {
        customerId: editCustomerId,
        nickname: editNickname.trim(),
        fullName: customer.name,
      })

      await loadData()
      setEditingMapping(null)
      setEditNickname("")
      setEditCustomerId("")
      setIsEditDialogOpen(false)

      toast({
        title: "Success",
        description: "Customer name mapping updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer name mapping",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMapping = async (mapping: CustomerNameMapping) => {
    if (confirm(`Are you sure you want to delete the nickname "${mapping.nickname}"?`)) {
      try {
        await billDatabase.deleteCustomerNameMapping(mapping.nickname)
        await loadData()
        toast({
          title: "Success",
          description: "Customer name mapping deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete customer name mapping",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (mapping: CustomerNameMapping) => {
    setEditingMapping(mapping)
    setEditNickname(mapping.nickname)
    setEditCustomerId(mapping.customerId)
    setIsEditDialogOpen(true)
  }

  const filteredMappings = mappings.filter(
    (mapping) =>
      mapping.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get customers without mappings
  const customersWithoutMappings = customers.filter(
    (customer) => !mappings.some((mapping) => mapping.customerId === customer.id),
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
          <h1 className="text-3xl font-bold text-gray-900">Customer Name Mappings</h1>
          <p className="text-gray-600 mt-1">Map customer nicknames to their full names for easier identification</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Mapping
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Customer Name Mapping</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Select Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center space-x-2">
                          <span>{customer.name}</span>
                          {customer.nickname && (
                            <Badge variant="secondary" className="text-xs">
                              Current: {customer.nickname}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="Enter nickname..."
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setSelectedCustomerId("")
                    setNewNickname("")
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateMapping}>Create Mapping</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mapped Customers</p>
                <p className="text-2xl font-bold text-gray-900">{mappings.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unmapped Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customersWithoutMappings.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.length > 0 ? Math.round((mappings.length / customers.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Hash className="w-6 h-6 text-purple-600" />
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
                placeholder="Search by nickname or full name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LinkIcon className="w-5 h-5 mr-2" />
            Customer Name Mappings ({filteredMappings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Customer Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping) => {
                const customer = customers.find((c) => c.id === mapping.customerId)
                return (
                  <TableRow key={mapping.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {mapping.nickname}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{mapping.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{customer?.email || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{formatDate(mapping.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{formatDate(mapping.updatedAt)}</span>
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
                          <DropdownMenuItem onClick={() => openEditDialog(mapping)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Mapping
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteMapping(mapping)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Mapping
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredMappings.length === 0 && (
            <div className="text-center py-12">
              <LinkIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No mappings found" : "No customer mappings created yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search term."
                  : "Create your first customer name mapping to start using nicknames."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Mapping
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Mapping Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Name Mapping</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCustomer">Select Customer</Label>
              <Select value={editCustomerId} onValueChange={setEditCustomerId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center space-x-2">
                        <span>{customer.name}</span>
                        {customer.nickname && (
                          <Badge variant="secondary" className="text-xs">
                            Current: {customer.nickname}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editNickname">Nickname</Label>
              <Input
                id="editNickname"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder="Enter nickname..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingMapping(null)
                  setEditNickname("")
                  setEditCustomerId("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditMapping}>Update Mapping</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unmapped Customers Alert */}
      {customersWithoutMappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              Customers Without Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {customersWithoutMappings.length} customer(s) don't have nickname mappings yet. Consider creating
                mappings for frequently referenced customers.
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-gray-900">Unmapped Customers:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customersWithoutMappings.slice(0, 6).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCustomerId(customer.id)
                        setIsCreateDialogOpen(true)
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Map
                    </Button>
                  </div>
                ))}
              </div>
              {customersWithoutMappings.length > 6 && (
                <p className="text-sm text-gray-500 mt-2">
                  And {customersWithoutMappings.length - 6} more customers...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            How to Use Customer Name Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Creating Bills</h4>
                <p className="text-sm text-gray-600">
                  When creating bills, you can search for customers using either their full name or nickname. For
                  example, search for "Cat" to find "Siriporn Tanaka".
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Filtering & Search</h4>
                <p className="text-sm text-gray-600">
                  Use nicknames in bill filters and search functions. The system will automatically match both the
                  nickname and full name.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Communication</h4>
                <p className="text-sm text-gray-600">
                  Staff can use familiar nicknames when discussing customers internally while maintaining proper full
                  names in official documents.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Consistency</h4>
                <p className="text-sm text-gray-600">
                  Mappings ensure that customer data remains consistent across the system regardless of which name
                  variation is used.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
