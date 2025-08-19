"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Search,
  Filter,
  Heart,
  Share2,
  ZoomIn,
  ExternalLink,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingCart,
  Star,
  Palette,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BulkFabricSelector from "@/components/fabric/BulkFabricSelector"

const fabricCollections: any[] = [
  {
    id: 1,
    name: "Modern Minimalist",
    description: "Clean lines and neutral tones for contemporary spaces",
    tags: ["modern", "minimalist", "neutral", "contemporary"],
    samples: [
      {
        id: 1,
        name: "Arctic White",
        image: "/placeholder-twwxt.png",
        texture: "Smooth Cotton Blend",
        price: "฿1,890",
        rating: 4.8,
        isNew: true,
      },
      {
        id: 2,
        name: "Stone Gray",
        image: "/placeholder-twydr.png",
        texture: "Linen Weave",
        price: "฿2,190",
        rating: 4.9,
        isBestseller: true,
      },
      {
        id: 3,
        name: "Charcoal Matte",
        image: "/industrial-charcoal-concrete-fabric.png",
        texture: "Microfiber",
        price: "฿2,490",
        rating: 4.7,
      },
    ],
  },
  {
    id: 2,
    name: "Luxury Velvet",
    description: "Rich textures and deep colors for elegant interiors",
    tags: ["luxury", "velvet", "elegant", "premium"],
    samples: [
      {
        id: 4,
        name: "Emerald Velvet",
        image: "/emerald-velvet-texture.png",
        texture: "Premium Velvet",
        price: "฿3,890",
        rating: 4.9,
        isBestseller: true,
      },
      {
        id: 5,
        name: "Royal Navy",
        image: "/placeholder-9wn1f.png",
        texture: "Crushed Velvet",
        price: "฿3,590",
        rating: 4.8,
      },
      {
        id: 6,
        name: "Burgundy Rich",
        image: "/placeholder-e53xb.png",
        texture: "Plush Velvet",
        price: "฿4,190",
        rating: 4.9,
        isNew: true,
      },
    ],
  },
  {
    id: 3,
    name: "Bohemian Dreams",
    description: "Vibrant patterns and eclectic designs for free spirits",
    tags: ["bohemian", "colorful", "patterns", "eclectic"],
    samples: [
      {
        id: 7,
        name: "Mandala Sunset",
        image: "/bohemian-mandala-sunset-fabric.png",
        texture: "Cotton Canvas",
        price: "฿2,690",
        rating: 4.6,
        isNew: true,
      },
      {
        id: 8,
        name: "Moroccan Spice",
        image: "/moroccan-terracotta-fabric.png",
        texture: "Jacquard Weave",
        price: "฿2,890",
        rating: 4.7,
      },
      {
        id: 9,
        name: "Paisley Garden",
        image: "/colorful-paisley-fabric.png",
        texture: "Printed Cotton",
        price: "฿2,390",
        rating: 4.5,
      },
    ],
  },
  {
    id: 4,
    name: "Scandinavian Comfort",
    description: "Cozy textures and muted colors inspired by Nordic design",
    tags: ["scandinavian", "cozy", "nordic", "comfort"],
    samples: [
      {
        id: 10,
        name: "Nordic Gray",
        image: "/scandinavian-gray-geometric-fabric.png",
        texture: "Wool Blend",
        price: "฿3,190",
        rating: 4.8,
        isBestseller: true,
      },
      {
        id: 11,
        name: "Birch White",
        image: "/placeholder-0bfvt.png",
        texture: "Organic Cotton",
        price: "฿2,790",
        rating: 4.7,
      },
      {
        id: 12,
        name: "Forest Green",
        image: "/placeholder-6d9e5.png",
        texture: "Hemp Blend",
        price: "฿3,390",
        rating: 4.6,
        isNew: true,
      },
    ],
  },
  {
    id: 5,
    name: "Vintage Romance",
    description: "Classic floral patterns with timeless appeal",
    tags: ["vintage", "floral", "romantic", "classic"],
    samples: [
      {
        id: 13,
        name: "Rose Garden",
        image: "/vintage-pink-rose-fabric.png",
        texture: "Cotton Sateen",
        price: "฿2,590",
        rating: 4.8,
      },
      {
        id: 14,
        name: "English Cottage",
        image: "/vintage-cottage-floral-fabric.png",
        texture: "Linen Cotton",
        price: "฿2,790",
        rating: 4.7,
        isBestseller: true,
      },
      {
        id: 15,
        name: "Lavender Fields",
        image: "/soft-lavender-floral-vintage-fabric.png",
        texture: "Brushed Cotton",
        price: "฿2,490",
        rating: 4.6,
      },
    ],
  },
  {
    id: 6,
    name: "Japanese Zen",
    description: "Minimalist patterns inspired by Japanese aesthetics",
    tags: ["japanese", "zen", "minimalist", "serene"],
    samples: [
      {
        id: 16,
        name: "Indigo Wave",
        image: "/japanese-indigo-wave-fabric.png",
        texture: "Sashiko Cotton",
        price: "฿3,490",
        rating: 4.9,
        isNew: true,
      },
      {
        id: 17,
        name: "Bamboo Whisper",
        image: "/placeholder-2xbm7.png",
        texture: "Bamboo Fiber",
        price: "฿3,290",
        rating: 4.8,
      },
      {
        id: 18,
        name: "Cherry Blossom",
        image: "/placeholder.svg?height=300&width=300",
        texture: "Silk Blend",
        price: "฿3,890",
        rating: 4.9,
        isBestseller: true,
      },
    ],
  },
]

export default function FabricGalleryPage() {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "price" | "newest" | "rating">("name")
  const [zoomedImage, setZoomedImage] = useState<any>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([])
  const [showBulkSelector, setShowBulkSelector] = useState(false)

  // Get all unique tags
  const allTags: any[] = Array.from(new Set(fabricCollections.flatMap((collection: any) => collection.tags)))

  // Filter and sort patterns
  const getAllPatterns = () => {
    let allPatterns = fabricCollections.flatMap((collection: any) =>
      collection.samples.map((sample: any) => ({
        ...sample,
        collectionName: collection.name,
        collectionId: collection.id,
        tags: collection.tags,
      })),
    )

    // Apply filters
    if (searchTerm) {
      allPatterns = allPatterns.filter(
        (pattern: any) =>
          pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pattern.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pattern.texture.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedTags.length > 0) {
      allPatterns = allPatterns.filter((pattern: any) => selectedTags.some((tag: any) => pattern.tags.includes(tag)))
    }

    if (selectedCollection) {
      allPatterns = allPatterns.filter((pattern: any) => pattern.collectionId === selectedCollection)
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        allPatterns.sort((a: any, b: any) => a.name.localeCompare(b.name))
        break
      case "price":
        allPatterns.sort((a: any, b: any) => {
          const aPrice = Number.parseInt(a.price.match(/\d+/)?.[0] || "0")
          const bPrice = Number.parseInt(b.price.match(/\d+/)?.[0] || "0")
          return aPrice - bPrice
        })
        break
      case "rating":
        allPatterns.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        break
      case "newest":
        // For demo purposes, reverse the order
        allPatterns.reverse()
        break
    }

    return allPatterns
  }

  const filteredPatterns = getAllPatterns()

  const handleFabricSelect = (collectionName: string, fabricName: string) => {
    const message = `สวัสดีครับ/ค่ะ! สนใจลายผ้า "${fabricName}" จากคอลเลกชัน ${collectionName} ครับ/ค่ะ ขอรายละเอียดและราคาสำหรับผ้าคลุมโซฟาได้ไหมครับ/ค่ะ`
    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  const toggleFavorite = (fabricId: number) => {
    setFavorites((prev) => (prev.includes(fabricId) ? prev.filter((id) => id !== fabricId) : [...prev, fabricId]))
  }

  const sharePattern = (collectionName: string, fabricName: string) => {
    if (navigator.share) {
      navigator.share({
        title: `${fabricName} - ${collectionName}`,
        text: `ดูลายผ้าสวยๆ นี้: ${fabricName} จากคอลเลกชัน ${collectionName}`,
        url: window.location.href,
      })
    }
  }

  const openImageZoom = (fabric: any) => {
    setZoomedImage(fabric)
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (!zoomedImage) return

    const currentIndex = filteredPatterns.findIndex((p: any) => p.id === zoomedImage.id)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPatterns.length - 1
    } else {
      newIndex = currentIndex < filteredPatterns.length - 1 ? currentIndex + 1 : 0
    }

    setZoomedImage(filteredPatterns[newIndex])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm sticky top-0 z-40 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  แกลเลอรี่ผ้า
                </h1>
                <p className="text-sm text-muted-foreground">{filteredPatterns.length} ลายผ้า</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkSelector(!showBulkSelector)}
                className={`p-2 rounded-full transition-colors ${
                  showBulkSelector ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
              >
                {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาลายผ้า, คอลเลกชัน, หรือเนื้อผ้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>

          {/* Bulk Selector */}
          {showBulkSelector && (
            <div className="mt-4">
              <BulkFabricSelector
                fabrics={filteredPatterns.map((p) => ({
                  id: `${p.collectionId}-${p.id}`,
                  name: p.name,
                  collectionName: p.collectionName,
                  imageUrl: p.image,
                  price: p.price,
                }))}
                onSelectionChange={setSelectedForBulk}
                className="border-t border-border pt-4"
              />
            </div>
          )}

          {showFilters && (
            <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">คอลเลกชัน</label>
                <select
                  value={selectedCollection || ""}
                  onChange={(e) => setSelectedCollection(e.target.value ? Number.parseInt(e.target.value) : null)}
                  className="w-full p-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                >
                  <option value="">ทุกคอลเลกชัน</option>
                  {fabricCollections.map((collection: any) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">สไตล์</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag: any) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setSelectedTags((prev: any) =>
                          prev.includes(tag) ? prev.filter((t: any) => t !== tag) : [...prev, tag],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">เรียงตาม</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "price" | "newest" | "rating")}
                  className="w-full p-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                >
                  <option value="name">ชื่อ A-Z</option>
                  <option value="price">ราคาต่ำไปสูง</option>
                  <option value="rating">คะแนนสูงสุด</option>
                  <option value="newest">ใหม่ล่าสุด</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTags([])
                  setSelectedCollection(null)
                  setSortBy("name")
                }}
                className="w-full mt-4 py-2 text-primary font-medium hover:text-accent transition-colors"
              >
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPatterns.map((pattern: any) => (
              <div
                key={`${pattern.collectionId}-${pattern.id}`}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 fabric-card-hover border border-border"
              >
                <div
                  className="aspect-square cursor-pointer relative group overflow-hidden"
                  onClick={() => openImageZoom(pattern)}
                >
                  <Image
                    src={pattern.image || "/placeholder.svg"}
                    alt={pattern.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover fabric-image-zoom"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Enhanced badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {pattern.isNew && (
                      <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                        ใหม่
                      </span>
                    )}
                    {pattern.isBestseller && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        ขายดี
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(pattern.id)
                    }}
                    className={`absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 transition-colors ${
                      favorites.includes(pattern.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(pattern.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="p-3">
                  <div className="text-xs text-primary font-medium mb-1">{pattern.collectionName}</div>
                  <h3 className="font-medium text-card-foreground text-sm truncate">{pattern.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{pattern.texture}</p>

                  {/* Rating display */}
                  {pattern.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span className="text-xs text-muted-foreground">{pattern.rating}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-accent">{pattern.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        sharePattern(pattern.collectionName, pattern.name)
                      }}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleFabricSelect(pattern.collectionName, pattern.name)}
                    className="w-full bg-primary text-primary-foreground py-2 px-2 rounded text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                  >
                    สอบถามราคา
                    <ExternalLink className="ml-1 w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatterns.map((pattern: any) => (
              <div
                key={`${pattern.collectionId}-${pattern.id}`}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex border border-border"
              >
                <div
                  className="w-24 h-24 cursor-pointer relative group flex-shrink-0 overflow-hidden"
                  onClick={() => openImageZoom(pattern)}
                >
                  <Image
                    src={pattern.image || "/placeholder.svg"}
                    alt={pattern.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover fabric-image-zoom"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-primary font-medium mb-1">{pattern.collectionName}</div>
                      <h3 className="font-medium text-card-foreground text-sm">{pattern.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{pattern.texture}</p>

                      {pattern.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3 h-3 fill-gold text-gold" />
                          <span className="text-xs text-muted-foreground">{pattern.rating}</span>
                        </div>
                      )}

                      <span className="text-sm font-semibold text-accent">{pattern.price}</span>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleFavorite(pattern.id)}
                        className={`p-1 rounded transition-colors ${favorites.includes(pattern.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(pattern.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleFabricSelect(pattern.collectionName, pattern.name)}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-medium hover:bg-primary/90 transition-colors flex items-center"
                      >
                        สอบถาม
                        <ExternalLink className="ml-1 w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredPatterns.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg mb-4">ไม่พบลายผ้าที่ตรงกับเงื่อนไขที่เลือก</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedTags([])
                setSelectedCollection(null)
              }}
              className="text-primary hover:text-accent font-medium transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigateImage("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="relative">
              <Image
                src={zoomedImage.image || "/placeholder.svg"}
                alt={zoomedImage.name}
                width={800}
                height={800}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 fabric-gradient-overlay p-6 rounded-b-lg">
              <div className="text-white">
                <div className="text-sm text-cyan-300 mb-1">{zoomedImage.collectionName}</div>
                <h3 className="text-xl font-bold mb-2">{zoomedImage.name}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{zoomedImage.texture}</p>
                    {zoomedImage.rating && (
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="text-sm text-gray-300">{zoomedImage.rating}</span>
                      </div>
                    )}
                    <p className="text-lg font-semibold text-lime-400">{zoomedImage.price}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleFavorite(zoomedImage.id)}
                      className={`p-2 rounded-full transition-colors ${favorites.includes(zoomedImage.id) ? "text-red-500" : "text-white hover:text-red-500"}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(zoomedImage.id) ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => sharePattern(zoomedImage.collectionName, zoomedImage.name)}
                      className="p-2 rounded-full text-white hover:text-cyan-400 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleFabricSelect(zoomedImage.collectionName, zoomedImage.name)}
                      className="bg-lime-500 text-white px-4 py-2 rounded-full font-medium hover:bg-lime-600 transition-colors flex items-center"
                    >
                      สอบถามราคา
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            const message =
              "สวัสดีครับ/ค่ะ! กำลังดูแกลเลอรี่ผ้าอยู่ ต้องการความช่วยเหลือในการเลือกลายผ้าที่เหมาะสมสำหรับผ้าคลุมโซฟา ช่วยแนะนำได้ไหมครับ/ค่ะ"
            const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
            window.open(facebookUrl, "_blank")
          }}
          className="bg-accent text-accent-foreground p-4 rounded-full shadow-lg hover:bg-accent/90 transition-colors flex items-center fabric-card-hover"
        >
          <ExternalLink className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
