"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Star, ArrowRight } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useLanguage } from "../contexts/LanguageContext"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  category: string
  isNew?: boolean
  isBestSeller?: boolean
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "ผ้าคลุมโซฟา 3 ที่นั่ง - Classic Elegant",
    price: 2490,
    originalPrice: 3200,
    image: "/classic-elegant-fabric-pattern-1.png",
    rating: 4.8,
    reviews: 156,
    category: "3-seater",
    isBestSeller: true,
  },
  {
    id: "2",
    name: "ผ้าคลุมโซฟา L-Shape - Modern Minimalist",
    price: 3990,
    originalPrice: 4800,
    image: "/modern-minimalist-fabric-pattern-1.png",
    rating: 4.9,
    reviews: 89,
    category: "l-shape",
    isNew: true,
  },
  {
    id: "3",
    name: "ผ้าคลุมโซฟา 2 ที่นั่ง - Bohemian Chic",
    price: 1990,
    originalPrice: 2500,
    image: "/bohemian-chic-fabric-pattern-1.png",
    rating: 4.7,
    reviews: 203,
    category: "2-seater",
  },
  {
    id: "4",
    name: "ผ้าคลุมโซฟา Premium - Luxury Collection",
    price: 4990,
    originalPrice: 6200,
    image: "/classic-elegant-fabric-pattern-2.png",
    rating: 5.0,
    reviews: 45,
    category: "premium",
    isNew: true,
    isBestSeller: true,
  },
]

export default function FeaturedProducts() {
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()
  const { t } = useLanguage()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t("products.title")}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ผ้าคลุมโซฟาคุณภาพสูงที่ได้รับความนิยมมากที่สุด ราคาพิเศษสำหรับลูกค้าออนไลน์
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="p-0 relative">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && <Badge className="bg-green-500 hover:bg-green-600 text-white">ใหม่</Badge>}
                  {product.isBestSeller && <Badge className="bg-orange-500 hover:bg-orange-600 text-white">ขายดี</Badge>}
                </div>
                {/* Discount Badge */}
                {product.originalPrice && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="destructive">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-pink-600">฿{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ฿{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                  <Link href={`/products/${product.id}`}>ดูรายละเอียด</Link>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  เพิ่มลงตะกร้า
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
          >
            <Link href="/products">
              {t("products.view-all")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
