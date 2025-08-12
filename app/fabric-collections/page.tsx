"use client"

import { useState } from "react"
import { Search, Filter, ExternalLink, Grid, List } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export const dynamic = "force-dynamic"

export default function FabricCollectionsPage() {
  const initialCollections = [
    {
      id: 1,
      name: "Modern Minimalist",
      description: "Clean lines and neutral tones for contemporary spaces",
      category: "modern",
      patternCount: 12,
      priceRange: "฿1,200 - ฿2,500",
      patterns: [
        { id: 1, name: "Pure White", color: "#FFFFFF", texture: "Smooth Cotton" },
        { id: 2, name: "Soft Gray", color: "#E5E5E5", texture: "Linen Blend" },
        { id: 3, name: "Charcoal", color: "#4A4A4A", texture: "Microfiber" },
        { id: 4, name: "Cream", color: "#F5F5DC", texture: "Cotton Canvas" },
        { id: 5, name: "Light Beige", color: "#F5F5DC", texture: "Textured Weave" },
        { id: 6, name: "Stone Gray", color: "#A8A8A8", texture: "Velvet Touch" },
      ],
    },
    {
      id: 2,
      name: "Classic Elegance",
      description: "Timeless patterns with sophisticated appeal",
      category: "classic",
      patternCount: 15,
      priceRange: "฿1,500 - ฿3,200",
      patterns: [
        { id: 7, name: "Royal Blue", color: "#4169E1", texture: "Velvet" },
        { id: 8, name: "Deep Burgundy", color: "#800020", texture: "Jacquard" },
        { id: 9, name: "Forest Green", color: "#228B22", texture: "Damask" },
        { id: 10, name: "Golden Brown", color: "#DAA520", texture: "Brocade" },
        { id: 11, name: "Navy Stripe", color: "#000080", texture: "Striped Cotton" },
        { id: 12, name: "Ivory Floral", color: "#FFFFF0", texture: "Embroidered" },
      ],
    },
    {
      id: 3,
      name: "Bohemian Dreams",
      description: "Vibrant colors and eclectic patterns for free spirits",
      category: "bohemian",
      patternCount: 18,
      priceRange: "฿1,800 - ฿3,500",
      patterns: [
        { id: 13, name: "Sunset Orange", color: "#FF8C00", texture: "Tribal Print" },
        { id: 14, name: "Turquoise", color: "#40E0D0", texture: "Mandala" },
        { id: 15, name: "Magenta", color: "#FF00FF", texture: "Paisley" },
        { id: 16, name: "Emerald", color: "#50C878", texture: "Geometric" },
        { id: 17, name: "Coral Pink", color: "#FF7F50", texture: "Floral Mix" },
        { id: 18, name: "Purple Haze", color: "#9370DB", texture: "Abstract" },
      ],
    },
  ]

  return <FabricCollectionsClient initialCollections={initialCollections} />
}

function FabricCollectionsClient({ initialCollections }: { initialCollections: any[] }) {
  const [collections] = useState(initialCollections)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null)
  const { language } = useLanguage()

  const categories = [
    { value: "all", label: language === "th" ? "ทั้งหมด" : "All Collections" },
    { value: "modern", label: language === "th" ? "โมเดิร์น" : "Modern" },
    { value: "classic", label: language === "th" ? "คลาสสิก" : "Classic" },
    { value: "bohemian", label: language === "th" ? "โบฮีเมียน" : "Bohemian" },
    { value: "scandinavian", label: language === "th" ? "สแกนดิเนเวียน" : "Scandinavian" },
    { value: "luxury", label: language === "th" ? "หรูหรา" : "Luxury" },
    { value: "outdoor", label: language === "th" ? "กลางแจ้ง" : "Outdoor" },
  ]

  const filteredCollections = collections.filter((collection) => {
    const matchesCategory = selectedCategory === "all" || collection.category === selectedCategory
    const matchesSearch =
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePatternSelect = (collectionName: string, patternName: string) => {
    const message =
      language === "th"
        ? `สวัสดีครับ/ค่ะ! ผมสนใจลาย "${patternName}" จากคอลเลกชัน ${collectionName} ครับ/ค่ะ ขอรายละเอียดและราคาได้ไหมครับ/ค่ะ`
        : `Hi! I'm interested in the "${patternName}" pattern from your ${collectionName} collection. Can you provide more details and pricing?`
    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "th" ? "คอลเลกชันผ้า" : "Fabric Collections"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "สำรวจคอลเลกชันผ้าที่คัดสรรมาแล้วและค้นหาลายที่สมบูรณ์แบบสำหรับผ้าคลุมโซฟาของคุณ"
              : "Explore our curated fabric collections and find the perfect pattern for your sofa covers. Each collection features unique styles and premium materials."}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={language === "th" ? "ค้นหาคอลเลกชัน..." : "Search collections..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
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
                className={`p-2 rounded ${viewMode === "grid" ? "bg-pink-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-pink-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Collections Grid/List */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
          {filteredCollections.map((collection) => (
            <div
              key={collection.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{collection.name}</h3>
                      <span className="text-sm text-pink-600 font-medium">
                        {collection.patternCount} {language === "th" ? "ลาย" : "patterns"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{collection.description}</p>
                    <p className="text-lg font-semibold text-green-600 mb-4">{collection.priceRange}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {collection.patterns.slice(0, 6).map((pattern: any) => (
                        <div
                          key={pattern.id}
                          className="aspect-square rounded border-2 border-gray-200 hover:border-pink-500 cursor-pointer transition-colors group relative"
                          style={{ backgroundColor: pattern.color }}
                          onClick={() => handlePatternSelect(collection.name, pattern.name)}
                          title={`${pattern.name} - ${pattern.texture}`}
                        >
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedCollection(selectedCollection === collection.id ? null : collection.id)}
                      className="w-full bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700 transition-colors"
                    >
                      {selectedCollection === collection.id
                        ? language === "th"
                          ? "ซ่อนลาย"
                          : "Hide Patterns"
                        : language === "th"
                          ? "ดูลายทั้งหมด"
                          : "View All Patterns"}
                    </button>
                  </div>

                  {selectedCollection === collection.id && (
                    <div className="border-t p-6 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        {language === "th" ? `ลายทั้งหมดใน ${collection.name}:` : `All Patterns in ${collection.name}:`}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {collection.patterns.map((pattern: any) => (
                          <div
                            key={pattern.id}
                            className="flex items-center space-x-3 p-2 rounded hover:bg-white cursor-pointer transition-colors"
                            onClick={() => handlePatternSelect(collection.name, pattern.name)}
                          >
                            <div
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: pattern.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{pattern.name}</p>
                              <p className="text-xs text-gray-500">{pattern.texture}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{collection.name}</h3>
                        <p className="text-gray-600 mb-2">{collection.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {collection.patternCount} {language === "th" ? "ลาย" : "patterns"}
                          </span>
                          <span className="text-green-600 font-medium">{collection.priceRange}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setSelectedCollection(selectedCollection === collection.id ? null : collection.id)
                        }
                        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors"
                      >
                        {language === "th" ? "ดูลาย" : "View Patterns"}
                      </button>
                      <button
                        onClick={() => {
                          const message =
                            language === "th"
                              ? `สวัสดีครับ/ค่ะ! ผมต้องการดูลายทั้งหมดจากคอลเลกชัน ${collection.name} ครับ/ค่ะ`
                              : `Hi! I'd like to see all patterns from the ${collection.name} collection. Can you share the complete catalog?`
                          const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                          window.open(facebookUrl, "_blank")
                        }}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors flex items-center"
                      >
                        {language === "th" ? "แชทใน Facebook" : "Chat on Facebook"}
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-48 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      {collection.patterns.slice(0, 4).map((pattern: any) => (
                        <div
                          key={pattern.id}
                          className="aspect-square rounded border-2 border-gray-200 hover:border-pink-500 cursor-pointer transition-colors"
                          style={{ backgroundColor: pattern.color }}
                          onClick={() => handlePatternSelect(collection.name, pattern.name)}
                          title={`${pattern.name} - ${pattern.texture}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {language === "th" ? "ไม่พบคอลเลกชันที่ตรงกับเงื่อนไข" : "No collections found matching your criteria."}
            </p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              className="mt-4 text-pink-600 hover:text-pink-800 font-medium"
            >
              {language === "th" ? "ล้างตัวกรอง" : "Clear filters"}
            </button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === "th" ? "ต้องการความช่วยเหลือในการเลือก?" : "Need Help Choosing?"}
          </h2>
          <p className="text-pink-100 mb-6">
            {language === "th"
              ? "ผู้เชี่ยวชาญด้านผ้าของเราพร้อมช่วยคุณหาลายที่เหมาะสมกับพื้นที่ของคุณ แชทกับเราใน Facebook เพื่อรับคำแนะนำเฉพาะบุคคล!"
              : "Our fabric experts are here to help you find the perfect pattern for your space. Chat with us on Facebook for personalized recommendations!"}
          </p>
          <button
            onClick={() => {
              const message =
                language === "th"
                  ? "สวัสดีครับ/ค่ะ! ผมต้องการความช่วยเหลือในการเลือกลายผ้าที่เหมาะสมสำหรับผ้าคลุมโซฟา ช่วยแนะนำตามสไตล์ที่ผมชอบได้ไหมครับ/ค่ะ"
                  : "Hi! I need help choosing the right fabric pattern for my sofa cover. Can you provide some recommendations based on my style preferences?"
              const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
              window.open(facebookUrl, "_blank")
            }}
            className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors inline-flex items-center"
          >
            {language === "th" ? "รับคำแนะนำจากผู้เชี่ยวชาญ" : "Get Expert Advice"}
            <ExternalLink className="ml-2 w-5 h-5" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
