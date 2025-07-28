"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Enhanced products data with fabric patterns
const productsData = [
  {
    id: "1",
    name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    nameEn: "Premium Velvet Sofa Cover",
    category: "covers",
    type: "custom",
    priceRange: { min: 1500, max: 4500 },
    stock: 25,
    status: "active",
    image: "/modern-minimalist-fabric-pattern-1.png",
    rating: 4.8,
    reviews: 124,
    sold: 89,
    fabricPattern: "Modern Minimalist - Arctic White",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "2",
    name: "ผ้าคลุมโซฟากันน้ำ",
    nameEn: "Waterproof Sofa Cover",
    category: "covers",
    type: "custom",
    priceRange: { min: 1200, max: 3800 },
    stock: 18,
    status: "active",
    image: "/classic-elegant-fabric-pattern-1.png",
    rating: 4.6,
    reviews: 89,
    sold: 67,
    fabricPattern: "Classic Elegance - Royal Navy",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
  },
  {
    id: "3",
    name: "หมอนอิงลายเดียวกัน",
    nameEn: "Matching Throw Pillows",
    category: "accessories",
    type: "fixed",
    price: 350,
    stock: 5,
    status: "low_stock",
    image: "/bohemian-chic-fabric-pattern-1.png",
    rating: 4.4,
    reviews: 156,
    sold: 234,
    fabricPattern: "Bohemian Chic - Sunset Mandala",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-19",
  },
  {
    id: "4",
    name: "คลิปยึดผ้าคลุมโซฟา",
    nameEn: "Sofa Cover Clips",
    category: "accessories",
    type: "fixed",
    price: 120,
    stock: 0,
    status: "out_of_stock",
    image: "/placeholder.svg?height=100&width=100&text=Clips",
    rating: 4.2,
    reviews: 203,
    sold: 445,
    fabricPattern: "N/A",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-17",
  },
  {
    id: "5",
    name: "น้ำยาทำความสะอาดผ้า",
    nameEn: "Fabric Cleaner",
    category: "accessories",
    type: "fixed",
    price: 280,
    stock: 42,
    status: "active",
    image: "/placeholder.svg?height=100&width=100&text=Cleaner",
    rating: 4.3,
    reviews: 78,
    sold: 156,
    fabricPattern: "N/A",
    createdAt: "2023-12-20",
    updatedAt: "2024-01-16",
  },
  {
    id: "6",
    name: "ผ้าคลุมโซฟาแบบยืดหยุ่น",
    nameEn: "Stretch Sofa Cover",
    category: "covers",
    type: "custom",
    priceRange: { min: 990, max: 2890 },
    stock: 33,
    status: "draft",
    image: "/modern-minimalist-fabric-pattern-2.png",
    rating: 4.1,
    reviews: 234,
    sold: 123,
    fabricPattern: "Modern Minimalist - Stone Gray",
    createdAt: "2024-01-22",
    updatedAt: "2024-01-22",
  },
  {
    id: "7",
    name: "ผ้าคลุมโซฟาคลาสสิค",
    nameEn: "Classic Sofa Cover",
    category: "covers",
    type: "custom",
    priceRange: { min: 1800, max: 5200 },
    stock: 15,
    status: "active",
    image: "/classic-elegant-fabric-pattern-2.png",
    rating: 4.7,
    reviews: 98,
    sold: 56,
    fabricPattern: "Classic Elegance - Burgundy Paisley",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-21",
  },
  {
    id: "8",
    name: "ผ้าคลุมโซฟาโบฮีเมียน",
    nameEn: "Bohemian Sofa Cover",
    category: "covers",
    type: "custom",
    priceRange: { min: 1400, max: 4200 },
    stock: 8,
    status: "low_stock",
    image: "/classic-elegant-fabric-pattern-3.png",
    rating: 4.5,
    reviews: 67,
    sold: 34,
    fabricPattern: "Classic Elegance - Gold Brocade",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-19",
  },
]

const categories = [
  { id: "all", name: "ทั้งหมด" },
  { id: "covers", name: "ผ้าคลุมโซฟา" },
  { id: "accessories", name: "อุปกรณ์เสริม" },
]

const statusOptions = [
  { id: "all", name: "ทุกสถานะ" },
  { id: "active", name: "เปิดขาย" },
  { id: "draft", name: "แบบร่าง" },
  { id: "low_stock", name: "สต็อกต่ำ" },
  { id: "out_of_stock", name: "หมด" },
]

export default function ProductsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  const filteredProducts = productsData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.fabricPattern.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string, stock: number) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">เปิดขาย</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">แบบร่าง</Badge>
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-800">สต็อกต่ำ</Badge>
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800">หมด</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "draft":
        return <Package className="w-4 h-4 text-gray-600" />
      case "low_stock":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "out_of_stock":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatPriceRange = (min: number, max: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-gray-600 mt-1">จัดการสินค้าและอุปกรณ์เสริมทั้งหมด รวมถึงลายผ้าใหม่</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}>
            {viewMode === "table" ? <ImageIcon className="w-4 h-4 mr-2" /> : <Package className="w-4 h-4 mr-2" />}
            {viewMode === "table" ? "Grid View" : "Table View"}
          </Button>
          <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสินค้าใหม่
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{productsData.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เปิดขาย</p>
                <p className="text-2xl font-bold text-green-600">
                  {productsData.filter((p) => p.status === "active").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">สต็อกต่ำ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {productsData.filter((p) => p.status === "low_stock").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ลายผ้าใหม่</p>
                <p className="text-2xl font-bold text-purple-600">
                  {productsData.filter((p) => p.fabricPattern !== "N/A").length}
                </p>
              </div>
              <ImageIcon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาสินค้าหรือลายผ้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรอง
            </Button>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              พบ {filteredProducts.length} รายการจากทั้งหมด {productsData.length} รายการ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">สินค้า</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ลายผ้า</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">หมวดหมู่</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ราคา</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">สต็อก</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดขาย</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">คะแนน</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-500">{product.nameEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{product.fabricPattern}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{product.category === "covers" ? "ผ้าคลุมโซฟา" : "อุปกรณ์เสริม"}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {product.type === "custom" ? (
                          <div>
                            <p className="font-semibold text-pink-600 text-sm">
                              {formatPriceRange(product.priceRange.min, product.priceRange.max)}
                            </p>
                            <p className="text-xs text-gray-500">ราคาตามขนาด</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-pink-600">{formatPrice(product.price)}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(product.status)}
                          <span
                            className={`font-medium ${
                              product.stock === 0
                                ? "text-red-600"
                                : product.stock <= 10
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(product.status, product.stock)}</td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{product.sold}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-yellow-600">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">{getStatusBadge(product.status, product.stock)}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.nameEn}</p>
                    <p className="text-xs text-blue-600 mb-2">{product.fabricPattern}</p>
                    <div className="flex items-center justify-between mb-3">
                      {product.type === "custom" ? (
                        <span className="text-sm font-semibold text-pink-600">
                          {formatPriceRange(product.priceRange.min, product.priceRange.max)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-pink-600">{formatPrice(product.price)}</span>
                      )}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-yellow-600">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">สต็อก: {product.stock}</span>
                      <span className="text-sm text-gray-600">ขายแล้ว: {product.sold}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Eye className="w-4 h-4 mr-1" />
                        ดู
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-4 h-4 mr-1" />
                        แก้ไข
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบสินค้า</h3>
              <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedStatus("all")
                }}
                variant="outline"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
