"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from '@/hooks/use-toast' // Corrected import path

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  color?: string
  size?: string
  quantity: number
  stock: number // Add stock to cart item for validation
}

interface CartContextType {
  cartItems: CartItem[]
  addItem: (item: Omit<CartItem, 'stock'> & { stock: number }) => void
  removeItem: (id: string, color?: string, size?: string) => void
  updateItemQuantity: (id: string, quantity: number, color?: string, size?: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems')
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
        localStorage.removeItem('cartItems') // Clear corrupted data
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  const findItemIndex = useCallback((id: string, color?: string, size?: string) => {
    return cartItems.findIndex(
      (item) =>
        item.id === id &&
        (color ? item.color === color : true) &&
        (size ? item.size === size : true)
    )
  }, [cartItems])

  const addItem = useCallback((item: Omit<CartItem, 'stock'> & { stock: number }) => {
    setCartItems((prevItems) => {
      const existingItemIndex = findItemIndex(item.id, item.color, item.size)

      if (existingItemIndex > -1) {
        const existingItem = prevItems[existingItemIndex]
        const newQuantity = existingItem.quantity + item.quantity
        if (newQuantity > item.stock) {
          toast({
            title: 'สินค้าเกินจำนวนสต็อก',
            description: `ไม่สามารถเพิ่ม ${item.name} ได้อีก มีสินค้าในสต็อกเพียง ${item.stock} ชิ้น`,
            variant: 'destructive',
          })
          return prevItems // Do not update if quantity exceeds stock
        }
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        }
        toast({
          title: 'เพิ่มสินค้าในตะกร้าแล้ว',
          description: `เพิ่ม ${item.name} อีก ${item.quantity} ชิ้น`,
        })
        return updatedItems
      } else {
        if (item.quantity > item.stock) {
          toast({
            title: 'สินค้าเกินจำนวนสต็อก',
            description: `ไม่สามารถเพิ่ม ${item.name} ได้ มีสินค้าในสต็อกเพียง ${item.stock} ชิ้น`,
            variant: 'destructive',
          })
          return prevItems // Do not add if initial quantity exceeds stock
        }
        toast({
          title: 'เพิ่มสินค้าในตะกร้าแล้ว',
          description: `เพิ่ม ${item.name} จำนวน ${item.quantity} ชิ้น`,
        })
        return [...prevItems, { ...item }]
      }
    })
  }, [findItemIndex])

  const removeItem = useCallback((id: string, color?: string, size?: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => !(item.id === id && (color ? item.color === color : true) && (size ? item.size === size : true))
      )
      toast({
        title: 'นำสินค้าออกจากตะกร้าแล้ว',
        description: 'สินค้าถูกนำออกจากตะกร้าเรียบร้อย',
      })
      return updatedItems
    })
  }, [])

  const updateItemQuantity = useCallback((id: string, quantity: number, color?: string, size?: string) => {
    setCartItems((prevItems) => {
      const existingItemIndex = findItemIndex(id, color, size)

      if (existingItemIndex > -1) {
        const existingItem = prevItems[existingItemIndex]
        if (quantity <= 0) {
          toast({
            title: 'จำนวนสินค้าไม่ถูกต้อง',
            description: 'จำนวนสินค้าต้องมากกว่า 0',
            variant: 'destructive',
          })
          return prevItems // Prevent setting quantity to 0 or less
        }
        if (quantity > existingItem.stock) {
          toast({
            title: 'สินค้าเกินจำนวนสต็อก',
            description: `ไม่สามารถเพิ่ม ${existingItem.name} ได้อีก มีสินค้าในสต็อกเพียง ${existingItem.stock} ชิ้น`,
            variant: 'destructive',
          })
          return prevItems // Prevent exceeding stock
        }
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = { ...existingItem, quantity }
        return updatedItems
      }
      return prevItems
    })
  }, [findItemIndex])

  const clearCart = useCallback(() => {
    setCartItems([])
    toast({
      title: 'ล้างตะกร้าสินค้าแล้ว',
      description: 'สินค้าทั้งหมดถูกนำออกจากตะกร้า',
    })
  }, [])

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cartItems])

  const value = useMemo(
    () => ({
      cartItems,
      addItem,
      removeItem,
      updateItemQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
    }),
    [cartItems, addItem, removeItem, updateItemQuantity, clearCart, getTotalItems, getTotalPrice]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
