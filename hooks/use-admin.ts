"use client"

import { useState, useEffect } from "react"
import {
  adminService,
  type AdminStats,
  type AdminOrder,
  type AdminCustomer,
  type AdminProduct,
} from "@/lib/admin-service"
import { logger } from "@/lib/logger"

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await adminService.getDashboardStats()
        setStats(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching admin stats:", err)
        setError("Failed to fetch dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const refreshStats = async () => {
    const data = await adminService.getDashboardStats()
    setStats(data)
  }

  return { stats, loading, error, refreshStats }
}

export function useAdminOrders(filters?: {
  status?: string
  channel?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await adminService.getOrders(filters)
        setOrders(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching orders:", err)
        setError("Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [JSON.stringify(filters)])

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    const success = await adminService.updateOrderStatus(orderId, status, notes)
    if (success) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status, notes, updated_at: new Date().toISOString() } : order,
        ),
      )
    }
    return success
  }

  const bulkUpdateStatus = async (orderIds: string[], status: string) => {
    const success = await adminService.bulkUpdateOrderStatus(orderIds, status)
    if (success) {
      setOrders((prev) =>
        prev.map((order) =>
          orderIds.includes(order.id) ? { ...order, status, updated_at: new Date().toISOString() } : order,
        ),
      )
    }
    return success
  }

  return { orders, loading, error, updateOrderStatus, bulkUpdateStatus }
}

export function useAdminCustomers(filters?: {
  segment?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const data = await adminService.getCustomers(filters)
        setCustomers(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching customers:", err)
        setError("Failed to fetch customers")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [JSON.stringify(filters)])

  return { customers, loading, error }
}

export function useAdminProducts(filters?: {
  category?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await adminService.getProducts(filters)
        setProducts(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching products:", err)
        setError("Failed to fetch products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [JSON.stringify(filters)])

  const updateStock = async (productId: string, quantity: number) => {
    const success = await adminService.updateProductStock(productId, quantity)
    if (success) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, stock_quantity: quantity, updated_at: new Date().toISOString() }
            : product,
        ),
      )
    }
    return success
  }

  return { products, loading, error, updateStock }
}

export function useAdminAnalytics(dateRange: { from: string; to: string }) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await adminService.getAnalytics(dateRange)
        setAnalytics(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching analytics:", err)
        setError("Failed to fetch analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  return { analytics, loading, error }
}

export function useSystemAlerts() {
  const [alerts, setAlerts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        const data = await adminService.getSystemAlerts()
        setAlerts(data)
      } catch (err) {
        logger.error("Error fetching system alerts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()

    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { alerts, loading }
}
