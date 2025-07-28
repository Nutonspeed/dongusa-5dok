"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../../contexts/LanguageContext"
import { useCart } from "../../contexts/CartContext"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

// Mock product data (in real app, this would come from API)
const productData = {
  "1": {
    id: "1",
    name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    nameEn: "Premium Velvet Sofa Cover",
    price: 2299,
    originalPrice: 2899,
    images: [
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+1",
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+2",
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+3",
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+4",
    ],
    category: "premium",
    rating: 4.8,
    reviews: 124,
    colors: [
      { name: "Navy", nameEn: "Navy", value: "#1e3a8a" },
      { name: "เทา", nameEn: "Gray", value: "#6b7280" },
      { name: "เบจ", nameEn: "Beige", value: "#d2b48c" },
    ],
    sizes: [
      { name: "1 ที่นั่ง", nameEn: "1-seat", price: 2299 },
      { name: "2 ที่นั่ง", nameEn: "2-seat", price: 2799 },
      { name: "3 ที่นั่ง", nameEn: "3-seat", price: 3299 },
    ],
    description: {
      th: "ผ้าคลุมโซฟากำมะหยี่พรีเมียมที่ให้ความนุ่มสบายและหรูหรา ทำจากเส้นใยคุณภาพสูง ทนทานต่อการใช้งาน ง่ายต่อการดูแลรักษา",
      en: "Premium velvet sofa cover that provides comfort and luxury. Made from high-quality fibers, durable and easy to maintain.",
    },
    features: {
      th: [
        "ผ้ากำมะหยี่คุณภาพพรีเมียม",
        "ยืดหยุ่นได้ดี พอดีกับโซฟาทุกรูปทรง",
        "ป้องกันรอยขีดข่วนและคราบสกปรก",
        "ซักเครื่องได้ ง่ายต่อการดูแล",
        "สีไม่ตก ไม่ซีด",
      ],
      en: [
        "Premium quality velvet fabric",
        "Highly stretchable, fits all sofa shapes",
        "Protects against scratches and stains",
        "Machine washable, easy to care",
        "Colorfast, fade-resistant",
      ],
    },
    specifications: {
      material: { th: "กำมะหยี่ 95% โพลีเอสเตอร์ 5% สแปนเด็กซ์", en: "95% Polyester Velvet, 5% Spandex" },
      care: { th: "ซักเครื่องน้ำเย็น ห้ามฟอกขาว", en: "Machine wash cold, do not bleach" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 1 ปี", en: "1 Year Warranty" },
    },
    bestseller: true,
    discount: 21,
    inStock: true,
  },
}

export default function ProductDetailPage() {
  const params = useParams()
  const { language, t } = useLanguage()
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const product = productData[params.id as keyof typeof productData]

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
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      name: `${language === "th" ? product.name : product.nameEn} - ${
        product.colors[selectedColor][language === "th" ? "name" : "nameEn"]
      } - ${product.sizes[selectedSize][language === "th" ? "name" : "nameEn"]}`,
      price: product.sizes[selectedSize].price,
      image: product.images[0],
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

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
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={language === "th" ? product.name : product.nameEn}
                className="w-full h-full object-cover"
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
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
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
              {product.discount > 0 && <Badge variant="destructive">-{product.discount}%</Badge>}
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
              <span className="text-3xl font-bold text-pink-600">{formatPrice(product.sizes[selectedSize].price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description[language]}</p>

            {/* Color Selection */}
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

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                {language === "th" ? "ขนาด" : "Size"}:{" "}
                {product.sizes[selectedSize][language === "th" ? "name" : "nameEn"]}
              </h3>
              <div className="grid grid-cols-3 gap-2">
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

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{language === "th" ? "จำนวน" : "Quantity"}</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {language === "th" ? "เพิ่มลงตะกร้า" : "Add to Cart"}
              </Button>
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
                <span className="text-sm text-gray-600">{language === "th" ? "รับประกัน 1 ปี" : "1 Year Warranty"}</span>
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
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                <button className="py-4 border-b-2 border-pink-500 text-pink-600 font-medium">
                  {language === "th" ? "รายละเอียด" : "Details"}
                </button>
                <button className="py-4 text-gray-500 hover:text-gray-700">
                  {language === "th" ? "คุณสมบัติ" : "Features"}
                </button>
                <button className="py-4 text-gray-500 hover:text-gray-700">
                  {language === "th" ? "รีวิว" : "Reviews"}
                </button>
              </nav>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {language === "th" ? "คุณสมบัติเด่น" : "Key Features"}
                  </h3>
                  <ul className="space-y-2">
                    {product.features[language].map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {language === "th" ? "ข้อมูลจำเพาะ" : "Specifications"}
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{language === "th" ? "วัสดุ" : "Material"}</dt>
                      <dd className="text-gray-900">{product.specifications.material[language]}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        {language === "th" ? "การดูแล" : "Care Instructions"}
                      </dt>
                      <dd className="text-gray-900">{product.specifications.care[language]}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{language === "th" ? "แหล่งผลิต" : "Origin"}</dt>
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
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-pink-600 to-rose-700 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">{language === "th" ? "ต้องการคำปรึกษา?" : "Need Consultation?"}</h3>
          <p className="mb-6">
            {language === "th"
              ? "ทีมผู้เชี่ยวชาญพร้อมให้คำแนะนำเรื่องการเลือกผ้าคลุมโซฟาที่เหมาะสม"
              : "Our expert team is ready to help you choose the perfect sofa cover"}
          </p>
          <Button
            onClick={() => {
              const message = `สวัสดีครับ/ค่ะ! ผมสนใจสินค้า "${product.name}" ช่วยให้คำแนะนำเพิ่มเติมได้ไหมครับ/ค่ะ?`
              const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
              window.open(facebookUrl, "_blank")
            }}
            className="bg-white text-pink-600 hover:bg-gray-100"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {language === "th" ? "แชทใน Facebook" : "Chat on Facebook"}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
