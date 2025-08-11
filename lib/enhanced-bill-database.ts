export interface Bill {
  id: string
  billNumber: string
  customerEmail: string
  customerName: string
  amount: number
  status: "pending" | "paid" | "overdue"
  createdAt: string
  dueDate: string
  paidAmount?: number
  paymentMethod?: string
  paidAt?: string
  items: Array<{
    description: string
    quantity: number
    price: number
  }>
}

// Mock database for development
class MockBillDatabase {
  private bills = new Map<string, Bill>()

  constructor() {
    // Initialize with some mock data
    const mockBill: Bill = {
      id: "1",
      billNumber: "BILL-001",
      customerEmail: "customer@example.com",
      customerName: "John Doe",
      amount: 299.99,
      status: "pending",
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          description: "Custom Sofa Cover",
          quantity: 1,
          price: 299.99,
        },
      ],
    }
    this.bills.set("1", mockBill)
  }

  async getBill(id: string): Promise<Bill | null> {
    return this.bills.get(id) || null
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const existingBill = this.bills.get(id)
    if (!existingBill) return null

    const updatedBill = { ...existingBill, ...updates }
    this.bills.set(id, updatedBill)
    return updatedBill
  }

  async createBill(bill: Omit<Bill, "id">): Promise<Bill> {
    const id = Math.random().toString(36).substr(2, 9)
    const newBill = { ...bill, id }
    this.bills.set(id, newBill)
    return newBill
  }

  async getAllBills(): Promise<Bill[]> {
    return Array.from(this.bills.values())
  }
}

export const enhancedBillDatabase = new MockBillDatabase()
