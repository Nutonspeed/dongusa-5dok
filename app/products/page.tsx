"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Grid, List, Star, MessageCircle, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

// Mock products data with price ranges and fixed-price accessories
const productsData = [
  // Main Products (Custom Pricing)
  {
    id: "1",
    name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    nameEn: "Premium Velvet Sofa Cover",
    type: "custom", // custom pricing
    priceRange: { min: 1500, max: 4500 },
    basePrice: 1500,
    image: "/placeholder.svg?height=300&width=300&text=Velvet+Cover",
    category: "covers",
    rating: 4.8,
    reviews: 124,
    bestseller: true,
    description: {
      th: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม ราคาขึ้นอยู่กับขนาดและรูปทรงโซฟา",
      en: "Premium velvet sofa cover, price depends on sofa size and shape",
    },
  },
  {
    id: "2",
    name: "ผ้าคลุมโซฟากันน้ำ",
    nameEn: "Waterproof Sofa Cover",
    type: "custom",
    priceRange: { min: 1200, max: 3800 },
    basePrice: 1200,
    image: "/placeholder.svg?height=300&width=300&text=Waterproof+Cover",
    category: "covers",
    rating: 4.6,
    reviews: 89,
    description: {
      th: "ผ้าคลุมโซฟากันน้ำ เหมาะสำหรับบ้านที่มีเด็กเล็กหรือสัตว์เลี้ยง",
      en: "Waterproof sofa cover, perfect for homes with kids or pets",
    },
  },
  {
    id: "3",
    name: "ผ้าคลุมโซฟาผ้าลินิน",
    nameEn: "Linen Sofa Cover",
    type: "custom",
    priceRange: { min: 1800, max: 5200 },
    basePrice: 1800,
    image: "/placeholder.svg?height=300&width=300&text=Linen+Cover",
    category: "covers",
    rating: 4.7,
    reviews: 67,
    description: {
      th: "ผ้าคลุมโซฟาผ้าลินินธรรมชาติ ระบายอากาศดี",
      en: "Natural linen sofa cover with excellent breathability",
    },
  },
  {
    id: "4",
    name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
    nameEn: "Sectional Sofa Cover",
    type: "custom",
    priceRange: { min: 2500, max: 7500 },
    basePrice: 2500,
    image: "/placeholder.svg?height=300&width=300&text=Sectional+Cover",
    category: "covers",
    rating: 4.5,
    reviews: 45,
    description: {
      th: "ผ้าคลุมโซฟาเซ็กชั่นแนล ออกแบบพิเศษตามรูปทรง",
      en: "Sectional sofa cover with custom design for your shape",
    },
  },
  // Fixed Price Accessories
  {
    id: "5",
    name: "หมอนอิงลายเดียวกัน",
    nameEn: "Matching Throw Pillows",
    type: "fixed",
    price: 350,
    image: "/placeholder.svg?height=300&width=300&text=Throw+Pillows",
    category: "accessories",
    rating: 4.4,
    reviews: 156,
    description: {
      th: "หมอนอิงลายเดียวกับผ้าคลุมโซฟา ขนาด 45x45 ซม.",
      en: "Matching throw pillows, 45x45 cm size",
    },
  },
  {
    id: "6",
    name: "คลิปยึดผ้าคลุมโซฟา",
    nameEn: "Sofa Cover Clips",
    type: "fixed",
    price: 120,
    image: "/placeholder.svg?height=300&width=300&text=Cover+Clips",
    category: "accessories",
    rating: 4.2,
    reviews: 203,
    description: {
      th: "คลิปยึดผ้าคลุมโซฟาให้แน่น ไม่หลุดง่าย (ชุด 8 ชิ้น)",
      en: "Sofa cover clips for secure fitting (8 pieces set)",
    },
  },
  {
    id: "7",
    name: "น้ำยาทำความสะอาดผ้า",
    nameEn: "Fabric Cleaner",
    type: "fixed",
    price: 280,
    image: "/placeholder.svg?height=300&width=300&text=Fabric+Cleaner",
    category: "accessories",
    rating: 4.3,
    reviews: 78,
    description: {
      th: "น้ำยาทำความสะอาดผ้าเฉพาะ ปลอดภัยต่อเนื้อผ้า (500ml)",
      en: "Specialized fabric cleaner, safe for all materials (500ml)",
    },
  },
  {
    id: "8",
    name: "ผ้าคลุมโซฟาแบบยืดหยุ่น",
    nameEn: "Stretch Sofa Cover",
    type: "custom",
    priceRange: { min: 990, max: 2890 },
    basePrice: 990,
    image: "/placeholder.svg?height=300&width=300&text=Stretch+Cover",
    category: "covers",
    rating: 4.1,
    reviews: 234,
    description: {
      th: "ผ้าคลุมโซฟาแบบยืดหยุ่น เหมาะกับโซฟาทุกรูปทรง",
      en: "Stretch sofa cover suitable for all sofa shapes",
    },
  },
]

const categories = [
  { id: "all", name: { th: "ทั้งหมด", en: "All" } },
  { id: "covers", name: { th: "ผ้าคลุมโซฟา", en: "Sofa Covers" } },
  { id: "accessories", name: { th: "อุปกรณ์เสริม", en: "Accessories" } },
]

const sortOptions = [
  { id: "popular", name: { th: "ความนิยม", en: "Popular" } },
  { id: "price-low", name: { th: "ราคาต่ำ-สูง", en: "Price: Low-High" } },
  { id: "price-high", name: { th: "ราคาสูง-ต่ำ", en: "Price: High-Low" } },
  { id: "rating", name: { th: "คะแนนสูงสุด", en: "Highest Rated" } },
]

export default function ProductsPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = productsData.filter((product) => {
      const matchesSearch = product[language === "th" ? "name" : "nameEn"]
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

      const productMaxPrice = product.type === "custom" ? product.priceRange.max : product.price
      const matchesPrice = productMaxPrice >= priceRange.min && productMaxPrice <= priceRange.max

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          const aPrice = a.type === "custom" ? a.priceRange.min : a.price
          const bPrice = b.type === "custom" ? b.priceRange.min : b.price
          return aPrice - bPrice
        case "price-high":
          const aPriceHigh = a.type === "custom" ? a.priceRange.max : a.price
          const bPriceHigh = b.type === "custom" ? b.priceRange.max : b.price
          return bPriceHigh - aPriceHigh
        case "rating":
          return b.rating - a.rating
        default: // popular
          return b.reviews - a.reviews
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy, priceRange, language])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatPriceRange = (min: number, max: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  }

  const handleGetQuote = (product: any) => {
    const message =
      language === "th"
        ? `สวัสดีครับ/ค่ะ! ผมสนใจ "${product.name}" ช่วยประเมินราคาให้หน่อยครับ/ค่ะ ขนาดโซฟาของผมคือ... (กรุณาแนบรูปโซฟาด้วยครับ/ค่ะ)`
        : `Hello! I'm interested in "${product.nameEn}". Could you please provide a quote? My sofa size is... (Please attach sofa photo)`

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{language === "th" ? "สินค้าทั้งหมด" : "All Products"}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "ผ้าคลุมโซฟาคุณภาพสูงและอุปกรณ์เสริม ราคาผ้าคลุมขึ้นอยู่กับขนาดและรูปทรงโซฟาของคุณ"
              : "High-quality sofa covers and accessories. Cover prices depend on your sofa size and shape"}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === "th" ? "ค้นหาสินค้า..." : "Search products..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name[language]}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name[language]}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "th" ? "ช่วงราคา" : "Price Range"}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min || ""}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) || 0 }))}
                className="w-24 px-3 py-1 border border-gray-300 rounded text-sm"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max || ""}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) || 10000 }))}
                className="w-24 px-3 py-1 border border-gray-300 rounded text-sm"
              />
              <Button size="sm" variant="outline" onClick={() => setPriceRange({ min: 0, max: 10000 })}>
                {language === "th" ? "รีเซ็ต" : "Reset"}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {language === "th"
              ? `พบ ${filteredAndSortedProducts.length} รายการ`
              : `Found ${filteredAndSortedProducts.length} items`}
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={language === "th" ? product.name : product.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.bestseller && (
                      <Badge className="absolute top-2 left-2 bg-pink-600 text-white">
                        {language === "th" ? "ขายดี" : "Bestseller"}
                      </Badge>
                    )}
                    {product.type === "custom" && (
                      <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                        {language === "th" ? "ราคาตามขนาด" : "Custom Price"}
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {language === "th" ? product.name : product.nameEn}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">{product.description[language]}</p>

                    {/* Rating */}
                    <div className="flex items-center space-x-1">
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
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      {product.type === "custom" ? (
                        <div>
                          <p className="text-lg font-bold text-pink-600">
                            {formatPriceRange(product.priceRange.min, product.priceRange.max)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {language === "th" ? "ราคาขึ้นอยู่กับขนาดโซฟา" : "Price depends on sofa size"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-pink-600">{formatPrice(product.price)}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {product.type === "custom" ? (
                        <Button
                          onClick={() => handleGetQuote(product)}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                          size="sm"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          {language === "th" ? "ขอใบเสนอราคา" : "Get Quote"}
                        </Button>
                      ) : (
                        <Link href={`/products/${product.id}`}>
                          <Button
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                            size="sm"
                          >
                            {language === "th" ? "ดูรายละเอียด" : "View Details"}
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleGetQuote(product)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {language === "th" ? "สอบถาม" : "Ask Question"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredAndSortedProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={language === "th" ? product.name : product.nameEn}
                        className="w-full h-full object-cover"
                      />
                      {product.bestseller && (
                        <Badge className="absolute top-1 left-1 bg-pink-600 text-white text-xs">
                          {language === "th" ? "ขายดี" : "Best"}
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {language === "th" ? product.name : product.nameEn}
                          </h3>
                          <p className="text-gray-600 mt-1">{product.description[language]}</p>
                        </div>

                        <div className="text-right">
                          {product.type === "custom" ? (
                            <div>
                              <p className="text-xl font-bold text-pink-600">
                                {formatPriceRange(product.priceRange.min, product.priceRange.max)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {language === "th" ? "ราคาตามขนาด" : "Custom pricing"}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xl font-bold text-pink-600">{formatPrice(product.price)}</p>
                          )}
                        </div>
                      </div>

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

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        {product.type === "custom" ? (
                          <Button
                            onClick={() => handleGetQuote(product)}
                            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                          >
                            <Calculator className="w-4 h-4 mr-2" />
                            {language === "th" ? "ขอใบเสนอราคา" : "Get Quote"}
                          </Button>
                        ) : (
                          <Link href={`/products/${product.id}`}>
                            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
                              {language === "th" ? "ดูรายละเอียด" : "View Details"}
                            </Button>
                          </Link>
                        )}

                        <Button variant="outline" onClick={() => handleGetQuote(product)} className="bg-transparent">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {language === "th" ? "สอบถาม" : "Ask Question"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === "th" ? "ไม่พบสินค้า" : "No products found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === "th" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองดู" : "Try changing your search terms or filters"}
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setPriceRange({ min: 0, max: 10000 })
              }}
              variant="outline"
            >
              {language === "th" ? "ล้างตัวกรอง" : "Clear Filters"}
            </Button>
          </div>
        )}

        {/* Quote Information */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            {language === "th" ? "วิธีการสั่งผ้าคลุมโซฟา" : "How to Order Sofa Covers"}
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="space-y-2">
              <div className="text-3xl">📏</div>
              <h4 className="font-semibold">{language === "th" ? "1. วัดขนาดโซฟา" : "1. Measure Your Sofa"}</h4>
              <p className="text-sm opacity-90">
                {language === "th"
                  ? "วัดความกว้าง ยาว สูง และส่งรูปโซฟาให้เรา"
                  : "Measure width, length, height and send us sofa photos"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">💬</div>
              <h4 className="font-semibold">{language === "th" ? "2. รับใบเสนอราคา" : "2. Get Quote"}</h4>
              <p className="text-sm opacity-90">
                {language === "th"
                  ? "เราจะประเมินราคาและส่งใบเสนอราคาให้ภายใน 2 ชั่วโมง"
                  : "We'll assess and send you a quote within 2 hours"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">✂️</div>
              <h4 className="font-semibold">{language === "th" ? "3. ผลิตและจัดส่ง" : "3. Production & Delivery"}</h4>
              <p className="text-sm opacity-90">
                {language === "th"
                  ? "ผลิตตามขนาด 7-14 วัน จัดส่งฟรีทั่วประเทศ"
                  : "Custom production 7-14 days, free nationwide delivery"}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
