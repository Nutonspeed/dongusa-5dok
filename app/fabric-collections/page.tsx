"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import { Skeleton } from "@/components/ui/skeleton"

interface Collection {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  image: string
  fabric_types: string[]
  featured_colors: string[]
}

const allCollections: Collection[] = [
  {
    id: "coll-001",
    name: "คอลเลกชันคลาสสิกและสง่างาม",
    name_en: "Classic & Elegant Collection",
    description: "ผ้าคลุมโซฟาที่ให้ความรู้สึกหรูหราเหนือกาลเวลา เหมาะสำหรับบ้านที่ต้องการความสง่างาม",
    description_en: "Timeless and luxurious sofa covers, perfect for homes seeking an elegant touch.",
    image: "/classic-elegant-fabric-pattern-1.png",
    fabric_types: ["cotton", "velvet", "silk"],
    featured_colors: ["#F5F5DC", "#808080", "#000080"],
  },
  {
    id: "coll-002",
    name: "คอลเลกชันโมเดิร์นและมินิมอล",
    name_en: "Modern & Minimalist Collection",
    description: "ดีไซน์เรียบง่ายแต่ทันสมัย เน้นความสะอาดตาและฟังก์ชันการใช้งาน",
    description_en: "Simple yet modern designs, focusing on clean aesthetics and functionality.",
    image: "/modern-minimalist-fabric-pattern-1.png",
    fabric_types: ["linen", "polyester", "blends"],
    featured_colors: ["#FFFFFF", "#000000", "#D3D3D3"],
  },
  {
    id: "coll-003",
    name: "คอลเลกชันโบฮีเมียนและชิค",
    name_en: "Bohemian & Chic Collection",
    description: "เพิ่มความมีชีวิตชีวาและเอกลักษณ์ด้วยลวดลายและสีสันที่ได้รับแรงบันดาลใจจากธรรมชาติ",
    description_en: "Add vibrancy and uniqueness with patterns and colors inspired by nature.",
    image: "/bohemian-chic-fabric-pattern-1.png",
    fabric_types: ["printed cotton", "jute", "macrame"],
    featured_colors: ["#A0522D", "#D2B48C", "#8B4513"],
  },
  {
    id: "coll-004",
    name: "คอลเลกชันประสิทธิภาพสูง",
    name_en: "High-Performance Collection",
    description: "ผ้าที่ทนทานต่อคราบ, น้ำ, และการใช้งานหนัก เหมาะสำหรับครอบครัวที่มีชีวิตชีวา",
    description_en: "Stain, water, and heavy-duty resistant fabrics, ideal for lively households.",
    image: "/modern-minimalist-fabric-pattern-2.png",
    fabric_types: ["performance fabric", "microfiber"],
    featured_colors: ["#4682B4", "#6A5ACD", "#2F4F4F"],
  },
]

export default function FabricCollectionsPage() {
  const { language, t } = useLanguage()
  const [collections, setCollections] = useState<Collection[]>(allCollections)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setCollections(allCollections)
      setLoading(false)
    }, 500)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t("fabric-collections.title")}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
            {t("fabric-collections.subtitle")}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-64" />
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <Card key={collection.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-0 relative">
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={collection.image || "/placeholder.svg"}
                        alt={language === "th" ? collection.name : collection.name_en}
                        width={600}
                        height={337}
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">
                        {language === "th" ? collection.name : collection.name_en}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {language === "th" ? collection.description : collection.description_en}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {collection.featured_colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        ></div>
                      ))}
                    </div>
                    <Button asChild variant="outline" className="w-full bg-transparent hover:bg-gray-100">
                      <Link href={`/fabric-gallery?type=${collection.fabric_types[0]}`}>
                        {t("fabric-collections.view-collection")}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
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
