"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Palette, Sparkles, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"

interface Collection {
  id: string
  name: {
    en: string
    th: string
  }
  description: {
    en: string
    th: string
  }
  image: string
  fabricCount: number
  priceRange: {
    min: number
    max: number
  }
  style: string
  isPopular?: boolean
  isNew?: boolean
}

const collections: Collection[] = [
  {
    id: "modern-minimalist",
    name: {
      en: "Modern Minimalist",
      th: "โมเดิร์นมินิมอล",
    },
    description: {
      en: "Clean, simple designs with neutral colors perfect for contemporary homes",
      th: "การออกแบบที่เรียบง่าย สะอาดตา พร้อมสีโทนนิวทรัลที่เหมาะกับบ้านสมัยใหม่",
    },
    image: "/modern-minimalist-fabric-pattern-1.png",
    fabricCount: 45,
    priceRange: { min: 1990, max: 3490 },
    style: "Modern",
    isPopular: true,
  },
  {
    id: "classic-elegant",
    name: {
      en: "Classic Elegant",
      th: "คลาสสิกหรูหรา",
    },
    description: {
      en: "Timeless patterns and rich textures that bring sophistication to any room",
      th: "ลายคลาสสิกและเนื้อผ้าที่หรูหรา นำความประณีตมาสู่ห้องใดก็ได้",
    },
    image: "/classic-elegant-fabric-pattern-1.png",
    fabricCount: 38,
    priceRange: { min: 2490, max: 4990 },
    style: "Classic",
    isNew: true,
  },
  {
    id: "bohemian-chic",
    name: {
      en: "Bohemian Chic",
      th: "โบฮีเมียนชิค",
    },
    description: {
      en: "Vibrant colors and eclectic patterns for free-spirited living spaces",
      th: "สีสันสดใสและลายผสมผสานสำหรับพื้นที่นั่งเล่นที่เป็นอิสระ",
    },
    image: "/bohemian-chic-fabric-pattern-1.png",
    fabricCount: 52,
    priceRange: { min: 2190, max: 3990 },
    style: "Bohemian",
    isPopular: true,
  },
  {
    id: "luxury-premium",
    name: {
      en: "Luxury Premium",
      th: "ลักชูรี่พรีเมียม",
    },
    description: {
      en: "High-end materials and exclusive designs for the most discerning customers",
      th: "วัสดุชั้นสูงและการออกแบบพิเศษสำหรับลูกค้าที่เลือกสรร",
    },
    image: "/modern-minimalist-fabric-pattern-2.png",
    fabricCount: 28,
    priceRange: { min: 3990, max: 7990 },
    style: "Luxury",
    isNew: true,
  },
]

export default function FabricCollections() {
  const { language } = useLanguage()
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleExploreCollection = (collection: Collection) => {
    const message =
      language === "th"
        ? `สวัสดีครับ/ค่ะ! สนใจดูคอลเลกชัน "${collection.name.th}" 

รายละเอียด: ${collection.description.th}
จำนวนผ้า: ${collection.fabricCount} แบบ
ช่วงราคา: ${formatPrice(collection.priceRange.min)} - ${formatPrice(collection.priceRange.max)}

ต้องการดูตัวอย่างผ้าและรายละเอียดเพิ่มเติมครับ/ค่ะ`
        : `Hi! I'm interested in the "${collection.name.en}" collection.

Details: ${collection.description.en}
Fabric options: ${collection.fabricCount} designs
Price range: ${formatPrice(collection.priceRange.min)} - ${formatPrice(collection.priceRange.max)}

I'd like to see fabric samples and more details.`

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <section className="py-16 bg-gradient-to-br from-accent to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {language === "en" ? "Fabric Collections" : "คอลเลกชันผ้า"}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Explore our curated collections of premium fabrics, each designed to match different styles and preferences."
              : "สำรวจคอลเลกชันผ้าพรีเมียมที่คัดสรรมาแล้ว แต่ละคอลเลกชันออกแบบมาเพื่อตอบสนองสไตล์และความชอบที่แตกต่างกัน"}
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer burgundy-shadow"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name[language]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {collection.isNew && (
                    <Badge className="bg-green-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {language === "en" ? "New" : "ใหม่"}
                    </Badge>
                  )}
                  {collection.isPopular && (
                    <Badge className="bg-primary text-white">
                      <Heart className="w-3 h-3 mr-1" />
                      {language === "en" ? "Popular" : "ยอดนิยม"}
                    </Badge>
                  )}
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      {collection.style}
                    </span>
                    <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      {collection.fabricCount} {language === "en" ? "fabrics" : "ผ้า"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{collection.name[language]}</h3>
                  <p className="text-white/90 text-sm mb-4 line-clamp-2">{collection.description[language]}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      {formatPrice(collection.priceRange.min)} - {formatPrice(collection.priceRange.max)}
                    </div>
                  </div>
                </div>

                {/* Hover Action */}
                <div
                  className={`absolute inset-0 bg-primary/90 flex items-center justify-center transition-opacity duration-300 ${
                    hoveredCollection === collection.id ? "opacity-100" : "opacity-0"
                  }`}
                  onMouseEnter={() => setHoveredCollection(collection.id)}
                  onMouseLeave={() => setHoveredCollection(null)}
                >
                  <div className="text-center text-white">
                    <Palette className="w-12 h-12 mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">
                      {language === "en" ? "Explore Collection" : "สำรวจคอลเลกชัน"}
                    </h4>
                    <p className="text-white/90 mb-4">
                      {language === "en" ? "View all fabric options" : "ดูตัวเลือกผ้าทั้งหมด"}
                    </p>
                    <Button
                      onClick={() => handleExploreCollection(collection)}
                      className="bg-white text-primary hover:bg-gray-100"
                    >
                      {language === "en" ? "View Details" : "ดูรายละเอียด"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-white rounded-2xl p-8 burgundy-shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Can't Find What You're Looking For?" : "หาสิ่งที่คุณต้องการไม่เจอ?"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {language === "en"
              ? "We have over 1,000 fabric options available. Contact us for a personalized consultation and fabric samples."
              : "เรามีตัวเลือกผ้ามากกว่า 1,000 แบบ ติดต่อเราเพื่อรับคำปรึกษาส่วนตัวและตัวอย่างผ้า"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fabric-gallery">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4">
                {language === "en" ? "Browse All Fabrics" : "ดูผ้าทั้งหมด"}
                <Palette className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 bg-transparent border-primary text-primary hover:bg-accent"
              onClick={() => {
                const message =
                  language === "th"
                    ? "สวัสดีครับ/ค่ะ! ต้องการปรึกษาเรื่องการเลือกผ้าและขอดูตัวอย่างผ้าครับ/ค่ะ"
                    : "Hi! I'd like to consult about fabric selection and request fabric samples."

                const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                window.open(facebookUrl, "_blank")
              }}
            >
              {language === "en" ? "Request Samples" : "ขอตัวอย่างผ้า"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
