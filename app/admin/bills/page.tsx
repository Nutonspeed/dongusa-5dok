"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
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
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  CalendarIcon,
  X,
  Save,
  FileText,
  SortAsc,
  SortDesc,
  RefreshCw,
} from "lucide-react"
import type { Bill, BillFilter, Customer } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, formatDate, getBillStatusColor, getPriorityColor, debounce } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface SavedFilter {
  id: string
  name: string
  description?: string
  filter: BillFilter
  createdAt: Date
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Bill>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedBills, setSelectedBills] = useState<string[]>([])

  // Filter states
  const [filters, setFilters] = useState<BillFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [filterName, setFilterName] = useState("")
  const [filterDescription, setFilterDescription] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  useEffect(() => {
    loadData()
    loadSavedFilters()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, searchTerm])

  const loadData = async () => {
    try {
      const [billsData, customersData, tagsData] = await Promise.all([
        billDatabase.getBills(),
        billDatabase.getCustomers(),
        billDatabase.getCustomTags(),
      ])
      setBills(billsData)
      setCustomers(customersData)
      setAvailableTags(tagsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bills data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSavedFilters = () => {
    // In a real app, this would load from localStorage or API
    const saved = localStorage.getItem("billFilters")
    if (saved) {
      setSavedFilters(JSON.parse(saved))
    }
  }

  const applyFilters = useMemo(
    () =>
      debounce(async () => {
        try {
          const filterWithSearch = {
            ...filters,
            search: searchTerm || undefined,
          }
          const filteredBills = await billDatabase.getBills(filterWithSearch)
          setBills(filteredBills)
          setCurrentPage(1) // Reset to first page when filters change
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to apply filters",
            variant: "destructive",
          })
        }
      }, 300),
    [filters, searchTerm],
  )

  const handleFilterChange = (key: keyof BillFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
  }

  const saveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a filter name",
        variant: "destructive",
      })
      return
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      description: filterDescription,
      filter: { ...filters, search: searchTerm || undefined },
      createdAt: new Date(),
    }

    const updatedFilters = [...savedFilters, newFilter]
    setSavedFilters(updatedFilters)
    localStorage.setItem("billFilters", JSON.stringify(updatedFilters))

    setFilterName("")
    setFilterDescription("")
    toast({
      title: "Success",
      description: "Filter saved successfully",
    })
  }

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filter)
    setSearchTerm(savedFilter.filter.search || "")
    setShowFilters(false)
  }

  const deleteSavedFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter((f) => f.id !== filterId)
    setSavedFilters(updatedFilters)
    localStorage.setItem("billFilters", JSON.stringify(updatedFilters))
    toast({
      title: "Success",
      description: "Filter deleted successfully",
    })
  }

  const handleSort = (field: keyof Bill) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedBills.length === 0) {
      toast({
        title: "Error",
        description: "Please select bills to perform bulk action",
        variant: "destructive",
      })
      return
    }

    try {
      switch (action) {
        case "delete":
          if (confirm(`Are you sure you want to delete ${selectedBills.length} bills?`)) {
            for (const billId of selectedBills) {
              await billDatabase.deleteBill(billId)
            }
            await loadData()
            setSelectedBills([])
            toast({
              title: "Success",
              description: `${selectedBills.length} bills deleted successfully`,
            })
          }
          break
        case "export":
          // Export functionality would be implemented here
          toast({
            title: "Success",
            description: `${selectedBills.length} bills exported successfully`,
          })
          break
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      })
    }
  }

  // Sort and paginate bills
  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [bills, sortField, sortDirection])

  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedBills.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedBills, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedBills.length / itemsPerPage)

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)

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
          <h1 className="text-3xl font-bold text-gray-900">Bills Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your bills with advanced filtering and search capabilities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/bills/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bills by number, customer name, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Bills</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["draft", "sent", "paid", "partially_paid", "overdue", "cancelled"].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={status}
                            checked={filters.status?.includes(status) || false}
                            onCheckedChange={(checked) => {
                              const currentStatus = filters.status || []
                              if (checked) {
                                handleFilterChange("status", [...currentStatus, status])
                              } else {
                                handleFilterChange(
                                  "status",
                                  currentStatus.filter((s) => s !== status),
                                )
                              }
                            }}
                          />
                          <Label htmlFor={status} className="text-sm capitalize">
                            {status.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["low", "medium", "high", "urgent"].map((priority) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <Checkbox
                            id={priority}
                            checked={filters.priority?.includes(priority) || false}
                            onCheckedChange={(checked) => {
                              const currentPriority = filters.priority || []
                              if (checked) {
                                handleFilterChange("priority", [...currentPriority, priority])
                              } else {
                                handleFilterChange(
                                  "priority",
                                  currentPriority.filter((p) => p !== priority),
                                )
                              }
                            }}
                          />
                          <Label htmlFor={priority} className="text-sm capitalize">
                            {priority}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <Label className="text-sm font-medium">Date Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? formatDate(filters.dateFrom) : "From"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom}
                            onSelect={(date) => handleFilterChange("dateFrom", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? formatDate(filters.dateTo) : "To"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateTo}
                            onSelect={(date) => handleFilterChange("dateTo", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Amount Range */}
                  <div>
                    <Label className="text-sm font-medium">Amount Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label htmlFor="minAmount" className="text-xs text-gray-500">
                          Min Amount
                        </Label>
                        <Input
                          id="minAmount"
                          type="number"
                          placeholder="0"
                          value={filters.minAmount || ""}
                          onChange={(e) => handleFilterChange("minAmount", Number(e.target.value) || undefined)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxAmount" className="text-xs text-gray-500">
                          Max Amount
                        </Label>
                        <Input
                          id="maxAmount"
                          type="number"
                          placeholder="∞"
                          value={filters.maxAmount || ""}
                          onChange={(e) => handleFilterChange("maxAmount", Number(e.target.value) || undefined)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Filter */}
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <Select
                      value={filters.customerId || "all"}
                      onValueChange={(value) => handleFilterChange("customerId", value || undefined)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} {customer.nickname && `(${customer.nickname})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={filters.tags?.includes(tag) || false}
                            onCheckedChange={(checked) => {
                              const currentTags = filters.tags || []
                              if (checked) {
                                handleFilterChange("tags", [...currentTags, tag])
                              } else {
                                handleFilterChange(
                                  "tags",
                                  currentTags.filter((t) => t !== tag),
                                )
                              }
                            }}
                          />
                          <Label htmlFor={`tag-${tag}`} className="text-sm">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Filter Actions */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Button onClick={clearFilters} variant="outline" size="sm" className="flex-1 bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Save Filter</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="filterName">Filter Name</Label>
                              <Input
                                id="filterName"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="Enter filter name..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="filterDescription">Description (Optional)</Label>
                              <Textarea
                                id="filterDescription"
                                value={filterDescription}
                                onChange={(e) => setFilterDescription(e.target.value)}
                                placeholder="Describe this filter..."
                                rows={3}
                              />
                            </div>
                            <Button onClick={saveFilter} className="w-full">
                              Save Filter
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Saved Filters */}
                    {savedFilters.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Saved Filters</Label>
                        <div className="mt-2 space-y-2">
                          {savedFilters.map((savedFilter) => (
                            <div key={savedFilter.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{savedFilter.name}</p>
                                {savedFilter.description && (
                                  <p className="text-xs text-gray-500">{savedFilter.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  onClick={() => loadSavedFilter(savedFilter)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteSavedFilter(savedFilter.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: {searchTerm}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                </Badge>
              )}
              {filters.status?.map((status) => (
                <Badge key={status} variant="secondary" className="flex items-center space-x-1">
                  <span>Status: {status}</span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      handleFilterChange(
                        "status",
                        filters.status?.filter((s) => s !== status),
                      )
                    }
                  />
                </Badge>
              ))}
              {filters.priority?.map((priority) => (
                <Badge key={priority} variant="secondary" className="flex items-center space-x-1">
                  <span>Priority: {priority}</span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      handleFilterChange(
                        "priority",
                        filters.priority?.filter((p) => p !== priority),
                      )
                    }
                  />
                </Badge>
              ))}
              {filters.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>Tag: {tag}</span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      handleFilterChange(
                        "tags",
                        filters.tags?.filter((t) => t !== tag),
                      )
                    }
                  />
                </Badge>
              ))}
              <Button onClick={clearFilters} variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">
            Showing {paginatedBills.length} of {sortedBills.length} bills
          </p>
          {selectedBills.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge>{selectedBills.length} selected</Badge>
              <Button onClick={() => handleBulkAction("export")} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => handleBulkAction("delete")}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Show:</Label>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bills Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedBills.length === paginatedBills.length && paginatedBills.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBills(paginatedBills.map((bill) => bill.id))
                      } else {
                        setSelectedBills([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("billNumber")}
                    className="h-auto p-0 font-medium"
                  >
                    Bill Number
                    {sortField === "billNumber" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("customer")}
                    className="h-auto p-0 font-medium"
                  >
                    Customer
                    {sortField === "customer" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("total")}
                    className="h-auto p-0 font-medium"
                  >
                    Amount
                    {sortField === "total" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("createdAt")}
                    className="h-auto p-0 font-medium"
                  >
                    Created
                    {sortField === "createdAt" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBills.map((bill) => (
                <TableRow key={bill.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedBills.includes(bill.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBills([...selectedBills, bill.id])
                        } else {
                          setSelectedBills(selectedBills.filter((id) => id !== bill.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/bills/${bill.id}`} className="font-medium text-pink-600 hover:text-pink-700">
                      {bill.billNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{bill.customer.name}</p>
                      {bill.customer.nickname && <p className="text-sm text-gray-500">({bill.customer.nickname})</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(bill.total)}</p>
                      {bill.remainingBalance > 0 && (
                        <p className="text-sm text-red-600">Due: {formatCurrency(bill.remainingBalance)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBillStatusColor(bill.status)}>{bill.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(bill.priority)} variant="outline">
                      {bill.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{formatDate(bill.createdAt)}</p>
                      <p className="text-xs text-gray-500">Due: {formatDate(bill.dueDate)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {bill.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {bill.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bill.tags.length - 2}
                        </Badge>
                      )}
                    </div>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/bills/${bill.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/bills/${bill.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Bill
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this bill?")) {
                              try {
                                await billDatabase.deleteBill(bill.id)
                                await loadData()
                                toast({
                                  title: "Success",
                                  description: "Bill deleted successfully",
                                })
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to delete bill",
                                  variant: "destructive",
                                })
                              }
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Bill
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paginatedBills.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
              <p className="text-gray-600 mb-4">
                {activeFiltersCount > 0
                  ? "Try adjusting your filters to see more results."
                  : "Get started by creating your first bill."}
              </p>
              {activeFiltersCount > 0 ? (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              ) : (
                <Link href="/admin/bills/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Bill
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({sortedBills.length} total bills)
          </p>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    onClick={() => setCurrentPage(totalPages)}
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
