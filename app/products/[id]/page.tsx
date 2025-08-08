'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { getMockProductById, getMockRelatedProducts } from '@/lib/mock-database'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/app/contexts/CartContext'
import { Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Product } from '@/lib/types/product' // Import Product type

export default function ProductDetailsPage() {
  const { id } = useParams()
  const productId = Array.isArray(id) ? id[0] : id

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState<string | undefined>(undefined)

  const { addItem } = useCart()

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedProduct = await getMockProductById(productId)
        if (fetchedProduct) {
          setProduct(fetchedProduct)
          setMainImage(fetchedProduct.imageUrl)
          setSelectedColor(fetchedProduct.colors[0]?.name)
          setSelectedSize(fetchedProduct.sizes[0])
          const fetchedRelatedProducts = await getMockRelatedProducts(productId)
          setRelatedProducts(fetchedRelatedProducts)
        } else {
          setError('ไม่พบสินค้า')
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err)
        setError('ไม่สามารถโหลดรายละเอียดสินค้าได้ในขณะนี้ โปรดลองอีกครั้งในภายหลัง')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProductData()
    }
  }, [productId])

  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize && quantity > 0 && quantity <= product.stock) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
        stock: product.stock,
      })
    } else {
      // Optionally show a toast or alert if selection is incomplete or quantity is invalid
      console.warn('Cannot add to cart: incomplete selection or invalid quantity.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center text-red-500 text-lg">
        {error}
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center text-gray-500 text-lg">
        ไม่พบสินค้า
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            <Image
              src={mainImage || product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, index) => (
              <div
                key={index}
                className={cn(
                  "relative w-full aspect-square rounded-md overflow-hidden cursor-pointer border-2",
                  mainImage === img ? "border-primary" : "border-transparent"
                )}
                onClick={() => setMainImage(img)}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < Math.floor(product.rating) ? 'fill-current' : 'fill-transparent stroke-current'
                    )}
                  />
                ))}
              </div>
              <span className="text-md text-gray-500 dark:text-gray-400 ml-2">
                ({product.reviews} รีวิว)
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">{product.description}</p>
            <div className="text-4xl font-bold text-primary mb-6">
              {product.price.toLocaleString('th-TH', { style: 'currency', currency: product.currency })}
            </div>
          </div>

          <Separator />

          {/* Options */}
          <div className="grid gap-4">
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">สี: {selectedColor}</h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color.name}
                      variant={selectedColor === color.name ? 'default' : 'outline'}
                      onClick={() => setSelectedColor(color.name)}
                      className="px-4 py-2 rounded-full"
                    >
                      <span
                        className="w-4 h-4 rounded-full mr-2 border"
                        style={{ backgroundColor: color.hex }}
                      ></span>
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">ขนาด: {selectedSize}</h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="เลือกขนาด" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">จำนวน:</h3>
              <Input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-[100px]"
              />
              <p className="text-sm text-gray-500 mt-1">มีสินค้าในสต็อก: {product.stock}</p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full py-3 text-lg"
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize || quantity <= 0 || quantity > product.stock}
          >
            เพิ่มลงตะกร้า
          </Button>

          <Separator />

          {/* Product Features */}
          <div>
            <h3 className="text-lg font-semibold mb-2">คุณสมบัติ:</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>หมวดหมู่: {product.category}</li>
              <li>วัสดุ: {product.material}</li>
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`} className="group block">
                <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={relatedProduct.imageUrl || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < Math.floor(relatedProduct.rating) ? 'fill-current' : 'fill-transparent stroke-current'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({relatedProduct.reviews})
                      </span>
                    </div>
                    <div className="mt-auto">
                      <span className="text-xl font-bold text-primary">
                        {relatedProduct.price.toLocaleString('th-TH', { style: 'currency', currency: relatedProduct.currency })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
