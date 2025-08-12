"use client"
import { logger } from '@/lib/logger';

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Heart, ShoppingCart, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { DatabaseService } from "@/lib/database"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_at_price?: number
  images: string[]
  rating?: number
  reviews?: number
  category?: {
    name: string
    slug: string
  }
  is_featured?: boolean
  is_new?: boolean
  colors?: string[]
}

export default function FeaturedProducts() {
  const { language, t } = useLanguage()
  const { addItem } = useCart()
  const [favorites, setFavorites] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const supabase = createClient()
        const db = new DatabaseService(supabase)

        const { data } = await db.getFeaturedProducts(4)

        if (data) {
          setProducts(data)
        }
      } catch (error) {
        logger.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      quantity: 1,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("featuredProductsTitle")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("featuredProductsSubtitle")}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden burgundy-shadow"
            >
              <div className="relative">
                <Image
                  src={
                    product.images[0] ||
                    `/placeholder.svg?height=256&width=400&query=${encodeURIComponent(product.name + " sofa cover")}`
                  }
                  alt={product.name}
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_new && (
                    <Badge className="bg-green-500 text-white">{t("newLabel")}</Badge>
                  )}
                  {product.is_featured && (
                    <Badge className="bg-primary text-white">{t("featuredLabel")}</Badge>
                  )}
                  {product.compare_at_price && (
                    <Badge className="bg-orange-500 text-white">
                      {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-10 h-10 p-0 bg-white/90 hover:bg-white"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(product.id) ? "fill-primary text-primary" : "text-gray-600"
                      }`}
                    />
                  </Button>

                  <Link href={`/products/${product.id}`}>
                    <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white/90 hover:bg-white">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                  </Link>
                </div>

                {/* Quick Add to Cart */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t("addToCart")}
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Category */}
                <div className="text-sm text-primary font-medium mb-2">{product.category?.name || "Product"}</div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating || 0} ({product.reviews || 0})
                  </span>
                </div>

                {/* Colors */}
                {product.colors && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-600">{t("colorsLabel")}</span>
                    <div className="flex space-x-1">
                      {product.colors.map((color) => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 bg-transparent border-primary text-primary hover:bg-accent"
            >
              {t("viewAllProducts")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
