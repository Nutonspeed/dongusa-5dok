"use client"

import { useState } from "react"
import { ExternalLink, ChevronRight, Palette, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const fabricCollections = [
  {
    id: 1,
    name: "Modern Minimalist",
    description: "Clean lines and neutral tones perfect for contemporary spaces",
    patternCount: 12,
    priceRange: "$49 - $159",
    image: "/modern-minimalist-fabric-pattern-1.png",
    samples: [
      { color: "#F8F9FA", name: "Arctic White" },
      { color: "#6C757D", name: "Stone Gray" },
      { color: "#343A40", name: "Charcoal" },
      { color: "#FFF8DC", name: "Cream" },
    ],
  },
  {
    id: 2,
    name: "Classic Elegance",
    description: "Timeless patterns and rich textures for sophisticated interiors",
    patternCount: 18,
    priceRange: "$69 - $199",
    image: "/classic-elegant-fabric-pattern-1.png",
    samples: [
      { color: "#1B365D", name: "Royal Navy" },
      { color: "#800020", name: "Burgundy" },
      { color: "#FFD700", name: "Gold" },
      { color: "#355E3B", name: "Forest" },
    ],
  },
  {
    id: 3,
    name: "Bohemian Chic",
    description: "Vibrant colors and artistic designs for eclectic spaces",
    patternCount: 15,
    priceRange: "$59 - $179",
    image: "/bohemian-chic-fabric-pattern-1.png",
    samples: [
      { color: "#FF6B35", name: "Sunset" },
      { color: "#4F7942", name: "Peacock" },
      { color: "#C21807", name: "Desert Rose" },
      { color: "#40E0D0", name: "Turquoise" },
    ],
  },
]

export default function FabricCollections() {
  const [hoveredCollection, setHoveredCollection] = useState<number | null>(null)

  const handleCollectionClick = (collectionName: string) => {
    const message = `Hi! I'm interested in your ${collectionName} collection. Can you show me all available patterns and pricing?`
    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Palette className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Fabric Collections</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our curated fabric collections, each designed to transform your living space with style and
            comfort.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {fabricCollections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              onMouseEnter={() => setHoveredCollection(collection.id)}
              onMouseLeave={() => setHoveredCollection(null)}
            >
              {/* Collection Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">{collection.patternCount} Patterns</span>
                  </div>
                </div>
              </div>

              {/* Collection Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.name}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{collection.description}</p>

                {/* Color Samples */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xs font-medium text-gray-500">Sample Colors:</span>
                  <div className="flex space-x-1">
                    {collection.samples.map((sample, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: sample.color }}
                        title={sample.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-green-600">{collection.priceRange}</span>
                  <span className="text-sm text-gray-500">Starting price</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCollectionClick(collection.name)}
                    className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                      hoveredCollection === collection.id ? "bg-blue-700 shadow-lg" : "hover:bg-blue-700"
                    }`}
                  >
                    View Collection
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Explore All Patterns</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Browse our complete fabric gallery with advanced filtering options, or get personalized recommendations from
            our design experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fabric-gallery"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Browse Gallery
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <button
              onClick={() => {
                const message =
                  "Hi! I need help choosing the perfect fabric pattern for my sofa cover. Can you provide personalized recommendations based on my style preferences?"
                const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                window.open(facebookUrl, "_blank")
              }}
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center justify-center"
            >
              Get Expert Advice
              <ExternalLink className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
