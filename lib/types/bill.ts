export interface Customer {
  id: string
  name: string
  nickname?: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface BillItem {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: string
  sku?: string
}

export interface PurchaseOrderReference {
  id: string
  platform: "lazada" | "shopee" | "1688" | "other"
  orderId: string
  url?: string
  amount: number
  currency: string
  attachments: string[]
}

export interface SupplierReceipt {
  id: string
  supplierId: string
  supplierName: string
  receiptNumber: string
  amount: number
  currency: string
  date: Date
  attachments: string[]
}

export interface BillProgress {
  status: "pending" | "confirmed" | "tailoring" | "packing" | "shipped" | "delivered" | "completed"
  timestamp: Date
  notes?: string
  updatedBy: string
}

export interface Bill {
  id: string
  billNumber: string
  customerId: string
  customer: Customer
  items: BillItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  currency: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: Date
  createdAt: Date
  updatedAt: Date
  progress: BillProgress[]
  tags: string[]
  purchaseOrders: PurchaseOrderReference[]
  supplierReceipts: SupplierReceipt[]
  paymentQrCode?: string
  notes?: string
  createdBy: string
}

export interface BillFilter {
  status?: string[]
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
  customerId?: string
  search?: string
}

export interface DashboardKPI {
  totalBills: number
  totalRevenue: number
  pendingBills: number
  overdueBills: number
  completedBills: number
  averageOrderValue: number
  monthlyGrowth: number
  topCustomers: Array<{
    customerId: string
    customerName: string
    totalSpent: number
    billCount: number
  }>
}
