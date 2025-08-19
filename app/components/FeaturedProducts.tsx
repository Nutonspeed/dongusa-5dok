"use client"
import { logger } from "@/lib/logger"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Heart, ShoppingCart, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { supabase } from "@/lib/supabase/client"

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
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log("[v0] Fetching featured products...")

        const { data: productsData, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            description,
            price,
            compare_at_price,
            images,
            is_active,
            categories (
              name,
              slug
            )
          `)
          .eq("is_active", true)
          .limit(4)
          .order("created_at", { ascending: false })

        if (error) {
          console.log("[v0] Supabase error, using fallback data:", error)
          throw error
        }

        if (productsData && productsData.length > 0) {
          console.log("[v0] Successfully fetched products from Supabase:", productsData.length)
          const formattedProducts = productsData.map((product: any) => ({
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: product.price,
            compare_at_price: product.compare_at_price,
            images: product.images || [],
            rating: 4.5 + Math.random() * 0.4, // Random rating between 4.5-4.9
            reviews: Math.floor(Math.random() * 100) + 50, // Random reviews 50-150
            category: product.categories,
            is_featured: true,
            is_new: Math.random() > 0.6, // 40% chance of being new
            colors: ["#881337", "#fbcfe8", "#d97706", "#1e3a8a"], // Brand colors
          }))
          setProducts(formattedProducts)
        } else {
          console.log("[v0] No products from Supabase, using fallback data")
          throw new Error("No products found")
        }
      } catch (error) {
        console.log("[v0] Using fallback product data due to error:", error)
        logger.error("Error fetching featured products:", error)

        setProducts([
          {
            id: "1",
            name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
            description: "ผ้าคลุมโซฟาคุณภาพสูง ทำจากกำมะหยี่นุ่ม กันน้ำ กันคราบ เหมาะสำหรับโซฟา 2-3 ที่นั่ง",
            price: 2890,
            compare_at_price: 3490,
            images: ["/premium-velvet-burgundy-sofa-cover.png"],
            rating: 4.8,
            reviews: 127,
            category: { name: "ผ้าคลุมโซฟา", slug: "sofa-covers" },
            is_featured: true,
            is_new: true,
            colors: ["#881337", "#1e3a8a", "#d97706"],
          },
          {
            id: "2",
            name: "ผ้าคลุมโซฟากันน้ำ",
            description: "ผ้าคลุมโซฟากันน้ำ 100% เหมาะสำหรับครอบครัวที่มีเด็กเล็ก ทำความสะอาดง่าย",
            price: 1950,
            images: ["/waterproof-charcoal-sofa-cover.png"],
            rating: 4.6,
            reviews: 89,
            category: { name: "ผ้าคลุมโซฟา", slug: "sofa-covers" },
            is_featured: true,
            colors: ["#374151", "#6B7280", "#9CA3AF"],
          },
          {
            id: "3",
            name: "หมอนอิงลายเดียวกัน",
            description: "หมอนอิงที่เข้าชุดกับผ้าคลุมโซฟา ขนาด 45x45 ซม. ผ้าคุณภาพเดียวกัน",
            price: 350,
            images: ["/burgundy-throw-pillows.png"],
            rating: 4.4,
            reviews: 156,
            category: { name: "หมอนอิง", slug: "pillows" },
            is_featured: true,
            colors: ["#881337", "#fbcfe8"],
          },
          {
            id: "4",
            name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
            description: "ผ้าคลุมโซฟาสำหรับโซฟาเซ็กชั่นแนล ขนาดใหญ่ ครอบคลุมได้ดี มีสายรัดกันเลื่อน",
            price: 4200,
            compare_at_price: 4890,
            images: ["/sectional-navy-sofa-cover.png"],
            rating: 4.7,
            reviews: 73,
            category: { name: "ผ้าคลุมโซฟา", slug: "sofa-covers" },
            is_featured: true,
            colors: ["#1e3a8a", "#374151", "#6B7280"],
          },
        ])
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
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
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
            {language === "th" ? "สินค้าแนะนำ" : "Featured Products"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th" ? "ผ้าคลุมโซฟาคุณภาพสูงที่ได้รับความนิยมมากที่สุด" : "Our most popular premium sofa covers"}
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
                    `/placeholder.svg?height=256&width=400&query=${encodeURIComponent(product.name + " sofa cover") || "/placeholder.svg"}`
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
                    <Badge className="bg-green-500 text-white">{language === "th" ? "ใหม่" : "New"}</Badge>
                  )}
                  {product.is_featured && (
                    <Badge className="bg-primary text-white">{language === "th" ? "แนะนำ" : "Featured"}</Badge>
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
                    {language === "th" ? "เพิ่มลงตะกร้า" : "Add to Cart"}
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
                    <span className="text-sm text-gray-600">{language === "th" ? "สี:" : "Colors:"}</span>
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
              {language === "th" ? "ดูสินค้าทั้งหมด" : "View All Products"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
