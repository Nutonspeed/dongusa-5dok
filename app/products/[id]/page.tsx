"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Minus, Plus, Heart, CheckCircle } from "lucide-react"
import { useCart } from "@/app/contexts/CartContext"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for a single product (replace with actual API call later)
const mockProductDetail = {
  "prod-001": {
    id: "prod-001",
    name: "ผ้าคลุมโซฟา 3 ที่นั่ง - คลาสสิค",
    name_en: "3-Seater Sofa Cover - Classic",
    description: "ผ้าคลุมโซฟาคุณภาพสูง ทำจากผ้าคอตตอน 100% ให้สัมผัสที่นุ่มสบายและทนทาน เหมาะสำหรับโซฟา 3 ที่นั่งทุกสไตล์",
    description_en:
      "High-quality sofa cover made from 100% cotton, offering a soft and durable feel. Perfect for all 3-seater sofa styles.",
    category: "covers",
    type: "fixed",
    price: 2490,
    originalPrice: 3200,
    images: [
      "/classic-elegant-fabric-pattern-1.png",
      "/classic-elegant-fabric-pattern-2.png",
      "/classic-elegant-fabric-pattern-3.png",
      "/classic-elegant-fabric-pattern-4.png",
    ],
    colors: [
      { name: "เบจ", name_en: "Beige", value: "#F5F5DC" },
      { name: "เทา", name_en: "Gray", value: "#808080" },
      { name: "น้ำเงิน", name_en: "Navy", value: "#000080" },
      { name: "เขียวมิ้นต์", name_en: "Mint Green", value: "#98FF98" },
    ],
    sizes: [
      { name: "S", name_en: "S", price: 0 },
      { name: "M", name_en: "M", price: 100 },
      { name: "L", name_en: "L", price: 200 },
    ],
    features: {
      th: ["กันน้ำ", "ซักได้", "ป้องกันขนสัตว์", "ติดตั้งง่าย", "ระบายอากาศดี"],
      en: ["Waterproof", "Washable", "Pet-friendly", "Easy installation", "Breathable"],
    },
    specifications: {
      material: { th: "ผ้าคอตตอน 100%", en: "100% Cotton" },
      care: { th: "ซักเครื่องได้ที่อุณหภูมิ 30°C", en: "Machine washable at 30°C" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 1 ปี", en: "1 Year warranty" },
    },
    stock: 25,
    status: "active",
    rating: 4.8,
    reviews_count: 156,
    sold_count: 89,
    bestseller: true,
    discount: 0.22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "prod-002": {
    id: "prod-002",
    name: "ผ้าคลุมโซฟา 2 ที่นั่ง - โมเดิร์น",
    name_en: "2-Seater Sofa Cover - Modern",
    description: "ผ้าคลุมโซฟาสไตล์โมเดิร์น เหมาะกับบ้านสมัยใหม่ ให้ความรู้สึกเรียบง่ายแต่หรูหรา",
    description_en: "Modern style sofa cover perfect for contemporary homes, offering a simple yet elegant feel.",
    category: "covers",
    type: "fixed",
    price: 1990,
    originalPrice: 2500,
    images: [
      "/modern-minimalist-fabric-pattern-1.png",
      "/modern-minimalist-fabric-pattern-2.png",
      "/modern-minimalist-fabric-pattern-3.png",
    ],
    colors: [
      { name: "ขาว", name_en: "White", value: "#FFFFFF" },
      { name: "ดำ", name_en: "Black", value: "#000000" },
      { name: "เทาอ่อน", name_en: "Light Gray", value: "#D3D3D3" },
    ],
    features: {
      th: ["ยืดหยุ่น", "ระบายอากาศดี", "ต้านคราบ", "แห้งเร็ว"],
      en: ["Stretchable", "Breathable", "Stain resistant", "Quick dry"],
    },
    specifications: {
      material: { th: "ผ้าโพลีเอสเตอร์", en: "Polyester blend" },
      care: { th: "ซักเครื่องได้ 30°C", en: "Machine wash 30°C" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 6 เดือน", en: "6 Months warranty" },
    },
    stock: 15,
    status: "active",
    rating: 4.7,
    reviews_count: 89,
    sold_count: 67,
    bestseller: false,
    discount: 0.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Add more mock products as needed
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { language, t } = useLanguage()
  const [product, setProduct] = useState<(typeof mockProductDetail)[keyof typeof mockProductDetail] | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [mainImage, setMainImage] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const foundProduct = mockProductDetail[id as keyof typeof mockProductDetail]
        if (foundProduct) {
          setProduct(foundProduct)
          setMainImage(foundProduct.images[0]) // Set first image as main
          setSelectedColor(foundProduct.colors[0]?.value || null) // Select first color by default
          setSelectedSize(foundProduct.sizes?.[0]?.name || null) // Select first size by default
        } else {
          // Handle product not found
          console.error("Product not found")
        }
        setLoading(false)
      }, 500)
    }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    const itemToAdd = {
      id: product.id,
      name: language === "th" ? product.name : product.name_en,
      price: product.price + (product.sizes?.find((s) => s.name === selectedSize)?.price || 0),
      image: product.images[0],
      quantity: quantity,
      color: selectedColor ? product.colors.find((c) => c.value === selectedColor)?.name : undefined,
      size: selectedSize || undefined,
    }
    addItem(itemToAdd)
    toast.success(t("product-detail.added-to-cart"))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const currentPrice = product ? product.price + (product.sizes?.find((s) => s.name === selectedSize)?.price || 0) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Gallery Skeleton */}
              <div>
                <Skeleton className="w-full h-[400px] rounded-lg mb-4" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <Skeleton className="h-10 w-32 mb-4" /> {/* Price */}
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-12 w-full mb-4" /> {/* Add to Cart */}
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-16 text-center text-gray-600">
          <h1 className="text-2xl font-bold mb-4">{t("product-detail.not-found")}</h1>
          <p>{t("product-detail.not-found-message")}</p>
          <Button asChild className="mt-6 bg-pink-600 hover:bg-pink-700">
            <Link href="/products">{t("product-detail.back-to-products")}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image Gallery */}
            <div>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
                <Image
                  src={mainImage || product.images[0] || "/placeholder.svg"}
                  alt={language === "th" ? product.name : product.name_en}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      mainImage === img ? "border-pink-600" : "border-transparent"
                    } hover:border-pink-400 transition-colors`}
                    onClick={() => setMainImage(img)}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${language === "th" ? product.name : product.name_en} - ${index + 1}`}
                      width={80}
                      height={80}
                      objectFit="cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {language === "th" ? product.name : product.name_en}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews_count} {t("product-detail.reviews")})
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {language === "th" ? product.description : product.description_en}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl font-bold text-pink-600">{formatPrice(currentPrice)}</span>
                {product.originalPrice && product.discount > 0 && (
                  <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                )}
                {product.discount > 0 && (
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    -{Math.round(product.discount * 100)}%
                  </Badge>
                )}
              </div>

              {/* Options: Color */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {t("product-detail.color")}:{" "}
                    {selectedColor
                      ? language === "th"
                        ? product.colors.find((c) => c.value === selectedColor)?.name
                        : product.colors.find((c) => c.value === selectedColor)?.name_en
                      : ""}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color.value ? "border-pink-600 ring-2 ring-pink-300" : "border-gray-300"
                        } transition-all duration-200`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                        aria-label={language === "th" ? color.name : color.name_en}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Options: Size */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {t("product-detail.size")}: {selectedSize}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <Button
                        key={size.name}
                        variant={selectedSize === size.name ? "default" : "outline"}
                        className={
                          selectedSize === size.name
                            ? "bg-pink-600 hover:bg-pink-700 text-white"
                            : "bg-white hover:bg-gray-100"
                        }
                        onClick={() => setSelectedSize(size.name)}
                      >
                        {language === "th" ? size.name : size.name_en}{" "}
                        {size.price > 0 && `(+${formatPrice(size.price)})`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <h3 className="font-semibold text-gray-800">{t("product-detail.quantity")}:</h3>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-r-none"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-l-none"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <Button
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-lg py-3"
                  onClick={handleAddToCart}
                  disabled={
                    product.stock === 0 ||
                    (product.colors.length > 0 && !selectedColor) ||
                    (product.sizes && product.sizes.length > 0 && !selectedSize)
                  }
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? t("product-detail.out-of-stock") : t("product-detail.add-to-cart")}
                </Button>
                <Button variant="outline" size="lg" className="w-12 h-12 p-0 bg-transparent">
                  <Heart className="w-6 h-6 text-gray-600" />
                </Button>
              </div>

              {/* Product Features */}
              <Card className="mb-6 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">{t("product-detail.features")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                    {(language === "th" ? product.features.th : product.features.en).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Product Specifications */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {t("product-detail.specifications")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <p className="font-semibold">{t("product-detail.material")}:</p>
                      <p>
                        {language === "th" ? product.specifications.material.th : product.specifications.material.en}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">{t("product-detail.care")}:</p>
                      <p>{language === "th" ? product.specifications.care.th : product.specifications.care.en}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{t("product-detail.origin")}:</p>
                      <p>{language === "th" ? product.specifications.origin.th : product.specifications.origin.en}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{t("product-detail.warranty")}:</p>
                      <p>
                        {language === "th" ? product.specifications.warranty.th : product.specifications.warranty.en}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
