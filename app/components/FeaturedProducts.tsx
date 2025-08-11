"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Heart, ShoppingCart, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"

interface Product {
  id: string
  name: {
    en: string
    th: string
  }
  description: {
    en: string
    th: string
  }
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  isNew?: boolean
  isBestseller?: boolean
  colors: string[]
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: {
      en: "Modern Minimalist Sofa Cover",
      th: "ผ้าคลุมโซฟาสไตล์มินิมอล",
    },
    description: {
      en: "Clean lines and contemporary design for modern living spaces",
      th: "เส้นสายเรียบง่ายและการออกแบบร่วมสมัยสำหรับพื้นที่นั่งเล่นสมัยใหม่",
    },
    price: 2490,
    originalPrice: 3200,
    image: "/modern-minimalist-fabric-pattern-1.png",
    rating: 4.8,
    reviewCount: 324,
    category: "Modern",
    isBestseller: true,
    colors: ["#F5F5F5", "#E8E8E8", "#D3D3D3"],
  },
  {
    id: "2",
    name: {
      en: "Classic Elegant Sofa Cover",
      th: "ผ้าคลุมโซฟาสไตล์คลาสสิก",
    },
    description: {
      en: "Timeless elegance with premium fabric and sophisticated patterns",
      th: "ความหรูหราเหนือกาลเวลาด้วยผ้าพรีเมียมและลายที่ซับซ้อน",
    },
    price: 3290,
    image: "/classic-elegant-fabric-pattern-1.png",
    rating: 4.9,
    reviewCount: 189,
    category: "Classic",
    isNew: true,
    colors: ["#8B4513", "#A0522D", "#CD853F"],
  },
  {
    id: "3",
    name: {
      en: "Bohemian Chic Sofa Cover",
      th: "ผ้าคลุมโซฟาสไตล์โบฮีเมียน",
    },
    description: {
      en: "Vibrant patterns and textures for a free-spirited living space",
      th: "ลายและเนื้อผ้าที่มีชีวิตชีวาสำหรับพื้นที่นั่งเล่นที่เป็นอิสระ",
    },
    price: 2890,
    originalPrice: 3500,
    image: "/bohemian-chic-fabric-pattern-1.png",
    rating: 4.7,
    reviewCount: 267,
    category: "Bohemian",
    colors: ["#8B0000", "#FF6347", "#FFD700"],
  },
  {
    id: "4",
    name: {
      en: "Luxury Velvet Sofa Cover",
      th: "ผ้าคลุมโซฟากำมะหยี่หรู",
    },
    description: {
      en: "Premium velvet material with rich colors and luxurious feel",
      th: "วัสดุกำมะหยี่พรีเมียมด้วยสีที่เข้มข้นและความรู้สึกหรูหรา",
    },
    price: 4290,
    image: "/modern-minimalist-fabric-pattern-2.png",
    rating: 4.9,
    reviewCount: 156,
    category: "Luxury",
    isNew: true,
    isBestseller: true,
    colors: ["#4B0082", "#800080", "#9370DB"],
  },
]

export default function FeaturedProducts() {
  const { language } = useLanguage()
  const { addItem } = useCart()
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name[language],
      price: product.price,
      image: product.image,
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

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Featured Products" : "สินค้าแนะนำ"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Discover our most popular sofa covers, carefully selected for their quality, style, and customer satisfaction."
              : "ค้นพบผ้าคลุมโซฟายอดนิยมของเรา ที่คัดสรรมาอย่างพิถีพิถันด้วยคุณภาพ สไตล์ และความพึงพอใจของลูกค้า"}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden burgundy-shadow"
            >
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name[language]}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-green-500 text-white">{language === "en" ? "New" : "ใหม่"}</Badge>
                  )}
                  {product.isBestseller && (
                    <Badge className="bg-primary text-white">{language === "en" ? "Bestseller" : "ขายดี"}</Badge>
                  )}
                  {product.originalPrice && (
                    <Badge className="bg-orange-500 text-white">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
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
                    {language === "en" ? "Add to Cart" : "เพิ่มลงตะกร้า"}
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Category */}
                <div className="text-sm text-primary font-medium mb-2">{product.category}</div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name[language]}</h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description[language]}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                {/* Colors */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-600">{language === "en" ? "Colors:" : "สี:"}</span>
                  <div className="flex space-x-1">
                    {product.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
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
              {language === "en" ? "View All Products" : "ดูสินค้าทั้งหมด"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
