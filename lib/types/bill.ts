export interface BillItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Bill {
  id: string
  billNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: BillItem[]
  subtotal: number
  tax: number
  total: number
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
  createdAt: string
  dueDate: string
  paidAt?: string
  paidAmount?: number
  paymentMethod?: string
  notes?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
  notes?: string
}

export interface BillSummary {
  totalBills: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
}
