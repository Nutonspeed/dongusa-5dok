"use client"

import { useState } from "react"
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

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

const mockProducts = [
  {
    id: "1",
    name: "ผ้าคลุมโซฟา 3 ที่นั่ง",
    name_en: "3-Seater Sofa Cover",
    category: "covers",
    type: "custom",
    price_range: { min: 1500, max: 2500 },
    stock: 25,
    status: "active",
    sold: 150,
    rating: 4.5,
    reviews: 32,
    image: "/cozy-living-room-sofa-cover.png",
  },
  {
    id: "2",
    name: "ผ้าคลุมโซฟา 2 ที่นั่ง",
    name_en: "2-Seater Sofa Cover",
    category: "covers",
    type: "custom",
    price_range: { min: 1200, max: 2000 },
    stock: 5,
    status: "low_stock",
    sold: 89,
    rating: 4.3,
    reviews: 18,
    image: "/cozy-living-room-sofa-cover.png",
  },
]

export default function ProductsManagement() {
  const products = mockProducts
  const fabricCollections = []

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-600 mt-1">จัดการสินค้าและอุปกรณ์เสริมทั้งหมด</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสินค้าใหม่
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{products?.length || 0}</p>
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
                  {products?.filter((p) => p.status === "active").length || 0}
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
                  {products?.filter((p) => p.status === "low_stock").length || 0}
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
                <p className="text-sm text-gray-600">หมด</p>
                <p className="text-2xl font-bold text-red-600">
                  {products?.filter((p) => p.status === "out_of_stock").length || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
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
                placeholder="ค้นหาสินค้า..."
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
              พบ {filteredProducts.length} รายการจากทั้งหมด {products?.length || 0} รายการ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สินค้า</th>
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
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                          <p className="text-xs text-gray-500">{product.name_en}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{product.category === "covers" ? "ผ้าคลุมโซฟา" : "อุปกรณ์เสริม"}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      {product.type === "custom" ? (
                        <div>
                          <p className="font-semibold text-pink-600 text-sm">
                            {formatPriceRange(product.price_range?.min || 0, product.price_range?.max || 0)}
                          </p>
                          <p className="text-xs text-gray-500">ราคาตามขนาด</p>
                        </div>
                      ) : (
                          <p className="font-semibold text-pink-600">{formatPrice((product as any).price || 0)}</p>
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
