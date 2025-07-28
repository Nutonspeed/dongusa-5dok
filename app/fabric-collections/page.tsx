"use client"

import { useState } from "react"
import { Search, Filter, Grid, List, MessageCircle, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const allCollections = [
  {
    id: 1,
    name: "Modern Minimalist",
    description: "Clean lines and neutral tones perfect for contemporary spaces",
    patternCount: 12,
    priceRange: "฿1,290 - ฿3,590",
    category: "modern",
    patterns: [
      { id: 1, name: "Arctic White", color: "#F8F9FA", texture: "Smooth Cotton", price: 1290 },
      { id: 2, name: "Stone Gray", color: "#6C757D", texture: "Linen Blend", price: 1590 },
      { id: 3, name: "Charcoal", color: "#343A40", texture: "Performance Fabric", price: 1890 },
      { id: 4, name: "Cream", color: "#FFF8DC", texture: "Soft Cotton", price: 1390 },
      { id: 5, name: "Sage Green", color: "#9CAF88", texture: "Organic Cotton", price: 1690 },
      { id: 6, name: "Dusty Blue", color: "#6B8CAE", texture: "Linen Blend", price: 1790 },
    ],
  },
  {
    id: 2,
    name: "Classic Elegance",
    description: "Timeless patterns and rich textures for sophisticated interiors",
    patternCount: 18,
    priceRange: "฿1,890 - ฿4,290",
    category: "classic",
    patterns: [
      { id: 7, name: "Royal Navy Damask", color: "#1B365D", texture: "Jacquard Weave", price: 2890 },
      { id: 8, name: "Burgundy Paisley", color: "#800020", texture: "Velvet", price: 3290 },
      { id: 9, name: "Gold Brocade", color: "#FFD700", texture: "Silk Blend", price: 4290 },
      { id: 10, name: "Forest Plaid", color: "#355E3B", texture: "Wool Blend", price: 2590 },
      { id: 11, name: "Ivory Toile", color: "#FFFFF0", texture: "Cotton Canvas", price: 2190 },
      { id: 12, name: "Mahogany Stripe", color: "#C04000", texture: "Chenille", price: 2790 },
    ],
  },
  {
    id: 3,
    name: "Bohemian Chic",
    description: "Vibrant colors and artistic designs for eclectic spaces",
    patternCount: 15,
    priceRange: "฿1,590 - ฿3,890",
    category: "bohemian",
    patterns: [
      { id: 13, name: "Sunset Mandala", color: "#FF6B35", texture: "Cotton Canvas", price: 2290 },
      { id: 14, name: "Peacock Feather", color: "#4F7942", texture: "Velvet", price: 3890 },
      { id: 15, name: "Desert Rose", color: "#C21807", texture: "Linen Blend", price: 2590 },
      { id: 16, name: "Turquoise Ikat", color: "#40E0D0", texture: "Cotton Blend", price: 1990 },
      { id: 17, name: "Moroccan Tile", color: "#B8860B", texture: "Jacquard", price: 2890 },
      { id: 18, name: "Tribal Geometric", color: "#8B4513", texture: "Canvas", price: 1590 },
    ],
  },
]

export default function FabricCollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  const categories = [
    { value: "all", label: "ทุกคอลเลกชัน" },
    { value: "modern", label: "โมเดิร์น" },
    { value: "classic", label: "คลาสสิค" },
    { value: "bohemian", label: "โบฮีเมียน" },
  ]

  const filteredCollections = allCollections.filter((collection) => {
    const matchesCategory = selectedCategory === "all" || collection.category === selectedCategory
    const matchesSearch =
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePatternSelect = (collectionName: string, patternName: string, price: number) => {
    const message = `สวัสดีครับ! ผมสนใจลายผ้า "${patternName}" จากคอลเลกชัน ${collectionName} ราคา ${price.toLocaleString()} บาท

รายละเอียดที่ต้องการ:
- ขนาดโซฟา: [กรุณาระบุ เช่น 2 ที่นั่ง, 3 ที่นั่ง, L-Shape]
- ที่อยู่จัดส่ง: [กรุณาระบุ]
- เบอร์โทรติดต่อ: [กรุณาระบุ]

ขอใบเสนอราคาและรายละเอียดเพิ่มเติมครับ`

    const facebookUrl = `https://m.me/100063558196153?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  const toggleFavorite = (patternId: number) => {
    setFavorites((prev) => (prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId]))
  }

  const sharePattern = (collectionName: string, patternName: string) => {
    const shareUrl = `${window.location.origin}/fabric-collections`
    const shareText = `ดูลายผ้า "${patternName}" จากคอลเลกชัน ${collectionName} สวยมากเลย!`

    if (navigator.share) {
      navigator.share({
        title: `ลายผ้า ${patternName}`,
        text: shareText,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      alert("คัดลอกลิงก์แล้ว!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">เลือกลายผ้าที่ชอบ</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            เลือกลายผ้าที่ใช่สำหรับผ้าคลุมโซฟาของคุณ แล้วส่งกลับมาแชทเพื่อขอใบเสนอราคา
          </p>
          <div className="mt-6 flex justify-center">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
              💬 คลิกลายผ้าที่ชอบ → ส่งกลับแชท Facebook อัตโนมัติ
            </Badge>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-pink-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาลายผ้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
          {filteredCollections.map((collection) => (
            <Card
              key={collection.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-pink-100"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{collection.name}</h3>
                    <Badge className="bg-pink-100 text-pink-800">{collection.patternCount} ลาย</Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                  <p className="text-lg font-semibold text-pink-600 mb-6">{collection.priceRange}</p>

                  {/* Pattern Preview */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {collection.patterns.slice(0, 6).map((pattern) => (
                      <div
                        key={pattern.id}
                        className="relative group cursor-pointer"
                        onClick={() => handlePatternSelect(collection.name, pattern.name, pattern.price)}
                      >
                        <div
                          className="aspect-square rounded-lg border-3 border-gray-200 hover:border-pink-400 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                          style={{ backgroundColor: pattern.color }}
                        >
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(pattern.id)
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              favorites.includes(pattern.id)
                                ? "bg-red-500 text-white"
                                : "bg-white text-gray-400 hover:text-red-500"
                            } shadow-md`}
                          >
                            <Heart
                              className="w-4 h-4"
                              fill={favorites.includes(pattern.id) ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setSelectedCollection(selectedCollection === collection.id ? null : collection.id)}
                      variant="outline"
                      className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50"
                    >
                      {selectedCollection === collection.id ? "ซ่อนลายผ้า" : "ดูลายผ้าทั้งหมด"}
                    </Button>
                    <Button
                      onClick={() => {
                        const message = `สวัสดีครับ! ผมสนใจคอลเลกชัน "${collection.name}" ขอดูลายผ้าทั้งหมดและราคาครับ`
                        const facebookUrl = `https://m.me/100063558196153?text=${encodeURIComponent(message)}`
                        window.open(facebookUrl, "_blank")
                      }}
                      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      แชท
                    </Button>
                  </div>
                </div>

                {/* Expanded Pattern List */}
                {selectedCollection === collection.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">ลายผ้าทั้งหมดใน {collection.name}:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {collection.patterns.map((pattern) => (
                        <div
                          key={pattern.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors group"
                          onClick={() => handlePatternSelect(collection.name, pattern.name, pattern.price)}
                        >
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 group-hover:border-pink-400 transition-colors flex-shrink-0"
                            style={{ backgroundColor: pattern.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{pattern.name}</p>
                            <p className="text-xs text-gray-500">{pattern.texture}</p>
                            <p className="text-sm font-semibold text-pink-600">฿{pattern.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                sharePattern(collection.name, pattern.name)
                              }}
                              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <MessageCircle className="w-4 h-4 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบลายผ้าที่ค้นหา</h3>
            <p className="text-gray-500 mb-4">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ดู</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              variant="outline"
              className="border-pink-300 text-pink-700 hover:bg-pink-50"
            >
              ล้างตัวกรอง
            </Button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-8 text-white text-center shadow-xl">
          <h2 className="text-2xl font-bold mb-4">ต้องการความช่วยเหลือ?</h2>
          <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
            ทีมงานของเราพร้อมให้คำปรึกษาเรื่องการเลือกลายผ้าและขนาดที่เหมาะสมกับโซฟาของคุณ แชทมาได้เลย เราตอบเร็วมาก!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                const message = "สวัสดีครับ! ผมต้องการคำปรึกษาเรื่องการเลือกลายผ้าสำหรับผ้าคลุมโซฟาครับ"
                const facebookUrl = `https://m.me/100063558196153?text=${encodeURIComponent(message)}`
                window.open(facebookUrl, "_blank")
              }}
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors inline-flex items-center"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              แชทปรึกษาฟรี
            </Button>
            <Button
              onClick={() => {
                const message = "สวัสดีครับ! ผมต้องการดูตัวอย่างผลงานและรีวิวจากลูกค้าครับ"
                const facebookUrl = `https://m.me/100063558196153?text=${encodeURIComponent(message)}`
                window.open(facebookUrl, "_blank")
              }}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-pink-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              ดูผลงาน & รีวิว
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
