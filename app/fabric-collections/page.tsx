"use client"

import { useState } from "react"
import { Search, Filter, ExternalLink, Grid, List } from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { createClient } from "@/lib/supabase/server"
import { useLanguage } from "@/hooks/useLanguage"

export default async function FabricCollectionsPage() {
  const supabase = createClient()
  const db = new DatabaseService(supabase)

  const { data: collections, error } = await db.getFabricCollections()

  if (error) {
    console.error("Error fetching fabric collections:", error)
  }

  return <FabricCollectionsClient initialCollections={collections || []} />
}

function FabricCollectionsClient({ initialCollections }) {
  const [collections] = useState(initialCollections)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null)
  const { language } = useLanguage()

  const categories = [
    { value: "all", label: "All Collections" },
    { value: "modern", label: "Modern" },
    { value: "classic", label: "Classic" },
    { value: "bohemian", label: "Bohemian" },
    { value: "scandinavian", label: "Scandinavian" },
    { value: "luxury", label: "Luxury" },
    { value: "outdoor", label: "Outdoor" },
  ]

  const filteredCollections = collections.filter((collection) => {
    const matchesCategory = selectedCategory === "all" || collection.category === selectedCategory
    const matchesSearch =
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePatternSelect = (collectionName: string, patternName: string) => {
    const message = `Hi! I'm interested in the "${patternName}" pattern from your ${collectionName} collection. Can you provide more details and pricing?`
    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Fabric Collections</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated fabric collections and find the perfect pattern for your sofa covers. Each collection
            features unique styles and premium materials.
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
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
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
                      <span className="text-sm text-blue-600 font-medium">{collection.patternCount} patterns</span>
                    </div>
                    <p className="text-gray-600 mb-4">{collection.description}</p>
                    <p className="text-lg font-semibold text-green-600 mb-4">{collection.priceRange}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {collection.patterns.slice(0, 6).map((pattern) => (
                        <div
                          key={pattern.id}
                          className="aspect-square rounded border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors group relative"
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
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                      {selectedCollection === collection.id ? "Hide Patterns" : "View All Patterns"}
                    </button>
                  </div>

                  {selectedCollection === collection.id && (
                    <div className="border-t p-6 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-4">All Patterns in {collection.name}:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {collection.patterns.map((pattern) => (
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
                          <span>{collection.patternCount} patterns</span>
                          <span className="text-green-600 font-medium">{collection.priceRange}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setSelectedCollection(selectedCollection === collection.id ? null : collection.id)
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        View Patterns
                      </button>
                      <button
                        onClick={() => {
                          const message = `Hi! I'd like to see all patterns from the ${collection.name} collection. Can you share the complete catalog?`
                          const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                          window.open(facebookUrl, "_blank")
                        }}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors flex items-center"
                      >
                        Chat on Facebook
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-48 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      {collection.patterns.slice(0, 4).map((pattern) => (
                        <div
                          key={pattern.id}
                          className="aspect-square rounded border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
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
            <p className="text-gray-500 text-lg">No collections found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-blue-100 mb-6">
            Our fabric experts are here to help you find the perfect pattern for your space. Chat with us on Facebook
            for personalized recommendations!
          </p>
          <button
            onClick={() => {
              const message =
                "Hi! I need help choosing the right fabric pattern for my sofa cover. Can you provide some recommendations based on my style preferences?"
              const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
              window.open(facebookUrl, "_blank")
            }}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Get Expert Advice
            <ExternalLink className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
