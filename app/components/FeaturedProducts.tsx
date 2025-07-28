"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Eye } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  badge: string
  colors: string[]
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "ผ้าคลุมโซฟาสไตล์โมเดิร์น",
    price: 1290,
    originalPrice: 1590,
    image: "/modern-living-room-sofa-covers.png",
    rating: 4.8,
    reviews: 124,
    badge: "ขายดี",
    colors: ["#8B4513", "#2F4F4F", "#696969"],
  },
  {
    id: "2",
    name: "ผ้าคลุมโซฟาลายคลาสสิก",
    price: 1490,
    originalPrice: 1890,
    image: "/classic-elegant-fabric-pattern-1.png",
    rating: 4.9,
    reviews: 89,
    badge: "แนะนำ",
    colors: ["#8B0000", "#000080", "#006400"],
  },
  {
    id: "3",
    name: "ผ้าคลุมโซฟาสไตล์มินิมอล",
    price: 1190,
    originalPrice: 1490,
    image: "/modern-minimalist-fabric-pattern-1.png",
    rating: 4.7,
    reviews: 156,
    badge: "ใหม่",
    colors: ["#F5F5DC", "#D3D3D3", "#C0C0C0"],
  },
  {
    id: "4",
    name: "ผ้าคลุมโซฟาลายโบฮีเมียน",
    price: 1390,
    originalPrice: 1690,
    image: "/bohemian-chic-fabric-pattern-1.png",
    rating: 4.6,
    reviews: 78,
    badge: "ลดราคา",
    colors: ["#8B4513", "#CD853F", "#DEB887"],
  },
]

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">สินค้าแนะนำ</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ค้นพบผ้าคลุมโซฟายอดนิยมของเรา ที่ได้รับความไว้วางใจจากลูกค้าหลายพันคน
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badge */}
                  <Badge
                    className={`absolute top-3 left-3 ${
                      product.badge === "ขายดี"
                        ? "bg-red-500"
                        : product.badge === "แนะนำ"
                          ? "bg-blue-500"
                          : product.badge === "ใหม่"
                            ? "bg-green-500"
                            : "bg-orange-500"
                    }`}
                  >
                    {product.badge}
                  </Badge>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="w-8 h-8 p-0">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex items-center">
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
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

                  {/* Colors */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-gray-600">สี:</span>
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
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg font-bold text-gray-900">฿{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ฿{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button className="w-full" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    เพิ่มลงตะกร้า
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/products">
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              ดูสินค้าทั้งหมด
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
