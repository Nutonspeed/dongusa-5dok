"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Filter } from "lucide-react"
import { useCart } from "@/app/contexts/CartContext"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Product {
  id: string
  name: string
  name_en: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews_count: number
  category: string
  type: string
  status: string
  bestseller: boolean
  discount: number
}

// Mock data for products (replace with actual API call later)
const allProducts: Product[] = [
  {
    id: "prod-001",
    name: "ผ้าคลุมโซฟา 3 ที่นั่ง - คลาสสิค",
    name_en: "3-Seater Sofa Cover - Classic",
    price: 2490,
    originalPrice: 3200,
    image: "/classic-elegant-fabric-pattern-1.png",
    rating: 4.8,
    reviews_count: 156,
    category: "covers",
    type: "fixed",
    status: "active",
    bestseller: true,
    discount: 0.22,
  },
  {
    id: "prod-002",
    name: "ผ้าคลุมโซฟา 2 ที่นั่ง - โมเดิร์น",
    name_en: "2-Seater Sofa Cover - Modern",
    price: 1990,
    originalPrice: 2500,
    image: "/modern-minimalist-fabric-pattern-1.png",
    rating: 4.7,
    reviews_count: 89,
    category: "covers",
    type: "fixed",
    status: "active",
    bestseller: false,
    discount: 0.2,
  },
  {
    id: "prod-003",
    name: "ผ้าคลุมโซฟา L-Shape - โบฮีเมียน",
    name_en: "L-Shape Sofa Cover - Bohemian",
    price: 3590,
    image: "/bohemian-chic-fabric-pattern-1.png",
    rating: 4.9,
    reviews_count: 203,
    category: "covers",
    type: "custom",
    status: "active",
    bestseller: true,
    discount: 0,
  },
  {
    id: "prod-004",
    name: "ผ้าคลุมโซฟาเดี่ยว - พรีเมียม",
    name_en: "Single Sofa Cover - Premium",
    price: 1290,
    originalPrice: 1500,
    image: "/classic-elegant-fabric-pattern-2.png",
    rating: 5.0,
    reviews_count: 45,
    category: "covers",
    type: "fixed",
    status: "active",
    bestseller: false,
    discount: 0.14,
  },
  {
    id: "prod-005",
    name: "หมอนอิงตกแต่ง - ลายเรขาคณิต",
    name_en: "Decorative Pillow - Geometric",
    price: 450,
    image: "/geometric-pillow.png",
    rating: 4.5,
    reviews_count: 30,
    category: "accessories",
    type: "fixed",
    status: "active",
    bestseller: false,
    discount: 0,
  },
  {
    id: "prod-006",
    name: "ผ้าคลุมเก้าอี้ทานอาหาร - ชุด 4 ชิ้น",
    name_en: "Dining Chair Cover - 4 Pcs Set",
    price: 990,
    image: "/patterned-dining-chair-cover.png",
    rating: 4.6,
    reviews_count: 55,
    category: "covers",
    type: "fixed",
    status: "active",
    bestseller: false,
    discount: 0,
  },
]

export default function ProductsPage() {
  const { addItem } = useCart()
  const { language, t } = useLanguage()
  const [products, setProducts] = useState<Product[]>(allProducts)
  const [filters, setFilters] = useState({
    category: "all",
    sortBy: "latest",
    search: "",
  })
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    let filteredProducts = allProducts

    // Apply category filter
    if (filters.category !== "all") {
      filteredProducts = filteredProducts.filter((p) => p.category === filters.category)
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) => p.name.toLowerCase().includes(searchTerm) || p.name_en.toLowerCase().includes(searchTerm),
      )
    }

    // Apply sort
    filteredProducts.sort((a, b) => {
      if (filters.sortBy === "price-asc") {
        return a.price - b.price
      } else if (filters.sortBy === "price-desc") {
        return b.price - a.price
      } else if (filters.sortBy === "rating-desc") {
        return b.rating - a.rating
      }
      // Default to latest (no specific field for this in mock, so keep original order)
      return 0
    })

    setProducts(filteredProducts)
  }, [filters])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: language === "th" ? product.name : product.name_en,
      price: product.price,
      image: product.image,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t("products.all-products")}</h1>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex-1 w-full md:w-auto">
              <Input
                placeholder={t("products.search-placeholder")}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t("products.filter-category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.category-all")}</SelectItem>
                  <SelectItem value="covers">{t("products.category-covers")}</SelectItem>
                  <SelectItem value="accessories">{t("products.category-accessories")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t("products.sort-by")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">{t("products.sort-latest")}</SelectItem>
                  <SelectItem value="price-asc">{t("products.sort-price-asc")}</SelectItem>
                  <SelectItem value="price-desc">{t("products.sort-price-desc")}</SelectItem>
                  <SelectItem value="rating-desc">{t("products.sort-rating-desc")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon">
                    <Filter className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>{t("products.filter-options")}</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Label htmlFor="mobile-category">{t("products.filter-category")}</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger id="mobile-category">
                        <SelectValue placeholder={t("products.filter-category")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("products.category-all")}</SelectItem>
                        <SelectItem value="covers">{t("products.category-covers")}</SelectItem>
                        <SelectItem value="accessories">{t("products.category-accessories")}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label htmlFor="mobile-sort">{t("products.sort-by")}</Label>
                    <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                      <SelectTrigger id="mobile-sort">
                        <SelectValue placeholder={t("products.sort-by")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">{t("products.sort-latest")}</SelectItem>
                        <SelectItem value="price-asc">{t("products.sort-price-asc")}</SelectItem>
                        <SelectItem value="price-desc">{t("products.sort-price-desc")}</SelectItem>
                        <SelectItem value="rating-desc">{t("products.sort-rating-desc")}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button onClick={() => setIsSheetOpen(false)} className="mt-4 bg-pink-600 hover:bg-pink-700">
                      {t("products.apply-filters")}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="text-xl mb-4">{t("products.no-products-found")}</p>
              <Button variant="outline" onClick={() => setFilters({ category: "all", sortBy: "latest", search: "" })}>
                {t("products.clear-filters")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-0 relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={language === "th" ? product.name : product.name_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.bestseller && (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white">ขายดี</Badge>
                      )}
                      {product.type === "custom" && (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">สั่งทำพิเศษ</Badge>
                      )}
                    </div>
                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="destructive">-{Math.round(product.discount * 100)}%</Badge>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                      {language === "th" ? product.name : product.name_en}
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
                        {product.rating} ({product.reviews_count})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-pink-600">{formatPrice(product.price)}</span>
                      {product.originalPrice && product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
