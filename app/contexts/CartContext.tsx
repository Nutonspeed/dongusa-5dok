"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  color?: string
  size?: string
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

const CART_STORAGE_KEY = "sofa-cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage only once
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY)
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart)
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      } finally {
        setIsInitialized(true)
      }
    }
  }, [isInitialized])

  // Save cart to localStorage when items change (but not on initial load)
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [items, isInitialized])

  // Memoize calculated values
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const addItem = useCallback((newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size,
      )

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
        }
        return updatedItems
      } else {
        // Add new item
        return [...currentItems, { ...newItem, quantity: newItem.quantity || 1 }]
      }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id)
        return
      }

      setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    },
    [removeItem],
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Memoize context value
  const value = useMemo<CartContextType>(
    () => ({
      items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      setIsOpen,
    }),
    [items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, isOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
