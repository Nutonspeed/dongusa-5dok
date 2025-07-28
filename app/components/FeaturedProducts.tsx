"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Heart, ShoppingCart, Eye, Calculator, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"

interface Product {
  id: string
  name: string
  nameEn: string
  type: "custom" | "fixed"
  price?: number
  priceRange?: { min: number; max: number }
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  bestseller?: boolean
  discount?: number
  fabricPattern: string
  description: {
    th: string
    en: string
  }
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    nameEn: "Premium Velvet Sofa Cover",
    type: "custom",
    priceRange: { min: 1500, max: 4500 },
    originalPrice: 5500,
    image: "/modern-minimalist-fabric-pattern-1.png",
    rating: 4.8,
    reviews: 124,
    bestseller: true,
    discount: 18,
    fabricPattern: "Modern Minimalist - Arctic White",
    description: {
      th: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม นุ่มสบาย ทนทาน ราคาขึ้นอยู่กับขนาดโซฟา",
      en: "Premium velvet sofa cover, soft and durable. Price depends on sofa size.",
    },
  },
  {
    id: "2",
    name: "ผ้าคลุมโซฟาคลาสสิค",
    nameEn: "Classic Elegant Sofa Cover",
    type: "custom",
    priceRange: { min: 1800, max: 5200 },
    originalPrice: 6000,
    image: "/classic-elegant-fabric-pattern-1.png",
    rating: 4.7,
    reviews: 98,
    bestseller: true,
    discount: 13,
    fabricPattern: "Classic Elegance - Royal Navy",
    description: {
      th: "ผ้าคลุมโซฟาลายคลาสสิกหรูหรา เหมาะกับห้องนั่งเล่นสไตล์ดั้งเดิม",
      en: "Classic elegant sofa cover perfect for traditional living rooms.",
    },
  },
  {
    id: "3",
    name: "ผ้าคลุมโซฟาโบฮีเมียน",
    nameEn: "Bohemian Chic Sofa Cover",
    type: "custom",
    priceRange: { min: 1400, max: 4200 },
    image: "/bohemian-chic-fabric-pattern-1.png",
    rating: 4.6,
    reviews: 87,
    fabricPattern: "Bohemian Chic - Sunset Mandala",
    description: {
      th: "ผ้าคลุมโซฟาสไตล์โบฮีเมียน สีสันสดใส เหมาะกับการตกแต่งแบบอิสระ",
      en: "Bohemian style sofa cover with vibrant colors for eclectic decor.",
    },
  },
  {
    id: "4",
    name: "หมอนอิงลายเดียวกัน",
    nameEn: "Matching Throw Pillows",
    type: "fixed",
    price: 350,
    originalPrice: 450,
    image: "/classic-elegant-fabric-pattern-2.png",
    rating: 4.4,
    reviews: 156,
    discount: 22,
    fabricPattern: "Classic Elegance - Burgundy Paisley",
    description: {
      th: "หมอนอิงลายเดียวกับผ้าคลุมโซฟา ขนาด 45x45 ซม. ชุดละ 2 ใบ",
      en: "Matching throw pillows, 45x45 cm, set of 2 pieces.",
    },
  },
  {
    id: "5",
    name: "ผ้าคลุมโซฟาแบบยืดหยุ่น",
    nameEn: "Stretch Sofa Cover",
    type: "custom",
    priceRange: { min: 990, max: 2890 },
    image: "/modern-minimalist-fabric-pattern-2.png",
    rating: 4.3,
    reviews: 234,
    fabricPattern: "Modern Minimalist - Stone Gray",
    description: {
      th: "ผ้าคลุมโซฟาแบบยืดหยุ่น เหมาะกับโซฟาทุกรูปทรง ติดตั้งง่าย",
      en: "Stretch sofa cover suitable for all sofa shapes, easy installation.",
    },
  },
  {
    id: "6",
    name: "คลิปยึดผ้าคลุมโซฟา",
    nameEn: "Sofa Cover Clips",
    type: "fixed",
    price: 120,
    originalPrice: 180,
    image: "/placeholder.svg?height=300&width=300&text=Cover+Clips",
    rating: 4.2,
    reviews: 203,
    discount: 33,
    fabricPattern: "Accessory",
    description: {
      th: "คลิปยึดผ้าคลุมโซฟาให้แน่น ไม่หลุดง่าย ชุดละ 8 ชิ้น",
      en: "Sofa cover clips for secure fitting, set of 8 pieces.",
    },
  },
]

export default function FeaturedProducts() {
  const { language } = useLanguage()
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatPriceRange = (min: number, max: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  }

  const handleGetQuote = (product: Product) => {
    const message =
      language === "th"
        ? `สวัสดีครับ/ค่ะ! ผมสนใจ "${product.name}" (${product.fabricPattern}) ช่วยประเมินราคาให้หน่อยครับ/ค่ะ`
        : `Hello! I'm interested in "${product.nameEn}" (${product.fabricPattern}). Could you please provide a quote?`

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === "th" ? "สินค้าแนะนำ" : "Featured Products"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "สินค้าขายดีและได้รับความนิยมสูงสุด พร้อมลายผ้าใหม่ล่าสุด"
              : "Best-selling and most popular products with our latest fabric patterns"}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={language === "th" ? product.name : product.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.bestseller && (
                      <Badge className="bg-pink-600 text-white">{language === "th" ? "ขายดี" : "Bestseller"}</Badge>
                    )}
                    {product.discount && (
                      <Badge variant="destructive" className="bg-red-500">
                        -{product.discount}%
                      </Badge>
                    )}
                    {product.type === "custom" && (
                      <Badge className="bg-blue-600 text-white">
                        {language === "th" ? "ตัดตามขนาด" : "Custom Size"}
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow-md transition-colors ${
                      favorites.includes(product.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? "fill-current" : ""}`} />
                  </button>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="secondary" className="bg-white hover:bg-gray-100">
                          <Eye className="w-4 h-4 mr-1" />
                          {language === "th" ? "ดู" : "View"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-4">
                  {/* Fabric Pattern */}
                  <div className="text-xs text-blue-600 font-medium">{product.fabricPattern}</div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                    {language === "th" ? product.name : product.nameEn}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description[language]}</p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews} {language === "th" ? "รีวิว" : "reviews"})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    {product.type === "custom" && product.priceRange ? (
                      <div>
                        <p className="text-xl font-bold text-pink-600">
                          {formatPriceRange(product.priceRange.min, product.priceRange.max)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === "th" ? "ราคาขึ้นอยู่กับขนาดโซฟา" : "Price depends on sofa size"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-pink-600">{formatPrice(product.price!)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {product.type === "custom" ? (
                      <Button
                        onClick={() => handleGetQuote(product)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        {language === "th" ? "ขอใบเสนอราคา" : "Get Quote"}
                      </Button>
                    ) : (
                      <Link href={`/products/${product.id}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {language === "th" ? "เพิ่มลงตะกร้า" : "Add to Cart"}
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGetQuote(product)}
                      className="px-3 bg-transparent"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="text-center">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg font-semibold border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white transition-all duration-300 bg-white"
            >
              {language === "th" ? "ดูสินค้าทั้งหมด" : "View All Products"}
              <Eye className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
