import type {
  Bill,
  Customer,
  BillFilter,
  DashboardKPI,
  BillProgress,
  PurchaseOrderReference,
  SupplierReceipt,
  PaymentRecord,
  CustomerNameMapping,
} from "./types/bill"

class EnhancedBillDatabase {
  private bills: Map<string, Bill> = new Map()
  private customers: Map<string, Customer> = new Map()
  private customerNameMapping: Map<string, CustomerNameMapping> = new Map()
  private customTags: Set<string> = new Set()
  private purchaseOrders: Map<string, PurchaseOrderReference> = new Map()
  private supplierReceipts: Map<string, SupplierReceipt> = new Map()

  constructor() {
    this.initializeSampleData()
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private initializeSampleData() {
    // Sample customers
    const customers: Customer[] = [
      {
        id: "cust-001",
        name: "Siriporn Tanaka",
        nickname: "Cat",
        email: "siriporn@example.com",
        phone: "+66-89-123-4567",
        address: {
          street: "123 Sukhumvit Road",
          city: "Bangkok",
          province: "Bangkok",
          postalCode: "10110",
          country: "Thailand",
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "cust-002",
        name: "Somchai Jaidee",
        nickname: "Som",
        email: "somchai@example.com",
        phone: "+66-81-987-6543",
        address: {
          street: "456 Phahonyothin Road",
          city: "Bangkok",
          province: "Bangkok",
          postalCode: "10400",
          country: "Thailand",
        },
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
      {
        id: "cust-003",
        name: "Malee Suksawat",
        nickname: "Mali",
        email: "malee@example.com",
        phone: "+66-82-555-1234",
        address: {
          street: "789 Ratchadamri Road",
          city: "Bangkok",
          province: "Bangkok",
          postalCode: "10330",
          country: "Thailand",
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
    ]

    customers.forEach((customer) => {
      this.customers.set(customer.id, customer)
      if (customer.nickname) {
        const mapping: CustomerNameMapping = {
          id: this.generateId(),
          customerId: customer.id,
          nickname: customer.nickname,
          fullName: customer.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        this.customerNameMapping.set(customer.nickname.toLowerCase(), mapping)
      }
    })

    // Sample purchase orders
    const purchaseOrders: PurchaseOrderReference[] = [
      {
        id: "po-001",
        platform: "lazada",
        orderId: "LZ-2024-001",
        url: "https://lazada.com/order/LZ-2024-001",
        amount: 1500,
        currency: "THB",
        attachments: [],
        supplierInfo: {
          name: "Premium Fabrics Co.",
          contact: "+66-2-123-4567",
          address: "Bangkok, Thailand",
        },
        orderDate: new Date("2024-01-16"),
        expectedDelivery: new Date("2024-01-25"),
        notes: "High-quality velvet fabric",
      },
      {
        id: "po-002",
        platform: "shopee",
        orderId: "SP-2024-002",
        url: "https://shopee.co.th/order/SP-2024-002",
        amount: 800,
        currency: "THB",
        attachments: [],
        supplierInfo: {
          name: "Textile World",
          contact: "+66-2-987-6543",
          address: "Chiang Mai, Thailand",
        },
        orderDate: new Date("2024-02-01"),
        expectedDelivery: new Date("2024-02-10"),
        notes: "Cotton blend fabric",
      },
    ]

    purchaseOrders.forEach((po) => {
      this.purchaseOrders.set(po.id, po)
    })

    // Sample supplier receipts
    const supplierReceipts: SupplierReceipt[] = [
      {
        id: "receipt-001",
        supplierId: "sup-001",
        supplierName: "Premium Fabrics Co.",
        receiptNumber: "PF-2024-001",
        amount: 1500,
        currency: "THB",
        date: new Date("2024-01-16"),
        attachments: [],
        category: "Raw Materials",
        notes: "Payment for velvet fabric order",
      },
      {
        id: "receipt-002",
        supplierId: "sup-002",
        supplierName: "Textile World",
        receiptNumber: "TW-2024-002",
        amount: 800,
        currency: "THB",
        date: new Date("2024-02-01"),
        attachments: [],
        category: "Raw Materials",
        notes: "Cotton blend fabric purchase",
      },
    ]

    supplierReceipts.forEach((receipt) => {
      this.supplierReceipts.set(receipt.id, receipt)
    })

    // Sample bills with comprehensive data
    const bills: Bill[] = [
      {
        id: "bill-001",
        billNumber: "INV-2024-001",
        customerId: "cust-001",
        customer: customers[0],
        items: [
          {
            id: "item-001",
            name: "Custom Sofa Cover - 3 Seater",
            description: "Premium velvet sofa cover with custom measurements",
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500,
            category: "Sofa Covers",
            sku: "SC-3S-001",
          },
          {
            id: "item-002",
            name: "Cushion Covers Set",
            description: "Matching cushion covers (4 pieces)",
            quantity: 4,
            unitPrice: 300,
            totalPrice: 1200,
            category: "Accessories",
            sku: "CC-SET-001",
          },
        ],
        subtotal: 3700,
        tax: 259,
        discount: 0,
        total: 3959,
        paidAmount: 0,
        remainingBalance: 3959,
        currency: "THB",
        status: "sent",
        dueDate: new Date("2024-02-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-18"),
        progress: [
          {
            status: "pending",
            timestamp: new Date("2024-01-15T10:00:00Z"),
            notes: "Bill created and sent to customer",
            updatedBy: "admin-001",
          },
          {
            status: "confirmed",
            timestamp: new Date("2024-01-16T14:30:00Z"),
            notes: "Customer confirmed order",
            updatedBy: "system",
            estimatedCompletion: new Date("2024-01-20T17:00:00Z"),
          },
          {
            status: "tailoring",
            timestamp: new Date("2024-01-18T09:00:00Z"),
            notes: "Started tailoring process",
            updatedBy: "admin-001",
            estimatedCompletion: new Date("2024-01-25T17:00:00Z"),
          },
        ],
        tags: ["Premium", "Custom", "Urgent"],
        purchaseOrders: [purchaseOrders[0]],
        supplierReceipts: [supplierReceipts[0]],
        paymentRecords: [],
        paymentQrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        notes: "Customer prefers delivery on weekends",
        createdBy: "admin-001",
        priority: "high",
      },
      {
        id: "bill-002",
        billNumber: "INV-2024-002",
        customerId: "cust-002",
        customer: customers[1],
        items: [
          {
            id: "item-003",
            name: "Waterproof Sofa Cover",
            description: "Water-resistant fabric sofa cover",
            quantity: 1,
            unitPrice: 1800,
            totalPrice: 1800,
            category: "Sofa Covers",
            sku: "SC-WP-001",
          },
        ],
        subtotal: 1800,
        tax: 126,
        discount: 180,
        total: 1746,
        paidAmount: 1746,
        remainingBalance: 0,
        currency: "THB",
        status: "paid",
        dueDate: new Date("2024-02-20"),
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-02-05"),
        progress: [
          {
            status: "pending",
            timestamp: new Date("2024-01-20T10:00:00Z"),
            notes: "Bill created and sent to customer",
            updatedBy: "admin-001",
          },
          {
            status: "confirmed",
            timestamp: new Date("2024-01-21T11:00:00Z"),
            notes: "Customer confirmed and paid",
            updatedBy: "system",
          },
          {
            status: "tailoring",
            timestamp: new Date("2024-01-22T09:00:00Z"),
            notes: "Started production",
            updatedBy: "admin-001",
            actualCompletion: new Date("2024-01-28T16:00:00Z"),
          },
          {
            status: "packing",
            timestamp: new Date("2024-01-28T16:30:00Z"),
            notes: "Quality check passed, packing started",
            updatedBy: "admin-001",
            actualCompletion: new Date("2024-01-29T10:00:00Z"),
          },
          {
            status: "shipped",
            timestamp: new Date("2024-01-29T14:00:00Z"),
            notes: "Shipped via Thailand Post",
            updatedBy: "admin-001",
          },
          {
            status: "delivered",
            timestamp: new Date("2024-02-02T15:30:00Z"),
            notes: "Successfully delivered to customer",
            updatedBy: "system",
            actualCompletion: new Date("2024-02-02T15:30:00Z"),
          },
          {
            status: "completed",
            timestamp: new Date("2024-02-05T10:00:00Z"),
            notes: "Order completed, customer satisfied",
            updatedBy: "admin-001",
            actualCompletion: new Date("2024-02-05T10:00:00Z"),
          },
        ],
        tags: ["Waterproof", "Quick Order"],
        purchaseOrders: [purchaseOrders[1]],
        supplierReceipts: [supplierReceipts[1]],
        paymentRecords: [
          {
            id: "pay-001",
            amount: 1746,
            currency: "THB",
            method: "qr_code",
            transactionId: "TXN-2024-001",
            date: new Date("2024-01-21T11:30:00Z"),
            status: "confirmed",
            notes: "Payment via PromptPay QR code",
          },
        ],
        paymentQrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        notes: "Fast delivery requested",
        createdBy: "admin-001",
        priority: "medium",
      },
      {
        id: "bill-003",
        billNumber: "INV-2024-003",
        customerId: "cust-003",
        customer: customers[2],
        items: [
          {
            id: "item-004",
            name: "Sectional Sofa Cover Set",
            description: "L-shaped sectional sofa cover with corner piece",
            quantity: 1,
            unitPrice: 4200,
            totalPrice: 4200,
            category: "Sofa Covers",
            sku: "SC-SEC-001",
          },
          {
            id: "item-005",
            name: "Fabric Protection Spray",
            description: "Professional fabric protection treatment",
            quantity: 2,
            unitPrice: 350,
            totalPrice: 700,
            category: "Care Products",
            sku: "FPS-001",
          },
        ],
        subtotal: 4900,
        tax: 343,
        discount: 490,
        total: 4753,
        paidAmount: 2000,
        remainingBalance: 2753,
        currency: "THB",
        status: "partially_paid",
        dueDate: new Date("2024-03-01"),
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-10"),
        progress: [
          {
            status: "pending",
            timestamp: new Date("2024-02-01T10:00:00Z"),
            notes: "Bill created, awaiting customer confirmation",
            updatedBy: "admin-001",
          },
          {
            status: "confirmed",
            timestamp: new Date("2024-02-03T14:00:00Z"),
            notes: "Customer confirmed, partial payment received",
            updatedBy: "system",
          },
          {
            status: "tailoring",
            timestamp: new Date("2024-02-05T09:00:00Z"),
            notes: "Started production with partial payment",
            updatedBy: "admin-001",
            estimatedCompletion: new Date("2024-02-20T17:00:00Z"),
          },
        ],
        tags: ["Sectional", "Large Order", "VIP Customer"],
        purchaseOrders: [],
        supplierReceipts: [],
        paymentRecords: [
          {
            id: "pay-002",
            amount: 2000,
            currency: "THB",
            method: "bank_transfer",
            transactionId: "TXN-2024-002",
            date: new Date("2024-02-03T16:00:00Z"),
            status: "confirmed",
            notes: "Partial payment - 50% deposit",
          },
        ],
        paymentQrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        notes: "VIP customer - priority handling required",
        createdBy: "admin-001",
        priority: "high",
      },
    ]

    bills.forEach((bill) => {
      this.bills.set(bill.id, bill)
      bill.tags.forEach((tag) => this.customTags.add(tag))
    })

    // Add more sample tags
    this.customTags.add("Rush Order")
    this.customTags.add("Cut")
    this.customTags.add("Special Fabric")
    this.customTags.add("Repeat Customer")
    this.customTags.add("Bulk Order")
  }

  // Bill Management
  async createBill(billData: Omit<Bill, "id" | "billNumber" | "createdAt" | "updatedAt">): Promise<Bill> {
    const id = this.generateId()
    const billNumber = `INV-${new Date().getFullYear()}-${String(this.bills.size + 1).padStart(3, "0")}`

    const bill: Bill = {
      ...billData,
      id,
      billNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      remainingBalance: billData.total - billData.paidAmount,
    }

    this.bills.set(id, bill)
    bill.tags.forEach((tag) => this.customTags.add(tag))

    return bill
  }

  async getBill(id: string): Promise<Bill | null> {
    return this.bills.get(id) || null
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const bill = this.bills.get(id)
    if (!bill) return null

    const updatedBill = {
      ...bill,
      ...updates,
      updatedAt: new Date(),
      remainingBalance: (updates.total || bill.total) - (updates.paidAmount || bill.paidAmount),
    }

    this.bills.set(id, updatedBill)
    if (updates.tags) {
      updates.tags.forEach((tag) => this.customTags.add(tag))
    }

    return updatedBill
  }

  async deleteBill(id: string): Promise<boolean> {
    return this.bills.delete(id)
  }

  async getBills(filter?: BillFilter): Promise<Bill[]> {
    let bills = Array.from(this.bills.values())

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        bills = bills.filter((bill) => filter.status!.includes(bill.status))
      }

      if (filter.dateFrom) {
        bills = bills.filter((bill) => bill.createdAt >= filter.dateFrom!)
      }

      if (filter.dateTo) {
        bills = bills.filter((bill) => bill.createdAt <= filter.dateTo!)
      }

      if (filter.tags && filter.tags.length > 0) {
        bills = bills.filter((bill) => filter.tags!.some((tag) => bill.tags.includes(tag)))
      }

      if (filter.customerId) {
        bills = bills.filter((bill) => bill.customerId === filter.customerId)
      }

      if (filter.priority && filter.priority.length > 0) {
        bills = bills.filter((bill) => filter.priority!.includes(bill.priority))
      }

      if (filter.minAmount !== undefined) {
        bills = bills.filter((bill) => bill.total >= filter.minAmount!)
      }

      if (filter.maxAmount !== undefined) {
        bills = bills.filter((bill) => bill.total <= filter.maxAmount!)
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        bills = bills.filter(
          (bill) =>
            bill.billNumber.toLowerCase().includes(searchLower) ||
            bill.customer.name.toLowerCase().includes(searchLower) ||
            bill.customer.nickname?.toLowerCase().includes(searchLower) ||
            bill.items.some(
              (item) =>
                item.name.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower),
            ) ||
            bill.notes?.toLowerCase().includes(searchLower),
        )
      }
    }

    return bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Progress Management
  async updateBillProgress(billId: string, progress: BillProgress): Promise<Bill | null> {
    const bill = this.bills.get(billId)
    if (!bill) return null

    bill.progress.push(progress)
    bill.updatedAt = new Date()

    // Auto-update bill status based on progress
    const latestProgress = bill.progress[bill.progress.length - 1]
    if (latestProgress.status === "completed" && bill.paidAmount >= bill.total) {
      bill.status = "paid"
    }

    return bill
  }

  // Payment Management
  async addPaymentRecord(billId: string, payment: Omit<PaymentRecord, "id">): Promise<Bill | null> {
    const bill = this.bills.get(billId)
    if (!bill) return null

    const paymentRecord: PaymentRecord = {
      ...payment,
      id: this.generateId(),
    }

    bill.paymentRecords.push(paymentRecord)
    bill.paidAmount += payment.amount
    bill.remainingBalance = bill.total - bill.paidAmount

    // Update bill status based on payment
    if (bill.remainingBalance <= 0) {
      bill.status = "paid"
    } else if (bill.paidAmount > 0) {
      bill.status = "partially_paid"
    }

    bill.updatedAt = new Date()
    return bill
  }

  // Customer Management
  async createCustomer(customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const id = this.generateId()
    const customer: Customer = {
      ...customerData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.customers.set(id, customer)
    if (customer.nickname) {
      const mapping: CustomerNameMapping = {
        id: this.generateId(),
        customerId: id,
        nickname: customer.nickname,
        fullName: customer.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.customerNameMapping.set(customer.nickname.toLowerCase(), mapping)
    }

    return customer
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customers.get(id) || null
  }

  async getCustomerByNickname(nickname: string): Promise<Customer | null> {
    const mapping = this.customerNameMapping.get(nickname.toLowerCase())
    return mapping ? this.customers.get(mapping.customerId) || null : null
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customer = this.customers.get(id)
    if (!customer) return null

    const updatedCustomer = {
      ...customer,
      ...updates,
      updatedAt: new Date(),
    }

    this.customers.set(id, updatedCustomer)

    // Update nickname mapping
    if (updates.nickname !== undefined) {
      // Remove old mapping
      if (customer.nickname) {
        this.customerNameMapping.delete(customer.nickname.toLowerCase())
      }
      // Add new mapping
      if (updates.nickname) {
        const mapping: CustomerNameMapping = {
          id: this.generateId(),
          customerId: id,
          nickname: updates.nickname,
          fullName: updatedCustomer.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        this.customerNameMapping.set(updates.nickname.toLowerCase(), mapping)
      }
    }

    return updatedCustomer
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values())
  }

  // Customer Name Mapping Management
  async getCustomerNameMappings(): Promise<CustomerNameMapping[]> {
    return Array.from(this.customerNameMapping.values())
  }

  async createCustomerNameMapping(
    mapping: Omit<CustomerNameMapping, "id" | "createdAt" | "updatedAt">,
  ): Promise<CustomerNameMapping> {
    const newMapping: CustomerNameMapping = {
      ...mapping,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.customerNameMapping.set(mapping.nickname.toLowerCase(), newMapping)
    return newMapping
  }

  async updateCustomerNameMapping(
    nickname: string,
    updates: Partial<CustomerNameMapping>,
  ): Promise<CustomerNameMapping | null> {
    const mapping = this.customerNameMapping.get(nickname.toLowerCase())
    if (!mapping) return null

    const updatedMapping = {
      ...mapping,
      ...updates,
      updatedAt: new Date(),
    }

    // If nickname changed, update the key
    if (updates.nickname && updates.nickname !== mapping.nickname) {
      this.customerNameMapping.delete(nickname.toLowerCase())
      this.customerNameMapping.set(updates.nickname.toLowerCase(), updatedMapping)
    } else {
      this.customerNameMapping.set(nickname.toLowerCase(), updatedMapping)
    }

    return updatedMapping
  }

  async deleteCustomerNameMapping(nickname: string): Promise<boolean> {
    return this.customerNameMapping.delete(nickname.toLowerCase())
  }

  // Tag Management
  async getCustomTags(): Promise<string[]> {
    return Array.from(this.customTags)
  }

  async addCustomTag(tag: string): Promise<void> {
    this.customTags.add(tag)
  }

  async removeCustomTag(tag: string): Promise<void> {
    this.customTags.delete(tag)

    // Remove tag from all bills
    for (const bill of this.bills.values()) {
      bill.tags = bill.tags.filter((t) => t !== tag)
    }
  }

  // Purchase Order Management
  async createPurchaseOrder(poData: Omit<PurchaseOrderReference, "id">): Promise<PurchaseOrderReference> {
    const id = this.generateId()
    const purchaseOrder: PurchaseOrderReference = {
      ...poData,
      id,
    }

    this.purchaseOrders.set(id, purchaseOrder)
    return purchaseOrder
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrderReference | null> {
    return this.purchaseOrders.get(id) || null
  }

  async updatePurchaseOrder(
    id: string,
    updates: Partial<PurchaseOrderReference>,
  ): Promise<PurchaseOrderReference | null> {
    const po = this.purchaseOrders.get(id)
    if (!po) return null

    const updatedPO = { ...po, ...updates }
    this.purchaseOrders.set(id, updatedPO)
    return updatedPO
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    return this.purchaseOrders.delete(id)
  }

  async linkPurchaseOrderToBill(billId: string, purchaseOrderId: string): Promise<Bill | null> {
    const bill = this.bills.get(billId)
    const po = this.purchaseOrders.get(purchaseOrderId)

    if (!bill || !po) return null

    if (!bill.purchaseOrders.find((p) => p.id === purchaseOrderId)) {
      bill.purchaseOrders.push(po)
      bill.updatedAt = new Date()
    }

    return bill
  }

  // Supplier Receipt Management
  async createSupplierReceipt(receiptData: Omit<SupplierReceipt, "id">): Promise<SupplierReceipt> {
    const id = this.generateId()
    const receipt: SupplierReceipt = {
      ...receiptData,
      id,
    }

    this.supplierReceipts.set(id, receipt)
    return receipt
  }

  async getSupplierReceipt(id: string): Promise<SupplierReceipt | null> {
    return this.supplierReceipts.get(id) || null
  }

  async updateSupplierReceipt(id: string, updates: Partial<SupplierReceipt>): Promise<SupplierReceipt | null> {
    const receipt = this.supplierReceipts.get(id)
    if (!receipt) return null

    const updatedReceipt = { ...receipt, ...updates }
    this.supplierReceipts.set(id, updatedReceipt)
    return updatedReceipt
  }

  async deleteSupplierReceipt(id: string): Promise<boolean> {
    return this.supplierReceipts.delete(id)
  }

  async attachReceiptToBill(billId: string, receiptId: string): Promise<Bill | null> {
    const bill = this.bills.get(billId)
    const receipt = this.supplierReceipts.get(receiptId)

    if (!bill || !receipt) return null

    if (!bill.supplierReceipts.find((r) => r.id === receiptId)) {
      bill.supplierReceipts.push(receipt)
      bill.updatedAt = new Date()
    }

    return bill
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<DashboardKPI> {
    const bills = Array.from(this.bills.values())
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const totalBills = bills.length
    const totalRevenue = bills
      .filter((bill) => bill.status === "paid" || bill.status === "partially_paid")
      .reduce((sum, bill) => sum + bill.paidAmount, 0)

    const pendingBills = bills.filter((bill) => bill.status === "sent").length
    const overdueBills = bills.filter((bill) => bill.status === "sent" && bill.dueDate < new Date()).length
    const completedBills = bills.filter((bill) => bill.status === "paid").length
    const partiallyPaidBills = bills.filter((bill) => bill.status === "partially_paid").length

    const paidBills = bills.filter((bill) => bill.status === "paid")
    const averageOrderValue = paidBills.length > 0 ? totalRevenue / paidBills.length : 0

    // Calculate monthly growth
    const thisMonthBills = bills.filter(
      (bill) => bill.createdAt.getMonth() === currentMonth && bill.createdAt.getFullYear() === currentYear,
    )
    const lastMonthBills = bills.filter((bill) => {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return bill.createdAt.getMonth() === lastMonth && bill.createdAt.getFullYear() === lastMonthYear
    })

    const monthlyGrowth =
      lastMonthBills.length > 0 ? ((thisMonthBills.length - lastMonthBills.length) / lastMonthBills.length) * 100 : 0

    // Top customers
    const customerStats = new Map<string, { totalSpent: number; billCount: number }>()
    bills.forEach((bill) => {
      if (bill.paidAmount > 0) {
        const existing = customerStats.get(bill.customerId) || { totalSpent: 0, billCount: 0 }
        customerStats.set(bill.customerId, {
          totalSpent: existing.totalSpent + bill.paidAmount,
          billCount: existing.billCount + 1,
        })
      }
    })

    const topCustomers = Array.from(customerStats.entries())
      .map(([customerId, stats]) => ({
        customerId,
        customerName: this.customers.get(customerId)?.name || "Unknown",
        ...stats,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // Top selling items
    const itemStats = new Map<string, { quantitySold: number; revenue: number }>()
    bills.forEach((bill) => {
      if (bill.paidAmount > 0) {
        bill.items.forEach((item) => {
          const existing = itemStats.get(item.name) || { quantitySold: 0, revenue: 0 }
          const itemRevenue = (item.totalPrice / bill.total) * bill.paidAmount
          itemStats.set(item.name, {
            quantitySold: existing.quantitySold + item.quantity,
            revenue: existing.revenue + itemRevenue,
          })
        })
      }
    })

    const topSellingItems = Array.from(itemStats.entries())
      .map(([itemName, stats]) => ({
        itemName,
        ...stats,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Revenue by month (last 6 months)
    const revenueByMonth = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleString("default", { month: "short" })

      const monthBills = bills.filter((bill) => {
        const billDate = new Date(bill.createdAt)
        return (
          billDate.getMonth() === date.getMonth() &&
          billDate.getFullYear() === date.getFullYear() &&
          bill.paidAmount > 0
        )
      })

      revenueByMonth.push({
        month,
        revenue: monthBills.reduce((sum, bill) => sum + bill.paidAmount, 0),
        billCount: monthBills.length,
      })
    }

    // Status distribution
    const statusCounts = new Map<string, number>()
    bills.forEach((bill) => {
      statusCounts.set(bill.status, (statusCounts.get(bill.status) || 0) + 1)
    })

    const statusDistribution = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalBills) * 100,
    }))

    return {
      totalBills,
      totalRevenue,
      pendingBills,
      overdueBills,
      completedBills,
      partiallyPaidBills,
      averageOrderValue,
      monthlyGrowth,
      topCustomers,
      topSellingItems,
      revenueByMonth,
      statusDistribution,
    }
  }

  // Notification for payment
  async notifyPayment(billId: string, customerMessage?: string): Promise<boolean> {
    const bill = this.bills.get(billId)
    if (!bill) return false

    // In a real application, this would send notifications to admin
    console.log(`Payment notification received for bill ${bill.billNumber}`)
    if (customerMessage) {
      console.log(`Customer message: ${customerMessage}`)
    }

    // Add a note to the bill
    bill.notes = (bill.notes || "") + `\n[${new Date().toISOString()}] Customer notified payment completion`
    bill.updatedAt = new Date()

    return true
  }
}

export const billDatabase = new EnhancedBillDatabase()
