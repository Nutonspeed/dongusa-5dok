import type { Bill, Customer, BillFilter, DashboardKPI, BillProgress } from "./types/bill"
import { generateId } from "./utils"

class EnhancedBillDatabase {
  private bills: Map<string, Bill> = new Map()
  private customers: Map<string, Customer> = new Map()
  private customerNameMapping: Map<string, string> = new Map()
  private customTags: Set<string> = new Set()

  constructor() {
    this.initializeSampleData()
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
    ]

    customers.forEach((customer) => {
      this.customers.set(customer.id, customer)
      if (customer.nickname) {
        this.customerNameMapping.set(customer.nickname.toLowerCase(), customer.id)
      }
    })

    // Sample bills
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
            description: "Premium fabric sofa cover with custom measurements",
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
        currency: "THB",
        status: "sent",
        dueDate: new Date("2024-02-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
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
          },
          {
            status: "tailoring",
            timestamp: new Date("2024-01-18T09:00:00Z"),
            notes: "Started tailoring process",
            updatedBy: "admin-001",
          },
        ],
        tags: ["Premium", "Custom"],
        purchaseOrders: [
          {
            id: "po-001",
            platform: "lazada",
            orderId: "LZ-2024-001",
            url: "https://lazada.com/order/LZ-2024-001",
            amount: 1500,
            currency: "THB",
            attachments: [],
          },
        ],
        supplierReceipts: [
          {
            id: "receipt-001",
            supplierId: "sup-001",
            supplierName: "Premium Fabrics Co.",
            receiptNumber: "PF-2024-001",
            amount: 1500,
            currency: "THB",
            date: new Date("2024-01-16"),
            attachments: [],
          },
        ],
        paymentQrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        notes: "Customer prefers delivery on weekends",
        createdBy: "admin-001",
      },
    ]

    bills.forEach((bill) => {
      this.bills.set(bill.id, bill)
      bill.tags.forEach((tag) => this.customTags.add(tag))
    })

    // Add more sample tags
    this.customTags.add("Urgent")
    this.customTags.add("Cut")
    this.customTags.add("Rush Order")
    this.customTags.add("VIP Customer")
  }

  // Bill Management
  async createBill(billData: Omit<Bill, "id" | "billNumber" | "createdAt" | "updatedAt">): Promise<Bill> {
    const id = generateId()
    const billNumber = `INV-${new Date().getFullYear()}-${String(this.bills.size + 1).padStart(3, "0")}`

    const bill: Bill = {
      ...billData,
      id,
      billNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
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
            ),
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

    return bill
  }

  // Customer Management
  async createCustomer(customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const id = generateId()
    const customer: Customer = {
      ...customerData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.customers.set(id, customer)
    if (customer.nickname) {
      this.customerNameMapping.set(customer.nickname.toLowerCase(), id)
    }

    return customer
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customers.get(id) || null
  }

  async getCustomerByNickname(nickname: string): Promise<Customer | null> {
    const customerId = this.customerNameMapping.get(nickname.toLowerCase())
    return customerId ? this.customers.get(customerId) || null : null
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
        this.customerNameMapping.set(updates.nickname.toLowerCase(), id)
      }
    }

    return updatedCustomer
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values())
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
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<DashboardKPI> {
    const bills = Array.from(this.bills.values())
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const totalBills = bills.length
    const totalRevenue = bills.filter((bill) => bill.status === "paid").reduce((sum, bill) => sum + bill.total, 0)

    const pendingBills = bills.filter((bill) => bill.status === "sent").length
    const overdueBills = bills.filter((bill) => bill.status === "sent" && bill.dueDate < new Date()).length
    const completedBills = bills.filter((bill) => bill.status === "paid").length

    const averageOrderValue = totalRevenue / (completedBills || 1)

    // Calculate monthly growth (simplified)
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
      if (bill.status === "paid") {
        const existing = customerStats.get(bill.customerId) || { totalSpent: 0, billCount: 0 }
        customerStats.set(bill.customerId, {
          totalSpent: existing.totalSpent + bill.total,
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

    return {
      totalBills,
      totalRevenue,
      pendingBills,
      overdueBills,
      completedBills,
      averageOrderValue,
      monthlyGrowth,
      topCustomers,
    }
  }
}

export const billDatabase = new EnhancedBillDatabase()
