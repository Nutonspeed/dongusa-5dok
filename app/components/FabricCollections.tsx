"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Palette, Sparkles, Heart } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

interface FabricCollection {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  image: string
  patterns: number
  colors: string[]
  style: string
  style_en: string
  featured: boolean
}

const fabricCollections: FabricCollection[] = [
  {
    id: "modern-minimalist",
    name: "โมเดิร์นมินิมอล",
    name_en: "Modern Minimalist",
    description: "ลายผ้าสไตล์โมเดิร์นที่เน้นความเรียบง่าย เหมาะสำหรับบ้านสมัยใหม่",
    description_en: "Modern fabric patterns emphasizing simplicity, perfect for contemporary homes",
    image: "/modern-minimalist-fabric-pattern-1.png",
    patterns: 12,
    colors: ["#F5F5F5", "#E8E8E8", "#D1D1D1", "#B8B8B8"],
    style: "โมเดิร์น",
    style_en: "Modern",
    featured: true,
  },
  {
    id: "classic-elegant",
    name: "คลาสสิกหรูหรา",
    name_en: "Classic Elegant",
    description: "ลายผ้าคลาสสิกที่ให้ความรู้สึกหรูหราและมีเอกลักษณ์",
    description_en: "Classic fabric patterns that exude luxury and distinctive character",
    image: "/classic-elegant-fabric-pattern-1.png",
    patterns: 18,
    colors: ["#8B4513", "#CD853F", "#DEB887", "#F5DEB3"],
    style: "คลาสสิก",
    style_en: "Classic",
    featured: true,
  },
  {
    id: "bohemian-chic",
    name: "โบฮีเมียนชิค",
    name_en: "Bohemian Chic",
    description: "ลายผ้าสไตล์โบฮีเมียนที่มีสีสันสดใสและลวดลายที่น่าสนใจ",
    description_en: "Bohemian style fabrics with vibrant colors and interesting patterns",
    image: "/bohemian-chic-fabric-pattern-1.png",
    patterns: 15,
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
    style: "โบฮีเมียน",
    style_en: "Bohemian",
    featured: false,
  },
]

export default function FabricCollections() {
  const { language } = useLanguage()
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null)

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Palette className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">
              {language === "th" ? "คอลเลกชันผ้า" : "Fabric Collections"}
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === "th"
              ? "เลือกจากคอลเลกชันผ้าหลากหลายสไตล์ ที่ออกแบบมาเพื่อเข้ากับทุกการตกแต่งบ้าน"
              : "Choose from our diverse fabric collections, designed to complement every home decor style"}
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {fabricCollections.map((collection) => (
            <Card
              key={collection.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              onMouseEnter={() => setHoveredCollection(collection.id)}
              onMouseLeave={() => setHoveredCollection(null)}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-64 overflow-hidden rounded-t-lg">
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={language === "th" ? collection.name : collection.name_en}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {collection.featured && (
                    <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {language === "th" ? "แนะนำ" : "Featured"}
                    </Badge>
                  )}
                  <div className="absolute top-4 right-4">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === "th" ? collection.name : collection.name_en}
                    </h3>
                    <Badge variant="outline">{language === "th" ? collection.style : collection.style_en}</Badge>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">
                    {language === "th" ? collection.description : collection.description_en}
                  </p>

                  {/* Pattern Count */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      {collection.patterns} {language === "th" ? "ลายผ้า" : "patterns"}
                    </span>
                  </div>

                  {/* Color Palette */}
                  <div className="flex items-center mb-4">
                    <span className="text-sm text-gray-500 mr-2">{language === "th" ? "สีหลัก:" : "Main colors:"}</span>
                    <div className="flex space-x-1">
                      {collection.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/fabric-collections/${collection.id}`}>
                    <Button
                      className="w-full group-hover:bg-blue-700 transition-colors"
                      variant={hoveredCollection === collection.id ? "default" : "outline"}
                    >
                      {language === "th" ? "ดูคอลเลกชัน" : "View Collection"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/fabric-collections">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {language === "th" ? "ดูคอลเลกชันทั้งหมด" : "View All Collections"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
