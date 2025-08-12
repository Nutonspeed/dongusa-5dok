"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "../../contexts/LanguageContext"
import { useCart } from "../../contexts/CartContext"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { getProductById, getRelatedProducts } from "../../../lib/mock-products"

export default function ProductDetailPage() {
  const params = useParams()
  const { language } = useLanguage()
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const product = getProductById(params.id as string)
  const relatedProducts = getRelatedProducts(params.id as string, 4)

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === "th" ? "ไม่พบสินค้า" : "Product not found"}
          </h1>
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "th" ? "กลับไปหน้าสินค้า" : "Back to Products"}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    if (product.type === "fixed") {
      const finalPrice = product.sizes ? product.sizes[selectedSize].price : product.price!
      const colorName = product.colors ? product.colors[selectedColor][language === "th" ? "name" : "nameEn"] : ""
      const sizeName = product.sizes ? product.sizes[selectedSize][language === "th" ? "name" : "nameEn"] : ""

      addItem({
        id: `${product.id}-${selectedColor}-${selectedSize}`,
        name: `${language === "th" ? product.name : product.nameEn}${colorName ? ` - ${colorName}` : ""}${sizeName ? ` - ${sizeName}` : ""}`,
        price: finalPrice,
        image: product.images[0],
        quantity: quantity,
        color: colorName,
        size: sizeName,
      })
    }
  }

  const handleGetQuote = () => {
    const message =
      language === "th"
        ? `สวัสดีครับ/ค่ะ! ผมสนใจ "${product.name}" ช่วยให้คำแนะนำเพิ่มเติมได้ไหมครับ/ค่ะ?`
        : `Hello! I'm interested in "${product.nameEn}". Could you provide more information?`

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const currentPrice =
    product.type === "fixed" ? (product.sizes ? product.sizes[selectedSize].price : product.price!) : product.basePrice!

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-pink-600">
            {language === "th" ? "หน้าแรก" : "Home"}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-pink-600">
            {language === "th" ? "สินค้า" : "Products"}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{language === "th" ? product.name : product.nameEn}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <Image
                src={
                  product.images[selectedImage] ||
                  "/placeholder.svg?height=600&width=600&query=sofa cover product main image"
                }
                alt={language === "th" ? product.name : product.nameEn}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-pink-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg?height=150&width=150&query=sofa cover product thumbnail"}
                    alt={`Product ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                    sizes="150px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex space-x-2">
              {product.bestseller && (
                <Badge className="bg-pink-600 text-white">{language === "th" ? "ขายดี" : "Bestseller"}</Badge>
              )}
              {product.discount && <Badge variant="destructive">-{product.discount}%</Badge>}
              {product.type === "custom" && (
                <Badge className="bg-blue-600 text-white">{language === "th" ? "ราคาตามขนาด" : "Custom Price"}</Badge>
              )}
            </div>

            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === "th" ? product.name : product.nameEn}
              </h1>
              <div className="flex items-center space-x-2">
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
                  {product.rating} ({product.reviews} {language === "th" ? "รีวิว" : "reviews"})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              {product.type === "custom" ? (
                <div>
                  <span className="text-3xl font-bold text-pink-600">
                    {formatPrice(product.priceRange!.min)} - {formatPrice(product.priceRange!.max)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === "th" ? "ราคาขึ้นอยู่กับขนาดโซฟา" : "Price depends on sofa size"}
                  </p>
                </div>
              ) : (
                <span className="text-3xl font-bold text-pink-600">{formatPrice(currentPrice)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description[language]}</p>

            {/* Color Selection */}
            {product.colors && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === "th" ? "สี" : "Color"}:{" "}
                  {product.colors[selectedColor][language === "th" ? "name" : "nameEn"]}
                </h3>
                <div className="flex space-x-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-8 h-8 rounded-full border-2 transition-colors ${
                        selectedColor === index ? "border-pink-500 ring-2 ring-pink-200" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color[language === "th" ? "name" : "nameEn"]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === "th" ? "ขนาด" : "Size"}:{" "}
                  {product.sizes[selectedSize][language === "th" ? "name" : "nameEn"]}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(index)}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        selectedSize === index
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div>{size[language === "th" ? "name" : "nameEn"]}</div>
                      <div className="text-xs text-gray-500">{formatPrice(size.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.type === "fixed" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{language === "th" ? "จำนวน" : "Quantity"}</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {product.type === "fixed" ? (
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {language === "th" ? "เพิ่มลงตะกร้า" : "Add to Cart"}
                </Button>
              ) : (
                <Button
                  onClick={handleGetQuote}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {language === "th" ? "ขอใบเสนอราคา" : "Get Quote"}
                </Button>
              )}
              <Button variant="outline" size="lg" className="px-6 bg-transparent">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-pink-600" />
                <span className="text-sm text-gray-600">{language === "th" ? "จัดส่งฟรี" : "Free Shipping"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-pink-600" />
                <span className="text-sm text-gray-600">
                  {product.specifications?.warranty[language] || (language === "th" ? "รับประกัน" : "Warranty")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-pink-600" />
                <span className="text-sm text-gray-600">{language === "th" ? "คืนได้ 30 วัน" : "30-Day Returns"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">{language === "th" ? "รายละเอียด" : "Details"}</TabsTrigger>
              <TabsTrigger value="features">{language === "th" ? "คุณสมบัติ" : "Features"}</TabsTrigger>
              <TabsTrigger value="reviews">{language === "th" ? "รีวิว" : "Reviews"}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {language === "th" ? "รายละเอียดสินค้า" : "Product Details"}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{product.description[language]}</p>
                    </div>

                    {product.specifications && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">
                          {language === "th" ? "ข้อมูลจำเพาะ" : "Specifications"}
                        </h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              {language === "th" ? "วัสดุ" : "Material"}
                            </dt>
                            <dd className="text-gray-900">{product.specifications.material[language]}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              {language === "th" ? "การดูแล" : "Care Instructions"}
                            </dt>
                            <dd className="text-gray-900">{product.specifications.care[language]}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              {language === "th" ? "แหล่งผลิต" : "Origin"}
                            </dt>
                            <dd className="text-gray-900">{product.specifications.origin[language]}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              {language === "th" ? "การรับประกัน" : "Warranty"}
                            </dt>
                            <dd className="text-gray-900">{product.specifications.warranty[language]}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {product.features && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {language === "th" ? "คุณสมบัติเด่น" : "Key Features"}
                      </h3>
                      <ul className="space-y-3">
                        {product.features[language].map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === "th" ? "รีวิวจากลูกค้า" : "Customer Reviews"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {language === "th"
                        ? `คะแนนเฉลี่ย ${product.rating}/5 จาก ${product.reviews} รีวิว`
                        : `Average rating ${product.rating}/5 from ${product.reviews} reviews`}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {language === "th"
                        ? "รีวิวจะแสดงหลังจากลูกค้าได้รับสินค้าแล้ว"
                        : "Reviews will be displayed after customers receive their products"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {language === "th" ? "สินค้าที่เกี่ยวข้อง" : "Related Products"}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      <Image
                        src={
                          relatedProduct.images[0] ||
                          "/placeholder.svg?height=300&width=300&query=related sofa cover product"
                        }
                        alt={language === "th" ? relatedProduct.name : relatedProduct.nameEn}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {language === "th" ? relatedProduct.name : relatedProduct.nameEn}
                      </h3>
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(relatedProduct.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({relatedProduct.reviews})</span>
                      </div>
                      <p className="text-sm font-bold text-pink-600">
                        {relatedProduct.type === "custom"
                          ? `${formatPrice(relatedProduct.priceRange!.min)} - ${formatPrice(relatedProduct.priceRange!.max)}`
                          : formatPrice(relatedProduct.price!)}
                      </p>
                      <Link href={`/products/${relatedProduct.id}`}>
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                        >
                          {language === "th" ? "ดูรายละเอียด" : "View Details"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-pink-600 to-rose-700 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">{language === "th" ? "ต้องการคำปรึกษา?" : "Need Consultation?"}</h3>
          <p className="mb-6">
            {language === "th"
              ? "ทีมผู้เชี่ยวชาญพร้อมให้คำแนะนำเรื่องการเลือกผ้าคลุมโซฟาที่เหมาะสม"
              : "Our expert team is ready to help you choose the perfect sofa cover"}
          </p>
          <Button onClick={handleGetQuote} className="bg-white text-pink-600 hover:bg-gray-100">
            <MessageCircle className="w-5 h-5 mr-2" />
            {language === "th" ? "แชทใน Facebook" : "Chat on Facebook"}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
