import type {
  Bill,
  Customer,
  BillFilter,
  DashboardKPI,
  CustomerNameMapping,
  PurchaseOrderReference,
  SupplierReceipt,
} from "./types/bill"

// Mock database implementation with enhanced features
class EnhancedBillDatabase {
  private bills: Bill[] = []
  private customers: Customer[] = []
  private customTags: string[] = ["Urgent", "Cut", "Rush Order", "VIP", "Wholesale", "Retail", "Custom", "Standard"]
  private customerNameMappings: CustomerNameMapping[] = []
  private purchaseOrders: PurchaseOrderReference[] = []
  private supplierReceipts: SupplierReceipt[] = []

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Initialize customers
    this.customers = [
      {
        id: "cust-001",
        name: "Siriporn Tanaka",
        nickname: "Cat",
        email: "siriporn@example.com",
        phone: "+66 81 234 5678",
        address: {
          street: "123 Sukhumvit Road",
          city: "Bangkok",
          state: "Bangkok",
          zipCode: "10110",
          country: "Thailand",
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "cust-002",
        name: "John Smith",
        nickname: "Johnny",
        email: "john.smith@example.com",
        phone: "+1 555 123 4567",
        address: {
          street: "456 Oak Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
      {
        id: "cust-003",
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        phone: "+34 612 345 678",
        address: {
          street: "789 Plaza Mayor",
          city: "Madrid",
          state: "Madrid",
          zipCode: "28013",
          country: "Spain",
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
    ]

    // Initialize customer name mappings
    this.customerNameMappings = [
      {
        id: "mapping-001",
        customerId: "cust-001",
        nickname: "Cat",
        fullName: "Siriporn Tanaka",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "mapping-002",
        customerId: "cust-002",
        nickname: "Johnny",
        fullName: "John Smith",
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
    ]

    // Initialize purchase orders
    this.purchaseOrders = [
      {
        id: "po-001",
        platform: "lazada",
        orderId: "LZ123456789",
        url: "https://lazada.com/order/LZ123456789",
        amount: 2500,
        currency: "THB",
        attachments: ["receipt-001.pdf"],
        supplierInfo: {
          name: "Bangkok Fabric Co.",
          contact: "+66 2 123 4567",
          address: "456 Textile District, Bangkok",
        },
        orderDate: new Date("2024-01-10"),
        expectedDelivery: new Date("2024-01-20"),
        notes: "Premium cotton fabric for sofa covers",
      },
      {
        id: "po-002",
        platform: "shopee",
        orderId: "SP987654321",
        url: "https://shopee.com/order/SP987654321",
        amount: 1800,
        currency: "THB",
        attachments: [],
        supplierInfo: {
          name: "Quality Zippers Ltd.",
          contact: "+66 81 987 6543",
        },
        orderDate: new Date("2024-01-12"),
        expectedDelivery: new Date("2024-01-25"),
      },
    ]

    // Initialize supplier receipts
    this.supplierReceipts = [
      {
        id: "receipt-001",
        supplierId: "supplier-001",
        supplierName: "Bangkok Fabric Co.",
        receiptNumber: "BFC-2024-001",
        amount: 2500,
        currency: "THB",
        date: new Date("2024-01-10"),
        category: "Raw Materials",
        notes: "Premium cotton fabric delivery",
        attachments: ["fabric-receipt.pdf", "quality-cert.jpg"],
      },
      {
        id: "receipt-002",
        supplierId: "supplier-002",
        supplierName: "Express Shipping Co.",
        receiptNumber: "ESC-2024-015",
        amount: 350,
        currency: "THB",
        date: new Date("2024-01-15"),
        category: "Shipping",
        attachments: ["shipping-receipt.pdf"],
      },
    ]

    // Initialize bills with enhanced data
    this.bills = [
      {
        id: "bill-001",
        billNumber: "INV-2024-001",
        customer: this.customers[0],
        items: [
          {
            id: "item-001",
            name: "3-Seater Sofa Cover - Premium Cotton",
            description: "Custom-fitted cover for 3-seater sofa in premium cotton fabric",
            quantity: 2,
            unitPrice: 1500,
            total: 3000,
            category: "Sofa Covers",
          },
          {
            id: "item-002",
            name: "Cushion Covers Set",
            description: "Set of 4 matching cushion covers",
            quantity: 1,
            unitPrice: 800,
            total: 800,
            category: "Accessories",
          },
        ],
        subtotal: 3800,
        tax: 266,
        discount: 0,
        total: 4066,
        paidAmount: 2000,
        remainingBalance: 2066,
        status: "partially_paid",
        priority: "high",
        tags: ["VIP", "Custom", "Rush Order"],
        notes: "Customer requested rush delivery for special event",
        dueDate: new Date("2024-02-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
        purchaseOrders: [this.purchaseOrders[0]],
        supplierReceipts: [this.supplierReceipts[0]],
        progressStages: [
          {
            stage: "Order Received",
            status: "completed",
            completedAt: new Date("2024-01-15"),
            notes: "Order confirmed with customer",
          },
          {
            stage: "Tailoring",
            status: "in_progress",
            startedAt: new Date("2024-01-16"),
            estimatedCompletion: new Date("2024-02-10"),
          },
          {
            stage: "Packing",
            status: "pending",
          },
          {
            stage: "Shipping",
            status: "pending",
          },
          {
            stage: "Delivered",
            status: "pending",
          },
        ],
      },
      {
        id: "bill-002",
        billNumber: "INV-2024-002",
        customer: this.customers[1],
        items: [
          {
            id: "item-003",
            name: "2-Seater Sofa Cover - Linen Blend",
            description: "Standard cover for 2-seater sofa in linen blend fabric",
            quantity: 1,
            unitPrice: 1200,
            total: 1200,
            category: "Sofa Covers",
          },
        ],
        subtotal: 1200,
        tax: 84,
        discount: 120,
        total: 1164,
        paidAmount: 1164,
        remainingBalance: 0,
        status: "paid",
        priority: "medium",
        tags: ["Standard", "Retail"],
        dueDate: new Date("2024-02-20"),
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-25"),
        purchaseOrders: [],
        supplierReceipts: [this.supplierReceipts[1]],
        progressStages: [
          {
            stage: "Order Received",
            status: "completed",
            completedAt: new Date("2024-01-20"),
          },
          {
            stage: "Tailoring",
            status: "completed",
            completedAt: new Date("2024-01-28"),
          },
          {
            stage: "Packing",
            status: "completed",
            completedAt: new Date("2024-01-29"),
          },
          {
            stage: "Shipping",
            status: "completed",
            completedAt: new Date("2024-01-30"),
          },
          {
            stage: "Delivered",
            status: "completed",
            completedAt: new Date("2024-02-01"),
          },
        ],
      },
      {
        id: "bill-003",
        billNumber: "INV-2024-003",
        customer: this.customers[2],
        items: [
          {
            id: "item-004",
            name: "L-Shaped Sofa Cover - Microfiber",
            description: "Custom L-shaped sofa cover in microfiber material",
            quantity: 1,
            unitPrice: 2200,
            total: 2200,
            category: "Sofa Covers",
          },
          {
            id: "item-005",
            name: "Ottoman Cover",
            description: "Matching ottoman cover",
            quantity: 1,
            unitPrice: 400,
            total: 400,
            category: "Accessories",
          },
        ],
        subtotal: 2600,
        tax: 182,
        discount: 0,
        total: 2782,
        paidAmount: 0,
        remainingBalance: 2782,
        status: "sent",
        priority: "low",
        tags: ["Custom", "Wholesale"],
        dueDate: new Date("2024-03-01"),
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
        purchaseOrders: [this.purchaseOrders[1]],
        supplierReceipts: [],
        progressStages: [
          {
            stage: "Order Received",
            status: "completed",
            completedAt: new Date("2024-02-01"),
          },
          {
            stage: "Tailoring",
            status: "pending",
          },
          {
            stage: "Packing",
            status: "pending",
          },
          {
            stage: "Shipping",
            status: "pending",
          },
          {
            stage: "Delivered",
            status: "pending",
          },
        ],
      },
    ]
  }

  // Bill operations
  async getBills(filter?: BillFilter): Promise<Bill[]> {
    let filteredBills = [...this.bills]

    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        filteredBills = filteredBills.filter(
          (bill) =>
            bill.billNumber.toLowerCase().includes(searchTerm) ||
            bill.customer.name.toLowerCase().includes(searchTerm) ||
            bill.customer.nickname?.toLowerCase().includes(searchTerm) ||
            bill.notes?.toLowerCase().includes(searchTerm),
        )
      }

      if (filter.status && filter.status.length > 0) {
        filteredBills = filteredBills.filter((bill) => filter.status!.includes(bill.status))
      }

      if (filter.priority && filter.priority.length > 0) {
        filteredBills = filteredBills.filter((bill) => filter.priority!.includes(bill.priority))
      }

      if (filter.customerId) {
        filteredBills = filteredBills.filter((bill) => bill.customer.id === filter.customerId)
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredBills = filteredBills.filter((bill) => filter.tags!.some((tag) => bill.tags.includes(tag)))
      }

      if (filter.dateFrom) {
        filteredBills = filteredBills.filter((bill) => bill.createdAt >= filter.dateFrom!)
      }

      if (filter.dateTo) {
        filteredBills = filteredBills.filter((bill) => bill.createdAt <= filter.dateTo!)
      }

      if (filter.minAmount !== undefined) {
        filteredBills = filteredBills.filter((bill) => bill.total >= filter.minAmount!)
      }

      if (filter.maxAmount !== undefined) {
        filteredBills = filteredBills.filter((bill) => bill.total <= filter.maxAmount!)
      }
    }

    return filteredBills
  }

  async getBillById(id: string): Promise<Bill | null> {
    return this.bills.find((bill) => bill.id === id) || null
  }

  async createBill(billData: Omit<Bill, "id" | "createdAt" | "updatedAt">): Promise<Bill> {
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.bills.push(newBill)
    return newBill
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const billIndex = this.bills.findIndex((bill) => bill.id === id)
    if (billIndex === -1) return null

    this.bills[billIndex] = {
      ...this.bills[billIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return this.bills[billIndex]
  }

  async deleteBill(id: string): Promise<boolean> {
    const billIndex = this.bills.findIndex((bill) => bill.id === id)
    if (billIndex === -1) return false

    this.bills.splice(billIndex, 1)
    return true
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return [...this.customers]
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return this.customers.find((customer) => customer.id === id) || null
  }

  async createCustomer(customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.customers.push(newCustomer)
    return newCustomer
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customerIndex = this.customers.findIndex((customer) => customer.id === id)
    if (customerIndex === -1) return null

    this.customers[customerIndex] = {
      ...this.customers[customerIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return this.customers[customerIndex]
  }

  // Custom tags operations
  async getCustomTags(): Promise<string[]> {
    return [...this.customTags]
  }

  async addCustomTag(tag: string): Promise<void> {
    if (!this.customTags.includes(tag)) {
      this.customTags.push(tag)
    }
  }

  async removeCustomTag(tag: string): Promise<void> {
    this.customTags = this.customTags.filter((t) => t !== tag)
  }

  // Customer name mapping operations
  async getCustomerNameMappings(): Promise<CustomerNameMapping[]> {
    return [...this.customerNameMappings]
  }

  async createCustomerNameMapping(
    mappingData: Omit<CustomerNameMapping, "id" | "createdAt" | "updatedAt">,
  ): Promise<CustomerNameMapping> {
    const newMapping: CustomerNameMapping = {
      ...mappingData,
      id: `mapping-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.customerNameMappings.push(newMapping)
    return newMapping
  }

  async updateCustomerNameMapping(
    nickname: string,
    updates: Partial<CustomerNameMapping>,
  ): Promise<CustomerNameMapping | null> {
    const mappingIndex = this.customerNameMappings.findIndex((mapping) => mapping.nickname === nickname)
    if (mappingIndex === -1) return null

    this.customerNameMappings[mappingIndex] = {
      ...this.customerNameMappings[mappingIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return this.customerNameMappings[mappingIndex]
  }

  async deleteCustomerNameMapping(nickname: string): Promise<boolean> {
    const mappingIndex = this.customerNameMappings.findIndex((mapping) => mapping.nickname === nickname)
    if (mappingIndex === -1) return false

    this.customerNameMappings.splice(mappingIndex, 1)
    return true
  }

  // Purchase order operations
  async createPurchaseOrder(poData: Omit<PurchaseOrderReference, "id">): Promise<PurchaseOrderReference> {
    const newPO: PurchaseOrderReference = {
      ...poData,
      id: `po-${Date.now()}`,
    }
    this.purchaseOrders.push(newPO)
    return newPO
  }

  async updatePurchaseOrder(
    id: string,
    updates: Partial<PurchaseOrderReference>,
  ): Promise<PurchaseOrderReference | null> {
    const poIndex = this.purchaseOrders.findIndex((po) => po.id === id)
    if (poIndex === -1) return null

    this.purchaseOrders[poIndex] = {
      ...this.purchaseOrders[poIndex],
      ...updates,
    }
    return this.purchaseOrders[poIndex]
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    const poIndex = this.purchaseOrders.findIndex((po) => po.id === id)
    if (poIndex === -1) return false

    this.purchaseOrders.splice(poIndex, 1)
    return true
  }

  async linkPurchaseOrderToBill(billId: string, poId: string): Promise<boolean> {
    const bill = this.bills.find((b) => b.id === billId)
    const po = this.purchaseOrders.find((p) => p.id === poId)

    if (!bill || !po) return false

    if (!bill.purchaseOrders.some((existingPO) => existingPO.id === poId)) {
      bill.purchaseOrders.push(po)
      bill.updatedAt = new Date()
    }

    return true
  }

  // Supplier receipt operations
  async createSupplierReceipt(receiptData: Omit<SupplierReceipt, "id">): Promise<SupplierReceipt> {
    const newReceipt: SupplierReceipt = {
      ...receiptData,
      id: `receipt-${Date.now()}`,
    }
    this.supplierReceipts.push(newReceipt)
    return newReceipt
  }

  async updateSupplierReceipt(id: string, updates: Partial<SupplierReceipt>): Promise<SupplierReceipt | null> {
    const receiptIndex = this.supplierReceipts.findIndex((receipt) => receipt.id === id)
    if (receiptIndex === -1) return null

    this.supplierReceipts[receiptIndex] = {
      ...this.supplierReceipts[receiptIndex],
      ...updates,
    }
    return this.supplierReceipts[receiptIndex]
  }

  async deleteSupplierReceipt(id: string): Promise<boolean> {
    const receiptIndex = this.supplierReceipts.findIndex((receipt) => receipt.id === id)
    if (receiptIndex === -1) return false

    this.supplierReceipts.splice(receiptIndex, 1)
    return true
  }

  async attachReceiptToBill(billId: string, receiptId: string): Promise<boolean> {
    const bill = this.bills.find((b) => b.id === billId)
    const receipt = this.supplierReceipts.find((r) => r.id === receiptId)

    if (!bill || !receipt) return false

    if (!bill.supplierReceipts.some((existingReceipt) => existingReceipt.id === receiptId)) {
      bill.supplierReceipts.push(receipt)
      bill.updatedAt = new Date()
    }

    return true
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<DashboardKPI> {
    const totalRevenue = this.bills.reduce((sum, bill) => sum + bill.total, 0)
    const totalBills = this.bills.length
    const paidBills = this.bills.filter((bill) => bill.status === "paid").length
    const pendingBills = this.bills.filter((bill) => bill.status === "sent" || bill.status === "draft").length
    const overdueBills = this.bills.filter((bill) => bill.status !== "paid" && bill.dueDate < new Date()).length
    const partiallyPaidBills = this.bills.filter((bill) => bill.status === "partially_paid").length
    const completedBills = this.bills.filter((bill) => bill.status === "paid").length
    const averageOrderValue = totalBills > 0 ? totalRevenue / totalBills : 0

    // Calculate monthly growth (mock calculation)
    const currentMonth = new Date().getMonth()
    const currentMonthBills = this.bills.filter((bill) => bill.createdAt.getMonth() === currentMonth)
    const lastMonthBills = this.bills.filter((bill) => bill.createdAt.getMonth() === currentMonth - 1)
    const currentMonthRevenue = currentMonthBills.reduce((sum, bill) => sum + bill.total, 0)
    const lastMonthRevenue = lastMonthBills.reduce((sum, bill) => sum + bill.total, 0)
    const monthlyGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    // Revenue by month (last 6 months)
    const revenueByMonth = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthBills = this.bills.filter(
        (bill) => bill.createdAt.getMonth() === date.getMonth() && bill.createdAt.getFullYear() === date.getFullYear(),
      )
      revenueByMonth.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: monthBills.reduce((sum, bill) => sum + bill.total, 0),
        billCount: monthBills.length,
      })
    }

    // Status distribution
    const statusCounts = this.bills.reduce(
      (acc, bill) => {
        acc[bill.status] = (acc[bill.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalBills) * 100,
    }))

    // Top selling items
    const itemCounts = this.bills
      .flatMap((bill) => bill.items)
      .reduce(
        (acc, item) => {
          const key = item.name
          if (!acc[key]) {
            acc[key] = { itemName: key, quantity: 0, revenue: 0 }
          }
          acc[key].quantity += item.quantity
          acc[key].revenue += item.total
          return acc
        },
        {} as Record<string, { itemName: string; quantity: number; revenue: number }>,
      )

    const topSellingItems = Object.values(itemCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Top customers
    const customerRevenue = this.bills.reduce(
      (acc, bill) => {
        const customerId = bill.customer.id
        if (!acc[customerId]) {
          acc[customerId] = {
            customerId,
            customerName: bill.customer.name,
            totalSpent: 0,
            billCount: 0,
          }
        }
        acc[customerId].totalSpent += bill.total
        acc[customerId].billCount += 1
        return acc
      },
      {} as Record<string, { customerId: string; customerName: string; totalSpent: number; billCount: number }>,
    )

    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    return {
      totalRevenue,
      totalBills,
      pendingBills,
      overdueBills,
      averageOrderValue,
      monthlyGrowth,
      completedBills,
      partiallyPaidBills,
      revenueByMonth,
      statusDistribution,
      topSellingItems,
      topCustomers,
    }
  }
}

export const billDatabase = new EnhancedBillDatabase()
