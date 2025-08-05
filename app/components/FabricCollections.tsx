"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Palette, Sparkles, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"

interface Collection {
  id: string
  name: {
    th: string
    en: string
  }
  description: {
    th: string
    en: string
  }
  image: string
  colors: string[]
  productCount: number
  isNew?: boolean
  isPopular?: boolean
  icon: React.ComponentType<{ className?: string }>
}

const collections: Collection[] = [
  {
    id: "classic-elegant",
    name: {
      th: "คลาสสิคเอเลแกนท์",
      en: "Classic Elegant",
    },
    description: {
      th: "ความงามเหนือกาลเวลา เหมาะกับบ้านที่มีสไตล์คลาสสิค",
      en: "Timeless beauty perfect for classic style homes",
    },
    image: "/classic-elegant-fabric-pattern-1.png",
    colors: ["#8B4513", "#D2691E", "#F4A460", "#DEB887"],
    productCount: 12,
    isPopular: true,
    icon: Sparkles,
  },
  {
    id: "modern-minimalist",
    name: {
      th: "โมเดิร์นมินิมอล",
      en: "Modern Minimalist",
    },
    description: {
      th: "เรียบง่าย แต่โดดเด่น เหมาะกับไลฟ์สไตล์สมัยใหม่",
      en: "Simple yet striking, perfect for modern lifestyle",
    },
    image: "/modern-minimalist-fabric-pattern-1.png",
    colors: ["#2F4F4F", "#708090", "#B0C4DE", "#F5F5F5"],
    productCount: 8,
    isNew: true,
    icon: Palette,
  },
  {
    id: "bohemian-chic",
    name: {
      th: "โบฮีเมียนชิค",
      en: "Bohemian Chic",
    },
    description: {
      th: "สีสันสดใส ลวดลายเป็นเอกลักษณ์ เพื่อบ้านที่มีชีวิตชีวา",
      en: "Vibrant colors and unique patterns for lively homes",
    },
    image: "/bohemian-chic-fabric-pattern-1.png",
    colors: ["#CD853F", "#D2691E", "#B22222", "#DAA520"],
    productCount: 15,
    icon: Leaf,
  },
]

export default function FabricCollections() {
  const { language, t } = useLanguage()
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {language === "th" ? "คอลเลกชันผ้า" : "Fabric Collections"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === "th"
              ? "เลือกจากคอลเลกชันผ้าหลากหลายสไตล์ ที่ออกแบบมาเพื่อตอบสนองทุกความต้องการ"
              : "Choose from various fabric collections designed to meet all your needs"}
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => {
            const IconComponent = collection.icon
            return (
              <Card
                key={collection.id}
                className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                onMouseEnter={() => setHoveredCollection(collection.id)}
                onMouseLeave={() => setHoveredCollection(null)}
              >
                <div className="relative">
                  {/* Collection Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={collection.image || "/placeholder.svg"}
                      alt={collection.name[language]}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {collection.isNew && (
                      <Badge className="bg-green-500 text-white">{language === "th" ? "ใหม่" : "New"}</Badge>
                    )}
                    {collection.isPopular && (
                      <Badge className="bg-red-500 text-white">{language === "th" ? "ยอดนิยม" : "Popular"}</Badge>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="absolute top-4 right-4 p-3 bg-white/90 rounded-full">
                    <IconComponent className="w-6 h-6 text-pink-600" />
                  </div>

                  {/* Hover Content */}
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Button variant="secondary" className="w-full bg-white/90 hover:bg-white text-gray-900">
                      {language === "th" ? "ดูคอลเลกชัน" : "View Collection"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Collection Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.name[language]}</h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">{collection.description[language]}</p>

                  {/* Color Palette */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">{language === "th" ? "สีที่มี:" : "Colors:"}</span>
                    <div className="flex gap-1">
                      {collection.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Product Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {collection.productCount} {language === "th" ? "สินค้า" : "products"}
                    </span>
                    <Link
                      href={`/fabric-collections/${collection.id}`}
                      className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1 group/link"
                    >
                      {language === "th" ? "ดูทั้งหมด" : "View All"}
                      <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Link href="/fabric-gallery">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            >
              {language === "th" ? "ดูแกลเลอรี่ผ้าทั้งหมด" : "View Full Fabric Gallery"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
