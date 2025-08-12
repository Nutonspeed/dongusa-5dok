"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./AuthContext"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
  fabricPattern?: string
  customizations?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const loadCartData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))

      try {
        if (user) {
          // Load cart from Supabase for authenticated users
          const { data: cartData, error } = await supabase.from("cart_items").select("*").eq("user_id", user.id)

          if (!error && cartData) {
            const cartItems = cartData.map((item) => ({
              id: item.product_id,
              name: item.product_name,
              price: item.price,
              quantity: item.quantity,
              image: item.image_url,
              size: item.size,
              color: item.color,
              fabricPattern: item.fabric_pattern,
              customizations: item.customizations,
            }))
            setItems(cartItems)
          }
        } else {
          // Fallback to localStorage for guest users
          if (typeof window === "undefined") return

          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart)
            if (Array.isArray(parsedCart)) {
              setItems(parsedCart)
            }
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCartData()
  }, [isMounted, user, supabase])

  useEffect(() => {
    if (!isMounted || isLoading) return

    const saveTimeout = setTimeout(async () => {
      try {
        if (user) {
          // Save to Supabase for authenticated users
          await supabase.from("cart_items").delete().eq("user_id", user.id)

          if (items.length > 0) {
            const cartData = items.map((item) => ({
              user_id: user.id,
              product_id: item.id,
              product_name: item.name,
              price: item.price,
              quantity: item.quantity,
              image_url: item.image,
              size: item.size,
              color: item.color,
              fabric_pattern: item.fabricPattern,
              customizations: item.customizations,
            }))

            await supabase.from("cart_items").insert(cartData)
          }
        } else {
          // Fallback to localStorage for guest users
          if (typeof window !== "undefined") {
            localStorage.setItem("cart", JSON.stringify(items))
          }
        }
      } catch (error) {
        console.error("Error saving cart:", error)
      }
    }, 100)

    return () => clearTimeout(saveTimeout)
  }, [items, isLoading, isMounted, user, supabase])

  const addItem = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.color === newItem.color &&
          item.fabricPattern === newItem.fabricPattern,
      )

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity || 1
        return updatedItems
      } else {
        // New item, add to cart
        return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoading,
  }

  if (!isMounted) {
    return <div style={{ display: "none" }}>{children}</div>
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
