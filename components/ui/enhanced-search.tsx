"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useDebounce } from "@/hooks/use-performance"

interface SearchFilters {
  category?: string
  priceRange?: [number, number]
  inStock?: boolean
  sortBy?: "name" | "price" | "created_at"
  sortOrder?: "asc" | "desc"
}

interface EnhancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  placeholder?: string
  categories?: string[]
  maxPrice?: number
}

export function EnhancedSearch({
  onSearch,
  placeholder = "Search products...",
  categories = ["sofa-covers", "cushions", "throws", "accessories"],
  maxPrice = 10000,
}: EnhancedSearchProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery, filters)
      loadSuggestions(debouncedQuery)
    }
  }, [debouncedQuery, filters, onSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const loadSuggestions = async (searchQuery: string) => {
    // Mock suggestions - in real app, this would call an API
    const mockSuggestions = [
      "Sofa cover",
      "Leather sofa cover",
      "Waterproof sofa cover",
      "Stretch sofa cover",
      "Corner sofa cover",
      "Recliner cover",
      "Loveseat cover",
      "Sectional sofa cover",
    ]

    const filtered = mockSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setSuggestions(filtered.slice(0, 5))
    setShowSuggestions(filtered.length > 0)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value !== undefined && value !== null).length
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                setShowSuggestions(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                >
                  <Search className="inline h-3 w-3 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Button */}
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              Filters
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Category Filter */}
            <div className="p-3">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={filters.category === category}
                      onCheckedChange={(checked) => handleFilterChange("category", checked ? category : undefined)}
                    />
                    <label htmlFor={category} className="text-sm capitalize">
                      {category.replace("-", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Price Range Filter */}
            <div className="p-3">
              <label className="text-sm font-medium mb-2 block">
                Price Range: ฿{filters.priceRange?.[0] || 0} - ฿{filters.priceRange?.[1] || maxPrice}
              </label>
              <Slider
                value={filters.priceRange || [0, maxPrice]}
                onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                max={maxPrice}
                step={100}
                className="mt-2"
              />
            </div>

            <DropdownMenuSeparator />

            {/* Stock Filter */}
            <div className="p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock || false}
                  onCheckedChange={(checked) => handleFilterChange("inStock", checked || undefined)}
                />
                <label htmlFor="inStock" className="text-sm">
                  In stock only
                </label>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Sort Options */}
            <div className="p-3">
              <label className="text-sm font-medium mb-2 block">Sort by</label>
              <div className="space-y-1">
                {[
                  { value: "name", label: "Name" },
                  { value: "price", label: "Price" },
                  { value: "created_at", label: "Newest" },
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilterChange("sortBy", option.value)}
                    className={filters.sortBy === option.value ? "bg-accent" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.category.replace("-", " ")}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("category", undefined)} />
            </Badge>
          )}
          {filters.priceRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ฿{filters.priceRange[0]} - ฿{filters.priceRange[1]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("priceRange", undefined)} />
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="flex items-center gap-1">
              In stock
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("inStock", undefined)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
