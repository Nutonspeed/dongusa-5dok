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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Same fabric collections data as above
const fabricCollections = [
  // ... (same data as in the enhanced FabricCollections component)
]

export default function FabricGalleryPage() {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "price" | "newest">("name")
  const [zoomedImage, setZoomedImage] = useState<any>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Get all unique tags
  const allTags = Array.from(new Set(fabricCollections.flatMap((collection) => collection.tags)))

  // Filter and sort patterns
  const getAllPatterns = () => {
    let allPatterns = fabricCollections.flatMap((collection) =>
      collection.samples.map((sample) => ({
        ...sample,
        collectionName: collection.name,
        collectionId: collection.id,
        tags: collection.tags,
      })),
    )

    // Apply filters
    if (searchTerm) {
      allPatterns = allPatterns.filter(
        (pattern) =>
          pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pattern.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pattern.texture.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedTags.length > 0) {
      allPatterns = allPatterns.filter((pattern) => selectedTags.some((tag) => pattern.tags.includes(tag)))
    }

    if (selectedCollection) {
      allPatterns = allPatterns.filter((pattern) => pattern.collectionId === selectedCollection)
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        allPatterns.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "price":
        allPatterns.sort((a, b) => {
          const aPrice = Number.parseInt(a.price.match(/\d+/)?.[0] || "0")
          const bPrice = Number.parseInt(b.price.match(/\d+/)?.[0] || "0")
          return aPrice - bPrice
        })
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
    const message = `Hi! I'm interested in the "${fabricName}" pattern from your ${collectionName} collection. Can you provide more details and pricing for my sofa cover?`
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
        text: `Check out this beautiful fabric pattern: ${fabricName} from ${collectionName} collection`,
        url: window.location.href,
      })
    }
  }

  const openImageZoom = (fabric: any) => {
    setZoomedImage(fabric)
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (!zoomedImage) return

    const currentIndex = filteredPatterns.findIndex((p) => p.id === zoomedImage.id)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPatterns.length - 1
    } else {
      newIndex = currentIndex < filteredPatterns.length - 1 ? currentIndex + 1 : 0
    }

    setZoomedImage(filteredPatterns[newIndex])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Fabric Gallery</h1>
                <p className="text-sm text-gray-500">{filteredPatterns.length} patterns</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowFilters(!showFilters)} className="p-2 hover:bg-gray-100 rounded-full">
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {/* Collection Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Collection</label>
                <select
                  value={selectedCollection || ""}
                  onChange={(e) => setSelectedCollection(e.target.value ? Number.parseInt(e.target.value) : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Collections</option>
                  {fabricCollections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filters */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Style Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "price" | "newest")}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="name">Name A-Z</option>
                  <option value="price">Price Low to High</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTags([])
                  setSelectedCollection(null)
                  setSortBy("name")
                }}
                className="w-full mt-4 py-2 text-blue-600 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pattern Gallery */}
      <div className="container mx-auto px-4 py-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPatterns.map((pattern) => (
              <div
                key={`${pattern.collectionId}-${pattern.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square cursor-pointer relative group" onClick={() => openImageZoom(pattern)}>
                  <Image
                    src={pattern.image || "/placeholder.svg"}
                    alt={pattern.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(pattern.id)
                    }}
                    className={`absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 ${
                      favorites.includes(pattern.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(pattern.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="p-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">{pattern.collectionName}</div>
                  <h3 className="font-medium text-gray-900 text-sm truncate">{pattern.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{pattern.texture}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-600">{pattern.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        sharePattern(pattern.collectionName, pattern.name)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleFabricSelect(pattern.collectionName, pattern.name)}
                    className="w-full bg-blue-600 text-white py-2 px-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    Get Quote
                    <ExternalLink className="ml-1 w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatterns.map((pattern) => (
              <div
                key={`${pattern.collectionId}-${pattern.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex"
              >
                <div
                  className="w-24 h-24 cursor-pointer relative group flex-shrink-0"
                  onClick={() => openImageZoom(pattern)}
                >
                  <Image
                    src={pattern.image || "/placeholder.svg"}
                    alt={pattern.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-blue-600 font-medium mb-1">{pattern.collectionName}</div>
                      <h3 className="font-medium text-gray-900 text-sm">{pattern.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{pattern.texture}</p>
                      <span className="text-sm font-semibold text-green-600">{pattern.price}</span>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleFavorite(pattern.id)}
                        className={`p-1 rounded ${favorites.includes(pattern.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(pattern.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleFabricSelect(pattern.collectionName, pattern.name)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center"
                      >
                        Quote
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
            <p className="text-gray-500 text-lg mb-4">No patterns found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedTags([])
                setSelectedCollection(null)
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Image Zoom Modal - Same as in FabricCollections component */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
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

            {/* Image */}
            <div className="relative">
              <Image
                src={zoomedImage.image || "/placeholder.svg"}
                alt={zoomedImage.name}
                width={800}
                height={800}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
              <div className="text-white">
                <div className="text-sm text-blue-300 mb-1">{zoomedImage.collectionName}</div>
                <h3 className="text-xl font-bold mb-2">{zoomedImage.name}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{zoomedImage.texture}</p>
                    <p className="text-lg font-semibold text-green-400">{zoomedImage.price}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleFavorite(zoomedImage.id)}
                      className={`p-2 rounded-full ${favorites.includes(zoomedImage.id) ? "text-red-500" : "text-white hover:text-red-500"}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(zoomedImage.id) ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => sharePattern(zoomedImage.collectionName, zoomedImage.name)}
                      className="p-2 rounded-full text-white hover:text-blue-400"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleFabricSelect(zoomedImage.collectionName, zoomedImage.name)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      Get Quote
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            const message =
              "Hi! I'm browsing your fabric gallery and need help choosing the perfect pattern for my sofa cover. Can you assist me?"
            const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
            window.open(facebookUrl, "_blank")
          }}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <ExternalLink className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
