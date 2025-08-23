"use client"
import { logger } from "@/lib/logger"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "./AuthContext"

interface CartItem {
  id: string // Composite key for cart item
  productId: string // Original product ID
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
  fabricPattern?: string
  customizations?: string
}

type AddItemInput = Omit<CartItem, "quantity" | "id" | "productId"> & {
  id: string // Product ID
  quantity?: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: AddItemInput) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  toggleFavorite: (productId: string) => void
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const { user } = useAuth()
  // Use the shared supabase instance

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
            const cartItems = cartData.map((item: any) => {
              const itemKey = `${item.product_id}${item.size ? `-${item.size}` : ""}${item.color ? `-${item.color}` : ""}${item.fabric_pattern ? `-${item.fabric_pattern}` : ""}`
              return {
                id: itemKey,
                productId: item.product_id,
                name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                image: item.image_url,
                size: item.size,
                color: item.color,
                fabricPattern: item.fabric_pattern,
                customizations: item.customizations,
              }
            })
            setItems(cartItems)
          }
        } else {
          // Fallback to localStorage for guest users
          if (typeof window === "undefined") return

          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart)
            if (Array.isArray(parsedCart)) {
              const cartItems = parsedCart.map((item: any) => ({
                ...item,
                productId: item.productId ?? item.id,
              }))
              setItems(cartItems)
            }
          }
        }
      } catch (error) {
        logger.error("Error loading cart:", error)
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
              product_id: item.productId,
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
        logger.error("Error saving cart:", error)
      }
    }, 100)

    return () => clearTimeout(saveTimeout)
  }, [items, isLoading, isMounted, user, supabase])

  const addItem = (newItem: AddItemInput) => {
    setItems((prevItems) => {
      const itemKey = `${newItem.id}${newItem.size ? `-${newItem.size}` : ""}${newItem.color ? `-${newItem.color}` : ""}${newItem.fabricPattern ? `-${newItem.fabricPattern}` : ""}`

      const existingItemIndex = prevItems.findIndex((item) => item.id === itemKey)

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity || 1
        return updatedItems
      } else {
        // New item, add to cart with composite key as id
        return [...prevItems, { ...newItem, productId: newItem.id, id: itemKey, quantity: newItem.quantity || 1 }]
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

  const toggleFavorite = async (productId: string) => {
    if (!user) {
  // console.warn("User must be logged in to manage favorites")
      return
    }

    try {
      // Use the shared supabase instance

      // Check if item is already in favorites
      const { data: existing } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      if (existing) {
        // Remove from favorites
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId)
      } else {
        // Add to favorites
        await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: productId,
        })
      }
    } catch (error) {
      logger.error("Error toggling favorite:", error)
    }
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
    toggleFavorite,
    isLoading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      toggleFavorite: () => {},
      isLoading: false,
    }
  }
  return context
}
