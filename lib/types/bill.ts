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
  supplierInfo?: {
    name: string
    contact: string
    address: string
  }
  orderDate: Date
  expectedDelivery?: Date
  notes?: string
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
  category: string
  notes?: string
}

export interface BillProgress {
  status: "pending" | "confirmed" | "tailoring" | "packing" | "shipped" | "delivered" | "completed"
  timestamp: Date
  notes?: string
  updatedBy: string
  estimatedCompletion?: Date
  actualCompletion?: Date
}

export interface PaymentRecord {
  id: string
  amount: number
  currency: string
  method: "bank_transfer" | "credit_card" | "cash" | "qr_code"
  transactionId?: string
  date: Date
  status: "pending" | "confirmed" | "failed"
  notes?: string
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
  paidAmount: number
  remainingBalance: number
  currency: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partially_paid"
  dueDate: Date
  createdAt: Date
  updatedAt: Date
  progress: BillProgress[]
  tags: string[]
  purchaseOrders: PurchaseOrderReference[]
  supplierReceipts: SupplierReceipt[]
  paymentRecords: PaymentRecord[]
  paymentQrCode?: string
  notes?: string
  createdBy: string
  priority: "low" | "medium" | "high" | "urgent"
}

export interface BillFilter {
  status?: string[]
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
  customerId?: string
  search?: string
  priority?: string[]
  minAmount?: number
  maxAmount?: number
}

export interface DashboardKPI {
  totalBills: number
  totalRevenue: number
  pendingBills: number
  overdueBills: number
  completedBills: number
  partiallyPaidBills: number
  averageOrderValue: number
  monthlyGrowth: number
  topCustomers: Array<{
    customerId: string
    customerName: string
    totalSpent: number
    billCount: number
  }>
  topSellingItems: Array<{
    itemName: string
    quantitySold: number
    revenue: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    billCount: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
}

export interface CustomerNameMapping {
  id: string
  customerId: string
  nickname: string
  fullName: string
  createdAt: Date
  updatedAt: Date
}
