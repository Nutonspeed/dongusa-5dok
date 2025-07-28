"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Eye, Truck } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"

interface Product {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  reviews: number
  inStock: boolean
  isNew?: boolean
  isBestSeller?: boolean
  freeShipping?: boolean
}

const featuredProducts: Product[] = [
  {
    id: "sofa-cover-3-seater-beige",
    name: "ผ้าคลุมโซฟา 3 ที่นั่ง สีเบจ",
    name_en: "3-Seater Sofa Cover Beige",
    description: "ผ้าคลุมโซฟาคุณภาพสูง ผลิตจากผ้าคอตตอน 100%",
    description_en: "High-quality sofa cover made from 100% cotton",
    price: 1290,
    originalPrice: 1590,
    images: ["/placeholder.svg?height=300&width=400&text=Beige+Sofa+Cover"],
    category: "covers",
    rating: 4.5,
    reviews: 23,
    inStock: true,
    isBestSeller: true,
    freeShipping: true,
  },
  {
    id: "sofa-cover-2-seater-floral",
    name: "ผ้าคลุมโซฟา 2 ที่นั่ง ลายดอกไม้",
    name_en: "2-Seater Sofa Cover Floral",
    description: "ผ้าคลุมโซฟาลายดอกไม้สวยงาม เหมาะสำหรับตกแต่งบ้าน",
    description_en: "Beautiful floral pattern sofa cover for home decoration",
    price: 990,
    images: ["/placeholder.svg?height=300&width=400&text=Floral+Sofa+Cover"],
    category: "covers",
    rating: 4.2,
    reviews: 18,
    inStock: true,
    isNew: true,
    freeShipping: true,
  },
  {
    id: "cushion-pad-non-slip",
    name: "เบาะรองนั่งโซฟา กันลื่น",
    name_en: "Non-Slip Sofa Cushion Pad",
    description: "เบาะรองนั่งกันลื่น ช่วยให้ผ้าคลุมโซฟาไม่เลื่อนหลุด",
    description_en: "Non-slip cushion pad to keep sofa covers in place",
    price: 290,
    images: ["/placeholder.svg?height=300&width=400&text=Cushion+Pad"],
    category: "accessories",
    rating: 4.8,
    reviews: 41,
    inStock: true,
    isBestSeller: true,
  },
  {
    id: "sofa-cover-l-shape-gray",
    name: "ผ้าคลุมโซฟา L-Shape สีเทา",
    name_en: "L-Shape Sofa Cover Gray",
    description: "ผ้าคลุมโซฟาสำหรับโซฟา L-Shape ขนาดใหญ่",
    description_en: "Large L-Shape sofa cover for sectional sofas",
    price: 1890,
    originalPrice: 2190,
    images: ["/placeholder.svg?height=300&width=400&text=L-Shape+Cover"],
    category: "covers",
    rating: 4.6,
    reviews: 15,
    inStock: true,
    freeShipping: true,
  },
]

export default function FeaturedProducts() {
  const { language } = useLanguage()
  const { addItem } = useCart()
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: language === "th" ? product.name : product.name_en,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("th-TH")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === "th" ? "สินค้าแนะนำ" : "Featured Products"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === "th"
              ? "สินค้าคุณภาพสูงที่ได้รับความนิยมจากลูกค้า พร้อมส่วนลดพิเศษ"
              : "High-quality products popular with customers, with special discounts"}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={language === "th" ? product.name : product.name_en}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isBestSeller && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                        {language === "th" ? "ขายดี" : "Best Seller"}
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                        {language === "th" ? "ใหม่" : "New"}
                      </Badge>
                    )}
                    {product.originalPrice && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Link href={`/products/${product.id}`}>
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Free Shipping Badge */}
                  {product.freeShipping && (
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-white/90 text-xs">
                        <Truck className="w-3 h-3 mr-1" />
                        {language === "th" ? "ส่งฟรี" : "Free Ship"}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                    {language === "th" ? product.name : product.name_en}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {language === "th" ? product.description : product.description_en}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">{renderStars(product.rating)}</div>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600">฿{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ฿{formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                    disabled={!product.inStock}
                  >
                    {product.inStock ? (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {language === "th" ? "เพิ่มลงตะกร้า" : "Add to Cart"}
                      </>
                    ) : language === "th" ? (
                      "สินค้าหมด"
                    ) : (
                      "Out of Stock"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              {language === "th" ? "ดูสินค้าทั้งหมด" : "View All Products"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
