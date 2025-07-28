// Zustand-based state management with TypeScript
import { create } from "zustand"
import { devtools, persist, subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type { Bill, Customer, Product, AnalyticsData } from "@/lib/api/types"

// App State Interface
interface AppState {
  // UI State
  ui: {
    theme: "light" | "dark" | "system"
    sidebarOpen: boolean
    loading: boolean
    notifications: Notification[]
  }

  // User State
  user: {
    isAuthenticated: boolean
    profile: UserProfile | null
    preferences: UserPreferences
  }

  // Bills State
  bills: {
    items: Bill[]
    currentBill: Bill | null
    loading: boolean
    error: string | null
    filters: BillFilters
    pagination: PaginationState
  }

  // Customers State
  customers: {
    items: Customer[]
    currentCustomer: Customer | null
    loading: boolean
    error: string | null
    filters: CustomerFilters
    pagination: PaginationState
  }

  // Products State
  products: {
    items: Product[]
    currentProduct: Product | null
    loading: boolean
    error: string | null
    filters: ProductFilters
    pagination: PaginationState
  }

  // Analytics State
  analytics: {
    data: AnalyticsData | null
    loading: boolean
    error: string | null
    dateRange: string
  }
}

// Supporting Types
interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface UserPreferences {
  language: string
  currency: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

interface BillFilters {
  status: string[]
  dateRange: {
    start: string | null
    end: string | null
  }
  customerIds: string[]
  tags: string[]
  search: string
}

interface CustomerFilters {
  search: string
  tags: string[]
  dateRange: {
    start: string | null
    end: string | null
  }
}

interface ProductFilters {
  category: string[]
  priceRange: {
    min: number | null
    max: number | null
  }
  inStock: boolean | null
  search: string
}

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

// App Actions Interface
interface AppActions {
  // UI Actions
  setTheme: (theme: AppState["ui"]["theme"]) => void
  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void

  // User Actions
  setUser: (profile: UserProfile) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  logout: () => void

  // Bills Actions
  setBills: (bills: Bill[]) => void
  addBill: (bill: Bill) => void
  updateBill: (id: string, updates: Partial<Bill>) => void
  deleteBill: (id: string) => void
  setCurrentBill: (bill: Bill | null) => void
  setBillsLoading: (loading: boolean) => void
  setBillsError: (error: string | null) => void
  setBillFilters: (filters: Partial<BillFilters>) => void
  setBillsPagination: (pagination: Partial<PaginationState>) => void

  // Customers Actions
  setCustomers: (customers: Customer[]) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  setCurrentCustomer: (customer: Customer | null) => void
  setCustomersLoading: (loading: boolean) => void
  setCustomersError: (error: string | null) => void
  setCustomerFilters: (filters: Partial<CustomerFilters>) => void
  setCustomersPagination: (pagination: Partial<PaginationState>) => void

  // Products Actions
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  setCurrentProduct: (product: Product | null) => void
  setProductsLoading: (loading: boolean) => void
  setProductsError: (error: string | null) => void
  setProductFilters: (filters: Partial<ProductFilters>) => void
  setProductsPagination: (pagination: Partial<PaginationState>) => void

  // Analytics Actions
  setAnalytics: (data: AnalyticsData) => void
  setAnalyticsLoading: (loading: boolean) => void
  setAnalyticsError: (error: string | null) => void
  setAnalyticsDateRange: (dateRange: string) => void

  // Utility Actions
  reset: () => void
  hydrate: (state: Partial<AppState>) => void
}

// Initial State
const initialState: AppState = {
  ui: {
    theme: "system",
    sidebarOpen: true,
    loading: false,
    notifications: [],
  },
  user: {
    isAuthenticated: false,
    profile: null,
    preferences: {
      language: "en",
      currency: "USD",
      timezone: "UTC",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
  },
  bills: {
    items: [],
    currentBill: null,
    loading: false,
    error: null,
    filters: {
      status: [],
      dateRange: { start: null, end: null },
      customerIds: [],
      tags: [],
      search: "",
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  customers: {
    items: [],
    currentCustomer: null,
    loading: false,
    error: null,
    filters: {
      search: "",
      tags: [],
      dateRange: { start: null, end: null },
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  products: {
    items: [],
    currentProduct: null,
    loading: false,
    error: null,
    filters: {
      category: [],
      priceRange: { min: null, max: null },
      inStock: null,
      search: "",
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  analytics: {
    data: null,
    loading: false,
    error: null,
    dateRange: "30d",
  },
}

// Create Store
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          // UI Actions
          setTheme: (theme) =>
            set((state) => {
              state.ui.theme = theme
            }),

          toggleSidebar: () =>
            set((state) => {
              state.ui.sidebarOpen = !state.ui.sidebarOpen
            }),

          setLoading: (loading) =>
            set((state) => {
              state.ui.loading = loading
            }),

          addNotification: (notification) =>
            set((state) => {
              const newNotification: Notification = {
                ...notification,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                read: false,
              }
              state.ui.notifications.unshift(newNotification)

              // Auto-remove after 5 seconds for success notifications
              if (notification.type === "success") {
                setTimeout(() => {
                  get().removeNotification(newNotification.id)
                }, 5000)
              }
            }),

          removeNotification: (id) =>
            set((state) => {
              state.ui.notifications = state.ui.notifications.filter((n) => n.id !== id)
            }),

          markNotificationRead: (id) =>
            set((state) => {
              const notification = state.ui.notifications.find((n) => n.id === id)
              if (notification) {
                notification.read = true
              }
            }),

          clearNotifications: () =>
            set((state) => {
              state.ui.notifications = []
            }),

          // User Actions
          setUser: (profile) =>
            set((state) => {
              state.user.isAuthenticated = true
              state.user.profile = profile
            }),

          updateUserPreferences: (preferences) =>
            set((state) => {
              state.user.preferences = { ...state.user.preferences, ...preferences }
            }),

          logout: () =>
            set((state) => {
              state.user.isAuthenticated = false
              state.user.profile = null
            }),

          // Bills Actions
          setBills: (bills) =>
            set((state) => {
              state.bills.items = bills
            }),

          addBill: (bill) =>
            set((state) => {
              state.bills.items.unshift(bill)
            }),

          updateBill: (id, updates) =>
            set((state) => {
              const index = state.bills.items.findIndex((b) => b.id === id)
              if (index !== -1) {
                state.bills.items[index] = { ...state.bills.items[index], ...updates }
              }
              if (state.bills.currentBill?.id === id) {
                state.bills.currentBill = { ...state.bills.currentBill, ...updates }
              }
            }),

          deleteBill: (id) =>
            set((state) => {
              state.bills.items = state.bills.items.filter((b) => b.id !== id)
              if (state.bills.currentBill?.id === id) {
                state.bills.currentBill = null
              }
            }),

          setCurrentBill: (bill) =>
            set((state) => {
              state.bills.currentBill = bill
            }),

          setBillsLoading: (loading) =>
            set((state) => {
              state.bills.loading = loading
            }),

          setBillsError: (error) =>
            set((state) => {
              state.bills.error = error
            }),

          setBillFilters: (filters) =>
            set((state) => {
              state.bills.filters = { ...state.bills.filters, ...filters }
            }),

          setBillsPagination: (pagination) =>
            set((state) => {
              state.bills.pagination = { ...state.bills.pagination, ...pagination }
            }),

          // Customers Actions
          setCustomers: (customers) =>
            set((state) => {
              state.customers.items = customers
            }),

          addCustomer: (customer) =>
            set((state) => {
              state.customers.items.unshift(customer)
            }),

          updateCustomer: (id, updates) =>
            set((state) => {
              const index = state.customers.items.findIndex((c) => c.id === id)
              if (index !== -1) {
                state.customers.items[index] = { ...state.customers.items[index], ...updates }
              }
              if (state.customers.currentCustomer?.id === id) {
                state.customers.currentCustomer = { ...state.customers.currentCustomer, ...updates }
              }
            }),

          deleteCustomer: (id) =>
            set((state) => {
              state.customers.items = state.customers.items.filter((c) => c.id !== id)
              if (state.customers.currentCustomer?.id === id) {
                state.customers.currentCustomer = null
              }
            }),

          setCurrentCustomer: (customer) =>
            set((state) => {
              state.customers.currentCustomer = customer
            }),

          setCustomersLoading: (loading) =>
            set((state) => {
              state.customers.loading = loading
            }),

          setCustomersError: (error) =>
            set((state) => {
              state.customers.error = error
            }),

          setCustomerFilters: (filters) =>
            set((state) => {
              state.customers.filters = { ...state.customers.filters, ...filters }
            }),

          setCustomersPagination: (pagination) =>
            set((state) => {
              state.customers.pagination = { ...state.customers.pagination, ...pagination }
            }),

          // Products Actions
          setProducts: (products) =>
            set((state) => {
              state.products.items = products
            }),

          addProduct: (product) =>
            set((state) => {
              state.products.items.unshift(product)
            }),

          updateProduct: (id, updates) =>
            set((state) => {
              const index = state.products.items.findIndex((p) => p.id === id)
              if (index !== -1) {
                state.products.items[index] = { ...state.products.items[index], ...updates }
              }
              if (state.products.currentProduct?.id === id) {
                state.products.currentProduct = { ...state.products.currentProduct, ...updates }
              }
            }),

          deleteProduct: (id) =>
            set((state) => {
              state.products.items = state.products.items.filter((p) => p.id !== id)
              if (state.products.currentProduct?.id === id) {
                state.products.currentProduct = null
              }
            }),

          setCurrentProduct: (product) =>
            set((state) => {
              state.products.currentProduct = product
            }),

          setProductsLoading: (loading) =>
            set((state) => {
              state.products.loading = loading
            }),

          setProductsError: (error) =>
            set((state) => {
              state.products.error = error
            }),

          setProductFilters: (filters) =>
            set((state) => {
              state.products.filters = { ...state.products.filters, ...filters }
            }),

          setProductsPagination: (pagination) =>
            set((state) => {
              state.products.pagination = { ...state.products.pagination, ...pagination }
            }),

          // Analytics Actions
          setAnalytics: (data) =>
            set((state) => {
              state.analytics.data = data
            }),

          setAnalyticsLoading: (loading) =>
            set((state) => {
              state.analytics.loading = loading
            }),

          setAnalyticsError: (error) =>
            set((state) => {
              state.analytics.error = error
            }),

          setAnalyticsDateRange: (dateRange) =>
            set((state) => {
              state.analytics.dateRange = dateRange
            }),

          // Utility Actions
          reset: () => set(() => initialState),

          hydrate: (state) =>
            set((currentState) => {
              Object.assign(currentState, state)
            }),
        })),
      ),
      {
        name: "sofa-cover-app-store",
        partialize: (state) => ({
          ui: {
            theme: state.ui.theme,
            sidebarOpen: state.ui.sidebarOpen,
          },
          user: {
            preferences: state.user.preferences,
          },
          bills: {
            filters: state.bills.filters,
          },
          customers: {
            filters: state.customers.filters,
          },
          products: {
            filters: state.products.filters,
          },
          analytics: {
            dateRange: state.analytics.dateRange,
          },
        }),
      },
    ),
    {
      name: "sofa-cover-app-store",
    },
  ),
)

// Selector Hooks for Better Performance
export const useUIState = () => useAppStore((state) => state.ui)
export const useUserState = () => useAppStore((state) => state.user)
export const useBillsState = () => useAppStore((state) => state.bills)
export const useCustomersState = () => useAppStore((state) => state.customers)
export const useProductsState = () => useAppStore((state) => state.products)
export const useAnalyticsState = () => useAppStore((state) => state.analytics)

// Action Hooks
export const useUIActions = () =>
  useAppStore((state) => ({
    setTheme: state.setTheme,
    toggleSidebar: state.toggleSidebar,
    setLoading: state.setLoading,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    markNotificationRead: state.markNotificationRead,
    clearNotifications: state.clearNotifications,
  }))

export const useUserActions = () =>
  useAppStore((state) => ({
    setUser: state.setUser,
    updateUserPreferences: state.updateUserPreferences,
    logout: state.logout,
  }))

export const useBillsActions = () =>
  useAppStore((state) => ({
    setBills: state.setBills,
    addBill: state.addBill,
    updateBill: state.updateBill,
    deleteBill: state.deleteBill,
    setCurrentBill: state.setCurrentBill,
    setBillsLoading: state.setBillsLoading,
    setBillsError: state.setBillsError,
    setBillFilters: state.setBillFilters,
    setBillsPagination: state.setBillsPagination,
  }))

export const useCustomersActions = () =>
  useAppStore((state) => ({
    setCustomers: state.setCustomers,
    addCustomer: state.addCustomer,
    updateCustomer: state.updateCustomer,
    deleteCustomer: state.deleteCustomer,
    setCurrentCustomer: state.setCurrentCustomer,
    setCustomersLoading: state.setCustomersLoading,
    setCustomersError: state.setCustomersError,
    setCustomerFilters: state.setCustomerFilters,
    setCustomersPagination: state.setCustomersPagination,
  }))

export const useProductsActions = () =>
  useAppStore((state) => ({
    setProducts: state.setProducts,
    addProduct: state.addProduct,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
    setCurrentProduct: state.setCurrentProduct,
    setProductsLoading: state.setProductsLoading,
    setProductsError: state.setProductsError,
    setProductFilters: state.setProductFilters,
    setProductsPagination: state.setProductsPagination,
  }))

export const useAnalyticsActions = () =>
  useAppStore((state) => ({
    setAnalytics: state.setAnalytics,
    setAnalyticsLoading: state.setAnalyticsLoading,
    setAnalyticsError: state.setAnalyticsError,
    setAnalyticsDateRange: state.setAnalyticsDateRange,
  }))

// Computed Selectors
export const useFilteredBills = () =>
  useAppStore((state) => {
    const { items, filters } = state.bills

    return items.filter((bill) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(bill.status)) {
        return false
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const billDate = new Date(bill.createdAt)
        if (filters.dateRange.start && billDate < new Date(filters.dateRange.start)) {
          return false
        }
        if (filters.dateRange.end && billDate > new Date(filters.dateRange.end)) {
          return false
        }
      }

      // Customer filter
      if (filters.customerIds.length > 0 && !filters.customerIds.includes(bill.customerId)) {
        return false
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => bill.tags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          bill.billNumber.toLowerCase().includes(searchLower) ||
          bill.customerName.toLowerCase().includes(searchLower) ||
          bill.customerEmail.toLowerCase().includes(searchLower) ||
          bill.notes?.toLowerCase().includes(searchLower)

        if (!matchesSearch) {
          return false
        }
      }

      return true
    })
  })

export const useUnreadNotifications = () => useAppStore((state) => state.ui.notifications.filter((n) => !n.read))

export const useBillsStats = () =>
  useAppStore((state) => {
    const bills = state.bills.items

    return {
      total: bills.length,
      paid: bills.filter((b) => b.status === "paid").length,
      pending: bills.filter((b) => b.status === "sent").length,
      overdue: bills.filter((b) => b.status === "overdue").length,
      totalRevenue: bills.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.total, 0),
    }
  })
