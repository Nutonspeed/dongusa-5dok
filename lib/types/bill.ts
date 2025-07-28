// Enhanced types for the bill management system

export interface Customer {
  id: string
  name: string
  nickname?: string
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CustomerNameMapping {
  id: string
  customerId: string
  nickname: string
  fullName: string
  createdAt: Date
  updatedAt: Date
}

export interface BillItem {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  total: number
  category?: string
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
    contact?: string
    address?: string
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
  category: string
  notes?: string
  attachments: string[]
}

export interface ProgressStage {
  stage: "Order Received" | "Tailoring" | "Packing" | "Shipping" | "Delivered"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  startedAt?: Date
  completedAt?: Date
  estimatedCompletion?: Date
  notes?: string
}

export interface Bill {
  id: string
  billNumber: string
  customer: Customer
  items: BillItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paidAmount: number
  remainingBalance: number
  status: "draft" | "sent" | "paid" | "partially_paid" | "overdue" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  tags: string[]
  notes?: string
  dueDate: Date
  createdAt: Date
  updatedAt: Date
  purchaseOrders: PurchaseOrderReference[]
  supplierReceipts: SupplierReceipt[]
  progressStages: ProgressStage[]
}

export interface BillFilter {
  search?: string
  status?: string[]
  priority?: string[]
  customerId?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}

export interface DashboardKPI {
  totalRevenue: number
  totalBills: number
  pendingBills: number
  overdueBills: number
  averageOrderValue: number
  monthlyGrowth: number
  completedBills: number
  partiallyPaidBills: number
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
  topSellingItems: Array<{
    itemName: string
    quantity: number
    revenue: number
  }>
  topCustomers: Array<{
    customerId: string
    customerName: string
    totalSpent: number
    billCount: number
  }>
}

// Payment related types
export interface PaymentRecord {
  id: string
  billId: string
  amount: number
  method: "cash" | "bank_transfer" | "credit_card" | "digital_wallet"
  reference?: string
  date: Date
  notes?: string
}

// Notification types
export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  overdueReminders: boolean
  paymentConfirmations: boolean
  statusUpdates: boolean
}

// Export types
export interface ExportOptions {
  format: "pdf" | "excel" | "csv"
  dateRange?: {
    from: Date
    to: Date
  }
  includeItems: boolean
  includeCustomerDetails: boolean
  includePurchaseOrders: boolean
  includeReceipts: boolean
}
