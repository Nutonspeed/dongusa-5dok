"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
  rating?: number
  reviews_count?: number
  in_stock: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onToggleWishlist?: (productId: string) => void
  isInWishlist?: boolean
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    if (!onAddToCart) return

    setIsLoading(true)
    try {
      await onAddToCart(product)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleWishlist = () => {
    if (onToggleWishlist) {
      onToggleWishlist(product.id)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Link href={`/products/${product.id}`}>
            <Image
              src={
                product.image_url || `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.name)}`
              }
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </Button>

          {/* Stock Badge */}
          {!product.in_stock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">
                  {product.rating} ({product.reviews_count || 0})
                </span>
              </div>
            )}
          </div>

          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-burgundy-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <p className="text-lg font-bold text-burgundy-600 mt-2">฿{product.price.toLocaleString()}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!product.in_stock || isLoading}
          className="w-full bg-burgundy-600 hover:bg-burgundy-700"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
