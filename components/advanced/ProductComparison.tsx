"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"

interface ComparisonProduct extends Product {
  features?: Record<string, string | boolean>
}

export function ProductComparison() {
  const [compareList, setCompareList] = useState<ComparisonProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCompareList()
  }, [])

  const loadCompareList = () => {
    try {
      const saved = localStorage.getItem("compareList")
      if (saved) {
        setCompareList(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Failed to load compare list:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCompare = (productId: string) => {
    const updated = compareList.filter((item) => item.id !== productId)
    setCompareList(updated)
    localStorage.setItem("compareList", JSON.stringify(updated))
  }

  const clearAll = () => {
    setCompareList([])
    localStorage.removeItem("compareList")
  }

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />
  }

  if (compareList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products to compare</h3>
        <p className="text-gray-500 mb-4">Add products to compare their features side by side</p>
        <Button onClick={() => (window.location.href = "/products")}>Browse Products</Button>
      </div>
    )
  }

  const features = ["Material", "Dimensions", "Color Options", "Washable", "Warranty", "Installation", "Price Range"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Comparison</h2>
        <div className="flex gap-2">
          <Badge variant="secondary">{compareList.length} products</Badge>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Product Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {compareList.map((product) => (
              <Card key={product.id} className="relative">
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.images?.[0] || "/placeholder.svg?height=200&width=200"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-primary">฿{product.price?.toLocaleString()}</p>
                  {product.inStock ? (
                    <Badge variant="default" className="mt-2">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="mt-2">
                      Out of Stock
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-center">
                      <div className="font-medium text-sm text-gray-600 mb-2 md:mb-0">{feature}</div>
                      {compareList.map((product) => (
                        <div key={`${product.id}-${feature}`} className="text-sm">
                          {getFeatureValue(product, feature)}
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {compareList.map((product) => (
              <div key={product.id} className="space-y-2">
                <Button className="w-full" disabled={!product.inStock}>
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get feature values
function getFeatureValue(product: ComparisonProduct, feature: string): React.ReactNode {
  const featureMap: Record<string, keyof ComparisonProduct | string> = {
    Material: "Cotton blend",
    Dimensions: "Various sizes",
    "Color Options": "Multiple colors",
    Washable: "Machine washable",
    Warranty: "1 year",
    Installation: "Easy installation",
    "Price Range": "price",
  }

  const key = featureMap[feature]

  if (key === "price") {
    return `฿${product.price?.toLocaleString()}`
  }

  if (typeof key === "string" && key !== "price") {
    return key
  }

  // For boolean values
  if (typeof product.features?.[feature] === "boolean") {
    return product.features[feature] ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <Minus className="h-4 w-4 text-gray-400" />
    )
  }

  return product.features?.[feature] || "N/A"
}

// Compare button component for product cards
export function CompareButton({ product }: { product: Product }) {
  const [isInCompare, setIsInCompare] = useState(false)

  useEffect(() => {
    checkCompareStatus()
  }, [product.id])

  const checkCompareStatus = () => {
    try {
      const saved = localStorage.getItem("compareList")
      if (saved) {
        const compareList = JSON.parse(saved)
        setIsInCompare(compareList.some((item: Product) => item.id === product.id))
      }
    } catch (error) {
      console.error("Failed to check compare status:", error)
    }
  }

  const toggleCompare = () => {
    try {
      const saved = localStorage.getItem("compareList")
      let compareList: Product[] = saved ? JSON.parse(saved) : []

      if (isInCompare) {
        compareList = compareList.filter((item) => item.id !== product.id)
      } else {
        if (compareList.length >= 4) {
          alert("You can compare up to 4 products at a time")
          return
        }
        compareList.push(product)
      }

      localStorage.setItem("compareList", JSON.stringify(compareList))
      setIsInCompare(!isInCompare)
    } catch (error) {
      console.error("Failed to update compare list:", error)
    }
  }

  return (
    <Button variant={isInCompare ? "default" : "outline"} size="sm" onClick={toggleCompare} className="text-xs">
      {isInCompare ? "Remove" : "Compare"}
    </Button>
  )
}
