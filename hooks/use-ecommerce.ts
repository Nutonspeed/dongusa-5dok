"use client"

import { useState, useEffect } from "react"
import { ecommerceService, type Product, type CartItem, type Order } from "@/lib/e-commerce-service"
import { useAuth } from "@/app/contexts/AuthContext"
import { logger } from "@/lib/logger"

export function useProducts(filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, count } = await ecommerceService.getProducts(filters)
        setProducts(data)
        setTotalCount(count)
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

  return { products, loading, error, totalCount }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await ecommerceService.getProductById(id)
        setProduct(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching product:", err)
        setError("Failed to fetch product")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  return { product, loading, error }
}

export function useCart() {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setItems([])
        setLoading(false)
        return
      }

      try {
        const cartItems = await ecommerceService.getCartItems(user.id)
        setItems(cartItems)
      } catch (error) {
        logger.error("Error fetching cart:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const addItem = async (item: Omit<CartItem, "id">) => {
    if (!user) return false

    const success = await ecommerceService.addToCart(user.id, item)
    if (success) {
      const updatedCart = await ecommerceService.getCartItems(user.id)
      setItems(updatedCart)
    }
    return success
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return false

    const success = await ecommerceService.updateCartItem(user.id, productId, quantity)
    if (success) {
      const updatedCart = await ecommerceService.getCartItems(user.id)
      setItems(updatedCart)
    }
    return success
  }

  const removeItem = async (productId: string) => {
    if (!user) return false

    const success = await ecommerceService.removeFromCart(user.id, productId)
    if (success) {
      const updatedCart = await ecommerceService.getCartItems(user.id)
      setItems(updatedCart)
    }
    return success
  }

  const clearCart = async () => {
    if (!user) return false

    const success = await ecommerceService.clearCart(user.id)
    if (success) {
      setItems([])
    }
    return success
  }

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0)
  const getTotalPrice = () => items.reduce((total, item) => total + item.price * item.quantity, 0)

  return {
    items,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }
}

export function useOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([])
        setLoading(false)
        return
      }

      try {
        const userOrders = await ecommerceService.getOrders(user.id)
        setOrders(userOrders)
      } catch (error) {
        logger.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const createOrder = async (orderData: {
    items: CartItem[]
    total_amount: number
    shipping_info: any
    payment_info: any
  }) => {
    if (!user) return null

    const orderId = await ecommerceService.createOrder(user.id, orderData)
    if (orderId) {
      // Refresh orders list
      const updatedOrders = await ecommerceService.getOrders(user.id)
      setOrders(updatedOrders)
    }
    return orderId
  }

  return { orders, loading, createOrder }
}

export function useWishlist() {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([])
        setLoading(false)
        return
      }

      try {
        const items = await ecommerceService.getWishlist(user.id)
        setWishlist(items)
      } catch (error) {
        logger.error("Error fetching wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user])

  const addToWishlist = async (productId: string) => {
    if (!user) return false

    const success = await ecommerceService.addToWishlist(user.id, productId)
    if (success) {
      const updatedWishlist = await ecommerceService.getWishlist(user.id)
      setWishlist(updatedWishlist)
    }
    return success
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user) return false

    const success = await ecommerceService.removeFromWishlist(user.id, productId)
    if (success) {
      const updatedWishlist = await ecommerceService.getWishlist(user.id)
      setWishlist(updatedWishlist)
    }
    return success
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId)
  }

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }
}
