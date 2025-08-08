'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getMockProducts, getMockProductCategories } from '@/lib/mock-database'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Search, Filter, ArrowUpWideNarrow, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '@/lib/types/product' // Import Product type

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
            {product.description}
          </p>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.floor(product.rating) ? 'fill-current' : 'fill-transparent stroke-current'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({product.reviews})
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {product.price.toLocaleString('th-TH', { style: 'currency', currency: product.currency })}
            </span>
            <Button variant="outline" size="sm">
              ดูรายละเอียด
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const searchTerm = searchParams.get('search') || ''
  const selectedCategory = searchParams.get('category') || 'all'
  const sortBy = (searchParams.get('sortBy') || 'rating-desc') as 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating-desc'

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedProducts = await getMockProducts(searchTerm, selectedCategory, sortBy)
        setProducts(fetchedProducts)
        const fetchedCategories = await getMockProductCategories()
        setCategories(['all', ...fetchedCategories])
      } catch (err) {
        console.error('Failed to fetch products or categories:', err)
        setError('ไม่สามารถโหลดสินค้าได้ในขณะนี้ โปรดลองอีกครั้งในภายหลัง')
      } finally {
        setLoading(false)
      }
    }
    fetchProductsAndCategories()
  }, [searchTerm, selectedCategory, sortBy])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      newSearchParams.set('search', e.target.value)
    } else {
      newSearchParams.delete('search')
    }
    router.push(`/products?${newSearchParams.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      newSearchParams.set('category', value)
    } else {
      newSearchParams.delete('category')
    }
    router.push(`/products?${newSearchParams.toString()}`)
  }

  const handleSortChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('sortBy', value)
    router.push(`/products?${newSearchParams.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">สินค้าทั้งหมด</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาสินค้า..."
            className="pl-10 pr-4 py-2 w-full"
            defaultValue={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="หมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'ทุกหมวดหมู่' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
            <SelectValue placeholder="จัดเรียงโดย" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating-desc">คะแนน (มากไปน้อย)</SelectItem>
            <SelectItem value="price-asc">ราคา (น้อยไปมาก)</SelectItem>
            <SelectItem value="price-desc">ราคา (มากไปน้อย)</SelectItem>
            <SelectItem value="name-asc">ชื่อ (ก-ฮ)</SelectItem>
            <SelectItem value="name-desc">ชื่อ (ฮ-ก)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="h-full flex flex-col">
              <div className="relative w-full aspect-[4/3] bg-gray-200 animate-pulse" />
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-1/2 mt-auto animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 text-lg py-10">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-10">ไม่พบสินค้าที่ตรงกับเงื่อนไข</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
