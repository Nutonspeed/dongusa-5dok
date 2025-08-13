"use client"

import { useState, useEffect } from "react"
import { Heart, X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface WishlistItem extends Product {
  addedAt: string
}

export function WishlistManager() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      // Load from localStorage for now, can be extended to use Supabase
      const saved = localStorage.getItem("wishlist")
      if (saved) {
        setWishlist(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter((item) => item.id !== productId)
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))

    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    })
  }

  const addToCart = (product: Product) => {
    // Add to cart logic here
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-4">Start adding items you love to your wishlist</p>
        <Button onClick={() => (window.location.href = "/products")}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Wishlist</h2>
        <Badge variant="secondary">{wishlist.length} items</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden">
            <button
              onClick={() => removeFromWishlist(item.id)}
              className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="aspect-square overflow-hidden">
              <img
                src={item.images?.[0] || "/placeholder.svg?height=300&width=300"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <CardContent className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold">฿{item.price?.toLocaleString()}</span>
                {item.inStock ? (
                  <Badge variant="default">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              <Button onClick={() => addToCart(item)} disabled={!item.inStock} className="w-full" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>

              <p className="text-xs text-gray-500 mt-2">Added {new Date(item.addedAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Wishlist button component for product cards
export function WishlistButton({ product }: { product: Product }) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkWishlistStatus()
  }, [product.id])

  const checkWishlistStatus = () => {
    try {
      const saved = localStorage.getItem("wishlist")
      if (saved) {
        const wishlist = JSON.parse(saved)
        setIsInWishlist(wishlist.some((item: WishlistItem) => item.id === product.id))
      }
    } catch (error) {
      console.error("Failed to check wishlist status:", error)
    }
  }

  const toggleWishlist = () => {
    try {
      const saved = localStorage.getItem("wishlist")
      let wishlist: WishlistItem[] = saved ? JSON.parse(saved) : []

      if (isInWishlist) {
        wishlist = wishlist.filter((item) => item.id !== product.id)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist`,
        })
      } else {
        wishlist.push({
          ...product,
          addedAt: new Date().toISOString(),
        })
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist`,
        })
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist))
      setIsInWishlist(!isInWishlist)
    } catch (error) {
      console.error("Failed to update wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleWishlist}
      className={`p-2 ${isInWishlist ? "text-red-500" : "text-gray-400"}`}
    >
      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
    </Button>
  )
}
