// Comprehensive API type definitions
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
    requestId: string
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined
}

// Bill API Types
export interface Bill {
  id: string
  billNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: BillItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: string
  createdAt: string
  updatedAt: string
  notes?: string
  tags: string[]
  progress: BillProgress[]
  qrCode?: string
}

export interface BillItem {
  id: string
  productId: string
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  total: number
  customizations?: Record<string, any>
}

export interface BillProgress {
  id: string
  stage: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  timestamp: string
  notes?: string
  estimatedCompletion?: string
}

export interface CreateBillRequest {
  customerId: string
  items: Omit<BillItem, "id">[]
  dueDate: string
  notes?: string
  tags?: string[]
  discount?: number
}

export interface UpdateBillRequest {
  items?: Omit<BillItem, "id">[]
  status?: Bill["status"]
  dueDate?: string
  notes?: string
  tags?: string[]
  discount?: number
}

// Customer API Types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  preferences?: {
    language: string
    currency: string
    notifications: {
      email: boolean
      sms: boolean
    }
  }
  createdAt: string
  updatedAt: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
}

export interface CreateCustomerRequest {
  name: string
  email: string
  phone: string
  address?: Customer["address"]
  preferences?: Customer["preferences"]
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  address?: Customer["address"]
  preferences?: Customer["preferences"]
}

// Product API Types
export interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  images: string[]
  specifications: Record<string, any>
  customizable: boolean
  customizationOptions?: CustomizationOption[]
  inStock: boolean
  stockQuantity: number
  createdAt: string
  updatedAt: string
}

export interface CustomizationOption {
  id: string
  name: string
  type: "select" | "text" | "number" | "color" | "file"
  required: boolean
  options?: string[]
  priceModifier?: number
}

// Analytics API Types
export interface AnalyticsData {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  orders: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
