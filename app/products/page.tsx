"use client"
import { logger } from "@/lib/logger"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Search, Grid, List, Star, Calculator, MessageCircle, Filter, X, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BackButton } from "@/components/ui/back-button"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import Header from "../components/Header"
import Footer from "../components/Footer"
import clientDb from "@/lib/database-client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_at_price?: number
  sku: string
  category_id: string
  stock_quantity: number
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  category?: {
    name: string
    slug: string
  }
  rating?: number
  reviews?: number
  tags?: string[]
  type?: "fixed" | "custom"
  priceRange?: { min: number; max: number }
  bestseller?: boolean
  discount?: number
}

export const dynamic = "force-dynamic"

export default function ProductsPage() {
  const { language } = useLanguage()
  const { addItem, toggleFavorite } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResult, categoriesResult] = await Promise.all([clientDb.getProducts(), clientDb.getCategories()])

        if (productsResult.data) {
          setProducts(productsResult.data)
        }

        if (categoriesResult.data) {
          setCategories([
            { id: "all", name: { en: "All Categories", th: "หมวดหมู่ทั้งหมด" } },
            ...categoriesResult.data.map((cat: any) => ({
              id: cat.id,
              name: { en: cat.name, th: cat.name },
            })),
          ])
        }
      } catch (error) {
        logger.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    products.forEach((product) => {
      product.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [products])

  const sortOptions = [
    { id: "popular", name: { en: "Most Popular", th: "ยอดนิยม" } },
    { id: "newest", name: { en: "Newest", th: "ใหม่ล่าสุด" } },
    { id: "price-low", name: { en: "Price: Low to High", th: "ราคา: ต่ำ - สูง" } },
    { id: "price-high", name: { en: "Price: High to Low", th: "ราคา: สูง - ต่ำ" } },
    { id: "rating", name: { en: "Highest Rated", th: "คะแนนสูงสุด" } },
  ]

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory

      const productMaxPrice = product.type === "custom" ? product.priceRange?.max || product.price : product.price
      const productMinPrice = product.type === "custom" ? product.priceRange?.min || product.price : product.price
      const matchesPrice = productMaxPrice >= priceRange.min && productMinPrice <= priceRange.max

      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => product.tags?.includes(tag))

      return matchesSearch && matchesCategory && matchesPrice && matchesTags && product.is_active
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "price-low":
          const aPrice = a.type === "custom" ? a.priceRange?.min || a.price : a.price
          const bPrice = b.type === "custom" ? b.priceRange?.min || b.price : b.price
          return aPrice - bPrice
        case "price-high":
          const aPriceHigh = a.type === "custom" ? a.priceRange?.max || a.price : a.price
          const bPriceHigh = b.type === "custom" ? b.priceRange?.max || b.price : b.price
          return bPriceHigh - aPriceHigh
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        default: // popular
          return (b.reviews || 0) - (a.reviews || 0)
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy, priceRange, selectedTags, products])

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
        ? `สวัสดีครับ/ค่ะ! ผมสนใจ "${product.name}" ช่วยประเมินราคาให้หน่อยครับ/ค่ะ ขนาดโซฟาของผมคือ... (กรุณาแนบรูปโซฟาด้วยครับ/ค่ะ)`
        : `Hello! I'm interested in "${product.name}". Could you please provide a quote? My sofa size is... (Please attach sofa photo)`

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  const handleAddToCart = (product: Product) => {
    if (product.type === "fixed") {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1,
      })
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setPriceRange({ min: 0, max: 10000 })
    setSelectedTags([])
    setSortBy("popular")
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">{language === "th" ? "หมวดหมู่" : "Category"}</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={selectedCategory === category.id}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mr-2"
              />
              {category.name[language]}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">{language === "th" ? "ช่วงราคา" : "Price Range"}</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min || ""}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) || 0 }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max || ""}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) || 10000 }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">{language === "th" ? "แท็ก" : "Tags"}</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
        <X className="w-4 h-4 mr-2" />
        {language === "th" ? "ล้างตัวกรอง" : "Clear Filters"}
      </Button>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">{language === "th" ? "กำลังโหลด..." : "Loading..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackUrl="/" className="text-gray-600 hover:text-primary" />
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">
              {language === "th" ? "หน้าแรก" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{language === "th" ? "สินค้าทั้งหมด" : "All Products"}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{language === "th" ? "สินค้าทั้งหมด" : "All Products"}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "ผ้าคลุมโซฟาคุณภาพสูงและอุปกรณ์เสริม ราคาผ้าคลุมขึ้นอยู่กับขนาดและรูปทรงโซฟาของคุณ"
              : "High-quality sofa covers and accessories. Cover prices depend on your sofa size and shape"}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">{language === "th" ? "ตัวกรอง" : "Filters"}</h2>
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={language === "th" ? "ค้นหาสินค้า..." : "Search products..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name[language]}
                    </option>
                  ))}
                </select>

                {/* View Mode and Mobile Filter */}
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

                  {/* Mobile Filter Button */}
                  <Sheet open={showFilters} onOpenChange={setShowFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>{language === "th" ? "ตัวกรอง" : "Filters"}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {/* Results Count and Active Filters */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {language === "th"
                  ? `พบ ${filteredAndSortedProducts.length} รายการ`
                  : `Found ${filteredAndSortedProducts.length} items`}
              </p>

              {/* Active Filters */}
              {(selectedTags.length > 0 || selectedCategory !== "all") && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {language === "th" ? "ตัวกรองที่เลือก:" : "Active filters:"}
                  </span>
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {categories.find((c) => c.id === selectedCategory)?.name[language]}
                    </Badge>
                  )}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.bestseller && (
                          <Badge className="absolute top-2 left-2 bg-pink-600 text-white">
                            {language === "th" ? "ขายดี" : "Bestseller"}
                          </Badge>
                        )}
                        {product.discount && (
                          <Badge className="absolute top-2 right-2 bg-red-600 text-white">-{product.discount}%</Badge>
                        )}
                        {product.type === "custom" && (
                          <Badge className="absolute bottom-2 right-2 bg-blue-600 text-white">
                            {language === "th" ? "ราคาตามขนาด" : "Custom Price"}
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>

                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
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
                                {formatPriceRange(
                                  product.priceRange?.min || product.price,
                                  product.priceRange?.max || product.price,
                                )}
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
                            <div className="flex space-x-2">
                              <Link href={`/products/${product.id}`} className="flex-1">
                                <Button
                                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                                  size="sm"
                                >
                                  {language === "th" ? "ดูรายละเอียด" : "View Details"}
                                </Button>
                              </Link>
                              <Button
                                onClick={() => handleAddToCart(product)}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                size="sm"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                {language === "th" ? "เพิ่มในตระกร้า" : "Add to Cart"}
                              </Button>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => toggleFavorite(product.id)}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            {language === "th" ? "เพิ่มในรายการโปรด" : "Add to Favorites"}
                          </Button>
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
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
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
                              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                              <p className="text-gray-600 mt-1">{product.description}</p>
                            </div>

                            <div className="text-right">
                              {product.type === "custom" ? (
                                <div>
                                  <p className="text-xl font-bold text-pink-600">
                                    {formatPriceRange(
                                      product.priceRange?.min || product.price,
                                      product.priceRange?.max || product.price,
                                    )}
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
                                    i < Math.floor(product.rating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {product.rating} ({product.reviews} {language === "th" ? "รีวิว" : "reviews"})
                            </span>
                          </div>

                          {/* Tags */}
                          {product.tags && (
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

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

                            <Button
                              variant="outline"
                              onClick={() => handleAddToCart(product)}
                              className="bg-transparent"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {language === "th" ? "เพิ่มในตระกร้า" : "Add to Cart"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => toggleFavorite(product.id)}
                              className="bg-transparent"
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              {language === "th" ? "เพิ่มในรายการโปรด" : "Add to Favorites"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleGetQuote(product)}
                              className="bg-transparent"
                            >
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
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === "th" ? "ไม่พบสินค้า" : "No products found"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {language === "th"
                    ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองดู หรือดูสินค้าทั้งหมดของเรา"
                    : "Try changing your search terms or filters, or browse all our products"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={clearFilters} variant="outline" className="bg-transparent">
                    <X className="w-4 h-4 mr-2" />
                    {language === "th" ? "ล้างตัวกรอง" : "Clear Filters"}
                  </Button>
                  <Link href="/fabric-gallery">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      {language === "th" ? "ดูแกลเลอรี่ผ้า" : "Browse Fabric Gallery"}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

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
                {language === "th" ? "เราจะประเมินราคาและส่งใบเสนอราคาให้" : "We'll assess and send you a detailed quote"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🚚</div>
              <h4 className="font-semibold">{language === "th" ? "3. ผลิตและจัดส่ง" : "3. Production & Delivery"}</h4>
              <p className="text-sm opacity-90">
                {language === "th" ? "ผลิตตามสั่งและจัดส่งถึงบ้านคุณ" : "Custom production and delivery to your home"}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
