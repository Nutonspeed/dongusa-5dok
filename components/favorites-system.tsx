"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface FavoritesSystemProps {
  productId: string
  className?: string
}

export function FavoritesSystem({ productId, className = "" }: FavoritesSystemProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkFavoriteStatus()
    }
  }, [user, productId])

  const checkFavoriteStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      if (!error && data) {
        setIsFavorite(true)
      }
    } catch (error) {
      // Item not in favorites
      setIsFavorite(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าในรายการโปรด")
      return
    }

    setIsLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId)

        if (error) throw error

        setIsFavorite(false)
        toast.success("ลบออกจากรายการโปรดแล้ว")
      } else {
        // Add to favorites
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: productId,
        })

        if (error) throw error

        setIsFavorite(true)
        toast.success("เพิ่มในรายการโปรดแล้ว")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleFavorite} disabled={isLoading} className={`p-2 ${className}`}>
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
    </Button>
  )
}
