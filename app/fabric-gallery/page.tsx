"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import { Skeleton } from "@/components/ui/skeleton"

interface Fabric {
  id: string
  name: string
  name_en: string
  type: string // e.g., "cotton", "velvet", "linen"
  color: string // hex code or color name
  image: string
  description: string
  description_en: string
}

const allFabrics: Fabric[] = [
  {
    id: "fab-001",
    name: "ผ้าคอตตอนผสม - สีเบจ",
    name_en: "Cotton Blend - Beige",
    type: "cotton",
    color: "#F5F5DC",
    image: "/classic-elegant-fabric-pattern-1.png",
    description: "ผ้าคอตตอนผสมคุณภาพดี ให้สัมผัสที่นุ่มสบายและระบายอากาศได้ดี เหมาะสำหรับใช้งานทั่วไป",
    description_en: "High-quality cotton blend fabric, soft and breathable, suitable for general use.",
  },
  {
    id: "fab-002",
    name: "ผ้ากำมะหยี่ - สีน้ำเงินเข้ม",
    name_en: "Velvet - Navy Blue",
    type: "velvet",
    color: "#000080",
    image: "/classic-elegant-fabric-pattern-2.png",
    description: "ผ้ากำมะหยี่เนื้อนุ่ม ให้ความรู้สึกหรูหราและอบอุ่น เหมาะสำหรับโซฟาที่ต้องการความโดดเด่น",
    description_en:
      "Soft velvet fabric, offering a luxurious and warm feel. Ideal for sofas that need a distinctive look.",
  },
  {
    id: "fab-003",
    name: "ผ้าลินิน - สีเทาอ่อน",
    name_en: "Linen - Light Gray",
    type: "linen",
    color: "#D3D3D3",
    image: "/modern-minimalist-fabric-pattern-1.png",
    description: "ผ้าลินินธรรมชาติ ให้ความรู้สึกเย็นสบายและมีสไตล์ เหมาะสำหรับบ้านสไตล์มินิมอล",
    description_en: "Natural linen fabric, providing a cool and stylish feel. Perfect for minimalist home decor.",
  },
  {
    id: "fab-004",
    name: "ผ้าประสิทธิภาพสูง - สีเทาเข้ม",
    name_en: "Performance Fabric - Dark Gray",
    type: "performance",
    color: "#36454F",
    image: "/modern-minimalist-fabric-pattern-2.png",
    description: "ผ้าที่ทนทานต่อคราบและรอยขีดข่วน ทำความสะอาดง่าย เหมาะสำหรับบ้านที่มีเด็กหรือสัตว์เลี้ยง",
    description_en: "Stain and scratch resistant fabric, easy to clean. Ideal for homes with children or pets.",
  },
  {
    id: "fab-005",
    name: "ผ้าฝ้ายพิมพ์ลาย - ลายโบฮีเมียน",
    name_en: "Printed Cotton - Bohemian Pattern",
    type: "cotton",
    color: "#A0522D", // Example dominant color
    image: "/bohemian-chic-fabric-pattern-1.png",
    description: "ผ้าฝ้ายพิมพ์ลายสไตล์โบฮีเมียน เพิ่มความมีชีวิตชีวาและเอกลักษณ์ให้กับพื้นที่ของคุณ",
    description_en: "Bohemian printed cotton fabric, adding vibrancy and uniqueness to your space.",
  },
  {
    id: "fab-006",
    name: "ผ้าไหมเทียม - สีทอง",
    name_en: "Faux Silk - Gold",
    type: "faux-silk",
    color: "#FFD700",
    image: "/gold-faux-silk.png",
    description: "ผ้าไหมเทียมเนื้อเงา ให้ความรู้สึกหรูหราและสง่างาม เหมาะสำหรับห้องที่ต้องการความพิเศษ",
    description_en:
      "Shiny faux silk fabric, offering a luxurious and elegant feel. Perfect for rooms desiring a special touch.",
  },
]

export default function FabricGalleryPage() {
  const { language, t } = useLanguage()
  const [fabrics, setFabrics] = useState<Fabric[]>(allFabrics)
  const [filters, setFilters] = useState({
    type: "all",
    search: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    let filteredFabrics = allFabrics

    if (filters.type !== "all") {
      filteredFabrics = filteredFabrics.filter((f) => f.type === filters.type)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredFabrics = filteredFabrics.filter(
        (f) =>
          f.name.toLowerCase().includes(searchTerm) ||
          f.name_en.toLowerCase().includes(searchTerm) ||
          f.description.toLowerCase().includes(searchTerm) ||
          f.description_en.toLowerCase().includes(searchTerm),
      )
    }

    setTimeout(() => {
      // Simulate API call delay
      setFabrics(filteredFabrics)
      setLoading(false)
    }, 500)
  }, [filters])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t("fabric-gallery.title")}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">{t("fabric-gallery.subtitle")}</p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex-1 w-full md:w-auto">
              <Input
                placeholder={t("fabric-gallery.search-placeholder")}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t("fabric-gallery.filter-type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("fabric-gallery.type-all")}</SelectItem>
                <SelectItem value="cotton">{t("fabric-gallery.type-cotton")}</SelectItem>
                <SelectItem value="velvet">{t("fabric-gallery.type-velvet")}</SelectItem>
                <SelectItem value="linen">{t("fabric-gallery.type-linen")}</SelectItem>
                <SelectItem value="performance">{t("fabric-gallery.type-performance")}</SelectItem>
                <SelectItem value="faux-silk">{t("fabric-gallery.type-faux-silk")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fabric Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : fabrics.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="text-xl mb-4">{t("fabric-gallery.no-fabrics-found")}</p>
              <Button variant="outline" onClick={() => setFilters({ type: "all", search: "" })}>
                {t("fabric-gallery.clear-filters")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {fabrics.map((fabric) => (
                <Card key={fabric.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-0 relative">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={fabric.image || "/placeholder.svg"}
                        alt={language === "th" ? fabric.name : fabric.name_en}
                        width={400}
                        height={400}
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div
                      className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: fabric.color }}
                      title={language === "th" ? fabric.name : fabric.name_en}
                    ></div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {language === "th" ? fabric.name : fabric.name_en}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {language === "th" ? fabric.description : fabric.description_en}
                    </p>
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
