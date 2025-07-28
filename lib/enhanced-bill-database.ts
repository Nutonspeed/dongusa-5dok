import type { Bill, Customer } from "@/lib/types/bill"

class EnhancedBillDatabase {
  private bills: Map<string, Bill> = new Map()
  private customers: Map<string, Customer> = new Map()
  private billCounter = 1000

  constructor() {
    this.initializeSampleData()
  }

  private initializeSampleData() {
    // Sample customers
    const sampleCustomers: Customer[] = [
      {
        id: "cust-001",
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0123",
        address: "123 Main St, Anytown, ST 12345",
        createdAt: new Date().toISOString(),
      },
      {
        id: "cust-002",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1-555-0456",
        address: "456 Oak Ave, Somewhere, ST 67890",
        createdAt: new Date().toISOString(),
      },
    ]

    sampleCustomers.forEach((customer) => {
      this.customers.set(customer.id, customer)
    })

    // Sample bills
    const sampleBills: Bill[] = [
      {
        id: "bill-001",
        billNumber: "B-1001",
        customerId: "cust-001",
        customerName: "John Smith",
        customerEmail: "john.smith@email.com",
        items: [
          {
            id: "item-001",
            description: "Custom Sofa Cover - 3 Seater",
            quantity: 1,
            unitPrice: 299.99,
            total: 299.99,
          },
          {
            id: "item-002",
            description: "Fabric Protection Spray",
            quantity: 1,
            unitPrice: 24.99,
            total: 24.99,
          },
        ],
        subtotal: 324.98,
        tax: 26.0,
        total: 350.98,
        status: "pending",
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "bill-002",
        billNumber: "B-1002",
        customerId: "cust-002",
        customerName: "Sarah Johnson",
        customerEmail: "sarah.johnson@email.com",
        items: [
          {
            id: "item-003",
            description: "Custom Loveseat Cover",
            quantity: 2,
            unitPrice: 199.99,
            total: 399.98,
          },
        ],
        subtotal: 399.98,
        tax: 32.0,
        total: 431.98,
        status: "paid",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date().toISOString(),
        paidAmount: 431.98,
        paymentMethod: "credit_card",
      },
    ]

    sampleBills.forEach((bill) => {
      this.bills.set(bill.id, bill)
    })
  }

  async getBill(id: string): Promise<Bill | null> {
    return this.bills.get(id) || null
  }

  async getBills(): Promise<Bill[]> {
    return Array.from(this.bills.values())
  }

  async createBill(billData: Omit<Bill, "id" | "billNumber" | "createdAt">): Promise<Bill> {
    const id = `bill-${Date.now()}`
    const billNumber = `B-${this.billCounter++}`

    const bill: Bill = {
      ...billData,
      id,
      billNumber,
      createdAt: new Date().toISOString(),
    }

    this.bills.set(id, bill)
    return bill
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const existingBill = this.bills.get(id)
    if (!existingBill) return null

    const updatedBill = { ...existingBill, ...updates }
    this.bills.set(id, updatedBill)
    return updatedBill
  }

  async deleteBill(id: string): Promise<boolean> {
    return this.bills.delete(id)
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customers.get(id) || null
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values())
  }

  async createCustomer(customerData: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
    const id = `cust-${Date.now()}`

    const customer: Customer = {
      ...customerData,
      id,
      createdAt: new Date().toISOString(),
    }

    this.customers.set(id, customer)
    return customer
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const existingCustomer = this.customers.get(id)
    if (!existingCustomer) return null

    const updatedCustomer = { ...existingCustomer, ...updates }
    this.customers.set(id, updatedCustomer)
    return updatedCustomer
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id)
  }

  async getBillsByCustomer(customerId: string): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter((bill) => bill.customerId === customerId)
  }

  async getBillsByStatus(status: Bill["status"]): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter((bill) => bill.status === status)
  }
}

export const enhancedBillDatabase = new EnhancedBillDatabase()
